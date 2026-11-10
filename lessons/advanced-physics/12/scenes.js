/* ═══════════════ 12. 간섭과 회절 : 장면 ═══════════════
   학습지 「빛과 물질의 이중성」(12·15차시) 가운데 Ⅲ. 광학 부분 : 1 ~ 3 과 공식 유도, 오해 1.
   중첩과 간섭 → 영의 이중 슬릿 → 무늬 간격(예제) → 회절 → 공식 유도(무늬 간격) → 자주 하는 오해 → 스스로 점검.
   학습지 빈칸 : ① 보강 간섭 ② 상쇄 간섭 ③ 파동 ④ 비례 ⑤ 반비례 ⑥ 6.0 mm ⑦ 회절 ㉑ 나란하다 ㉒ 보강 간섭 ㉓ λL/d
   (④ ~ ⑳ 사이의 빈칸은 15. 양자 역학 수업 화면에 있다) */
const P1 = '1 파동이 만나면 ─ 중첩과 간섭', P2 = '2 영의 이중 슬릿 실험', P3 = '3 회절';
const SCENE_LIST = [
  { id: 'super', part: P1, title: '중첩과 간섭', ws: '학습지 1 ①②', make: sceneSuper },
  { id: 'slit', part: P2, title: '영의 이중 슬릿 실험', ws: '학습지 2 ③', make: sceneSlit },
  { id: 'fringe', part: P2, title: '무늬 간격', ws: '학습지 2 ④⑤ · 예제 ⑥', make: sceneFringe },
  { id: 'diff', part: P3, title: '회절', ws: '학습지 3 ⑦', make: sceneDiff },
  { id: 'derive', part: '공식 유도', title: '이중 슬릿의 무늬 간격', ws: '공식 유도 ㉑㉒㉓', make: sceneDerive },
  { id: 'mis', part: '자주 하는 오해', title: '자주 하는 오해', ws: '오해 1', make: sceneMis },
  { id: 'check', part: '스스로 점검하기', title: '스스로 점검하기', ws: '스스로 점검하기', make: sceneCheck },
];
const TAU = Math.PI * 2;

/* 스크린 무늬 한 줄 : y 자리의 밝기(0~1)를 색으로 */
function band(c, x, y, w, hh, color, bright) {
  c.fillStyle = '#05080C'; c.fillRect(x, y, w, hh);
  for (let i = 0; i < hh; i++) { const b = bright(y + i); if (b > 0.01) { c.fillStyle = color(b); c.fillRect(x, y + i, w, 1); } }
}

