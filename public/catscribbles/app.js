// ====================================================================
// CatScribbles (КошачьиЗакорючки) — совместная доска для рисования в реальном времени
// Архитектура:
//   • Yjs (CRDT) — общее состояние (штрихи, мета, ходы)
//   • Trystero 0.20.0 (supabase-стратегия: Realtime-каналы) — P2P-сигналинг
//   • Ручная реализация Yjs sync-протокола через makeAction (step1/step2/update)
//   • Awareness (курсоры, ник, цвет, live-штрих) через отдельный makeAction
//   • Supabase-таблица catscribbles_rooms — авто-persistence (заметка переживает закрытие)
// WebRTC-данные идут напрямую между пирами; сигналинг и хранение — на Supabase.
// ====================================================================

import * as Y from 'https://esm.sh/yjs@13.6.21';
// Сигналинг: supabase (Realtime-каналы) — надёжно, глобально, работает в Safari iOS.
// Решает peers:0 (публичные трекеры/nostr-реляции были нестабильны у части юзеров).
// Trystero supabase: createClient(appId=URL, supabaseKey). rtcConfig с TURN для NAT.
import { joinRoom, selfId } from 'https://esm.sh/trystero@0.20.0/supabase';
import QRCode from 'https://esm.sh/qrcode@1.5.4';

// ============ Константы ============
const APP_ID = 'raidopert.catscribbles.v1';
const MAX_PARTICIPANTS = 8;
const PALETTE = ['#00e5ff', '#ff2bd6', '#00ff88', '#ffb800', '#a78bff', '#ff5470', '#ff8a3d', '#ffffff'];
const USER_COLORS = ['#00e5ff', '#ff2bd6', '#00ff88', '#ffb800', '#a78bff', '#ff5470', '#00d4ff', '#ff8a3d'];
const ROOM_PREFIX = 'CS-';
// Supabase: Realtime (сигналинг) + таблица catscribbles_rooms (авто-persistence).
// Publishable-ключ безопасен для клиентского кода (как Firebase web-config);
// RLS таблицы разрешает anon только читать/писать строки комнат.
const SB_URL = 'https://gpwsnefhaiawoigqdnnr.supabase.co';
const SB_KEY = 'sb_publishable_edH7sk8jpGTBLDG9F4G8mA_2HCDsOR-';
const SB_TABLE = 'catscribbles_rooms';
const SB_REST = SB_URL + '/rest/v1/' + SB_TABLE;
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    // Бесплатный публичный TURN (OpenRelay by Metered) — критично для мобильных
    // за симметричным NAT: STUN--only не пробивает, data-channel не открывается.
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  ],
};

// ============ Утилиты ============
function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function genRoomCode() {
  // 6 символов из алфавита без похожих символов (без I,O,0,1) — ~617 млн комбинаций
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return ROOM_PREFIX + s;
}
function roomCodeToTopic(code) {
  return APP_ID + ':' + code.toUpperCase().replace(/[^A-Z0-9-]/g, '');
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

function showToast(msg, type = '', ms = 2400) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = type;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}

// ============ Состояние ============
const state = {
  ydoc: null,
  room: null,
  yStrokes: null,    // Y.Array<stroke>
  yMeta: null,       // Y.Map: { hostId, mode, currentTurn, turnOrder }
  roomId: null,
  roomCode: null,
  userId: selfId,    // Trystero selfId — уникальный в комнате
  nick: '',
  userColor: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
  isHost: false,
  tool: 'pen',
  color: '#00e5ff',
  size: 4,
  layer: 0,
  isDrawing: false,
  currentStroke: null,
  undoStack: [],
  redoStack: [],
  peers: 0,
  peerUserId: new Map(),    // peerId -> userId (из awareness)
  peerAwareness: new Map(), // peerId -> { id, nick, color, cursor, drawing, liveStroke }
  _cursor: null,
  _cursorThrottle: null,
  _awareThrottle: null,
  destroyed: false,
};

// DEBUG: экспонируем состояние для диагностики из консоли (временно)
window.__cs = state;

// ============ DOM ============
const landing = $('#landing');
const roomEl = $('#room');
const stage = $('#stage');
const mainCanvas = $('#canvas-main');
const liveCanvas = $('#canvas-live');
const mainCtx = mainCanvas.getContext('2d');
const liveCtx = liveCanvas.getContext('2d');

// ============ Лендинг: табы ============
$$('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    $('#pane-create').hidden = tab !== 'create';
    $('#pane-join').hidden = tab !== 'join';
    if (tab === 'join') $('#join-code').focus();
    else $('#create-nick').focus();
  });
});

// ============ Лендинг: создать / войти ============
$('#btn-create').addEventListener('click', () => {
  const nick = $('#create-nick').value.trim();
  state.nick = nick;
  const code = genRoomCode();
  state.isHost = true;
  enterRoom(code);
});

$('#btn-join').addEventListener('click', () => {
  let code = $('#join-code').value.trim().toUpperCase();
  const nick = $('#join-nick').value.trim();
  state.nick = nick;
  if (!code) { showToast('Введите код комнаты', 'error'); $('#join-code').focus(); return; }
  if (!code.startsWith(ROOM_PREFIX)) code = ROOM_PREFIX + code.replace(ROOM_PREFIX, '');
  enterRoom(code);
});

$('#join-code').addEventListener('input', e => {
  e.target.value = e.target.value.toUpperCase();
});
$('#join-code').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-join').click(); });
$('#create-nick').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-create').click(); });
$('#join-nick').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-join').click(); });

// Автовход по URL hash (#room=CS-XXXXXX)
(function autoJoinFromHash() {
  const m = location.hash.match(/room=([A-Z0-9-]+)/i);
  if (m) {
    let code = m[1].toUpperCase();
    if (!code.startsWith(ROOM_PREFIX)) code = ROOM_PREFIX + code.replace(ROOM_PREFIX, '');
    $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === 'join'));
    $('#pane-create').hidden = true;
    $('#pane-join').hidden = false;
    $('#join-code').value = code;
    setTimeout(() => $('#btn-join').click(), 250);
  }
})();

