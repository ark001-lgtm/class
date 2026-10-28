/* ═══════════════ 시작 : 장면 파일 다음에 붙는다 ═══════════════ */
const SCENES = [{ id: 'home', title: '목차', kicker: SUUP.kicker + ' · 전자칠판 수업 화면', make: sceneHome }].concat(SCENE_LIST);
try { const t = localStorage.getItem('suup-theme'); if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t); } catch (e) { /* 기본 테마 */ }
try { if (localStorage.getItem('suup-pen-auto') === '0') INK.penAuto = false; } catch (e) { /* 기본 : 켬 */ }
readTheme(); themeLabel();
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const on = function () { readTheme(); themeLabel(); if (inkReady) redrawInk(); };
  if (mq.addEventListener) mq.addEventListener('change', on);
}
/* 전체 화면 : 브라우저가 허락할 때만 된다. 다른 웹페이지 안(예 : Claude 링크 화면)에 들어 있으면 브라우저가 막는다.
   그럴 때는 아무 일도 없는 것처럼 보이지 않게 안내를 띄운다. 아이패드 사파리는 16.4 부터 됨(그 전은 webkit 접두사) */
const fullBtn = document.getElementById('btn-full');
let toastTimer = 0;
function toast(html, ms) {
  const t = document.getElementById('toast');
  t.innerHTML = html; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.hidden = true; }, ms || 6000);
}
document.getElementById('toast').addEventListener('click', function () { this.hidden = true; });
function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
function fsHelp() {
  const framed = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  toast(framed
    ? '<b>이 창에서는 전체 화면을 쓸 수 없습니다.</b><br>다른 웹페이지(Claude 링크 화면) 안에 들어 있으면 브라우저가 막습니다.<br>· 받은 HTML 파일을 크롬 · 엣지 · 웨일로 직접 열면 이 단추로 전체 화면이 됩니다.<br>· 전자칠판 PC 는 키보드 <b>F11</b> 로 브라우저 전체를 키울 수 있습니다.'
    : '<b>이 브라우저에서는 전체 화면을 쓸 수 없습니다.</b><br>전자칠판 PC 는 키보드 <b>F11</b>, 아이패드는 사파리(iPadOS 16.4 이상)에서 열어 보세요.', 9000);
}
function syncFull() {
  const on = !!fsElement();
  fullBtn.setAttribute('aria-pressed', String(on));
  fullBtn.setAttribute('aria-label', on ? '전체 화면 끝내기' : '전체 화면');
  fullBtn.title = on ? '전체 화면 끝내기 (F 키)' : '전체 화면 (F 키)';
}
function toggleFull() {
  const d = document, el = d.documentElement;
  if (fsElement()) {
    const ex = d.exitFullscreen || d.webkitExitFullscreen;
    try { const r = ex && ex.call(d); if (r && r.catch) r.catch(function () { /* 이미 나옴 */ }); } catch (e) { /* 무시 */ }
    return;
  }
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  const enabled = d.fullscreenEnabled !== undefined ? d.fullscreenEnabled : d.webkitFullscreenEnabled;
  if (!req || enabled === false) { fsHelp(); return; }
  let failed = false;
  const fail = function () { if (!failed) { failed = true; fsHelp(); } };
  const seen = FS_CHANGES;
  try {
    const r = req.call(el);
    if (r && r.catch) r.catch(fail);
  } catch (e) { fail(); return; }
  // 약속(promise)을 돌려주지 않는 옛 사파리 : 한참 뒤에도 바뀐 적이 없고 전체 화면도 아니면 안내
  setTimeout(function () { if (!fsElement() && FS_CHANGES === seen) fail(); }, 1500);
}
let FS_CHANGES = 0;
['fullscreenchange', 'webkitfullscreenchange'].forEach(function (t) { document.addEventListener(t, function () { FS_CHANGES++; syncFull(); fit(); }); });
document.getElementById('btn-home').addEventListener('click', function () { go(0); });
document.getElementById('btn-prev').addEventListener('click', function () { go(idx - 1); });
document.getElementById('btn-next').addEventListener('click', function () { go(idx + 1); });
document.getElementById('btn-full').addEventListener('click', toggleFull);
document.addEventListener('keydown', function (ev) {
  const t = ev.target;
  const inRange = !!(t && t.tagName === 'INPUT');
  if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'z' || ev.key === 'Z')) { ev.preventDefault(); undoInk(); return; }
  if (ev.key === 'PageDown' || (!inRange && ev.key === 'ArrowRight')) { ev.preventDefault(); go(idx + 1); }
  else if (ev.key === 'PageUp' || (!inRange && ev.key === 'ArrowLeft')) { ev.preventDefault(); go(idx - 1); }
  else if (ev.key === 'Home' && !inRange) { go(0); }
  else if (ev.key === 'End' && !inRange) { go(SCENES.length - 1); }
  else if ((ev.key === 'f' || ev.key === 'F') && !inRange && !ev.ctrlKey && !ev.metaKey && !ev.altKey) { toggleFull(); }
  // 확대 · 축소 : + − 0 (Ctrl 과 함께 누르면 브라우저 자체 확대이므로 건드리지 않는다)
  else if (!inRange && !ev.ctrlKey && !ev.metaKey && !ev.altKey && (ev.key === '+' || ev.key === '=')) { ev.preventDefault(); zoomStep(1); }
  else if (!inRange && !ev.ctrlKey && !ev.metaKey && !ev.altKey && (ev.key === '-' || ev.key === '_')) { ev.preventDefault(); zoomStep(-1); }
  else if (!inRange && !ev.ctrlKey && !ev.metaKey && !ev.altKey && ev.key === '0') { ev.preventDefault(); zoomTo(1); }
});
window.addEventListener('resize', fit);
fit();
applyZoom(); syncFull();
let start = 0;
try { const hs = (location.hash || '').replace('#', ''); SCENES.forEach(function (s, i) { if (s.id === hs) start = i; }); } catch (e) { /* 처음부터 */ }
go(start);
loadInk();
syncTools();
INK.key = pageKey();
inkReady = true;
redrawInk();
requestAnimationFrame(loop);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); });