/* ── 1 중첩과 간섭 ── */
function sceneSuper(root) {
  const cv = makeCanvas(900, 600);
  let mode = 0, kind = 0, t = 0;
  const sd = KIT.slider('경로차', 0, 2, 0.05, 0, function (v) { return KIT.fmt(v, 2) + ' λ'; }, '90px');
  sd.el.hidden = true;
  const sKind = KIT.seg(['마루 + 마루', '마루 + 골'], 0, function (i) { kind = i; t = 0; });
  const seg = KIT.seg(['펄스 두 개', '경로차 바꾸기'], 0, function (i) { mode = i; t = 0; sd.el.hidden = i === 0; sKind.el.hidden = i === 1; });
  KIT.split(root, cv, [seg.el, sKind.el], [
    KIT.cap('1 파동이 만나면 ─ 중첩과 간섭'),
    KIT.p('• 두 파동이 한곳에서 만나면 각 파동의 변위가 그대로 더해집니다. 이것을 중첩 원리라 합니다. 만났다가 지나간 뒤에는 서로 아무 영향 없이 제 갈 길을 갑니다.', 'ws sm'),
    KIT.p('• 마루와 마루가 만나 크게 흔들리는 것을 보강 간섭, 마루와 골이 만나 서로 지워지는 것을 상쇄 간섭이라 합니다.', 'ws sm'),
    KIT.p('• 같이 출발한 두 파동이 만날 때 어느 쪽이 될지는 두 파동이 지나온 길이의 차이, 곧 경로차가 정합니다.', 'ws sm'),
    KIT.table(['경로차', '만나는 모습', '결과'], [
      ['0, λ, 2λ, 3λ, … (파장의 정수 배)', '마루와 마루', '{{①|보강 간섭}} → 밝아진다'],
      ['½λ, 1½λ, 2½λ, … ((정수 + ½) 배)', '마루와 골', '{{②|상쇄 간섭}} → 어두워진다'],
    ], { cols: ['38%', '22%', '40%'], plain: true }),
    KIT.p('• 소음 제거 이어폰은 바깥 소음과 마루·골이 반대인 소리를 만들어 상쇄 간섭으로 소음을 지웁니다.', 'ws sm'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sd.el) });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      if (mode === 0) {
        if (t > 4.6) t = 0;
        const y0 = 330, V = 160, x1 = 90 + V * t, x2 = 810 - V * t, A2 = kind ? -1 : 1;
        const g = function (x, cx) { return Math.exp(-Math.pow((x - cx) / 46, 2)); };
        c.fillStyle = COL.line; c.fillRect(30, y0, 840, 2);
        const p1 = [], p2 = [], s = [];
        for (let x = 30; x <= 870; x += 3) { const a = 110 * g(x, x1), b = 110 * A2 * g(x, x2); p1.push([x, y0 - a]); p2.push([x, y0 - b]); s.push([x, y0 - a - b]); }
        c.setLineDash([10, 8]); KIT.line(c, p1, COL.cold, 3); KIT.line(c, p2, COL.heat, 3); c.setLineDash([]);
        KIT.line(c, s, COL.energy, 6);
        const meet = Math.abs(x1 - x2) < 40;
        txt(c, '파란 점선 · 빨간 점선 : 두 펄스 　보라 실선 : 더한 결과', 30, 44, { size: 22, weight: 700 });
        if (meet) pill(c, kind ? '마루 + 골 → 서로 지워진다 (상쇄)' : '마루 + 마루 → 크게 흔들린다 (보강)', 450, 110, kind ? COL.pen : COL.good, { align: 'center', size: 24 });
        if (t > 3.4) txt(c, '만났다가 지나간 뒤에는 처음 모양 그대로 제 갈 길을 간다', 450, 560, { size: 22, weight: 700, align: 'center', color: COL.energy });
        return;
      }
      const d = sd.get(), lam = 220, A = 42, k = TAU / lam, w = t * 3;
      const rows = [[140, 0, COL.cold, '파동 1'], [290, d, COL.heat, '파동 2 (경로차 ' + KIT.fmt(d, 2) + ' λ 만큼 늦게 옴)'], [460, null, COL.energy, '두 파동을 더한 결과']];
      rows.forEach(function (r) {
        const pts = [];
        for (let x = 40; x <= 860; x += 4) {
          const a = A * Math.sin(k * x - w), b = A * Math.sin(k * x - w - TAU * d);
          pts.push([x, r[0] - (r[1] === null ? a + b : r[1] === 0 ? a : b)]);
        }
        c.fillStyle = COL.line; c.fillRect(40, r[0], 820, 2);
        KIT.line(c, pts, r[2], r[1] === null ? 6 : 4);
        txt(c, r[3], 40, r[0] - (r[1] === null ? 100 : 62), { size: 21, weight: 700, color: r[2] });
      });
      const f = d - Math.floor(d), kindTxt = f < 0.1 || f > 0.9 ? ['보강 간섭 → 밝아진다', COL.good] : Math.abs(f - 0.5) < 0.1 ? ['상쇄 간섭 → 어두워진다', COL.pen] : ['그 사이 : 조금 흔들린다', COL.muted];
      pill(c, kindTxt[0], 450, 570, kindTxt[1], { align: 'center', size: 24 });
    },
  };
}

