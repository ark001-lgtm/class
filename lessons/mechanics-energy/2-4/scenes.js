/* ═══════════════ 04. 열기관과 열효율 : 장면 ═══════════════
   열기관(순환 과정) → 열효율(공식 유도) → 열기관이 인류에 미친 영향 → 주의 → 예제.
   학습지 빈칸 : ① 순환 ② 0 ③ Q₂ ④ W / Q₁ ⑤ Q₂ / Q₁ ⑥ 열역학 제2법칙 ⑦ 화석 연료 ⑧ 150 ⑨ 0.3 ⑩ 300 */
const P1 = '1 열기관', P2 = '2 열효율', P3 = '3 열기관이 인류에 미친 영향';
const SCENE_LIST = [
  { id: 'engine', part: P1, title: '열기관과 순환 과정', ws: '학습지 1 ①② [표 1] ③', make: sceneEngine },
  { id: 'eff', part: P2, title: '열효율', ws: '학습지 2 ④⑤⑥', make: sceneEff },
  { id: 'history', part: P3, title: '열기관이 인류에 미친 영향', ws: '학습지 3 ⑦', make: sceneHistory },
  { id: 'mis', part: P3, title: '주의', ws: '주의', make: sceneMis },
  { id: 'ex', part: '예제', title: '예제', ws: '예제 ⑧⑨⑩', make: sceneEx },
];
/** 열 흐름 그림 : 고열원 → 열기관 → (일, 저열원). Q1 · W · Q2 는 J */
function flow(c, x, y, Q1, W, Q2, o) {
  o = o || {};
  const k = o.k || 0.5, cx = x + 180;
  c.fillStyle = rgba(COL.heat, 0.9); rrect(c, x + 30, y, 300, 56, 12); c.fill();
  txt(c, '고열원 (연료를 태운 열)', cx, y + 28, { size: 22, weight: 700, color: '#fff', align: 'center' });
  c.fillStyle = rgba(COL.cold, 0.9); rrect(c, x + 30, y + 330, 300, 56, 12); c.fill();
  txt(c, '저열원 (주변 공기 · 냉각수)', cx, y + 358, { size: 22, weight: 700, color: '#fff', align: 'center' });
  if (W > 0) { c.fillStyle = COL.work; c.fillRect(cx + 40, y + 193 - W * k / 2, 150, W * k); arrow(c, cx + 180, y + 193, cx + 250, y + 193, { width: Math.max(4, W * k), color: COL.work, head: Math.max(22, W * k + 16) }); }
  c.fillStyle = COL.heat; c.fillRect(cx - Q1 * k / 2, y + 56, Q1 * k, 90);
  if (Q2 > 0) { c.fillStyle = COL.cold; c.fillRect(cx - Q2 * k / 2, y + 240, Q2 * k, 90); }
  dot(c, cx, y + 193, 56, COL.ink);
  txt(c, '열기관', cx, y + 193, { size: 22, weight: 700, color: COL.panel, align: 'center' });
  txt(c, 'Q₁ = ' + Math.round(Q1) + ' J', cx - Q1 * k / 2 - 14, y + 100, { size: 24, weight: 700, color: COL.heat, align: 'right', mono: true });
  txt(c, 'Q₂ = ' + Math.round(Q2) + ' J', cx - Math.max(Q2 * k, 20) / 2 - 14, y + 285, { size: 24, weight: 700, color: COL.cold, align: 'right', mono: true });
  txt(c, 'W = ' + Math.round(W) + ' J', cx + 270, y + 193 - Math.max(30, W * k / 2) - 14, { size: 24, weight: 700, color: COL.work, mono: true });
}

