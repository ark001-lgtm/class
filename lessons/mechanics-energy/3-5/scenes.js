/* ═══════════════ 05. 정상파 : 장면 ═══════════════
   정상파가 만들어지는 과정 → 양 끝이 고정된 현(공식 유도) → 악기의 원리(현악기 · 개관 · 폐관) → 주의 → 예제.
   학습지 빈칸 : ① 반사파 ② 배 ③ 마디 ④ 2L / n ⑤ 정수 ⑥ 높아진다 ⑦ 배 ⑧ 홀수 ⑨ 1 ⑩ 0.5 ⑪ 800 ⑫ 2 */
const P1 = '1 정상파', P2 = '2 악기의 원리';
const SCENE_LIST = [
  { id: 'standing', part: P1, title: '정상파가 만들어지는 과정', ws: '학습지 1-(1) ①②', make: sceneStanding },
  { id: 'string', part: P1, title: '양 끝이 고정된 현', ws: '학습지 1-(2) ③④⑤', make: sceneString },
  { id: 'inst', part: P2, title: '현악기와 관악기', ws: '학습지 2 [표 1] ⑥ · ⑦⑧', make: sceneInst },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑨~⑫', make: sceneEx },
];
const TAU = Math.PI * 2;
function curve(c, x0, x1, fn, color, w, dash) {
  c.strokeStyle = color; c.lineWidth = w || 4; if (dash) c.setLineDash(dash);
  c.beginPath(); for (let x = x0; x <= x1; x += 3) { const y = fn(x); if (x === x0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); c.setLineDash([]);
}
/** 양 끝이 고정된 현의 n 번째 정상파 : x0 ~ x1 사이, 진폭 amp, 시각 ph */
function stringMode(c, x0, x1, y, n, amp, ph, color) {
  const L = x1 - x0;
  for (let k = -1; k <= 1; k += 2) curve(c, x0, x1, function (x) { return y - k * amp * Math.sin(n * Math.PI * (x - x0) / L); }, rgba(COL.muted, 0.35), 2, [6, 6]);
  curve(c, x0, x1, function (x) { return y - amp * Math.sin(n * Math.PI * (x - x0) / L) * Math.cos(ph); }, color || COL.cold, 5);
  for (let i = 0; i <= n; i++) dot(c, x0 + L * i / n, y, 8, COL.pen);
  c.fillStyle = COL['ink-2']; c.fillRect(x0 - 12, y - 50, 12, 100); c.fillRect(x1, y - 50, 12, 100);
}

/* ── 1-(1) 정상파가 만들어지는 과정 ── */
function sceneStanding(root) {
  const cv = makeCanvas(900, 600);
  let t = 0, run = true;
  const pb = KIT.btn('멈춤', function () { run = !run; pb.textContent = run ? '멈춤' : '움직이기'; });
  KIT.split(root, cv, [pb], [
    KIT.p('• 파장과 진폭이 같고 방향이 반대인 두 파동이 겹치면, 앞으로 나아가지 않고 제자리에서 진동만 하는 파동이 생긴다. 이를 정상파라 한다.'),
    KIT.p('• 보통은 진행파와, 끝에서 되돌아온 {{①|반사파}}가 겹쳐서 만들어진다.'),
    KIT.p('• 진폭이 항상 0 인 지점을 마디, 진폭이 가장 큰 지점을 {{②|배}}라고 한다.'),
    KIT.p('• 이웃한 마디 사이의 거리는 반 파장, 즉 [[λ|2]] 이다.'),
  ]);
  return {
    tick: function (dt) {
      if (run) t += dt;
      const c = cv.ctx, x0 = 60, x1 = 840, lam = 260, k = TAU / lam, w = 2.4; c.clearRect(0, 0, 900, 600);
      const right = function (x) { return 50 * Math.sin(k * x - w * t); }, left = function (x) { return 50 * Math.sin(k * x + w * t); };
      [['오른쪽으로 가는 파동', 120, right, COL.cold], ['왼쪽으로 가는 파동 (반사파)', 270, left, COL.heat]].forEach(function (r) {
        txt(c, r[0], x0, r[1] - 66, { size: 22, weight: 700, color: r[3] });
        c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, r[1]); c.lineTo(x1, r[1]); c.stroke();
        curve(c, x0, x1, function (x) { return r[1] - r[2](x); }, r[3], 4);
      });
      const y = 460;
      txt(c, '둘을 더하면 : 정상파', x0, y - 100, { size: 22, weight: 700, color: COL.energy });
      c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
      curve(c, x0, x1, function (x) { return y - right(x) - left(x); }, COL.energy, 6);
      for (let x = 0; x <= x1; x += lam / 2) if (x >= x0) { dot(c, x, y, 9, COL.pen); }
      for (let x = lam / 4; x <= x1; x += lam / 2) if (x >= x0) { KIT.dash(c, x, y - 100, x, y + 100, rgba(COL.good, 0.6), 2, [4, 6]); }
      txt(c, '빨간 점 : 마디 (늘 0) · 초록 점선 : 배 (가장 크게 흔들림)', x0, 580, { size: 20, weight: 700 });
    },
  };
}

