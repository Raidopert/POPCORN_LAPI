/**
 * make-loot-icons.mjs — генерация иконок лута в стиле существующих:
 * плоские векторные фигуры на кремовом фоне #ffe9c9 со «искрами» по углам.
 *
 * Запуск: bun scripts/make-loot-icons.mjs
 * Результат: public/inventory/*.png (256×256)
 * 0.0.68: +4 иконки — col-leopard, bra-leopard, crown-rose, crown-leopard
 * 0.0.69: +5 боссовых баночек — jar-pigeon, jar-kid, jar-lion, jar-gypsy, jar-marten
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SIZE = 256
const BG = '#ffe9c9'

/** Четырёхлучевая «искра» как на claw-panther */
const sparkle = (x, y, s, fill = '#f4b942') => {
  const k = s * 0.22
  return `<polygon points="${x},${y - s} ${x + k},${y - k} ${x + s},${y} ${x + k},${y + k} ${x},${y + s} ${x - k},${y + k} ${x - s},${y} ${x - k},${y - k}" fill="${fill}"/>`
}

/** Уголки-искры (общий декор для всех иконок) */
const cornerSparks = () =>
  sparkle(36, 44, 12) + sparkle(222, 60, 9, '#ffdf8f') + sparkle(40, 214, 9, '#ffdf8f') + sparkle(216, 208, 12)

const svgWrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>${inner}${cornerSparks()}</svg>`

/* ─── КОЛЬЦА: ободок + ромб-камень ─── */
function ring({ band, bandDark, gem, gemDark, spots }) {
  const spotDots = spots
    ? Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.35
        const x = 128 + Math.cos(a) * 56
        const y = 152 + Math.sin(a) * 56
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${spots}"/>`
      }).join('')
    : ''
  return svgWrap(`
    <g>
      <circle cx="128" cy="152" r="52" fill="none" stroke="${bandDark}" stroke-width="30"/>
      <circle cx="128" cy="152" r="52" fill="none" stroke="${band}" stroke-width="18"/>
      ${spotDots}
      <polygon points="128,42 166,80 128,118 90,80" fill="${gem}" stroke="${gemDark}" stroke-width="7" stroke-linejoin="round"/>
      <polygon points="128,56 150,80 128,104 106,80" fill="#ffffff" opacity="0.35"/>
    </g>`)
}

/* ─── БАНОЧКИ: склянка с пробкой и цветным зельем ─── */
function jar({ liquid, liquidTop, spots, glow }) {
  const spotDots = spots
    ? `<circle cx="108" cy="140" r="7" fill="${spots}"/><circle cx="148" cy="164" r="9" fill="${spots}"/><circle cx="122" cy="186" r="6" fill="${spots}"/>`
    : ''
  const glowRing = glow ? `<circle cx="128" cy="150" r="66" fill="none" stroke="${glow}" stroke-width="8" opacity="0.55"/>` : ''
  return svgWrap(`
    ${glowRing}
    <g>
      <rect x="114" y="42" width="28" height="20" rx="6" fill="#8a5330"/>
      <rect x="108" y="58" width="40" height="16" rx="5" fill="#e3cba4" stroke="#c9a97a" stroke-width="4"/>
      <rect x="72" y="72" width="112" height="128" rx="28" fill="#fff3dc" stroke="#d9c6a8" stroke-width="7"/>
      <path d="M86 118 h84 a12 12 0 0 1 0 14 h-84 a12 12 0 0 1 0 -14 Z" fill="${liquidTop}"/>
      <rect x="86" y="126" width="84" height="60" rx="14" fill="${liquid}"/>
      ${spotDots}
      <ellipse cx="103" cy="96" rx="9" ry="5" fill="#ffffff" opacity="0.75"/>
    </g>`)
}

/* ─── ВОЛШЕБНЫЕ ТАЛИСМАНЫ ─── */
const star5 = (cx, cy, R, fill, stroke) => {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? R : R * 0.42
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`)
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="7" stroke-linejoin="round"/>`
}