/* ── 2 영의 이중 슬릿 실험 ── */
function sceneSlit(root) {
  const cv = makeCanvas(940, 620);
  let wave = true, t = 0;
  const sl = KIT.slider('빛의 파장 λ', 400, 700, 10, 600, function (v) { return v + ' nm'; }, '150px');
  const sd = KIT.slider('슬릿 간격 d', 60, 160, 10, 100, function (v) { return KIT.fmt(v / 100, 1) + ' 배'; }, '150px');
  const seg = KIT.seg(['실제 (파동)', '빛이 알갱이라면'], 0, function (i) { wave = i === 0; });
  KIT.split(root, cv, [seg.el], [
    KIT.cap('2 영의 이중 슬릿 실험 ─ 빛이 파동이라는 증거'),
    KIT.p('• 1801년 영은 아주 가까이 붙은 두 틈(슬릿)에 빛을 비췄습니다. 빛이 알갱이라면 스크린에는 슬릿 모양의 밝은 줄 두 개만 생겨야 합니다.'),
    KIT.p('• 실제로는 밝고 어두운 줄이 고르게 번갈아 나타났습니다. 두 슬릿에서 나온 빛이 간섭한 것입니다. 이 무늬가 빛이 {{③|파동}}이라는 결정적인 증거입니다.'),
    KIT.p('• 스크린의 한 점 P 가 밝은지 어두운지는 두 슬릿에서 P 까지의 경로차가 정합니다. 경로차가 파장의 정수 배인 곳에는 밝은 무늬, (정수 + ½) 배인 곳에는 어두운 무늬가 생깁니다.'),
  ], { under: h('div', { class: 'col', style: 'padding:0 22px 16px;gap:0' }, sl.el, sd.el) });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 940, 620);
      const nm = sl.get(), lam = nm / 600 * 30, dpx = sd.get(), cy = 310, bx = 260, sx = 760, col = KIT.nm(nm);
      const y1 = cy - dpx / 2, y2 = cy + dpx / 2, ph = (t * 60 / lam) % 1;
      // 광원과 평면파
      c.fillStyle = COL['ink-2']; rrect(c, 20, cy - 30, 40, 60, 8); c.fill();
      c.strokeStyle = KIT.nm(nm, 0.7); c.lineWidth = 3;
      for (let x = 70 + ph * lam; x < bx; x += lam) { c.beginPath(); c.moveTo(x, cy - 200); c.lineTo(x, cy + 200); c.stroke(); }
      // 슬릿 판
      c.fillStyle = COL['ink-2'];
      c.fillRect(bx - 5, 20, 10, y1 - 8 - 20); c.fillRect(bx - 5, y1 + 8, 10, y2 - y1 - 16); c.fillRect(bx - 5, y2 + 8, 10, 600 - y2 - 8);
      if (wave) {
        c.save(); c.beginPath(); c.rect(bx + 6, 20, sx - bx - 6, 580); c.clip();
        [y1, y2].forEach(function (sy) {
          c.strokeStyle = KIT.nm(nm, 0.45); c.lineWidth = 3;
          for (let r = ph * lam; r < 640; r += lam) { c.beginPath(); c.arc(bx, sy, r, -Math.PI / 2, Math.PI / 2); c.stroke(); }
        });
        c.restore();
      } else {
        // 알갱이 : 곧게 날아간다
        for (let i = 0; i < 14; i++) {
          const s = (t * 0.5 + i / 14) % 1, sy = i % 2 ? y1 : y2, x = 70 + s * (sx - 70);
          const y = sy;
          dot(c, x, y, 5, col);
        }
      }
      // 스크린과 밝기 그래프
      const L = sx - bx;
      const I = function (y) {
        if (!wave) { const a = Math.exp(-Math.pow((y - y1) / 10, 2)) + Math.exp(-Math.pow((y - y2) / 10, 2)); return Math.min(1, a); }
        const r1 = Math.hypot(L, y - y1), r2 = Math.hypot(L, y - y2), env = Math.exp(-Math.pow((y - cy) / 330, 2));
        return Math.pow(Math.cos(Math.PI * (r2 - r1) / lam), 2) * env;
      };
      band(c, sx, 20, 26, 580, function (b) { return KIT.nm(nm, b); }, I);
      const pts = []; for (let y = 20; y <= 600; y += 2) pts.push([800 + I(y) * 120, y]);
      c.fillStyle = COL.line; c.fillRect(800, 20, 2, 580);
      KIT.line(c, pts, COL.ink, 3);
      txt(c, '스크린', sx + 13, 612, { size: 18, weight: 700, align: 'center', color: COL.muted });
      txt(c, '밝기', 860, 612, { size: 18, weight: 700, align: 'center', color: COL.muted });
      txt(c, wave ? '밝고 어두운 줄이 번갈아 나타난다' : '알갱이라면 밝은 줄 두 개만', 290, 44, { size: 24, weight: 700, color: wave ? COL.energy : COL.pen });
    },
  };
}

