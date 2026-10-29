/* ═══════════════ 02. 포물선 운동 : 장면 ═══════════════
   두 방향으로 나누기 → 궤도 공식 유도 → 최고점 · 도달 거리 · 역학적 에너지 → 주의 → 예제.
   학습지 빈칸 : ① 연직 아래 ② 독립성 ③ mg ④ 등속도 ⑤ v₀ sin θ − g t ⑥ sin θ ⑦ ½ g t² ⑧ 이차 ⑨ 2 ⑩ 45° ⑪ 보존 ⑫ vx² + vy² ⑬ 10 ⑭ 5 */
const P1 = '1 포물선 운동의 분해', P2 = '2 공식 유도와 역학적 에너지';
const SCENE_LIST = [
  { id: 'split', part: P1, title: '수평 방향과 연직 방향은 독립', ws: '학습지 1 ①② [표 1] ③④⑤', make: sceneSplit },
  { id: 'path', part: P2, title: '포물선 운동의 궤도', ws: '학습지 2-(1) ⑥⑦⑧', make: scenePath },
  { id: 'range', part: P2, title: '최고점 · 도달 거리 · 역학적 에너지', ws: '학습지 2-(2)(3) ⑨~⑫', make: sceneRange },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑬⑭', make: sceneEx },
];
const DEG = Math.PI / 180, G = 10;
/** 던진 뒤 t 초의 자리 (m) */
function proj(v0, th, t) { return { x: v0 * Math.cos(th) * t, y: v0 * Math.sin(th) * t - G * t * t / 2, vx: v0 * Math.cos(th), vy: v0 * Math.sin(th) - G * t }; }
function flightT(v0, th) { return 2 * v0 * Math.sin(th) / G; }
/** 운동장 : 땅과 10 m 눈금. 화면 자리로 바꾸는 함수를 돌려준다 */
function field(c, ox, oy, k, w) {
  KIT.ground(c, ox - 30, oy, w + 60);
  for (let m = 10; m * k <= w; m += 10) { c.fillStyle = COL.muted; c.fillRect(ox + m * k - 1, oy + 6, 2, 10); txt(c, m + ' m', ox + m * k, oy + 34, { size: 18, color: COL.muted, align: 'center' }); }
  return function (x, y) { return { x: ox + x * k, y: oy - y * k }; };
}

