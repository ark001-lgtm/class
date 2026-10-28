/* ═══════════════ 03. 열역학 제1법칙 : 장면 ═══════════════
   처음에는 HTML 파일 하나(lesson.html)로 만든 것을, 공통 부분은 수업 엔진(engine/)에 두고 장면만 남겼다.
   열 Q · 일 W · 내부 에너지 ΔU 는 어느 화면에서나 같은 색을 쓴다 (heat · work · energy). */
/** 식 속의 항 : 음수는 괄호로 */
function term(x) { const v = Math.round(x); return v < 0 ? '(' + num(x) + ' J)' : num(x) + ' J'; }
const UNIT_V = ' ×10^{−3} m^{3}', UNIT_P = ' ×10^{5} Pa';

/* ═══════════════ 물리 : 이상 기체 (단원자) ═══════════════
   P 단위 ×10⁵ Pa, V 단위 ×10⁻³ m³ 이므로 P·V 한 칸 = 100 J.
   처음 상태 P = 1, V = 2, T = 300 K → nR = 2/3 J/K, U = (3/2)nRT = 300 J */
const GAMMA = 5 / 3, EU = 100;
const S0 = { P: 1, V: 2, T: 300 };
const PROCS = {
  isobaric: { name: '등압 과정', short: '등압', keep: '압력 P', dirs: [{ label: '가열 (팽창)', end: 4 }, { label: '냉각 (수축)', end: 1 }] },
  isochoric: { name: '등적 과정', short: '등적', keep: '부피 V', dirs: [{ label: '가열', end: 2 }, { label: '냉각', end: 0.5 }] },
  isothermal: { name: '등온 과정', short: '등온', keep: '온도 T', dirs: [{ label: '팽창 (열을 받음)', end: 4 }, { label: '압축 (열을 내보냄)', end: 1 }] },
  adiabatic: { name: '단열 과정', short: '단열', keep: '열 출입 없음', dirs: [{ label: '팽창', end: 4 }, { label: '압축', end: 1 }] },
};
const ORDER = ['isobaric', 'isochoric', 'isothermal', 'adiabatic'];

/** 과정을 s(0~1)만큼 진행한 상태. end : 등적은 나중 압력, 나머지는 나중 부피 */
function stateAt(kind, end, s, base) {
  const b = base || S0;
  const nR = b.P * b.V * EU / b.T;
  let P, V, T, W;
  if (kind === 'isobaric') { V = b.V + (end - b.V) * s; P = b.P; T = b.T * V / b.V; W = EU * P * (V - b.V); }
  else if (kind === 'isochoric') { V = b.V; P = b.P + (end - b.P) * s; T = b.T * P / b.P; W = 0; }
  else if (kind === 'isothermal') { V = b.V + (end - b.V) * s; P = b.P * b.V / V; T = b.T; W = EU * b.P * b.V * Math.log(V / b.V); }
  else { V = b.V + (end - b.V) * s; P = b.P * Math.pow(b.V / V, GAMMA); T = b.T * Math.pow(b.V / V, GAMMA - 1); W = EU * (b.P * b.V - P * V) / (GAMMA - 1); }
  const dU = 1.5 * nR * (T - b.T);
  const Q = kind === 'adiabatic' ? 0 : dU + W;
  return { P: P, V: V, T: T, W: W, dU: dU, Q: Q };
}
function pathOf(kind, end, s, base, n) {
  const pts = [], k = n || 60;
  for (let i = 0; i <= k; i++) { const st = stateAt(kind, end, s * i / k, base); pts.push({ V: st.V, P: st.P }); }
  return pts;
}

/* ═══════════════ 그리기 도구 (이 소단원) ═══════════════ */
/** 옆으로 누운 원통 토막 [a, b] 의 겉모양 (왼쪽 앞에서 본 모습) : 왼쪽 끝은 타원 전체, 오른쪽 끝은 가까운 반쪽 */
function cylPath(ctx, a, b, yc, ry, rx) {
  ctx.beginPath();
  ctx.moveTo(a, yc - ry); ctx.lineTo(b, yc - ry);
  ctx.ellipse(b, yc, rx, ry, 0, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(a, yc + ry);
  ctx.ellipse(a, yc, rx, ry, 0, Math.PI / 2, Math.PI * 1.5);
  ctx.closePath();
}
/** 온도에 따른 색 : 차가우면 파랑, 300 K 근처는 회색, 뜨거우면 주황 */
function tempColor(T) {
  if (T <= 300) return mix(COL.cold, COL.muted, clamp((T - 150) / 150, 0, 1));
  return mix(COL.muted, COL.heat, clamp((T - 300) / 250, 0, 1));
}

/* 기체 분자 */
function makeGas(n, box) {
  const ps = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    ps.push({ x: box.x + 12 + Math.random() * (box.w - 24), y: box.y + 12 + Math.random() * (box.h - 24), dx: Math.cos(a), dy: Math.sin(a), f: 0.55 + Math.random() * 0.9 });
  }
  return ps;
}
function stepGas(ps, box, dt, speed, r) {
  r = r || 7;
  ps.forEach(function (p) {
    p.x += p.dx * p.f * speed * dt; p.y += p.dy * p.f * speed * dt;
    if (p.x < box.x + r) { p.x = box.x + r; p.dx = Math.abs(p.dx); }
    if (p.x > box.x + box.w - r) { p.x = box.x + box.w - r; p.dx = -Math.abs(p.dx); }
    if (p.y < box.y + r) { p.y = box.y + r; p.dy = Math.abs(p.dy); }
    if (p.y > box.y + box.h - r) { p.y = box.y + box.h - r; p.dy = -Math.abs(p.dy); }
  });
}
function drawGas(ctx, ps, T, r) {
  ctx.fillStyle = tempColor(T);
  ps.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, r || 7, 0, Math.PI * 2); ctx.fill(); });
}
function gasSpeed(T) { return 230 * Math.sqrt(Math.max(T, 20) / 300); }

/* 온도계 : 0 ~ 700 K.  initSide : '처음' 표시를 놓을 쪽 */
function thermometer(ctx, x, top, bottom, T, o) {
  o = o || {};
  const tw = 30, br = 30, tmax = 700, yb = bottom - br, hh = yb - top - 6;
  ctx.fillStyle = COL.panel; ctx.strokeStyle = COL['ink-2']; ctx.lineWidth = 4;
  rrect(ctx, x - tw / 2, top, tw, yb - top, tw / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, yb, br, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  const yl = yb - clamp(T / tmax, 0, 1) * hh;
  ctx.fillStyle = COL.heat;
  ctx.beginPath(); ctx.arc(x, yb, br - 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - tw / 2 + 8, yl, tw - 16, yb - yl);
  for (let k = 100; k <= 700; k += 100) {
    const y = yb - k / tmax * hh;
    ctx.strokeStyle = COL.muted; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + tw / 2 + 4, y); ctx.lineTo(x + tw / 2 + (k % 200 === 0 ? 18 : 11), y); ctx.stroke();
    if (k % 200 === 0) txt(ctx, String(k), x + tw / 2 + 22, y, { size: 18, color: COL.muted, mono: true });
  }
  if (o.init !== undefined) {
    const y = yb - o.init / tmax * hh, right = o.initSide === 'right';
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    ctx.beginPath();
    if (right) { ctx.moveTo(x - tw / 2 - 2, y); ctx.lineTo(x + tw / 2 + 28, y); }
    else { ctx.moveTo(x - tw / 2 - 28, y); ctx.lineTo(x + tw / 2 + 2, y); }
    ctx.stroke(); ctx.setLineDash([]);
    if (right) txt(ctx, '처음', x + tw / 2 + 32, y, { size: 18, color: COL.muted });
    else txt(ctx, '처음', x - tw / 2 - 32, y, { size: 18, color: COL.muted, align: 'right' });
  }
  if (o.label !== false) txt(ctx, Math.round(T) + ' K', x, bottom + 26, { size: 26, weight: 700, align: 'center', mono: true });
  if (o.title) txt(ctx, o.title, x, top - 22, { size: 22, weight: 600, align: 'center', color: COL['ink-2'] });
}

/* 압력계 : 0 ~ pmax (×10⁵ Pa).  label : true(아래) · 'right'(오른쪽) · false */
function dial(ctx, cx, cy, r, P, o) {
  o = o || {};
  const pmax = o.pmax || 3.5, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
  ctx.fillStyle = COL.panel; ctx.strokeStyle = COL['ink-2']; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  for (let k = 0; k <= pmax * 2 + 0.01; k++) {
    const v = k / 2, a = a0 + (a1 - a0) * v / pmax, big = k % 2 === 0;
    ctx.strokeStyle = COL.muted; ctx.lineWidth = big ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6));
    ctx.lineTo(cx + Math.cos(a) * (r - (big ? 18 : 12)), cy + Math.sin(a) * (r - (big ? 18 : 12))); ctx.stroke();
    if (big) txt(ctx, String(v), cx + Math.cos(a) * (r - 32), cy + Math.sin(a) * (r - 32), { size: r > 80 ? 20 : 16, color: COL.muted, align: 'center', mono: true });
  }
  const a = a0 + (a1 - a0) * clamp(P / pmax, 0, 1);
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20)); ctx.stroke();
  dot(ctx, cx, cy, 7, COL.ink);
  if (o.label === 'right') txtU(ctx, P.toFixed(2), UNIT_P, cx + r + 16, cy, { size: 24, weight: 700 });
  else if (o.label !== false) txtU(ctx, P.toFixed(2), UNIT_P, cx, cy + r + 26, { size: 24, weight: 700, align: 'center' });
}