/* ── 1 열기관 : P–V 순환 ── */
function sceneEngine(root) {
  const cv = makeCanvas(900, 600);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.p('• 열기관은 열을 받아 일로 바꾸는 장치이다. 증기 기관, 자동차 엔진, 화력 발전소의 터빈이 모두 열기관이다.', 'ws sm'),
    KIT.p('• 열기관은 한 번 일하고 끝나지 않고, 처음 상태로 돌아오는 과정을 반복한다. 이를 {{①|순환}} 과정이라 한다.', 'ws sm'),
    KIT.p('• 한 번의 순환이 끝나면 처음 상태로 돌아오므로 내부 에너지의 변화는 ΔU = {{②|0}} 이다.', 'ws sm'),
    KIT.cap('[표 1] 열기관의 에너지 흐름'),
    KIT.table(['구분', '내용', '기호'], [
      ['고열원에서 흡수한 열', '연료를 태워 얻은 열', 'Q₁'],
      ['외부에 한 일', '피스톤을 밀거나 축을 돌린 일', 'W'],
      ['저열원으로 버린 열', '배기가스·냉각수로 빠져나간 열', '{{③|Q₂}}'],
    ], { cols: ['36%', '46%', '18%'] }),
  ]);
  // 네 꼭짓점을 도는 순환 (A → B 등압 팽창, B → C 등적 냉각, C → D 등압 압축, D → A 등적 가열)
  const PTS = [[1, 3], [3, 3], [3, 1], [1, 1]];
  return {
    tick: function (dt) {
      t += dt * 0.25;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const g = { x: 80, y: 100, w: 440, h: 380 }, ax = KIT.axes(c, g, '부피 V', '압력 P');
      const X = function (v) { return ax.X(v / 4); }, Y = function (p) { return ax.Y(p / 4); };
      c.fillStyle = rgba(COL.work, 0.18); c.beginPath(); PTS.forEach(function (p, i) { if (i) c.lineTo(X(p[0]), Y(p[1])); else c.moveTo(X(p[0]), Y(p[1])); }); c.closePath(); c.fill();
      txt(c, '넓이 = 한 일 W', X(2), Y(2), { size: 22, weight: 700, color: COL.work, align: 'center' });
      for (let i = 0; i < 4; i++) { const a = PTS[i], b = PTS[(i + 1) % 4]; arrow(c, X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), { width: 4, color: COL['ink-2'], head: 18 }); txt(c, 'ABCD'[i], X(a[0]) + (i === 0 || i === 3 ? -22 : 22), Y(a[1]) + (i < 2 ? -18 : 22), { size: 24, weight: 700 }); }
      const seg = Math.floor(t) % 4, s = t % 1, a = PTS[seg], b = PTS[(seg + 1) % 4], V = a[0] + (b[0] - a[0]) * s, P = a[1] + (b[1] - a[1]) * s;
      dot(c, X(V), Y(P), 12, COL.heat);
      // 실린더
      const cx0 = 600, cy0 = 200, cw = V * 60;
      c.strokeStyle = COL['ink-2']; c.lineWidth = 6; c.beginPath(); c.moveTo(cx0 + 260, cy0); c.lineTo(cx0, cy0); c.lineTo(cx0, cy0 + 160); c.lineTo(cx0 + 260, cy0 + 160); c.stroke();
      c.fillStyle = rgba(P * V > 4 ? COL.heat : COL.cold, 0.25); c.fillRect(cx0 + 3, cy0 + 3, cw, 154);
      c.fillStyle = COL.ink; c.fillRect(cx0 + cw, cy0 + 4, 14, 152);
      const hint = ['A → B : 열을 받으며 팽창 (일을 한다)', 'B → C : 열을 버리며 식는다', 'C → D : 압축 (일을 받는다)', 'D → A : 열을 받아 처음 상태로'][seg];
      txt(c, hint, 30, 44, { size: 24, weight: 700 });
      txt(c, '한 바퀴 돌면 처음 상태 → ΔU = 0', 30, 560, { size: 24, weight: 700, color: COL.energy });
    },
  };
}