/* ── 1 수평 · 연직 방향으로 나누기 ── */
function sceneSplit(root) {
  const cv = makeCanvas(1000, 560);
  const sv = KIT.slider('처음 속력 v₀', 10, 25, 1, 20, function (v) { return v + ' m/s'; }, '190px');
  const st = KIT.slider('던지는 각 θ', 0, 80, 5, 45, function (v) { return v + '°'; }, '190px');
  let t = 0, run = true;
  KIT.split(root, cv, [KIT.btn('다시 던지기', function () { t = 0; run = true; }, true)], [
    KIT.cap('(1) 수평 방향과 연직 방향은 서로 독립이다'),
    KIT.p('• 공기 저항을 무시하면 던져진 물체에 작용하는 힘은 중력뿐이다. 중력은 {{①|연직 아래}} 방향이므로 수평 방향으로는 힘이 작용하지 않는다.', 'ws sm'),
    KIT.p('• 따라서 수평 방향의 운동과 연직 방향의 운동은 서로 영향을 주지 않고 따로 일어난다. 이를 포물선 운동의 {{②|독립성}}이라고 한다.', 'ws sm'),
    KIT.table(['구분', '수평 방향 (x)', '연직 방향 (y)'], [
      ['알짜힘', '0', '{{③|mg}}'],
      ['가속도', '0', '−g (연직 아래)'],
      ['운동의 종류', '{{④|등속도}} 운동', '등가속도 운동'],
      ['처음 속도', 'v₀ cos θ', 'v₀ sin θ'],
      ['t 에서의 속도', 'vx = v₀ cos θ (일정)', 'vy = {{⑤|v₀ sin θ − g t}}'],
    ], { cols: ['24%', '36%', '40%'] }),
    KIT.hint('※ 수평으로 던진 경우는 θ = 0 인 특수한 경우이다. 이때 연직 처음 속도가 0이므로 자유 낙하와 같아진다.'),
  ], { under: h('div', { class: 'col', style: 'gap:0;padding:0 22px 16px' }, sv.el, st.el) });
  let last = '';
  return {
    tick: function (dt) {
      const v0 = sv.get(), th = st.get() * DEG, key = v0 + ':' + th;
      if (key !== last) { last = key; t = 0; run = true; }
      const T = th > 0 ? flightT(v0, th) : Math.sqrt(2 * 30 / G);
      const y0 = th > 0 ? 0 : 30;                     // 수평으로 던지면 30 m 높이에서
      if (run) { t += dt * 0.8; if (t >= T) { t = T; run = false; } }
      const c = cv.ctx; c.clearRect(0, 0, 1000, 560);
      const k = 12, P = field(c, 150, 470, k, 780);
      c.strokeStyle = COL.line; c.lineWidth = 3; c.beginPath(); c.moveTo(150, 470); c.lineTo(150, 60); c.stroke();
      // 0.25초마다 찍은 자리 : 옆 바닥(수평)은 간격이 같고, 왼쪽 벽(연직)은 간격이 변한다
      for (let s = 0; s <= t + 1e-9; s += 0.25) {
        const p = proj(v0, th, s), q = P(p.x, p.y + y0);
        dot(c, q.x, q.y, 7, rgba(COL.energy, 0.45));
        dot(c, q.x, 488, 6, COL.cold); dot(c, 132, q.y, 6, COL.heat);
      }
      const p = proj(v0, th, t), q = P(p.x, p.y + y0);
      KIT.dash(c, q.x, q.y, q.x, 470, COL.cold, 2, [6, 6]); KIT.dash(c, 150, q.y, q.x, q.y, COL.heat, 2, [6, 6]);
      dot(c, q.x, q.y, 16, COL.energy);
      KIT.vec(c, q.x, q.y, p.vx * 4, 0, COL.cold, 'vx', { width: 6, head: 20, size: 22 });
      KIT.vec(c, q.x, q.y, 0, -p.vy * 4, COL.heat, 'vy', { width: 6, head: 20, size: 22 });
      txt(c, '파란 점 : 수평 방향 (간격이 같다 → 등속도)', 330, 40, { size: 23, weight: 700, color: COL.cold });
      txt(c, '주황 점 : 연직 방향 (간격이 변한다 → 등가속도)', 330, 76, { size: 23, weight: 700, color: COL.heat });
      txt(c, 't = ' + t.toFixed(2) + ' s', 960, 120, { size: 26, weight: 700, align: 'right', mono: true });
      txt(c, 'vx = ' + KIT.fmt(p.vx) + ' m/s · vy = ' + KIT.fmt(p.vy) + ' m/s', 960, 160, { size: 22, align: 'right', color: COL['ink-2'] });
    },
  };
}

/* ── 2-(1) 공식 유도 : 궤도 ── */
function scenePath(root) {
  const cv = makeCanvas(900, 560);
  const sv = KIT.slider('v₀', 10, 25, 1, 18, function (v) { return v + ' m/s'; }, '80px');
  const st = KIT.slider('θ', 15, 75, 5, 50, function (v) { return v + '°'; }, '80px');
  let show = 0;
  const steps = KIT.derive(root, {
    cv: cv, title: '포물선 운동의 궤도',
    ctrl: [h('div', { class: 'col', style: 'gap:0;width:100%' }, sv.el, st.el)],
    intro: '지면에서 속력 v₀ 로, 수평면과 θ 의 각을 이루며 물체를 던졌다. 공기 저항은 무시한다.',
    steps: [
      { what: '처음 속도를 두 방향으로 분해한다.', eq: 'v₀x = v₀ cos θ 　v₀y = v₀ {{⑥|sin θ}}', note: '두 방향을 따로 다루기 위해서이다.' },
      { what: '수평 방향은 알짜힘이 0이므로 등속도 운동이다.', eq: 'x = (v₀ cos θ) t', note: '수평 방향으로는 힘이 작용하지 않는다.' },
      { what: '연직 방향은 가속도 −g 인 등가속도 운동이다.', eq: 'y = (v₀ sin θ) t − {{⑦|½ g t²}}', note: '중력만 작용하므로 자유 낙하와 같은 식이다.' },
      { what: '2단계를 t 에 대하여 풀어 3단계에 대입한다.', eq: 't = [[x|v₀ cos θ]]', note: '시간 t 를 없애 x 와 y 의 관계로 바꾼다.' },
      { what: '정리하면 x 에 대한 이차식이 된다.', eq: '∴ y = (tan θ) x − [[g|2 v₀^{2} cos^{2}θ]] x^{2}', note: 'y = ax − bx² 꼴이므로 궤도가 포물선이다.' },
    ],
    means: 'y 가 x 의 {{⑧|이차}}식이므로 궤도는 포물선이다. 곡선 운동처럼 보이지만, 서로 독립인 등속도 운동과 등가속도 운동을 합한 결과일 뿐이다.',
  });
  steps.on(function (n) { show = n; });
  return {
    tick: function () {
      const v0 = sv.get(), th = st.get() * DEG, T = flightT(v0, th);
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const k = 11, P = field(c, 90, 480, k, 760);
      const pts = [];
      for (let i = 0; i <= 60; i++) { const p = proj(v0, th, T * i / 60), q = P(p.x, p.y); pts.push([q.x, q.y]); }
      KIT.line(c, pts, COL.energy, 5);
      const o = P(0, 0);
      if (show >= 1) {
        KIT.vec(c, o.x, o.y, v0 * Math.cos(th) * 7, 0, COL.cold, 'v₀ cos θ', { width: 6, head: 20, size: 22, ly: 26, off: 10 });
        KIT.vec(c, o.x, o.y, 0, -v0 * Math.sin(th) * 7, COL.heat, 'v₀ sin θ', { width: 6, head: 20, size: 22, lx: 60, off: 4 });
      }
      KIT.vec(c, o.x, o.y, v0 * Math.cos(th) * 7, -v0 * Math.sin(th) * 7, COL.energy, 'v₀', { width: 7 });
      const a = Math.tan(th), b = G / (2 * v0 * v0 * Math.cos(th) * Math.cos(th));
      txt(c, 'y = ' + a.toFixed(2) + ' x − ' + b.toFixed(3) + ' x²', 40, 44, { size: 30, weight: 700, color: COL.energy, mono: true });
      txt(c, show >= 5 ? '→ x 의 이차식 : 포물선' : '단계를 넘기면 식이 완성된다', 40, 88, { size: 22, color: COL.muted });
    },
  };
}

