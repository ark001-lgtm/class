/* ═══════════════ 03. 도플러 효과 : 장면 ═══════════════
   움직이는 음원과 파면 → 진동수 변화 계산(공식 유도) → 활용(스피드건 · 적색 편이) → 주의 → 예제.
   학습지 빈칸 : ① 이동 ② 커진다 ③ 길어진다 ④ (v − vs) T ⑤ 크다 ⑥ 속력 ⑦ 적색 편이 ⑧ 340 ⑨ 크다 ⑩ 300 */
const P1 = '1 도플러 효과', P2 = '2 진동수 변화의 계산';
const SCENE_LIST = [
  { id: 'doppler', part: P1, title: '도플러 효과', ws: '학습지 1 ① [표 1] ②③', make: sceneDoppler },
  { id: 'formula', part: P2, title: '음원이 다가올 때의 진동수', ws: '학습지 2-(1) ④⑤', make: sceneFormula },
  { id: 'use', part: P2, title: '도플러 효과의 활용', ws: '학습지 2-(2) ⑥⑦', make: sceneUse },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑧⑨⑩', make: sceneEx },
];
const TAU = Math.PI * 2;
/** 움직이는 음원 : 주기마다 낸 파면(내보낸 자리 · 시각)을 기억했다가 원으로 그린다 */
function makeSource(v, T) {
  return { v: v, T: T, x: 0, fronts: [], acc: 0 };
}
function stepSource(s, dt, vs, x0, x1) {
  s.x += vs * dt; if (s.x > x1) { s.x = x0; s.fronts = []; }
  s.acc += dt; s.fronts.forEach(function (f) { f.r += s.v * dt; });
  while (s.acc >= s.T) { s.acc -= s.T; s.fronts.push({ x: s.x, r: 0 }); }
  s.fronts = s.fronts.filter(function (f) { return f.r < 900; });
}
function drawSource(c, s, y) {
  s.fronts.forEach(function (f) { c.strokeStyle = rgba(COL.cold, Math.max(0.15, 1 - f.r / 800)); c.lineWidth = 3; c.beginPath(); c.arc(f.x, y, f.r, 0, TAU); c.stroke(); });
  c.fillStyle = COL.heat; rrect(c, s.x - 26, y - 18, 52, 36, 8); c.fill();
}
function ear(c, x, y, label, f, col) {
  dot(c, x, y, 16, col);
  txt(c, label, x, y + 38, { size: 22, weight: 700, align: 'center', color: col });
  if (f) txt(c, f, x, y + 68, { size: 22, weight: 700, align: 'center', mono: true });
}

/* ── 1 도플러 효과 ── */
function sceneDoppler(root) {
  const cv = makeCanvas(900, 600);
  const sv = KIT.slider('음원의 속력', 0, 0.8, 0.1, 0.5, function (v) { return KIT.fmt(v, 1) + ' × 소리 속력'; }, '150px');
  const src = makeSource(220, 0.28);
  src.x = 150;
  KIT.split(root, cv, [], [
    KIT.p('• 구급차가 다가올 때는 사이렌이 높게, 지나가고 나면 낮게 들린다. 이처럼 파원이나 관찰자가 움직일 때 원래와 다른 진동수로 관측되는 현상을 도플러 효과라 한다.', 'ws sm'),
    KIT.p('• 핵심은 파원이 소리를 낸 뒤에도 계속 {{①|이동}}한다는 점이다. 그래서 앞쪽에서는 파면이 촘촘해지고 뒤쪽에서는 성겨진다.', 'ws sm'),
    KIT.table(['위치', '파장', '진동수', '들리는 소리'], [
      ['다가오는 앞쪽', '짧아진다', '{{②|커진다}}', '높게'],
      ['멀어지는 뒤쪽', '{{③|길어진다}}', '작아진다', '낮게'],
    ], { cols: ['30%', '24%', '24%', '22%'], big: true }),
    KIT.hint('※ 파원이 내는 소리 자체는 전혀 변하지 않는다. 변하는 것은 관찰자에게 도달하는 파장뿐이다. 소리의 속력 v 도 매질이 정하므로 변하지 않는다.'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sv.el) });
  return {
    tick: function (dt) {
      const r = sv.get(), c = cv.ctx; c.clearRect(0, 0, 900, 600);
      stepSource(src, dt, r * src.v, 120, 640);
      drawSource(c, src, 300);
      const f0 = 300;
      ear(c, 820, 300, '앞쪽 관찰자', Math.round(f0 / (1 - r)) + ' Hz', COL.energy);
      ear(c, 60, 300, '뒤쪽', Math.round(f0 / (1 + r)) + ' Hz', COL.work);
      if (r > 0) KIT.vec(c, src.x, 250, 70, 0, COL.heat, '이동', { size: 20, off: 18 });
      txt(c, '음원이 내는 소리 : 300 Hz', 30, 44, { size: 26, weight: 700 });
      txt(c, r > 0 ? '앞쪽 파면은 촘촘하고(파장 짧음), 뒤쪽은 성기다(파장 김)' : '음원이 멈춰 있으면 모든 방향의 파장이 같다', 30, 560, { size: 22, weight: 700, color: COL.energy });
    },
  };
}

