/* 3D 시뮬레이션 공통 도구 (three.js 번들 assets/vendor/three.min.js 가 먼저 실려 있어야 함)
   - 공간 구조를 다루는 차시에서만 쓴다. 조작부·계기판·표·그래프는 기존 2D 그대로 두고 '화면'만 3D로 바꾼다.
   - WebGL이 안 되거나 사용자가 [3D 끄기]를 고르면 기존 2D 그림(drawX 함수)이 그대로 그려진다.
   쓰는 법:
     const V = Sim3D.create($('scene').parentElement, {modes: ['planets', 'moon']});   // 3D로 보여 줄 모드
     const st1 = V && V.stage('planets', {bg: 'space', cam: [0, 8, 14], target: [0, 0, 0]});
     ... st1.root 에 물체를 넣는다. V.label('지구', obj) 로 이름표를 붙인다.
     그리는 함수에서: if (V && V.on(mode)) { V.render(mode); } else { 기존 2D 그리기 }
*/
window.Sim3D = (() => {
  const T = window.THREE;
  const TOKENS = ['surface','ink','muted','line','soft','grid','phy','chem','bio','earth','gen','hot','cold','warn','accent','bg'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let glOK = null;
  function supported(){
    if (glOK !== null) return glOK;
    try { const c = document.createElement('canvas'); glOK = !!(T && window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
    catch (e) { glOK = false; }
    return glOK;
  }
  const css = k => getComputedStyle(document.documentElement).getPropertyValue('--' + k).trim();
  function colors(){ const o = {}; TOKENS.forEach(k => { const v = css(k); o[k] = v || '#888'; }); return o; }
  const isDark = () => { const c = new T.Color(css('surface') || '#fff'); return (c.r + c.g + c.b) / 3 < 0.4; };
  const pref = {get(){ try { return localStorage.getItem('sim3d') !== 'off'; } catch (e) { return true; } },
                set(v){ try { localStorage.setItem('sim3d', v ? 'on' : 'off'); } catch (e) {} }};

  let styled = false;
  function style(){
    if (styled) return; styled = true;
    const s = document.createElement('style');
    s.textContent = `
.v3d{position:absolute;inset:0;overflow:hidden;border-radius:inherit;touch-action:none}
.v3d canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block;outline:none}
.v3d .lab{position:absolute;inset:0;pointer-events:none}
.l3d{font:500 12px var(--f-body);color:var(--ink);background:color-mix(in srgb,var(--surface) 78%,transparent);padding:1px 6px;border-radius:6px;white-space:nowrap;pointer-events:none;line-height:1.4}
.l3d.dim{color:var(--muted)}
.l3d.on-dark{color:#f4f6fa;background:rgba(10,16,26,.62)}
.l3d.big{font-size:14px;font-weight:700}
.l3d.plain{background:none;padding:0}
@media (max-width:600px){.l3d{font-size:10px;padding:0 4px}.l3d.big{font-size:11px}}
.v3d.quiz .l3d:not(.shown){color:transparent!important;background:#f2c94c!important;min-width:46px;pointer-events:auto;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.25)}.v3d.quiz .l3d:not(.shown)::after{content:'?';color:#5a4300;position:absolute;left:50%;transform:translateX(-50%)}.v3d.quiz .l3d{position:relative;pointer-events:auto;cursor:pointer}
.v3d .hud{position:absolute;right:8px;top:8px;display:flex;gap:6px;z-index:2}
.v3d .hud button{font:500 12px var(--f-body);padding:4px 9px;border-radius:8px;border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 85%,transparent);color:var(--ink);cursor:pointer;min-height:28px}
.v3d .hint{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);font:12px var(--f-body);color:var(--muted);background:color-mix(in srgb,var(--surface) 80%,transparent);padding:2px 10px;border-radius:999px;pointer-events:none;transition:opacity .6s;white-space:nowrap}
.v3d.dark .hint{color:#c8d2de;background:rgba(10,16,26,.6)}
.v3d.dark .hud button{color:#e8eef5;background:rgba(10,16,26,.6);border-color:rgba(255,255,255,.2)}
.tog3d{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)}
.tog3d input{accent-color:var(--accent)}
.tools3d{position:absolute;left:8px;bottom:34px;display:flex;flex-direction:column-reverse;gap:6px;z-index:2;font:500 12px var(--f-body);color:var(--ink)}
.tools3d .row{display:flex;gap:6px;align-items:center}
.tools3d button{font:inherit;padding:4px 9px;border-radius:8px;border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 85%,transparent);color:var(--ink);cursor:pointer;min-height:28px}
.tools3d button[aria-pressed=true]{background:var(--accent);color:#fff;border-color:var(--accent)}
.tools3d input[type=range]{width:130px;accent-color:var(--accent)}
.tools3d .sl{display:flex;gap:6px;align-items:center;background:color-mix(in srgb,var(--surface) 85%,transparent);border:1px solid var(--line);border-radius:8px;padding:2px 8px}
.v3d.dark .tools3d{color:#e8eef5}.v3d.dark .tools3d button,.v3d.dark .tools3d .sl{color:#e8eef5;background:rgba(10,16,26,.6);border-color:rgba(255,255,255,.2)}
.note3d{position:absolute;left:10px;bottom:10px;font:12px var(--f-body);color:var(--muted);background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:3px 8px;z-index:2}`;
    document.head.appendChild(s);
  }

  /* box: .canvas-box (안에 2D canvas가 있음)
     opt.modes: 3D로 보여 줄 모드 이름 목록
     opt.toggle: 3D 켜기/끄기 체크박스를 넣을 요소(기본: 같은 패널의 .controls) */
  function create(box, opt){
    opt = opt || {};
    style();
    const cv2d = box.querySelector('canvas');
    if (!supported()) { note(box, '이 기기에서는 3D(WebGL)를 쓸 수 없어 평면 그림으로 보여 줍니다.'); return null; }
    let renderer;
    try { renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'low-power'}); }
    catch (e) { glOK = false; note(box, '3D를 시작하지 못해 평면 그림으로 보여 줍니다.'); return null; }
    // 저사양 크롬북·전자칠판: 화면 배율 상한
    const cores = navigator.hardwareConcurrency || 4;
    const DPR_MAX = cores <= 4 ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, DPR_MAX));
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = T.SRGBColorSpace;

    const layer = document.createElement('div'); layer.className = 'v3d'; layer.hidden = true;
    layer.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', (cv2d && cv2d.getAttribute('aria-label') || '입체 모형') + ' (3D)');
    renderer.domElement.setAttribute('role', 'img');
    const labR = new T.CSS2DRenderer(); labR.domElement.className = 'lab'; layer.appendChild(labR.domElement);
    const hud = document.createElement('div'); hud.className = 'hud';
    const resetB = document.createElement('button'); resetB.type = 'button'; resetB.textContent = '시점 처음으로'; hud.appendChild(resetB);
    layer.appendChild(hud);
    const hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = '끌어서 돌리기 · 휠(두 손가락)로 확대'; layer.appendChild(hint);
    box.appendChild(layer);
    // 구조 탐색 도구 (해외 3D 교과서의 '분해해 보기·단면·따로 보기'): 장면이 so.tools 로 고른 것만 보인다
    //   so.occlude: {c, r} 구 뒤쪽 이름표 숨기기
    //   so.tools: ['explode', 'cut', 'iso']  so.parts(): 나눌 부분 목록(기본: root 의 자식)  so.cutAxis: 'x'|'y'|'z'(기본 x)
    const tools = document.createElement('div'); tools.className = 'tools3d'; tools.hidden = true;
    tools.innerHTML = '<div class="row"><button type="button" data-t="explode" aria-pressed="false">분해해 보기</button><button type="button" data-t="cut" aria-pressed="false">단면 보기</button><button type="button" data-t="iso" aria-pressed="false">한 부분만 보기</button></div>'
      + '<label class="sl" data-s="explode" hidden>벌리기 <input type="range" min="0" max="100" value="0" aria-label="부분 사이를 벌리는 정도"></label>'
      + '<label class="sl" data-s="cut" hidden>자르는 위치 <input type="range" min="0" max="100" value="50" aria-label="단면 위치"></label>'
      + '<span class="sl" data-s="iso" hidden>보고 싶은 부분을 누르세요</span>';
    layer.appendChild(tools);
    const tb = k => tools.querySelector(`[data-t="${k}"]`), ts = k => tools.querySelector(`[data-s="${k}"]`);
    tools.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !cur) return; const k = b.dataset.t, on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on); ts(k).hidden = !on; cur.tool[k] = on;
      if (k === 'iso' && !on) isoOff(cur);
      if (k === 'explode') { cur.tool.ex = on ? +ts('explode').querySelector('input').value / 100 : 0; }
      if (k === 'cut') cur.tool.cutV = +ts('cut').querySelector('input').value / 100; });
    ts('explode').querySelector('input').oninput = e => { if (cur) cur.tool.ex = +e.target.value / 100; };
    ts('cut').querySelector('input').oninput = e => { if (cur) cur.tool.cutV = +e.target.value / 100; };
    // 부분 = {name, objs}: so.parts() 가 물체 또는 {name, objs} 를 돌려준다 (한 기관이 여러 조각이어도 한 부분)
    const partsOf = st => (st.so.parts ? st.so.parts() : st.root.children).filter(o => o && (o.objs || (!o.isLight && !o.isCSS2DObject)))
      .map(o => o.objs ? o : {name: (o.userData && o.userData.name) || '', objs: [o]});
    const unitBox = (u, b) => { b.makeEmpty(); u.objs.forEach(o => { if (o.visible !== false) b.expandByObject(o); }); return b; };
    const box3 = new T.Box3(), v3 = new T.Vector3(), v3b = new T.Vector3();
    function isoOff(st){ if (!st || !st.isoHid) return; st.isoHid = null; st.isoKeep = null;
      if (st.isoTgt && st === cur) { const d = st.isoTgt.clone().sub(controls.target); controls.target.copy(st.isoTgt); camera.position.add(d); controls.update(); } st.isoTgt = null; ts('iso').textContent = '보고 싶은 부분을 누르세요'; }
    renderer.domElement.addEventListener('pointerup', e => { if (!cur || !cur.tool.iso || cur.isoHid) return;
      const ps = partsOf(cur), hs = pick(e, ps.flatMap(u => u.objs), true); if (!hs.length) return;
      // 반투명 껍질(세포막·벽 등)보다 그 안의 불투명한 부분을 먼저 고른다
      const meshHits = hs.filter(h => h.object.isMesh), pool = meshHits.length ? meshHits : hs, solid = pool.find(h => { const m = [].concat(h.object.material)[0]; return m && (!m.transparent || m.opacity > .45); }), h = solid || pool[0];
      let o = h.object, u = null; while (o && !(u = ps.find(x => x.objs.includes(o)))) o = o.parent; if (!u) return; cur.isoKeep = u.objs;
      cur.isoHid = ps.filter(x => x !== u).flatMap(x => x.objs);   // 그릴 때마다 잠시 숨긴다(장면이 매 프레임 보이기를 바꿔도 유지)
      const nm = u.name || (cur.so.nameOf && cur.so.nameOf(h.object)) || '';
      ts('iso').textContent = (nm ? nm + ' — ' : '') + '다시 누르면 모두 보기';
      // 고른 부분을 화면 가운데로(시점은 그대로, 바라보는 점만 옮김)
      cur.isoTgt = controls.target.clone(); unitBox(u, box3); if (!box3.isEmpty()) { const c = box3.getCenter(new T.Vector3()), d = c.clone().sub(controls.target); controls.target.copy(c); camera.position.add(d); controls.update(); } });
    renderer.domElement.addEventListener('dblclick', () => { if (cur && cur.tool.iso) isoOff(cur); });
    tools.querySelector('[data-s="iso"]').addEventListener('click', () => { if (cur) isoOff(cur); });
    // 그리기 직전에 잠시 벌리고(분해), 자르는 면을 걸고, 그린 뒤 되돌린다 — 장면이 매 프레임 움직여도 어긋나지 않게
    function toolsPre(st){
      const undo = []; if (!st.so.tools) return undo;
      st.root.updateMatrixWorld(true);
      if (st.tool.explode && st.tool.ex > 0) {
        const ps = partsOf(st).filter(u => u.objs.some(o => o.visible)); box3.setFromObject(st.root); const mc = box3.getCenter(new T.Vector3()), size = box3.getSize(new T.Vector3()).length();
        const conc = ps.filter(p => { unitBox(p, box3); return !box3.isEmpty() && box3.getCenter(v3).sub(mc).length() < size * 0.03; });
        const axV = new T.Vector3(...(st.so.exAxis || [1, 0, 0])).normalize();
        ps.forEach((p, i) => { unitBox(p, box3); if (box3.isEmpty()) return; box3.getCenter(v3); const d = v3.sub(mc);
          const ci = conc.indexOf(p);
          if (ci >= 0) d.copy(axV).multiplyScalar(ci - (conc.length - 1) / 2).multiplyScalar(st.tool.ex * size * (st.so.exScale || 0.35) * 1.4);   // 동심 구조(지구 층·원자 껍질)는 한 방향으로 차례로 펼친다
          else d.normalize().multiplyScalar(st.tool.ex * size * (st.so.exScale || 0.35));
          p.objs.forEach(o => { if (!o.parent) return; const w = d.clone(), q = o.parent.getWorldQuaternion(new T.Quaternion()).invert(); w.applyQuaternion(q); w.divide(o.parent.getWorldScale(new T.Vector3())); o.position.add(w); undo.push([o, w]); }); });
      }
      if (st.isoHid && st.isoKeep) { const ctx = new Set(st.so.isoContext ? st.so.isoContext() : []), inKeep = o => { for (let q = o; q; q = q.parent) { if (st.isoKeep.includes(q) || ctx.has(q)) return true; if (q === st.root) return false; } return false; };
        st.root.traverse(o => { if ((o.isMesh || o.isLine || o.isPoints) && o.visible && !inKeep(o)) { o.visible = false; undo.push([o, null]); } }); }
      if (st.isoHid && st.isoKeep) st.root.traverse(o => { if (!o.isCSS2DObject || !o.visible) return; let q = o.parent; while (q && !st.isoKeep.includes(q)) q = q.parent;
        if (!q && !(st.so.labelOf && st.isoKeep.includes(st.so.labelOf(o)))) { o.visible = false; undo.push([o, null]); } });
      if (st.tool.cut) {
        const ax = st.so.cutAxis || 'x'; box3.setFromObject(st.root); const lo = box3.min[ax], hi = box3.max[ax], c = hi - (hi - lo) * st.tool.cutV;
        if (!st.plane) st.plane = new T.Plane();
        st.plane.normal.set(ax === 'x' ? -1 : 0, ax === 'y' ? -1 : 0, ax === 'z' ? -1 : 0); st.plane.constant = c;
        st.root.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { if (!m.clippingPlanes || m.clippingPlanes[0] !== st.plane) { m.clippingPlanes = [st.plane]; m.side = T.DoubleSide; m.needsUpdate = true; } });
          if (o.isCSS2DObject) { o.getWorldPosition(v3); if (v3[ax] > c + 1e-3 && o.visible) { o.visible = false; undo.push([o, null]); } } });
      } else if (st.plane) { st.root.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { if (m.clippingPlanes && m.clippingPlanes.length) { m.clippingPlanes = []; m.needsUpdate = true; } }); }); st.plane = null; }
      return undo;
    }
    const toolsPost = undo => undo.forEach(([o, d]) => d ? o.position.sub(d) : (o.visible = true));
    function toolsUI(st){ const ts0 = st.so.tools || []; tools.hidden = !ts0.length;
      ['explode', 'cut', 'iso'].forEach(k => { tb(k).hidden = !ts0.includes(k); tb(k).setAttribute('aria-pressed', !!st.tool[k]); ts(k).hidden = !st.tool[k]; });
      ts('explode').querySelector('input').value = Math.round((st.tool.ex || 0) * 100); ts('cut').querySelector('input').value = Math.round((st.tool.cutV != null ? st.tool.cutV : .5) * 100); }
    renderer.localClippingEnabled = true;

    const camera = new T.PerspectiveCamera(45, 1, 0.05, 2000);
    const controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !reduced; controls.dampingFactor = 0.12; controls.enablePan = false;
    controls.rotateSpeed = 0.8; controls.zoomSpeed = 0.9;
    let hinted = false;
    controls.addEventListener('start', () => { if (!hinted) { hinted = true; hint.style.opacity = 0; } });

    let W = 0, H = 0;
    const fit = () => { const r = box.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false); labR.setSize(W, H); camera.aspect = W / H;
      // 좁은 화면(휴대폰)에서도 가로로 보이는 범위가 데스크톱(가로:세로 ≈ 1.45)과 같게: 세로 시야각을 넓혀 양옆 물체·이름표가 잘리지 않게
      { const base = cur && cur.so.fov || 45, REF = 1.45; camera.fov = camera.aspect < REF ? 2 * Math.atan(Math.tan(base * Math.PI / 360) * REF / camera.aspect) * 180 / Math.PI : base; }
      camera.updateProjectionMatrix();
      if (cur && cur.fitFn) cur.fitFn(W, H); };
    new ResizeObserver(fit).observe(box);

    // 화면 밖이거나 탭이 숨겨지면 렌더하지 않는다
    let inView = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; }).observe(box);

    const stages = {};
    let cur = null, enabled = opt.noToggle ? true : pref.get(), alive = true;
    const modes = new Set(opt.modes || []);

    renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); alive = false; layer.hidden = true; if (cv2d) cv2d.style.visibility = ''; note(box, '3D 화면이 멈춰 평면 그림으로 바꿨습니다.'); });

    // 3D 켜기/끄기
    const tgHost = opt.noToggle ? null : opt.toggle || (box.closest('.panel') && box.closest('.panel').querySelector('.controls'));
    let tg = null;
    if (tgHost) {
      tg = document.createElement('label'); tg.className = 'tog3d field';
      tg.innerHTML = '<input type="checkbox"> 3D로 보기';
      const cb = tg.querySelector('input'); cb.checked = enabled;
      cb.onchange = () => { enabled = cb.checked; pref.set(enabled); };
      tgHost.appendChild(tg);
      // 이름 가리기: 3D 그림의 이름표를 가려 두고, 누르면 하나씩 열어 스스로 확인(복습·형성평가용)
      if (opt.quiz) { const qz = document.createElement('label'); qz.className = 'tog3d field'; qz.innerHTML = '<input type="checkbox"> 이름 가리기 (눌러서 확인)'; const qb = qz.querySelector('input');
        qb.onchange = () => { layer.classList.toggle('quiz', qb.checked); layer.querySelectorAll('.l3d.shown').forEach(e => e.classList.remove('shown')); }; tgHost.appendChild(qz);
        layer.addEventListener('click', e => { const l = e.target.closest && e.target.closest('.l3d'); if (l && layer.classList.contains('quiz')) l.classList.toggle('shown'); }); }
    }

    function stage(name, so){
      so = so || {};
      const scene = new T.Scene();
      const st = {name, scene, root: new T.Group(), so, cam0: new T.Vector3(...(so.cam || [0, 4, 10])), tgt0: new T.Vector3(...(so.target || [0, 0, 0])),
        camSaved: null, tgtSaved: null, fitFn: so.fit || null, lights: {}, tool: {ex: 0, cutV: so.cutV != null ? so.cutV : .5, cut: !!so.cutOn}, plane: null, isoHid: null};
      scene.add(st.root);
      // 조명: 하늘·땅 반구광 + 방향광 (so.lights === false 면 직접 넣음)
      if (so.lights !== false) {
        st.lights.hemi = new T.HemisphereLight(0xffffff, 0x8090a0, 1.1); scene.add(st.lights.hemi);
        st.lights.dir = new T.DirectionalLight(0xffffff, 1.6); st.lights.dir.position.set(5, 8, 6); scene.add(st.lights.dir);
      }
      st.bg = so.bg || 'surface';
      stages[name] = st;
      return st;
    }
    function applyBg(st){
      const bg = st.bg === 'space' ? '#070c16' : st.bg === 'surface' ? (css('surface') || '#fff') : st.bg === 'soft' ? (css('soft') || '#f4f7f9') : st.bg;
      st.scene.background = new T.Color(bg);
      layer.classList.toggle('dark', st.bg === 'space' || isDark());
    }
    function use(name){
      const st = stages[name]; if (!st || st === cur) return;
      if (cur) { cur.camSaved = camera.position.clone(); cur.tgtSaved = controls.target.clone();
        cur.scene.traverse(o => { if (o.isCSS2DObject) o.element.style.display = 'none'; }); }   // 앞 장면의 이름표 숨김
      cur = st;
      camera.position.copy(st.camSaved || st.cam0); controls.target.copy(st.tgtSaved || st.tgt0);
      controls.minDistance = st.so.minD || 0.5; controls.maxDistance = st.so.maxD || 200;
      controls.minPolarAngle = st.so.minPolar != null ? st.so.minPolar : 0; controls.maxPolarAngle = st.so.maxPolar != null ? st.so.maxPolar : Math.PI;
      controls.enableRotate = st.so.rotate !== false; controls.enableZoom = st.so.zoom !== false;
      camera.fov = st.so.fov || 45; camera.near = st.so.near || 0.05; camera.far = st.so.far || 2000;
      toolsUI(st); fit(); controls.update();
    }
    resetB.onclick = () => { if (!cur) return; camera.position.copy(cur.cam0); controls.target.copy(cur.tgt0); controls.update(); if (cur.so.onReset) cur.so.onReset(); };

    // 지금 모드를 3D로 그릴지
    function on(mode){
      const want = alive && enabled && modes.has(mode);
      layer.hidden = !want;
      if (cv2d) cv2d.style.visibility = want ? 'hidden' : '';
      if (tg) tg.hidden = !modes.has(mode);
      return want;
    }
    let themeKey = '';
    function render(mode){
      use(mode);
      if (!cur || !inView || document.hidden) return;
      const k = css('surface') + '|' + cur.bg + '|' + cur.name; if (k !== themeKey) { themeKey = k; applyBg(cur); if (cur.so.onTheme) cur.so.onTheme(colors()); }
      controls.update();
      renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H);
      const undo = toolsPre(cur);
      renderer.render(cur.scene, camera);
      // 이름표는 부모가 숨겨져도 그대로 보이므로(CSS2DRenderer 한계) 잠시 같이 숨겼다가 되돌린다
      const hid = [];
      // so.occlude = {c: [x, y, z], r}: 그 구(지구본 등) 뒤쪽에 있는 이름표는 숨긴다 — 뒤쪽 이름표가 앞면 엉뚱한 곳에 겹쳐 보이지 않게
      const oc = cur.so.occlude, ocC = oc && new T.Vector3(...(oc.c || [0, 0, 0])), cam = camera.position;
      const behind = o => { o.getWorldPosition(v3); const d = v3b.copy(v3).sub(cam), f = cam.clone().sub(ocC), a = d.dot(d), b = 2 * f.dot(d), c = f.dot(f) - oc.r * oc.r, D = b * b - 4 * a * c; if (D <= 0) return false; const t = (-b - Math.sqrt(D)) / (2 * a); return t > 0 && t < .995; };
      cur.scene.traverse(o => { if (o.isCSS2DObject && o.visible) { let p = o.parent; while (p && p.visible) p = p.parent; if (p || (oc && behind(o))) { o.visible = false; hid.push(o); } } });
      labR.render(cur.scene, camera); hid.forEach(o => o.visible = true);
      toolsPost(undo);
      if (cur.so.post) cur.so.post(W, H);
    }
    // 작은 창(오른쪽 위 등)에 다른 카메라로 한 번 더 그리기: x, y는 왼쪽 위 기준 CSS 픽셀
    function inset(scene, cam, x, y, w, h, bg){
      renderer.setScissorTest(true);
      const yy = H - y - h; renderer.setScissor(x, yy, w, h); renderer.setViewport(x, yy, w, h);
      const old = scene.background; if (bg) scene.background = new T.Color(bg);
      cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.render(scene, cam);
      scene.background = old; renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H);
    }
    // 끌기와 구분되는 '누르기'만 받기
    function onClick(fn){
      let p0 = null;
      renderer.domElement.addEventListener('pointerdown', e => { p0 = [e.clientX, e.clientY]; });
      renderer.domElement.addEventListener('pointerup', e => { if (p0 && Math.hypot(e.clientX - p0[0], e.clientY - p0[1]) < 6) fn(e); p0 = null; });
    }
    function label(text, parent, o){
      o = o || {};
      const d = document.createElement('div'); d.className = 'l3d' + (o.cls ? ' ' + o.cls : '');
      d.textContent = text; if (o.color) d.style.color = o.color; if (String(text).includes('\n')) { d.style.whiteSpace = 'pre-line'; d.style.textAlign = 'center'; }   // 긴 설명은 '\n'으로 줄을 나눔(줄 간격이 화면 크기와 상관없이 일정)
      const L = new T.CSS2DObject(d);
      if (o.pos) L.position.set(...o.pos);
      if (parent) parent.add(L);
      L.set = t => { if (d.textContent !== t) { d.textContent = t; const ml = String(t).includes('\n'); d.style.whiteSpace = ml ? 'pre-line' : ''; d.style.textAlign = ml ? 'center' : ''; } };
      return L;
    }
    // 테마 바뀔 때 다시 칠하기 쉽도록: mat(토큰 또는 색, 옵션)
    function mat(c, o){
      o = o || {};
      const m = new (o.basic ? T.MeshBasicMaterial : T.MeshStandardMaterial)(Object.assign(o.basic ? {} : {roughness: o.rough != null ? o.rough : .55, metalness: o.metal || 0},
        {color: new T.Color(TOKENS.includes(c) ? (css(c) || '#888') : c), transparent: o.opacity != null && o.opacity < 1, opacity: o.opacity != null ? o.opacity : 1, side: o.side || T.FrontSide}));
      if (o.emissive) m.emissive = new T.Color(o.emissive);
      if (o.depthWrite === false) m.depthWrite = false;
      return m;
    }
    // 화살표(굵은 원기둥 + 원뿔)
    function arrow(from, to, color, r){
      r = r || 0.04;
      const g = new T.Group(), a = new T.Vector3(...from), b = new T.Vector3(...to), dir = b.clone().sub(a), len = dir.length();
      const head = Math.min(len * 0.35, r * 6), m = color instanceof T.Material ? color : mat(color, {rough: .4});
      const shaft = new T.Mesh(new T.CylinderGeometry(r, r, Math.max(0.001, len - head), 12), m); shaft.position.y = (len - head) / 2;
      const cone = new T.Mesh(new T.ConeGeometry(r * 2.6, head, 16), m); cone.position.y = len - head / 2;
      g.add(shaft, cone); g.position.copy(a);
      g.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
      g.userData.set = (f, t) => {   // 다시 맞추기
        const A = new T.Vector3(...f), B = new T.Vector3(...t), D = B.clone().sub(A), L = D.length(), h = Math.min(L * 0.35, r * 6);
        g.visible = L > 1e-4; if (!g.visible) return;
        shaft.scale.y = Math.max(0.001, L - h) / Math.max(0.001, len - head); shaft.position.y = (L - h) / 2;
        cone.scale.setScalar(h / head); cone.position.y = L - h / 2;
        g.position.copy(A); g.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), D.normalize());
      };
      return g;
    }
    // 두 점 사이 막대(원기둥)
    function rod(a, b, r, m){ const A = new T.Vector3(...a), B = new T.Vector3(...b), d = B.clone().sub(A), c = new T.Mesh(new T.CylinderGeometry(r, r, d.length(), 12), m instanceof T.Material ? m : mat(m));
      c.position.copy(A).add(B).multiplyScalar(.5); c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); return c; }
    // 선(점 목록) — 굵기는 1px 고정(WebGL 한계)
    function lineOf(pts, color, o){
      o = o || {};
      const geo = new T.BufferGeometry().setFromPoints(pts.map(p => p.isVector3 ? p : new T.Vector3(...p)));
      const m = o.dash ? new T.LineDashedMaterial({color: new T.Color(TOKENS.includes(color) ? css(color) : color), dashSize: o.dash, gapSize: o.gap || o.dash, transparent: o.opacity != null, opacity: o.opacity != null ? o.opacity : 1})
                       : new T.LineBasicMaterial({color: new T.Color(TOKENS.includes(color) ? css(color) : color), transparent: o.opacity != null, opacity: o.opacity != null ? o.opacity : 1});
      const L = new (o.loop ? T.LineLoop : T.Line)(geo, m); if (o.dash) L.computeLineDistances();
      return L;
    }
    function circle(r, color, o){ const pts = []; const n = (o && o.n) || 96; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]); } return lineOf(pts, color, o); }
    // 별 배경
    function stars(n, R, seed){
      let s = seed || 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rr = R * (0.9 + rnd() * 0.1), q = Math.sqrt(1 - u * u);
        pos[i * 3] = rr * q * Math.cos(th); pos[i * 3 + 1] = rr * u; pos[i * 3 + 2] = rr * q * Math.sin(th); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
      return new T.Points(g, new T.PointsMaterial({color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: .75}));
    }
    // 그룹 비우기(지오메트리·재질 해제)
    function clear(group){
      while (group.children.length) { const c = group.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); if (o.element && o.element.remove) o.element.remove(); }); }
    }
    // 화면 좌표 → 물체 고르기
    function pick(ev, objects, all){
      const r = renderer.domElement.getBoundingClientRect(), v = new T.Vector2((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1);
      const rc = new T.Raycaster(); rc.setFromCamera(v, camera); const hit = rc.intersectObjects(objects, true); return all ? hit : hit[0] || null;
    }
    // 경도·위도 → 구면 좌표 (경도 0° = +x, 동경 90° = −z)
    const ll = (lo, la, r) => { const a = lo * Math.PI / 180, b = la * Math.PI / 180; return new T.Vector3(Math.cos(b) * Math.cos(a) * (r || 1), Math.sin(b) * (r || 1), -Math.cos(b) * Math.sin(a) * (r || 1)); };
    // 대략적인 대륙 윤곽으로 지구본 텍스처 만들기
    function earthTex(o){ o = Object.assign({sea: '#9cc7ea', land: '#e8e1cf', edge: '#a69878', ice: '#f2f5f8', grid: true}, o || {});
      const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d'), X = lo => (lo + 180) / 360 * 2048, Y = la => (90 - la) / 180 * 1024;
      g.fillStyle = o.sea; g.fillRect(0, 0, 2048, 1024);
      Object.values(CONT).forEach(p => { g.fillStyle = o.land; g.strokeStyle = o.edge; g.lineWidth = 3; g.beginPath(); p.forEach(([lo, la], i) => i ? g.lineTo(X(lo), Y(la)) : g.moveTo(X(lo), Y(la))); g.closePath(); g.fill(); g.stroke(); });
      g.fillStyle = o.ice; g.fillRect(0, Y(-66), 2048, 1024);
      if (o.grid) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.setLineDash([12, 12]); g.lineWidth = 2; [0, 30, 60, -30, -60].forEach(la => { g.beginPath(); g.moveTo(0, Y(la)); g.lineTo(2048, Y(la)); g.stroke(); }); }
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; }
    const api = {T, ll, earthTex, scene: null, camera, controls, renderer, layer, stage, use, on, render, inset, onClick, label, mat, arrow, rod, line: lineOf, circle, stars, clear, pick, colors, css, isDark, reduced,
      get stageNow(){ return cur; }, get size(){ return [W, H]; }};
    ALL.push(api); return api;
  }
  // 대략적인 대륙 윤곽(경도, 위도) — 지구본 모형용
  const CONT = {
    NA: [[-168,66],[-140,70],[-95,72],[-80,62],[-60,55],[-55,48],[-70,43],[-76,35],[-81,25],[-90,29],[-97,26],[-105,20],[-95,16],[-83,9],[-78,8],[-87,14],[-105,22],[-112,30],[-118,34],[-124,40],[-125,48],[-135,58],[-150,60],[-165,60]],
    SA: [[-80,9],[-72,12],[-60,10],[-50,0],[-35,-6],[-39,-15],[-48,-26],[-58,-38],[-65,-45],[-68,-55],[-74,-50],[-72,-35],[-71,-18],[-81,-6]],
    EU: [[-10,36],[-9,43],[-2,48],[-5,58],[5,62],[15,70],[30,71],[60,70],[80,73],[110,77],[140,72],[180,68],[175,62],[160,58],[142,47],[135,43],[129,35],[121,31],[120,22],[108,20],[105,10],[100,13],[98,8],[92,22],[80,15],[77,8],[72,20],[67,25],[57,25],[52,15],[43,12],[35,30],[28,37],[23,37],[15,38],[12,44],[5,43],[0,38]],
    AF: [[-17,21],[-16,12],[-8,5],[5,5],[10,3],[9,-2],[13,-10],[12,-17],[18,-35],[28,-33],[35,-25],[40,-15],[40,-3],[51,11],[43,12],[32,30],[20,32],[10,37],[-6,36]],
    AU: [[113,-22],[114,-34],[130,-32],[140,-38],[150,-37],[153,-25],[145,-15],[142,-11],[136,-12],[130,-12],[122,-17]],
    JP: [[130,31],[132,34],[136,35],[140,36],[141,41],[142,45],[145,44],[141,39],[140,35],[135,33]],
    GL: [[-55,60],[-45,60],[-20,70],[-20,80],[-60,82],[-70,76]]};
  const ALL = [];
  function note(box, text){ style(); if (box.querySelector('.note3d')) return; const n = document.createElement('div'); n.className = 'note3d'; n.textContent = text; box.appendChild(n); setTimeout(() => n.remove(), 6000); }
  return {create, supported, reduced, all: ALL};
})();
