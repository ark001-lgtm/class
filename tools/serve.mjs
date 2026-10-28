// 나의 수업 웹앱 : 내 컴퓨터에서 미리 보기
//   node tools/serve.mjs        → 합친 뒤 http://localhost:4173 에서 엽니다 (끄기 : Ctrl+C)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(TOOLS, '..', 'dist');
const PORT = Number(process.argv[2]) || 4173;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf' };

execFileSync(process.execPath, [path.join(TOOLS, 'build.mjs')], { stdio: 'inherit' });

http.createServer(function (req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DIST, path.normalize(p).replace(/^([/\\])+/, ''));
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { res.writeHead(301, { Location: req.url.split('?')[0] + '/' }); res.end(); return; }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('없는 파일 : ' + p); return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, function () { console.log(`미리 보기 : http://localhost:${PORT}  (끄기 : Ctrl+C)`); });
