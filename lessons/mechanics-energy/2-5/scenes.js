/* ═══════════════ 05. 열역학 제2법칙 : 장면 ═══════════════
   수업 흐름 : 비가역 현상 → 분자 4개로 경우의 수 세기 → 분자가 많아지면
   → 엔트로피 → 제2법칙의 여러 표현 → 더 생각하기 → 예제 → 거꾸로 영상 맞히기.
   학습지 빈칸 : ① 비가역 ② 찬 곳 ③ 16 ④ 많고 ⑤ 크다 ⑥ 않는다 ⑦ 감소 ⑧ 8 ⑨ 작아진다 ⑩ 보존
   영상은 늘 같은 모습이 나오도록 정해진 난수로 미리 계산해 두고, 앞으로 · 거꾸로 돌린다. */

/* ═══════════════ 작은 도구 ═══════════════ */
/** 늘 같은 순서로 나오는 난수 */
function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function tabRow(names, onPick) {
  return names.map(function (t, i) { return h('button', { class: 'tab', type: 'button', role: 'tab', style: 'min-height:68px', onclick: function () { onPick(i); } }, h('b', { text: t })); });
}
function selectTab(tabs, i) { tabs.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); }); }
/** 분수 : frac('1', '2^{N}') */
function frac(a, b) { return h('span', { class: 'frac' }, h('span', { class: 'fn' }, rich(a)), h('span', { class: 'fd' }, rich(b))); }
function comma(n) { return Math.round(n).toLocaleString('en-US'); }
/** 에너지 크기에 따른 색 : 0 파랑 → 0.5 회색 → 1 주황 */
function warmth(t) { t = clamp(t, 0, 1); return t < 0.5 ? mix(COL.cold, COL.muted, t * 2) : mix(COL.muted, COL.heat, (t - 0.5) * 2); }
/** 경우의 수 nCk */
function nCk(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
const LOGF = [0];
for (let i = 1; i <= 1000; i++) LOGF[i] = LOGF[i - 1] + Math.log(i);
function popcount(m) { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; }
function cross(c, x, y, r, color) {
  c.strokeStyle = color || COL.pen; c.lineWidth = Math.max(5, r / 4); c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); c.stroke();
}
function dashLine(c, x1, y1, x2, y2, color, w) {
  c.strokeStyle = color || COL.line; c.lineWidth = w || 3; c.setLineDash([12, 10]);
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
}

/* ═══════════════ 미리 계산한 영상 ═══════════════ */
const FPS = 30;
/** 영상 : 프레임 묶음을 앞으로 · 거꾸로 돌린다. loop 이면 끝에서 잠깐 멈췄다가 다시 */
function makeClip(frames, o) {
  o = o || {};
  const end = (frames.length - 1) / FPS;
  const c = { t: 0, dir: 1, playing: false, loop: !!o.loop, hold: 0, end: end, frames: frames };
  c.index = function () { return clamp(Math.round(c.t * FPS), 0, frames.length - 1); };
  c.frame = function () { return frames[c.index()]; };
  c.step = function (dt) {
    if (c.hold > 0) { c.hold -= dt; if (c.hold <= 0) { c.t = c.dir > 0 ? 0 : end; c.playing = true; } return; }
    if (!c.playing) return;
    c.t += dt * c.dir;
    if (c.t >= end || c.t <= 0) { c.t = clamp(c.t, 0, end); c.playing = false; if (c.loop) c.hold = 1.4; }
  };
  c.play = function (dir) { c.dir = dir; c.hold = 0; c.t = dir > 0 ? 0 : end; c.playing = true; };
  c.reset = function () { c.hold = 0; c.playing = false; c.t = 0; c.dir = 1; };
  /** 영상 안에서 흐른 시간의 비율 (거꾸로 돌릴 때도 0 → 1) */
  c.progress = function () { return c.dir > 0 ? c.t / end : 1 - c.t / end; };
  return c;
}
/** 기체의 확산 : 왼쪽 반에 모인 분자 n 개. 처음 0.8초는 칸막이가 있고 그 뒤 뺀다. 통 폭을 1 로 둔 좌표 */
function gasFrames(n, aspect, seconds, seed) {
  const r = seeded(seed), ps = [], H = aspect, R = 0.02, out = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    ps.push({ x: R + r() * (0.5 - 2 * R), y: R + r() * (H - 2 * R), vx: Math.cos(a) * 0.34, vy: Math.sin(a) * 0.34 });
  }
  const total = Math.round(seconds * FPS), dt = 1 / FPS / 2, wallUntil = Math.round(0.8 * FPS);
  for (let f = 0; f <= total; f++) {
    const fr = new Float32Array(n * 2);
    ps.forEach(function (p, i) { fr[2 * i] = p.x; fr[2 * i + 1] = p.y; });
    out.push(fr);
    const right = f < wallUntil ? 0.5 : 1;
    ps.forEach(function (p) {
      for (let s = 0; s < 2; s++) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < R) { p.x = 2 * R - p.x; p.vx = Math.abs(p.vx); }
        if (p.x > right - R) { p.x = 2 * (right - R) - p.x; p.vx = -Math.abs(p.vx); }
        if (p.y < R) { p.y = 2 * R - p.y; p.vy = Math.abs(p.vy); }
        if (p.y > H - R) { p.y = 2 * (H - R) - p.y; p.vy = -Math.abs(p.vy); }
      }
    });
  }
  out.wallUntil = wallUntil;
  return out;
}
/** 잉크의 퍼짐 : 물 위쪽에 떨어진 잉크 알갱이가 가라앉으며 이리저리 흩어진다 */
function inkFrames(n, aspect, seconds, seed) {
  const r = seeded(seed), H = aspect, out = [], ps = [], m = 0.035;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.05;
    ps.push({ x: 0.5 + Math.cos(a) * d, y: 0.12 + Math.sin(a) * d * 0.8, a: r() * Math.PI * 2, sink: 0.1 + r() * 0.08 });
  }
  const total = Math.round(seconds * FPS), dt = 1 / FPS;
  for (let f = 0; f <= total; f++) {
    const fr = new Float32Array(n * 2);
    ps.forEach(function (p, i) { fr[2 * i] = p.x; fr[2 * i + 1] = p.y; });
    out.push(fr);
    ps.forEach(function (p) {
      p.a += (r() - 0.5) * 1.6;
      p.x += Math.cos(p.a) * 0.16 * dt; p.y += (Math.sin(p.a) * 0.16 + p.sink) * dt;
      p.sink *= 0.985;
      if (p.x < m) { p.x = 2 * m - p.x; p.a = Math.PI - p.a; }
      if (p.x > 1 - m) { p.x = 2 * (1 - m) - p.x; p.a = Math.PI - p.a; }
      if (p.y < m) { p.y = 2 * m - p.y; p.a = -p.a; }
      if (p.y > H - m) { p.y = 2 * (H - m) - p.y; p.a = -p.a; p.sink = 0; }
    });
  }
  return out;
}
/** 열의 이동 : 원자 8×4 (왼쪽 4줄 뜨거운 물체, 오른쪽 4줄 찬 물체). 이웃한 원자끼리 에너지 차이에 비례해 에너지가 옮겨 간다.
    전체 에너지는 그대로이고, 약 8초 뒤 두 물체의 온도(원자 하나의 평균 에너지)가 똑같아진다.
    (원자 수가 적은 그림이라 알갱이를 무작위로 주고받게 하면 평균이 계속 들쭉날쭉해서, 실제 물체처럼 고르게 흐르게 했다) */
const HEAT_C = 8, HEAT_R = 4, HEAT_E0 = 6;
function heatFrames(seconds) {
  const n = HEAT_C * HEAT_R, e = new Float32Array(n), out = [], K = 0.045, STEPS = 4;
  for (let i = 0; i < n; i++) e[i] = (i % HEAT_C) < 4 ? HEAT_E0 : 0;
  const total = Math.round(seconds * FPS);
  for (let f = 0; f <= total; f++) {
    out.push(Float32Array.from(e));
    for (let s = 0; s < STEPS; s++) {
      const d = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = i % HEAT_C, y = Math.floor(i / HEAT_C);
        if (x + 1 < HEAT_C) { const q = K * (e[i] - e[i + 1]); d[i] -= q; d[i + 1] += q; }
        if (y + 1 < HEAT_R) { const q = K * (e[i] - e[i + HEAT_C]); d[i] -= q; d[i + HEAT_C] += q; }
      }
      for (let i = 0; i < n; i++) e[i] += d[i];
    }
  }
  return out;
}
function heatMeans(fr) {
  let a = 0, b = 0;
  for (let i = 0; i < fr.length; i++) { if ((i % HEAT_C) < 4) a += fr[i]; else b += fr[i]; }
  return [a / 16, b / 16];
}

