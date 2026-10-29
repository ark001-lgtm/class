/* ═══════════════ 04. 천체의 운동과 중력 : 장면 ═══════════════
   케플러 법칙 → 만유인력 → 케플러 제3법칙의 비례상수(공식 유도) → 인공위성의 속력 → 주의 → 예제.
   학습지 빈칸 : ① 초점 ② 빠르다 ③ G M m / r² ④ 제곱 ⑤ 구심력 ⑥ 4π² r / T² ⑦ 4π² / G M ⑧ 질량 ⑨ √(G M / r) ⑩ 작다 ⑪ 64 ⑫ 1/2 */
const P1 = '1 케플러 법칙과 만유인력', P2 = '2 케플러 제3법칙의 비례상수';
const SCENE_LIST = [
  { id: 'kepler', part: P1, title: '케플러 법칙', ws: '학습지 1-(1) [표 1] ①②', make: sceneKepler },
  { id: 'gravity', part: P1, title: '만유인력', ws: '학습지 1-(2) ③④', make: sceneGravity },
  { id: 'k', part: P2, title: '비례상수 k 는 무엇으로 정해지는가', ws: '학습지 2-(1) ⑤~⑧', make: sceneK },
  { id: 'sat', part: P2, title: '인공위성의 속력', ws: '학습지 2-(2) ⑨⑩', make: sceneSat },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑪⑫', make: sceneEx },
];
const TAU = Math.PI * 2;
function sun(c, x, y, r) { c.fillStyle = '#F5A524'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function orbitRing(c, x, y, r) { c.strokeStyle = COL.line; c.lineWidth = 2; c.setLineDash([8, 8]); c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.setLineDash([]); }

/* ── 1-(1) 케플러 법칙 : 타원 궤도와 같은 시간 동안 쓸고 지나간 넓이 ── */
function sceneKepler(root) {
  const cv = makeCanvas(900, 620);
  let t = 0, areas = true;
  const ab = KIT.btn('같은 시간 동안의 넓이', function () { areas = !areas; ab.setAttribute('aria-pressed', String(areas)); });
  ab.setAttribute('aria-pressed', 'true');
  KIT.split(root, cv, [ab], [
    KIT.p('• 케플러는 티코 브라헤가 남긴 방대한 행성 관측 자료를 분석하여, 행성의 운동을 세 가지 법칙으로 정리하였다.', 'ws sm'),
    KIT.cap('[표 1] 케플러의 세 법칙'),
    KIT.table(['법칙', '내용', '의미'], [
      ['제1법칙 (타원 궤도)', '행성은 태양을 한 {{①|초점}}으로 하는 타원 궤도를 돈다', '원 궤도가 아니다'],
      ['제2법칙 (면적 속도 일정)', '행성과 태양을 잇는 선분이 같은 시간 동안 쓸고 지나가는 넓이는 일정하다', '태양에 가까울수록 {{②|빠르다}}'],
      ['제3법칙 (조화 법칙)', 'T^{2} = k r^{3} (r : 궤도 긴반지름)', '멀리 있는 행성일수록 주기가 길다'],
    ], { cols: ['24%', '46%', '30%'] }),
    KIT.hint('※ 케플러 법칙은 관측 자료에서 얻은 경험 법칙이었다. 왜 그런지를 설명한 것이 뉴턴의 만유인력 법칙이다. (그림의 타원은 실제보다 많이 찌그러뜨렸다)', 'font-size:23px'),
  ]);
  const a = 330, e = 0.62, b = a * Math.sqrt(1 - e * e), cx = 450, cy = 330, fx = cx + a * e, T = 12, N = 8;
  function pos(time) {
    const M = TAU * ((time / T) % 1); let E = M;
    for (let i = 0; i < 8; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    return { x: cx + a * Math.cos(E), y: cy - b * Math.sin(E) };
  }
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 620);
      if (areas) for (let k = 0; k < N; k += 2) {
        c.fillStyle = rgba(COL.energy, 0.18); c.beginPath(); c.moveTo(fx, cy);
        for (let j = 0; j <= 24; j++) { const p = pos((k + j / 24) * T / N); c.lineTo(p.x, p.y); }
        c.closePath(); c.fill();
      }
      c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, a, b, 0, 0, TAU); c.stroke();
      dot(c, cx - a * e, cy, 5, COL.muted); txt(c, '다른 초점', cx - a * e, cy + 26, { size: 18, color: COL.muted, align: 'center' });
      sun(c, fx, cy, 26); txt(c, '태양 (초점)', fx, cy + 50, { size: 20, weight: 700, align: 'center' });
      const p = pos(t), q = pos(t + 0.01), sp = Math.hypot(q.x - p.x, q.y - p.y) / 0.01;
      KIT.dash(c, fx, cy, p.x, p.y, COL.muted, 2, [5, 5]);
      dot(c, p.x, p.y, 15, COL.cold);
      KIT.vec(c, p.x, p.y, (q.x - p.x) / 0.01 * 0.5, (q.y - p.y) / 0.01 * 0.5, COL.cold, '', { width: 5, head: 16 });
      txt(c, '색칠한 조각들은 모두 같은 시간(주기의 1/8) 동안 쓸고 지나간 넓이 → 넓이가 같다', 24, 36, { size: 21, weight: 700 });
      txt(c, sp > 160 ? '태양 가까이 : 빠르다' : sp < 90 ? '태양에서 멀리 : 느리다' : '', 24, 596, { size: 26, weight: 700, color: COL.cold });
    },
  };
}

