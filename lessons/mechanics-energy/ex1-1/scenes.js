/* ═══════════════ 1-1 힘과 운동 연습문제 : 장면 ═══════════════
   기본 : 서로 수직인 두 힘(위에서 본 모습) → 응용 : 비스듬히 아래로 미는 힘과 등속도 운동 → 심화 : 빗면을 올라가는 물체.
   그림은 문제 그림 그대로 시작하고, 단추로 움직여 보거나 힘을 나누어 볼 수 있다. 오른쪽은 풀이 빈칸. */
const PART = '1-1 힘과 운동 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];
const DEG = Math.PI / 180;
function blockAt(c, x, y, w, hh, label, rot) {
  c.save(); c.translate(x, y); if (rot) c.rotate(rot);
  c.fillStyle = COL['panel-2']; c.fillRect(-w / 2, -hh / 2, w, hh);
  c.strokeStyle = COL.ink; c.lineWidth = 3; c.strokeRect(-w / 2, -hh / 2, w, hh);
  if (label) txt(c, label, 0, 0, { size: 28, align: 'center' });
  c.restore();
}

/* ── 기본 : 서로 수직인 두 힘 ── */
function sceneBasic(root) {
  const cv = makeCanvas(860, 300);
  let t = 0;
  const sum = KIT.toggle('알짜힘 보기'), go = KIT.toggle('움직여 보기', function () { t = 0; });
  KIT.problem(root, {
    level: '기본',
    stem: ['그림은 마찰이 없는 수평면 위에 놓인 질량 2 kg 인 물체에 수평 방향으로 크기가 각각 3 N, 4 N 인 두 힘이 서로 수직으로 작용하는 모습을 위에서 본 것이다.'],
    cv: cv, ctrl: [sum.el, go.el],
    ask: '물체의 가속도의 크기는?',
    choices: ['① 2.5 m/s^{2}', '② 3.5 m/s^{2}', '③ 5 m/s^{2}', '④ 7 m/s^{2}', '⑤ 10 m/s^{2}'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      if (go.on()) t = Math.min(t + dt, 1.8); else t = 0;
      const k = 30, s = 0.5 * 90 * t * t, bx = 330 + 0.6 * s, by = 200 - 0.8 * s, half = 46;
      if (go.on()) { c.strokeStyle = rgba(COL.energy, 0.35); c.setLineDash([6, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(330, 200); c.lineTo(bx, by); c.stroke(); c.setLineDash([]); }
      blockAt(c, bx, by, 2 * half, 2 * half, '2 kg');
      KIT.vec(c, bx, by - half, 0, -4 * k, COL.ink, '4 N', { width: 4, head: 16, lx: 30, ly: 18 });
      KIT.vec(c, bx + half, by, 3 * k, 0, COL.ink, '3 N', { width: 4, head: 16, lx: 4, ly: -24 });
      if (sum.on()) {
        KIT.dash(c, bx + 3 * k, by, bx + 3 * k, by - 4 * k, COL.muted, 2, [6, 6]);
        KIT.dash(c, bx, by - 4 * k, bx + 3 * k, by - 4 * k, COL.muted, 2, [6, 6]);
        KIT.vec(c, bx, by, 3 * k, -4 * k, COL.energy, '알짜힘', { width: 6, head: 20, off: 30 });
      }
      if (!go.on()) txt(c, '(위에서 본 모습)', bx, by + half + 26, { size: 22, align: 'center', color: COL.muted });
    },
  };
}

/* ── 응용 : 비스듬히 아래로 미는 힘, 등속도 운동 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 300);
  let x = 500;
  const go = KIT.toggle('움직여 보기'), parts = KIT.toggle('힘 나누어 보기');
  KIT.problem(root, {
    level: '응용',
    stem: ['그림과 같이 수평면 위에 놓인 질량 2 kg 인 물체를 수평면과 37° 의 각을 이루는 비스듬한 아래 방향으로 크기가 20 N 인 힘으로 밀었더니, 물체가 오른쪽으로 등속도 운동을 하였다.'],
    cv: cv, ctrl: [go.el, parts.el],
    ask: '물체와 수평면 사이의 운동 마찰 계수는? (단, 중력 가속도는 10 m/s^{2} 이고, sin 37° = 0.6, cos 37° = 0.8 이다.)',
    choices: ['① 0.4', '② 0.5', '③ 0.6', '④ 0.75', '⑤ 0.8'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      if (go.on()) { x += 70 * dt; if (x > 680) x = 360; }
      const gy = 262, w = 140, hh = 92, top = gy - hh, L = 165, cx = x + w / 2, cy = gy - hh / 2;
      KIT.ground(c, 30, gy, 800);
      blockAt(c, cx, cy, w, hh, '2 kg');
      // 미는 힘 : 왼쪽 위에서 물체의 왼쪽 위 모서리로
      const tx = x - L * Math.cos(37 * DEG), ty = top - L * Math.sin(37 * DEG);
      arrow(c, tx, ty, x, top, { width: 4, head: 18, color: COL.ink });
      txt(c, '20 N', tx - 10, ty - 22, { size: 26, color: COL.ink });
      KIT.dash(c, x - 150, top, x, top, COL.muted, 2, [5, 5]);
      c.strokeStyle = COL.ink; c.lineWidth = 2; c.beginPath(); c.arc(x, top, 52, Math.PI, Math.PI + 37 * DEG); c.stroke();
      txt(c, '37°', x - 92, top - 18, { size: 22 });
      arrow(c, cx - 50, top - 52, cx + 40, top - 52, { width: 3, head: 12, color: COL.ink });
      txt(c, '운동 방향', cx - 5, top - 80, { size: 22, align: 'center' });
      if (parts.on()) {
        const k = 4;
        KIT.vec(c, x, top, 16 * k * 0.9, 0, COL.cold, '수평 성분', { width: 4, head: 14, lx: 20, ly: -40, size: 20 });
        KIT.vec(c, x, top, 0, 12 * k, COL.cold, '연직 성분', { width: 4, head: 14, lx: -66, ly: -8, size: 20 });
        KIT.vec(c, cx, cy, 0, 18 * k * 0.55, COL.heat, '중력', { width: 5, head: 16, lx: 34, ly: -12, size: 20 });
        KIT.vec(c, cx + 30, top, 0, -26 * k * 0.6, COL.good, '수직항력', { width: 5, head: 16, lx: 52, ly: 10, size: 20 });
        KIT.vec(c, x + w, gy - 6, 16 * k * 0.9, 0, COL.pen, '', { width: 5, head: 16 });
        KIT.vec(c, x, gy - 6, -16 * k * 0.9, 0, COL.pen, '마찰력', { width: 5, head: 16, ly: -22, size: 20 });
      }
      if (go.on()) txt(c, '속도가 일정하다 (등속도 운동)', 40, 30, { size: 22, color: COL.energy });
    },
  };
}

/* ── 심화 : 빗면을 올라가는 물체 ── */
function sceneDeep(root) {
  const cv = makeCanvas(860, 320);
  let s = 220, v = 0, phase = 0;
  const forces = KIT.toggle('힘 보기');
  const push = KIT.btn('밀어 올리기', function () { s = 50; v = 300; phase = 1; }, true);
  KIT.problem(root, {
    level: '심화',
    stem: ['그림과 같이 경사각이 37° 인 빗면에서 질량 2 kg 인 물체를 빗면 위쪽으로 밀어 준 뒤 손을 떼었더니, 물체가 빗면을 따라 올라가고 있다. 손을 뗀 뒤 물체에는 중력, 수직항력, 마찰력만 작용하며, 물체와 빗면 사이의 운동 마찰 계수는 0.25 이다.'],
    cv: cv, ctrl: [push, forces.el],
    ask: '손을 뗀 뒤 물체가 빗면을 올라가는 동안에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, 중력 가속도는 10 m/s^{2} 이고, sin 37° = 0.6, cos 37° = 0.8 이다.)',
    bogi: ['ㄱ. 수직항력의 크기는 20 N 이다.', 'ㄴ. 마찰력의 방향은 빗면 아래 방향이다.', 'ㄷ. 가속도의 크기는 8 m/s^{2} 이다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 320);
      // 올라갈 때 가속도 크기 8, 멈춘 뒤 내려올 때 4 (g sin − μ g cos) : 화면에서는 25 배
      if (phase === 1) { v -= 200 * dt; s += v * dt; if (v <= 0) { v = 0; phase = 2; } }
      else if (phase === 2) { v += 100 * dt; s -= v * dt; if (s <= 50) { s = 50; phase = 0; v = 0; } }
      const x0 = 110, y0 = 296, base = 380, ux = Math.cos(37 * DEG), uy = -Math.sin(37 * DEG), nx = -Math.sin(37 * DEG), ny = -Math.cos(37 * DEG);
      KIT.ground(c, 50, y0, 520);
      c.fillStyle = rgba(COL.muted, 0.12); c.strokeStyle = COL.ink; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + base, y0); c.lineTo(x0 + base, y0 - base * 0.75); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.arc(x0, y0, 70, -37 * DEG, 0); c.stroke();
      txt(c, '37°', x0 + 84, y0 - 22, { size: 22 });
      const w = 110, hh = 66, bx = x0 + ux * s + nx * hh / 2, by = y0 + uy * s + ny * hh / 2;
      blockAt(c, bx, by, w, hh, '2 kg', -37 * DEG);
      const up = phase !== 2;
      const ax = bx + nx * 70 - ux * 40, ay = by + ny * 70 - uy * 40;
      arrow(c, ax, ay, ax + ux * (up ? 90 : -90), ay + uy * (up ? 90 : -90), { width: 3, head: 12, color: COL.ink });
      txt(c, '운동 방향', ax + nx * 30 + ux * 20, ay + ny * 30 + uy * 20, { size: 22, align: 'center' });
      if (forces.on()) {
        const k = 4;
        KIT.vec(c, bx, by, 0, 20 * k, COL.heat, '중력', { width: 5, head: 16, lx: 30, size: 20 });
        KIT.vec(c, bx, by, nx * 16 * k, ny * 16 * k, COL.good, '수직항력', { width: 5, head: 16, size: 20 });
        const fdir = up ? -1 : 1;
        KIT.vec(c, bx - ux * w * 0.1, by - uy * w * 0.1, fdir * ux * 4 * k * 3, fdir * uy * 4 * k * 3, COL.pen, '마찰력', { width: 5, head: 16, size: 20, ly: 22 });
      }
      txt(c, phase === 1 ? '올라가는 중 : 점점 느려진다' : phase === 2 ? '멈춘 뒤 미끄러져 내려온다' : '', 520, 50, { size: 22, color: COL.energy });
    },
  };
}