/* P–V 그래프 */
function pvBox(x, y, w, h, vmax, pmax) { return { x: x, y: y, w: w, h: h, vmax: vmax, pmax: pmax }; }
function PX(g, V) { return g.x + V / g.vmax * g.w; }
function PY(g, P) { return g.y + g.h - P / g.pmax * g.h; }
function pvAxes(ctx, g, o) {
  o = o || {};
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.5;
  const step = o.grid || 0.5;
  for (let v = step; v <= g.vmax + 1e-6; v += step) { const x = PX(g, v); ctx.beginPath(); ctx.moveTo(x, g.y); ctx.lineTo(x, g.y + g.h); ctx.stroke(); }
  for (let p = step; p <= g.pmax + 1e-6; p += step) { const y = PY(g, p); ctx.beginPath(); ctx.moveTo(g.x, y); ctx.lineTo(g.x + g.w, y); ctx.stroke(); }
  arrow(ctx, g.x, g.y + g.h, g.x + g.w + 26, g.y + g.h, { width: 3, color: COL.ink, head: 14 });
  arrow(ctx, g.x, g.y + g.h, g.x, g.y - 24, { width: 3, color: COL.ink, head: 14 });
  if (o.ticks !== false) {
    for (let v = 1; v <= g.vmax + 1e-6; v += 1) txt(ctx, String(v), PX(g, v), g.y + g.h + 22, { size: 20, color: COL.muted, align: 'center', mono: true });
    for (let p = 1; p <= g.pmax + 1e-6; p += 1) txt(ctx, String(p), g.x - 14, PY(g, p), { size: 20, color: COL.muted, align: 'right', mono: true });
    txt(ctx, '0', g.x - 14, g.y + g.h + 14, { size: 20, color: COL.muted, align: 'right', mono: true });
  }
  txt(ctx, '압력 P (×10^{5} Pa)', g.x + 12, g.y - 26, { size: 21, weight: 600, color: COL['ink-2'] });
  txt(ctx, '부피 V (×10^{−3} m^{3})', g.x + g.w + 20, g.y + g.h + 50, { size: 21, weight: 600, color: COL['ink-2'], align: 'right' });
}
/** 그래프 아래 넓이를 칠한다. 부피가 줄면(압축) 빗금 */
function pvArea(ctx, g, pts, color, negative) {
  if (pts.length < 2) return;
  ctx.beginPath(); ctx.moveTo(PX(g, pts[0].V), PY(g, 0));
  pts.forEach(function (p) { ctx.lineTo(PX(g, p.V), PY(g, p.P)); });
  ctx.lineTo(PX(g, pts[pts.length - 1].V), PY(g, 0)); ctx.closePath();
  ctx.fillStyle = rgba(color, negative ? 0.12 : 0.24); ctx.fill();
  if (negative) {
    ctx.save(); ctx.clip();
    ctx.strokeStyle = rgba(color, 0.55); ctx.lineWidth = 2;
    for (let x = g.x - g.h; x < g.x + g.w + g.h; x += 16) { ctx.beginPath(); ctx.moveTo(x, g.y + g.h); ctx.lineTo(x + g.h, g.y); ctx.stroke(); }
    ctx.restore();
  }
}
function pvLine(ctx, g, pts, color, width, dash) {
  if (pts.length < 2) return;
  ctx.strokeStyle = color; ctx.lineWidth = width || 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(function (p, i) { const x = PX(g, p.V), y = PY(g, p.P); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
  ctx.setLineDash([]);
}

/* Q·ΔU·W 막대 (가로, 가운데가 0) */
function energyBars(ctx, w, hgt, vals, maxAbs, o) {
  o = o || {};
  const rows = [
    { key: 'Q', name: '열', v: vals.Q, color: COL.heat },
    { key: 'ΔU', name: '내부 에너지 변화', v: vals.dU, color: COL.energy },
    { key: 'W', name: '기체가 한 일', v: vals.W, color: COL.work },
  ];
  const lx = o.labelW || 300, rx = w - (o.valueW || 150), cx = (lx + rx) / 2, half = (rx - lx) / 2 - 6;
  const rh = hgt / rows.length;
  rows.forEach(function (r, i) {
    const y = i * rh + rh / 2;
    const tw = txt(ctx, r.key, 16, y, { size: 30, weight: 700, color: r.color, mono: true });
    txt(ctx, r.name, 28 + tw, y + 1, { size: 21, color: COL.muted });
    ctx.fillStyle = COL['panel-2']; rrect(ctx, lx, y - rh * 0.28, rx - lx, rh * 0.56, 8); ctx.fill();
    const len = clamp(r.v / maxAbs, -1, 1) * half;
    if (Math.abs(len) > 0.5) { ctx.fillStyle = r.color; rrect(ctx, Math.min(cx, cx + len), y - rh * 0.28, Math.abs(len), rh * 0.56, 6); ctx.fill(); }
    txt(ctx, sgn(r.v) + ' J', w - 12, y, { size: 28, weight: 700, align: 'right', mono: true, color: Math.abs(r.v) < 0.5 ? COL.muted : COL.ink });
  });
  ctx.strokeStyle = COL['ink-2']; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, 4); ctx.lineTo(cx, hgt - 4); ctx.stroke();
}

/* 실린더 (가로로 누운 원통, 오른쪽이 피스톤).  과정 화면들이 같은 자리에 계기를 둔다. */
const CYL = { x0: 210, yTop: 200, H: 210, kx: 128, wall: 12 };
const GAUGE = { x: 290, y: 100, r: 62 };
const THERMO = { x: 74, top: 150, bottom: 470 };
function pistonX(V, geo) { geo = geo || CYL; return geo.x0 + V * geo.kx; }
/**
 * mode : isobaric · isochoric · isothermal · adiabatic · plain
 * heat : +1 들어옴, −1 나감, 0 없음.  t : 시각(화살표 움직임)  moving : 움직이는 중인가
 */
function drawCylinder(ctx, st, gas, o) {
  const g = o.geo || CYL, x0 = g.x0, yT = g.yTop, H = g.H, yB = yT + H, wl = g.wall;
  const xp = pistonX(st.V, g), tubeEnd = x0 + (o.tubeV || 4.4) * g.kx, rod = o.rod || 70, pw = 26;
  const mode = o.mode || 'plain';
  // 항온조 (등온) : 실린더를 일정한 온도의 물에 담근다
  if (mode === 'isothermal') {
    ctx.fillStyle = rgba(COL.cold, 0.13); rrect(ctx, x0 - 46, yT - 40, tubeEnd - x0 + 70, H + 112, 18); ctx.fill();
    ctx.strokeStyle = rgba(COL.cold, 0.5); ctx.lineWidth = 3; rrect(ctx, x0 - 46, yT - 40, tubeEnd - x0 + 70, H + 112, 18); ctx.stroke();
    txt(ctx, '항온조 : 온도가 일정한 물', x0 - 40, yB + 98, { size: 22, weight: 600, color: COL.cold });
  }
  // 단열재
  if (mode === 'adiabatic') {
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 - wl - 28, yT - wl - 28, tubeEnd - x0 + wl + 28, H + 2 * wl + 56); ctx.rect(x0 - wl, yT - wl, tubeEnd - x0 + wl + 2, H + 2 * wl); ctx.clip('evenodd');
    ctx.fillStyle = rgba(COL.muted, 0.18); ctx.fillRect(x0 - wl - 28, yT - wl - 28, tubeEnd - x0 + wl + 28, H + 2 * wl + 56);
    ctx.strokeStyle = rgba(COL.muted, 0.6); ctx.lineWidth = 2;
    for (let x = x0 - 300; x < tubeEnd + 300; x += 18) { ctx.beginPath(); ctx.moveTo(x, yB + 60); ctx.lineTo(x + 120, yT - 60); ctx.stroke(); }
    ctx.restore();
    txt(ctx, '단열재 : 열이 드나들지 않는다', x0 - 40, yB + 72, { size: 22, weight: 600, color: COL['ink-2'] });
  }
  // 기체가 든 곳 (온도에 따라 옅은 색)
  ctx.fillStyle = rgba(tempColor(st.T), 0.1);
  ctx.fillRect(x0, yT, xp - x0, H);
  if (gas) drawGas(ctx, gas, st.T, o.r);
  // 원통 벽
  ctx.fillStyle = COL['ink-2'];
  ctx.fillRect(x0 - wl, yT - wl, tubeEnd - x0 + wl, wl);
  ctx.fillRect(x0 - wl, yB, tubeEnd - x0 + wl, wl);
  ctx.fillRect(x0 - wl, yT - wl, wl, H + 2 * wl);
  // 피스톤과 막대
  ctx.fillStyle = COL.ink; ctx.fillRect(xp, yT + 3, pw, H - 6);
  ctx.fillStyle = COL['ink-2']; ctx.fillRect(xp + pw, yT + H / 2 - 9, rod, 18);
  // 등적 : 피스톤 고정 핀
  if (mode === 'isochoric') {
    ctx.fillStyle = COL.pen;
    [yT - wl - 22, yB - 6].forEach(function (y) { rrect(ctx, xp + pw / 2 - 7, y, 14, wl + 30, 4); ctx.fill(); });
    pill(ctx, '피스톤 고정', xp + pw / 2, yT - wl - 44, COL.pen, { align: 'center', size: 20 });
  }
  // 등압 : 바깥에서 같은 압력으로 미는 화살표
  if (mode === 'isobaric') {
    const xr = xp + pw + rod + 10;
    [-1, 0, 1].forEach(function (k) { arrow(ctx, xr + 70, yT + H / 2 + k * 34, xr + 6, yT + H / 2 + k * 34, { width: 4, color: COL.muted, head: 14 }); });
    txt(ctx, '바깥 압력 일정', Math.min(xr + 76, 930), yT + H / 2 - 74, { size: 20, weight: 600, color: COL.muted, align: 'right' });
  }
  // 열의 흐름 : 가열판 · 냉각판 또는 항온조에서 화살표로
  const heat = o.heat || 0, qWord = heat > 0 ? 'Q 들어옴' : 'Q 나감';
  if (o.burner && mode !== 'adiabatic' && mode !== 'isothermal') {
    const by = yB + wl + 30, bw = Math.min(520, tubeEnd - x0 - 40), hot = o.burnerOn !== false;
    ctx.fillStyle = rgba(hot ? COL.heat : COL.cold, 0.85);
    rrect(ctx, x0 + 20, by, bw, 20, 6); ctx.fill();
    txt(ctx, (hot ? '가열' : '냉각') + (heat ? ' : ' + qWord : ''), x0 + 32 + bw, by + 10, { size: 22, weight: 700, color: hot ? COL.heat : COL.cold });
  }
  if (mode === 'isothermal' && heat) txt(ctx, qWord, tubeEnd + 12, yB + 98, { size: 22, weight: 700, color: COL.heat, align: 'right' });
  if (heat !== 0) {
    const off = o.moving ? ((o.t || 0) * 40) % 26 : 8;
    const xs = [x0 + 60, x0 + 170, x0 + 280, x0 + 390].filter(function (x) { return x < xp - 30; });
    const yA = mode === 'isothermal' ? yB + 62 : yB + wl + 26, yZ = yB - 34;
    xs.forEach(function (x) {
      const from = heat > 0 ? yA : yZ, to = heat > 0 ? yZ : yA;
      const shift = (heat > 0 ? -1 : 1) * off * 0.3;
      arrow(ctx, x, from + shift, x, to + shift, { width: 5, color: COL.heat, head: 18, dash: [10, 8] });
    });
  }
  return { xp: xp, pw: pw, rodEnd: xp + pw + rod };
}
/** 압력계와 관 (실린더 위) */
function drawGauge(ctx, P, keep) {
  ctx.fillStyle = COL['ink-2'];
  ctx.fillRect(GAUGE.x - 8, GAUGE.y + GAUGE.r - 4, 16, CYL.yTop - CYL.wall - (GAUGE.y + GAUGE.r) + 6);
  dial(ctx, GAUGE.x, GAUGE.y, GAUGE.r, P, { pmax: 3.5, label: 'right' });
  txt(ctx, '압력', GAUGE.x, 16, { size: 22, weight: 600, color: COL['ink-2'], align: 'center' });
  if (keep) pill(ctx, '일정', GAUGE.x + GAUGE.r + 16, GAUGE.y + 42, COL.pen, { size: 20 });
}
/** 온도계 (실린더 왼쪽) */
function drawThermo(ctx, T, keep) {
  thermometer(ctx, THERMO.x, THERMO.top, THERMO.bottom, T, { init: 300, initSide: 'right', title: '온도' });
  if (keep) pill(ctx, '일정', THERMO.x + 30, THERMO.top - 22, COL.pen, { size: 20 });
}

/* ═══════════════ 장면 ═══════════════ */
/* 수업 흐름 (시간을 나누지 않고 한 줄로 이어진다)
   내부 에너지 · 일 → 제1법칙 → 단열 과정 → "열을 넣으면 온도는?" 으로 이어서 등압 · 등적 · 등온
   → 표 1 · 주의 1 · 예제 → 정리.
   part : 머리줄 위에 작게 쓰는 학습지 단원 이름 */
const PART1 = '1 내부 에너지와 열역학 제1법칙', PART2 = '2 여러 가지 열역학 과정';
const SCENE_LIST = [
  { id: 'u', part: PART1, title: '내부 에너지', ws: '학습지 1-(1) ①', sub: '분자 운동과 온도, U는 온도에만 관계', make: sceneU },
  { id: 'work', part: PART1, title: '기체가 외부에 한 일', ws: '학습지 1-(2) ②', sub: '입체 피스톤 그림으로 W = PΔV 유도', make: sceneWork },
  { id: 'area', part: PART1, title: '그래프 아래 넓이', ws: '학습지 1-(2) ▶ ③', sub: '압력이 변할 때, 팽창·압축의 부호', make: sceneArea },
  { id: 'law', part: PART1, title: '열역학 제1법칙', ws: '학습지 1-(3) ④', sub: '넣은 열 Q = ΔU + W', make: sceneLaw },
  { id: 'adia', part: PART2, title: '단열 과정', ws: '학습지 2 [표 1] ⑦', sub: '열 출입이 없을 때 Q = 0', make: function (root) { return sceneProc(root, 'adiabatic'); } },
  { id: 'mis2', part: PART2, title: '주의 2 : 단열과 온도', ws: '학습지 2 주의 2', sub: '단열이니까 온도도 그대로?', make: function (root) { return sceneMis(root, 1); } },
  { id: 'think', part: PART2, title: '열을 넣으면 온도는?', ws: '이어서 생각하기', sub: '단열에서 등압 · 등적 · 등온으로', make: sceneThink },
  { id: 'proc', part: PART2, title: '등압 · 등적 · 등온 과정', ws: '학습지 2 [표 1] ⑤⑥', sub: '단열과 견주며 네 과정 살펴보기', make: function (root) { return sceneProc(root, 'isobaric'); } },
  { id: 'table', part: PART2, title: '표 1 정리', ws: '학습지 2 [표 1] ⑧', sub: '네 과정의 빈칸 확인', make: sceneTable },
  { id: 'mis', part: PART2, title: '주의 1 : 열과 온도', ws: '학습지 2 주의 1', sub: '열을 넣으면 온도는 반드시 올라간다?', make: function (root) { return sceneMis(root, 0); } },
  { id: 'ex', part: PART2, title: '예제', ws: '학습지 2 예제 ⑨⑩⑪', sub: '압력 2×10^{5} Pa 일정, 열 500 J', make: sceneEx },
  { id: 'cmp', part: '정리', title: '한눈에 비교', ws: '정리 (선택)', sub: '같은 부피만큼 팽창할 때 한 일', make: sceneCompare },
  { id: 'guess', part: '정리', title: '과정 맞히기', ws: '확인 활동', sub: '단서를 적게 열고 맞히기', make: sceneGuess },
];
let PROC_REQ = null;   // 다른 화면에서 '이 과정 보기'를 눌렀을 때 열 탭

