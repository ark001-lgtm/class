/* ═══════════════ 06. 일반 상대성 이론 : 장면 ═══════════════
   등가 원리(엘리베이터 사고 실험) → 휘어진 시공간 → 블랙홀이 되는 조건(공식 유도) → 중력 시간 지연 → 주의 → 예제.
   학습지 빈칸 : ① 같다 ② 가속 ③ 휘어진다 ④ 시공간 ⑤ c ⑥ 2 G M / c² ⑦ 지평선 ⑧ 느리게 ⑨ 약한 ⑩ 6 ⑪ 아니다 ⑫ 질량 */
const P1 = '1 등가 원리', P2 = '2 시공간의 휘어짐과 블랙홀', P3 = '3 중력 시간 지연';
const SCENE_LIST = [
  { id: 'equiv', part: P1, title: '등가 원리', ws: '학습지 1 ①② [표 1] ③', make: sceneEquiv },
  { id: 'curve', part: P2, title: '휘어진 시공간', ws: '학습지 2-(1) ④', make: sceneCurve },
  { id: 'bh', part: P2, title: '블랙홀이 되는 조건', ws: '학습지 2-(2) ⑤⑥⑦', make: sceneBH },
  { id: 'time', part: P3, title: '중력 시간 지연', ws: '학습지 3 ⑧⑨', make: sceneTime },
  { id: 'mis', part: P3, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '예제', title: '예제', ws: '예제 ⑩~⑫', make: sceneEx },
];
const TAU = Math.PI * 2;

/* ── 1 등가 원리 : 두 엘리베이터 ── */
function sceneEquiv(root) {
  const cv = makeCanvas(980, 560);
  let t = 0;
  KIT.split(root, cv, [KIT.btn('공을 놓고 빛을 쏘기', function () { t = 0; }, true)], [
    KIT.cap('(1) 두 가지 질량'),
    KIT.p('• 중력 질량은 중력을 받는 정도를 나타내고, 관성 질량은 힘을 받았을 때 속도가 잘 변하지 않는 정도를 나타낸다.', 'ws sm'),
    KIT.p('• 두 질량은 원리가 다르지만, 지금까지의 모든 실험에서 그 값이 {{①|같다}}는 결과가 나왔다.', 'ws sm'),
    KIT.cap('(2) 등가 원리'),
    KIT.p('• 창문 없는 상자 안의 관찰자는, 자신이 중력장에 정지해 있는지 아니면 중력이 없는 곳에서 {{②|가속}}되고 있는지 구별할 수 없다.', 'ws sm'),
    KIT.table(['상황', '지구 표면에 정지한 상자', '중력 없는 곳에서 g 로 가속되는 상자'], [
      ['물체를 놓으면', 'g 로 떨어진다', 'g 로 떨어진다'],
      ['바닥이 나를 미는 힘', 'mg', 'mg'],
      ['빛을 옆으로 쏘면', '{{③|휘어진다}}', '휘어진다'],
    ], { cols: ['30%', '34%', '36%'] }),
  ]);
  return {
    tick: function (dt) {
      t = Math.min(t + dt, 2.4);
      const c = cv.ctx; c.clearRect(0, 0, 980, 560);
      [0, 1].forEach(function (k) {
        const x0 = 40 + k * 480, y0 = 110, w = 420, hh = 340, rise = k ? 6 * Math.sin(t * 8) * 0 : 0;
        c.strokeStyle = COL['ink-2']; c.lineWidth = 5; c.strokeRect(x0, y0 + rise, w, hh);
        txt(c, k ? '우주에서 위로 g 로 가속' : '지구 표면에 정지', x0 + w / 2, 70, { size: 24, weight: 700, align: 'center' });
        if (k) { KIT.vec(c, x0 + w / 2, y0 + hh + 60, 0, -40, COL.work, '', { width: 6, head: 18 }); txt(c, '가속 g', x0 + w / 2 + 30, y0 + hh + 46, { size: 20, weight: 700, color: COL.work }); }
        else { c.fillStyle = COL.good; c.fillRect(x0 - 20, y0 + hh + 6, w + 40, 18); txt(c, '지구', x0 + w / 2, y0 + hh + 46, { size: 20, weight: 700, color: COL.good, align: 'center' }); }
        // 상자 안에서 본 공 : 같은 가속도로 바닥에 닿는다
        const by = Math.min(y0 + 60 + 0.5 * 140 * t * t, y0 + hh - 20);
        dot(c, x0 + 90, by, 18, COL.heat);
        // 빛 : 실제보다 크게 휘게 그림
        const pts = []; const tl = Math.min(t, 1.6);
        for (let i = 0; i <= 40; i++) { const s = tl * i / 40, x = x0 + 10 + s * 250, y = y0 + 100 + 40 * s * s; if (x < x0 + w - 6) pts.push([x, y]); }
        KIT.line(c, pts, '#E7B10A', 5);
        txt(c, '빛', x0 + 20, y0 + 80, { size: 20, weight: 700, color: '#C79300' });
      });
      txt(c, '두 상자 안의 관찰 결과가 완전히 같다 (빛의 휨은 크게 부풀려 그림)', 40, 530, { size: 22, weight: 700, color: COL.energy });
    },
  };
}

