'use strict';
/* 나의 수업 웹앱 : 수업 엔진 (2-3 열역학 제1법칙에서 떼어 냄)
   무대(1920×1080) · 넘기기 · 목차 · 빈칸 · 캔버스 그리기 도구 · 펜 필기 · 확대 · 전체 화면 · 테마.
   소단원은 장면만 만든다 (lessons/<과목>/<소단원>/scenes.js). 합치기가 이 파일 + 장면 + start.js 를 HTML 하나로 묶는다. */
/* ═══════════════ 바탕 : 무대 크기, 색, 캔버스, 반복 ═══════════════ */
const W0 = 1920, H0 = 1080;
let SCALE = 1;
let RES_Z = 1;              // 캔버스를 이 확대 배율에 맞춰 선명하게 그린다 (확대가 멈추면 맞춘다)
const MAX_CANVAS_PX = 1e7;  // 캔버스 하나의 최대 픽셀 수 (아이패드 사파리 한도 1677만 픽셀보다 넉넉히 작게)
/** 캔버스 해상도 배율 : 화면 배율 × 기기 픽셀 비 × 확대 배율. 너무 크면 줄인다 */
function canvasK(w, h, kmax) {
  const k = Math.max(1, SCALE * (window.devicePixelRatio || 1) * RES_Z);
  return Math.min(k, kmax || 6, Math.sqrt(MAX_CANVAS_PX / (w * h)));
}
const frame = document.getElementById('frame');
const stage = document.getElementById('stage');
const canvases = new Set();
const layers = [];          // 필기 층 캔버스 (화면을 바꿔도 남는다)
let inkReady = false;

function fit() {
  const cs = getComputedStyle(frame);
  const pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0, pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
  const aw = Math.max(50, frame.clientWidth - pl - pr), ah = Math.max(50, frame.clientHeight - pt - pb);
  const s = Math.min(aw / W0, ah / H0);
  SCALE = s;
  stage.style.transform = 'translate(' + (pl + (aw - W0 * s) / 2) + 'px,' + (pt + (ah - H0 * s) / 2) + 'px) scale(' + s + ')';
  canvases.forEach(function (c) { c.resize(); });
  layers.forEach(function (l) { l.resize(); });
  if (inkReady) redrawInk();
}

const COL = {};
let FONT_SANS = 'sans-serif', FONT_MONO = 'monospace';
function readTheme() {
  const s = getComputedStyle(document.documentElement);
  ['bg', 'panel', 'panel-2', 'ink', 'ink-2', 'muted', 'line', 'grid', 'heat', 'work', 'energy', 'cold', 'good', 'pen']
    .forEach(function (k) { COL[k] = s.getPropertyValue('--' + k).trim(); });
  FONT_SANS = s.getPropertyValue('--f-sans').trim() || 'sans-serif';
  FONT_MONO = s.getPropertyValue('--f-mono').trim() || 'monospace';
}
function isDark() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t) return t === 'dark';
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function themeLabel() { const b = document.getElementById('btn-theme'); if (b) b.textContent = isDark() ? '밝은 화면으로' : '어두운 화면으로'; }
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('suup-theme', t); } catch (e) { /* 저장이 막혀 있어도 화면은 바뀐다 */ }
  readTheme(); themeLabel();
  if (inkReady) redrawInk();
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.style.width = w + 'px'; c.style.height = h + 'px';
  const o = { c: c, w: w, h: h, ctx: c.getContext('2d') };
  o.resize = function () {
    const k = canvasK(w, h);
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    o.ctx.setTransform(k, 0, 0, k, 0, 0);
  };
  o.resize();
  canvases.add(o);
  return o;
}

