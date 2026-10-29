'use strict';
/* 나의 수업 : 허브(수업 첫 화면)
   교과 → 과목 → 단원 → 소단원. 목록은 tools/build.mjs 가 catalog.json 과 lessons/ 폴더를 읽어 이 파일 아래에 넣어 준다.
   로그인·저장 없음. 이 기기에서 마지막으로 본 과목과 화면 밝기만 브라우저에 기억한다. */
const DATA = JSON.parse(document.getElementById('hub-data').textContent);
const $ = function (id) { return document.getElementById(id); };
const side = $('side'), main = $('main'), qInput = $('q'), yearSel = $('year'), dlg = $('memo'), sheet = $('sheet');
let year = DATA.current, subjId = null, query = '', offlineReady = false;

/* 작은 도구 */
function h(tag, attrs) {
  const e = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function (k) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
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
const ICONS = {
  play: '<path d="M8 5.2v13.6L19 12z" fill="currentColor" stroke="none"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5M9 9h6M9 13h3"/>',
};
function icon(n) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = ICONS[n];
  return s;
}
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 기억하지 못해도 화면은 된다 */ } }
let toastTimer = 0;
function toast(msg, ms) {
  const t = $('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.hidden = true; }, ms || 6000);
}
$('toast').addEventListener('click', function () { this.hidden = true; });
/** '2026-10-28' → '10월 28일' (올해가 아니면 연도도) */
function fmtDate(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
  if (!m) return d || '';
  const md = Number(m[2]) + '월 ' + Number(m[3]) + '일';
  return m[1] === String(new Date().getFullYear()) ? md : m[1] + '년 ' + md;
}

/* ── 목록 ── */
function yearData() { return DATA.years[year] || DATA.years[DATA.current]; }
function subjects() {
  const out = [];
  yearData().groups.forEach(function (g) { g.subjects.forEach(function (s) { out.push(s); }); });
  return out;
}
function findSubj(id) { return subjects().find(function (s) { return s.id === id; }) || null; }
function hasLesson(s) { return s.units.some(function (u) { return u.lessons.some(function (l) { return l.status !== 'prep'; }); }); }

/* 주소 : #과목  또는 지난 학년도는  #2025/과목 */
function readHash() {
  let s = '';
  try { s = decodeURIComponent(location.hash.slice(1)); } catch (e) { s = ''; }
  const m = /^(\d{4})(?:\/(.*))?$/.exec(s);
  if (m && DATA.years[m[1]]) { year = m[1]; subjId = m[2] || null; }
  else { year = DATA.current; subjId = s || null; }
}
function writeHash() {
  const s = (year !== DATA.current ? year + '/' : '') + (subjId || '');
  try { history.replaceState(null, '', s ? '#' + encodeURIComponent(s).replace(/%2F/g, '/') : location.pathname + location.search); } catch (e) { /* 주소를 못 바꿔도 된다 */ }
}
function pickDefault() {
  if (subjId && findSubj(subjId)) return;
  const last = load('hub-subject');
  if (last && findSubj(last)) { subjId = last; return; }
  const all = subjects();
  const ready = all.find(hasLesson);
  subjId = (ready || all[0] || {}).id || null;
}
function choose(id) {
  subjId = id; query = ''; qInput.value = '';
  store('hub-subject', id);
  writeHash(); render();
  main.scrollTop = 0;
  const cur = side.querySelector('[aria-current="true"]');
  if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/* ── 그리기 ── */
function render() {
  $('year-label').textContent = year + '학년도' + (year !== DATA.current ? ' · 보관본' : '');
  renderYears(); renderSide(); renderMain();
}
function renderYears() {
  const ys = Object.keys(DATA.years).sort().reverse();
  yearSel.hidden = ys.length < 2;
  if (yearSel.hidden) return;
  yearSel.replaceChildren.apply(yearSel, ys.map(function (y) {
    return h('option', { value: y, text: y + '학년도' + (y === DATA.current ? ' (올해)' : ' (보관)') });
  }));
  yearSel.value = year;
}
function renderSide() {
  side.replaceChildren.apply(side, yearData().groups.map(function (g) {
    return h('div', { class: 'group' },
      h('div', { class: 'group-name', text: g.name }),
      g.subjects.map(function (s) {
        return h('button', { class: 'subj', type: 'button', 'aria-current': String(!query && s.id === subjId), onclick: function () { choose(s.id); } },
          h('span', { text: s.name }));
      }));
  }));
}
function renderMain() {
  const out = [];
  if (year !== DATA.current) {
    out.push(h('div', { class: 'banner' },
      h('span', { text: year + '학년도 보관본입니다. 수업 화면도 그해 모습 그대로 열립니다.' }),
      h('button', { class: 'btn', type: 'button', text: DATA.current + '학년도로 돌아가기', onclick: function () { year = DATA.current; pickDefault(); writeHash(); render(); } })));
  }
  if (query.trim()) out.push.apply(out, searchView());
  else out.push.apply(out, subjectView());
  out.push(foot());
  main.replaceChildren();
  add(main, out);
}
function subjectView() {
  const s = findSubj(subjId);
  if (!s) return [h('p', { class: 'empty', text: '왼쪽에서 과목을 고르세요.' })];
  return [
    h('div', { class: 'subj-head' }, h('h1', { text: s.name }), s.note ? h('p', { class: 'note', text: s.note }) : null),
    s.units.map(function (u) {
      return h('section', { class: 'unit' },
        h('div', { class: 'unit-head' }, h('h2', { text: u.name })),
        h('div', { class: 'cards' }, u.lessons.map(function (l) { return card(l, s); })));
    }),
  ];
}
function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ''); }
function searchView() {
  const q = norm(query);
  const bySubj = [];
  let n = 0;
  subjects().forEach(function (s) {
    const hits = [];
    s.units.forEach(function (u) {
      u.lessons.forEach(function (l) {
        if (norm([s.name, u.name, l.no, l.title].join(' ')).indexOf(q) >= 0) hits.push(card(l, s, u.name));
      });
    });
    if (hits.length) { n += hits.length; bySubj.push(h('section', { class: 'unit' }, h('div', { class: 'unit-head' }, h('h2', { text: s.name }), h('small', { text: hits.length + '개' })), h('div', { class: 'cards' }, hits))); }
  });
  const head = h('h1', { class: 'found-head', text: '‘' + query.trim() + '’ 찾은 소단원 ' + n + '개' });
  return n ? [head, bySubj] : [head, h('p', { class: 'empty', text: '맞는 소단원이 없습니다. 다른 낱말로 찾아 보세요.' })];
}
function card(l, s, where) {
  const ready = l.status !== 'prep';
  const last = l.memo[0];
  // 메모 줄을 누르면 수업 메모 창이 열린다
  const meta = last ? h('button', { class: 'meta', type: 'button', title: '수업 메모 보기', onclick: function () { openMemo(l, s); } },
    icon('note'), h('span', { text: '메모 ' + fmtDate(last.date) + (last.label ? ' · ' + last.label : '') })) : null;
  const acts = [];
  if (ready) acts.push(h('a', { class: 'btn primary start', href: l.href }, icon('play'), '수업 시작'));
  if (l.worksheet) acts.push(h('button', { class: 'btn', type: 'button', title: '학습지 보기', onclick: function () { openSheet(l, s); } }, icon('doc'), '학습지'));
  return h('article', { class: 'card' + (ready ? '' : ' prep') },
    h('div', { class: 'card-top' }, h('span', { class: 'no', text: l.no })),
    h('h3', { text: l.title }),
    where ? h('p', { class: 'where', text: where }) : null,
    meta,
    acts.length ? h('div', { class: 'actions' }, acts) : null);
}
function foot() {
  return h('footer', { class: 'foot' },
    h('p', null, h('b', { text: '전자칠판' }), ' : 키보드 F11 로 브라우저를 전체 화면으로 두면 수업 화면을 열고 닫아도 그대로입니다.'),
    h('p', null, h('b', { text: '아이패드' }), ' : 사파리 [공유] → [홈 화면에 추가] 하면 앱처럼 열립니다.'),
    h('p', { id: 'offline' }, offlineText()),
    h('p', { text: '목록을 만든 때 ' + DATA.built }));
}
function offlineText() { return offlineReady ? '이 기기에 수업 화면을 담아 두었습니다. 인터넷이 끊겨도 열립니다.' : ''; }

