/* ═══════════════ 01. 힘과 운동 : 장면 ═══════════════
   힘의 합성과 분해 → 여러 가지 힘 · 알짜힘 → 빗면 위 물체의 가속도(공식 유도) → 주의 → 예제.
   학습지 빈칸 : ① 방향 ② 벡터 합성 ③ cos θ ④ sin θ ⑤ mg ⑥ μN ⑦ 알짜힘 ⑧ sin θ ⑨ mg cos θ ⑩ μ cos θ ⑪ 질량 ⑫ 12 ⑬ 2 */
const P1 = '1 힘의 표현과 합성', P2 = '2 알짜힘과 운동의 예측';
const SCENE_LIST = [
  { id: 'vector', part: P1, title: '힘의 합성과 분해', ws: '학습지 1-(1)(2) ①~④', make: sceneVector },
  { id: 'forces', part: P1, title: '여러 가지 힘과 알짜힘', ws: '학습지 [표 1] ⑤⑥ · 2-(1) ⑦', make: sceneForces },
  { id: 'incline', part: P2, title: '빗면 위 물체의 가속도', ws: '학습지 2-(2) ⑧~⑪', make: sceneIncline },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑫⑬', make: sceneEx },
];
const DEG = Math.PI / 180;

/** 빗면 : 왼쪽 위 꼭짓점 C 에서 오른쪽 아래 B 로 내려간다. u = 빗면 아래 방향, n = 빗면에서 바깥 방향 */
function slope(ax, ay, L, th) {
  const C = { x: ax, y: ay - L * Math.sin(th) }, B = { x: ax + L * Math.cos(th), y: ay };
  return { A: { x: ax, y: ay }, B: B, C: C, u: { x: Math.cos(th), y: Math.sin(th) }, n: { x: Math.sin(th), y: -Math.cos(th) }, L: L, th: th };
}
function drawSlope(c, g, label) {
  c.fillStyle = rgba(COL.good, 0.13); c.beginPath(); c.moveTo(g.A.x, g.A.y); c.lineTo(g.B.x, g.B.y); c.lineTo(g.C.x, g.C.y); c.closePath(); c.fill();
  c.strokeStyle = COL.good; c.lineWidth = 4; c.stroke();
  KIT.ground(c, g.A.x - 30, g.A.y, g.B.x - g.A.x + 60);
  c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.arc(g.B.x, g.B.y, 70, Math.PI, Math.PI + g.th, false); c.stroke();
  txt(c, label || 'θ', g.B.x - 96, g.B.y - 22, { size: 26, weight: 700 });
}
/** 빗면 위 상자 : 빗면 꼭대기에서 s 만큼 내려온 곳. 상자 가운데 자리를 돌려준다 */
function drawBlock(c, g, s, w, hh, color) {
  const px = g.C.x + g.u.x * s + g.n.x * hh / 2, py = g.C.y + g.u.y * s + g.n.y * hh / 2;
  c.save(); c.translate(px, py); c.rotate(g.th);
  c.fillStyle = color || COL.energy; rrect(c, -w / 2, -hh / 2, w, hh, 8); c.fill();
  c.restore();
  return { x: px, y: py };
}

