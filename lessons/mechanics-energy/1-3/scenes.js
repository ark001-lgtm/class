/* ═══════════════ 03. 원운동 : 장면 ═══════════════
   등속 원운동 → 구심 가속도 공식 유도 → 구심력의 정체 → 주의 → 예제.
   학습지 빈칸 : ① 방향 ② 가속도 ③ 2π / T ④ rω ⑤ v Δθ ⑥ v² / r ⑦ m v² / r ⑧ 중심 ⑨ 속력 ⑩ 장력 ⑪ 중력 ⑫ 4 ⑬ 2π */
const P1 = '1 등속 원운동', P2 = '2 구심 가속도와 구심력';
const SCENE_LIST = [
  { id: 'uniform', part: P1, title: '등속 원운동', ws: '학습지 1 ①~④', make: sceneUniform },
  { id: 'accel', part: P2, title: '등속 원운동의 가속도', ws: '학습지 2-(1) ⑤~⑨', make: sceneAccel },
  { id: 'role', part: P2, title: '구심력의 정체', ws: '학습지 2-(2) [표 1] ⑩⑪', make: sceneRole },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑫⑬', make: sceneEx },
];
const DEG = Math.PI / 180, TAU = Math.PI * 2;

/* ── 1 등속 원운동 ── */
function sceneUniform(root) {
  const cv = makeCanvas(900, 600);
  const sr = KIT.slider('반지름 r', 1, 4, 0.5, 3, function (v) { return v + ' m'; }, '150px');
  const sT = KIT.slider('주기 T', 1, 6, 0.5, 4, function (v) { return v + ' s'; }, '150px');
  let ang = 0, trail = true;
  const tb = KIT.btn('지나온 속도 화살표', function () { trail = !trail; tb.setAttribute('aria-pressed', String(trail)); });
  tb.setAttribute('aria-pressed', 'true');
  KIT.split(root, cv, [tb], [
    KIT.cap('(1) 속력은 일정한데 속도는 변한다'),
    KIT.p('• 등속 원운동은 원 궤도를 따라 일정한 속력으로 도는 운동이다. 속도의 크기는 일정하지만 {{①|방향}}이 계속 변한다.', 'ws sm'),
    KIT.p('• 속도는 벡터이므로 방향이 변하면 속도가 변한 것이다. 따라서 등속 원운동에도 {{②|가속도}}가 있다.', 'ws sm'),
    KIT.p('• 속도의 방향은 항상 원의 접선 방향이다.', 'ws sm'),
    KIT.cap('(2) 원운동을 나타내는 양'),
    KIT.p('• 주기 T : 한 바퀴 도는 데 걸리는 시간. 　각속도 ω = {{③|2π / T}} (단위 rad/s)', 'ws sm'),
    KIT.p('• 한 바퀴 도는 동안 이동 거리는 2πr 이므로 　v = [[2πr|T]] = {{④|rω}}', 'ws sm'),
  ], { under: h('div', { class: 'col', style: 'gap:0;padding:0 22px 16px' }, sr.el, sT.el) });
  return {
    tick: function (dt) {
      const r = sr.get(), T = sT.get(), w = TAU / T, v = r * w, k = 62, R = r * k, cx = 450, cy = 330;
      ang += w * dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      c.strokeStyle = COL.line; c.lineWidth = 3; c.setLineDash([10, 8]); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.setLineDash([]);
      dot(c, cx, cy, 7, COL.ink);
      if (trail) for (let i = 1; i <= 6; i++) {
        const a = ang - i * 0.5, x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
        KIT.vec(c, x, y, -Math.sin(a) * v * 26, -Math.cos(a) * v * 26, rgba(COL.cold, 0.25 + 0.05 * (6 - i)), '', { width: 4, head: 14 });
      }
      const x = cx + R * Math.cos(ang), y = cy - R * Math.sin(ang);
      KIT.dash(c, cx, cy, x, y, COL.muted, 2, [6, 6]);
      KIT.vec(c, x, y, -Math.sin(ang) * v * 26, -Math.cos(ang) * v * 26, COL.cold, 'v (접선)', { size: 22 });
      KIT.vec(c, x, y, (cx - x) * 0.45, (cy - y) * 0.45, COL.heat, 'a', { size: 24 });
      dot(c, x, y, 16, COL.energy);
      txt(c, 'ω = 2π ÷ ' + T + ' = ' + KIT.fmt(w, 2) + ' rad/s', 30, 40, { size: 26, weight: 700, mono: true });
      txt(c, 'v = rω = ' + KIT.fmt(v, 2) + ' m/s', 30, 80, { size: 26, weight: 700, color: COL.cold, mono: true });
      txt(c, '속력은 그대로 · 방향만 바뀐다', 870, 40, { size: 22, weight: 700, color: COL.muted, align: 'right' });
    },
  };
}

