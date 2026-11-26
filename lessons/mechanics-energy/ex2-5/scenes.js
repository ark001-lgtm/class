/* ═══════════════ 2-5 열역학 제2법칙 연습문제 : 장면 ═══════════════
   기본 : 비가역 현상과 엔트로피 → 응용 : 통 안의 기체 분자 5개 (왼쪽 · 오른쪽) → 심화 : 냉장고의 열 흐름. */
const PART = '2-5 열역학 제2법칙 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];

/* ── 기본 ── */
function sceneBasic(root) {
  KIT.problem(root, {
    level: '기본',
    stem: ['비가역 현상과 엔트로피에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?'],
    bogi: ['ㄱ. 열은 저절로 찬 물체에서 뜨거운 물체로 이동할 수 있다.', 'ㄴ. 기체가 통 전체로 골고루 퍼지는 확산은 비가역 현상이다.', 'ㄷ. 퍼진 잉크가 다시 모이지 않는 것은 에너지 보존 법칙 때문이다.'],
    choices: ['① ㄴ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄱ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return { tick: function () {} };
}

/* ── 응용 : 통 안의 분자 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 290);
  const box = { x: 160, y: 50, w: 540, h: 210 };
  // 문제 그림의 처음 자리 (왼쪽 3개, 오른쪽 2개)
  const START = [[0.24, 0.3], [0.13, 0.69], [0.33, 0.75], [0.64, 0.45], [0.84, 0.23]];
  let mol = [], run = false;
  function reset(n) {
    mol = [];
    for (let i = 0; i < n; i++) {
      const p = i < 5 ? START[i] : [Math.random(), Math.random()], a = Math.random() * Math.PI * 2;
      mol.push({ x: box.x + 20 + p[0] * (box.w - 40), y: box.y + 20 + p[1] * (box.h - 40), vx: Math.cos(a) * 120, vy: Math.sin(a) * 120 });
    }
  }
  reset(5);
  const count = KIT.seg(['5개', '10개', '20개'], 0, function (i) { reset([5, 10, 20][i]); });
  const runBtn = KIT.btn('움직이기 / 멈추기', function () { run = !run; }, true);
  KIT.problem(root, {
    level: '응용',
    stem: ['그림과 같이 통 안에 기체 분자 5개가 들어 있다. 통을 왼쪽과 오른쪽 두 부분으로 나누어 생각한다.'],
    cv: cv, ctrl: [runBtn, count.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, 각 분자는 왼쪽과 오른쪽 중 어느 쪽에나 같은 확률로 있을 수 있다.)',
    bogi: ['ㄱ. 분자 5개가 배치될 수 있는 전체 경우의 수는 32가지이다.', 'ㄴ. 분자 5개가 모두 왼쪽에 있을 확률은 [[1|32]] 이다.', 'ㄷ. 분자 수가 많을수록 모두 한쪽에 모일 확률은 작아진다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 290);
      if (run) mol.forEach(function (m) {
        m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.x < box.x + 14 || m.x > box.x + box.w - 14) { m.vx *= -1; m.x = clamp(m.x, box.x + 14, box.x + box.w - 14); }
        if (m.y < box.y + 14 || m.y > box.y + box.h - 14) { m.vy *= -1; m.y = clamp(m.y, box.y + 14, box.y + box.h - 14); }
      });
      c.strokeStyle = COL.ink; c.lineWidth = 4; c.strokeRect(box.x, box.y, box.w, box.h);
      KIT.dash(c, box.x + box.w / 2, box.y, box.x + box.w / 2, box.y + box.h, COL.ink, 2, [6, 6]);
      txt(c, '왼쪽', box.x + box.w / 4, box.y - 24, { size: 26, align: 'center' }); txt(c, '오른쪽', box.x + box.w * 3 / 4, box.y - 24, { size: 26, align: 'center' });
      let left = 0;
      mol.forEach(function (m) { if (m.x < box.x + box.w / 2) left++; dot(c, m.x, m.y, 14, COL['panel-2']); c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.beginPath(); c.arc(m.x, m.y, 14, 0, Math.PI * 2); c.stroke(); });
      if (run || mol.length !== 5) txt(c, '왼쪽 ' + left + '개 · 오른쪽 ' + (mol.length - left) + '개', box.x + box.w + 20, 150, { size: 22, color: COL.energy });
    },
  };
}

/* ── 심화 : 냉장고 ── */
function sceneDeep(root) {
  const cv = makeCanvas(860, 230);
  let t = 0;
  KIT.problem(root, {
    level: '심화',
    stem: ['그림은 냉장고가 작동하면서 냉장고 내부에서 열을 흡수하여 방으로 열을 방출하는 모습을 나타낸 것이다.'],
    cv: cv,
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 냉장고 내부의 엔트로피는 감소한다.', 'ㄴ. 냉장고는 열역학 제2법칙에 어긋나는 장치이다.', 'ㄷ. 냉장고와 방 전체를 합한 엔트로피는 증가한다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄴ', '④ ㄱ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 860, 230);
      const boxes = [[40, '냉장고 내부', rgba(COL.cold, 0.16)], [320, '냉각 장치', COL['panel-2']], [600, '방', rgba(COL.heat, 0.12)]];
      boxes.forEach(function (o) { c.fillStyle = o[2]; c.fillRect(o[0], 30, 220, 90); c.strokeStyle = COL.ink; c.lineWidth = 3; c.strokeRect(o[0], 30, 220, 90); txt(c, o[1], o[0] + 110, 75, { size: 26, align: 'center' }); });
      arrow(c, 260, 75, 318, 75, { width: 3, head: 14, color: COL.ink }); arrow(c, 540, 75, 598, 75, { width: 3, head: 14, color: COL.ink });
      txt(c, '열', 289, 50, { size: 22, align: 'center' }); txt(c, '열', 569, 50, { size: 22, align: 'center' });
      arrow(c, 430, 210, 430, 124, { width: 3, head: 14, color: COL.ink }); txt(c, '전기 에너지', 444, 186, { size: 22 });
      for (let i = 0; i < 3; i++) {
        const f = ((t * 0.7) + i / 3) % 1;
        dot(c, 262 + f * 52, 88, 5, COL.cold); dot(c, 542 + f * 52, 88, 5, COL.heat); dot(c, 418, 206 - f * 80, 5, COL.work);
      }
    },
  };
}
