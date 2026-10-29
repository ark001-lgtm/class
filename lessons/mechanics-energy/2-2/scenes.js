/* ═══════════════ 02. 이상 기체 법칙 : 장면 ═══════════════
   비열과 잠열(얼음을 계속 가열) → 이상 기체 법칙(공식 유도) → 주의 → 예제.
   학습지 빈칸 : ① 변하지 않는다 ② 일정하다 ③ 일정 ④ 기화열 ⑤ P V / T ⑥ 종류 ⑦ 무시 ⑧ 2 ⑨ 84000 ⑩ 168000 */
const P1 = '1 비열과 잠열', P2 = '2 이상 기체 법칙';
const SCENE_LIST = [
  { id: 'heat', part: P1, title: '비열과 잠열', ws: '학습지 1 ①② [표 1] ③④', make: sceneHeat },
  { id: 'gas', part: P2, title: '세 법칙을 하나로 묶기', ws: '학습지 2 ⑤⑥⑦', make: sceneGas },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑧⑨⑩', make: sceneEx },
];
const TAU = Math.PI * 2;
/** 얼음 −20 ℃ 를 계속 가열할 때 : 받은 열(0~1) → 온도 · 상태 */
const CURVE = [[0, -20, '얼음'], [0.08, 0, '얼음'], [0.3, 0, '얼음 + 물'], [0.5, 100, '물'], [0.86, 100, '물 + 수증기'], [1, 130, '수증기']];
function curveAt(q) {
  for (let i = 1; i < CURVE.length; i++) if (q <= CURVE[i][0]) {
    const a = CURVE[i - 1], b = CURVE[i], s = (q - a[0]) / (b[0] - a[0]);
    return { T: a[1] + (b[1] - a[1]) * s, state: b[2], flat: a[1] === b[1] };
  }
  return { T: 130, state: '수증기', flat: false };
}
function drawCurve(c, ax, q) {
  const pts = CURVE.map(function (p) { return [ax.X(p[0]), ax.Y((p[1] + 20) / 150)]; });
  KIT.line(c, pts, rgba(COL.energy, 0.35), 5);
  const done = [];
  for (let i = 0; i <= 100; i++) { const u = q * i / 100; done.push([ax.X(u), ax.Y((curveAt(u).T + 20) / 150)]); }
  KIT.line(c, done, COL.energy, 6);
  [0, 100].forEach(function (T) { KIT.dash(c, ax.X(0), ax.Y((T + 20) / 150), ax.X(1), ax.Y((T + 20) / 150), COL.line, 2, [6, 6]); txt(c, T + ' ℃', ax.X(0) - 10, ax.Y((T + 20) / 150), { size: 18, color: COL.muted, align: 'right' }); });
}