/* ── 2-(1) 휘어진 시공간 · 중력 렌즈 ── */
function sceneCurve(root) {
  const cv = makeCanvas(900, 620);
  const sm = KIT.slider('질량', 0, 3, 0.5, 2, function (v) { return v ? v + ' 배' : '없음'; }, '80px');
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.cap('(1) 휘어진 시공간'),
    KIT.p('• 질량이 있는 물체는 주위의 {{④|시공간}}을 휘게 한다. 일반 상대성 이론에서 중력은 잡아당기는 힘이 아니라, 휘어진 시공간을 따라 움직인 결과이다.'),
    KIT.p('• 등가 원리에 따르면 빛도 중력에 의해 휘어진다. 먼 별빛이 무거운 천체 옆을 지날 때 휘어져 보이는 현상을 중력 렌즈라고 한다.'),
    KIT.hint('그림 : 질량이 클수록 격자가 더 많이 휘고, 그 옆을 지나는 빛의 길(노랑)도 더 많이 꺾인다.'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sm.el) });
  return {
    tick: function (dt) {
      t += dt;
      const M = sm.get(), c = cv.ctx; c.clearRect(0, 0, 900, 620);
      const cx = 450, cy = 330;
      const warp = function (x, y) { const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) + 1, k = M * 2600 / (r + 60); return { x: x - dx / r * Math.min(k, r * 0.6), y: y - dy / r * Math.min(k, r * 0.6) }; };
      c.strokeStyle = COL.line; c.lineWidth = 2;
      for (let gx = 0; gx <= 900; gx += 50) { c.beginPath(); for (let gy = 20; gy <= 640; gy += 10) { const p = warp(gx, gy); if (gy === 20) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); } c.stroke(); }
      for (let gy = 20; gy <= 640; gy += 50) { c.beginPath(); for (let gx = 0; gx <= 900; gx += 10) { const p = warp(gx, gy); if (gx === 0) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); } c.stroke(); }
      if (M > 0) { c.fillStyle = '#F5A524'; c.beginPath(); c.arc(cx, cy, 20 + M * 10, 0, TAU); c.fill(); }
      // 별빛 : 위쪽을 지나는 빛이 질량 쪽으로 꺾인다
      const pts = [];
      let x = 20, y = 190, vy = 0;
      for (let i = 0; i < 180; i++) { const dx = cx - x, dy = cy - y, r2 = dx * dx + dy * dy; vy += M * 900 * dy / Math.pow(r2, 1.5) * 5; x += 5; y += vy; pts.push([x, y]); }
      KIT.line(c, pts, '#E7B10A', 5);
      dot(c, 20, 190, 9, '#E7B10A'); txt(c, '먼 별', 30, 160, { size: 20, weight: 700, color: '#C79300' });
      txt(c, M ? '빛도 휘어진 시공간을 따라 꺾인다' : '질량이 없으면 시공간이 평평하고 빛은 곧게 간다', 24, 600, { size: 22, weight: 700 });
    },
  };
}