// ============ Недавние заметки (локальный список на лендинге) ============
const RECENT_KEY = 'cs_recent_v1';
function getRecentRooms() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; }
}
function addRecentRoom(code, nick) {
  if (!code) return;
  try {
    const list = getRecentRooms().filter(r => r.code !== code);
    list.unshift({ code, nick: nick || '', ts: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  } catch (e) {}
}
function fmtWhen(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'только что';
  if (s < 3600) return Math.floor(s / 60) + ' мин назад';
  if (s < 86400) return Math.floor(s / 3600) + ' ч назад';
  return Math.floor(s / 86400) + ' д назад';
}
function renderRecentRooms() {
  const wrap = $('#recent-rooms');
  const list = $('#recent-list');
  if (!wrap || !list) return;
  const items = getRecentRooms();
  if (items.length === 0) { wrap.hidden = true; return; }
  wrap.hidden = false;
  list.innerHTML = '';
  for (const r of items) {
    const el = document.createElement('div');
    el.className = 'recent-item';
    el.innerHTML =
      '<span class="ri-code">' + r.code + '</span>' +
      (r.nick ? '<span class="ri-nick" style="color:var(--text-mute);font-size:.8rem">' + r.nick + '</span>' : '') +
      '<span class="ri-when">' + fmtWhen(r.ts) + '</span>' +
      '<span class="ri-arrow">→</span>';
    el.addEventListener('click', () => {
      $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === 'join'));
      $('#pane-create').hidden = true;
      $('#pane-join').hidden = false;
      $('#join-code').value = r.code;
      $('#btn-join').click();
    });
    list.appendChild(el);
  }
}
renderRecentRooms();

// ============ Шеринг-модалка ============
const shareModal = $('#share-modal');

async function openShareModal() {
  const link = buildRoomLink();
  $('#share-code').textContent = state.roomCode;
  $('#share-link').textContent = link;
  const qrWrap = $('#qr-wrap');
  qrWrap.innerHTML = '';
  const hasDrawing = state.yStrokes && state.yStrokes.length > 0;
  // QR теряет читаемость на длинных ссылках (рисунок в hash). До ~1200 символов — рисуем.
  if (link.length > 1200) {
    qrWrap.textContent = 'Рисунок большой — QR не уместится. Скопируйте ссылку выше.';
    qrWrap.style.color = 'var(--text-mute)';
    qrWrap.style.fontSize = '.82rem';
    qrWrap.style.background = 'transparent';
    qrWrap.style.padding = '12px';
    qrWrap.style.textAlign = 'center';
  } else {
    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, link, { width: 200, margin: 1, color: { dark: '#0a0d12', light: '#ffffff' } });
      qrWrap.appendChild(canvas);
    } catch (e) {
      console.warn('QR generation failed', e);
      qrWrap.textContent = 'QR недоступен';
    }
  }
  const hint = document.getElementById('share-hint');
  if (hint) {
    hint.innerHTML = hasDrawing
      ? 'В ссылке уже зашит ваш рисунок — друг увидит его, <b>даже если вы уже закрыли приложение</b>. Если оба онлайн — рисуете вместе вживую.'
      : 'Покажите код или QR второму человеку. На телефоне QR удобно сканировать камерой.';
  }
  shareModal.classList.add('show');
}
function closeShareModal() { shareModal.classList.remove('show'); }

$('#share-close').addEventListener('click', closeShareModal);
shareModal.addEventListener('click', e => { if (e.target === shareModal) closeShareModal(); });

$$('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const target = $('#' + btn.dataset.copy);
    const ok = await copyText(target.textContent);
    if (ok) { showToast('Скопировано', 'success', 1200); btn.textContent = '✓'; setTimeout(() => btn.textContent = 'Копир.', 1000); }
    else showToast('Не удалось скопировать', 'error');
  });
});

function buildRoomLink() {
  // Гарантируем, что в hash лежит свежий snapshot (если есть штрихи) —
  // тогда скопированная ссылка несёт рисунок как «заметку».
  updateHashWithSnapshot();
  return location.origin + location.pathname + location.hash;
}