/* ── 1 비열과 잠열 ── */
function sceneHeat(root) {
  const cv = makeCanvas(900, 600);
  let q = 0, run = true;
  const pb = KIT.btn('멈춤', function () { run = !run; pb.textContent = run ? '멈춤' : '계속 가열'; });
  KIT.split(root, cv, [pb, KIT.btn('처음부터', function () { q = 0; run = true; pb.textContent = '멈춤'; })], [
    KIT.cap('(1) 비열'),
    KIT.p('• 비열 c 는 물질 1 kg 의 온도를 1 K 올리는 데 필요한 열량이다. 　Q = c m ΔT', 'ws sm'),
    KIT.p('• 물은 비열이 매우 커서 같은 열을 받아도 온도가 잘 {{①|변하지 않는다}}. 해안 지방의 일교차가 작은 것도 이 때문이다.', 'ws sm'),
    KIT.cap('(2) 잠열'),
    KIT.p('• 상태가 변하는 동안 흡수하거나 방출하는 열을 잠열이라 한다. 이때 온도는 {{②|일정하다}}. 　Q = m L', 'ws sm'),
    KIT.p('• 받은 열이 온도를 올리는 데 쓰이지 않고, 분자 사이의 결합을 끊는 데 모두 쓰이기 때문이다.', 'ws sm'),
    KIT.table(['구간', '상태', '온도', '열이 쓰이는 곳'], [
      ['가열 시작', '얼음', '올라간다', '온도 상승 (Q = cmΔT)'],
      ['0 ℃ 구간', '얼음 + 물', '{{③|일정}}', '융해열 (Q = mL)'],
      ['중간', '물', '올라간다', '온도 상승'],
      ['100 ℃ 구간', '물 + 수증기', '일정', '{{④|기화열}}'],
    ], { cols: ['22%', '24%', '20%', '34%'] }),
  ]);
  return {
    tick: function (dt) {
      if (run) { q += dt * 0.05; if (q > 1) q = 0; }
      const s = curveAt(q), c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const ax = KIT.axes(c, { x: 90, y: 80, w: 520, h: 440 }, '받은 열', '온도');
      drawCurve(c, ax, q);
      dot(c, ax.X(q), ax.Y((s.T + 20) / 150), 12, COL.heat);
      // 비커
      const bx = 680, by = 170, bw = 180, bh = 230;
      c.strokeStyle = COL['ink-2']; c.lineWidth = 5; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by + bh); c.lineTo(bx + bw, by + bh); c.lineTo(bx + bw, by); c.stroke();
      const ice = s.state.indexOf('얼음') >= 0, water = s.state.indexOf('물') >= 0 && s.state !== '수증기', steam = s.state.indexOf('수증기') >= 0;
      if (water) { c.fillStyle = rgba(COL.cold, 0.35); c.fillRect(bx + 3, by + 80, bw - 6, bh - 83); }
      if (ice) for (let i = 0; i < (s.state === '얼음' ? 6 : 3); i++) { c.fillStyle = 'rgba(200,230,255,0.95)'; c.strokeStyle = COL.cold; c.lineWidth = 2; const x = bx + 20 + (i % 3) * 52, y = by + bh - 60 - Math.floor(i / 3) * 52; rrect(c, x, y, 44, 44, 6); c.fill(); c.stroke(); }
      if (steam) for (let i = 0; i < 8; i++) { const yy = by + 60 - ((q * 900 + i * 37) % 120); c.fillStyle = rgba(COL.muted, 0.35); c.beginPath(); c.arc(bx + 30 + (i * 23) % 130, yy, 10, 0, TAU); c.fill(); }
      for (let i = 0; i < 6; i++) { const fx = bx + 30 + i * 26; c.fillStyle = rgba(COL.heat, 0.85); c.beginPath(); c.moveTo(fx - 9, by + bh + 50); c.lineTo(fx, by + bh + 14); c.lineTo(fx + 9, by + bh + 50); c.fill(); }
      txt(c, s.state, bx + bw / 2, by - 30, { size: 26, weight: 700, align: 'center' });
      txt(c, Math.round(s.T) + ' ℃', 30, 44, { size: 32, weight: 700, color: COL.heat, mono: true });
      txt(c, s.flat ? '상태가 변하는 중 : 계속 가열해도 온도가 그대로 (잠열)' : '온도가 올라간다 (Q = cmΔT)', 170, 44, { size: 24, weight: 700, color: s.flat ? COL.energy : COL.ink });
    },
  };
}

