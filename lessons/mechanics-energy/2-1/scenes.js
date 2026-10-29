/* ═══════════════ 01. 열과 우리 생활 : 장면 ═══════════════
   열전달(전도 · 대류 · 복사) → 단열과 단열재 → 열팽창 → 주의 → 확인 문제.
   학습지 빈칸 : ① 높은 ② 분자 ③ 직접 이동 ④ 물질 ⑤ 모든 ⑥ 최소화 ⑦ 에너지 ⑧ 두껍게 ⑨ 낮은 ⑩ 공기층 ⑪ 열팽창 ⑫ 분자 ⑬ 비슷 ⑭ C */
const P1 = '1 열전달', P2 = '2 단열과 단열재', P3 = '3 열팽창';
const SCENE_LIST = [
  { id: 'transfer', part: P1, title: '열전달 : 전도 · 대류 · 복사', ws: '학습지 1 ①~⑤ [표 1]', make: sceneTransfer },
  { id: 'insulate', part: P2, title: '단열과 단열재', ws: '학습지 2 ⑥~⑩', make: sceneInsulate },
  { id: 'expand', part: P3, title: '열팽창', ws: '학습지 3 ⑪⑫ [표 2] ⑬', make: sceneExpand },
  { id: 'mis', part: P3, title: '주의', ws: '주의 1 · 2', make: sceneMis },
  { id: 'check', part: '4 확인 문제', title: '확인 문제', ws: '학습지 4 ⑭', make: sceneCheck },
];
const TAU = Math.PI * 2;
/** 온도에 따른 색 : 0 파랑 → 1 주황 */
function hotcol(u) { u = clamp(u, 0, 1); return u < 0.5 ? mix(COL.cold, COL.muted, u * 2) : mix(COL.muted, COL.heat, (u - 0.5) * 2); }