/* ── 1-(1)(2) 힘의 합성과 분해 ── */
function sceneVector(root) {
  let mode = 0;
  const cv = makeCanvas(1000, 620);
  const f1 = KIT.slider('F₁', 1, 10, 0.5, 6, function (v) { return v + ' N'; }, '90px');
  const f2 = KIT.slider('F₂', 1, 10, 0.5, 4, function (v) { return v + ' N'; }, '90px');
  const ang = KIT.slider('사잇각', 0, 180, 5, 60, function (v) { return v + '°'; }, '90px');
  const ff = KIT.slider('F', 1, 10, 0.5, 8, function (v) { return v + ' N'; }, '90px');
  const th = KIT.slider('θ', 0, 90, 5, 35, function (v) { return v + '°'; }, '90px');
  const under = h('div', { class: 'col', style: 'gap:0;padding:0 22px 18px' });
  const seg = KIT.seg(['두 힘의 합성', '힘의 분해'], 0, function (i) { mode = i; sync(); }, false);
  function sync() { under.replaceChildren.apply(under, mode === 0 ? [f1.el, f2.el, ang.el] : [ff.el, th.el]); }
  sync();
  KIT.split(root, cv, [seg.el], [
    KIT.cap('(1) 힘은 벡터이다'),
    KIT.p('• 크기만 갖는 물리량을 스칼라라 하고, 크기와 {{①|방향}}을 함께 갖는 물리량을 벡터라고 한다. 힘은 벡터이다.', 'ws sm'),
    KIT.p('• 따라서 두 힘을 더할 때는 크기를 단순히 더하지 않고 {{②|벡터 합성}}의 방법으로 더한다. 두 힘의 방향이 같을 때 합력이 가장 크고, 반대일 때 가장 작다.', 'ws sm'),
    KIT.cap('(2) 힘의 분해'),
    KIT.p('• 2차원 평면에서는 힘을 서로 수직인 두 방향의 성분으로 나누어 다룬다. 그러면 어려운 2차원 문제가 1차원 문제 두 개로 바뀐다.', 'ws sm'),
    KIT.p('• 크기가 F 이고 x축과 θ 를 이루는 힘의 성분 : 　Fx = F {{③|cos θ}} 　Fy = F {{④|sin θ}}', 'ws sm'),
    KIT.p('• 합력의 크기는 F = √(Fx^{2} + Fy^{2}) 이고, 방향은 tan θ = [[Fy|Fx]] 로 구한다.', 'ws sm'),
  ], { under: under });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 1000, 620);
      const k = 38, ox = mode === 0 ? 300 : 240, oy = mode === 0 ? 470 : 540;
      KIT.dash(c, 40, oy, 960, oy, COL.line, 2, [6, 8]);
      if (mode === 0) {
        const a = ang.get() * DEG, F1 = f1.get(), F2 = f2.get();
        const x1 = F1 * k, x2 = F2 * k * Math.cos(a), y2 = -F2 * k * Math.sin(a);
        KIT.dash(c, ox + x1, oy, ox + x1 + x2, oy + y2, COL.muted, 2); KIT.dash(c, ox + x2, oy + y2, ox + x1 + x2, oy + y2, COL.muted, 2);
        KIT.vec(c, ox, oy, x1, 0, COL.cold, 'F₁');
        KIT.vec(c, ox, oy, x2, y2, COL.heat, 'F₂');
        KIT.vec(c, ox, oy, x1 + x2, y2, COL.energy, '합력', { width: 9 });
        dot(c, ox, oy, 9, COL.ink);
        const R = Math.hypot(F1 + F2 * Math.cos(a), F2 * Math.sin(a));
        txt(c, '평행사변형법 : 두 힘을 두 변으로 하는 평행사변형의 대각선', 40, 44, { size: 26, weight: 700 });
        txt(c, '합력 ' + KIT.fmt(R) + ' N', 40, 92, { size: 34, weight: 700, color: COL.energy });
        txt(c, '크기만 더하면 ' + KIT.fmt(F1 + F2) + ' N · 크기만 빼면 ' + KIT.fmt(Math.abs(F1 - F2)) + ' N', 40, 136, { size: 24, color: COL.muted });
        const note = ang.get() === 0 ? '방향이 같다 → 합력이 가장 크다' : ang.get() === 180 ? '방향이 반대 → 합력이 가장 작다' : '';
        if (note) pill(c, note, 960, 92, COL.energy, { align: 'right', size: 22 });
      } else {
        const F = ff.get(), t = th.get() * DEG, fx = F * Math.cos(t), fy = F * Math.sin(t);
        KIT.dash(c, ox, 80, ox, 600, COL.line, 2, [6, 8]);
        KIT.dash(c, ox + fx * k, oy, ox + fx * k, oy - fy * k, COL.muted, 2); KIT.dash(c, ox, oy - fy * k, ox + fx * k, oy - fy * k, COL.muted, 2);
        KIT.vec(c, ox, oy, fx * k, 0, COL.cold, 'Fx', { lx: 0, ly: 30, off: 0 });
        KIT.vec(c, ox, oy, 0, -fy * k, COL.heat, 'Fy', { off: 26 });
        KIT.vec(c, ox, oy, fx * k, -fy * k, COL.energy, 'F', { width: 9 });
        if (t > 0.01) { c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.arc(ox, oy, 70, -t, 0); c.stroke(); txt(c, 'θ', ox + 86, oy - 26, { size: 26, weight: 700 }); }
        dot(c, ox, oy, 9, COL.ink);
        txt(c, '서로 수직인 두 성분으로 나눈다', 40, 44, { size: 26, weight: 700 });
        txt(c, 'Fx = F cos θ = ' + KIT.fmt(fx) + ' N', 600, 120, { size: 30, weight: 700, color: COL.cold });
        txt(c, 'Fy = F sin θ = ' + KIT.fmt(fy) + ' N', 600, 170, { size: 30, weight: 700, color: COL.heat });
        txt(c, '√(Fx² + Fy²) = ' + KIT.fmt(Math.hypot(fx, fy)) + ' N', 600, 220, { size: 26, color: COL.muted });
      }
    },
  };
}