/* ── 1. 내부 에너지 ── */
function sceneU(root) {
  const g = makeCanvas(1000, 700);
  const tIn = h('input', { class: 'big', type: 'range', id: 'u-temp', min: 150, max: 600, step: 10, value: 300, 'aria-label': '온도' });
  const vIn = h('input', { class: 'big', type: 'range', id: 'u-vol', min: 1.2, max: 4.2, step: 0.05, value: 2, 'aria-label': '부피' });
  const tOut = h('output', { for: 'u-temp' }), vOut = h('output', { for: 'u-vol' });
  const keVal = h('span', { class: 'm-val' }), keBar = h('i', {});
  const uVal = h('span', { class: 'm-val' }), uBar = h('i', {});
  const keCalc = h('span', {}), uCalc = h('span', { class: 'u' });
  const note = h('div', { class: 'callout' }, '온도와 부피를 하나씩 바꿔 보세요.');
  /** 6.2 × 10⁻²¹ 처럼 위첨자를 HTML 로 */
  const sciEl = function (el, x) {
    const e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
    el.replaceChildren(m.toFixed(1) + ' × 10', h('sup', { text: String(e).replace('-', MINUS) }), ' J');
  };
  root.append(h('div', { class: 'row', style: 'height:100%' },
    h('section', { class: 'panel col fix', style: 'padding:18px 30px 22px;gap:16px' },
      g.c,
      h('div', { class: 'slider' }, h('label', { for: 'u-temp', text: '온도 T' }), tIn, tOut),
      h('div', { class: 'slider' }, h('label', { for: 'u-vol', text: '부피 V' }), vIn, vOut)),
    h('section', { class: 'panel col fill pad', style: 'gap:22px' },
      h('p', { class: 'ws' }, '• 계를 이루는 모든 분자가 가진 에너지의 총합을 ', h('b', { text: '내부 에너지 U' }), ' 라고 한다.'),
      h('p', { class: 'ws' }, '• 이상 기체의 내부 에너지는 분자의 운동 에너지뿐이므로, ', blank('1', '①', '온도'), '에만 관계된다. 온도가 오르면 U 가 커진다.'),
      h('div', { class: 'meter' }, h('span', { class: 'm-name', text: '분자 한 개의 평균 운동 에너지' }), keVal, h('div', { class: 'm-bar' }, keBar)),
      h('div', { class: 'meter' }, h('span', { class: 'm-name', text: '내부 에너지 U' }), uVal, h('div', { class: 'm-bar' }, uBar)),
      h('div', { class: 'callout', style: 'font-size:27px;line-height:1.55' },
        'U = (분자 수) × (분자 한 개의 평균 운동 에너지)', h('br'),
        h('span', { class: 'mono' }, ' = 4.8 × 10', h('sup', { text: '22' }), ' × ', keCalc, ' ≈ ', uCalc)),
      note)));
  const X0 = 210, Y0 = 150, BH = 440, KX = 150;
  const ps = makeGas(70, { x: X0, y: Y0, w: 2 * KX, h: BH });
  let lastT = 300, lastV = 2, shownT = -1;
  return {
    tick: function (dt) {
      const T = +tIn.value, V = +vIn.value;
      setText(tOut, T + ' K'); setText(vOut, V.toFixed(2));
      if (T !== lastT) { note.textContent = T > lastT ? '온도가 올라가면 분자가 빨라지고, U 가 커집니다.' : '온도가 내려가면 분자가 느려지고, U 가 작아집니다.'; note.className = 'callout'; lastT = T; }
      if (V !== lastV) { note.textContent = '부피만 바꾸면 분자의 빠르기도 U 도 그대로입니다. 이상 기체의 U 는 온도에만 관계됩니다.'; note.className = 'callout good'; lastV = V; }
      if (T !== shownT) {
        // 분자 수 N = PV/kT = 4.83 × 10²² 개, 분자 한 개의 평균 운동 에너지 = (3/2)kT
        const ke = 1.5 * 1.380649e-23 * T;
        sciEl(keVal, ke); sciEl(keCalc, ke);
        uVal.textContent = Math.round(T) + ' J'; uCalc.textContent = Math.round(T) + ' J';
        keBar.style.width = (T / 600 * 100) + '%'; uBar.style.width = (T / 600 * 100) + '%';
        shownT = T;
      }
      const w = V * KX, b = { x: X0, y: Y0, w: w, h: BH };
      stepGas(ps, b, dt, gasSpeed(T), 8);
      const ctx = g.ctx;
      ctx.clearRect(0, 0, g.w, g.h);
      ctx.fillStyle = rgba(tempColor(T), 0.08); ctx.fillRect(X0, Y0, w, BH);
      drawGas(ctx, ps, T, 8);
      ctx.fillStyle = COL['ink-2'];
      ctx.fillRect(X0 - 12, Y0 - 12, 4.4 * KX + 12, 12); ctx.fillRect(X0 - 12, Y0 + BH, 4.4 * KX + 12, 12); ctx.fillRect(X0 - 12, Y0 - 12, 12, BH + 24);
      ctx.fillStyle = COL.ink; ctx.fillRect(X0 + w, Y0 + 2, 24, BH - 4);
      ctx.fillStyle = COL['ink-2']; ctx.fillRect(X0 + w + 24, Y0 + BH / 2 - 8, 100, 16);
      txt(ctx, '분자 하나하나가 운동 에너지를 가진다', X0, 50, { size: 28, weight: 600 });
      txt(ctx, '→ 빠를수록(온도가 높을수록) 크다', X0, 92, { size: 24, color: COL.muted });
      const lw = txt(ctx, '부피  ', X0, Y0 + BH + 46, { size: 24, color: COL['ink-2'] });
      txtU(ctx, V.toFixed(2), UNIT_V, X0 + lw, Y0 + BH + 46, { size: 24, color: COL['ink-2'] });
      thermometer(ctx, 74, 160, 640, T, { init: 300, initSide: 'right', title: '온도' });
    },
  };
}

