/* ═══════════════ 15. 양자 역학, 기본 입자와 핵반응 : 장면 ═══════════════
   학습지 「빛과 물질의 이중성」(12·15차시) 가운데 Ⅳ. 현대 물리 부분 : 4 ~ 8 과 오해 2 · 3.
   광전 효과 → 광자의 에너지(예제) → 물질파 → 전자 하나씩 보내는 이중 슬릿 → 상보성과 불확정성
   → 에너지 준위 → 띠틈과 반도체 → 기본 입자 → 핵분열과 핵융합 → 자주 하는 오해 → 스스로 점검.
   학습지 빈칸 : ⑧ 나오지 않는다 ⑨ 개수 ⑩ 광자 ⑪ 1.0 eV ⑫ 나오지 않는다 ⑬ 1 × 10⁻¹⁰ m ⑭ 간섭무늬
                ⑮ 상보성 원리 ⑯ 불확정성 원리 ⑰ 양자화 ⑱ 띠틈 ⑲ uud ⑳ E = Δmc²
   (① ~ ⑦, ㉑ ~ ㉓ 은 12. 간섭과 회절 수업 화면에 있다) */
const P4 = '4 빛은 알갱이처럼도 행동한다 ─ 광전 효과', P5 = '5 전자도 파동처럼 행동한다 ─ 물질파', P6 = '6 상보성과 불확정성',
  P7 = '7 에너지 준위와 반도체', P8 = '8 기본 입자와 핵반응';
const SCENE_LIST = [
  { id: 'photo', part: P4, title: '광전 효과', ws: '학습지 4 ⑧⑨⑩', make: scenePhoto },
  { id: 'einstein', part: P4, title: '광자의 에너지', ws: '학습지 4 · 예제 ⑪⑫', make: sceneEinstein },
  { id: 'matter', part: P5, title: '물질파', ws: '학습지 5 ⑬', make: sceneMatter },
  { id: 'electron', part: P5, title: '전자를 하나씩 보내면', ws: '학습지 5 ⑭', make: sceneElectron },
  { id: 'compl', part: P6, title: '상보성과 불확정성', ws: '학습지 6 ⑮⑯', make: sceneCompl },
  { id: 'levels', part: P7, title: '에너지 준위', ws: '학습지 7 ⑰', make: sceneLevels },
  { id: 'band', part: P7, title: '띠틈과 반도체', ws: '학습지 7 ⑱', make: sceneBand },
  { id: 'quark', part: P8, title: '물질을 이루는 기본 입자', ws: '학습지 8 ⑲', make: sceneQuark },
  { id: 'nuclear', part: P8, title: '핵분열과 핵융합', ws: '학습지 8 ⑳', make: sceneNuclear },
  { id: 'mis', part: '자주 하는 오해', title: '자주 하는 오해', ws: '오해 2 · 3', make: sceneMis },
  { id: 'check', part: '스스로 점검하기', title: '스스로 점검하기', ws: '스스로 점검하기', make: sceneCheck },
];
const TAU = Math.PI * 2, W_FN = 2.0;
/* 학습지 글 (조금 작은 글씨) */
function small(s, style) { return KIT.p(s, 'ws sm', 'font-size:28px' + (style ? ';' + style : '')); }
/* 광자의 에너지(eV) → 파장(nm) → 색 */
function eVnm(E) { return 1240 / E; }
function eVcol(E, a) { return KIT.nm(eVnm(E), a); }
function eVname(E) { const nm = eVnm(E); return nm > 750 ? '적외선' : nm > 620 ? '빨간빛' : nm > 590 ? '주황빛' : nm > 565 ? '노란빛' : nm > 495 ? '초록빛' : nm > 450 ? '파란빛' : nm > 380 ? '보랏빛' : '자외선'; }
/* 광자 : (x, y) 에서 (dx, dy) 방향으로 가는 짧은 물결 덩어리 */
function photon(c, x, y, dx, dy, color, len) {
  const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux, n = len || 40, pts = [];
  for (let s = 0; s <= n; s += 2) { const a = 7 * Math.sin(s / n * TAU * 2.5) * Math.sin(s / n * Math.PI); pts.push([x - ux * (n - s) + px * a, y - uy * (n - s) + py * a]); }
  KIT.line(c, pts, color, 4);
}
/* 간섭무늬 확률 : y(-1 ~ 1) */
function pattern(y, which) {
  if (which) return Math.exp(-Math.pow((y - 0.28) / 0.13, 2)) + Math.exp(-Math.pow((y + 0.28) / 0.13, 2));
  return Math.pow(Math.cos(y * Math.PI * 4.2), 2) * Math.exp(-Math.pow(y / 0.62, 2));
}
function sampleY(which) { for (let k = 0; k < 200; k++) { const y = Math.random() * 2 - 1; if (Math.random() * 1.05 < pattern(y, which)) return y; } return 0; }

