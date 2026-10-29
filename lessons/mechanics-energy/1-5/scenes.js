/* ═══════════════ 05. 탈출 속도와 우주선의 운동 : 장면 ═══════════════
   중력에 의한 위치 에너지 → 탈출 속도(공식 유도) → 탈출 속도와 행성의 대기 → 우주선이 궤도에 오르는 원리 → 주의 → 예제.
   학습지 빈칸 : ① 음(−) ② 커진다 ③ 보존 ④ 0 ⑤ √(2 G M / R) ⑥ 질량 ⑦ 빠르다 ⑧ 11.2 ⑨ 운동량 ⑩ 진공 ⑪ 2 ⑫ 같다 */
const P1 = '1 탈출 속도', P2 = '2 탈출 속도와 행성의 대기', P3 = '3 우주선이 궤도에 오르는 원리';
const SCENE_LIST = [
  { id: 'pot', part: P1, title: '중력에 의한 위치 에너지', ws: '학습지 1-(1) ①②', make: scenePot },
  { id: 'escape', part: P1, title: '탈출 속도', ws: '학습지 1-(2) ③~⑥', make: sceneEscape },
  { id: 'air', part: P2, title: '탈출 속도와 행성의 대기', ws: '학습지 2 ⑦ [표 1] ⑧', make: sceneAir },
  { id: 'rocket', part: P3, title: '로켓이 나아가는 원리', ws: '학습지 3 ⑨⑩', make: sceneRocket },
  { id: 'mis', part: P3, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '예제', title: '예제', ws: '예제 ⑪⑫', make: sceneEx },
];
const TAU = Math.PI * 2;
function planet(c, x, y, r, color, label) {
  c.fillStyle = color || COL.cold; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  if (label) txt(c, label, x, y, { size: Math.min(26, r * 0.6), weight: 700, color: '#fff', align: 'center' });
}

/* ── 1-(1) U = −GMm/r ── */
function scenePot(root) {
  const cv = makeCanvas(900, 600);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.cap('(1) 중력에 의한 위치 에너지'),
    KIT.p('• 천체에서 무한히 먼 곳을 기준(0)으로 잡으면 　U = − [[G M m|r]]'),
    KIT.p('• 이 값은 항상 {{①|음(−)}}의 값이며, 천체에서 멀어질수록 0에 가까워지면서 {{②|커진다}}.'),
    KIT.callout('위로 올라갈수록 위치 에너지가 커진다는 점은 지표면 근처의 mgh 와 같다. 다만 기준(0)을 무한히 먼 곳에 두었기 때문에 값이 음수이다.', false, 'font-size:26px'),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const ax = KIT.axes(c, { x: 110, y: 90, w: 740, h: 420 }, '거리 r', 'U', { zero: 0.12 });
      txt(c, '0 (무한히 먼 곳)', 850, ax.y0 - 18, { size: 18, color: COL.muted, align: 'right' });
      planet(c, 70, ax.y0, 40, COL.cold, '행성');
      // U 는 음수라 0 선 아래로 그린다 (행성 표면 r = R 에서 가장 아래)
      const Rp = 0.08, depth = 400;
      const pts = []; for (let i = 0; i <= 200; i++) { const u = Rp + (1 - Rp) * i / 200; pts.push([ax.X(u), ax.y0 + Rp / u * depth]); }
      KIT.line(c, pts, COL.energy, 5);
      const u = Rp + (1 - Rp) * ((t * 0.12) % 1), y = ax.y0 + (Rp / u) * depth;
      KIT.dash(c, ax.X(u), ax.y0, ax.X(u), y, COL.muted, 2, [6, 6]);
      dot(c, ax.X(u), y, 12, COL.heat);
      txt(c, 'r = ' + KIT.fmt(u / Rp, 1) + ' R 에서 U = −' + KIT.fmt(Rp / u, 2) + ' × (GMm/R)', 30, 44, { size: 26, weight: 700 });
      txt(c, '멀어질수록 0 에 가까워진다 (늘 음수)', 30, 560, { size: 24, weight: 700, color: COL.energy });
    },
  };
}

