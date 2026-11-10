/* ═══════════════ 14. 상대성 이론 : 장면 ═══════════════
   빛의 속력 → 두 가정 → 빛 시계와 시간 지연 → 로런츠 인자(예제) → 뮤온 → 길이 수축 → 질량과 에너지
   → 등가 원리 → 일반 상대성 이론의 증거 · GPS → 공식 유도(빛 시계) → 자주 하는 오해 → 스스로 점검.
   학습지 빈칸 : ① c ② 상대성 원리 ③ 광속 불변 ④ 시간 ⑤ 거리 ⑥ 시간 지연 ⑦ 5년 ⑧ 방향 ⑨ 630 m
                ⑩ 9 × 10¹³ J ⑪ 등가 원리 ⑫ 느리게 ⑬ 고유 시간 ⑭ 피타고라스 정리 ⑮ γ Δt₀ */
const P1 = '1 빛의 속력은 누구에 대한 속력인가', P2 = '2 특수 상대성 이론의 두 가정', P3 = '3 시간 지연', P4 = '4 길이 수축',
  P5 = '5 질량과 에너지', P6 = '6 일반 상대성 이론 맛보기';
const SCENE_LIST = [
  { id: 'speed', part: P1, title: '누가 재도 같은 빛의 속력', ws: '학습지 1 ①', make: sceneSpeed },
  { id: 'post', part: P2, title: '특수 상대성 이론의 두 가정', ws: '학습지 2 ②③④⑤', make: scenePost },
  { id: 'clock', part: P3, title: '빛 시계와 시간 지연', ws: '학습지 3 ⑥', make: sceneClock },
  { id: 'gamma', part: P3, title: '로런츠 인자 γ', ws: '학습지 3 · 예제 ⑦', make: sceneGamma },
  { id: 'muon', part: P3, title: '땅에 도착하는 뮤온', ws: '학습지 3 실제 증거', make: sceneMuon },
  { id: 'length', part: P4, title: '길이 수축', ws: '학습지 4 ⑧⑨', make: sceneLength },
  { id: 'energy', part: P5, title: '질량과 에너지', ws: '학습지 5 ⑩', make: sceneEnergy },
  { id: 'equiv', part: P6, title: '관성력과 등가 원리', ws: '학습지 6 ⑪', make: sceneEquiv },
  { id: 'evidence', part: P6, title: '일반 상대성 이론의 증거', ws: '학습지 6 ⑫', make: sceneEvidence },
  { id: 'derive', part: '공식 유도', title: '빛 시계와 시간 지연', ws: '공식 유도 ⑬⑭⑮', make: sceneDerive },
  { id: 'mis', part: '자주 하는 오해', title: '자주 하는 오해', ws: '오해 1 · 2 · 3', make: sceneMis },
  { id: 'check', part: '스스로 점검하기', title: '스스로 점검하기', ws: '스스로 점검하기', make: sceneCheck },
];
const TAU = Math.PI * 2, LIGHT = '#E7B10A', LIGHT_T = '#B58600';
function gam(v) { return 1 / Math.sqrt(1 - v * v); }

/* 사람 (y 는 발끝) */
function person(c, x, y, s, color) {
  s = s || 1;
  c.strokeStyle = color || COL.ink; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.arc(x, y - 62 * s, 11 * s, 0, TAU); c.stroke();
  c.beginPath(); c.moveTo(x, y - 51 * s); c.lineTo(x, y - 22 * s); c.moveTo(x - 14 * s, y - 40 * s); c.lineTo(x + 14 * s, y - 40 * s);
  c.moveTo(x, y - 22 * s); c.lineTo(x - 11 * s, y); c.moveTo(x, y - 22 * s); c.lineTo(x + 11 * s, y); c.stroke();
}
/* 둥근 시계판 : sec 초를 가리킨다 */
function dial(c, x, y, r, sec, color, label) {
  c.fillStyle = COL.panel; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.strokeStyle = color; c.lineWidth = 5; c.stroke();
  const a = sec / 60 * TAU - Math.PI / 2;
  c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); c.stroke();
  if (label) txt(c, label, x, y + r + 24, { size: 20, weight: 700, align: 'center', color: color });
}
function mirror(c, x, y, w, color) { c.fillStyle = color || COL['ink-2']; c.fillRect(x - w / 2, y - 4, w, 8); }

/* ── 1 빛의 속력은 누구에 대한 속력인가 ── */
function sceneSpeed(root) {
  const cv = makeCanvas(900, 600);
  let mode = 0, view = 0, t = 0;
  const sMode = KIT.seg(['공 던지기', '빛 비추기'], 0, function (i) { mode = i; t = 0; });
  const sView = KIT.seg(['기차 밖에서 보기', '기차 안에서 보기'], 0, function (i) { view = i; t = 0; });
  KIT.split(root, cv, [sMode.el, sView.el], [
    KIT.cap('1 빛의 속력은 누구에 대한 속력인가'),
    KIT.p('• 달리는 기차 안에서 공을 앞으로 던지면, 기차 밖에 서 있는 사람에게는 공이 (기차의 속력 + 던진 속력)으로 날아가는 것처럼 보입니다. 속도는 누가 보느냐에 따라 달라집니다.', 'ws sm'),
    KIT.p('• 19세기 과학자들은 빛도 마찬가지일 것이라 생각했습니다. 그래서 지구가 움직이는 방향에 따라 빛의 속력이 달라지는지 정밀하게 쟀습니다(마이컬슨–몰리 실험, 1887년).', 'ws sm'),
    KIT.p('• 결과는 뜻밖이었습니다. 어느 방향으로 재도 빛의 속력은 똑같았습니다.', 'ws sm'),
    KIT.table(['', '기차 안의 사람이 볼 때', '기차 밖의 사람이 볼 때'], [
      ['20 m/s 로 달리는 기차 안에서 앞으로 10 m/s 로 던진 공', '10 m/s', '30 m/s'],
      ['같은 기차 안에서 앞으로 비춘 빛', 'c', '{{①|c}}'],
    ], { cols: ['46%', '27%', '27%'] }),
  ]);
  return {
    tick: function (dt) {
      t += dt; if (t > 3.2) t = 0;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const px = 6, gy = 380, shift = view ? -20 * px * t : 0, tx = view ? 160 : 40 + 20 * px * t, tw = 380;
      // 위 : 두 사람이 잰 속력
      [['기차 안의 사람이 잰 속력', mode ? 'c' : '10 m/s', 1], ['기차 밖의 사람이 잰 속력', mode ? 'c' : '20 + 10 = 30 m/s', 0]].forEach(function (o, i) {
        const x = 24 + i * 432, on = (view === 1) === (o[2] === 1);
        c.fillStyle = COL['panel-2']; rrect(c, x, 20, 420, 110, 14); c.fill();
        c.strokeStyle = on ? COL.energy : COL.line; c.lineWidth = on ? 4 : 2; rrect(c, x, 20, 420, 110, 14); c.stroke();
        txt(c, o[0], x + 210, 50, { size: 22, weight: 700, align: 'center', color: COL.muted });
        txt(c, o[1], x + 210, 96, { size: 34, weight: 700, align: 'center', color: mode ? LIGHT_T : COL.energy, mono: !mode });
      });
      if (mode) txt(c, 'c + 20 m/s 가 아니다', 456 + 210, 150, { size: 20, weight: 700, align: 'center', color: COL.pen });
      // 땅 · 기둥
      c.fillStyle = COL['ink-2']; c.fillRect(0, gy + 22, 900, 4);
      for (let k = -2; k < 12; k++) { const x = ((k * 140 + shift) % 1680 + 1680) % 1680 - 140; c.fillStyle = COL.line; c.fillRect(x, gy - 80, 8, 104); }
      KIT.dash(c, 0, 530, 900, 530, COL.line, 3, [10, 8]);
      person(c, 170 + shift, 528, 1, COL.heat);
      txt(c, '기차 밖의 사람', 170 + shift, 556, { size: 20, weight: 700, align: 'center', color: COL.heat });
      // 기차
      c.fillStyle = rgba(COL.cold, 0.1); rrect(c, tx, 230, tw, 140, 16); c.fill();
      c.strokeStyle = COL.cold; c.lineWidth = 4; rrect(c, tx, 230, tw, 140, 16); c.stroke();
      dot(c, tx + 60, gy + 10, 12, COL['ink-2']); dot(c, tx + tw - 60, gy + 10, 12, COL['ink-2']);
      person(c, tx + 60, 362, 1, COL.cold);
      if (view === 0) { KIT.vec(c, tx + tw - 120, 210, 90, 0, COL.cold, '', { width: 5, head: 18 }); txt(c, '20 m/s', tx + tw - 130, 210, { size: 20, weight: 700, color: COL.cold, align: 'right' }); }
      else { KIT.vec(c, 760, 450, -90, 0, COL.muted, '', { width: 5, head: 18 }); txt(c, '바깥이 뒤로 20 m/s', 770, 476, { size: 18, color: COL.muted, align: 'right' }); }
      const hx = tx + 80, hy = 318;
      if (!mode) {
        dot(c, hx + 10 * px * t, hy, 11, COL.heat);
      } else {
        c.fillStyle = COL['ink-2']; c.fillRect(hx - 6, hy - 8, 24, 16);
        const ph = t % 0.8, far = tx + tw - 8;
        if (ph < 0.16) { const x = hx + 20 + (far - hx - 20) * ph / 0.16; KIT.line(c, [[Math.max(hx + 20, x - 50), hy], [x, hy]], LIGHT, 7); }
        else if (ph < 0.36) { c.fillStyle = rgba('#E7B10A', 0.5 * (1 - (ph - 0.16) / 0.2)); c.beginPath(); c.arc(far, hy, 26, 0, TAU); c.fill(); }
      }
      txt(c, view ? '기차 안의 사람이 본 모습' : '기차 밖에 서 있는 사람이 본 모습', 24, 588, { size: 20, weight: 700, color: COL.muted });
    },
  };
}