/* ── 4 광전 효과 실험 ── */
function scenePhoto(root) {
  const cv = makeCanvas(820, 600);
  const sE = KIT.slider('광자 하나의 에너지', 1, 4, 0.1, 1.8, function (v) { return KIT.fmt(v, 1) + ' eV · ' + eVname(v); }, '200px');
  const sI = KIT.slider('빛의 세기', 1, 5, 1, 3, function (v) { return v + ' 단계'; }, '200px');
  let ph = [], el = [], spark = [], emit = 0, hits = [], clock = 0;
  KIT.split(root, cv, [], [
    KIT.cap('4 빛은 알갱이처럼도 행동한다 ─ 광전 효과'),
    small('• 금속에 빛을 비추면 금속 속의 전자가 튀어나옵니다. 이것을 광전 효과라 합니다.'),
    small('• 빛이 파동이라면 어떤 색의 빛이든 세게 오래 비추면 전자가 나와야 합니다. 그러나 실험 결과는 전혀 달랐습니다.'),
    KIT.table(['실험', '빛이 파동이라면', '실제 결과'], [
      ['진동수가 낮은 빛(빨간빛)을 아주 세게 비춘다', '언젠가는 전자가 나와야 한다', '전자가 {{⑧|나오지 않는다}}'],
      ['진동수가 높은 빛(자외선)을 약하게 비춘다', '에너지가 쌓일 때까지 기다려야 한다', '곧바로 나온다'],
      ['같은 빛을 더 세게 비춘다', '전자 하나의 에너지가 커져야 한다', '튀어나오는 전자의 {{⑨|개수}}만 늘어난다'],
    ], { cols: ['36%', '32%', '32%'], plain: true }),
    small('• 아인슈타인(1905년)은 빛이 에너지 덩어리, 곧 {{⑩|광자}}의 흐름이라고 설명했습니다. 광자 하나의 에너지는 빛의 진동수에 비례합니다.'),
  ], { under: h('div', { class: 'col', style: 'padding:0 22px 16px;gap:0' }, sE.el, sI.el) });
  return {
    tick: function (dt) {
      const E = sE.get(), I = sI.get(), col = eVcol(E), c = cv.ctx; c.clearRect(0, 0, 820, 600);
      const sx = 120, sy = 120, plateY = 470;
      clock += dt; emit += dt; const gap = 0.6 / I;
      while (emit > gap) { emit -= gap; const tx = 260 + Math.random() * 500; ph.push({ x: sx, y: sy, tx: tx, s: 0 }); }
      ph.forEach(function (p) { p.s += dt * 1.6; });
      ph = ph.filter(function (p) {
        if (p.s < 1) return true;
        if (E > W_FN) { const a = (Math.random() - 0.5) * 1.0, v = 120 + 160 * Math.sqrt(E - W_FN); el.push({ x: p.tx, y: plateY, vx: Math.sin(a) * v, vy: -Math.cos(a) * v, life: 0 }); hits.push(clock); }
        else spark.push({ x: p.tx, y: plateY, life: 0 });
        return false;
      });
      el.forEach(function (e) { e.x += e.vx * dt; e.y += e.vy * dt; e.life += dt; });
      el = el.filter(function (e) { return e.y > 30 && e.life < 3; });
      spark.forEach(function (s) { s.life += dt; }); spark = spark.filter(function (s) { return s.life < 0.4; });
      hits = hits.filter(function (t) { return clock - t < 2; });
      // 광원
      c.fillStyle = COL['ink-2']; c.save(); c.translate(sx, sy); c.rotate(0.9); rrect(c, -60, -30, 70, 60, 10); c.fill(); c.restore();
      txt(c, eVname(E), sx - 40, sy - 70, { size: 22, weight: 700, color: E > 3.26 ? COL.energy : col });
      ph.forEach(function (p) { const x = sx + (p.tx - sx) * p.s, y = sy + (plateY - sy) * p.s; photon(c, x, y, p.tx - sx, plateY - sy, E > 3.26 ? COL.energy : col, 46); });
      // 금속판
      c.fillStyle = '#9AA7B4'; c.fillRect(240, plateY, 540, 40);
      txt(c, '금속 (일함수 W = ' + KIT.fmt(W_FN, 1) + ' eV)', 510, plateY + 66, { size: 22, weight: 700, align: 'center' });
      el.forEach(function (e) { dot(c, e.x, e.y, 8, COL.cold); txt(c, '−', e.x, e.y, { size: 12, weight: 700, color: '#fff', align: 'center' }); });
      spark.forEach(function (s) { c.fillStyle = rgba(COL.heat, 0.5 * (1 - s.life / 0.4)); c.beginPath(); c.arc(s.x, s.y, 14, Math.PI, 0); c.fill(); });
      c.fillStyle = COL['panel-2']; rrect(c, 420, 30, 380, 150, 14); c.fill();
      txt(c, '튀어나오는 전자 (2초 동안)', 440, 60, { size: 20, weight: 700, color: COL.muted });
      txt(c, hits.length + ' 개', 440, 100, { size: 34, weight: 700, color: COL.cold, mono: true });
      txt(c, E > W_FN ? '전자 하나의 최대 운동 에너지 ' + KIT.fmt(E - W_FN, 1) + ' eV' : '광자 하나의 에너지가 W 보다 작다', 440, 148, { size: 20, weight: 700, color: E > W_FN ? COL.ink : COL.pen });
    },
  };
}

/* ── 4 광자의 에너지 · 광전 효과 식 · 예제 ── */
function sceneEinstein(root) {
  const cv = makeCanvas(820, 400);
  const sE = KIT.slider('광자 하나의 에너지 hf', 0.5, 5, 0.1, 3, function (v) { return KIT.fmt(v, 1) + ' eV'; }, '260px');
  KIT.split(root, cv, [h('div', { style: 'width:100%' }, sE.el)], [
    KIT.callout('E = h f 　　(h = 6.6 × 10^{−34} J·s, 플랑크 상수)', false, 'font-size:28px'),
    small('• 전자 하나는 광자 하나에게서만 에너지를 받습니다. 광자 하나의 에너지가 전자를 떼어 내는 데 필요한 최소 에너지(일함수 W)보다 작으면, 광자가 아무리 많이 와도 전자는 나오지 않습니다.'),
    KIT.callout('K최대 = h f − W 　　(튀어나온 전자의 최대 운동 에너지)', false, 'font-size:28px'),
    small('• 에너지 단위로는 eV(전자볼트)를 자주 씁니다. 1 eV 는 전자 하나가 1 V 의 전압에서 얻는 에너지로, 약 1.6 × 10^{−19} J 입니다.'),
    KIT.cap('예제'),
    small('일함수가 2.0 eV 인 금속이 있다.', 'font-weight:600'),
    small('(가) 광자 하나의 에너지가 3.0 eV 인 빛을 비추면, 튀어나오는 전자의 최대 운동 에너지는 {{⑪|1.0 eV}}이다.'),
    small('(나) 광자 하나의 에너지가 1.5 eV 인 빛을 아주 세게 비추면 전자는 {{⑫|나오지 않는다}}. 광자 하나의 에너지가 일함수보다 작기 때문이다.'),
  ], { under: h('div', { style: 'padding:0 22px 18px' }, h('div', { class: 'callout', style: 'font-size:22px;line-height:1.5' },
    h('b', { text: '더 알아보기 ─ 양자의 시작' }), h('br'),
    '플랑크(1900년)는 뜨겁게 달군 물체가 내는 빛의 색 분포를 설명하려고, 에너지가 hf 의 정수 배로만 주고받아진다고 가정했습니다. 이것이 양자 개념의 출발입니다.', h('br'),
    '콤프턴(1923년)은 X선이 전자와 부딪힌 뒤 파장이 길어지는 것을 보였습니다. 광자가 당구공처럼 운동량을 가지고 부딪친다는 증거입니다.')) });
  return {
    tick: function () {
      const E = sE.get(), c = cv.ctx; c.clearRect(0, 0, 820, 400);
      // 왼쪽 : 에너지 막대 (1 eV = 56 px)
      const k = 56, base = 350, x = 70;
      c.fillStyle = rgba(COL.heat, 0.18); c.fillRect(x, base - W_FN * k, 150, W_FN * k);
      c.strokeStyle = COL.heat; c.lineWidth = 2; c.strokeRect(x, base - W_FN * k, 150, W_FN * k);
      txt(c, '일함수 W', x + 75, base - W_FN * k / 2, { size: 20, weight: 700, align: 'center', color: COL.heat });
      c.fillStyle = '#9AA7B4'; c.fillRect(x - 10, base, 170, 14); txt(c, '금속 속 전자', x + 75, base + 34, { size: 18, align: 'center', color: COL.muted });
      const top = base - Math.min(E, 5.2) * k, ecol = E > 3.26 ? COL.energy : eVcol(E);
      arrow(c, x + 190, base, x + 190, top, { width: 8, head: 22, color: ecol });
      txt(c, 'hf = ' + KIT.fmt(E, 1) + ' eV', x + 206, top + 12, { size: 20, weight: 700, color: COL.ink });
      if (E > W_FN) { c.fillStyle = rgba(COL.cold, 0.25); c.fillRect(x, top, 150, (E - W_FN) * k); txt(c, 'K최대 ' + KIT.fmt(E - W_FN, 1) + ' eV', x + 75, top + (E - W_FN) * k / 2, { size: 20, weight: 700, align: 'center', color: COL.cold }); }
      else txt(c, '전자가 나오지 않는다', x, 30, { size: 22, weight: 700, color: COL.pen });
      // 오른쪽 : K최대 – hf 그래프
      const ax = KIT.axes(c, { x: 420, y: 50, w: 340, h: 280 }, 'hf (eV)', 'K최대 (eV)');
      [0, 1, 2, 3, 4, 5].forEach(function (v) { txt(c, String(v), ax.X(v / 5), ax.y0 + 22, { size: 16, align: 'center', color: COL.muted }); });
      KIT.line(c, [[ax.X(0), ax.Y(0)], [ax.X(W_FN / 5), ax.Y(0)], [ax.X(1), ax.Y(3 / 3)]], COL.cold, 5);
      dot(c, ax.X(E / 5), ax.Y(Math.max(0, E - W_FN) / 3), 10, COL.energy);
      txt(c, 'W', ax.X(W_FN / 5), ax.y0 + 44, { size: 18, weight: 700, align: 'center', color: COL.heat });
    },
  };
}

