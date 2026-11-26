/* ═══════════════ 1-3 원운동 연습문제 : 장면 ═══════════════
   기본 : 실에 매단 공의 등속 원운동(실 끊기) → 응용 : 곡선 도로를 도는 자동차 → 심화 : 회전 원판 위의 A(r) · B(2r). */
const PART = '1-3 원운동 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];
const TAU = Math.PI * 2;
function ball(c, x, y, r) { dot(c, x, y, r || 13, COL['panel-2']); c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, r || 13, 0, TAU); c.stroke(); }
function turnArrow(c, x, y, r, a0, a1) {   // 원 위쪽의 회전 방향 화살표 (시계 반대 방향)
  c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, a0, a1, true); c.stroke();
  const ex = x + r * Math.cos(a1), ey = y + r * Math.sin(a1);
  arrow(c, ex - 12 * Math.sin(a1), ey + 12 * Math.cos(a1), ex, ey, { width: 3, head: 14, color: COL.ink });
}

/* ── 기본 : 실에 매단 공 ── */
function sceneBasic(root) {
  const cv = makeCanvas(860, 300);
  let ang = 0, spin = false, free = null;
  const vel = KIT.toggle('속도 방향 보기');
  const spinBtn = KIT.btn('돌리기 / 멈추기', function () { spin = !spin; }, true);
  const cut = KIT.btn('실 끊기', function () { if (!free) { const vx = -Math.sin(ang), vy = -Math.cos(ang); free = { x: 330 + 115 * Math.cos(ang), y: 150 - 115 * Math.sin(ang), vx: vx, vy: vy, s: 0 }; spin = false; } });
  const reset = KIT.btn('처음으로', function () { ang = 0; spin = false; free = null; });
  KIT.problem(root, {
    level: '기본',
    stem: ['그림은 마찰이 없는 수평면 위에서 실에 매단 공이 점 O 를 중심으로 등속 원운동하는 모습을 위에서 본 것이다. P 는 원 궤도 위의 한 점이다.'],
    cv: cv, ctrl: [spinBtn, vel.el, cut, reset],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. P 에서 공의 속도 방향은 원의 접선 방향이다.', 'ㄴ. 공의 속력이 일정하므로 가속도는 0 이다.', 'ㄷ. P 에서 실이 끊어지면 공은 지름 바깥 방향으로 날아간다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const ox = 330, oy = 150, R = 115;
      if (spin) ang = (ang + dt * 1.6) % TAU;
      c.strokeStyle = COL.ink; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.arc(ox, oy, R, 0, TAU); c.stroke(); c.setLineDash([]);
      turnArrow(c, ox, oy, R + 26, -0.3, -1.6);
      dot(c, ox, oy, 6, COL.ink); txt(c, 'O', ox - 22, oy + 18, { size: 26 });
      txt(c, 'P', ox + R + 24, oy, { size: 26 });
      let bx = ox + R * Math.cos(ang), by = oy - R * Math.sin(ang);
      if (free) { free.s += dt * 190; bx = free.x + free.vx * free.s; by = free.y + free.vy * free.s; KIT.dash(c, free.x, free.y, bx, by, COL.energy, 2, [5, 5]); }
      else { c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(ox, oy); c.lineTo(bx, by); c.stroke(); if (!spin && ang === 0) txt(c, '실', ox + R / 2, oy - 18, { size: 22, align: 'center' }); }
      ball(c, bx, by);
      if (vel.on() && !free) KIT.vec(c, bx, by, -Math.sin(ang) * 90, -Math.cos(ang) * 90, COL.energy, '속도', { width: 5, head: 16, size: 20 });
      if (free) txt(c, '실이 끊어진 뒤 : 그 순간의 속도 방향으로 곧게 나아간다', 30, 280, { size: 20, color: COL.energy });
    },
  };
}