/* ── 2 공식 유도 : 이상 기체 법칙 ── */
function sceneGas(root) {
  let mode = 0;
  const cv = makeCanvas(900, 480);
  const sV = KIT.slider('부피 V', 1, 4, 0.1, 2, function (v) { return v.toFixed(1) + ' L'; }, '110px');
  const sT = KIT.slider('온도 T', 150, 600, 10, 300, function (v) { return v + ' K'; }, '110px');
  const box = h('div', { style: 'width:100%' }, sV.el);
  const seg = KIT.seg(['보일 법칙 (온도 일정)', '샤를 법칙 (압력 일정)'], 0, function (i) { mode = i; box.replaceChildren(i ? sT.el : sV.el); }, true);
  const ps = []; for (let i = 0; i < 40; i++) { const a = Math.random() * TAU; ps.push({ x: Math.random(), y: Math.random(), dx: Math.cos(a), dy: Math.sin(a) }); }
  KIT.derive(root, {
    cv: cv, title: '세 법칙을 하나로 묶기',
    ctrl: [h('div', { class: 'col', style: 'gap:4px;width:100%' }, seg.el, box)],
    intro: '실험으로 알려진 두 법칙에서 출발한다.',
    steps: [
      { what: '보일 법칙 (온도 일정)', eq: 'P V = 일정', note: '부피를 줄이면 압력이 커진다.' },
      { what: '샤를 법칙 (압력 일정)', eq: '[[V|T]] = 일정', note: '온도를 올리면 부피가 커진다.' },
      { what: '두 법칙을 함께 만족시키는 형태로 묶는다.', eq: '{{⑤|P V / T}} = 일정', note: '각 법칙에서 나머지 하나를 고정하면 원래 식이 나온다.' },
      { what: '이 일정한 값은 기체의 양에 비례한다.', eq: '∴ P V = n R T', note: '같은 조건이면 분자 수가 2배일 때 부피도 2배이다.' },
    ],
    means: 'R 은 기체의 {{⑥|종류}}에 관계없이 같은 값을 갖는 상수이다 (R = 8.31 J/mol·K). 그래서 이상 기체 법칙 하나로 모든 기체를 다룰 수 있다.',
    after: h('div', { class: 'col', style: 'gap:6px' }, KIT.cap('(2) 이상 기체란'),
      KIT.p('• 분자 자체의 부피를 무시하고, 분자 사이에 작용하는 힘도 {{⑦|무시}}한 가상의 기체이다. 실제 기체도 온도가 높고 압력이 낮으면 이상 기체에 가깝게 행동한다.', 'ws sm', 'font-size:24px')),
  });
  return {
    tick: function (dt) {
      // 처음 상태 : P = 1 기압, V = 2 L, T = 300 K → PV/T = 1/150
      let P, V, T;
      if (mode === 0) { T = 300; V = sV.get(); P = 2 / V; } else { P = 1; T = sT.get(); V = 2 * T / 300; }
      const c = cv.ctx; c.clearRect(0, 0, 900, 480);
      const x0 = 60, y0 = 120, hh = 220, w = V * 120, sp = 160 * Math.sqrt(T / 300);
      ps.forEach(function (p) {
        p.x += p.dx * sp * dt / w; p.y += p.dy * sp * dt / hh;
        if (p.x < 0) { p.x = -p.x; p.dx = Math.abs(p.dx); } if (p.x > 1) { p.x = 2 - p.x; p.dx = -Math.abs(p.dx); }
        if (p.y < 0) { p.y = -p.y; p.dy = Math.abs(p.dy); } if (p.y > 1) { p.y = 2 - p.y; p.dy = -Math.abs(p.dy); }
        dot(c, x0 + 8 + p.x * (w - 16), y0 + 8 + p.y * (hh - 16), 7, mix(COL.cold, COL.heat, clamp((T - 150) / 450, 0, 1)));
      });
      c.strokeStyle = COL['ink-2']; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 520, y0); c.lineTo(x0, y0); c.lineTo(x0, y0 + hh); c.lineTo(x0 + 520, y0 + hh); c.stroke();
      c.fillStyle = COL.ink; c.fillRect(x0 + w, y0 + 4, 16, hh - 8); c.fillRect(x0 + w + 16, y0 + hh / 2 - 6, 520 - w - 30, 12);
      [['P', KIT.fmt(P, 2) + ' 기압', COL.heat], ['V', KIT.fmt(V, 2) + ' L', COL.work], ['T', T + ' K', COL.energy]].forEach(function (r, i) {
        txt(c, r[0] + ' = ' + r[1], 640 + 0 * i, 150 + i * 50, { size: 28, weight: 700, color: r[2], mono: true });
      });
      txt(c, 'P V ÷ T = ' + (P * V / T * 150).toFixed(2) + ' × (1/150)', 640, 320, { size: 22, weight: 700, mono: true });
      txt(c, mode === 0 ? '온도 일정 : 부피를 줄이면 압력이 커진다' : '압력 일정 : 온도를 올리면 부피가 커진다', 30, 44, { size: 26, weight: 700 });
      txt(c, 'PV/T 는 늘 같다', 640, 360, { size: 22, color: COL.energy, weight: 700 });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '온도는 계속?', q: '열을 계속 넣으면 온도는 계속 올라간다?', wrong: '가열하는 동안에는 온도계 눈금이 계속 올라갈 것이다.',
      why: '상태가 변하는 동안 들어간 열은 분자 사이의 결합을 끊는 데 모두 쓰인다.', right: '얼음이 녹는 동안과 물이 끓는 동안에는 계속 가열해도 온도가 그대로다. 이때 흡수된 열이 잠열이다.' },
    { short: '섭씨온도?', q: '기체 법칙의 온도는 섭씨온도로 넣으면 된다?', wrong: '25 ℃ 를 그대로 T 자리에 넣는다.',
      why: '샤를 법칙은 부피가 절대온도에 비례한다는 뜻이다. 섭씨 0 도를 0 으로 두면 비례 관계가 깨진다.', right: '반드시 절대온도 K 로 바꾸어 넣는다. 　T(K) = t(℃) + 273' },
  ], {
    w: 820, h: 560,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        const ax = KIT.axes(c, { x: 90, y: 80, w: 660, h: 400 }, '받은 열', '온도'), q = (t * 0.06) % 1;
        drawCurve(c, ax, q);
        const s = curveAt(q); dot(c, ax.X(q), ax.Y((s.T + 20) / 150), 12, COL.heat);
        txt(c, s.flat ? '가열 중인데 온도가 그대로! (' + s.state + ')' : s.state + ' : 온도 상승', 30, 44, { size: 26, weight: 700, color: s.flat ? COL.energy : COL.ink });
      } else {
        // 부피 – 온도 그래프 : 섭씨로 그리면 원점을 지나지 않고, 늘이면 −273 ℃ 에서 0
        const x0 = 90, y0 = 470, sx = 1.6, sy = 1.1;
        c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.beginPath(); c.moveTo(30, y0); c.lineTo(800, y0); c.stroke();
        const zx = x0 + 273 * sx; c.beginPath(); c.moveTo(zx, y0); c.lineTo(zx, 70); c.stroke();
        txt(c, '0 ℃', zx, y0 + 26, { size: 20, align: 'center' }); txt(c, '−273 ℃ (0 K)', x0, y0 + 26, { size: 20, align: 'center', color: COL.heat, weight: 700 });
        KIT.dash(c, x0, y0, zx, y0 - 273 * sx * 0.7, COL.heat, 3);
        KIT.line(c, [[zx, y0 - 273 * sx * 0.7], [zx + 150 * sx, y0 - (273 + 150) * sx * 0.7]], COL.energy, 6);
        txt(c, '부피', zx + 12, 84, { size: 22, color: COL.muted }); txt(c, '온도 (℃)', 790, y0 - 18, { size: 22, color: COL.muted, align: 'right' });
        txt(c, '섭씨온도로는 비례하지 않는다. 절대온도(K)로 재면 원점을 지난다', 24, 40, { size: 22, weight: 700 });
      }
    },
  });
}