/* ── 2-(1) 공식 유도 : 구심 가속도 ── */
function sceneAccel(root) {
  const cv = makeCanvas(900, 540);
  const sd = KIT.slider('Δθ', 5, 60, 5, 30, function (v) { return v + '°'; }, '70px');
  KIT.derive(root, {
    cv: cv, title: '등속 원운동의 가속도', cols: 2,
    ctrl: [h('div', { style: 'width:100%' }, sd.el)],
    intro: '반지름 r 인 원 궤도를 속력 v 로 도는 질량 m 인 물체를 생각하자.',
    steps: [
      { what: '아주 짧은 시간 Δt 동안 물체는 각 Δθ = ωΔt 만큼 회전한다.', note: 'Δt 가 매우 짧으면 그 동안의 평균 가속도를 순간 가속도로 볼 수 있다.' },
      { what: '속도는 항상 접선 방향이므로, 속도 벡터도 같은 각 Δθ 만큼 회전한다.', note: '위치가 도는 만큼 접선 방향도 함께 돈다.' },
      { what: '크기 v 인 벡터를 Δθ 만큼 돌렸을 때 변화량의 크기', eq: 'Δv = {{⑤|v Δθ}}', note: 'Δθ 가 매우 작을 때 호의 길이로 근사한 것이다.' },
      { what: '가속도는 단위 시간당 속도의 변화량이다.', eq: 'a = [[Δv|Δt]] = [[v Δθ|Δt]] = v ω' },
      { what: 'v = rω 를 대입하여 정리한다.', eq: '∴ a = {{⑥|v² / r}} = r ω^{2}', note: 'ω = v/r 을 넣으면 v 만으로 쓸 수 있다.' },
      { what: '뉴턴 운동 제2법칙을 적용한다.', eq: '∴ F = m a = {{⑦|m v² / r}}', note: '가속도가 있으면 반드시 그 방향으로 알짜힘이 있다.' },
    ],
    means: '이 가속도와 힘의 방향은 항상 원의 {{⑧|중심}}을 향한다. 그래서 구심 가속도, 구심력이라고 한다. 구심력은 운동 방향에 수직이므로 {{⑨|속력}}은 바꾸지 못하고 방향만 바꾼다.',
  });
  return {
    tick: function () {
      const d = sd.get() * DEG, c = cv.ctx; c.clearRect(0, 0, 900, 540);
      const cx = 260, cy = 290, R = 190, a1 = Math.PI / 2 + d / 2, a2 = Math.PI / 2 - d / 2, L = 150;
      c.strokeStyle = COL.line; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
      const p1 = { x: cx + R * Math.cos(a1), y: cy - R * Math.sin(a1) }, p2 = { x: cx + R * Math.cos(a2), y: cy - R * Math.sin(a2) };
      KIT.dash(c, cx, cy, p1.x, p1.y, COL.muted, 2, [6, 6]); KIT.dash(c, cx, cy, p2.x, p2.y, COL.muted, 2, [6, 6]);
      c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 50, -a1, -a2); c.stroke();
      txt(c, 'Δθ', cx, cy - 72, { size: 24, weight: 700, align: 'center' });
      const v1 = { x: -Math.sin(a1) * L, y: -Math.cos(a1) * L }, v2 = { x: -Math.sin(a2) * L, y: -Math.cos(a2) * L };
      KIT.vec(c, p1.x, p1.y, v1.x, v1.y, COL.cold, 'v₁', { size: 24 });
      KIT.vec(c, p2.x, p2.y, v2.x, v2.y, COL.work, 'v₂', { size: 24 });
      dot(c, p1.x, p1.y, 12, COL.energy); dot(c, p2.x, p2.y, 12, COL.energy);
      // 두 속도를 꼬리끼리 모으면 Δv 는 중심 쪽(아래)을 향한다
      const ox = 680, oy = 180;
      txt(c, '꼬리를 모으면', ox, 50, { size: 24, weight: 700, align: 'center' });
      KIT.vec(c, ox, oy, v1.x, v1.y, COL.cold, 'v₁', { size: 22 });
      KIT.vec(c, ox, oy, v2.x, v2.y, COL.work, 'v₂', { size: 22 });
      KIT.vec(c, ox + v1.x, oy + v1.y, v2.x - v1.x, v2.y - v1.y, COL.heat, 'Δv', { size: 24, width: 6 });
      txt(c, 'Δv ≈ v Δθ, 중심 쪽', ox, 330, { size: 24, weight: 700, color: COL.heat, align: 'center' });
      arrow(c, ox, 360, ox, 440, { width: 6, color: COL.heat, head: 20 });
      txt(c, 'Δθ 를 작게 할수록 Δv 는 정확히 중심을 향한다', 30, 515, { size: 22, color: COL.muted });
    },
  };
}

