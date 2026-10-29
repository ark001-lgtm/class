/* ═══════════════ 01. 단진동 : 장면 ═══════════════
   단진동과 복원력 → 가속도와 변위의 관계(공식 유도) → 주의 → 예제.
   학습지 빈칸 : ① 반대 ② 0 ③ 0 ④ k / m ⑤ 비례 ⑥ 길고 ⑦ 10 ⑧ −5 ⑨ 0 ⑩ 2 */
const P1 = '1 단진동과 복원력', P2 = '2 가속도와 변위의 관계';
const SCENE_LIST = [
  { id: 'shm', part: P1, title: '단진동과 복원력', ws: '학습지 1 ① [표 1] ②③', make: sceneShm },
  { id: 'accel', part: P2, title: '단진동의 가속도', ws: '학습지 2 ④⑤⑥', make: sceneAccel },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑦~⑩', make: sceneEx },
];
const TAU = Math.PI * 2;
/** 바닥 위 용수철 진자 : 벽 x 0, 평형 위치 eq, 변위 x(px). 물체 가운데를 돌려준다 */
function springBox(c, wall, eq, y, x, color) {
  c.fillStyle = COL['ink-2']; c.fillRect(wall - 14, y - 90, 14, 130);
  KIT.ground(c, wall - 14, y + 40, 760);
  KIT.spring(c, wall, y, eq + x - 50, y, 10, 18);
  c.fillStyle = color || COL.energy; rrect(c, eq + x - 50, y - 40, 100, 80, 10); c.fill();
  KIT.dash(c, eq, y - 120, eq, y + 40, COL.muted, 2, [6, 6]);
  txt(c, '평형 위치', eq, y - 132, { size: 20, color: COL.muted, align: 'center' });
  return eq + x;
}

/* ── 1 단진동과 복원력 ── */
function sceneShm(root) {
  const cv = makeCanvas(900, 560);
  let t = 0, run = true;
  const pb = KIT.btn('멈춤', function () { run = !run; pb.textContent = run ? '멈춤' : '움직이기'; });
  KIT.split(root, cv, [pb], [
    KIT.p('• 평형 위치를 중심으로 같은 길을 규칙적으로 왕복하는 운동을 단진동이라 한다.', 'ws sm'),
    KIT.p('• 평형 위치로 되돌리려는 힘을 복원력이라 한다. 용수철에서는 훅 법칙을 따른다. 　F = − k x', 'ws sm'),
    KIT.p('• 부호 − 는 힘의 방향이 변위의 방향과 {{①|반대}}라는 뜻이다. 오른쪽으로 당기면 왼쪽으로 끌어당긴다.', 'ws sm'),
    KIT.cap('[표 1] 단진동에서 위치에 따른 변화'),
    KIT.table(['위치', '변위 x', '복원력 · 가속도', '속력'], [
      ['평형 위치', '0', '{{②|0}}', '최대'],
      ['최대 변위 (양 끝)', '최대 (± A)', '최대', '{{③|0}}'],
    ], { cols: ['32%', '22%', '26%', '20%'], big: true }),
    KIT.hint('※ 가속도가 가장 큰 곳에서 속력이 0이고, 속력이 가장 큰 곳에서 가속도가 0이다. 두 양이 서로 반대로 움직인다.'),
  ]);
  return {
    tick: function (dt) {
      if (run) t += dt;
      const A = 150, w = TAU / 3, x = A * Math.cos(w * t), v = -A * w * Math.sin(w * t), a = -w * w * x;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const cx = springBox(c, 60, 450, 280, x);
      KIT.vec(c, cx, 200, a * 0.5, 0, COL.heat, Math.abs(a) > 20 ? '복원력' : '', { size: 22 });
      KIT.vec(c, cx, 360, v * 0.55, 0, COL.cold, Math.abs(v) > 30 ? '속도' : '', { size: 22 });
      KIT.vec(c, 450, 420, x, 0, COL.work, Math.abs(x) > 20 ? '변위 x' : '', { width: 4, head: 14, size: 20 });
      txt(c, Math.abs(x) < 15 ? '평형 위치 : 복원력 0, 속력 최대' : Math.abs(x) > A - 12 ? '양 끝 : 복원력 최대, 속력 0' : '복원력은 늘 평형 위치 쪽', 30, 44, { size: 26, weight: 700 });
      // 막대 : 복원력 크기와 속력
      [['복원력', Math.abs(a) / (w * w * A), COL.heat], ['속력', Math.abs(v) / (A * w), COL.cold]].forEach(function (b, i) {
        const y = 480 + i * 34;
        txt(c, b[0], 30, y, { size: 20, weight: 700, color: b[2] });
        c.fillStyle = COL['panel-2']; c.fillRect(120, y - 12, 300, 24); c.fillStyle = b[2]; c.fillRect(120, y - 12, 300 * b[1], 24);
      });
    },
  };
}