/* ── 2 무늬 간격 · 예제 ── */
function sceneFringe(root) {
  const cv = makeCanvas(900, 560);
  const sl = KIT.slider('파장 λ', 400, 700, 10, 600, function (v) { return v + ' nm'; }, '130px');
  const sd = KIT.slider('슬릿 간격 d', 0.1, 0.4, 0.05, 0.2, function (v) { return KIT.fmt(v, 2) + ' mm'; }, '130px');
  const sL = KIT.slider('거리 L', 1, 3, 0.5, 2, function (v) { return KIT.fmt(v, 1) + ' m'; }, '130px');
  KIT.split(root, cv, [], [
    KIT.p('• 이웃한 밝은 무늬 사이의 간격은 다음과 같습니다. 식은 「공식 유도」에서 직접 이끌어 냅니다.', 'ws sm'),
    KIT.callout('Δy = [[λ L|d]] 　　(d : 슬릿 사이의 간격, 　L : 슬릿과 스크린 사이의 거리)', false, 'font-size:28px'),
    KIT.p('• 무늬 간격은 파장에 {{④|비례}}하고 슬릿 간격에 {{⑤|반비례}}합니다. 그래서 파장이 긴 빨간빛을 쓰면 무늬가 더 넓게 벌어집니다.', 'ws sm'),
    KIT.cap('예제'),
    KIT.p('파장이 600 nm 인 빛을 간격이 0.20 mm 인 이중 슬릿에 비추고, 2.0 m 떨어진 스크린에서 무늬를 보았다. 이웃한 밝은 무늬 사이의 간격은?', 'ws sm', 'font-weight:600'),
    KIT.p('풀이 　Δy = (6.0 × 10^{−7} m)(2.0 m) ÷ (2.0 × 10^{−4} m) = {{⑥|6.0 mm}}. 눈에 보이지 않을 만큼 작은 파장이 자로 잴 수 있는 크기로 커졌다.', 'ws sm'),
  ], { under: h('div', { class: 'col', style: 'padding:0 22px 16px;gap:0' }, sl.el, sd.el, sL.el) });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const nm = sl.get(), d = sd.get(), L = sL.get(), dy = nm * 1e-9 * L / (d * 1e-3) * 1000, mm = 15, x0 = 450;
      txt(c, '스크린에 생긴 무늬 (가운데를 크게 확대)', 30, 40, { size: 22, weight: 700 });
      c.fillStyle = '#05080C'; c.fillRect(30, 80, 840, 200);
      for (let x = 30; x < 870; x++) {
        const y = (x - x0) / mm, b = Math.pow(Math.cos(Math.PI * y / dy), 2) * Math.exp(-Math.pow(y / 60, 2));
        if (b > 0.01) { c.fillStyle = KIT.nm(nm, b); c.fillRect(x, 80, 1, 200); }
      }
      // 자 (mm)
      c.fillStyle = COL['ink-2']; c.fillRect(30, 300, 840, 3);
      for (let k = -28; k <= 28; k++) { const x = x0 + k * mm, big = k % 5 === 0; c.fillRect(x - 1, 300, 2, big ? 22 : 12); if (big) txt(c, String(k), x, 340, { size: 18, align: 'center', color: COL.muted }); }
      txt(c, 'mm', 878, 340, { size: 18, color: COL.muted, align: 'right' });
      const xa = x0, xb = x0 + dy * mm;
      if (xb < 870) {
        arrow(c, xa, 380, xb, 380, { width: 3, head: 14, color: COL.energy }); arrow(c, xb, 380, xa, 380, { width: 3, head: 14, color: COL.energy });
        KIT.dash(c, xa, 280, xa, 390, COL.energy, 2, [5, 5]); KIT.dash(c, xb, 280, xb, 390, COL.energy, 2, [5, 5]);
      }
      c.fillStyle = COL['panel-2']; rrect(c, 30, 420, 840, 120, 14); c.fill();
      txt(c, 'Δy = λL / d = (' + nm + ' × 10^{−9} m)(' + L.toFixed(1) + ' m) ÷ (' + d.toFixed(2) + ' × 10^{−3} m)', 50, 460, { size: 24, weight: 700 });
      txt(c, '= ' + dy.toFixed(1) + ' mm', 50, 506, { size: 32, weight: 700, color: COL.energy, mono: true });
    },
  };
}