/* ── [표 1] 여러 가지 힘 · 2-(1) 알짜힘 : 바닥 위 상자를 줄로 끈다 (질량 2 kg, μ = 0.5) ── */
function sceneForces(root) {
  const cv = makeCanvas(900, 560);
  const pull = KIT.slider('당기는 힘 T', 0, 24, 1, 6, function (v) { return v + ' N'; }, '170px');
  let x = 0, v = 0;
  KIT.split(root, cv, [KIT.btn('처음 자리로', function () { x = 0; v = 0; })], [
    KIT.cap('(3) 여러 가지 힘 · [표 1] 물체에 작용하는 힘'),
    KIT.table(['구분', '방향', '크기'], [
      ['중력', '연직 아래 방향', 'W = {{⑤|mg}}'],
      ['수직항력 N', '면이 물체를 미는 방향 (면에 수직)', '상황에 따라 다르다'],
      ['장력 T', '실이 물체를 당기는 방향', '상황에 따라 다르다'],
      ['마찰력 f', '물체가 운동하는(하려는) 방향의 반대', 'f = {{⑥|μN}}'],
    ], { cols: ['20%', '50%', '30%'] }),
    KIT.hint('※ 수직항력의 크기는 중력의 크기와 항상 같은 것이 아니다. 상황마다 다시 구해야 한다.'),
    KIT.cap('2 (1) 알짜힘'),
    KIT.p('• 한 물체에 작용하는 모든 힘을 합한 것을 알짜힘(합력)이라고 한다.', 'ws sm'),
    KIT.p('• 뉴턴 운동 제2법칙 : F = ma. 가속도의 방향은 {{⑦|알짜힘}}의 방향과 같다.', 'ws sm'),
    KIT.p('• 알짜힘이 0이면 가속도도 0이다. 즉 정지해 있거나 등속도로 운동한다.', 'ws sm'),
  ], { under: h('div', { style: 'padding:0 22px 18px' }, pull.el) });
  return {
    tick: function (dt) {
      const m = 2, g = 10, mu = 0.5, N = m * g, T = pull.get();
      // 움직이지 않으면 정지 마찰력이 당기는 힘만큼 버틴다 (최대 정지 마찰력 = 운동 마찰력으로 둔다)
      let f, Fnet;
      if (v < 1e-6 && T <= mu * N) { f = T; Fnet = 0; v = 0; } else { f = mu * N; Fnet = T - f; }
      const a = Fnet / m;
      v = Math.max(0, v + a * dt); x += v * dt * 40;
      if (x > 360) x = 0;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const fy = 360, bx = 170 + x, bw = 150, bh = 110, cx = bx + bw / 2, cy = fy - bh / 2, k = 5.5;
      KIT.ground(c, 30, fy, 840);
      c.fillStyle = COL.energy; rrect(c, bx, fy - bh, bw, bh, 8); c.fill();
      txt(c, '2 kg', cx, cy, { size: 26, weight: 700, color: COL.panel, align: 'center' });
      c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.beginPath(); c.moveTo(bx + bw, cy); c.lineTo(bx + bw + 40 + T * k, cy); c.stroke();
      KIT.vec(c, cx, cy, 0, m * g * k, COL['ink-2'], 'mg ' + m * g + ' N', { off: 26 });
      KIT.vec(c, cx, fy - bh, 0, -N * k, COL.cold, 'N ' + N + ' N', { off: 22 });
      KIT.vec(c, bx + bw, cy, T * k, 0, COL.work, T ? 'T ' + T + ' N' : '', { lx: 30, ly: -26, off: 0 });
      KIT.vec(c, bx, fy - 20, -f * k, 0, COL.heat, f ? 'f ' + KIT.fmt(f) + ' N' : '', { lx: -10, ly: 28, off: 0 });
      txt(c, '알짜힘 ' + KIT.fmt(Fnet) + ' N', 40, 460, { size: 32, weight: 700, color: COL.energy });
      txt(c, Fnet > 0 ? '→ 오른쪽으로 가속도 ' + KIT.fmt(a) + ' m/s²' : (v > 0 ? '→ 등속도' : '→ 가속도 0 : 정지해 있다'), 300, 460, { size: 28, weight: 700 });
      if (Fnet > 0) KIT.vec(c, cx - 60, fy - bh - 70, Fnet * k * 1.6, 0, COL.energy, 'a', { off: 22 });
      txt(c, '마찰력 : 미끄러지면 μN = 0.5 × 20 = 10 N, 멈춰 있으면 당기는 힘만큼만', 40, 512, { size: 21, color: COL.muted });
      txt(c, '수직항력 N 은 위로 받치는 힘 · 이 경우만 mg 와 같다', 40, 44, { size: 24, weight: 700 });
    },
  };
}