/* 작은 도구 */
function h(tag, attrs) {
  const e = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function (k) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  });
  for (let i = 2; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, c) {
  if (c === null || c === undefined || c === false) return;
  if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; }
  e.append(c.nodeType ? c : String(c));
}
function setText(el, s) { if (el.textContent !== s) el.textContent = s; }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
const MINUS = '−';
function num(x, d) { const v = Number(x.toFixed(d || 0)); return (v < 0 ? MINUS : '') + Math.abs(v).toFixed(d || 0); }
function sgn(x, d) { const v = Number(x.toFixed(d || 0)); if (v === 0) return '0'; return (v > 0 ? '+' : MINUS) + Math.abs(v).toFixed(d || 0); }
/* 위첨자 표기 : 글 속의 ^{…} 를 위첨자로 그린다 (글꼴마다 ⁵ 같은 문자가 들쭉날쭉해서 직접 그림) */
function segs(s) {
  const out = []; let i = 0;
  while (i < s.length) {
    const j = s.indexOf('^{', i);
    if (j < 0) { out.push({ t: s.slice(i) }); break; }
    if (j > i) out.push({ t: s.slice(i, j) });
    const k = s.indexOf('}', j);
    out.push({ t: s.slice(j + 2, k), sup: true });
    i = k + 1;
  }
  return out;
}
/** HTML 용 : '10^{5}' → ['10', <sup>5</sup>] */
function rich(s) { return segs(s).map(function (g) { return g.sup ? h('sup', { text: g.t }) : g.t; }); }
function hexRgb(c) {
  if (c.indexOf('rgb') === 0) return c.replace(/[^\d,.]/g, '').split(',').slice(0, 3).map(Number);
  const m = c.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map(function (x) { return x + x; }).join('') : m, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgba(c, a) { const v = hexRgb(c); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')'; }
function mix(c1, c2, t) {
  const a = hexRgb(c1), b = hexRgb(c2);
  return '#' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0'); }).join('');
}

/* 빈칸 : 누르면 답이 보이고 다시 누르면 가려진다 (다른 화면에 갔다 와도 그대로) */
let REVEALED = {};
function blank(key, label, ans) {
  const b = h('button', { class: 'blank', type: 'button', 'aria-label': label + ' 빈칸, 눌러서 답 보기' }, h('span', { class: 'bn', text: label }), h('span', { class: 'ba', text: ans }));
  const set = function (v) { b.classList.toggle('on', v); REVEALED[key] = v; b.setAttribute('aria-pressed', String(v)); };
  set(!!REVEALED[key]);
  b.addEventListener('click', function () { set(!b.classList.contains('on')); });
  return b;
}

/* 반복 그리기 : 지금 화면의 tick 만 부른다 */
let current = null, lastNow = 0;
function loop(now) {
  const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
  lastNow = now;
  if (current && current.tick) {
    try { current.tick(dt, now / 1000); } catch (e) { console.error(e); current.tick = null; }
  }
  if (inkReady) syncInkKey();
  requestAnimationFrame(loop);
}

/* ═══════════════ 그리기 도구 ═══════════════ */
function font(size, weight, mono) { return (weight || 500) + ' ' + size + 'px ' + (mono ? FONT_MONO : FONT_SANS); }
function measureRich(ctx, s, size, weight, mono) {
  let w = 0;
  segs(s).forEach(function (g) { ctx.font = font(g.sup ? Math.round(size * 0.62) : size, weight, mono); w += ctx.measureText(g.t).width; });
  return w;
}
function txt(ctx, s, x, y, o) {
  o = o || {};
  const size = o.size || 24, weight = o.weight || 500;
  ctx.textBaseline = o.base || 'middle';
  const paint = function (t, px, py) {
    if (o.halo) { ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = COL.panel; ctx.strokeText(t, px, py); }
    ctx.fillStyle = o.color || COL.ink;
    ctx.fillText(t, px, py);
  };
  if (s.indexOf('^{') < 0) {
    ctx.font = font(size, weight, o.mono);
    ctx.textAlign = o.align || 'left';
    paint(s, x, y);
    return ctx.measureText(s).width;
  }
  const total = measureRich(ctx, s, size, weight, o.mono);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  segs(s).forEach(function (g) {
    ctx.font = font(g.sup ? Math.round(size * 0.62) : size, weight, o.mono);
    paint(g.t, cx, g.sup ? y - size * 0.34 : y);
    cx += ctx.measureText(g.t).width;
  });
  return total;
}
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function arrow(ctx, x1, y1, x2, y2, o) {
  o = o || {};
  const lw = o.width || 6, hs = o.head || lw * 3.2, a = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = ctx.fillStyle = o.color || COL.ink; ctx.lineWidth = lw; ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hs * 0.7, y2 - Math.sin(a) * hs * 0.7); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.42) * hs, y2 - Math.sin(a - 0.42) * hs);
  ctx.lineTo(x2 - Math.cos(a + 0.42) * hs, y2 - Math.sin(a + 0.42) * hs);
  ctx.closePath(); ctx.fill();
}
function pill(ctx, s, x, y, color, o) {
  o = o || {};
  const size = o.size || 22;
  ctx.font = font(size, 700);
  const w = ctx.measureText(s).width + 24, hh = size + 14;
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  ctx.fillStyle = color; rrect(ctx, x0, y - hh / 2, w, hh, hh / 2); ctx.fill();
  txt(ctx, s, x0 + w / 2, y + 1, { size: size, weight: 700, align: 'center', color: o.textColor || COL.panel });
  return w;
}
function dot(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
/** 세로 그레이디언트 : cols 를 위에서 아래로 고르게 */
function vGrad(ctx, y0, y1, cols) {
  const gr = ctx.createLinearGradient(0, y0, 0, y1);
  cols.forEach(function (c, i) { gr.addColorStop(i / (cols.length - 1), c); });
  return gr;
}
/** 숫자(고정폭 글꼴) + 단위(보통 글꼴)를 이어서 쓴다. 단위의 위첨자가 벌어지지 않게 */
function txtU(ctx, n, unit, x, y, o) {
  o = o || {};
  const size = o.size || 24, weight = o.weight || 500;
  ctx.font = font(size, weight, true); const wn = ctx.measureText(n).width;
  const wu = measureRich(ctx, unit, size, weight, false);
  const x0 = o.align === 'center' ? x - (wn + wu) / 2 : o.align === 'right' ? x - wn - wu : x;
  txt(ctx, n, x0, y, { size: size, weight: weight, color: o.color, mono: true, halo: o.halo });
  txt(ctx, unit, x0 + wn, y, { size: size, weight: weight, color: o.color, halo: o.halo });
  return wn + wu;
}

/* ═══════════════ 장면 : 넘기기 · 목차 ═══════════════
   소단원 장면 파일(lessons/…/scenes.js)이 SCENE_LIST 를 정하고, 맨 앞에 목차가 붙는다.
   합치기(tools/build.mjs)가 SUUP = { id, title, kicker, hub } 를 맨 앞에 넣어 준다. */
let idx = 0;
function goId(id) { const i = SCENES.findIndex(function (s) { return s.id === id; }); if (i >= 0) go(i); }

function go(i) {
  i = clamp(i, 0, SCENES.length - 1);
  if (current && current.destroy) { try { current.destroy(); } catch (e) { /* 무시 */ } }
  if (inkReady) { abortInk(); if (INK.board) setBoard(false); }
  resetZoomNow();             // 새 화면은 늘 원래 크기로 시작한다
  canvases.clear();
  const main = document.getElementById('scene');
  main.replaceChildren();
  idx = i;
  const sc = SCENES[i];
  document.getElementById('scene-title').textContent = sc.title;
  document.getElementById('kicker').textContent = sc.part || sc.kicker;
  const chip = document.getElementById('ws-chip');
  chip.textContent = sc.ws || ''; chip.hidden = !sc.ws;
  document.getElementById('count').textContent = i ? i + ' / ' + (SCENES.length - 1) : '';
  document.getElementById('btn-prev').disabled = i === 0;
  document.getElementById('btn-next').disabled = i === SCENES.length - 1;
  current = sc.make(main) || {};
  if (inkReady) syncInkKey();
  try { history.replaceState(null, '', '#' + sc.id); } catch (e) { /* 주소를 못 바꿔도 된다 */ }
}

/* ── 목차 ── */
function sceneHome(root) {
  const card = function (i) {
    const sc = SCENES[i];
    return h('button', { class: 'toc-card', type: 'button', onclick: function () { go(i); } },
      h('span', { class: 'toc-num', text: String(i).padStart(2, '0') }),
      h('span', { class: 'toc-title' }, sc.title, h('span', { class: 'toc-sub' }, rich(sc.sub || ''))),
      h('span', { class: 'toc-ws', text: sc.ws || '' }));
  };
  // 수업은 한 줄로 이어진다 : 앞 절반은 왼쪽, 나머지는 오른쪽 칸에 차례대로
  const cards = []; for (let i = 1; i < SCENES.length; i++) cards.push(card(i));
  const half = Math.ceil(cards.length / 2);
  const msg = h('span', {});
  const say = function (t) { msg.textContent = t; };
  // 나의 수업 웹앱에서 열었을 때만 : 수업 목록(허브)으로 돌아가는 단추. USB 로 연 파일에서는 숨는다
  const hubBtn = SUUP.hub && /^https?:$/.test(location.protocol) ? h('a', { class: 'btn small', href: SUUP.hub, style: 'text-decoration:none', text: '← 수업 목록으로' }) : null;
  const resetBtn = h('button', { class: 'btn small', type: 'button', text: '빈칸 모두 가리기', onclick: function () { REVEALED = {}; say('모든 빈칸을 가렸습니다.'); } });
  // 필기 모두 지우기 : 실수로 지우지 않게 두 번 눌러야 한다
  let armedUntil = 0;
  const inkBtn = h('button', { class: 'btn small', type: 'button', text: '필기 모두 지우기', onclick: function () {
    if (performance.now() < armedUntil) { armedUntil = 0; clearAllInk(); inkBtn.textContent = '필기 모두 지우기'; say('모든 화면의 필기를 지웠습니다.'); return; }
    armedUntil = performance.now() + 4000; inkBtn.textContent = '한 번 더 누르면 지웁니다'; say('');
    setTimeout(function () { if (armedUntil && performance.now() >= armedUntil) { armedUntil = 0; inkBtn.textContent = '필기 모두 지우기'; } }, 4100);
  } });
  const themeBtn = h('button', { class: 'btn small', id: 'btn-theme', type: 'button', onclick: function () { setTheme(isDark() ? 'light' : 'dark'); } });
  const penBtn = h('button', { class: 'btn small', type: 'button', onclick: function () { setPenAuto(!INK.penAuto); syncPen(); } });
  const syncPen = function () { penBtn.textContent = '애플 펜슬로 바로 쓰기 : ' + (INK.penAuto ? '켬' : '끔'); penBtn.setAttribute('aria-pressed', String(INK.penAuto)); };
  syncPen();
  const hint = typeof HOME_HINT === 'string' ? HOME_HINT : '번호가 붙은 빈칸은 누르면 답이 나오고 다시 누르면 가려집니다.';
  root.append(h('div', { class: 'toc' },
    h('section', { class: 'toc-col' }, cards.slice(0, half)),
    h('section', { class: 'toc-col' }, cards.slice(half)),
    h('div', { class: 'toc-bottom' },
      h('div', { class: 'toc-foot' }, hubBtn, resetBtn, inkBtn, themeBtn, penBtn, msg),
      h('p', { class: 'hint' }, hint + ' 애플 펜슬은 어디에나 바로 써지고, 톡 누르면 단추가 눌립니다. 손가락·마우스로 쓰려면 [손 필기]를 켜세요. 확대는 오른쪽 위 [+] 또는 두 손가락으로 벌리고, 가운데 숫자를 누르면 원래 크기입니다. 필기는 화면마다 따로 남고 이 탭을 닫으면 사라집니다. ← → 로 넘깁니다.'))));
  themeLabel();
  return {};
}
/** 필기를 이 탭에 잠시 담아 두는 이름 (소단원마다 따로) */
function inkStoreKey() { return 'suup-ink:' + SUUP.id; }

/* ═══════════════ 필기 : 애플 펜슬 · 손가락 · 마우스 ═══════════════
   · 애플 펜슬(pointerType 'pen')은 언제나 바로 써진다 (목차에서 끌 수 있음).
     손가락·마우스는 [손 필기]를 켰을 때나 [빈 판서]에서만 쓴다.
   · 톡 누르면(거의 안 움직이고 짧게) 쓰지 않고 그 자리의 단추를 누른다. 끌면 글씨가 된다.
     슬라이더는 펜이든 손가락이든 늘 슬라이더로 움직인다.
   · 필기는 화면마다(과정 탭·맞히기 문제마다) 따로 남는다. 좌표는 무대 기준(1920 폭)이라 화면 크기가 바뀌어도 그대로.
   · 이 탭을 닫기 전까지 sessionStorage 에 남는다 (아이패드가 페이지를 다시 불러와도 살아 있다). */
const INK_W = 1920, INK_H = 976;
const PEN_W = 6, HL_W = 26, HL_ALPHA = 0.35, HL_COLOR = '#FFD60A', ERASE_R = 22, TAP_MS = 600;
/** 이만큼(화면 px) 안 움직이면 '톡'. 손가락은 펜보다 흔들림이 커서 넉넉하게 */
function tapPx(kind) { return kind === 'pen' ? 6 : 12; }
const INK = {
  pages: {}, hist: {}, key: null,
  tool: 'pen', color: 'pen',
  hand: false, handAuto: false, board: false, penAuto: true, sawPen: false,
  active: null, synth: false, suppressUntil: 0, supX: 0, supY: 0,
};
function makeLayer() {
  const c = document.createElement('canvas');
  c.style.width = INK_W + 'px'; c.style.height = INK_H + 'px';
  const o = { c: c, ctx: c.getContext('2d') };
  o.resize = function () {
    const k = canvasK(INK_W, INK_H, 3);
    c.width = Math.round(INK_W * k); c.height = Math.round(INK_H * k);
    o.ctx.setTransform(k, 0, 0, k, 0, 0);
  };
  o.resize(); layers.push(o);
  return o;
}
const inkWrap = document.getElementById('ink-wrap'), boardEl = document.getElementById('board');
const inkLayer = makeLayer(), liveLayer = makeLayer();
inkWrap.append(inkLayer.c, liveLayer.c);

function r1(v) { return Math.round(v * 10) / 10; }
function pageKey() {
  const id = SCENES[idx].id;
  if (INK.board) return 'board:' + id;
  if (current && typeof current.annoKey === 'function') { try { return current.annoKey(); } catch (e) { return id; } }
  return id;
}
function syncInkKey() {
  const k = pageKey();
  if (k === INK.key) return;
  abortInk();
  INK.key = k;
  redrawInk();
}

/* 그리기 */
function setInkStyle(ctx, t, c) {
  const hl = t === 'hl';
  ctx.strokeStyle = ctx.fillStyle = hl ? HL_COLOR : (COL[c] || COL.pen);
  ctx.lineWidth = hl ? HL_W : PEN_W; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
}
/** 점들을 중점으로 잇는 매끈한 곡선. 형광펜은 한 번에 칠해 겹친 곳이 진해지지 않게 */
function paintStroke(ctx, s) {
  const p = s && s.p;
  if (!Array.isArray(p) || p.length < 2) return;
  const n = Math.floor(p.length / 2);
  ctx.save();
  setInkStyle(ctx, s.t, s.c);
  if (s.t === 'hl') ctx.globalAlpha = HL_ALPHA;
  if (n === 1) { ctx.beginPath(); ctx.arc(p[0], p[1], ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
  ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo((p[0] + p[2]) / 2, (p[1] + p[3]) / 2);
  for (let k = 2; k < n; k++) ctx.quadraticCurveTo(p[2 * k - 2], p[2 * k - 1], (p[2 * k - 2] + p[2 * k]) / 2, (p[2 * k - 1] + p[2 * k + 1]) / 2);
  ctx.lineTo(p[2 * n - 2], p[2 * n - 1]);
  ctx.stroke();
  ctx.restore();
}
function redrawInk() {
  const ctx = inkLayer.ctx;
  ctx.clearRect(0, 0, INK_W, INK_H);
  (INK.pages[INK.key] || []).forEach(function (s) { paintStroke(ctx, s); });
}
/** 쓰는 중인 획 : 새로 들어온 마디만 덧그린다. 형광펜은 층 전체를 반투명하게 */
function liveBegin(a) {
  liveLayer.ctx.clearRect(0, 0, INK_W, INK_H);
  liveLayer.c.style.opacity = a.t === 'hl' ? String(HL_ALPHA) : '1';
  a.drawn = 0;
  liveExtend(a);
}
function liveExtend(a) {
  const c = liveLayer.ctx, p = a.p, n = p.length / 2;
  setInkStyle(c, a.t, a.c);
  for (let k = Math.max(1, a.drawn); k < n; k++) {
    c.beginPath();
    if (k === 1) { c.moveTo(p[0], p[1]); c.lineTo((p[0] + p[2]) / 2, (p[1] + p[3]) / 2); }
    else {
      c.moveTo((p[2 * k - 4] + p[2 * k - 2]) / 2, (p[2 * k - 3] + p[2 * k - 1]) / 2);
      c.quadraticCurveTo(p[2 * k - 2], p[2 * k - 1], (p[2 * k - 2] + p[2 * k]) / 2, (p[2 * k - 1] + p[2 * k + 1]) / 2);
    }
    c.stroke();
  }
  a.drawn = n;
}
function eraserCursor(x, y) {
  const c = liveLayer.ctx;
  c.clearRect(0, 0, INK_W, INK_H);
  liveLayer.c.style.opacity = '1';
  c.strokeStyle = COL.muted; c.lineWidth = 2; c.setLineDash([6, 5]);
  c.beginPath(); c.arc(x, y, ERASE_R, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
}

/* 지우개 : 지나간 자리에 닿은 획을 통째로 지운다 */
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  const t = L ? clamp(((px - ax) * dx + (py - ay) * dy) / L, 0, 1) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function hitStroke(s, x, y) {
  const p = s.p, n = Math.floor(p.length / 2), rr = ERASE_R + (s.t === 'hl' ? HL_W : PEN_W) / 2;
  if (n === 1) return Math.hypot(p[0] - x, p[1] - y) <= rr;
  for (let k = 1; k < n; k++) if (segDist(x, y, p[2 * k - 2], p[2 * k - 1], p[2 * k], p[2 * k + 1]) <= rr) return true;
  return false;
}
function eraseAt(a, x, y) {
  const page = INK.pages[INK.key];
  if (!page || !page.length) return false;
  let changed = false;
  for (let i = page.length - 1; i >= 0; i--) {
    if (hitStroke(page[i], x, y)) { a.erased.push({ i: i, s: page[i] }); page.splice(i, 1); changed = true; }
  }
  return changed;
}
function eraseAlong(a, x, y) {
  const d = Math.hypot(x - a.ex, y - a.ey), steps = Math.max(1, Math.ceil(d / (ERASE_R / 2)));
  let changed = false;
  for (let i = 1; i <= steps; i++) changed = eraseAt(a, a.ex + (x - a.ex) * i / steps, a.ey + (y - a.ey) * i / steps) || changed;
  a.ex = x; a.ey = y;
  if (changed) redrawInk();
}

/* 저장 · 되돌리기 */
let inkSaveTimer = 0;
function saveInk() {
  clearTimeout(inkSaveTimer);
  inkSaveTimer = setTimeout(function () {
    try { sessionStorage.setItem(inkStoreKey(), JSON.stringify(INK.pages)); } catch (e) { /* 저장을 못 해도 필기는 된다 */ }
  }, 400);
}
function loadInk() {
  try {
    const o = JSON.parse(sessionStorage.getItem(inkStoreKey()) || 'null');
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      Object.keys(o).forEach(function (k) { if (Array.isArray(o[k])) INK.pages[k] = o[k].filter(function (s) { return s && Array.isArray(s.p) && s.p.length >= 2; }); });
    }
  } catch (e) { /* 처음부터 */ }
}
function pushHist(act) {
  const h = INK.hist[INK.key] || (INK.hist[INK.key] = []);
  h.push(act);
  if (h.length > 300) h.shift();
}
function commitStroke(a) {
  const page = INK.pages[INK.key] || (INK.pages[INK.key] = []);
  const s = { t: a.t, c: a.c, p: a.p };
  page.push(s);
  pushHist({ type: 'add' });
  paintStroke(inkLayer.ctx, s);
  saveInk();
}
function finishErase(a) {
  if (!a.erased.length) return;
  pushHist({ type: 'erase', items: a.erased });
  saveInk();
}
function undoInk() {
  const h = INK.hist[INK.key];
  if (!h || !h.length) return;
  const act = h.pop(), page = INK.pages[INK.key] || (INK.pages[INK.key] = []);
  if (act.type === 'add') page.pop();
  else if (act.type === 'erase') for (let i = act.items.length - 1; i >= 0; i--) page.splice(act.items[i].i, 0, act.items[i].s);
  else if (act.type === 'clear') INK.pages[INK.key] = act.items;
  redrawInk(); saveInk();
}
function clearPage() {
  const page = INK.pages[INK.key];
  if (!page || !page.length) return;
  pushHist({ type: 'clear', items: page.slice() });
  INK.pages[INK.key] = [];
  redrawInk(); saveInk();
}
function clearAllInk() {
  INK.pages = {}; INK.hist = {};
  redrawInk(); saveInk();
}
function abortInk() {
  INK.active = null;
  liveLayer.ctx.clearRect(0, 0, INK_W, INK_H);
}

/* 도구 막대 */
const toolHand = document.getElementById('tool-hand'), toolBoard = document.getElementById('tool-board');
const pickBtns = Array.prototype.slice.call(document.querySelectorAll('.pen-tools .pick'));
function syncTools() {
  pickBtns.forEach(function (b) {
    const on = b.dataset.tool === INK.tool && (INK.tool !== 'pen' || b.dataset.color === INK.color);
    b.setAttribute('aria-pressed', String(on));
  });
  toolHand.setAttribute('aria-pressed', String(INK.hand));
  toolBoard.setAttribute('aria-pressed', String(INK.board));
  document.body.classList.toggle('hand-on', INK.hand);
}
function setBoard(on) {
  INK.board = on;
  boardEl.hidden = !on;
  syncTools();
  syncInkKey();
}
function setPenAuto(on) {
  INK.penAuto = on;
  try { localStorage.setItem('suup-pen-auto', on ? '1' : '0'); } catch (e) { /* 이번만 적용 */ }
}
/** 펜슬을 처음 쓰면, 색을 고르느라 저절로 켜졌던 손 필기를 끈다 (손바닥이 써지지 않게) */
function notePen() {
  if (INK.sawPen) return;
  INK.sawPen = true;
  if (INK.hand && INK.handAuto) { INK.hand = false; INK.handAuto = false; syncTools(); }
}
pickBtns.forEach(function (b) {
  b.addEventListener('click', function () {
    INK.tool = b.dataset.tool;
    if (b.dataset.color) INK.color = b.dataset.color;
    // 펜이 없는 기기(전자칠판·마우스)에서 펜을 고르면 바로 손으로 쓸 수 있게
    if (!INK.sawPen && !INK.hand) { INK.hand = true; INK.handAuto = true; }
    syncTools();
  });
});
toolHand.addEventListener('click', function () { INK.hand = !INK.hand; INK.handAuto = false; syncTools(); });
toolBoard.addEventListener('click', function () { abortInk(); setBoard(!INK.board); });
document.getElementById('tool-undo').addEventListener('click', undoInk);
document.getElementById('tool-clear').addEventListener('click', clearPage);

/* 입력 */
/** 화면 좌표 → 필기 좌표(수업 화면 1920×976 기준). 확대해 있어도 내용 기준 자리에 남는다 */
function toInk(e) {
  const r = zoomEl.getBoundingClientRect(), k = SCALE * ZT.z;
  return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
}
function inkTargetOK(el) {
  if (!el || !el.closest) return false;
  if (el.closest('.bar')) return false;                               // 머리줄 단추는 늘 단추
  if (!el.closest('#scene, #ink-wrap')) return false;
  if (!INK.board && el.closest('input[type="range"]')) return false;  // 슬라이더는 늘 슬라이더
  return true;
}
function wantsInk(kind, el) {
  if (!inkTargetOK(el)) return false;
  if (INK.board) return true;
  if (kind === 'pen') return INK.penAuto || INK.hand;
  return INK.hand;
}
stage.addEventListener('pointerdown', function (e) {
  if (e.pointerType === 'pen') notePen();
  if (INK.active) {
    // 쓰는 동안 닿는 다른 손가락(손바닥)은 무시한다
    if (e.pointerId !== INK.active.id && inkTargetOK(e.target)) { e.preventDefault(); e.stopPropagation(); }
    return;
  }
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (!wantsInk(e.pointerType, e.target)) return;
  e.preventDefault(); e.stopPropagation();
  try { stage.setPointerCapture(e.pointerId); } catch (err) { /* 합성 이벤트 등 */ }
  const pt = toInk(e);
  const eraserEnd = e.pointerType === 'pen' && (e.button === 5 || (e.buttons & 32) === 32);
  INK.active = {
    id: e.pointerId, kind: e.pointerType, cx: e.clientX, cy: e.clientY, t0: performance.now(), moved: false,
    t: eraserEnd ? 'eraser' : INK.tool, c: INK.color, p: [r1(pt.x), r1(pt.y)], erased: [], drawn: 0, ex: pt.x, ey: pt.y,
  };
}, true);
stage.addEventListener('pointermove', function (e) {
  const a = INK.active;
  if (!a || e.pointerId !== a.id) return;
  e.preventDefault();
  let evs = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
  if (!evs || !evs.length) evs = [e];
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i], pt = toInk(ev);
    if (!a.moved && Math.hypot(ev.clientX - a.cx, ev.clientY - a.cy) > tapPx(a.kind)) {
      a.moved = true;
      if (a.t !== 'eraser') liveBegin(a);
    }
    if (a.t === 'eraser') { if (a.moved) eraseAlong(a, pt.x, pt.y); continue; }
    const n = a.p.length, dx = pt.x - a.p[n - 2], dy = pt.y - a.p[n - 1];
    if (dx * dx + dy * dy >= 2) a.p.push(r1(pt.x), r1(pt.y));
  }
  if (!a.moved) return;
  if (a.t === 'eraser') { const pt = toInk(e); eraserCursor(pt.x, pt.y); }
  else liveExtend(a);
}, true);
function inkEnd(e) {
  const a = INK.active;
  if (!a || e.pointerId !== a.id) return;
  INK.active = null;
  e.preventDefault(); e.stopPropagation();
  try { stage.releasePointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
  liveLayer.ctx.clearRect(0, 0, INK_W, INK_H);
  // 브라우저가 바로 뒤따라 보내는 click(같은 자리)은 버린다. 다른 자리를 누른 손가락 클릭은 그대로
  INK.suppressUntil = performance.now() + 400; INK.supX = e.clientX; INK.supY = e.clientY;
  if (!a.moved) {
    if (e.type === 'pointercancel') return;
    // 톡 : 그 자리에 단추가 있으면 누른다
    if (!INK.board && performance.now() - a.t0 < TAP_MS) {
      const el = document.elementFromPoint(a.cx, a.cy);
      const hit = el && el.closest ? el.closest('button, a[href], label, [role="button"], [role="tab"]') : null;
      if (hit && !hit.disabled && inkTargetOK(hit)) {
        INK.synth = true;
        try { hit.click(); } finally { INK.synth = false; }
        return;
      }
    }
    // 단추가 없으면 점을 찍는다 (지우개면 그 자리를 지운다)
    if (a.t === 'eraser') { if (eraseAt(a, a.ex, a.ey)) redrawInk(); finishErase(a); return; }
    commitStroke(a);
    return;
  }
  if (a.t === 'eraser') finishErase(a);
  else commitStroke(a);
}
stage.addEventListener('pointerup', inkEnd, true);
stage.addEventListener('pointercancel', inkEnd, true);
// 아이패드 사파리 : 펜으로 쓰는 터치는 기본 동작(클릭·확대·선택)을 막는다. 톡은 위에서 직접 누른다
document.addEventListener('touchstart', function (e) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i], kind = t.touchType === 'stylus' ? 'pen' : 'touch';
    if (kind === 'pen') notePen();
    const el = t.target && t.target.nodeType === 1 ? t.target : (t.target && t.target.parentElement);
    if ((INK.active && inkTargetOK(el)) || wantsInk(kind, el)) { if (e.cancelable) e.preventDefault(); return; }
  }
}, { capture: true, passive: false });
document.addEventListener('click', function (e) {
  if (INK.synth) return;
  if (performance.now() < INK.suppressUntil && Math.hypot(e.clientX - INK.supX, e.clientY - INK.supY) < 40 && inkTargetOK(e.target)) {
    INK.suppressUntil = 0;
    e.preventDefault(); e.stopPropagation();
  }
  // 화면을 끌어 옮긴 직후 뒤따라오는 click 은 버린다
  if (performance.now() < VG.noClickUntil && e.target && e.target.closest && e.target.closest('#view')) {
    VG.noClickUntil = 0;
    e.preventDefault(); e.stopPropagation();
  }
}, true);

