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

/* ---------- счётчики мировой статистики ---------- */

export interface WorldStats {
  /** Сколько раз игру запускали (открыли сайт) */
  launches: number
  /** Сколько забегов завершилось (записаны в таблицу) */
  runs: number
  /** Сколько уникальных котиков играло */
  players: number
}

/** Таблица счётчиков создаётся автоматически, как и leaders */
async function ensureStatsTable(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS stats (
      key varchar(24) PRIMARY KEY,
      value bigint NOT NULL DEFAULT 0
    )
  `
}

/** +1 к счётчику (запуск игры, завершённый забег); возвращает новое значение или null без базы */
export async function bumpStat(key: string): Promise<number | null> {
  const sql = await getSql()
  if (!sql) return null
  try {
    await ensureStatsTable(sql)
    await sql`INSERT INTO stats (key, value) VALUES (${key}, 0) ON CONFLICT (key) DO NOTHING`
    const rows = await sql<{ value: string }[]>`
      UPDATE stats SET value = value + 1 WHERE key = ${key} RETURNING value
    `
    return Number(rows[0]?.value ?? 0)
  } catch (err) {
    console.error('[leaders] bumpStat failed:', err)
    return null
  }
}

/** Прочитать мировую статистику (null — база недоступна) */
export async function fetchWorldStats(): Promise<WorldStats | null> {
  const sql = await getSql()
  if (!sql) return null
  try {
    await ensureStatsTable(sql)
    const counters = await sql<{ key: string; value: string }[]>`
      SELECT key, value FROM stats WHERE key IN ('launches', 'runs')
    `
    const distinct = await sql<{ n: string }[]>`
      SELECT COUNT(DISTINCT name) AS n FROM leaders
    `
    const get = (k: string) => Number(counters.find((c) => c.key === k)?.value ?? 0)
    return {
      launches: get('launches'),
      runs: get('runs'),
      players: Number(distinct[0]?.n ?? 0),
    }
  } catch (err) {
    console.error('[leaders] fetchWorldStats failed:', err)
    return null
  }
}