// ============ Persistence: рисунок живёт в URL hash ============
// В чистом P2P нет сервера, поэтому «заметка для того, кто откроет ссылку позже»
// кодируется прямо в hash: #room=CS-XXXXXX&d=<base64url(Y.encodeStateAsUpdate)>.
// Это ФОЛБЭК: когда Supabase-таблица жива (db:ok), рисунок хранится на сервере и
// ссылка остаётся короткой. Live-синхрон (Realtime) работает поверх, когда оба онлайн.
function bytesToB64Url(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64UrlToBytes(str) {
  let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
function encodeSnapshot() {
  try {
    if (!state.ydoc) return '';
    const u = Y.encodeStateAsUpdate(state.ydoc);
    return bytesToB64Url(u);
  } catch (e) { console.warn('encodeSnapshot', e); return ''; }
}
function applySnapshot(b64) {
  try {
    if (!state.ydoc || !b64) return false;
    const u = b64UrlToBytes(b64);
    if (!u || u.length < 2) return false;
    // origin 'snapshot' (не 'remote') → локальный update-хендлер рассылит его
    // уже подключённым пирам, а observe(onStrokesChange) перерисует холст.
    Y.applyUpdate(state.ydoc, u, 'snapshot');
    return true;
  } catch (e) { console.warn('applySnapshot', e); return false; }
}
function readSnapshotFromHash() {
  const m = location.hash.match(/[?&]d=([^&]+)/) || location.hash.match(/\bd=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}
// ============ Supabase persistence (авто-сохранение рисунка в БД) ============
// publishable-ключ = роль anon; RLS таблицы разрешает читать/писать строки комнат.
// Если таблицы/RLS нет — save/load тихо падает, фолбэком остаётся URL-hash (d=).
state.persistStats = { load: 'pending', save: 'pending', lastErr: '', dirty: false };
const SB_HDR = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };

async function sbLoadState(roomId) {
  try {
    const r = await fetch(`${SB_REST}?room_id=eq.${encodeURIComponent(roomId)}&select=state&limit=1`, { headers: SB_HDR });
    if (!r.ok) { state.persistStats.lastErr = 'load ' + r.status; return null; }
    const arr = await r.json();
    state.persistStats.load = arr && arr[0] && arr[0].state ? 'ok' : 'empty';
    return (arr && arr[0] && arr[0].state) ? arr[0].state : null;
  } catch (e) { state.persistStats.lastErr = 'load ' + e.message; return null; }
}
async function sbSaveState(roomId, b64, { keepalive = false } = {}) {
  try {
    const r = await fetch(SB_REST + '?on_conflict=room_id', {
      method: 'POST',
      headers: { ...SB_HDR, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ room_id: roomId, state: b64, updated_at: new Date().toISOString() }),
      keepalive,
    });
    state.persistStats.save = r.ok ? 'ok' : 'err' + r.status;
    if (r.ok) state.persistStats.dirty = false;   // изменения сброшены в БД
    else state.persistStats.lastErr = 'save ' + r.status;
    updateHashWithSnapshot();   // переоценить hash: убрать d= когда db:ok (ссылка станет короткой)
    updateSaveIndicator();      // точка: зелёная (saved) / красная (err)
    return r.ok;
  } catch (e) {
    state.persistStats.save = 'err';
    state.persistStats.lastErr = 'save ' + e.message;
    updateSaveIndicator();
    return false;
  }
}

let _persistTimer = null;
let _reconnectTimer = null;   // grace-таймер «Переподключение…» (12с) при потере пиров
function schedulePersist() {
  if (_persistTimer) clearTimeout(_persistTimer);
  _persistTimer = setTimeout(persistNow, 1500);
}
function persistNow() {
  if (!state.ydoc || state.destroyed || !state.roomId) return;
  updateHashWithSnapshot();                 // 1) URL-hash (фолбэк + share-link несёт рисунок)
  const strokes = state.yStrokes ? state.yStrokes.length : 0;
  if (strokes > 0) {                        // 2) Supabase-таблица (авто-persistence)
    const snap = encodeSnapshot();
    if (snap) sbSaveState(state.roomId, snap);
  }
}
// Флаш при закрытии вкладки: keepalive-запрос переживает unload — заметка сохранится.
function flushPersistOnExit() {
  if (!state.ydoc || state.destroyed || !state.roomId) return;
  const strokes = state.yStrokes ? state.yStrokes.length : 0;
  if (strokes > 0) {
    const snap = encodeSnapshot();
    if (snap) sbSaveState(state.roomId, snap, { keepalive: true });
  }
}
// Индикатор несохранённых изменений: точка на room-badge.
//   зелёная — сохранено на сервере (db:ok, нет pending-изменений)
//   янтарная (пульс) — изменения ждут сброса в БД (debounce 1.5с / идёт запрос)
//   красная — последний save упал (данные всё равно в URL-ссылке — фолбэк)
function markDirty() {
  if (!state.persistStats) return;
  state.persistStats.dirty = true;
  updateSaveIndicator();
}
function updateSaveIndicator() {
  const badge = $('#room-badge');
  if (!badge) return;
  const ps = state.persistStats || {};
  badge.classList.remove('saving', 'err');
  const saveErr = typeof ps.save === 'string' && ps.save.startsWith('err');
  if (saveErr) {
    badge.classList.add('err');
    badge.title = 'Не сохранено на сервер — рисунок в ссылке (фолбэк). Нажмите «Сохранить».';
  } else if (ps.dirty) {
    badge.classList.add('saving');
    badge.title = 'Сохранение…';
  } else {
    badge.title = 'Сохранено. Нажмите, чтобы поделиться.';
  }
}
// Явное сохранение заметки по кнопке в topbar. Даёт пользователю уверенность
// (toast), что рисунок сохранён на сервере (db:ok) либо в ссылке (фолбэк).
async function saveNote() {
  if (!state.ydoc || state.destroyed || !state.roomId) return;
  const strokes = state.yStrokes ? state.yStrokes.length : 0;
  if (strokes === 0) { showToast('Пусто — нечего сохранять', '', 1600); return; }
  showToast('Сохраняю…', '', 1400);
  updateHashWithSnapshot();
  const snap = encodeSnapshot();
  if (!snap) { showToast('Не удалось сохранить', 'error', 2000); return; }
  const ok = await sbSaveState(state.roomId, snap);
  if (ok) showToast('Заметка сохранена ✓', 'success', 1900);
  else showToast('Сохранено в ссылке', '', 2000);
}
function updateHashWithSnapshot() {
  if (!state.ydoc || state.destroyed || !state.roomCode) return;
  const strokes = state.yStrokes ? state.yStrokes.length : 0;
  let hash = 'room=' + encodeURIComponent(state.roomCode);
  // d= (рисунок в ссылке) — только как ФОЛБЭК, когда Supabase не сохраняет.
  // Если БД жива (save=ok) — ссылка остаётся короткой (#room=CS-XXXXXX), а рисунок
  // подгружается с сервера при открытии. Так QR/ссылка не разбухают.
  const dbOk = state.persistStats && state.persistStats.save === 'ok';
  if (strokes > 0 && !dbOk) {
    const snap = encodeSnapshot();
    if (snap) hash += '&d=' + snap;
  }
  const cur = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
  if (cur !== hash) {
    history.replaceState(null, '', '#' + hash);
  }
}

// ============ Вход в комнату ============
async function enterRoom(code) {
  state.roomCode = code;
  state.roomId = roomCodeToTopic(code);

  // 1) Yjs-документ
  const ydoc = new Y.Doc();
  state.ydoc = ydoc;
  state.yStrokes = ydoc.getArray('strokes');
  state.yMeta = ydoc.getMap('meta');

  // 2) Trystero-комната (supabase-стратегия: Realtime-каналы + STUN/TURN).
  //    appId здесь = URL Supabase (особенность стратегии), supabaseKey = publishable.
  let room;
  try {
    room = joinRoom({ appId: SB_URL, supabaseKey: SB_KEY, rtcConfig: RTC_CONFIG }, state.roomId);
    state.room = room;
  } catch (e) {
    console.error('Trystero init failed', e);
    showToast('Не удалось инициализировать P2P. Обновите страницу.', 'error', 4000);
    return;
  }

  // 3) Ручной Yjs sync-протокол через 3 makeAction (бинарные Uint8Array)
  const yjsSync = setupYjsSync(ydoc, room);

  // 4) Awareness (JSON: ник, цвет, курсор, live-штрих)
  setupAwareness(room);

  // 5) Инициализация меты: создатель — хост
  if (state.isHost) {
    ydoc.transact(() => {
      state.yMeta.set('hostId', state.userId);
      state.yMeta.set('mode', 'simultaneous');
      state.yMeta.set('currentTurn', state.userId);
      state.yMeta.set('turnOrder', [state.userId]);
    });
  }

  // 6) Реакции на изменения общего состояния
  state.yStrokes.observe(onStrokesChange);
  state.yMeta.observe(onMetaChange);

  // 7) События пиров Trystero (ВАЖНО: onPeerJoin/onPeerLeave заменяют обработчик,
  //    поэтому регистрируем ОДИН раз — объединяем счётчик, awareness и Yjs sync)
  room.onPeerJoin((peerId) => {
    state.peers++;
    if (state.reconnecting) {            // обрыв → связь восстановлена
      state.reconnecting = false;
      if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
      showToast('Связь восстановлена', 'success', 1600);
    }
    state.hadPeers = true;
    updateConnStatus();
    pushAwareness();
    // Yjs sync: отправляем новому пиру свой state vector
    yjsSync.sendStep1(peerId);
  });
  room.onPeerLeave((peerId) => {
    state.peers = Math.max(0, state.peers - 1);
    const leftUserId = state.peerUserId.get(peerId);
    state.peerAwareness.delete(peerId);
    state.peerUserId.delete(peerId);
    // Все пиры ушли, но раньше были → возможно обрыв связи (Trystero ретраит подписку).
    if (state.peers === 0 && state.hadPeers && !state.reconnecting) {
      state.reconnecting = true;
      updateConnStatus();
      if (_reconnectTimer) clearTimeout(_reconnectTimer);
      _reconnectTimer = setTimeout(() => {
        state.reconnecting = false;
        _reconnectTimer = null;
        updateConnStatus();
      }, 12000);
    } else {
      updateConnStatus();
    }
    updateParticipants();
    redrawOverlay();
    if (leftUserId && state.yMeta.get('hostId') === leftUserId) {
      migrateHost();
    }
  });

  // 8) UI
  landing.style.display = 'none';
  roomEl.classList.add('active');
  $('#room-code-display').textContent = code;
  addRecentRoom(code, state.nick);   // запомнить в локальном списке «Недавние»

  initCanvas();
  // Восстановить рисунок. Сначала из URL-hash (мгновенно, локально) — чтобы тот,
  // кто открыл ссылку позже, сразу увидел «заметку». Затем асинхронно из Supabase
  // (актуальнее — может быть новее, если кто-то дорисовал после создания ссылки).
  // Yjs-merge по client/clock: повторное применение не дублирует штрихи.
  const _snap = readSnapshotFromHash();
  if (_snap) applySnapshot(_snap);
  // Авто-persistence: загрузить последнее сохранённое состояние комнаты из БД.
  (async () => {
    const dbState = await sbLoadState(state.roomId);
    if (dbState) {
      applySnapshot(dbState);
      updateEmptyHint();
    }
  })();
  // Флаш при закрытии вкладки — чтобы «заметка» точно сохранилась.
  window.addEventListener('beforeunload', flushPersistOnExit, { once: false });
  buildSwatches();
  setupToolbar();
  setupTopbar();
  updateModeUI();
  updateConnStatus();
  updateParticipants();   // показать свой аватар сразу
  updateSaveIndicator();  // точка сохранения: стартовое состояние
  showOnboarding();       // разовый онбординг (один раз на браузер)
  pushAwareness();
  refreshHostUI();
  updateHashWithSnapshot();   // зафиксировать base-hash (room=…, без d если пусто)
  updateEmptyHint();          // подсказка на пустом холсте

  // Debug-бар: только по ?debug (по умолчанию скрыт для чистого вида)
  if (new URLSearchParams(location.search).has('debug')) {
    document.getElementById('debug-bar').classList.add('show');
  }
  startDebugBar();

  // Если создатель — сразу показать шеринг-модалку
  if (state.isHost) {
    setTimeout(openShareModal, 400);
  }

  // Resize
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 250));

  console.log('[CatScribbles] room joined', state.roomCode, 'as', state.userId.slice(0, 8));
}