/* ── 5 물질파 ── */
function sceneMatter(root) {
  const cv = makeCanvas(900, 600);
  let obj = 1;
  const sB = KIT.slider('야구공의 속력', 10, 50, 5, 40, function (v) { return v + ' m/s'; }, '170px');
  const sEl = KIT.slider('전자의 속력', 5, 7, 0.05, 6.86, function (v) { const p = Math.pow(10, v), e = Math.floor(Math.log10(p)); return KIT.fmt(p / Math.pow(10, e), 1) + ' × 10' + '⁰¹²³⁴⁵⁶⁷⁸⁹'[e] + ' m/s'; }, '170px');
  sB.el.hidden = true;
  const seg = KIT.seg(['야구공', '전자'], 1, function (i) { obj = i; sB.el.hidden = i === 1; sEl.el.hidden = i === 0; });
  KIT.split(root, cv, [seg.el], [
    small('• 드 브로이(1924년)는 빛이 알갱이처럼 행동한다면 전자 같은 알갱이도 파동처럼 행동할 것이라고 생각했습니다. 운동량이 p 인 입자의 파장은 다음과 같습니다. 이 파동을 물질파라 합니다.'),
    KIT.callout('λ = [[h|p]] = [[h|m v]]', false, 'font-size:34px;text-align:center'),
    KIT.table(['', '질량', '속력', '물질파의 파장'], [
      ['야구공', '0.15 kg', '40 m/s', '약 1 × 10^{−34} m'],
      ['전자', '9.1 × 10^{−31} kg', '7.3 × 10^{6} m/s', '약 {{⑬|1 × 10⁻¹⁰ m}} (원자 크기 정도)'],
    ], { cols: ['15%', '25%', '25%', '35%'] }),
    small('• 야구공의 파장은 원자핵보다도 훨씬 작아서 파동성이 전혀 드러나지 않습니다. 전자의 파장은 원자 크기 정도여서, 원자가 규칙적으로 늘어선 결정에 전자를 쏘면 회절 무늬가 생깁니다(데이비슨–저머 실험, 1927년).'),
  ], { under: h('div', { class: 'col', style: 'padding:0 22px 16px;gap:0' }, sB.el, sEl.el) });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const h6 = 6.6e-34, m = obj ? 9.1e-31 : 0.15, v = obj ? Math.pow(10, sEl.get()) : sB.get(), lam = h6 / (m * v);
      const ex = Math.floor(Math.log10(lam)), man = lam / Math.pow(10, ex);
      txt(c, obj ? '전자' : '야구공', 40, 50, { size: 28, weight: 700 });
      txt(c, 'λ = h / (m v) = ' + KIT.fmt(man, 1) + ' × 10^{' + ex + '} m', 40, 100, { size: 30, weight: 700, color: COL.energy, mono: true });
      if (obj) { dot(c, 140, 200, 18, COL.cold); txt(c, '−', 140, 200, { size: 22, weight: 700, color: '#fff', align: 'center' }); }
      else { c.fillStyle = '#F3EEE2'; c.beginPath(); c.arc(140, 200, 34, 0, TAU); c.fill(); c.strokeStyle = COL.pen; c.lineWidth = 3; c.beginPath(); c.arc(112, 200, 26, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(168, 200, 26, Math.PI - 0.9, Math.PI + 0.9); c.stroke(); }
      KIT.vec(c, 190, 200, 120, 0, COL['ink-2'], '', { width: 5, head: 18 });
      // 길이 눈금 (로그) : 10^-36 m ~ 1 m
      const x0 = 40, x1 = 860, y = 380, X = function (p) { return x0 + (p + 36) / 36 * (x1 - x0); };
      c.fillStyle = COL['ink-2']; c.fillRect(x0, y, x1 - x0, 4);
      for (let p = -36; p <= 0; p += 2) { c.fillRect(X(p) - 1, y - (p % 6 === 0 ? 14 : 8), 2, p % 6 === 0 ? 28 : 16); if (p % 6 === 0) txt(c, '10^{' + p + '}', X(p), y + 36, { size: 18, align: 'center', color: COL.muted }); }
      txt(c, 'm', x1 + 8, y + 36, { size: 18, color: COL.muted });
      [[-15, '원자핵', COL.heat], [-10, '원자', COL.good], [-6.3, '가시광선의 파장', '#C79300'], [0, '사람 키', COL.muted]].forEach(function (o, i) {
        const yy = y - 60 - (i % 2) * 34;
        KIT.dash(c, X(o[0]), y - 6, X(o[0]), yy + 10, o[2], 2, [4, 4]);
        txt(c, o[1], X(o[0]), yy, { size: 18, weight: 700, align: 'center', color: o[2] });
      });
      const lx = X(Math.log10(lam));
      arrow(c, lx, y + 110, lx, y + 12, { width: 6, head: 20, color: COL.energy });
      txt(c, '이 물체의 물질파 파장', lx, y + 132, { size: 20, weight: 700, align: lx > 600 ? 'right' : lx < 200 ? 'left' : 'center', color: COL.energy });
      txt(c, obj ? '원자 크기 정도 → 결정에서 회절 무늬가 생긴다' : '원자핵보다 훨씬 작다 → 파동성이 드러나지 않는다', 40, 570, { size: 22, weight: 700, color: obj ? COL.good : COL.pen });
    },
  };
}