/* ── 1-(2) 공식 유도 : 양 끝이 고정된 현 ── */
function sceneString(root) {
  let n = 1, t = 0;
  const cv = makeCanvas(900, 470);
  const seg = KIT.seg(['n = 1', 'n = 2', 'n = 3', 'n = 4'], 0, function (i) { n = i + 1; }, true);
  KIT.derive(root, {
    cv: cv, title: '양 끝이 고정된 현',
    ctrl: [seg.el],
    intro: '길이가 L 이고 양 끝이 팽팽하게 고정된 현을 튕긴다. 현에서 파동의 속력은 v 이다.',
    steps: [
      { what: '양 끝은 움직일 수 없으므로 반드시 {{③|마디}}가 되어야 한다.', note: '고정된 지점은 진동할 수 없기 때문이다.' },
      { what: '마디 사이 간격은 λ/2 이므로, 현의 길이는 그 정수배여야 한다.', eq: 'L = n · [[λ|2]] (n = 1, 2, 3, …)', note: '양 끝이 모두 마디인 모양만 만들어질 수 있다.' },
      { what: '파장에 대하여 정리한다.', eq: '∴ λ = {{④|2L / n}}', note: 'n 이 커질수록 파장이 짧아진다.' },
      { what: 'v = f λ 에 대입한다.', eq: '∴ f = n [[v|2L]]', note: '낼 수 있는 진동수가 띄엄띄엄 정해진다.' },
    ],
    means: '현이 낼 수 있는 진동수는 아무 값이나 되는 것이 아니라, 기본 진동수 [[v|2L]] 의 {{⑤|정수}}배만 가능하다. n = 1 을 기본 진동, n = 2 이상을 배진동이라 한다.',
  });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 470);
      stringMode(c, 80, 820, 220, n, 90, t * (3 + n), COL.cold);
      arrow(c, 80, 370, 820, 370, { width: 3, color: COL['ink-2'], head: 14 }); arrow(c, 820, 370, 80, 370, { width: 3, color: COL['ink-2'], head: 14 });
      txt(c, 'L', 450, 396, { size: 24, weight: 700, align: 'center' });
      txt(c, 'λ = 2L ÷ ' + n + ' · f = ' + n + ' × (v ÷ 2L)', 30, 44, { size: 28, weight: 700, color: COL.energy, mono: true });
      txt(c, n === 1 ? '기본 진동' : n + '배 진동', 30, 88, { size: 24, weight: 700 });
      txt(c, '마디 ' + (n + 1) + '개 (빨간 점)', 870, 88, { size: 22, color: COL.pen, weight: 700, align: 'right' });
    },
  };
}