/* ── 수업 메모 ── */
function openMemo(l, s) {
  $('memo-kicker').textContent = s.name + ' · ' + l.no;
  $('memo-title').textContent = l.title + ' 수업 메모';
  const body = $('memo-body');
  body.replaceChildren.apply(body, l.memo.map(function (e) {
    return h('section', { class: 'entry' },
      h('h3', null, e.date, e.label ? h('span', { text: e.label }) : null),
      e.changed.length ? [h('h4', { text: '바꾼 것' }), h('ul', null, e.changed.map(function (t) { return h('li', { text: t }); }))] : null,
      e.next.length ? [h('h4', { class: 'todo', text: '다음에 바꿀 것' }), h('ul', null, e.next.map(function (t) { return h('li', { text: t }); }))] : null,
      e.note.map(function (t) { return h('p', { text: t }); }));
  }));
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  body.scrollTop = 0;
}
function closeMemo() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
$('memo-close').addEventListener('click', closeMemo);
dlg.addEventListener('click', function (e) { if (e.target === dlg) closeMemo(); });

/* ── 학습지 : 쪽마다 그려 보여 주기만 한다 (파일 내려받기 없음) ──
   PDF 를 그리는 데 pdf.js 를 쓴다 (처음 열 때 한 번 받아 오고, 그 뒤에는 기기에 담아 둔다). */
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let pdfLib = null;
function loadPdfJs() {
  if (pdfLib) return pdfLib;
  pdfLib = new Promise(function (resolve, reject) {
    const s = document.createElement('script');
    s.src = PDFJS + 'pdf.min.js';
    s.onload = function () {
      if (!window.pdfjsLib) { reject(new Error('pdf.js')); return; }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    s.onerror = reject;
    document.head.append(s);
  });
  pdfLib.catch(function () { pdfLib = null; });
  return pdfLib;
}
let sheetJob = 0;
function openSheet(l, s) {
  const job = ++sheetJob, body = $('sheet-body');
  $('sheet-kicker').textContent = s.name + ' · ' + l.no;
  $('sheet-title').textContent = l.title + ' 학습지';
  body.replaceChildren(h('p', { class: 'hint', text: '학습지를 불러오는 중…' }));
  if (sheet.showModal) sheet.showModal(); else sheet.setAttribute('open', '');
  const fallback = function () {
    if (job !== sheetJob) return;
    body.replaceChildren(h('p', { class: 'empty', text: '학습지를 불러오지 못했습니다. 처음 한 번은 인터넷에 연결된 상태에서 열어 주세요.' }));
  };
  loadPdfJs().then(function (lib) { return lib.getDocument(l.worksheet).promise; }).then(function (pdf) {
    if (job !== sheetJob) return;
    body.replaceChildren();
    const width = Math.max(300, body.clientWidth - 4), dpr = Math.min(2, window.devicePixelRatio || 1);
    let chain = Promise.resolve();
    for (let p = 1; p <= pdf.numPages; p++) {
      chain = chain.then(function () { return pdf.getPage(p); }).then(function (page) {
        if (job !== sheetJob) return null;
        const vp = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width * dpr });
        const cv = document.createElement('canvas');
        cv.className = 'sheet-page'; cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
        body.append(cv);
        return page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
      });
    }
    return chain;
  }).catch(fallback);
}
function closeSheet() { sheetJob++; if (sheet.close) sheet.close(); else sheet.removeAttribute('open'); }
$('sheet-close').addEventListener('click', closeSheet);
sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
sheet.addEventListener('close', function () { sheetJob++; });