/* ── 2 공식 유도 : 단진동의 가속도 · 원운동의 그림자 ── */
function sceneAccel(root) {
  const cv = makeCanvas(900, 470);
  const sm = KIT.slider('질량 m', 1, 4, 0.5, 1, function (v) { return v + ' kg'; }, '170px');
  const sk = KIT.slider('용수철 상수 k', 25, 100, 5, 100, function (v) { return v + ' N/m'; }, '170px');
  let t = 0;
  const hist = [];
  KIT.derive(root, {
    cv: cv, title: '단진동의 가속도',
    ctrl: [h('div', { class: 'col', style: 'gap:0;width:100%' }, sm.el, sk.el)],
    intro: '용수철 상수 k 인 용수철에 질량 m 인 물체를 매달아 진동시킨다.',
    steps: [
      { what: '복원력은 훅 법칙을 따른다.', eq: 'F = − k x', note: '용수철은 늘어나거나 줄어든 만큼 되돌리려 한다.' },
      { what: '뉴턴 운동 제2법칙을 적용한다.', eq: 'm a = − k x', note: '물체에 작용하는 알짜힘은 복원력뿐이다.' },
      { what: '가속도에 대하여 정리한다.', eq: '∴ a = − {{④|k / m}} x', note: '가속도가 변위에 비례하고 부호가 반대이다.' },
      { what: '원운동에서 배운 a = − ω² x 와 모양을 비교한다.', eq: 'ω^{2} = [[k|m]]', note: '단진동은 등속 원운동을 옆에서 본 그림자와 같다.' },
      { what: '주기는 T = 2π / ω 이므로', eq: '∴ T = 2 π √([[m|k]])', note: '이 관계의 엄밀한 유도는 심화 과정에서 다룬다.' },
    ],
    means: '가속도의 크기는 변위에 {{⑤|비례}}하고 방향은 언제나 평형점을 향한다. 주기 T 는 진폭과 관계가 없다 (진자의 등시성). 　• 주기는 질량이 클수록 {{⑥|길고}}, 용수철이 셀수록(k 가 클수록) 짧다.',
  });
  return {
    tick: function (dt) {
      const w = Math.sqrt(sk.get() / sm.get()), T = TAU / w, show = w * 0.6;   // 화면은 0.6 배 빠르기로
      t += dt;
      const ph = show * t, x = Math.cos(ph), a = -Math.cos(ph);
      hist.push([t, x]); while (hist.length && hist[0][0] < t - 6) hist.shift();
      const c = cv.ctx; c.clearRect(0, 0, 900, 470);
      // 원운동과 그림자
      const cx = 170, cy = 170, R = 120;
      c.strokeStyle = COL.line; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
      const px = cx + R * Math.cos(ph), py = cy - R * Math.sin(ph);
      KIT.dash(c, px, py, px, 330, COL.muted, 2, [5, 5]);
      dot(c, px, py, 11, COL.energy);
      c.fillStyle = COL['ink-2']; c.fillRect(cx - R - 20, 328, 2 * R + 40, 4);
      dot(c, px, 330, 14, COL.heat);
      txt(c, '원운동의 그림자 = 단진동', cx, 372, { size: 20, weight: 700, align: 'center' });
      // x–t, a–t 그래프 (위상이 반대)
      const gx = 360, gw = 510;
      [['변위 x', 110, COL.heat, 1], ['가속도 a', 300, COL.work, -1]].forEach(function (g) {
        c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(gx, g[1]); c.lineTo(gx + gw, g[1]); c.stroke();
        txt(c, g[0], gx, g[1] - 78, { size: 20, weight: 700, color: g[2] });
        c.strokeStyle = g[2]; c.lineWidth = 4; c.beginPath();
        hist.forEach(function (p, i) { const X = gx + gw - (t - p[0]) / 6 * gw, Y = g[1] - g[3] * p[1] * 62; if (i) c.lineTo(X, Y); else c.moveTo(X, Y); });
        c.stroke();
      });
      txt(c, 'ω = √(k/m) = ' + KIT.fmt(w, 2) + ' rad/s', 30, 420, { size: 24, weight: 700, mono: true });
      txt(c, 'T = 2π √(m/k) = ' + KIT.fmt(T, 2) + ' s', 30, 456, { size: 24, weight: 700, mono: true, color: COL.energy });
      txt(c, '위상이 반대 : x 가 최대일 때 a 는 최소', 560, 420, { size: 20, color: COL.muted });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '평형 위치의 가속도', q: '평형 위치에서는 속력이 가장 크므로 가속도도 가장 크다?', wrong: '빠르게 움직이는 곳이니 가속도도 클 것이다.',
      why: '가속도를 정하는 것은 속력이 아니라 그 지점에서 받는 복원력이다. 평형 위치에서는 변위 x = 0 이므로 복원력도 0 이다.', right: '평형 위치에서 속력은 최대지만 가속도는 0 이다. 양 끝에서 그 반대가 된다.' },
    { short: '진폭과 주기', q: '진폭을 크게 하면 왕복하는 데 시간이 더 걸린다?', wrong: '움직여야 할 거리가 늘었으니 주기도 길어질 것이다.',
      why: '진폭이 커지면 거리도 늘지만 복원력이 커져 속력도 함께 빨라진다. 두 효과가 정확히 상쇄된다.', right: '주기는 진폭과 관계없이 m 과 k 로만 정해진다. 이 성질 덕분에 진자를 시계에 쓸 수 있다.' },
  ], {
    w: 860, h: 560,
    draw: function (c, which, dt) {
      t += dt;
      const w = TAU / 3;
      if (which === 0) {
        const A = 140, x = A * Math.cos(w * t), v = -A * w * Math.sin(w * t), a = -w * w * x;
        const cx = springBox(c, 50, 430, 260, x);
        KIT.vec(c, cx, 180, a * 0.5, 0, COL.heat, '가속도', { size: 20 });
        KIT.vec(c, cx, 340, v * 0.55, 0, COL.cold, '속도', { size: 20 });
        txt(c, Math.abs(x) < 15 ? '평형 위치 : 속력 최대 · 가속도 0' : '', 30, 44, { size: 26, weight: 700, color: COL.energy });
      } else {
        [[60, 120, '진폭 작게'], [140, 360, '진폭 크게']].forEach(function (o) {
          const x = o[0] * Math.cos(w * t), y = o[1];
          c.fillStyle = COL['ink-2']; c.fillRect(30, y - 50, 12, 90);
          KIT.spring(c, 42, y, 430 + x - 40, y, 9, 14);
          c.fillStyle = COL.energy; rrect(c, 430 + x - 40, y - 34, 80, 68, 8); c.fill();
          txt(c, o[2], 30, y - 70, { size: 22, weight: 700 });
        });
        txt(c, '두 진자가 동시에 양 끝에 닿는다 → 주기가 같다', 30, 520, { size: 24, weight: 700, color: COL.energy });
      }
    },
  });
}