/* ── 5 전자를 하나씩 보내는 이중 슬릿 ── */
function sceneElectron(root) {
  const cv = makeCanvas(900, 600);
  let dots = [], fly = [], auto = 1, acc = 0;
  const bOne = KIT.btn('하나씩 보내기', function () { auto = 0; segA.set(0); fly.push({ s: 0 }); });
  const segA = KIT.seg(['멈춤', '천천히', '빠르게'], 1, function (i) { auto = i; });
  KIT.split(root, cv, [bOne, segA.el, KIT.btn('지우기', function () { dots = []; fly = []; })], [
    small('• 2의 이중 슬릿에 빛 대신 전자를 하나씩 보내면 어떻게 될까요? 전자는 스크린의 한 점에 알갱이처럼 도착합니다. 그런데 점이 쌓이면 빛과 똑같은 {{⑭|간섭무늬}}가 나타납니다.', 'font-size:30px'),
    small('• 전자 하나하나는 한 점에 도착하지만, 어디에 도착할지는 물질파의 간섭이 정하는 확률을 따릅니다.', 'font-size:30px'),
    KIT.cap('생활 속 물질파 ─ 전자현미경'),
    small('3에서 렌즈로는 파장보다 훨씬 작은 것을 볼 수 없다고 했습니다. 전자의 물질파는 가시광선보다 파장이 수천 배 이상 짧아서, 전자현미경으로는 바이러스나 원자의 배열까지 볼 수 있습니다.'),
  ]);
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      acc += dt * (auto === 2 ? 120 : auto === 1 ? 6 : 0);
      while (acc >= 1) { acc -= 1; if (auto === 2) dots.push({ x: Math.random(), y: sampleY(0) }); else fly.push({ s: 0 }); }
      fly.forEach(function (f) { f.s += dt * 1.4; });
      fly = fly.filter(function (f) { if (f.s >= 1) { dots.push({ x: Math.random(), y: sampleY(0) }); return false; } return true; });
      if (dots.length > 6000) dots.splice(0, dots.length - 6000);
      const cy = 300, bx = 260, sx = 470;
      c.fillStyle = COL['ink-2']; rrect(c, 20, cy - 26, 60, 52, 8); c.fill(); txt(c, '전자총', 50, cy + 50, { size: 18, align: 'center', color: COL.muted });
      c.fillRect(bx - 5, 60, 10, cy - 34 - 60); c.fillRect(bx - 5, cy - 14, 10, 28); c.fillRect(bx - 5, cy + 34, 10, 540 - cy - 34);
      c.fillStyle = COL.line; c.fillRect(sx, 60, 6, 480);
      fly.forEach(function (f) {
        if (f.s < 0.5) dot(c, 80 + (bx - 80) * f.s / 0.5, cy, 7, COL.cold);
        else { const r = (f.s - 0.5) / 0.5 * (sx - bx); c.strokeStyle = rgba(COL.cold, 0.35 * (1 - (f.s - 0.5) * 2) + 0.1); c.lineWidth = 2; [cy - 24, cy + 24].forEach(function (yy) { c.beginPath(); c.arc(bx, yy, r, -1.2, 1.2); c.stroke(); }); }
      });
      // 스크린 정면 : 점이 쌓인다
      const fx = 520, fw = 340, fy = 60, fh = 480;
      c.fillStyle = '#05080C'; c.fillRect(fx, fy, fw, fh);
      c.fillStyle = 'rgba(120,220,255,0.85)';
      dots.forEach(function (d) { c.fillRect(fx + d.x * fw, fy + fh / 2 + d.y * fh / 2, 2.2, 2.2); });
      txt(c, '스크린 (정면)', fx + fw / 2, fy - 20, { size: 20, weight: 700, align: 'center' });
      txt(c, '도착한 전자 ' + dots.length + ' 개', 30, 40, { size: 24, weight: 700, color: COL.cold });
      txt(c, dots.length < 30 ? '한 점씩 알갱이처럼 도착한다' : dots.length < 600 ? '점이 쌓이면서 줄무늬가 보이기 시작한다' : '빛과 똑같은 간섭무늬', 30, 580, { size: 22, weight: 700, color: COL.energy });
    },
  };
}

/* ── 6 상보성과 불확정성 ── */
function sceneCompl(root) {
  const cv = makeCanvas(900, 600);
  let mode = 0, det = false, dots = [], acc = 0, t = 0;
  const sx = KIT.slider('위치의 불확정성 Δx', 0.3, 2, 0.05, 1, function (v) { return KIT.fmt(v, 2); }, '220px');
  sx.el.hidden = true;
  const bDet = KIT.btn('슬릿에 검출기 켜기', function () { det = !det; dots = []; bDet.setAttribute('aria-pressed', String(det)); bDet.textContent = det ? '검출기 끄기' : '슬릿에 검출기 켜기'; });
  bDet.setAttribute('aria-pressed', 'false');
  const seg = KIT.seg(['어느 슬릿을 지났나', '위치와 운동량'], 0, function (i) { mode = i; bDet.hidden = i === 1; sx.el.hidden = i === 0; });
  KIT.split(root, cv, [seg.el, bDet], [
    KIT.cap('6 파동이면서 알갱이 ─ 상보성과 불확정성'),
    small('• 빛과 전자는 실험에 따라 파동처럼도, 알갱이처럼도 행동합니다. 이것을 이중성이라 합니다.', 'font-size:30px'),
    small('• 두 성질이 한 실험에서 동시에 드러나지는 않습니다. 이중 슬릿에서 전자가 어느 슬릿을 지났는지 확인하는 순간 간섭무늬가 사라집니다. 이것을 {{⑮|상보성 원리}}라 합니다.', 'font-size:30px'),
    small('• 입자의 위치와 운동량을 동시에 정확히 알 수는 없습니다. 위치를 정확히 알수록 운동량은 부정확해집니다. 이것을 {{⑯|불확정성 원리}}라 하며, 측정 장비의 한계가 아니라 자연의 성질입니다.', 'font-size:30px'),
    KIT.callout('Δx · Δp ≥ [[h|4π]]', false, 'font-size:34px;text-align:center'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sx.el) });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      if (mode === 0) {
        acc += dt * 90; while (acc >= 1) { acc -= 1; dots.push({ x: Math.random(), y: sampleY(det ? 1 : 0) }); }
        if (dots.length > 4000) dots.splice(0, dots.length - 4000);
        const cy = 300, bx = 200;
        c.fillStyle = COL['ink-2']; c.fillRect(bx - 5, 60, 10, cy - 34 - 60); c.fillRect(bx - 5, cy - 14, 10, 28); c.fillRect(bx - 5, cy + 34, 10, 540 - cy - 34);
        rrect(c, 40, cy - 22, 50, 44, 8); c.fill();
        if (det) [cy - 24, cy + 24].forEach(function (yy, i) {
          c.strokeStyle = COL.pen; c.lineWidth = 3; c.beginPath(); c.ellipse(bx + 50, yy + (i ? 26 : -26), 20, 12, 0, 0, TAU); c.stroke();
          dot(c, bx + 50, yy + (i ? 26 : -26), 5, COL.pen);
          if (Math.sin(t * 13 + i * 2) > 0.7) { c.fillStyle = rgba(COL.pen, 0.35); c.beginPath(); c.arc(bx, yy, 16, 0, TAU); c.fill(); }
        });
        const fx = 420, fw = 400, fy = 60, fh = 480;
        c.fillStyle = '#05080C'; c.fillRect(fx, fy, fw, fh);
        c.fillStyle = 'rgba(120,220,255,0.85)';
        dots.forEach(function (d) { c.fillRect(fx + d.x * fw, fy + fh / 2 + d.y * fh / 2, 2.2, 2.2); });
        txt(c, det ? '어느 슬릿인지 확인하면 → 줄 두 개 (알갱이처럼)' : '확인하지 않으면 → 간섭무늬 (파동처럼)', 30, 36, { size: 22, weight: 700, color: det ? COL.pen : COL.energy });
        txt(c, '스크린 (정면)', fx + fw / 2, 566, { size: 20, weight: 700, align: 'center', color: COL.muted });
        return;
      }
      const dx = sx.get(), dp = 1 / dx;
      const a1 = KIT.axes(c, { x: 60, y: 70, w: 760, h: 180 }, '위치 x', '', { zero: 0.5 });
      txt(c, '물질파 (위치)', 70, 50, { size: 22, weight: 700, color: COL.cold });
      const pts = [];
      for (let i = 0; i <= 400; i++) { const u = i / 400, x = (u - 0.5) * 8, env = Math.exp(-x * x / (2 * dx * dx)); pts.push([a1.X(u), a1.y0 - 80 * env * Math.cos(x * 7 - t * 4)]); }
      KIT.line(c, pts, COL.cold, 4);
      const wx = dx / 8 * 760;
      arrow(c, a1.X(0.5) - wx, 262, a1.X(0.5) + wx, 262, { width: 3, head: 12, color: COL.cold }); arrow(c, a1.X(0.5) + wx, 262, a1.X(0.5) - wx, 262, { width: 3, head: 12, color: COL.cold });
      txt(c, 'Δx', a1.X(0.5), 286, { size: 22, weight: 700, align: 'center', color: COL.cold });
      const a2 = KIT.axes(c, { x: 60, y: 350, w: 760, h: 150 }, '운동량 p', '');
      txt(c, '운동량이 퍼진 정도', 70, 330, { size: 22, weight: 700, color: COL.heat });
      KIT.plot(c, a2, function (u) { const p = (u - 0.5) * 8; return Math.exp(-p * p / (2 * dp * dp)); }, 0, 1, COL.heat, 5, 300);
      const wp = Math.min(dp / 8 * 760, 380);
      arrow(c, a2.X(0.5) - wp, 530, a2.X(0.5) + wp, 530, { width: 3, head: 12, color: COL.heat }); arrow(c, a2.X(0.5) + wp, 530, a2.X(0.5) - wp, 530, { width: 3, head: 12, color: COL.heat });
      txt(c, 'Δp', a2.X(0.5), 556, { size: 22, weight: 700, align: 'center', color: COL.heat });
      txt(c, dx < 0.7 ? '위치를 좁히면 운동량이 넓게 퍼진다' : dx > 1.4 ? '운동량을 좁히면 위치가 넓게 퍼진다' : 'Δx · Δp 는 일정한 값보다 작아질 수 없다', 450, 590, { size: 22, weight: 700, align: 'center', color: COL.energy });
    },
  };
}