/* ── 3 회절 : 틈을 지난 파동 (호이겐스 : 틈의 여러 점에서 나온 파동을 더해 그린다) ── */
function sceneDiff(root) {
  const cv = makeCanvas(900, 600);
  const sa = KIT.slider('틈의 폭', 0.5, 6, 0.5, 1, function (v) { return KIT.fmt(v, 1) + ' × 파장'; }, '100px');
  const lam = 40, bx = 300, cy = 300, cell = 6, cols = Math.ceil((900 - bx) / cell), rows = Math.ceil(600 / cell);
  const img = document.createElement('canvas'); img.width = cols; img.height = rows;
  const ix = img.getContext('2d'), id = ix.createImageData(cols, rows);
  const re = new Float32Array(cols * rows), im = new Float32Array(cols * rows);
  let lastA = -1, t = 0;
  function field(a) {
    const w = a * lam, n = Math.max(3, Math.round(a * 6)), k = TAU / lam;
    let mx = 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = bx + (i + 0.5) * cell, y = (j + 0.5) * cell;
      let sr = 0, si = 0;
      for (let s = 0; s < n; s++) { const sy = cy - w / 2 + w * (s + 0.5) / n, r = Math.hypot(x - bx, y - sy) + 1, amp = 1 / Math.sqrt(r) * ((x - bx) / r); sr += amp * Math.cos(k * r); si += amp * Math.sin(k * r); }
      re[j * cols + i] = sr / n; im[j * cols + i] = si / n;
      mx = Math.max(mx, Math.hypot(sr / n, si / n) * Math.sqrt(Math.hypot(x - bx, y - cy) + 30));
    }
    // 거리에 따라 옅어지는 것을 조금 덜어 내어 멀리까지 보이게 한다
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = bx + (i + 0.5) * cell, y = (j + 0.5) * cell, g = Math.sqrt(Math.hypot(x - bx, y - cy) + 30) / mx; re[j * cols + i] *= g; im[j * cols + i] *= g; }
  }
  KIT.split(root, cv, [h('div', { style: 'width:100%' }, sa.el)], [
    KIT.cap('3 회절 ─ 좁은 틈을 지나면 퍼진다'),
    KIT.p('• 파동은 좁은 틈이나 장애물을 지나면 그 뒤쪽으로 돌아 들어가며 퍼집니다. 이것을 {{⑦|회절}}이라 합니다.'),
    KIT.p('• 틈의 폭이 파장에 가까울수록 크게 퍼집니다. 파장이 1 m 안팎인 소리는 문틈이나 모퉁이를 돌아 잘 들리지만, 파장이 그보다 백만 배 이상 짧은 빛은 그늘을 또렷하게 만드는 이유입니다.', 'ws sm'),
    KIT.p('• 회절 때문에 렌즈로는 파장보다 훨씬 작은 것을 또렷하게 볼 수 없습니다. 배율을 아무리 키워도 가까운 두 점이 뭉개져 하나로 보입니다. 이 한계를 넘는 방법은 15차시의 물질파에서 나옵니다.', 'ws sm'),
  ]);
  return {
    tick: function (dt) {
      t += dt;
      const a = sa.get();
      if (a !== lastA) { lastA = a; field(a); }
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const dark = isDark(), wt = t * 4, cw = Math.cos(wt), sw = Math.sin(wt);
      for (let p = 0; p < cols * rows; p++) {
        const v = clamp(re[p] * cw + im[p] * sw, -1, 1), u = (v + 1) / 2;
        id.data[4 * p] = dark ? 22 + 70 * u : 255 - 200 * u; id.data[4 * p + 1] = dark ? 33 + 120 * u : 255 - 120 * u; id.data[4 * p + 2] = dark ? 43 + 200 * u : 255 - 40 * u; id.data[4 * p + 3] = 255;
      }
      ix.putImageData(id, 0, 0);
      c.imageSmoothingEnabled = true; c.drawImage(img, bx, 0, cols * cell, rows * cell);
      // 틈 앞의 평면파
      for (let x = 20; x < bx; x += 2) {
        const v = Math.cos(TAU / lam * (x - bx) - wt), u = (v + 1) / 2;
        c.fillStyle = dark ? 'rgb(' + Math.round(22 + 70 * u) + ',' + Math.round(33 + 120 * u) + ',' + Math.round(43 + 200 * u) + ')' : 'rgb(' + Math.round(255 - 200 * u) + ',' + Math.round(255 - 120 * u) + ',' + Math.round(255 - 40 * u) + ')';
        c.fillRect(x, 0, 2, 600);
      }
      const w = a * lam;
      c.fillStyle = COL['ink-2']; c.fillRect(bx - 8, 0, 16, cy - w / 2); c.fillRect(bx - 8, cy + w / 2, 16, 600 - cy - w / 2);
      c.fillStyle = rgba(COL.panel, 0.88); rrect(c, 330, 520, 550, 64, 12); c.fill();
      txt(c, a <= 1.5 ? '틈이 파장 정도로 좁으면 크게 퍼진다 (소리와 문틈)' : a >= 4 ? '틈이 파장보다 넓으면 조금만 퍼진다 (빛과 그늘)' : '틈이 넓어질수록 덜 퍼진다', 605, 552, { size: 22, weight: 700, align: 'center', color: COL.energy });
      c.fillStyle = rgba(COL.panel, 0.88); rrect(c, 24, 20, 230, 44, 10); c.fill();
      txt(c, '파장 λ 의 평면파', 40, 42, { size: 20, weight: 700 });
    },
  };
}