/* ── 2-(2)(3) 최고점 · 수평 도달 거리 · 역학적 에너지 ── */
function sceneRange(root) {
  let mode = 0, t = 0;
  const cv = makeCanvas(1000, 600);
  const seg = KIT.seg(['던지는 각과 도달 거리', '역학적 에너지'], 0, function (i) { mode = i; t = 0; }, false);
  KIT.split(root, cv, [seg.el, KIT.btn('다시 던지기', function () { t = 0; })], [
    KIT.cap('(2) 최고점과 수평 도달 거리'),
    KIT.p('• 최고점에서는 연직 속도가 0이 된다. v₀ sin θ − g t = 0 → 올라가는 데 걸린 시간 t = [[v₀ sin θ|g]]', 'ws sm'),
    KIT.p('• 올라간 시간과 내려온 시간이 같으므로 전체 체공 시간은 그 {{⑨|2}}배이다.', 'ws sm'),
    KIT.p('• 수평 도달 거리 R = (v₀ cos θ) × (전체 시간) = [[v₀^{2} sin 2θ|g]] 이므로, θ = {{⑩|45°}} 일 때 가장 멀리 나간다.', 'ws sm'),
    KIT.cap('(3) 포물선 운동과 역학적 에너지'),
    KIT.p('• 공기 저항이 없으면 중력만 일을 하므로 역학적 에너지가 {{⑪|보존}}된다. 　E = [[1|2]] m v^{2} + m g h = 일정', 'ws sm'),
    KIT.p('• 어느 순간의 속력은 두 성분을 합하여 구한다. 　v^{2} = {{⑫|vx² + vy²}}', 'ws sm'),
    KIT.p('• 높이가 낮아진 만큼 위치 에너지가 줄고 운동 에너지가 그만큼 늘어난다.', 'ws sm'),
  ]);
  const ANG = [15, 30, 45, 60, 75], COLS = ['cold', 'work', 'energy', 'heat', 'pen'];
  return {
    tick: function (dt) {
      t += dt * 0.9;
      const c = cv.ctx; c.clearRect(0, 0, 1000, 600);
      if (mode === 0) {
        const v0 = 20, k = 20, P = field(c, 80, 500, k, 860);
        ANG.forEach(function (a, i) {
          const th = a * DEG, T = flightT(v0, th), tt = Math.min(t, T), pts = [];
          for (let j = 0; j <= 50; j++) { const p = proj(v0, th, tt * j / 50), q = P(p.x, p.y); pts.push([q.x, q.y]); }
          KIT.line(c, pts, COL[COLS[i]], a === 45 ? 6 : 4);
          const p = proj(v0, th, tt), q = P(p.x, p.y);
          dot(c, q.x, q.y, 9, COL[COLS[i]]);
          if (tt >= T) txt(c, a + '°', q.x, q.y - 26 - (a === 60 ? 26 : 0), { size: 22, weight: 700, color: COL[COLS[i]], align: 'center' });
        });
        txt(c, '같은 속력 20 m/s 로 각만 바꾸어 던졌다', 40, 44, { size: 26, weight: 700 });
        if (t > flightT(20, 75 * DEG)) {
          txt(c, '45° 가 가장 멀리 간다 (R = v₀² ÷ g = 40 m)', 40, 88, { size: 26, weight: 700, color: COL.energy });
          txt(c, '30° 와 60° 처럼 더해서 90° 인 두 각은 도달 거리가 같다', 40, 128, { size: 22, color: COL.muted });
        }
      } else {
        const v0 = 20, th = 60 * DEG, T = flightT(v0, th), tt = t % (T + 1.2), s = Math.min(tt, T), p = proj(v0, th, s), k = 14, P = field(c, 80, 500, k, 520);
        const pts = []; for (let j = 0; j <= 50; j++) { const r = proj(v0, th, T * j / 50), q = P(r.x, r.y); pts.push([q.x, q.y]); }
        KIT.line(c, pts, rgba(COL.energy, 0.35), 3);
        const q = P(p.x, p.y); dot(c, q.x, q.y, 16, COL.energy);
        KIT.vec(c, q.x, q.y, p.vx * 4, -p.vy * 4, COL.ink, 'v', { width: 5, head: 18, size: 22 });
        // 에너지 막대 (질량 1 kg)
        const KE = 0.5 * (p.vx * p.vx + p.vy * p.vy), PE = G * p.y, E = 0.5 * v0 * v0, bx = 690, by = 470, bh = 340, sc = bh / E;
        [['운동', KE, COL.cold], ['위치', PE, COL.heat], ['합', KE + PE, COL.energy]].forEach(function (b, i) {
          const x = bx + i * 95;
          c.fillStyle = COL['panel-2']; c.fillRect(x, by - bh, 70, bh);
          c.fillStyle = b[2]; c.fillRect(x, by - b[1] * sc, 70, b[1] * sc);
          txt(c, b[0], x + 35, by + 26, { size: 22, weight: 700, align: 'center', color: b[2] });
          txt(c, Math.round(b[1]) + ' J', x + 35, by - b[1] * sc - 18, { size: 20, weight: 700, align: 'center', mono: true });
        });
        txt(c, '질량 1 kg, 60° 로 20 m/s', 40, 44, { size: 26, weight: 700 });
        txt(c, 'v² = vx² + vy² = ' + Math.round(p.vx * p.vx) + ' + ' + Math.round(p.vy * p.vy) + ' = ' + Math.round(p.vx * p.vx + p.vy * p.vy), 40, 88, { size: 24, color: COL['ink-2'], mono: true });
        txt(c, '역학적 에너지 합은 늘 200 J', 690, 92, { size: 22, weight: 700, color: COL.energy });
      }
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '새로운 운동?', q: '포물선 운동은 곡선이므로 새로운 종류의 운동이다?', wrong: '직선 운동과 달리 곡선이므로 다른 법칙을 써야 한다.',
      why: '수평 방향과 연직 방향으로 나누면 각각 이미 배운 등속도 운동과 등가속도 운동이다.', right: '두 방향이 서로 독립이므로 각 방향에 뉴턴 운동 법칙을 그대로 적용하면 된다. 그 결과를 합친 것이 포물선이다.' },
    { short: '최고점의 속도', q: '비스듬히 던진 물체는 최고점에서 속도가 0이다?', wrong: '올라가다가 방향이 바뀌는 지점이므로 속도가 0이다.',
      why: '0이 되는 것은 속도의 연직 성분뿐이다. 수평 성분은 처음부터 끝까지 변하지 않는다.', right: '최고점에서도 수평 속도 vx 가 그대로 남아 있다. 속력이 가장 작아질 뿐 0이 아니다.' },
  ], {
    w: 860, h: 600,
    draw: function (c, which, dt) {
      t += dt * 0.8;
      const v0 = 18, th = 55 * DEG, T = flightT(v0, th), k = 22, P = field(c, 70, 500, k, 740);
      const pts = []; for (let j = 0; j <= 60; j++) { const r = proj(v0, th, T * j / 60), q = P(r.x, r.y); pts.push([q.x, q.y]); }
      KIT.line(c, pts, rgba(COL.energy, 0.4), 3);
      if (which === 0) {
        const s = t % (T + 1), tt = Math.min(s, T);
        for (let u = 0; u <= tt + 1e-9; u += 0.3) { const r = proj(v0, th, u), q = P(r.x, r.y); dot(c, q.x, 516, 6, COL.cold); dot(c, 52, q.y, 6, COL.heat); dot(c, q.x, q.y, 7, rgba(COL.energy, 0.6)); }
        txt(c, '수평 : 등속도 (같은 간격)', 300, 44, { size: 24, weight: 700, color: COL.cold });
        txt(c, '연직 : 등가속도 (간격이 변함)', 300, 80, { size: 24, weight: 700, color: COL.heat });
      } else {
        const tp = T / 2, r = proj(v0, th, tp), q = P(r.x, r.y);
        dot(c, q.x, q.y, 18, COL.energy);
        KIT.vec(c, q.x, q.y, r.vx * 9, 0, COL.cold, 'vx = ' + KIT.fmt(r.vx) + ' m/s', { size: 24, off: 90, ly: -2 });
        txt(c, 'vy = 0', q.x, q.y - 50, { size: 26, weight: 700, color: COL.heat, align: 'center' });
        txt(c, '최고점에서도 수평 속도는 그대로 남아 있다', 40, 44, { size: 26, weight: 700 });
      }
    },
  });
}