/* ── 2-(1) 공식 유도 ── */
function sceneFormula(root) {
  const cv = makeCanvas(900, 480);
  const sv = KIT.slider('vs', 0, 0.6, 0.1, 0.4, function (v) { return KIT.fmt(v, 1) + ' v'; }, '50px');
  KIT.derive(root, {
    cv: cv, title: '파원이 다가올 때',
    ctrl: [h('div', { style: 'width:100%' }, sv.el)],
    intro: '진동수 f 인 음원이 속력 vs 로 정지한 관찰자에게 다가온다. 소리의 속력은 v 이다.',
    steps: [
      { what: '음원이 정지해 있을 때의 파장', eq: 'λ = [[v|f]]', note: 'v = fλ 를 λ 에 대하여 쓴 것이다.' },
      { what: '음원은 한 주기 T 동안 vs T 만큼 앞으로 이동한다.', note: '소리를 한 번 내보내는 사이에도 계속 움직인다.' },
      { what: '앞쪽 파장은 그만큼 짧아진다.', eq: 'λ′ = v T − vs T = {{④|(v − vs) T}}', note: '파동이 나아간 거리에서 음원이 따라온 거리를 뺀다.' },
      { what: 'T = 1/f 를 넣는다.', eq: 'λ′ = [[v − vs|f]]', note: '주기를 진동수로 바꾸어 쓴다.' },
      { what: '관찰자가 듣는 진동수를 구한다.', eq: '∴ f ′ = [[v|λ′]] = f [[v|v − vs]]', note: '소리의 속력 v 는 변하지 않는다는 점이 핵심이다.' },
    ],
    means: '음원이 다가오면 분모가 작아지므로 f ′ 가 f 보다 {{⑤|크다}}. 멀어질 때는 분모의 부호를 바꾸어 v + vs 로 쓰며, 이때는 f ′ 가 f 보다 작다.',
  });
  return {
    tick: function () {
      const r = sv.get(), c = cv.ctx; c.clearRect(0, 0, 900, 480);
      // 한 주기 동안 : 첫 파면은 vT 만큼 퍼졌고, 음원은 vsT 만큼 따라왔다
      const vT = 300, sx = 200, y = 230, nx = sx + r * vT;
      c.strokeStyle = COL.cold; c.lineWidth = 4; c.beginPath(); c.arc(sx, y, vT, -0.7, 0.7); c.stroke();
      c.strokeStyle = rgba(COL.muted, 0.6); c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.arc(sx, y, vT, 0.7, TAU - 0.7); c.stroke(); c.setLineDash([]);
      c.fillStyle = rgba(COL.heat, 0.35); rrect(c, sx - 22, y - 16, 44, 32, 6); c.fill();
      c.fillStyle = COL.heat; rrect(c, nx - 22, y - 16, 44, 32, 6); c.fill();
      txt(c, '처음 자리', sx, y + 40, { size: 18, color: COL.muted, align: 'center' });
      const dim = function (x1, x2, yy, label, col) { arrow(c, x1, yy, x2, yy, { width: 3, color: col, head: 12 }); arrow(c, x2, yy, x1, yy, { width: 3, color: col, head: 12 }); txt(c, label, (x1 + x2) / 2, yy - 18, { size: 22, weight: 700, color: col, align: 'center' }); };
      dim(sx, sx + vT, y + 110, 'v T', COL.cold);
      if (r > 0) dim(sx, nx, y + 170, 'vs T', COL.heat);
      dim(nx, sx + vT, y - 110, 'λ′ = (v − vs) T', COL.energy);
      txt(c, 'f ′ = f × ' + (1 / (1 - r)).toFixed(2), 620, 60, { size: 30, weight: 700, color: COL.energy, mono: true });
    },
  };
}