/* ── 2-(2) 공식 유도 : 블랙홀이 되는 조건 ── */
function sceneBH(root) {
  const cv = makeCanvas(900, 520);
  const sr = KIT.slider('천체 반지름 R', 0.5, 4, 0.1, 3, function (v) { return KIT.fmt(v, 1) + ' × 슈바르츠실트 반지름'; }, '170px');
  KIT.derive(root, {
    cv: cv, title: '블랙홀이 되는 조건',
    ctrl: [h('div', { style: 'width:100%' }, sr.el)],
    intro: '앞 단원에서 구한 탈출 속도 v = √([[2 G M|R]]) 을 이용한다.',
    steps: [
      { what: '빛조차 빠져나갈 수 없으려면, 탈출 속도가 빛의 속력 {{⑤|c}} 보다 커야 한다.', note: '우주에서 가장 빠른 것이 빛이기 때문이다.' },
      { what: '경계가 되는 조건을 등호로 놓는다.', eq: '√([[2 G M|R]]) = c', note: '\'겨우 빠져나가지 못하는\' 크기를 구하는 것이다.' },
      { what: '양변을 제곱한다.', eq: '[[2 G M|R]] = c^{2}', note: '근호를 없앤다.' },
      { what: 'R 에 대하여 정리한다.', eq: '∴ R = {{⑥|2 G M / c²}}', note: '이 값을 슈바르츠실트 반지름이라 한다.' },
    ],
    means: '질량 M 인 천체가 반지름 R 보다 작게 압축되면 빛도 빠져나올 수 없는 블랙홀이 된다. 이 경계면을 사건의 {{⑦|지평선}}이라고 한다. 반지름 R 은 질량 M 에 비례한다.',
  });
  return {
    tick: function () {
      const R = sr.get(), v = Math.sqrt(1 / R), c = cv.ctx; c.clearRect(0, 0, 900, 520);
      const cx = 270, cy = 270, k = 55;
      c.strokeStyle = COL.pen; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.arc(cx, cy, k, 0, TAU); c.stroke(); c.setLineDash([]);
      txt(c, '슈바르츠실트 반지름', cx, cy - k - 18, { size: 18, weight: 700, color: COL.pen, align: 'center' });
      if (R > 1) { c.fillStyle = '#F5A524'; c.beginPath(); c.arc(cx, cy, R * k, 0, TAU); c.fill(); }
      else { c.fillStyle = '#000'; c.beginPath(); c.arc(cx, cy, k, 0, TAU); c.fill(); c.fillStyle = '#F5A524'; c.beginPath(); c.arc(cx, cy, Math.max(4, R * k), 0, TAU); c.fill(); }
      // 탈출 속도 막대와 빛의 속력
      const bx = 600, by = 440, bh = 340, sc = bh / 1.5;
      c.fillStyle = COL['panel-2']; c.fillRect(bx, by - bh, 90, bh);
      c.fillStyle = v >= 1 ? COL.pen : COL.energy; c.fillRect(bx, by - Math.min(v, 1.5) * sc, 90, Math.min(v, 1.5) * sc);
      KIT.dash(c, bx - 30, by - sc, bx + 140, by - sc, '#C79300', 3); txt(c, '빛의 속력 c', bx + 150, by - sc, { size: 22, weight: 700, color: '#C79300' });
      txt(c, '탈출 속도', bx + 45, by + 26, { size: 22, weight: 700, align: 'center' });
      txt(c, KIT.fmt(v, 2) + ' c', bx + 45, by - Math.min(v, 1.5) * sc - 20, { size: 22, weight: 700, align: 'center', mono: true });
      txt(c, R > 1 ? '빛은 빠져나올 수 있다' : '블랙홀 : 빛도 빠져나오지 못한다', 30, 44, { size: 30, weight: 700, color: R > 1 ? COL.ink : COL.pen });
    },
  };
}

