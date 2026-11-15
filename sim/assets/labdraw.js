/* 가상실험 기구 그리기 (window.LD)
   모든 좌표는 실험대 논리 좌표(기본 960×600). 글자 크기는 LD.k(작은 화면에서 키움)를 곱해 쓴다.
   x, y는 특별한 말이 없으면 '바닥 가운데' 기준이다(비커·시험관·스탠드 등). */
window.LD = (() => {
  const D = {k: 1, dark: false, fam: '"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif', mono: '"IBM Plex Mono",ui-monospace,Menlo,monospace'};
  const TAU = Math.PI * 2;
  const font = (px, w, mono) => `${w || 500} ${px * D.k}px ${mono ? D.mono : D.fam}`;
  const glassStroke = () => D.dark ? 'rgba(210,228,245,.75)' : 'rgba(46,66,88,.72)';
  const glassFill = () => D.dark ? 'rgba(170,205,235,.08)' : 'rgba(235,245,252,.38)';
  const ink = () => D.dark ? '#e6eef6' : '#16202a';
  const sub = () => D.dark ? '#9fb0c0' : '#55616e';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, f) => { const pa = hex(a), pb = hex(b); return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * f)).join(',')})`; };
  function hex(c){ if (c.startsWith('rgb')) return c.match(/[\d.]+/g).slice(0, 3).map(Number); c = c.replace('#', ''); if (c.length === 3) c = [...c].map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); }
  const rgba = (c, a) => { const p = hex(c); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; };
  function rr(g, x, y, w, h, r){ r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));   /* 첫 배치 때 폭이 0·음수여도 arcTo 가 멈추지 않게 */ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  /* ── 배경: 벽 + 실험대 ── */
  function bg(g, W, H, o){
    o = o || {}; const top = o.top != null ? o.top : H * .74;
    const wall = g.createLinearGradient(0, 0, 0, top);
    if (D.dark) { wall.addColorStop(0, '#16202a'); wall.addColorStop(1, '#1d2933'); } else { wall.addColorStop(0, '#eef3f7'); wall.addColorStop(1, '#dde6ed'); }
    g.fillStyle = wall; g.fillRect(0, 0, W, top);
    // 벽 타일 줄눈
    g.strokeStyle = D.dark ? 'rgba(255,255,255,.035)' : 'rgba(30,60,90,.06)'; g.lineWidth = 1;
    for (let y = top - 60; y > 0; y -= 60) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(W, y + .5); g.stroke(); }
    for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, top); g.stroke(); }
    // 실험대 상판(중간 회색 레진 — 흰 글씨가 읽히는 밝기) + 앞면
    const lip = 16;
    const tp = g.createLinearGradient(0, top, 0, H);
    if (D.dark) { tp.addColorStop(0, '#2b3640'); tp.addColorStop(1, '#141b21'); } else { tp.addColorStop(0, '#76838f'); tp.addColorStop(1, '#5f6b76'); }
    g.fillStyle = tp; g.fillRect(0, top, W, H - top);
    g.fillStyle = D.dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.35)'; g.fillRect(0, top, W, 2);
    g.fillStyle = D.dark ? '#0d1317' : '#4b565f'; g.fillRect(0, H - lip, W, lip);
    // 상판 반사광
    const sh = g.createLinearGradient(0, top, 0, top + 40); sh.addColorStop(0, 'rgba(255,255,255,.08)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sh; g.fillRect(0, top, W, 40);
    return top;
  }
  function shadow(g, x, y, w, a){ g.save(); g.fillStyle = `rgba(0,0,0,${a != null ? a : .28})`; g.beginPath(); g.ellipse(x, y + 2, w / 2, Math.max(3, w * .06), 0, 0, TAU); g.filter = 'blur(3px)'; g.fill(); g.restore(); }

  /* ── 유리 기구 ── */
  function glassShine(g, x, y, h){ const gr = g.createLinearGradient(x, 0, x + 10, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, D.dark ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x, y, 10, h); }
  function liquidFill(g, color, x, y, w, h, o){
    o = o || {}; const gr = g.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, rgba(color, (o.alpha || .62) * 1.15)); gr.addColorStop(.35, rgba(color, (o.alpha || .62) * .8)); gr.addColorStop(1, rgba(color, (o.alpha || .62) * 1.2));
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = rgba(color, .9); g.fillRect(x, y, w, 2);
  }
  // 비커: x 가운데, y 바닥, w 너비, h 높이. o.level(0~1, 표시 용량 대비 부피 비율; 눈금 i는 i/(ticks+1)), o.color, o.cap('250 mL'), o.marks, o.bubbles, o.t, o.steam, o.label, o.solid(바닥 고체 높이px, 색 o.solidColor)
  function beaker(g, x, y, w, h, o){
    o = o || {}; const L = x - w / 2, R = x + w / 2, T = y - h, lip = Math.max(5, w * .07);
    shadow(g, x, y, w * 1.05);
    // 액체
    if (o.level > 0) {
      const lh = (h - 18) * clamp(o.level, 0, 1.08), ly = y - 6 - lh;
      g.save(); g.beginPath(); rr(g, L + 2.5, T, w - 5, h - 2.5, 5); g.clip();
      liquidFill(g, o.color || '#5aa9e6', L, ly, w, y - ly, o);
      if (o.solid) { g.fillStyle = o.solidColor || '#e9e2d0'; g.beginPath(); g.ellipse(x, y - 3, w * .42, o.solid, 0, Math.PI, 0); g.fill(); }
      if (o.bubbles) bubbles(g, L + 6, ly + 4, w - 12, y - ly - 10, o.bubbles, o.t || 0);
      g.restore();
      // 메니스커스
      g.strokeStyle = rgba(o.color || '#5aa9e6', .95); g.lineWidth = 1.5; g.beginPath(); g.moveTo(L + 3, ly - 2); g.quadraticCurveTo(x, ly + 3, R - 3, ly - 2); g.stroke();
    } else if (o.solid) { g.fillStyle = o.solidColor || '#e9e2d0'; g.beginPath(); g.ellipse(x, y - 3, w * .42, o.solid, 0, Math.PI, 0); g.fill(); }
    // 유리
    g.fillStyle = glassFill(); g.strokeStyle = glassStroke(); g.lineWidth = 2;
    g.beginPath(); g.moveTo(L - lip * .5, T); g.lineTo(L, T + 4); g.lineTo(L, y - 6); g.quadraticCurveTo(L, y, L + 6, y); g.lineTo(R - 6, y); g.quadraticCurveTo(R, y, R, y - 6); g.lineTo(R, T); g.stroke();
    g.beginPath(); g.moveTo(L - lip * .5, T); g.lineTo(R + 1, T); g.stroke();
    glassShine(g, L + 5, T + 10, h - 22);
    // 눈금
    if (o.marks !== false) { g.strokeStyle = D.dark ? 'rgba(220,235,250,.55)' : 'rgba(40,60,80,.55)'; g.lineWidth = 1; g.font = font(9, 500); g.fillStyle = sub(); g.textAlign = 'left'; g.textBaseline = 'middle';
      const n = o.ticks || 5; for (let i = 1; i <= n; i++) { const yy = y - 6 - (h - 18) * i / (n + 1); g.beginPath(); g.moveTo(R - w * .28, yy); g.lineTo(R - 4, yy); g.stroke(); if (o.tickLabel) g.fillText(o.tickLabel(i), R - w * .28 - 2 - g.measureText(o.tickLabel(i)).width, yy); } }
    if (o.cap) { g.font = font(9, 600); g.fillStyle = sub(); g.textAlign = 'center'; g.fillText(o.cap, x, T + 14); }
    if (o.steam) steam(g, x, T, w * .6, o.t || 0, o.steam);
    if (o.label) tag(g, o.label, x, y + 20);
  }
  // 삼각 플라스크
  function flask(g, x, y, w, h, o){
    o = o || {}; const nw = w * .3, nh = h * .32, T = y - h;
    shadow(g, x, y, w);
    const path = () => { g.beginPath(); g.moveTo(x - nw / 2, T); g.lineTo(x - nw / 2, T + nh); g.lineTo(x - w / 2, y - 6); g.quadraticCurveTo(x - w / 2, y, x - w / 2 + 6, y); g.lineTo(x + w / 2 - 6, y); g.quadraticCurveTo(x + w / 2, y, x + w / 2, y - 6); g.lineTo(x + nw / 2, T + nh); g.lineTo(x + nw / 2, T); };
    if (o.level > 0) { g.save(); path(); g.closePath(); g.clip(); const ly = y - (h - nh) * clamp(o.level, 0, 1) * .95; liquidFill(g, o.color || '#5aa9e6', x - w / 2, ly, w, y - ly, o); if (o.bubbles) bubbles(g, x - w * .3, ly + 4, w * .6, y - ly - 8, o.bubbles, o.t || 0); g.restore(); }
    g.fillStyle = glassFill(); path(); g.fill(); g.strokeStyle = glassStroke(); g.lineWidth = 2; path(); g.stroke();
    g.beginPath(); g.moveTo(x - nw / 2 - 3, T); g.lineTo(x + nw / 2 + 3, T); g.stroke();
    glassShine(g, x - w * .28, T + nh + 18, h - nh - 34);
    if (o.stopper) { g.fillStyle = '#c8724a'; rr(g, x - nw / 2 - 1, T - 12, nw + 2, 16, 3); g.fill(); }
    if (o.label) tag(g, o.label, x, y + 20);
  }
  // 시험관: x 가운데, y 바닥(둥근 끝), w, h. o.angle(라디안, 기울기)
  function tube(g, x, y, w, h, o){
    o = o || {}; g.save(); g.translate(x, y); if (o.angle) g.rotate(o.angle);
    const r = w / 2, path = () => { g.beginPath(); g.moveTo(-r, -h); g.lineTo(-r, -r); g.arc(0, -r, r, Math.PI, 0, true); g.lineTo(r, -h); };
    if (o.level > 0) { g.save(); path(); g.closePath(); g.clip(); const ly = -(h - 6) * clamp(o.level, 0, 1); liquidFill(g, o.color || '#5aa9e6', -r, ly, w, -ly, o); if (o.bubbles) bubbles(g, -r + 3, ly + 3, w - 6, -ly - 6, o.bubbles, o.t || 0); if (o.ppt) { g.fillStyle = o.ppt; g.beginPath(); g.ellipse(0, -r * .7, r * .95, r * .75, 0, 0, TAU); g.fill(); } g.restore(); }
    g.fillStyle = glassFill(); path(); g.fill(); g.strokeStyle = glassStroke(); g.lineWidth = 1.8; path(); g.stroke();
    g.beginPath(); g.moveTo(-r - 2.5, -h); g.lineTo(r + 2.5, -h); g.stroke();
    glassShine(g, -r + 2, -h + 6, h - r - 10);
    if (o.stopper) { g.fillStyle = '#c8724a'; rr(g, -r - 1, -h - 10, w + 2, 14, 3); g.fill(); }
    g.restore();
    if (o.label) tag(g, o.label, x, y + 18);
  }
  // 눈금실린더: o.max(mL), o.vol, o.color, o.major, o.minor. 눈금 읽기용 확대창(o.zoom)
  function cylinder(g, x, y, w, h, o){
    o = o || {}; const T = y - h, base = 10, ih = h - 26, max = o.max || 100, y0 = y - base - 6;
    const vy = v => y0 - ih * v / max;
    g.fillStyle = D.dark ? '#5b6b78' : '#b9c4cd'; g.beginPath(); g.ellipse(x, y - 3, w * 1.1, 6, 0, 0, TAU); g.fill(); shadow(g, x, y, w * 2.2, .2);
    if (o.vol > 0) { g.save(); g.beginPath(); g.rect(x - w / 2 + 2, T, w - 4, y0 - T); g.clip(); const ly = vy(o.vol); liquidFill(g, o.color || '#5aa9e6', x - w / 2, ly, w, y0 - ly, o); if (o.obj) o.obj(g, ly); g.restore();
      g.strokeStyle = rgba(o.color || '#5aa9e6', 1); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - w / 2 + 2, vy(o.vol) - 3); g.quadraticCurveTo(x, vy(o.vol) + 3, x + w / 2 - 2, vy(o.vol) - 3); g.stroke(); }
    g.fillStyle = glassFill(); g.fillRect(x - w / 2, T, w, h - base); g.strokeStyle = glassStroke(); g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(x - w / 2 - 3, T); g.lineTo(x - w / 2, T + 4); g.lineTo(x - w / 2, y0 + 4); g.lineTo(x + w / 2, y0 + 4); g.lineTo(x + w / 2, T); g.stroke();
    const maj = o.major || 10, mn = o.minor || 1; g.lineWidth = 1; g.strokeStyle = D.dark ? 'rgba(230,240,250,.7)' : 'rgba(30,45,60,.75)'; g.font = font(8.5, 500); g.fillStyle = sub(); g.textAlign = 'right'; g.textBaseline = 'middle';
    for (let v = 0; v <= max + 1e-9; v += mn) { const yy = vy(v), M = Math.abs(v / maj - Math.round(v / maj)) < 1e-6, half = !M && Math.abs(v / (maj / 2) - Math.round(v / (maj / 2))) < 1e-6; g.beginPath(); g.moveTo(x + w / 2 - (M ? w * .5 : half ? w * .35 : w * .22), yy); g.lineTo(x + w / 2, yy); g.stroke(); if (M && v > 0) g.fillText(+v.toFixed(2), x - w / 2 - 3, yy); }
    glassShine(g, x - w / 2 + 3, T + 8, h - 30);
    if (o.label) tag(g, o.label, x, y + 18);
  }
  function bubbles(g, x, y, w, h, n, t){ g.save(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.fillStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1;
    for (let i = 0; i < n; i++) { const s = (i * 97.3) % 1, sp = 30 + (i * 37) % 50, ph = ((t * sp + i * 53) % (h + 10)); const bx = x + ((i * 61.7) % w) + Math.sin(t * 3 + i) * 2, by = y + h - ph, r = 1.5 + (i % 4) * .9 + s; if (by < y) continue; g.beginPath(); g.arc(bx, by, r, 0, TAU); g.fill(); g.stroke(); }
    g.restore(); }
  function steam(g, x, y, w, t, amt){ g.save(); for (let i = 0; i < 6 * (amt || 1); i++) { const p = ((t * .35 + i / 6) % 1), a = (1 - p) * .35; g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.arc(x + Math.sin(t * 1.4 + i * 2) * w * .25 + (i % 3 - 1) * w * .15, y - p * 70, 6 + p * 14, 0, TAU); g.fill(); } g.restore(); }

  /* ── 가열·고정 ── */
  function flame(g, x, y, s, t, o){ o = o || {}; const f = 1 + Math.sin(t * 17) * .05 + Math.sin(t * 29) * .04;
    g.save(); g.translate(x, y); g.scale(1, f);
    const gr = g.createRadialGradient(0, -s * .35, 1, 0, -s * .4, s * .9); gr.addColorStop(0, o.blue ? 'rgba(170,215,255,.95)' : 'rgba(255,248,200,.95)'); gr.addColorStop(.45, o.blue ? 'rgba(70,130,255,.85)' : 'rgba(255,170,40,.9)'); gr.addColorStop(1, 'rgba(255,90,20,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, -s * 1.25); g.bezierCurveTo(s * .55, -s * .55, s * .45, 0, 0, 0); g.bezierCurveTo(-s * .45, 0, -s * .55, -s * .55, 0, -s * 1.25); g.fill();
    if (o.blue !== false && !o.yellow) { g.fillStyle = 'rgba(90,150,255,.7)'; g.beginPath(); g.ellipse(0, -s * .18, s * .16, s * .3, 0, 0, TAU); g.fill(); }
    g.restore(); }
  function lamp(g, x, y, o){ o = o || {}; shadow(g, x, y, 70);
    const gr = g.createLinearGradient(x - 34, 0, x + 34, 0); gr.addColorStop(0, 'rgba(190,215,235,.55)'); gr.addColorStop(.5, 'rgba(240,250,255,.35)'); gr.addColorStop(1, 'rgba(190,215,235,.6)');
    g.fillStyle = 'rgba(120,170,220,.35)'; g.beginPath(); g.ellipse(x, y - 14, 30, 14, 0, 0, Math.PI); g.lineTo(x - 30, y - 24); g.fill();
    g.fillStyle = gr; g.strokeStyle = glassStroke(); g.lineWidth = 1.8; g.beginPath(); g.moveTo(x - 10, y - 50); g.bezierCurveTo(x - 36, y - 44, x - 36, y - 2, x - 18, y); g.lineTo(x + 18, y); g.bezierCurveTo(x + 36, y - 2, x + 36, y - 44, x + 10, y - 50); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#9aa4ad'; rr(g, x - 9, y - 58, 18, 9, 2); g.fill(); g.fillStyle = '#efe6d4'; g.fillRect(x - 2, y - 64, 4, 7);
    if (o.lit) flame(g, x, y - 63, o.size || 26, o.t || 0, {yellow: true});
    if (o.label) tag(g, o.label, x, y + 18); }
  function hotplate(g, x, y, w, o){ o = o || {}; const h = 34; shadow(g, x, y, w * 1.05);
    g.fillStyle = D.dark ? '#c9d0d6' : '#e7ebee'; rr(g, x - w / 2, y - h, w, h, 6); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke();
    const p = clamp(o.power || 0, 0, 1);
    g.fillStyle = o.on ? mix('#3b3f44', '#ff4a2a', p * .85) : '#3b3f44'; rr(g, x - w / 2 + 6, y - h - 6, w - 12, 9, 3); g.fill();
    if (o.on && p > 0) { g.save(); g.globalAlpha = .35 * p; const gl = g.createRadialGradient(x, y - h, 2, x, y - h, w * .6); gl.addColorStop(0, '#ff6a3a'); gl.addColorStop(1, 'rgba(255,90,40,0)'); g.fillStyle = gl; g.fillRect(x - w, y - h - w * .5, w * 2, w * .6); g.restore(); }
    g.fillStyle = '#2a2f35'; g.beginPath(); g.arc(x + w / 2 - 20, y - h / 2, 8, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); const a = -Math.PI * .75 + p * Math.PI * 1.5; g.moveTo(x + w / 2 - 20, y - h / 2); g.lineTo(x + w / 2 - 20 + Math.cos(a) * 6, y - h / 2 + Math.sin(a) * 6); g.stroke();
    g.fillStyle = o.on ? '#ff3b2f' : '#6b737b'; g.beginPath(); g.arc(x - w / 2 + 16, y - h / 2, 3.5, 0, TAU); g.fill();
    if (o.label) tag(g, o.label, x, y + 18); return y - h - 6; }
  function stand(g, x, y, h, o){ o = o || {}; shadow(g, x + 30, y, 120, .22);
    g.fillStyle = D.dark ? '#59636d' : '#3a434c'; rr(g, x - 20, y - 12, 120, 12, 3); g.fill();
    const gr = g.createLinearGradient(x - 4, 0, x + 4, 0); gr.addColorStop(0, '#8d98a2'); gr.addColorStop(.5, '#e2e8ee'); gr.addColorStop(1, '#7b8691'); g.fillStyle = gr; g.fillRect(x - 4, y - h, 8, h - 12); }
  function clamp2(g, x, y, x2){ g.fillStyle = '#5c6670'; rr(g, x - 9, y - 9, 18, 18, 3); g.fill(); const gr = g.createLinearGradient(0, y - 3, 0, y + 3); gr.addColorStop(0, '#c5ced6'); gr.addColorStop(1, '#7f8a95'); g.fillStyle = gr; g.fillRect(Math.min(x, x2), y - 3, Math.abs(x2 - x), 6); g.fillStyle = '#c0703c'; rr(g, x2 - 8, y - 8, 16, 16, 4); g.fill(); }

  /* ── 계기 ── */
  // 디지털 표시창: x,y 왼쪽 위
  function lcd(g, x, y, w, h, text, o){ o = o || {};
    g.save(); shadow(g, x + w / 2, y + h, w * .9, .25);
    const body = g.createLinearGradient(0, y, 0, y + h); body.addColorStop(0, o.body || '#2c3742'); body.addColorStop(1, o.body2 || '#1b232b'); g.fillStyle = body; rr(g, x, y, w, h, 8); g.fill();
    g.fillStyle = '#0a1a14'; rr(g, x + 6, y + 6, w - 12, h - (o.label ? 22 : 12), 4); g.fill();
    g.fillStyle = o.color || '#7dffc4'; g.shadowColor = o.color || '#7dffc4'; g.shadowBlur = 6; g.font = font(o.size || Math.min(26, (h - (o.label ? 22 : 12)) * .62), 600, true); g.textAlign = 'right'; g.textBaseline = 'middle';
    const uw = o.unit ? (g.save(), g.font = font(11, 600), (() => { const m = g.measureText(o.unit).width + 6; g.restore(); return m; })()) : 0;
    g.fillText(text, x + w - 12 - uw, y + 6 + (h - (o.label ? 22 : 12)) / 2 + 1);
    if (o.unit) { g.font = font(11, 600); g.fillText(o.unit, x + w - 10, y + 6 + (h - (o.label ? 22 : 12)) / 2 + 2); }
    g.shadowBlur = 0;
    if (o.label) { g.fillStyle = '#c3cfda'; g.font = font(10, 600); g.textAlign = 'center'; g.fillText(o.label, x + w / 2, y + h - 8); }
    g.restore(); }
  function balance(g, x, y, w, reading, o){ o = o || {}; const h = 30; shadow(g, x, y, w);
    g.fillStyle = D.dark ? '#d5dbe0' : '#f3f5f7'; rr(g, x - w / 2, y - h, w, h, 6); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#c3cbd2'; rr(g, x - w * .4, y - h - 8, w * .8, 8, 3); g.fill();
    g.fillStyle = '#0b1a14'; rr(g, x - w * .18, y - h + 7, w * .36, 16, 3); g.fill(); g.fillStyle = '#7dffc4'; g.font = font(11, 600, true); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(reading + ' ' + (o.unit || 'g'), x, y - h + 15.5);
    if (o.label) tag(g, o.label, x, y + 18); return y - h - 8; }
  function stopwatch(g, x, y, r, t, o){ o = o || {}; g.save(); shadow(g, x, y + r, r * 1.6, .2);
    g.fillStyle = '#c8ced4'; g.fillRect(x - 4, y - r - 10, 8, 8); g.fillStyle = '#2c3640'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = '#f6f8fa'; g.beginPath(); g.arc(x, y, r - 4, 0, TAU); g.fill();
    g.strokeStyle = '#1e2730'; for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; g.lineWidth = i % 5 ? 1 : 2; g.beginPath(); g.moveTo(x + Math.sin(a) * (r - 6), y - Math.cos(a) * (r - 6)); g.lineTo(x + Math.sin(a) * (r - (i % 5 ? 9 : 12)), y - Math.cos(a) * (r - (i % 5 ? 9 : 12))); g.stroke(); }
    const a = (t % 60) / 60 * TAU; g.strokeStyle = '#d33'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * (r - 10), y - Math.cos(a) * (r - 10)); g.stroke(); g.fillStyle = '#d33'; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill();
    if (o.digital !== false) { g.fillStyle = '#1e2730'; g.font = font(10, 600, true); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t.toFixed(1) + ' s', x, y + r * .42); }
    g.restore(); }
  // 아날로그 바늘 계기 (전류계·전압계·압력계 등). x,y 가운데
  function meter(g, x, y, r, val, o){ o = o || {}; const max = o.max || 1, min = o.min || 0; g.save(); shadow(g, x, y + r * .8, r * 2.2, .25);
    g.fillStyle = o.body || '#2b3540'; rr(g, x - r * 1.1, y - r * .95, r * 2.2, r * 1.8, 10); g.fill();
    g.fillStyle = '#f7f5ee'; g.beginPath(); g.moveTo(x - r * .95, y + r * .25); g.arc(x, y + r * .25, r * .95, Math.PI, 0); g.closePath(); g.fill();
    const A0 = Math.PI * 1.15, A1 = Math.PI * 1.85, ang = v => A0 + (A1 - A0) * clamp((v - min) / (max - min), 0, 1.04), cx = x, cy = y + r * .25;
    g.strokeStyle = '#222'; g.fillStyle = '#222'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font(8.5, 600);
    const n = o.ticks || 10, lw = g.measureText(String(+max.toFixed(2))).width + 1, arc = (A1 - A0) * r * .53; let le = o.labelEvery || 2; while (le < n && (arc * le / n < lw || n % le)) le++;   /* 숫자가 겹치지 않을 만큼 건너뛰어 쓴다 */
    for (let i = 0; i <= n * 5; i++) { const a = A0 + (A1 - A0) * i / (n * 5), big = i % 5 === 0; g.lineWidth = big ? 1.4 : .8; g.beginPath(); g.moveTo(cx + Math.cos(a) * r * .82, cy + Math.sin(a) * r * .82); g.lineTo(cx + Math.cos(a) * r * (big ? .66 : .74), cy + Math.sin(a) * r * (big ? .66 : .74)); g.stroke(); if (big && (i / 5) % le === 0) g.fillText(+(min + (max - min) * i / (n * 5)).toFixed(2), cx + Math.cos(a) * r * .53, cy + Math.sin(a) * r * .53); }
    g.font = font(13, 700); g.fillStyle = o.color || '#c0392b'; g.fillText(o.label || '', cx, cy - r * .2);
    const a = ang(val); g.strokeStyle = '#c0392b'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * .86, cy + Math.sin(a) * r * .86); g.stroke(); g.fillStyle = '#333'; g.beginPath(); g.arc(cx, cy, 4, 0, TAU); g.fill();
    if (o.unit) { g.fillStyle = '#c3cfda'; g.font = font(10, 600); g.fillText(o.unit, x, y + r * .62); }
    if (o.terms !== false) { const sp = o.plusLeft ? -1 : 1;   /* (+)단자 빨강·(−)단자 검정: 기본은 (+)가 오른쪽, plusLeft 면 왼쪽 */ g.fillStyle = '#d33'; g.beginPath(); g.arc(x + sp * r * .7, y + r * .72, 4.5, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(x - sp * r * .7, y + r * .72, 4.5, 0, TAU); g.fill(); g.font = font(9, 700); g.fillStyle = '#e8eef3'; g.fillText('+', x + sp * r * .7, y + r * .72 - 11); g.fillText('−', x - sp * r * .7, y + r * .72 - 11); }
    g.restore(); return {plus: [x + r * .7, y + r * .72], minus: [x - r * .7, y + r * .72]}; }
  function gauge(g, x, y, r, val, o){ o = o || {}; g.save(); g.fillStyle = '#c9d0d6'; g.beginPath(); g.arc(x, y, r + 4, 0, TAU); g.fill(); g.fillStyle = '#fbfaf6'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    const A0 = Math.PI * .75, A1 = Math.PI * 2.25, min = o.min || 0, max = o.max || 200, n = o.ticks || 10; g.strokeStyle = '#222'; g.fillStyle = '#222'; g.font = font(8, 600); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i <= n * 2; i++) { const a = A0 + (A1 - A0) * i / (n * 2); g.lineWidth = i % 2 ? .8 : 1.4; g.beginPath(); g.moveTo(x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9); g.lineTo(x + Math.cos(a) * r * (i % 2 ? .8 : .74), y + Math.sin(a) * r * (i % 2 ? .8 : .74)); g.stroke(); if (!(i % 4)) g.fillText(+(min + (max - min) * i / (n * 2)).toFixed(0), x + Math.cos(a) * r * .58, y + Math.sin(a) * r * .58); }
    g.font = font(8.5, 600); g.fillText(o.unit || 'kPa', x, y + r * .42);
    const a = A0 + (A1 - A0) * clamp((val - min) / (max - min), 0, 1); g.strokeStyle = '#c0392b'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82); g.stroke(); g.fillStyle = '#333'; g.beginPath(); g.arc(x, y, 3.5, 0, TAU); g.fill(); g.restore(); }
  // 디지털 온도계 탐침: (x, yTop) ~ (x, yTip)
  function probe(g, x, yTop, yTip, o){ o = o || {}; g.save();
    const gr = g.createLinearGradient(x - 3, 0, x + 3, 0); gr.addColorStop(0, '#8e99a3'); gr.addColorStop(.5, '#eef2f5'); gr.addColorStop(1, '#7d8892'); g.fillStyle = gr; g.fillRect(x - 2.5, yTop, 5, yTip - yTop); g.beginPath(); g.arc(x, yTip, 2.5, 0, Math.PI); g.fill();
    g.fillStyle = o.handle || '#e2a03a'; rr(g, x - 6, yTop - 30, 12, 32, 4); g.fill();
    if (o.cable) { g.strokeStyle = '#2b2f33'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, yTop - 30); g.bezierCurveTo(x, yTop - 70, o.cable[0], o.cable[1] - 60, o.cable[0], o.cable[1]); g.stroke(); }
    g.restore(); }
  // 유리 막대 온도계(아날로그). T 현재 온도, o.min/o.max
  function thermoGlass(g, x, yTop, yBot, T, o){ o = o || {}; const min = o.min != null ? o.min : -10, max = o.max != null ? o.max : 110, Y = v => yBot - 14 - (yBot - 14 - yTop - 8) * (v - min) / (max - min);
    g.save(); g.fillStyle = D.dark ? 'rgba(230,240,250,.18)' : 'rgba(255,255,255,.85)'; rr(g, x - 6, yTop, 12, yBot - yTop, 6); g.fill(); g.strokeStyle = glassStroke(); g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#e0362c'; g.beginPath(); g.arc(x, yBot - 7, 5, 0, TAU); g.fill(); g.fillRect(x - 1.6, Y(clamp(T, min, max)), 3.2, yBot - 7 - Y(clamp(T, min, max)));
    if (o.scale !== false) { g.strokeStyle = sub(); g.fillStyle = sub(); g.font = font(8, 500); g.textAlign = 'left'; g.textBaseline = 'middle'; const st = o.step || 10;
      for (let v = Math.ceil(min / st) * st; v <= max; v += st) { g.lineWidth = .8; g.beginPath(); g.moveTo(x + 6, Y(v)); g.lineTo(x + 11, Y(v)); g.stroke(); if (!(v % (st * 2))) g.fillText(v, x + 13, Y(v)); } }
    g.restore(); }

  /* ── 힘·역학 ── */
  function spring(g, x, y0, y1, o){ o = o || {}; const n = o.n || 14, w = o.w || 14, L = y1 - y0; g.save(); g.strokeStyle = o.color || (D.dark ? '#c9d3dc' : '#59636c'); g.lineWidth = o.lw || 2; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 6); for (let i = 0; i <= n; i++) { const yy = y0 + 6 + (L - 12) * i / n; g.lineTo(x + (i % 2 ? w / 2 : -w / 2) * (i === 0 || i === n ? 0 : 1), yy); } g.lineTo(x, y1); g.stroke(); g.restore(); }
  function hspring(g, x0, x1, y, o){ o = o || {}; const n = o.n || 14, w = o.w || 14, L = x1 - x0; g.save(); g.strokeStyle = o.color || (D.dark ? '#c9d3dc' : '#59636c'); g.lineWidth = o.lw || 2; g.beginPath(); g.moveTo(x0, y); for (let i = 1; i < n; i++) g.lineTo(x0 + L * i / n, y + (i % 2 ? -w / 2 : w / 2)); g.lineTo(x1, y); g.stroke(); g.restore(); }
  // 추(갈고리 달린 금속 추): x 가운데, y 위쪽 고리
  function mass(g, x, y, o){ o = o || {}; const w = o.w || 34, h = o.h || 28; g.save();
    g.strokeStyle = '#7d8790'; g.lineWidth = 2; g.beginPath(); g.arc(x, y + 4, 4, Math.PI, 0); g.stroke(); g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x, y + 10); g.stroke();
    const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, o.c1 || '#7c858d'); gr.addColorStop(.45, o.c2 || '#e3e8ec'); gr.addColorStop(1, o.c1 || '#6d767e');
    g.fillStyle = gr; rr(g, x - w / 2, y + 10, w, h, 4); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke();
    if (o.label) { g.fillStyle = '#1b232b'; g.font = font(10, 700); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.label, x, y + 10 + h / 2); }
    g.restore(); return y + 10 + h; }
  // 용수철저울 (세로): 위 고리 (x, y), 길이 h, 눈금 0~max N, F 현재
  function springScale(g, x, y, h, F, o){ o = o || {}; const max = o.max || 5, w = 30; g.save();
    g.strokeStyle = '#7d8790'; g.lineWidth = 2; g.beginPath(); g.arc(x, y + 5, 5, Math.PI, 0); g.stroke();
    const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, '#d8dee3'); gr.addColorStop(.5, '#fbfcfd'); gr.addColorStop(1, '#c9d1d7'); g.fillStyle = gr; rr(g, x - w / 2, y + 10, w, h, 6); g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; g.stroke();
    const top = y + 22, bot = y + h - 6, Y = v => top + (bot - top - 6) * v / max;
    g.strokeStyle = '#1b232b'; g.fillStyle = '#1b232b'; g.font = font(7.5, 600); g.textAlign = 'right'; g.textBaseline = 'middle';
    const st = o.minor || max / 50, LS = [.1, .2, .5, 1, 2, 5, 10, 20, 50, 100].find(q => q >= st - 1e-9 && (bot - top - 6) * q / max >= 10) || max, isM = v => Math.abs(v / LS - Math.round(v / LS)) < 1e-6;   /* 숫자는 10 px 이상 간격일 때만 */
    for (let v = 0; v <= max + 1e-9; v += st) { const M = isM(v), hf = Math.abs(v * 2 - Math.round(v * 2)) < 1e-6; g.lineWidth = M ? 1.2 : .7; g.beginPath(); g.moveTo(x + w / 2 - 3, Y(v)); g.lineTo(x + w / 2 - (M ? 12 : hf ? 9 : 6), Y(v)); g.stroke(); if (M) g.fillText(+v.toFixed(1), x - 1, Y(v)); }
    const fy = Y(clamp(F, 0, max)); g.fillStyle = '#e23a2e'; g.fillRect(x - w / 2 + 2, fy - 1.5, w - 4, 3);
    g.strokeStyle = '#8a949d'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, fy); g.lineTo(x, y + h + 18); g.stroke(); g.beginPath(); g.arc(x, y + h + 22, 4, -Math.PI / 2, Math.PI * 1.2); g.stroke();
    if (o.unit !== false) { g.font = font(7.5, 700); g.textAlign = 'center'; g.fillStyle = '#1b232b'; g.fillText('N', x, y + 16); }
    g.restore(); return y + h + 26; }
  // 자: x,y 시작점(0 눈금), len px, o.vertical(아래로), o.ppu 눈금당 px, o.unit
  function ruler(g, x, y, len, o){ o = o || {}; const v = o.vertical, wdt = o.w || 26, ppu = o.ppu || 10, from = o.from || 0; g.save(); g.translate(x, y); if (v) g.rotate(Math.PI / 2);
    g.fillStyle = o.color || (D.dark ? '#d8c58a' : '#efd98f'); rr(g, -6, v ? 0 : -wdt, len + 12, wdt, 3); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = '#1b1b1b'; g.fillStyle = '#1b1b1b'; g.font = font(7.5, 600); g.textAlign = 'center'; g.textBaseline = v ? 'top' : 'bottom';
    const sub = o.sub || 1, n = Math.floor(len / ppu * sub + 1e-6), base = v ? 0 : 0, sgn = v ? 1 : -1;
    for (let i = 0; i <= n; i++) { const px = i * ppu / sub, val = from + i / sub, M = i % (sub * (o.labelEvery || 1)) === 0, half = sub >= 2 && i % (sub / 2 | 0 || 1) === 0 && !M; g.lineWidth = M ? 1 : .6; g.beginPath(); g.moveTo(px, base); g.lineTo(px, base + sgn * (M ? 9 : half ? 7 : 4.5)); g.stroke(); if (M && i % (sub * (o.labelEvery || 1)) === 0) { g.save(); g.translate(px, base + sgn * 11); if (v) g.rotate(-Math.PI / 2); g.textBaseline = 'middle'; g.textAlign = v ? 'right' : 'center'; g.fillText(+val.toFixed(1), v ? -2 : 0, v ? 0 : -4); g.restore(); } }
    if (o.unit) { g.save(); g.translate(len + 2, base + sgn * wdt * .62); if (v) g.rotate(-Math.PI / 2); g.textBaseline = 'middle'; g.textAlign = 'right'; g.font = font(7.5, 700); g.fillText(o.unit, 0, 0); g.restore(); }
    g.restore(); }
  function block(g, x, y, w, h, o){ o = o || {}; g.save(); shadow(g, x, y, w, .25);
    const c = o.color || '#c58b4e'; const gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, mix(c, '#ffffff', .18)); gr.addColorStop(1, mix(c, '#000000', .15)); g.fillStyle = gr; rr(g, x - w / 2, y - h, w, h, 3); g.fill();
    if (o.grain !== false && !o.color) { g.strokeStyle = 'rgba(90,50,20,.25)'; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x - w / 2 + 3, y - h + h * i / 4); g.bezierCurveTo(x - w / 6, y - h + h * i / 4 - 3, x + w / 6, y - h + h * i / 4 + 3, x + w / 2 - 3, y - h + h * i / 4); g.stroke(); } }
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; rr(g, x - w / 2, y - h, w, h, 3); g.stroke();
    if (o.label) { g.fillStyle = o.ink || '#1b130b'; g.font = font(o.fs || 11, 700); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.label, x, y - h / 2); }
    g.restore(); }
  function cart(g, x, y, w, o){ o = o || {}; const h = o.h || 22, r = o.r || 8; g.save(); shadow(g, x, y, w, .25);
    const c = o.color || '#2f6fdf'; const gr = g.createLinearGradient(0, y - h - r, 0, y - r); gr.addColorStop(0, mix(c, '#ffffff', .25)); gr.addColorStop(1, mix(c, '#000000', .2)); g.fillStyle = gr; rr(g, x - w / 2, y - h - r * 1.4, w, h, 4); g.fill();
    g.fillStyle = '#222'; [x - w / 2 + r + 4, x + w / 2 - r - 4].forEach(cx => { g.beginPath(); g.arc(cx, y - r, r, 0, TAU); g.fill(); g.fillStyle = '#9aa3ab'; g.beginPath(); g.arc(cx, y - r, r * .4, 0, TAU); g.fill(); g.fillStyle = '#222'; });
    if (o.label) { g.fillStyle = '#fff'; g.font = font(11, 700); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.label, x, y - r * 1.4 - h / 2); }
    g.restore(); }

  /* ── 전기 ── */
  function battery(g, x, y, w, h, o){ o = o || {}; g.save(); shadow(g, x, y + h / 2, w, .22);
    const gr = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); gr.addColorStop(0, '#4b535b'); gr.addColorStop(.5, '#2a3036'); gr.addColorStop(1, '#3a4148'); g.fillStyle = gr; rr(g, x - w / 2, y - h / 2, w, h, 5); g.fill();
    g.fillStyle = o.color || '#e0a526'; rr(g, x - w / 2, y - h / 2, w * .3, h, 5); g.fill(); g.fillStyle = '#9aa3ab'; g.fillRect(x + w / 2, y - h * .18, 5, h * .36);
    g.fillStyle = '#fff'; g.font = font(10, 700); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.label || '', x + w * .12, y);
    g.fillStyle = '#ff6b5e'; g.fillText('+', x + w / 2 - 8, y - h / 2 - 8); g.fillStyle = sub(); g.fillText('−', x - w / 2 + 8, y - h / 2 - 8);
    g.restore(); return {plus: [x + w / 2 + 5, y], minus: [x - w / 2, y]}; }
  // 전원 장치(직류): x,y 가운데, 표시 전압 v
  function supply(g, x, y, w, h, v, o){ o = o || {}; g.save(); shadow(g, x, y + h / 2, w, .25);
    const gr = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); gr.addColorStop(0, '#e9edf0'); gr.addColorStop(1, '#c9d0d6'); g.fillStyle = gr; rr(g, x - w / 2, y - h / 2, w, h, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#0b1a14'; rr(g, x - w / 2 + 10, y - h / 2 + 10, w * .5, h * .42, 3); g.fill(); g.fillStyle = '#ff8a5c'; g.shadowColor = '#ff8a5c'; g.shadowBlur = 5; g.font = font(14, 600, true); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText((+v).toFixed(o.d != null ? o.d : 1) + ' V', x - w / 2 + 6 + w * .5, y - h / 2 + 10 + h * .21); g.shadowBlur = 0;
    g.fillStyle = '#2a2f35'; g.beginPath(); g.arc(x + w * .28, y - h * .12, h * .17, 0, TAU); g.fill();
    g.fillStyle = '#d33'; g.beginPath(); g.arc(x + w * .14, y + h * .3, 5, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(x - w * .14, y + h * .3, 5, 0, TAU); g.fill();
    g.fillStyle = '#333'; g.font = font(8, 700); g.textAlign = 'center'; g.fillText('+', x + w * .14, y + h * .3 - 11); g.fillText('−', x - w * .14, y + h * .3 - 11);
    g.restore(); return {plus: [x + w * .14, y + h * .3], minus: [x - w * .14, y + h * .3], knob: [x + w * .28, y - h * .12, h * .17]}; }
  function bulb(g, x, y, r, b, o){ o = o || {}; b = clamp(b || 0, 0, 1.5); g.save();
    if (b > .01) { const gl = g.createRadialGradient(x, y, 1, x, y, r * (2 + b * 2.4)); gl.addColorStop(0, `rgba(255,230,140,${.75 * Math.min(1, b)})`); gl.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * (2 + b * 2.4), 0, TAU); g.fill(); }
    g.fillStyle = b > .01 ? `rgba(255,${235 - 30 * Math.min(1, b)},${160 - 60 * Math.min(1, b)},${.35 + .5 * Math.min(1, b)})` : glassFill(); g.strokeStyle = glassStroke(); g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, r, Math.PI * .78, Math.PI * .22); g.lineTo(x + r * .45, y + r * 1.05); g.lineTo(x - r * .45, y + r * 1.05); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = b > .01 ? '#fff6c0' : '#6b737b'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x - r * .3, y + r * .9); g.lineTo(x - r * .3, y); for (let i = 0; i < 5; i++) g.lineTo(x - r * .3 + r * .6 * (i + .5) / 5, y + (i % 2 ? -3 : 3)); g.lineTo(x + r * .3, y); g.lineTo(x + r * .3, y + r * .9); g.stroke();
    g.fillStyle = '#9aa3ab'; g.fillRect(x - r * .48, y + r * 1.05, r * .96, r * .55); g.fillStyle = '#4b535b'; g.fillRect(x - r * .62, y + r * 1.6, r * 1.24, r * .3);
    g.restore(); return {a: [x - r * .62, y + r * 1.75], b: [x + r * .62, y + r * 1.75]}; }
  // 저항(색 띠): 가로, x 가운데
  function resistor(g, x, y, w, o){ o = o || {}; const h = w * .32; g.save(); g.strokeStyle = '#8a949d'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - w / 2 - 12, y); g.lineTo(x + w / 2 + 12, y); g.stroke();
    const gr = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); gr.addColorStop(0, '#f2dcb0'); gr.addColorStop(.5, '#e3c58e'); gr.addColorStop(1, '#c9a46a'); g.fillStyle = gr; rr(g, x - w / 2, y - h / 2, w, h, h / 2); g.fill();
    (o.bands || ['#8b4513', '#111', '#c00', '#c9a227']).forEach((c, i) => { g.fillStyle = c; g.fillRect(x - w / 2 + w * (.2 + i * .17), y - h / 2 + 1, w * .07, h - 2); });
    if (o.label) { g.fillStyle = ink(); g.font = font(11, 700); g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText(o.label, x, y - h / 2 - 4); }
    g.restore(); return {a: [x - w / 2 - 12, y], b: [x + w / 2 + 12, y]}; }
  function sw(g, x, y, w, on, o){ o = o || {}; g.save(); g.fillStyle = D.dark ? '#3a444e' : '#4a545e'; rr(g, x - w / 2 - 8, y - 6, w + 16, 14, 4); g.fill();
    g.fillStyle = '#c9a227'; [x - w / 2, x + w / 2].forEach(cx => { g.beginPath(); g.arc(cx, y, 4.5, 0, TAU); g.fill(); });
    g.strokeStyle = '#d9b84a'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(on ? x + w / 2 : x + w / 2 - 6, on ? y : y - w * .55); g.stroke();
    g.fillStyle = '#2a2f35'; g.beginPath(); g.arc(on ? x + w * .2 : x + w * .15, on ? y : y - w * .33, 5, 0, TAU); g.fill();
    g.restore(); return {a: [x - w / 2, y], b: [x + w / 2, y]}; }
  // 도선: pts [[x,y],...], o.current(-1~1, 전자 아닌 전류 방향), o.t, o.color
  function wire(g, pts, o){ o = o || {}; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 5; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1] + 2) : g.moveTo(p[0], p[1] + 2)); g.stroke();
    g.strokeStyle = o.color || '#d0463b'; g.lineWidth = 3.4; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
    if (o.current && Math.abs(o.current) > .005) { let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push([L, d]); L += d; }
      const sp = 18, off = ((o.t || 0) * 60 * o.current) % sp; g.fillStyle = o.dot || 'rgba(255,240,170,.95)';
      for (let s = (off + sp) % sp; s < L; s += sp) { let i = 0; while (i < seg.length - 1 && s > seg[i][0] + seg[i][1]) i++; const f = (s - seg[i][0]) / seg[i][1], p0 = pts[i], p1 = pts[i + 1]; g.beginPath(); g.arc(p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f, 1.9, 0, TAU); g.fill(); } }
    g.restore(); }
  function node(g, x, y, c){ g.fillStyle = c || '#c9a227'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
  function compass(g, x, y, r, ang, o){ o = o || {}; g.save(); g.fillStyle = D.dark ? '#cfd6dc' : '#e9edf0'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#6b737b'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = '#fafafa'; g.beginPath(); g.arc(x, y, r - 3, 0, TAU); g.fill(); g.translate(x, y); g.rotate(ang);
    g.fillStyle = '#d6332a'; g.beginPath(); g.moveTo(r * .82, 0); g.lineTo(0, r * .18); g.lineTo(0, -r * .18); g.fill(); g.fillStyle = '#3b4650'; g.beginPath(); g.moveTo(-r * .82, 0); g.lineTo(0, r * .18); g.lineTo(0, -r * .18); g.fill();
    g.fillStyle = '#ddd'; g.beginPath(); g.arc(0, 0, 2.2, 0, TAU); g.fill(); g.restore(); }
  function magnet(g, x, y, w, h, o){ o = o || {}; g.save(); g.translate(x, y); g.rotate(o.angle || 0); shadow(g, 0, h / 2, w, .2);
    const L = o.nLeft !== false; g.fillStyle = L ? '#d6332a' : '#2f63c9'; rr(g, -w / 2, -h / 2, w / 2, h, 3); g.fill(); g.fillStyle = L ? '#2f63c9' : '#d6332a'; rr(g, 0, -h / 2, w / 2, h, 3); g.fill();
    g.fillStyle = '#fff'; g.font = font(Math.min(16, h * .55), 800); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L ? 'N' : 'S', -w / 4, 1); g.fillText(L ? 'S' : 'N', w / 4, 1); g.restore(); }
  function coil(g, x, y, w, h, n, o){ o = o || {}; g.save(); g.strokeStyle = o.color || '#c27a33'; g.lineWidth = o.lw || 3;
    if (o.core) { g.fillStyle = '#8b949c'; g.fillRect(x - w / 2 - 14, y - h * .22, w + 28, h * .44); }
    for (let i = 0; i < n; i++) { const xx = x - w / 2 + w * (i + .5) / n; g.beginPath(); g.ellipse(xx, y, w / n * .45 + 1, h / 2, 0, -Math.PI / 2, Math.PI / 2); g.stroke(); }
    g.globalAlpha = .45; for (let i = 0; i < n; i++) { const xx = x - w / 2 + w * (i + .5) / n; g.beginPath(); g.ellipse(xx, y, w / n * .45 + 1, h / 2, 0, Math.PI / 2, Math.PI * 1.5); g.stroke(); }
    g.restore(); return {a: [x - w / 2, y + h / 2], b: [x + w / 2, y + h / 2]}; }

  /* ── 빛 ── */
  function rail(g, x, y, len, o){ o = o || {}; g.save(); shadow(g, x + len / 2, y + 10, len, .2); const gr = g.createLinearGradient(0, y, 0, y + 14); gr.addColorStop(0, '#d5dbe0'); gr.addColorStop(1, '#8e98a1'); g.fillStyle = gr; rr(g, x, y, len, 14, 3); g.fill();
    if (o.ppu) { g.strokeStyle = '#2a3036'; g.fillStyle = '#2a3036'; g.font = font(7.5, 600); g.textAlign = 'center'; g.textBaseline = 'top'; const n = Math.floor(len / o.ppu); for (let i = 0; i <= n; i++) { const M = i % 10 === 0, H5 = i % 5 === 0; g.lineWidth = M ? 1 : .6; g.beginPath(); g.moveTo(x + i * o.ppu, y); g.lineTo(x + i * o.ppu, y + (M ? 7 : H5 ? 5 : 3)); g.stroke(); if (M) g.fillText(i + (o.from || 0), x + i * o.ppu, y + 7); } }
    g.restore(); }
  function holder(g, x, y, h){ g.fillStyle = '#5c6670'; g.fillRect(x - 3, y - h, 6, h); rr(g, x - 12, y - 4, 24, 8, 2); g.fill(); }
  function lens(g, x, y, h, o){ o = o || {}; g.save(); const t = o.thick || h * .14, cv = o.type !== 'concave';
    g.fillStyle = D.dark ? 'rgba(150,200,240,.28)' : 'rgba(160,210,245,.5)'; g.strokeStyle = D.dark ? 'rgba(200,230,255,.8)' : 'rgba(40,90,140,.8)'; g.lineWidth = 1.5; g.beginPath();
    if (cv) { g.moveTo(x, y - h / 2); g.quadraticCurveTo(x + t * 2, y, x, y + h / 2); g.quadraticCurveTo(x - t * 2, y, x, y - h / 2); }
    else { g.moveTo(x - t, y - h / 2); g.lineTo(x + t, y - h / 2); g.quadraticCurveTo(x + t * .2, y, x + t, y + h / 2); g.lineTo(x - t, y + h / 2); g.quadraticCurveTo(x - t * .2, y, x - t, y - h / 2); }
    g.fill(); g.stroke(); g.restore(); }
  function screen(g, x, y, w, h, o){ o = o || {}; g.save(); g.fillStyle = o.color || '#f7f7f4'; rr(g, x - w / 2, y - h, w, h, 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; g.stroke(); g.restore(); }
  function candle(g, x, y, o){ o = o || {}; const h = o.h || 46; g.save(); g.fillStyle = '#f3ead6'; rr(g, x - 7, y - h, 14, h, 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.15)'; g.stroke(); g.fillStyle = '#333'; g.fillRect(x - .8, y - h - 6, 1.6, 6); flame(g, x, y - h - 4, o.s || 18, o.t || 0, {yellow: true}); g.restore(); return y - h - 14; }
  function beam(g, pts, color, o){ o = o || {}; g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalCompositeOperation = D.dark ? 'lighter' : 'source-over';
    g.strokeStyle = rgba(color, o.glowA || .22); g.lineWidth = (o.w || 2) * 4; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
    g.strokeStyle = rgba(color, o.a || .95); g.lineWidth = o.w || 2; if (o.dash) g.setLineDash(o.dash); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
  function laser(g, x, y, ang, o){ o = o || {}; g.save(); g.translate(x, y); g.rotate(ang || 0); const gr = g.createLinearGradient(0, -9, 0, 9); gr.addColorStop(0, '#5d6872'); gr.addColorStop(.5, '#2b3238'); gr.addColorStop(1, '#4a545d'); g.fillStyle = gr; rr(g, -58, -9, 58, 18, 4); g.fill(); g.fillStyle = o.on ? (o.color || '#ff3b30') : '#555'; g.beginPath(); g.arc(-2, 0, 3, 0, TAU); g.fill(); g.restore(); }

  /* ── 기체 ── */
  // 주사기(세로, 끝이 아래): x 가운데, y 끝(바늘 쪽), len 몸통 길이, vol/max(mL)
  function syringe(g, x, y, len, vol, max, o){ o = o || {}; const w = o.w || 34, top = y - len, Y = v => y - 10 - (len - 20) * v / max; g.save();
    g.fillStyle = o.gas ? rgba(o.gas, .12) : 'rgba(255,255,255,.05)'; g.fillRect(x - w / 2, Y(vol), w, y - 10 - Y(vol));
    if (o.particles) o.particles(x - w / 2 + 3, Y(vol) + 10, w - 6, y - 14 - Y(vol) - 10);
    g.fillStyle = glassFill(); g.fillRect(x - w / 2, top, w, len - 10); g.strokeStyle = glassStroke(); g.lineWidth = 1.8; g.strokeRect(x - w / 2, top, w, len - 10);
    g.beginPath(); g.moveTo(x - w / 2 - 12, top); g.lineTo(x + w / 2 + 12, top); g.lineWidth = 3; g.stroke(); g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(x - 6, y - 10); g.lineTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(x + 6, y - 10); g.stroke();
    g.strokeStyle = D.dark ? 'rgba(230,240,250,.7)' : 'rgba(30,45,60,.75)'; g.fillStyle = sub(); g.font = font(8, 500); g.textAlign = 'right'; g.textBaseline = 'middle'; const st = o.step || 2, lb = o.labelEvery || 10;
    for (let v = 0; v <= max + 1e-9; v += st) { const M = Math.abs(v / lb - Math.round(v / lb)) < 1e-6; g.lineWidth = M ? 1 : .6; g.beginPath(); g.moveTo(x + w / 2, Y(v)); g.lineTo(x + w / 2 - (M ? 12 : 6), Y(v)); g.stroke(); if (M) g.fillText(v, x - w / 2 - 4, Y(v)); }
    g.fillStyle = '#3c4650'; g.fillRect(x - w / 2 + 2, Y(vol) - 7, w - 4, 7); g.fillStyle = '#1f2830'; g.fillRect(x - w / 2 + 1, Y(vol) - 9, w - 2, 3);
    g.fillStyle = D.dark ? '#c9d1d8' : '#e4e8ec'; g.fillRect(x - 3.5, top - 50, 7, Y(vol) - 9 - top + 50); rr(g, x - w / 2 - 6, top - 58, w + 12, 9, 3); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke();
    g.restore(); return {plunger: top - 54}; }

  /* ── 생물·화학 소품 ── */
  function dropper(g, x, y, o){ o = o || {}; g.save(); g.fillStyle = o.bulb || '#d8453a'; rr(g, x - 7, y - 56, 14, 22, 6); g.fill(); g.fillStyle = glassFill(); g.strokeStyle = glassStroke(); g.lineWidth = 1.3; g.beginPath(); g.moveTo(x - 4, y - 36); g.lineTo(x - 4, y - 8); g.lineTo(x - 1, y); g.lineTo(x + 1, y); g.lineTo(x + 4, y - 8); g.lineTo(x + 4, y - 36); g.closePath(); g.fill(); g.stroke(); if (o.color) { g.fillStyle = rgba(o.color, .8); g.fillRect(x - 3, y - 20, 6, 14); } g.restore(); }
  function dish(g, x, y, w, o){ o = o || {}; g.save(); shadow(g, x, y, w, .2); g.fillStyle = glassFill(); g.strokeStyle = glassStroke(); g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y - 6, w / 2, w * .16, 0, 0, TAU); g.fill(); g.stroke();
    if (o.color) { g.fillStyle = rgba(o.color, o.alpha || .6); g.beginPath(); g.ellipse(x, y - 5, w / 2 - 4, w * .16 - 3, 0, 0, TAU); g.fill(); }
    if (o.inner) o.inner(x, y - 5, w / 2 - 4, w * .16 - 3);
    g.beginPath(); g.moveTo(x - w / 2, y - 6); g.lineTo(x - w / 2, y - 1); g.ellipse(x, y - 1, w / 2, w * .16, 0, Math.PI, 0, true); g.lineTo(x + w / 2, y - 6); g.stroke(); g.restore(); }

  /* ── 표시 ── */
  // 이름표(알약 모양). o.to: 가리킬 점
  function tag(g, text, x, y, o){ o = o || {}; g.save(); g.font = font(o.size || 11, 600); const tw = g.measureText(text).width, ph = 20 * D.k, pw = tw + 14;
    if (o.to) { g.strokeStyle = o.line || (D.dark ? 'rgba(220,235,250,.5)' : 'rgba(30,45,60,.45)'); g.lineWidth = 1; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x, y); g.lineTo(o.to[0], o.to[1]); g.stroke(); g.setLineDash([]); g.fillStyle = g.strokeStyle; g.beginPath(); g.arc(o.to[0], o.to[1], 2.5, 0, TAU); g.fill(); }
    g.fillStyle = o.bg || (D.dark ? 'rgba(10,16,22,.85)' : 'rgba(255,255,255,.92)'); rr(g, x - pw / 2, y - ph / 2, pw, ph, ph / 2); g.fill(); g.strokeStyle = o.border || (D.dark ? 'rgba(255,255,255,.12)' : 'rgba(20,30,40,.14)'); g.lineWidth = 1; g.stroke();
    g.fillStyle = o.color || ink(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + .5); g.restore(); }
  function txt(g, text, x, y, o){ o = o || {}; g.save(); g.font = font(o.size || 12, o.weight || 500, o.mono); g.fillStyle = o.color || ink(); g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle'; if (o.halo) { g.lineWidth = 4; g.strokeStyle = D.dark ? 'rgba(10,16,22,.9)' : 'rgba(255,255,255,.9)'; g.strokeText(text, x, y); } g.fillText(text, x, y); g.restore(); }
  // 누를 곳 안내(맥박치는 고리)
  function hint(g, x, y, t, r){ r = r || 22; const p = (t * 1.2) % 1; g.save(); g.strokeStyle = `rgba(255,196,60,${1 - p})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r * (.6 + p * .7), 0, TAU); g.stroke(); g.strokeStyle = 'rgba(255,196,60,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r * .55, 0, TAU); g.stroke(); g.restore(); }
  function arrow(g, x0, y0, x1, y1, o){ o = o || {}; const a = Math.atan2(y1 - y0, x1 - x0), hl = o.head || 10; g.save(); g.strokeStyle = g.fillStyle = o.color || ink(); g.lineWidth = o.w || 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(a) * hl * .7, y1 - Math.sin(a) * hl * .7); g.stroke();
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(a - .42) * hl, y1 - Math.sin(a - .42) * hl); g.lineTo(x1 - Math.cos(a + .42) * hl, y1 - Math.sin(a + .42) * hl); g.closePath(); g.fill(); g.restore(); }
  // 확대창: 둥근 창에 fn(g)로 그린 내용을 확대해 보여 준다
  function loupe(g, x, y, r, cx, cy, z, fn, o){ o = o || {}; g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = o.bg || (D.dark ? '#1b252e' : '#f4f7f9'); g.fillRect(x - r, y - r, r * 2, r * 2); g.translate(x, y); g.scale(z, z); g.translate(-cx, -cy); fn(g); g.restore();
    g.save(); g.strokeStyle = o.ring || '#2c3640'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); if (o.label) tag(g, o.label, x, y + r + 14); g.restore(); }


  /* 데이터 기록기(센서 인터페이스): x,y 왼쪽 위. ch = [[이름, 값 문자열, 색, 단위], ...], o.rec 기록 중 깜빡임, o.t */
  function logger(g, x, y, ch, o){ o = o || {}; const w = o.w || 190, rowH = o.rowH || 44, h = 30 + ch.length * rowH + 22; g.save(); shadow(g, x + w / 2, y + h, w, .3);
    const bd = g.createLinearGradient(0, y, 0, y + h); bd.addColorStop(0, '#34404b'); bd.addColorStop(1, '#1d252d'); g.fillStyle = bd; rr(g, x, y, w, h, 12); g.fill();
    g.fillStyle = '#081510'; rr(g, x + 10, y + 10, w - 20, h - 34, 6); g.fill();
    txt(g, o.title || '데이터 기록기', x + w / 2, y + h - 12, {size: 10, color: '#b9c6d2', weight: 600});
    ch.forEach(([n, v, c, u], i) => { const ry = y + 34 + i * rowH; txt(g, n, x + 20, ry - 12, {size: 9, color: '#8aa0b2', align: 'left', weight: 600}); g.save(); g.shadowColor = c; g.shadowBlur = 6; txt(g, v, x + w - 40, ry + 6, {size: 22, color: c, align: 'right', mono: true, weight: 600}); g.restore(); txt(g, u || '°C', x + w - 34, ry + 10, {size: 10, color: c, align: 'left', weight: 600}); });
    if (o.rec && Math.floor((o.t || 0) * 2) % 2) { g.fillStyle = '#ff4d4d'; g.beginPath(); g.arc(x + w - 20, y + 20, 4, 0, TAU); g.fill(); txt(g, 'REC', x + w - 30, y + 20, {size: 8, color: '#ff8a8a', align: 'right', weight: 700}); }
    g.restore(); return {w, h}; }
  /* 입자 확대 원: 입자 n개가 온도(빠르기 0~1)에 맞춰 떨림·이동. seed로 같은 배치 유지 */
  function particles(g, x, y, r, n, speed, t, o){ o = o || {}; g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = o.bg || (D.dark ? '#13202b' : '#eef6fc'); g.fillRect(x - r, y - r, r * 2, r * 2);
    const pr = o.pr || 5; for (let i = 0; i < n; i++) { const a = i * 2.399, rad = Math.sqrt((i + .5) / n) * (r - pr - 2), bx = x + Math.cos(a) * rad, by = y + Math.sin(a) * rad, A = (o.amp || 6) * (.2 + speed);
      const px = bx + Math.sin(t * (2 + 9 * speed) + i * 1.7) * A, py = by + Math.cos(t * (2.3 + 9 * speed) + i * 2.3) * A;
      const gr = g.createRadialGradient(px - pr * .35, py - pr * .35, 1, px, py, pr); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, o.color || '#3b82c4'); g.fillStyle = gr; g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fill(); }
    g.restore(); g.strokeStyle = o.ring || (D.dark ? '#9fb0c0' : '#2c3640'); g.lineWidth = 3; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); if (o.label) tag(g, o.label, x, y + r + 14); }

  /* ── 준비물 아이콘 (60×60) ── */
  const ICON = {
    beaker: g => beaker(g, 30, 54, 34, 40, {level: .5, marks: true, ticks: 3}),
    flask: g => flask(g, 30, 55, 36, 46, {level: .4}),
    tube: g => tube(g, 30, 56, 13, 48, {level: .4, color: '#e9a23b'}),
    tubes: g => { tube(g, 20, 56, 11, 44, {level: .45}); tube(g, 40, 56, 11, 44, {level: .45, color: '#e9a23b'}); },
    cylinder: g => cylinder(g, 30, 58, 14, 52, {max: 50, vol: 28, major: 10, minor: 5}),
    thermo: g => { lcd(g, 6, 8, 48, 24, '25.0', {size: 11}); probe(g, 30, 38, 56, {handle: '#e2a03a'}); },
    thermoglass: g => thermoGlass(g, 30, 4, 58, 40, {scale: false}),
    hotplate: g => hotplate(g, 30, 54, 50, {on: true, power: .7}),
    lamp: g => { g.save(); g.translate(30, 58); g.scale(.75, .75); lamp(g, 0, 0, {lit: true, t: 0}); g.restore(); },
    stand: g => { g.save(); g.translate(14, 58); g.scale(.45, .45); stand(g, 0, 0, 120); clamp2(g, 0, -90, 60); g.restore(); },
    balance: g => balance(g, 30, 52, 50, '0.0'),
    stopwatch: g => stopwatch(g, 30, 33, 22, 12.3, {digital: false}),
    spring: g => { g.fillStyle = '#5c6670'; g.fillRect(14, 6, 32, 4); spring(g, 30, 10, 46, {n: 10, w: 14}); g.strokeStyle = '#7d8790'; g.lineWidth = 2; g.beginPath(); g.arc(30, 50, 4, 0, TAU); g.stroke(); },
    mass: g => { mass(g, 22, 10, {w: 22, h: 18}); mass(g, 40, 24, {w: 18, h: 14}); },
    scale: g => springScale(g, 30, 0, 36, 1.2, {max: 2, minor: .5}),
    ruler: g => { g.save(); g.translate(4, 44); g.rotate(-.35); ruler(g, 0, 0, 52, {ppu: 10}); g.restore(); },
    block: g => block(g, 30, 50, 44, 24),
    cart: g => cart(g, 30, 52, 46),
    ammeter: g => meter(g, 30, 30, 22, .6, {max: 1, label: 'A', terms: false, ticks: 5}),
    voltmeter: g => meter(g, 30, 30, 22, .4, {max: 1, label: 'V', terms: false, ticks: 5, color: '#1f5fbf'}),
    battery: g => battery(g, 30, 32, 44, 20, {label: '1.5V'}),
    supply: g => supply(g, 30, 32, 52, 40, 3),
    bulb: g => bulb(g, 30, 24, 12, .8),
    resistor: g => resistor(g, 30, 30, 30, {}),
    switch: g => sw(g, 30, 34, 26, false),
    wire: g => wire(g, [[6, 44], [20, 20], [40, 40], [54, 16]], {}),
    compass: g => compass(g, 30, 30, 22, -.6),
    magnet: g => magnet(g, 30, 30, 50, 18, {}),
    coil: g => coil(g, 30, 30, 40, 26, 7, {core: false}),
    lens: g => lens(g, 30, 30, 48, {}),
    candle: g => candle(g, 30, 58, {h: 30, s: 13}),
    screen: g => screen(g, 30, 56, 34, 46),
    laser: g => { laser(g, 44, 30, 0, {on: true}); beam(g, [[44, 30], [58, 30]], '#ff3b30', {w: 1.5}); },
    syringe: g => { g.save(); g.translate(30, 58); g.scale(.55, .55); syringe(g, 0, 0, 80, 30, 50, {}); g.restore(); },
    gauge: g => gauge(g, 30, 30, 24, 101, {max: 200}),
    dropper: g => { g.save(); g.translate(30, 58); g.rotate(.4); dropper(g, 0, 0, {color: '#5b3fa8'}); g.restore(); },
    dish: g => dish(g, 30, 44, 48, {color: '#ccd6a6', alpha: .5}),
    microscope: g => { g.save(); g.fillStyle = '#2f3a44'; rr(g, 12, 50, 36, 7, 2); g.fill(); g.fillRect(36, 18, 6, 34); g.fillStyle = '#e8ecef'; g.save(); g.translate(26, 20); g.rotate(-.35); rr(g, -5, -16, 10, 30, 3); g.fill(); g.restore(); g.fillStyle = '#2f3a44'; g.fillRect(16, 36, 24, 4); g.fillStyle = '#c9a227'; g.fillRect(27, 30, 4, 6); g.restore(); },
    slide: g => { g.save(); g.fillStyle = 'rgba(200,225,245,.55)'; g.strokeStyle = glassStroke(); g.lineWidth = 1.2; rr(g, 6, 22, 48, 16, 2); g.fill(); g.stroke(); g.fillStyle = 'rgba(160,110,200,.5)'; g.fillRect(24, 25, 12, 10); g.restore(); },
    sensor: g => { lcd(g, 8, 10, 44, 26, '1.00', {size: 11, color: '#8ad0ff'}); g.strokeStyle = '#2b2f33'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 36); g.lineTo(30, 54); g.stroke(); },
    prism: g => { g.fillStyle = 'rgba(180,215,245,.5)'; g.strokeStyle = glassStroke(); g.lineWidth = 1.4; g.beginPath(); g.moveTo(30, 10); g.lineTo(52, 50); g.lineTo(8, 50); g.closePath(); g.fill(); g.stroke(); },
    paper: g => { g.fillStyle = '#fbfaf5'; g.strokeStyle = 'rgba(0,0,0,.25)'; rr(g, 16, 6, 28, 50, 2); g.fill(); g.stroke(); ['#e04b3a', '#2f7bd9', '#2e9a54'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(24 + i * 6, 46, 2, 0, TAU); g.fill(); }); },
    funnel: g => { g.fillStyle = glassFill(); g.strokeStyle = glassStroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(10, 12); g.lineTo(50, 12); g.lineTo(33, 34); g.lineTo(33, 56); g.lineTo(27, 56); g.lineTo(27, 34); g.closePath(); g.fill(); g.stroke(); },
    egg: g => { g.fillStyle = '#f6efe2'; g.strokeStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(30, 32, 16, 21, 0, 0, TAU); g.fill(); g.stroke(); },
    leaf: g => { g.fillStyle = '#3f9a4a'; g.beginPath(); g.moveTo(10, 50); g.quadraticCurveTo(14, 10, 52, 8); g.quadraticCurveTo(46, 46, 10, 50); g.fill(); g.strokeStyle = '#2b6f34'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(10, 50); g.lineTo(48, 12); g.stroke(); },
    goggles: g => { g.fillStyle = 'rgba(120,190,240,.45)'; g.strokeStyle = '#2c3640'; g.lineWidth = 2.5; rr(g, 6, 22, 22, 16, 7); g.fill(); g.stroke(); rr(g, 32, 22, 22, 16, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(28, 28); g.lineTo(32, 28); g.stroke(); },
    gloves: g => { g.fillStyle = '#7fb5e8'; rr(g, 16, 18, 26, 34, 8); g.fill(); [0, 1, 2, 3].forEach(i => { rr(g, 17 + i * 6.5, 6, 5.5, 18, 3); g.fill(); }); },
    // 이모지 대신 쓰는 그림 (60×60)
    person: g => { g.fillStyle = '#f0c3a2'; g.beginPath(); g.arc(30, 10, 7, 0, TAU); g.fill(); g.fillStyle = '#3a5a8a'; rr(g, 22, 18, 16, 22, 5); g.fill(); g.strokeStyle = '#3a5a8a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(24, 22); g.lineTo(18, 36); g.moveTo(36, 22); g.lineTo(42, 36); g.stroke(); g.strokeStyle = '#2c3640'; g.beginPath(); g.moveTo(26, 40); g.lineTo(25, 56); g.moveTo(34, 40); g.lineTo(35, 56); g.stroke(); },
    eye: g => { g.fillStyle = '#fff'; g.strokeStyle = '#2c3640'; g.lineWidth = 2; g.beginPath(); g.moveTo(6, 30); g.quadraticCurveTo(30, 8, 54, 30); g.quadraticCurveTo(30, 52, 6, 30); g.fill(); g.stroke(); g.fillStyle = '#5a7a3a'; g.beginPath(); g.arc(30, 30, 10, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(30, 30, 5, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(27, 27, 2, 0, TAU); g.fill(); },
    burst: g => { g.fillStyle = '#f2b636'; g.strokeStyle = '#d0412f'; g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, r = i % 2 ? 12 : 27; g.lineTo(30 + Math.cos(a) * r, 30 + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); },
    headphone: g => { g.strokeStyle = '#2c3640'; g.lineWidth = 4; g.beginPath(); g.arc(30, 32, 18, Math.PI, 0); g.stroke(); g.fillStyle = '#2c3640'; rr(g, 8, 30, 9, 16, 3); g.fill(); rr(g, 43, 30, 9, 16, 3); g.fill(); },
    factory: g => { g.fillStyle = '#8a8f96'; g.fillRect(6, 30, 48, 26); g.beginPath(); g.moveTo(6, 30); g.lineTo(18, 22); g.lineTo(18, 30); g.lineTo(30, 22); g.lineTo(30, 30); g.closePath(); g.fill(); g.fillStyle = '#6a6f76'; g.fillRect(40, 8, 8, 24); g.fillStyle = 'rgba(160,160,160,.6)'; [[44, 4, 4], [48, -2, 5]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y + 4, r, 0, TAU); g.fill(); }); g.fillStyle = '#f2d36a'; [12, 24, 36].forEach(x => g.fillRect(x, 40, 7, 6)); },
    transformer: g => { g.fillStyle = '#7a8a9a'; rr(g, 14, 20, 32, 34, 4); g.fill(); g.fillStyle = '#5a6a7a'; for (let i = 0; i < 5; i++) g.fillRect(10, 24 + i * 6, 40, 2); [20, 30, 40].forEach(x => { g.fillStyle = '#d8dde2'; g.fillRect(x - 2, 8, 4, 12); g.beginPath(); g.arc(x, 8, 3, 0, TAU); g.fill(); }); },
    city: g => { [[4, 26, 12, '#7a8a9a'], [16, 14, 12, '#8a9aaa'], [28, 22, 10, '#6a7a8a'], [38, 8, 14, '#9aa8b8'], [52, 28, 6, '#7a8a9a']].forEach(([x, y, w, c]) => { g.fillStyle = c; g.fillRect(x, y, w, 56 - y); g.fillStyle = '#f2d36a'; for (let yy = y + 4; yy < 52; yy += 7) for (let xx = x + 2; xx < x + w - 3; xx += 5) g.fillRect(xx, yy, 2, 3); }); },
    extinct: g => { g.fillStyle = '#d0412f'; g.beginPath(); g.moveTo(18, 14); g.lineTo(42, 14); g.lineTo(30, 38); g.closePath(); g.fill(); },
    trilobite: g => { g.fillStyle = '#8a7a6a'; g.beginPath(); g.ellipse(30, 32, 15, 22, 0, 0, TAU); g.fill(); g.fillStyle = '#a8988a'; g.beginPath(); g.ellipse(30, 32, 5, 20, 0, 0, TAU); g.fill(); g.strokeStyle = '#5a4a3a'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(16, 22 + i * 3.4); g.lineTo(44, 22 + i * 3.4); g.stroke(); } g.fillStyle = '#7a6a5a'; g.beginPath(); g.arc(30, 14, 12, Math.PI, 0); g.fill(); },
    armorfish: g => { g.fillStyle = '#7a8a9a'; g.beginPath(); g.moveTo(6, 30); g.quadraticCurveTo(14, 16, 28, 20); g.lineTo(46, 26); g.lineTo(56, 18); g.lineTo(54, 32); g.lineTo(56, 44); g.lineTo(46, 36); g.lineTo(28, 40); g.quadraticCurveTo(14, 44, 6, 30); g.fill(); g.fillStyle = '#5a6a7a'; g.beginPath(); g.moveTo(6, 30); g.quadraticCurveTo(14, 16, 26, 20); g.lineTo(26, 40); g.quadraticCurveTo(14, 44, 6, 30); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(13, 28, 2, 0, TAU); g.fill(); },
    fern: g => { g.strokeStyle = '#3f7a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(30, 58); g.quadraticCurveTo(28, 30, 36, 6); g.stroke(); g.fillStyle = '#4f9a3a'; for (let i = 0; i < 9; i++) { const y = 50 - i * 5, x = 30 + i * .7; [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(x + sd * (10 - i * .8), y, 9 - i * .8, 2.4, sd * -.4, 0, TAU); g.fill(); }); } },
    dino: g => { g.fillStyle = '#6a8a4a'; g.beginPath(); g.ellipse(32, 34, 16, 10, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(42, 30); g.quadraticCurveTo(50, 10, 54, 8); g.lineTo(57, 10); g.quadraticCurveTo(52, 16, 48, 34); g.fill(); g.beginPath(); g.moveTo(18, 34); g.quadraticCurveTo(6, 40, 2, 48); g.lineTo(6, 48); g.quadraticCurveTo(14, 42, 22, 40); g.fill(); [24, 38].forEach(x => g.fillRect(x, 40, 5, 16)); },
    ammonite: g => { g.strokeStyle = '#8a6a4a'; g.fillStyle = '#d8b88a'; g.lineWidth = 3; g.beginPath(); g.arc(30, 30, 22, 0, TAU); g.fill(); g.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU * 3, r = 2 + i / 120 * 20; g.lineTo(30 + Math.cos(a) * r, 30 + Math.sin(a) * r); } g.stroke(); },
    conifer: g => { g.fillStyle = '#6a4a2a'; g.fillRect(27, 44, 6, 14); g.fillStyle = '#2f6a3a'; [[30, 4, 12, 22], [30, 14, 17, 34], [30, 24, 22, 46]].forEach(([x, t, w, b]) => { g.beginPath(); g.moveTo(x, t); g.lineTo(x + w, b); g.lineTo(x - w, b); g.closePath(); g.fill(); }); },
    mammoth: g => { g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(28, 28, 20, 15, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(46, 22, 10, 0, TAU); g.fill(); g.strokeStyle = '#7a5a3a'; g.lineWidth = 5; g.beginPath(); g.moveTo(52, 26); g.quadraticCurveTo(56, 44, 50, 52); g.stroke(); g.strokeStyle = '#f2ead8'; g.lineWidth = 3; g.beginPath(); g.moveTo(48, 30); g.quadraticCurveTo(60, 40, 52, 46); g.stroke(); g.fillStyle = '#7a5a3a'; [14, 22, 32, 40].forEach(x => g.fillRect(x, 36, 6, 18)); },
    primate: g => { g.fillStyle = '#8a6a4a'; g.beginPath(); g.ellipse(30, 36, 11, 14, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(30, 16, 9, 0, TAU); g.fill(); g.fillStyle = '#e8c8a8'; g.beginPath(); g.ellipse(30, 18, 6, 5, 0, 0, TAU); g.fill(); g.fillStyle = '#111'; [27, 33].forEach(x => { g.beginPath(); g.arc(x, 15, 1.4, 0, TAU); g.fill(); }); g.strokeStyle = '#8a6a4a'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(20, 30); g.lineTo(12, 44); g.moveTo(40, 30); g.lineTo(48, 44); g.moveTo(24, 48); g.lineTo(22, 58); g.moveTo(36, 48); g.lineTo(38, 58); g.stroke(); },
    flower: g => { g.strokeStyle = '#3f8a3a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(30, 58); g.lineTo(30, 26); g.stroke(); for (let i = 0; i < 6; i++) { g.save(); g.translate(30, 22); g.rotate(i * TAU / 6); g.fillStyle = '#e86a9a'; g.beginPath(); g.ellipse(0, -9, 5, 9, 0, 0, TAU); g.fill(); g.restore(); } g.fillStyle = '#f2c23a'; g.beginPath(); g.arc(30, 22, 5, 0, TAU); g.fill(); },
  };
  function iconAt(g, name, x, y, size){ g.save(); g.translate(x - (size || 60) / 2, y - (size || 60) / 2); const ok = icon(g, name, size); g.restore(); return ok; }   // 가운데 (x, y)에 그리기
  function icon(g, name, size){ const s = (size || 60) / 60; g.save(); g.scale(s, s); const f = ICON[name]; if (f) { const k = D.k; D.k = 1; try { f(g); } finally { D.k = k; } } g.restore(); return !!f; }

  return Object.assign(D, {font, rr, rgba, mix, clamp, bg, shadow, beaker, flask, tube, cylinder, bubbles, steam, flame, lamp, hotplate, stand, clamp2, lcd, balance, stopwatch, meter, gauge, probe, thermoGlass,
    spring, hspring, mass, springScale, ruler, block, cart, battery, supply, bulb, resistor, sw, wire, node, compass, magnet, coil, rail, holder, lens, screen, candle, beam, laser, syringe, dropper, dish, tag, txt, hint, arrow, loupe, logger, particles, icon, iconAt, ICON, ink, sub});
})();