/* ═══════════════ 확대 · 축소 ═══════════════
   머리줄 아래 수업 화면(#view)만 키운다. 머리줄의 넘기기 · 필기 도구는 늘 그대로 보인다.
   · 머리줄 [−] [100%] [+] : 단계별로 키우고 줄인다. 가운데 숫자를 누르면 원래 크기
   · 두 손가락으로 벌리고 오므리기 (아이패드 · 전자칠판). 펜으로 쓰는 중이나 막 쓴 뒤의 손바닥은 무시
   · 확대한 뒤에는 빈 곳을 한 손가락(손 필기 끔)이나 마우스로 끌어 옮긴다. 두 손가락으로 옮겨도 된다
   · Ctrl + 휠(노트북 터치패드 오므리기)로 확대, 휠로 옮기기. 키보드 + − 0
   · 필기는 내용 기준 좌표라 확대한 채 써도, 줄인 뒤에도 제자리에 있다
   · 움직이는 동안은 CSS 로만 키우고, 멈추면 캔버스를 그 배율로 다시 그려 글자가 선명해진다 */
const VIEW_W = 1920, VIEW_H = 976, ZMIN = 1, ZMAX = 3;
const ZOOM_STEPS = [1, 1.25, 1.5, 2, 2.5, 3];
const ZT = { z: 1, x: 0, y: 0 };                 // #zoom 의 이동(무대 px)과 배율
const VG = { touches: new Map(), pinch: null, drag: null, lastPen: -1e9, noClickUntil: 0 };
const zoomEl = document.getElementById('zoom'), viewEl = document.getElementById('view');
const zoomInBtn = document.getElementById('zoom-in'), zoomOutBtn = document.getElementById('zoom-out'), zoomVal = document.getElementById('zoom-reset');
function applyZoom() {
  zoomEl.style.transform = ZT.z === 1 && !ZT.x && !ZT.y ? '' : 'translate(' + ZT.x + 'px,' + ZT.y + 'px) scale(' + ZT.z + ')';
  setText(zoomVal, Math.round(ZT.z * 100) + '%');
  zoomVal.setAttribute('aria-pressed', String(ZT.z > 1.001));
  zoomOutBtn.disabled = ZT.z <= ZMIN + 0.001;
  zoomInBtn.disabled = ZT.z >= ZMAX - 0.001;
  stage.classList.toggle('zoomed', ZT.z > 1.001);
}
function clampPan() {
  ZT.x = clamp(ZT.x, VIEW_W - VIEW_W * ZT.z, 0);
  ZT.y = clamp(ZT.y, VIEW_H - VIEW_H * ZT.z, 0);
}
/** 보이는 화면의 (fx, fy) 자리(무대 px)에 있던 내용이 그 자리에 머물도록 배율 z 로 바꾼다 */
function zoomTo(z, fx, fy) {
  z = clamp(z, ZMIN, ZMAX);
  if (fx === undefined) { fx = VIEW_W / 2; fy = VIEW_H / 2; }
  const cx = (fx - ZT.x) / ZT.z, cy = (fy - ZT.y) / ZT.z;
  ZT.z = z; ZT.x = fx - cx * z; ZT.y = fy - cy * z;
  clampPan(); applyZoom(); sharpenLater();
}
function zoomStep(dir) {
  const cur = ZT.z;
  let next = null;
  if (dir > 0) next = ZOOM_STEPS.filter(function (z) { return z > cur + 0.01; })[0];
  else next = ZOOM_STEPS.filter(function (z) { return z < cur - 0.01; }).pop();
  zoomTo(next === undefined || next === null ? (dir > 0 ? ZMAX : ZMIN) : next);
}
let sharpenTimer = 0;
/** 확대가 멈추고 잠시 뒤, 캔버스와 필기를 지금 배율에 맞는 해상도로 다시 그린다 */
function sharpenLater() {
  clearTimeout(sharpenTimer);
  sharpenTimer = setTimeout(function sharpen() {
    if (INK.active || VG.pinch) { sharpenTimer = setTimeout(sharpen, 300); return; }
    if (Math.abs(RES_Z - ZT.z) < 0.01) return;
    RES_Z = ZT.z;
    canvases.forEach(function (c) { c.resize(); });
    layers.forEach(function (l) { l.resize(); });
    if (inkReady) redrawInk();
  }, 250);
}
/** 화면을 바꿀 때 : 바로 원래 크기로 (애니메이션 없이) */
function resetZoomNow() {
  VG.pinch = null; VG.drag = null; stage.classList.remove('panning');
  clearTimeout(sharpenTimer);
  if (ZT.z !== 1 || ZT.x || ZT.y) { ZT.z = 1; ZT.x = 0; ZT.y = 0; applyZoom(); }
  if (RES_Z !== 1) { RES_Z = 1; layers.forEach(function (l) { l.resize(); }); if (inkReady) redrawInk(); }
}
function viewPt(x, y) { const r = viewEl.getBoundingClientRect(); return { x: (x - r.left) / SCALE, y: (y - r.top) / SCALE }; }
function inView(el) { return !!(el && el.closest && el.closest('#view')); }
function isControl(el) { return !!(el && el.closest && el.closest('button, a[href], input, select, textarea, label, [role="button"], [role="tab"], .blank')); }
zoomInBtn.addEventListener('click', function () { zoomStep(1); });
zoomOutBtn.addEventListener('click', function () { zoomStep(-1); });
zoomVal.addEventListener('click', function () { zoomTo(1); });

