/* ═══════════════ 2-3 열역학 제1법칙 연습문제 : 장면 ═══════════════
   기본 : 일정한 압력에서 열을 받아 팽창 → 응용 : 열역학 과정 → 심화 : A → B → C 의 P – V 그래프. */
const PART = '2-3 열역학 제1법칙 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];

/* ── 기본 ── */
function sceneBasic(root) {
  KIT.problem(root, {
    level: '기본',
    stem: ['압력이 1 × 10^{5} Pa 로 일정한 상태에서 이상 기체에 600 J 의 열을 가했더니 기체의 부피가 2 × 10^{−3} m^{3} 만큼 늘어났다. 이 과정에서 기체의 내부 에너지 변화량은?'],
    choices: ['① 200 J', '② 400 J', '③ 600 J', '④ 800 J', '⑤ 1200 J'],
  });
  return { tick: function () {} };
}

/* ── 응용 ── */
function sceneApply(root) {
  KIT.problem(root, {
    level: '응용',
    stem: ['이상 기체의 열역학 과정에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?'],
    bogi: ['ㄱ. 등적 과정에서 기체는 외부에 일을 한다.', 'ㄴ. 등온 과정에서 기체에 열을 가하면 온도가 올라간다.', 'ㄷ. 자전거 펌프로 공기를 빠르게 압축하면 공기의 온도가 올라간다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return { tick: function () {} };
}

/* ── 심화 : A → B → C ── */
function sceneDeep(root) {
  const cv = makeCanvas(860, 300);
  let t = -1;
  const area = KIT.toggle('A → B 아래 넓이 칠하기');
  const go = KIT.btn('상태 변화 보기', function () { t = 0; }, true);
  KIT.problem(root, {
    level: '심화',
    stem: ['그림은 일정량의 이상 기체의 상태가 A → B → C 로 변할 때 압력과 부피의 관계를 나타낸 것이다.'],
    cv: cv, ctrl: [go, area.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. A → B 과정에서 기체가 외부에 한 일은 400 J 이다.', 'ㄴ. B → C 과정에서 기체는 열을 방출한다.', 'ㄷ. 기체의 온도는 C 에서가 A 에서보다 높다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const ox = 150, oy = 250, sx = 130, sy = 90, X = function (v) { return ox + v * sx; }, Y = function (p) { return oy - p * sy; };
      arrow(c, ox, oy, ox + 3.6 * sx, oy, { width: 2.5, head: 14, color: COL.ink }); arrow(c, ox, oy, ox, oy - 2.6 * sy, { width: 2.5, head: 14, color: COL.ink });
      txt(c, 'P (× 10^{5} Pa)', ox + 12, oy - 2.6 * sy + 4, { size: 20 }); txt(c, 'V (× 10^{−3} m^{3})', ox + 3.6 * sx, oy + 32, { size: 20, align: 'right' });
      txt(c, '0', ox - 16, oy + 14, { size: 20 });
      [1, 2, 3].forEach(function (v) { txt(c, String(v), X(v), oy + 20, { size: 20, align: 'center' }); });
      [1, 2].forEach(function (p) { txt(c, String(p), ox - 14, Y(p), { size: 20, align: 'right' }); });
      if (area.on()) { c.fillStyle = rgba(COL.work, 0.22); c.fillRect(X(1), Y(2), 2 * sx, 2 * sy); }
      KIT.dash(c, ox, Y(2), X(1), Y(2), COL.muted, 2, [4, 4]); KIT.dash(c, X(1), Y(2), X(1), oy, COL.muted, 2, [4, 4]);
      KIT.dash(c, ox, Y(1), X(3), Y(1), COL.muted, 2, [4, 4]); KIT.dash(c, X(3), Y(1), X(3), oy, COL.muted, 2, [4, 4]);
      KIT.line(c, [[X(1), Y(2)], [X(3), Y(2)], [X(3), Y(1)]], COL.ink, 4);
      arrow(c, X(1.8), Y(2), X(2.1), Y(2), { width: 3, head: 14, color: COL.ink }); arrow(c, X(3), Y(1.65), X(3), Y(1.4), { width: 3, head: 14, color: COL.ink });
      [[1, 2, 'A', -14, -22], [3, 2, 'B', 14, -22], [3, 1, 'C', 24, 4]].forEach(function (o) { dot(c, X(o[0]), Y(o[1]), 8, COL.ink); txt(c, o[2], X(o[0]) + o[3], Y(o[1]) + o[4], { size: 24, align: 'center' }); });
      if (t >= 0) {
        t += dt / 4;
        const u = Math.min(t, 1), p = u < 0.66 ? [1 + 2 * u / 0.66, 2] : [3, 2 - (u - 0.66) / 0.34];
        dot(c, X(p[0]), Y(p[1]), 12, COL.heat);
        // 피스톤 그림
        const cx = 640, w = 160, cyl = 210, top = cyl - 40 * p[0];
        c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, 40); c.lineTo(cx, cyl); c.lineTo(cx + w, cyl); c.lineTo(cx + w, 40); c.stroke();
        c.fillStyle = rgba(mix(COL.cold, COL.heat, (p[0] * p[1] - 2) / 4), 0.3); c.fillRect(cx + 2, top, w - 4, cyl - top - 2);
        c.fillStyle = COL['ink-2']; c.fillRect(cx + 2, top - 14, w - 4, 14);
        txt(c, 'PV = ' + KIT.fmt(p[0] * p[1], 2) + ' (온도에 비례)', cx + w / 2, cyl + 28, { size: 18, align: 'center', color: COL.energy });
        if (t > 1.6) t = -1;
      }
    },
  };
}
