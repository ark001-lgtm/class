// 나의 수업 웹앱 : 합치기
// catalog.json(목록)과 lessons/(소단원 폴더), archive/(지난 학년도 보관본)를 읽어
// 올릴 사이트 한 벌을 dist/ 에 만든다. GitHub 에 올리면 GitHub 가 이 파일을 알아서 돌린다.
//   node tools/build.mjs
//
// 소단원 폴더 lessons/<과목 id>/<소단원 id>/
//   scenes.js      장면만 쓴 수업 화면 → engine/ 과 합쳐 HTML 하나가 된다 (있으면 '수업 가능')
//   scenes.css     그 소단원에만 쓰는 모양 (없어도 됨)
//   lesson.html    엔진을 떼어 내기 전에 만든 수업 화면 (2-3). 그대로 쓴다
//   worksheet.pdf  학습지 (있으면 [학습지] 단추가 켜짐)
//   memo.md        수업 메모 (맨 위 메모에 '다음에 바꿀 것'이 남아 있으면 '고칠 것 있음')
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');
const HUB = path.join(ROOT, 'hub');
const ENGINE = path.join(ROOT, 'engine');
const ID_OK = /^[A-Za-z0-9._-]+$/;
const STATUS_WORDS = { '준비 중': 'prep', '수업 가능': 'ready', '고칠 것 있음': 'fix', prep: 'prep', ready: 'ready', fix: 'fix' };

const warnings = [];
const outFiles = new Map();   // dist 안 경로 → 내용 (판 번호를 매길 때 쓴다)

function readJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); }
function put(relPath, data) {
  const f = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
  outFiles.set(relPath.split(path.sep).join('/'), data);
}
function fail(msg) { console.error('\n멈춤 : ' + msg + '\n'); process.exit(1); }