/* ═══════════════ 영상 그리기 ═══════════════ */
/** 기체 : 통과 분자. box = { x, y, w } (높이는 영상의 비율대로) */
function drawGas(c, fr, box, o) {
  o = o || {};
  const n = fr.length / 2, hh = box.w * (o.aspect || 0.55), r = o.r || box.w * 0.018;
  c.fillStyle = COL.panel; c.fillRect(box.x, box.y, box.w, hh);
  if (o.wall) { c.fillStyle = COL.pen; c.fillRect(box.x + box.w / 2 - 4, box.y, 8, hh); }
  else dashLine(c, box.x + box.w / 2, box.y + 6, box.x + box.w / 2, box.y + hh - 6, COL.line, 3);
  c.fillStyle = COL.cold;
  for (let i = 0; i < n; i++) { c.beginPath(); c.arc(box.x + fr[2 * i] * box.w, box.y + fr[2 * i + 1] * box.w, r, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = COL['ink-2']; c.lineWidth = 6; rrect(c, box.x, box.y, box.w, hh, 8); c.stroke();
}
/** 잉크 : 물이 든 비커에 잉크 알갱이를 반투명하게 겹쳐 그린다 */
function drawInk(c, fr, box) {
  const n = fr.length / 2;
  c.fillStyle = rgba(COL.cold, 0.13); c.fillRect(box.x, box.y, box.w, box.h);
  c.save(); c.beginPath(); c.rect(box.x, box.y, box.w, box.h); c.clip();
  c.fillStyle = rgba(COL.energy, 0.24);
  const r = box.w * 0.04;
  for (let i = 0; i < n; i++) { c.beginPath(); c.arc(box.x + fr[2 * i] * box.w, box.y + fr[2 * i + 1] * box.w, r, 0, Math.PI * 2); c.fill(); }
  c.restore();
  c.strokeStyle = rgba(COL.cold, 0.6); c.lineWidth = 3;
  c.beginPath(); c.moveTo(box.x, box.y); c.lineTo(box.x + box.w, box.y); c.stroke();
  c.strokeStyle = COL['ink-2']; c.lineWidth = 6; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(box.x - 3, box.y - box.w * 0.12); c.lineTo(box.x - 3, box.y + box.h + 3); c.lineTo(box.x + box.w + 3, box.y + box.h + 3); c.lineTo(box.x + box.w + 3, box.y - box.w * 0.12); c.stroke();
}
/** 열 : 붙여 놓은 두 물체의 원자. 에너지가 많은 원자일수록 붉고 크게 떤다 */
function drawHeat(c, fr, box, now, o) {
  o = o || {};
  const cw = box.w / HEAT_C, ch = box.h / HEAT_R, m = heatMeans(fr);
  [0, 1].forEach(function (side) {
    c.fillStyle = rgba(warmth(m[side] / HEAT_E0), 0.14);
    rrect(c, box.x + side * box.w / 2, box.y, box.w / 2, box.h, 10); c.fill();
  });
  for (let i = 0; i < fr.length; i++) {
    const x = i % HEAT_C, y = Math.floor(i / HEAT_C), e = fr[i];
    const amp = 1 + Math.sqrt(e) * cw * 0.05, ph = i * 1.7;
    const px = box.x + (x + 0.5) * cw + Math.sin(now * 23 + ph) * amp, py = box.y + (y + 0.5) * ch + Math.cos(now * 19 + ph * 1.3) * amp;
    dot(c, px, py, cw * 0.2 + Math.min(e, 10) * cw * 0.012, warmth(e / HEAT_E0));
  }
  c.strokeStyle = COL['ink-2']; c.lineWidth = 5;
  rrect(c, box.x, box.y, box.w / 2, box.h, 10); c.stroke();
  rrect(c, box.x + box.w / 2, box.y, box.w / 2, box.h, 10); c.stroke();
  if (o.labels !== false) {
    const sz = o.size || 22;
    txt(c, '왼쪽 물체 ' + m[0].toFixed(1), box.x + box.w / 4, box.y + box.h + sz + 8, { size: sz, weight: 700, align: 'center', color: warmth(m[0] / HEAT_E0) });
    txt(c, '오른쪽 물체 ' + m[1].toFixed(1), box.x + box.w * 3 / 4, box.y + box.h + sz + 8, { size: sz, weight: 700, align: 'center', color: warmth(m[1] / HEAT_E0) });
  }
}
/** 재생 막대 */
function progressBar(c, x, y, w, p, dir) {
  c.fillStyle = COL.line; rrect(c, x, y - 4, w, 8, 4); c.fill();
  c.fillStyle = dir < 0 ? COL.pen : COL.ink; rrect(c, x, y - 4, Math.max(8, w * p), 8, 4); c.fill();
  dot(c, x + w * p, y, 9, dir < 0 ? COL.pen : COL.ink);
}

/* ═══════════════ 장면 목록 ═══════════════ */
const PART1 = '1 비가역 현상', PART2 = '2 엔트로피와 방향성';
const SCENE_LIST = [
  { id: 'irrev', part: PART1, title: '비가역 현상', ws: '학습지 1 ① [표 1] ②', sub: '열의 이동 · 기체의 확산 · 잉크의 퍼짐', make: sceneIrrev },
  { id: 'count', part: PART2, title: '경우의 수 세기', ws: '학습지 2-(1) ③', sub: '분자 4개를 왼쪽 · 오른쪽에 나누어 넣기', make: sceneCount },
  { id: 'bign', part: PART2, title: '분자가 많아지면', ws: '학습지 2-(1) ▶ ④', sub: '한쪽에 몰릴 확률 1/2^{N}', make: sceneBigN },
  { id: 'entropy', part: PART2, title: '엔트로피', ws: '학습지 2-(2) ⑤', sub: '경우의 수가 많을수록 엔트로피가 크다', make: sceneEntropy },
  { id: 'forms', part: PART2, title: '제2법칙의 여러 표현', ws: '학습지 2 [표 2] ⑥⑦', sub: '열의 이동 · 열기관 · 엔트로피', make: sceneForms },
  { id: 'mis', part: PART2, title: '더 생각하기', ws: '생각 넓히기', sub: '금지일까 확률일까 · 냉장고 속 엔트로피', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑧⑨⑩', sub: '분자 3개 · 10개일 때 경우의 수', make: sceneEx },
  { id: 'guess', part: '정리', title: '거꾸로 영상 맞히기', ws: '확인 활동', sub: '정방향일까, 거꾸로 돌린 것일까?', make: sceneGuess },
];

/* ═══════════════ 1. 비가역 현상 : 세 가지 영상을 앞으로 · 거꾸로 ═══════════════ */
const GAS_A = 0.5;
const CLIPS3 = {
  heat: heatFrames(10),
  gas: gasFrames(46, GAS_A, 8, 11),
  ink: inkFrames(120, 0.5, 9, 3),
};
function sceneIrrev(root) {
  const DEF = [
    { k: 'heat', name: '열의 이동', real: ['뜨거운 곳 → ', blank('2', '②', '찬 곳')], why: '에너지는 보존되지만 저절로 거꾸로 가지 않는다' },
    { k: 'gas', name: '기체의 확산', real: ['한쪽에 모인 기체 → 골고루 퍼짐'], why: '저절로 다시 한쪽에 모이지 않는다' },
    { k: 'ink', name: '잉크의 퍼짐', real: ['물에 골고루 섞임'], why: '섞인 잉크가 저절로 다시 모이지 않는다' },
  ];
  const items = DEF.map(function (d) {
    const cv = makeCanvas(590, 390), clip = makeClip(CLIPS3[d.k]);
    const fwd = h('button', { class: 'btn small primary', type: 'button', text: '▶ 재생', onclick: function () { clip.play(1); } });
    const rev = h('button', { class: 'btn small', type: 'button', text: '⟲ 거꾸로 돌려 보기', onclick: function () { clip.play(-1); } });
    const rst = h('button', { class: 'btn small', type: 'button', text: '처음', onclick: function () { clip.reset(); } });
    const el = h('section', { class: 'panel card3' },
      h('div', { class: 'c-title' }, h('b', { text: d.name })),
      cv.c,
      h('div', { class: 'ctrl', style: 'padding:8px 22px 4px;gap:10px' }, fwd, rev, rst),
      h('div', { class: 'c-body' },
        h('div', { class: 'kv' }, h('b', { text: '실제 방향' }), h('span', { style: 'font-weight:600' }, d.real)),
        h('div', { class: 'kv' }, h('b', { text: '거꾸로는?' }), h('span', { text: d.why }))));
    return { d: d, cv: cv, clip: clip, el: el };
  });
  root.append(h('div', { class: 'col', style: 'height:100%;gap:16px' },
    h('div', { class: 'row', style: 'align-items:baseline;gap:28px' },
      h('p', { class: 'ws', style: 'font-size:30px' }, '• 반대 방향으로 일어나도 에너지는 보존되는데, 실제로는 한쪽으로만 일어나는 현상들이 있다.')),
    h('p', { class: 'ws', style: 'font-size:32px;font-weight:600' }, '• 이렇게 저절로 되돌아가지 않는 변화를 ', blank('1', '①', '비가역'), ' 현상이라고 한다.'),
    h('div', { class: 'cards3', style: 'flex:1;min-height:0' }, items.map(function (it) { return it.el; })),
    h('div', { class: 'callout', style: 'font-size:26px' }, '※ 세 경우 모두 반대 방향으로 일어나도 에너지 보존에는 어긋나지 않는다. 그런데도 일어나지 않는다. ', h('b', { text: '왜 그럴까?' }))));
  return {
    tick: function (dt, now) {
      items.forEach(function (it) {
        const c = it.cv.ctx, clip = it.clip, k = it.d.k;
        clip.step(dt);
        c.clearRect(0, 0, 590, 390);
        const fr = clip.frame();
        if (k === 'heat') {
          drawHeat(c, fr, { x: 45, y: 56, w: 500, h: 224 }, now, { size: 23 });
          let tot = 0; for (let i = 0; i < fr.length; i++) tot += fr[i];
          txt(c, '전체 에너지 ' + Math.round(tot) + ' (그대로)', 295, 24, { size: 21, weight: 600, color: COL.muted, align: 'center' });
        } else if (k === 'gas') {
          drawGas(c, fr, { x: 35, y: 62, w: 520 }, { aspect: GAS_A, wall: clip.index() < CLIPS3.gas.wallUntil, r: 10 });
        } else {
          drawInk(c, fr, { x: 45, y: 84, w: 500, h: 250 });
        }
        progressBar(c, 60, 372, 470, clip.progress(), clip.dir);
        if (clip.dir < 0 && (clip.playing || clip.t < clip.end)) pill(c, '거꾸로 : 실제로는 일어나지 않는다', 295, k === 'heat' ? 345 : 26, COL.pen, { align: 'center', size: 20 });
      });
    },
  };
}

/* ═══════════════ 2-(1) 경우의 수 세기 : 분자 4개 ═══════════════
   분자 A~D 는 단추라서 펜으로 톡 눌러도 옮겨진다. 16가지 배치를 '왼쪽에 있는 분자 수'로 묶어 보여 준다. */
const MOL_COL = ['cold', 'heat', 'work', 'energy'];
const MOL_NAME = ['A', 'B', 'C', 'D'];
const COUNT_STEPS = [
  { what: '분자 하나는 왼쪽 또는 오른쪽 두 곳 중 하나에 있을 수 있다.', eq: function () { return ['전체 경우의 수 = 2', h('sup', { text: '4' }), ' = ', blank('3', '③', '16')]; }, note: '분자 4개가 각각 2가지이므로 곱한다.', col: -1 },
  { what: '4개가 모두 왼쪽에 몰리는 경우의 수는 1가지뿐이다.', eq: function () { return ['확률 = ', frac('1', '16')]; }, note: '모두 왼쪽인 배치는 한 가지밖에 없다.', col: 0 },
  { what: '2개씩 나뉘는 경우의 수는 6가지이다.', eq: function () { return ['확률 = ', frac('6', '16')]; }, note: '4개 중 2개를 고르는 경우의 수이다.', col: 2 },
  { what: '분자 수가 N 개면 전체 경우의 수는 2^{N} 이다.', eq: function () { return ['한쪽에 몰릴 확률 = ', frac('1', '2^{N}')]; }, note: '실제 기체는 N 이 10^{23} 정도로 어마어마하게 크다.', col: -1 },
];
function sceneCount(root) {
  let mask = 0b1011, step = 0, shakes = 0;
  const tally = [0, 0, 0, 0, 0];                   // 왼쪽에 있는 분자 수별로 나온 횟수
  const cv = makeCanvas(1000, 820);
  const SLOT = function (i, left) { return { x: (left ? 190 : 630) + (i % 2) * 180, y: 165 + (i >> 1) * 130 }; };
  const mols = MOL_NAME.map(function (nm, i) {
    return h('button', { class: 'mol', type: 'button', style: 'background:var(--' + MOL_COL[i] + ')', 'aria-label': '분자 ' + nm + ' 옮기기', text: nm,
      onclick: function () { mask ^= (1 << i); place(); } });
  });
  function place() {
    mols.forEach(function (b, i) { const p = SLOT(i, !!(mask & (1 << i))); b.style.left = p.x + 'px'; b.style.top = p.y + 'px'; });
  }
  const rnd = seeded(Date.now() & 0xffff);
  function shake(times) {
    for (let t = 0; t < times; t++) { mask = Math.floor(rnd() * 16); tally[popcount(mask)]++; shakes++; }
    place();
  }
  const stepsBox = h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:14px' });
  const nextBtn = h('button', { class: 'btn primary', type: 'button', style: 'min-width:230px', onclick: function () { if (step < COUNT_STEPS.length) { step++; renderSteps(); } } });
  function renderSteps() {
    stepsBox.replaceChildren();
    COUNT_STEPS.forEach(function (s, i) {
      stepsBox.append(h('div', { class: 'step' + (i < step ? ' on' : ''), style: 'padding:12px 18px' },
        h('span', { class: 's-no', text: (i + 1) + '단계' }),
        h('span', { class: 's-what' }, rich(s.what)),
        h('span', { class: 's-eq', style: 'font-size:32px' }, s.eq()),
        h('span', { class: 's-note' }, rich(s.note))));
    });
    nextBtn.disabled = step >= COUNT_STEPS.length;
    nextBtn.textContent = step >= COUNT_STEPS.length ? '4단계까지 봄' : '다음 단계 (' + (step + 1) + '/' + COUNT_STEPS.length + ')';
  }
  root.append(h('div', { class: 'row', style: 'height:100%;gap:22px' },
    h('section', { class: 'panel col fix', style: 'padding:0;gap:0' },
      h('div', { class: 'canvas-wrap' }, cv.c, mols),
      h('div', { class: 'ctrl', style: 'padding:4px 22px 14px;gap:12px' },
        h('button', { class: 'btn small', type: 'button', text: '한 번 흔들기', onclick: function () { shake(1); } }),
        h('button', { class: 'btn small', type: 'button', text: '100번 흔들기', onclick: function () { shake(100); } }),
        h('button', { class: 'btn small', type: 'button', text: '기록 지우기', onclick: function () { tally.fill(0); shakes = 0; } }),
        h('span', { class: 'hint', text: '분자를 누르면 반대쪽으로 옮겨진다' }))),
    h('section', { class: 'panel col fill pad', style: 'gap:14px;min-height:0' },
      h('p', { class: 'cap', text: '공식 유도 ─ 확률로 이해하는 방향성' }),
      h('p', { class: 'ws sm' }, '칸막이가 없는 통 안에 기체 분자 4개가 들어 있다. 통을 왼쪽과 오른쪽으로 나누어 생각한다.'),
      stepsBox,
      h('div', { class: 'row', style: 'gap:12px;margin-top:auto' }, nextBtn,
        h('button', { class: 'btn', type: 'button', text: '처음부터', onclick: function () { step = 0; renderSteps(); } }),
        h('button', { class: 'btn', type: 'button', text: '분자가 많아지면 →', onclick: function () { goId('bign'); } })))));
  place(); renderSteps();
  const groups = [4, 3, 2, 1, 0].map(function (left) {
    const ms = []; for (let m = 0; m < 16; m++) if (popcount(m) === left) ms.push(m);
    return { left: left, masks: ms };
  });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 1000, 820);
      const nl = popcount(mask);
      txt(c, '분자 4개를 통의 왼쪽 · 오른쪽에 나누어 넣는 방법', 60, 40, { size: 28, weight: 700 });
      c.fillStyle = COL.panel; c.fillRect(60, 80, 880, 300);
      dashLine(c, 500, 92, 500, 368, COL.line, 4);
      c.strokeStyle = COL['ink-2']; c.lineWidth = 6; rrect(c, 60, 80, 880, 300, 10); c.stroke();
      txt(c, '왼쪽', 280, 362, { size: 22, weight: 700, color: COL.muted, align: 'center' });
      txt(c, '오른쪽', 720, 362, { size: 22, weight: 700, color: COL.muted, align: 'center' });
      txt(c, '지금 왼쪽 ' + nl + '개 · 오른쪽 ' + (4 - nl) + '개 → 이렇게 나뉘는 배치 ' + nCk(4, nl) + '가지', 60, 418, { size: 24, weight: 700, color: COL.energy });
      const focus = step > 0 ? COUNT_STEPS[step - 1].col : -1;
      groups.forEach(function (g, j) {
        const x0 = 60 + j * 176, cx = x0 + 88;
        if (j === focus || g.left === nl) { c.fillStyle = j === focus ? rgba(COL.energy, 0.12) : rgba(COL.ink, 0.05); rrect(c, x0 + 4, 446, 168, 366, 12); c.fill(); }
        txt(c, '왼쪽 ' + g.left + '개', cx, 470, { size: 23, weight: 700, align: 'center' });
        txt(c, g.masks.length + '가지', cx, 500, { size: 24, weight: 700, align: 'center', color: COL.energy, mono: true });
        if (shakes) txt(c, tally[g.left] + '번 (' + Math.round(tally[g.left] / shakes * 100) + '%)', cx, 528, { size: 18, align: 'center', color: COL.muted, mono: true });
        g.masks.forEach(function (m, r) {
          const bx = x0 + 14, by = 546 + r * 44, bw = 148, bh = 36, on = m === mask;
          c.fillStyle = COL.panel; rrect(c, bx, by, bw, bh, 6); c.fill();
          c.strokeStyle = on ? COL.ink : COL.line; c.lineWidth = on ? 4 : 2; rrect(c, bx, by, bw, bh, 6); c.stroke();
          c.strokeStyle = COL.line; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx + bw / 2, by + 4); c.lineTo(bx + bw / 2, by + bh - 4); c.stroke();
          for (let i = 0; i < 4; i++) {
            const left = !!(m & (1 << i));
            dot(c, bx + (left ? 12 : bw / 2 + 12) + i * 16, by + bh / 2, 6.5, COL[MOL_COL[i]]);
          }
        });
      });
    },
  };
}