/* ── 2 특수 상대성 이론의 두 가정 ── */
function scenePost(root) {
  const cv = makeCanvas(900, 600);
  let mode = 0, t = 0, pulses = [], lampX = 80, emit = 0;
  const sv = KIT.slider('빛을 내는 물체의 속력', 0, 0.9, 0.1, 0.5, function (v) { return v ? KIT.fmt(v, 1) + ' c' : '정지'; }, '230px');
  sv.el.hidden = true;
  const seg = KIT.seg(['① 상대성 원리', '② 광속 불변'], 0, function (i) { mode = i; t = 0; pulses = []; lampX = 80; sv.el.hidden = i !== 1; });
  KIT.split(root, cv, [seg.el], [
    KIT.cap('2 특수 상대성 이론의 두 가정'),
    KIT.p('아인슈타인(1905년)은 이 결과를 그대로 받아들여 다음 두 가지를 출발점으로 삼았습니다.', 'ws sm'),
    KIT.table(['가정', '내용'], [
      ['{{②|상대성 원리}}', '정지해 있거나 일정한 속도로 움직이는 모든 관찰자에게 물리 법칙은 똑같이 성립한다. 누가 「진짜로 멈춰 있는지」 가려낼 방법은 없다.'],
      ['{{③|광속 불변}}', '진공에서 빛의 속력은 빛을 내는 물체나 관찰자가 어떻게 움직이든 항상 c 이다.'],
    ], { cols: ['30%', '70%'] }),
    KIT.p('• 정지해 있거나 일정한 속도로 움직이는 관찰자의 기준틀을 관성계라 합니다. 두 가정이 관성계 사이의 이야기이므로 「특수」 상대성 이론이라 부릅니다.', 'ws sm'),
    KIT.p('• 속력 = 거리 ÷ 시간 입니다. 빛의 속력이 누구에게나 같다면, 바뀌어야 하는 것은 {{④|시간}}과 {{⑤|거리}} 쪽입니다. 이것이 다음 내용의 출발점입니다.', 'ws sm'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sv.el) });
  function car(c, y, moving, label) {
    c.fillStyle = rgba(COL.cold, 0.08); rrect(c, 120, y, 660, 190, 16); c.fill();
    c.strokeStyle = COL.cold; c.lineWidth = 4; rrect(c, 120, y, 660, 190, 16); c.stroke();
    txt(c, label, 130, y - 20, { size: 22, weight: 700, color: COL.cold });
    // 창밖 : 움직이는 기차는 바깥 기둥이 뒤로 지나간다
    for (let k = 0; k < 8; k++) {
      const x = moving ? ((k * 120 - t * 160) % 960 + 960) % 960 - 30 : k * 120;
      if (x > 130 && x < 770) { c.fillStyle = rgba(COL.muted, 0.35); c.fillRect(x, y + 12, 6, 30); }
    }
    // 흔들이 · 떨어지는 공 : 두 기차 안에서 똑같다
    const sw = 0.5 * Math.sin(t * 2.4), ox = 300, oy = y + 50;
    c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.sin(sw) * 110, oy + Math.cos(sw) * 110); c.stroke();
    dot(c, ox + Math.sin(sw) * 110, oy + Math.cos(sw) * 110, 14, COL.energy);
    const fall = (t % 1.2) / 1.2, by = y + 50 + 120 * fall * fall;
    dot(c, 560, by, 12, COL.heat); KIT.dash(c, 560, y + 40, 560, y + 178, COL.line, 2, [4, 6]);
    person(c, 690, y + 186, 1, COL.ink);
  }
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      if (mode === 0) {
        car(c, 60, false, '멈춰 있는 기차 안');
        car(c, 330, true, '일정한 속도로 매끄럽게 달리는 기차 안');
        txt(c, '안에서 하는 실험의 결과가 똑같다 → 누가 진짜로 멈춰 있는지 가려낼 수 없다', 450, 568, { size: 21, weight: 700, align: 'center', color: COL.energy });
        return;
      }
      const v = sv.get(), C = 420, obsX = 800;
      lampX += v * 120 * dt; if (lampX > 520) { lampX = 80; pulses = []; }
      emit += dt; if (emit > 0.45) { emit = 0; pulses.push(lampX + 30); }
      pulses = pulses.map(function (x) { return x + C * dt; }).filter(function (x) { return x < obsX - 10; });
      c.fillStyle = COL['ink-2']; rrect(c, lampX - 40, 250, 70, 50, 10); c.fill();
      c.fillStyle = LIGHT; c.beginPath(); c.moveTo(lampX + 30, 260); c.lineTo(lampX + 50, 250); c.lineTo(lampX + 50, 300); c.lineTo(lampX + 30, 290); c.fill();
      if (v > 0) { KIT.vec(c, lampX - 40, 220, 30 + v * 120, 0, COL.cold, '', { width: 5, head: 16 }); txt(c, '광원 ' + KIT.fmt(v, 1) + ' c', lampX - 40, 196, { size: 20, weight: 700, color: COL.cold }); }
      pulses.forEach(function (x) { KIT.line(c, [[x - 36, 275], [x, 275]], LIGHT, 8); });
      person(c, obsX, 330, 1.1, COL.heat);
      txt(c, '관찰자', obsX, 356, { size: 20, weight: 700, align: 'center', color: COL.heat });
      c.fillStyle = COL['panel-2']; rrect(c, 230, 400, 440, 130, 14); c.fill();
      txt(c, '관찰자가 잰 빛의 속력', 450, 432, { size: 22, weight: 700, align: 'center', color: COL.muted });
      txt(c, 'c', 450, 490, { size: 54, weight: 700, align: 'center', color: LIGHT_T });
      txt(c, v > 0 ? 'c + ' + KIT.fmt(v, 1) + ' c 가 아니다 · 언제나 c' : '광원이 멈춰 있어도 c', 450, 566, { size: 22, weight: 700, align: 'center', color: COL.pen });
      txt(c, '진공에서 빛의 속력 c ≈ 3.0 × 10^{8} m/s', 24, 40, { size: 22, weight: 700 });
    },
  };
}