/* ── 2. 기체가 외부에 한 일 : 공식 유도 ── */
function sceneWork(root) {
  const g = makeCanvas(1090, 520), pv = makeCanvas(736, 520);
  let step = 0, s = 0, playing = false, numbers = false;
  const geo = { x0: 160, yTop: 160, H: 210, kx: 180, wall: 12 };
  const V1 = 2, V2 = 3, Pv = 1;
  const ps = makeGas(46, { x: geo.x0, y: geo.yTop, w: V1 * geo.kx, h: geo.H });
  const NUM = { P: '1.0 × 10^{5} Pa', A: '1.0 × 10^{−2} m^{2}', d: '0.10 m', F: '1.0 × 10^{3} N' };
  const NB = ' ';
  const STEPS = [
    { what: '기체가 피스톤을 미는 힘을 구한다.', eq: 'F = PA', eqN: 'F = PA = (1.0×10^{5})(1.0×10^{−2}) = 1.0×10^{3}' + NB + 'N', note: '압력의 정의 P = F/A 를 F 에 대하여 쓴 것이다.' },
    { what: '힘이 한 일을 구한다.', eq: 'W = Fd = PAd', eqN: 'W = Fd = (1.0×10^{3})(0.10) = 100' + NB + 'J', note: '일 = 힘 × 이동 거리 (힘과 이동 방향이 같다).' },
    { what: 'A d 는 늘어난 부피이다.', eq: null, eqN: 'Ad = (1.0×10^{−2})(0.10) = 1.0×10^{−3}' + NB + 'm^{3}', note: '밑넓이 × 높이가 곧 늘어난 부피이다.' },
    { what: '정리한다.', eq: '∴ W = PΔV', eqN: '∴ W = PΔV = (1.0×10^{5})(1.0×10^{−3}) = 100' + NB + 'J', note: '압력이 일정할 때 성립하는 식이다.' },
  ];
  const stepEls = [], eqEls = [];
  const stepsBox = h('div', { class: 'steps' });
  STEPS.forEach(function (st, i) {
    const eq = h('div', { class: 's-eq' });
    eqEls.push(eq);
    const el = h('div', { class: 'step' }, h('span', { class: 's-no', text: (i + 1) + '단계' }), h('span', { class: 's-what', text: st.what }), eq, h('span', { class: 's-note', text: st.note }));
    stepEls.push(el); stepsBox.append(el);
  });
  const nextBtn = h('button', { class: 'btn primary', type: 'button', style: 'min-width:190px', onclick: function () {
    if (step >= 4) return;
    step++;
    if (step === 2) { s = 0; playing = true; }
    if (step >= 3) { s = 1; playing = false; }
    renderEqs();
  } });
  const resetBtn = h('button', { class: 'btn', type: 'button', text: '처음부터', onclick: function () { step = 0; s = 0; playing = false; renderEqs(); } });
  const numBtn = h('button', { class: 'btn', type: 'button', 'aria-pressed': 'false', text: '숫자로 보기', onclick: function () { numbers = !numbers; numBtn.setAttribute('aria-pressed', String(numbers)); renderEqs(); } });
  function renderEqs() {
    STEPS.forEach(function (st, i) {
      const e = eqEls[i]; e.replaceChildren();
      e.classList.toggle('small', numbers);
      if (numbers) e.append.apply(e, rich(st.eqN));
      else if (i === 2) e.append('Ad = ', blank('2', '②', 'ΔV'));
      else e.append(st.eq);
      stepEls[i].classList.toggle('on', step > i);
    });
    nextBtn.disabled = step >= 4;
    nextBtn.textContent = step >= 4 ? '유도 끝' : (step + 1) + '단계 보기';
  }
  root.append(h('div', { class: 'col', style: 'height:100%;gap:18px' },
    h('div', { class: 'row', style: 'gap:18px' },
      h('section', { class: 'panel fix', style: 'padding:0' }, g.c),
      h('section', { class: 'panel fix', style: 'padding:0' }, pv.c)),
    h('section', { class: 'panel col fill', style: 'padding:14px 22px;gap:12px' },
      h('div', { class: 'row', style: 'align-items:center;justify-content:space-between' },
        h('p', { class: 'ws fill', style: 'font-size:27px;line-height:1.5' }, '단면적 A 인 피스톤이 든 실린더에 압력 P 인 기체가 들어 있다. 기체가 팽창하여 피스톤을 거리 d 만큼 밀어냈다.'),
        h('div', { class: 'ctrl fix' }, numBtn, resetBtn, nextBtn)),
      stepsBox)));
  renderEqs();
  return {
    tick: function (dt) {
      if (playing) { s = Math.min(1, s + dt / 2.4); if (s >= 1) playing = false; }
      const V = step >= 2 ? V1 + (V2 - V1) * s : V1;
      const ctx = g.ctx;
      ctx.clearRect(0, 0, g.w, g.h);
      // 입체 실린더 : 옆으로 누운 원통을 왼쪽 앞에서 본 모습. 둥근 면은 타원(가로 반지름 RX)으로 그린다
      const x0 = geo.x0, yT = geo.yTop, H = geo.H, yB = yT + H, YC = yT + H / 2, R = H / 2, RX = 36, TH = 30;
      const x1 = x0 + V1 * geo.kx, xp = x0 + V * geo.kx, tubeEnd = x0 + 4.3 * geo.kx, moved = step >= 2 && xp > x1 + 1;
      stepGas(ps, { x: x0, y: yT, w: xp - x0, h: H }, dt, gasSpeed(320), 7);
      // 유리관 몸통 : 아래로 갈수록 조금 진하게 칠해 둥근 느낌을 낸다
      cylPath(ctx, x0, tubeEnd, YC, R, RX);
      ctx.fillStyle = vGrad(ctx, yT, yB, [rgba(COL.cold, 0.04), rgba(COL.cold, 0.08), rgba(COL.cold, 0.18)]); ctx.fill();
      // 열린 끝의 먼 쪽 테두리 (유리 너머로 흐리게)
      ctx.strokeStyle = rgba(COL['ink-2'], 0.4); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(tubeEnd, YC, RX, R, 0, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
      // 기체가 차지한 부분, 그 가운데 늘어난 부피
      cylPath(ctx, x0, xp, YC, R, RX); ctx.fillStyle = rgba(tempColor(320), 0.08); ctx.fill();
      if (moved) { cylPath(ctx, x1, xp, YC, R, RX); ctx.fillStyle = rgba(COL.work, step >= 3 ? 0.3 : 0.16); ctx.fill(); }
      drawGas(ctx, ps, 320, 7);
      // 처음 피스톤 자리 = 늘어난 부피의 밑면 (점선 타원)
      if (moved) {
        ctx.strokeStyle = COL.work; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
        ctx.beginPath(); ctx.ellipse(x1, YC, RX, R, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
      // 피스톤 : 막대 → 몸통 → 기체 쪽 면(단면적 A) 순서로 겹쳐 그린다
      const metal = COL['ink-2'], hi = mix(metal, '#FFFFFF', 0.28), lo = mix(metal, '#000000', 0.3);
      ctx.fillStyle = vGrad(ctx, YC - 11, YC + 11, [hi, metal, lo]); ctx.fillRect(xp + TH, YC - 11, g.w - xp - TH, 22);
      cylPath(ctx, xp, xp + TH, YC, R - 3, RX);
      ctx.fillStyle = vGrad(ctx, yT, yB, [hi, metal, lo]); ctx.fill();
      ctx.beginPath(); ctx.ellipse(xp, YC, RX, R - 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = mix(metal, '#FFFFFF', 0.55); ctx.fill();
      ctx.fillStyle = rgba(COL.energy, 0.42); ctx.fill();
      ctx.strokeStyle = COL.energy; ctx.lineWidth = 4; ctx.stroke();
      // 유리관 테두리 : 위·아래 선, 열린 끝의 가까운 쪽, 막힌 바닥
      ctx.strokeStyle = COL['ink-2']; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(tubeEnd, yT); ctx.moveTo(x0, yB); ctx.lineTo(tubeEnd, yB); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(tubeEnd, YC, RX, R, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x0, YC, RX, R, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(COL['ink-2'], 0.16); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = rgba('#FFFFFF', isDark() ? 0.14 : 0.6); ctx.lineWidth = 6;           // 유리의 반짝임
      ctx.beginPath(); ctx.moveTo(x0 + 44, yT + 17); ctx.lineTo(tubeEnd - 22, yT + 17); ctx.stroke();
      // 단면적 A : 이름표에서 피스톤 면으로 선을 잇는다
      txt(ctx, numbers ? '단면적 A = ' + NUM.A : '단면적 A', xp - 34, yT - 44, { size: 24, weight: 700, color: COL.energy, align: 'right' });
      ctx.strokeStyle = COL.energy; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(xp - 28, yT - 30); ctx.lineTo(xp - 6, yT + 26); ctx.stroke();
      dot(ctx, xp - 6, yT + 26, 5, COL.energy);
      // 압력 P : 기체가 피스톤 면을 미는 화살표
      [-46, 14, 74].forEach(function (dy) { arrow(ctx, xp - 96, YC + dy, xp - 12, YC + dy, { width: 4, color: COL['ink-2'], head: 14 }); });
      txt(ctx, numbers ? '압력 P = ' + NUM.P : '압력 P', x0 + 10, yB + 46, { size: 24, weight: 700, color: COL['ink-2'] });
      // 힘 F
      if (step >= 1) {
        const yF = YC - 58;
        arrow(ctx, xp + TH + 16, yF, xp + TH + 196, yF, { width: 8, color: COL.heat, head: 26 });
        txt(ctx, numbers ? 'F = PA = ' + NUM.F : 'F = PA', xp + TH + 20, yT - 44, { size: 28, weight: 700, color: COL.heat });
      }
      // 이동 거리 d 와 늘어난 부피 (밑넓이 A × 높이 d)
      if (step >= 2) {
        const yd = yB + 46;
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1, yd - 16); ctx.lineTo(x1, yd + 16); ctx.moveTo(xp, yd - 16); ctx.lineTo(xp, yd + 16); ctx.stroke();
        if (xp - x1 > 30) arrow(ctx, x1 + 4, yd, xp - 4, yd, { width: 3, color: COL.ink, head: 14 });
        txt(ctx, numbers ? 'd = ' + NUM.d : 'd', (x1 + xp) / 2, yd + 30, { size: 28, weight: 700, align: 'center' });
        txt(ctx, step >= 4 ? 'W = PΔV' : 'W = Fd', xp + TH + 70, YC + 58, { size: 28, weight: 700, color: COL.work, halo: true });
      }
      if (step >= 3 && moved) {
        txt(ctx, '늘어난 부피', (x1 + xp) / 2, yT + 30, { size: 24, weight: 700, color: COL.work, align: 'center', halo: true });
        txt(ctx, 'ΔV = 밑넓이 A × 높이 d', (x1 + xp) / 2, yB + 112, { size: 26, weight: 700, color: COL.work, align: 'center' });
      }
      txt(ctx, '피스톤이 든 실린더', 24, 30, { size: 22, weight: 600, color: COL.muted });
      if (step === 0) txt(ctx, '[1단계 보기]를 누르면 시작합니다', g.w - 30, g.h - 24, { size: 22, color: COL.muted, align: 'right' });
      // [그림 1] P–V 그래프
      const c2 = pv.ctx; c2.clearRect(0, 0, pv.w, pv.h);
      const gb = pvBox(96, 104, 560, 330, 3.5, 1.6);
      txt(c2, '[그림 1] P–V 그래프와 기체가 한 일', 24, 30, { size: 22, weight: 600, color: COL.muted });
      pvAxes(c2, gb, { ticks: false, grid: 0.5 });
      c2.strokeStyle = COL.muted; c2.lineWidth = 2; c2.setLineDash([7, 6]);
      c2.beginPath(); c2.moveTo(gb.x, PY(gb, Pv)); c2.lineTo(PX(gb, V1), PY(gb, Pv));
      c2.moveTo(PX(gb, V1), PY(gb, Pv)); c2.lineTo(PX(gb, V1), PY(gb, 0));
      c2.moveTo(PX(gb, V2), PY(gb, Pv)); c2.lineTo(PX(gb, V2), PY(gb, 0)); c2.stroke(); c2.setLineDash([]);
      txt(c2, numbers ? '1.0' : 'P', gb.x - 14, PY(gb, Pv), { size: 24, weight: 700, align: 'right' });
      txt(c2, numbers ? '2.0' : 'V₁', PX(gb, V1), gb.y + gb.h + 24, { size: 24, weight: 700, align: 'center' });
      txt(c2, numbers ? '3.0' : 'V₂', PX(gb, V2), gb.y + gb.h + 24, { size: 24, weight: 700, align: 'center' });
      if (step >= 4) pvArea(c2, gb, [{ V: V1, P: Pv }, { V: V2, P: Pv }], COL.work, false);
      if (step >= 2 && V > V1 + 0.01) {
        pvLine(c2, gb, [{ V: V1, P: Pv }, { V: V, P: Pv }], COL.heat, 6);
        if (PX(gb, V) - PX(gb, V1) > 40) arrow(c2, PX(gb, V) - 34, PY(gb, Pv), PX(gb, V), PY(gb, Pv), { width: 6, color: COL.heat, head: 22 });
      }
      dot(c2, PX(gb, V1), PY(gb, Pv), 9, COL.heat);
      txt(c2, 'A', PX(gb, V1), PY(gb, Pv) - 30, { size: 26, weight: 700, align: 'center', color: COL.heat });
      if (step >= 2 && s >= 1) { dot(c2, PX(gb, V2), PY(gb, Pv), 9, COL.heat); txt(c2, 'B', PX(gb, V2), PY(gb, Pv) - 30, { size: 26, weight: 700, align: 'center', color: COL.heat }); }
      if (step >= 3) {
        const cx = (PX(gb, V1) + PX(gb, V2)) / 2, y = gb.y + gb.h + 24;
        txt(c2, 'ΔV', cx, y, { size: 24, weight: 700, align: 'center', color: COL.work });
        arrow(c2, cx - 26, y, PX(gb, V1) + 24, y, { width: 3, color: COL.work, head: 12 });
        arrow(c2, cx + 26, y, PX(gb, V2) - 24, y, { width: 3, color: COL.work, head: 12 });
      }
      if (step >= 4) {
        const cx = (PX(gb, V1) + PX(gb, V2)) / 2;
        txt(c2, numbers ? 'W = 100 J' : 'W = PΔV', cx, PY(gb, Pv / 2) - 16, { size: 28, weight: 700, color: COL.work, align: 'center' });
        txt(c2, '( 넓이 )', cx, PY(gb, Pv / 2) + 22, { size: 22, color: COL.work, align: 'center' });
      }
    },
  };
}

/* ── 3. 그래프 아래 넓이 ── */
function sceneArea(root) {
  const g = makeCanvas(1100, 900);
  let shape = 'line', dir = 1;
  const shapeBtns = [['line', '곧은 선'], ['curve', '곡선']].map(function (s) {
    return h('button', { class: 'btn', type: 'button', text: s[1], onclick: function () { shape = s[0]; sync(); } });
  });
  const dirBtns = [[1, '팽창 A → B'], [-1, '압축 B → A']].map(function (d) {
    return h('button', { class: 'btn', type: 'button', text: d[1], onclick: function () { dir = d[0]; sync(); } });
  });
  const howOut = h('div', { class: 'callout', style: 'font-size:27px;line-height:1.6' });
  const wOut = h('div', { class: 'eq w', style: 'font-size:46px' }), signOut = h('div', { class: 'callout' });
  /** 넓이(= 일)의 크기. 곧은 선은 사다리꼴, 곡선 P = 3/V 는 300 ln 3 ≈ 330 J */
  const size = function () { return shape === 'line' ? 400 : Math.round(300 * Math.log(3)); };
  function sync() {
    shapeBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(['line', 'curve'][i] === shape)); });
    dirBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String([1, -1][i] === dir)); });
    if (shape === 'line') {
      howOut.replaceChildren(h('b', { text: '그래프 아래는 사다리꼴이다.' }), h('br'),
        '넓이 = (3 + 1) × 2 ÷ 2 = 4', h('br'),
        '→ W = 4 × 100 J = 400 J', h('br'),
        h('span', { style: 'font-size:22px;color:var(--muted)' }, '( 10', h('sup', { text: '5' }), ' Pa × 10', h('sup', { text: '−3' }), ' m', h('sup', { text: '3' }), ' = 100 J 이다 )'));
    } else {
      howOut.replaceChildren(h('b', { text: '곡선이어도 같다.' }), h('br'), '기체가 한 일은 곡선 아래의 넓이이다.');
    }
    setText(wOut, 'W ' + (shape === 'line' ? '=' : '≈') + ' ' + (dir > 0 ? '+' : MINUS) + size() + ' J');
    setText(signOut, dir > 0 ? '부피가 늘었다 → W > 0 : 기체가 바깥에 일을 했다.' : '부피가 줄었다 → W < 0 : 기체가 바깥에서 일을 받았다.');
    signOut.className = 'callout' + (dir > 0 ? ' good' : '');
  }
  root.append(h('div', { class: 'row', style: 'height:100%' },
    h('section', { class: 'panel fix', style: 'padding:0' }, g.c),
    h('section', { class: 'panel col fill pad', style: 'gap:22px' },
      h('p', { class: 'ws sm' }, h('b', { text: '▶ 이 식이 말하는 것 : ' }), '압력이 변하는 과정이라면, 기체가 한 일은 P–V 그래프에서 그래프 아래의 ', blank('3', '③', '넓이'), '로 구한다.'),
      h('div', { class: 'row', style: 'gap:12px' }, shapeBtns),
      howOut,
      h('div', { class: 'row', style: 'gap:12px' }, dirBtns),
      wOut, signOut)));
  sync();
  return {
    tick: function () {
      const P = shape === 'line' ? function (V) { return 4 - V; } : function (V) { return 3 / V; };
      const ctx = g.ctx; ctx.clearRect(0, 0, g.w, g.h);
      const gb = pvBox(110, 84, 900, 700, 4, 4);
      pvAxes(ctx, gb, { grid: 0.5 });
      const pts = []; for (let i = 0; i <= 80; i++) { const V = 1 + 2 * i / 80; pts.push({ V: V, P: P(V) }); }
      // 그래프 아래 넓이 : 팽창은 칠하고, 압축은 빗금
      pvArea(ctx, gb, pts, COL.work, dir < 0);
      ctx.strokeStyle = rgba(COL.work, 0.8); ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
      ctx.beginPath(); ctx.moveTo(PX(gb, 1), PY(gb, 0)); ctx.lineTo(PX(gb, 1), PY(gb, 3)); ctx.moveTo(PX(gb, 3), PY(gb, 0)); ctx.lineTo(PX(gb, 3), PY(gb, 1)); ctx.stroke(); ctx.setLineDash([]);
      pvLine(ctx, gb, pts, COL.heat, 6);
      const mid = dir > 0 ? [pts[44], pts[52]] : [pts[52], pts[44]];
      arrow(ctx, PX(gb, mid[0].V), PY(gb, mid[0].P), PX(gb, mid[1].V), PY(gb, mid[1].P), { width: 6, color: COL.heat, head: 26 });
      dot(ctx, PX(gb, 1), PY(gb, 3), 10, COL.heat); txt(ctx, 'A', PX(gb, 1) - 18, PY(gb, 3) - 26, { size: 30, weight: 700, color: COL.heat });
      dot(ctx, PX(gb, 3), PY(gb, 1), 10, COL.heat); txt(ctx, 'B', PX(gb, 3) + 18, PY(gb, 1) - 26, { size: 30, weight: 700, color: COL.heat });
      txt(ctx, dir > 0 ? 'W > 0' : 'W < 0', PX(gb, 2), PY(gb, 0.5), { size: 40, weight: 700, color: COL.work, align: 'center', halo: true });
      txt(ctx, dir > 0 ? '넓이 = 기체가 한 일' : '넓이 = 기체가 받은 일', PX(gb, 2), PY(gb, 0.5) + 46, { size: 24, weight: 700, color: COL.work, align: 'center', halo: true });
      txt(ctx, '모눈 한 칸 = 0.5 × 0.5 → 25 J', gb.x + gb.w, gb.y - 26, { size: 21, color: COL.muted, align: 'right' });
    },
  };
}

/* ── 4. 열역학 제1법칙 ── */
function band(ctx, x0, a0, b0, x1, a1, b1, color) {
  const xm = (x0 + x1) / 2;
  ctx.beginPath(); ctx.moveTo(x0, a0);
  ctx.bezierCurveTo(xm, a0, xm, a1, x1, a1); ctx.lineTo(x1, b1);
  ctx.bezierCurveTo(xm, b1, xm, b0, x0, b0); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}
