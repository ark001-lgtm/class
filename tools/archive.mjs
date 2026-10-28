// 나의 수업 웹앱 : 학년도 끝에 그해 판 보관하기
//   node tools/archive.mjs
// 지금 판(catalog.json + lessons/)을 archive/<학년도>/ 에 그대로 복사해 두고, catalog.json 의 학년도를 하나 올린다.
// 허브 오른쪽 위 학년도 칸에서 지난 판을 고르면 그해 수업 화면이 그 모습 그대로 열린다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catFile = path.join(ROOT, 'catalog.json');
const text = fs.readFileSync(catFile, 'utf8');
const year = JSON.parse(text.replace(/^﻿/, '')).year;
const dest = path.join(ROOT, 'archive', String(year));

if (!Number.isInteger(year)) { console.error('catalog.json 에 "year": 2026 처럼 학년도가 있어야 합니다.'); process.exit(1); }
if (fs.existsSync(dest)) { console.error(`archive/${year} 가 벌써 있습니다. 두 번 보관하지 않도록 멈춥니다.`); process.exit(1); }

fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(catFile, path.join(dest, 'catalog.json'));
const lessons = path.join(ROOT, 'lessons');
if (fs.existsSync(lessons)) fs.cpSync(lessons, path.join(dest, 'lessons'), { recursive: true, filter: (src) => path.basename(src).toLowerCase() !== 'desktop.ini' });
fs.writeFileSync(catFile, text.replace(/("year"\s*:\s*)\d+/, '$1' + (year + 1)));
console.log(`${year}학년도 판을 archive/${year}/ 에 보관했습니다. 이제 catalog.json 은 ${year + 1}학년도입니다.`);