/* ── 2 악기의 원리 ── */
function sceneInst(root) {
  let mode = 0, n = 1, t = 0;
  const cv = makeCanvas(900, 560);
  const sL = KIT.slider('현의 길이', 0.4, 1, 0.05, 1, function (v) { return Math.round(v * 100) + ' %'; }, '120px');
  const under = h('div', { style: 'padding:0 22px 16px' }, sL.el);
  const nSeg = KIT.seg(['기본', '다음', '그다음'], 0, function (i) { n = i; }, true);
  const seg = KIT.seg(['현악기', '개관 (양쪽 열림)', '폐관 (한쪽 막힘)'], 0, function (i) { mode = i; under.hidden = i !== 0; }, true);
  KIT.split(root, cv, [seg.el, nSeg.el], [
    KIT.cap('(1) 현악기 · [표 1] 음 높이를 바꾸는 방법'),
    KIT.table(['바꾸는 것', '진동수 변화', '연주에서의 예'], [
      ['현의 길이 L 을 짧게', '{{⑥|높아진다}}', '기타 프렛을 손가락으로 짚는다'],
      ['현을 팽팽하게 (v 증가)', '높아진다', '줄감개를 돌려 조율한다'],
      ['더 굵은 현 (v 감소)', '낮아진다', '저음 현은 굵게 만든다'],
    ], { cols: ['36%', '22%', '42%'] }),
    KIT.cap('(2) 관악기'),
    KIT.p('• 관 속 공기 기둥에도 정상파가 생긴다. 막힌 끝은 마디, 열린 끝은 {{⑦|배}}가 된다.', 'ws sm'),
    KIT.p('• 양쪽이 열린 관(개관)은 L = n [[λ|2]] 이므로 현과 같은 조건이 된다.', 'ws sm'),
    KIT.p('• 한쪽이 막힌 관(폐관)은 L = n [[λ|4]] 이고, n 이 {{⑧|홀수}}인 경우만 가능하다.', 'ws sm'),
    KIT.p('• 관의 구멍을 열고 막는 것은 공기 기둥의 길이를 바꾸어 음 높이를 조절하는 것이다.', 'ws sm'),
  ], { under: under });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      if (mode === 0) {
        const L = sL.get(), x0 = 80, x1 = 80 + 740 * L, m = n + 1;
        stringMode(c, x0, x1, 260, m, 70, t * 5, COL.cold);
        if (L < 1) { c.fillStyle = rgba(COL.muted, 0.3); c.fillRect(x1 + 12, 255, 820 - x1, 10); txt(c, '손가락으로 짚음', x1 + 20, 220, { size: 20, weight: 700 }); }
        txt(c, '진동수 = 처음의 ' + KIT.fmt(m / L, 2) + ' 배', 30, 44, { size: 28, weight: 700, color: COL.energy });
        txt(c, '현이 짧아지면 파장이 짧아져 진동수가 높아진다 (v 는 그대로)', 30, 520, { size: 22, color: COL.muted });
      } else {
        // 관 속 공기의 흔들림(변위)을 띠로 : 열린 끝은 배, 막힌 끝은 마디
        const closed = mode === 2, m = closed ? 2 * n + 1 : n + 1, x0 = 100, x1 = 800, y = 270, L = x1 - x0;
        c.strokeStyle = COL['ink-2']; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y - 90); c.lineTo(x1, y - 90); c.moveTo(x0, y + 90); c.lineTo(x1, y + 90); c.stroke();
        if (closed) { c.fillStyle = COL['ink-2']; c.fillRect(x1, y - 96, 16, 192); }
        const amp = function (x) { const u = (x - x0) / L; return closed ? Math.cos(m * Math.PI * u / 2) : Math.cos(m * Math.PI * u); };
        for (let k = -1; k <= 1; k += 2) curve(c, x0, x1, function (x) { return y - k * 70 * amp(x) * Math.cos(t * 5); }, COL.cold, 4);
        txt(c, closed ? '폐관 : 막힌 끝 마디 · 열린 끝 배 → L = ' + m + ' × λ/4' : '개관 : 양쪽 끝 모두 배 → L = ' + m + ' × λ/2', 30, 44, { size: 24, weight: 700, color: COL.energy });
        txt(c, '열린 끝', x0, y + 130, { size: 20, weight: 700, align: 'center' }); txt(c, closed ? '막힌 끝' : '열린 끝', x1, y + 130, { size: 20, weight: 700, align: 'center' });
        if (closed) txt(c, '가능한 n : 1, 3, 5, … (홀수)', 30, 520, { size: 22, weight: 700, color: COL.heat });
      }
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '에너지 전달?', q: '정상파도 파동이니까 에너지가 앞으로 전달된다?', wrong: '파동이라고 했으니 어딘가로 나아갈 것이다.',
      why: '정상파는 반대 방향으로 가는 두 파동이 겹친 것이라, 두 방향의 에너지 흐름이 서로 상쇄된다.', right: '정상파는 제자리에서 진동만 하고 에너지를 한쪽으로 실어 나르지 않는다. 그래서 마디의 위치가 움직이지 않는다.' },
    { short: '짧게 잡으면', q: '현을 짧게 잡으면 파동의 속력이 빨라져 소리가 높아진다?', wrong: '짧아지면 빨리 왕복하니 속력이 커진 것이다.',
      why: '현에서 파동의 속력 v 는 현의 장력과 굵기로 정해지며, 길이를 바꾸어도 변하지 않는다.', right: '길이를 줄이면 v 는 그대로인 채 파장 λ = 2L 이 짧아진다. v = fλ 에서 λ 가 줄었으니 f 가 커진 것이다.' },
  ], {
    w: 860, h: 520,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        stringMode(c, 80, 780, 260, 3, 90, t * 4, COL.energy);
        txt(c, '마디(빨간 점)는 제자리에 머문다 → 나아가는 것이 없다', 30, 44, { size: 22, weight: 700 });
      } else {
        stringMode(c, 80, 780, 170, 1, 60, t * 4, COL.cold);
        stringMode(c, 80, 430, 380, 1, 60, t * 8, COL.heat);
        txt(c, '긴 현 : λ = 2L', 80, 80, { size: 22, weight: 700, color: COL.cold });
        txt(c, '반으로 짧게 : λ 가 반 → f 는 2배 (v 는 그대로)', 80, 300, { size: 22, weight: 700, color: COL.heat });
      }
    },
  });
}

