/* ═══════════════ 02. 탄성파의 진행과 활용 : 장면 ═══════════════
   탄성파(횡파 · 종파) → 파동의 속력(공식 유도) → 투과와 반사 → 탄성파의 활용 → 주의 → 예제.
   학습지 빈칸 : ① 에너지 ② 수직 ③ 소리 ④ 1 / T ⑤ 매질 ⑥ 변하지 않는다 ⑦ 뒤집힌다 ⑧ 시간 ⑨ 340 ⑩ 0.34 ⑪ 0.15 */
const P1 = '1 탄성파의 진행', P2 = '2 투과와 반사, 그리고 활용';
const SCENE_LIST = [
  { id: 'wave', part: P1, title: '횡파와 종파', ws: '학습지 1-(1) ① [표 1] ②③', make: sceneWave },
  { id: 'speed', part: P1, title: '파동의 속력', ws: '학습지 1-(2) ④⑤', make: sceneSpeed },
  { id: 'bound', part: P2, title: '경계면에서 일어나는 일', ws: '학습지 2-(1) ⑥ [표 2] ⑦', make: sceneBound },
  { id: 'use', part: P2, title: '탄성파의 활용', ws: '학습지 2-(2) ⑧', make: sceneUse },
  { id: 'mis', part: P2, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'ex', part: '3 예제', title: '예제', ws: '학습지 3 예제 ⑨⑩⑪', make: sceneEx },
];
const TAU = Math.PI * 2;
/** 매질 입자 한 줄 : 횡파(위아래) 또는 종파(좌우). 빨간 입자 하나는 제자리에서만 흔들린다 */
function particles(c, x0, x1, y, lam, ph, amp, trans, n) {
  const N = n || 40;
  for (let i = 0; i < N; i++) {
    const X = x0 + (x1 - x0) * i / (N - 1), d = amp * Math.sin(TAU * X / lam - ph);
    const px = trans ? X : X + d * 0.8, py = trans ? y - d : y;
    dot(c, px, py, i === 12 ? 11 : 8, i === 12 ? COL.pen : COL.cold);
  }
}

/* ── 1-(1) 횡파와 종파 ── */
function sceneWave(root) {
  let mode = 0, t = 0;
  const cv = makeCanvas(900, 560);
  const seg = KIT.seg(['횡파', '종파'], 0, function (i) { mode = i; }, false);
  KIT.split(root, cv, [seg.el], [
    KIT.cap('(1) 탄성파란'),
    KIT.p('• 매질을 이루는 입자들이 이웃한 입자를 차례로 끌어당기고 밀면서 진동이 퍼져 나가는 것이 탄성파이다.'),
    KIT.p('• 이때 이동하는 것은 매질이 아니라 {{①|에너지}}이다. 물결 위의 나뭇잎이 제자리에서 오르내리는 것과 같다.'),
    KIT.cap('[표 1] 진동 방향에 따른 분류'),
    KIT.table(['구분', '진동 방향과 진행 방향', '예'], [
      ['횡파', '서로 {{②|수직}}', '줄을 흔들 때 생기는 파동, 지진파의 S파'],
      ['종파', '서로 나란함', '{{③|소리}}, 용수철을 밀었다 당길 때, 지진파의 P파'],
    ], { cols: ['16%', '34%', '50%'], big: true }),
  ]);
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      particles(c, 60, 840, 280, 300, t * 4, 70, mode === 0, 40);
      KIT.vec(c, 600, 460, 200, 0, COL.energy, '파동이 나아가는 방향', { size: 22, off: 20, lx: -100, ly: 30 });
      if (mode === 0) { KIT.vec(c, 290, 380, 0, -60, COL.pen, '', { width: 5, head: 16 }); KIT.vec(c, 290, 380, 0, 60, COL.pen, '', { width: 5, head: 16 }); txt(c, '진동 방향', 320, 380, { size: 22, weight: 700, color: COL.pen }); }
      else { KIT.vec(c, 290, 380, -50, 0, COL.pen, '', { width: 5, head: 16 }); KIT.vec(c, 290, 380, 50, 0, COL.pen, '', { width: 5, head: 16 }); txt(c, '진동 방향', 290, 420, { size: 22, weight: 700, color: COL.pen, align: 'center' }); }
      txt(c, mode === 0 ? '횡파 : 입자가 위아래로 진동, 파동은 오른쪽으로' : '종파 : 입자가 앞뒤로 진동 → 빽빽한 곳과 성긴 곳이 나아간다', 30, 44, { size: 24, weight: 700 });
      txt(c, '빨간 입자 : 제자리에서 흔들릴 뿐 따라가지 않는다', 30, 90, { size: 22, color: COL.pen, weight: 700 });
    },
  };
}