/* ── 1-(2) 만유인력 ── */
function sceneGravity(root) {
  const cv = makeCanvas(900, 520);
  const s1 = KIT.slider('m₁', 1, 4, 1, 1, function (v) { return v + ' 배'; }, '70px');
  const s2 = KIT.slider('m₂', 1, 4, 1, 1, function (v) { return v + ' 배'; }, '70px');
  const sr = KIT.slider('r', 1, 3, 0.5, 2, function (v) { return v + ' 배'; }, '70px');
  KIT.split(root, cv, [], [
    KIT.cap('(2) 만유인력'),
    KIT.p('• 질량을 가진 모든 물체 사이에는 서로 당기는 힘이 작용한다. 　F = {{③|G M m / r²}}'),
    KIT.p('• 크기는 두 물체의 질량의 곱에 비례하고, 두 물체 사이 거리의 {{④|제곱}}에 반비례한다.'),
    KIT.hint('※ 이 단원에서 인공위성과 천체의 운동은 원운동으로만 다룬다. 타원 궤도의 정량적인 계산은 하지 않는다.', 'font-size:24px'),
    KIT.callout('거리가 2배가 되면 힘은 [[1|2^{2}]] = [[1|4]] 배, 3배가 되면 [[1|9]] 배', true),
  ], { under: h('div', { class: 'col', style: 'gap:0;padding:0 22px 16px' }, s1.el, s2.el, sr.el) });
  return {
    tick: function () {
      const m1 = s1.get(), m2 = s2.get(), r = sr.get(), F = m1 * m2 / (r * r), c = cv.ctx; c.clearRect(0, 0, 900, 520);
      const gap = r * 140, x1 = 450 - gap / 2, x2 = 450 + gap / 2, y = 270, R1 = 22 + m1 * 9, R2 = 22 + m2 * 9, L = Math.min(300, 60 * F + 6);
      KIT.dash(c, x1, y + 90, x2, y + 90, COL.muted, 2, [6, 6]); txt(c, 'r', 450, y + 116, { size: 24, weight: 700, align: 'center' });
      c.fillStyle = COL.cold; c.beginPath(); c.arc(x1, y, R1, 0, TAU); c.fill();
      c.fillStyle = COL.heat; c.beginPath(); c.arc(x2, y, R2, 0, TAU); c.fill();
      // 서로 당기는 힘 : 각 물체 위에 그 물체가 받는 힘을 그린다
      KIT.vec(c, x1, y - R1 - 34, L, 0, COL.energy, 'F', { width: 7, off: 22 });
      KIT.vec(c, x2, y - R2 - 34, -L, 0, COL.energy, 'F', { width: 7, off: 22 });
      txt(c, 'm₁', x1, y, { size: 24, weight: 700, color: '#fff', align: 'center' }); txt(c, 'm₂', x2, y, { size: 24, weight: 700, color: '#fff', align: 'center' });
      txt(c, '만유인력 F = ' + KIT.fmt(F, 3) + ' 배', 30, 46, { size: 34, weight: 700, color: COL.energy });
      txt(c, '= (' + m1 + ' × ' + m2 + ') ÷ ' + r + '²', 30, 92, { size: 26, color: COL['ink-2'], mono: true });
      txt(c, '두 물체가 같은 크기로 서로 당긴다 (작용 · 반작용)', 30, 480, { size: 22, color: COL.muted });
    },
  };
}

