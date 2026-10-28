/* 나의 수업 : 오프라인 도우미 (tools/build.mjs 가 판 번호와 담아 둘 파일 목록을 채운다)
   인터넷이 되면 늘 새 파일을 받고, 안 되거나 너무 느리면(3초) 기기에 담아 둔 것을 연다. */
const VERSION = '@@VERSION@@';
const FILES = @@FILES@@;
const CACHE = 'suup-' + VERSION;
const FONTS = 'suup-fonts';
const SLOW_MS = 3000;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('suup-') === 0 && k !== CACHE && k !== FONTS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit || req.mode !== 'navigate') return hit;
    return caches.match(new URL('./', self.registration.scope).href);
  });
}
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(new Promise(function (resolve) {
      let done = false;
      const finish = function (r) { if (!done && r) { done = true; resolve(r); } };
      const net = fetch(req).then(function (res) {
        if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      });
      net.then(finish, function () { fromCache(req).then(function (hit) { finish(hit || Response.error()); }); });
      // 학교 와이파이가 느릴 때 : 담아 둔 것이 있으면 먼저 보여 준다
      setTimeout(function () { if (!done) fromCache(req).then(finish); }, SLOW_MS);
    }));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.hostname === 'cdnjs.cloudflare.com') {
    // 글꼴 · 학습지 미리 보기(pdf.js) : 한 번 받으면 기기에 두고 쓴다
    e.respondWith(caches.open(FONTS).then(function (c) {
      return c.match(req).then(function (hit) {
        const net = fetch(req).then(function (res) { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; });
        return hit || net;
      });
    }));
  }
});
