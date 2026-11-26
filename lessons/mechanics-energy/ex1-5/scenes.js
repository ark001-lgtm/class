/* ═══════════════ 1-5 탈출 속도와 우주선의 운동 연습문제 : 장면 ═══════════════
   기본 : 천체별 탈출 속도와 대기(표) → 응용 : 행성 A · B · C 의 질량과 반지름(표) → 심화 : 중력 위치 에너지 U – r 그래프. */
const PART = '1-5 탈출 속도와 우주선의 운동 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];

/* ── 기본 : 천체별 탈출 속도와 대기 ── */
function sceneBasic(root) {
  KIT.problem(root, {
    level: '기본',
    stem: ['표는 천체별 탈출 속도와 대기의 특징을 나타낸 것이다.'],
    extra: h('div', { class: 'prob-extra' }, KIT.table(['천체', '달', '지구', '목성'], [
      ['탈출 속도 (km/s)', '2.4', '11.2', '59.5'],
      ['대기', '거의 없다', '질소 · 산소 중심', '수소 · 헬륨까지 붙잡음'],
    ], { cols: ['22%', '22%', '26%', '30%'] })),
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 달에 대기가 거의 없는 것은 탈출 속도가 작기 때문이다.', 'ㄴ. 같은 온도에서 수소 분자는 질소 분자보다 평균 속력이 크다.', 'ㄷ. 물체의 질량이 클수록 탈출 속도가 크다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return { tick: function () {} };
}

/* ── 응용 : 행성 A · B · C ── */
function sceneApply(root) {
  KIT.problem(root, {
    level: '응용',
    stem: ['표는 행성 A, B, C 의 질량과 반지름을 나타낸 것이다. M 과 R 은 각각 지구의 질량과 반지름이다.'],
    extra: h('div', { class: 'prob-extra' }, KIT.table(['행성', 'A', 'B', 'C'], [
      ['질량', 'M', '4M', '2M'],
      ['반지름', 'R', '2R', '4R'],
    ], { cols: ['25%', '25%', '25%', '25%'] })),
    ask: 'A, B, C 의 탈출 속도를 비교한 것으로 옳은 것은?',
    choices: ['① A > B > C', '② A > C > B', '③ B > A > C', '④ B > C > A', '⑤ C > A > B'],
  });
  return { tick: function () {} };
}

/* ── 심화 : U – r 그래프 ── */
function sceneDeep(root) {
  const cv = makeCanvas(860, 300);
  const sr = KIT.slider('거리 r', 1, 5, 0.1, 1, function (v) { return KIT.fmt(v, 1) + ' R'; }, '110px');
  const zero = KIT.toggle('역학적 에너지 0 인 선');
  KIT.problem(root, {
    level: '심화',
    stem: ['그래프는 질량 M, 반지름 R 인 행성의 중심으로부터의 거리 r 에 따른, 질량 m 인 물체의 중력에 의한 위치 에너지 U = −[[GMm|r]] 을 나타낸 것이다.'],
    cv: cv, ctrl: [zero.el], under: sr.el,
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, 무한히 먼 곳에서 위치 에너지는 0 이고, 공기 저항은 무시한다.)',
    bogi: ['ㄱ. 행성에서 멀어질수록 물체의 위치 에너지는 커진다.', 'ㄴ. 표면에서 탈출 속도로 쏘아 올린 물체의 역학적 에너지는 0 이다.', 'ㄷ. r = 2R 에서의 위치 에너지는 표면에서보다 [[GMm|2R]] 만큼 크다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const ox = 130, y0 = 60, xR = ox + 110, k = 200, X = function (r) { return ox + 110 * r; }, Y = function (r) { return y0 + k / r; };
      arrow(c, ox, y0, ox + 680, y0, { width: 2.5, head: 14, color: COL.ink }); arrow(c, ox, 290, ox, 20, { width: 2.5, head: 14, color: COL.ink });
      txt(c, 'U', ox + 16, 24, { size: 26 }); txt(c, 'r', ox + 676, y0 - 22, { size: 26 }); txt(c, '0', ox - 18, y0 - 4, { size: 22 });
      txt(c, 'R', xR, y0 - 22, { size: 24, align: 'center' });
      KIT.dash(c, xR, y0, xR, Y(1), COL.muted, 2, [4, 4]); KIT.dash(c, ox, Y(1), xR, Y(1), COL.muted, 2, [4, 4]);
      txt(c, '−[[GMm|R]]'.replace('[[GMm|R]]', 'GMm / R'), ox - 10, Y(1), { size: 20, align: 'right' });
      const pts = []; for (let r = 1; r <= 6; r += 0.05) pts.push([X(r), Y(r)]);
      KIT.line(c, pts, COL.ink, 3.5);
      const r = sr.get();
      if (r > 1.001) { KIT.dash(c, X(r), y0, X(r), Y(r), COL.energy, 2, [3, 4]); KIT.dash(c, ox, Y(r), X(r), Y(r), COL.energy, 2, [3, 4]); }
      dot(c, X(r), Y(r), 9, COL.energy);
      c.fillStyle = rgba(COL.panel, 0.92); rrect(c, 560, 150, 280, 70, 12); c.fill();
      txt(c, 'r = ' + KIT.fmt(r, 1) + ' R 에서', 576, 172, { size: 20, color: COL.energy });
      txt(c, 'U = −' + (Math.abs(r - 1) < 0.001 ? '' : KIT.fmt(1 / r, 3) + ' × ') + 'GMm / R', 576, 202, { size: 20, color: COL.energy });
      if (zero.on()) { KIT.line(c, [[ox, y0], [ox + 660, y0]], COL.good, 5); txt(c, 'E = 0', ox + 600, y0 + 22, { size: 22, color: COL.good }); }
    },
  };
}