/* ── 2 공식 유도 : 열효율 ── */
function sceneEff(root) {
  const cv = makeCanvas(900, 470);
  const s1 = KIT.slider('흡수한 열 Q₁', 100, 600, 50, 500, function (v) { return v + ' J'; }, '170px');
  const s2 = KIT.slider('버린 열 Q₂', 0, 600, 10, 350, function (v) { return v + ' J'; }, '170px');
  KIT.derive(root, {
    cv: cv, title: '열효율',
    ctrl: [h('div', { class: 'col', style: 'gap:0;width:100%' }, s1.el, s2.el)],
    intro: '열기관이 한 번 순환하는 동안 고열원에서 Q₁ 을 흡수하고 저열원으로 Q₂ 를 버리며 일 W 를 했다.',
    steps: [
      { what: '한 순환이 끝나면 처음 상태로 돌아오므로 ΔU = 0 이다.', eq: 'Q = ΔU + W 에서 W = Q₁ − Q₂', note: '들어온 열에서 버린 열을 뺀 만큼이 일로 나온다.' },
      { what: '열효율은 받은 열 중 일로 바뀐 비율이다.', eq: 'e = {{④|W / Q₁}}', note: '효율은 언제나 (얻은 것) ÷ (들인 것) 이다.' },
      { what: '1단계의 W 를 대입한다.', eq: 'e = [[Q₁ − Q₂|Q₁]]', note: '분자에 W 대신 Q₁ − Q₂ 를 넣는다.' },
      { what: '분수를 나누어 정리한다.', eq: '∴ e = 1 − {{⑤|Q₂ / Q₁}}', note: '버리는 열의 비율이 작을수록 효율이 높다.' },
    ],
    means: '효율이 1 이 되려면 Q₂ = 0, 즉 버리는 열이 하나도 없어야 한다. 그런 열기관은 만들 수 없다는 것이 {{⑥|열역학 제2법칙}}이다.',
  });
  return {
    tick: function () {
      const Q1 = s1.get(); if (+s2.input.max !== Q1) { s2.input.max = String(Q1); s2.sync(); }
      const Q2 = Math.min(s2.get(), Q1), W = Q1 - Q2, c = cv.ctx; c.clearRect(0, 0, 900, 470);
      flow(c, 140, 40, Q1, W, Q2, { k: 0.3 });
      const e = W / Q1;
      txt(c, 'e = ' + Math.round(W) + ' ÷ ' + Q1 + ' = ' + e.toFixed(2), 510, 40, { size: 28, weight: 700, color: COL.energy, mono: true });
      txt(c, '(' + Math.round(e * 100) + ' %)', 510, 80, { size: 26, weight: 700, color: COL.energy });
      if (Q2 === 0) { KIT.cross(c, 320, 233, 60); pill(c, 'Q₂ = 0 인 열기관은 만들 수 없다', 560, 410, COL.pen, { size: 20 }); }
    },
  };
}

