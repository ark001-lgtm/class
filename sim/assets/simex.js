/* 시뮬레이션 모드 덧붙이기 (window.Kit 확장)
   각 단원 sim.html 안에서 기존 모드를 건드리지 않고 새 모드를 더할 때 쓴다.
   사용: Kit.tabs(...)·Kit.loop(...)을 부르기 전에
     Kit.ex(st, {
       모드이름: { enter(){...}, step(dt){...}, draw(){...}, render(){...} },
       ...
     });
   - 헤더에 <button data-mode="모드이름">, 조작부에 data-only="모드이름" 요소를 넣는다.
   - 새 모드일 때는 기존 그리기·진행 함수 대신 위 함수가 불린다(재생 버튼과 무관하게 진행).
   - Kit.panel({...})로 오른쪽 설명과 아래 표·그래프 제목을 채운다. */
(() => {
  const K = window.Kit; if (!K) return;
  K.ex = function(st, EX){
    const tabs0 = K.tabs, loop0 = K.loop;
    let last = performance.now(), pending = false;
    const hide3D = () => { if (window.Sim3D && Sim3D.all) Sim3D.all.forEach(v => { try { v.on('-'); } catch (e) {} }); };
    K.tabs = (cb, modes) => tabs0(m => {
      if (EX[m]) { st.mode = m; hide3D(); if (EX[m].enter) EX[m].enter(); if (EX[m].render) EX[m].render(); pending = true; }
      else cb(m);
    }, modes.concat(Object.keys(EX).filter(k => !modes.includes(k))));
    // 원래 step 이 빈 함수면 그대로 넘겨 [느리게] 버튼이 붙지 않게 하고, 덧붙인 모드의 step 도 [느리게] 빠르기를 따른다
    K.loop = (step, draw, btn) => { const lp = loop0(/^\(\)\s*=>\s*\{\s*\}$/.test(String(step)) ? step : dt => { if (!EX[st.mode]) step(dt); }, () => {
      const E = EX[st.mode];
      if (!E) { draw(); return; }
      const now = performance.now(), dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
      hide3D(); if (pending) { pending = false; if (E.render) E.render(); } if (E.step) E.step(dt * lp.speed); if (E.draw) E.draw();
    }, btn); return lp; };
  };
  // 오른쪽 설명·아래 표 채우기 (내용이 바뀔 때만 DOM 갱신)
  K.panel = function(o){
    const $ = K.$, set = (id, v, txt) => { const el = $(id); if (!el) return; const cur = txt ? el.textContent : el.innerHTML; if (el._ex === v && el._exh === cur) return; if (txt) el.textContent = v; else el.innerHTML = v; el._ex = v; el._exh = txt ? el.textContent : el.innerHTML; };
    if (o.stats) set('stats', o.stats.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join(''));
    if (o.explain != null) set('explain', o.explain);
    if (o.tip != null) set('tip', o.tip, true);
    if (o.g) { set('gTitle', o.g[0] || '', true); set('gSub', o.g[1] || '', true); }
    if (o.t != null) set('tTitle', o.t, true);
    if (o.head) set('thead', '<tr>' + o.head.map(h => `<th>${h}</th>`).join('') + '</tr>');
    if (o.rows) set('tbody', o.rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join(''));
  };
  // 마우스·손가락 끌기 도우미: 캔버스 좌표로 down/move/up 을 넘긴다 (모드가 맞을 때만)
  K.drag = function(cv, st, mode, on){
    const pos = e => { const r = cv.getBoundingClientRect(), k = cv._k || 1; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };
    let act = false;
    cv.addEventListener('pointerdown', e => { if (st.mode !== mode) return; act = on.down ? on.down(...pos(e)) !== false : true; if (act) cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (act && st.mode === mode && on.move) on.move(...pos(e)); });
    cv.addEventListener('pointerup', e => { if (act && on.up) on.up(...pos(e)); act = false; });
  };
})();