/* ── 3 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 520);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.cap('예제'),
    KIT.p('길이 0.5 m 인 기타 줄에서 파동의 속력이 400 m/s 이다.', 'ws', 'font-weight:600'),
    KIT.p('(1) 기본 진동(n = 1)의 파장 　λ = 2L = {{⑨|1}} m', 'ws sm'),
    KIT.p('(2) 기본 진동수 　f = [[v|λ]] = [[400|1]] = {{(2)|400}} Hz', 'ws sm'),
    KIT.p('(3) 2배 진동(n = 2)의 파장 　λ = [[2L|2]] = {{⑩|0.5}} m', 'ws sm'),
    KIT.p('(4) 2배 진동수 　f = 2 × 400 = {{⑪|800}} Hz', 'ws sm'),
    KIT.p('(5) 줄을 손가락으로 짚어 길이를 0.25 m 로 줄이면 기본 진동수는 {{⑫|2}} 배가 된다.', 'ws sm'),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 820, 520);
      stringMode(c, 80, 740, 150, 1, 60, t * 4, COL.cold);
      stringMode(c, 80, 740, 360, 2, 60, t * 8, COL.heat);
      txt(c, 'n = 1 : λ = 1 m', 80, 60, { size: 22, weight: 700, color: COL.cold });
      txt(c, 'n = 2 : λ = 0.5 m', 80, 270, { size: 22, weight: 700, color: COL.heat });
      txt(c, 'L = 0.5 m · v = 400 m/s', 520, 480, { size: 22, weight: 700 });
    },
  };
}