/* ── 1-(2) 공식 유도 : 파동의 속력 ── */
function sceneSpeed(root) {
  const cv = makeCanvas(900, 470);
  const sf = KIT.slider('진동수 f', 0.5, 2, 0.25, 1, function (v) { return v + ' Hz'; }, '110px');
  let t = 0;
  KIT.derive(root, {
    cv: cv, title: '파동의 속력',
    ctrl: [h('div', { style: 'width:100%' }, sf.el)],
    intro: '파장 λ, 주기 T, 진동수 f 인 파동을 생각한다.',
    steps: [
      { what: '한 주기 T 동안 파동은 정확히 한 파장 λ 만큼 나아간다.', note: '파형이 한 번 반복되는 시간이 주기이기 때문이다.' },
      { what: '속력은 이동 거리 ÷ 걸린 시간이다.', eq: 'v = [[λ|T]]', note: '등속으로 진행하므로 그대로 나눈다.' },
      { what: '진동수는 주기의 역수이다.', eq: 'f = {{④|1 / T}}', note: '1초 동안 반복되는 횟수가 진동수이다.' },
      { what: '대입하여 정리한다.', eq: '∴ v = f λ', note: '파동의 가장 기본이 되는 관계식이다.' },
    ],
    means: '파동의 속력 v 는 {{⑤|매질}}의 성질로 정해진다. 진동수 f 는 파원이 정한다. 따라서 같은 매질 안에서는 진동수가 커지면 파장이 짧아진다.',
  });
  return {
    tick: function (dt) {
      t += dt;
      const f = sf.get(), v = 240, lam = v / f, c = cv.ctx; c.clearRect(0, 0, 900, 470);
      const y = 230;
      c.strokeStyle = COL.cold; c.lineWidth = 5; c.beginPath();
      for (let x = 40; x <= 880; x += 4) { const yy = y - 80 * Math.sin(TAU * (x / lam - f * t)); if (x === 40) c.moveTo(x, yy); else c.lineTo(x, yy); }
      c.stroke();
      // 마루 하나를 따라가며 한 주기 동안 한 파장 나아감을 보인다
      const crest = 40 + ((v * t) % lam) + lam / 4;
      dot(c, crest, y - 80, 11, COL.heat);
      KIT.dash(c, crest, y - 80, crest, y + 130, COL.heat, 2, [5, 5]);
      KIT.dash(c, crest + lam, y - 80, crest + lam, y + 130, COL.heat, 2, [5, 5]);
      arrow(c, crest, y + 120, crest + lam, y + 120, { width: 3, color: COL.heat, head: 14 });
      txt(c, 'λ = ' + Math.round(lam) + ' (화면 단위)', crest + lam / 2, y + 150, { size: 22, weight: 700, color: COL.heat, align: 'center' });
      txt(c, 'v = f λ = ' + f + ' × ' + Math.round(lam) + ' = ' + v + ' (그대로)', 30, 44, { size: 26, weight: 700, color: COL.energy, mono: true });
      txt(c, '진동수를 바꾸어도 속력은 같고, 파장이 바뀐다', 30, 84, { size: 22, color: COL.muted });
    },
  };
}