function magicStar() {
  return svgWrap(star5(128, 132, 62, '#f4b942', '#b27b1d') + star5(184, 62, 22, '#ffdf8f', '#e8a13c'))
}

function magicMoon() {
  return svgWrap(`
    <path d="M158 52 A88 88 0 1 0 158 214 A70 70 0 1 1 158 52 Z" fill="#ffe9be" stroke="#c9964a" stroke-width="8" transform="rotate(-18 128 133)"/>
    ${star5(190, 74, 20, '#f4b942', '#b27b1d')}
    ${sparkle(62, 66, 10, '#ffdf8f')}`)
}

function magicComet() {
  return svgWrap(`
    <path d="M42 196 C86 176 128 128 168 84" fill="none" stroke="#f4b942" stroke-width="18" stroke-linecap="round" opacity="0.55"/>
    <path d="M62 210 C104 190 142 150 178 106" fill="none" stroke="#e8862e" stroke-width="10" stroke-linecap="round" opacity="0.5"/>
    <circle cx="182" cy="98" r="42" fill="#ffd98a" stroke="#b27b1d" stroke-width="8"/>
    <circle cx="170" cy="86" r="14" fill="#ffffff" opacity="0.6"/>
    ${star5(92, 178, 18, '#ffdf8f', '#e8a13c')}`)
}

function magicAurora() {
  return svgWrap(`
    <path d="M48 168 C84 120 128 190 176 118" fill="none" stroke="#57b36b" stroke-width="16" stroke-linecap="round"/>
    <path d="M56 190 C92 148 134 212 184 140" fill="none" stroke="#f4b942" stroke-width="14" stroke-linecap="round" opacity="0.85"/>
    <path d="M64 146 C96 108 132 160 172 100" fill="none" stroke="#b366f0" stroke-width="12" stroke-linecap="round" opacity="0.8"/>
    ${star5(196, 66, 20, '#ffdf8f', '#e8a13c')}`)
}

function magicPaw({ pad, toes, spots, glow }) {
  const spotDots = spots
    ? `<circle cx="118" cy="176" r="7" fill="${spots}"/><circle cx="146" cy="188" r="6" fill="${spots}"/><circle cx="136" cy="164" r="5" fill="${spots}"/>`
    : ''
  const glowRing = glow ? `<circle cx="128" cy="140" r="74" fill="none" stroke="${glow}" stroke-width="8" opacity="0.5"/>` : ''
  return svgWrap(`
    ${glowRing}
    <g>
      <ellipse cx="128" cy="180" rx="42" ry="34" fill="${pad}"/>
      ${spotDots}
      <ellipse cx="76" cy="128" rx="17" ry="23" fill="${toes}" transform="rotate(-18 76 128)"/>
      <ellipse cx="110" cy="106" rx="17" ry="24" fill="${toes}" transform="rotate(-7 110 106)"/>
      <ellipse cx="146" cy="106" rx="17" ry="24" fill="${toes}" transform="rotate(7 146 106)"/>
      <ellipse cx="180" cy="128" rx="17" ry="23" fill="${toes}" transform="rotate(18 180 128)"/>
    </g>`)
}

/* ─── ЛЕОПАРДОВЫЕ КОГОТИ: три изогнутых когтя с пятнами ─── */
function claw({ outer, inner, spots, tipGlow }) {
  const one = (dx, dy, s) => `
    <g transform="translate(${dx} ${dy}) scale(${s})">
      <path d="M0 0 C16 8 22 52 12 96 C8 112 -8 112 -12 96 C-22 52 -16 8 0 0 Z" fill="${outer}"/>
      <path d="M0 14 C10 22 14 52 7 84 C4 94 -4 94 -7 84 C-14 52 -10 22 0 14 Z" fill="${inner}"/>
      ${spots ? `<circle cx="0" cy="38" r="5" fill="${spots}"/><circle cx="2" cy="62" r="4" fill="${spots}"/><circle cx="-2" cy="82" r="4" fill="${spots}"/>` : ''}
    </g>`
  const glow = tipGlow ? `<ellipse cx="128" cy="132" rx="92" ry="84" fill="none" stroke="${tipGlow}" stroke-width="7" opacity="0.45"/>` : ''
  return svgWrap(`
    ${glow}
    ${one(84, 66, 0.82)}
    ${one(128, 48, 1.0)}
    ${one(172, 66, 0.82)}`)
}

