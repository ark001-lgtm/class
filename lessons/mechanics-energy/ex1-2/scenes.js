/* ═══════════════ 1-2 포물선 운동 연습문제 : 장면 ═══════════════
   기본 : 같은 시간 간격으로 찍은 위치 → 응용 : 옥상 양쪽에서 v · 2v 로 수평 던지기 → 심화 : 30° · 60° 로 같은 속력 던지기. */
const PART = '1-2 포물선 운동 연습문제';
const SCENE_LIST = [
  { id: 'basic', part: PART, title: '기본', make: sceneBasic },
  { id: 'apply', part: PART, title: '응용', make: sceneApply },
  { id: 'deep', part: PART, title: '심화', make: sceneDeep },
];
const DEG = Math.PI / 180;
function ball(c, x, y, r) { dot(c, x, y, r || 12, COL['panel-2']); c.strokeStyle = COL.ink; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, r || 12, 0, Math.PI * 2); c.stroke(); }

/* ── 기본 : 같은 시간 간격의 위치 ── */
function sceneBasic(root) {
  const cv = makeCanvas(860, 280);
  let t = -1;
  const comp = KIT.toggle('수평 · 연직으로 나누어 보기');
  const throwBtn = KIT.btn('던지기', function () { t = 0; }, true);
  KIT.problem(root, {
    level: '기본',
    stem: ['그림은 지면에서 비스듬히 던진 물체의 위치를 같은 시간 간격으로 나타낸 것이다.'],
    cv: cv, ctrl: [throwBtn, comp.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, 공기 저항은 무시한다.)',
    bogi: ['ㄱ. 같은 시간 동안 수평 방향으로 이동한 거리는 일정하다.', 'ㄴ. 최고점에서 물체의 속도는 0 이다.', 'ㄷ. 알짜힘의 방향은 연직 아래 방향이다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  const gy = 250, x0 = 90, R = 680, H = 180, N = 8;
  const pos = function (u) { return [x0 + R * u, gy - 4 * H * u * (1 - u)]; };   // u : 0 ~ 1 (시간 비율)
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 280);
      KIT.ground(c, 30, gy, 800);
      const shown = t < 0 ? N : Math.min(N, Math.floor(t / 0.35 * 1));
      if (t >= 0) t += dt;
      const pts = []; for (let i = 0; i <= 60; i++) pts.push(pos(i / 60));
      c.setLineDash([3, 5]); KIT.line(c, pts, COL.muted, 2); c.setLineDash([]);
      for (let i = 0; i <= shown; i++) {
        const p = pos(i / N);
        if (comp.on()) {
          KIT.dash(c, p[0], p[1], p[0], gy, rgba(COL.cold, 0.6), 2, [4, 4]); KIT.dash(c, p[0], p[1], 50, p[1], rgba(COL.heat, 0.6), 2, [4, 4]);
          dot(c, p[0], gy + 14, 6, COL.cold); dot(c, 50, p[1], 6, COL.heat);
        }
        ball(c, p[0], p[1], 11);
      }
      if (t >= 0 && shown < N) { const u = Math.min(1, t / (0.35 * N)), p = pos(u); dot(c, p[0], p[1], 9, COL.energy); }
      if (t > 0.35 * N + 1.5) t = -1;
      if (comp.on()) { txt(c, '수평 : 같은 간격', 600, 30, { size: 20, color: COL.cold }); txt(c, '연직 : 간격이 변한다', 600, 58, { size: 20, color: COL.heat }); c.fillStyle = COL.line; c.fillRect(48, 50, 3, gy - 50); }
    },
  };
}