/* ── 공식 유도 : 영의 이중 슬릿 실험의 무늬 간격 ── */
function sceneDerive(root) {
  const cv = makeCanvas(900, 600);
  const sy = KIT.slider('점 P 의 높이 y', 0, 220, 5, 140, function (v) { return v ? Math.round(v) + '' : '0 (가운데)'; }, '170px');
  let show = 0;
  const st = KIT.derive(root, {
    cv: cv, title: '영의 이중 슬릿 실험의 무늬 간격',
    ctrl: [h('div', { style: 'width:100%' }, sy.el)],
    intro: '간격이 d 인 두 슬릿에 파장 λ 인 빛을 비추고, L 만큼 떨어진 스크린에서 가운데로부터 y 만큼 떨어진 점 P 를 본다.',
    steps: [
      { what: '두 슬릿에서 P 까지 가는 두 빛의 경로차를 구한다.', eq: 'Δ = d sin θ', note: '스크린이 슬릿 간격보다 아주 멀리(L ≫ d) 있으면 두 빛이 거의 {{㉑|나란하다}}. 그러면 아래 빛이 더 가는 길이가 그림의 빨간 부분, 곧 d sin θ 가 된다.' },
      { what: '각 θ 가 아주 작으므로 sin θ 를 tan θ 로 바꾼다.', eq: 'sin θ ≈ tan θ = [[y|L]] 　→ 　Δ = d [[y|L]]', note: '실험에서 L 은 2 m 정도이고 y 는 몇 mm 라서 각이 아주 작다. 작은 각에서는 sin θ 와 tan θ 가 거의 같다.' },
      { what: '밝은 무늬는 경로차가 파장의 정수 배인 곳이다.', eq: 'd [[y|L]] = m λ 　→ 　yₘ = m [[λ L|d]] 　(m = 0, 1, 2, …)', note: '{{㉒|보강 간섭}} 조건을 넣었다. m 이 하나 커질 때마다 밝은 무늬가 하나씩 나타난다.' },
      { what: '이웃한 두 밝은 무늬의 위치를 뺀다.', eq: 'Δy = yₘ₊₁ − yₘ 　∴ Δy = {{㉓|λL/d}}', note: 'm 이 사라지므로 무늬 간격은 어디서나 같다. 사진 속 무늬가 고르게 늘어선 이유이다.' },
    ],
    means: '무늬 간격 Δy, 거리 L, 슬릿 간격 d 를 자로 재면 눈에 보이지 않는 빛의 파장을 거꾸로 구할 수 있다. 같은 실험을 전자로 하면 물질파의 파장도 잴 수 있다.',
  });
  st.on(function (n) { show = n; });
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const bx = 140, cy = 330, d = 110, s1 = { x: bx, y: cy - d / 2 }, s2 = { x: bx, y: cy + d / 2 }, sx = 820, py = cy - sy.get(), P = { x: sx, y: py };
      c.fillStyle = COL['ink-2'];
      c.fillRect(bx - 5, 60, 10, s1.y - 10 - 60); c.fillRect(bx - 5, s1.y + 10, 10, d - 20); c.fillRect(bx - 5, s2.y + 10, 10, 560 - s2.y - 10);
      c.fillRect(sx, 60, 8, 500);
      txt(c, 'S₁', bx - 30, s1.y, { size: 22, weight: 700, align: 'right' }); txt(c, 'S₂', bx - 30, s2.y, { size: 22, weight: 700, align: 'right' });
      KIT.dash(c, bx, cy, sx, cy, COL.muted, 2, [8, 6]);
      KIT.line(c, [[s1.x, s1.y], [P.x, P.y]], COL.cold, 3); KIT.line(c, [[s2.x, s2.y], [P.x, P.y]], COL.heat, 3);
      dot(c, P.x, P.y, 9, COL.energy); txt(c, 'P', P.x + 20, P.y, { size: 24, weight: 700 });
      // d · L · y
      arrow(c, bx + 22, s1.y, bx + 22, s2.y, { width: 2, head: 10, color: COL['ink-2'] }); arrow(c, bx + 22, s2.y, bx + 22, s1.y, { width: 2, head: 10, color: COL['ink-2'] });
      txt(c, 'd', bx + 34, cy + 18, { size: 22, weight: 700 });
      arrow(c, bx, 585, sx, 585, { width: 2, head: 12, color: COL['ink-2'] }); arrow(c, sx, 585, bx, 585, { width: 2, head: 12, color: COL['ink-2'] });
      txt(c, 'L', (bx + sx) / 2, 570, { size: 22, weight: 700, align: 'center' });
      if (sy.get() > 10) { arrow(c, sx + 30, cy, sx + 30, py, { width: 2, head: 10, color: COL.energy }); txt(c, 'y', sx + 44, (cy + py) / 2, { size: 22, weight: 700, color: COL.energy }); }
      // 1단계 : 빨간 부분 (S₁ 에서 S₂P 에 내린 수선의 발)
      const ux = P.x - s2.x, uy = P.y - s2.y, ul = Math.hypot(ux, uy), ex = ux / ul, ey = uy / ul;
      const proj = (s1.x - s2.x) * ex + (s1.y - s2.y) * ey, F = { x: s2.x + ex * proj, y: s2.y + ey * proj };
      if (show >= 1) {
        KIT.line(c, [[s2.x, s2.y], [F.x, F.y]], COL.pen, 7);
        KIT.dash(c, s1.x, s1.y, F.x, F.y, COL['ink-2'], 2, [4, 4]);
        txt(c, 'd sin θ', F.x + 10, F.y + 26, { size: 22, weight: 700, color: COL.pen });
        const th = Math.atan2(cy - py, sx - bx);
        c.strokeStyle = COL.energy; c.lineWidth = 3; c.beginPath(); c.arc(bx, cy, 70, -th, 0); c.stroke();
        KIT.line(c, [[bx, cy], [P.x, P.y]], rgba(COL.energy, 0.5), 2);
        txt(c, 'θ', bx + 82, cy - 14, { size: 22, weight: 700, color: COL.energy });
      }
      if (show >= 2) txt(c, 'tan θ = y / L', 560, 100, { size: 24, weight: 700, color: COL.energy, mono: true });
      if (show >= 3) {
        [-2, -1, 0, 1, 2].forEach(function (m) { const y = cy - m * 95; if (y > 60 && y < 560) { c.fillStyle = COL.good; c.fillRect(sx - 4, y - 8, 16, 16); txt(c, 'm = ' + m, sx - 12, y, { size: 18, weight: 700, align: 'right', color: COL.good }); } });
      }
      if (show >= 4) { arrow(c, sx + 70, cy, sx + 70, cy - 95, { width: 3, head: 12, color: COL.good }); arrow(c, sx + 70, cy - 95, sx + 70, cy, { width: 3, head: 12, color: COL.good }); txt(c, 'Δy', sx + 54, cy - 48, { size: 20, weight: 700, color: COL.good, align: 'right' }); }
      txt(c, '(그림은 d 를 크게 부풀려 그렸다. 실제로는 L ≫ d 이다)', 30, 40, { size: 20, color: COL.muted });
    },
  };
}