/* ── 1 열전달 ── */
function sceneTransfer(root) {
  let mode = 0, t = 0;
  const cv = makeCanvas(900, 600);
  const seg = KIT.seg(['전도', '대류', '복사'], 0, function (i) { mode = i; t = 0; }, false);
  KIT.split(root, cv, [seg.el, KIT.btn('처음부터', function () { t = 0; })], [
    KIT.p('• 두 물체의 온도 차에 의해 이동하는 에너지를 열이라 한다. 열은 온도가 {{①|높은}} 곳에서 낮은 곳으로 이동한다.', 'ws sm'),
    KIT.cap('[표 1] 열전달의 세 가지 방식'),
    KIT.table(['구분', '열이 전달되는 방식', '예'], [
      ['전도', '물체 내에서 이웃한 {{②|분자}}들에게 열을 전달한다', '난로 옆 벽면'],
      ['대류', '기체나 액체 상태의 분자가 {{③|직접 이동}}하면서 열을 전달한다', '데워진 실내 공기'],
      ['복사', '{{④|물질}}의 도움 없이 직접 열을 전달한다', '난로에서 나오는 열'],
    ], { cols: ['16%', '56%', '28%'] }),
    KIT.p('• 난로처럼 열을 내는 물체뿐만 아니라 {{⑤|모든}} 물체가 복사열을 방출하며 열을 전달한다.', 'ws sm'),
    KIT.hint('※ 열이 전달되는 방식은 한 가지로 정해져 있지 않고 계속 바뀌면서 일어난다. 난로가 복사와 대류로 벽에 열을 전달하면, 벽은 전도와 복사로 실외에 열을 전달한다.', 'font-size:21px'),
  ]);
  const parts = [];
  for (let i = 0; i < 70; i++) parts.push({ a: Math.random() * TAU, r: 0.2 + Math.random() * 0.8, s: 0.6 + Math.random() * 0.6 });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      if (mode === 0) {
        txt(c, '전도 : 금속 막대의 한쪽 끝을 가열한다', 30, 44, { size: 26, weight: 700 });
        const n = 14, x0 = 140, dx = 52, y = 300;
        c.fillStyle = COL['panel-2']; rrect(c, x0 - 40, y - 60, n * dx + 30, 120, 16); c.fill();
        for (let i = 0; i < n; i++) {
          const u = clamp(1 - i / (1 + t * 1.6), 0, 1), amp = 2 + u * 9, x = x0 + i * dx + Math.sin(t * 25 + i * 1.3) * amp;
          dot(c, x, y + Math.cos(t * 21 + i) * amp * 0.6, 16, hotcol(u));
        }
        for (let i = 0; i < 5; i++) { const fx = 60 + i * 14, fy = 400 - Math.abs(Math.sin(t * 9 + i)) * 30; c.fillStyle = rgba(COL.heat, 0.8); c.beginPath(); c.moveTo(fx - 10, 420); c.lineTo(fx, fy); c.lineTo(fx + 10, 420); c.fill(); }
        txt(c, '가열', 80, 450, { size: 22, weight: 700, color: COL.heat, align: 'center' });
        KIT.vec(c, 200, 420, 360, 0, COL.heat, '열이 이웃한 분자로 차례로 전달된다', { size: 22, off: 20, ly: 30, lx: -180 });
        txt(c, '분자는 제자리에서 떨기만 한다', 30, 560, { size: 22, color: COL.muted });
      } else if (mode === 1) {
        txt(c, '대류 : 냄비 속 물을 아래에서 가열한다', 30, 44, { size: 26, weight: 700 });
        const x0 = 230, y0 = 120, w = 440, hh = 360;
        c.strokeStyle = COL['ink-2']; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + hh); c.lineTo(x0 + w, y0 + hh); c.lineTo(x0 + w, y0); c.stroke();
        c.fillStyle = rgba(COL.cold, 0.12); c.fillRect(x0, y0 + 20, w, hh - 20);
        parts.forEach(function (p, i) {
          // 두 개의 고리 : 가운데로 올라가 양옆으로 내려온다
          const side = i % 2 ? 1 : -1, ph = p.a + t * p.s, rx = w * 0.22 * p.r, ry = hh * 0.36 * p.r;
          const cx = x0 + w / 2 + side * w * 0.24, cy = y0 + 20 + (hh - 20) / 2;
          const x = cx - side * rx * Math.cos(ph), y = cy + ry * Math.sin(ph);
          // 가운데 쪽(올라가는 물)은 뜨겁고, 벽 쪽(내려오는 물)은 차갑다
          dot(c, x, y, 7, hotcol(Math.abs(x - (x0 + w / 2)) < w * 0.24 ? 0.85 : 0.2));
        });
        for (let i = 0; i < 7; i++) { const fx = x0 + 120 + i * 30, fy = y0 + hh + 60 - Math.abs(Math.sin(t * 9 + i)) * 30; c.fillStyle = rgba(COL.heat, 0.8); c.beginPath(); c.moveTo(fx - 10, y0 + hh + 80); c.lineTo(fx, fy); c.lineTo(fx + 10, y0 + hh + 80); c.fill(); }
        KIT.vec(c, x0 + w / 2, y0 + hh - 40, 0, -200, COL.heat, '데워진 물이 올라간다', { size: 22, off: 26 });
        KIT.vec(c, x0 + 40, y0 + 80, 0, 200, COL.cold, '', { size: 22 }); KIT.vec(c, x0 + w - 40, y0 + 80, 0, 200, COL.cold, '', { size: 22 });
        txt(c, '식은 물은 내려온다', x0 + w + 20, y0 + 200, { size: 22, weight: 700, color: COL.cold });
        txt(c, '분자가 직접 이동하며 열을 나른다', 30, 580, { size: 22, color: COL.muted });
      } else {
        txt(c, '복사 : 물질 없이 직접 전달된다', 30, 44, { size: 26, weight: 700 });
        c.fillStyle = COL.heat; rrect(c, 80, 220, 120, 180, 14); c.fill();
        txt(c, '난로', 140, 310, { size: 24, weight: 700, color: '#fff', align: 'center' });
        for (let k = 0; k < 4; k++) {
          const y = 250 + k * 40, off = (t * 160) % 60;
          c.strokeStyle = rgba(COL.heat, 0.8); c.lineWidth = 4; c.beginPath();
          for (let x = 220; x < 680; x += 4) { const yy = y + 10 * Math.sin((x - off) / 14); if (x === 220) c.moveTo(x, yy); else c.lineTo(x, yy); }
          c.stroke();
        }
        c.fillStyle = COL['ink-2']; c.beginPath(); c.arc(760, 230, 30, 0, TAU); c.fill(); c.fillRect(735, 262, 50, 130);
        txt(c, '사람', 760, 420, { size: 22, weight: 700, align: 'center' });
        txt(c, '진공인 우주를 건너 오는 햇빛의 열도 복사이다', 30, 560, { size: 22, color: COL.muted });
      }
    },
  };
}