/* ── 응용 : 옥상 양쪽에서 v · 2v 로 수평으로 던지기 ── */
function sceneApply(root) {
  const cv = makeCanvas(860, 300);
  let t = -1, trail = [];
  const throwBtn = KIT.btn('동시에 던지기', function () { t = 0; trail = []; }, true);
  KIT.problem(root, {
    level: '응용',
    stem: ['그림과 같이 높이가 h 인 건물 옥상의 양쪽 끝에서 물체 A, B 를 각각 v, 2v 의 속력으로 수평 방향으로 동시에 던졌다.'],
    cv: cv, ctrl: [throwBtn],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, h ≠ 0 이고, 물체의 크기와 공기 저항은 무시한다.)',
    bogi: ['ㄱ. B 가 A 보다 먼저 지면에 도달한다.', 'ㄴ. 수평 도달 거리는 B 가 A 의 2배이다.', 'ㄷ. 지면에 도달하는 순간의 속력은 B 가 A 의 2배이다.'],
    choices: ['① ㄴ', '② ㄷ', '③ ㄱ, ㄴ', '④ ㄱ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  const gy = 276, bx0 = 360, bx1 = 500, top = 126, g = 210, v = 140, T = Math.sqrt(2 * (gy - 12 - top + 12) / g);
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      KIT.ground(c, 20, gy, 820);
      c.fillStyle = rgba(COL.muted, 0.12); c.fillRect(bx0, top, bx1 - bx0, gy - top); c.strokeStyle = COL.ink; c.lineWidth = 3; c.strokeRect(bx0, top, bx1 - bx0, gy - top);
      arrow(c, bx0 + 70, top + 6, bx0 + 70, gy - 4, { width: 2, head: 10, color: COL.ink }); arrow(c, bx0 + 70, gy - 6, bx0 + 70, top + 4, { width: 2, head: 10, color: COL.ink });
      txt(c, 'h', bx0 + 84, (top + gy) / 2, { size: 26, color: COL.ink });
      let tt = t < 0 ? 0 : Math.min(t, T);
      if (t >= 0) { t += dt; if (Math.floor(t * 12) > trail.length && t < T) trail.push(tt); }
      const yA = top - 12 + 0.5 * g * tt * tt, xA = bx0 + 12 - v * tt, xB = bx1 - 12 + 2 * v * tt;
      trail.forEach(function (s) { const y = top - 12 + 0.5 * g * s * s; dot(c, bx0 + 12 - v * s, y, 3, rgba(COL.cold, 0.6)); dot(c, bx1 - 12 + 2 * v * s, y, 3, rgba(COL.heat, 0.6)); });
      ball(c, xA, Math.min(yA, gy - 12)); ball(c, xB, Math.min(yA, gy - 12));
      if (t < 0) {
        arrow(c, xA - 16, top - 12, xA - 90, top - 12, { width: 3, head: 12, color: COL.ink }); txt(c, 'v', xA - 70, top - 36, { size: 24, color: COL.ink });
        arrow(c, xB + 16, top - 12, xB + 160, top - 12, { width: 3, head: 12, color: COL.ink }); txt(c, '2v', xB + 100, top - 36, { size: 24, color: COL.ink });
      }
      txt(c, 'A', xA, top - 46 + (t < 0 ? 0 : -999), { size: 24, align: 'center' }); txt(c, 'B', xB, top - 46 + (t < 0 ? 0 : -999), { size: 24, align: 'center' });
      if (t >= T) txt(c, 'A 와 B 가 동시에 지면에 닿았다', 430, 30, { size: 22, align: 'center', color: COL.energy });
      if (t > T + 2.5) { t = -1; trail = []; }
    },
  };
}

