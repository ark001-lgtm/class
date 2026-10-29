/* ═══════════════ 04. 소리의 간섭 : 장면 ═══════════════
   중첩 원리 → 보강 · 상쇄 간섭의 조건(공식 유도) → 소음 제거 · 음향 설계 → 주의 → 예제.
   학습지 빈칸 : ① 더한 ② 일정한 ③ 보강 ④ 상쇄 ⑤ 재배치 ⑥ 반대 ⑦ 작다 ⑧ 1 ⑨ 보강 ⑩ 크게 */
const P1 = '1 중첩과 간섭', P2 = '2 간섭의 활용';
const SCENE_LIST = [
  { id: 'super', part: P1, title: '중첩 원리', ws: '학습지 1-(1) ①②', make: sceneSuper },
  { id: 'cond', part: P1, title: '보강 간섭과 상쇄 간섭의 조건', ws: '학습지 1-(2) ③④⑤', make: sceneCond },
  { id: 'use', part: P2, title: '소음 제거와 음향 설계', ws: '학습지 2 ⑥⑦', make: sceneUse },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑧⑨⑩', make: sceneEx },
];
const TAU = Math.PI * 2;
function curve(c, x0, x1, fn, color, w, dash) {
  c.strokeStyle = color; c.lineWidth = w || 4; if (dash) c.setLineDash(dash);
  c.beginPath(); for (let x = x0; x <= x1; x += 3) { const y = fn(x); if (x === x0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); c.setLineDash([]);
}
/** 두 스피커(같은 위상)의 간섭 세기 지도 : 밝을수록 소리가 크다 */
function interference(w, hh, s1, s2, lam, cell) {
  const cols = Math.ceil(w / cell), rows = Math.ceil(hh / cell), out = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = (i + 0.5) * cell, y = (j + 0.5) * cell, d = Math.hypot(x - s1.x, y - s1.y) - Math.hypot(x - s2.x, y - s2.y);
    out[j * cols + i] = Math.pow(Math.cos(Math.PI * d / lam), 2);
  }
  return { cols: cols, rows: rows, a: out, cell: cell };
}
function speaker(c, x, y, label) {
  c.fillStyle = COL['ink-2']; rrect(c, x - 22, y - 22, 30, 44, 6); c.fill();
  c.beginPath(); c.moveTo(x + 8, y - 14); c.lineTo(x + 26, y - 28); c.lineTo(x + 26, y + 28); c.lineTo(x + 8, y + 14); c.closePath(); c.fill();
  if (label) txt(c, label, x - 30, y, { size: 22, weight: 700, align: 'right' });
}

/* ── 1-(1) 중첩 원리 ── */
function sceneSuper(root) {
  let mode = 0, t = 0;
  const cv = makeCanvas(900, 560);
  const seg = KIT.seg(['같은 쪽으로 볼록', '반대쪽으로 볼록'], 0, function (i) { mode = i; t = 0; }, false);
  KIT.split(root, cv, [seg.el, KIT.btn('다시', function () { t = 0; })], [
    KIT.cap('(1) 중첩 원리'),
    KIT.p('• 두 파동이 만나면 그 지점의 변위는 각 파동의 변위를 그대로 {{①|더한}} 값이 된다. 이를 중첩 원리라 한다.'),
    KIT.p('• 중첩된 뒤 두 파동은 서로를 방해하지 않고 원래의 모양대로 지나간다. 여러 사람의 목소리가 섞여도 각각 알아들을 수 있는 이유이다.'),
    KIT.p('• 중첩이 한곳에서 {{②|일정한}} 모양으로 계속 유지될 때 이를 간섭이라고 한다. 그러려면 두 파원의 진동수와 위상 관계가 변하지 않아야 한다.'),
  ]);
  return {
    tick: function (dt) {
      t += dt; if (t > 5) t = 0;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const y = 300, v = 150, a1 = function (x) { const p = (x - (100 + v * t)) / 45; return 80 * Math.exp(-p * p); }, a2 = function (x) { const p = (x - (800 - v * t)) / 45; return (mode ? -60 : 60) * Math.exp(-p * p); };
      c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(40, y); c.lineTo(860, y); c.stroke();
      curve(c, 40, 860, function (x) { return y - a1(x); }, COL.cold, 3, [8, 6]);
      curve(c, 40, 860, function (x) { return y - a2(x); }, COL.heat, 3, [8, 6]);
      curve(c, 40, 860, function (x) { return y - a1(x) - a2(x); }, COL.energy, 6);
      txt(c, '점선 : 두 파동 각각 · 굵은 선 : 더한 결과(중첩)', 30, 44, { size: 24, weight: 700 });
      txt(c, '만난 뒤에는 원래 모양 그대로 지나간다', 30, 520, { size: 22, color: COL.muted });
    },
  };
}