/* ── 새 판 알림 : 앱처럼 띄워 둔 아이패드가 다시 앞으로 나올 때, 올린 새 내용이 있으면 알려 준다 ── */
function checkUpdate() {
  if (!/^https?:$/.test(location.protocol) || !window.fetch) return;
  fetch('version.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (v) {
    if (v && v.v && v.v !== DATA.version) $('update').hidden = false;
  }).catch(function () { /* 인터넷이 없으면 지금 것을 쓴다 */ });
}
$('update-go').addEventListener('click', function () { location.reload(); });
document.addEventListener('visibilitychange', function () { if (!document.hidden) checkUpdate(); });
window.addEventListener('focus', checkUpdate);

/* ── 화면 밝기 ── */
function isDark() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t) return t === 'dark';
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function themeLabel() { $('btn-theme').textContent = isDark() ? '밝은 화면' : '어두운 화면'; }
$('btn-theme').addEventListener('click', function () {
  const t = isDark() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  store('suup-theme', t); themeLabel();
});
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', themeLabel);
}

/* ── 전체 화면 : 브라우저가 허락할 때만 된다 ── */
const fullBtn = $('btn-full');
function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
function syncFull() {
  const on = !!fsElement();
  fullBtn.setAttribute('aria-pressed', String(on));
  fullBtn.setAttribute('aria-label', on ? '전체 화면 끝내기' : '전체 화면');
  fullBtn.title = on ? '전체 화면 끝내기' : '전체 화면 (전자칠판은 F11 이 더 편합니다)';
}
fullBtn.addEventListener('click', function () {
  const d = document, el = d.documentElement;
  if (fsElement()) { const ex = d.exitFullscreen || d.webkitExitFullscreen; if (ex) ex.call(d); return; }
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  const fail = function () { toast('이 브라우저에서는 전체 화면을 쓸 수 없습니다. 전자칠판 PC 는 키보드 F11 을 누르세요.'); };
  if (!req) { fail(); return; }
  try { const r = req.call(el); if (r && r.catch) r.catch(fail); } catch (e) { fail(); }
});
['fullscreenchange', 'webkitfullscreenchange'].forEach(function (t) { document.addEventListener(t, syncFull); });

