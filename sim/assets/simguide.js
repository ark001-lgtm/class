/* 시뮬레이션 사용 안내 카드 — "무엇을 알아보나 · 무엇을 어떤 순서로 누르나 · 무엇을 보나"
   simkit.js 가 모든 sim.html 에서 불러온다. 내용은 assets/simguide-data.js 의 SIMGUIDE['단원 폴더#모드'] = {q, s: [...], l}
   - q: 이 화면에서 알아볼 질문 하나
   - s: 해 보기 순서(2~4개). [버튼 이름]은 실제 버튼과 같은 글자로 쓴다 → 그 버튼이 눌릴 때까지 반짝이고, 안내의 이름을 누르면 버튼을 찾아 준다
   - l: 눈여겨볼 것(관찰 포인트) 한 줄
   모드가 바뀌면(탭의 aria-pressed) 카드도 바뀐다. 접어 두면 다음에도 접힌 채로 보인다. */
(() => {
  const key = (() => { const m = location.pathname.match(/([a-z0-9]+\/[a-z0-9]+)\/(sim|build|ripple)(?:\.html)?$/i); return m ? m[1] + (m[2] === 'sim' ? '' : '/' + m[2]) : null; })();   // 실험실 페이지(build·ripple)는 '단원 폴더/파일#main'
  if (!key) return;
  const st = document.createElement('style');
  st.textContent = `
.sguide{border:1.5px solid color-mix(in srgb,var(--accent) 45%,var(--line));background:color-mix(in srgb,var(--accent) 6%,var(--surface));border-radius:12px;padding:10px 12px 10px;margin:0 0 10px;font-size:14px;line-height:1.55;color:var(--ink)}
.sguide .sg-h{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--accent);font-size:13px}
.sguide .sg-h button{margin-left:auto;font:inherit;font-size:12px;font-weight:600;border:1px solid var(--line);background:var(--surface);color:var(--muted);border-radius:8px;padding:2px 8px;cursor:pointer}
.sguide .sg-q{font-weight:700;font-size:15px;margin:4px 0 6px}
.sguide ol{margin:0;padding-left:0;list-style:none;counter-reset:sg}
.sguide li{counter-increment:sg;position:relative;padding:2px 0 2px 28px;margin:2px 0}
.sguide li::before{content:counter(sg);position:absolute;left:0;top:3px;width:20px;height:20px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center}
.sguide .sg-l{margin:6px 0 0;padding:6px 8px;border-radius:8px;background:color-mix(in srgb,var(--warn,#e0a020) 14%,transparent);font-size:13px}
.sguide b.gk{display:inline-block;padding:0 6px;border-radius:6px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--ink);cursor:pointer;font-weight:700}
.sguide b.gk:hover{background:color-mix(in srgb,var(--accent) 30%,transparent)}
.sguide .sg-c{margin:8px 0 0;padding:8px;border-radius:8px;border:1px dashed color-mix(in srgb,var(--accent) 45%,var(--line))}
.sguide .sg-cq{margin:0 0 6px;font-weight:700;font-size:13.5px}
.sguide .sg-co{display:flex;flex-direction:column;gap:4px}
.sguide .sg-co button{text-align:left;font:inherit;font-size:13px;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;padding:4px 8px;cursor:pointer}
.sguide .sg-co button.ok{border-color:var(--ok,#2f7d4c);background:color-mix(in srgb,var(--ok,#2f7d4c) 14%,var(--surface))}
.sguide .sg-co button.no{border-color:var(--hot,#c8432f);opacity:.75}
.sguide .sg-ce{margin:6px 0 0;font-size:13px}
.sguide.closed ol,.sguide.closed .sg-l,.sguide.closed .sg-q,.sguide.closed .sg-c{display:none}
.gd-pulse{animation:gdp 1.6s ease-in-out infinite;position:relative;z-index:1}
@keyframes gdp{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 0%,transparent)}50%{box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 45%,transparent)}}
.gd-flash{outline:3px solid var(--accent)!important;outline-offset:2px}
@media (prefers-reduced-motion: reduce){.gd-pulse{animation:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 45%,transparent)}}
@media print{.sguide{display:none}}`;
  document.head.appendChild(st);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const norm = s => (s || '').replace(/\s+/g, '').replace(/[()·]/g, '');
  const fmt = s => esc(s).replace(/\[([^\]]+)\]/g, (_, t) => `<b class="gk" data-k="${t.replace(/"/g, '')}">${t}</b>`).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  // 버튼 찾기: 보이는 버튼·체크박스 이름 중 글자가 같은(공백·괄호 무시) 것, 없으면 앞부분이 같은 것
  const find = t => { const k = norm(t), els = [...document.querySelectorAll('button, label')].filter(e => e.offsetParent && !e.closest('.sguide'));
    return els.find(e => norm(e.textContent) === k) || [...document.querySelectorAll('select')].find(e => e.offsetParent && [...e.options].some(o => norm(o.textContent) === k)) ||   /* 고르기 상자의 항목이면 그 상자 */
      els.find(e => norm(e.textContent).startsWith(k)) || els.find(e => k.length >= 3 && norm(e.textContent).includes(k)); };
  let box = null, mode = null, pulsed = [];
  const closed = () => { try { return localStorage.getItem('simguide-closed') === '1'; } catch (e) { return false; } };
  function mount(){
    if (box && document.contains(box)) return box;
    box = document.createElement('section'); box.className = 'sguide'; box.setAttribute('aria-label', '이 화면 사용 안내');
    const led = document.querySelector('.panel.ledger'), main = document.querySelector('.main');
    if (led) led.insertBefore(box, led.firstChild); else if (main) main.parentNode.insertBefore(box, main); else return null;
    box.addEventListener('click', e => { const b = e.target.closest('b.gk'); if (b) { const el = find(b.dataset.k); if (el) { el.scrollIntoView({block: 'nearest', behavior: 'smooth'}); el.classList.add('gd-flash'); setTimeout(() => el.classList.remove('gd-flash'), 1400); } }
      const ob = e.target.closest('.sg-co button'); if (ob) { const G = window.SIMGUIDE || {}, cur = document.querySelector('[data-mode][aria-pressed="true"]'), g = {c: (window.SIMCHECK || {})[key + '#' + (cur ? cur.dataset.mode : 'main')]}; if (g && g.c) { const ok = +ob.dataset.i === g.c.a; ob.classList.add(ok ? 'ok' : 'no'); const ex = box.querySelector('.sg-ce'); ex.hidden = false; ex.innerHTML = (ok ? '⭕ 맞아요. ' : '❌ 다시 생각해 봐요. ') + (ok ? fmt(g.c.e) : '시뮬레이션에서 직접 바꿔 보며 확인해 보세요.'); } }   /* 확인 문제: 고른 보기가 맞으면 해설, 틀리면 다시 해 보기 */
      if (e.target.closest('.sg-tog')) { box.classList.toggle('closed'); try { localStorage.setItem('simguide-closed', box.classList.contains('closed') ? '1' : '0'); } catch (er) {} e.target.textContent = box.classList.contains('closed') ? '펼치기' : '접기'; } });
    return box;
  }
  function show(){
    const G = window.SIMGUIDE || {}, cur = document.querySelector('[data-mode][aria-pressed="true"]'), m = cur ? cur.dataset.mode : (document.querySelector('[data-mode]') || {dataset: {}}).dataset.mode || 'main';
    const g0 = G[key + '#' + m] || G[key], g = g0 && Object.assign({}, g0, {c: (window.SIMCHECK || {})[key + '#' + m] || g0.c}); if (m === mode && box && document.contains(box)) return; mode = m;
    pulsed.forEach(e => e.classList.remove('gd-pulse')); pulsed = [];
    if (!g) { if (box) box.hidden = true; return; }
    const b = mount(); if (!b) return; b.hidden = false; const c = closed(); b.classList.toggle('closed', c);
    b.innerHTML = `<div class="sg-h">🎯 이 화면에서 알아볼 것<button type="button" class="sg-tog">${c ? '펼치기' : '접기'}</button></div><p class="sg-q">${fmt(g.q)}</p>` +
      `<ol>${g.s.map(x => `<li>${fmt(x)}</li>`).join('')}</ol>` + (g.l ? `<p class="sg-l">👀 ${fmt(g.l)}</p>` : '') + (g.c ? `<div class="sg-c"><p class="sg-cq">✅ 확인 문제 · ${fmt(g.c.q)}</p><div class="sg-co">${(r => g.c.o.map((_, j) => (j + r) % g.c.o.length))([...(key + m)].reduce((h, ch) => h + ch.charCodeAt(0), 0) % g.c.o.length).map((i, j) => `<button type="button" data-i="${i}">${j + 1}. ${fmt(g.c.o[i])}</button>`).join('')}</div><p class="sg-ce" hidden></p></div>` : '');
    // 첫 단계에 나오는 버튼은 한 번 누를 때까지 반짝임
    setTimeout(() => { const first = (g.s[0].match(/\[([^\]]+)\]/g) || []).map(x => x.slice(1, -1));
      first.forEach(t => { const el = find(t); if (el && !el.dataset.gdDone) { el.classList.add('gd-pulse'); pulsed.push(el); el.addEventListener('click', () => { el.classList.remove('gd-pulse'); el.dataset.gdDone = '1'; }, {once: true}); } }); }, 300);
  }
  const start = () => { show(); new MutationObserver(show).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['aria-pressed']}); window.addEventListener('lessonmode', () => setTimeout(show, 0)); };
  const s = document.createElement('script'); s.src = (document.body.dataset.root || '../../') + 'assets/simguide-data.js'; { const c = document.createElement('script'); c.src = (document.body.dataset.root || '../../') + 'assets/simcheck-data.js'; c.onload = () => { mode = null; show(); }; document.head.appendChild(c); } s.onload = () => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start()); document.head.appendChild(s);
})();