/* ── 3 빛 시계와 시간 지연 ── */
function sceneClock(root) {
  const cv = makeCanvas(960, 600);
  const sv = KIT.slider('시계의 속력 v', 0, 0.95, 0.05, 0.6, function (v) { return KIT.fmt(v, 2) + ' c'; }, '170px');
  let t = 0, trail = [], lastV = -1;
  KIT.split(root, cv, [h('div', { style: 'flex:1' }, sv.el), KIT.btn('다시 맞추기', function () { t = 0; trail = []; })], [
    KIT.cap('3 시간 지연 ─ 빛 시계로 생각하기'),
    KIT.p('• 거울 두 장을 거리 L 만큼 떨어뜨려 마주 보게 하고, 빛이 아래 거울에서 위 거울까지 갔다가 돌아오는 시간을 「한 번 째깍」으로 삼는 시계를 생각합니다. 이것을 빛 시계라 합니다.', 'ws sm'),
    KIT.p('• 시계와 함께 있는 사람에게 빛은 위아래로만 왕복합니다. 그러나 시계가 지나가는 것을 보는 사람에게는 빛이 비스듬히 더 먼 길을 갑니다.', 'ws sm'),
    KIT.p('• 빛의 속력은 두 사람에게 똑같이 c 이므로, 더 먼 길을 간 쪽은 시간이 더 걸립니다. 즉 움직이는 시계는 느리게 갑니다. 이것을 {{⑥|시간 지연}}이라 합니다. 식은 「공식 유도」에서 직접 이끌어 냅니다.', 'ws sm'),
    KIT.callout('γ = [[1|√(1 − v^{2}/c^{2})]] 　　(로런츠 인자)', false, 'font-size:32px'),
  ]);
  return {
    tick: function (dt) {
      const v = sv.get();
      if (v !== lastV) { lastV = v; t = 0; trail = []; }
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 960, 600);
      const L = 260, C = 260, T0 = 2 * L / C, g = gam(v), top = 150, bot = top + L;
      const bounce = function (ph) { ph = ph % 1; return ph < 0.5 ? bot - L * ph / 0.5 : top + L * (ph - 0.5) / 0.5; };
      // 왼쪽 : 시계와 함께 있는 사람
      txt(c, '시계와 함께 있는 사람이 볼 때', 165, 40, { size: 22, weight: 700, align: 'center' });
      txt(c, '빛이 위아래로만 왕복', 165, 72, { size: 20, weight: 700, align: 'center', color: COL.pen });
      mirror(c, 165, top - 8, 140); mirror(c, 165, bot + 8, 140);
      KIT.dash(c, 165, top, 165, bot, rgba(COL.pen, 0.35), 3, [6, 6]);
      dot(c, 165, bounce(t / T0), 11, LIGHT);
      const n0 = Math.floor(t / T0), n1 = Math.floor(t / (g * T0));
      txt(c, '째깍 ' + n0 + ' 번', 165, 480, { size: 30, weight: 700, align: 'center', color: COL.heat });
      c.fillStyle = COL.line; c.fillRect(330, 20, 3, 520);
      // 오른쪽 : 지나가는 시계 (시계를 따라가며 그리고, 땅과 빛의 자취가 뒤로 밀린다)
      const cx = 700, X = v * C * t, yph = bounce(t / (g * T0));
      txt(c, '시계가 지나가는 것을 보는 사람이 볼 때', cx, 40, { size: 22, weight: 700, align: 'center' });
      txt(c, '빛이 비스듬히 더 먼 길을 감', cx, 72, { size: 20, weight: 700, align: 'center', color: COL.pen });
      trail.push([X, yph]); if (trail.length > 600) trail.shift();
      c.save(); c.beginPath(); c.rect(336, 0, 624, 600); c.clip();
      KIT.line(c, trail.map(function (p) { return [cx + p[0] - X, p[1]]; }), rgba(COL.pen, 0.75), 4);
      for (let k = Math.floor((X - 400) / 80); k < (X + 300) / 80; k++) { const x = cx + k * 80 - X; c.fillStyle = COL.line; c.fillRect(x, bot + 40, 4, 18); }
      c.restore();
      c.fillStyle = COL['ink-2']; c.fillRect(340, bot + 40, 620, 3);
      mirror(c, cx, top - 8, 140); mirror(c, cx, bot + 8, 140);
      dot(c, cx, yph, 11, LIGHT);
      if (v > 0) { KIT.vec(c, cx + 90, top - 50, 70, 0, COL.cold, '', { width: 5, head: 16 }); txt(c, 'v', cx + 172, top - 50, { size: 24, weight: 700, color: COL.cold }); }
      txt(c, '째깍 ' + n1 + ' 번', cx, 480, { size: 30, weight: 700, align: 'center', color: COL.cold });
      c.fillStyle = COL['panel-2']; rrect(c, 24, 516, 912, 64, 14); c.fill();
      txt(c, 'γ = ' + KIT.fmt(g, 2) + (v > 0 ? ' : 지나가는 시계가 한 번 째깍하는 동안 내 시계는 ' + KIT.fmt(g, 2) + ' 번 째깍' : ' : 두 시계가 똑같이 간다'), 480, 548, { size: 22, weight: 700, align: 'center', color: COL.energy });
    },
  };
}

/* ── 3 로런츠 인자 γ · 예제 ── */
function sceneGamma(root) {
  const cv = makeCanvas(900, 600);
  const sv = KIT.slider('속력 v', 0, 0.99, 0.01, 0.8, function (v) { return KIT.fmt(v, 2) + ' c'; }, '100px');
  KIT.split(root, cv, [h('div', { style: 'width:100%' }, sv.el)], [
    KIT.callout('γ = [[1|√(1 − v^{2}/c^{2})]] 　　(로런츠 인자)', false, 'font-size:30px'),
    KIT.p('• γ 는 언제나 1보다 크거나 같습니다. 일상의 속력에서는 1과 거의 같아서 시간 지연을 느끼지 못합니다.', 'ws sm'),
    KIT.table(['속력 v', 'KTX (300 km/h)', '0.6c', '0.8c', '0.99c'], [['γ', '1.00000000000004', '1.25', '1.67', '7.1']], { cols: ['15%', '37%', '16%', '16%', '16%'] }),
    KIT.cap('예제'),
    KIT.p('0.8c 로 날아가는 우주선 안에서 3년이 흘렀다. 지구에서 보면 몇 년이 흐른 것인가?', 'ws sm', 'font-weight:600'),
    KIT.p('풀이 　0.8c 에서 γ = [[1|√(1 − 0.64)]] = [[1|0.6]] = [[5|3]] 이므로, 지구에서는 3년 × [[5|3]] = {{⑦|5년}}이 흐른다.', 'ws sm'),
  ]);
  return {
    tick: function () {
      const v = sv.get(), g = gam(v), c = cv.ctx; c.clearRect(0, 0, 900, 600);
      const ax = KIT.axes(c, { x: 90, y: 70, w: 720, h: 420 }, '속력 v', 'γ');
      const Yg = function (gg) { return ax.Y((gg - 1) / 7); };
      [1, 3, 5, 7].forEach(function (k) { txt(c, String(k), 76, Yg(k), { size: 20, align: 'right', color: COL.muted }); KIT.dash(c, 92, Yg(k), 810, Yg(k), COL.grid, 2, [4, 6]); });
      [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (u) { txt(c, u === 0 ? '0' : u === 1 ? 'c' : u + 'c', ax.X(u), ax.y0 + 26, { size: 20, align: 'center', color: COL.muted }); });
      const pts = [];
      for (let i = 0; i <= 400; i++) { const u = 0.995 * i / 400, gg = gam(u); if (gg <= 8) pts.push([ax.X(u), Yg(gg)]); }
      KIT.line(c, pts, COL.heat, 5);
      [[0.6, '1.25'], [0.8, '1.67']].forEach(function (o) { dot(c, ax.X(o[0]), Yg(gam(o[0])), 8, COL.ink); txt(c, 'γ = ' + o[1], ax.X(o[0]) - 20, Yg(gam(o[0])) - 30, { size: 20, weight: 700, align: 'center' }); });
      txt(c, '일상의 속력에서는 γ ≈ 1', 140, Yg(2.2), { size: 20, weight: 700, color: COL.muted });
      if (g <= 8) { KIT.dash(c, ax.X(v), ax.y0, ax.X(v), Yg(g), COL.energy, 2, [6, 6]); dot(c, ax.X(v), Yg(g), 13, COL.energy); }
      c.fillStyle = COL['panel-2']; rrect(c, 120, 90, 380, 110, 14); c.fill();
      txt(c, 'γ = ' + KIT.fmt(g, 2), 140, 124, { size: 32, weight: 700, color: COL.energy, mono: true });
      txt(c, '우주선 3년 → 지구 ' + KIT.fmt(3 * g, 1) + '년', 140, 170, { size: 24, weight: 700 });
    },
  };
}

