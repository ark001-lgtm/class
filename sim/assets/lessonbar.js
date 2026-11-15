/* 나의 수업 : '이 시뮬레이션과 짝인 수업 화면' 막대
   「평택여고 과학 실험실」 키트의 lessonbar.js(슬라이드·문제·게임으로 이동)를 나의 수업에 맞게 새로 쓴 것이다.
   지금 고른 실험(모드)과 짝지은 소단원의 수업 화면으로 바로 간다. 짝은 catalog.json 의 "sims" 에 적는다. */
(function () {
  const me = document.currentScript; if (!me) return;
  const ROOT = me.src.replace(/assets\/lessonbar\.js.*$/, '');
  if (window.self !== window.top || /[?&]embed\b/.test(location.search)) return;

  function css() {
    if (document.getElementById('lb-css')) return; const s = document.createElement('style'); s.id = 'lb-css';
    s.textContent = `.lb{--lb-bg:#f4f7fa;--lb-ink:#1b2530;--lb-mut:#5b6875;--lb-line:#dbe3ea;--lb-on:#2f6fd1;font:500 14px/1.35 "IBM Plex Sans KR",system-ui,sans-serif;background:var(--lb-bg);color:var(--lb-ink);border:1px solid var(--lb-line);border-radius:12px;padding:8px 12px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}
.lb .u{color:var(--lb-mut);white-space:nowrap}.lb .sep{width:1px;height:18px;background:var(--lb-line);margin:0 2px}
.lb a{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;border:1px solid var(--lb-line);background:#fff;color:var(--lb-ink);text-decoration:none;white-space:nowrap;min-height:34px}
.lb a:hover{border-color:var(--lb-on)}.lb a.go{background:var(--lb-on);border-color:var(--lb-on);color:#fff;font-weight:700}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .lb{--lb-bg:#151d24;--lb-ink:#e6eef6;--lb-mut:#9fb0c0;--lb-line:#2a3640}:root:not([data-theme="light"]) .lb a:not(.go){background:#1d2731}}
:root[data-theme="dark"] .lb{--lb-bg:#151d24;--lb-ink:#e6eef6;--lb-mut:#9fb0c0;--lb-line:#2a3640}:root[data-theme="dark"] .lb a:not(.go){background:#1d2731}
@media print{.lb{display:none!important}}`;
    document.head.appendChild(s);
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  /* 지금 보고 있는 실험 : 주소 끝 #모드, 없으면 눌려 있는 모드 단추 */
  function current() {
    const page = location.href.slice(ROOT.length).split('?')[0].split('#')[0];
    let mode = location.hash.slice(1);
    if (!mode) { const b = document.querySelector('[data-mode][aria-pressed="true"]'); mode = b ? b.dataset.mode : ''; }
    return { page, mode };
  }

  function build() {
    const L = window.SUUP_LINKS || { lessons: [] }, cur = current();
    const mine = L.lessons.filter(l => l.sims.some(s => { const [p, m] = s.split('#'); return p === cur.page && (!m || m === cur.mode); }));
    const subj = (mine[0] || L.lessons.find(l => l.sims.some(s => s.split('#')[0] === cur.page)) || {}).subject;
    const bar = document.createElement('nav'); bar.className = 'lb'; bar.setAttribute('aria-label', '짝인 수업 화면');
    let h = `<a href="${ROOT}${esc(L.hub)}${subj ? '#' + esc(subj.id) : ''}">← 나의 수업</a>`;
    if (subj) h += `<span class="u">${esc(subj.name)}</span>`;
    if (mine.length) h += `<span class="sep"></span>` + mine.map(l => `<a class="go" href="${ROOT}${esc(l.href)}" title="${esc(l.id + ' ' + l.title)} 수업 화면으로">▶ ${esc(l.id)} ${esc(l.title)} 수업 화면</a>`).join('');
    bar.innerHTML = h;
    return bar;
  }

  function mount() {
    css(); document.querySelectorAll('.lb').forEach(e => e.remove());
    const bar = build(), top = document.querySelector('.topbar');
    if (top) top.insertAdjacentElement('afterend', bar); else document.body.insertAdjacentElement('afterbegin', bar);
  }
  function start() {
    mount();
    window.addEventListener('hashchange', mount); window.addEventListener('lessonmode', mount);
    document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-mode]')) setTimeout(mount, 0); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0)); else setTimeout(start, 0);
})();