/* ── 찾기 · 학년도 · 주소 ── */
qInput.addEventListener('input', function () { query = qInput.value; renderSide(); renderMain(); main.scrollTop = 0; });
qInput.addEventListener('keydown', function (e) { if (e.key === 'Escape') { qInput.value = ''; query = ''; renderSide(); renderMain(); } });
document.addEventListener('keydown', function (e) {
  if (e.key === '/' && document.activeElement !== qInput && !dlg.open && !sheet.open) { e.preventDefault(); qInput.focus(); }
});
yearSel.addEventListener('change', function () { year = yearSel.value; pickDefault(); writeHash(); render(); main.scrollTop = 0; });
window.addEventListener('hashchange', function () { readHash(); pickDefault(); render(); });

/* ── 시작 ── */
// 화면 밝기는 허브와 수업 화면(엔진)이 함께 쓴다
const savedTheme = load('suup-theme');
if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.setAttribute('data-theme', savedTheme);
themeLabel(); syncFull();
readHash(); pickDefault(); writeHash(); render();
checkUpdate();

/* 한 번 열면 이 기기에 담아 두어 인터넷이 끊겨도 열리게 한다 (USB 로 연 파일에서는 하지 않음) */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function () {
    offlineReady = true;
    const p = $('offline'); if (p) p.textContent = offlineText();
  }).catch(function () { /* 담아 두지 못해도 인터넷으로는 열린다 */ });
}