/* ── 2-(1) 경계면 : 고정단 · 자유단 반사, 다른 매질 ── */
function sceneBound(root) {
  let mode = 0, t = 0;
  const cv = makeCanvas(900, 520);
  const seg = KIT.seg(['고정단 반사', '자유단 반사', '다른 매질로'], 0, function (i) { mode = i; t = 0; }, true);
  KIT.split(root, cv, [seg.el, KIT.btn('다시', function () { t = 0; })], [
    KIT.p('• 성질이 다른 두 매질이 만나는 경계면에서 파동의 일부는 통과하고(투과) 일부는 되돌아온다(반사).', 'ws sm'),
    KIT.p('• 경계면을 지나도 진동수 f 는 {{⑥|변하지 않는다}}. 파원이 흔드는 횟수는 그대로이기 때문이다. 대신 속력과 파장이 함께 변한다.', 'ws sm'),
    KIT.cap('[표 2] 반사할 때의 위상 변화'),
    KIT.table(['경계', '반사파의 위상', '예'], [
      ['고정단 (더 단단한 쪽으로)', '{{⑦|뒤집힌다}}', '줄의 끝을 벽에 고정하고 흔들 때'],
      ['자유단 (더 무른 쪽으로)', '그대로이다', '줄의 끝을 자유롭게 두고 흔들 때'],
    ], { cols: ['34%', '24%', '42%'] }),
  ]);
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 520);
      const y = 280, end = 760, v = 260;
      if (mode < 2) {
        // 펄스 하나가 끝에서 반사 : 거울상 방법 (고정단은 뒤집힌 상, 자유단은 그대로)
        const pulse = function (x) { const p = (x - (60 + v * t)) / 40, q = (2 * end - x - (60 + v * t)) / 40; return 70 * Math.exp(-p * p) + (mode === 0 ? -1 : 1) * 70 * Math.exp(-q * q); };
        c.strokeStyle = COL.cold; c.lineWidth = 5; c.beginPath();
        for (let x = 40; x <= end; x += 3) { const yy = y - pulse(x); if (x === 40) c.moveTo(x, yy); else c.lineTo(x, yy); }
        c.stroke();
        if (mode === 0) { c.fillStyle = COL['ink-2']; c.fillRect(end, y - 140, 24, 280); txt(c, '벽 (고정단)', end + 12, y + 170, { size: 22, weight: 700, align: 'center' }); }
        else { c.strokeStyle = COL['ink-2']; c.lineWidth = 4; c.beginPath(); c.moveTo(end + 8, y - 140); c.lineTo(end + 8, y + 140); c.stroke(); dot(c, end, y - pulse(end), 9, COL.ink); txt(c, '고리 (자유단)', end, y + 170, { size: 22, weight: 700, align: 'center' }); }
        txt(c, mode === 0 ? '고정단 : 되돌아오는 펄스가 뒤집힌다' : '자유단 : 되돌아오는 펄스가 그대로다', 30, 44, { size: 26, weight: 700 });
        if (60 + v * t > end + 900) t = 0;
      } else {
        // 다른 매질 : 오른쪽이 더 느린 매질 → 파장이 짧아진다. 진동수는 같다
        const f = 1, v1 = 260, v2 = 130, xb = 450;
        c.fillStyle = rgba(COL.work, 0.1); c.fillRect(xb, 80, 450, 400);
        c.strokeStyle = COL.cold; c.lineWidth = 5; c.beginPath();
        for (let x = 40; x <= 880; x += 3) {
          const phase = x < xb ? (x - 40) / v1 : (xb - 40) / v1 + (x - xb) / v2;
          const yy = phase <= t ? y - 70 * Math.sin(TAU * f * (t - phase)) : y;
          if (x === 40) c.moveTo(x, yy); else c.lineTo(x, yy);
        }
        c.stroke();
        txt(c, '매질 1 (빠르다)', 60, 110, { size: 22, weight: 700 }); txt(c, '매질 2 (느리다)', xb + 20, 110, { size: 22, weight: 700, color: COL.work });
        txt(c, '진동수는 그대로 · 느린 매질에서 파장이 짧아진다', 30, 44, { size: 24, weight: 700 });
        if (t > 8) t = 0;
      }
    },
  };
}