// 손가락 · 마우스 몸짓. 필기 처리(위)보다 나중에 등록되어, 필기가 먼저 판단한 뒤에 본다
stage.addEventListener('pointerdown', function (e) {
  if (e.pointerType === 'pen') { VG.lastPen = performance.now(); return; }
  if (!inView(e.target)) return;
  if (e.pointerType === 'touch') {
    VG.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const penBusy = (INK.active && INK.active.kind === 'pen') || performance.now() - VG.lastPen < 800;
    if (VG.touches.size === 2 && !penBusy) {
      if (INK.active) abortInk();               // 한 손가락으로 막 긋기 시작한 획은 버린다
      VG.drag = null; stage.classList.remove('panning');
      const ids = Array.from(VG.touches.keys()), a = VG.touches.get(ids[0]), b = VG.touches.get(ids[1]);
      const m = viewPt((a.x + b.x) / 2, (a.y + b.y) / 2);
      VG.pinch = { ids: ids, d0: Math.max(30, Math.hypot(a.x - b.x, a.y - b.y)), z0: ZT.z, cx: (m.x - ZT.x) / ZT.z, cy: (m.y - ZT.y) / ZT.z };
      ids.forEach(function (id) { try { stage.setPointerCapture(id); } catch (err) { /* 합성 이벤트 */ } });
      e.preventDefault(); e.stopPropagation();
      return;
    }
  }
  // 확대한 상태 : 빈 곳을 끌면 화면을 옮긴다 (단추 · 슬라이더 · 필기는 그대로)
  if (ZT.z > 1.001 && !VG.pinch && !INK.active && !isControl(e.target) && !wantsInk(e.pointerType, e.target) && (e.pointerType !== 'mouse' || e.button === 0)) {
    VG.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, tx: ZT.x, ty: ZT.y, on: false, kind: e.pointerType };
  }
}, true);
stage.addEventListener('pointermove', function (e) {
  if (e.pointerType === 'pen') { VG.lastPen = performance.now(); return; }
  if (VG.touches.has(e.pointerId)) VG.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const p = VG.pinch;
  if (p && p.ids.indexOf(e.pointerId) >= 0) {
    const a = VG.touches.get(p.ids[0]), b = VG.touches.get(p.ids[1]);
    if (!a || !b) return;
    const m = viewPt((a.x + b.x) / 2, (a.y + b.y) / 2);
    const z = clamp(p.z0 * Math.hypot(a.x - b.x, a.y - b.y) / p.d0, ZMIN, ZMAX);
    ZT.z = z; ZT.x = m.x - p.cx * z; ZT.y = m.y - p.cy * z;
    clampPan(); applyZoom();
    e.preventDefault(); e.stopPropagation();
    return;
  }
  const d = VG.drag;
  if (d && e.pointerId === d.id) {
    if (!d.on && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > (d.kind === 'mouse' ? 4 : 12)) {
      d.on = true; stage.classList.add('panning');
      try { stage.setPointerCapture(d.id); } catch (err) { /* 합성 이벤트 */ }
    }
    if (d.on) {
      ZT.x = d.tx + (e.clientX - d.x0) / SCALE; ZT.y = d.ty + (e.clientY - d.y0) / SCALE;
      clampPan(); applyZoom();
      e.preventDefault();
    }
  }
}, true);
function vgEnd(e) {
  VG.touches.delete(e.pointerId);
  const p = VG.pinch;
  if (p && p.ids.indexOf(e.pointerId) >= 0) {
    VG.pinch = null;
    if (ZT.z < 1.06) { ZT.z = 1; ZT.x = 0; ZT.y = 0; applyZoom(); }   // 거의 원래 크기면 딱 맞춘다
    sharpenLater();
    VG.noClickUntil = performance.now() + 400;
  }
  const d = VG.drag;
  if (d && e.pointerId === d.id) {
    if (d.on) VG.noClickUntil = performance.now() + 400;
    VG.drag = null; stage.classList.remove('panning');
  }
}
// 손가락이 무대 밖에서 떨어져도 놓치지 않게 창 전체에서 받는다
window.addEventListener('pointerup', vgEnd, true);
window.addEventListener('pointercancel', vgEnd, true);
// 휠 : Ctrl(⌘) + 휠은 확대 · 축소(노트북 터치패드 오므리기 포함), 확대한 상태에서 그냥 휠은 옮기기
viewEl.addEventListener('wheel', function (e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const pt = viewPt(e.clientX, e.clientY);
    zoomTo(ZT.z * Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.004)), pt.x, pt.y);
  } else if (ZT.z > 1.001) {
    e.preventDefault();
    ZT.x -= e.deltaX / SCALE; ZT.y -= e.deltaY / SCALE;
    clampPan(); applyZoom();
  }
}, { passive: false });
// 아이패드 사파리 : 페이지 자체가 확대되지 않게 (확대는 위에서 직접 한다)
['gesturestart', 'gesturechange', 'gestureend'].forEach(function (t) { document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false }); });