// ============ Yjs sync: ручная реализация стандартного протокола ============
// Три бинарных действия (Uint8Array):
//   • yjs-step1: state vector — отправляем новому пиру, чтобы он знал что у нас есть
//   • yjs-step2: state update (diff) — ответ на step1, применяем у получателя
//   • yjs-update: инкрементальный update — рассылаем при локальном изменении
// Возвращает { sendStep1(peerId) } — вызвать при onPeerJoin.
function setupYjsSync(ydoc, room) {
  const [sendStep1, onStep1] = room.makeAction('yjs-step1');
  const [sendStep2, onStep2] = room.makeAction('yjs-step2');
  const [sendUpdate, onUpdate] = room.makeAction('yjs-update');

  // Счётчики для диагностики (видны в debug-баре через window.__cs.syncStats)
  const stats = { step1Sent: 0, step1Recv: 0, step2Sent: 0, step2Recv: 0, updateSent: 0, updateRecv: 0, applyOk: 0, applyFail: 0, lastErr: '' };
  state.syncStats = stats;

  // Защитное приведение к Uint8Array: Trystero и так доставляет Uint8Array для
  // бинарных makeAction, но на всякий случай (ArrayBuffer / view со сдвигом).
  const toU8 = (d) => {
    if (d instanceof Uint8Array) return d;
    if (d instanceof ArrayBuffer) return new Uint8Array(d);
    if (d && d.buffer instanceof ArrayBuffer) return new Uint8Array(d.buffer, d.byteOffset || 0, d.byteLength);
    return new Uint8Array(d);
  };

  // Получили state vector от пира — отвечаем diff'ом нашего состояния
  onStep1((vector, peerId) => {
    stats.step1Recv++;
    try {
      const update = Y.encodeStateAsUpdate(ydoc, toU8(vector));
      if (update.byteLength > 2) { sendStep2(update, peerId); stats.step2Sent++; }
    } catch (e) { stats.lastErr = 'step1:' + e.message; console.warn('step2 send failed', e); }
  });

  // Получили state update — применяем
  onStep2((update, peerId) => {
    stats.step2Recv++;
    try { Y.applyUpdate(ydoc, toU8(update), 'remote'); stats.applyOk++; }
    catch (e) { stats.applyFail++; stats.lastErr = 'step2:' + e.message; console.warn('step2 apply failed', e); }
  });

  // Локальное изменение — рассылаем инкрементальный update всем
  ydoc.on('update', (update, origin) => {
    if (origin === 'remote') return;
    try { sendUpdate(toU8(update), null); stats.updateSent++; } catch (e) { /* peer might be gone */ }
  });

  // Получили инкрементальный update — применяем
  onUpdate((update, peerId) => {
    stats.updateRecv++;
    try { Y.applyUpdate(ydoc, toU8(update), 'remote'); stats.applyOk++; }
    catch (e) { stats.applyFail++; stats.lastErr = 'update:' + e.message; console.warn('update apply failed', e); }
  });

  return {
    sendStep1: (peerId) => {
      try {
        const vector = Y.encodeStateVector(ydoc);
        sendStep1(vector, peerId);
        stats.step1Sent++;
      } catch (e) { stats.lastErr = 'sendStep1:' + e.message; console.warn('step1 send failed', e); }
    },
  };
}