/* ── 2-(2) 구심력의 정체 ── */
function sceneRole(root) {
  let mode = 0, ang = 0, cut = -1, fly = 0;
  const cv = makeCanvas(900, 600);
  const cutBtn = KIT.btn('실 끊기', function () { if (mode === 0 && cut < 0) { cut = ang; fly = 0; } });
  const seg = KIT.seg(['실에 매단 공', '인공위성', '곡선 도로'], 0, function (i) { mode = i; cut = -1; cutBtn.hidden = i !== 0; }, false);
  KIT.split(root, cv, [seg.el, cutBtn], [
    KIT.callout('※ 구심력은 새로운 종류의 힘이 아니다. 이미 배운 힘들이 상황에 따라 구심력 역할을 맡는 것이다.', false, 'font-size:27px'),
    KIT.cap('[표 1] 여러 가지 원운동에서 구심력 역할을 하는 힘'),
    KIT.table(['상황', '구심력 역할을 하는 힘', '비고'], [
      ['실에 매달아 돌리는 공', '{{⑩|장력}}', '실이 끊어지면 접선 방향으로 날아간다'],
      ['지구를 도는 인공위성', '{{⑪|중력}}', '궤도 반지름이 클수록 속력이 작다'],
      ['곡선 도로를 도는 자동차', '마찰력', '빙판에서는 마찰력이 작아 미끄러진다'],
    ], { cols: ['30%', '28%', '42%'], big: true }),
  ]);
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const cx = 450, cy = 320;
      if (mode === 0) {
        const R = 200, w = 2.2;
        if (cut < 0) ang += w * dt; else fly += dt;
        const a = cut < 0 ? ang : cut, x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
        c.strokeStyle = COL.line; c.lineWidth = 2; c.setLineDash([8, 8]); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.setLineDash([]);
        dot(c, cx, cy, 12, COL['ink-2']);
        if (cut < 0) {
          c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke();
          KIT.vec(c, x, y, (cx - x) * 0.4, (cy - y) * 0.4, COL.heat, '장력', { size: 24 });
          dot(c, x, y, 18, COL.energy);
          txt(c, '실이 당기는 힘(장력)이 구심력', 30, 44, { size: 26, weight: 700 });
        } else {
          const vx = -Math.sin(a) * R * w, vy = -Math.cos(a) * R * w, bx = x + vx * fly, by = y + vy * fly;
          KIT.dash(c, x, y, x + vx * 3, y + vy * 3, COL.cold, 3);
          dot(c, bx, by, 18, COL.energy);
          txt(c, '실이 끊어지면 그 순간의 접선 방향으로 곧게 날아간다', 30, 44, { size: 26, weight: 700, color: COL.cold });
          if (fly > 2.2) cut = -1;
        }
      } else if (mode === 1) {
        const R = 210, w = 0.9; ang += w * dt;
        c.fillStyle = COL.cold; c.beginPath(); c.arc(cx, cy, 80, 0, TAU); c.fill();
        txt(c, '지구', cx, cy, { size: 28, weight: 700, color: '#fff', align: 'center' });
        c.strokeStyle = COL.line; c.lineWidth = 2; c.setLineDash([8, 8]); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.setLineDash([]);
        const x = cx + R * Math.cos(ang), y = cy - R * Math.sin(ang);
        KIT.vec(c, x, y, (cx - x) * 0.4, (cy - y) * 0.4, COL.heat, '중력', { size: 24 });
        c.fillStyle = COL['ink-2']; c.fillRect(x - 14, y - 10, 28, 20); c.fillStyle = COL.energy; c.fillRect(x - 40, y - 5, 22, 10); c.fillRect(x + 18, y - 5, 22, 10);
        txt(c, '지구가 당기는 중력이 구심력', 30, 44, { size: 26, weight: 700 });
      } else {
        // 위에서 본 곡선 도로
        const R = 220, w = 1.1; ang += w * dt;
        c.strokeStyle = COL.line; c.lineWidth = 70; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
        c.strokeStyle = COL.panel; c.lineWidth = 3; c.setLineDash([20, 18]); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.setLineDash([]);
        const x = cx + R * Math.cos(ang), y = cy - R * Math.sin(ang);
        c.save(); c.translate(x, y); c.rotate(-ang); c.fillStyle = COL.energy; rrect(c, -22, -36, 44, 72, 10); c.fill(); c.restore();
        KIT.vec(c, x, y, (cx - x) * 0.45, (cy - y) * 0.45, COL.heat, '마찰력', { size: 24 });
        txt(c, '위에서 본 곡선 도로 : 바퀴와 도로 사이의 마찰력이 구심력', 30, 44, { size: 24, weight: 700 });
      }
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '원심력?', q: '원운동 하는 물체는 바깥으로 밀어내는 힘(원심력)을 받는다?', wrong: '회전하는 놀이기구에서 몸이 바깥으로 쏠리는 것은 바깥 방향의 힘 때문이다.',
      why: '지면에서 보면 물체에 작용하는 알짜힘은 중심 방향뿐이다. 바깥으로 쏠리는 느낌은 직선으로 가려는 관성 때문이다.', right: '실제로 작용하는 힘은 중심 방향의 구심력이다. 구심력이 사라지면 물체는 바깥이 아니라 그 순간의 접선 방향으로 나아간다.' },
    { short: '가속도 0?', q: '등속 원운동은 속력이 일정하므로 가속도가 0이다?', wrong: '\'등속\'이라고 했으니 속도가 변하지 않는다.',
      why: '등속 원운동에서 일정한 것은 속력(크기)이지 속도(크기와 방향)가 아니다.', right: '방향이 계속 변하므로 속도가 변한다. 크기가 v²/r 인 가속도가 항상 중심 방향으로 있다.' },
  ], {
    w: 820, h: 600,
    draw: function (c, which, dt) {
      t += dt;
      const cx = 410, cy = 320, R = 190;
      c.strokeStyle = COL.line; c.lineWidth = 2; c.setLineDash([8, 8]); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.setLineDash([]);
      if (which === 0) {
        const a = 0.9, x = cx + R * Math.cos(a), y = cy - R * Math.sin(a), vx = -Math.sin(a), vy = -Math.cos(a);
        KIT.dash(c, x, y, x + vx * 300, y + vy * 300, COL.cold, 4);
        KIT.dash(c, x, y, x + (x - cx) * 1.3, y + (y - cy) * 1.3, COL.pen, 3);
        KIT.cross(c, x + (x - cx) * 0.9, y + (y - cy) * 0.9, 18);
        txt(c, '바깥으로 ✕', x + (x - cx) * 1.1 + 20, y + (y - cy) * 1.1, { size: 22, weight: 700, color: COL.pen });
        txt(c, '접선 방향 ○', x + vx * 230, y + vy * 230 - 26, { size: 22, weight: 700, color: COL.cold, align: 'center' });
        dot(c, x, y, 16, COL.energy); dot(c, cx, cy, 8, COL.ink);
        txt(c, '구심력이 사라지는 순간 어디로 갈까?', 30, 44, { size: 26, weight: 700 });
      } else {
        for (let i = 0; i < 8; i++) {
          const a = t * 0.6 + i * TAU / 8, x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
          KIT.vec(c, x, y, -Math.sin(a) * 90, -Math.cos(a) * 90, COL.cold, '', { width: 5, head: 16 });
          KIT.vec(c, x, y, (cx - x) * 0.32, (cy - y) * 0.32, COL.heat, '', { width: 5, head: 16 });
          dot(c, x, y, 9, COL.energy);
        }
        txt(c, '파랑 : 속도 (길이는 같고 방향이 다르다)', 30, 44, { size: 24, weight: 700, color: COL.cold });
        txt(c, '주황 : 가속도 (늘 중심 쪽)', 30, 82, { size: 24, weight: 700, color: COL.heat });
      }
    },
  });
}

