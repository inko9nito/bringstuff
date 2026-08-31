(() => {
  'use strict';

  // ---------- Utilities ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = (n = 6) => {
    const chars = 'abcdefghijkmnopqrstuvwxyz23456789';
    let s = '';
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  const now = () => Date.now();
  const clone = (v) => JSON.parse(JSON.stringify(v));

  // ---------- URL-safe base64 for state ----------
  const b64uEncode = (str) => {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const b64uDecode = (s) => {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  };

  // ---------- Data model ----------
  // List { id, name, items: [Item], updatedAt }
  // Item { id, name, qty (number|null), assignees: string[], note?: string, done?: boolean }

  const emptyList = (name = '') => ({
    id: uid(6),
    name: name || 'Untitled list',
    items: [],
    updatedAt: now(),
  });

  const emptyItem = (name = '') => ({
    id: uid(5),
    name: name.trim(),
    qty: null,
    assignees: [],
    note: '',
    done: false,
  });

  // ---------- Parser for pasted lines ----------
  // Recognizes ✅ ✔ ✓ [x] [✓] "-" bullets, and various dashes.
  // Splits "item ✅ assignee" into { name, assignees, note }.
  const CHECK_RE = /(\s*[✅✔✓☑]\s*|\s*\[[xX✓]\]\s*)/;
  const BULLET_RE = /^\s*(?:[-•*·]|\d+[.)])\s+/;
  const QTY_RE = /\s*(?:x|×|\*)\s*(\d{1,3})\s*$/i; // "Buns x8"
  const QTY_RE_RU = /\s*(\d{1,3})\s*шт\.?\s*$/i; // "1 шт."
  const PAREN_RE = /\s*\(([^()]{1,80})\)\s*/g;

  function parseLine(raw) {
    let line = raw.replace(/[\r\n]+/g, '').trim();
    if (!line) return null;
    // strip leading bullet
    line = line.replace(BULLET_RE, '');
    if (!line) return null;

    // split at first check indicator
    let itemPart = line;
    let rightPart = '';
    const m = line.match(CHECK_RE);
    if (m) {
      itemPart = line.slice(0, m.index).trim();
      rightPart = line.slice(m.index + m[0].length).trim();
    }
    if (!itemPart && rightPart) {
      // "✅ foo" — treat right side as the item, unassigned
      itemPart = rightPart;
      rightPart = '';
    }
    if (!itemPart) return null;

    // Extract note from item side (parenthetical)
    let note = '';
    const notes = [];
    itemPart = itemPart.replace(PAREN_RE, (_, inner) => {
      notes.push(inner.trim());
      return ' ';
    }).replace(/\s+/g, ' ').trim();
    if (notes.length) note = notes.join('; ');

    // Extract qty from item side
    let qty = null;
    let qm = itemPart.match(QTY_RE);
    if (qm) {
      qty = parseInt(qm[1], 10);
      itemPart = itemPart.slice(0, qm.index).trim();
    } else {
      qm = itemPart.match(QTY_RE_RU);
      if (qm) {
        qty = parseInt(qm[1], 10);
        itemPart = itemPart.slice(0, qm.index).trim();
      }
    }

    // Parse right side: assignees + optional note in parens
    const assignees = [];
    if (rightPart) {
      // Extract parenthetical note from right side
      rightPart = rightPart.replace(PAREN_RE, (_, inner) => {
        notes.push(inner.trim());
        return ' ';
      }).replace(/\s+/g, ' ').trim();
      if (notes.length) note = notes.join('; ');

      // Also pull ru "шт" qty out of right side (e.g., "вино красное 1 шт.")
      const rm = rightPart.match(QTY_RE_RU) || rightPart.match(QTY_RE);
      if (rm && qty == null) {
        qty = parseInt(rm[1], 10);
        rightPart = rightPart.slice(0, rm.index).trim();
      }

      // Split names by comma, "&", " and ", " и "
      const names = rightPart
        .split(/\s*(?:,|&| and | и )\s*/i)
        .map(s => s.trim())
        .filter(Boolean);

      // If right side reads like a description (has multiple words with a lowercase leading word),
      // treat it as a note instead of a person; heuristic: single word or capitalized token = name.
      for (const n of names) {
        const words = n.split(/\s+/);
        if (words.length <= 3 && /^\p{Lu}/u.test(words[0])) {
          assignees.push(n);
        } else {
          // description of the item
          if (!note) note = n; else note = note + '; ' + n;
        }
      }
    }

    return {
      ...emptyItem(itemPart),
      qty,
      assignees,
      note,
    };
  }

  function parsePaste(text) {
    return text.split(/\r?\n/).map(parseLine).filter(Boolean);
  }

  // ---------- Local storage: history of lists ----------
  const HISTORY_KEY = 'bringstuff:history:v1';
  const ME_KEY = 'bringstuff:me:v1';

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function saveHistory(arr) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 12))); } catch {}
  }
  function rememberList(list) {
    if (!list || !list.id) return;
    const entry = {
      id: list.id,
      name: list.name,
      itemCount: list.items.length,
      updatedAt: list.updatedAt || now(),
      hash: encodeState(list),
    };
    const h = loadHistory().filter(x => x.id !== list.id);
    h.unshift(entry);
    saveHistory(h);
  }
  function forgetList(id) {
    saveHistory(loadHistory().filter(x => x.id !== id));
  }
  function getMe() {
    try { return localStorage.getItem(ME_KEY) || ''; } catch { return ''; }
  }
  function setMe(name) {
    try { localStorage.setItem(ME_KEY, name); } catch {}
  }

  // ---------- Compact serialize for URL ----------
  // Use short keys to keep URLs short.
  // { n: name, i: [ [id, name, qty, assignees, note, done] ] }
  function toCompact(list) {
    return {
      v: 1,
      id: list.id,
      n: list.name,
      u: list.updatedAt,
      i: list.items.map(it => [
        it.id,
        it.name,
        it.qty ?? 0,
        it.assignees || [],
        it.note || '',
        it.done ? 1 : 0,
      ]),
    };
  }
  function fromCompact(c) {
    if (!c || !Array.isArray(c.i)) return null;
    return {
      id: c.id || uid(6),
      name: c.n || 'Untitled list',
      updatedAt: c.u || now(),
      items: c.i.map(a => ({
        id: a[0] || uid(5),
        name: a[1] || '',
        qty: a[2] ? Number(a[2]) : null,
        assignees: Array.isArray(a[3]) ? a[3] : [],
        note: a[4] || '',
        done: !!a[5],
      })),
    };
  }
  function encodeState(list) {
    return b64uEncode(JSON.stringify(toCompact(list)));
  }
  function decodeState(s) {
    try {
      const c = JSON.parse(b64uDecode(s));
      return fromCompact(c);
    } catch { return null; }
  }

  // ---------- Router ----------
  // Routes:
  //   #/            -> home
  //   #/list/{id}   -> from local storage (no URL data)
  //   #/l/{base64}  -> from URL data (also saved locally)
  function parseHash() {
    const h = location.hash || '#/';
    if (h === '#' || h === '#/' || h === '') return { name: 'home' };
    if (h.startsWith('#/list/')) {
      return { name: 'list', id: h.slice(7) };
    }
    if (h.startsWith('#/l/')) {
      return { name: 'list-encoded', data: h.slice(4) };
    }
    return { name: 'home' };
  }
  function navHome() { location.hash = '#/'; }
  function navList(list) {
    // Prefer encoded URL because that's the shareable one.
    // location.hash assignment fires 'hashchange' which triggers a re-render.
    location.hash = '#/l/' + encodeState(list);
  }
  function updateHashInPlace(list) {
    // Replace URL silently — don't trigger render, caller decides.
    const newHash = '#/l/' + encodeState(list);
    const newUrl = location.pathname + location.search + newHash;
    history.replaceState(null, '', newUrl);
  }

  // ---------- App state ----------
  const state = {
    list: null,        // current list object
    me: getMe(),
    filter: 'all',     // all | open | mine | taken
    selected: new Set(),
    sheet: null,       // active sheet name
    editingItemId: null,
  };

  function commit(reason = 'edit') {
    if (!state.list) return;
    state.list.updatedAt = now();
    updateHashInPlace(state.list);
    rememberList(state.list);
    render();
  }

  // ---------- Rendering ----------
  const appEl = document.getElementById('app');

  function render() {
    const route = parseHash();
    if (route.name === 'home') {
      renderHome();
    } else if (route.name === 'list-encoded') {
      const list = decodeState(route.data);
      if (!list) {
        showToast('Invalid list link');
        navHome();
        return;
      }
      // If we already have this list loaded and hash matches, keep local state (esp. selection)
      if (!state.list || state.list.id !== list.id || encodeState(state.list) !== route.data) {
        state.list = list;
        state.selected = new Set();
        rememberList(list);
      }
      renderList();
    } else if (route.name === 'list') {
      const hist = loadHistory().find(h => h.id === route.id);
      if (hist && hist.hash) {
        // Rewrite the URL to the encoded form for shareability
        history.replaceState(null, '', '#/l/' + hist.hash);
        state.list = decodeState(hist.hash);
        renderList();
      } else {
        showToast('List not found on this device');
        navHome();
      }
    }
  }

  function mount(templateId) {
    const tpl = document.getElementById(templateId);
    appEl.innerHTML = '';
    appEl.appendChild(tpl.content.cloneNode(true));
  }

  // ---------- Home view ----------
  function renderHome() {
    mount('tpl-home');
    const nameInput = $('#new-name');
    nameInput.focus();

    $('#btn-create').addEventListener('click', () => {
      const list = emptyList(nameInput.value.trim() || 'Bring list');
      state.list = list;
      state.selected = new Set();
      rememberList(list);
      navList(list);
    });
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#btn-create').click();
    });

    const hist = loadHistory();
    if (hist.length) {
      $('#recent-section').hidden = false;
      const recentEl = $('#recent-list');
      recentEl.innerHTML = '';
      for (const h of hist) {
        const row = document.createElement('button');
        row.className = 'row';
        row.style.width = '100%';
        row.style.textAlign = 'left';
        row.innerHTML = `
          <div class="row-main">
            <div class="row-title"></div>
            <div class="row-sub"><span class="assignee-tag"></span></div>
          </div>
          <span class="chevron">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </span>
        `;
        row.querySelector('.row-title').textContent = h.name || 'Untitled list';
        const timeStr = new Date(h.updatedAt).toLocaleString();
        row.querySelector('.assignee-tag').textContent = `${h.itemCount} item${h.itemCount === 1 ? '' : 's'} · ${timeStr}`;
        row.addEventListener('click', () => {
          if (h.hash) {
            location.hash = '#/l/' + h.hash;
          } else {
            location.hash = '#/list/' + h.id;
          }
        });
        recentEl.appendChild(row);
      }
    }
  }

  // ---------- List view ----------
  function renderList() {
    mount('tpl-list');
    const list = state.list;

    // Title (editable)
    const titleEl = $('#list-title');
    titleEl.textContent = list.name;
    titleEl.addEventListener('blur', () => {
      const v = titleEl.textContent.trim() || 'Untitled list';
      titleEl.textContent = v;
      if (v !== list.name) {
        list.name = v;
        commit('rename');
      }
    });
    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
    });

    // Me input
    const meInput = $('#me-input');
    meInput.value = state.me || '';
    meInput.addEventListener('input', () => {
      state.me = meInput.value.trim();
      setMe(state.me);
      updateSelectionBar();
      renderItems();
    });

    // Back / share
    $('#btn-back').addEventListener('click', () => navHome());
    $('#btn-share').addEventListener('click', () => openShareSheet());

    // Filter segmented
    $$('#filter-seg .seg').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === state.filter);
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        $$('#filter-seg .seg').forEach(b => b.classList.toggle('active', b.dataset.filter === state.filter));
        renderItems();
      });
    });

    // Add row
    const addInput = $('#add-input');
    const addQty = $('#add-qty');
    const addBtn = $('#btn-add');
    const submitAdd = () => {
      const name = addInput.value.trim();
      if (!name) return;
      const it = emptyItem(name);
      const q = parseInt(addQty.value, 10);
      if (!Number.isNaN(q) && q > 0) it.qty = q;
      list.items.unshift(it);
      addInput.value = '';
      addQty.value = '';
      addInput.focus();
      commit('add');
    };
    addBtn.addEventListener('click', submitAdd);
    addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAdd(); });
    addQty.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAdd(); });

    $('#btn-paste').addEventListener('click', () => openPasteSheet());

    // Scroll shadow
    const scroll = $('.scroll');
    const topbar = $('.topbar');
    scroll.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', scroll.scrollTop > 4);
    });

    // Selection bar
    $('#sel-clear').addEventListener('click', () => {
      state.selected.clear();
      updateSelectionBar();
      renderItems();
    });
    $('#sel-assign').addEventListener('click', () => {
      const me = (state.me || '').trim();
      if (!me) {
        showToast('Enter your name first');
        $('#me-input').focus();
        return;
      }
      let changed = 0;
      for (const id of state.selected) {
        const it = list.items.find(x => x.id === id);
        if (!it) continue;
        if (!it.assignees.includes(me)) {
          it.assignees.push(me);
          changed++;
        }
      }
      state.selected.clear();
      updateSelectionBar();
      if (changed) {
        commit('batch-assign');
        showToast(`Assigned ${changed} item${changed === 1 ? '' : 's'} to ${me}`);
      } else {
        renderItems();
      }
    });

    renderItems();
  }

  function itemMatchesFilter(it) {
    const me = (state.me || '').trim();
    switch (state.filter) {
      case 'open': return it.assignees.length === 0;
      case 'mine': return me && it.assignees.some(a => a.toLowerCase() === me.toLowerCase());
      case 'taken': return it.assignees.length > 0;
      default: return true;
    }
  }

  function renderItems() {
    const list = state.list;
    const container = $('#items');
    if (!container) return;
    container.innerHTML = '';

    const items = list.items.filter(itemMatchesFilter);

    if (!list.items.length) {
      container.innerHTML = `
        <div class="empty">
          <strong>Nothing here yet</strong>
          Paste a list or add items one at a time.
        </div>`;
    } else if (!items.length) {
      container.innerHTML = `
        <div class="empty">
          <strong>No matches</strong>
          Try a different filter.
        </div>`;
    } else {
      const me = (state.me || '').trim().toLowerCase();
      for (const it of items) {
        const row = document.createElement('div');
        row.className = 'row' + (it.done ? ' done' : '');
        row.dataset.id = it.id;

        const isSelected = state.selected.has(it.id);
        const mine = me && it.assignees.some(a => a.toLowerCase() === me);

        const qtyLabel = it.qty && it.qty > 1 ? ` <span class="qty">×${it.qty}</span>` : '';
        const tags = it.assignees.map(a => {
          const isMe = me && a.toLowerCase() === me;
          return `<span class="assignee-tag${isMe ? ' mine' : ''}">${escapeHtml(a)}</span>`;
        }).join('');
        const note = it.note ? `<span class="row-note">${escapeHtml(it.note)}</span>` : '';

        row.innerHTML = `
          <button class="check ${isSelected ? 'checked' : ''}" aria-label="Select" data-role="check">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <div class="row-main" data-role="body">
            <div class="row-title">${escapeHtml(it.name)}${qtyLabel}</div>
            <div class="row-sub">${tags}${note}</div>
          </div>
          <span class="chevron" data-role="edit">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </span>
        `;

        row.querySelector('[data-role="check"]').addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSelect(it.id);
        });
        row.querySelector('[data-role="body"]').addEventListener('click', () => {
          toggleSelect(it.id);
        });
        row.querySelector('[data-role="edit"]').addEventListener('click', (e) => {
          e.stopPropagation();
          openItemSheet(it.id);
        });

        container.appendChild(row);
      }
    }

    // Stats
    const done = list.items.filter(x => x.assignees.length > 0).length;
    $('#stat-line').textContent = `${done} of ${list.items.length} taken`;

    updateSelectionBar();
  }

  function toggleSelect(id) {
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    updateSelectionBar();
    // update just this row
    const row = document.querySelector(`.row[data-id="${CSS.escape(id)}"] .check`);
    if (row) row.classList.toggle('checked', state.selected.has(id));
  }

  function updateSelectionBar() {
    const bar = $('#sel-bar');
    if (!bar) return;
    const n = state.selected.size;
    if (n === 0) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    const me = (state.me || '').trim();
    $('#sel-count').textContent = `${n} selected`;
    const assignBtn = $('#sel-assign');
    assignBtn.textContent = me ? `Assign to ${me}` : 'Assign to me';
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ---------- Sheets ----------
  function openSheet(tplId, setup) {
    closeSheet();
    const tpl = document.getElementById(tplId);
    const wrap = document.createElement('div');
    wrap.appendChild(tpl.content.cloneNode(true));
    // Collect only element children (skip whitespace text nodes).
    const nodes = Array.from(wrap.children);
    // Wrap in a host div so we can scope queries reliably.
    const host = document.createElement('div');
    host.className = 'sheet-host';
    nodes.forEach(n => host.appendChild(n));
    document.body.appendChild(host);
    state.sheet = { host };
    const backdrop = host.querySelector('.sheet-backdrop');
    const sheet = host.querySelector('.sheet');
    const close = () => closeSheet();
    if (backdrop) backdrop.addEventListener('click', close);
    if (sheet) {
      sheet.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
    }
    if (setup) setup({ sheet, close });
  }
  function closeSheet() {
    if (!state.sheet) return;
    const { host } = state.sheet;
    if (host && host.parentNode) host.parentNode.removeChild(host);
    state.sheet = null;
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.sheet) closeSheet();
  });

  function openPasteSheet() {
    openSheet('tpl-paste-sheet', ({ sheet, close }) => {
      const ta = sheet.querySelector('#paste-text');
      ta.focus();
      sheet.querySelector('[data-confirm]').addEventListener('click', () => {
        const parsed = parsePaste(ta.value);
        if (!parsed.length) {
          showToast('No items detected');
          return;
        }
        const replace = sheet.querySelector('#paste-replace').checked;
        if (replace) state.list.items = parsed;
        else state.list.items = state.list.items.concat(parsed);
        close();
        commit('paste');
        showToast(`Added ${parsed.length} item${parsed.length === 1 ? '' : 's'}`);
      });
    });
  }

  function openShareSheet() {
    openSheet('tpl-share-sheet', ({ sheet }) => {
      const url = location.href;
      sheet.querySelector('#share-url').textContent = url;
      sheet.querySelector('#url-length').textContent = `${url.length.toLocaleString()} characters in link`;
      const copyBtn = sheet.querySelector('#btn-copy');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(url);
          showToast('Link copied');
        } catch {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); showToast('Link copied'); }
          catch { showToast('Copy failed'); }
          document.body.removeChild(ta);
        }
      });
      const nativeBtn = sheet.querySelector('#btn-native-share');
      if (navigator.share) {
        nativeBtn.hidden = false;
        nativeBtn.addEventListener('click', async () => {
          try {
            await navigator.share({ title: state.list.name, url });
          } catch {}
        });
      }
    });
  }

  function openItemSheet(id) {
    const it = state.list.items.find(x => x.id === id);
    if (!it) return;
    state.editingItemId = id;
    openSheet('tpl-item-sheet', ({ sheet, close }) => {
      const nameI = sheet.querySelector('#edit-name');
      const qtyI = sheet.querySelector('#edit-qty');
      const noteI = sheet.querySelector('#edit-note');
      const assignI = sheet.querySelector('#edit-assignees');
      nameI.value = it.name;
      qtyI.value = it.qty || '';
      noteI.value = it.note || '';
      assignI.value = (it.assignees || []).join(', ');
      nameI.focus();
      nameI.select();

      sheet.querySelector('[data-confirm]').addEventListener('click', () => {
        const name = nameI.value.trim();
        if (!name) { showToast('Name required'); return; }
        it.name = name;
        const q = parseInt(qtyI.value, 10);
        it.qty = (!Number.isNaN(q) && q > 0) ? q : null;
        it.note = noteI.value.trim();
        it.assignees = assignI.value.split(',').map(s => s.trim()).filter(Boolean);
        close();
        commit('edit-item');
      });

      sheet.querySelector('#btn-delete').addEventListener('click', () => {
        state.list.items = state.list.items.filter(x => x.id !== id);
        state.selected.delete(id);
        close();
        commit('delete-item');
        showToast('Item deleted');
      });
    });
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(text) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    el.style.animation = 'none';
    // reflow
    void el.offsetHeight;
    el.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 1700);
  }

  // ---------- Boot ----------
  window.addEventListener('hashchange', render);
  render();
})();
