/* 시뮬레이션 전체 화면 — 전자칠판·TV에서 실험 장치(.scene)만 화면 가득 보여 준다.
   조작 막대(.controls) 끝에 [↺ 모두 초기화]·[⛶ 전체 화면] 버튼을 붙이고, Esc 나 같은 버튼으로 돌아온다.
   캔버스 크기는 simkit.js 의 ResizeObserver 가 맞추고, 크기에 따라 다시 그리는 화면을 위해 resize 이벤트도 보낸다. */
(() => {
  const scene = document.querySelector('.scene'); if (!scene) return;
  const bar = scene.querySelector('.controls') || scene;
  const st = document.createElement('style');
  st.textContent = `.sfull{margin-left:auto;font:inherit;font-size:13px;font-weight:600;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;padding:6px 12px;cursor:pointer;white-space:nowrap}
.sfull{transition:transform .12s ease-out}.sfull:hover{border-color:var(--accent);color:var(--accent)}.sfull:active{transform:scale(.97)}
.scene:fullscreen{background:var(--surface);display:flex;flex-direction:column;justify-content:center;border-radius:0}
.scene:fullscreen .canvas-box{width:min(100vw,calc((100vh - 120px) * 1.45));max-width:none;margin:0 auto;flex:0 0 auto}
.scene:fullscreen .controls{justify-content:center;font-size:17px}
.btn[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
@media print{.sfull,.sreset{display:none}}`;
  document.head.appendChild(st);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'sfull'; b.title = '실험 장치만 화면 가득 보기 (Esc로 돌아오기)';
  const label = () => { b.textContent = document.fullscreenElement === scene ? '✕ 전체 화면 끝내기' : '⛶ 전체 화면'; };
  b.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : scene.requestFullscreen()).catch(() => {});
  document.addEventListener('fullscreenchange', () => { label(); setTimeout(() => dispatchEvent(new Event('resize')), 120); });
  // [↺ 모두 초기화]: PhET 'Reset All'처럼 지금 모드를 처음 상태로(주소 #모드는 그대로 두고 다시 연다)
  const r = document.createElement('button'); r.type = 'button'; r.className = 'btn sreset'; r.textContent = '↺ 모두 초기화'; r.title = '조절 값과 측정 기록을 모두 처음 상태로 되돌린다';
  r.onclick = () => location.reload();
  label(); bar.append(r); if (document.fullscreenEnabled) bar.append(b);
})();