/* ── 7 에너지 준위 : 갇힌 전자의 정상파 (값은 예시) ── */
function sceneLevels(root) {
  const cv = makeCanvas(900, 620);
  const E1 = 0.33;
  let n = 3, drop = null, lines = [], tt = 0;
  const segN = KIT.seg(['n = 1', 'n = 2', 'n = 3', 'n = 4'], 2, function (i) { if (!drop) n = i + 1; else segN.set(n - 1); });
  function fall(to) { if (drop || to >= n || to < 1) return; drop = { from: n, to: to, s: 0 }; }
  KIT.split(root, cv, [segN.el, KIT.btn('한 칸 내려오기', function () { fall(n - 1); }, true), KIT.btn('맨 아래로', function () { fall(1); }), KIT.btn('스펙트럼 지우기', function () { lines = []; })], [
    KIT.cap('7 갇힌 전자는 띄엄띄엄한 에너지를 가진다 ─ 에너지 준위'),
    small('• 양 끝이 묶인 기타 줄은 아무렇게나 떨지 못하고, 줄 길이에 반 파장이 1개, 2개, 3개 … 꼭 맞게 들어가는 진동(정상파)만 합니다.'),
    small('• 원자 속처럼 좁은 곳에 갇힌 전자의 물질파도 마찬가지입니다. 허용되는 파장이 띄엄띄엄하므로 전자의 에너지도 띄엄띄엄한 값만 가집니다. 이 값들을 에너지 준위라 하고, 에너지가 띄엄띄엄해지는 것을 {{⑰|양자화}}라 합니다.'),
    small('• 전자가 높은 준위에서 낮은 준위로 내려오면 그 차이만큼의 에너지를 가진 광자 하나를 내놓습니다. 준위가 띄엄띄엄하므로 원자는 특정한 색의 빛(선 스펙트럼)만 냅니다. 네온사인의 색이 기체마다 다른 이유입니다.'),
    KIT.callout('h f = E높은 − E낮은', false, 'font-size:32px;text-align:center'),
  ]);
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 900, 620);
      tt += dt;
      if (drop) { drop.s += dt * 1.2; if (drop.s >= 1) { const dE = (drop.from * drop.from - drop.to * drop.to) * E1; if (lines.indexOf(dE) < 0) lines.push(dE); n = drop.to; segN.set(n - 1); drop = null; } }
      // 왼쪽 : 상자 속 정상파
      const bx0 = 50, bx1 = 370, by = 230, show = drop ? drop.from : n;
      c.fillStyle = COL['ink-2']; c.fillRect(bx0 - 10, 80, 10, 300); c.fillRect(bx1, 80, 10, 300);
      txt(c, '갇힌 전자의 물질파', (bx0 + bx1) / 2, 50, { size: 22, weight: 700, align: 'center' });
      const pts = [];
      for (let i = 0; i <= 160; i++) { const u = i / 160; pts.push([bx0 + u * (bx1 - bx0), by - 90 * Math.sin(show * Math.PI * u) * Math.cos(tt * 3.3)]); }
      KIT.line(c, pts, COL.cold, 5);
      c.fillStyle = COL.line; c.fillRect(bx0, by, bx1 - bx0, 2);
      txt(c, '반 파장이 ' + show + ' 개 꼭 맞게', (bx0 + bx1) / 2, 410, { size: 22, weight: 700, align: 'center', color: COL.cold });
      // 오른쪽 : 에너지 준위 E = n² E₁
      const lx0 = 480, lx1 = 700, Y = function (k) { return 440 - k * k * 22; };
      txt(c, '에너지 준위 (예시)', 590, 50, { size: 22, weight: 700, align: 'center' });
      for (let k = 1; k <= 4; k++) { c.fillStyle = k === show ? COL.energy : COL['ink-2']; c.fillRect(lx0, Y(k) - 2, lx1 - lx0, 4); txt(c, 'n = ' + k, lx1 + 16, Y(k), { size: 20, weight: 700, color: k === show ? COL.energy : COL.muted }); }
      let ey = Y(n);
      if (drop) {
        ey = Y(drop.from) + (Y(drop.to) - Y(drop.from)) * Math.min(1, drop.s * 1.6);
        const dE = (drop.from * drop.from - drop.to * drop.to) * E1, col = dE > 3.26 || dE < 1.65 ? COL.muted : eVcol(dE);
        if (drop.s > 0.3) { const s = (drop.s - 0.3) / 0.7; photon(c, 640 + s * 150, Y(drop.to) - 30 - s * 60, 1, -0.4, col, 50); }
        arrow(c, lx0 + 60, Y(drop.from), lx0 + 60, Y(drop.to), { width: 4, head: 14, color: COL.pen });
      }
      dot(c, lx0 + 110, ey, 11, COL.cold);
      // 아래 : 선 스펙트럼
      const sx0 = 40, sx1 = 860, sy = 500, X = function (nm) { return sx0 + (nm - 380) / 400 * (sx1 - sx0); };
      c.fillStyle = '#05080C'; c.fillRect(sx0, sy, sx1 - sx0, 60);
      lines.forEach(function (dE) {
        const nm = eVnm(dE);
        if (nm >= 380 && nm <= 780) { c.fillStyle = KIT.nm(nm); c.fillRect(X(nm) - 3, sy, 6, 60); txt(c, Math.round(nm) + ' nm', X(nm), sy + 80, { size: 16, align: 'center', color: COL.muted }); }
        else txt(c, (nm < 380 ? '자외선 ' : '적외선 ') + Math.round(nm) + ' nm (눈에 안 보임)', nm < 380 ? sx0 : sx1, sy - 14 - (nm < 380 ? 0 : 0), { size: 16, align: nm < 380 ? 'left' : 'right', color: COL.muted });
      });
      txt(c, '선 스펙트럼 : 특정한 색만 나온다', sx0, sy - 40, { size: 20, weight: 700 });
    },
  };
}