/* ── 2-(2) 활용 : 초음파 영상 ── */
function sceneUse(root) {
  const cv = makeCanvas(900, 560);
  let t = 0;
  KIT.split(root, cv, [KIT.btn('초음파 다시 쏘기', function () { t = 0; }, true)], [
    KIT.cap('(2) 탄성파의 활용'),
    KIT.p('• 초음파 영상 : 몸속에서 조직이 바뀌는 경계면마다 반사파가 돌아온다. 돌아오는 데 걸린 {{⑧|시간}}으로 깊이를 계산해 영상을 만든다.', 'ws sm'),
    KIT.p('• 비파괴 검사 : 금속이나 콘크리트 안에 균열이나 빈틈이 있으면 그 경계에서 반사파가 생긴다. 부수지 않고 내부 결함을 찾아낼 수 있다.', 'ws sm'),
    KIT.p('• 지진파 분석 : 속력이 다른 P파와 S파의 도착 시간 차이로 진원까지의 거리를 구한다.', 'ws sm'),
    KIT.callout('깊이 = [[속력 × 돌아오는 데 걸린 시간|2]] (갔다가 돌아오므로 2 로 나눈다)', true, 'font-size:26px'),
  ]);
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const x0 = 80, y0 = 70, v = 220, depths = [140, 260, 360];
      c.fillStyle = COL['ink-2']; rrect(c, x0 - 40, y0 - 30, 80, 40, 8); c.fill(); txt(c, '탐촉자', x0, y0 - 46, { size: 20, weight: 700, align: 'center' });
      [['피부', 0, 'rgba(255,200,160,0.35)'], ['근육', depths[0], 'rgba(220,120,120,0.25)'], ['뼈', depths[1], 'rgba(200,200,200,0.5)'], ['', depths[2], 'rgba(160,160,200,0.2)']].forEach(function (L, i) {
        const top = y0 + L[1], bot = y0 + (depths[i] || 460);
        c.fillStyle = L[2]; c.fillRect(0, top, 560, bot - top);
        if (L[0]) txt(c, L[0], 520, top + 26, { size: 20, weight: 700, align: 'right' });
      });
      const d = v * t;
      if (d < 460) KIT.vec(c, x0, y0, 0, d, COL.energy, '', { width: 5, head: 16 });
      // 경계면마다 돌아오는 반사파와 그 시각
      depths.forEach(function (D, i) {
        const back = v * t - D;
        if (back > 0 && back < D) KIT.vec(c, x0 + 30 + i * 30, y0 + D, 0, -back, COL.heat, '', { width: 4, head: 14 });
        const tr = 2 * D / v;
        const gx = 620, gy = 120 + i * 120;
        txt(c, '경계면 ' + (i + 1), gx, gy, { size: 22, weight: 700 });
        txt(c, t > tr ? '돌아온 시간 ' + tr.toFixed(2) + ' s → 깊이 ' + Math.round(D) : '…', gx, gy + 34, { size: 20, color: t > tr ? COL.heat : COL.muted });
      });
      if (t > 4.5) t = 0;
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '매질도 이동?', q: '파동이 진행하면 매질도 함께 이동한다?', wrong: '물결이 밀려오니 물도 같이 밀려온다.',
      why: '매질의 각 입자는 제자리에서 진동만 할 뿐 파동을 따라가지 않는다.', right: '이동하는 것은 에너지와 진동의 모양이다. 물 위의 나뭇잎은 위아래로만 흔들리고 해안으로 실려 가지 않는다.' },
    { short: '진동수 변화?', q: '다른 매질로 들어가면 진동수가 변한다?', wrong: '속력이 변했으니 진동수도 변할 것이다.',
      why: '진동수를 정하는 것은 파원이다. 경계면에서 1초에 도착한 파동의 개수와 나간 개수는 같아야 한다.', right: '진동수는 그대로이고 속력과 파장이 함께 변한다. v = fλ 에서 f 가 고정이므로 v 와 λ 는 같은 비율로 변한다.' },
  ], {
    w: 860, h: 520,
    draw: function (c, which, dt) {
      t += dt;
      const y = 280;
      if (which === 0) {
        c.fillStyle = rgba(COL.cold, 0.15); c.fillRect(0, y, 860, 240);
        c.strokeStyle = COL.cold; c.lineWidth = 5; c.beginPath();
        for (let x = 0; x <= 860; x += 4) { const yy = y - 50 * Math.sin(TAU * (x / 260 - t * 0.6)); if (x === 0) c.moveTo(x, yy); else c.lineTo(x, yy); }
        c.stroke();
        const lx = 430, ly = y - 50 * Math.sin(TAU * (lx / 260 - t * 0.6));
        c.fillStyle = COL.good; c.beginPath(); c.ellipse(lx, ly - 10, 34, 14, 0.2, 0, TAU); c.fill();
        KIT.dash(c, lx, y - 80, lx, y + 80, COL.muted, 2, [5, 5]);
        txt(c, '나뭇잎은 제자리에서 오르내리기만 한다', 30, 44, { size: 26, weight: 700 });
      } else {
        const xb = 430;
        c.fillStyle = rgba(COL.work, 0.1); c.fillRect(xb, 80, 430, 400);
        c.strokeStyle = COL.cold; c.lineWidth = 5; c.beginPath();
        for (let x = 0; x <= 860; x += 3) { const ph = x < xb ? x / 240 : xb / 240 + (x - xb) / 120; const yy = y - 60 * Math.sin(TAU * (ph - t * 0.8)); if (x === 0) c.moveTo(x, yy); else c.lineTo(x, yy); }
        c.stroke();
        txt(c, '1초에 지나가는 마루의 수는 양쪽이 같다 (진동수 같음)', 30, 44, { size: 24, weight: 700 });
        txt(c, '파장 길다', 120, 440, { size: 22, weight: 700 }); txt(c, '파장 짧다', xb + 120, 440, { size: 22, weight: 700, color: COL.work });
      }
    },
  });
}