/* ═══════════════ 2-(1) 4단계 · ▶ : 분자가 많아지면 ═══════════════
   분자 N 개가 통 안을 날아다닌다. 왼쪽에 모아 놓고 시작하면 금세 퍼지고, N 이 클수록 반반에서 거의 벗어나지 않는다. */
const BIG_NS = [4, 10, 100, 1000];
function sceneBigN(root) {
  let N = 100;
  const cv = makeCanvas(1060, 800), BX = 40, BY = 62, BW = 980, BH = 330;
  let px, py, vx, vy;
  const trace = [];                                 // 왼쪽 비율 (0.05초마다)
  let acc = 0;
  function reset() {
    px = new Float32Array(N); py = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N);
    const r = Math.random;
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2;
      px[i] = BX + 10 + r() * (BW / 2 - 20); py[i] = BY + 10 + r() * (BH - 20);
      vx[i] = Math.cos(a) * 300; vy[i] = Math.sin(a) * 300;
    }
    trace.length = 0;
  }
  const nBtns = BIG_NS.map(function (n) { return h('button', { class: 'btn small', type: 'button', text: '분자 ' + comma(n) + '개', onclick: function () { N = n; reset(); sync(); } }); });
  const rows = [
    { n: '4', all: '16', p: '1/16 ≈ 6 %' },
    { n: '10', all: '1,024', p: '1/1024 ≈ 0.1 %' },
    { n: '100', all: '약 1.3 × 10^{30}', p: '약 8 × 10^{−31}' },
    { n: '1000', all: '약 1.1 × 10^{301}', p: '약 9 × 10^{−302}' },
    { n: '약 10^{23}', all: '엄청나게 크다', p: '사실상 0' },
  ];
  const trs = rows.map(function (r) { return h('tr', {}, h('td', { class: 'pname' }, rich(r.n)), h('td', { style: 'font-size:25px' }, rich(r.all)), h('td', { style: 'font-size:25px' }, rich(r.p))); });
  function sync() {
    nBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(BIG_NS[i] === N)); });
    trs.forEach(function (tr, i) { tr.classList.toggle('cur', i < 4 && BIG_NS[i] === N); });
  }
  root.append(h('div', { class: 'row', style: 'height:100%;gap:22px' },
    h('section', { class: 'panel col fix', style: 'padding:0;gap:0' }, cv.c,
      h('div', { class: 'ctrl', style: 'padding:4px 22px 14px;gap:10px' }, nBtns,
        h('button', { class: 'btn small', type: 'button', text: '왼쪽에 모으고 다시', onclick: reset }))),
    h('section', { class: 'panel col fill pad', style: 'gap:16px;min-height:0' },
      h('div', { class: 'step on', style: 'padding:12px 18px' },
        h('span', { class: 's-no', text: '4단계' }),
        h('span', { class: 's-what' }, rich('분자 수가 N 개면 전체 경우의 수는 2^{N} 이다.')),
        h('span', { class: 's-eq', style: 'font-size:32px' }, '한쪽에 몰릴 확률 = ', frac('1', '2^{N}'))),
      h('table', { class: 't1' },
        h('thead', {}, h('tr', {}, h('th', { text: '분자 수 N' }), h('th', {}, rich('전체 경우의 수 2^{N}')), h('th', { text: '모두 왼쪽일 확률' }))),
        h('tbody', {}, trs)),
      h('p', { class: 'hint', style: 'font-size:23px' }, '분자가 100개만 되어도, 1초에 한 번씩 확인하면 우주 나이(약 4 × 10', h('sup', { text: '17' }), '초)의 3조 배쯤 기다려야 한 번 볼까 말까 하다.'),
      h('p', { class: 'ws sm', style: 'margin-top:auto' }, h('b', { text: '▶ 이 식이 말하는 것 : ' }), '골고루 퍼진 상태는 경우의 수가 압도적으로 ', blank('4', '④', '많고'), ', 한쪽에 몰린 상태는 경우의 수가 거의 없다. 그래서 자연은 경우의 수가 많은 쪽으로 간다. 되돌아가는 것이 금지된 것이 아니라 확률이 사실상 0 인 것이다.'))));
  reset(); sync();
  return {
    tick: function (dt) {
      const c = cv.ctx; c.clearRect(0, 0, 1060, 800);
      const r = N >= 1000 ? 3.2 : N >= 100 ? 6 : N >= 10 ? 11 : 15;
      let left = 0;
      for (let i = 0; i < N; i++) {
        px[i] += vx[i] * dt; py[i] += vy[i] * dt;
        if (px[i] < BX + r) { px[i] = 2 * (BX + r) - px[i]; vx[i] = Math.abs(vx[i]); }
        if (px[i] > BX + BW - r) { px[i] = 2 * (BX + BW - r) - px[i]; vx[i] = -Math.abs(vx[i]); }
        if (py[i] < BY + r) { py[i] = 2 * (BY + r) - py[i]; vy[i] = Math.abs(vy[i]); }
        if (py[i] > BY + BH - r) { py[i] = 2 * (BY + BH - r) - py[i]; vy[i] = -Math.abs(vy[i]); }
        if (px[i] < BX + BW / 2) left++;
      }
      acc += dt;
      while (acc >= 0.05) { acc -= 0.05; trace.push(left / N); if (trace.length > 300) trace.shift(); }
      // 통
      c.fillStyle = COL.panel; c.fillRect(BX, BY, BW, BH);
      dashLine(c, BX + BW / 2, BY + 6, BX + BW / 2, BY + BH - 6, COL.line, 3);
      c.fillStyle = COL.cold;
      for (let i = 0; i < N; i++) { c.beginPath(); c.arc(px[i], py[i], r, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = COL['ink-2']; c.lineWidth = 6; rrect(c, BX, BY, BW, BH, 10); c.stroke();
      txt(c, '왼쪽 ' + comma(left) + '개 · 오른쪽 ' + comma(N - left) + '개', BX, 32, { size: 28, weight: 700 });
      txt(c, '왼쪽 ' + Math.round(left / N * 100) + ' %', BX + BW, 32, { size: 28, weight: 700, align: 'right', color: COL.energy });
      // 시간에 따른 왼쪽 비율
      const gx = 100, gy = 450, gw = 520, gh = 270;
      txt(c, '시간에 따른 왼쪽 비율', 40, 428, { size: 22, weight: 700, color: COL.muted });
      c.strokeStyle = COL.line; c.lineWidth = 2; c.strokeRect(gx, gy, gw, gh);
      dashLine(c, gx, gy + gh / 2, gx + gw, gy + gh / 2, COL.muted, 2);
      [['100 %', 0], ['50 %', 0.5], ['0 %', 1]].forEach(function (a) { txt(c, a[0], gx - 10, gy + gh * a[1], { size: 18, align: 'right', color: COL.muted, mono: true }); });
      txt(c, '← 15초 전', gx, gy + gh + 22, { size: 18, color: COL.muted });
      txt(c, '지금', gx + gw, gy + gh + 22, { size: 18, color: COL.muted, align: 'right' });
      if (trace.length > 1) {
        c.strokeStyle = COL.energy; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath();
        trace.forEach(function (v, i) { const x = gx + gw - (trace.length - 1 - i) * gw / 299, y = gy + gh * (1 - v); if (i) c.lineTo(x, y); else c.moveTo(x, y); });
        c.stroke();
      }
      // 배치의 수 분포 : 왼쪽 비율별 경우의 수 (가장 많은 것을 높이 1 로)
      const hx = 680, hy = 450, hw = 340, hh = 270;
      txt(c, '왼쪽 비율별 경우의 수', hx, 428, { size: 22, weight: 700, color: COL.muted });
      c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, hy + hh); c.lineTo(hx + hw, hy + hh); c.stroke();
      const lmax = LOGF[N] - 2 * LOGF[N >> 1] + (N % 2 ? 0 : 0);
      const ws = function (k) { return Math.exp(LOGF[N] - LOGF[k] - LOGF[N - k] - lmax); };
      if (N <= 100) {
        const bw = Math.max(2, hw / (N + 1) - 1);
        for (let k = 0; k <= N; k++) { c.fillStyle = COL.energy; const v = ws(k) * hh; c.fillRect(hx + k / N * (hw - bw), hy + hh - v, bw, v); }
      } else {
        c.fillStyle = rgba(COL.energy, 0.85); c.beginPath(); c.moveTo(hx, hy + hh);
        for (let k = 0; k <= N; k += 2) c.lineTo(hx + k / N * hw, hy + hh - ws(k) * hh);
        c.lineTo(hx + hw, hy + hh); c.closePath(); c.fill();
      }
      const lx = hx + (left / N) * hw;
      c.strokeStyle = COL.heat; c.lineWidth = 4; c.beginPath(); c.moveTo(lx, hy - 4); c.lineTo(lx, hy + hh); c.stroke();
      txt(c, '0 %', hx, hy + hh + 22, { size: 18, color: COL.muted, mono: true });
      txt(c, '50 %', hx + hw / 2, hy + hh + 22, { size: 18, color: COL.muted, mono: true, align: 'center' });
      txt(c, '100 %', hx + hw, hy + hh + 22, { size: 18, color: COL.muted, mono: true, align: 'right' });
      txt(c, '— 지금', hx + hw, hy - 18, { size: 18, weight: 700, color: COL.heat, align: 'right' });
      txt(c, 'N 이 클수록 반반 근처에 몰려 있다 → 한쪽에 몰린 배치는 거의 없다', 40, 784, { size: 22, weight: 600, color: COL['ink-2'] });
    },
  };
}

