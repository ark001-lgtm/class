/* ═══════════════ 2-1 열과 우리 생활 연습문제 : 장면 ═══════════════
   기본 : 난로가 켜진 방의 열전달 → 응용 : 단열재 성능 비교 실험(장치 · 결과 그래프) → 심화 : 열팽창과 단열의 예. */
const PART = '2-1 열과 우리 생활 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];

/* ── 기본 ── */
function sceneBasic(root) {
  KIT.problem(root, {
    level: '기본',
    stem: ['난로가 켜진 방에서 일어나는 열전달에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?'],
    bogi: ['ㄱ. 데워진 공기가 위로 올라가며 열을 전달하는 방식은 전도이다.', 'ㄴ. 물질의 도움 없이 열이 직접 전달되는 방식은 복사이다.', 'ㄷ. 난로보다 온도가 낮은 사람의 몸은 복사열을 방출하지 않는다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return { tick: function () {} };
}

/* ── 응용 : 단열재 성능 비교 실험 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 296);
  let mat = 0, t = 1, run = false;
  const RATE = [3.2, 1.6, 0.6];            // A 가 가장 빨리 상온에 가까워진다 (결과 그래프와 같게)
  const seg = KIT.seg(['A', 'B', 'C'], 0, function (i) { mat = i; t = 0; run = true; });
  const startBtn = KIT.btn('시간 흐르게 하기', function () { t = 0; run = true; }, true);
  KIT.problem(root, {
    level: '응용',
    stem: ['다음은 단열재의 성능을 비교하는 실험이다.', '[실험 과정] (가) 같은 양의 차가운 물을 눈금실린더 3개에 각각 담는다. (나) 크기가 같은 비커 3개에 서로 다른 물질 A, B, C 를 같은 부피만큼 채우고, 각 비커의 가운데에 (가)의 눈금실린더를 넣는다. (다) 비커를 상온에 두고, 시간에 따른 눈금실린더 속 물의 온도를 측정한다.'],
    cv: cv, ctrl: [startBtn, seg.el],
    ask: '[실험 결과] 는 그래프와 같다. 이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?',
    bogi: ['ㄱ. 열은 비커 바깥에서 눈금실린더 속 물 쪽으로 이동한다.', 'ㄴ. 단열재로 가장 좋은 물질은 A 이다.', 'ㄷ. 열전도율은 A 가 C 보다 크다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  const temp = function (k, u) { return 1 - Math.exp(-RATE[k] * u * 2.2); };   // 0(차가움) ~ 1(상온)
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 296);
      if (run) { t = Math.min(1, t + dt / 5); if (t >= 1) run = false; }
      // 왼쪽 : 실험 장치
      const bx = 70, by = 84, bw = 230, bh = 190, mx = bx + bw / 2;
      c.fillStyle = rgba(COL.muted, 0.18); c.fillRect(bx, by + 18, bw, bh - 18);
      for (let i = 0; i < 14; i++) dot(c, bx + 22 + (i % 2) * 34 + (i % 7 < 3 ? 0 : 140) + (i % 3) * 6, by + 40 + Math.floor(i / 2) % 6 * 26, 4, COL.muted);
      c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 8, by - 6); c.lineTo(bx, by); c.lineTo(bx, by + bh); c.lineTo(bx + bw, by + bh); c.lineTo(bx + bw, by); c.stroke();
      c.fillStyle = COL.panel; c.fillRect(mx - 30, by - 40, 60, bh + 30); c.strokeRect(mx - 30, by - 40, 60, bh + 30);
      const water = mix(COL.cold, COL.heat, temp(mat, t) * 0.7);
      c.fillStyle = rgba(water, 0.35); c.fillRect(mx - 28, by + 40, 56, bh - 52);
      for (let i = 0; i < 8; i++) { c.fillStyle = COL.ink; c.fillRect(mx - 30, by - 30 + i * 24, 12, 2); }
      c.strokeStyle = COL.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(mx, by - 80); c.lineTo(mx, by + bh - 24); c.stroke();
      dot(c, mx, by + bh - 24, 9, COL.ink);
      txt(c, '온도계', mx + 30, by - 72, { size: 20 }); txt(c, '눈금실린더', bx + bw + 14, by + 10, { size: 20 }); txt(c, '차가운 물', bx + bw + 14, by + 80, { size: 20 });
      txt(c, '물질 ' + 'ABC'[mat], bx + bw + 14, by + 160, { size: 20, color: COL.energy }); txt(c, '비커', bx - 60, by + 60, { size: 20 });
      if (run || t < 1) { [[bx - 40, by + 120], [bx + bw + 18, by + 130]].forEach(function (p, i) { arrow(c, p[0], p[1], p[0] + (i ? -30 : 30), p[1], { width: 3, head: 10, color: COL.heat }); }); }
      // 오른쪽 : 결과 그래프
      const ax = KIT.axes(c, { x: 500, y: 34, w: 320, h: 222 }, '시간', '온도');
      KIT.dash(c, 500, ax.Y(0.92), 830, ax.Y(0.92), COL.muted, 2, [5, 5]); txt(c, '상온', 830, ax.Y(0.92) - 16, { size: 18, align: 'right', color: COL.muted });
      ['A', 'B', 'C'].forEach(function (nm, k) {
        const on = k === mat, upto = on ? t : 1;
        KIT.plot(c, ax, function (u) { return 0.15 + 0.77 * temp(k, u); }, 0, Math.max(0.001, upto), on ? COL.energy : rgba(COL.ink, 0.55), on ? 5 : 3, 80);
        txt(c, nm, ax.X(0.35 + k * 0.12) - 6, ax.Y(0.15 + 0.77 * temp(k, 0.35 + k * 0.12)) - 18, { size: 22, color: on ? COL.energy : COL.ink });
      });
    },
  };
}

/* ── 심화 ── */
function sceneDeep(root) {
  KIT.problem(root, {
    level: '심화',
    stem: ['열팽창과 단열을 활용한 예에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?'],
    bogi: ['ㄱ. 꽉 닫힌 금속 병뚜껑을 뜨거운 물에 담그면 열기 쉬워진다.', 'ㄴ. 보온병 안쪽의 은도금 면은 주로 전도를 막는다.', 'ㄷ. 철도 레일의 이음매에 틈을 두는 것은 열팽창 때문이다.'],
    choices: ['① ㄱ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄱ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  return { tick: function () {} };
}