/* ── 1-(2) 공식 유도 : 보강 · 상쇄 조건 ── */
function sceneCond(root) {
  const cv = makeCanvas(900, 480);
  const sp = KIT.slider('점 P 의 위치', 0, 1, 0.01, 0.5, function (v) { return Math.round(v * 100) + ''; }, '150px');
  const s1 = { x: 90, y: 170 }, s2 = { x: 90, y: 310 }, lam = 46;
  const map = interference(700, 480, s1, s2, lam, 10);
  const img = document.createElement('canvas'); img.width = map.cols; img.height = map.rows;
  const ix = img.getContext('2d'), id = ix.createImageData(map.cols, map.rows);
  KIT.derive(root, {
    cv: cv, title: '보강 간섭과 상쇄 간섭의 조건',
    ctrl: [h('div', { style: 'width:100%' }, sp.el)],
    intro: '같은 진동수, 같은 위상으로 소리를 내는 두 스피커 S₁, S₂ 에서 나온 소리가 점 P 에서 만난다.',
    steps: [
      { what: '두 소리가 P 까지 온 거리의 차를 경로차라 한다.', eq: 'Δ = | S₁P − S₂P |', note: '출발할 때 위상이 같았으므로 차이는 거리에서만 생긴다.' },
      { what: '경로차가 파장의 정수배이면 마루와 마루가 겹친다.', eq: 'Δ = m λ (m = 0, 1, 2, …)', note: '한 파장만큼 늦게 와도 파형은 똑같아 보인다.' },
      { what: '이때 진폭이 커지는 {{③|보강}} 간섭이 일어난다.', eq: '소리가 크게 들린다.', note: '두 변위가 같은 방향으로 더해지기 때문이다.' },
      { what: '경로차가 반파장의 홀수배이면 마루와 골이 겹친다.', eq: '∴ Δ = ( m + [[1|2]] ) λ', note: '반 파장만큼 어긋나면 위상이 정반대가 된다.' },
      { what: '이때 진폭이 줄어드는 {{④|상쇄}} 간섭이 일어난다.', note: '두 변위가 서로 반대 방향이라 지워진다.' },
    ],
    means: '소리가 크게 들리는 곳과 작게 들리는 곳이 공간에 번갈아 생긴다. 두 스피커 앞을 걸어가면 소리가 커졌다 작아졌다 한다. 이때 에너지가 사라진 것이 아니라 {{⑤|재배치}}된 것이다.',
  });
  return {
    tick: function () {
      if (!img.done) {
        const dark = isDark();
        for (let i = 0; i < map.a.length; i++) { const v = map.a[i]; id.data[4 * i] = dark ? 40 + 120 * v : 255 - 70 * v; id.data[4 * i + 1] = dark ? 40 + 90 * v : 255 - 110 * v; id.data[4 * i + 2] = dark ? 60 + 160 * v : 255 - 20 * v; id.data[4 * i + 3] = 255; }
        ix.putImageData(id, 0, 0); img.done = true;
      }
      const c = cv.ctx; c.clearRect(0, 0, 900, 480);
      c.imageSmoothingEnabled = true; c.drawImage(img, 0, 0, map.cols * 10, map.rows * 10);
      speaker(c, s1.x, s1.y, 'S₁'); speaker(c, s2.x, s2.y, 'S₂');
      const px = 640, py = 30 + sp.get() * 420;
      KIT.dash(c, px, 20, px, 470, COL['ink-2'], 2, [6, 6]);
      KIT.line(c, [[s1.x + 26, s1.y], [px, py]], COL.cold, 3); KIT.line(c, [[s2.x + 26, s2.y], [px, py]], COL.heat, 3);
      const d = Math.abs(Math.hypot(px - s1.x, py - s1.y) - Math.hypot(px - s2.x, py - s2.y)) / lam, frac = d - Math.floor(d);
      const kind = frac < 0.15 || frac > 0.85 ? '보강 (크게)' : Math.abs(frac - 0.5) < 0.15 ? '상쇄 (작게)' : '중간';
      dot(c, px, py, 12, COL.energy); txt(c, 'P', px + 16, py - 16, { size: 24, weight: 700 });
      c.fillStyle = rgba(COL.panel, 0.9); rrect(c, 700, 160, 190, 140, 12); c.fill();
      txt(c, '경로차', 795, 190, { size: 22, weight: 700, align: 'center' });
      txt(c, KIT.fmt(d, 2) + ' λ', 795, 230, { size: 30, weight: 700, align: 'center', mono: true, color: COL.energy });
      txt(c, kind, 795, 274, { size: 24, weight: 700, align: 'center', color: kind[0] === '보' ? COL.good : kind[0] === '상' ? COL.pen : COL.muted });
      txt(c, '밝은 줄 : 보강 · 어두운 줄 : 상쇄', 140, 460, { size: 20, weight: 700 });
    },
  };
}