/* ── 7 띠틈과 반도체 ── */
function sceneBand(root) {
  const cv = makeCanvas(900, 560);
  let kind = 1, t = 0, ups = [];
  const sT = KIT.slider('열 · 빛으로 주는 에너지', 0, 1, 0.05, 0.5, function (v) { return Math.round(v * 100) + ' %'; }, '230px');
  const seg = KIT.seg(['도체', '반도체', '절연체'], 1, function (i) { kind = i; ups = []; });
  KIT.split(root, cv, [seg.el], [
    small('• 원자가 아주 많이 모인 고체에서는 준위들이 촘촘히 모여 띠를 이룹니다. 전자로 채워진 원자가띠와 비어 있는 전도띠 사이의 간격을 {{⑱|띠틈}}이라 합니다.', 'font-size:30px'),
    KIT.table(['구분', '띠틈', '전류'], [
      ['도체', '없음', '잘 흐른다'],
      ['반도체', '작음 (약 1 eV)', '열·빛·불순물로 흐르는 정도를 조절할 수 있다'],
      ['절연체', '큼', '거의 흐르지 않는다'],
    ], { cols: ['20%', '28%', '52%'] }),
    small('• 반도체는 전류를 흘릴지 말지를 조절할 수 있어서 다이오드, 트랜지스터, LED, 태양 전지의 재료가 됩니다. 스마트폰 칩 하나에는 이런 소자가 수십억 개 이상 들어 있습니다.', 'font-size:30px'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sT.el) });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const T = sT.get(), gapPx = [0, 70, 240][kind], vTop = 400, vBot = 480, cBot = vTop - gapPx, cTop = cBot - 80, x0 = 120, x1 = 680;
      const rate = kind === 0 ? 0 : kind === 1 ? T * T * 14 : T > 0.95 ? 0.4 : 0;
      if (Math.random() < rate * dt) ups.push({ x: x0 + 20 + Math.random() * (x1 - x0 - 40), s: 0 });
      ups.forEach(function (u) { u.s += dt; }); ups = ups.filter(function (u) { return u.s < 6; });
      // 띠
      c.fillStyle = rgba(COL.cold, 0.25); c.fillRect(x0, vTop, x1 - x0, vBot - vTop);
      c.fillStyle = rgba(COL.heat, 0.12); c.fillRect(x0, cTop, x1 - x0, cBot - cTop);
      c.strokeStyle = COL['ink-2']; c.lineWidth = 2; c.strokeRect(x0, vTop, x1 - x0, vBot - vTop); c.strokeRect(x0, cTop, x1 - x0, cBot - cTop);
      txt(c, '원자가띠 (전자로 채워짐)', x1 + 14, (vTop + vBot) / 2, { size: 20, weight: 700, color: COL.cold });
      txt(c, '전도띠 (비어 있음)', x1 + 14, (cTop + cBot) / 2, { size: 20, weight: 700, color: COL.heat });
      for (let i = 0; i < 28; i++) for (let j = 0; j < 3; j++) dot(c, x0 + 12 + i * 20, vTop + 16 + j * 24, 6, COL.cold);
      if (gapPx > 0) {
        arrow(c, x0 - 30, vTop, x0 - 30, cBot, { width: 3, head: 12, color: COL.energy }); arrow(c, x0 - 30, cBot, x0 - 30, vTop, { width: 3, head: 12, color: COL.energy });
        txt(c, '띠틈', x0 - 44, (vTop + cBot) / 2, { size: 20, weight: 700, color: COL.energy, align: 'right' });
      } else txt(c, '두 띠가 맞닿아 있다', x0, cBot + 30, { size: 20, weight: 700, color: COL.energy });
      // 전도띠로 올라간 전자 : 오른쪽으로 흐른다
      let moving = kind === 0 ? 12 : 0;
      if (kind === 0) for (let i = 0; i < 12; i++) { const x = x0 + ((i * 47 + t * 120) % (x1 - x0)); dot(c, x, cBot - 22 - (i % 3) * 18, 7, COL.cold); }
      ups.forEach(function (u) {
        const y = u.s < 0.5 ? vTop + 16 - (vTop + 16 - (cBot - 30)) * u.s / 0.5 : cBot - 30, x = u.s < 0.5 ? u.x : u.x + (u.s - 0.5) * 100;
        if (x < x1 - 6) { dot(c, x, y, 7, COL.cold); moving++; }
        c.strokeStyle = COL.cold; c.lineWidth = 2; c.beginPath(); c.arc(u.x, vTop + 16, 6, 0, TAU); c.stroke();
      });
      const cur = kind === 0 ? '잘 흐른다' : moving >= 4 ? '흐른다' : moving > 0 ? '조금 흐른다' : '거의 흐르지 않는다';
      c.fillStyle = COL['panel-2']; rrect(c, 30, 24, 420, 80, 14); c.fill();
      txt(c, ['도체', '반도체', '절연체'][kind] + ' · 전류 : ' + cur, 50, 64, { size: 26, weight: 700, color: cur === '거의 흐르지 않는다' ? COL.pen : COL.good });
      if (kind === 1) txt(c, '에너지를 줄수록 띠틈을 넘는 전자가 늘어난다', 30, 536, { size: 22, weight: 700, color: COL.energy });
      if (kind === 2) txt(c, '띠틈이 커서 전자가 넘어가기 어렵다', 30, 536, { size: 22, weight: 700, color: COL.energy });
    },
  };
}

