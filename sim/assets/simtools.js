/* 시뮬레이션 도구 줄 — PhET 설계에서 가져옴(Podolefsky 외 2013, 'implicit scaffolding')
   조작 막대(.controls) 아래에 한 줄을 붙인다:
   - 도구 상자: [⏱ 초시계]·[📏 자]를 켜면 실험 장치 위에 나타나고, 끌어서 원하는 곳에 댄다(측정 기능 연습).
     초시계는 실험 시간(Kit.simT — [🐢 느리게]·일시정지를 따른다)을 잰다. 자는 같은 간격 눈금으로 길이를 '비교'하는 데 쓴다.
   - 보이기: [그래프]·[수치]를 끄고 켠다. 먼저 현상만 보고 예상한 뒤 표현을 켜서 확인하게 할 수 있다.
   - 비교 장면: assets/simpreset-data.js 의 SIMPRESET['단원#모드'] = [{n: '이름', d: [[선택자, 값?], …]}]
     값이 없으면 누르고(click), 숫자면 조절 막대 값, true/false 면 체크 상자. 순서대로 실행한다. */
(() => {
  const key = (() => { const m = location.pathname.match(/([a-z0-9]+\/[a-z0-9]+)\/sim(?:\.html)?$/i); return m ? m[1] : null; })();
  const scene = document.querySelector('.scene'), bar = scene && scene.querySelector('.controls'), box = scene && scene.querySelector('.canvas-box');
  if (!key || !bar || !box) return;
  const st = document.createElement('style');
  st.textContent = `.stools{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;padding:8px 14px;border-top:1px dashed var(--line);background:var(--soft);font-size:13px}
.stools .tg{display:inline-flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap}
.stools .lb{font-weight:700;color:var(--muted);border:0;background:none;padding:0;box-shadow:none}
.stools .pre{font:inherit;font-size:13px;font-weight:600;border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line));background:var(--surface);color:var(--ink);border-radius:8px;padding:4px 10px;cursor:pointer;transition:transform .12s ease-out}
.stools .pre:active{transform:scale(.97)}
.stool{position:absolute;z-index:3;touch-action:none;cursor:grab;user-select:none;font-family:var(--f-body,inherit)}
.stool:active{cursor:grabbing}
.swatch{left:12px;top:12px;background:#22282e;color:#fff;border-radius:12px;padding:8px 10px;box-shadow:0 2px 8px rgba(0,0,0,.25);display:flex;align-items:center;gap:8px}
.swatch output{font:700 22px/1 ui-monospace,Menlo,monospace;min-width:5.2em;text-align:right;background:#0b1f17;color:#7dffb0;padding:6px 8px;border-radius:6px}
.swatch button{font:inherit;font-size:13px;font-weight:700;border:0;border-radius:6px;padding:6px 9px;cursor:pointer;background:#3a434c;color:#fff}
.ruler{left:30%;top:60%;width:320px;height:40px;background:rgba(246,220,140,.92);border:1px solid #b08a2e;border-radius:3px;transform-origin:0 0;
background-image:repeating-linear-gradient(90deg,#5a4310 0 1px,transparent 1px 16px),repeating-linear-gradient(90deg,#5a4310 0 1px,transparent 1px 80px);background-size:100% 9px,100% 18px;background-repeat:no-repeat;background-position:0 0,0 0}
.ruler span{position:absolute;top:19px;font:600 11px/1 sans-serif;color:#5a4310;transform:translateX(-50%)}
.ruler button{position:absolute;right:-30px;top:8px;font:700 12px/1 sans-serif;border:1px solid #b08a2e;background:#fff8dc;border-radius:4px;padding:2px 4px;cursor:pointer}
@media (max-width:600px){.ruler{left:8px}}
@media print{.stools,.stool{display:none}}`;
  document.head.appendChild(st);
  // 끌기: 포인터를 잡고(setPointerCapture) 실험 장치 상자 안에서만 움직인다. 버튼을 누를 때는 끌지 않는다
  const drag = el => { let sx, sy, ox, oy; el.addEventListener('pointerdown', e => { if (e.target.closest('button') || e.button > 0) return; el.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; });
    el.addEventListener('pointermove', e => { if (!el.hasPointerCapture(e.pointerId)) return; const W = box.clientWidth, H = box.clientHeight; el.style.left = Math.max(-el.offsetWidth / 2, Math.min(W - 20, ox + e.clientX - sx)) + 'px'; el.style.top = Math.max(-10, Math.min(H - 20, oy + e.clientY - sy)) + 'px'; }); };
  const row = document.createElement('div'); row.className = 'stools'; row.setAttribute('aria-label', '도구와 비교 장면');
  const tog = (label, title, on, fn) => { const l = document.createElement('label'); l.className = 'tg'; l.title = title; const c = document.createElement('input'); c.type = 'checkbox'; c.checked = on; c.onchange = () => fn(c.checked); l.append(c, ' ' + label); return l; };
  const lab = t => { const s = document.createElement('span'); s.className = 'lb'; s.textContent = t; return s; };
  const parts = [lab('도구')];
  // 초시계: 실험 시간 기준
  const sw = document.createElement('div'); sw.className = 'stool swatch'; sw.hidden = true; sw.setAttribute('aria-label', '초시계(실험 시간)');
  sw.innerHTML = '<output>0.00 s</output><button type="button" data-a="go">시작</button><button type="button" data-a="zero">0</button>';
  let acc = 0, t0 = null; const out = sw.querySelector('output'), goB = sw.querySelector('[data-a="go"]');
  const now = () => acc + (t0 == null ? 0 : (window.Kit && Kit.simT || 0) - t0);
  sw.onclick = e => { const a = e.target.dataset && e.target.dataset.a; if (a === 'go') { if (t0 == null) { t0 = (window.Kit && Kit.simT) || 0; goB.textContent = '멈춤'; } else { acc = now(); t0 = null; goB.textContent = '시작'; } } if (a === 'zero') { acc = 0; if (t0 != null) t0 = (window.Kit && Kit.simT) || 0; } };
  (function f() { if (!sw.hidden) { const v = now().toFixed(2) + ' s'; if (out.textContent !== v) out.textContent = v; } requestAnimationFrame(f); })();
  // 자: 굵은 눈금 5칸마다 숫자. ↻로 가로·세로를 바꾼다
  const ru = document.createElement('div'); ru.className = 'stool ruler'; ru.hidden = true; ru.setAttribute('aria-label', '자(같은 간격 눈금)');
  ru.innerHTML = [0, 1, 2, 3, 4].map(i => `<span style="left:${i * 80}px">${i * 5}</span>`).join('') + '<button type="button" title="가로·세로 바꾸기">↻</button>';
  ru.querySelector('button').onclick = () => { ru.style.transform = ru.style.transform ? '' : 'rotate(90deg)'; };
  [sw, ru].forEach(el => { drag(el); box.appendChild(el); });
  setTimeout(() => { if (window.Kit && Kit.timed) parts.splice(1, 0, tog('⏱ 초시계', '실험 시간을 재는 초시계를 꺼내 실험 장치 위에 끌어다 놓는다', false, v => { sw.hidden = !v; })); build(); }, 0);
  parts.push(tog('📏 자', '같은 간격 눈금의 자를 꺼내 길이·간격을 비교한다', false, v => { ru.hidden = !v; }));
  // 보이기: 그래프·수치
  const gp = document.getElementById('graph'), gPanel = gp && gp.closest('.panel'), stats = document.getElementById('stats') || document.querySelector('.stats');
  const vis = [];
  if (gPanel) vis.push(tog('그래프', '그래프를 끄고 먼저 예상한 뒤 켜서 확인한다', true, v => { gPanel.style.visibility = v ? '' : 'hidden'; }));
  if (stats) vis.push(tog('수치', '측정값 칸을 끄고 켠다', true, v => { stats.style.visibility = v ? '' : 'hidden'; }));
  // 비교 장면: 지금 모드의 것만
  const pre = document.createElement('span'); pre.style.cssText = 'display:contents';
  const run = d => d.forEach(([sel, v]) => { const el = document.querySelector(sel); if (!el) return;
    if (typeof v === 'boolean') { if (el.checked !== v) { el.checked = v; el.dispatchEvent(new Event('change', {bubbles: true})); el.dispatchEvent(new Event('input', {bubbles: true})); } }
    else if (v != null) { el.value = v; el.dispatchEvent(new Event('input', {bubbles: true})); el.dispatchEvent(new Event('change', {bubbles: true})); }
    else el.click(); });
  const mode = () => { const c = document.querySelector('[data-mode][aria-pressed="true"]'); return c ? c.dataset.mode : 'main'; };
  let shown = null;
  const showPre = () => { const m = mode(); if (m === shown) return; shown = m; const P = ((window.SIMPRESET || {})[key + '#' + m]) || []; pre.replaceChildren(); if (!P.length) return; pre.append(lab('비교 장면'));
    P.forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pre'; b.textContent = p.n; if (p.t) b.title = p.t; b.onclick = () => run(p.d); pre.append(b); }); };
  function build() { row.replaceChildren(...parts, ...(vis.length ? [lab('보이기'), ...vis] : []), pre); }
  build(); bar.after(row);
  const start = () => { showPre(); new MutationObserver(showPre).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['aria-pressed']}); };
  if (window.SIMPRESET) start(); else { const sc = document.createElement('script'); sc.src = (document.body.dataset.root || '../../') + 'assets/simpreset-data.js'; sc.onload = sc.onerror = start; document.head.appendChild(sc); }
})();