/* ── 3 실제 증거 : 땅에 도착하는 뮤온 (땅에서 본 모습) ── */
function sceneMuon(root) {
  const cv = makeCanvas(900, 640);
  let rel = true, t = 0;
  const seg = KIT.seg(['상대성 이론이 없다면', '실제 (시간 지연)'], 1, function (i) { rel = i === 1; t = 0; });
  KIT.split(root, cv, [seg.el, KIT.btn('다시 보기', function () { t = 0; }, true)], [
    KIT.cap('실제 증거 ─ 땅에 도착하는 뮤온'),
    KIT.p('우주에서 날아온 입자가 높이 약 10 km 의 대기와 부딪히면 뮤온이라는 입자가 생깁니다. 뮤온의 수명은 약 2.2 μs 여서, 빛의 속력으로 달려도 약 660 m 만 가고 사라져야 합니다.'),
    KIT.p('그런데 실제로는 많은 뮤온이 땅에 도착합니다. 거의 빛의 속력(약 0.998c, γ ≈ 16)으로 움직이는 뮤온의 시간이 느리게 가서, 땅에서 보면 수명이 약 35 μs 로 늘어나기 때문입니다.'),
    KIT.hint('그림은 땅에 서 있는 사람이 본 모습이다. 높이는 실제 비율대로 그렸다. (1 μs = 100만분의 1초)'),
  ], { center: true });
  return {
    tick: function (dt) {
      t = Math.min(t + dt, 5);
      const c = cv.ctx; c.clearRect(0, 0, 900, 640);
      const top = 60, gy = 560, kmPx = (gy - top) / 10, trip = 33.4, g = 16;
      const us = Math.min(t / 4, 1) * trip, life = rel ? us / g : us, dead = life >= 2.2;
      const yAt = function (u) { return top + u / trip * (gy - top); };
      const my = dead ? yAt(rel ? 2.2 * g : 2.2) : yAt(us);
      c.fillStyle = rgba(COL.cold, 0.08); c.fillRect(120, top, 420, gy - top);
      c.fillStyle = COL.good; c.fillRect(100, gy, 460, 14); txt(c, '땅', 580, gy + 6, { size: 22, weight: 700, color: COL.good });
      for (let k = 0; k <= 10; k += 2) { const y = gy - k * kmPx; c.fillStyle = COL['ink-2']; c.fillRect(100, y - 1, 16, 3); txt(c, k + ' km', 90, y, { size: 18, align: 'right', color: COL.muted }); }
      KIT.dash(c, 120, yAt(2.2), 540, yAt(2.2), COL.pen, 3, [8, 6]);
      txt(c, '660 m : 수명 2.2 μs 동안 갈 수 있는 거리', 330, yAt(2.2) + 24, { size: 18, weight: 700, color: COL.pen, align: 'center' });
      if (!dead || !rel) {
        if (dead) { c.strokeStyle = COL.pen; c.lineWidth = 3; c.beginPath(); c.arc(330, my, 20 + 10 * Math.sin(t * 9), 0, TAU); c.stroke(); txt(c, '사라짐', 370, my - 4, { size: 22, weight: 700, color: COL.pen }); }
        else { KIT.line(c, [[330, top], [330, my]], rgba(COL.energy, 0.4), 4); dot(c, 330, my, 12, COL.energy); txt(c, '뮤온', 350, my, { size: 20, weight: 700, color: COL.energy }); }
      }
      if (rel && us >= trip) { dot(c, 330, gy - 12, 12, COL.energy); txt(c, '땅에 도착!', 350, gy - 40, { size: 24, weight: 700, color: COL.good }); }
      // 두 시계
      dial(c, 720, 170, 62, us / trip * 60 * 0.55, COL.heat, '땅의 시계');
      txt(c, KIT.fmt(us, 1) + ' μs', 720, 280, { size: 28, weight: 700, align: 'center', mono: true, color: COL.heat });
      dial(c, 720, 400, 62, Math.min(life, 2.2) / trip * 60 * 0.55, COL.energy, '뮤온의 시계');
      txt(c, KIT.fmt(Math.min(life, 2.2), 2) + ' μs', 720, 510, { size: 28, weight: 700, align: 'center', mono: true, color: COL.energy });
      txt(c, rel ? '뮤온의 시간은 16 배 느리게 간다' : '시간 지연이 없다면 660 m 에서 사라진다', 450, 620, { size: 22, weight: 700, align: 'center', color: rel ? COL.good : COL.pen });
    },
  };
}