/* ── 3 중력 시간 지연 : GPS ── */
function sceneTime(root) {
  const cv = makeCanvas(900, 600);
  let t = 0;
  KIT.split(root, cv, [KIT.btn('다시 맞추기', function () { t = 0; })], [
    KIT.p('• 중력이 강한 곳일수록, 즉 시공간이 많이 휘어진 곳일수록 시간이 {{⑧|느리게}} 간다.'),
    KIT.p('• GPS 위성은 지표면보다 중력이 {{⑨|약한}} 높은 곳에 있으므로, 위성의 시계가 지상의 시계보다 빠르게 간다.'),
    KIT.p('• 이 차이를 보정하지 않으면 위치 오차가 하루에 수 km 까지 쌓인다. 우리가 쓰는 내비게이션은 일반 상대성 이론을 실제로 적용한 장치이다.'),
    KIT.hint('※ 시간의 흐름 자체가 달라지는 것이므로, 더 정확한 시계를 쓴다고 해서 없앨 수 있는 오차가 아니다.'),
  ], { center: true });
  function clock(c, x, y, r, sec, color, label) {
    c.fillStyle = COL.panel; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = color; c.lineWidth = 6; c.stroke();
    const a = sec / 60 * TAU - Math.PI / 2;
    c.strokeStyle = color; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); c.stroke();
    txt(c, label, x, y + r + 30, { size: 22, weight: 700, align: 'center', color: color });
  }
  return {
    tick: function (dt) {
      t += dt * 6;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      c.fillStyle = COL.cold; c.beginPath(); c.arc(450, 760, 330, 0, TAU); c.fill();
      txt(c, '지구', 450, 520, { size: 26, weight: 700, color: '#fff', align: 'center' });
      c.fillStyle = COL['ink-2']; c.fillRect(640, 120, 50, 26); c.fillStyle = COL.energy; c.fillRect(600, 126, 34, 14); c.fillRect(696, 126, 34, 14);
      const fast = 1.06;                          // 실제 차이는 하루 약 0.00004초 : 보이도록 크게 부풀렸다
      clock(c, 665, 250, 70, t * fast, COL.energy, 'GPS 위성의 시계');
      clock(c, 230, 330, 70, t, COL.heat, '지상의 시계');
      txt(c, '위성 시계가 ' + KIT.fmt(t * (fast - 1), 1) + ' 초 앞섰다 (크게 부풀림)', 30, 44, { size: 26, weight: 700, color: COL.energy });
      txt(c, '실제로는 하루에 약 100만분의 38초', 30, 84, { size: 22, color: COL.muted });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0, bh = false;
  const tog = KIT.btn('태양 ↔ 같은 질량의 블랙홀', function () { bh = !bh; tog.setAttribute('aria-pressed', String(bh)); });
  tog.setAttribute('aria-pressed', 'false');
  return KIT.mis(root, [
    { short: '모두 빨아들인다?', q: '블랙홀은 주변의 모든 것을 빨아들인다?', wrong: '블랙홀 근처에 가면 무엇이든 빨려 들어간다.',
      why: '블랙홀도 질량 M 을 가진 천체이므로, 멀리서 받는 중력은 만유인력 법칙 그대로 다른 천체와 똑같다.', right: '태양이 같은 질량의 블랙홀로 바뀌어도 지구의 궤도는 변하지 않는다. 사건의 지평선 안쪽으로 들어갈 때만 빠져나올 수 없다.' },
    { short: '시계 고장?', q: '중력 시간 지연은 시계가 고장 나서 생기는 착시이다?', wrong: '중력 때문에 시계 부품이 눌려 느려지는 것이다.',
      why: '기계식이든 원자시계든 종류에 관계없이 똑같은 비율로 느려진다.', right: '느려지는 것은 시계가 아니라 시간 자체이다. 그 위치에서 일어나는 모든 현상이 함께 느려진다.' },
  ], {
    w: 820, h: 560,
    ctrl: function (which) { return which === 0 ? [tog] : []; },
    draw: function (c, which, dt) {
      t += dt;
      const cx = 410, cy = 290;
      if (which === 0) {
        if (bh) { c.fillStyle = '#000'; c.beginPath(); c.arc(cx, cy, 8, 0, TAU); c.fill(); txt(c, '블랙홀 (반지름 약 3 km)', cx, cy + 40, { size: 20, weight: 700, align: 'center' }); }
        else { c.fillStyle = '#F5A524'; c.beginPath(); c.arc(cx, cy, 40, 0, TAU); c.fill(); txt(c, '태양', cx, cy, { size: 22, weight: 700, align: 'center' }); }
        c.strokeStyle = COL.line; c.lineWidth = 2; c.setLineDash([8, 8]); c.beginPath(); c.arc(cx, cy, 220, 0, TAU); c.stroke(); c.setLineDash([]);
        const a = t * 0.6; dot(c, cx + 220 * Math.cos(a), cy - 220 * Math.sin(a), 13, COL.cold);
        txt(c, '지구의 궤도는 그대로', 24, 40, { size: 26, weight: 700, color: COL.energy });
      } else {
        [[200, '진자 시계'], [600, '원자시계']].forEach(function (o) {
          const sw = Math.sin(t * 1.2) * 0.5, x = o[0];
          c.strokeStyle = COL['ink-2']; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 130); c.lineTo(x + Math.sin(sw) * 180, 130 + Math.cos(sw) * 180); c.stroke();
          dot(c, x + Math.sin(sw) * 180, 130 + Math.cos(sw) * 180, 22, COL.energy);
          txt(c, o[1], x, 380, { size: 24, weight: 700, align: 'center' });
        });
        txt(c, '강한 중력 아래에서는 어떤 시계든 똑같은 비율로 느려진다', 24, 40, { size: 22, weight: 700, color: COL.energy });
        txt(c, '느려지는 것은 시간 자체', 24, 520, { size: 26, weight: 700, color: COL.heat });
      }
    },
  });
}