/* ── 3 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(860, 520);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.cap('예제'),
    KIT.p('용수철 상수 k = 100 N/m 인 용수철에 질량 1 kg 인 물체를 매달아 진폭 0.05 m 로 진동시킨다.', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 각진동수 　ω = √([[k|m]]) = √([[100|1]]) = {{⑦|10}} rad/s'),
    KIT.p('(2) 주기 　T = [[2π|ω]] = [[2π|10]] ≒ {{(2)|0.63}} s'),
    KIT.p('(3) 최대 변위에서의 가속도 　a = − [[k|m]] x = − 100 × 0.05 = {{⑧|−5}} m/s^{2}'),
    KIT.p('(4) 평형 위치에서의 가속도 　a = {{⑨|0}} m/s^{2}'),
    KIT.p('(5) 물체의 질량만 4배로 늘리면 주기는 {{⑩|2}} 배가 된다.'),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 860, 520);
      const x = 160 * Math.cos(TAU / 2.5 * t);
      springBox(c, 50, 430, 270, x, COL.energy);
      txt(c, 'k = 100 N/m', 200, 200, { size: 24, weight: 700 });
      txt(c, '1 kg', 430 + x, 270, { size: 22, weight: 700, color: COL.panel, align: 'center' });
      KIT.dash(c, 270, 380, 590, 380, COL.work, 3); txt(c, '진폭 0.05 m (양쪽)', 430, 410, { size: 22, weight: 700, color: COL.work, align: 'center' });
    },
  };
}