/* ═══════════════ 2-(2) 엔트로피 : 분자 20개가 하나씩 자리를 옮긴다 ═══════════════
   0.3초마다 분자 하나를 무작위로 골라 반대쪽으로 옮긴다(에렌페스트 모형). 어느 분자를 옮길지는 정해져 있지 않은데도
   상태는 경우의 수가 많은 쪽(엔트로피가 큰 쪽)으로 가서 그 근처에 머문다. */
const ENT_N = 20;
function sceneEntropy(root) {
  const cv = makeCanvas(1000, 800);
  const BX = 40, BY = 70, BW = 640, BH = 300;
  const rnd = Math.random;
  let playing = true, acc = 0;
  const ms = [];
  function home(m) { m.tx = BX + 26 + rnd() * (BW / 2 - 52) + (m.left ? 0 : BW / 2); m.ty = BY + 26 + rnd() * (BH - 52); }
  function reset() {
    ms.length = 0;
    for (let i = 0; i < ENT_N; i++) { const m = { left: true }; home(m); m.x = m.tx; m.y = m.ty; ms.push(m); }
  }
  const playBtn = h('button', { class: 'btn primary', type: 'button', style: 'min-width:220px', onclick: function () { playing = !playing; syncBtn(); } });
  function syncBtn() { playBtn.textContent = playing ? '멈춤' : '▶ 저절로 두기'; }
  const Wmax = nCk(ENT_N, ENT_N / 2);
  root.append(h('div', { class: 'row', style: 'height:100%;gap:22px' },
    h('section', { class: 'panel col fix', style: 'padding:0;gap:0' }, cv.c,
      h('div', { class: 'ctrl', style: 'padding:4px 22px 14px;gap:12px' }, playBtn,
        h('button', { class: 'btn', type: 'button', text: '모두 왼쪽에서 다시', onclick: function () { reset(); playing = true; syncBtn(); } }),
        h('span', { class: 'hint', text: '0.3초마다 분자 하나를 아무거나 골라 반대쪽으로 옮긴다' }))),
    h('section', { class: 'panel col fill pad', style: 'gap:18px;min-height:0' },
      h('p', { class: 'cap', text: '엔트로피' }),
      h('p', { class: 'ws' }, '• 어떤 상태를 만들 수 있는 경우의 수가 많을수록, 즉 무질서한 정도가 클수록 엔트로피가 ', blank('5', '⑤', '크다'), '.'),
      h('div', { class: 'callout good', style: 'font-size:29px;line-height:1.55' }, h('b', { text: '열역학 제2법칙 : ' }), '고립된 계에서 일어나는 모든 변화는 전체 엔트로피가 증가하는 방향으로 일어난다.'),
      h('table', { class: 't1' },
        h('thead', {}, h('tr', {}, h('th', { text: '분자 20개의 상태' }), h('th', { text: '경우의 수' }), h('th', { text: '엔트로피' }))),
        h('tbody', {},
          h('tr', {}, h('td', { text: '모두 왼쪽 (20 : 0)' }), h('td', { class: 'mono', text: '1' }), h('td', { text: '가장 작다' })),
          h('tr', {}, h('td', { text: '15 : 5' }), h('td', { class: 'mono', text: comma(nCk(20, 15)) }), h('td', { text: '↑' })),
          h('tr', {}, h('td', { text: '반반 (10 : 10)' }), h('td', { class: 'mono', text: comma(Wmax) }), h('td', { text: '가장 크다' })))),
      h('p', { class: 'hint', style: 'font-size:23px;margin-top:auto' }, '※ 분자 20개만으로도 반반인 배치가 모두 왼쪽인 배치보다 18만 배 넘게 많다. 실제 기체(10', h('sup', { text: '23' }), '개)라면 비교할 수도 없다.'),
      h('p', { class: 'hint', style: 'font-size:21px' }, '더 알아보기 : 볼츠만은 엔트로피를 경우의 수 W 로 S = k ln W 라고 나타냈다.'))));
  reset(); syncBtn();
  return {
    tick: function (dt) {
      if (playing) {
        acc += dt;
        while (acc >= 0.3) { acc -= 0.3; const m = ms[Math.floor(rnd() * ENT_N)]; m.left = !m.left; home(m); }
      }
      const k = ms.filter(function (m) { return m.left; }).length, W = nCk(ENT_N, k);
      const c = cv.ctx; c.clearRect(0, 0, 1000, 800);
      // 통
      c.fillStyle = COL.panel; c.fillRect(BX, BY, BW, BH);
      dashLine(c, BX + BW / 2, BY + 6, BX + BW / 2, BY + BH - 6, COL.line, 3);
      ms.forEach(function (m) {
        m.x += (m.tx - m.x) * Math.min(1, dt * 5); m.y += (m.ty - m.y) * Math.min(1, dt * 5);
        dot(c, m.x, m.y, 15, COL.cold);
      });
      c.strokeStyle = COL['ink-2']; c.lineWidth = 6; rrect(c, BX, BY, BW, BH, 10); c.stroke();
      txt(c, '왼쪽 ' + k + '개 · 오른쪽 ' + (ENT_N - k) + '개', BX, 40, { size: 28, weight: 700 });
      txt(c, '경우의 수 ' + comma(W), BX + BW, 40, { size: 28, weight: 700, align: 'right', color: COL.energy });
      // 엔트로피 막대 (ln W 를 가장 큰 값으로 나눈 것)
      const mx = 760, my = BY, mw = 120, mh = BH, s = Math.log(W) / Math.log(Wmax);
      txt(c, '엔트로피', mx + mw / 2, 40, { size: 26, weight: 700, align: 'center' });
      c.fillStyle = COL['panel-2']; rrect(c, mx, my, mw, mh, 12); c.fill();
      const fillH = Math.max(8, mh * s);
      c.fillStyle = COL.energy; rrect(c, mx, my + mh - fillH, mw, fillH, 12); c.fill();
      c.strokeStyle = COL.line; c.lineWidth = 2; rrect(c, mx, my, mw, mh, 12); c.stroke();
      txt(c, '크다', mx + mw + 12, my + 14, { size: 20, color: COL.muted });
      txt(c, '작다', mx + mw + 12, my + mh - 12, { size: 20, color: COL.muted });
      // 왼쪽 분자 수별 경우의 수
      const gx = 70, gy = 440, gw = 900, gh = 260, bw = gw / 21;
      txt(c, '왼쪽에 있는 분자 수별 경우의 수', 40, 420, { size: 22, weight: 700, color: COL.muted });
      for (let i = 0; i <= ENT_N; i++) {
        const v = nCk(ENT_N, i) / Wmax * gh;
        c.fillStyle = i === k ? COL.heat : rgba(COL.energy, 0.35);
        c.fillRect(gx + i * bw + 3, gy + gh - v, bw - 6, Math.max(1, v));
        if (i % 5 === 0) txt(c, String(i), gx + (i + 0.5) * bw, gy + gh + 22, { size: 20, align: 'center', color: COL.muted, mono: true });
      }
      c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke();
      // 지금 상태를 가리키는 화살표 : 막대 꼭대기 바로 위
      const kx = gx + (k + 0.5) * bw, top = gy + gh - nCk(ENT_N, k) / Wmax * gh;
      arrow(c, kx, top - 50, kx, top - 8, { width: 5, color: COL.heat, head: 18 });
      txt(c, '지금', kx, top - 66, { size: 20, weight: 700, color: COL.heat, align: 'center' });
      txt(c, '모두 왼쪽(20개)은 1가지, 반반(10개)은 ' + comma(Wmax) + '가지', 40, 770, { size: 23, weight: 600, color: COL['ink-2'] });
    },
  };
}