/* ── 2 간섭의 활용 : 소음 제거 ── */
function sceneUse(root) {
  const cv = makeCanvas(900, 560);
  let on = true, t = 0;
  const ob = KIT.btn('소음 제거 켜짐', function () { on = !on; ob.textContent = on ? '소음 제거 켜짐' : '소음 제거 꺼짐'; ob.setAttribute('aria-pressed', String(on)); });
  ob.setAttribute('aria-pressed', 'true');
  KIT.split(root, cv, [ob], [
    KIT.cap('(1) 소음 제거'),
    KIT.p('• 소음 제거 이어폰은 바깥 소음을 마이크로 받아들인 뒤, 위상이 정확히 {{⑥|반대}}인 소리를 만들어 함께 내보낸다.', 'ws sm'),
    KIT.p('• 두 소리가 상쇄 간섭을 일으켜 소음이 크게 줄어든다. 귀를 막는 것이 아니라 소리로 소리를 지우는 방식이다.', 'ws sm'),
    KIT.p('• 엔진 소리처럼 규칙적이고 낮은 소리에 특히 잘 듣는다. 갑작스러운 소리는 미리 예측할 수 없어 효과가 {{⑦|작다}}.', 'ws sm'),
    KIT.cap('(2) 소리의 증폭과 음향 설계'),
    KIT.p('• 공연장에서는 여러 스피커에서 나온 소리가 객석에서 보강 간섭이 되도록 위치와 시간 지연을 조정한다. 잘못 배치하면 객석 일부에 상쇄 간섭이 생겨 소리가 잘 들리지 않는 자리가 생긴다.', 'ws sm'),
  ]);
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const noise = function (x) { const u = x / 60 - t * 2; return 40 * Math.sin(u) + 18 * Math.sin(2.3 * u + 1); };
      [['바깥 소음', 140, function (x) { return noise(x); }, COL.heat], ['이어폰이 만든 소리 (위상 반대)', 290, function (x) { return on ? -noise(x) : 0; }, COL.cold], ['귀에 들리는 소리 (합)', 440, function (x) { return noise(x) + (on ? -noise(x) : 0); }, COL.energy]].forEach(function (r) {
        txt(c, r[0], 40, r[1] - 62, { size: 22, weight: 700, color: r[3] });
        c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(40, r[1]); c.lineTo(860, r[1]); c.stroke();
        curve(c, 40, 860, function (x) { return r[1] - r[2](x); }, r[3], 4);
      });
      txt(c, on ? '두 소리가 상쇄되어 거의 들리지 않는다' : '소음이 그대로 들린다', 520, 520, { size: 24, weight: 700, color: COL.energy });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '에너지 소멸?', q: '상쇄 간섭이 일어나면 소리 에너지가 사라진다?', wrong: '소리가 없어졌으니 에너지도 없어진 것이다.',
      why: '에너지 보존 법칙은 어떤 경우에도 성립한다.', right: '상쇄된 지점의 에너지는 보강 간섭이 일어나는 다른 지점으로 옮겨 간 것이다. 전체 에너지의 합은 변하지 않는다.' },
    { short: '언제나 간섭?', q: '두 소리가 겹치면 언제나 간섭무늬가 생긴다?', wrong: '소리가 두 개면 어디서나 커졌다 작아졌다 할 것이다.',
      why: '간섭이 관측되려면 두 파원의 진동수가 같고 위상 관계가 일정하게 유지되어야 한다.', right: '진동수가 제각각인 소음 두 개는 그냥 시끄러워질 뿐 안정된 간섭무늬를 만들지 않는다.' },
  ], {
    w: 860, h: 520,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        // 스피커 앞 한 줄을 따라 소리 세기 : 큰 곳과 작은 곳이 번갈아, 평균은 혼자 낼 때의 2배
        const ax = KIT.axes(c, { x: 70, y: 110, w: 720, h: 320 }, '위치', '소리의 세기');
        KIT.plot(c, ax, function (u) { return 0.9 * Math.pow(Math.cos(Math.PI * (u * 6 + 0.2)), 2); }, 0, 1, COL.energy, 5);
        KIT.dash(c, 70, ax.Y(0.45), 790, ax.Y(0.45), COL.heat, 3);
        txt(c, '평균 (에너지 합은 그대로)', 600, ax.Y(0.45) - 18, { size: 20, weight: 700, color: COL.heat });
        txt(c, '줄어든 곳의 에너지가 늘어난 곳으로 옮겨 갔다', 30, 44, { size: 24, weight: 700 });
      } else {
        // 진동수가 다른 두 소리 : 합의 모양이 시간에 따라 바뀐다
        const y = 280;
        c.strokeStyle = COL.line; c.lineWidth = 2; c.beginPath(); c.moveTo(40, y); c.lineTo(820, y); c.stroke();
        curve(c, 40, 820, function (x) { return y - 50 * Math.sin(x / 30 - t * 3) - 50 * Math.sin(x / 23 - t * 4.1); }, COL.energy, 4);
        txt(c, '진동수가 다른 두 소리 : 한곳에 머무는 무늬가 생기지 않는다', 30, 44, { size: 22, weight: 700 });
      }
    },
  });
}

