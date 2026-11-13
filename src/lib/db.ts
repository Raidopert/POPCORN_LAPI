import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Подстройка строки подключения под Supabase Transaction pooler.
 *
 * Transaction pooler (порт 6543) — это PgBouncer в transaction mode:
 * серверные prepared statements через него ломаются («prepared statement
 * s0 already exists»), поэтому Prisma нужен флаг pgbouncer=true.
 * Заодно выставляем serverless-рекомендации, если игрок их не задал:
 *   connection_limit=1 — по одному соединению на инстанс (Vercel),
 *   sslmode=require    — шифрование обязательно.
 * Строка правится чисто текстово: пароль может содержать спецсимволы,
 * которые URL-парсер перекодировал бы. Локальный SQLite и Docker-Postgres
 * (порт 5432, не pooler.supabase.com) не трогаются вовсе.
 */
function normalizePostgresUrl(raw: string): string {
  const url = raw.trim()
  if (!/^postgres(ql)?:/i.test(url)) return url
  if (!/pooler\.supabase\.com/i.test(url)) return url
  let out = url
  const sep = out.includes('?') ? '&' : '?'
  if (!/[?&]pgbouncer=/.test(out)) out += `${sep}pgbouncer=true`
  if (!/[?&]connection_limit=/.test(out)) out += `${sep}connection_limit=1`
  if (!/[?&]sslmode=/.test(out)) out += `${sep}sslmode=require`
  return out
}

const rawUrl = (process.env.DATABASE_URL ?? '').trim()
const dbUrl = normalizePostgresUrl(rawUrl)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(
    dbUrl && dbUrl !== rawUrl ? { datasources: { db: { url: dbUrl } } } : undefined,
  )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db