/* ═══════════════ [표 2] 제2법칙의 여러 표현 ═══════════════ */
function sceneForms(root) {
  const cvs = [makeCanvas(590, 300), makeCanvas(590, 300), makeCanvas(590, 300)];
  const eIn = h('input', { class: 'big', type: 'range', id: 'forms-e', min: 0, max: 100, step: 5, value: 40, 'aria-label': '열효율' });
  const eOut = h('output', { for: 'forms-e', style: 'min-width:110px' });
  const card = function (i, title, body, extra) {
    return h('section', { class: 'panel card3' }, h('div', { class: 'c-title' }, h('b', { text: title })), cvs[i].c, extra || null, h('div', { class: 'c-body' }, body));
  };
  root.append(h('div', { class: 'col', style: 'height:100%;gap:16px' },
    h('p', { class: 'ws', style: 'font-size:30px' }, '열역학 제2법칙은 여러 가지로 표현할 수 있다.'),
    h('div', { class: 'cards3', style: 'flex:1;min-height:0' },
      card(0, '열의 이동', [h('p', { class: 'ws' }, '열은 저절로 찬 물체에서 뜨거운 물체로 이동하지 ', blank('6', '⑥', '않는다'), '.'),
        h('div', { class: 'kv' }, h('b', { text: '예' }), h('span', { text: '뜨거운 국은 식기만 하고, 저절로 다시 데워지지 않는다.' })),
        h('p', { class: 'hint', text: '냉장고처럼 바깥에서 일을 해 주어야만 거꾸로 옮길 수 있다.' })]),
      card(1, '열기관', [h('p', { class: 'ws', text: '흡수한 열을 모두 일로 바꾸는 열기관은 만들 수 없다.' }),
        h('div', { class: 'kv' }, h('b', { text: '예' }), h('span', { text: '자동차 엔진도 연료가 낸 열의 상당 부분을 배기가스와 냉각수로 버린다.' })),
        h('p', { class: 'hint', text: '버리는 열 Q₂ 가 꼭 생기므로 열효율은 늘 1 보다 작다 (2-4 열기관과 열효율).' })],
        h('div', { class: 'slider', style: 'grid-template-columns:auto 1fr auto;padding:4px 22px 0;gap:14px' }, h('label', { for: 'forms-e', text: '열효율' }), eIn, eOut)),
      card(2, '엔트로피', [h('p', { class: 'ws' }, '고립계의 전체 엔트로피는 ', blank('7', '⑦', '감소'), '하지 않는다.'),
        h('div', { class: 'kv' }, h('b', { text: '예' }), h('span', { text: '물에 섞인 잉크는 다시 한 방울로 모이지 않는다.' })),
        h('p', { class: 'hint', text: '늘어나거나, 다 섞인 뒤에는 그대로 머문다.' })])),
    h('div', { class: 'callout', style: 'font-size:26px' }, '※ 세 표현은 서로 다른 말처럼 보이지만 모두 같은 법칙을 다른 각도에서 말한 것이다.')));
  return {
    tick: function (dt, now) {
      // 열의 이동
      let c = cvs[0].ctx; c.clearRect(0, 0, 590, 300);
      c.fillStyle = rgba(COL.heat, 0.85); rrect(c, 30, 70, 170, 150, 14); c.fill();
      c.fillStyle = rgba(COL.cold, 0.85); rrect(c, 390, 70, 170, 150, 14); c.fill();
      txt(c, '뜨거운 물체', 115, 145, { size: 24, weight: 700, align: 'center', color: '#fff' });
      txt(c, '찬 물체', 475, 145, { size: 24, weight: 700, align: 'center', color: '#fff' });
      const off = (now * 60) % 36;
      c.save(); c.beginPath(); c.rect(210, 60, 170, 70); c.clip();
      arrow(c, 214 - 36 + off, 104, 372, 104, { width: 9, color: COL.heat, head: 26, dash: [16, 12] });
      c.restore();
      arrow(c, 214, 104, 372, 104, { width: 0.01, color: COL.heat, head: 26 });
      txt(c, '저절로 ○', 295, 70, { size: 21, weight: 700, align: 'center', color: COL.good });
      arrow(c, 372, 186, 214, 186, { width: 6, color: COL.muted, head: 22, dash: [10, 10] });
      cross(c, 295, 186, 20, COL.pen);
      txt(c, '저절로는 ✕', 295, 238, { size: 21, weight: 700, align: 'center', color: COL.pen });
      txt(c, '열', 295, 34, { size: 22, weight: 700, align: 'center', color: COL.heat });
      // 열기관 : 흡수한 열 Q₁ = 100 으로 두고, 열효율만큼 일 W, 나머지는 버리는 열 Q₂
      const e = +eIn.value; setText(eOut, e + ' %');
      c = cvs[1].ctx; c.clearRect(0, 0, 590, 300);
      c.fillStyle = rgba(COL.heat, 0.85); rrect(c, 120, 8, 300, 50, 10); c.fill();
      txt(c, '고열원 T₁', 270, 34, { size: 22, weight: 700, align: 'center', color: '#fff' });
      c.fillStyle = rgba(COL.cold, 0.85); rrect(c, 120, 242, 300, 50, 10); c.fill();
      txt(c, '저열원 T₂', 270, 268, { size: 22, weight: 700, align: 'center', color: '#fff' });
      const k = 0.42;
      c.fillStyle = COL.heat; c.fillRect(270 - 100 * k / 2, 58, 100 * k, 52);
      if (e > 0) { c.fillStyle = COL.work; c.fillRect(310, 150 - e * k / 2, 150, e * k); arrow(c, 450, 150, 520, 150, { width: Math.max(4, e * k), color: COL.work, head: Math.max(20, e * k + 14) }); }
      if (e < 100) { c.fillStyle = COL.cold; c.fillRect(270 - (100 - e) * k / 2, 190, (100 - e) * k, 52); }
      dot(c, 270, 150, 44, COL.ink);
      txt(c, '열기관', 270, 151, { size: 20, weight: 700, align: 'center', color: COL.panel });
      txt(c, 'Q₁ 100', 160, 88, { size: 22, weight: 700, color: COL.heat, mono: true, align: 'right' });
      txt(c, 'W ' + e, 490, 150 - Math.max(20, e * k / 2) - 16, { size: 22, weight: 700, color: COL.work, mono: true, align: 'center' });
      txt(c, 'Q₂ ' + (100 - e), 160, 214, { size: 22, weight: 700, color: COL.cold, mono: true, align: 'right' });
      if (e >= 100) { cross(c, 270, 150, 60, COL.pen); pill(c, '만들 수 없다 (제2법칙)', 470, 230, COL.pen, { align: 'center', size: 20 }); }
      // 엔트로피 : 고립계에서 시간에 따라
      c = cvs[2].ctx; c.clearRect(0, 0, 590, 300);
      const gx = 70, gy = 30, gw = 480, gh = 220;
      arrow(c, gx, gy + gh, gx + gw + 10, gy + gh, { width: 3, color: COL['ink-2'], head: 14 });
      arrow(c, gx, gy + gh, gx, gy - 6, { width: 3, color: COL['ink-2'], head: 14 });
      txt(c, '시간', gx + gw, gy + gh + 24, { size: 20, color: COL.muted, align: 'right' });
      txt(c, '엔트로피', gx + 14, gy + 2, { size: 20, color: COL.muted });
      const tt = (now % 6) / 6;
      c.strokeStyle = COL.energy; c.lineWidth = 6; c.beginPath();
      for (let i = 0; i <= 60; i++) { const u = i / 60, x = gx + u * gw, y = gy + gh - 20 - (1 - Math.exp(-u * 4)) * (gh - 50); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
      c.stroke();
      const ux = tt, yy = gy + gh - 20 - (1 - Math.exp(-ux * 4)) * (gh - 50);
      dot(c, gx + ux * gw, yy, 10, COL.energy);
      dashLine(c, gx + 260, gy + 50, gx + 420, gy + 170, COL.muted, 3);
      cross(c, gx + 340, gy + 110, 18, COL.pen);
      txt(c, '줄어드는 일은 없다', gx + 360, gy + 160, { size: 20, weight: 700, color: COL.pen });
    },
  };
}

/* ═══════════════ 더 생각하기 : 금지일까 확률일까 · 냉장고 속 엔트로피 ═══════════════ */
const MIS_CARDS = [
  { q: '거꾸로 되돌아가는 것은 법칙으로 금지되어 있다?',
    wrong: '퍼진 기체가 다시 한쪽에 모이는 일은 법칙이 막고 있어서 절대 일어날 수 없다.',
    why: '막는 법칙이 있는 것이 아니다. 한쪽에 몰린 배치는 경우의 수가 아주 적어서 확률이 작을 뿐이다.',
    right: '분자가 4개면 16번에 1번꼴로 실제로 모두 왼쪽에 모인다. 분자가 10²³개면 확률이 사실상 0 이라 우주의 나이만큼 기다려도 볼 수 없다.' },
  { q: '엔트로피는 어디에서나 늘어나기만 한다?',
    wrong: '어떤 물체든 엔트로피가 줄어드는 일은 일어날 수 없다.',
    why: '제2법칙은 고립된 계 전체에 대한 말이다. 바깥과 열이나 일을 주고받는 부분은 엔트로피가 줄어들 수 있다.',
    right: '냉장고 안은 엔트로피가 줄지만, 냉장고가 뒤로 내보내는 열 때문에 부엌의 엔트로피가 그보다 더 많이 늘어 전체 엔트로피는 증가한다.' },
];
function sceneMis(root) {
  let which = 0, nMol = 4;
  const cv = makeCanvas(900, 650);
  const tabs = tabRow(['① 되돌아가는 것은 금지?', '② 엔트로피는 늘기만?'], function (i) { which = i; render(); });
  const textBox = h('div', { class: 'col', style: 'gap:0' });
  const ctrl = h('div', { class: 'ctrl', style: 'padding:6px 22px 16px;gap:12px' });
  const lines = [];
  // 4개 · 10개 분자 : 0.4초마다 확인해서 모두 왼쪽에 있는지 센다
  let ps = [], checks = 0, hits = 0, acc = 0, flash = 0;
  function resetGas() {
    ps = [];
    for (let i = 0; i < nMol; i++) { const a = Math.random() * Math.PI * 2; ps.push({ x: 100 + Math.random() * 700, y: 110 + Math.random() * 320, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520 }); }
    checks = 0; hits = 0; flash = 0;
  }
  function render() {
    selectTab(tabs, which);
    const cd = MIS_CARDS[which];
    textBox.replaceChildren(); lines.length = 0;
    textBox.append(h('p', { class: 'cap', style: 'margin-bottom:6px', text: '생각 넓히기 ' + (which + 1) }), h('p', { class: 'big-q', style: 'font-size:46px;margin-bottom:18px', text: cd.q }));
    [['틀린 생각', cd.wrong], ['왜 틀렸나', cd.why], ['올바른 이해', cd.right]].forEach(function (pair, i) {
      const line = h('div', { class: 'mis-line' + (i === 0 ? ' on' : '') }, h('b', { text: pair[0] }), h('span', { class: 'body', text: pair[1] }));
      lines.push(line); textBox.append(line);
    });
    textBox.append(h('div', { class: 'row', style: 'margin-top:12px;gap:14px' },
      h('button', { class: 'btn', type: 'button', text: '다음 줄 보기', onclick: function () { const n = lines.filter(function (l) { return l.classList.contains('on'); }).length; if (n < lines.length) lines[n].classList.add('on'); } }),
      h('button', { class: 'btn', type: 'button', text: '다시 가리기', onclick: function () { lines.forEach(function (l, i) { l.classList.toggle('on', i === 0); }); } })));
    ctrl.replaceChildren();
    if (which === 0) {
      [4, 10].forEach(function (n) { ctrl.append(h('button', { class: 'btn small', type: 'button', 'aria-pressed': String(n === nMol), text: '분자 ' + n + '개', onclick: function () { nMol = n; resetGas(); render(); } })); });
      ctrl.append(h('button', { class: 'btn small', type: 'button', text: '기록 지우기', onclick: function () { checks = 0; hits = 0; } }));
    } else ctrl.append(h('p', { class: 'hint', text: '냉장고 : 안에서 열 Q₂ 를 빼내고, 전기로 일 W 를 받아, 뒤로 Q₂ + W 를 내보낸다.' }));
  }
  root.append(h('div', { class: 'col', style: 'height:100%;gap:14px' },
    h('div', { class: 'tabs', style: 'grid-template-columns:repeat(2,1fr)', role: 'tablist' }, tabs),
    h('div', { class: 'row', style: 'gap:20px;flex:1;min-height:0' },
      h('section', { class: 'panel pad fill' }, textBox),
      h('section', { class: 'panel col fix', style: 'padding:0;gap:0;justify-content:center' }, cv.c, ctrl))));
  resetGas(); render();
  return {
    annoKey: function () { return 'mis:' + which; },
    tick: function (dt, now) {
      const c = cv.ctx; c.clearRect(0, 0, 900, 650);
      if (which === 0) {
        const X0 = 60, Y0 = 80, W = 780, H = 380, r = nMol > 4 ? 16 : 22;
        ps.forEach(function (p) {
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < X0 + r) { p.x = 2 * (X0 + r) - p.x; p.vx = Math.abs(p.vx); }
          if (p.x > X0 + W - r) { p.x = 2 * (X0 + W - r) - p.x; p.vx = -Math.abs(p.vx); }
          if (p.y < Y0 + r) { p.y = 2 * (Y0 + r) - p.y; p.vy = Math.abs(p.vy); }
          if (p.y > Y0 + H - r) { p.y = 2 * (Y0 + H - r) - p.y; p.vy = -Math.abs(p.vy); }
        });
        acc += dt; flash = Math.max(0, flash - dt);
        while (acc >= 0.4) {
          acc -= 0.4; checks++;
          if (ps.every(function (p) { return p.x < X0 + W / 2; })) { hits++; flash = 0.9; }
        }
        c.fillStyle = flash > 0 ? rgba(COL.good, 0.14) : COL.panel; c.fillRect(X0, Y0, W, H);
        dashLine(c, X0 + W / 2, Y0 + 6, X0 + W / 2, Y0 + H - 6, COL.line, 3);
        ps.forEach(function (p) { dot(c, p.x, p.y, r, COL.cold); });
        c.strokeStyle = flash > 0 ? COL.good : COL['ink-2']; c.lineWidth = 6; rrect(c, X0, Y0, W, H, 10); c.stroke();
        txt(c, '분자 ' + nMol + '개가 아무렇게나 날아다닌다', X0, 40, { size: 28, weight: 700 });
        if (flash > 0) pill(c, '모두 왼쪽!', X0 + W / 4, Y0 + 30, COL.good, { align: 'center', size: 24 });
        txt(c, '0.4초마다 확인 ' + checks + '번 · 모두 왼쪽 ' + hits + '번', X0, 520, { size: 27, weight: 700, mono: false });
        const p = Math.pow(0.5, nMol);
        txt(c, '실제로 나온 비율 ' + (checks ? (hits / checks * 100).toFixed(1) : '0.0') + ' %  ·  계산한 확률 1/' + comma(1 / p) + ' ≈ ' + (p * 100).toFixed(p < 0.01 ? 2 : 1) + ' %', X0, 566, { size: 24, color: COL['ink-2'] });
        txt(c, nMol > 4 ? '분자가 10개만 되어도 좀처럼 모이지 않는다' : '분자가 적으면 실제로 꽤 자주 모인다', X0, 612, { size: 23, weight: 600, color: COL.energy });
      } else {
        // 냉장고 : 안(차가움)에서 열을 빼내 뒤로 내보낸다
        txt(c, '냉장고와 부엌', 40, 40, { size: 28, weight: 700 });
        c.fillStyle = rgba(COL.heat, 0.06); rrect(c, 30, 70, 520, 420, 16); c.fill();
        txt(c, '부엌 (바깥)', 50, 100, { size: 22, weight: 700, color: COL.heat });
        c.fillStyle = COL['panel-2']; c.strokeStyle = COL['ink-2']; c.lineWidth = 5;
        rrect(c, 120, 130, 220, 320, 14); c.fill(); c.stroke();
        c.fillStyle = rgba(COL.cold, 0.22); rrect(c, 140, 150, 180, 200, 8); c.fill();
        txt(c, '냉장고 안', 230, 250, { size: 22, weight: 700, color: COL.cold, align: 'center' });
        const off = (now * 50) % 30;
        c.save(); c.beginPath(); c.rect(330, 150, 200, 60); c.clip();
        arrow(c, 300 + off, 180, 520, 180, { width: 8, color: COL.heat, head: 24, dash: [14, 10] }); c.restore();
        txt(c, 'Q₂ + W 를 내보낸다', 430, 230, { size: 20, weight: 700, color: COL.heat, align: 'center' });
        arrow(c, 230, 330, 230, 400, { width: 8, color: COL.cold, head: 24 });
        txt(c, 'Q₂ 를 빼낸다', 230, 425, { size: 20, weight: 700, color: COL.cold, align: 'center' });
        arrow(c, 40, 470, 118, 420, { width: 6, color: COL.work, head: 20 });
        txt(c, '전기 W', 60, 500, { size: 20, weight: 700, color: COL.work });
        // 엔트로피 변화 막대
        const bx = 600, base = 330;
        txt(c, '엔트로피 변화', bx, 100, { size: 24, weight: 700 });
        c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, base); c.lineTo(bx + 270, base); c.stroke();
        [{ n: '냉장고 안', v: -110, col: COL.cold }, { n: '부엌', v: 140, col: COL.heat }, { n: '전체', v: 30, col: COL.good }].forEach(function (b, i) {
          const x = bx + 14 + i * 88;
          c.fillStyle = b.col; c.fillRect(x, b.v > 0 ? base - b.v : base, 62, Math.abs(b.v));
          txt(c, b.v > 0 ? '늘어남' : '줄어듦', x + 31, b.v > 0 ? base - b.v - 18 : base - b.v + 20, { size: 18, weight: 700, align: 'center', color: b.col });
          txt(c, b.n, x + 31, 480, { size: 19, weight: 700, align: 'center' });
        });
        txt(c, '줄어든 것보다 늘어난 것이 더 많아 전체는 늘어난다', 40, 600, { size: 24, weight: 600, color: COL.energy });
      }
    },
  };
}