/* ── 3 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 560);
  KIT.split(root, cv, [], [
    KIT.cap('예제'),
    KIT.p('부피 2 L, 온도 300 K, 압력 1기압인 이상 기체가 든 용기가 있다. (기체의 양은 변하지 않는다)', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 온도를 그대로 두고 부피를 1 L 로 줄이면 압력은 {{⑧|2}} 기압', 'ws sm'),
    KIT.p('(2) 압력을 그대로 두고 온도를 600 K 로 올리면 부피는 {{(2)|4}} L', 'ws sm'),
    KIT.p('(3) 물 2 kg 의 온도를 10 K 올리는 데 필요한 열량 　Q = c m ΔT = 4200 × 2 × 10 = {{⑨|84000}} J', 'ws sm'),
    KIT.p('(4) 0 ℃ 얼음 0.5 kg 을 모두 녹이는 데 필요한 열량 　Q = m L = 0.5 × 336000 = {{⑩|168000}} J', 'ws sm'),
  ], { center: true });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 820, 560);
      [['처음', 2, '2 L · 300 K · 1 기압', 60], ['(1) 온도 그대로', 1, '1 L · 300 K · ? 기압', 230], ['(2) 압력 그대로', 4, '? L · 600 K · 1 기압', 400]].forEach(function (o) {
        const y = o[3], w = o[1] * 110;
        txt(c, o[0], 30, y + 20, { size: 22, weight: 700 });
        c.strokeStyle = COL['ink-2']; c.lineWidth = 5; c.strokeRect(30, y + 40, 480, 90);
        c.fillStyle = rgba(COL.cold, 0.2); c.fillRect(32, y + 42, w, 86);
        c.fillStyle = COL.ink; c.fillRect(30 + w, y + 42, 12, 86);
        txt(c, o[2], 540, y + 85, { size: 22, weight: 700, mono: true });
      });
    },
  };
}