/* ── 3 예제 : 20 m/s, 30° ── */
function sceneEx(root) {
  const cv = makeCanvas(900, 600);
  let show = false;
  const btn = KIT.btn('답 그림 보기', function () { show = !show; btn.setAttribute('aria-pressed', String(show)); });
  btn.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [btn], [
    KIT.cap('예제'),
    KIT.p('지면에서 속력 20 m/s 로, 수평면과 30° 의 각을 이루며 공을 던졌다. (g = 10 m/s^{2}, sin 30° = 0.5, cos 30° = 0.87, sin 60° = 0.87)', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 처음 속도의 연직 성분 　v₀ sin θ = 20 × 0.5 = {{⑬|10}} m/s'),
    KIT.p('(2) 최고점까지 걸린 시간 　t = [[v₀ sin θ|g]] = [[10|10]] = 1 s'),
    KIT.p('(3) 전체 체공 시간 　{{(3)|2}} s'),
    KIT.p('(4) 최고점의 높이 　h = [[(v₀ sin θ)^{2}|2g]] = [[100|20]] = {{⑭|5}} m'),
    KIT.p('(5) 수평 도달 거리 　R = [[v₀^{2} sin 2θ|g]] = [[400 × 0.87|10]] ≒ 34.8 m'),
  ], { center: true });
  let t = 0;
  return {
    tick: function (dt) {
      t += dt * 0.7;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const v0 = 20, th = 30 * DEG, T = flightT(v0, th), s = Math.min(t % (T + 1.5), T), k = 22, P = field(c, 60, 470, k, 780);
      const pts = []; for (let j = 0; j <= 60; j++) { const r = proj(v0, th, T * j / 60), q = P(r.x, r.y); pts.push([q.x, q.y]); }
      KIT.line(c, pts, rgba(COL.energy, 0.4), 3);
      const r = proj(v0, th, s), q = P(r.x, r.y); dot(c, q.x, q.y, 14, COL.energy);
      KIT.vec(c, P(0, 0).x, P(0, 0).y, 20 * 5 * Math.cos(th), -20 * 5 * Math.sin(th), COL.ink, '20 m/s', { width: 5, head: 18, size: 22 });
      txt(c, '30°', P(0, 0).x + 60, P(0, 0).y - 16, { size: 22, weight: 700 });
      if (show) {
        const top = P(17.4, 5);
        KIT.dash(c, top.x, top.y, top.x, 470, COL.heat, 3); txt(c, 'h = 5 m', top.x + 14, top.y + 50, { size: 24, weight: 700, color: COL.heat });
        KIT.dash(c, P(0, 0).x, 530, P(34.8, 0).x, 530, COL.cold, 3); txt(c, 'R ≒ 34.8 m', P(17.4, 0).x, 560, { size: 24, weight: 700, color: COL.cold, align: 'center' });
        txt(c, '올라가는 1 s + 내려오는 1 s = 2 s', 40, 44, { size: 26, weight: 700, color: COL.energy });
      }
    },
  };
}