/* ═══════════════ 3 예제 : 분자 3개 · 10개 ═══════════════
   처음에는 학습지 그림(문제)만 보여 주고, 학생이 푼 뒤 [분자 3개 배치] · [분자 10개 배치]로 확인한다. */
function sceneEx(root) {
  let n = 0;                                        // 0 : 문제 그림, 3 · 10 : 배치 보기
  const cv = makeCanvas(960, 820);
  const MODES = [[0, '문제 그림'], [3, '분자 3개 배치 보기'], [10, '분자 10개 배치 보기']];
  const nBtns = MODES.map(function (m) { return h('button', { class: 'btn small', type: 'button', text: m[1], onclick: function () { n = m[0]; sync(); } }); });
  function sync() { nBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(MODES[i][0] === n)); }); }
  root.append(h('div', { class: 'row', style: 'height:100%;gap:22px' },
    h('section', { class: 'panel col fix', style: 'padding:0;gap:0' }, cv.c,
      h('div', { class: 'ctrl', style: 'padding:4px 22px 14px;gap:12px' }, nBtns)),
    h('section', { class: 'panel col fill pad', style: 'gap:16px;min-height:0' },
      h('p', { class: 'cap', text: '예제' }),
      h('p', { class: 'ws', style: 'font-weight:600' }, '통 안에 기체 분자가 들어 있다. 통을 왼쪽과 오른쪽으로 나누어 생각한다.'),
      h('p', { class: 'ws' }, '(1) 분자가 3개일 때 전체 경우의 수 　2', h('sup', { text: '3' }), ' = ', blank('8', '⑧', '8'), ' 가지'),
      h('p', { class: 'ws' }, '(2) 3개가 모두 왼쪽에 몰릴 확률 　', blank('ex2', '(2)', '1/8')),
      h('p', { class: 'ws' }, '(3) 분자가 10개라면 전체 경우의 수 　2', h('sup', { text: '10' }), ' = ', blank('ex3', '(3)', '1024'), ' 가지'),
      h('p', { class: 'ws' }, '(4) 분자 수가 늘어날수록 한쪽에 몰릴 확률은 ', blank('9', '⑨', '작아진다'), '. 그래서 기체는 저절로 퍼지기만 한다.'),
      h('p', { class: 'ws' }, '(5) 이때 에너지는 ', blank('10', '⑩', '보존'), '되지만, 엔트로피는 증가한다.'))));
  sync();
  return {
    tick: function (dt, now) {
      const c = cv.ctx; c.clearRect(0, 0, 960, 820);
      // 분자 3개의 배치 하나 (m 의 자리마다 1 이면 왼쪽)
      const mini = function (x, y, w, hh, m, big) {
        const all = m === 7;
        c.fillStyle = all ? rgba(COL.good, 0.12) : COL.panel; rrect(c, x, y, w, hh, 10); c.fill();
        c.strokeStyle = all ? COL.good : COL['ink-2']; c.lineWidth = all ? 6 : 4; rrect(c, x, y, w, hh, 10); c.stroke();
        dashLine(c, x + w / 2, y + 8, x + w / 2, y + hh - 8, COL.line, 2);
        for (let i = 0; i < 3; i++) {
          const left = !!(m & (1 << i));
          dot(c, x + (left ? 0 : w / 2) + w / 4 + (i - 1) * w / 8, y + hh / 2 + (i === 1 ? -hh / 6 : hh / 8), big ? 26 : 12, COL.cold);
        }
      };
      if (n === 0) {
        // 학습지 [예제 그림]
        txt(c, '[예제 그림]', 40, 44, { size: 26, weight: 700, color: COL.muted });
        c.fillStyle = COL.panel; rrect(c, 80, 120, 520, 300, 12); c.fill();
        dashLine(c, 340, 130, 340, 410, COL.line, 4);
        [[170, 200], [140, 320], [250, 330]].forEach(function (p) { dot(c, p[0], p[1], 30, COL.cold); });
        c.strokeStyle = COL['ink-2']; c.lineWidth = 8; rrect(c, 80, 120, 520, 300, 12); c.stroke();
        txt(c, '왼쪽', 210, 470, { size: 30, weight: 700, color: COL.heat, align: 'center' });
        txt(c, '오른쪽', 470, 470, { size: 30, weight: 700, color: COL.muted, align: 'center' });
        txt(c, '분자 3개', 650, 190, { size: 40, weight: 700 });
        txt(c, '전체 경우의 수 = 2^{3}', 650, 260, { size: 32, color: COL['ink-2'] });
        txt(c, '모두 왼쪽일 확률 = ?', 650, 330, { size: 32, weight: 700, color: COL.pen });
        txt(c, '분자 하나하나가 왼쪽 또는 오른쪽 두 곳 중 하나에 있을 수 있다.', 40, 600, { size: 26, color: COL['ink-2'] });
        txt(c, '문제를 푼 뒤 아래 단추로 배치를 모두 펼쳐 확인해 보자.', 40, 650, { size: 26, color: COL.muted });
      } else if (n === 3) {
        txt(c, '분자 3개 : 전체 경우의 수 = 2^{3}', 40, 44, { size: 30, weight: 700 });
        const order = [7, 3, 5, 6, 1, 2, 4, 0];
        order.forEach(function (m, i) {
          const x = 40 + (i % 4) * 225, y = 90 + Math.floor(i / 4) * 170;
          mini(x, y, 200, 130, m, false);
          txt(c, '왼쪽 ' + popcount(m) + '개', x + 100, y + 152, { size: 20, align: 'center', color: COL.muted });
        });
        txt(c, '배치는 모두 8가지, 그중 모두 왼쪽인 것은 1가지', 40, 470, { size: 28, weight: 700, color: COL.energy });
        pill(c, '모두 왼쪽', 140, 82, COL.good, { align: 'center', size: 20 });
        txt(c, '→ 모두 왼쪽에 몰릴 확률은 8가지 중 1가지', 40, 520, { size: 26, color: COL['ink-2'] });
        mini(300, 580, 360, 200, 7, true);
        txt(c, '왼쪽', 390, 800, { size: 22, weight: 700, align: 'center', color: COL.heat });
        txt(c, '오른쪽', 570, 800, { size: 22, weight: 700, align: 'center', color: COL.muted });
      } else {
        txt(c, '분자 10개 : 2^{10} = 1024 가지', 40, 44, { size: 30, weight: 700 });
        txt(c, '한 칸이 배치 하나. 모두 왼쪽인 것은 단 한 칸', 40, 86, { size: 24, color: COL['ink-2'] });
        const s = 21, x0 = 144, y0 = 116;
        for (let i = 0; i < 1024; i++) {
          const x = x0 + (i % 32) * s, y = y0 + Math.floor(i / 32) * s;
          c.fillStyle = i === 0 ? COL.heat : rgba(COL.energy, 0.22 + 0.1 * ((i * 7) % 3));
          c.fillRect(x + 1, y + 1, s - 2, s - 2);
        }
        const blink = 0.5 + 0.5 * Math.sin(now * 5);
        c.strokeStyle = rgba(COL.heat, 0.4 + 0.6 * blink); c.lineWidth = 4; c.strokeRect(x0 - 3, y0 - 3, s + 6, s + 6);
        arrow(c, x0 - 70, y0 - 30, x0 - 8, y0 + 6, { width: 5, color: COL.heat, head: 18 });
        txt(c, '모두 왼쪽', x0 - 76, y0 - 44, { size: 20, weight: 700, color: COL.heat, align: 'center' });
        txt(c, '확률 1/1024 ≈ 0.1 %', 40, 806, { size: 28, weight: 700, color: COL.energy });
      }
    },
  };
}