// ============ Awareness (курсоры, ник, цвет, live-штрих) ============
let sendAware = null, onAware = null;

function setupAwareness(room) {
  [sendAware, onAware] = room.makeAction('aware');
  onAware((data, peerId) => {
    if (!data || !data.id) return;
    state.peerAwareness.set(peerId, data);
    state.peerUserId.set(peerId, data.id);
    updateParticipants();
    redrawOverlay();
  });
}

function pushAwareness(extra = {}) {
  if (!sendAware) return;
  const payload = {
    id: state.userId,
    nick: state.nick || ('user-' + state.userId.slice(0, 4)),
    color: state.userColor,
    cursor: state._cursor || null,
    drawing: state.isDrawing,
    liveStroke: state.isDrawing ? state.currentStroke : null,
    ...extra,
  };
  try { sendAware(payload, null); } catch (e) { /* ignore */ }
}

// Throttled awareness push для курсора (30 Гц)
function pushCursorAwareness() {
  if (state._awareThrottle) return;
  state._awareThrottle = setTimeout(() => {
    state._awareThrottle = null;
    pushAwareness();
  }, 33);
}

// ============ Метаданные: хост, режим, ходы ============
function migrateHost() {
  const order = state.yMeta.get('turnOrder') || [];
  const present = order.filter(id => isUserPresent(id));
  if (present.length === 0) return;
  const newHost = present[0];
  if (newHost === state.userId) {
    state.ydoc.transact(() => {
      state.yMeta.set('hostId', newHost);
      const cur = state.yMeta.get('currentTurn');
      if (state.yMeta.get('mode') === 'turns' && !isUserPresent(cur)) {
        state.yMeta.set('currentTurn', newHost);
      }
    });
    state.isHost = true;
    showToast('Вы стали хостом', '', 2000);
    refreshHostUI();
  }
}

function isUserPresent(userId) {
  if (userId === state.userId) return true;
  for (const [, a] of state.peerAwareness) if (a.id === userId) return true;
  return false;
}

function onMetaChange() {
  const hostId = state.yMeta.get('hostId');
  state.isHost = hostId === state.userId;
  refreshHostUI();
  updateModeUI();
}

function refreshHostUI() {
  $('#btn-mode').hidden = !state.isHost;
  $('#btn-clear').disabled = !state.isHost;
  const mode = state.yMeta.get('mode');
  const myTurn = state.yMeta.get('currentTurn') === state.userId;
  $('#btn-next').hidden = !(state.isHost && mode === 'turns' && myTurn);
}

function updateModeUI() {
  const mode = state.yMeta.get('mode') || 'simultaneous';
  const currentTurn = state.yMeta.get('currentTurn');
  const ind = $('#turn-indicator');
  const txt = $('#turn-text');
  ind.classList.remove('waiting', 'you');
  if (mode === 'simultaneous') {
    const online = 1 + state.peers; // вы + пиры
    txt.textContent = 'Рисуем вместе · ' + online + ' онлайн';
    ind.classList.add('you');
    $('#lock-overlay').classList.remove('show');
  } else {
    const myTurn = currentTurn === state.userId;
    const turnPeer = findPeerById(currentTurn);
    const name = turnPeer ? turnPeer.nick : '—';
    if (myTurn) {
      txt.textContent = 'Ваш ход';
      ind.classList.add('you');
      $('#lock-overlay').classList.remove('show');
    } else {
      txt.textContent = 'Ход: ' + name;
      ind.classList.add('waiting');
      $('#lock-overlay').classList.add('show');
    }
  }
  refreshHostUI();
}

function findPeerById(id) {
  if (id === state.userId) {
    return { id, nick: state.nick || ('user-' + state.userId.slice(0, 4)), color: state.userColor };
  }
  for (const [, a] of state.peerAwareness) if (a.id === id) return a;
  return null;
}

// ============ Topbar ============
// Онбординг: разовая карточка «как пользоваться» (один раз на браузер).
function showOnboarding() {
  try { if (localStorage.getItem('cs_onboarded_v1')) return; } catch(e){}
  const card = document.createElement('div');
  card.id = 'onboard';
  card.innerHTML =
    '<div class="ob-emoji">👋</div>' +
    '<div class="ob-title">Как пользоваться</div>' +
    '<ol class="ob-steps">' +
    '<li><b>Рисуйте</b> на холсте пальцем или мышью.</li>' +
    '<li>Нажмите <b>«Сохранить»</b> — заметка уйдёт на сервер (или сохранится сама).</li>' +
    '<li>Отправьте <b>ссылку</b> другу: он откроет её позже и увидит вашу заметку.</li>' +
    '</ol>' +
    '<button class="btn btn-primary ob-ok">Понятно</button>';
  document.body.appendChild(card);
  const dismiss = () => {
    try { localStorage.setItem('cs_onboarded_v1', '1'); } catch(e){}
    if (card.parentNode) card.remove();
    state._onboardDismiss = null;
  };
  state._onboardDismiss = dismiss;
  card.querySelector('.ob-ok').addEventListener('click', dismiss);
}
function setupTopbar() {
  $('#room-badge').addEventListener('click', openShareModal);
  $('#btn-share').addEventListener('click', openShareModal);
  $('#btn-save').addEventListener('click', saveNote);
  $('#btn-leave').addEventListener('click', leaveRoom);
  $('#btn-mode').addEventListener('click', toggleMode);
  $('#btn-next').addEventListener('click', passTurn);
}

function toggleMode() {
  if (!state.isHost) return;
  const cur = state.yMeta.get('mode') || 'simultaneous';
  const next = cur === 'simultaneous' ? 'turns' : 'simultaneous';
  state.ydoc.transact(() => {
    state.yMeta.set('mode', next);
    if (next === 'turns') state.yMeta.set('currentTurn', state.userId);
  });
  showToast(next === 'simultaneous' ? 'Режим: одновременно' : 'Режим: по очереди', '', 1500);
}