/* ── 3 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(820, 520);
  KIT.split(root, cv, [], [
    KIT.cap('예제'),
    KIT.p('같은 위상으로 진동수 340 Hz 의 소리를 내는 두 스피커가 있다. 소리의 속력은 340 m/s 이다.', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 소리의 파장 　λ = [[v|f]] = [[340|340]] = {{⑧|1}} m'),
    KIT.p('(2) 경로차가 2 m 인 지점 　Δ = 2λ 이므로 {{⑨|보강}} 간섭'),
    KIT.p('(3) 경로차가 1.5 m 인 지점 　Δ = 1.5λ 이므로 {{(3)|상쇄}} 간섭'),
    KIT.p('(4) 경로차가 3 m 인 지점은 소리가 {{⑩|크게}} 들린다.'),
  ], { center: true });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 820, 520);
      txt(c, '경로차를 파장으로 나누어 본다 (λ = 1 m)', 30, 44, { size: 24, weight: 700 });
      [[2, '2λ', '정수배 → 보강'], [1.5, '1.5λ', '반파장의 홀수배 → 상쇄'], [3, '3λ', '정수배 → 보강']].forEach(function (o, i) {
        const y = 140 + i * 130;
        txt(c, '경로차 ' + o[0] + ' m', 30, y, { size: 24, weight: 700 });
        const w = o[0] * 120;
        c.fillStyle = COL.work; c.fillRect(220, y - 14, w, 28);
        for (let k = 1; k <= 3; k++) { c.fillStyle = COL['ink-2']; c.fillRect(220 + k * 120 - 1, y - 24, 2, 48); }
        txt(c, o[1] + ' : ' + o[2], 220, y + 44, { size: 20, color: COL['ink-2'] });
      });
    },
  };
}