function sceneLaw(root) {
  const g = makeCanvas(1000, 860);
  const qIn = h('input', { class: 'big', type: 'range', id: 'law-q', min: 0, max: 500, step: 10, value: 400, 'aria-label': '넣은 열 Q' });
  const wIn = h('input', { class: 'big', type: 'range', id: 'law-w', min: 0, max: 400, step: 10, value: 150, 'aria-label': '기체가 한 일 W' });
  const qOut = h('output', { for: 'law-q' }), wOut = h('output', { for: 'law-w' });
  const nQ = h('span', { class: 'q' }), nU = h('span', { class: 'u' }), nW = h('span', { class: 'w' });
  const dQ = h('span', {}), dW = h('span', {}), dU = h('span', { class: 'u' });
  root.append(h('div', { class: 'row', style: 'height:100%' },
    h('section', { class: 'panel fix', style: 'padding:0' }, g.c),
    h('section', { class: 'panel col fill pad', style: 'gap:18px' },
      h('p', { class: 'ws' }, '• 계에 열 ', h('span', { class: 'q', text: 'Q' }), ' 를 넣으면, 그 열은 내부 에너지를 올리는 데 쓰이거나 외부에 일을 하는 데 쓰인다.'),
      h('div', { class: 'row', style: 'align-items:baseline;gap:34px' },
        h('div', { class: 'eq' }, h('span', { class: 'q', text: 'Q' }), ' = ', h('span', { class: 'u', text: 'ΔU' }), ' + ', h('span', { class: 'w', text: 'W' })),
        h('span', { class: 'hint', style: 'font-size:26px', text: '또는' }),
        h('div', { class: 'eq', style: 'font-size:36px' }, h('span', { class: 'u', text: 'ΔU' }), ' = ', h('span', { class: 'q', text: 'Q' }), ' − ', h('span', { class: 'w', text: 'W' }))),
      h('div', { class: 'slider', style: 'grid-template-columns:200px 1fr auto' }, h('label', { for: 'law-q', class: 'q', text: '넣은 열 Q' }), qIn, qOut),
      h('div', { class: 'slider', style: 'grid-template-columns:200px 1fr auto' }, h('label', { for: 'law-w', class: 'w', text: '기체가 한 일 W' }), wIn, wOut),
      h('div', { class: 'eq-num' }, nQ, ' = ', nU, ' + ', nW),
      h('div', { class: 'eq', style: 'font-size:36px' }, h('span', { class: 'u', text: 'ΔU' }), ' = ', dQ, ' − ', dW, ' = ', dU),
      h('p', { class: 'ws' }, '• 이는 ', blank('4', '④', '에너지 보존'), ' 법칙을 열까지 넓혀 쓴 것이다. 열도 에너지의 한 형태이기 때문이다.'),
      h('table', { class: 't1' },
        h('thead', {}, h('tr', {}, h('th', { text: '부호' }), h('th', { text: '+ 일 때' }), h('th', { text: '− 일 때' }))),
        h('tbody', {},
          h('tr', {}, h('td', { class: 'pname q', text: 'Q' }), h('td', { text: '열을 받는다' }), h('td', { text: '열을 내보낸다' })),
          h('tr', {}, h('td', { class: 'pname w', text: 'W' }), h('td', { text: '팽창 : 일을 한다' }), h('td', { text: '압축 : 일을 받는다' })),
          h('tr', {}, h('td', { class: 'pname u', text: 'ΔU' }), h('td', { text: '온도가 오른다' }), h('td', { text: '온도가 내려간다' })))))));
  const geo = { x0: 210, yTop: 120, H: 200, kx: 110, wall: 12 };
  const ps = makeGas(48, { x: geo.x0, y: geo.yTop, w: 2 * geo.kx, h: geo.H });
  return {
    tick: function (dt, now) {
      const Q = +qIn.value;
      if (+wIn.max !== Q) wIn.max = String(Q);
      const W = Math.min(+wIn.value, Q), U = Q - W;
      setText(qOut, Q + ' J'); setText(wOut, W + ' J');
      setText(nQ, Q + ' J'); setText(nU, U + ' J'); setText(nW, W + ' J');
      setText(dQ, String(Q)); setText(dW, String(W)); setText(dU, U + ' J');
      const T = 300 + U * 0.5, V = 2 + W / 250;
      const ctx = g.ctx; ctx.clearRect(0, 0, g.w, g.h);
      txt(ctx, '넣은 열은 사라지지 않고 둘로 나뉜다', 40, 40, { size: 30, weight: 700 });
      stepGas(ps, { x: geo.x0, y: geo.yTop, w: V * geo.kx, h: geo.H }, dt, gasSpeed(T), 7);
      const r = drawCylinder(ctx, { P: 1, V: V, T: T }, ps, { geo: geo, mode: 'plain', heat: Q > 0 ? 1 : 0, t: now, moving: Q > 0, burner: true, tubeV: 4.2, rod: 100 });
      thermometer(ctx, 74, 112, 392, T, { init: 300, initSide: 'right', title: '온도', label: false });
      if (W > 0) {
        const y = geo.yTop + geo.H / 2;
        arrow(ctx, r.rodEnd + 10, y, r.rodEnd + 130, y, { width: 10, color: COL.work, head: 30 });
        txt(ctx, '피스톤을 민다', r.rodEnd + 70, y - 40, { size: 22, weight: 700, color: COL.work, align: 'center' });
      }
      // 에너지 흐름 띠 : 굵기 = 에너지의 양
      txt(ctx, '에너지 흐름 (띠의 굵기 = 에너지의 양)', 40, 452, { size: 22, weight: 600, color: COL.muted });
      const k = 0.6, yc = 676, xL0 = 210, xL1 = 262, xR0 = 600, xR1 = 652;
      const hq = Q * k, hu = U * k, hw = W * k, gap = (hu > 0.5 && hw > 0.5) ? 24 : 0;
      const qTop = yc - hq / 2, rTop = yc - (hq + gap) / 2;
      if (hq > 0.5) {
        ctx.fillStyle = COL.heat; ctx.fillRect(xL0, qTop, xL1 - xL0, hq);
        if (hu > 0.5) band(ctx, xL1, qTop, qTop + hu, xR0, rTop, rTop + hu, rgba(COL.energy, 0.45));
        if (hw > 0.5) band(ctx, xL1, qTop + hu, qTop + hq, xR0, rTop + hu + gap, rTop + hu + gap + hw, rgba(COL.work, 0.45));
        if (hu > 0.5) { ctx.fillStyle = COL.energy; ctx.fillRect(xR0, rTop, xR1 - xR0, hu); }
        if (hw > 0.5) { ctx.fillStyle = COL.work; ctx.fillRect(xR0, rTop + hu + gap, xR1 - xR0, hw); }
      }
      txt(ctx, 'Q', xL0 - 18, yc - 22, { size: 40, weight: 700, color: COL.heat, align: 'right', mono: true });
      txt(ctx, Q + ' J', xL0 - 18, yc + 20, { size: 28, weight: 700, color: COL.heat, align: 'right', mono: true });
      txt(ctx, '넣은 열', xL0 - 18, yc + 56, { size: 22, color: COL.muted, align: 'right' });
      let yU = rTop + hu / 2, yW = rTop + hu + gap + hw / 2;
      if (yW - yU < 96) { const m = (yU + yW) / 2; yU = m - 48; yW = m + 48; }
      txt(ctx, 'ΔU ' + U + ' J', xR1 + 18, yU - 14, { size: 30, weight: 700, color: COL.energy, mono: true });
      txt(ctx, U > 0 ? '내부 에너지 증가 → 온도 상승' : '내부 에너지 그대로 → 온도 그대로', xR1 + 18, yU + 20, { size: 21, color: COL.muted });
      txt(ctx, 'W ' + W + ' J', xR1 + 18, yW - 14, { size: 30, weight: 700, color: COL.work, mono: true });
      txt(ctx, W > 0 ? '바깥에 한 일 (피스톤을 민다)' : '바깥에 한 일 없음', xR1 + 18, yW + 20, { size: 21, color: COL.muted });
    },
  };
}

/* ── 이어서 생각하기 : 단열 과정(열 없이도 온도가 변함)을 거꾸로 뒤집어 열이 드나드는 과정으로 넘어간다 ── */
function sceneThink(root) {
  const yes = h('button', { class: 'btn choice', type: 'button', 'aria-pressed': 'false', text: '그렇다' });
  const no = h('button', { class: 'btn choice', type: 'button', 'aria-pressed': 'false', text: '아니다' });
  [yes, no].forEach(function (b, i) { b.addEventListener('click', function () { yes.setAttribute('aria-pressed', String(i === 0)); no.setAttribute('aria-pressed', String(i === 1)); }); });
  const go6 = function (k) { return function () { PROC_REQ = k; goId(k === 'adiabatic' ? 'adia' : 'proc'); }; };
  const pump = makeCanvas(330, 380);
  root.append(h('div', { class: 'col', style: 'height:100%;gap:24px' },
    h('section', { class: 'panel col', style: 'padding:36px 56px;gap:26px' },
      h('p', { class: 'cap', text: '이어서 생각하기' }),
      h('p', { class: 'big-q', text: '열을 넣으면 온도는 반드시 올라갈까?' }),
      h('div', { class: 'row', style: 'gap:24px' }, yes, no),
      h('p', { class: 'hint', style: 'font-size:26px', text: '골라 보고, 이어지는 등압 · 등적 · 등온 과정에서 확인하자.' })),
    h('div', { class: 'row', style: 'gap:24px;flex:1;min-height:0' },
      h('section', { class: 'panel row fill', style: 'padding:22px 26px 22px 30px;gap:16px;align-items:center' },
        h('div', { class: 'col fill', style: 'gap:16px' },
          h('p', { class: 'cap', text: '앞에서 본 단열 과정' }),
          h('p', { class: 'ws', style: 'font-size:34px;font-weight:600' }, '자전거 펌프를 빠르게 누르면, 열을 넣지 않아도 뜨거워졌다.'),
          h('p', { class: 'ws', style: 'font-size:34px;font-weight:700;color:var(--pen)' }, '거꾸로, 열을 넣어도 온도가 그대로일 수 있을까?')),
        h('div', { class: 'fix' }, pump.c)),
      h('section', { class: 'panel col fill pad', style: 'gap:14px' },
        h('p', { class: 'cap', text: '제1법칙 다시 보기' }),
        h('div', { class: 'eq', style: 'font-size:52px' }, h('span', { class: 'q', text: 'Q' }), ' = ', h('span', { class: 'u', text: 'ΔU' }), ' + ', h('span', { class: 'w', text: 'W' })),
        h('div', { class: 'col', style: 'gap:4px;font-size:28px' },
          h('div', {}, h('span', { class: 'q mono', text: 'Q > 0' }), ' : 열을 받는다'),
          h('div', {}, h('span', { class: 'w mono', text: 'W > 0' }), ' : 부피가 늘어난다 (팽창)'),
          h('div', {}, h('span', { class: 'u mono', text: 'ΔU > 0' }), ' : 온도가 올라간다')),
        h('p', { class: 'ws', style: 'font-size:28px' }, '이어서 볼 과정 : 누르면 바로 시뮬레이터로 갑니다.'),
        h('div', { class: 'row', style: 'gap:12px;flex-wrap:wrap' }, ORDER.map(function (k) { return h('button', { class: 'btn', type: 'button', text: PROCS[k].name, onclick: go6(k) }); }))))));
  const pumpTick = makePump(pump, 1);
  return { tick: function (dt) { pumpTick(dt); } };
}

/** 자전거 펌프 : 빠르게 누르고(0.5초) 잠시 멈췄다가 천천히 돌아온다. 열 출입 없이 부피만 바뀐다 (단열 압축).
    그림은 330×380 기준이고 s 배로 줄여 그린다 */
function makePump(cv, s) {
  const BX = 60, BW = 110, BOT = 330, TOPY = 120, LOWY = 214;
  const ps = makeGas(26, { x: BX, y: TOPY + 14, w: BW, h: BOT - TOPY - 14 });
  let ph = 0;
  return function (dt) {
    ph = (ph + dt) % 3.4;
    let u;
    if (ph < 0.45) u = ph / 0.45; else if (ph < 1.6) u = 1; else if (ph < 3.0) u = 1 - (ph - 1.6) / 1.4; else u = 0;
    const yp = TOPY + (LOWY - TOPY) * u;
    const T = 300 * Math.pow((BOT - TOPY - 14) / (BOT - yp - 14), 2 / 3);
    const c = cv.ctx; c.clearRect(0, 0, cv.w, cv.h);
    c.save(); c.scale(s, s);
    const gasBox = { x: BX, y: yp + 14, w: BW, h: BOT - yp - 14 };
    stepGas(ps, gasBox, dt, gasSpeed(T), 6);
    c.fillStyle = rgba(tempColor(T), 0.16); c.fillRect(gasBox.x, gasBox.y, gasBox.w, gasBox.h);
    drawGas(c, ps, T, 6);
    c.fillStyle = COL['ink-2'];
    c.fillRect(BX - 10, 60, 10, BOT - 50); c.fillRect(BX + BW, 60, 10, BOT - 50); c.fillRect(BX - 10, BOT, BW + 20, 10);
    c.fillStyle = COL.ink; c.fillRect(BX, yp, BW, 14);
    c.fillRect(BX + BW / 2 - 6, yp - 76, 12, 76);
    rrect(c, BX - 40, yp - 96, BW + 80, 22, 8); c.fill();
    if (u > 0.02 && ph < 0.6) arrow(c, BX + BW + 60, yp - 110, BX + BW + 60, yp - 50, { width: 6, color: COL['ink-2'], head: 20 });
    txt(c, '빠르게 누른다', BX + BW / 2, BOT + 30, { size: 22, weight: 600, align: 'center', color: COL.muted });
    if (T > 360) txt(c, '뜨거워진다!', BX + BW + 22, (yp + BOT) / 2, { size: 22, weight: 700, color: COL.heat });
    c.restore();
  };
}

