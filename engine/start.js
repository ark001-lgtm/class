/* ═══════════════ 시작 : 장면 파일 다음에 붙는다 ═══════════════ */
const SCENES = SCENE_LIST.slice();
// 화면 밝기는 허브에서 고른 것을 따른다
try { const t = localStorage.getItem('suup-theme'); if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t); } catch (e) { /* 기본 테마 */ }
readTheme(); themeLabel();
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const on = function () { readTheme(); themeLabel(); if (inkReady) redrawInk(); };
  if (mq.addEventListener) mq.addEventListener('change', on);
}
// 수업 목록(허브)으로 : 나의 수업 웹앱에서 열었을 때만 보인다
const hubLink = document.getElementById('btn-hub');
if (SUUP.hub && /^https?:$/.test(location.protocol)) { hubLink.href = SUUP.hub; hubLink.hidden = false; }
// 짝인 시뮬레이션 : 웹앱에서 열었을 때만 (USB 로 들고 간 파일에는 시뮬레이션이 없다). 둘이면 첫째로 가고, 둘째는 그 화면의 실험 단추로
const simLink = document.getElementById('btn-sim');
if (SUUP.sims && SUUP.sims.length && /^https?:$/.test(location.protocol)) {
  simLink.href = SUUP.sims[0].href; simLink.title = SUUP.sims.map(function (s) { return s.label; }).join(' · ') + ' 시뮬레이션';
  simLink.hidden = false;
}
// 아이패드는 펜슬로만 쓰므로 [손 필기]가 필요 없다
if (IS_IPAD) toolHand.hidden = true;
// 아이패드를 세로로 들면 수업 화면이 작아진다 : 가로로 돌리라고 알려 준다 (누르면 닫힘)
const rotateHint = document.getElementById('rotate-hint');
let rotateClosed = false;
function syncRotate() { rotateHint.hidden = rotateClosed || !(IS_IPAD || navigator.maxTouchPoints > 1) || window.innerWidth >= window.innerHeight; }
rotateHint.addEventListener('click', function () { rotateClosed = true; syncRotate(); });
window.addEventListener('resize', syncRotate);
syncRotate();
document.getElementById('btn-prev').addEventListener('click', function () { turn(-1); });
document.getElementById('btn-next').addEventListener('click', function () { turn(1); });
document.addEventListener('keydown', function (ev) {
  const t = ev.target;
  const inRange = !!(t && t.tagName === 'INPUT');
  if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'z' || ev.key === 'Z')) { ev.preventDefault(); undoInk(); return; }
  if (ev.key === 'PageDown' || (!inRange && (ev.key === 'ArrowRight' || ev.key === 'ArrowDown'))) { ev.preventDefault(); turn(1); }
  else if (ev.key === 'PageUp' || (!inRange && (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp'))) { ev.preventDefault(); turn(-1); }
  else if (ev.key === 'Home' && !inRange) { go(0); }
  else if (ev.key === 'End' && !inRange) { go(SCENES.length - 1); }
  // 확대 · 축소 : + − 0 (Ctrl 과 함께 누르면 브라우저 자체 확대이므로 건드리지 않는다)
  else if (!inRange && !ev.ctrlKey && !ev.metaKey && !ev.altKey && (ev.key === '+' || ev.key === '=')) { ev.preventDefault(); zoomStep(1); }
  else if (!inRange && !ev.ctrlKey && !ev.metaKey && !ev.altKey && (ev.key === '-' || ev.key === '_')) { ev.preventDefault(); zoomStep(-1); }
  else if (!inRange && !ev.ctrlKey && !ev.metaKey && !ev.altKey && ev.key === '0') { ev.preventDefault(); zoomTo(1); }
});
window.addEventListener('resize', fit);
fit();
applyZoom();
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