function passTurn() {
  if (!state.isHost) return;
  const order = state.yMeta.get('turnOrder') || [state.userId];
  const present = order.filter(id => isUserPresent(id));
  if (present.length < 2) { showToast('Нет других игроков', 'error', 1500); return; }
  const cur = state.yMeta.get('currentTurn');
  const idx = present.indexOf(cur);
  const next = present[(idx + 1) % present.length];
  state.yMeta.set('currentTurn', next);
}

function leaveRoom() {
  if (!confirm('Выйти из комнаты? Рисунок останется у других участников.')) return;
  destroyRoom();
  location.hash = '';
  location.reload();
}

function destroyRoom() {
  state.destroyed = true;
  try { if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; } } catch(e){}
  state.reconnecting = false;
  state.hadPeers = false;
  try { window.removeEventListener('beforeunload', flushPersistOnExit); } catch(e){}
  try { if (state.ydoc && state.yStrokes && state.yStrokes.length > 0) {
    const snap = encodeSnapshot();
    if (snap) sbSaveState(state.roomId, snap, { keepalive: true }); // флаш заметки при выходе
  }} catch(e){}
  try { state.yStrokes && state.yStrokes.unobserve(onStrokesChange); } catch(e){}
  try { state.yMeta && state.yMeta.unobserve(onMetaChange); } catch(e){}
  try { state.room && state.room.leave(); } catch(e){}
  try { state.ydoc && state.ydoc.destroy(); } catch(e){}
}

// ============ Участники ============
function updateParticipants() {
  const wrap = $('#participants');
  wrap.innerHTML = '';
  const hostId = state.yMeta && state.yMeta.get('hostId');
  const all = [
    { id: state.userId, nick: state.nick || ('user-' + state.userId.slice(0, 4)), color: state.userColor },
    ...Array.from(state.peerAwareness.values()),
  ];
  const seen = new Set();
  const unique = all.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
  for (const p of unique.slice(0, MAX_PARTICIPANTS)) {
    const av = document.createElement('div');
    av.className = 'avatar' + (p.id === hostId ? ' host' : '');
    av.style.background = p.color;
    av.textContent = (p.nick || '?').slice(0, 1).toUpperCase();
    av.title = p.nick + (p.id === hostId ? ' (хост)' : '');
    wrap.appendChild(av);
  }
  if (unique.length > MAX_PARTICIPANTS) {
    const extra = document.createElement('div');
    extra.className = 'avatar';
    extra.style.background = 'var(--bg-3)';
    extra.style.color = 'var(--text-mute)';
    extra.textContent = '+' + (unique.length - MAX_PARTICIPANTS);
    wrap.appendChild(extra);
  }
}

// ============ Статус подключения ============
function updateConnStatus() {
  const el = $('#conn-status');
  const txt = $('#conn-text');
  el.classList.remove('connecting', 'online', 'error', 'reconnecting');
  if (state.peers === 0) {
    if (state.reconnecting) {
      el.classList.add('reconnecting');
      txt.textContent = 'Переподключение…';
    } else if (state.hadPeers) {
      // пиры были, но не вернулись за 12с — успокаиваем: данные сохранены
      el.classList.add('connecting');
      txt.textContent = 'Один в комнате · рисунок сохранён';
    } else {
      el.classList.add('connecting');
      txt.textContent = 'Один в комнате · рисуйте и отправьте ссылку';
    }
  } else {
    el.classList.add('online');
    txt.textContent = state.peers + (state.peers === 1 ? ' игрок рядом' : ' игрока рядом');
  }
}

// Подсказка на пустом холсте: что делать дальше (особенно когда один).
function updateEmptyHint() {
  const el = document.getElementById('empty-hint');
  if (!el) return;
  const n = state.yStrokes ? state.yStrokes.length : 0;
  el.classList.toggle('show', n === 0);
}

// ============ Холст ============
let dpr = 1;
let canvasW = 0, canvasH = 0;

function initCanvas() {
  onResize();
  liveCanvas.style.pointerEvents = 'none';
  mainCanvas.style.pointerEvents = 'none';
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointerleave', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  stage.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  stage.style.touchAction = 'none';
  redrawMain();
  redrawOverlay();
}

function onResize() {
  dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = stage.getBoundingClientRect();
  canvasW = rect.width;
  canvasH = rect.height;
  for (const c of [mainCanvas, liveCanvas]) {
    c.width = Math.floor(canvasW * dpr);
    c.height = Math.floor(canvasH * dpr);
    c.style.width = canvasW + 'px';
    c.style.height = canvasH + 'px';
  }
  mainCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  liveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawMain();
  redrawOverlay();
}

function pointerCoord(e) {
  const rect = stage.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}

function canDrawNow() {
  const mode = state.yMeta.get('mode') || 'simultaneous';
  if (mode === 'simultaneous') return true;
  return state.yMeta.get('currentTurn') === state.userId;
}

// ============ Рисование ============
function onPointerDown(e) {
  if (state.destroyed) return;
  if (!canDrawNow()) { showToast('Не ваш ход', 'error', 1200); return; }
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const [x, y] = pointerCoord(e);
  state._cursor = [x, y];

  if (state.tool === 'text') {
    spawnTextInput(x, y);
    return;
  }

  state.isDrawing = true;
  state.redoStack = [];
  state.currentStroke = {
    id: uuid(),
    tool: state.tool,
    color: state.color,
    size: state.size,
    layer: state.layer,
    author: state.userId,
    authorColor: state.userColor,
    points: [[x, y]],
    ts: Date.now(),
  };
  try { stage.setPointerCapture(e.pointerId); } catch(_) {}
  pushAwareness();
  redrawOverlay();
}

function onPointerMove(e) {
  const [x, y] = pointerCoord(e);
  state._cursor = [x, y];
  if (state.isDrawing && state.currentStroke) {
    const pts = state.currentStroke.points;
    const last = pts[pts.length - 1];
    if (Math.hypot(x - last[0], y - last[1]) > 1.2) {
      pts.push([x, y]);
      pushCursorAwareness();
      redrawOverlay();
    }
  } else {
    pushCursorAwareness();
  }
}

function onPointerUp(e) {
  if (!state.isDrawing) return;
  try { stage.releasePointerCapture(e.pointerId); } catch(_) {}
  const stroke = state.currentStroke;
  state.isDrawing = false;
  state.currentStroke = null;

  if (stroke && stroke.points.length > 0) {
    state.yStrokes.push([stroke]);
    state.undoStack.push(stroke.id);
    updateUndoRedoUI();
  }
  pushAwareness();
  redrawOverlay();
}

