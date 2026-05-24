/**
 * Generates retro PWA icons (192×192, 512×512) — no dependencies.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'img');

/** 16×16 mask: 1 = neon green pixel */
const LOGO_16 = [
  '0000111111100000',
  '0001111111111000',
  '0011111111111100',
  '0111110000111110',
  '0111100000011110',
  '0111100000011110',
  '0111110000111110',
  '0111111111111110',
  '0111111111111110',
  '0111100000000000',
  '0111100000000000',
  '0111100000000000',
  '0111100000000000',
  '0111100000000000',
  '0011111111111100',
  '0001111111111000',
];

const BG = [10, 10, 10, 255];
const FG = [57, 255, 20, 255];
const DIM = [26, 138, 0, 255];

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size) {
  const scale = Math.floor(size / 16);
  const pad = Math.floor((size - scale * 16) / 2);
  const row = Buffer.alloc((1 + size * 4) * size);
  let off = 0;

  for (let y = 0; y < size; y++) {
    row[off++] = 0;
    for (let x = 0; x < size; x++) {
      const lx = Math.floor((x - pad) / scale);
      const ly = Math.floor((y - pad) / scale);
      let rgba = BG;
      if (lx >= 0 && lx < 16 && ly >= 0 && ly < 16) {
        const bit = LOGO_16[ly][lx];
        if (bit === '1') rgba = FG;
        else if (x === pad + lx * scale || y === pad + ly * scale) rgba = DIM;
      }
      row[off++] = rgba[0];
      row[off++] = rgba[1];
      row[off++] = rgba[2];
      row[off++] = rgba[3];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(row, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });
for (const size of [180, 192, 512]) {
  const path = join(OUT, `icon-${size}.png`);
  writeFileSync(path, encodePng(size));
  console.log('Wrote', path);
}