/* ── 4 길이 수축 ── */
function sceneLength(root) {
  const cv = makeCanvas(900, 600);
  let mode = 0, t = 0;
  const sv = KIT.slider('속력 v', 0, 0.99, 0.01, 0.8, function (v) { return KIT.fmt(v, 2) + ' c'; }, '100px');
  const seg = KIT.seg(['지나가는 우주선', '뮤온이 보면'], 0, function (i) { mode = i; t = 0; sv.el.hidden = i === 1; });
  KIT.split(root, cv, [seg.el, KIT.btn('다시 보기', function () { t = 0; })], [
    KIT.cap('4 길이 수축'),
    KIT.p('• 움직이는 물체의 길이를 재면 정지해 있을 때보다 짧게 잽니다. 운동 {{⑧|방향}}으로만 짧아지고, 운동 방향에 수직인 길이는 그대로입니다.', 'ws sm'),
    KIT.callout('L = [[L₀|γ]] 　　(L₀ : 물체와 함께 있는 사람이 잰 길이)', false, 'font-size:30px'),
    KIT.p('• 뮤온의 입장에서 보면, 자기 시간은 정상으로 흐르지만 다가오는 대기층의 두께가 10 km ÷ 16 ≈ {{⑨|630 m}} 로 줄어 보입니다. 수명 동안 갈 수 있는 거리(약 660 m)보다 짧으므로 땅에 닿습니다.', 'ws sm'),
    KIT.p('• 땅에서 보면 「시간 지연」, 뮤온이 보면 「길이 수축」으로 설명이 달라도, 뮤온이 땅에 도착한다는 결과는 같습니다.', 'ws sm'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sv.el) });
  function ship(c, x, y, w, hh, color) {
    c.fillStyle = rgba(color, 0.18); c.strokeStyle = color; c.lineWidth = 4;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.82, y); c.lineTo(x + w, y + hh / 2); c.lineTo(x + w * 0.82, y + hh); c.lineTo(x, y + hh); c.closePath(); c.fill(); c.stroke();
  }
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      if (mode === 0) {
        const v = sv.get(), g = gam(v), L0 = 560, hh = 110, Lm = L0 / g;
        txt(c, '멈춰 있을 때 (함께 있는 사람이 잰 길이)', 40, 50, { size: 22, weight: 700 });
        ship(c, 60, 80, L0, hh, COL.cold);
        arrow(c, 60, 215, 60 + L0, 215, { width: 3, head: 14, color: COL['ink-2'] }); arrow(c, 60 + L0, 215, 60, 215, { width: 3, head: 14, color: COL['ink-2'] });
        txt(c, 'L₀', 60 + L0 / 2, 240, { size: 24, weight: 700, align: 'center' });
        arrow(c, 660, 80, 660, 80 + hh, { width: 3, head: 12, color: COL.good }); arrow(c, 660, 80 + hh, 660, 80, { width: 3, head: 12, color: COL.good });
        txt(c, '높이', 676, 80 + hh / 2, { size: 20, weight: 700, color: COL.good });
        txt(c, '속력 ' + KIT.fmt(v, 2) + ' c 로 지나갈 때 (밖에서 잰 길이)', 40, 310, { size: 22, weight: 700 });
        const room = Math.max(1, 740 - 130 - Lm), x = 60 + ((t * 120) % room);
        ship(c, x, 340, Lm, hh, COL.heat);
        if (v > 0) KIT.vec(c, x + Lm + 16, 340 + hh / 2, 50, 0, COL.heat, '', { width: 5, head: 16 });
        arrow(c, x, 475, x + Lm, 475, { width: 3, head: 14, color: COL['ink-2'] }); arrow(c, x + Lm, 475, x, 475, { width: 3, head: 14, color: COL['ink-2'] });
        txt(c, 'L = L₀ ÷ ' + KIT.fmt(g, 2), x + Lm / 2, 500, { size: 22, weight: 700, align: 'center' });
        txt(c, '운동 방향으로만 ' + KIT.fmt(100 / g, 0) + ' % 로 짧아진다 · 높이는 그대로', 40, 565, { size: 22, weight: 700, color: COL.energy });
        return;
      }
      // 뮤온이 본 모습 : 땅이 다가온다. 700 m = 460 px
      const sc = 440 / 700, my = 110, thick = 630, reach = 660, life = Math.min(Math.min(t / 3.2, 1) * 2.2, 2.2 * thick / reach);
      const passed = life / 2.2 * reach, gyy = my + Math.max(0, thick - passed) * sc;
      txt(c, '뮤온의 입장 : 나는 멈춰 있고 대기와 땅이 0.998c 로 다가온다', 30, 40, { size: 22, weight: 700 });
      txt(c, '땅에서 잰 10 km 가 10 km ÷ 16 ≈ 630 m 로 줄어 보인다', 30, 74, { size: 20, color: COL.muted });
      c.fillStyle = rgba(COL.cold, 0.1); c.fillRect(260, my, 340, gyy - my);
      c.fillStyle = COL.good; c.fillRect(240, gyy, 380, 14); txt(c, '땅', 640, gyy + 6, { size: 22, weight: 700, color: COL.good });
      KIT.vec(c, 430, gyy + 60, 0, -46, COL.good, '', { width: 5, head: 16 });
      dot(c, 430, my, 13, COL.energy); txt(c, '뮤온', 455, my - 6, { size: 22, weight: 700, color: COL.energy });
      arrow(c, 180, my, 180, my + thick * sc, { width: 3, head: 12, color: COL.cold }); arrow(c, 180, my + thick * sc, 180, my, { width: 3, head: 12, color: COL.cold });
      txt(c, '대기층', 170, my + thick * sc / 2 - 16, { size: 20, weight: 700, align: 'right', color: COL.cold });
      txt(c, '630 m', 170, my + thick * sc / 2 + 14, { size: 20, weight: 700, align: 'right', color: COL.cold });
      arrow(c, 700, my, 700, my + reach * sc, { width: 3, head: 12, color: COL.pen }); arrow(c, 700, my + reach * sc, 700, my, { width: 3, head: 12, color: COL.pen });
      txt(c, '수명 동안', 716, my + reach * sc / 2 - 16, { size: 20, weight: 700, color: COL.pen });
      txt(c, '660 m', 716, my + reach * sc / 2 + 14, { size: 20, weight: 700, color: COL.pen });
      txt(c, '뮤온의 시계 ' + KIT.fmt(life, 2) + ' μs', 30, 570, { size: 24, weight: 700, mono: true, color: COL.energy });
      if (passed >= thick - 0.5) txt(c, '수명(2.2 μs)이 다하기 전에 땅에 닿았다!', 870, 570, { size: 24, weight: 700, color: COL.good, align: 'right' });
    },
  };
}

/* ── 5 질량과 에너지 ── */
function sceneEnergy(root) {
  const cv = makeCanvas(900, 600);
  let mode = 0;
  const MASS = [0.001, 0.01, 0.1, 1, 10];
  const sm = KIT.slider('질량', 0, 4, 1, 3, function (i) { const g = MASS[i]; return g >= 1 ? g + ' g' : g * 1000 + ' mg'; }, '80px');
  const sv = KIT.slider('속력 v', 0, 0.99, 0.01, 0.9, function (v) { return KIT.fmt(v, 2) + ' c'; }, '100px');
  sv.el.hidden = true;
  const seg = KIT.seg(['질량 → 에너지', '빛의 속력까지 가속하려면'], 0, function (i) { mode = i; sm.el.hidden = i === 1; sv.el.hidden = i === 0; });
  KIT.split(root, cv, [seg.el], [
    KIT.cap('5 질량과 에너지'),
    KIT.callout('E = m c^{2}', false, 'font-size:44px;text-align:center'),
    KIT.p('• 질량 자체가 에너지의 한 형태라는 뜻입니다. c² 이 아주 큰 수(9 × 10^{16} m²/s²)여서, 아주 작은 질량도 엄청난 에너지에 해당합니다.', 'ws sm'),
    KIT.p('• 예를 들어 질량 1 g(0.001 kg)이 모두 에너지로 바뀌면 E = 0.001 × (3 × 10^{8})² = {{⑩|9 × 10¹³ J}} 입니다. 한 가구가 한 달에 전기를 300 kWh 쓴다고 할 때 약 7천 가구가 1년 동안 쓰는 양입니다.', 'ws sm'),
    KIT.p('• 핵분열과 핵융합에서는 반응 뒤의 질량이 조금 줄어듭니다. 그 줄어든 질량이 이 식에 따라 에너지로 나옵니다. 다음 시간에 다시 만납니다.', 'ws sm'),
    KIT.p('• 물체를 빛의 속력까지 가속할 수 없는 것도 이 때문입니다. v 가 c 에 가까워지면 γ 가 끝없이 커져 필요한 에너지도 끝없이 커집니다.', 'ws sm'),
  ], { under: h('div', { style: 'padding:0 22px 16px' }, sm.el, sv.el) });
  function house(c, x, y, s, color) {
    c.fillStyle = color; c.beginPath(); c.moveTo(x, y - s * 0.55); c.lineTo(x + s * 0.5, y - s * 0.1); c.lineTo(x - s * 0.5, y - s * 0.1); c.fill();
    c.fillRect(x - s * 0.36, y - s * 0.1, s * 0.72, s * 0.5);
  }
  return {
    tick: function () {
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      if (mode === 0) {
        const g = MASS[sm.get()], E = g / 1000 * 9e16, homes = E / (300 * 12 * 3.6e6);
        const ex = Math.floor(Math.log10(E)), man = E / Math.pow(10, ex);
        txt(c, (g >= 1 ? g + ' g' : g * 1000 + ' mg') + ' 이 모두 에너지로 바뀌면', 30, 44, { size: 26, weight: 700 });
        txt(c, 'E = ' + KIT.fmt(man, 1) + ' × 10^{' + ex + '} J', 30, 100, { size: 40, weight: 700, color: COL.energy, mono: true });
        const unit = Math.pow(10, Math.max(0, Math.floor(Math.log10(homes)) - 1)), n = Math.round(homes / unit);
        txt(c, '≈ ' + Math.round(homes).toLocaleString('ko-KR') + ' 가구가 1년 동안 쓰는 전기', 30, 156, { size: 26, weight: 700 });
        for (let i = 0; i < Math.min(n, 100); i++) house(c, 60 + (i % 14) * 58, 230 + Math.floor(i / 14) * 52, 40, COL.work);
        txt(c, '집 하나 = ' + unit.toLocaleString('ko-KR') + ' 가구', 30, 590, { size: 22, weight: 700, color: COL.muted });
        return;
      }
      const v = sv.get(), ax = KIT.axes(c, { x: 90, y: 80, w: 700, h: 400 }, '속력 v', '필요한 에너지');
      [0, 0.5, 1].forEach(function (u) { txt(c, u === 0 ? '0' : u === 1 ? 'c' : '0.5c', ax.X(u), ax.y0 + 26, { size: 20, align: 'center', color: COL.muted }); });
      const Kf = function (u) { return (gam(u) - 1) / 6; };
      const pts = []; for (let i = 0; i <= 300; i++) { const u = 0.995 * i / 300; if (Kf(u) <= 1.05) pts.push([ax.X(u), ax.Y(Kf(u))]); }
      KIT.line(c, pts, COL.heat, 5);
      KIT.dash(c, ax.X(1), ax.y0, ax.X(1), 60, COL.pen, 3, [8, 6]); txt(c, '빛의 속력 c', ax.X(1) - 8, 54, { size: 20, weight: 700, color: COL.pen, align: 'right' });
      if (Kf(v) <= 1.05) dot(c, ax.X(v), ax.Y(Kf(v)), 12, COL.energy);
      txt(c, 'γ = ' + KIT.fmt(gam(v), 2) + ' → 필요한 운동 에너지 (γ − 1) m c^{2}', 120, 120, { size: 24, weight: 700, color: COL.energy });
      txt(c, 'c 에 가까워질수록 끝없이 커진다', 120, 160, { size: 22, weight: 700 });
    },
  };
}

