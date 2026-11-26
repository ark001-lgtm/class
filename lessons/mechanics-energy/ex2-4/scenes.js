/* ═══════════════ 2-4 열기관과 열효율 연습문제 : 장면 ═══════════════
   기본 : 흡수한 열과 방출한 열로 열효율 → 응용 : 열효율 0.4 인 열기관의 에너지 흐름 → 심화 : 열기관 A · B 비교(표). */
const PART = '2-4 열기관과 열효율 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];

/* ── 기본 ── */
function sceneBasic(root) {
  KIT.problem(root, {
    level: '기본',
    stem: ['어떤 열기관이 한 번 순환하는 동안 고열원에서 1200 J 의 열을 흡수하고 저열원으로 900 J 의 열을 방출하였다. 이 열기관의 열효율은?'],
    choices: ['① 0.25', '② 0.3', '③ 0.4', '④ 0.6', '⑤ 0.75'],
  });
  return { tick: function () {} };
}

/* ── 응용 : 에너지 흐름 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 300);
  let t = 0;
  KIT.problem(root, {
    level: '응용',
    stem: ['그림은 열효율이 0.4 인 열기관이 한 번 순환하는 동안 고열원에서 열 Q₁ 을 흡수하여 외부에 400 J 의 일을 하고, 저열원으로 열 Q₂ 를 방출하는 것을 나타낸 것이다.'],
    cv: cv,
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. Q₁ 은 1000 J 이다.', 'ㄴ. 한 번 순환하는 동안 내부 에너지 변화량은 0 이다.', 'ㄷ. 마찰을 완전히 없애면 Q₂ = 0 인 열기관을 만들 수 있다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const cx = 330;
      [[20, '고열원', rgba(COL.heat, 0.18)], [228, '저열원', rgba(COL.cold, 0.18)]].forEach(function (o) {
        c.fillStyle = o[2]; c.fillRect(cx - 130, o[0], 260, 54); c.strokeStyle = COL.ink; c.lineWidth = 3; c.strokeRect(cx - 130, o[0], 260, 54);
        txt(c, o[1], cx, o[0] + 27, { size: 26, align: 'center' });
      });
      c.fillStyle = COL.panel; c.beginPath(); c.arc(cx, 150, 52, 0, Math.PI * 2); c.fill(); c.strokeStyle = COL.ink; c.lineWidth = 3; c.stroke();
      txt(c, '열기관', cx, 150, { size: 24, align: 'center' });
      arrow(c, cx, 74, cx, 98, { width: 4, head: 14, color: COL.ink }); arrow(c, cx, 202, cx, 226, { width: 4, head: 14, color: COL.ink });
      arrow(c, cx + 52, 150, cx + 230, 150, { width: 4, head: 16, color: COL.ink });
      txt(c, 'Q₁', cx + 18, 86, { size: 26 }); txt(c, 'Q₂', cx + 18, 214, { size: 26 }); txt(c, 'W = 400 J', cx + 70, 124, { size: 26 });
      // 흐르는 에너지 알갱이
      for (let i = 0; i < 4; i++) {
        const f = ((t * 0.8) + i / 4) % 1;
        dot(c, cx - 8, 74 + f * 24, 5, COL.heat);
        dot(c, cx + 60 + f * 160, 150, 5, COL.work);
        dot(c, cx - 8, 202 + f * 24, 5, COL.cold);
      }
      txt(c, '열효율 0.4', 640, 60, { size: 24, color: COL.energy });
    },
  };
}

/* ── 심화 : 열기관 A · B ── */
function sceneDeep(root) {
  KIT.problem(root, {
    level: '심화',
    stem: ['표는 열기관 A, B 가 한 번 순환하는 동안 고열원에서 흡수한 열 Q₁ 과 외부에 한 일 W 를 나타낸 것이다.'],
    extra: h('div', { class: 'prob-extra' }, KIT.table(['열기관', 'Q₁', 'W'], [
      ['A', '500 J', '150 J'],
      ['B', '800 J', '320 J'],
    ], { cols: ['34%', '33%', '33%'] })),
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 열효율은 A 가 B 보다 크다.', 'ㄴ. 저열원으로 방출하는 열은 B 가 A 보다 많다.', 'ㄷ. A 가 500 J 을 흡수하여 200 J 의 일을 하면 열효율이 B 와 같다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return { tick: function () {} };
}
