/* 측정값 기록표 — 모든 sim.html 의 숫자 칸(#stats: <div><b>값</b><span>이름</span></div>) 아래에
   [측정값 기록] 버튼을 붙인다. 누를 때마다 지금 값이 표에 한 줄씩 쌓이고(모드마다 따로),
   [표 복사]로 학습지·스프레드시트에 붙여 넣고, [지우기]로 비운다. 화면 내용(과학 값)은 바꾸지 않는다. */
(() => {
  const stats = document.getElementById('stats') || document.querySelector('.stats'); if (!stats) return;
  const st = document.createElement('style');
  st.textContent = `.srec{margin:8px 0 4px}.srec .sr-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.srec button{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;padding:4px 10px;cursor:pointer}
.srec button.sr-add{background:var(--accent);border-color:var(--accent);color:#fff}
.srec .sr-n{font-size:12px;color:var(--muted);margin-left:auto}
.srec table{width:100%;border-collapse:collapse;margin-top:6px;font-size:12.5px;font-variant-numeric:tabular-nums}
.srec th,.srec td{border-bottom:1px solid var(--line);padding:3px 6px;text-align:right;white-space:nowrap}
.srec th:first-child,.srec td:first-child{text-align:center;color:var(--muted)}
.srec th{font-weight:600;}.srec th.in{color:var(--accent)}.srec th{color:var(--muted);font-size:11.5px;white-space:normal}
.srec .sr-wrap{max-height:190px;overflow:auto}
.srec tr.new td{animation:srIn .6s ease}
@keyframes srIn{from{background:color-mix(in srgb,var(--accent) 22%,transparent)}to{background:transparent}}
@media print{.srec .sr-bar{display:none}.srec .sr-wrap{max-height:none}}`;
  document.head.appendChild(st);
  const box = document.createElement('div'); box.className = 'srec';
  box.innerHTML = '<div class="sr-bar"><button type="button" class="sr-add">📋 측정값 기록</button><button type="button" class="sr-copy">표 복사</button><button type="button" class="sr-clear">지우기</button><span class="sr-n"></span></div><div class="sr-wrap"></div>';
  stats.insertAdjacentElement('afterend', box);
  const rec = {};   // 모드 → {cols:[], rows:[[...]]}
  const mode = () => { const b = document.querySelector('[data-mode][aria-pressed="true"]'); return b ? b.textContent.trim() : '측정'; };
  const read = () => [...stats.children].map(d => { const k = d.querySelector('.k') || d.querySelector('span'), v = d.querySelector('.v') || d.querySelector('b'); return k && v ? [k.textContent.trim(), v.textContent.replace(/\s+/g, ' ').trim()] : null; }).filter(Boolean);   /* 두 가지 칸 모양: .stat>.k+.v 또는 <b>값</b><span>이름</span> */
  /* 지금 화면에 보이는 막대(조절값): '전압 3.0 V'처럼 이름 + 출력값 */
  const inputs = () => [...document.querySelectorAll('label.field')].filter(l => l.offsetParent && l.querySelector('input[type=range]') && l.querySelector('output')).map(l => { const o = l.querySelector('output'), n = [...l.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join(' ').replace(/\s+/g, ' ').trim(); return n ? ['▸ ' + n, o.textContent.trim()] : null; }).filter(Boolean);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function draw(flash){ const m = mode(), r = rec[m], w = box.querySelector('.sr-wrap');
    box.querySelector('.sr-n').textContent = r && r.rows.length ? `${m} · ${r.rows.length}회` : '값을 바꿀 때마다 눌러 기록해요';
    w.innerHTML = r && r.rows.length ? `<table><thead><tr><th>회</th>${r.cols.map(c => `<th class="${c.startsWith('▸') ? 'in' : ''}">${esc(c.replace(/^▸ /, ''))}</th>`).join('')}</tr></thead><tbody>${r.rows.map((x, i) => `<tr class="${flash && i === r.rows.length - 1 ? 'new' : ''}"><td>${i + 1}</td>${x.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '';
    if (flash) w.scrollTop = w.scrollHeight; }
  box.querySelector('.sr-add').onclick = () => { const ins = inputs(), names = new Set(ins.map(x => x[0].replace(/^▸ /, ''))), v = [...ins, ...read().filter(x => !names.has(x[0]))];   /* 막대와 같은 이름의 숫자 칸은 한 번만 */ if (!v.length) return; const m = mode(), cols = v.map(x => x[0]);
    if (!rec[m] || rec[m].cols.join('|') !== cols.join('|')) rec[m] = {cols, rows: []};
    rec[m].rows.push(v.map(x => x[1])); draw(true); };
  box.querySelector('.sr-clear').onclick = () => { delete rec[mode()]; draw(); };
  box.querySelector('.sr-copy').onclick = e => { const r = rec[mode()]; if (!r) return; const t = ['회\t' + r.cols.join('\t'), ...r.rows.map((x, i) => (i + 1) + '\t' + x.join('\t'))].join('\n');
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { e.target.textContent = '복사됨 ✓'; setTimeout(() => e.target.textContent = '표 복사', 1400); }, () => {}); };
  new MutationObserver(() => draw()).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['aria-pressed']});
  draw();
})();