/* ── 1-(2) 공식 유도 : 탈출 속도 (GM = 1, R = 1 로 둔 모형) ── */
function sceneEscape(root) {
  const cv = makeCanvas(900, 540);
  const sf = KIT.slider('쏘아 올리는 속력', 0.6, 1.2, 0.05, 0.9, function (v) { return KIT.fmt(v, 2) + ' × 탈출 속도'; }, '220px');
  let r = 1, v = 0, last = -1, t = 0;
  function launch() { r = 1; v = sf.get() * Math.SQRT2; t = 0; }
  KIT.derive(root, {
    cv: cv, title: '탈출 속도',
    ctrl: [h('div', { class: 'col', style: 'gap:6px;width:100%' }, sf.el, h('div', { class: 'row', style: 'gap:12px' }, KIT.btn('쏘아 올리기', launch, true)))],
    intro: '질량 M, 반지름 R 인 행성 표면에서 질량 m 인 물체를 위로 쏘아 올린다. 공기 저항은 무시한다.',
    steps: [
      { what: '물체가 다시 돌아오지 않고 무한히 멀어져 겨우 정지하게 되는 최소 속력을 탈출 속도라 한다.', note: '\'겨우\'라는 조건이 무한히 먼 곳에서 속력 0 이라는 뜻이다.' },
      { what: '중력만 작용하므로 역학적 에너지가 {{③|보존}}된다.', note: '중력 외에 일을 하는 힘이 없기 때문이다.' },
      { what: '표면에서 : [[1|2]] m v^{2} + ( − [[G M m|R]] ), 무한히 먼 곳에서 : 0 + 0', eq: '∴ [[1|2]] m v^{2} − [[G M m|R]] = {{④|0}}', note: '두 지점의 역학적 에너지를 같다고 놓는다.' },
      { what: 'v 에 대하여 정리한다.', eq: '∴ v = {{⑤|√(2 G M / R)}}', note: '양변의 m 이 지워지는 것이 핵심이다.' },
    ],
    means: '탈출 속도는 쏘아 올리는 물체의 {{⑥|질량}}과 관계없다. 중심 천체의 질량 M 이 클수록, 반지름 R 이 작을수록 커진다.',
  });
  launch();
  return {
    tick: function (dt) {
      if (sf.get() !== last) { last = sf.get(); launch(); }
      for (let i = 0; i < 4; i++) { const h4 = dt / 4; v -= h4 / (r * r); r += v * h4 * 1.0; if (r < 1) { r = 1; v = 0; } }
      t += dt;
      const E = v * v / 2 - 1 / r, c = cv.ctx; c.clearRect(0, 0, 900, 540);
      const px = 90, py = 180, k = 75;
      planet(c, px, py, k * 0.9, COL.cold, '행성');
      for (let d = 2; d <= 10; d += 2) { c.fillStyle = COL.muted; c.fillRect(px + d * k - 1, py + 90, 2, 12); txt(c, d + 'R', px + d * k, py + 120, { size: 18, color: COL.muted, align: 'center' }); }
      KIT.dash(c, px, py + 96, 860, py + 96, COL.line, 2, [4, 6]);
      const x = px + Math.min(r, 10.5) * k;
      dot(c, x, py, 14, COL.heat);
      if (r > 10.5) txt(c, '→ 계속 멀어진다', 760, py - 40, { size: 24, weight: 700, color: COL.heat });
      // 에너지 막대 (가로) : 운동 + 위치 = 합 (단위 GMm/R). 가운데 세로선이 0, 오른쪽이 +, 왼쪽이 −
      const zx = 520, sc = 230;
      txt(c, '역학적 에너지 (단위 GMm/R)', 40, 350, { size: 22, weight: 700 });
      [['운동 에너지', v * v / 2, COL.cold], ['위치 에너지', -1 / r, COL.heat], ['합', E, COL.energy]].forEach(function (b, i) {
        const y = 400 + i * 48, w = b[1] * sc;
        c.fillStyle = b[2]; c.fillRect(w > 0 ? zx : zx + w, y - 16, Math.abs(w), 32);
        txt(c, b[0], 40, y, { size: 22, weight: 700, color: b[2] });
        txt(c, KIT.fmt(b[1], 2), w >= 0 ? zx + w + 12 : zx + 12, y, { size: 22, weight: 700, mono: true });
      });
      c.fillStyle = COL['ink-2']; c.fillRect(zx - 1, 370, 3, 160);
      txt(c, '0', zx, 360, { size: 18, color: COL.muted, align: 'center' });
      txt(c, E < -0.005 ? '합 < 0 → 다시 떨어진다' : E > 0.005 ? '합 > 0 → 탈출한다' : '합 = 0 → 겨우 탈출 (탈출 속도)', 30, 44, { size: 30, weight: 700, color: COL.energy });
    },
  };
}