/* ── 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 560);
  let show = false;
  const btn = KIT.btn('답 그림 보기', function () { show = !show; btn.setAttribute('aria-pressed', String(show)); });
  btn.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [btn], [
    KIT.cap('예제'),
    KIT.p('슈바르츠실트 반지름 R = [[2 G M|c^{2}]] 을 이용하여 답하시오. (태양의 슈바르츠실트 반지름은 약 3 km)', 'ws sm', 'font-weight:600'),
    KIT.p('(1) R 은 질량 M 에 비례하므로, 질량이 태양의 2배인 천체의 R 은 약 {{⑩|6}} km'),
    KIT.p('(2) 질량이 태양의 10배인 천체의 R 은 약 {{(2)|30}} km'),
    KIT.p('(3) 같은 질량이라도 반지름이 R 보다 크면 블랙홀이 {{⑪|아니다}}'),
    KIT.p('(4) 지구를 반지름 약 9 mm 로 압축하면 블랙홀이 된다. 이는 지구의 {{⑫|질량}}이 작기 때문이다.'),
  ], { center: true });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 820, 560);
      txt(c, '질량에 비례하는 슈바르츠실트 반지름', 30, 44, { size: 26, weight: 700 });
      [['태양', 1, 3], ['태양 × 2', 2, 6], ['태양 × 10', 10, 30]].forEach(function (o, i) {
        const y = 140 + i * 110, w = o[1] * 46;
        txt(c, o[0], 30, y, { size: 24, weight: 700 });
        c.fillStyle = COL['ink-2']; c.fillRect(190, y - 18, w, 36);
        txt(c, show || i === 0 ? '≈ ' + o[2] + ' km' : '?', 200 + w, y, { size: 24, weight: 700, color: COL.energy });
      });
      txt(c, '지구 : 약 9 mm (질량이 태양의 약 33만분의 1)', 30, 500, { size: 22, color: COL.muted });
    },
  };
}