/* ── 2 단열과 단열재 : 벽을 지나 빠져나가는 열 ── */
function sceneInsulate(root) {
  let mat = 0, win = false, t = 0;
  const cv = makeCanvas(860, 520);
  const sd = KIT.slider('단열재 두께', 1, 5, 1, 2, function (v) { return v + ' 칸'; }, '150px');
  const seg = KIT.seg(['열전도율 낮은 단열재', '열전도율 높은 재료'], 0, function (i) { mat = i; win = false; wb.setAttribute('aria-pressed', 'false'); }, true);
  const wb = KIT.btn('이중창 보기', function () { win = !win; wb.setAttribute('aria-pressed', String(win)); });
  wb.setAttribute('aria-pressed', 'false');
  KIT.split(root, cv, [seg.el, wb], [
    KIT.p('• 내부와 외부 사이의 열전달을 {{⑥|최소화}}하는 것을 단열이라 하고, 단열에 이용되는 재료를 단열재라고 한다.', 'ws sm'),
    KIT.p('• 단열이 뛰어난 건축물은 겨울에는 열이 밖으로 나가는 것을, 여름에는 열이 안으로 들어오는 것을 막아 준다. 그 결과 냉난방에 필요한 {{⑦|에너지}}를 절약할 수 있다.', 'ws sm'),
    KIT.cap('(1) 단열 효과를 높이는 방법'),
    KIT.p('• 단열재의 두께를 {{⑧|두껍게}} 한다. 　• 열전도율이 {{⑨|낮은}} 단열재를 사용한다.', 'ws sm'),
    KIT.hint('※ 열전도율 : 물체가 실제로 열을 전달하는 정도. 물체의 크기와 모양이 달라지면 열전도율도 달라질 수 있다.', 'font-size:21px'),
    KIT.cap('(2) 이중창'),
    KIT.p('• 이중창은 두 유리판 사이에 {{⑩|공기층}}이 있는 구조이다. 열전도율이 낮은 공기층이 단열재 역할을 하여 밖으로 나가는 열을 줄인다.', 'ws sm'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sd.el) });
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 860, 520);
      c.fillStyle = rgba(COL.heat, 0.12); c.fillRect(0, 70, 330, 400);
      c.fillStyle = rgba(COL.cold, 0.12); c.fillRect(530, 70, 330, 400);
      txt(c, '실내 (따뜻함)', 40, 110, { size: 24, weight: 700, color: COL.heat });
      txt(c, '실외 (추움)', 820, 110, { size: 24, weight: 700, color: COL.cold, align: 'right' });
      let rate;
      if (win) {
        c.fillStyle = rgba(COL.cold, 0.5); c.fillRect(360, 130, 16, 300); c.fillRect(484, 130, 16, 300);
        c.fillStyle = rgba(COL.cold, 0.08); c.fillRect(376, 130, 108, 300);
        txt(c, '유리', 368, 455, { size: 18, align: 'center' }); txt(c, '공기층', 430, 455, { size: 18, align: 'center', weight: 700 }); txt(c, '유리', 492, 455, { size: 18, align: 'center' });
        rate = 0.35;
      } else {
        const d = sd.get(), wpx = 40 * d, k = mat ? 1 : 0.18;
        c.fillStyle = mat ? '#9AA5B1' : '#F3D36B'; c.fillRect(430 - wpx / 2, 130, wpx, 300);
        if (!mat) { c.strokeStyle = rgba('#B8860B', 0.6); c.lineWidth = 2; for (let y = 140; y < 430; y += 18) { c.beginPath(); c.moveTo(430 - wpx / 2, y); c.lineTo(430 + wpx / 2, y + 9); c.stroke(); } }
        rate = k / d;
      }
      // 빠져나가는 열 : 화살표 수와 빠르기 = 단위 시간에 지나가는 열의 양
      const n = Math.max(1, Math.round(rate * 9));
      for (let i = 0; i < n; i++) {
        const y = 160 + (i * 260 / n), x = 120 + ((t * 120 * (0.5 + rate) + i * 80) % 600);
        KIT.vec(c, x, y, 50, 0, rgba(COL.heat, x > 330 && x < 530 ? 0.5 : 0.9), '', { width: 5, head: 16 });
      }
      txt(c, '빠져나가는 열 : ' + (rate > 0.6 ? '많다' : rate > 0.15 ? '보통' : '적다'), 30, 44, { size: 28, weight: 700, color: COL.energy });
      txt(c, win ? '공기층이 단열재 역할' : '두께 ↑ · 열전도율 ↓ → 빠져나가는 열 ↓', 30, 500, { size: 22, color: COL.muted });
    },
  };
}