/* ── 6 관성력과 등가 원리 ── */
function sceneEquiv(root) {
  const cv = makeCanvas(900, 600);
  let mode = 0, t = 0;
  const seg = KIT.seg(['가속하는 버스', '창문 없는 엘리베이터'], 0, function (i) { mode = i; t = 0; });
  KIT.split(root, cv, [seg.el, KIT.btn('다시 보기', function () { t = 0; }, true)], [
    KIT.cap('6 일반 상대성 이론 맛보기'),
    KIT.p('• 가속하는 버스 안에서 몸이 뒤로 쏠리듯, 가속하는 좌표계 안에서는 아무도 밀지 않았는데도 힘이 작용하는 것처럼 보입니다. 이런 가상의 힘을 관성력이라 합니다.'),
    KIT.p('• 창문 없는 엘리베이터 안에서 몸이 바닥으로 눌린다면, 지구 위에 멈춰 있는지 우주에서 위로 가속하고 있는지 구별할 수 없습니다. 아인슈타인은 「중력과 가속은 구별할 수 없다」는 것을 원리로 삼았습니다. 이것을 {{⑪|등가 원리}}라 합니다.'),
    KIT.p('• 여기서 출발한 일반 상대성 이론은 중력을 「질량이 시공간을 휘게 하는 것」으로 설명합니다.'),
  ]);
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      if (mode === 0) {
        const a = 1, s = 0.5 * a * t * t * 60, lean = t < 4 ? 0.32 : 0;
        if (t > 6) t = 0;
        c.fillStyle = COL['ink-2']; c.fillRect(0, 470, 900, 4);
        for (let k = -1; k < 12; k++) { const x = ((k * 110 - s) % 1320 + 1320) % 1320 - 110; c.fillStyle = COL.line; c.fillRect(x, 430, 6, 40); }
        c.fillStyle = rgba(COL.work, 0.1); rrect(c, 180, 180, 540, 260, 20); c.fill();
        c.strokeStyle = COL.work; c.lineWidth = 4; rrect(c, 180, 180, 540, 260, 20); c.stroke();
        dot(c, 270, 452, 18, COL['ink-2']); dot(c, 630, 452, 18, COL['ink-2']);
        c.fillStyle = COL['ink-2']; c.fillRect(200, 200, 500, 5);
        [330, 520].forEach(function (x) {
          c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 205); c.lineTo(x - Math.sin(lean) * 70, 205 + Math.cos(lean) * 70); c.stroke();
          c.beginPath(); c.arc(x - Math.sin(lean) * 80, 205 + Math.cos(lean) * 80, 10, 0, TAU); c.stroke();
        });
        c.save(); c.translate(440, 430); c.rotate(-lean * 0.6); person(c, 0, 0, 1.4, COL.ink); c.restore();
        if (t < 4) {
          KIT.vec(c, 560, 140, 110, 0, COL.cold, '가속도', { width: 6, head: 20, off: 46 });
          KIT.vec(c, 400, 300, -110, 0, COL.pen, '', { width: 6, head: 20, dash: [10, 8] });
          txt(c, '관성력 (가상의 힘)', 290, 270, { size: 22, weight: 700, color: COL.pen, align: 'center' });
        }
        txt(c, '아무도 밀지 않았는데 뒤로 쏠린다', 30, 44, { size: 26, weight: 700 });
        txt(c, t < 4 ? '버스가 앞으로 가속하는 동안' : '일정한 속도가 되면 쏠림이 사라진다', 30, 560, { size: 22, weight: 700, color: COL.muted });
        return;
      }
      const T = Math.min(t, 1.4);
      txt(c, '안에 있는 사람은 두 경우를 구별할 수 없다', 450, 40, { size: 26, weight: 700, align: 'center' });
      [0, 1].forEach(function (k) {
        const x0 = 70 + k * 430, y0 = 100, w = 330, hh = 330;
        c.fillStyle = rgba(COL.cold, 0.1); c.fillRect(x0, y0, w, hh);
        c.strokeStyle = COL['ink-2']; c.lineWidth = 5; c.strokeRect(x0, y0, w, hh);
        person(c, x0 + 200, y0 + hh - 3, 1.6, COL.ink);
        const by = Math.min(y0 + 70 + 0.5 * 300 * T * T, y0 + hh - 14);
        dot(c, x0 + 90, by, 14, COL.heat);
        if (k === 0) {
          KIT.ground(c, x0 - 40, y0 + hh, w + 80);
          KIT.vec(c, x0 + w + 40, y0 + 120, 0, 90, COL.pen, 'g', { width: 6, head: 20, off: 26 });
          txt(c, '지구 위에 멈춰 있음', x0 + w / 2, y0 + hh + 60, { size: 22, weight: 700, align: 'center' });
        } else {
          c.fillStyle = '#F2A86B';
          [x0 + 80, x0 + w - 80].forEach(function (fx) { const f = 30 + 8 * Math.sin(t * 30 + fx); c.beginPath(); c.moveTo(fx - 22, y0 + hh + 6); c.lineTo(fx + 22, y0 + hh + 6); c.lineTo(fx, y0 + hh + 6 + f); c.fill(); });
          KIT.vec(c, x0 + w + 40, y0 + 210, 0, -90, COL.cold, 'a = g', { width: 6, head: 20, off: 26 });
          txt(c, '우주에서 위로 가속', x0 + w / 2, y0 + hh + 60, { size: 22, weight: 700, align: 'center' });
        }
      });
      txt(c, '두 상자에서 공이 똑같이 바닥으로 떨어지고, 몸이 바닥에 눌린다', 450, 560, { size: 22, weight: 700, align: 'center', color: COL.energy });
    },
  };
}

