/**
 * Онлайн-лидерборд: общий топ игроков со всего мира.
 * Работает на Vercel + Neon Postgres (DATABASE_URL) — достаточно подключить
 * базу в настройках проекта. Без базы API честно отвечает { online: false }
 * и игра продолжает вести локальный список на устройстве.
 */

import postgres from 'postgres'

type Sql = ReturnType<typeof postgres>

let client: Sql | null = null
let initPromise: Promise<Sql | null> | null = null

function connectionString(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  )
}

/** Ленивое подключение: создаётся один раз на тёплый инстанс */
function getSql(): Promise<Sql | null> {
  if (!connectionString()) return Promise.resolve(null)
  if (client) return Promise.resolve(client)
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const sql = postgres(connectionString() as string, {
          max: 3,
          idle_timeout: 20,
          connect_timeout: 8,
          prepare: false,
        })
        // Таблица создаётся автоматически при первом обращении
        await sql`
          CREATE TABLE IF NOT EXISTS leaders (
            id serial PRIMARY KEY,
            name varchar(24) NOT NULL,
            score int NOT NULL,
            level int NOT NULL,
            created timestamptz NOT NULL DEFAULT now()
          )
        `
        client = sql
        return sql
      } catch (err) {
        console.error('[leaders] db init failed:', err)
        return null
      }
    })()
  }
  return initPromise
}

export interface OnlineLeader {
  name: string
  score: number
  level: number
  date: number
}

export async function fetchTopLeaders(limit = 20): Promise<OnlineLeader[] | null> {
  const sql = await getSql()
  if (!sql) return null
  try {
    const rows = await sql<{ name: string; score: number; level: number; created: Date }[]>`
      SELECT name, score, level, created FROM leaders
      ORDER BY score DESC, created ASC
      LIMIT ${limit}
    `
    return rows.map((r) => ({
      name: r.name,
      score: r.score,
      level: r.level,
      date: new Date(r.created).getTime(),
    }))
  } catch (err) {
    console.error('[leaders] fetch failed:', err)
    return null
  }
}

export interface SubmitScore {
  name: string
  score: number
  level: number
}

/** Простая, но строгая валидация: без «диверсий» в таблице лидеров */
export function sanitizeScore(body: unknown): SubmitScore | null {
  if (!body || typeof body !== 'object') return null
  const o = body as Record<string, unknown>
  let name = typeof o.name === 'string' ? o.name : ''
  name = name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24)
  if (!name) name = 'Котик'
  const score = Math.floor(Number(o.score))
  const level = Math.floor(Number(o.level))
  if (!Number.isFinite(score) || score < 0 || score > 100000) return null
  if (!Number.isFinite(level) || level < 1 || level > 999) return null
  return { name, score, level }
}

export async function insertScore(s: SubmitScore): Promise<boolean> {
  const sql = await getSql()
  if (!sql) return false
  try {
    await sql`
      INSERT INTO leaders (name, score, level) VALUES (${s.name}, ${s.score}, ${s.level})
    `
    return true
  } catch (err) {
    console.error('[leaders] insert failed:', err)
    return false
  }
}