/* ── 3 열팽창 ── */
function sceneExpand(root) {
  const cv = makeCanvas(860, 560);
  const sT = KIT.slider('온도', 0, 100, 5, 20, function (v) { return v + ' ℃'; }, '90px');
  let t = 0;
  KIT.split(root, cv, [], [
    KIT.p('• 대부분의 물체는 온도가 높아지면 길이나 부피가 늘어난다. 이를 {{⑪|열팽창}}이라 한다.', 'ws sm'),
    KIT.p('• 물체가 열전달을 받으면 물체를 구성하는 {{⑫|분자}}들의 운동이 활발해져 분자 사이의 거리가 멀어지기 때문이다.', 'ws sm'),
    KIT.p('• 열팽창은 고체뿐만 아니라 액체와 기체에서도 나타난다.', 'ws sm'),
    KIT.cap('[표 2] 열팽창을 고려한 설계'),
    KIT.table(['설계', '까닭'], [
      ['콘크리트와 철근을 함께 사용', '두 재료의 열팽창 정도가 {{⑬|비슷}}하여 구조가 뒤틀리지 않는다'],
      ['가스 배관을 ㄷ 자 모양으로 설치', '배관이 늘어나도 휘어진 부분이 변형을 흡수한다'],
      ['철도 레일과 다리에 이음매 틈', '팽창한 길이만큼 여유를 두어 휘어짐을 막는다'],
    ], { cols: ['42%', '58%'] }),
    KIT.hint('※ 단열필름, 보온병, 다리의 이음매처럼 단열과 열팽창을 활용한 기술은 우리 주변 여러 분야에 쓰인다.', 'font-size:21px'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sT.el) });
  return {
    tick: function (dt) {
      t += dt;
      const T = sT.get(), u = T / 100, gap = 54 * (1 + 0.18 * u), amp = 2 + 8 * u, c = cv.ctx; c.clearRect(0, 0, 860, 560);
      txt(c, '분자 사이 거리 : 온도가 높을수록 멀어진다 (크게 부풀려 그림)', 30, 44, { size: 22, weight: 700 });
      const n = 6, x0 = 430 - (n - 1) * gap / 2, y0 = 290 - (n - 1) * gap / 2;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = x0 + i * gap + Math.sin(t * 22 + i * 2 + j) * amp, y = y0 + j * gap + Math.cos(t * 19 + j * 3 + i) * amp;
        dot(c, x, y, 13, hotcol(u));
      }
      c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.strokeRect(430 - n * gap / 2, 290 - n * gap / 2, n * gap, n * gap);
      txt(c, '한 변 ' + KIT.fmt(n * gap / 54, 2) + ' 배', 430, 290 + n * gap / 2 + 32, { size: 24, weight: 700, align: 'center', color: COL.energy });
    },
  };
}