/* ── 3 예제 : 2 kg, r = 4 m, v = 4 m/s ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 600);
  let show = false, ang = 0;
  const btn = KIT.btn('답 그림 보기', function () { show = !show; btn.setAttribute('aria-pressed', String(show)); });
  btn.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [btn], [
    KIT.cap('예제'),
    KIT.p('질량 2 kg 인 물체가 반지름 4 m 인 원 궤도를 4 m/s 의 일정한 속력으로 돌고 있다.', 'ws', 'font-weight:600'),
    KIT.p('(1) 구심 가속도 　a = [[v^{2}|r]] = [[4^{2}|4]] = {{⑫|4}} m/s^{2}'),
    KIT.p('(2) 구심력 　F = m a = 2 × (1)의 값 = {{(2)|8}} N'),
    KIT.p('(3) 주기 　T = [[2πr|v]] = [[2π × 4|4]] = {{⑬|2π}} s'),
  ], { center: true });
  return {
    tick: function (dt) {
      ang += dt;               // ω = v/r = 1 rad/s
      const c = cv.ctx; c.clearRect(0, 0, 820, 600);
      const cx = 410, cy = 310, R = 220, x = cx + R * Math.cos(ang), y = cy - R * Math.sin(ang);
      c.strokeStyle = COL.line; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
      KIT.dash(c, cx, cy, cx + R, cy, COL.muted, 2, [6, 6]); txt(c, 'r = 4 m', cx + R / 2, cy - 18, { size: 24, weight: 700, align: 'center' });
      dot(c, cx, cy, 8, COL.ink);
      KIT.vec(c, x, y, -Math.sin(ang) * 120, -Math.cos(ang) * 120, COL.cold, 'v = 4 m/s', { size: 22 });
      if (show) KIT.vec(c, x, y, (cx - x) * 0.45, (cy - y) * 0.45, COL.heat, 'a = 4 m/s², F = 8 N', { size: 22 });
      dot(c, x, y, 18, COL.energy);
      txt(c, '2 kg', x, y - 34, { size: 22, weight: 700, align: 'center' });
      if (show) txt(c, '한 바퀴 2π s ≈ 6.3 s', 30, 44, { size: 26, weight: 700, color: COL.energy });
    },
  };
}