// ============ Текстовый инструмент ============
function spawnTextInput(x, y) {
  const old = stage.querySelector('.text-input');
  if (old) old.remove();
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'text-input';
  input.placeholder = 'Текст…';
  input.style.left = x + 'px';
  input.style.top = (y - 14) + 'px';
  const fontSize = clamp(state.size * 3, 14, 72);
  input.style.fontSize = fontSize + 'px';
  input.style.color = state.color;
  input.style.borderColor = state.color;
  stage.appendChild(input);
  setTimeout(() => input.focus(), 10);

  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    const text = input.value.trim();
    // Убираем обработчики перед remove, чтобы blur не вызвал повторный commit
    input.onblur = null;
    input.remove();
    if (!text) return;
    const stroke = {
      id: uuid(),
      tool: 'text',
      color: state.color,
      size: state.size,
      layer: state.layer,
      author: state.userId,
      authorColor: state.userColor,
      points: [[x, y]],
      text,
      ts: Date.now(),
    };
    state.yStrokes.push([stroke]);
    state.undoStack.push(stroke.id);
    updateUndoRedoUI();
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') input.remove();
  });
  input.addEventListener('blur', commit);
}

// ============ Отрисовка ============
function onStrokesChange() {
  redrawMain(); schedulePersist(); updateEmptyHint();
  markDirty();   // индикатор: есть несохранённые изменения
  if (state._onboardDismiss) state._onboardDismiss(); // первый штрих → скрыть онбординг
}

function redrawMain() {
  if (state.destroyed) return;
  mainCtx.clearRect(0, 0, canvasW, canvasH);
  const arr = state.yStrokes.toArray();
  arr.sort((a, b) => (a.layer || 0) - (b.layer || 0) || (a.ts || 0) - (b.ts || 0));
  for (const s of arr) drawStroke(mainCtx, s);
}

function redrawOverlay() {
  if (state.destroyed) return;
  liveCtx.clearRect(0, 0, canvasW, canvasH);
  if (state.isDrawing && state.currentStroke) {
    drawStroke(liveCtx, state.currentStroke);
  }
  for (const [, a] of state.peerAwareness) {
    if (a.drawing && a.liveStroke) {
      drawStroke(liveCtx, a.liveStroke, a.color);
    }
  }
  for (const [, a] of state.peerAwareness) {
    if (a.cursor) {
      drawCursor(liveCtx, a.cursor[0], a.cursor[1], a.color, a.nick, a.drawing);
    }
  }
}

function drawStroke(ctx, s, overrideColor) {
  if (!s || !s.points) return;
  ctx.save();
  if (s.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = overrideColor || s.color;
    ctx.fillStyle = overrideColor || s.color;
  }
  ctx.lineWidth = s.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (s.tool === 'text' && s.text) {
    const fontSize = clamp(s.size * 3, 14, 72);
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(s.text, s.points[0][0], s.points[0][1]);
  } else if (s.points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(s.points[0][0], s.points[0][1]);
    for (let i = 1; i < s.points.length - 1; i++) {
      const [x, y] = s.points[i];
      const [nx, ny] = s.points[i + 1];
      const mx = (x + nx) / 2, my = (y + ny) / 2;
      ctx.quadraticCurveTo(x, y, mx, my);
    }
    const last = s.points[s.points.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
  } else if (s.points.length === 1) {
    ctx.beginPath();
    ctx.arc(s.points[0][0], s.points[0][1], Math.max(0.5, s.size / 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCursor(ctx, x, y, color, nick, drawing) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, drawing ? 6 : 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (nick) {
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    const label = nick.slice(0, 14);
    const w = ctx.measureText(label).width + 10;
    let lx = x + 10, ly = y - 18;
    if (lx + w > canvasW) lx = x - w - 10;
    if (ly < 4) ly = y + 14;
    ctx.fillStyle = 'rgba(10,13,18,.78)';
    ctx.fillRect(lx, ly, w, 18);
    ctx.fillStyle = color;
    ctx.fillText(label, lx + 5, ly + 13);
  }
  ctx.restore();
}

// ============ Тулбар ============
function setupToolbar() {
  $$('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.tool = btn.dataset.tool;
    });
  });
  $('#color-input').addEventListener('input', e => {
    state.color = e.target.value;
    syncSwatchActive();
  });
  const range = $('#size-range');
  const dot = $('#size-dot');
  range.addEventListener('input', e => {
    state.size = parseInt(e.target.value, 10);
    const v = clamp(state.size, 3, 24);
    dot.style.width = v + 'px';
    dot.style.height = v + 'px';
  });
  $('#layer-select').addEventListener('change', e => {
    state.layer = parseInt(e.target.value, 10);
  });
  $('#btn-undo').addEventListener('click', undo);
  $('#btn-redo').addEventListener('click', redo);
  $('#btn-clear').addEventListener('click', clearCanvas);
  $('#btn-download').addEventListener('click', downloadPNG);
  $('#btn-svg').addEventListener('click', downloadSVG);
  // «⋯ Ещё» — поповер с редкими действиями (undo/redo/download/clear/слой)
  const moreMenu = $('#more-menu');
  const moreBtn = $('#btn-more');
  if (moreMenu && moreBtn) {
    moreBtn.addEventListener('click', e => { e.stopPropagation(); moreMenu.classList.toggle('show'); });
    document.addEventListener('pointerdown', e => {
      if (!moreMenu.contains(e.target) && e.target !== moreBtn) moreMenu.classList.remove('show');
    });
    // Действия внутри меню закрывают его
    moreMenu.querySelectorAll('button, select').forEach(el =>
      el.addEventListener('pointerdown', () => { setTimeout(() => moreMenu.classList.remove('show'), 60); }));
  }
}

function buildSwatches() {
  const wrap = $('#swatches');
  wrap.innerHTML = '';
  for (const c of PALETTE) {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.background = c;
    b.style.color = c;
    b.dataset.color = c;
    b.title = c;
    if (c === state.color) b.classList.add('active');
    b.addEventListener('click', () => {
      state.color = c;
      $('#color-input').value = c;
      syncSwatchActive();
    });
    wrap.appendChild(b);
  }
}

function syncSwatchActive() {
  $$('.swatch').forEach(s => s.classList.toggle('active', s.dataset.color === state.color));
}

function updateUndoRedoUI() {
  $('#btn-undo').disabled = state.undoStack.length === 0;
  $('#btn-redo').disabled = state.redoStack.length === 0;
}

// ============ Undo / Redo / Clear ============
function undo() {
  if (state.undoStack.length === 0) return;
  const id = state.undoStack.pop();
  const arr = state.yStrokes.toArray();
  let idx = -1;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].id === id) { idx = i; break; }
  }
  if (idx === -1) { updateUndoRedoUI(); return; }
  const removed = arr[idx];
  state.ydoc.transact(() => { state.yStrokes.delete(idx, 1); });
  state.redoStack.push(removed);
  updateUndoRedoUI();
}