/* ── 심화 : 30° · 60° 로 같은 속력 v 던지기 ── */
function sceneDeep(root) {
  const cv = makeCanvas(860, 300);
  let t = -1;
  const peak = KIT.toggle('최고점 표시');
  const throwBtn = KIT.btn('던지기', function () { t = 0; }, true);
  KIT.problem(root, {
    level: '심화',
    stem: ['그림과 같이 수평한 지면의 한 지점에서 질량이 같은 물체 A, B 를 같은 속력 v 로 각각 지면과 30°, 60° 의 각을 이루는 방향으로 던졌다.'],
    cv: cv, ctrl: [throwBtn, peak.el],
    ask: '이에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? (단, sin 30° = cos 60° = [[1|2]], sin 60° = cos 30° = [[√3|2]] 이고, 물체의 크기와 공기 저항은 무시한다.)',
    bogi: ['ㄱ. 수평 도달 거리는 A 와 B 가 같다.', 'ㄴ. 최고점의 높이는 B 가 A 의 3배이다.', 'ㄷ. 최고점에서의 운동 에너지는 A 가 B 의 3배이다.'],
    choices: ['① ㄱ', '② ㄴ', '③ ㄱ, ㄷ', '④ ㄴ, ㄷ', '⑤ ㄱ, ㄴ, ㄷ'],
  });
  // 문제 그림처럼 한 점에서 A 는 오른쪽으로 30°, B 는 왼쪽으로 60° 로 던진다
  const gy = 280, x0 = 430, g = 300, R = 370, v = Math.sqrt(R * g / Math.sin(60 * DEG));
  const path = function (th, dir, s) { return [x0 + dir * v * Math.cos(th) * s, gy - (v * Math.sin(th) * s - 0.5 * g * s * s)]; };
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 860, 300);
      KIT.ground(c, 30, gy, 800);
      const TA = 2 * v * Math.sin(30 * DEG) / g, TB = 2 * v * Math.sin(60 * DEG) / g;
      if (t >= 0) { t += dt; if (t > TB + 2) t = -1; }
      [[30, 1, 'A', COL.cold, TA], [60, -1, 'B', COL.heat, TB]].forEach(function (o) {
        const th = o[0] * DEG, dir = o[1];
        if (t >= 0) {
          const s1 = Math.min(t, o[4]), pts = [];
          for (let i = 0; i <= 40; i++) pts.push(path(th, dir, s1 * i / 40));
          KIT.line(c, pts, rgba(o[3], 0.7), 3);
          const p = path(th, dir, s1); ball(c, p[0], p[1], 10);
          if (peak.on() && t >= o[4] / 2) { const top = path(th, dir, o[4] / 2); KIT.dash(c, x0, top[1], top[0], top[1], o[3], 2, [6, 5]); txt(c, o[2] + ' 최고점', top[0] + dir * 14, top[1] - 16, { size: 20, color: o[3], align: dir > 0 ? 'left' : 'right' }); }
          if (t >= o[4]) { const end = path(th, dir, o[4]); KIT.dash(c, x0, gy + 10, end[0], gy + 10, o[3], 3, [8, 4]); }
        } else {
          const L = 200;
          arrow(c, x0, gy, x0 + dir * L * Math.cos(th), gy - L * Math.sin(th), { width: 4, head: 16, color: COL.ink });
          txt(c, o[2], x0 + dir * (L + 26) * Math.cos(th), gy - (L + 26) * Math.sin(th), { size: 28, align: 'center' });
          txt(c, 'v', x0 + dir * 110 * Math.cos(th) + (dir > 0 ? -4 : 22), gy - 110 * Math.sin(th) - 20, { size: 24 });
          c.strokeStyle = COL.ink; c.lineWidth = 2; c.beginPath();
          if (dir > 0) c.arc(x0, gy, 80, -th, 0); else c.arc(x0, gy, 80, Math.PI, Math.PI + th);
          c.stroke();
          txt(c, o[0] + '°', x0 + dir * 98 * Math.cos(th / 2) + (dir > 0 ? 0 : -16), gy - 98 * Math.sin(th / 2), { size: 22, align: 'center' });
        }
      });
      if (t > TB) txt(c, '두 물체가 던진 곳에서 같은 거리에 떨어졌다', 430, 30, { size: 22, align: 'center', color: COL.energy });
    },
  };
}