/* ── 8 물질을 이루는 기본 입자 ── */
function sceneQuark(root) {
  const cv = makeCanvas(900, 600);
  let lv = 0, t = 0;
  const seg = KIT.seg(['원자', '원자핵', '양성자 · 중성자'], 0, function (i) { lv = i; });
  KIT.split(root, cv, [seg.el], [
    KIT.cap('8 물질을 이루는 기본 입자와 핵반응'),
    small('• 원자는 원자핵과 전자로, 원자핵은 양성자와 중성자로, 양성자와 중성자는 다시 쿼크로 이루어져 있습니다. 양성자는 위 쿼크 2개와 아래 쿼크 1개({{⑲|uud}}), 중성자는 위 쿼크 1개와 아래 쿼크 2개(udd)입니다.', 'font-size:30px'),
    KIT.table(['분류', '예', '하는 일'], [
      ['쿼크', '위 쿼크, 아래 쿼크 등 6종', '양성자와 중성자를 이룬다'],
      ['렙톤', '전자, 중성미자 등 6종', '쿼크와 달리 강한 핵력을 받지 않는다'],
      ['매개 입자', '광자, 글루온, W·Z 보손', '입자 사이에 힘을 전달한다'],
    ], { cols: ['22%', '36%', '42%'] }),
  ], { center: true });
  function quark(c, x, y, q, r) { dot(c, x, y, r, q === 'u' ? '#E05A7A' : '#3F8F5A'); txt(c, q, x, y, { size: r * 1.1, weight: 700, color: '#fff', align: 'center' }); }
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const cx = 450, cy = 300;
      if (lv === 0) {
        c.fillStyle = rgba(COL.cold, 0.1); c.beginPath(); c.arc(cx, cy, 230, 0, TAU); c.fill();
        [0, 1].forEach(function (k) { c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, 200, 90, k * 1.2 + 0.3, 0, TAU); c.stroke(); const a = t * (1.4 + k * 0.5) + k * 3; dot(c, cx + 200 * Math.cos(a) * Math.cos(k * 1.2 + 0.3) - 90 * Math.sin(a) * Math.sin(k * 1.2 + 0.3), cy + 200 * Math.cos(a) * Math.sin(k * 1.2 + 0.3) + 90 * Math.sin(a) * Math.cos(k * 1.2 + 0.3), 10, COL.cold); });
        dot(c, cx, cy, 14, COL.heat);
        txt(c, '원자핵', cx, cy + 34, { size: 20, weight: 700, align: 'center', color: COL.heat });
        txt(c, '전자', cx + 230, cy - 180, { size: 20, weight: 700, color: COL.cold });
        txt(c, '원자 : 약 10^{−10} m', 30, 40, { size: 26, weight: 700 });
        txt(c, '원자핵은 원자보다 약 10만 배 작다 (그림은 크게 그림)', 30, 570, { size: 20, color: COL.muted });
      } else if (lv === 1) {
        const ps = [[0, 0, 1], [40, 10, 0], [-30, 30, 1], [10, -40, 0], [-40, -20, 0], [30, 45, 1], [-5, 50, 0], [50, -30, 1], [-50, 25, 0], [20, 15, 1], [-20, -50, 1], [55, 20, 0]];
        ps.forEach(function (p) { dot(c, cx + p[0] * 2.2, cy + p[1] * 2.2, 40, p[2] ? '#D9534F' : '#8A98A8'); });
        txt(c, '원자핵 : 약 10^{−14} m', 30, 40, { size: 26, weight: 700 });
        dot(c, 620, 160, 16, '#D9534F'); txt(c, '양성자', 645, 160, { size: 22, weight: 700 });
        dot(c, 620, 200, 16, '#8A98A8'); txt(c, '중성자', 645, 200, { size: 22, weight: 700 });
      } else {
        [[250, '양성자', ['u', 'u', 'd'], '#D9534F'], [650, '중성자', ['u', 'd', 'd'], '#8A98A8']].forEach(function (o) {
          const x = o[0];
          c.fillStyle = rgba(o[3], 0.18); c.beginPath(); c.arc(x, cy, 150, 0, TAU); c.fill();
          c.strokeStyle = o[3]; c.lineWidth = 4; c.stroke();
          const P = o[2].map(function (q, i) { const a = i / 3 * TAU - Math.PI / 2 + 0.15 * Math.sin(t * 2 + i); return [x + 70 * Math.cos(a), cy + 70 * Math.sin(a)]; });
          for (let i = 0; i < 3; i++) { const A = P[i], B = P[(i + 1) % 3]; KIT.spring(c, A[0], A[1], B[0], B[1], 5, 7, '#C79300'); }
          P.forEach(function (p, i) { quark(c, p[0], p[1], o[2][i], 30); });
          txt(c, o[1] + ' (' + o[2].join('') + ')', x, cy + 190, { size: 26, weight: 700, align: 'center' });
        });
        txt(c, '양성자 · 중성자 : 약 10^{−15} m', 30, 40, { size: 26, weight: 700 });
        txt(c, 'u : 위 쿼크 　d : 아래 쿼크 　노란 용수철 : 글루온 (강한 핵력을 전달)', 30, 570, { size: 20, color: COL.muted });
      }
    },
  };
}

/* ── 8 핵분열과 핵융합 ── */
function sceneNuclear(root) {
  const cv = makeCanvas(900, 600);
  let kind = 0, t = 0;
  const seg = KIT.seg(['핵분열', '핵융합'], 0, function (i) { kind = i; t = 0; });
  KIT.split(root, cv, [seg.el, KIT.btn('다시 반응시키기', function () { t = 0; }, true)], [
    small('• 무거운 원자핵(우라늄 등)이 쪼개지는 핵분열과, 가벼운 원자핵(수소 등)이 합쳐지는 핵융합에서 에너지가 나옵니다.', 'font-size:30px'),
    small('• 두 경우 모두 반응 뒤의 질량이 반응 전보다 조금 줄어듭니다. 줄어든 질량 Δm 이 지난 시간에 배운 {{⑳|E = Δmc²}} 만큼의 에너지로 나옵니다.', 'font-size:30px'),
    small('• 원자력 발전은 핵분열을, 태양은 핵융합을 이용합니다. 지상에서 핵융합 발전을 하려면 1억 °C 가 넘는 플라스마를 오래 가두어야 해서 아직 연구 중입니다.', 'font-size:30px'),
  ], { center: true });
  function nucleus(c, x, y, r, label) {
    c.fillStyle = rgba('#D9534F', 0.85); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    for (let i = 0; i < r / 6; i++) { const a = i * 2.4, rr = Math.sqrt(i / (r / 6)) * r * 0.8; dot(c, x + rr * Math.cos(a), y + rr * Math.sin(a), Math.max(4, r / 7), i % 2 ? '#8A98A8' : '#C9403C'); }
    if (label) txt(c, label, x, y + r + 24, { size: 20, weight: 700, align: 'center' });
  }
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const cy = 220, s = clamp((t - 1) / 1.2, 0, 1), flash = t > 1 && t < 1.6;
      if (kind === 0) {
        if (t < 1) { nucleus(c, 450, cy, 70, '우라늄 235'); dot(c, 120 + t * 260, cy, 9, '#8A98A8'); txt(c, '중성자', 120 + t * 260, cy - 26, { size: 18, align: 'center', color: COL.muted }); }
        else { nucleus(c, 450 - 190 * s, cy - 40 * s, 52, s > 0.6 ? '바륨' : ''); nucleus(c, 450 + 190 * s, cy + 40 * s, 44, s > 0.6 ? '크립톤' : ''); [[-0.4], [0.3], [1.2]].forEach(function (a, i) { dot(c, 450 + Math.cos(a[0] + i) * 320 * s, cy + Math.sin(a[0] + i) * 160 * s, 9, '#8A98A8'); }); }
      } else {
        if (t < 1) { nucleus(c, 260 + t * 150, cy, 24, '중수소'); nucleus(c, 640 - t * 150, cy, 30, '삼중수소'); }
        else { nucleus(c, 450, cy, 36, s > 0.5 ? '헬륨' : ''); dot(c, 450 + 360 * s, cy - 60 * s, 9, '#8A98A8'); if (s > 0.5) txt(c, '중성자', 450 + 360 * s, cy - 60 * s - 24, { size: 18, align: 'center', color: COL.muted }); }
      }
      if (flash) { c.fillStyle = 'rgba(255,200,40,' + (0.6 * (1.6 - t) / 0.6) + ')'; c.beginPath(); c.arc(450, cy, 120 + (t - 1) * 200, 0, TAU); c.fill(); }
      // 질량 비교 (차이는 크게 부풀림)
      const y = 420, w0 = 620, dm = 46;
      txt(c, '반응 전 질량', 30, y, { size: 22, weight: 700 }); c.fillStyle = COL['ink-2']; c.fillRect(200, y - 18, w0, 36);
      txt(c, '반응 후 질량', 30, y + 60, { size: 22, weight: 700 });
      if (t > 1.6) {
        c.fillStyle = COL['ink-2']; c.fillRect(200, y + 42, w0 - dm, 36);
        c.fillStyle = rgba(COL.heat, 0.3); c.fillRect(200 + w0 - dm, y + 42, dm, 36); c.strokeStyle = COL.heat; c.lineWidth = 2; c.strokeRect(200 + w0 - dm, y + 42, dm, 36);
        txt(c, 'Δm', 200 + w0 - dm / 2, y + 100, { size: 22, weight: 700, align: 'center', color: COL.heat });
        txt(c, '줄어든 질량 Δm → 에너지 E = Δm c^{2}', 30, 560, { size: 24, weight: 700, color: COL.energy });
      }
      txt(c, kind ? '가벼운 원자핵이 합쳐진다 (태양)' : '무거운 원자핵이 쪼개진다 (원자력 발전)', 30, 40, { size: 24, weight: 700 });
      txt(c, '(질량 차이는 크게 부풀려 그림)', 870, 40, { size: 18, color: COL.muted, align: 'right' });
    },
  };
}

