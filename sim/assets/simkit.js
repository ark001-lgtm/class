/* 시뮬레이션 공통 도구: 캔버스 크기 맞추기, 테마 색, 그래프 축, 탭 전환, 반복 실행 */
// 사용 안내 카드(assets/simguide.js): 시뮬레이션 페이지면 함께 불러온다
(() => { if (!/\/sim(\.html)?$/.test(location.pathname)) return; const go = () => ['simguide.js', 'simrecord.js', 'simfull.js', 'simtools.js'].forEach(f => { const s = document.createElement('script'); s.src = (document.body.dataset.root || '../../') + 'assets/' + f; document.head.appendChild(s); }); /* simrecord.js: 측정값 기록표, simfull.js: 전체 화면, simtools.js: 초시계·자·보이기·비교 장면 */ document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go(); })();
// 오래된 전자칠판 브라우저(크롬 99·사파리 16 이전)에는 캔버스 roundRect 가 없어 그리기가 멈춘다 → 둥근 모서리를 직접 그리는 대체 함수
if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Math.min(Array.isArray(r) ? r[0] : r || 0, Math.abs(w) / 2, Math.abs(h) / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); };
window.Kit = (() => {
  const C = {};
  const TOKENS = ['surface','ink','muted','line','soft','grid','phy','chem','bio','earth','gen','hot','cold','warn','accent'];
  function colors(){ const cs = getComputedStyle(document.documentElement); TOKENS.forEach(k => C[k] = cs.getPropertyValue('--' + k).trim()); return C; }
  const family = () => getComputedStyle(document.body).fontFamily;
  const font = (s, w) => `${w || 400} ${s}px ${family()}`;

  // 캔버스를 부모 상자 크기와 화면 배율에 맞추고, 크기가 바뀌면 다시 맞춘다
  function canvas(cv){
    const o = {cv, g: cv.getContext('2d'), w: 0, h: 0};
    // 좁은 화면(휴대폰)은 폭 520 px 기준으로 그린 뒤 줄여 보인다 — 글자 크기는 고정·위치만 비율인 그림에서 글자끼리 겹치지 않게. 줄인 비율 cv._k(클릭·끌기 좌표는 이 값으로 나눔)
    const fit = () => { const r = cv.parentElement.getBoundingClientRect(), d = devicePixelRatio || 1, k = r.width > 0 && r.width < 520 ? r.width / 520 : 1; cv._k = k;
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); o.g.setTransform(d * k, 0, 0, d * k, 0, 0); o.w = r.width / k; o.h = r.height / k; };
    new ResizeObserver(fit).observe(cv.parentElement); fit(); return o;
  }

  // 온도 → 색 (차가움 파랑, 뜨거움 빨강). 두 테마 모두에서 읽히도록 채도·명도 고정
  function tempColor(t, lo, hi){ const f = Math.max(0, Math.min(1, (t - lo) / (hi - lo))); return `hsl(${215 - 215 * f} 78% 55%)`; }

  // 그래프 축: ax = {x:[min,max,step,'이름'], y:[...]} → 좌표 변환 함수
  function axes(cvo, ax, pad){
    const g = cvo.g, P = Object.assign({L: 48, R: 14, T: 12, B: 32}, pad || {});
    const w = cvo.w - P.L - P.R, h = cvo.h - P.T - P.B;
    const [x0, x1, xs, xl] = ax.x, [y0, y1, ys, yl] = ax.y;
    const X = v => P.L + (v - x0) / (x1 - x0) * w, Y = v => P.T + h - (v - y0) / (y1 - y0) * h;
    if (!P.keep) { g.fillStyle = C.surface; g.fillRect(0, 0, cvo.w, cvo.h); }
    g.font = font(11); g.lineWidth = 1;
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (let v = y0; v <= y1 + 1e-9; v += ys) { g.strokeStyle = C.grid; g.beginPath(); g.moveTo(P.L, Y(v) + .5); g.lineTo(P.L + w, Y(v) + .5); g.stroke(); g.fillStyle = C.muted; if (!P.noY) g.fillText(+v.toFixed(2), P.L - 6, Y(v)); }
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (let v = x0; v <= x1 + 1e-9; v += xs) g.fillText(+v.toFixed(2), X(v), P.T + h + 5);
    if (xl) g.fillText(xl, P.L + w / 2, cvo.h - 13);
    if (yl) { g.save(); g.translate(P.keep ? P.L - 37 : 11, P.T + h / 2); g.rotate(-Math.PI / 2); g.textBaseline = 'middle'; g.fillText(yl, 0, 0); g.restore(); }
    g.strokeStyle = C.line; g.beginPath(); g.moveTo(P.L, P.T); g.lineTo(P.L, P.T + h); g.lineTo(P.L + w, P.T + h); g.stroke();
    return {X, Y, L: P.L, T: P.T, w, h};
  }
  function line(cvo, pts, m, color, width, dash){
    if (pts.length < 2) return; const g = cvo.g;
    g.strokeStyle = color; g.lineWidth = width || 2.5; g.setLineDash(dash || []);
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(m.X(p[0]), m.Y(p[1])) : g.moveTo(m.X(p[0]), m.Y(p[1]))); g.stroke(); g.setLineDash([]);
  }
  function arrow(g, x0, y0, x1, y1, color, width){
    const a = Math.atan2(y1 - y0, x1 - x0), hl = Math.max(7, (width || 2) * 3);
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = width || 2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(a) * hl * .6, y1 - Math.sin(a) * hl * .6); g.stroke();
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(a - .45) * hl, y1 - Math.sin(a - .45) * hl); g.lineTo(x1 - Math.cos(a + .45) * hl, y1 - Math.sin(a + .45) * hl); g.closePath(); g.fill();
  }
  function label(g, text, x, y, opt){
    opt = opt || {}; g.font = font(opt.size || 12, opt.weight); g.fillStyle = opt.color || C.ink;
    g.textAlign = opt.align || 'center'; g.textBaseline = opt.base || 'middle';
    // opt.maxW: 이 폭을 넘으면 띄어쓰기 단위로 줄을 나눠 y 를 가운데로 여러 줄(좁은 화면에서 양끝이 잘리지 않게)
    if (opt.maxW && g.measureText(text).width > opt.maxW) { const L = []; let cur = ''; String(text).split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && g.measureText(t).width > opt.maxW) { L.push(cur); cur = w; } else cur = t; }); if (cur) L.push(cur);
      const lh = (opt.size || 12) * 1.3; L.forEach((t, i) => g.fillText(t, x, y + (i - (L.length - 1) / 2) * lh)); return L.length; }
    g.fillText(text, x, y); return 1;
  }

  // 탭: 버튼[data-mode] 묶음. 주소 #모드로 바로 열 수 있다
  function tabs(onSet, modes){
    const btns = [...document.querySelectorAll('[data-mode]')];
    const set = m => {
      btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
      document.querySelectorAll('[data-only]').forEach(el => el.hidden = !el.dataset.only.split(' ').includes(m));
      document.querySelectorAll('[data-act]').forEach(el => { el.hidden = el.dataset.act.split(' ').includes(m) || (el.dataset.only ? !el.dataset.only.split(' ').includes(m) : false); });   // 실험 단추가 [일시정지]를 대신하는 모드
      try { history.replaceState(null, '', '#' + m); } catch (e) {}
      onSet(m); window.dispatchEvent(new Event('lessonmode'));   // 차시 연결 막대·수업 흐름 카드가 지금 모드의 차시로 바뀌게
    };
    btns.forEach(b => b.onclick = () => set(b.dataset.mode));
    const want = (location.hash || '').slice(1);
    set(modes.includes(want) ? want : modes[0]);
    return set;
  }
  // 버튼 묶음 하나(seg)에서 값 고르기
  function seg(el, attr, onSet){
    const bs = [...el.querySelectorAll(`[data-${attr}]`)];
    const set = v => { bs.forEach(b => b.setAttribute('aria-pressed', b.dataset[attr] === String(v))); onSet(v); };
    bs.forEach(b => b.onclick = () => set(b.dataset[attr]));
    return set;
  }

  // 반복 실행: step(dt)는 재생 중에만, draw()는 항상
  // 시간이 흐르는 화면이면 조작 막대에 [🐢 느리게]를 붙인다(PhET 'Slow Motion'처럼 빠른 현상을 1/4 빠르기로)
  function loop(step, draw, playBtn){
    const st = {run: !matchMedia('(prefers-reduced-motion: reduce)').matches, speed: 1};
    const bar = document.querySelector('.scene .controls');
    if (bar && !/^\(\)\s*=>\s*\{\s*\}$/.test(String(step))) {
      Kit.timed = true;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = '🐢 느리게'; b.title = '시간을 1/4 빠르기로 흐르게 한다';
      b.setAttribute('aria-pressed', 'false');
      b.onclick = () => { st.speed = st.speed < 1 ? 1 : .25; b.setAttribute('aria-pressed', st.speed < 1); };
      const play = bar.querySelector('#play'); play ? play.after(b) : bar.prepend(b);
      // 시간이 흐르지 않는 모드에서는 [일시정지]·[느리게]를 숨긴다: #play 의 data-only, 없으면 조절 막대 칸의 data-anim(움직이는 모드 목록)을 둘이 함께 따른다
      const pb = play || playBtn, only = pb && pb.dataset.only != null ? pb.dataset.only : bar.dataset.anim;   // 빈 목록 = 모든 모드가 멈춘 그림
      if (only != null) { b.dataset.only = only; if (pb) pb.dataset.only = only; const cur = document.querySelector('[data-mode][aria-pressed="true"]'); if (cur) [b, pb].forEach(el => { if (el) el.hidden = !only.split(' ').includes(cur.dataset.mode) || (el.dataset.act || '').split(' ').includes(cur.dataset.mode); }); }
    }
    const upd = () => { if (playBtn) playBtn.textContent = st.run ? '⏸ 정지' : '▶ 계속'; };
    if (playBtn) playBtn.onclick = () => { st.run = !st.run; upd(); };
    upd(); st.upd = upd; Kit._loop = st;
    // [일시정지]가 숨는 모드로 바뀌면 멈춰 둔 시간을 다시 흐르게(다시 누를 단추가 없으므로)
    window.addEventListener('lessonmode', () => { const pb = (bar && bar.querySelector('#play')) || playBtn, only = pb ? pb.dataset.only : null, cur = document.querySelector('[data-mode][aria-pressed="true"]'); if (only != null && cur && !only.split(' ').includes(cur.dataset.mode) && !st.run && !matchMedia('(prefers-reduced-motion: reduce)').matches) { st.run = true; upd(); } });
    let last = performance.now();
    const f = now => { const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; colors(); if (st.run) { step(dt * st.speed); Kit.simT += dt * st.speed; } draw(); requestAnimationFrame(f); };
    colors(); requestAnimationFrame(f);
    return st;
  }
  // 직접 끌기(PhET처럼 화면 속 물체를 잡아 옮김) — 이름이 grab 인 까닭: simex.js 에 모드 하나용 Kit.drag(cv, st, mode, on)가 따로 있다(q/ac·p/light 사용). o.hit(x, y) → 잡을 대상 또는 null, o.move(대상, x, y), o.end(대상). 마우스·터치·펜 모두
  // 반환 {hover, active} 로 그리기에서 손잡이 테두리를 표시한다. 맞힘 반경은 hit 쪽에서 22px 이상으로(손가락)
  function grab(cv, o){ const s = {hover: null, active: null}, pos = e => { const r = cv.getBoundingClientRect(), k = cv._k || 1; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => { const [x, y] = pos(e), t = o.hit(x, y); if (t == null) return; s.active = t; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.preventDefault(); o.move(t, x, y); });
    cv.addEventListener('pointermove', e => { const [x, y] = pos(e); if (s.active != null) o.move(s.active, x, y); else { const was = s.hover; s.hover = o.hit(x, y); if (s.hover != null) cv.style.cursor = 'grab'; else if (was != null) cv.style.cursor = ''; } });   // 한 그림판에 끌기가 여럿이면 자기가 바꾼 커서만 되돌림
    const up = () => { if (s.active == null) return; const t = s.active; s.active = null; cv.style.cursor = s.hover != null ? 'grab' : ''; if (o.end) o.end(t); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', () => { if (s.active == null) { s.hover = null; cv.style.cursor = ''; } });
    return s; }
  // 끌어서 정한 값을 연결된 조절 막대에 넣는다: 눈금(step)에 맞춰 반올림·범위 안으로, 바뀌면 input 이벤트 → 기록표·비교 장면·초기화가 그대로 작동
  function setRange(id, v){ const el = document.getElementById(id); if (!el) return; const st = +el.step || 1, lo = +el.min, hi = +el.max; v = Math.max(lo, Math.min(hi, Math.round((v - lo) / st) * st + lo)); v = +v.toFixed(6); if (+el.value === v) return; el.value = v; el.dispatchEvent(new Event('input', {bubbles: true})); }
  // 실험 단추 하나로 시작·정지·다시 하기
  // o.go(): 실험을 처음부터 시작, o.busy(): 진행 중인가, o.resume: 멈췄을 때 이름(예 '다시 상승'), o.pause: 진행 중 이름(기본 '정지')
  // 이 단추가 보이는 모드에서는 화면 공통 [일시정지]를 숨긴다(data-act). [🐢 느리게]는 그대로.
  function act(btn, o){ if (!btn) return; const base = btn.textContent.trim(), L = () => Kit._loop || {run: true, upd(){}};
    btn.onclick = () => { const l = L(); if (o.busy()) l.run = !l.run; else { o.go(); l.run = true; } l.upd(); };
    const play = document.getElementById('play'), all = [...document.querySelectorAll('[data-mode]')].map(b => b.dataset.mode), mine = btn.dataset.only ? btn.dataset.only.split(' ') : all;
    if (play) { play.dataset.act = [...new Set([...(play.dataset.act || '').split(' ').filter(Boolean), ...mine])].join(' '); const cur = document.querySelector('[data-mode][aria-pressed="true"]'); if (cur && mine.includes(cur.dataset.mode)) play.hidden = true; }
    const paint = () => { const l = L(), t = o.busy() ? (l.run ? '⏸ ' + (o.pause || '정지') : '▶ ' + (o.resume || '이어서')) : base; if (btn.textContent !== t) btn.textContent = t; requestAnimationFrame(paint); }; paint(); }
  const $ = id => document.getElementById(id);
  // 내용이 바뀔 때만 DOM을 고친다(매 프레임 innerHTML을 다시 쓰면 글자 선택·스크롤·화면 읽기 프로그램이 끊김)
  const memo = new WeakMap();
  function html(el, s){ if (typeof el === 'string') el = $(el); if (!el || memo.get(el) === s) return; memo.set(el, s); el.innerHTML = s; }
  function text(el, s){ if (typeof el === 'string') el = $(el); if (!el || el.textContent === s) return; el.textContent = s; }
  // 교과서 공 모형처럼 입체감 있는 구(원자·입자): 왼쪽 위에서 빛을 받은 음영과 반사광
  function sphere(g, x, y, r, col, o){ o = o || {}; const n = parseInt(col.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255], lt = c.map(v => Math.round(v + (255 - v) * .55)), dk = c.map(v => Math.round(v * .55));
    const gr = g.createRadialGradient(x - r * .38, y - r * .42, r * .08, x, y, r * 1.05); gr.addColorStop(0, `rgb(${lt})`); gr.addColorStop(.45, col); gr.addColorStop(1, `rgb(${dk})`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); if (o.stroke !== false) { g.strokeStyle = `rgba(${dk},.9)`; g.lineWidth = Math.max(.8, r * .06); g.stroke(); } }
  // 오실로스코프(실험실 기기 모양): traces = [{f: t => -1~1, color, name}], 화면 가로 = 주기 cyc개. 정류·교류·파동 화면에서 파형을 보여 줄 때 쓴다
  function scope(g, x, y, w, h, traces, o){ o = o || {}; g.save();
    const bz = g.createLinearGradient(0, y, 0, y + h); bz.addColorStop(0, '#3a434c'); bz.addColorStop(1, '#22282e'); g.fillStyle = bz; g.beginPath(); g.roundRect(x, y, w, h, 10); g.fill();
    const sx = x + 10, sy = y + 10, sw = w - 20 - (o.knobs === false ? 0 : 34), sh = h - 34; g.fillStyle = '#0b1f17'; g.beginPath(); g.roundRect(sx, sy, sw, sh, 5); g.fill();
    g.strokeStyle = 'rgba(120,255,180,.12)'; g.lineWidth = 1; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(sx + sw * i / 8, sy); g.lineTo(sx + sw * i / 8, sy + sh); g.stroke(); } for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(sx, sy + sh * i / 6); g.lineTo(sx + sw, sy + sh * i / 6); g.stroke(); }
    g.strokeStyle = 'rgba(120,255,180,.28)'; g.beginPath(); g.moveTo(sx, sy + sh / 2); g.lineTo(sx + sw, sy + sh / 2); g.stroke();
    const cyc = o.cyc || 2, t0 = o.t || 0; traces.forEach(tr => { g.strokeStyle = tr.color || '#7dffb0'; g.lineWidth = tr.width || 2; g.shadowColor = tr.color || '#7dffb0'; g.shadowBlur = 6; g.beginPath(); for (let i = 0; i <= sw; i += 2) { const v = Math.max(-1.15, Math.min(1.15, tr.f(t0 + i / sw * cyc))); const yy = sy + sh / 2 - v * sh * .42; i ? g.lineTo(sx + i, yy) : g.moveTo(sx, yy); } g.stroke(); });
    g.shadowBlur = 0; g.font = font(10, 600); g.textBaseline = 'middle'; let lx = sx; traces.forEach(tr => { if (!tr.name) return; g.fillStyle = tr.color || '#7dffb0'; g.fillRect(lx, y + h - 15, 10, 3); g.fillStyle = '#d7e0e8'; g.textAlign = 'left'; g.fillText(tr.name, lx + 14, y + h - 14); lx += g.measureText(tr.name).width + 30; });
    if (o.title) { g.fillStyle = '#9fb0c0'; g.textAlign = 'right'; g.fillText(o.title, x + w - 10, y + h - 14); }
    if (o.knobs !== false) [.3, .6].forEach(k => { g.fillStyle = '#15191d'; g.beginPath(); g.arc(x + w - 22, y + h * k, 9, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#7a848e'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + w - 22, y + h * k); g.lineTo(x + w - 22, y + h * k - 7); g.stroke(); });
    g.restore(); }
  return {simT: 0, C, colors, font, canvas, tempColor, axes, line, arrow, label, tabs, seg, loop, $, html, text, sphere, scope, grab, setRange, act};
})();
