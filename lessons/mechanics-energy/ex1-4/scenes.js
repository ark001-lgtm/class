/* ═══════════════ 1-4 천체의 운동과 중력 연습문제 : 장면 ═══════════════
   기본 : 타원 궤도 (케플러 제2법칙으로 움직임) → 응용 : 반지름 r · 9r 인 인공위성 → 심화 : T² – r³ 그래프. */
const PART = '1-4 천체의 운동과 중력 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];
const TAU = Math.PI * 2;
function ball(c, x, y, r) { dot(c, x, y, r || 12, COL['panel-2']); c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, r || 12, 0, TAU); c.stroke(); }

/* ── 기본 : 타원 궤도 ── */
function sceneBasic(root) {
  const cv = makeCanvas(860, 300);
  let M = Math.PI, run = false;
  const sp = KIT.toggle('속력 화살표');
  const runBtn = KIT.btn('공전시키기 / 멈추기', function () { run = !run; }, true);
  KIT.problem(root, {
    level: '기본',
    stem: ['그림은 태양 둘레를 타원 궤도로 공전하는 행성을 나타낸 것이다. A 는 궤도에서 태양에 가장 가까운 지점, B 는 가장 먼 지점이다.'],
    cv: cv, ctrl: [runBtn, sp.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 태양은 타원 궤도의 중심에 있다.', 'ㄴ. 행성의 공전 속력은 A 에서가 B 에서보다 크다.', 'ㄷ. 행성이 받는 만유인력의 크기는 A 에서가 B 에서보다 크다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  const cx = 360, cy = 150, a = 250, b = 140, e = Math.sqrt(1 - b * b / (a * a)), fx = cx - a * e;
  // 케플러 방정식 M = E − e sin E 를 풀어 위치를 구한다 (E = 0 이 A, 왼쪽 끝)
  const posAt = function (m) { let E = m; for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E)); return { x: cx - a * Math.cos(E), y: cy + b * Math.sin(E), E: E }; };
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      if (run) M = (M + dt * 0.7) % TAU;
      c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.beginPath(); c.ellipse(cx, cy, a, b, 0, 0, TAU); c.stroke();
      arrow(c, cx + 18, cy - b, cx - 14, cy - b, { width: 2.5, head: 14, color: COL.ink });
      dot(c, fx, cy, 24, '#F5C542'); c.strokeStyle = COL.ink; c.lineWidth = 2; c.beginPath(); c.arc(fx, cy, 24, 0, TAU); c.stroke();
      txt(c, '태양', fx, cy + 46, { size: 22, align: 'center' });
      txt(c, 'A', cx - a - 24, cy, { size: 26, align: 'center' }); txt(c, 'B', cx + a + 24, cy, { size: 26, align: 'center' });
      const p = posAt(M);
      if (!run && M === Math.PI) { ball(c, cx - a, cy, 11); ball(c, cx + a, cy, 11); }
      else ball(c, p.x, p.y, 12);
      if (sp.on()) {
        const q = posAt(M + 0.001), vx = (q.x - p.x) / 0.001, vy = (q.y - p.y) / 0.001, k = 0.16;
        if (!run && M === Math.PI) { const vr = (1 + e) / (1 - e); KIT.vec(c, cx - a, cy, 0, 110, COL.energy, '', { width: 5, head: 14 }); KIT.vec(c, cx + a, cy, 0, -110 / vr, COL.energy, '', { width: 5, head: 10 }); }
        else KIT.vec(c, p.x, p.y, vx * 0.15, vy * 0.15, COL.energy, '', { width: 5, head: 14 });
      }
    },
  };
}