/* ── 자주 하는 오해 ── */
function sceneMis(root) {
  let cmp = true;
  const tog = KIT.btn('간섭이 없을 때와 비교', function () { cmp = !cmp; tog.setAttribute('aria-pressed', String(cmp)); });
  tog.setAttribute('aria-pressed', 'true');
  return KIT.mis(root, [
    { short: '에너지가 사라진다?', q: '상쇄 간섭이 일어나면 빛 에너지가 사라질까?', wrong: '“상쇄 간섭이 일어나면 빛 에너지가 사라진다”', fix: '사라지지 않는다. 어두운 곳으로 갈 에너지가 밝은 곳으로 옮겨 간 것이다. 전체 에너지는 그대로이다.' },
  ], {
    w: 820, h: 600,
    ctrl: function () { return [tog]; },
    draw: function (c) {
      const ax = KIT.axes(c, { x: 70, y: 90, w: 700, h: 380 }, '스크린 위의 자리', '밝기');
      const I = function (u) { return Math.pow(Math.cos((u - 0.5) * TAU * 3), 2); };
      if (cmp) {
        for (let i = 0; i < 700; i += 2) {
          const u = i / 700, v = I(u);
          c.fillStyle = v > 0.5 ? rgba(COL.good, 0.35) : rgba(COL.pen, 0.3);
          const ya = ax.Y(v), yb = ax.Y(0.5); c.fillRect(ax.X(u), Math.min(ya, yb), 2, Math.abs(ya - yb));
        }
        KIT.dash(c, ax.X(0), ax.Y(0.5), ax.X(1), ax.Y(0.5), COL['ink-2'], 3, [10, 8]);
        txt(c, '간섭이 없을 때 (고르게)', ax.X(1), ax.Y(0.5) - 18, { size: 20, weight: 700, align: 'right', color: COL['ink-2'], halo: true });
      }
      KIT.plot(c, ax, I, 0, 1, COL.energy, 5, 300);
      txt(c, '간섭무늬의 밝기', 150, 50, { size: 22, weight: 700, color: COL.energy });
      if (cmp) txt(c, '초록 (늘어난 곳) 넓이 = 빨강 (줄어든 곳) 넓이', 70, 540, { size: 22, weight: 700 });
      txt(c, '에너지는 사라지지 않고 밝은 곳으로 옮겨 간다', 70, 580, { size: 22, weight: 700, color: COL.good });
    },
  }, { label: '오해', start: 1 });
}

/* ── 스스로 점검하기 ── */
function sceneCheck(root) {
  KIT.check(root, [
    { q: '이중 슬릿 실험의 무늬가 빛이 파동이라는 증거가 되는 이유는?', a: '빛이 알갱이라면 밝은 줄 두 개만 생겨야 하는데, 간섭으로 밝고 어두운 무늬가 번갈아 나타나기 때문이다.' },
    { q: '이중 슬릿에서 빨간빛 대신 파란빛을 쓰면 무늬 간격은 어떻게 되는가?', a: '파란빛은 파장이 짧으므로 무늬 간격이 좁아진다.' },
  ]);
  return { tick: function () {} };
}