/* ── 2-(2) 공식 유도 : 마찰이 있는 빗면 ── */
function sceneIncline(root) {
  const cv = makeCanvas(900, 560);
  const sTh = KIT.slider('경사각 θ', 10, 60, 1, 37, function (v) { return v + '°'; }, '150px');
  const sMu = KIT.slider('마찰 계수 μ', 0, 0.8, 0.05, 0.3, function (v) { return v.toFixed(2); }, '150px');
  const sM = KIT.slider('질량 m', 1, 5, 0.5, 2, function (v) { return v + ' kg'; }, '150px');
  let s = 0, v = 0, show = 0;
  const st = KIT.derive(root, {
    cv: cv, title: '마찰이 있는 빗면에서 미끄러지는 물체의 가속도',
    ctrl: [h('div', { class: 'col', style: 'gap:0;width:100%' }, sTh.el, sMu.el, sM.el)],
    intro: '경사각 θ 인 빗면 위에 질량 m 인 물체가 놓여 있다. 운동 마찰 계수는 μ 이다.',
    steps: [
      { what: '좌표축을 빗면에 나란한 방향(x)과 수직인 방향(y)으로 잡는다.', note: '물체는 빗면 방향으로만 움직이므로 y방향 가속도는 0이다.' },
      { what: '중력 mg 를 두 방향으로 분해한다.', eq: '빗면 방향 : mg {{⑧|sin θ}} 　수직 방향 : mg cos θ', note: '중력만 빗면 방향과 나란하지 않으므로 분해가 필요하다.' },
      { what: 'y방향 알짜힘은 0 이다.', eq: 'N − mg cos θ = 0 　∴ N = {{⑨|mg cos θ}}', note: '가속도가 0이면 알짜힘도 0이다 (제2법칙).' },
      { what: '마찰력을 구한다.', eq: 'f = μN = μ mg cos θ', note: '마찰력의 크기는 수직항력에 비례한다.' },
      { what: 'x방향에 제2법칙을 적용한다.', eq: 'mg sin θ − μ mg cos θ = ma 　∴ a = g ( sin θ − {{⑩|μ cos θ}} )', note: '빗면 방향으로 작용하는 두 힘의 합이 알짜힘이다.' },
    ],
    means: '빗면에서의 가속도는 물체의 {{⑪|질량}}과 관계가 없다. 경사각 θ 가 클수록 가속도는 커지고, 마찰 계수 μ 가 클수록 작아진다.',
  });
  st.on(function (n) { show = n; });
  let lastTh = 37;
  return {
    tick: function (dt) {
      const th = sTh.get() * DEG, mu = sMu.get(), m = sM.get(), g = 10;
      if (sTh.get() !== lastTh) { s = 0; v = 0; lastTh = sTh.get(); }
      const a = g * (Math.sin(th) - mu * Math.cos(th)), moving = a > 1e-6;
      const geo = slope(90, 520, 540, th);
      if (moving) { v += a * dt; s += v * dt * 30; if (s > geo.L - 155) { s = 0; v = 0; } } else { v = 0; }
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      drawSlope(c, geo);
      const P = drawBlock(c, geo, 95 + s, 110, 74, COL.energy);
      const k = 3.4, mg = m * g * k * (2 / m) * 0.9;       // 화살표 길이는 질량과 상관없이 같은 비율로 (가속도 비교용)
      KIT.vec(c, P.x, P.y, 0, mg, COL['ink-2'], 'mg', { off: 20 });
      if (show >= 2) {
        KIT.vec(c, P.x, P.y, geo.u.x * mg * Math.sin(th), geo.u.y * mg * Math.sin(th), COL.work, 'mg sin θ', { width: 5, head: 18, size: 22, dash: [8, 6] });
        KIT.vec(c, P.x, P.y, -geo.n.x * mg * Math.cos(th), -geo.n.y * mg * Math.cos(th), COL.muted, 'mg cos θ', { width: 5, head: 18, size: 22, dash: [8, 6] });
      }
      if (show >= 3) KIT.vec(c, P.x, P.y, geo.n.x * mg * Math.cos(th), geo.n.y * mg * Math.cos(th), COL.cold, 'N', { off: 22 });
      if (show >= 4) {
        const f = moving ? mu * mg * Math.cos(th) : mg * Math.sin(th);
        KIT.vec(c, P.x - geo.n.x * 30, P.y - geo.n.y * 30, -geo.u.x * f, -geo.u.y * f, COL.heat, 'f', { off: 20 });
      }
      txt(c, moving ? 'a = ' + KIT.fmt(a, 2) + ' m/s²' : '미끄러지지 않는다', 870, 44, { size: 32, weight: 700, color: COL.energy, align: 'right' });
      txt(c, moving ? 'g = 10 m/s² · 질량을 바꿔도 a 는 그대로' : '(sin θ ≤ μ cos θ)', 870, 86, { size: 22, color: COL.muted, align: 'right' });
      if (show < 2) txt(c, '[다음 단계]를 누르면 힘을 하나씩 그린다', 870, 128, { size: 20, color: COL.muted, align: 'right' });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '수직항력', q: '수직항력의 크기는 언제나 중력의 크기와 같다?', wrong: '빗면 위 물체에 작용하는 수직항력도 mg 이다.',
      why: '수직항력은 면이 물체를 미는 힘이므로, 면에 수직인 방향의 힘 균형으로 결정된다.', right: '빗면에서는 N = mg cos θ 이므로 mg 보다 작다. 수직항력은 상황마다 다시 구해야 한다.' },
    { short: '힘과 운동 방향', q: '물체는 힘이 작용하는 방향으로 움직인다?', wrong: '알짜힘이 빗면 아래쪽이면 물체도 반드시 아래로 움직인다.',
      why: '제2법칙이 말하는 것은 알짜힘의 방향이 가속도(속도가 변하는 방향)와 같다는 것이다.', right: '빗면을 올라가는 물체도 알짜힘은 아래 방향이다. 이때 물체는 위로 움직이면서 속력이 줄어든다.' },
  ], {
    w: 860, h: 620,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        const thd = 30 + 25 * Math.sin(t * 0.6), th = thd * DEG, geo = slope(90, 420, 560, th);
        drawSlope(c, geo);
        const P = drawBlock(c, geo, 260, 100, 70, COL.energy), L = 150;
        KIT.vec(c, P.x, P.y, 0, L, COL['ink-2'], 'mg');
        KIT.vec(c, P.x, P.y, geo.n.x * L * Math.cos(th), geo.n.y * L * Math.cos(th), COL.cold, 'N');
        txt(c, 'θ = ' + Math.round(thd) + '°', 40, 44, { size: 30, weight: 700 });
        // 막대 비교
        c.fillStyle = COL['ink-2']; c.fillRect(120, 500, 600, 28); txt(c, 'mg', 100, 514, { size: 24, weight: 700, align: 'right' });
        c.fillStyle = COL.cold; c.fillRect(120, 550, 600 * Math.cos(th), 28); txt(c, 'N', 100, 564, { size: 24, weight: 700, align: 'right', color: COL.cold });
        txt(c, 'N = mg cos θ = ' + Math.cos(th).toFixed(2) + ' mg', 740, 564, { size: 22, weight: 700, color: COL.cold });
      } else {
        // 빗면을 올라가는 상자 : 처음 속력으로 올라가다가 멈추고 다시 내려온다 (마찰 없음)
        const th = 25 * DEG, geo = slope(90, 440, 640, th), g = 10, v0 = 9, a = g * Math.sin(th);
        const T = 2 * v0 / a, tt = (t % (T + 1)), s = Math.max(0, Math.min(T, tt)), vel = v0 - a * s, pos = 470 - (v0 * s - a * s * s / 2) * 30;
        drawSlope(c, geo);
        const P = drawBlock(c, geo, pos, 100, 70, COL.energy);
        KIT.vec(c, P.x - geo.n.x * 70, P.y - geo.n.y * 70, geo.u.x * 120, geo.u.y * 120, COL.heat, '알짜힘', { size: 22 });
        if (Math.abs(vel) > 0.3) KIT.vec(c, P.x + geo.n.x * 60, P.y + geo.n.y * 60, -geo.u.x * vel * 14, -geo.u.y * vel * 14, COL.cold, '속도', { size: 22 });
        txt(c, vel > 0.3 ? '올라가는 중 : 속력이 줄어든다' : vel < -0.3 ? '내려오는 중 : 속력이 늘어난다' : '잠깐 멈춤', 40, 44, { size: 30, weight: 700 });
        txt(c, '알짜힘(가속도)은 처음부터 끝까지 빗면 아래 방향', 40, 560, { size: 24, weight: 700, color: COL.heat });
      }
    },
  });
}