/* ── 6. 네 가지 과정 : 시뮬레이터 ── */
const T1 = {
  isobaric: { W: 'P ΔV', dU: '온도 변화에 비례', law: 'Q = ΔU + PΔV' },
  isochoric: { W: ['5', '⑤', '0'], dU: 'Q 와 같다', law: 'Q = ΔU' },
  isothermal: { W: 'Q 와 같다', dU: ['6', '⑥', '0'], law: 'Q = W' },
  adiabatic: { W: '−ΔU', dU: '−W', law: ['7', '⑦', '0', ' = ΔU + W'] },
};
function t1Cell(v) {
  if (!Array.isArray(v)) return v;
  return [blank(v[0], v[1], v[2]), v[3] || ''];
}
function t1Row(k, cur) {
  const r = T1[k];
  return h('tr', { class: cur ? 'cur' : null }, h('td', { class: 'pname', text: PROCS[k].name }), h('td', { text: PROCS[k].keep }), h('td', {}, t1Cell(r.W)), h('td', {}, t1Cell(r.dU)), h('td', {}, t1Cell(r.law)));
}
function t1Head() { return h('thead', {}, h('tr', {}, ['과정', '일정한 양', '기체가 한 일 W', '내부 에너지 ΔU', '제1법칙'].map(function (s) { return h('th', { text: s }); }))); }
function lawEq(el) {
  el.replaceChildren(h('span', { class: 'q', text: 'Q' }), ' = ', h('span', { class: 'u', text: 'ΔU' }), ' + ', h('span', { class: 'w', text: 'W' }));
}

function sceneProc(root, initial) {
  let kind = PROC_REQ || initial || 'isobaric', dir = 0, s = 0, playing = false, iso = false;
  PROC_REQ = null;
  const cyl = makeCanvas(940, 600), pv = makeCanvas(860, 352), bars = makeCanvas(860, 150);
  const tabs = ORDER.map(function (k) {
    return h('button', { class: 'tab', type: 'button', role: 'tab', onclick: function () { kind = k; dir = 0; s = 0; playing = false; sync(); } }, h('b', { text: PROCS[k].name }), h('span', { text: '일정 : ' + PROCS[k].keep }));
  });
  const strip = h('table', { class: 't1' });
  const dirBtns = [0, 1].map(function (d) { return h('button', { class: 'btn', type: 'button', onclick: function () { dir = d; s = 0; playing = true; sync(); } }); });
  const play = h('button', { class: 'btn primary', type: 'button', style: 'min-width:150px', onclick: function () { if (s >= 1) s = 0; playing = !playing; sync(); } });
  const reset = h('button', { class: 'btn', type: 'button', text: '처음 상태', onclick: function () { s = 0; playing = false; sync(); } });
  const isoBtn = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false', text: '등온선 보기', onclick: function () { iso = !iso; isoBtn.setAttribute('aria-pressed', String(iso)); } });
  const prog = h('input', { class: 'big', type: 'range', id: 'proc-s', min: 0, max: 1000, step: 1, value: 0, 'aria-label': '과정 진행' });
  prog.addEventListener('input', function () { s = +prog.value / 1000; playing = false; sync(); });
  const eqTop = h('div', { class: 'eq', style: 'font-size:38px' });
  const eqNum = h('div', { class: 'eq-num' });
  lawEq(eqTop);
  const ps = makeGas(54, { x: CYL.x0, y: CYL.yTop, w: 2 * CYL.kx, h: CYL.H });
  root.append(h('div', { class: 'col', style: 'height:100%;gap:14px' },
    h('div', { class: 'tabs', role: 'tablist' }, tabs),
    strip,
    h('div', { class: 'row', style: 'gap:18px' },
      h('section', { class: 'panel fix', style: 'padding:0' }, cyl.c),
      h('div', { class: 'col fill', style: 'gap:14px' },
        h('section', { class: 'panel', style: 'padding:0;position:relative' }, pv.c, h('div', { style: 'position:absolute;right:12px;top:10px' }, isoBtn)),
        h('section', { class: 'panel col', style: 'padding:8px 0 8px;gap:0' }, bars.c,
          h('div', { class: 'row', style: 'padding:0 18px;align-items:baseline;gap:24px;justify-content:space-between' }, eqTop, eqNum)))),
    h('div', { class: 'ctrl' }, dirBtns, play, h('div', { class: 'fill' }, prog), reset)));
  function sync() {
    tabs.forEach(function (t, i) { t.setAttribute('aria-selected', String(ORDER[i] === kind)); });
    strip.replaceChildren(t1Head(), h('tbody', {}, t1Row(kind, true)));
    PROCS[kind].dirs.forEach(function (d, i) { dirBtns[i].textContent = d.label; dirBtns[i].setAttribute('aria-pressed', String(i === dir)); });
    play.textContent = playing ? '멈춤' : (s >= 1 ? '다시 보기' : '재생');
    prog.value = String(Math.round(s * 1000));
  }
  sync();
  return {
    annoKey: function () { return 'proc:' + kind; },   // 필기는 과정 탭마다 따로
    tick: function (dt, now) {
      if (playing) { s = Math.min(1, s + dt / 4.5); prog.value = String(Math.round(s * 1000)); if (s >= 1) { playing = false; sync(); } }
      const end = PROCS[kind].dirs[dir].end;
      const st = stateAt(kind, end, s), fin = stateAt(kind, end, 1);
      const heat = kind === 'adiabatic' ? 0 : (s > 0.002 ? Math.sign(fin.Q) : 0);
      // 실린더와 계기
      const c = cyl.ctx; c.clearRect(0, 0, cyl.w, cyl.h);
      stepGas(ps, { x: CYL.x0, y: CYL.yTop, w: pistonX(st.V) - CYL.x0, h: CYL.H }, dt, gasSpeed(st.T), 7);
      drawCylinder(c, st, ps, { mode: kind, heat: heat, t: now, moving: playing, burner: true, burnerOn: fin.Q >= 0 });
      drawGauge(c, st.P, kind === 'isobaric');
      drawThermo(c, st.T, kind === 'isothermal');
      txtU(c, 'V = ' + st.V.toFixed(2), UNIT_V, CYL.x0 - 10, 566, { size: 26, weight: 700 });
      if (kind === 'isochoric') pill(c, '부피 일정', CYL.x0 + 360, 566, COL.pen, { size: 20 });
      if (Math.abs(st.W) > 0.5) txt(c, st.W > 0 ? 'W > 0 : 기체가 일을 한다' : 'W < 0 : 기체가 일을 받는다', 920, 130, { size: 22, weight: 700, color: COL.work, align: 'right' });
      // P–V 그래프
      const p = pv.ctx; p.clearRect(0, 0, pv.w, pv.h);
      const gb = pvBox(84, 42, 700, 240, 4.5, 3.5);
      pvAxes(p, gb, { grid: 0.5 });
      if (iso) {
        // 등온선 : 처음 온도(300 K)와 지금 온도. 이름표가 겹치지 않게 위아래로 띄운다
        const temps = [S0.T];
        if (Math.abs(st.T - S0.T) >= 1) temps.push(st.T);
        const labels = [];
        temps.forEach(function (Tk, i) {
          const c0 = S0.P * S0.V * Tk / S0.T, pts = [];
          for (let V = 0.4; V <= 4.5001; V += 0.05) { const P = c0 / V; if (P <= 3.5) pts.push({ V: V, P: P }); }
          pvLine(p, gb, pts, i ? tempColor(st.T) : COL.muted, 3, [8, 7]);
          labels.push({ T: Tk, y: PY(gb, c0 / 4.5) - 14 });
        });
        if (labels.length === 2 && Math.abs(labels[0].y - labels[1].y) < 22) {
          const hi = labels[0].T > labels[1].T ? labels[0] : labels[1], lo = hi === labels[0] ? labels[1] : labels[0];
          hi.y = Math.min(hi.y, lo.y - 22);
        }
        labels.forEach(function (l) { txt(p, Math.round(l.T) + ' K', PX(gb, 4.5) - 2, l.y, { size: 18, color: COL.muted, align: 'right', mono: true, halo: true }); });
      }
      const path = pathOf(kind, end, s);
      if (kind !== 'isochoric') pvArea(p, gb, path, COL.work, end < S0.V);
      pvLine(p, gb, path, COL.heat, 6);
      dot(p, PX(gb, S0.V), PY(gb, S0.P), 8, COL.muted);
      // '처음' 이름표 : 팽창이면 왼쪽 위, 압축·등적이면 오른쪽 아래
      if (kind !== 'isochoric' && end > S0.V) txt(p, '처음', PX(gb, S0.V) - 12, PY(gb, S0.P) - 20, { size: 20, color: COL.muted, align: 'right' });
      else txt(p, '처음', PX(gb, S0.V) + 14, PY(gb, S0.P) + 22, { size: 20, color: COL.muted });
      dot(p, PX(gb, st.V), PY(gb, st.P), 11, COL.heat);
      if (kind === 'isochoric' && s > 0.05) txt(p, '부피가 그대로 → 넓이 0 → W = 0', PX(gb, S0.V) + 24, PY(gb, Math.max(st.P, S0.P)) + (fin.P > S0.P ? 0 : -30), { size: 22, weight: 700, color: COL.work, halo: true });
      else if (Math.abs(st.W) > 5) txt(p, 'W = 넓이', (PX(gb, S0.V) + PX(gb, st.V)) / 2, PY(gb, Math.min(S0.P, st.P) / 2), { size: 22, weight: 700, color: COL.work, align: 'center', halo: true });
      // 막대와 식
      const b = bars.ctx; b.clearRect(0, 0, bars.w, bars.h);
      energyBars(b, bars.w, bars.h, st, 520, { labelW: 290, valueW: 140 });
      setText(eqNum, num(st.Q) + ' J = ' + term(st.dU) + ' + ' + term(st.W));
    },
  };
}

/* ── 7. 표 1 정리 ── */
function sceneTable(root) {
  const m = makeCanvas(820, 380);
  const tbl = h('table', { class: 't1 big' }, t1Head(), h('tbody', {}, ORDER.map(function (k) {
    const row = t1Row(k, false);
    row.append(h('td', {}, h('button', { class: 'btn small', type: 'button', text: '움직여 보기', onclick: function () { PROC_REQ = k; goId(k === 'adiabatic' ? 'adia' : 'proc'); } })));
    return row;
  })));
  tbl.querySelector('thead tr').append(h('th', { style: 'width:190px', text: '' }));
  root.append(h('div', { class: 'col', style: 'height:100%;gap:20px' },
    h('section', { class: 'panel col', style: 'padding:18px 24px;gap:10px' }, h('p', { class: 'cap', text: '[표 1] 이상 기체의 네 가지 과정' }), tbl,
      h('p', { class: 'hint', style: 'font-size:25px' }, '※ 등온 과정에서 ΔU = 0 인 것은 이상 기체의 내부 에너지가 온도에만 관계되기 때문이다.')),
    h('div', { class: 'row', style: 'gap:20px;flex:1;min-height:0' },
      h('section', { class: 'panel col fill pad', style: 'gap:14px' },
        h('p', { class: 'ws sm' }, '• 단열 팽창하면 기체가 일을 한 만큼 내부 에너지가 줄어 온도가 ', blank('8', '⑧', '내려간다'), '.'),
        h('p', { class: 'ws sm' }, '산을 타고 ', h('b', { text: '올라가는' }), ' 공기가 차가워지는 것도 같은 원리이다.'),
        h('p', { class: 'hint', style: 'font-size:24px' }, '높이 올라갈수록 기압이 낮아 공기가 단열 팽창한다 → 차가워져 구름이 생긴다. 산을 넘어 내려오는 공기는 단열 압축되어 따뜻해진다 (높새바람).')),
      h('section', { class: 'panel fix', style: 'padding:0' }, m.c))));
  return {
    tick: function (dt, now) {
      const c = m.ctx; c.clearRect(0, 0, m.w, m.h);
      drawMountain(c, now);
    },
  };
}
/** 산을 넘는 공기 (820×380 기준) : 오를 때 단열 팽창으로 식고, 내려올 때 단열 압축으로 데워진다 */
function drawMountain(c, now) {
  // 산
  c.fillStyle = rgba(COL.good, 0.2); c.beginPath(); c.moveTo(40, 350); c.lineTo(410, 150); c.lineTo(780, 350); c.closePath(); c.fill();
  c.strokeStyle = rgba(COL.good, 0.8); c.lineWidth = 3; c.stroke();
  // 구름 (바람이 올라가는 쪽)
  c.fillStyle = rgba(COL.muted, 0.35);
  [[300, 158, 26], [338, 140, 32], [378, 132, 24], [268, 172, 18]].forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, Math.PI * 2); c.fill(); });
  // 공기 덩어리의 길
  c.strokeStyle = rgba(COL.muted, 0.7); c.lineWidth = 3; c.setLineDash([10, 8]);
  c.beginPath(); c.moveTo(90, 302); c.lineTo(410, 120); c.lineTo(730, 302); c.stroke(); c.setLineDash([]);
  arrow(c, 700, 285, 736, 306, { width: 3, color: COL.muted, head: 16 });
  const u = (now * 0.12) % 1;
  const p = u < 0.5 ? { x: 90 + 640 * u, y: 302 - 364 * u } : { x: 410 + 640 * (u - 0.5), y: 120 + 364 * (u - 0.5) };
  const tc = u < 0.5 ? 0.5 * (1 - u / 0.5) : 0.9 * ((u - 0.5) / 0.5);
  dot(c, p.x, p.y, 16, mix(COL.cold, COL.heat, tc));
  txt(c, '올라갈 때 : 단열 팽창', 20, 30, { size: 22, weight: 700, color: COL.cold });
  txt(c, '→ 차가워진다', 20, 60, { size: 22, weight: 700, color: COL.cold });
  txt(c, '내려올 때 : 단열 압축', 800, 30, { size: 22, weight: 700, color: COL.heat, align: 'right' });
  txt(c, '따뜻해진다 ←', 800, 60, { size: 22, weight: 700, color: COL.heat, align: 'right' });
}