/* ── 2 탈출 속도와 행성의 대기 ── */
function sceneAir(root) {
  const cv = makeCanvas(900, 600);
  const W = [{ name: '달', ve: 2.4, col: '#9AA5B1' }, { name: '지구', ve: 11.2, col: COL.cold }, { name: '목성', ve: 59.5, col: '#D9A066' }];
  const mols = [];
  for (let i = 0; i < 90; i++) mols.push({ w: i % 3, light: i % 2 === 0, x: Math.random(), y: 0, vy: 0, gone: false, delay: Math.random() * 3 });
  KIT.split(root, cv, [], [
    KIT.p('• 기체 분자는 온도에 따라 어떤 평균 속력으로 움직인다. 이 속력이 탈출 속도에 비해 클수록 대기가 쉽게 빠져나간다.', 'ws sm'),
    KIT.p('• 같은 온도에서 가벼운 분자일수록 평균 속력이 {{⑦|빠르다}}. 그래서 지구 대기에는 수소와 헬륨이 거의 남아 있지 않다.', 'ws sm'),
    KIT.cap('[표 1] 천체별 탈출 속도'),
    KIT.table(['천체', '달', '지구', '목성'], [
      ['탈출 속도 (km/s)', '2.4', '{{⑧|11.2}}', '59.5'],
      ['대기', '거의 없다', '질소·산소 중심', '수소·헬륨까지 붙잡음'],
    ], { cols: ['28%', '20%', '26%', '26%'] }),
    KIT.hint('※ 달은 질량이 작아 탈출 속도가 작으므로 기체 분자를 붙잡아 두지 못한다. 그래서 대기가 거의 없다.'),
  ]);
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      txt(c, '작은 점 : 가벼운 분자 (수소 · 헬륨) · 큰 점 : 무거운 분자 (질소 · 산소)', 24, 34, { size: 20, weight: 700 });
      W.forEach(function (w, i) {
        const x0 = 30 + i * 290, gy = 540;
        c.fillStyle = w.col; c.fillRect(x0, gy, 260, 40);
        txt(c, w.name + ' · ' + w.ve + ' km/s', x0 + 130, gy + 20, { size: 22, weight: 700, color: '#fff', align: 'center' });
        c.strokeStyle = COL.line; c.lineWidth = 2; c.strokeRect(x0, 70, 260, gy - 70);
      });
      mols.forEach(function (m) {
        if (m.delay > 0) { m.delay -= dt; return; }
        const w = W[m.w];
        if (m.vy === 0 && m.y === 0) {
          // 튀어 오르는 속력 : 가벼운 분자는 빠르다. 탈출 속도를 넘으면 돌아오지 않는다
          const speed = (m.light ? 6 : 2) * (0.6 + Math.random() * 0.8);
          m.vy = speed; m.gone = speed > w.ve;
        }
        const g = 30 / w.ve;                      // 탈출 속도가 작은 천체일수록 덜 붙잡는다 (그림용)
        m.y += m.vy * dt * 60; if (!m.gone) m.vy -= g * dt * 6;
        if (!m.gone && m.y <= 0) { m.y = 0; m.vy = 0; m.x = Math.random(); }
        if (m.gone && m.y > 520) { m.y = 0; m.vy = 0; m.delay = 1 + Math.random() * 2; m.x = Math.random(); }
        const x = 40 + m.w * 290 + m.x * 240, y = 535 - Math.min(m.y, 470);
        if (y < 72) return;
        dot(c, x, y, m.light ? 5 : 9, m.gone ? COL.heat : (m.light ? COL.energy : COL['ink-2']));
      });
      txt(c, '주황 : 탈출 속도를 넘어 빠져나가는 분자', 24, 66, { size: 20, weight: 700, color: COL.heat });
    },
  };
}

