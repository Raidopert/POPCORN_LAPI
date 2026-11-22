/**
 * Автовыбор провайдера Prisma по протоколу DATABASE_URL.
 *
 * ПОЧЕМУ ЭТО НУЖНО: схема одна, а сред две.
 *   • Локальная разработка: SQLite   — DATABASE_URL="file:./db/custom.db"
 *   • Прод (Vercel + Supabase/Neon): Postgres — DATABASE_URL="postgresql://…"
 * Prisma-клиент компилируется ПОД конкретный провайдер, поэтому перед
 * `prisma generate` / `prisma db push` провайдер в схеме должен совпадать
 * с протоколом DATABASE_URL — иначе клиент собирается под SQLite и в проде
 * не может соединиться с Postgres (лидерборд отвечает online:false).
 *
 * Скрипт идемпотентен: запускается на postinstall и на build,
 * сам переключает provider в prisma/schema.prisma:
 *   file:*        → provider = "sqlite"
 *   postgres*     → provider = "postgresql"
 * Если DATABASE_URL не задан — схема не трогается (в git лежит sqlite).
 *
 * Настройка прода: см. секцию «Мировой лидерборд» в README.md
 * (Supabase → DATABASE_URL + LEADERBOARD_SECRET в Vercel → redeploy).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const schemaPath = join(root, 'prisma', 'schema.prisma')

const url = (process.env.DATABASE_URL ?? '').trim()
let wanted = null
if (/^file:/i.test(url)) wanted = 'sqlite'
else if (/^postgres(ql)?:/i.test(url)) wanted = 'postgresql'
else if (url.length > 0) {
  console.warn(`[prisma-provider] DATABASE_URL с неизвестным протоколом: ${url.replace(/:[^:@/]*@/, ':***@')} — схема не менялась`)
}

if (!wanted) {
  console.log('[prisma-provider] DATABASE_URL не задан или пуст — provider оставлен как в схеме')
  process.exit(0)
}

const src = readFileSync(schemaPath, 'utf8')
const re = /(datasource\s+db\s*\{[^}]*provider\s*=\s*")(sqlite|postgresql)("\s*)/m
const m = src.match(re)
if (!m) {
  console.error('[prisma-provider] не нашёл provider в datasource db — проверь prisma/schema.prisma')
  process.exit(0)
}
if (m[2] === wanted) {
  console.log(`[prisma-provider] provider уже "${wanted}" — изменений не нужно`)
  process.exit(0)
}

const next = src.replace(re, `$1${wanted}$3`)
writeFileSync(schemaPath, next)
console.log(`[prisma-provider] provider: ${m[2]} → ${wanted} (по протоколу DATABASE_URL)`)