/* ── 응용 : 반지름 r · 9r 인 두 인공위성 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 310);
  let tA = 0.9, run = false;
  const runBtn = KIT.btn('공전시키기 / 멈추기', function () { run = !run; }, true);
  KIT.problem(root, {
    level: '응용',
    stem: ['그림과 같이 질량이 각각 2m, m 인 인공위성 A, B 가 지구를 중심으로 반지름이 각각 r, 9r 인 원 궤도를 따라 공전하고 있다.'],
    cv: cv, ctrl: [runBtn],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, T 는 공전 주기이다.)',
    bogi: ['ㄱ. 공전 주기는 B 가 A 의 9배이다.', 'ㄴ. 공전 속력은 B 가 A 의 3배이다.', 'ㄷ. [[T^{2}|r^{3}]] 의 값은 A 와 B 가 같다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 310);
      const ex = 320, ey = 155, rA = 72, rB = 145;
      if (run) tA += dt * 1.6;
      const aA = tA, aB = -0.45 + (tA - 0.9) / 27;     // 공전 주기는 r^1.5 에 비례 : 9r 은 27 배
      c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.beginPath(); c.arc(ex, ey, rA, 0, TAU); c.stroke(); c.beginPath(); c.arc(ex, ey, rB, 0, TAU); c.stroke();
      arrow(c, ex - rA + 1, ey - 8, ex - rA, ey + 6, { width: 2.5, head: 12, color: COL.ink });
      arrow(c, ex - rB * Math.cos(0.8) + 8, ey - rB * Math.sin(0.8) - 6, ex - rB * Math.cos(0.8) - 2, ey - rB * Math.sin(0.8) + 6, { width: 2.5, head: 12, color: COL.ink });
      dot(c, ex, ey, 44, rgba(COL.cold, 0.25)); c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.beginPath(); c.arc(ex, ey, 44, 0, TAU); c.stroke();
      txt(c, '지구', ex, ey, { size: 24, align: 'center' });
      const pA = [ex + rA * Math.cos(-aA), ey + rA * Math.sin(-aA)], pB = [ex + rB * Math.cos(-aB), ey + rB * Math.sin(-aB)];
      KIT.dash(c, ex, ey, pA[0], pA[1], COL.ink, 2, [4, 4]); KIT.dash(c, ex, ey, pB[0], pB[1], COL.ink, 2, [4, 4]);
      ball(c, pA[0], pA[1], 12); ball(c, pB[0], pB[1], 12);
      txt(c, 'A', pA[0] + 18, pA[1] - 18, { size: 24 }); txt(c, 'B', pB[0] + 18, pB[1] + 14, { size: 24 });
      txt(c, 'r', (ex + pA[0]) / 2 - 14, (ey + pA[1]) / 2 - 8, { size: 22 }); txt(c, '9r', (ex + pB[0]) / 2 + 6, (ey + pB[1]) / 2 + 18, { size: 22 });
      if (run) txt(c, 'A 가 ' + Math.floor((tA - 0.9) / TAU) + ' 바퀴 도는 동안 B 는 ' + KIT.fmt((tA - 0.9) / TAU / 27, 2) + ' 바퀴', 520, 40, { size: 22, color: COL.energy });
      txt(c, '(그림의 궤도 크기는 실제 비율과 다르다)', 520, 290, { size: 18, color: COL.muted });
    },
  };
}

/* ── 심화 : T² – r³ 그래프 ── */
function sceneDeep(root) {
  const cv = makeCanvas(860, 300);
  const sr = KIT.slider('r³ 의 값', 0, 2, 0.05, 1, function (v) { return KIT.fmt(v, 2) + ' a'; }, '110px');
  KIT.problem(root, {
    level: '심화',
    stem: ['그래프는 행성 P, Q 둘레를 원 궤도로 공전하는 위성들의 공전 주기의 제곱(T^{2})과 궤도 반지름의 세제곱(r^{3})의 관계를 나타낸 것이다.'],
    cv: cv, under: sr.el,
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 행성의 질량은 Q 가 P 의 2배이다.', 'ㄴ. 궤도 반지름이 같을 때 위성의 속력은 P 둘레에서가 더 크다.', 'ㄷ. 위성의 질량이 클수록 그래프의 기울기가 크다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const ox = 120, oy = 262, A = 250, B = 95;   // a · b 한 칸의 화면 길이
      arrow(c, ox, oy, ox + 2 * A + 140, oy, { width: 2.5, head: 14, color: COL.ink }); arrow(c, ox, oy, ox, oy - 2 * B - 50, { width: 2.5, head: 14, color: COL.ink });
      txt(c, 'T^{2}', ox + 14, oy - 2 * B - 46, { size: 24 }); txt(c, 'r^{3}', ox + 2 * A + 150, oy + 20, { size: 24 }); txt(c, '0', ox - 18, oy + 16, { size: 22 });
      [[1, 'a'], [2, '2a']].forEach(function (o) { KIT.dash(c, ox + o[0] * A, oy, ox + o[0] * A, oy - o[0] * B, COL.muted, 2, [5, 5]); txt(c, o[1], ox + o[0] * A, oy + 22, { size: 22, align: 'center' }); });
      [[1, 'b'], [2, '2b']].forEach(function (o) { KIT.dash(c, ox, oy - o[0] * B, ox + o[0] * A, oy - o[0] * B, COL.muted, 2, [5, 5]); txt(c, o[1], ox - 14, oy - o[0] * B, { size: 22, align: 'right' }); });
      KIT.line(c, [[ox, oy], [ox + 1.12 * A, oy - 2.24 * B]], COL.ink, 3.5); txt(c, 'P', ox + 1.12 * A + 16, oy - 2.24 * B, { size: 24 });
      KIT.line(c, [[ox, oy], [ox + 2.2 * A, oy - 2.2 * B]], COL.ink, 3.5); txt(c, 'Q', ox + 2.2 * A + 16, oy - 2.2 * B, { size: 24 });
      const u = sr.get(), x = ox + u * A, yP = oy - Math.min(2.24, 2 * u) * B, yQ = oy - u * B;
      KIT.dash(c, x, oy, x, Math.min(yP, yQ) - 10, COL.energy, 2, [3, 4]);
      if (u * 2 <= 2.24) dot(c, x, yP, 8, COL.heat);
      dot(c, x, yQ, 8, COL.cold);
      c.fillStyle = rgba(COL.panel, 0.9); rrect(c, 640, 120, 200, 96, 12); c.fill();
      txt(c, 'r^{3} = ' + KIT.fmt(u, 2) + ' a', 656, 146, { size: 22, color: COL.energy });
      txt(c, 'P : T^{2} = ' + KIT.fmt(2 * u, 2) + ' b', 656, 176, { size: 20, color: COL.heat });
      txt(c, 'Q : T^{2} = ' + KIT.fmt(u, 2) + ' b', 656, 202, { size: 20, color: COL.cold });
    },
  };
}