/* ── 3 예제 ── */
function sceneEx(root) {
  const cv = makeCanvas(860, 500);
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.cap('예제'),
    KIT.p('어떤 매질에서 진동수 500 Hz, 파장 0.68 m 인 소리가 진행하고 있다.', 'ws sm', 'font-weight:600'),
    KIT.p('(1) 소리의 속력 　v = f λ = 500 × 0.68 = {{⑨|340}} m/s'),
    KIT.p('(2) 주기 　T = [[1|f]] = [[1|500]] = {{(2)|0.002}} s'),
    KIT.p('(3) 진동수를 1000 Hz 로 올리면 같은 매질에서 파장은 {{⑩|0.34}} m 가 된다.'),
    KIT.p('(4) 초음파를 쏘고 0.0002 초 만에 반사파가 돌아왔다면, 경계면까지의 거리는 　v t ÷ 2 = 1500 × 0.0002 ÷ 2 = {{⑪|0.15}} m', 'ws sm'),
  ], { center: true });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx, y = 220, lam = 340; c.clearRect(0, 0, 860, 500);
      c.strokeStyle = COL.cold; c.lineWidth = 5; c.beginPath();
      for (let x = 40; x <= 820; x += 4) { const yy = y - 70 * Math.sin(TAU * (x / lam - t * 0.5)); if (x === 40) c.moveTo(x, yy); else c.lineTo(x, yy); }
      c.stroke();
      arrow(c, 100, 360, 100 + lam, 360, { width: 3, color: COL.heat, head: 14 }); arrow(c, 100 + lam, 360, 100, 360, { width: 3, color: COL.heat, head: 14 });
      txt(c, 'λ = 0.68 m', 100 + lam / 2, 392, { size: 24, weight: 700, color: COL.heat, align: 'center' });
      txt(c, 'f = 500 Hz', 30, 44, { size: 26, weight: 700, color: COL.energy });
    },
  };
}