/* ── 주의 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '구멍', q: '구멍이 뚫린 금속판을 가열하면 구멍이 작아진다?', wrong: '금속이 팽창하면서 안쪽으로 밀고 들어와 구멍을 메울 것이다.',
      why: '열팽창은 물체의 모든 부분이 같은 비율로 커지는 확대와 같다. 사진을 확대하면 그림 속 구멍도 함께 커진다.', right: '구멍도 함께 커진다. 잘 안 열리는 금속 병뚜껑을 뜨거운 물에 담그면 열리는 것이 이 때문이다.' },
    { short: '복사', q: '복사는 아주 뜨거운 물체만 내보낸다?', wrong: '난로처럼 뜨거운 것에서만 복사가 나온다.',
      why: '온도를 가진 모든 물체는 복사열을 방출한다. 온도가 낮으면 눈에 보이지 않는 형태로 나올 뿐이다.', right: '사람의 몸도 복사열을 내보낸다. 열화상 카메라는 그것을 찍는 장치이다.' },
  ], {
    w: 820, h: 560,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        const s = 1 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.2)), cx = 410, cy = 300;
        c.fillStyle = hotcol(0.5 + 0.5 * Math.sin(t * 1.2)); rrect(c, cx - 200 * s, cy - 140 * s, 400 * s, 280 * s, 12); c.fill();
        c.fillStyle = COL.panel; c.beginPath(); c.arc(cx, cy, 70 * s, 0, TAU); c.fill();
        c.strokeStyle = COL['ink-2']; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.arc(cx, cy, 70, 0, TAU); c.stroke(); c.setLineDash([]);
        txt(c, '구멍 지름 ' + KIT.fmt(s, 2) + ' 배', cx, cy + 190, { size: 26, weight: 700, align: 'center', color: COL.energy });
        txt(c, '판 전체가 같은 비율로 커진다 (점선 : 처음 구멍)', 24, 40, { size: 22, weight: 700 });
      } else {
        // 열화상처럼 : 사람 몸에서 나오는 복사
        c.fillStyle = '#1B1B3A'; c.fillRect(0, 0, 820, 560);
        const g = c.createRadialGradient(410, 260, 20, 410, 300, 230);
        g.addColorStop(0, '#FFF59D'); g.addColorStop(0.35, '#FF9800'); g.addColorStop(0.7, '#C2185B'); g.addColorStop(1, 'rgba(27,27,58,0)');
        c.fillStyle = g; c.beginPath(); c.arc(410, 170, 70, 0, TAU); c.fill(); rrect(c, 330, 250, 160, 260, 40); c.fill();
        txt(c, '열화상 카메라로 본 사람 (약 36 ℃)', 24, 40, { size: 24, weight: 700, color: '#fff' });
        txt(c, '눈에 보이지 않는 복사(적외선)를 내보낸다', 24, 530, { size: 22, weight: 700, color: '#FFE082' });
      }
    },
  });
}

/* ── 4 확인 문제 ── */
function sceneCheck(root) {
  const cv = makeCanvas(820, 600);
  const ans1 = h('div', { class: 'callout good', style: 'font-size:23px', hidden: true }, 'C를 채운 비커의 물이 가장 천천히 따뜻해졌다. 이는 C가 바깥의 열을 안쪽으로 전달하는 정도가 가장 작다는 뜻이므로, 열전달을 가장 잘 막는 C가 단열재로 가장 좋다.');
  const ans2 = h('div', { class: 'callout good', style: 'font-size:23px', hidden: true }, '레일은 온도가 높아지면 열팽창하여 길이가 늘어난다. 이음매에 틈이 없으면 늘어난 레일이 서로 밀면서 휘어지거나 뒤틀릴 수 있으므로 틈을 둔다. 또 온도가 높을수록 레일이 많이 팽창하여 변형될 위험이 커지므로 운행 속도를 제한하거나 운행을 중지한다.');
  KIT.split(root, cv, [], [
    KIT.p('1. 같은 양의 차가운 물이 담긴 눈금실린더를, 서로 다른 물질 A · B · C 로 같은 부피만큼 채운 비커에 각각 넣고 상온에 두었다. 그래프는 시간에 따른 물의 온도 변화이다.', 'ws sm'),
    KIT.p('(1) 단열재로 가장 좋은 물질은 {{⑭|C}} 이다.', 'ws sm'),
    h('div', { class: 'row', style: 'gap:12px;align-items:center' }, KIT.p('(2) 그렇게 판단한 까닭을 열전달과 관련지어 쓰시오.', 'ws sm'), KIT.btn('예시 답안', function () { ans1.hidden = !ans1.hidden; })),
    ans1,
    h('div', { class: 'row', style: 'gap:12px;align-items:center' }, KIT.p('2. 철도 레일 이음매에 틈을 두는 까닭과, 레일 온도가 높을 때 운행 속도를 제한하는 까닭을 열팽창과 관련지어 쓰시오.', 'ws sm'), KIT.btn('예시 답안', function () { ans2.hidden = !ans2.hidden; })),
    ans2,
  ]);
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 820, 600);
      const ax = KIT.axes(c, { x: 100, y: 80, w: 640, h: 420 }, '시간', '물의 온도');
      KIT.dash(c, 100, ax.Y(0.85), 760, ax.Y(0.85), COL.muted, 2, [6, 6]); txt(c, '상온', 770, ax.Y(0.85), { size: 18, color: COL.muted });
      [['A', 2.2, COL.heat], ['B', 1.1, COL.work], ['C', 0.45, COL.cold]].forEach(function (o) {
        KIT.plot(c, ax, function (u) { return 0.1 + 0.75 * (1 - Math.exp(-o[1] * u * 2.2)); }, 0, 1, o[2], 5);
        const v = 0.1 + 0.75 * (1 - Math.exp(-o[1] * 2.2));
        txt(c, o[0], ax.X(1) + 14, ax.Y(v) - (o[0] === 'A' ? 16 : 0), { size: 26, weight: 700, color: o[2] });
      });
      txt(c, '[그림 3] 물질 A · B · C 를 채운 비커에서의 온도 변화', 30, 44, { size: 22, weight: 700 });
    },
  };
}
