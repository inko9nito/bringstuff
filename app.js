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

  // ---------- URL-safe base64 ----------
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

  // ---------- i18n ----------
  const STRINGS = {
    en: {
      brand: 'BringStuff',
      home_sub: 'Shared "who\'s bringing what" lists. No signup. Just paste and share.',
      new_list: 'New list',
      new_name_ph: 'List name (e.g. Shashlik trip)',
      create_list: 'Create list',
      recent: 'Recent',
      home_footer: 'Built for GitHub Pages · Data lives in the URL you share.',
      nav_lists: 'Lists',
      nav_share: 'Share',
      you_are: 'You are',
      your_name_ph: 'Your name',
      filter_all: 'All',
      filter_open: 'Open',
      filter_mine: 'Mine',
      filter_taken: 'Taken',
      add_item_ph: 'Add an item…',
      qty_ph: 'Qty',
      paste_list: 'Paste list…',
      stats: (done, total) => `${done} of ${total} taken`,
      sel_clear: 'Clear',
      sel_count: (n) => `${n} selected`,
      assign_to: (name) => name ? `Assign to ${name}` : 'Assign to me',
      cancel: 'Cancel',
      add: 'Add',
      done: 'Done',
      save: 'Save',
      delete_item: 'Delete item',
      paste_sheet_title: 'Paste list',
      paste_hint: 'One item per line. Lines with <span class="mono-chip">✅ Name</span> get assigned automatically.',
      paste_example: 'Charcoal ✅ Bella\nLighter fluid\nBuns for burgers x8',
      replace_existing: 'Replace existing items',
      share_sheet_title: 'Share list',
      share_hint: "The whole list travels inside the link. Send it to friends — when they change something, they'll get a new link they can share back.",
      copy_link: 'Copy link',
      share_ellipsis: 'Share…',
      url_length: (n) => `${n.toLocaleString()} characters in link`,
      edit_item: 'Edit item',
      field_name: 'Name',
      field_qty: 'Total quantity (optional)',
      field_qty_ph: 'e.g. 2',
      field_note: 'Note (optional)',
      field_note_ph: 'e.g. red wine',
      field_bringing: 'Who\'s bringing it',
      ae_name_ph: 'Name',
      ae_qty_ph: 'Qty',
      ae_add: '+ Add person',
      no_matches: 'No matches',
      no_matches_hint: 'Try a different filter.',
      empty_title: 'Nothing here yet',
      empty_hint: 'Paste a list or add items one at a time.',
      recent_items: (n) => `${n} item${n === 1 ? '' : 's'}`,
      toast_added: (n) => `Added ${n} item${n === 1 ? '' : 's'}`,
      toast_assigned: (n, name) => `Assigned ${n} item${n === 1 ? '' : 's'} to ${name}`,
      toast_deleted: 'Item deleted',
      toast_link_copied: 'Link copied',
      toast_copy_failed: 'Copy failed',
      toast_no_items: 'No items detected',
      toast_enter_name: 'Enter your name first',
      toast_name_required: 'Name required',
      toast_invalid_link: 'Invalid list link',
      toast_list_not_found: 'List not found on this device',
      untitled: 'Untitled list',
      single_item: 'Add as one',
      detected_list_title: 'Multiple lines detected',
      detected_hint: (n) => `Add these ${n} as separate items?`,
      add_all: 'Add all',
      default_list_name: 'Bring list',
    },
    ru: {
      brand: 'BringStuff',
      home_sub: 'Общие списки «кто что везёт». Без регистрации. Просто вставь текст и поделись.',
      new_list: 'Новый список',
      new_name_ph: 'Название (напр. Поездка на шашлыки)',
      create_list: 'Создать список',
      recent: 'Недавние',
      home_footer: 'Работает на GitHub Pages · Все данные внутри ссылки.',
      nav_lists: 'Списки',
      nav_share: 'Поделиться',
      you_are: 'Ты',
      your_name_ph: 'Твоё имя',
      filter_all: 'Все',
      filter_open: 'Свободно',
      filter_mine: 'Моё',
      filter_taken: 'Занято',
      add_item_ph: 'Добавить…',
      qty_ph: 'Кол.',
      paste_list: 'Вставить список…',
      stats: (done, total) => `${done} из ${total} разобрано`,
      sel_clear: 'Отмена',
      sel_count: (n) => `Выбрано: ${n}`,
      assign_to: (name) => name ? `Записать на ${name}` : 'Записать на меня',
      cancel: 'Отмена',
      add: 'Добавить',
      done: 'Готово',
      save: 'Сохранить',
      delete_item: 'Удалить',
      paste_sheet_title: 'Вставить список',
      paste_hint: 'По одному пункту на строку. Строки с <span class="mono-chip">✅ Имя</span> сразу закрепляются.',
      paste_example: 'Уголь ✅ Бэлла\nЖидкость для розжига\nБулочки x8',
      replace_existing: 'Заменить существующие',
      share_sheet_title: 'Поделиться',
      share_hint: 'Весь список внутри ссылки. Отправь её друзьям — когда они что-то изменят, получат новую ссылку, чтобы поделиться в ответ.',
      copy_link: 'Скопировать ссылку',
      share_ellipsis: 'Поделиться…',
      url_length: (n) => `${n.toLocaleString()} символов в ссылке`,
      edit_item: 'Редактировать',
      field_name: 'Название',
      field_qty: 'Общее количество (по желанию)',
      field_qty_ph: 'напр. 2',
      field_note: 'Заметка (по желанию)',
      field_note_ph: 'напр. красное вино',
      field_bringing: 'Кто везёт',
      ae_name_ph: 'Имя',
      ae_qty_ph: 'Кол.',
      ae_add: '+ Добавить',
      no_matches: 'Ничего не найдено',
      no_matches_hint: 'Попробуй другой фильтр.',
      empty_title: 'Пока пусто',
      empty_hint: 'Вставь список или добавь пункты вручную.',
      recent_items: (n) => {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return `${n} пункт`;
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} пункта`;
        return `${n} пунктов`;
      },
      toast_added: (n) => `Добавлено: ${n}`,
      toast_assigned: (n, name) => `Записано ${n} на ${name}`,
      toast_deleted: 'Удалено',
      toast_link_copied: 'Ссылка скопирована',
      toast_copy_failed: 'Не удалось скопировать',
      toast_no_items: 'Не найдено ни одного пункта',
      toast_enter_name: 'Сначала введи имя',
      toast_name_required: 'Нужно название',
      toast_invalid_link: 'Некорректная ссылка',
      toast_list_not_found: 'Список не найден на этом устройстве',
      untitled: 'Без названия',
      single_item: 'Как один пункт',
      detected_list_title: 'Обнаружено несколько строк',
      detected_hint: (n) => `Добавить ${n} строк как отдельные пункты?`,
      add_all: 'Добавить все',
      default_list_name: 'Список',
    },
  };

  const LANG_KEY = 'bringstuff:lang:v1';
  function detectLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'ru') return saved;
    } catch {}
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('ru') ? 'ru' : 'en';
  }
  function setLang(l) {
    state.lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch {}
    document.documentElement.lang = l;
    render();
  }
  function t(key, ...args) {
    const dict = STRINGS[state.lang] || STRINGS.en;
    const v = dict[key];
    if (typeof v === 'function') return v(...args);
    if (v == null) return STRINGS.en[key] || key;
    return v;
  }
  function applyI18n(root) {
    $$('[data-t]', root).forEach(el => { el.textContent = t(el.dataset.t); });
    $$('[data-t-html]', root).forEach(el => { el.innerHTML = t(el.dataset.tHtml); });
    $$('[data-t-placeholder]', root).forEach(el => { el.setAttribute('placeholder', t(el.dataset.tPlaceholder)); });
    // Language toggle active state
    $$('.lang-toggle button', root).forEach(b => b.classList.toggle('active', b.dataset.lang === state.lang));
    $$('.lang-toggle button', root).forEach(b => {
      b.onclick = () => setLang(b.dataset.lang);
    });
  }

  // ---------- Color hashing for assignee pills ----------
  function hueFor(name) {
    const s = String(name || '').trim().toLowerCase();
    if (!s) return 0;
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h % 360;
  }
  function assigneeStyle(name) {
    const h = hueFor(name);
    const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) {
      return `--a-bg: hsl(${h}, 45%, 24%); --a-fg: hsl(${h}, 85%, 82%);`;
    }
    return `--a-bg: hsl(${h}, 78%, 91%); --a-fg: hsl(${h}, 55%, 28%);`;
  }

  // ---------- Data model ----------
  // Item.assignees: string[] where each entry is "Name" or "Name:qty"
  const emptyList = (name = '') => ({
    id: uid(6),
    name: name || (STRINGS[state?.lang || 'en'] || STRINGS.en).default_list_name,
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

  function parseAssignee(str) {
    const m = String(str || '').match(/^(.*?)(?::\s*(\d{1,3}))?\s*$/);
    if (!m) return { name: String(str || '').trim(), qty: null };
    return { name: (m[1] || '').trim(), qty: m[2] ? parseInt(m[2], 10) : null };
  }
  function stringifyAssignee(obj) {
    const q = obj && obj.qty && Number(obj.qty) > 0 ? `:${Number(obj.qty)}` : '';
    return `${(obj && obj.name || '').trim()}${q}`;
  }

  // ---------- Parser for pasted lines ----------
  const CHECK_RE = /(\s*[✅✔✓☑]\s*|\s*\[[xX✓]\]\s*)/;
  const BULLET_RE = /^\s*(?:[-•*·]|\d+[.)])\s+/;
  const QTY_RE = /\s*(?:x|×|\*)\s*(\d{1,3})\s*$/i;
  const QTY_RE_RU = /\s*(\d{1,3})\s*шт\.?\s*$/i;
  const PAREN_RE = /\s*\(([^()]{1,80})\)\s*/g;

  function parseLine(raw) {
    let line = String(raw || '').replace(/[\r\n]+/g, '').trim();
    if (!line) return null;
    line = line.replace(BULLET_RE, '');
    if (!line) return null;

    let itemPart = line;
    let rightPart = '';
    const m = line.match(CHECK_RE);
    if (m) {
      itemPart = line.slice(0, m.index).trim();
      rightPart = line.slice(m.index + m[0].length).trim();
    }
    if (!itemPart && rightPart) { itemPart = rightPart; rightPart = ''; }
    if (!itemPart) return null;

    const notes = [];
    itemPart = itemPart.replace(PAREN_RE, (_, inner) => { notes.push(inner.trim()); return ' '; }).replace(/\s+/g, ' ').trim();

    let qty = null;
    let qm = itemPart.match(QTY_RE);
    if (qm) { qty = parseInt(qm[1], 10); itemPart = itemPart.slice(0, qm.index).trim(); }
    else { qm = itemPart.match(QTY_RE_RU); if (qm) { qty = parseInt(qm[1], 10); itemPart = itemPart.slice(0, qm.index).trim(); } }

    const assignees = [];
    if (rightPart) {
      rightPart = rightPart.replace(PAREN_RE, (_, inner) => { notes.push(inner.trim()); return ' '; }).replace(/\s+/g, ' ').trim();

      const rm = rightPart.match(QTY_RE_RU) || rightPart.match(QTY_RE);
      if (rm && qty == null) { qty = parseInt(rm[1], 10); rightPart = rightPart.slice(0, rm.index).trim(); }

      const names = rightPart.split(/\s*(?:,|&| and | и )\s*/i).map(s => s.trim()).filter(Boolean);
      for (const n of names) {
        const words = n.split(/\s+/);
        if (words.length <= 3 && /^\p{Lu}/u.test(words[0])) {
          assignees.push(n);
        } else {
          notes.push(n);
        }
      }
    }

    const note = notes.filter(Boolean).join('; ');
    return { ...emptyItem(itemPart), qty, assignees, note };
  }

  function parsePaste(text) {
    return String(text || '').split(/\r?\n/).map(parseLine).filter(Boolean);
  }

  // ---------- Local storage ----------
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
  function getMe() { try { return localStorage.getItem(ME_KEY) || ''; } catch { return ''; } }
  function setMe(name) { try { localStorage.setItem(ME_KEY, name); } catch {} }

  // ---------- Compact serialize ----------
  function toCompact(list) {
    return {
      v: 1,
      id: list.id,
      n: list.name,
      u: list.updatedAt,
      i: list.items.map(it => [
        it.id, it.name, it.qty ?? 0, it.assignees || [], it.note || '', it.done ? 1 : 0,
      ]),
    };
  }
  function fromCompact(c) {
    if (!c || !Array.isArray(c.i)) return null;
    return {
      id: c.id || uid(6),
      name: c.n || t('untitled'),
      updatedAt: c.u || now(),
      items: c.i.map(a => ({
        id: a[0] || uid(5),
        name: a[1] || '',
        qty: a[2] ? Number(a[2]) : null,
        assignees: Array.isArray(a[3]) ? a[3].map(String) : [],
        note: a[4] || '',
        done: !!a[5],
      })),
    };
  }
  function encodeState(list) { return b64uEncode(JSON.stringify(toCompact(list))); }
  function decodeState(s) {
    try { return fromCompact(JSON.parse(b64uDecode(s))); } catch { return null; }
  }

  // ---------- Router ----------
  function parseHash() {
    const h = location.hash || '#/';
    if (h === '#' || h === '#/' || h === '') return { name: 'home' };
    if (h.startsWith('#/list/')) return { name: 'list', id: h.slice(7) };
    if (h.startsWith('#/l/')) return { name: 'list-encoded', data: h.slice(4) };
    return { name: 'home' };
  }
  function navHome() { location.hash = '#/'; }
  function navList(list) { location.hash = '#/l/' + encodeState(list); }
  function updateHashInPlace(list) {
    const newHash = '#/l/' + encodeState(list);
    const newUrl = location.pathname + location.search + newHash;
    history.replaceState(null, '', newUrl);
  }

  // ---------- App state ----------
  const state = {
    lang: 'en',
    list: null,
    me: '',
    filter: 'all',
    selected: new Set(),
    sheet: null,
    editingItemId: null,
  };

  function commit() {
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
      if (!list) { showToast(t('toast_invalid_link')); navHome(); return; }
      if (!state.list || state.list.id !== list.id || encodeState(state.list) !== route.data) {
        state.list = list;
        state.selected = new Set();
        rememberList(list);
      }
      renderList();
    } else if (route.name === 'list') {
      const hist = loadHistory().find(h => h.id === route.id);
      if (hist && hist.hash) {
        history.replaceState(null, '', '#/l/' + hist.hash);
        state.list = decodeState(hist.hash);
        renderList();
      } else {
        showToast(t('toast_list_not_found'));
        navHome();
      }
    }
  }

  function mount(templateId) {
    const tpl = document.getElementById(templateId);
    appEl.innerHTML = '';
    appEl.appendChild(tpl.content.cloneNode(true));
    applyI18n(appEl);
  }

  // ---------- Home view ----------
  function renderHome() {
    mount('tpl-home');
    const nameInput = $('#new-name');
    nameInput.focus();
    $('#btn-create').addEventListener('click', () => {
      const list = emptyList(nameInput.value.trim() || t('default_list_name'));
      state.list = list;
      state.selected = new Set();
      rememberList(list);
      navList(list);
    });
    nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btn-create').click(); });

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
            <div class="row-name"><div class="row-title"></div></div>
            <div class="assignees"><span class="assignee-tag" style="--a-bg: var(--fill-tertiary); --a-fg: var(--label-secondary);"></span></div>
          </div>
          <span class="chevron">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </span>
        `;
        row.querySelector('.row-title').textContent = h.name || t('untitled');
        const stamp = new Date(h.updatedAt).toLocaleDateString(state.lang === 'ru' ? 'ru-RU' : undefined, { month: 'short', day: 'numeric' });
        row.querySelector('.assignee-tag').textContent = `${t('recent_items', h.itemCount)} · ${stamp}`;
        row.addEventListener('click', () => {
          if (h.hash) location.hash = '#/l/' + h.hash;
          else location.hash = '#/list/' + h.id;
        });
        recentEl.appendChild(row);
      }
    }
  }

  // ---------- List view ----------
  function renderList() {
    mount('tpl-list');
    const list = state.list;

    const titleEl = $('#list-title');
    titleEl.textContent = list.name;
    titleEl.addEventListener('blur', () => {
      const v = titleEl.textContent.trim() || t('untitled');
      titleEl.textContent = v;
      if (v !== list.name) { list.name = v; commit(); }
    });
    titleEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });

    const meInput = $('#me-input');
    meInput.value = state.me || getMe();
    state.me = meInput.value;
    meInput.addEventListener('input', () => {
      state.me = meInput.value.trim();
      setMe(state.me);
      updateSelectionBar();
      renderItems();
    });

    $('#btn-back').addEventListener('click', () => navHome());
    $('#btn-share').addEventListener('click', () => openShareSheet());

    $$('#filter-seg .chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === state.filter);
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        $$('#filter-seg .chip').forEach(b => b.classList.toggle('active', b.dataset.filter === state.filter));
        renderItems();
      });
    });

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
      commit();
    };
    addBtn.addEventListener('click', submitAdd);
    addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAdd(); });
    addQty.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAdd(); });

    // Issue #7: detect multi-line paste into add-input
    addInput.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text');
      if (!text || !/\r?\n/.test(text.trim())) return; // single line → normal paste
      const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (lines.length < 2) return;
      e.preventDefault();
      openPasteDetectSheet(text);
    });

    $('#btn-paste').addEventListener('click', () => openPasteSheet());

    const scroll = $('.scroll');
    const topbar = $('.topbar');
    scroll.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', scroll.scrollTop > 4);
    });

    $('#sel-clear').addEventListener('click', () => {
      state.selected.clear();
      updateSelectionBar();
      renderItems();
    });
    $('#sel-assign').addEventListener('click', () => {
      const me = (state.me || '').trim();
      if (!me) { showToast(t('toast_enter_name')); $('#me-input').focus(); return; }
      let changed = 0;
      for (const id of state.selected) {
        const it = list.items.find(x => x.id === id);
        if (!it) continue;
        const already = it.assignees.some(a => parseAssignee(a).name.toLowerCase() === me.toLowerCase());
        if (!already) { it.assignees.push(me); changed++; }
      }
      state.selected.clear();
      if (changed) {
        commit();
        showToast(t('toast_assigned', changed, me));
      } else {
        updateSelectionBar();
        renderItems();
      }
    });

    renderItems();
  }

  function itemMatchesFilter(it) {
    const me = (state.me || '').trim().toLowerCase();
    const hasMe = () => me && it.assignees.some(a => parseAssignee(a).name.toLowerCase() === me);
    switch (state.filter) {
      case 'open': return it.assignees.length === 0;
      case 'mine': return hasMe();
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
    const me = (state.me || '').trim().toLowerCase();

    // Counts per filter for chips
    const counts = { all: list.items.length, open: 0, mine: 0, taken: 0 };
    for (const it of list.items) {
      if (it.assignees.length === 0) counts.open++;
      else counts.taken++;
      if (me && it.assignees.some(a => parseAssignee(a).name.toLowerCase() === me)) counts.mine++;
    }
    const setCnt = (id, n) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = String(n);
      el.hidden = n === 0;
    };
    setCnt('cnt-all', counts.all);
    setCnt('cnt-open', counts.open);
    setCnt('cnt-mine', counts.mine);
    setCnt('cnt-taken', counts.taken);

    if (!list.items.length) {
      container.innerHTML = `<div class="empty"><strong>${escapeHtml(t('empty_title'))}</strong>${escapeHtml(t('empty_hint'))}</div>`;
    } else if (!items.length) {
      container.innerHTML = `<div class="empty"><strong>${escapeHtml(t('no_matches'))}</strong>${escapeHtml(t('no_matches_hint'))}</div>`;
    } else {
      for (const it of items) {
        const row = document.createElement('div');
        row.className = 'row' + (it.done ? ' done' : '');
        row.dataset.id = it.id;

        const isSelected = state.selected.has(it.id);
        const qtyLabel = it.qty && it.qty > 1 ? ` <span class="qty">×${it.qty}</span>` : '';

        const tags = it.assignees.map(str => {
          const a = parseAssignee(str);
          if (!a.name) return '';
          const isMe = me && a.name.toLowerCase() === me;
          const q = a.qty && a.qty > 0 ? `<span class="a-qty">×${a.qty}</span>` : '';
          return `<span class="assignee-tag${isMe ? ' mine' : ''}" style="${assigneeStyle(a.name)}">${escapeHtml(a.name)}${q}</span>`;
        }).join('');

        const note = it.note ? `<div class="row-note">${escapeHtml(it.note)}</div>` : '';

        row.innerHTML = `
          <button class="check ${isSelected ? 'checked' : ''}" aria-label="Select" data-role="check">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <div class="row-main" data-role="body">
            <div class="row-name"><div class="row-title">${escapeHtml(it.name)}${qtyLabel}</div></div>
            <div class="assignees">${tags}</div>
            ${note}
          </div>
          <span class="chevron" data-role="edit">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </span>
        `;

        row.querySelector('[data-role="check"]').addEventListener('click', (e) => {
          e.stopPropagation(); toggleSelect(it.id);
        });
        row.querySelector('[data-role="body"]').addEventListener('click', () => toggleSelect(it.id));
        row.querySelector('[data-role="edit"]').addEventListener('click', (e) => {
          e.stopPropagation(); openItemSheet(it.id);
        });

        container.appendChild(row);
      }
    }

    const done = list.items.filter(x => x.assignees.length > 0).length;
    $('#stat-line').textContent = t('stats', done, list.items.length);
    updateSelectionBar();
  }

  function toggleSelect(id) {
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    updateSelectionBar();
    const row = document.querySelector(`.row[data-id="${CSS.escape(id)}"] .check`);
    if (row) row.classList.toggle('checked', state.selected.has(id));
  }

  function updateSelectionBar() {
    const bar = $('#sel-bar');
    if (!bar) return;
    const n = state.selected.size;
    if (n === 0) { bar.hidden = true; return; }
    bar.hidden = false;
    const me = (state.me || '').trim();
    $('#sel-count').textContent = t('sel_count', n);
    $('#sel-assign').textContent = t('assign_to', me);
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
    const nodes = Array.from(wrap.children);
    const host = document.createElement('div');
    host.className = 'sheet-host';
    nodes.forEach(n => host.appendChild(n));
    document.body.appendChild(host);
    state.sheet = { host };
    applyI18n(host);
    const backdrop = host.querySelector('.sheet-backdrop');
    const sheet = host.querySelector('.sheet');
    const close = () => closeSheet();
    if (backdrop) backdrop.addEventListener('click', close);
    if (sheet) sheet.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
    if (setup) setup({ sheet, close });
  }
  function closeSheet() {
    if (!state.sheet) return;
    const { host } = state.sheet;
    if (host && host.parentNode) host.parentNode.removeChild(host);
    state.sheet = null;
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.sheet) closeSheet(); });

  function openPasteSheet() {
    openSheet('tpl-paste-sheet', ({ sheet, close }) => {
      const ta = sheet.querySelector('#paste-text');
      ta.focus();
      sheet.querySelector('[data-confirm]').addEventListener('click', () => {
        const parsed = parsePaste(ta.value);
        if (!parsed.length) { showToast(t('toast_no_items')); return; }
        const replace = sheet.querySelector('#paste-replace').checked;
        if (replace) state.list.items = parsed;
        else state.list.items = parsed.concat(state.list.items);
        close();
        commit();
        showToast(t('toast_added', parsed.length));
      });
    });
  }

  function openPasteDetectSheet(rawText) {
    openSheet('tpl-paste-detect-sheet', ({ sheet, close }) => {
      const ta = sheet.querySelector('#detect-text');
      ta.value = rawText.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, '');
      const lines = ta.value.split(/\r?\n/).filter(x => x.trim()).length;
      sheet.querySelector('#detect-hint').textContent = t('detected_hint', lines);
      // Add-all
      sheet.querySelector('[data-confirm]').addEventListener('click', () => {
        const parsed = parsePaste(ta.value);
        if (!parsed.length) { showToast(t('toast_no_items')); return; }
        state.list.items = parsed.concat(state.list.items);
        // clear add-input
        const ai = document.getElementById('add-input');
        if (ai) ai.value = '';
        close();
        commit();
        showToast(t('toast_added', parsed.length));
      });
      // "Add as one" → paste raw into the add-input field (flattened)
      sheet.querySelector('[data-close]').addEventListener('click', () => {
        const ai = document.getElementById('add-input');
        if (ai) {
          ai.value = ta.value.replace(/\s*[\r\n]+\s*/g, ' ');
          ai.focus();
        }
      });
    });
  }

  function openShareSheet() {
    openSheet('tpl-share-sheet', ({ sheet }) => {
      const url = location.href;
      sheet.querySelector('#share-url').textContent = url;
      sheet.querySelector('#url-length').textContent = t('url_length', url.length);
      const copyBtn = sheet.querySelector('#btn-copy');
      copyBtn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(url); showToast(t('toast_link_copied')); }
        catch {
          const ta = document.createElement('textarea');
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); showToast(t('toast_link_copied')); }
          catch { showToast(t('toast_copy_failed')); }
          document.body.removeChild(ta);
        }
      });
      const nativeBtn = sheet.querySelector('#btn-native-share');
      if (navigator.share) {
        nativeBtn.hidden = false;
        nativeBtn.addEventListener('click', async () => {
          try { await navigator.share({ title: state.list.name, url }); } catch {}
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
      const editor = sheet.querySelector('#assignee-editor');

      nameI.value = it.name;
      qtyI.value = it.qty || '';
      noteI.value = it.note || '';

      // Build assignee editor rows
      const rows = it.assignees.map(parseAssignee);
      const draw = () => {
        editor.innerHTML = '';
        rows.forEach((a, idx) => {
          const el = document.createElement('div');
          el.className = 'ae-row';
          el.innerHTML = `
            <input class="ae-name" type="text" placeholder="${escapeHtml(t('ae_name_ph'))}" />
            <input class="ae-qty" type="number" min="1" inputmode="numeric" placeholder="${escapeHtml(t('ae_qty_ph'))}" />
            <button class="ae-del" aria-label="Remove">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            </button>
          `;
          const nameEl = el.querySelector('.ae-name');
          const qtyEl = el.querySelector('.ae-qty');
          nameEl.value = a.name;
          qtyEl.value = a.qty || '';
          nameEl.addEventListener('input', () => { rows[idx].name = nameEl.value; });
          qtyEl.addEventListener('input', () => {
            const q = parseInt(qtyEl.value, 10);
            rows[idx].qty = (!Number.isNaN(q) && q > 0) ? q : null;
          });
          el.querySelector('.ae-del').addEventListener('click', () => {
            rows.splice(idx, 1); draw();
          });
          editor.appendChild(el);
        });
        const addBtn = document.createElement('button');
        addBtn.className = 'ae-add';
        addBtn.textContent = t('ae_add');
        addBtn.addEventListener('click', () => {
          rows.push({ name: '', qty: null });
          draw();
          // focus new input
          const inputs = editor.querySelectorAll('.ae-name');
          if (inputs.length) inputs[inputs.length - 1].focus();
        });
        editor.appendChild(addBtn);
      };
      draw();

      nameI.focus();
      nameI.select();

      sheet.querySelector('[data-confirm]').addEventListener('click', () => {
        const name = nameI.value.trim();
        if (!name) { showToast(t('toast_name_required')); return; }
        it.name = name;
        const q = parseInt(qtyI.value, 10);
        it.qty = (!Number.isNaN(q) && q > 0) ? q : null;
        it.note = noteI.value.trim();
        it.assignees = rows
          .filter(a => (a.name || '').trim())
          .map(a => stringifyAssignee(a));
        close();
        commit();
      });

      sheet.querySelector('#btn-delete').addEventListener('click', () => {
        state.list.items = state.list.items.filter(x => x.id !== id);
        state.selected.delete(id);
        close();
        commit();
        showToast(t('toast_deleted'));
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
    void el.offsetHeight;
    el.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 1900);
  }

  // ---------- Boot ----------
  state.lang = detectLang();
  state.me = getMe();
  document.documentElement.lang = state.lang;
  window.addEventListener('hashchange', render);
  render();
})();