/* ── 자주 하는 오해 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '세게 비추면?', q: '빛을 아주 세게 비추면 어떤 빛으로도 전자를 떼어 낼 수 있을까?', wrong: '“빛을 아주 세게 비추면 어떤 빛으로도 전자를 떼어 낼 수 있다”', fix: '광자 하나의 에너지 hf 가 일함수보다 작으면 광자가 아무리 많아도 전자는 나오지 않는다. 세기는 광자의 개수만 바꾼다.' },
    { short: '사실은 파동?', q: '빛은 사실 파동인데 가끔 알갱이처럼 보이는 것일까?', wrong: '“빛은 사실 파동인데 가끔 알갱이처럼 보일 뿐이다”', fix: '빛은 파동이나 알갱이 어느 한쪽만으로 설명되지 않는다. 어떤 실험을 하느냐에 따라 한쪽 성질이 드러난다.' },
  ], {
    w: 820, h: 600,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        [[30, '빨간빛 · 아주 세게', 1.8, 9], [430, '자외선 · 약하게', 4, 2]].forEach(function (o, k) {
          const x = o[0], E = o[2], col = E > 3.26 ? COL.energy : eVcol(E);
          txt(c, o[1], x + 180, 50, { size: 24, weight: 700, align: 'center', color: col });
          for (let i = 0; i < o[3]; i++) { const s = (t * 0.8 + i / o[3]) % 1; photon(c, x + 40 + i * 32 * (9 / o[3]) * 0.4 + s * 120, 90 + s * 300, 120, 300, col, 34); }
          c.fillStyle = '#9AA7B4'; c.fillRect(x, 410, 360, 30);
          if (k === 1) for (let i = 0; i < 3; i++) { const s = (t * 0.7 + i / 3) % 1; dot(c, x + 120 + i * 60 + s * 40, 410 - s * 300, 8, COL.cold); }
          txt(c, k ? '전자가 곧바로 나온다' : '전자가 나오지 않는다', x + 180, 480, { size: 24, weight: 700, align: 'center', color: k ? COL.good : COL.pen });
        });
        txt(c, '광자 하나의 에너지 hf 가 일함수보다 커야 한다', 410, 560, { size: 22, weight: 700, align: 'center', color: COL.energy });
      } else {
        // 왼쪽 : 이중 슬릿 → 파동처럼 · 오른쪽 : 광전 효과 → 알갱이처럼
        c.fillStyle = COL['panel-2']; rrect(c, 20, 30, 380, 470, 16); c.fill(); rrect(c, 420, 30, 380, 470, 16); c.fill();
        txt(c, '이중 슬릿 실험', 210, 70, { size: 24, weight: 700, align: 'center' });
        c.fillStyle = COL['ink-2']; c.fillRect(120, 110, 8, 90); c.fillRect(120, 216, 8, 20); c.fillRect(120, 252, 8, 110);
        for (let y = 110; y < 360; y++) { const b = pattern((y - 236) / 125, 0); if (b > 0.02) { c.fillStyle = 'rgba(231,177,10,' + b + ')'; c.fillRect(300, y, 40, 1); } }
        txt(c, '간섭무늬 → 파동처럼', 210, 440, { size: 24, weight: 700, align: 'center', color: COL.energy });
        txt(c, '광전 효과', 610, 70, { size: 24, weight: 700, align: 'center' });
        c.fillStyle = '#9AA7B4'; c.fillRect(470, 330, 280, 24);
        for (let i = 0; i < 3; i++) { const s = (t * 0.8 + i / 3) % 1; photon(c, 500 + i * 70 + s * 60, 120 + s * 200, 60, 200, COL.energy, 32); const q = (t * 0.8 + i / 3 + 0.5) % 1; dot(c, 540 + i * 70, 330 - q * 160, 8, COL.cold); }
        txt(c, '광자 하나가 전자 하나를 → 알갱이처럼', 610, 440, { size: 22, weight: 700, align: 'center', color: COL.energy });
        txt(c, '어떤 실험을 하느냐에 따라 한쪽 성질이 드러난다', 410, 560, { size: 22, weight: 700, align: 'center', color: COL.heat });
      }
    },
  }, { label: '오해', start: 2 });
}

/* ── 스스로 점검하기 ── */
function sceneCheck(root) {
  KIT.check(root, [
    { q: '광전 효과에서 빛의 세기와 진동수는 각각 무엇을 정하는가?', a: '세기는 튀어나오는 전자의 개수를, 진동수는 전자 하나의 최대 운동 에너지를 정한다.' },
    { q: '야구공에서 물질파가 관측되지 않는 이유는?', a: '질량이 커서 물질파의 파장이 너무 짧기 때문이다.' },
    { q: '반도체가 전자 기기의 재료가 되는 이유를 띠틈으로 말하면?', a: '띠틈이 작아 열·빛·불순물로 전류가 흐르는 정도를 조절할 수 있기 때문이다.' },
  ]);
  return { tick: function () {} };
}