/* ═══════════════ 확인 활동 : 거꾸로 영상 맞히기 ═══════════════
   정방향 · 거꾸로 · 알 수 없다 가운데 고른다. 진자와 탄성 충돌처럼 엔트로피가 늘지 않는 움직임은 '알 수 없다'. */
const BIG_GAS = gasFrames(70, 0.55, 8, 41);
const BIG_INK = inkFrames(170, 0.55, 9, 77);
const BIG_HEAT = heatFrames(10);
/** 튀는 공 : 튈 때마다 높이가 줄어든다 (높이 0~1) */
const BALL = (function () {
  const out = []; let y = 1, v = 0; const g = 3.2, e = 0.74, dt = 1 / FPS;
  for (let f = 0; f <= 7 * FPS; f++) { out.push(y); v -= g * dt; y += v * dt; if (y < 0) { y = 0; v = -v * e; if (Math.abs(v) < 0.18) v = 0; } }
  return out;
}());
const GUESS = [
  { k: 'gas', dir: -1, ans: 'rev', title: '기체', why: '거꾸로 돌린 영상이다. 퍼져 있던 기체가 저절로 한쪽에 모였다. 경우의 수가 적은 쪽으로 간 것이라 실제로는 일어나지 않는다.' },
  { k: 'pend', dir: 1, ans: 'both', title: '진자', why: '알 수 없다. 마찰이 없는 진자는 거꾸로 돌려도 똑같이 자연스럽다. 엔트로피가 늘지 않는 움직임은 시간의 방향이 드러나지 않는다.' },
  { k: 'heat', dir: 1, ans: 'fwd', title: '맞붙인 두 물체', why: '정방향이다. 에너지가 뜨거운 쪽에서 찬 쪽으로 퍼져 두 물체의 온도가 같아졌다.' },
  { k: 'ball', dir: -1, ans: 'rev', title: '튀는 공', why: '거꾸로 돌린 영상이다. 실제 공은 튈 때마다 역학적 에너지의 일부가 열과 소리로 흩어져 점점 낮게 튄다. 흩어진 열이 모여 공을 더 높이 튀게 하는 일은 저절로 일어나지 않는다.' },
  { k: 'hit', dir: -1, ans: 'both', title: '부딪히는 두 공', why: '알 수 없다. 마찰 없이 탄성 충돌하는 두 공은 거꾸로 돌려도 물리 법칙에 맞는다.' },
  { k: 'ink', dir: 1, ans: 'fwd', title: '잉크', why: '정방향이다. 잉크가 물에 골고루 퍼졌다.' },
];
const GUESS_ANS = [['fwd', '정방향 영상'], ['rev', '거꾸로 돌린 영상'], ['both', '알 수 없다 (어느 쪽도 자연스럽다)']];
function sceneGuess(root) {
  let pi = 0, chosen = null, shown = false, t = 0;
  const cv = makeCanvas(1120, 690);
  let clip = null;
  function setup() {
    const g = GUESS[pi];
    clip = g.k === 'gas' ? makeClip(BIG_GAS, { loop: true }) : g.k === 'ink' ? makeClip(BIG_INK, { loop: true }) : g.k === 'heat' ? makeClip(BIG_HEAT, { loop: true }) : g.k === 'ball' ? makeClip(BALL, { loop: true }) : null;
    if (clip) clip.play(g.dir);
    t = 0;
  }
  const numEl = h('span', { class: 'mono', style: 'font-weight:700' });
  const answers = GUESS_ANS.map(function (a) { return h('button', { class: 'btn answer', type: 'button', text: a[1], onclick: function () { chosen = a[0]; render(); } }); });
  const reveal = h('div', { class: 'reveal' });
  const showBtn = h('button', { class: 'btn primary', type: 'button', text: '정답 보기', onclick: function () { shown = true; render(); } });
  const nextBtn = h('button', { class: 'btn', type: 'button', text: '다음 문제', onclick: function () { pi = (pi + 1) % GUESS.length; chosen = null; shown = false; setup(); render(); } });
  root.append(h('div', { class: 'col', style: 'height:100%;gap:18px' },
    h('div', { class: 'row', style: 'align-items:center;justify-content:space-between' },
      h('p', { class: 'ws', style: 'font-size:34px;font-weight:700' }, '이 영상은 정방향일까, 거꾸로 돌린 것일까?'),
      h('div', { style: 'font-size:28px;white-space:nowrap' }, '문제 ', numEl)),
    h('div', { class: 'row', style: 'gap:22px;flex:1;min-height:0' },
      h('section', { class: 'panel col fix', style: 'padding:0;justify-content:center' }, cv.c),
      h('section', { class: 'panel col fill pad', style: 'gap:18px;min-height:0' },
        h('div', { class: 'pick3' }, answers),
        h('div', { class: 'fill', style: 'min-height:0' }, reveal),
        h('div', { class: 'row', style: 'gap:12px' }, showBtn, nextBtn)))));
  function render() {
    const g = GUESS[pi];
    numEl.textContent = (pi + 1) + '/' + GUESS.length;
    answers.forEach(function (b, i) {
      const k = GUESS_ANS[i][0];
      b.classList.toggle('right', shown && k === g.ans);
      b.classList.toggle('wrong', shown && chosen === k && k !== g.ans);
      b.setAttribute('aria-pressed', String(chosen === k && !shown));
    });
    reveal.replaceChildren();
    if (shown) reveal.append(h('b', { text: g.title + ' : ' + GUESS_ANS.find(function (a) { return a[0] === g.ans; })[1] }), h('br'), g.why);
    else reveal.append('모둠에서 답을 정하고, 엔트로피나 경우의 수로 까닭을 말해 보세요.');
  }
  setup(); render();
  return {
    annoKey: function () { return 'guess:' + pi; },
    tick: function (dt, now) {
      const g = GUESS[pi], c = cv.ctx;
      c.clearRect(0, 0, 1120, 690);
      t += dt;
      if (clip) clip.step(dt);
      txt(c, '영상 ' + (pi + 1) + ' · ' + g.title, 40, 46, { size: 30, weight: 700 });
      if (g.k === 'gas') drawGas(c, clip.frame(), { x: 60, y: 90, w: 1000 }, { aspect: 0.55, r: 12 });
      else if (g.k === 'ink') drawInk(c, clip.frame(), { x: 160, y: 110, w: 800, h: 440 });
      else if (g.k === 'heat') drawHeat(c, clip.frame(), { x: 110, y: 110, w: 900, h: 400 }, now, { size: 28 });
      else if (g.k === 'ball') {
        const y = clip.frame(), fy = 590, top = 110;
        c.fillStyle = COL['ink-2']; c.fillRect(160, fy, 800, 10);
        dot(c, 560, fy - 40 - y * (fy - top - 80), 40, COL.heat);
      } else if (g.k === 'pend') {
        const th = 0.62 * Math.cos(t * 2 * Math.PI / 2.4), L = 430, ox = 560, oy = 100;
        c.fillStyle = COL['ink-2']; c.fillRect(380, oy - 14, 360, 14);
        const bx = ox + Math.sin(th) * L, by = oy + Math.cos(th) * L;
        c.strokeStyle = COL['ink-2']; c.lineWidth = 5; c.beginPath(); c.moveTo(ox, oy); c.lineTo(bx, by); c.stroke();
        dot(c, bx, by, 40, COL.energy);
      } else if (g.k === 'hit') {
        // 왼쪽 공이 오른쪽 공에 부딪혀 멈추고, 오른쪽 공이 같은 빠르기로 굴러간다 (영상은 거꾸로)
        const P = 4.2, u = (t % (P + 1)) / P, s = clamp(1 - u, 0, 1), R = 44, y = 400;
        const xA = s < 0.5 ? 160 + s / 0.5 * 300 : 460, xB = s < 0.5 ? 460 + 2 * R : 460 + 2 * R + (s - 0.5) / 0.5 * 300;
        c.fillStyle = COL['ink-2']; c.fillRect(100, y + R, 920, 8);
        dot(c, xA, y, R, COL.cold); dot(c, xB, y, R, COL.heat);
      }
      progressBar(c, 60, 662, 1000, clip ? clip.progress() : (t % 4) / 4, 1);
    },
  };
}