/* ── 3 로켓 : 운동량 보존 ── */
function sceneRocket(root) {
  const cv = makeCanvas(900, 560);
  let t = 0;
  const gas = [];
  KIT.split(root, cv, [], [
    KIT.p('• 로켓은 연료를 태워 생긴 기체를 뒤쪽으로 매우 빠르게 내뿜는다.', 'ws sm'),
    KIT.p('• 로켓과 분출된 기체를 하나의 계로 보면 전체 {{⑨|운동량}}이 보존된다. 기체가 뒤로 얻은 운동량만큼 로켓은 앞으로 나아간다.', 'ws sm'),
    KIT.p('• 이는 작용·반작용으로도 설명된다. 로켓이 기체를 뒤로 미는 만큼 기체가 로켓을 앞으로 민다.', 'ws sm'),
    KIT.p('• 따라서 밀어낼 공기가 필요 없으므로 {{⑩|진공}}인 우주 공간에서도 추진할 수 있다.', 'ws sm'),
    KIT.hint('※ 우주선이 궤도에 오르는 과정은 정량적으로 계산하지 않고, 위와 같이 정성적으로 이해한다.'),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      for (let i = 0; i < 40; i++) { c.fillStyle = rgba(COL.muted, 0.4); c.fillRect((i * 137) % 900, (i * 71) % 560, 2, 2); }
      const rx = 380 + 40 * Math.sin(t * 0.3), ry = 280;
      if (Math.random() < 0.7) gas.push({ x: rx - 120, y: ry + (Math.random() - 0.5) * 30, vx: -500 - Math.random() * 200, life: 1 });
      gas.forEach(function (g) { g.x += g.vx * dt; g.life -= dt; });
      while (gas.length && gas[0].life <= 0) gas.shift();
      gas.forEach(function (g) { dot(c, g.x, g.y, 5, rgba(COL.heat, Math.max(0, g.life))); });
      c.fillStyle = COL['ink-2']; c.beginPath(); c.moveTo(rx + 130, ry); c.lineTo(rx + 60, ry - 40); c.lineTo(rx - 110, ry - 40); c.lineTo(rx - 110, ry + 40); c.lineTo(rx + 60, ry + 40); c.closePath(); c.fill();
      c.fillStyle = COL.heat; c.beginPath(); c.moveTo(rx - 110, ry - 26); c.lineTo(rx - 150, ry); c.lineTo(rx - 110, ry + 26); c.fill();
      KIT.vec(c, rx + 20, ry - 90, 170, 0, COL.cold, '로켓의 운동량', { size: 22, off: 30, ly: -30 });
      KIT.vec(c, rx - 150, ry + 100, -170, 0, COL.heat, '기체의 운동량', { size: 22, off: 30, ly: 30 });
      txt(c, '처음 운동량 0 = 로켓의 운동량 + 기체의 운동량', 30, 44, { size: 26, weight: 700 });
      txt(c, '진공 : 밀어낼 공기가 없어도 나아간다', 30, 520, { size: 24, weight: 700, color: COL.energy });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '무거운 우주선', q: '무거운 우주선일수록 탈출 속도가 크다?', wrong: '질량이 크면 중력을 더 크게 받으니 더 빨리 던져야 한다.',
      why: '유도 과정에서 물체의 질량 m 이 양변에서 지워진다.', right: '탈출 속도는 물체의 질량과 무관하다. 다만 무거운 우주선을 그 속도까지 가속하려면 더 많은 연료와 일이 필요할 뿐이다.' },
    { short: '공기를 민다?', q: '로켓은 공기를 뒤로 밀어내며 날아간다?', wrong: '공기가 있어야 밀어낼 대상이 있으므로 진공에서는 추진할 수 없다.',
      why: '로켓이 미는 것은 바깥 공기가 아니라 자신이 내뿜는 연소 기체이다.', right: '운동량 보존에 따라 기체를 뒤로 내보낸 만큼 로켓이 앞으로 나아간다. 오히려 공기가 없는 곳이 저항이 없어 유리하다.' },
  ], {
    w: 820, h: 560,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        planet(c, 120, 300, 90, COL.cold, '지구');
        [[0, 18, '가벼운 물체'], [1, 34, '무거운 물체']].forEach(function (o) {
          const y = 230 + o[0] * 140, x = 220 + ((t * 120) % 520);
          dot(c, x, y, o[1], o[0] ? COL.heat : COL.energy);
          txt(c, o[2] + ' : 11.2 km/s', 240, y - o[1] - 18, { size: 22, weight: 700 });
        });
        txt(c, '질량과 상관없이 같은 탈출 속도', 30, 44, { size: 26, weight: 700, color: COL.energy });
      } else {
        txt(c, '우주 공간 (진공)', 30, 44, { size: 26, weight: 700 });
        const rx = 470, ry = 290;
        for (let i = 0; i < 18; i++) { const x = rx - 150 - ((t * 400 + i * 60) % 420); dot(c, x, ry + ((i * 37) % 30) - 15, 5, COL.heat); }
        c.fillStyle = COL['ink-2']; rrect(c, rx - 110, ry - 36, 220, 72, 14); c.fill();
        KIT.vec(c, rx - 120, ry + 80, -150, 0, COL.heat, '기체를 뒤로', { size: 22 });
        KIT.vec(c, rx + 120, ry - 80, 150, 0, COL.cold, '로켓은 앞으로', { size: 22 });
      }
    },
  });
}