/* ─── ОШЕЙНИКИ: ремешок с золотой пряжкой (0.0.68 — леопардовая вершина) ─── */
function collar({ strap, strapDark, buckle, spots }) {
  const spotDots = spots
    ? `<circle cx="72" cy="122" r="6" fill="${spots}"/><circle cx="98" cy="136" r="5" fill="${spots}"/><circle cx="162" cy="120" r="6" fill="${spots}"/><circle cx="186" cy="134" r="5" fill="${spots}"/>`
    : ''
  return svgWrap(`
    <g>
      <rect x="28" y="104" width="200" height="48" rx="24" fill="${strapDark}"/>
      <rect x="28" y="110" width="200" height="36" rx="18" fill="${strap}"/>
      ${spotDots}
      <circle cx="128" cy="128" r="27" fill="${buckle}" stroke="${strapDark}" stroke-width="6"/>
      <circle cx="128" cy="128" r="11" fill="#fff3dc"/>
    </g>`)
}

/* ─── БРАСЛЕТЫ: бусы по кругу со шнурком (0.0.68 — леопардовая вершина) ─── */
function bracelet({ bead, beadDark, spots }) {
  const beads = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    const x = 128 + Math.cos(a) * 58
    const y = 138 + Math.sin(a) * 58
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="${bead}" stroke="${beadDark}" stroke-width="4"/>`
  }).join('')
  const spotDots = spots
    ? `<circle cx="128" cy="80" r="4" fill="${spots}"/><circle cx="186" cy="138" r="4" fill="${spots}"/><circle cx="128" cy="196" r="4" fill="${spots}"/><circle cx="70" cy="138" r="4" fill="${spots}"/>`
    : ''
  return svgWrap(`<g>${beads}${spotDots}</g>`)
}

/* ─── ВЕНЦЫ: корона с тремя зубцами и самоцветами (0.0.68) ─── */
function crown({ band, bandDark, gem, spots }) {
  const spotDots = spots
    ? `<circle cx="88" cy="168" r="6" fill="${spots}"/><circle cx="128" cy="178" r="6" fill="${spots}"/><circle cx="168" cy="168" r="6" fill="${spots}"/>`
    : ''
  return svgWrap(`
    <g>
      <path d="M60 186 L46 92 L94 134 L128 72 L162 134 L210 92 L196 186 Z" fill="${band}" stroke="${bandDark}" stroke-width="9" stroke-linejoin="round"/>
      <rect x="56" y="178" width="144" height="22" rx="11" fill="${bandDark}"/>
      ${spotDots}
      <circle cx="128" cy="118" r="10" fill="${gem}" stroke="${bandDark}" stroke-width="4"/>
      <circle cx="46" cy="92" r="9" fill="${gem}" stroke="${bandDark}" stroke-width="4"/>
      <circle cx="210" cy="92" r="9" fill="${gem}" stroke="${bandDark}" stroke-width="4"/>
    </g>`)
}

/* ─── БОССОВЫЕ БАНОЧКИ (0.0.69): склянка + эмблема босса в зелье ─── */
function bossJar({ liquid, liquidTop, emblem, glow }) {
  const glowRing = glow ? `<circle cx="128" cy="150" r="66" fill="none" stroke="${glow}" stroke-width="8" opacity="0.55"/>` : ''
  return svgWrap(`
    ${glowRing}
    <g>
      <rect x="114" y="42" width="28" height="20" rx="6" fill="#8a5330"/>
      <rect x="108" y="58" width="40" height="16" rx="5" fill="#e3cba4" stroke="#c9a97a" stroke-width="4"/>
      <rect x="72" y="72" width="112" height="128" rx="28" fill="#fff3dc" stroke="#d9c6a8" stroke-width="7"/>
      <path d="M86 118 h84 a12 12 0 0 1 0 14 h-84 a12 12 0 0 1 0 -14 Z" fill="${liquidTop}"/>
      <rect x="86" y="126" width="84" height="60" rx="14" fill="${liquid}"/>
      ${emblem}
      <ellipse cx="103" cy="96" rx="9" ry="5" fill="#ffffff" opacity="0.75"/>
    </g>`)
}

/* Эмблемы боссов в баночках */
const emblemFeather = `
  <g transform="translate(128 150) rotate(-20)">
    <path d="M0 -26 C14 -14 14 8 0 24 C-14 8 -14 -14 0 -26 Z" fill="#f4f7fa" stroke="#8fa3b8" stroke-width="3"/>
    <path d="M0 -22 L0 22" stroke="#8fa3b8" stroke-width="2.5"/>
  </g>`
const emblemPacifier = `
  <g>
    <rect x="120" y="122" width="16" height="11" rx="4" fill="#c96a80"/>
    <circle cx="128" cy="152" r="17" fill="#f7a8b8" stroke="#c96a80" stroke-width="3"/>
    <circle cx="128" cy="152" r="8" fill="#fff3dc" stroke="#c96a80" stroke-width="3"/>
  </g>`
const emblemMane = `
  <g>
    ${Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2
      const x1 = 128 + Math.cos(a) * 16
      const y1 = 150 + Math.sin(a) * 16
      const x2 = 128 + Math.cos(a + 0.28) * 30
      const y2 = 150 + Math.sin(a + 0.28) * 30
      const x3 = 128 + Math.cos(a - 0.28) * 30
      const y3 = 150 + Math.sin(a - 0.28) * 30
      return `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}" fill="#f4b942"/>`
    }).join('')}
    <circle cx="128" cy="150" r="14" fill="#e8862e"/>
  </g>`
const emblemCoin = `
  <g>
    <circle cx="128" cy="150" r="18" fill="#f4c542" stroke="#a87410" stroke-width="4"/>
    <circle cx="128" cy="150" r="10" fill="none" stroke="#a87410" stroke-width="2.5"/>
    ${sparkle(128, 150, 8, '#a87410')}
  </g>`
const emblemHeart = `
  <path d="M128 168 C102 150 98 128 112 119 C120 114 128 119 128 128 C128 119 136 114 144 119 C158 128 154 150 128 168 Z" fill="#ff8fb3" stroke="#c94a78" stroke-width="3.5"/>`

/* ─── Каталог иконок ─── */
const ICONS = {
  /* Кольца */
  'ring-silver': ring({ band: '#c7c2ba', bandDark: '#8f887e', gem: '#ede6dc', gemDark: '#a89f92' }),
  'ring-amber': ring({ band: '#e8862e', bandDark: '#a85a14', gem: '#ffb25e', gemDark: '#c96a1a' }),
  'ring-emerald': ring({ band: '#3f8a5f', bandDark: '#2a5f42', gem: '#6fc287', gemDark: '#2f7a4c' }),
  'ring-sunstone': ring({ band: '#f4b942', bandDark: '#b27b1d', gem: '#ffdd7a', gemDark: '#d99a1f' }),
  'ring-leopard': ring({ band: '#e8862e', bandDark: '#a85a14', gem: '#f4b942', gemDark: '#c96a1a', spots: '#7a4a1f' }),
  'ring-leopard-gold': ring({ band: '#e3a81c', bandDark: '#8a5a12', gem: '#ffe066', gemDark: '#d99a1f', spots: '#8a5a12' }),
  'ring-leopard-mega': ring({ band: '#9a4ed6', bandDark: '#5e2b8f', gem: '#c77dff', gemDark: '#7a29c9', spots: '#4a1f73' }),
  /* Баночки */
  'jar-mint': jar({ liquid: '#7fcf9e', liquidTop: '#a8e2bd' }),
  'jar-honey': jar({ liquid: '#f4b942', liquidTop: '#ffd98a' }),
  'jar-berry': jar({ liquid: '#d94a56', liquidTop: '#ec8a92' }),
  'jar-star': jar({ liquid: '#b366f0', liquidTop: '#d0a1f7' }),
  'jar-leopard': jar({ liquid: '#e8862e', liquidTop: '#f4b942', spots: '#7a4a1f' }),
  'jar-leopard-gold': jar({ liquid: '#e9c24a', liquidTop: '#ffe066', spots: '#8a5a12' }),
  'jar-leopard-mega': jar({ liquid: '#9a4ed6', liquidTop: '#c77dff', spots: '#4a1f73', glow: '#c77dff' }),
  /* Боссовые баночки (0.0.69): голубь → малыш → лев → цыган → Лана */
  'jar-pigeon': bossJar({ liquid: '#a7b6c4', liquidTop: '#c2cfda', emblem: emblemFeather }),
  'jar-kid': bossJar({ liquid: '#f2c4cf', liquidTop: '#fadde4', emblem: emblemPacifier }),
  'jar-lion': bossJar({ liquid: '#ef6b3a', liquidTop: '#f7986e', emblem: emblemMane }),
  'jar-gypsy': bossJar({ liquid: '#d9a62e', liquidTop: '#ecc96e', emblem: emblemCoin }),
  'jar-marten': bossJar({ liquid: '#ee6fa8', liquidTop: '#f8a6c9', emblem: emblemHeart, glow: '#f273a8' }),
  /* Талисманы */
  'magic-star': magicStar(),
  'magic-moon': magicMoon(),
  'magic-comet': magicComet(),
  'magic-aurora': magicAurora(),
  'magic-leopard': magicPaw({ pad: '#e8862e', toes: '#f4b942', spots: '#7a4a1f' }),
  'magic-leopard-gold': magicPaw({ pad: '#e3a81c', toes: '#ffe066', spots: '#8a5a12' }),
  'magic-leopard-mega': magicPaw({ pad: '#9a4ed6', toes: '#c77dff', spots: '#4a1f73', glow: '#c77dff' }),
  /* Леопардовые когти */
  'claw-leopard': claw({ outer: '#6b4226', inner: '#e8862e', spots: '#4a2b10' }),
  'claw-leopard-gold': claw({ outer: '#8a5a12', inner: '#f4c542', spots: '#8a5a12' }),
  'claw-leopard-mega': claw({ outer: '#4a1f73', inner: '#b366f0', spots: '#2d1145', tipGlow: '#c77dff' }),
  /* Ошейники/браслеты/венцы (0.0.68): леопардовые вершины + розовый венец */
  'col-leopard': collar({ strap: '#E8862E', strapDark: '#A85A14', buckle: '#F4B942', spots: '#7A4A1F' }),
  'bra-leopard': bracelet({ bead: '#E8862E', beadDark: '#A85A14', spots: '#7A4A1F' }),
  'crown-rose': crown({ band: '#D94A56', bandDark: '#A83440', gem: '#F7A8B8' }),
  'crown-leopard': crown({ band: '#E8862E', bandDark: '#A85A14', gem: '#F4B942', spots: '#7A4A1F' }),
}

await mkdir('public/inventory', { recursive: true })
let n = 0
for (const [name, svg] of Object.entries(ICONS)) {
  await sharp(Buffer.from(svg)).png().toFile(`public/inventory/${name}.png`)
  n++
  console.log(`✓ ${name}.png`)
}
console.log(`Готово: ${n} иконок`)
