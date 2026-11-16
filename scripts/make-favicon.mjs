/**
 * v0.0.64: сборка favicon.ico из public/icon-192.png.
 * ICO-контейнер с тремя PNG-записями (16/32/48) — Vista+ формат,
 * валиден для всех современных браузеров и прямого запроса /favicon.ico.
 * Запуск: bun scripts/make-favicon.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const SRC = 'public/icon-192.png'
const OUT = 'src/app/favicon.ico'

const sizes = [16, 32, 48]
const pngs = []
for (const s of sizes) {
  const buf = await sharp(SRC).resize(s, s, { fit: 'cover' }).png().toBuffer()
  pngs.push({ size: s, buf })
}

/* ICO: ICONDIR (6 байт) + N x ICONDIRENTRY (16 байт) + данные */
const count = pngs.length
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(count, 4)

const entries = []
let offset = 6 + 16 * count
for (const { size, buf } of pngs) {
  const e = Buffer.alloc(16)
  e.writeUInt8(size >= 256 ? 0 : size, 0) // width
  e.writeUInt8(size >= 256 ? 0 : size, 1) // height
  e.writeUInt8(0, 2) // palette
  e.writeUInt8(0, 3) // reserved
  e.writeUInt16LE(1, 4) // planes
  e.writeUInt16LE(32, 6) // bpp
  e.writeUInt32LE(buf.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += buf.length
  entries.push(e)
}

const ico = Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)])
writeFileSync(OUT, ico)
console.log(`OK: ${OUT} (${ico.length} bytes, ${count} sizes)`)