/* ── 6 일반 상대성 이론의 증거 · GPS ── */
function sceneEvidence(root) {
  const cv = makeCanvas(900, 600);
  const sd = KIT.slider('보정 없이 지난 날', 0, 7, 1, 1, function (v) { return v + ' 일'; }, '190px');
  let t = 0;
  KIT.split(root, cv, [h('div', { style: 'width:100%' }, sd.el)], [
    KIT.table(['예측', '확인된 사실'], [
      ['빛이 중력 때문에 휜다', '1919년 개기 일식 때, 태양 가까이를 지나는 별빛이 휘는 것이 관측되었다.'],
      ['중력이 강한 곳일수록 시간이 {{⑫|느리게}} 흐른다', '높은 곳에 둔 원자시계가 낮은 곳의 원자시계보다 빨리 간다.'],
      ['중력파가 있다', '2015년, 두 블랙홀이 합쳐질 때 나온 중력파를 직접 검출하였다.'],
    ], { cols: ['40%', '60%'] }),
    KIT.cap('생활 속 상대성 이론 ─ GPS'),
    KIT.p('GPS 위성의 시계는 두 효과를 함께 받습니다. 빠르게 움직이므로 특수 상대성 이론에 따라 하루에 약 7 μs 느려지고, 지표보다 중력이 약한 높은 곳에 있으므로 일반 상대성 이론에 따라 하루에 약 45 μs 빨라집니다.', 'ws sm'),
    KIT.p('합치면 하루에 약 38 μs 빨라집니다. 이 차이를 보정하지 않으면 위치 오차가 하루에 약 10 km 씩 쌓입니다.', 'ws sm'),
  ]);
  return {
    tick: function (dt) {
      t += dt;
      const c = cv.ctx; c.clearRect(0, 0, 900, 600);
      txt(c, 'GPS 위성 시계가 하루에 달라지는 정도', 30, 40, { size: 24, weight: 700 });
      const zx = 362, k = 9;
      KIT.dash(c, zx, 70, zx, 290, COL['ink-2'], 3, [4, 4]); txt(c, '0', zx, 304, { size: 18, align: 'center', color: COL.muted });
      [['특수 상대성 (빠르게 움직임)', -7, COL.heat, 100], ['일반 상대성 (중력이 약함)', 45, COL.cold, 170], ['합', 38, COL.energy, 240]].forEach(function (o) {
        c.fillStyle = o[2]; c.fillRect(Math.min(zx, zx + o[1] * k), o[3] - 18, Math.abs(o[1] * k), 36);
        txt(c, o[0], 30, o[3], { size: 20, weight: 700, color: o[2] });
        txt(c, (o[1] > 0 ? '+' : MINUS) + Math.abs(o[1]) + ' μs', zx + o[1] * k + (o[1] > 0 ? 12 : -12), o[3], { size: 22, weight: 700, color: o[2], align: o[1] > 0 ? 'left' : 'right', mono: true });
      });
      txt(c, '느려짐 ←', zx - 14, 304, { size: 18, color: COL.muted, align: 'right' }); txt(c, '→ 빨라짐', zx + 14, 304, { size: 18, color: COL.muted });
      // 위치 오차
      const d = sd.get(), err = d * 10, y = 470, x0 = 120, sc = 9;
      c.fillStyle = COL['panel-2']; rrect(c, 24, 340, 852, 236, 14); c.fill();
      txt(c, '보정하지 않으면 내비게이션이 알려 주는 내 위치', 44, 372, { size: 22, weight: 700 });
      for (let i = 0; i < 6; i++) { c.fillStyle = COL.line; c.fillRect(60, 420 + i * 22, 790, 2); }
      dot(c, x0, y, 14, COL.good); txt(c, '실제 위치', x0, y + 36, { size: 20, weight: 700, align: 'center', color: COL.good });
      if (d > 0) { KIT.dash(c, x0, y, x0 + err * sc, y, COL.pen, 3, [6, 6]); dot(c, x0 + err * sc, y, 14, COL.pen); txt(c, '알려 준 위치', x0 + err * sc, y - 34, { size: 20, weight: 700, align: 'center', color: COL.pen }); }
      txt(c, '오차 약 ' + err + ' km', 640, 372, { size: 26, weight: 700, color: COL.pen, mono: true });
    },
  };
}

/* ── 공식 유도 : 빛 시계와 시간 지연 ── */
function sceneDerive(root) {
  const cv = makeCanvas(900, 560);
  const sv = KIT.slider('시계의 속력 v', 0.1, 0.8, 0.05, 0.6, function (v) { return KIT.fmt(v, 2) + ' c'; }, '170px');
  let show = 0;
  const st = KIT.derive(root, {
    cv: cv, title: '빛 시계와 시간 지연', cols: 1,
    ctrl: [h('div', { style: 'width:100%' }, sv.el)],
    intro: '거울 사이의 거리가 L 인 빛 시계가 있다. 빛이 한 번 왕복하는 시간을 한 번의 째깍으로 삼는다.',
    steps: [
      { what: '시계와 함께 있는 사람이 본다. 빛은 위아래로 2L 만큼 간다.', eq: 'Δt₀ = [[2L|c]]', note: '이 사람이 잰 시간을 {{⑬|고유 시간}}이라 한다. 시계와 함께 있으므로 이 사람에게 시계는 정상으로 간다.' },
      { what: '시계가 속력 v 로 지나가는 것을 보는 사람이 본다. 한 번 째깍하는 데 걸린 시간을 Δt 라 하면, 빛이 위 거울까지 가는 동안(Δt/2) 빛은 cΔt/2, 시계는 vΔt/2 만큼 간다.', eq: '( [[cΔt|2]] )^{2} = L^{2} + ( [[vΔt|2]] )^{2}', note: '빛의 경로, 거울 사이 거리, 시계가 간 거리가 직각삼각형을 이루므로 {{⑭|피타고라스 정리}}를 쓴다. 빛의 속력이 두 사람에게 모두 c 라는 가정이 여기서 쓰인다.' },
      { what: '양변에 4를 곱하고 Δt 에 대해 정리한다.', eq: 'c^{2}Δt^{2} − v^{2}Δt^{2} = 4L^{2} 　→ 　Δt = [[2L/c|√(1 − v^{2}/c^{2})]] 　∴ Δt = {{⑮|γ Δt₀}}', note: '분자의 2L/c 는 1단계의 고유 시간이고, 분모를 뒤집은 것이 γ 이다.' },
    ],
    means: 'γ ≥ 1 이므로 Δt ≥ Δt₀, 곧 움직이는 시계는 느리게 간다. 시계가 고장 난 것이 아니라 시간 자체가 다르게 흐른다. 필요한 수학은 피타고라스 정리 하나뿐이었다.',
  });
  st.on(function (n) { show = n; });
  return {
    tick: function () {
      const v = sv.get(), g = gam(v), c = cv.ctx; c.clearRect(0, 0, 900, 560);
      const L = 200, top = 120, bot = top + L;
      // 1단계 : 함께 있는 사람
      const hi1 = show >= 1;
      mirror(c, 100, top - 6, 110, hi1 ? COL.ink : COL.line); mirror(c, 100, bot + 6, 110, hi1 ? COL.ink : COL.line);
      arrow(c, 86, bot, 86, top + 4, { width: 4, head: 14, color: hi1 ? COL.pen : COL.line }); arrow(c, 114, top, 114, bot - 4, { width: 4, head: 14, color: hi1 ? COL.pen : COL.line });
      txt(c, '함께 있는 사람', 100, 60, { size: 20, weight: 700, align: 'center' });
      txt(c, 'L', 40, (top + bot) / 2, { size: 26, weight: 700, color: COL.muted });
      if (hi1) txt(c, 'Δt₀ = 2L / c', 100, bot + 50, { size: 24, weight: 700, align: 'center', color: COL.heat });
      // 2단계 : 지나가는 시계
      const b = v * g * L, x0 = 290, hi2 = show >= 2;
      [x0, x0 + b, x0 + 2 * b].forEach(function (x, i) { mirror(c, x, top - 6, 110, i === 2 ? COL['ink-2'] : COL.line); mirror(c, x, bot + 6, 110, i === 2 ? COL['ink-2'] : COL.line); });
      arrow(c, x0, bot, x0 + b, top + 2, { width: 5, head: 18, color: COL.pen }); arrow(c, x0 + b, top, x0 + 2 * b, bot - 2, { width: 5, head: 18, color: COL.pen });
      txt(c, '지나가는 시계를 보는 사람', x0 + b, 60, { size: 20, weight: 700, align: 'center' });
      KIT.vec(c, x0 + 2 * b + 70, top + 40, 60, 0, COL.cold, 'v', { width: 5, head: 16 });
      if (hi2) {
        KIT.dash(c, x0 + b, top, x0 + b, bot, COL['ink-2'], 3, [6, 6]);
        c.strokeStyle = COL['ink-2']; c.lineWidth = 2; c.strokeRect(x0 + b - 16, bot - 16, 16, 16);
        txt(c, 'L', x0 + b + 14, (top + bot) / 2, { size: 26, weight: 700 });
        txt(c, 'cΔt / 2', x0 + b / 2 - 16, (top + bot) / 2 - 10, { size: 24, weight: 700, color: COL.pen, align: 'right' });
        arrow(c, x0, bot + 40, x0 + b, bot + 40, { width: 3, head: 12, color: COL.cold }); arrow(c, x0 + b, bot + 40, x0, bot + 40, { width: 3, head: 12, color: COL.cold });
        txt(c, 'vΔt / 2', x0 + b / 2, bot + 66, { size: 22, weight: 700, align: 'center', color: COL.cold });
      }
      if (show >= 3) {
        c.fillStyle = COL['panel-2']; rrect(c, 40, 440, 820, 90, 14); c.fill();
        txt(c, 'v = ' + KIT.fmt(v, 2) + 'c 일 때  γ = ' + KIT.fmt(g, 2) + '  →  Δt = ' + KIT.fmt(g, 2) + ' Δt₀', 450, 485, { size: 28, weight: 700, align: 'center', color: COL.energy, mono: true });
      }
    },
  };
}