/* ── 주의 1 · 주의 2 : 한 화면에 하나씩. 주의 2 는 단열 과정 바로 뒤, 주의 1 은 표 1 정리 뒤에 나온다 ── */
function sceneMis(root, which) {
  let dir = which === 1 ? 1 : 0, s = 0, playing = true;
  const cyl = makeCanvas(940, 530);
  const eqTop = h('div', { class: 'eq', style: 'font-size:38px' }), eqNum = h('div', { class: 'eq-num' });
  lawEq(eqTop);
  const textBox = h('div', { class: 'col', style: 'gap:0' });
  const dirBox = h('div', { class: 'seg' });
  const playBtn = h('button', { class: 'btn primary', type: 'button', style: 'min-width:150px', onclick: function () { if (s >= 1) s = 0; playing = !playing; setText(playBtn, playing ? '멈춤' : '재생'); } });
  const CARDS = [
    { q: '열을 넣으면 온도는 반드시 올라간다?', kind: 'isothermal',
      wrong: 'Q 를 넣었으니 ΔU 가 커지고 온도도 오를 것이다.', why: '들어간 열의 일부 또는 전부가 외부에 일을 하는 데 쓰일 수 있다.',
      right: '등온 과정에서는 열을 넣어도 온도가 그대로다. 넣은 열이 전부 일로 나갔기 때문이다.' },
    { q: '단열이니까 온도도 변하지 않는다?', kind: 'adiabatic',
      wrong: '열이 드나들지 않으면 온도가 그대로일 것이다.', why: '온도를 바꾸는 방법은 열 말고도 있다. 기체가 일을 하거나 일을 받으면 내부 에너지가 변한다.',
      right: '단열 팽창은 온도를 내리고, 단열 압축은 온도를 올린다. 자전거 펌프가 뜨거워지는 것이 단열 압축이다.' },
  ];
  const lines = [];
  function render() {
    const cd = CARDS[which];
    textBox.replaceChildren();
    lines.length = 0;
    textBox.append(h('p', { class: 'cap', style: 'margin-bottom:6px', text: '주의 ' + (which + 1) }), h('p', { class: 'big-q', style: 'font-size:48px;margin-bottom:18px', text: cd.q }));
    [['틀린 생각', cd.wrong], ['왜 틀렸나', cd.why], ['올바른 이해', cd.right]].forEach(function (pair, i) {
      const line = h('div', { class: 'mis-line' + (i === 0 ? ' on' : '') }, h('b', { text: pair[0] }), h('span', { class: 'body', text: pair[1] }));
      lines.push(line); textBox.append(line);
    });
    textBox.append(h('div', { class: 'row', style: 'margin-top:12px;gap:14px' },
      h('button', { class: 'btn', type: 'button', text: '다음 줄 보기', onclick: function () { const n = lines.filter(function (l) { return l.classList.contains('on'); }).length; if (n < lines.length) lines[n].classList.add('on'); } }),
      h('button', { class: 'btn', type: 'button', text: '다시 가리기', onclick: function () { lines.forEach(function (l, i) { l.classList.toggle('on', i === 0); }); } })));
    dirBox.replaceChildren();
    PROCS[cd.kind].dirs.forEach(function (d, i) { dirBox.append(h('button', { class: 'btn', type: 'button', 'aria-pressed': String(i === dir), text: d.label, onclick: function () { dir = i; s = 0; playing = true; render(); } })); });
    setText(playBtn, playing ? '멈춤' : '재생');
  }
  const ps = makeGas(54, { x: CYL.x0, y: CYL.yTop, w: 2 * CYL.kx, h: CYL.H });
  root.append(h('div', { class: 'row', style: 'height:100%;gap:20px' },
    h('section', { class: 'panel pad fill' }, textBox),
    h('section', { class: 'panel col fix', style: 'padding:0;gap:4px;justify-content:center' }, cyl.c,
      h('div', { class: 'row', style: 'padding:0 20px;align-items:baseline;justify-content:space-between' }, eqTop, eqNum),
      h('div', { class: 'ctrl', style: 'padding:6px 20px 16px' }, dirBox, playBtn))));
  render();
  return {
    annoKey: function () { return 'mis:' + which; },
    tick: function (dt, now) {
      const cd = CARDS[which];
      if (playing) { s += dt / 4; if (s > 1.35) s = 0; }
      const sv = Math.min(1, s);
      const end = PROCS[cd.kind].dirs[dir].end;
      const st = stateAt(cd.kind, end, sv), fin = stateAt(cd.kind, end, 1);
      const c = cyl.ctx; c.clearRect(0, 0, cyl.w, cyl.h);
      stepGas(ps, { x: CYL.x0, y: CYL.yTop, w: pistonX(st.V) - CYL.x0, h: CYL.H }, dt, gasSpeed(st.T), 7);
      drawCylinder(c, st, ps, { mode: cd.kind, heat: cd.kind === 'adiabatic' || sv < 0.002 ? 0 : Math.sign(fin.Q), t: now, moving: playing && s < 1 });
      drawThermo(c, st.T, cd.kind === 'isothermal');
      const head = cd.kind === 'isothermal' ? (dir === 0 ? '열을 넣으면서 천천히 팽창' : '열을 내보내면서 천천히 압축') : (dir === 1 ? '자전거 펌프를 누를 때처럼 압축' : '산을 오르는 공기처럼 팽창');
      txt(c, head, 210, 60, { size: 28, weight: 700 });
      setText(eqNum, num(st.Q) + ' J = ' + term(st.dU) + ' + ' + term(st.W));
    },
  };
}

/* ── 9. 예제 ── */
function sceneEx(root) {
  const cyl = makeCanvas(940, 560), cmp = makeCanvas(900, 170);
  let s = 0, playing = false, showCmp = false;
  const base = { P: 2, V: 2, T: 300 };
  const play = h('button', { class: 'btn primary', type: 'button', style: 'min-width:170px', text: '가열하기', onclick: function () { if (s >= 1) s = 0; playing = true; } });
  const reset = h('button', { class: 'btn', type: 'button', text: '처음 상태', onclick: function () { s = 0; playing = false; } });
  const cmpBtn = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false', text: '비교해 보기', onclick: function () { showCmp = !showCmp; cmpBtn.setAttribute('aria-pressed', String(showCmp)); } });
  const sup = function (t) { return h('sup', { text: t }); };
  root.append(h('div', { class: 'row', style: 'height:100%;gap:20px' },
    h('section', { class: 'panel col fix', style: 'padding:0;gap:0' },
      cyl.c,
      h('div', { class: 'ctrl', style: 'padding:4px 22px 12px' }, play, reset),
      h('div', { class: 'col', style: 'padding:10px 20px 12px;gap:4px;border-top:2px solid var(--line)' },
        h('div', { class: 'row', style: 'align-items:center;justify-content:space-between;gap:12px' },
          h('p', { class: 'cap', text: '생각 더하기 : 같은 500 J 인데, 어느 쪽 온도가 더 많이 올랐을까?' }), cmpBtn),
        cmp.c)),
    h('section', { class: 'panel col fill pad', style: 'gap:14px' },
      h('p', { class: 'ws', style: 'font-weight:600' }, '압력이 2 × 10', sup('5'), ' Pa 로 일정한 상태에서 이상 기체에 500 J 의 열을 가했더니 부피가 1 × 10', sup('−3'), ' m', sup('3'), ' 늘어났다.'),
      h('p', { class: 'ws' }, '(1) 기체가 한 일 　W = P ΔV = 2 × 10', sup('5'), ' × 1 × 10', sup('−3'), ' = ', blank('9', '⑨', '200'), ' J'),
      h('p', { class: 'ws' }, '(2) 내부 에너지 변화 　ΔU = Q − W = 500 − (1)의 값 = ', blank('ex2', '(2)', '300'), ' J'),
      h('p', { class: 'ws' }, '(3) 온도는 ', blank('10', '⑩', '올라간다'), '. ΔU 가 0보다 크기 때문이다.'),
      h('p', { class: 'ws' }, '(4) 같은 기체를 부피를 고정한 채 500 J 로 가열하면 　W = 0 이므로 ΔU = ', blank('11', '⑪', '500'), ' J'),
      h('p', { class: 'hint', style: 'margin-top:auto;font-size:24px' }, '※ 단위 : Pa × m', sup('3'), ' = (N/m', sup('2'), ') × m', sup('3'), ' = N·m = J'))));
  const ps = makeGas(54, { x: CYL.x0, y: CYL.yTop, w: 2 * CYL.kx, h: CYL.H });
  return {
    tick: function (dt, now) {
      if (playing) { s = Math.min(1, s + dt / 4); if (s >= 1) playing = false; }
      const st = stateAt('isobaric', 3, s, base);
      const c = cyl.ctx; c.clearRect(0, 0, cyl.w, cyl.h);
      stepGas(ps, { x: CYL.x0, y: CYL.yTop, w: pistonX(st.V) - CYL.x0, h: CYL.H }, dt, gasSpeed(st.T), 7);
      drawCylinder(c, st, ps, { mode: 'isobaric', heat: s > 0.002 ? 1 : 0, t: now, moving: playing, burner: true });
      drawGauge(c, st.P, true);
      drawThermo(c, st.T, false);
      txt(c, '처음 온도를 300 K 로 두고 그렸다', 920, 26, { size: 20, color: COL.muted, align: 'right' });
      txtU(c, 'ΔV = ' + (st.V - 2).toFixed(2), UNIT_V, CYL.x0, 506, { size: 26, weight: 700, color: COL.work });
      txt(c, 'Q = ' + Math.round(st.Q) + ' J', CYL.x0, 542, { size: 26, weight: 700, color: COL.heat, mono: true });
      txt(c, 'W = ' + Math.round(st.W) + ' J', CYL.x0 + 230, 542, { size: 26, weight: 700, color: COL.work, mono: true });
      txt(c, 'ΔU = ' + Math.round(st.dU) + ' J', CYL.x0 + 460, 542, { size: 26, weight: 700, color: COL.energy, mono: true });
      // 생각 더하기 : 같은 500 J, 압력 일정 vs 부피 고정 ((4)를 푼 뒤에 연다)
      const k = cmp.ctx; k.clearRect(0, 0, cmp.w, cmp.h);
      if (!showCmp) { txt(k, '(4)를 푼 뒤 [비교해 보기]를 누르세요.', cmp.w / 2, cmp.h / 2, { size: 24, color: COL.muted, align: 'center' }); return; }
      const rowsC = [{ name: '압력 일정 (등압)', dU: 300, W: 200, T: 450 }, { name: '부피 고정 (등적)', dU: 500, W: 0, T: 550 }];
      const sc = 0.7, x0 = 250;
      rowsC.forEach(function (r, i) {
        const y = 30 + i * 62;
        txt(k, r.name, 0, y, { size: 24, weight: 700 });
        k.fillStyle = COL.energy; rrect(k, x0, y - 22, r.dU * sc, 44, 6); k.fill();
        if (r.W) { k.fillStyle = COL.work; rrect(k, x0 + r.dU * sc + 4, y - 22, r.W * sc, 44, 6); k.fill(); }
        txt(k, 'ΔU ' + r.dU, x0 + 12, y + 1, { size: 22, weight: 700, color: COL.panel, mono: true });
        if (r.W) txt(k, 'W ' + r.W, x0 + r.dU * sc + 16, y + 1, { size: 22, weight: 700, color: COL.panel, mono: true });
        txt(k, '→ ' + r.T + ' K', cmp.w - 4, y, { size: 26, weight: 700, align: 'right', mono: true, color: COL.heat });
      });
      txt(k, '일로 나간 에너지가 없으면 ΔU 가 더 커서 온도가 더 많이 오른다.', 0, 150, { size: 22, color: COL.muted });
    },
  };
}