function redo() {
  if (state.redoStack.length === 0) return;
  const stroke = state.redoStack.pop();
  stroke.id = uuid();
  state.yStrokes.push([stroke]);
  state.undoStack.push(stroke.id);
  updateUndoRedoUI();
}

function clearCanvas() {
  if (!state.isHost) { showToast('Только хост может очистить холст', 'error'); return; }
  if (!confirm('Очистить холст для всех участников?')) return;
  state.ydoc.transact(() => {
    state.yStrokes.delete(0, state.yStrokes.length);
  });
  state.undoStack = [];
  state.redoStack = [];
  updateUndoRedoUI();
  showToast('Холст очищен', 'success', 1500);
}

function downloadPNG() {
  const out = document.createElement('canvas');
  out.width = mainCanvas.width;
  out.height = mainCanvas.height;
  const octx = out.getContext('2d');
  octx.fillStyle = '#11161f';
  octx.fillRect(0, 0, out.width, out.height);
  octx.drawImage(mainCanvas, 0, 0);
  const link = document.createElement('a');
  link.download = `catscribbles-${state.roomCode}-${Date.now()}.png`;
  link.href = out.toDataURL('image/png');
  link.click();
  showToast('Скачано', 'success', 1200);
}
// Экспорт векторного SVG: pen-штрихи → <path> (квадратичные кривые), text → <text>.
// Ластик пропускается (в векторе он не имеет смысла; для точного растра есть PNG).
function strokeToPath(s) {
  const p = s.points;
  if (!p || p.length === 0) return '';
  if (p.length === 1) return `M${p[0][0]} ${p[0][1]} l0.01 0`;
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const [x, y] = p[i], [nx, ny] = p[i + 1];
    d += ` Q${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`;
  }
  const last = p[p.length - 1];
  d += ` L${last[0]} ${last[1]}`;
  return d;
}
function downloadSVG() {
  const W = mainCanvas.width, H = mainCanvas.height;
  const arr = (state.yStrokes ? state.yStrokes.toArray() : []).slice();
  arr.sort((a, b) => (a.layer || 0) - (b.layer || 0) || (a.ts || 0) - (b.ts || 0));
  let body = '';
  for (const s of arr) {
    if (s.tool === 'eraser') continue;
    if (s.tool === 'text' && s.text) {
      const fs = Math.max(14, Math.min(72, (s.size || 4) * 3));
      body += `  <text x="${s.points[0][0]}" y="${s.points[0][1]}" font-family="Inter,system-ui,sans-serif" font-weight="600" font-size="${fs}" fill="${s.color}" dominant-baseline="middle">${s.text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</text>\n`;
    } else {
      const d = strokeToPath(s);
      if (!d) continue;
      body += `  <path d="${d}" stroke="${s.color}" stroke-width="${s.size}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n`;
    }
  }
  if (!body) { showToast('Пусто — нечего выгружать', '', 1600); return; }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n` +
    `  <rect width="${W}" height="${H}" fill="#11161f"/>\n` + body + `</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `catscribbles-${state.roomCode}-${Date.now()}.svg`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('SVG скачан', 'success', 1400);
}

// ============ Debug-бар: диагностика P2P и Yjs sync ============
function startDebugBar() {
  if (state._dbgTimer) clearInterval(state._dbgTimer);
  updateDebugBar();
  state._dbgTimer = setInterval(updateDebugBar, 800);
}
function updateDebugBar() {
  const bar = document.getElementById('debug-bar');
  if (!bar || state.destroyed) return;
  // ICE-состояния пиров: показывают, реально ли открылся data-channel
  const iceStates = [];
  let dcOpen = 0;
  try {
    const peers = state.room && state.room.getPeers ? state.room.getPeers() : null;
    if (peers) {
      // Trystero getPeers() возвращает обычный объект {peerId: RTCPeerConnection}
      const entries = (peers instanceof Map) ? [...peers] : Object.entries(peers);
      for (const [, pc] of entries) {
        const cs = (pc && (pc.connectionState || pc.iceConnectionState)) || '?';
        iceStates.push(cs);
        if (cs === 'connected' || cs === 'completed') dcOpen++;
      }
    }
  } catch (e) {}
  // Persistence: состояние сохранения в Supabase (db:ok = сохранено, ff = фолбэк на hash)
  const ps = state.persistStats || {};
  const dbTag = ps.save === 'ok' ? 'ok' : (ps.save && ps.save.startsWith('err')) ? 'ff' : '–';
  const s = state.syncStats || {};
  const aware = state.peerAwareness ? state.peerAwareness.size : 0;
  const strokes = state.yStrokes ? state.yStrokes.length : 0;
  const failTag = s.applyFail > 0 || s.lastErr ? ` <i>FAIL:${s.applyFail}${s.lastErr ? ' ' + s.lastErr : ''}</i>` : '';
  bar.innerHTML =
    `<b>P2P</b> peers:${state.peers} dc:<b>${dcOpen}/${state.peers}</b> ice:[${iceStates.join(',')}] ` +
    `<b>db</b>:${dbTag} ` +
    `<b>aware</b>:${aware} <b>strokes</b>:${strokes} ` +
    `<b>sync</b> s1 ${s.step1Sent}/${s.step1Recv} s2 ${s.step2Sent}/${s.step2Recv} up ${s.updateSent}/${s.updateRecv} ok:${s.applyOk}` +
    failTag;
}

// ============ Старт ============
window.__csReady = true;
(function bootReady(){
  ['btn-create', 'btn-join'].forEach(function(id){
    var b = document.getElementById(id);
    if (!b) return;
    b.disabled = false;
    b.classList.remove('booting');
  });
  var t = document.getElementById('toast');
  if (t && t.classList.contains('show') && t.classList.contains('error')) {
    t.classList.remove('show'); // снять boot-ошибку, если приложение всё же загрузилось позже
  }
})();
console.log('[CatScribbles] boot, uid', state.userId.slice(0, 8));