/** memo.md → [{ date, label, changed[], next[], note[] }] (최근 것이 먼저) */
export function parseMemo(text) {
  const entries = [];
  let cur = null, sec = 'note';
  for (const raw of text.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^#\s/.test(line)) continue;
    let m = /^##\s+(\d{4}-\d{2}-\d{2})\s*[·:\-–—]?\s*(.*)$/.exec(line);
    if (m) { cur = { date: m[1], label: m[2].trim(), changed: [], next: [], note: [] }; entries.push(cur); sec = 'note'; continue; }
    if (!cur) continue;
    m = /^(바꾼\s*것|다음에\s*바꿀\s*것)\s*:?\s*(.*)$/.exec(line);
    if (m) { sec = m[1].startsWith('바꾼') ? 'changed' : 'next'; if (!m[2]) continue; }
    const item = (m ? m[2] : line).replace(/^[-*•]\s*/, '').trim();
    if (!item || /^\(?\s*없음\s*\)?$/.test(item)) continue;
    cur[sec].push(item);
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

/** 수업 화면에 '수업 목록으로' 단추를 붙인다. 웹앱에서 열 때만 보이고, USB 로 연 파일에서는 숨는다 */
function withHubLink(html, hubHref) {
  const tag = `
<script>
/* 나의 수업 웹앱이 넣은 것 : 이 수업의 목차 화면 아래에 '수업 목록으로' 단추 (웹앱에서 열 때만) */
(function () {
  if (!/^https?:$/.test(location.protocol)) return;
  var HUB = ${JSON.stringify(hubHref)};
  function put() {
    var foot = document.querySelector('.toc-foot');
    if (!foot || foot.querySelector('[data-hub]')) return;
    var a = document.createElement('a');
    a.href = HUB; a.className = 'btn small'; a.setAttribute('data-hub', ''); a.textContent = '← 수업 목록으로';
    a.style.textDecoration = 'none';
    foot.insertBefore(a, foot.firstChild);
  }
  var scene = document.getElementById('scene');
  if (scene && window.MutationObserver) new MutationObserver(put).observe(scene, { childList: true });
  put();
})();
</script>
`;
  const i = html.lastIndexOf('</body>');
  return i < 0 ? html + tag : html.slice(0, i) + tag + html.slice(i);
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
/** 장면 파일 + 엔진 → HTML 하나 (USB 로 들고 가도 열린다) */
function engineHtml(srcDir, info) {
  const rd = (f) => fs.readFileSync(f, 'utf8');
  const cssFile = path.join(srcDir, 'scenes.css');
  const script = ["'use strict';", 'const SUUP = ' + JSON.stringify(info).replace(/</g, '\\u003c') + ';',
    rd(path.join(ENGINE, 'engine.js')), rd(path.join(srcDir, 'scenes.js')), rd(path.join(ENGINE, 'start.js'))].join('\n');
  if (/<\/script/i.test(script)) fail(`${path.relative(ROOT, srcDir)} 의 장면 파일에 '</script' 글자가 있으면 안 됩니다.`);
  return rd(path.join(ENGINE, 'stage.html'))
    .split('@@TITLE@@').join(esc(info.title + ' 수업'))
    .split('@@KICKER@@').join(esc(info.kicker))
    .split('@@ENGINE_CSS@@').join(rd(path.join(ENGINE, 'engine.css')))
    .split('@@LESSON_CSS@@').join(fs.existsSync(cssFile) ? rd(cssFile) : '')
    .split('@@SCRIPT@@').join(script);
}
function buildLesson(srcDir, outRel, hubHref, info) {
  const scenes = path.join(srcDir, 'scenes.js'), legacy = path.join(srcDir, 'lesson.html');
  if (fs.existsSync(scenes)) put(path.join(outRel, 'index.html'), engineHtml(srcDir, Object.assign({ hub: hubHref }, info)));
  else if (fs.existsSync(legacy)) put(path.join(outRel, 'index.html'), withHubLink(fs.readFileSync(legacy, 'utf8'), hubHref));
  else return false;
  return true;
}

/** 한 학년도 판 : catalog 를 읽어 소단원 파일을 dist 에 놓고, 허브에 넣을 목록을 돌려준다 */
function buildYear(catalog, srcBase, urlBase, hashPrefix) {
  const depth = urlBase.split('/').filter(Boolean).length + 3;
  const seen = new Set();
  const groups = (catalog.groups || []).map(function (g) {
    return {
      name: g.name,
      subjects: (g.subjects || []).map(function (s) {
        if (!ID_OK.test(s.id || '')) fail(`과목 "${s.name}" 의 id "${s.id}" 는 영문·숫자·-·_ 로만 써 주세요.`);
        return {
          id: s.id, name: s.name, note: s.note || '',
          units: (s.units || []).map(function (u) {
            return {
              name: u.name,
              lessons: (u.lessons || []).map(function (l) {
                if (!ID_OK.test(l.id || '')) fail(`소단원 "${l.title}" 의 id "${l.id}" 는 영문·숫자·-·_ 로만 써 주세요.`);
                const key = s.id + '/' + l.id;
                if (seen.has(key)) fail(`${s.name} 에 소단원 id "${l.id}" 가 두 번 있습니다.`);
                seen.add(key);
                const src = path.join(srcBase, 'lessons', s.id, l.id);
                const rel = urlBase + `lessons/${s.id}/${l.id}/`;
                const kno = String(l.no || l.id).split('-').pop().padStart(2, '0');
                const hasScreen = buildLesson(src, rel, '../'.repeat(depth) + '#' + hashPrefix + s.id,
                  { id: s.id + '/' + l.id, title: l.title, kicker: kno + '. ' + l.title });
                const pdf = path.join(src, 'worksheet.pdf');
                const hasPdf = fs.existsSync(pdf);
                if (hasPdf) put(rel + 'worksheet.pdf', fs.readFileSync(pdf));
                const memoFile = path.join(src, 'memo.md');
                const memo = fs.existsSync(memoFile) ? parseMemo(fs.readFileSync(memoFile, 'utf8')) : [];
                let status = hasScreen ? (memo.length && memo[0].next.length ? 'fix' : 'ready') : 'prep';
                if (l.status) {
                  if (!STATUS_WORDS[l.status]) fail(`소단원 "${l.title}" 의 status "${l.status}" 는 준비 중 · 수업 가능 · 고칠 것 있음 가운데 하나로 써 주세요.`);
                  status = STATUS_WORDS[l.status];
                  if (status !== 'prep' && !hasScreen) { warnings.push(`${s.name} ${l.id} : 수업 화면(scenes.js 나 lesson.html)이 없어서 '준비 중'으로 둡니다.`); status = 'prep'; }
                }
                const no = l.no || l.id;
                return {
                  id: l.id, no: no, title: l.title, status: status,
                  href: status === 'prep' ? null : rel,
                  worksheet: hasPdf ? rel + 'worksheet.pdf' : null,
                  worksheetName: `${no} ${l.title} 학습지.pdf`.replace(/[\\/:*?"<>|]/g, ' '),
                  memo: memo,
                };
              }),
            };
          }),
        };
      }),
    };
  });
  // 목록에 없는 소단원 폴더는 알려 준다 (빠뜨렸거나 id 를 잘못 썼을 때)
  const lessonsDir = path.join(srcBase, 'lessons');
  if (fs.existsSync(lessonsDir)) {
    for (const sid of fs.readdirSync(lessonsDir)) {
      const sd = path.join(lessonsDir, sid);
      if (!fs.statSync(sd).isDirectory()) continue;
      for (const lid of fs.readdirSync(sd)) {
        if (fs.statSync(path.join(sd, lid)).isDirectory() && !seen.has(sid + '/' + lid)) warnings.push(`catalog.json 목록에 없는 폴더 : ${path.relative(ROOT, path.join(sd, lid))}`);
      }
    }
  }
  return { year: catalog.year, groups: groups };
}

function main() {
  const catalog = readJson(path.join(ROOT, 'catalog.json'));
  const current = String(catalog.year);
  fs.rmSync(OUT, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  fs.mkdirSync(OUT, { recursive: true });

  const years = {};
  years[current] = buildYear(catalog, ROOT, '', '');
  const precache = [];
  for (const [rel] of outFiles) precache.push(rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel, rel);

  // 지난 학년도 보관본 : archive/<학년도>/catalog.json + lessons/
  const arch = path.join(ROOT, 'archive');
  if (fs.existsSync(arch)) {
    for (const y of fs.readdirSync(arch).filter((d) => /^\d{4}$/.test(d)).sort()) {
      if (y === current) { warnings.push(`archive/${y} 는 올해와 학년도가 같아서 건너뜁니다.`); continue; }
      const cf = path.join(arch, y, 'catalog.json');
      if (!fs.existsSync(cf)) { warnings.push(`archive/${y}/catalog.json 이 없어서 건너뜁니다.`); continue; }
      years[y] = buildYear(readJson(cf), path.join(arch, y), `archive/${y}/`, y + '/');
    }
  }

  // 허브 한 장 : 틀 + 모양 + 동작 + 목록
  const built = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16);
  const hubFor = function (version) {
    const data = JSON.stringify({ built: built, version: version, current: current, years: years }).replace(/</g, '\\u003c');
    return fs.readFileSync(path.join(HUB, 'index.html'), 'utf8')
      .split('/*@@HUB_CSS@@*/').join(fs.readFileSync(path.join(HUB, 'hub.css'), 'utf8'))
      .split('/*@@HUB_JS@@*/').join(fs.readFileSync(path.join(HUB, 'hub.js'), 'utf8'))
      .split('@@HUB_DATA@@').join(data);
  };
  put('manifest.webmanifest', fs.readFileSync(path.join(HUB, 'manifest.webmanifest')));
  for (const f of fs.readdirSync(path.join(HUB, 'icons'))) {
    if (/\.(png|svg)$/.test(f)) { put('icons/' + f, fs.readFileSync(path.join(HUB, 'icons', f))); precache.push('icons/' + f); }
  }
  precache.unshift('./', 'index.html', 'manifest.webmanifest');

  // 판 번호 : 내용이 바뀌면 바뀐다. 기기에 담아 둔 것을 새로 받고, 앱처럼 띄운 허브는 version.json 과 견주어 새 판을 알린다
  // (허브는 만든 시각이 들어가므로 빼고, 허브 틀 · 모양 · 동작은 넣어 견준다)
  const hash = crypto.createHash('sha256');
  for (const [rel, d] of [...outFiles].sort((a, b) => a[0].localeCompare(b[0]))) { hash.update(rel); hash.update(d); }
  hash.update(hubFor('').replace(built, ''));
  const version = hash.digest('hex').slice(0, 12);
  put('index.html', hubFor(version));
  put('version.json', JSON.stringify({ v: version, built: built }));
  put('sw.js', fs.readFileSync(path.join(HUB, 'sw.js'), 'utf8')
    .split('@@VERSION@@').join(version)
    .split('@@FILES@@').join(JSON.stringify([...new Set(precache)], null, 1)));
  put('.nojekyll', '');

  const all = Object.values(years[current].groups).flatMap((g) => g.subjects.flatMap((s) => s.units.flatMap((u) => u.lessons)));
  const n = (st) => all.filter((l) => l.status === st).length;
  console.log(`다 만들었습니다 → dist/  (${current}학년도 소단원 ${all.length}개 : 수업 가능 ${n('ready')} · 고칠 것 있음 ${n('fix')} · 준비 중 ${n('prep')}` +
    (Object.keys(years).length > 1 ? `, 보관본 ${Object.keys(years).filter((y) => y !== current).join(' · ')}` : '') + `, 판 ${version})`);
  for (const w of warnings) console.log('  알림 : ' + w);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