/* ── 10. 한눈에 비교 (선택) ── */
function sceneCompare(root) {
  const g = makeCanvas(1060, 900);
  let focus = 'isobaric';
  const colOf = function (k) { return { isobaric: COL.heat, isothermal: COL.cold, adiabatic: COL.energy, isochoric: COL['ink-2'] }[k]; };
  const ends = { isobaric: 4, isothermal: 4, adiabatic: 4, isochoric: 2 };
  const tbody = h('tbody', {});
  const btns = ORDER.map(function (k) {
    return h('button', { class: 'btn small', type: 'button', text: PROCS[k].name, onclick: function () { focus = k; sync(); } });
  });
  function sync() { btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(ORDER[i] === focus)); }); }
  ORDER.forEach(function (k) {
    const f = stateAt(k, ends[k], 1);
    tbody.append(h('tr', {}, h('td', { class: 'pname', text: PROCS[k].name }), h('td', { class: 'mono', text: sgn(f.W) }), h('td', { class: 'mono', text: sgn(f.dU) }), h('td', { class: 'mono', text: sgn(f.Q) }), h('td', { class: 'mono', text: Math.round(f.T) + ' K' })));
  });
  root.append(h('div', { class: 'row', style: 'height:100%' },
    h('section', { class: 'panel fix', style: 'padding:0' }, g.c),
    h('section', { class: 'panel col fill pad', style: 'gap:20px' },
      h('p', { class: 'ws sm' }, '같은 처음 상태(300 K)에서 부피를 2 → 4 (×10', h('sup', { text: '−3' }), ' m', h('sup', { text: '3' }), ')로 팽창시킨 세 과정과, 부피를 고정한 채 가열한 등적 과정을 비교한다.'),
      h('div', { class: 'row', style: 'gap:10px' }, btns),
      h('table', { class: 't1' }, h('thead', {}, h('tr', {}, ['과정', 'W (J)', 'ΔU (J)', 'Q (J)', '나중 온도'].map(function (s) { return h('th', { text: s }); }))), tbody),
      h('div', { class: 'callout good', style: 'font-size:30px' }, '같은 부피만큼 팽창하면 한 일은 ', h('b', { text: '등압 > 등온 > 단열' }), '. 그래프 아래 넓이를 비교하면 보인다.'))));
  sync();
  return {
    tick: function () {
      const c = g.ctx; c.clearRect(0, 0, g.w, g.h);
      const gb = pvBox(110, 80, 860, 700, 4.5, 2.5);
      pvAxes(c, gb, { grid: 0.5 });
      const fp = pathOf(focus, ends[focus], 1);
      if (focus !== 'isochoric') pvArea(c, gb, fp, colOf(focus), false);
      ORDER.forEach(function (k) {
        const pts = pathOf(k, ends[k], 1);
        pvLine(c, gb, pts, colOf(k), k === focus ? 8 : 4, k === focus ? null : [10, 8]);
        const last = pts[pts.length - 1];
        dot(c, PX(gb, last.V), PY(gb, last.P), 8, colOf(k));
        const lab = { isobaric: [14, -24], isothermal: [14, -22], adiabatic: [14, 24], isochoric: [18, 0] }[k];
        txt(c, PROCS[k].short, PX(gb, last.V) + lab[0], PY(gb, last.P) + lab[1], { size: 26, weight: 700, color: colOf(k) });
      });
      dot(c, PX(gb, 2), PY(gb, 1), 11, COL.ink);
      txt(c, '처음 (300 K)', PX(gb, 2) - 16, PY(gb, 1) + 30, { size: 22, weight: 600, align: 'right' });
      const f = stateAt(focus, ends[focus], 1);
      txt(c, PROCS[focus].name + ' : W = ' + sgn(f.W) + ' J', gb.x + gb.w, gb.y + 10, { size: 28, weight: 700, color: colOf(focus), align: 'right' });
    },
  };
}

/* ── 11. 과정 맞히기 ── */
function sceneGuess(root) {
  const PUZ = [
    { k: 'adiabatic', d: 0 }, { k: 'isobaric', d: 0 }, { k: 'isothermal', d: 0 }, { k: 'isochoric', d: 0 },
    { k: 'adiabatic', d: 1 }, { k: 'isothermal', d: 1 }, { k: 'isochoric', d: 1 }, { k: 'isobaric', d: 1 },
  ];
  const WHY = {
    isobaric0: ['압력이 처음과 같다 → 등압 과정', '부피가 늘어 W > 0, 온도가 올라 ΔU > 0 이므로 Q = ΔU + W > 0 : 열이 들어왔다.'],
    isobaric1: ['압력이 처음과 같다 → 등압 과정', '부피가 줄어 W < 0, 온도가 내려 ΔU < 0 이므로 Q < 0 : 열이 나갔다.'],
    isochoric0: ['부피가 그대로다 → 등적 과정', 'W = 0 이므로 Q = ΔU. 들어온 열이 모두 내부 에너지가 되어 온도와 압력이 올라갔다.'],
    isochoric1: ['부피가 그대로다 → 등적 과정', 'W = 0 이므로 Q = ΔU < 0. 열이 나간 만큼 내부 에너지가 줄어 온도와 압력이 내려갔다.'],
    isothermal0: ['온도가 그대로다 → 등온 과정', 'ΔU = 0 이므로 Q = W. 들어온 열이 모두 일이 되어 부피가 늘고 압력이 줄었다.'],
    isothermal1: ['온도가 그대로다 → 등온 과정', 'ΔU = 0 이므로 Q = W < 0. 받은 일만큼 열이 나갔다.'],
    adiabatic0: ['열이 드나들지 않았다 → 단열 과정', 'Q = 0, 부피가 늘어 W > 0 이므로 ΔU = −W < 0 : 온도가 내려갔다.'],
    adiabatic1: ['열이 드나들지 않았다 → 단열 과정', 'Q = 0, 부피가 줄어 W < 0 이므로 ΔU = −W > 0 : 온도가 올라갔다.'],
  };
  let pi = 0, opened = [false, false, false, false], chosen = null, shown = false, s = 0;
  const covers = [], trends = [], cvs = [];
  const NAMES = ['부피', '압력', '온도', '열 출입'];
  const cards = NAMES.map(function (name, i) {
    const cv = makeCanvas(420, 300);
    const trend = h('span', { class: 'c-trend' });
    const cover = h('span', { class: 'cover' }, '단서 ' + (i + 1) + ' : ' + name, h('small', { text: '눌러서 열기' }));
    covers.push(cover); trends.push(trend); cvs.push(cv);
    return h('button', { class: 'panel clue', type: 'button', 'aria-label': '단서 ' + (i + 1) + ' ' + name, onclick: function () { opened[i] = true; render(); } },
      h('span', { class: 'c-head', text: name }), cv.c, trend, cover);
  });
  const count = h('span', { class: 'mono', style: 'font-weight:700' });
  const numEl = h('span', { class: 'mono', style: 'font-weight:700' });
  const answers = ORDER.map(function (k) { return h('button', { class: 'btn answer fill', type: 'button', text: PROCS[k].name, onclick: function () { chosen = k; render(); } }); });
  const reveal = h('div', { class: 'reveal' });
  const showBtn = h('button', { class: 'btn primary', type: 'button', text: '정답 보기', onclick: function () { shown = true; opened = [true, true, true, true]; render(); } });
  const nextBtn = h('button', { class: 'btn', type: 'button', text: '다음 문제', onclick: function () { pi = (pi + 1) % PUZ.length; opened = [false, false, false, false]; chosen = null; shown = false; s = 0; render(); } });
  root.append(h('div', { class: 'col', style: 'height:100%;gap:18px' },
    h('div', { class: 'row', style: 'align-items:center;justify-content:space-between' },
      h('p', { class: 'ws', style: 'font-size:34px;font-weight:700' }, '어떤 과정일까? 단서를 적게 열고 맞혀 보자.'),
      h('div', { style: 'font-size:28px;white-space:nowrap' }, '문제 ', numEl, ' · 연 단서 ', count)),
    h('div', { class: 'clues' }, cards),
    h('div', { class: 'row', style: 'gap:16px' }, answers),
    h('section', { class: 'panel row pad', style: 'gap:24px;align-items:center;flex:1;min-height:0' }, h('div', { class: 'fill' }, reveal), h('div', { class: 'col fix', style: 'gap:12px' }, showBtn, nextBtn))));
  function render() {
    const P = PUZ[pi], key = P.k + P.d;
    numEl.textContent = (pi + 1) + '/' + PUZ.length;
    count.textContent = opened.filter(Boolean).length + '개';
    covers.forEach(function (c, i) { c.hidden = opened[i]; });
    answers.forEach(function (b, i) {
      const k = ORDER[i];
      b.classList.toggle('right', shown && k === P.k);
      b.classList.toggle('wrong', shown && chosen === k && k !== P.k);
      b.setAttribute('aria-pressed', String(chosen === k && !shown));
    });
    reveal.replaceChildren();
    if (shown) reveal.append(h('b', { text: PROCS[P.k].name + ' (' + PROCS[P.k].dirs[P.d].label + ')' }), h('br'), WHY[key][0], h('br'), WHY[key][1]);
    else reveal.append(chosen ? '고른 답 : ' + PROCS[chosen].name + '. 근거를 Q = ΔU + W 로 말해 보세요.' : '모둠에서 답을 정하고, 근거를 Q = ΔU + W 로 말해 보세요.');
  }
  render();
  function trendWord(a, b, up, down) { if (Math.abs(b - a) < 1e-3) return '그대로다'; return b > a ? up : down; }
  return {
    annoKey: function () { return 'guess:' + pi; },     // 문제마다 새 필기
    tick: function (dt, now) {
      const P = PUZ[pi];
      s += dt / 3.6; if (s > 1.5) s = 0;
      const sv = Math.min(1, s), end = PROCS[P.k].dirs[P.d].end;
      const st = stateAt(P.k, end, sv), fin = stateAt(P.k, end, 1);
      const words = [
        trendWord(S0.V, fin.V, '늘어난다', '줄어든다'),
        trendWord(S0.P, fin.P, '커진다', '작아진다'),
        trendWord(S0.T, fin.T, '올라간다', '내려간다'),
        Math.abs(fin.Q) < 0.5 ? '없다' : fin.Q > 0 ? '들어온다' : '나간다',
      ];
      trends.forEach(function (t, i) { setText(t, words[i]); });
      // 부피
      let c = cvs[0].ctx; c.clearRect(0, 0, 420, 300);
      const kx = 70;
      c.fillStyle = COL['ink-2']; c.fillRect(32, 62, 336, 8); c.fillRect(32, 190, 336, 8); c.fillRect(32, 62, 8, 136);
      c.fillStyle = rgba(tempColor(st.T), 0.18); c.fillRect(40, 70, st.V * kx, 120);
      c.fillStyle = COL.ink; c.fillRect(40 + st.V * kx, 72, 16, 116);
      txtU(c, st.V.toFixed(2), UNIT_V, 210, 250, { size: 26, weight: 700, align: 'center' });
      // 압력
      c = cvs[1].ctx; c.clearRect(0, 0, 420, 300);
      dial(c, 210, 136, 104, st.P, { pmax: 3.5, label: false });
      txtU(c, st.P.toFixed(2), UNIT_P, 210, 272, { size: 26, weight: 700, align: 'center' });
      // 온도
      c = cvs[2].ctx; c.clearRect(0, 0, 420, 300);
      thermometer(c, 170, 26, 250, st.T, { init: 300, label: false });
      txt(c, Math.round(st.T) + ' K', 250, 140, { size: 34, weight: 700, mono: true });
      // 열 출입
      c = cvs[3].ctx; c.clearRect(0, 0, 420, 300);
      c.strokeStyle = COL['ink-2']; c.lineWidth = 6; rrect(c, 120, 80, 180, 110, 14); c.stroke();
      txt(c, '기체', 210, 135, { size: 26, weight: 700, align: 'center', color: COL.muted });
      if (Math.abs(fin.Q) < 0.5) {
        c.strokeStyle = COL.pen; c.lineWidth = 6;
        c.beginPath(); c.moveTo(186, 222); c.lineTo(234, 270); c.moveTo(234, 222); c.lineTo(186, 270); c.stroke();
        txt(c, '열이 드나들지 않는다', 210, 40, { size: 26, weight: 700, align: 'center' });
      } else {
        const inn = fin.Q > 0, off = (now * 40) % 30;
        [150, 210, 270].forEach(function (x) {
          if (inn) arrow(c, x, 286 - off * 0.4, x, 204, { width: 6, color: COL.heat, head: 20, dash: [10, 8] });
          else arrow(c, x, 202, x, 282 - off * 0.4, { width: 6, color: COL.heat, head: 20, dash: [10, 8] });
        });
        txt(c, inn ? '열이 들어온다' : '열이 나간다', 210, 40, { size: 26, weight: 700, align: 'center', color: COL.heat });
      }
    },
  };
}
