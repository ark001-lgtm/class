// 나의 수업 웹앱 : 앱 아이콘 그리기 (한 번만 돌리면 된다)
//   node tools/icons.mjs  →  hub/icons/icon-192.png, icon-512.png, apple-touch-icon.png
// 남색 바탕에 흰 칠판, 회색 글줄, 빨간 펜 자국. 512 칸 기준 도형을 4×4 로 쪼개 찍어 가장자리를 부드럽게 한다.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'hub', 'icons');
const INK = [19, 34, 50], WHITE = [255, 255, 255], LINE = [201, 211, 220], PEN = [194, 29, 78];

function inRRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}
function nearPolyline(x, y, pts, w) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    if ((x - ax - t * (bx - ax)) ** 2 + (y - ay - t * (by - ay)) ** 2 <= (w / 2) ** 2) return true;
  }
  return false;
}
/** 512 칸 좌표 한 점의 색 (위에 그린 것이 이긴다) */
function colorAt(x, y) {
  if (nearPolyline(x, y, [[150, 300], [212, 344], [372, 198]], 34)) return PEN;
  if (inRRect(x, y, 140, 166, 330, 188, 11)) return LINE;
  if (inRRect(x, y, 140, 218, 270, 240, 11)) return LINE;
  if (inRRect(x, y, 96, 112, 416, 392, 30)) return WHITE;
  if (inRRect(x, y, 238, 392, 274, 436, 0)) return LINE;
  if (inRRect(x, y, 170, 424, 342, 446, 11)) return LINE;
  return INK;
}
function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xFF;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const k = 512 / size, SS = 4;
  for (let py = 0; py < size; py++) {
    raw[py * (size * 3 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      const acc = [0, 0, 0];
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const c = colorAt((px + (sx + 0.5) / SS) * k, (py + (sy + 0.5) / SS) * k);
        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2];
      }
      const o = py * (size * 3 + 1) + 1 + px * 3;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(acc[i] / (SS * SS));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
fs.mkdirSync(OUT, { recursive: true });
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  fs.writeFileSync(path.join(OUT, name), png(size));
  console.log('그림 : hub/icons/' + name);
}