/* ── 2-(1) 공식 유도 : 비례상수 k ── */
function sceneK(root) {
  const cv = makeCanvas(900, 520);
  const sM = KIT.slider('중심 천체 질량 M', 1, 4, 1, 1, function (v) { return v + ' 배'; }, '230px');
  let t = 0;
  const tbody = h('tbody', {});
  KIT.derive(root, {
    cv: cv, title: '비례상수 k 는 무엇으로 정해지는가',
    ctrl: [h('div', { style: 'width:100%' }, sM.el)],
    intro: '질량 M 인 중심 천체 둘레를, 질량 m 인 물체가 반지름 r 인 원 궤도를 주기 T 로 돌고 있다.',
    steps: [
      { what: '실제 궤도는 타원이지만 원으로 근사한다.', note: '행성 궤도의 이심률이 매우 작아 원에 가깝기 때문이다.' },
      { what: '중심 천체가 당기는 만유인력이 {{⑤|구심력}} 역할을 한다.', eq: '[[G M m|r^{2}]] = [[m v^{2}|r]]', note: '원운동을 유지시키는 힘은 중심 방향의 힘뿐이다.' },
      { what: 'v = 2πr / T 를 대입한다.', eq: '[[G M m|r^{2}]] = m · {{⑥|4π² r / T²}}', note: 'v² / r 에 v = 2πr/T 를 넣어 정리한 것이다.' },
      { what: '양변의 m 을 없애고 T² 에 대하여 정리한다.', eq: '∴ T^{2} = {{⑦|4π² / G M}} · r^{3}', note: 'm 이 사라지는 것이 이 유도의 핵심이다.' },
      { what: '케플러 제3법칙 T² = k r³ 과 비교한다.', eq: '∴ k = [[4π^{2}|G M]]', note: '두 식의 계수를 맞추어 읽는다.' },
    ],
    means: '비례상수 k 는 중심 천체의 {{⑧|질량}} M 에만 관계된다. 공전하는 물체의 질량 m 과는 관계가 없으므로, 태양을 도는 모든 행성은 같은 k 를 갖는다.',
  });
  return {
    tick: function (dt) {
      t += dt;
      const M = sM.get(), c = cv.ctx; c.clearRect(0, 0, 900, 520);
      const cx = 290, cy = 270;
      sun(c, cx, cy, 18 + M * 5);
      [1, 2, 3].forEach(function (r, i) {
        const R = 70 * r, T = 4 * Math.sqrt(r * r * r / M), a = TAU * t / T + i;
        orbitRing(c, cx, cy, R);
        dot(c, cx + R * Math.cos(a), cy - R * Math.sin(a), 11 + i * 3, [COL.cold, COL.work, COL.heat][i]);
      });
      txt(c, '반지름', 610, 70, { size: 22, weight: 700 }); txt(c, '주기 T', 710, 70, { size: 22, weight: 700 }); txt(c, 'T² ÷ r³', 820, 70, { size: 22, weight: 700, align: 'center' });
      [1, 2, 3].forEach(function (r, i) {
        const T = 4 * Math.sqrt(r * r * r / M), y = 120 + i * 50;
        txt(c, r + ' 칸', 610, y, { size: 24, color: [COL.cold, COL.work, COL.heat][i], weight: 700 });
        txt(c, KIT.fmt(T, 2) + ' 초', 710, y, { size: 24, mono: true });
        txt(c, KIT.fmt(T * T / (r * r * r), 2), 820, y, { size: 24, mono: true, align: 'center' });
      });
      txt(c, '같은 중심 천체 둘레에서는 T² ÷ r³ 가 모두 같다', 600, 300, { size: 21, weight: 700, color: COL.energy });
      txt(c, 'M 을 키우면 값이 작아진다 (k = 4π² / GM)', 600, 336, { size: 21, color: COL.muted });
    },
  };
}