/* ── 자주 하는 오해 ── */
function sceneMis(root) {
  let t = 0;
  return KIT.mis(root, [
    { short: '시계가 고장?', q: '움직이는 시계는 고장 나서 느려지는 걸까?', wrong: '“움직이는 시계가 고장 나서 느려진다”', fix: '시계가 아니라 시간 자체가 다르게 흐른다. 원자시계든 심장 박동이든 모든 시계가 똑같이 느려진다.' },
    { short: '느려짐을 느낀다?', q: '우주선 안의 사람은 자기 시간이 느려지는 것을 느낄까?', wrong: '“우주선 안의 사람은 자기 시간이 느려지는 것을 느낀다”', fix: '자기 시간은 언제나 정상으로 흐른다. 상대적으로 움직이는 쪽의 시계가 느려 보이는 것이다.' },
    { short: '모두 상대적?', q: '상대성 이론은 모든 것이 상대적이라는 뜻일까?', wrong: '“상대성 이론은 모든 것이 상대적이라는 뜻이다”', fix: '오히려 반대이다. 물리 법칙과 빛의 속력은 누구에게나 똑같다는 것이 출발점이다.' },
  ], {
    w: 820, h: 600,
    draw: function (c, which, dt) {
      t += dt;
      if (which === 0) {
        txt(c, '지구에서 본 두 곳의 시계', 24, 40, { size: 24, weight: 700 });
        [['지구', 1, COL.heat, 200], ['0.8c 우주선', 1 / gam(0.8), COL.cold, 430]].forEach(function (o) {
          const tt = t * o[1], y = o[3];
          txt(c, o[0], 24, y - 90, { size: 22, weight: 700, color: o[2] });
          const sw = 0.5 * Math.sin(tt * 2.6);
          c.strokeStyle = COL['ink-2']; c.lineWidth = 3; c.beginPath(); c.moveTo(130, y - 60); c.lineTo(130 + Math.sin(sw) * 90, y - 60 + Math.cos(sw) * 90); c.stroke();
          dot(c, 130 + Math.sin(sw) * 90, y - 60 + Math.cos(sw) * 90, 14, o[2]);
          const beat = Math.pow(Math.max(0, Math.sin(tt * 3.2)), 8);
          c.fillStyle = COL.pen; c.beginPath(); c.arc(400, y, 26 + 10 * beat, 0, TAU); c.fill();
          txt(c, '심장', 400, y + 60, { size: 20, align: 'center', color: COL.muted }); txt(c, '흔들이', 130, y + 60, { size: 20, align: 'center', color: COL.muted });
          dial(c, 640, y, 52, tt * 10 % 60, o[2]); txt(c, '원자시계', 640, y + 76, { size: 20, align: 'center', color: COL.muted });
        });
        txt(c, '우주선의 모든 시계가 똑같이 0.6 배로 느리게 간다', 24, 580, { size: 22, weight: 700, color: COL.energy });
      } else if (which === 1) {
        [[0, '우주선 안의 사람', '내 시계 : 1초는 1초', '지구의 시계가 느려 보인다', COL.cold], [410, '지구의 사람', '내 시계 : 1초는 1초', '우주선의 시계가 느려 보인다', COL.heat]].forEach(function (o) {
          const x = o[0];
          c.fillStyle = COL['panel-2']; rrect(c, x + 14, 60, 380, 460, 16); c.fill();
          txt(c, o[1], x + 204, 100, { size: 24, weight: 700, align: 'center', color: o[4] });
          person(c, x + 204, 300, 1.6, o[4]);
          dial(c, x + 204, 380, 46, t * 6 % 60, o[4]);
          txt(c, o[2], x + 204, 460, { size: 21, weight: 700, align: 'center' });
          txt(c, o[3], x + 204, 494, { size: 20, align: 'center', color: COL.muted });
        });
        txt(c, '누구에게나 자기 시간은 정상으로 흐른다', 410, 570, { size: 24, weight: 700, align: 'center', color: COL.energy });
      } else {
        txt(c, '서로 다르게 움직이는 세 사람이 같은 빛의 속력을 잰다', 24, 40, { size: 22, weight: 700 });
        [['멈춰 있는 사람', 0, COL.ink], ['0.5c 로 가는 사람', 0.5, COL.cold], ['0.9c 로 가는 사람', 0.9, COL.heat]].forEach(function (o, i) {
          const y = 140 + i * 150, px = 150 + ((t * 60 * (1 + 2 * o[1])) % 220);
          c.fillStyle = COL.line; c.fillRect(30, y + 4, 760, 2);
          person(c, px, y, 1, o[2]);
          const lx = 30 + ((t * 600) % 760); KIT.line(c, [[lx - 40, y - 40], [lx, y - 40]], LIGHT, 6);
          txt(c, o[0], px, y + 26, { size: 18, weight: 700, align: 'center', color: o[2] });
          pill(c, '빛의 속력 = c', 790, y - 30, COL.energy, { align: 'right', size: 20 });
        });
        txt(c, '물리 법칙과 빛의 속력은 누구에게나 똑같다', 24, 580, { size: 24, weight: 700, color: COL.energy });
      }
    },
  }, { label: '오해' });
}

/* ── 스스로 점검하기 ── */
function sceneCheck(root) {
  KIT.check(root, [
    { q: '특수 상대성 이론의 두 가정은 무엇인가?', a: '상대성 원리와 광속 불변' },
    { q: '빛 시계에서 움직이는 시계가 느리게 가는 이유를 한 문장으로 말하면?', a: '움직이는 시계에서는 빛이 더 먼 길을 가는데 빛의 속력은 같으므로 한 번 째깍하는 데 시간이 더 걸린다.' },
    { q: '0.6c 로 움직이는 시계로 4초가 흐를 때, 정지한 사람의 시계로는 몇 초가 흐르는가?', a: '0.6c 에서 γ = 1.25 이므로 4초 × 1.25 = 5초' },
    { q: '중력이 강한 곳과 약한 곳 가운데 시간이 느리게 흐르는 곳은?', a: '중력이 강한 곳' },
  ]);
  return { tick: function () {} };
}
