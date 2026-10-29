/* ═══════════════ 학습지 부품 : 모든 소단원이 함께 쓰는 틀 ═══════════════
   선생님 학습지는 늘 같은 틀이다 : 개념(빈칸) → 표 → 공식 유도(단계) → ▶ 이 식이 말하는 것 → 주의 1 · 2 → 예제.
   글 속 표기 : {{③|cos θ}} 빈칸(번호|답), [[분자|분모]] 분수, ^{2} 위첨자.
   장면 파일은 KIT.* 만 쓰고, 최상위에 엔진과 같은 이름을 만들지 않는다. */
const KIT = (function () {
  const K = {};
  let uid = 0;

  /* ── 글 ── */
  K.t = function (s) {
    const out = [];
    String(s).split(/(\{\{[^}]*\}\}|\[\[[^\]]*\]\])/).forEach(function (part) {
      if (!part) return;
      let m = /^\{\{([^|]*)\|([^}]*)\}\}$/.exec(part);
      if (m) { out.push(blank(m[1], m[1], m[2])); return; }
      m = /^\[\[([^|]*)\|([^\]]*)\]\]$/.exec(part);
      if (m) { out.push(K.frac(m[1].trim(), m[2].trim())); return; }
      out.push.apply(out, rich(part));
    });
    return out;
  };
  K.frac = function (a, b) { return h('span', { class: 'frac' }, h('span', { class: 'fn' }, rich(a)), h('span', { class: 'fd' }, rich(b))); };
  K.p = function (s, cls, style) { return h('p', { class: cls === undefined ? 'ws' : cls, style: style || null }, K.t(s)); };
  K.cap = function (s) { return h('p', { class: 'cap', text: s }); };
  K.hint = function (s, style) { return h('p', { class: 'hint', style: style || null }, K.t(s)); };
  K.callout = function (s, good, style) { return h('div', { class: 'callout' + (good ? ' good' : ''), style: style || null }, K.t(s)); };
  /** ▶ 이 식이 말하는 것 */
  K.means = function (s, style) { return h('div', { class: 'callout kit-means', style: style || null }, h('b', { text: '▶ 이 식이 말하는 것 : ' }), K.t(s)); };
  K.table = function (head, rows, o) {
    o = o || {};
    return h('table', { class: 't1' + (o.big ? ' big' : ''), style: o.style || null },
      o.cols ? h('colgroup', {}, o.cols.map(function (w) { return h('col', { style: 'width:' + w }); })) : null,
      h('thead', {}, h('tr', {}, head.map(function (c) { return h('th', {}, K.t(c)); }))),
      h('tbody', {}, rows.map(function (r) { return h('tr', {}, r.map(function (c, i) { return h('td', { class: i === 0 && !o.plain ? 'pname' : null }, K.t(c)); })); })));
  };

  /* ── 단추 ── */
  K.tabs = function (names, onPick) {
    return names.map(function (t, i) { return h('button', { class: 'tab', type: 'button', role: 'tab', style: 'min-height:64px', onclick: function () { onPick(i); } }, h('b', { text: t })); });
  };
  K.select = function (tabs, i) { tabs.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); }); };
  K.tabBar = function (tabs) { return h('div', { class: 'tabs', role: 'tablist', style: 'grid-template-columns:repeat(' + tabs.length + ',1fr)' }, tabs); };
  /** 여럿 가운데 하나 고르기 : { el, set, get } */
  K.seg = function (labels, value, onChange, small) {
    let v = value;
    const btns = labels.map(function (l, i) {
      return h('button', { class: 'btn' + (small === false ? '' : ' small'), type: 'button', text: l, onclick: function () { v = i; sync(); if (onChange) onChange(i); } });
    });
    function sync() { btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === v)); }); }
    sync();
    return { el: h('div', { class: 'seg' }, btns), set: function (i) { v = i; sync(); }, get: function () { return v; } };
  };
  K.btn = function (label, onClick, primary) { return h('button', { class: 'btn' + (primary ? ' primary' : ''), type: 'button', text: label, onclick: onClick }); };
  /** 큰 슬라이더 : { el, get, input } */
  K.slider = function (label, min, max, step, value, fmt, labelW) {
    const id = 'kit-s' + (++uid);
    const input = h('input', { class: 'big', type: 'range', id: id, min: min, max: max, step: step, value: value, 'aria-label': label });
    const out = h('output', { for: id });
    const sync = function () { setText(out, fmt ? fmt(+input.value) : String(input.value)); };
    input.addEventListener('input', sync); sync();
    return { el: h('div', { class: 'slider', style: 'grid-template-columns:' + (labelW || 'auto') + ' 1fr auto' }, h('label', { for: id, text: label }), input, out), get: function () { return +input.value; }, input: input, sync: sync };
  };

  /* ── 장면 틀 ── */
  /** 왼쪽 그림(캔버스 + 단추) · 오른쪽 학습지 글 */
  K.split = function (root, cv, ctrl, right, o) {
    o = o || {};
    root.append(h('div', { class: 'row', style: 'height:100%;gap:22px' },
      h('section', { class: 'panel col fix', style: 'padding:0;gap:0;width:' + (cv.w + 4) + 'px;justify-content:' + (o.center ? 'center' : 'flex-start') },
        cv.c, ctrl && ctrl.length ? h('div', { class: 'ctrl', style: 'padding:6px 22px 16px;gap:12px;flex-wrap:wrap' }, ctrl) : null, o.under || null),
      h('section', { class: 'panel col fill pad', style: 'gap:' + (o.gap || 16) + 'px;min-height:0' }, right)));
  };
  /** 공식 유도 : 단계를 하나씩 연다. { el, buttons, get, on } */
  K.steps = function (list, o) {
    o = o || {};
    let n = 0, cb = null;
    const box = h('div', { class: 'kit-steps', style: 'grid-template-columns:repeat(' + (o.cols || 2) + ',minmax(0,1fr))' });
    const next = h('button', { class: 'btn primary', type: 'button', style: 'min-width:220px', onclick: function () { if (n < list.length) { n++; render(); } } });
    const reset = h('button', { class: 'btn', type: 'button', text: '처음부터', onclick: function () { n = 0; render(); } });
    function render() {
      box.replaceChildren.apply(box, list.map(function (s, i) {
        return h('div', { class: 'step' + (i < n ? ' on' : '') },
          h('span', { class: 's-no', text: (i + 1) + '단계' }),
          h('span', { class: 's-what' }, K.t(s.what)),
          s.eq ? h('span', { class: 's-eq' }, K.t(s.eq)) : null,
          s.note ? h('span', { class: 's-note' }, K.t(s.note)) : null);
      }));
      next.disabled = n >= list.length;
      next.textContent = n >= list.length ? '단계 끝' : '다음 단계 (' + (n + 1) + '/' + list.length + ')';
      if (cb) cb(n);
    }
    render();
    return { el: box, buttons: h('div', { class: 'row', style: 'gap:12px;margin-top:auto' }, next, reset), get: function () { return n; }, on: function (f) { cb = f; f(n); } };
  };
  /** 공식 유도 장면 : 왼쪽 그림 + ▶, 오른쪽 단계 */
  K.derive = function (root, d) {
    const st = K.steps(d.steps, { cols: d.cols });
    root.append(h('div', { class: 'row', style: 'height:100%;gap:22px' },
      h('section', { class: 'panel col fix', style: 'padding:0;gap:0;width:' + (d.cv.w + 4) + 'px' }, d.cv.c,
        d.ctrl && d.ctrl.length ? h('div', { class: 'ctrl', style: 'padding:4px 22px 8px;gap:12px;flex-wrap:wrap' }, d.ctrl) : null,
        d.means ? h('div', { style: 'padding:6px 22px 20px;margin-top:auto' }, K.means(d.means, 'font-size:26px')) : null),
      h('section', { class: 'panel col fill pad', style: 'gap:14px;min-height:0' },
        K.cap('공식 유도 ─ ' + d.title), d.intro ? K.p(d.intro, 'ws sm', 'font-size:26px') : null, st.el, d.after || null, st.buttons)));
    return st;
  };
  /** 주의 : 틀린 생각 → 왜 틀렸나 → 올바른 이해. 카드가 둘이면 탭. visual = { w, h, draw(c, which, dt, now), ctrl(which) } */
  K.mis = function (root, cards, visual) {
    let which = 0;
    const cv = visual ? makeCanvas(visual.w, visual.h) : null;
    const tabs = cards.length > 1 ? K.tabs(cards.map(function (c, i) { return '주의 ' + (i + 1) + ' · ' + c.short; }), function (i) { which = i; render(); }) : null;
    const textBox = h('div', { class: 'col', style: 'gap:0' });
    const ctrl = h('div', { class: 'ctrl', style: 'padding:6px 22px 16px;gap:12px;flex-wrap:wrap' });
    const lines = [];
    function render() {
      if (tabs) K.select(tabs, which);
      const cd = cards[which];
      textBox.replaceChildren(); lines.length = 0;
      textBox.append(K.cap(cards.length > 1 ? '주의 ' + (which + 1) : '주의'), h('p', { class: 'big-q', style: 'font-size:44px;margin:6px 0 16px', text: cd.q }));
      [['틀린 생각', cd.wrong], ['왜 틀렸나', cd.why], ['올바른 이해', cd.right]].forEach(function (pair, i) {
        const line = h('div', { class: 'mis-line' + (i === 0 ? ' on' : '') }, h('b', { text: pair[0] }), h('span', { class: 'body' }, K.t(pair[1])));
        lines.push(line); textBox.append(line);
      });
      textBox.append(h('div', { class: 'row', style: 'margin-top:12px;gap:14px' },
        K.btn('다음 줄 보기', function () { const n = lines.filter(function (l) { return l.classList.contains('on'); }).length; if (n < lines.length) lines[n].classList.add('on'); }),
        K.btn('다시 가리기', function () { lines.forEach(function (l, i) { l.classList.toggle('on', i === 0); }); })));
      ctrl.replaceChildren();
      if (visual && visual.ctrl) add(ctrl, visual.ctrl(which));
      ctrl.hidden = !ctrl.childNodes.length;
    }
    const body = h('div', { class: 'row', style: 'gap:20px;flex:1;min-height:0' },
      h('section', { class: 'panel pad fill' }, textBox),
      cv ? h('section', { class: 'panel col fix', style: 'padding:0;gap:0;justify-content:center;width:' + (visual.w + 4) + 'px' }, cv.c, ctrl) : null);
    root.append(h('div', { class: 'col', style: 'height:100%;gap:14px' }, tabs ? K.tabBar(tabs) : null, body));
    render();
    return {
      annoKey: function () { return 'mis:' + which; },
      tick: function (dt, now) { if (cv) { cv.ctx.clearRect(0, 0, visual.w, visual.h); visual.draw(cv.ctx, which, dt, now); } },
      which: function () { return which; },
    };
  };

  /* ── 그리기 ── */
  K.dash = function (c, x1, y1, x2, y2, color, w, pat) {
    c.strokeStyle = color || COL.line; c.lineWidth = w || 3; c.setLineDash(pat || [12, 10]);
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
  };
  K.line = function (c, pts, color, w) {
    c.strokeStyle = color || COL.ink; c.lineWidth = w || 4; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.stroke();
  };
  /** 화살표 + 끝에 이름 (크기가 0 에 가까우면 그리지 않는다) */
  K.vec = function (c, x, y, dx, dy, color, label, o) {
    o = o || {};
    const L = Math.hypot(dx, dy);
    if (L < 2) return;
    arrow(c, x, y, x + dx, y + dy, { width: o.width || 7, color: color, head: o.head || 24, dash: o.dash });
    if (label) {
      const ux = dx / L, uy = dy / L, off = o.off || 24;
      txt(c, label, x + dx + ux * off + (o.lx || 0), y + dy + uy * off + (o.ly || 0), { size: o.size || 26, weight: 700, color: color, align: 'center', halo: true });
    }
  };
  /** 그래프 축 : { x, y, w, h } 상자, 이름. 돌려주는 X(u) · Y(v) 는 0~1 을 화면 자리로 */
  K.axes = function (c, b, xl, yl, o) {
    o = o || {};
    const y0 = b.y + b.h * (o.zero === undefined ? 1 : o.zero);
    arrow(c, b.x, y0, b.x + b.w + 16, y0, { width: 3, color: COL['ink-2'], head: 14 });
    arrow(c, b.x, b.y + b.h, b.x, b.y - 14, { width: 3, color: COL['ink-2'], head: 14 });
    if (xl) txt(c, xl, b.x + b.w + 10, y0 + 28, { size: o.size || 22, color: COL.muted, align: 'right' });
    if (yl) txt(c, yl, b.x + 14, b.y - 6, { size: o.size || 22, color: COL.muted });
    return { X: function (u) { return b.x + u * b.w; }, Y: function (v) { return y0 - v * b.h * (o.zero === undefined ? 1 : o.zero); }, y0: y0 };
  };
  K.plot = function (c, ax, fn, u0, u1, color, w, n) {
    const pts = [], k = n || 120;
    for (let i = 0; i <= k; i++) { const u = u0 + (u1 - u0) * i / k; pts.push([ax.X(u), ax.Y(fn(u))]); }
    K.line(c, pts, color, w || 5);
  };
  /** 용수철 : (x1, y) 에서 (x2, y) 까지 n 번 감김 */
  K.spring = function (c, x1, y1, x2, y2, n, amp, color) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux, pts = [[x1, y1]];
    const lead = Math.min(24, L * 0.12);
    pts.push([x1 + ux * lead, y1 + uy * lead]);
    for (let i = 0; i <= n * 2; i++) {
      const s = lead + (L - 2 * lead) * (i + 0.5) / (n * 2 + 1), side = i % 2 ? 1 : -1;
      pts.push([x1 + ux * s + px * amp * side, y1 + uy * s + py * amp * side]);
    }
    pts.push([x2 - ux * lead, y2 - uy * lead], [x2, y2]);
    K.line(c, pts, color || COL['ink-2'], 4);
  };
  /** 바닥(빗금) */
  K.ground = function (c, x, y, w) {
    c.fillStyle = COL['ink-2']; c.fillRect(x, y, w, 5);
    c.strokeStyle = COL.line; c.lineWidth = 2;
    for (let i = x; i < x + w; i += 22) { c.beginPath(); c.moveTo(i, y + 5); c.lineTo(i - 14, y + 22); c.stroke(); }
  };
  K.box = function (c, x, y, w, hh, fill, stroke) {
    c.fillStyle = fill || COL.panel; rrect(c, x, y, w, hh, 10); c.fill();
    c.strokeStyle = stroke || COL['ink-2']; c.lineWidth = 4; rrect(c, x, y, w, hh, 10); c.stroke();
  };
  K.cross = function (c, x, y, r, color) {
    c.strokeStyle = color || COL.pen; c.lineWidth = Math.max(5, r / 4); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); c.stroke();
  };
  /** 숫자 보기 좋게 : 소수 d 자리, 끝의 0 은 뺀다 */
  K.fmt = function (v, d) { const s = v.toFixed(d === undefined ? 1 : d); return (s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s).replace('-', MINUS); };
  return K;
}());
