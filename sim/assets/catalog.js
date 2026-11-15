/* 나의 수업 : 시뮬레이션 공통 머리
   「평택여고 과학 실험실」 키트의 catalog.js 를 나의 수업에 맞게 바꾼 것이다.
   - 위 막대 : 나의 수업(첫 화면)으로 가는 단추와 단원 이름. 학습지·교사 모드 단추는 없다.
   - 화면 밝기는 나의 수업과 함께 쓴다 (localStorage 'suup-theme').
   - 오프라인 도우미(sw.js)는 나의 수업 것이 맡으므로 여기서 따로 등록하지 않는다.
   - SUUP_LINKS(어느 시뮬레이션이 어느 소단원과 짝인지)는 tools/build.mjs 가 catalog.json 을 읽어 채운다. */
window.SITE = { name: '나의 수업', curriculum: '2022 개정 교육과정' };
window.SUUP_LINKS = /*@@SUUP_LINKS@@*/{ hub: '../index.html', lessons: [] };
window.CATALOG = [];

(function () {
  try { const t = localStorage.getItem('suup-theme'); if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t); } catch (e) { /* 기억하지 못해도 화면은 된다 */ }
})();

window.addEventListener('DOMContentLoaded', () => {
  const root = document.body.dataset.root || './';
  const L = window.SUUP_LINKS;
  const bar = document.querySelector('[data-topbar]');
  if (bar) {
    const crumbs = (bar.dataset.topbar || '').split('|').filter(Boolean);
    bar.innerHTML = `<a class="brand" href="${root}${L.hub}"><img src="${root}../icons/icon.svg" alt=""><span class="nm">${SITE.name}</span></a>` +
      crumbs.map(c => `<span class="sep">›</span><span>${c}</span>`).join('') + `<span class="spacer"></span>`;
  }
  const ft = document.querySelector('[data-footer]');
  if (ft) ft.textContent = `${SITE.name} · ${SITE.curriculum} · 시뮬레이션은 「평택여고 과학 실험실」 키트에서 가져와 고쳐 씀`;
});