/* ── 응용 : 곡선 도로를 도는 자동차 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 300);
  let ang = -0.35, fast = 0;
  const cent = KIT.toggle('구심력 보기');
  const run = KIT.toggle('달리기');
  const sp = KIT.seg(['10 m/s', '20 m/s'], 0, function (i) { fast = i; });
  KIT.problem(root, {
    level: '응용',
    stem: ['그림은 질량 1000 kg 인 자동차가 반지름 50 m 인 수평한 곡선 도로를 10 m/s 의 일정한 속력으로 도는 모습을 위에서 본 것이다.'],
    cv: cv, ctrl: [run.el, cent.el, sp.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 구심력 역할을 하는 힘은 도로와 타이어 사이의 마찰력이다.', 'ㄴ. 구심력의 크기는 2000 N 이다.', 'ㄷ. 20 m/s 의 속력으로 돌려면 4배의 구심력이 필요하다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const ox = 210, oy = 300, R = 230, a0 = -1.72, a1 = -0.12;
      if (run.on()) { ang -= dt * 0.35 * (fast ? 2 : 1); if (ang < a0 + 0.12) ang = a1 - 0.1; }
      c.fillStyle = rgba(COL.muted, 0.15); c.beginPath(); c.arc(ox, oy, R + 34, a0, a1); c.arc(ox, oy, R - 34, a1, a0, true); c.closePath(); c.fill();
      c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.arc(ox, oy, R + 34, a0, a1); c.stroke(); c.beginPath(); c.arc(ox, oy, R - 34, a0, a1); c.stroke();
      dot(c, ox, oy - 6, 7, COL.ink); txt(c, 'O', ox - 26, oy - 12, { size: 26 });
      const cx = ox + R * Math.cos(ang), cy = oy + R * Math.sin(ang);
      KIT.dash(c, ox, oy - 6, cx, cy, COL.ink, 2, [4, 5]);
      c.save(); c.translate((ox + cx) / 2, (oy + cy) / 2); c.rotate(ang); txt(c, '50 m', 0, -16, { size: 22, align: 'center' }); c.restore();
      c.save(); c.translate(cx, cy); c.rotate(ang + Math.PI / 2);
      c.fillStyle = COL['panel-2']; c.fillRect(-24, -38, 48, 76); c.strokeStyle = COL.ink; c.lineWidth = 3; c.strokeRect(-24, -38, 48, 76);
      c.restore();
      const tx = Math.sin(ang), ty = -Math.cos(ang);    // 진행 방향 (시계 반대)
      arrow(c, cx + tx * 48, cy + ty * 48, cx + tx * 96, cy + ty * 96, { width: 3, head: 12, color: COL.ink });
      if (cent.on()) {
        const L = 60 * (fast ? 4 : 1) * 0.6;
        KIT.vec(c, cx, cy, -Math.cos(ang) * L, -Math.sin(ang) * L, COL.pen, '마찰력 (구심력)', { width: 6, head: 18, size: 20, off: 40 });
      }
      txt(c, '속력 ' + (fast ? '20' : '10') + ' m/s', 640, 40, { size: 24, color: COL.energy });
    },
  };
}

/* ── 심화 : 회전 원판 위의 두 물체 ── */
function sceneDeep(root) {
  const cv = makeCanvas(860, 300);
  let ang = 0, spin = false;
  const vel = KIT.toggle('속도 보기');
  const spinBtn = KIT.btn('돌리기 / 멈추기', function () { spin = !spin; }, true);
  KIT.problem(root, {
    level: '심화',
    stem: ['그림과 같이 일정한 각속도로 회전하는 원판 위에 질량이 같은 물체 A, B 가 회전 중심 O 로부터 각각 r, 2r 만큼 떨어진 곳에 놓여 원판과 함께 등속 원운동을 하고 있다.'],
    cv: cv, ctrl: [spinBtn, vel.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 주기는 A 와 B 가 같다.', 'ㄴ. 속력은 A 가 B 의 2배이다.', 'ㄷ. 구심력의 크기는 B 가 A 의 2배이다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄱ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const ox = 330, oy = 156, R = 128, r = 52;
      if (spin) ang = (ang + dt * 0.9) % TAU;
      c.fillStyle = rgba(COL.muted, 0.14); c.beginPath(); c.arc(ox, oy, R, 0, TAU); c.fill(); c.strokeStyle = COL.ink; c.lineWidth = 3; c.stroke();
      turnArrow(c, ox, oy, R + 18, -0.6, -2.1);
      dot(c, ox, oy, 6, COL.ink); txt(c, 'O', ox - 24, oy - 14, { size: 26 });
      [[r, 'A'], [2 * r, 'B']].forEach(function (o) {
        const x = ox + o[0] * Math.cos(ang), y = oy - o[0] * Math.sin(ang);
        c.save(); c.translate(x, y); c.rotate(-ang); c.fillStyle = COL['panel-2']; c.fillRect(-12, -12, 24, 24); c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.strokeRect(-12, -12, 24, 24); c.restore();
        txt(c, o[1], x, y - 30, { size: 24, align: 'center' });
        if (vel.on()) KIT.vec(c, x, y, -Math.sin(ang) * o[0] * 0.9, -Math.cos(ang) * o[0] * 0.9, COL.energy, '', { width: 5, head: 14 });
      });
      if (!spin && ang === 0) {
        c.strokeStyle = COL.ink; c.lineWidth = 2;
        [[r, 'r', 34], [2 * r, '2r', 62]].forEach(function (o) {
          c.beginPath(); c.moveTo(ox, oy + o[2]); c.lineTo(ox + o[0], oy + o[2]); c.moveTo(ox, oy + o[2] - 6); c.lineTo(ox, oy + o[2] + 6); c.moveTo(ox + o[0], oy + o[2] - 6); c.lineTo(ox + o[0], oy + o[2] + 6); c.stroke();
          txt(c, o[1], ox + o[0] / 2, oy + o[2] + 18, { size: 22, align: 'center' });
        });
      }
    },
  };
}