/* ── 2-(2) 인공위성의 속력 ── */
function sceneSat(root) {
  const cv = makeCanvas(900, 640);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.cap('(2) 인공위성의 속력'),
    KIT.p('• 중력이 구심력이 되므로 [[G M m|r^{2}]] = [[m v^{2}|r]] 에서 　v = {{⑨|√(G M / r)}}'),
    KIT.p('• 따라서 궤도 반지름이 클수록 인공위성의 속력은 {{⑩|작다}}. 주기는 길어진다.'),
    KIT.callout('반지름이 4배 → 속력은 [[1|√4]] = [[1|2]] 배, 주기는 4^{3/2} = 8 배', true),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx, cx = 450, cy = 330; c.clearRect(0, 0, 900, 640);
      c.fillStyle = COL.cold; c.beginPath(); c.arc(cx, cy, 52, 0, TAU); c.fill();
      txt(c, '지구', cx, cy, { size: 24, weight: 700, color: '#fff', align: 'center' });
      [[1, COL.work], [2, COL.energy], [4, COL.heat]].forEach(function (o, i) {
        const r = o[0], R = 70 * r, v = 1 / Math.sqrt(r), w = v / r * 1.4, a = w * t + i * 2;
        orbitRing(c, cx, cy, R);
        const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
        KIT.vec(c, x, y, -Math.sin(a) * v * 110, -Math.cos(a) * v * 110, o[1], '', { width: 5, head: 16 });
        dot(c, x, y, 12, o[1]);
        txt(c, r + 'r : v = ' + KIT.fmt(v, 2) + ' 배', 30, 40 + i * 38, { size: 24, weight: 700, color: o[1] });
      });
      txt(c, '바깥 궤도일수록 느리고, 한 바퀴가 더 길다', 30, 616, { size: 22, color: COL.muted });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '무거운 행성', q: '질량이 큰 행성일수록 더 빠르게 공전한다?', wrong: '무거우면 중력을 더 세게 받으니 더 빨리 돌 것이다.',
      why: '유도 과정에서 공전하는 물체의 질량 m 이 양변에서 지워진다.', right: '공전 속력과 주기는 궤도 반지름과 중심 천체의 질량으로만 정해진다. 행성 자신의 질량과는 관계가 없다.' },
    { short: '무중력', q: '인공위성 안이 무중력 상태인 것은 중력이 0이기 때문이다?', wrong: '우주에는 중력이 없으므로 물체가 떠다닌다.',
      why: '지상 400 km 에서도 중력은 지표면의 90 % 정도로 여전히 크다. 그 중력이 전부 구심력으로 쓰이고 있다.', right: '위성과 그 안의 사람이 함께 자유 낙하하고 있어서 서로 누르는 힘이 없을 뿐이다. 중력이 사라진 것이 아니다.' },
  ], {
    w: 820, h: 600,
    draw: function (c, which, dt) {
      t += dt;
      const cx = 410, cy = 320, R = 210;
      if (which === 0) {
        sun(c, cx, cy, 34); orbitRing(c, cx, cy, R);
        const a = t * 0.6;
        dot(c, cx + R * Math.cos(a), cy - R * Math.sin(a), 12, COL.cold);
        dot(c, cx + R * Math.cos(a + Math.PI), cy - R * Math.sin(a + Math.PI), 32, COL.heat);
        txt(c, '작은 행성과 큰 행성이 같은 궤도에서 같은 빠르기로 돈다', 24, 40, { size: 22, weight: 700 });
      } else {
        c.fillStyle = COL.cold; c.beginPath(); c.arc(cx, cy + 40, 150, 0, TAU); c.fill();
        txt(c, '지구', cx, cy + 40, { size: 26, weight: 700, color: '#fff', align: 'center' });
        orbitRing(c, cx, cy + 40, 230);
        const a = t * 0.5, x = cx + 230 * Math.cos(a), y = cy + 40 - 230 * Math.sin(a);
        c.fillStyle = COL['ink-2']; c.fillRect(x - 26, y - 14, 52, 28);
        KIT.vec(c, x, y, (cx - x) * 0.35, (cy + 40 - y) * 0.35, COL.heat, '중력 (지표의 약 90 %)', { size: 20 });
        txt(c, '위성과 사람이 함께 떨어지면서 돈다 → 서로 누르지 않는다', 24, 40, { size: 22, weight: 700 });
      }
    },
  });
}

/* ── 3 예제 : 반지름 r 과 4r ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 640);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.cap('예제'),
    KIT.p('지구 중심에서 거리가 r 인 원 궤도를 도는 위성 1 과, 거리가 4r 인 원 궤도를 도는 위성 2 가 있다.', 'ws', 'font-weight:600'),
    KIT.p('(1) T^{2} ∝ r^{3} 이므로 　[[T₂^{2}|T₁^{2}]] = 4^{3} = {{⑪|64}}'),
    KIT.p('(2) 따라서 주기의 비 　[[T₂|T₁]] = {{(2)|8}} 배'),
    KIT.p('(3) v ∝ [[1|√r]] 이므로 　[[v₂|v₁]] = {{⑫|1/2}}'),
    KIT.p('(4) 위성 2 는 더 천천히, 더 오래 걸려 한 바퀴를 돈다.'),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx, cx = 410, cy = 330; c.clearRect(0, 0, 820, 640);
      c.fillStyle = COL.cold; c.beginPath(); c.arc(cx, cy, 34, 0, TAU); c.fill();
      orbitRing(c, cx, cy, 70); orbitRing(c, cx, cy, 280);
      const a1 = TAU * t / 2, a2 = TAU * t / 16;
      dot(c, cx + 70 * Math.cos(a1), cy - 70 * Math.sin(a1), 12, COL.work);
      dot(c, cx + 280 * Math.cos(a2), cy - 280 * Math.sin(a2), 14, COL.heat);
      txt(c, '위성 1 (r) : 2초에 한 바퀴', 24, 40, { size: 24, weight: 700, color: COL.work });
      txt(c, '위성 2 (4r) : 16초에 한 바퀴 (8배)', 24, 78, { size: 24, weight: 700, color: COL.heat });
    },
  };
}