/* ── 3 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(860, 600);
  let showF = false;
  const btn = KIT.btn('힘 보기', function () { showF = !showF; btn.setAttribute('aria-pressed', String(showF)); });
  btn.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [btn, KIT.hint('(1)~(4)를 푼 뒤 눌러 확인해 보자')], [
    KIT.cap('예제'),
    KIT.p('질량 2 kg 인 물체가 수평면과 37° 를 이루는 빗면 위에서 미끄러져 내려온다. 물체와 빗면 사이의 운동 마찰 계수는 0.5 이다. (g = 10 m/s^{2}, sin 37° = 0.6, cos 37° = 0.8)', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 빗면 방향의 중력 성분 　mg sin θ = 2 × 10 × 0.6 = {{⑫|12}} N'),
    KIT.p('(2) 수직항력 　N = mg cos θ = 2 × 10 × 0.8 = 16 N'),
    KIT.p('(3) 마찰력 　f = μN = 0.5 × 16 = 8 N'),
    KIT.p('(4) 알짜힘 　F = (1)의 값 − (3)의 값 = {{(4)|4}} N'),
    KIT.p('(5) 가속도 　a = [[F|m]] = {{⑬|2}} m/s^{2}'),
  ], { center: true });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 860, 600);
      const th = 37 * DEG, geo = slope(80, 480, 680, th);
      drawSlope(c, geo, '37°');
      const P = drawBlock(c, geo, 230, 120, 80, COL.energy);
      txt(c, '2 kg', P.x, P.y, { size: 26, weight: 700, color: COL.panel, align: 'center' });
      txt(c, 'μ = 0.5', 520, 160, { size: 28, weight: 700, color: COL.good });
      if (!showF) return;
      const k = 9;
      KIT.vec(c, P.x, P.y, geo.u.x * 12 * k, geo.u.y * 12 * k, COL.work, '12 N', { size: 24 });
      KIT.vec(c, P.x - geo.n.x * 46, P.y - geo.n.y * 46, -geo.u.x * 8 * k, -geo.u.y * 8 * k, COL.heat, 'f 8 N', { size: 24 });
      KIT.vec(c, P.x + geo.n.x * 40, P.y + geo.n.y * 40, geo.n.x * 16 * k * 0.6, geo.n.y * 16 * k * 0.6, COL.cold, 'N 16 N', { size: 24 });
      txt(c, '알짜힘 12 − 8 = 4 N → a = 4 ÷ 2 = 2 m/s²', 40, 560, { size: 28, weight: 700, color: COL.energy });
    },
  };
}
