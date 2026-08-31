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
      welcome_title: 'Welcome 👋',
      welcome_hint: 'What should we call you?',
      your_name_ph: 'Your name',
      filter_all: 'All',
      filter_open: 'Not taken',
      filter_mine: 'Mine',
      filter_taken: 'Taken',
      search_ph: 'Search',
      add_item_ph: 'Add items — one per line…',
      add_n_items: (n) => `Add ${n} items`,
      qty_ph: 'Qty',
      paste_list: 'Paste list…',
      stats: (done, total) => `${done} of ${total} taken`,
      sel_clear: 'Clear',
      sel_count: (n) => `${n} selected`,
      assign_to: () => 'Assign to me',
      cancel: 'Cancel',
      confirm_delete_title: 'Delete this item?',
      confirm_delete_hint: 'This can\'t be undone.',
      sort_by: 'Sort by',
      sort_date_asc: 'Date added (oldest first)',
      sort_date_desc: 'Date added (newest first)',
      sort_alpha_asc: 'Name (A → Z)',
      sort_alpha_desc: 'Name (Z → A)',
      ae_note_ph: 'Details (optional, e.g. red wine)',
      assign_to_name: (name) => `Assign to ${name}`,
      assign_to_other: 'Assign to someone else…',
      other_person_title: 'Assign to someone',
      other_person_ph: 'Name',
      bulk_actions_title: (n) => `${n} selected`,
      bulk_move_to_end: (n) => `Move ${n} item${n === 1 ? '' : 's'} to end`,
      toast_moved_to_end: (n) => `Moved ${n} item${n === 1 ? '' : 's'} to the end`,
      bulk_delete: (n) => `Delete ${n} item${n === 1 ? '' : 's'}`,
      confirm_bulk_delete_title: (n) => `Delete ${n} item${n === 1 ? '' : 's'}?`,
      toast_bulk_deleted: (n) => `Deleted ${n} item${n === 1 ? '' : 's'}`,
      add: 'Add',
      done: 'Done',
      save: 'Save',
      delete_item: 'Delete item',
      paste_sheet_title: 'Paste list',
      paste_hint: 'One item per line. Lines with <span class="mono-chip">✅ Name</span> get assigned automatically.',
      paste_example: 'Charcoal ✅ Bella\nLighter fluid\nBuns for burgers x8',
      replace_existing: 'Replace existing items',
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
      ae_assign_other: 'Assign to…',
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
      toast_link_shortened: 'Link shortened',
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
      change_name: 'Change name',
      you_are_title: 'Your name',
      you_are_hint: "Your name is remembered on this device and shown next to items you're bringing.",
      field_your_name: 'Name',
      ae_detail_label: 'Details',
      back_to_item: 'Item',
      ae_empty_name: '(no name)',
      ae_qty_label: 'Qty',
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
      welcome_title: 'Привет 👋',
      welcome_hint: 'Как тебя записать?',
      your_name_ph: 'Твоё имя',
      filter_all: 'Все',
      filter_open: 'Свободно',
      filter_mine: 'Моё',
      filter_taken: 'Занято',
      search_ph: 'Поиск',
      change_name: 'Изменить имя',
      you_are_title: 'Твоё имя',
      you_are_hint: 'Имя сохраняется на этом устройстве и показывается рядом с тем, что ты везёшь.',
      field_your_name: 'Имя',
      add_item_ph: 'Добавить пункты — по одному в строке…',
      add_n_items: (n) => `Добавить ${n}`,
      qty_ph: 'Кол.',
      paste_list: 'Вставить список…',
      stats: (done, total) => `${done} из ${total} разобрано`,
      sel_clear: 'Отмена',
      sel_count: (n) => `${n} выбрано`,
      assign_to: () => 'На меня',
      cancel: 'Отмена',
      confirm_delete_title: 'Удалить пункт?',
      confirm_delete_hint: 'Это нельзя отменить.',
      sort_by: 'Сортировка',
      sort_date_asc: 'По дате (сначала старые)',
      sort_date_desc: 'По дате (сначала новые)',
      sort_alpha_asc: 'По названию (А → Я)',
      sort_alpha_desc: 'По названию (Я → А)',
      ae_note_ph: 'Что везёт (напр. красное вино)',
      // Issue #45: RU sheet shows just the name — «На {name}» read as bad grammar.
      assign_to_name: (name) => name,
      assign_to_other: 'На кого-то ещё…',
      other_person_title: 'Записать на',
      other_person_ph: 'Имя',
      bulk_actions_title: (n) => `${n} выбрано`,
      bulk_move_to_end: (n) => {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return `Переместить ${n} пункт в конец`;
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `Переместить ${n} пункта в конец`;
        return `Переместить ${n} пунктов в конец`;
      },
      toast_moved_to_end: (n) => `Перемещено в конец: ${n}`,
      bulk_delete: (n) => {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return `Удалить ${n} пункт`;
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `Удалить ${n} пункта`;
        return `Удалить ${n} пунктов`;
      },
      confirm_bulk_delete_title: (n) => {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return `Удалить ${n} пункт?`;
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `Удалить ${n} пункта?`;
        return `Удалить ${n} пунктов?`;
      },
      toast_bulk_deleted: (n) => `Удалено: ${n}`,
      add: 'Добавить',
      done: 'Готово',
      save: 'Сохранить',
      delete_item: 'Удалить',
      paste_sheet_title: 'Вставить список',
      paste_hint: 'По одному пункту на строку. Строки с <span class="mono-chip">✅ Имя</span> сразу закрепляются.',
      paste_example: 'Уголь ✅ Бэлла\nЖидкость для розжига\nБулочки x8',
      replace_existing: 'Заменить существующие',
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
      ae_assign_other: 'Назначить…',
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
      toast_link_shortened: 'Ссылка укорочена',
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
      ae_detail_label: 'Детали',
      back_to_item: 'Пункт',
      ae_empty_name: '(без имени)',
      ae_qty_label: 'Кол.',
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
  // Item.assignees: Array of { name, qty, note } objects (in-memory).
  // Compact URL storage keeps back-compat with legacy string form.
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

  function makeAssignee(name = '', qty = null, note = '') {
    return { name: String(name || '').trim(), qty: qty && Number(qty) > 0 ? Number(qty) : null, note: String(note || '').trim() };
  }
  // Accept legacy "Name" / "Name:qty" strings, new tuples [name, qty, note],
  // and in-memory objects. Always returns a normalized { name, qty, note }.
  function normalizeAssignee(v) {
    if (Array.isArray(v)) return makeAssignee(v[0], v[1], v[2]);
    if (v && typeof v === 'object') return makeAssignee(v.name, v.qty, v.note);
    const s = String(v || '');
    const m = s.match(/^(.*?)(?::\s*(\d{1,3}))?\s*$/);
    if (!m) return makeAssignee(s);
    return makeAssignee(m[1], m[2] ? parseInt(m[2], 10) : null);
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
          assignees.push(makeAssignee(n));
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
  function rememberList(list, enc) {
    if (!list || !list.id) return;
    // Prefer a slug-URL representation if we have a live bucket for this list.
    let hashStr = null;
    if (state.bucketId) {
      hashStr = encodeURIComponent(state.slug || makeSlug(list.name, list.updatedAt)) + '~' + encodeURIComponent(state.bucketId);
      // Kept distinguishable from legacy "scheme/text" hashes below by the '~'.
    } else if (enc) {
      hashStr = enc.scheme + '/' + enc.text;
    }
    const prior = loadHistory().find(x => x.id === list.id);
    const entry = {
      id: list.id,
      name: list.name,
      itemCount: list.items.length,
      updatedAt: list.updatedAt || now(),
      hash: hashStr || (prior && prior.hash) || null,
    };
    const h = loadHistory().filter(x => x.id !== list.id);
    h.unshift(entry);
    saveHistory(h);
    // Issue #47: always keep a full local copy of the list content, keyed
    // by list id — independent of whatever hash/bucket the list happens
    // to resolve through right now. This is the fallback that recovers a
    // "not found" #/list/{id} link (e.g. the hash never got written
    // because navList's async bucket creation hadn't finished yet, or the
    // remote bucket has since become unreachable) on the same device.
    cacheListSnapshot(list);
  }
  function getMe() { try { return localStorage.getItem(ME_KEY) || ''; } catch { return ''; } }
  function setMe(name) { try { localStorage.setItem(ME_KEY, name); } catch {} }

  const LIST_SNAPSHOT_PREFIX = 'bringstuff:list:v1:';
  function cacheListSnapshot(list) {
    if (!list || !list.id) return;
    try { localStorage.setItem(LIST_SNAPSHOT_PREFIX + list.id, JSON.stringify(toCompact(list))); } catch {}
  }
  function readListSnapshot(id) {
    try {
      const raw = localStorage.getItem(LIST_SNAPSHOT_PREFIX + id);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  // ---------- Compact serialize ----------
  function compactAssignee(a) {
    const name = a.name || '';
    const qty = a.qty || 0;
    const note = a.note || '';
    // Keep the URL small: fall back to a plain string when there's no
    // qty and no per-assignee note (the common case), matching legacy
    // format so old readers still parse it.
    if (!qty && !note) return name;
    if (!note) return `${name}:${qty}`;
    return [name, qty, note];
  }
  function toCompact(list) {
    return {
      v: 1,
      id: list.id,
      n: list.name,
      u: list.updatedAt,
      i: list.items.map(it => [
        it.id, it.name, it.qty ?? 0,
        (it.assignees || []).map(compactAssignee),
        it.note || '', it.done ? 1 : 0,
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
        assignees: Array.isArray(a[3]) ? a[3].map(normalizeAssignee) : [],
        note: a[4] || '',
        done: !!a[5],
      })),
    };
  }
  // ---------- Remote storage (Netlify Function + Blobs) ----------
  // Each list gets its own bucket the first time it's created; we PUT
  // updates into the bucket on every commit and GET them back on load. The
  // shareable URL becomes  #/{slug}~{bucketId}  — short, human-readable, and
  // real live collaboration between anyone with the link.
  //
  // Fallback: if the backend is unreachable, we silently drop back to the
  // old #/z/... self-contained compressed URL so the app keeps working, and
  // stash a local copy in localStorage so a remote-backed list can still be
  // read on the creating device.
  const API_BASE = '/.netlify/functions/lists';

  async function kvdbCreate() {
    const r = await fetch(API_BASE, { method: 'POST' });
    if (!r.ok) throw new Error('create ' + r.status);
    const id = (await r.text()).trim();
    if (!id) throw new Error('no id');
    return id;
  }
  async function kvdbPut(bucketId, payload) {
    const r = await fetch(`${API_BASE}/${encodeURIComponent(bucketId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!r.ok) throw new Error('put ' + r.status);
  }
  async function kvdbGet(bucketId) {
    const r = await fetch(`${API_BASE}/${encodeURIComponent(bucketId)}`);
    if (!r.ok) return null;
    const txt = await r.text();
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  }

  const REMOTE_CACHE_PREFIX = 'bringstuff:remote:v1:';
  function cacheRemote(bucketId, payload) {
    try { localStorage.setItem(REMOTE_CACHE_PREFIX + bucketId, JSON.stringify(payload)); } catch {}
  }
  function readRemoteCache(bucketId) {
    try {
      const raw = localStorage.getItem(REMOTE_CACHE_PREFIX + bucketId);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function makeSlug(name, dateMs) {
    const d = new Date(dateMs || Date.now());
    const ym = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0');
    // Allow Unicode letters + digits, collapse everything else to a single dash.
    let clean = String(name || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    if (!clean) clean = 'list';
    return `${clean}-${ym}`;
  }

  // ---------- URL encoding ----------
  // Three URL formats:
  //   #/{slug}~{bucketId}  – remote list stored in kvdb (default going forward)
  //   #/l/<b64>            – legacy plain JSON  (kept working for old links)
  //   #/z/<b64>            – legacy deflate-compressed JSON  (kept working)
  const HAS_COMPRESSION = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

  function bytesToB64u(bytes) {
    let bin = '';
    // process in chunks to avoid call-stack limits on large arrays
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64uToBytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function deflate(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function inflate(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // Async encode — used by anything sharing/persisting a URL. Callers await.
  async function encodeStateAsync(list) {
    const json = JSON.stringify(toCompact(list));
    if (!HAS_COMPRESSION) return { scheme: 'l', text: b64uEncode(json) };
    try {
      const compressed = await deflate(new TextEncoder().encode(json));
      return { scheme: 'z', text: bytesToB64u(compressed) };
    } catch {
      return { scheme: 'l', text: b64uEncode(json) };
    }
  }
  // Fallback sync encode — for initial URL after loading a compressed hash so we can
  // update state without awaiting anything (URL text is updated separately, async).
  function encodeStateSyncPlain(list) {
    return { scheme: 'l', text: b64uEncode(JSON.stringify(toCompact(list))) };
  }
  async function decodeStateAsync(scheme, s) {
    try {
      if (scheme === 'z') {
        if (!HAS_COMPRESSION) return null;
        const bytes = b64uToBytes(s);
        const raw = await inflate(bytes);
        return fromCompact(JSON.parse(new TextDecoder().decode(raw)));
      }
      return fromCompact(JSON.parse(b64uDecode(s)));
    } catch { return null; }
  }
  function makeHash(enc) { return '#/' + enc.scheme + '/' + enc.text; }

  // ---------- Router ----------
  function parseHash() {
    const h = location.hash || '#/';
    if (h === '#' || h === '#/' || h === '') return { name: 'home' };
    if (h.startsWith('#/list/')) return { name: 'list', id: h.slice(7) };
    if (h.startsWith('#/l/')) return { name: 'list-encoded', scheme: 'l', data: h.slice(4) };
    if (h.startsWith('#/z/')) return { name: 'list-encoded', scheme: 'z', data: h.slice(4) };
    // Otherwise, slug format: #/{slug}~{bucketId}
    const tail = decodeURIComponent(h.slice(2));
    if (tail && !tail.includes('/')) {
      const tildeIdx = tail.lastIndexOf('~');
      if (tildeIdx > 0 && tildeIdx < tail.length - 1) {
        return { name: 'list-remote', slug: tail.slice(0, tildeIdx), bucketId: tail.slice(tildeIdx + 1) };
      }
    }
    return { name: 'home' };
  }
  function navHome() { location.hash = '#/'; }
  function slugHash(slug, bucketId) {
    return '#/' + encodeURIComponent(slug) + '~' + encodeURIComponent(bucketId);
  }
  function navList(list) {
    // Try remote-store path first; fall back to compressed URL on failure.
    (async () => {
      try {
        const bucketId = await kvdbCreate();
        state.bucketId = bucketId;
        state.slug = makeSlug(list.name, list.updatedAt);
        const payload = toCompact(list);
        await kvdbPut(bucketId, payload);
        cacheRemote(bucketId, payload);
        state.currentHashKey = 'r:' + bucketId;
        rememberList(list, null);
        location.hash = slugHash(state.slug, bucketId);
      } catch (err) {
        // fallback to compressed URL
        encodeStateAsync(list).then(enc => {
          state.currentHashKey = enc.scheme + ':' + enc.text;
          rememberList(list, enc);
          location.hash = makeHash(enc);
        });
      }
    })();
  }
  // Migrate a list that came in through a legacy #/l/ or #/z/ URL to a
  // fresh kvdb bucket, then quietly replace the URL with the new short
  // slug form. Fails silently if the store is unreachable.
  async function migrateEncodedToRemote(list) {
    // Don't attempt if the network is offline or we already migrated.
    if (state.bucketId) return;
    try {
      const bucketId = await kvdbCreate();
      const payload = toCompact(list);
      await kvdbPut(bucketId, payload);
      cacheRemote(bucketId, payload);
      state.bucketId = bucketId;
      state.slug = makeSlug(list.name, list.updatedAt);
      state.currentHashKey = 'r:' + bucketId;
      rememberList(list, null);
      const newHash = slugHash(state.slug, bucketId);
      history.replaceState(null, '', location.pathname + location.search + newHash);
      showToast(t('toast_link_shortened'));
    } catch {
      // Leave the legacy URL alone; the user can retry by opening the share
      // sheet later, or the site will retry on next load.
    }
  }

  // Debounced background PUT so rapid edits coalesce.
  let putTimer = null;
  function scheduleRemotePut(bucketId, list) {
    clearTimeout(putTimer);
    putTimer = setTimeout(() => {
      const payload = toCompact(list);
      cacheRemote(bucketId, payload);
      kvdbPut(bucketId, payload).catch(() => {/* ignore transient errors */});
    }, 350);
  }
  // Whether at least one push-panel (item detail, name editor, ...) is
  // currently on top of the list view. While true, that panel is sitting
  // on its own history entry (see openPanel), so replaceState below would
  // land on the panel's entry instead of the list's — updateHashInPlace
  // defers the URL write until the panel closes and we're really back on
  // the list entry (see the popstate handler near closeTopPanel).
  function panelIsOpen() { return !!(state.panels && state.panels.length); }
  let pendingUrlResync = false;

  function updateHashInPlace(list) {
    // If we already have a bucket, PUT to it (debounced) and keep URL as-is.
    if (state.bucketId) {
      // If title changed, refresh the human-readable slug part of the URL.
      const wantSlug = makeSlug(list.name, list.updatedAt);
      if (wantSlug !== state.slug) {
        state.slug = wantSlug;
        if (panelIsOpen()) {
          pendingUrlResync = true;
        } else {
          const newHash = slugHash(state.slug, state.bucketId);
          const newUrl = location.pathname + location.search + newHash;
          history.replaceState(null, '', newUrl);
        }
      }
      scheduleRemotePut(state.bucketId, list);
      return Promise.resolve({ scheme: 'r', text: state.bucketId });
    }
    // Otherwise (legacy self-contained URL), update the hash payload as before.
    return encodeStateAsync(list).then(enc => {
      if (panelIsOpen()) {
        pendingUrlResync = true;
      } else {
        const newUrl = location.pathname + location.search + makeHash(enc);
        history.replaceState(null, '', newUrl);
      }
      return enc;
    });
  }

  // ---------- App state ----------
  const SORT_KEY = 'bringstuff:sort:v1';
  function loadSort() {
    try {
      const s = localStorage.getItem(SORT_KEY);
      if (s === 'date_asc' || s === 'date_desc' || s === 'alpha_asc' || s === 'alpha_desc') return s;
    } catch {}
    return 'date_asc';
  }
  function saveSort(s) { try { localStorage.setItem(SORT_KEY, s); } catch {} }

  const state = {
    lang: 'en',
    list: null,
    me: '',
    filter: 'all',
    filterPerson: '',
    search: '',
    sort: 'date_asc',
    selected: new Set(),
    sheet: null,
    panel: null,
    editingItemId: null,
    currentHashKey: null,
    bucketId: null,   // kvdb bucket for the current list (null = legacy URL-only)
    slug: null,       // current human-readable slug in the URL
  };

  function commit() {
    if (!state.list) return;
    state.list.updatedAt = now();
    // Render immediately from in-memory state so the UI is snappy;
    // update the URL + history entry in the background.
    render();
    updateHashInPlace(state.list).then(enc => {
      state.currentHashKey = enc.scheme + ':' + enc.text;
      rememberList(state.list, enc);
    });
  }

  // ---------- Rendering ----------
  const appEl = document.getElementById('app');

  function render() {
    const route = parseHash();
    if (route.name === 'home') {
      state.bucketId = null; state.slug = null;
      renderHome();
      return;
    }
    if (route.name === 'list-remote') {
      const hashKey = 'r:' + route.bucketId;
      if (state.list && state.currentHashKey === hashKey) { renderList(); return; }
      state.bucketId = route.bucketId;
      state.slug = route.slug;
      // Try cache first for instant paint, then refresh from remote.
      const cached = readRemoteCache(route.bucketId);
      if (cached) {
        state.list = fromCompact(cached);
        state.selected = new Set();
        state.search = '';
        state.currentHashKey = hashKey;
        renderList();
      }
      kvdbGet(route.bucketId).then(payload => {
        if (!payload) {
          if (!state.list) {
            // Issue #47: this bucket is unreachable — either the backend
            // migrated (old kvdb.io links are permanently dead) or this
            // origin can't reach the function that serves it (e.g. a
            // Netlify-only link opened from the GitHub Pages deployment).
            // Drop the dead entry from Recents so it isn't offered again
            // as a link that can never load.
            const encBucket = encodeURIComponent(route.bucketId);
            saveHistory(loadHistory().filter(x => !(x.hash && x.hash.endsWith('~' + encBucket))));
            showToast(t('toast_list_not_found'));
            navHome();
          }
          return;
        }
        const list = fromCompact(payload);
        if (!list) return;
        cacheRemote(route.bucketId, payload);
        // Issue #75: this fetch was already in flight when it started, so a
        // local edit (e.g. adding items) can land while we're waiting on it.
        // If that happened, state.list is now newer than what the server had
        // when it answered — adopting the fetch's stale snapshot would
        // silently wipe out the edit. Only apply it if it isn't older than
        // what's already showing, and if we're still even looking at this
        // same list (the user may have navigated away while this was in flight).
        if (state.list && state.currentHashKey === hashKey && state.list.updatedAt > (list.updatedAt || 0)) {
          return;
        }
        // Only re-render if the remote is different from what we already show.
        const changed = !state.list || JSON.stringify(toCompact(state.list)) !== JSON.stringify(payload);
        state.list = list;
        state.currentHashKey = hashKey;
        rememberList(list, null);
        if (changed) renderList();
      });
      return;
    }
    if (route.name === 'list-encoded') {
      const hashKey = route.scheme + ':' + route.data;
      // If in-memory state already matches the URL, render without decoding.
      if (state.list && state.currentHashKey === hashKey) { renderList(); return; }
      state.bucketId = null; state.slug = null;
      decodeStateAsync(route.scheme, route.data).then(list => {
        if (!list) { showToast(t('toast_invalid_link')); navHome(); return; }
        state.list = list;
        state.selected = new Set();
        state.search = '';
        state.currentHashKey = hashKey;
        rememberList(list, { scheme: route.scheme, text: route.data });
        renderList();
        // Auto-migrate legacy long URLs onto a fresh kvdb bucket so the
        // shareable URL becomes the new short slug form.
        migrateEncodedToRemote(list);
      });
      return;
    }
    if (route.name === 'list') {
      const hist = loadHistory().find(h => h.id === route.id);
      if (hist && hist.hash) {
        // Rewrite to the concrete URL and re-render through the normal flow.
        location.hash = '#/' + hist.hash;
      } else {
        // Issue #47: no resolvable hash for this recent entry (most
        // commonly the async bucket-creation hadn't written one back yet
        // when this was tapped). Fall back to the full snapshot cached
        // locally on every commit, so the list still opens on this device
        // instead of a dead "not found".
        const snap = readListSnapshot(route.id);
        const list = snap && fromCompact(snap);
        if (list) {
          state.list = list;
          state.selected = new Set();
          state.search = '';
          state.bucketId = null; state.slug = null;
          state.currentHashKey = 'snap:' + route.id;
          renderList();
        } else {
          showToast(t('toast_list_not_found'));
          navHome();
        }
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
      state.search = '';
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
          if (h.hash) {
            if (h.hash.includes('~')) {
              location.hash = '#/' + h.hash;
            } else {
              const [scheme, text] = h.hash.includes('/') ? h.hash.split('/', 2) : ['l', h.hash];
              location.hash = '#/' + scheme + '/' + text;
            }
          } else location.hash = '#/list/' + h.id;
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
    const meRow = $('#me-row');
    const meChip = $('#me-chip');
    const meSaveBtn = $('#me-save');
    meInput.value = state.me || getMe();
    state.me = meInput.value.trim();

    const updateMeChip = () => {
      const name = (state.me || '').trim();
      if (name) {
        meRow.hidden = true;
        meChip.hidden = false;
        $('#me-chip-name').textContent = name;
        meChip.setAttribute('style', assigneeStyle(name));
        meChip.title = t('change_name');
      } else {
        meRow.hidden = false;
        meChip.hidden = true;
      }
    };
    updateMeChip();

    const saveMe = () => {
      state.me = meInput.value.trim();
      setMe(state.me);
      updateMeChip();
      updateSelectionBar();
      renderItems();
    };
    meSaveBtn.addEventListener('click', saveMe);
    meInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveMe(); meInput.blur(); } });
    meInput.addEventListener('blur', saveMe);
    // Issue #17: tapping the chip opens a push panel instead of
    // revealing the inline field — that felt out of place appearing
    // between the title and the list.
    meChip.addEventListener('click', () => openNameView(updateMeChip));

    $('#btn-back').addEventListener('click', () => navHome());
    $('#btn-share').addEventListener('click', () => copyShareLink(list));

    // Issue #15: search grows the button into a pill input between the list
    // name and the share button, filtering items by name/note as you type.
    // The title stays visible (just yields room) rather than disappearing.
    const titleRow = $('#title-row');
    const searchBtn = $('#btn-search');
    const searchInput = $('#search-input');
    const searchClearBtn = $('#btn-search-clear');
    const openSearch = () => {
      titleRow.classList.add('searching');
      searchInput.focus();
    };
    const closeSearch = () => {
      titleRow.classList.remove('searching');
      if (state.search) {
        state.search = '';
        searchInput.value = '';
        renderItems();
      }
    };
    // Re-render may run while a search is already active (e.g. checking an
    // item off mid-search) — restore the UI to match state.search instead
    // of resetting it.
    if (state.search) {
      titleRow.classList.add('searching');
      searchInput.value = state.search;
    }
    searchBtn.addEventListener('click', openSearch);
    searchClearBtn.addEventListener('click', closeSearch);
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value;
      renderItems();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
    });

    // Issue #12: sort chip opens a bottom-sheet with sort options.
    const sortBtn = $('#btn-sort');
    if (sortBtn) sortBtn.addEventListener('click', () => openSortSheet());

    $$('#filter-seg .chip[data-filter]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === state.filter);
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        state.filterPerson = '';
        syncFilterChips();
        renderItems();
        // Issue #32: reset scroll so a shorter filtered list isn't
        // stranded below the previous scroll offset.
        const sc = $('.scroll');
        if (sc) sc.scrollTop = 0;
      });
    });
    syncFilterChips();

    // Issue #20: add block is now a multi-line textarea. Enter makes a new
    // line; Save reads every non-blank line and adds each as its own item.
    // The dedicated "Paste list…" button is gone since paste now works the
    // same as typing — one line per item.
    // Issue #58: the add row now lives at the top of the list as a compact
    // inline field with a checkmark button instead of a labeled "Add" button.
    const addInput = $('#add-input');
    const addBtn = $('#btn-add');

    const autoGrow = () => {
      addInput.style.height = 'auto';
      addInput.style.height = Math.min(addInput.scrollHeight, window.innerHeight * 0.4) + 'px';
    };
    const updateAddLabel = () => {
      const lines = addInput.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      addBtn.disabled = lines.length === 0;
      addBtn.setAttribute('aria-label', lines.length > 1 ? t('add_n_items', lines.length) : t('add'));
    };
    const submitAdd = () => {
      const parsed = parsePaste(addInput.value);
      if (!parsed.length) return;
      list.items = list.items.concat(parsed);
      addInput.value = '';
      autoGrow();
      updateAddLabel();
      addInput.focus();
      commit();
      if (parsed.length > 1) showToast(t('toast_added', parsed.length));
    };
    addBtn.addEventListener('click', submitAdd);
    addInput.addEventListener('input', () => { autoGrow(); updateAddLabel(); });
    // Cmd/Ctrl+Enter also submits so keyboard users don't have to reach for Save.
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitAdd(); }
    });
    autoGrow();
    updateAddLabel();

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
      bulkAssign(me);
    });
    // Issue #8: overflow menu on the selection bar
    const overflow = $('#sel-overflow');
    if (overflow) overflow.addEventListener('click', () => openBulkActionsSheet());

    renderItems();
  }

  function itemMatchesFilter(it) {
    // Issue #15: search narrows within whatever filter tab is active,
    // matching against the item's name and its note ("description").
    const q = (state.search || '').trim().toLowerCase();
    if (q) {
      const hay = `${it.name || ''} ${it.note || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    const me = (state.me || '').trim().toLowerCase();
    const hasMe = () => me && it.assignees.some(a => a.name.toLowerCase() === me);
    switch (state.filter) {
      case 'open': return it.assignees.length === 0;
      case 'mine': return hasMe();
      case 'taken': return it.assignees.length > 0;
      case 'person': {
        const p = (state.filterPerson || '').toLowerCase();
        return !!p && it.assignees.some(a => a.name.toLowerCase() === p);
      }
      default: return true;
    }
  }

  function sortItems(items) {
    const s = state.sort;
    if (s === 'date_asc') return items;              // stored order = insertion order
    if (s === 'date_desc') return items.slice().reverse();
    const cmp = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), state.lang === 'ru' ? 'ru' : undefined, { sensitivity: 'base', numeric: true });
    const sorted = items.slice().sort(cmp);
    return s === 'alpha_desc' ? sorted.reverse() : sorted;
  }

  function renderItems() {
    const list = state.list;
    const container = $('#items');
    if (!container) return;
    container.innerHTML = '';

    const items = sortItems(list.items.filter(itemMatchesFilter));
    const me = (state.me || '').trim().toLowerCase();

    // Counts per filter for chips
    const counts = { all: list.items.length, open: 0, mine: 0, taken: 0 };
    for (const it of list.items) {
      if (it.assignees.length === 0) counts.open++;
      else counts.taken++;
      if (me && it.assignees.some(a => a.name.toLowerCase() === me)) counts.mine++;
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

        const tags = it.assignees.map(a => {
          if (!a.name) return '';
          const isMe = me && a.name.toLowerCase() === me;
          const q = a.qty && a.qty > 0 ? `<span class="a-qty">×${a.qty}</span>` : '';
          const hasNote = a.note ? ' has-note' : '';
          const titleAttr = a.note ? ` title="${escapeHtml(a.note)}"` : '';
          return `<button class="assignee-tag${isMe ? ' mine' : ''}${hasNote}" data-role="filter-person" data-name="${escapeHtml(a.name)}" style="${assigneeStyle(a.name)}"${titleAttr}>${escapeHtml(a.name)}${q}</button>`;
        }).join('');

        // Issue #21: show each per-assignee note on its own line under the row.
        const assigneeNotes = it.assignees
          .filter(a => a.name && a.note)
          .map(a => `<div class="row-assignee-note"><b>${escapeHtml(a.name)}:</b> ${escapeHtml(a.note)}</div>`)
          .join('');
        const note = (it.note ? `<div class="row-note">${escapeHtml(it.note)}</div>` : '') + assigneeNotes;

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

        // Issue #14: tap the checkmark to select; tap the row body to open.
        row.querySelector('[data-role="check"]').addEventListener('click', (e) => {
          e.stopPropagation(); toggleSelect(it.id);
        });
        const openIt = () => openItemView(it.id);
        row.querySelector('[data-role="body"]').addEventListener('click', openIt);
        row.querySelector('[data-role="edit"]').addEventListener('click', (e) => {
          e.stopPropagation(); openIt();
        });
        // Issue #3: tap an assignee tag to filter the list by that person.
        row.querySelectorAll('[data-role="filter-person"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            setPersonFilter(btn.dataset.name);
          });
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
    // Issue #43: just the number, no "selected" label.
    $('#sel-count').textContent = String(n);
    $('#sel-assign').textContent = t('assign_to');
  }

  function setPersonFilter(name) {
    const clean = String(name || '').trim();
    if (!clean) return;
    state.filter = 'person';
    state.filterPerson = clean;
    syncFilterChips();
    renderItems();
    const sc = $('.scroll');
    if (sc) sc.scrollTop = 0;
  }

  // Rebuild the active state of the filter chips and show/hide the
  // person-filter pill. Called on every filter change so state and
  // chips stay in sync (including the person chip's visibility).
  function syncFilterChips() {
    const seg = $('#filter-seg');
    if (!seg) return;
    $$('#filter-seg .chip[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === state.filter));
    let personChip = $('#filter-seg .chip.person-chip');
    if (state.filter === 'person' && state.filterPerson) {
      if (!personChip) {
        personChip = document.createElement('button');
        personChip.className = 'chip person-chip active';
        personChip.innerHTML = '<span class="person-chip-name"></span><span class="person-chip-x" aria-hidden="true">×</span>';
        personChip.addEventListener('click', () => {
          state.filter = 'all';
          state.filterPerson = '';
          syncFilterChips();
          renderItems();
        });
        seg.appendChild(personChip);
      }
      personChip.querySelector('.person-chip-name').textContent = state.filterPerson;
      personChip.setAttribute('style', assigneeStyle(state.filterPerson));
      personChip.scrollIntoView({ inline: 'end', block: 'nearest' });
    } else if (personChip) {
      personChip.remove();
    }
  }

  // Issue #8: bulk assign helper, shared by the "Assign to me" pill and the
  // overflow menu's Assign-to-someone action.
  function bulkAssign(name) {
    const list = state.list;
    if (!list) return;
    const trimmed = String(name || '').trim();
    if (!trimmed) return;
    let changed = 0;
    for (const id of state.selected) {
      const it = list.items.find(x => x.id === id);
      if (!it) continue;
      const already = it.assignees.some(a => a.name.toLowerCase() === trimmed.toLowerCase());
      if (!already) { it.assignees.push(makeAssignee(trimmed)); changed++; }
    }
    state.selected.clear();
    if (changed) {
      commit();
      showToast(t('toast_assigned', changed, trimmed));
    } else {
      updateSelectionBar();
      renderItems();
    }
  }

  function bulkDelete() {
    const list = state.list;
    if (!list) return;
    const ids = new Set(state.selected);
    if (!ids.size) return;
    const n = ids.size;
    list.items = list.items.filter(x => !ids.has(x.id));
    state.selected.clear();
    commit();
    showToast(t('toast_bulk_deleted', n));
  }

  // Issue #69: bulk "move to end" — reorders the selected items to the end
  // of the list, keeping their relative order, without touching anything
  // else. The default sort is plain insertion order, so this is how you fix
  // items that landed too early (e.g. imported before some later additions).
  function bulkMoveToEnd() {
    const list = state.list;
    if (!list) return;
    const ids = new Set(state.selected);
    if (!ids.size) return;
    const n = ids.size;
    const moving = list.items.filter(x => ids.has(x.id));
    const staying = list.items.filter(x => !ids.has(x.id));
    list.items = staying.concat(moving);
    state.selected.clear();
    commit();
    showToast(t('toast_moved_to_end', n));
  }

  function uniqueAssigneeNames(list) {
    const seen = new Map();
    for (const it of (list.items || [])) {
      for (const a of (it.assignees || [])) {
        const n = (a.name || '').trim();
        if (!n) continue;
        const key = n.toLowerCase();
        if (!seen.has(key)) seen.set(key, n);
      }
    }
    return Array.from(seen.values());
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
        else state.list.items = state.list.items.concat(parsed);
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
        state.list.items = state.list.items.concat(parsed);
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

  // Pinned share URLs by lowercased list name. Lets specific lists hand out
  // a canonical URL (e.g. the Netlify-backed one) even when opened on the
  // legacy GH Pages origin, so friends still on the old link converge onto
  // the durable backend.
  const PINNED_SHARE_URLS = {
    'отдых': 'https://bringstuff.netlify.app/#/otdyh-202608~zbz6gtju8m',
    '🏕️ отдых': 'https://bringstuff.netlify.app/#/otdyh-202608~zbz6gtju8m',
  };
  function shareUrlFor(list) {
    const key = String(list?.name || '').trim().toLowerCase();
    return PINNED_SHARE_URLS[key] || location.href;
  }

  async function copyShareLink(list) {
    const url = shareUrlFor(list);
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('toast_link_copied'));
      return;
    } catch {}
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast(t('toast_link_copied')); }
    catch { showToast(t('toast_copy_failed')); }
    document.body.removeChild(ta);
  }

  // ---------- Push panel (iOS-style nav stack) ----------
  // Panels stack: opening a new panel pushes on top of any existing panel
  // instead of replacing it, so back-swipe returns to the previous panel
  // rather than the underlying list. Only the topmost panel is interactive.
  function openPanel(tplId, setup) {
    const tpl = document.getElementById(tplId);
    const wrap = document.createElement('div');
    wrap.appendChild(tpl.content.cloneNode(true));
    const nodes = Array.from(wrap.children);
    const host = document.createElement('div');
    host.className = 'panel-host';
    nodes.forEach(n => host.appendChild(n));
    document.body.appendChild(host);
    if (!state.panels) state.panels = [];
    const wasEmpty = state.panels.length === 0;
    state.panels.push({ host });
    state.panel = state.panels[state.panels.length - 1];
    applyI18n(host);
    const panel = host.querySelector('.push-panel');
    const close = (immediate) => closeTopPanel(host, immediate);
    host.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => close()));
    if (panel) attachSwipeToDismiss(panel, close);
    if (setup) setup({ panel, close });
    // Issue #51: give only the OUTERMOST panel its own history entry. An
    // edge-swipe-back gesture can be captured by the OS/browser ahead of
    // our own touch handlers (especially right at the screen edge), which
    // then just calls the browser's native back navigation — with no
    // panel-owned history entry, that pops straight past the list to
    // Home. Pushing one entry here means that navigation only pops this
    // marker, landing back on the list. Nested panels (e.g. the assignee
    // editor over item detail) don't get their own entry — closing those
    // is handled purely by our in-JS panel stack, same as a swipe already
    // only affects the topmost panel.
    if (wasEmpty) history.pushState({ bsPanel: true }, '', location.href);
  }

  function removePanelDom(entry, immediate) {
    if (!entry || !entry.host || !entry.host.parentNode) return;
    if (immediate) { entry.host.parentNode.removeChild(entry.host); return; }
    const panel = entry.host.querySelector('.push-panel');
    if (!panel) { entry.host.parentNode.removeChild(entry.host); return; }
    panel.classList.add('closing');
    const done = () => {
      panel.removeEventListener('animationend', done);
      if (entry.host.parentNode) entry.host.parentNode.removeChild(entry.host);
    };
    panel.addEventListener('animationend', done);
    setTimeout(done, 400);
  }

  // Close a specific panel (by its host). Falls back to closing the top.
  function closeTopPanel(host, immediate = false) {
    if (!state.panels || !state.panels.length) return;
    const idx = state.panels.findIndex(p => p.host === host);
    const target = idx >= 0 ? state.panels.splice(idx, 1)[0] : state.panels.pop();
    state.panel = state.panels.length ? state.panels[state.panels.length - 1] : null;
    removePanelDom(target, immediate);
    // The last panel closing (via our own JS, not a browser/OS back nav)
    // needs to pop the marker entry pushed when it opened. That triggers
    // the popstate handler below, which performs the deferred URL resync
    // (if updateHashInPlace skipped a replaceState while this panel was
    // open) once we've actually landed back on the list's own entry.
    if (!state.panels.length && history.state && history.state.bsPanel) {
      history.back();
    }
  }

  // Fires for the browser/OS back gesture (including an edge-swipe the OS
  // captured before our own touch handlers saw it) as well as for the
  // history.back() call above. If panels are still tracked here, this
  // wasn't triggered by our own close flow (which already empties
  // state.panels first) — close them all immediately, no animation, since
  // the navigation has already happened. Either way, apply any URL sync
  // that was deferred while a panel sat on top of the list's history entry.
  window.addEventListener('popstate', () => {
    if (state.panels && state.panels.length) {
      while (state.panels.length) removePanelDom(state.panels.pop(), true);
      state.panel = null;
    }
    if (pendingUrlResync) {
      pendingUrlResync = false;
      updateHashInPlace(state.list).then(enc => {
        state.currentHashKey = enc.scheme + ':' + enc.text;
        rememberList(state.list, enc);
      });
    }
  });

  // Issue #16 — right-swipe dismisses a push panel (iOS nav-stack pop).
  function attachSwipeToDismiss(panel, close) {
    let startX = 0, startY = 0, startTime = 0, dx = 0, dy = 0;
    let dragging = false, decided = false, cancelled = false;
    const TH_DIST = 90;       // px: swipe further than this → close
    const TH_VELOCITY = 0.6;  // px/ms
    const EDGE_ZONE = 32;     // px from left edge is a guaranteed drag zone

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      // If the touch begins in an interactive input, defer to that element.
      const tag = (e.target.tagName || '').toLowerCase();
      const inEditable = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      // Only interpret drags that begin near the left edge as swipe-to-close
      // when starting inside editable regions; otherwise anywhere on the panel.
      if (inEditable && t.clientX > EDGE_ZONE) { cancelled = true; return; }
      startX = t.clientX; startY = t.clientY;
      startTime = performance.now();
      dx = 0; dy = 0; dragging = true; decided = false; cancelled = false;
    };
    const onTouchMove = (e) => {
      if (!dragging || cancelled) return;
      const t = e.touches[0];
      dx = t.clientX - startX;
      dy = t.clientY - startY;
      if (!decided) {
        // Wait until user commits to a direction; if the initial motion is
        // mostly vertical (or leftward), treat this as a normal scroll.
        if (Math.abs(dx) + Math.abs(dy) < 8) return;
        if (dx < 4 || Math.abs(dy) > Math.abs(dx) * 1.3) { cancelled = true; return; }
        decided = true;
      }
      if (dx < 0) dx = 0;
      panel.style.transition = 'none';
      panel.style.transform = `translateX(${dx}px)`;
      panel.style.willChange = 'transform';
      // Prevent the underlying page from scrolling while we own the gesture.
      if (e.cancelable) e.preventDefault();
    };
    const onTouchEnd = () => {
      if (!dragging) return;
      dragging = false;
      if (cancelled || !decided) {
        panel.style.transform = '';
        panel.style.transition = '';
        return;
      }
      const dt = Math.max(1, performance.now() - startTime);
      const v = dx / dt;
      const shouldClose = dx > TH_DIST || v > TH_VELOCITY;
      if (shouldClose) {
        panel.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 0.9, 0.4)';
        panel.style.transform = 'translateX(100%)';
        // Skip the exit animation on close — the panel is already off-screen
        // from the swipe transform, and re-running .closing would snap it
        // back to 0 and re-animate, showing a ghost layer.
        setTimeout(() => close(true), 220);
      } else {
        panel.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.02)';
        panel.style.transform = 'translateX(0)';
        setTimeout(() => { panel.style.transform = ''; panel.style.transition = ''; }, 240);
      }
    };
    panel.addEventListener('touchstart', onTouchStart, { passive: true });
    panel.addEventListener('touchmove', onTouchMove, { passive: false });
    panel.addEventListener('touchend', onTouchEnd, { passive: true });
    panel.addEventListener('touchcancel', onTouchEnd, { passive: true });
  }
  function closePanel(immediate = false) {
    // Legacy entry point: closes the topmost panel on the stack.
    if (!state.panels || !state.panels.length) return;
    const top = state.panels[state.panels.length - 1];
    closeTopPanel(top.host, immediate);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.panel) closePanel(); });

  function openNameView(onSave) {
    openPanel('tpl-name-view', ({ panel, close }) => {
      panel.querySelector('.back-label').textContent = state.list?.name || t('nav_lists');
      const input = panel.querySelector('#name-input');
      input.value = state.me || '';
      // Focus after the slide-in animation so the keyboard doesn't
      // fight the transform.
      setTimeout(() => { input.focus(); input.select(); }, 200);

      const save = () => {
        state.me = input.value.trim();
        setMe(state.me);
        if (onSave) onSave();
        renderItems();
        updateSelectionBar();
        close();
      };
      panel.querySelector('[data-confirm]').addEventListener('click', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
      });
    });
  }

  // Issue #44: push panel to edit a single assignee's name / qty / detail.
  // Stacks over the item detail so back-swipe returns to it unchanged.
  function openAssigneeView(current, onSave) {
    openPanel('tpl-assignee-view', ({ panel, close }) => {
      const nameEl = panel.querySelector('#ae-edit-name');
      const qtyEl = panel.querySelector('#ae-edit-qty');
      const noteEl = panel.querySelector('#ae-edit-note');
      nameEl.value = current.name || '';
      qtyEl.value = current.qty || '';
      noteEl.value = current.note || '';
      setTimeout(() => { nameEl.focus(); nameEl.select(); }, 200);
      const save = () => {
        const q = parseInt(qtyEl.value, 10);
        const updated = makeAssignee(nameEl.value, (!Number.isNaN(q) && q > 0) ? q : null, noteEl.value);
        close();
        onSave(updated);
      };
      panel.querySelector('[data-confirm]').addEventListener('click', save);
      nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); noteEl.focus(); } });
      qtyEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); noteEl.focus(); } });
    });
  }

  function openItemView(id) {
    const it = state.list.items.find(x => x.id === id);
    if (!it) return;
    state.editingItemId = id;
    openPanel('tpl-item-view', ({ panel, close }) => {
      const nameI = panel.querySelector('#edit-name');
      const qtyI = panel.querySelector('#edit-qty');
      const noteI = panel.querySelector('#edit-note');
      const editor = panel.querySelector('#assignee-editor');

      nameI.value = it.name;
      qtyI.value = it.qty || '';
      noteI.value = it.note || '';

      // Issue #44: assignees are shown as view-only rows with edit/delete
      // buttons. Tapping edit pushes an overlay to change name/qty/detail.
      const rows = it.assignees.map(a => makeAssignee(a.name, a.qty, a.note));
      const draw = () => {
        editor.innerHTML = '';
        rows.forEach((a, idx) => {
          const el = document.createElement('div');
          el.className = 'ae-row-view';
          const displayName = a.name ? escapeHtml(a.name) : `<span class="ae-empty">${escapeHtml(t('ae_empty_name'))}</span>`;
          const qtyBit = a.qty && a.qty > 0 ? ` <span class="ae-view-qty">×${a.qty}</span>` : '';
          const noteBit = a.note ? `<div class="ae-view-note">${escapeHtml(a.note)}</div>` : '';
          el.innerHTML = `
            <div class="ae-view-main" data-role="edit">
              <div class="ae-view-head" style="${assigneeStyle(a.name)}"><span class="ae-view-name">${displayName}</span>${qtyBit}</div>
              ${noteBit}
            </div>
            <button class="ae-view-btn ae-view-edit" data-role="edit" aria-label="Edit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="ae-view-btn ae-view-del" data-role="delete" aria-label="Remove">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.5 14a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </button>
          `;
          const openEdit = () => {
            openAssigneeView(rows[idx], (updated) => {
              rows[idx] = updated;
              draw();
            });
          };
          el.querySelector('.ae-view-main').addEventListener('click', openEdit);
          el.querySelector('.ae-view-edit').addEventListener('click', (e) => {
            e.stopPropagation(); openEdit();
          });
          el.querySelector('.ae-view-del').addEventListener('click', (e) => {
            e.stopPropagation();
            rows.splice(idx, 1); draw();
          });
          editor.appendChild(el);
        });
        // Issue #56: quick "Assign to me" next to the existing "Assign to…"
        // flow, so claiming an item doesn't require typing your own name.
        const quickRow = document.createElement('div');
        quickRow.className = 'ae-quick-row';

        const meBtn = document.createElement('button');
        meBtn.className = 'ae-add';
        meBtn.textContent = t('assign_to');
        const me = (state.me || '').trim();
        const alreadyMine = me && rows.some(a => (a.name || '').trim().toLowerCase() === me.toLowerCase());
        meBtn.disabled = !!alreadyMine;
        meBtn.addEventListener('click', () => {
          const name = (state.me || '').trim();
          if (!name) { showToast(t('toast_enter_name')); return; }
          rows.push(makeAssignee(name));
          draw();
        });
        quickRow.appendChild(meBtn);

        const addBtn = document.createElement('button');
        addBtn.className = 'ae-add';
        addBtn.textContent = t('ae_assign_other');
        addBtn.addEventListener('click', () => {
          const fresh = makeAssignee();
          openAssigneeView(fresh, (updated) => {
            // Only add if the user actually gave a name.
            if ((updated.name || '').trim()) {
              rows.push(updated);
              draw();
            }
          });
        });
        quickRow.appendChild(addBtn);

        editor.appendChild(quickRow);
      };
      draw();

      panel.querySelector('[data-confirm]').addEventListener('click', () => {
        const name = nameI.value.trim();
        if (!name) { showToast(t('toast_name_required')); return; }
        it.name = name;
        const q = parseInt(qtyI.value, 10);
        it.qty = (!Number.isNaN(q) && q > 0) ? q : null;
        it.note = noteI.value.trim();
        it.assignees = rows
          .filter(a => (a.name || '').trim())
          .map(a => makeAssignee(a.name, a.qty, a.note));
        // commit() before close(): updateHashInPlace needs to see this
        // panel as still open (state.panels non-empty) to know it must
        // defer the URL write until we're actually back on the list's
        // history entry — see closeTopPanel / the popstate handler.
        commit();
        close();
      });

      panel.querySelector('#btn-delete').addEventListener('click', () => {
        openConfirmDeleteSheet(() => {
          state.list.items = state.list.items.filter(x => x.id !== id);
          state.selected.delete(id);
          commit();
          close();
          showToast(t('toast_deleted'));
        });
      });
    });
  }

  function openConfirmDeleteSheet(onConfirm) {
    openSheet('tpl-confirm-delete-sheet', ({ sheet, close }) => {
      sheet.querySelector('[data-confirm]').addEventListener('click', () => { close(); onConfirm(); });
    });
  }

  // Issue #8: overflow sheet with bulk assign & bulk delete actions.
  function openBulkActionsSheet() {
    const list = state.list;
    const n = state.selected.size;
    if (!list || !n) return;
    openSheet('tpl-bulk-actions-sheet', ({ sheet, close }) => {
      sheet.querySelector('.confirm-title').textContent = t('bulk_actions_title', n);
      const listEl = sheet.querySelector('#bulk-people');
      listEl.innerHTML = '';
      const me = (state.me || '').trim();
      const seen = new Set();
      const addBtn = (name) => {
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        const btn = document.createElement('button');
        btn.className = 'sort-option';
        btn.textContent = t('assign_to_name', name);
        btn.addEventListener('click', () => { close(); bulkAssign(name); });
        listEl.appendChild(btn);
      };
      if (me) addBtn(me);
      for (const nm of uniqueAssigneeNames(list)) addBtn(nm);
      // "Someone else" - opens a small input sheet.
      const otherBtn = document.createElement('button');
      otherBtn.className = 'sort-option';
      otherBtn.textContent = t('assign_to_other');
      otherBtn.addEventListener('click', () => {
        close();
        openBulkAssignOtherSheet();
      });
      listEl.appendChild(otherBtn);
      // Issue #69: move N items to the end of the list.
      const moveEndBtn = sheet.querySelector('#bulk-move-end');
      moveEndBtn.textContent = t('bulk_move_to_end', n);
      moveEndBtn.addEventListener('click', () => {
        close();
        bulkMoveToEnd();
      });
      // Delete N items.
      const delBtn = sheet.querySelector('#bulk-delete');
      delBtn.textContent = t('bulk_delete', n);
      delBtn.addEventListener('click', () => {
        close();
        openBulkDeleteConfirmSheet(n);
      });
    });
  }

  function openBulkAssignOtherSheet() {
    openSheet('tpl-bulk-other-sheet', ({ sheet, close }) => {
      const input = sheet.querySelector('#bulk-other-input');
      setTimeout(() => input.focus(), 60);
      const confirm = () => {
        const name = input.value.trim();
        if (!name) return;
        close();
        bulkAssign(name);
      };
      sheet.querySelector('[data-confirm]').addEventListener('click', confirm);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); confirm(); } });
    });
  }

  function openBulkDeleteConfirmSheet(n) {
    openSheet('tpl-confirm-bulk-delete-sheet', ({ sheet, close }) => {
      sheet.querySelector('.confirm-title').textContent = t('confirm_bulk_delete_title', n);
      sheet.querySelector('[data-confirm]').textContent = t('bulk_delete', n);
      sheet.querySelector('[data-confirm]').addEventListener('click', () => { close(); bulkDelete(); });
    });
  }

  function openSortSheet() {
    openSheet('tpl-sort-sheet', ({ sheet, close }) => {
      const opts = sheet.querySelectorAll('.sort-option');
      opts.forEach(btn => {
        if (btn.dataset.sort === state.sort) btn.classList.add('active');
        btn.addEventListener('click', () => {
          state.sort = btn.dataset.sort;
          saveSort(state.sort);
          close();
          renderItems();
        });
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
  state.sort = loadSort();
  document.documentElement.lang = state.lang;
  window.addEventListener('hashchange', render);
  render();
})();