/* ── 2-(2) 활용 ── */
function sceneUse(root) {
  let mode = 0, t = 0;
  const cv = makeCanvas(900, 560);
  const sv = KIT.slider('멀어지는 빠르기', 0, 1, 0.1, 0.4, function (v) { return KIT.fmt(v, 1); }, '170px');
  const under = h('div', { style: 'padding:0 22px 16px' });
  const seg = KIT.seg(['스피드건', '적색 편이'], 0, function (i) { mode = i; under.replaceChildren.apply(under, i ? [sv.el] : []); }, false);
  KIT.split(root, cv, [seg.el], [
    KIT.cap('(2) 활용'),
    KIT.p('• 스피드건 : 달리는 차에 전파를 쏘아 되돌아온 전파의 진동수 변화를 재면 차의 {{⑥|속력}}을 알 수 있다.', 'ws sm'),
    KIT.p('• 기상 도플러 레이더 : 빗방울에서 반사된 전파로 비구름이 다가오는지 멀어지는지를 판단한다.', 'ws sm'),
    KIT.p('• 초음파 혈류 검사 : 혈관 속 적혈구에서 반사된 초음파로 피가 흐르는 속력과 방향을 측정한다.', 'ws sm'),
    KIT.p('• 우주 관측 : 멀어지는 별빛의 파장이 길어져 붉은 쪽으로 치우치는 {{⑦|적색 편이}}가 나타난다.', 'ws sm'),
  ], { under: under });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      if (mode === 0) {
        txt(c, '스피드건 : 다가오는 차에서 반사된 전파는 진동수가 커진다', 30, 44, { size: 22, weight: 700 });
        const carX = 760 - ((t * 120) % 500);
        c.fillStyle = COL['ink-2']; rrect(c, 40, 260, 70, 50, 8); c.fill(); txt(c, '스피드건', 75, 340, { size: 20, weight: 700, align: 'center' });
        c.fillStyle = COL.energy; rrect(c, carX, 250, 120, 60, 12); c.fill(); dot(c, carX + 25, 315, 14, COL.ink); dot(c, carX + 95, 315, 14, COL.ink);
        KIT.vec(c, carX + 60, 220, -80, 0, COL.energy, '차', { size: 20 });
        const draw = function (y, lam, col) { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); for (let x = 120; x < carX - 10; x += 3) { const yy = y + 14 * Math.sin(TAU * (x / lam - t * 2)); if (x === 120) c.moveTo(x, yy); else c.lineTo(x, yy); } c.stroke(); };
        draw(240, 50, COL.cold); draw(330, 34, COL.heat);
        txt(c, '쏜 전파', 130, 200, { size: 20, weight: 700, color: COL.cold }); txt(c, '반사파 (파장 짧아짐)', 130, 380, { size: 20, weight: 700, color: COL.heat });
      } else {
        txt(c, '멀어지는 별의 스펙트럼선이 붉은 쪽으로 옮겨 간다', 30, 44, { size: 22, weight: 700 });
        const s = sv.get();
        [['실험실', 0, 160], ['별빛', s, 330]].forEach(function (o) {
          const g = c.createLinearGradient(80, 0, 820, 0);
          ['#7B1FA2', '#3949AB', '#039BE5', '#43A047', '#FDD835', '#FB8C00', '#E53935'].forEach(function (col, i) { g.addColorStop(i / 6, col); });
          c.fillStyle = g; c.fillRect(80, o[2], 740, 90);
          [0.18, 0.36, 0.62].forEach(function (p) { const x = 80 + 740 * Math.min(0.98, p + o[1] * 0.25); c.fillStyle = '#000'; c.fillRect(x - 3, o[2], 6, 90); });
          txt(c, o[0], 70, o[2] + 45, { size: 22, weight: 700, align: 'right' });
        });
        txt(c, '파란 쪽 (짧은 파장)', 80, 470, { size: 20, color: COL.muted }); txt(c, '붉은 쪽 (긴 파장)', 820, 470, { size: 20, color: COL.muted, align: 'right' });
      }
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  const src = makeSource(220, 0.35);
  return KIT.mis(root, [
    { short: '소리 속력', q: '음원이 다가오면 소리의 속력이 빨라진다?', wrong: '음원이 달려오면서 소리를 밀어 주니 소리도 빨라질 것이다.',
      why: '소리의 속력은 매질(공기)의 온도와 성질로만 정해진다. 음원이 얼마나 빨리 움직이든 소리는 같은 속력으로 퍼진다.', right: '빨라지는 것은 속력이 아니라 진동수이다. 파장이 짧아지면서 v = fλ 에 따라 f 가 커진 것이다.' },
    { short: '옆을 지날 때', q: '도플러 효과는 음원이 옆을 지나가는 순간에도 계속 일어난다?', wrong: '움직이고 있으니 언제나 높게 들린다.',
      why: '도플러 효과는 관찰자를 향하거나 관찰자에게서 멀어지는 방향의 속도 성분으로만 결정된다.', right: '음원이 바로 옆을 지나 관찰자와의 거리가 가장 가까운 순간에는 다가오지도 멀어지지도 않으므로 원래 진동수로 들린다.' },
  ], {
    w: 860, h: 540,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        stepSource(src, dt, 110, 140, 600);
        drawSource(c, src, 280);
        txt(c, '파면은 음원이 움직여도 같은 빠르기(같은 원 간격으로 퍼짐)', 30, 44, { size: 22, weight: 700 });
        txt(c, '달라지는 것은 앞뒤의 간격 = 파장', 30, 510, { size: 22, weight: 700, color: COL.energy });
      } else {
        // 관찰자 옆을 지나가는 음원 : 들리는 진동수의 시간 그래프
        const ax = KIT.axes(c, { x: 80, y: 120, w: 700, h: 300 }, '시간', '들리는 진동수');
        const f = function (u) { const x = (u - 0.5) * 8, cosA = -x / Math.sqrt(x * x + 1); return 0.5 + 0.3 * cosA; };
        KIT.dash(c, 80, ax.Y(0.5), 780, ax.Y(0.5), COL.muted, 2, [6, 6]); txt(c, '원래 진동수', 790, ax.Y(0.5), { size: 18, color: COL.muted });
        KIT.plot(c, ax, f, 0, 1, COL.energy, 5);
        const u = (t * 0.12) % 1; dot(c, ax.X(u), ax.Y(f(u)), 11, COL.heat);
        dot(c, ax.X(0.5), ax.Y(0.5), 9, COL.work); txt(c, '가장 가까운 순간', ax.X(0.5), ax.Y(0.5) + 34, { size: 20, weight: 700, color: COL.work, align: 'center' });
        txt(c, '다가올 때 높고, 바로 옆에서 원래대로, 멀어지면 낮다', 30, 44, { size: 22, weight: 700 });
      }
    },
  });
}