/* ── 3 열기관이 인류에 미친 영향 ── */
function sceneHistory(root) {
  const cv = makeCanvas(900, 560);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.p('• 증기 기관은 사람과 가축의 힘을 대신하여 대량 생산을 가능하게 했고, 산업 혁명을 이끌었다.'),
    KIT.p('• 철도와 증기선으로 사람과 물자의 이동 범위가 크게 넓어졌다.'),
    KIT.p('• 그러나 열기관 대부분이 {{⑦|화석 연료}}를 태우므로, 이산화 탄소 배출로 인한 지구 온난화와 대기 오염을 함께 불러왔다.'),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const ax = KIT.axes(c, { x: 80, y: 90, w: 760, h: 300 }, '연도', '대기 중 이산화 탄소');
      KIT.plot(c, ax, function (u) { return 0.12 + 0.05 * u + 0.8 * Math.pow(Math.max(0, u - 0.3) / 0.7, 2.6); }, 0, Math.min(1, t * 0.15), COL.heat, 5);
      [[0, '1700'], [0.25, '1800'], [0.5, '1900'], [0.75, '1950'], [1, '2020']].forEach(function (p) { txt(c, p[1], ax.X(p[0]), ax.y0 + 26, { size: 18, color: COL.muted, align: 'center' }); });
      [[0.12, '증기 기관'], [0.32, '철도 · 증기선'], [0.6, '자동차 · 화력 발전소']].forEach(function (p, i) {
        const x = ax.X(p[0]);
        c.fillStyle = COL.energy; c.fillRect(x - 2, 430, 4, 30);
        txt(c, p[1], x, 486 + (i % 2) * 30, { size: 22, weight: 700, align: 'center', color: COL.energy });
      });
      txt(c, '열기관과 함께 늘어난 이산화 탄소 (모양만 나타낸 그림)', 30, 44, { size: 22, weight: 700 });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  const sf = KIT.slider('마찰 · 열 손실', 0, 100, 10, 50, function (v) { return v ? v + ' %' : '없음'; }, '170px');
  return KIT.mis(root, [
    { short: '효율 100 %?', q: '기술이 발전하면 효율 100 % 인 열기관도 만들 수 있다?', wrong: '마찰과 열 손실만 완전히 없애면 100 % 가 가능하다.',
      why: '효율 100 % 는 마찰의 문제가 아니라, 저열원으로 버리는 열이 0 이어야 한다는 뜻이다.', right: '열을 모두 일로 바꾸는 순환 열기관은 원리적으로 불가능하다. 이것이 열역학 제2법칙이며, 마찰을 없애도 넘을 수 없다.' },
  ], {
    w: 820, h: 540,
    ctrl: function () { return [h('div', { style: 'width:100%' }, sf.el)]; },
    draw: function (c) {
      // 마찰이 없어도 최대 효율(예 : 600 K 와 300 K 사이 50 %)을 넘지 못한다
      const loss = sf.get() / 100, emax = 0.5, e = emax * (1 - 0.6 * loss);
      txt(c, '마찰을 줄이면 효율이 오르지만 한계가 있다', 30, 44, { size: 24, weight: 700 });
      const bx = 120, by = 470, bh = 360;
      c.fillStyle = COL['panel-2']; c.fillRect(bx, by - bh, 140, bh);
      c.fillStyle = COL.work; c.fillRect(bx, by - e * bh, 140, e * bh);
      KIT.dash(c, bx - 20, by - emax * bh, bx + 560, by - emax * bh, COL.heat, 3);
      KIT.dash(c, bx - 20, by - bh, bx + 560, by - bh, COL.pen, 3);
      txt(c, '100 % : 버리는 열 0 → 불가능', bx + 170, by - bh, { size: 22, weight: 700, color: COL.pen });
      txt(c, '마찰이 0 이어도 넘을 수 없는 한계 (예 : 50 %)', bx + 170, by - emax * bh, { size: 22, weight: 700, color: COL.heat });
      txt(c, '효율 ' + Math.round(e * 100) + ' %', bx + 70, by - e * bh - 22, { size: 24, weight: 700, color: COL.work, align: 'center' });
    },
  });
}

/* ── 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 500);
  let second = false;
  const btn = KIT.btn('(4) 그림 보기', function () { second = !second; btn.setAttribute('aria-pressed', String(second)); });
  btn.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [btn], [
    KIT.cap('예제'),
    KIT.p('어떤 열기관이 한 번 순환하는 동안 고열원에서 500 J 을 흡수하고 저열원으로 350 J 을 방출하였다.', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 한 일 　W = Q₁ − Q₂ = 500 − 350 = {{⑧|150}} J'),
    KIT.p('(2) 열효율 　e = [[W|Q₁]] = [[150|500]] = {{⑨|0.3}} (30 %)'),
    KIT.p('(3) 다른 식으로 　e = 1 − [[Q₂|Q₁]] = 1 − [[350|500]] = {{(3)|0.3}}'),
    KIT.p('(4) 같은 Q₁ 로 W 를 200 J 로 늘리면 버리는 열 Q₂ = {{⑩|300}} J 로 줄어든다.'),
  ], { center: true });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 820, 500);
      if (second) flow(c, 140, 60, 500, 200, 300, { k: 0.4 }); else flow(c, 140, 60, 500, 150, 350, { k: 0.4 });
      txt(c, second ? 'W 200 J, Q₂ 300 J → e = 0.4' : 'W 150 J, Q₂ 350 J → e = 0.3', 30, 32, { size: 24, weight: 700, color: COL.energy });
    },
  };
}
