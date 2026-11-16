'use strict';
/* 나의 수업 : 허브(수업 첫 화면)
   과목 → 단원 카드 → 소단원 줄([수업 화면] [시뮬레이션]). 모양은 「평택여고 과학 실험실」 첫 화면을 본떴다.
   목록은 tools/build.mjs 가 catalog.json 과 lessons/ 폴더를 읽어 이 파일 아래에 넣어 준다.
   로그인·저장 없음. 이 기기에서 마지막으로 본 과목과 화면 밝기만 브라우저에 기억한다. */
const DATA = JSON.parse(document.getElementById('hub-data').textContent);
const $ = function (id) { return document.getElementById(id); };
const subjBar = $('subjects'), unitsBox = $('units'), qInput = $('q'), yearSel = $('year'), sheet = $('sheet');
let year = DATA.current, subjId = null, query = '';

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
  sim: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
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
}

/* ── 그리기 ── */
function render() {
  $('year-label').textContent = year + '학년도' + (year !== DATA.current ? ' · 보관본' : '');
  $('curr').textContent = year + '학년도 ' + subjects().map(function (s) { return s.name; }).join(' · ') +
    '. 소단원마다 전자칠판·아이패드 수업 화면이 있고, 시뮬레이션으로 직접 실험해 볼 수 있어요.';
  renderYears(); renderSubjects(); renderMain();
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
function renderSubjects() {
  const out = [];
  yearData().groups.forEach(function (g) {
    out.push(h('span', { class: 'lvl', text: g.name }));
    g.subjects.forEach(function (s) {
      out.push(h('button', { type: 'button', 'aria-pressed': String(!query.trim() && s.id === subjId), onclick: function () { choose(s.id); } }, s.name));
    });
  });
  subjBar.replaceChildren.apply(subjBar, out);
}
function renderMain() {
  const notice = $('notice');
  notice.replaceChildren();
  if (year !== DATA.current) {
    add(notice, h('div', { class: 'banner' },
      h('span', { text: year + '학년도 보관본입니다. 수업 화면도 그해 모습 그대로 열립니다.' }),
      h('button', { class: 'btn', type: 'button', text: DATA.current + '학년도로 돌아가기', onclick: function () { year = DATA.current; pickDefault(); writeHash(); render(); } })));
  }
  const view = query.trim() ? searchView() : subjectView();
  $('status').textContent = view.status;
  unitsBox.replaceChildren();
  add(unitsBox, view.cards);
}
/** 'Ⅱ. 열과 에너지' → { mark: 'Ⅱ', name: '열과 에너지' } */
function unitParts(u) {
  const m = /^\s*([ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]+|\d+)\s*[.·]\s*(.+)$/.exec(u.name);
  return m ? { mark: m[1], name: m[2] } : { mark: '', name: u.name };
}
function counts(lessons) {
  const ready = lessons.filter(function (l) { return l.status !== 'prep'; }).length;
  const sims = lessons.filter(function (l) { return l.sims && l.sims.length; }).length;
  return '소단원 ' + lessons.length + (ready ? ' · 수업 화면 ' + ready : '') + (sims ? ' · 시뮬레이션 ' + sims : '');
}
function subjectView() {
  const s = findSubj(subjId);
  if (!s) return { status: '', cards: [h('p', { class: 'empty', text: '위에서 과목을 고르세요.' })] };
  const all = s.units.flatMap(function (u) { return u.lessons; });
  return {
    status: [s.name, s.note, counts(all)].filter(Boolean).join(' · '),
    cards: s.units.map(function (u, i) { return unitCard(s, u, i, u.lessons); }),
  };
}
function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ''); }
function searchView() {
  const q = norm(query);
  const cards = [];
  let n = 0;
  subjects().forEach(function (s) {
    s.units.forEach(function (u, i) {
      const hits = u.lessons.filter(function (l) {
        return norm([s.name, u.name, l.no, l.title].concat((l.sims || []).map(function (x) { return x.label; })).join(' ')).indexOf(q) >= 0;
      });
      if (hits.length) { n += hits.length; cards.push(unitCard(s, u, i, hits, true)); }
    });
  });
  if (!n) {
    cards.push(h('div', { class: 'empty' }, '‘' + query.trim() + '’에 맞는 소단원이 없어요. 다른 낱말로 찾아보세요.', h('br'),
      h('button', { class: 'btn', type: 'button', text: '검색 지우기', onclick: function () { qInput.value = ''; query = ''; renderSubjects(); renderMain(); } })));
  }
  return { status: '‘' + query.trim() + '’ 찾은 소단원 ' + n + '개', cards: cards };
}
/** 단원 카드 : 번호 칸 + 이름 + 소단원 줄 */
function unitCard(s, u, i, lessons, found) {
  const p = unitParts(u);
  return h('article', { class: 'unit' },
    h('header', { class: 'unit-head' },
      h('div', { class: 'tile' }, h('span', { class: 'no', text: String(i + 1).padStart(2, '0') }), h('span', { class: 'cd', text: (s.short || s.name) + (p.mark ? ' ' + p.mark : '') })),
      h('div', null, h('h3', { text: p.name }), h('p', { class: 'cnt', text: found ? s.name + ' · ' + counts(lessons) : counts(lessons) }))),
    h('ol', { class: 'lessons' }, lessons.map(function (l) { return row(l, s); })));
}
/** 소단원 한 줄 : [수업 화면] [시뮬레이션] [학습지] */
function row(l, s) {
  const ready = l.status !== 'prep', sims = l.sims || [];
  const acts = [];
  if (ready) acts.push(h('a', { class: 'act go', href: l.href }, icon('play'), '수업 화면'));
  sims.forEach(function (x) {
    acts.push(h('a', { class: 'act sim', href: x.href, title: x.label + ' 시뮬레이션' }, icon('sim'), sims.length > 1 ? x.label : '시뮬레이션'));
  });
  if (l.worksheet) acts.push(h('button', { class: 'act', type: 'button', title: '학습지 보기', onclick: function () { openSheet(l, s); } }, icon('doc'), '학습지'));
  return h('li', { class: ready ? null : 'prep' },
    h('span', { class: 'ln', text: l.no }),
    ready ? h('a', { class: 'lt', href: l.href, text: l.title }) : h('span', { class: 'lt', text: l.title }),
    acts.length ? h('span', { class: 'acts' }, acts) : null);
}
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

/* ── 찾기 · 학년도 · 주소 ── */
qInput.addEventListener('input', function () { query = qInput.value; renderSubjects(); renderMain(); });
qInput.addEventListener('keydown', function (e) { if (e.key === 'Escape') { qInput.value = ''; query = ''; renderSubjects(); renderMain(); } });
document.addEventListener('keydown', function (e) {
  if (e.key === '/' && document.activeElement !== qInput && !sheet.open) { e.preventDefault(); qInput.focus(); }
});
yearSel.addEventListener('change', function () { year = yearSel.value; pickDefault(); writeHash(); render(); });
window.addEventListener('hashchange', function () { readHash(); pickDefault(); render(); });

/* ── 시작 ── */
// 화면 밝기는 허브와 수업 화면(엔진)이 함께 쓴다
const savedTheme = load('suup-theme');
if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.setAttribute('data-theme', savedTheme);
themeLabel();
readHash(); pickDefault(); writeHash(); render();
checkUpdate();

/* 한 번 열면 이 기기에 담아 두어 인터넷이 끊겨도 열리게 한다 (USB 로 연 파일에서는 하지 않음) */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register('sw.js').catch(function () { /* 담아 두지 못해도 인터넷으로는 열린다 */ });
}