/* ── 3 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 520);
  let show = false;
  const btn = KIT.btn('답 그림 보기', function () { show = !show; btn.setAttribute('aria-pressed', String(show)); });
  btn.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [btn], [
    KIT.cap('예제'),
    KIT.p('진동수 300 Hz 인 사이렌을 울리는 구급차가 40 m/s 로 달린다. 소리의 속력은 340 m/s 이고 관찰자는 정지해 있다. (계산은 소수 첫째 자리까지)', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 구급차가 다가올 때 　f ′ = f [[v|v − vs]] = 300 × [[340|340 − 40]] = {{⑧|340}} Hz', 'ws sm'),
    KIT.p('(2) 구급차가 멀어질 때 　f ′ = f [[v|v + vs]] = 300 × [[340|380]] ≒ {{(2)|268.4}} Hz', 'ws sm'),
    KIT.p('(3) 다가올 때가 멀어질 때보다 진동수가 {{⑨|크다}}. 그래서 더 높은 소리로 들린다.', 'ws sm'),
    KIT.p('(4) 구급차가 정지해 있으면 f ′ = {{⑩|300}} Hz 로 원래 진동수와 같다.', 'ws sm'),
  ], { center: true });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 820, 520);
      c.fillStyle = COL.heat; rrect(c, 340, 220, 140, 70, 12); c.fill(); txt(c, '구급차', 410, 255, { size: 24, weight: 700, color: '#fff', align: 'center' });
      KIT.vec(c, 410, 190, 110, 0, COL.heat, '40 m/s', { size: 22 });
      ear(c, 720, 255, '앞 (다가옴)', show ? '340 Hz' : '?', COL.energy);
      ear(c, 90, 255, '뒤 (멀어짐)', show ? '268.4 Hz' : '?', COL.work);
      txt(c, '사이렌 300 Hz · 소리 340 m/s', 30, 44, { size: 24, weight: 700 });
    },
  };
}