/* ── 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 600);
  let show = false;
  const btn = KIT.btn('답 그림 보기', function () { show = !show; btn.setAttribute('aria-pressed', String(show)); });
  btn.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [btn], [
    KIT.cap('예제 3'),
    KIT.p('지구의 질량을 M, 반지름을 R 이라 하고, 지구의 탈출 속도를 v 라고 하자. ( v = √([[2 G M|R]]) )', 'ws', 'font-weight:600'),
    KIT.p('(1) 질량 4M, 반지름 4R 인 행성 A 의 탈출 속도는 지구의 {{(1)|1}} 배'),
    KIT.p('(2) 질량 2M, 반지름 [[1|2]]R 인 행성 B 의 탈출 속도는 지구의 {{⑪|2}} 배'),
    KIT.p('(3) 지구 표면에서 질량 1000 kg 인 물체의 탈출 속도는 질량 1 kg 인 물체와 {{⑫|같다}}'),
  ], { center: true });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 820, 600);
      [['지구', 'M, R', 40, 130, '1 배'], ['행성 A', '4M, 4R', 160, 400, '√(4 ÷ 4) = 1 배'], ['행성 B', '2M, ½R', 20, 680, '√(2 ÷ ½) = 2 배']].forEach(function (p) {
        planet(c, p[3], 300, p[2], [COL.cold, COL.work, COL.heat][['지구', '행성 A', '행성 B'].indexOf(p[0])]);
        txt(c, p[0], p[3], 110, { size: 26, weight: 700, align: 'center' });
        txt(c, p[1], p[3], 500, { size: 24, align: 'center', color: COL['ink-2'] });
        if (show) txt(c, p[4], p[3], 548, { size: 22, weight: 700, align: 'center', color: COL.energy });
      });
      txt(c, 'v ∝ √(M ÷ R)', 30, 44, { size: 26, weight: 700 });
    },
  };
}
