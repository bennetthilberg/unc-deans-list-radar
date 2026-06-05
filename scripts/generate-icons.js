const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "icons");
const sizes = [16, 32, 48, 128];

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function png(size) {
  const rows = [];
  const blue = [75, 156, 211, 255];
  const navy = [19, 41, 75, 255];
  const white = [255, 255, 255, 255];
  const center = (size - 1) / 2;

  for (let y = 0; y < size; y += 1) {
    const row = [0];
    for (let x = 0; x < size; x += 1) {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const ring = Math.abs(distance - size * 0.31) < Math.max(1, size / 28);
      const sweep =
        y > center - size * 0.08 &&
        y < center + size * 0.08 &&
        x > center &&
        x < size * 0.86;
      const dot = distance < Math.max(1.5, size * 0.08);
      const border =
        x < size * 0.08 ||
        y < size * 0.08 ||
        x > size * 0.92 ||
        y > size * 0.92;
      row.push(...(ring || sweep || dot ? white : border ? navy : blue));
    }
    rows.push(Buffer.from(row));
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

fs.mkdirSync(outputDir, { recursive: true });

for (const size of sizes) {
  fs.writeFileSync(path.join(outputDir, `icon${size}.png`), png(size));
}
