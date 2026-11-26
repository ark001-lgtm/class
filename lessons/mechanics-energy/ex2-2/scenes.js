/* ═══════════════ 2-2 이상 기체 법칙 연습문제 : 장면 ═══════════════
   기본 : 압력이 일정할 때 온도와 부피 → 응용 : 얼음을 가열할 때의 온도 – 시간 그래프 → 심화 : 0 ℃ 얼음을 20 ℃ 물로 만드는 열량. */
const PART = '2-2 이상 기체 법칙 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];

/* ── 기본 ── */
function sceneBasic(root) {
  KIT.problem(root, {
    level: '기본',
    stem: ['압력이 일정한 상태에서 온도가 27 ℃ 이고 부피가 6 L 인 이상 기체의 온도를 127 ℃ 로 높였다. 이상 기체 상태 방정식 PV = nRT 에서 온도 T 는 절대 온도이고 단위는 켈빈(K)이며, 절대 온도 T 와 섭씨온도 t 사이에는 T = t + 273 의 관계가 있다.'],
    ask: '이때 기체의 부피는? (단, 기체의 양은 변하지 않는다.)',
    choices: ['① 1.3 L', '② 4.5 L', '③ 6 L', '④ 8 L', '⑤ 28.2 L'],
  });
  return { tick: function () {} };
}

/* ── 응용 : 얼음 가열 곡선 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 300);
  let t = -1;
  const state = KIT.toggle('물질 모습 보기');
  const heat = KIT.btn('가열하기', function () { t = 0; }, true);
  KIT.problem(root, {
    level: '응용',
    stem: ['그래프는 −20 ℃ 의 얼음을 일정한 세기의 열원으로 가열할 때 시간에 따른 온도를 나타낸 것이다.'],
    cv: cv, ctrl: [heat, state.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, 열원에서 나온 열은 모두 얼음과 물이 흡수한다.)',
    bogi: ['ㄱ. ㉡ 구간에서 물질은 고체 상태로만 존재한다.', 'ㄴ. ㉣ 구간에서는 온도가 일정하므로 열을 흡수하지 않는다.', 'ㄷ. 얼음의 비열은 물의 비열보다 작다.'],
    choices: ['① ㄴ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄱ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  // 그래프 꺾이는 점 (시간 비율, 온도 ℃)
  const P = [[0, -20], [0.05, 0], [0.18, 0], [0.70, 100], [0.86, 100]];
  const tempAt = function (u) { for (let i = 1; i < P.length; i++) if (u <= P[i][0]) { const f = (u - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f; } return 100; };
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      const ox = 110, w = 600, Y = function (T) { return 250 - (T + 20) * 1.75; }, X = function (u) { return ox + u * w / 0.9; };
      arrow(c, ox, 260, ox + w + 50, 260, { width: 2.5, head: 14, color: COL.ink }); arrow(c, ox, 270, ox, 20, { width: 2.5, head: 14, color: COL.ink });
      txt(c, '온도(℃)', ox + 14, 26, { size: 22 }); txt(c, '시간', ox + w + 40, 284, { size: 22, align: 'right' });
      [[100, '100'], [0, '0'], [-20, '−20']].forEach(function (o) { txt(c, o[1], ox - 12, Y(o[0]), { size: 20, align: 'right' }); });
      KIT.dash(c, ox, Y(0), X(P[1][0]), Y(0), COL.muted, 2, [4, 4]); KIT.dash(c, ox, Y(100), X(P[3][0]), Y(100), COL.muted, 2, [4, 4]);
      KIT.line(c, P.map(function (p) { return [X(p[0]), Y(p[1])]; }), COL.ink, 4);
      [['㉠', 0.04, -14, 30], ['㉡', 0.115, 0, -26], ['㉢', 0.47, 52, -24], ['㉣', 0.80, 100, -26]].forEach(function (o) { txt(c, o[0], X(o[1]) + (o[0] === '㉠' ? 28 : 0), Y(o[2]) + o[3], { size: 24, align: 'center' }); });
      if (t >= 0) {
        t += dt / 7;
        const u = Math.min(t, 0.86), T = tempAt(u);
        dot(c, X(u), Y(T), 10, COL.heat);
        txt(c, KIT.fmt(T, 0) + ' ℃', X(u) + 16, Y(T) + 26, { size: 20, color: COL.heat });
        if (state.on()) {
          const bx = 730, by = 150, phase = u < 0.05 ? 0 : u < 0.18 ? 1 : u < 0.70 ? 2 : 3, melt = phase === 1 ? (u - 0.05) / 0.13 : phase > 1 ? 1 : 0;
          c.strokeStyle = COL.ink; c.lineWidth = 3; c.strokeRect(bx, by, 100, 100);
          if (phase >= 1) { c.fillStyle = rgba(COL.cold, 0.35); c.fillRect(bx + 2, by + 100 - 70 * Math.max(melt, 0.15), 96, 70 * Math.max(melt, 0.15) - 2); }
          const cubes = phase === 0 ? 4 : phase === 1 ? Math.round(4 * (1 - melt)) : 0;
          for (let i = 0; i < cubes; i++) { c.fillStyle = '#DCEFFB'; c.fillRect(bx + 10 + (i % 2) * 44, by + 54 - Math.floor(i / 2) * 36, 34, 32); c.strokeStyle = COL.cold; c.lineWidth = 2; c.strokeRect(bx + 10 + (i % 2) * 44, by + 54 - Math.floor(i / 2) * 36, 34, 32); }
          if (phase === 3) for (let i = 0; i < 6; i++) { c.strokeStyle = COL.cold; c.beginPath(); c.arc(bx + 20 + i * 13, by + 90 - ((t * 200 + i * 23) % 60), 5, 0, Math.PI * 2); c.stroke(); }
          txt(c, ['얼음', '얼음 + 물', '물', '물 + 수증기'][phase], bx + 50, by + 124, { size: 20, align: 'center', color: COL.energy });
        }
        if (t > 1.1) t = -1;
      }
    },
  };
}

/* ── 심화 ── */
function sceneDeep(root) {
  KIT.problem(root, {
    level: '심화',
    stem: ['0 ℃ 의 얼음 0.5 kg 을 가열하여 모두 20 ℃ 의 물로 만드는 데 필요한 열량은? (단, 물의 비열은 4200 J/(kg·K), 얼음의 융해열은 336000 J/kg 이다.)'],
    choices: ['① 42000 J', '② 168000 J', '③ 210000 J', '④ 336000 J', '⑤ 378000 J'],
  });
  return { tick: function () {} };
}
