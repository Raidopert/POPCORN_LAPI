/**
 * Онлайн-лидерборд POPCORN PAWS на Prisma.
 *
 * База: локально SQLite (file:./db/custom.db), в проде Supabase Postgres —
 * схема в prisma/schema.prisma переносимая, отличается только provider
 * и DATABASE_URL. Без доступной базы все функции возвращают null/false:
 * API честно отвечает { online: false } и игра продолжает вести
 * локальный список на устройстве.
 *
 * Защита от накрутки описана в src/lib/leaderboard-guard.ts
 * (HMAC-токен забега + одноразовость + тайминги + rate-limit).
 */

import { db } from '@/lib/db'
import { MAX_RUN_MS, MIN_RUN_MS, verifyRunToken } from '@/lib/leaderboard-guard'

export interface OnlineLeader {
  name: string
  score: number
  level: number
  date: number
}

export interface WorldStats {
  /** Сколько раз игру запускали (открыли сайт) */
  launches: number
  /** Сколько забегов завершилось (записаны в таблицу) */
  runs: number
  /** Сколько устройств сдавало забеги в мировой топ */
  players: number
  /** Суммарные секунды в игре у всех игроков (по завершённым забегам) */
  playSecs: number
  /** Уникальных устройств заходило на сайт (новые пользователи) */
  visitors: number
}

/* ---------- автосоздание таблиц (Supabase: нулевая настройка) ---------- */

/**
 * Идемпотентный DDL, дословно повторяющий prisma/schema.prisma
 * (диалект Postgres: quoted identifiers, TIMESTAMP(3), BIGINT).
 *
 * Выполняется один раз на процесс сервера при первом обращении к базе:
 * на Vercel достаточно задать DATABASE_URL → redeploy → первый же
 * запрос сам создаст все таблицы и индексы. Ни SQL-редактор Supabase,
 * ни prisma db push вручную запускать не нужно.
 *
 * Локальный SQLite сюда не попадает: там таблицы создаёт `bun run db:push`.
 * Правка схемы: обнови prisma/schema.prisma и этот массив ОДНОВРЕМЕННО.
 */
const POSTGRES_DDL: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS "LeaderPlayer" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "nick" TEXT NOT NULL DEFAULT 'Котик',
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "bestLevel" INTEGER NOT NULL DEFAULT 0,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeaderPlayer_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LeaderPlayer_device_key" ON "LeaderPlayer"("device")`,
  `CREATE INDEX IF NOT EXISTS "LeaderPlayer_bestScore_idx" ON "LeaderPlayer"("bestScore")`,

  `CREATE TABLE IF NOT EXISTS "LeaderRun" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "ipHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "score" INTEGER,
    "level" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "LeaderRun_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "LeaderRun_ipHash_startedAt_idx" ON "LeaderRun"("ipHash", "startedAt")`,
  `CREATE INDEX IF NOT EXISTS "LeaderRun_device_status_idx" ON "LeaderRun"("device", "status")`,

  `CREATE TABLE IF NOT EXISTS "LeaderSubmission" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaderSubmission_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LeaderSubmission_runId_key" ON "LeaderSubmission"("runId")`,
  `CREATE INDEX IF NOT EXISTS "LeaderSubmission_score_idx" ON "LeaderSubmission"("score")`,
  `CREATE INDEX IF NOT EXISTS "LeaderSubmission_device_idx" ON "LeaderSubmission"("device")`,

  `CREATE TABLE IF NOT EXISTS "LeaderStat" (
    "key" TEXT NOT NULL,
    "value" BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT "LeaderStat_pkey" PRIMARY KEY ("key")
  )`,

  `CREATE TABLE IF NOT EXISTS "LeaderVisit" (
    "device" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeaderVisit_pkey" PRIMARY KEY ("device")
  )`,
]

let ensurePromise: Promise<void> | null = null

function isPostgresUrl(): boolean {
  return /^postgres(ql)?:/i.test((process.env.DATABASE_URL ?? '').trim())
}

/**
 * Создать таблицы в Postgres (один раз на процесс; при ошибке —
 * повтор на следующем запросе). Вызывается перед каждой операцией
 * с базой внутри существующих try/catch: неудача старта даёт
 * обычный offline-режим, игра не падает.
 */
function ensureTables(): Promise<void> {
  if (!isPostgresUrl()) return Promise.resolve()
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const sql of POSTGRES_DDL) await db.$executeRawUnsafe(sql)
      console.log('[leaders] ensureTables: таблицы Postgres готовы')
    })().catch((err) => {
      ensurePromise = null // разрешаем повторную попытку на следующем запросе
      throw err
    })
  }
  return ensurePromise
}

/* ---------- чтение топа и статистики ---------- */

export async function fetchTopLeaders(limit = 20): Promise<OnlineLeader[] | null> {
  try {
    await ensureTables()
    const rows = await db.leaderSubmission.findMany({
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      take: limit,
      select: { nick: true, score: true, level: true, createdAt: true },
    })
    return rows.map((r) => ({
      name: r.nick,
      score: r.score,
      level: r.level,
      date: r.createdAt.getTime(),
    }))
  } catch (err) {
    console.error('[leaders] fetch failed:', err)
    return null
  }
}

export async function fetchWorldStats(): Promise<WorldStats | null> {
  try {
    await ensureTables()
    const [counters, groups, visits] = await Promise.all([
      db.leaderStat.findMany({ where: { key: { in: ['launches', 'runs', 'playsecs'] } } }),
      db.leaderSubmission.groupBy({ by: ['device'] }),
      db.leaderVisit.count(),
    ])
    const get = (k: string) => Number(counters.find((c) => c.key === k)?.value ?? 0)
    return {
      launches: get('launches'),
      runs: get('runs'),
      players: groups.length,
      playSecs: get('playsecs'),
      visitors: visits,
    }
  } catch (err) {
    console.error('[leaders] fetchWorldStats failed:', err)
    return null
  }
}

/** Прибавить delta к счётчику (запуск игры, забег, секунды в игре); null без базы */
export async function bumpStat(key: string, delta = 1): Promise<number | null> {
  try {
    await ensureTables()
    const s = await db.leaderStat.upsert({
      where: { key },
      create: { key, value: Math.max(1, Math.floor(delta)) },
      update: { value: { increment: Math.max(0, Math.floor(delta)) } },
    })
    return Number(s.value)
  } catch (err) {
    console.error('[leaders] bumpStat failed:', err)
    return null
  }
}

/**
 * Записать визит устройства (POST /api/sessions с deviceId).
 * true — устройство новое (новый пользователь), false — уже заходило/ошибка.
 */
export async function recordVisit(device: string): Promise<boolean> {
  try {
    await ensureTables()
    const existing = await db.leaderVisit.findUnique({ where: { device } })
    if (existing) {
      /* lastAt обновится сам (@updatedAt) */
      await db.leaderVisit.update({ where: { device }, data: { lastAt: new Date() } })
      return false
    }
    await db.leaderVisit.create({ data: { device } })
    return true
  } catch (err) {
    console.error('[leaders] recordVisit failed:', err)
    return false
  }
}

/* ---------- защищённый цикл забега ---------- */

export interface OpenRun {
  runId: string
  startedAt: number
}

/** Открыть забег: строка LeaderRun (nonce) + HMAC-токен, одноразовый */
export async function startLeaderRun(device: string, ipHash: string): Promise<OpenRun | null> {
  try {
    await ensureTables()
    const run = await db.leaderRun.create({ data: { device, ipHash } })
    return { runId: run.id, startedAt: run.startedAt.getTime() }
  } catch (err) {
    console.error('[leaders] start failed:', err)
    return null
  }
}

export interface SubmitArgs {
  runId: string
  /** HMAC-токен из /api/leaders/start (подпись runId + серверного времени старта) */
  token: unknown
  device: string
  nick: string
  score: number
  level: number
  /** Секунды чистой игры (клиентские, зажимаются серверным таймингом забега) */
  secs?: number
}

export type SubmitReason = 'no-run' | 'replay' | 'too-fast' | 'expired' | 'db'

export interface SubmitResult {
  ok: boolean
  reason?: SubmitReason
  /** Место игрока по личному рекорду после зачёта (1 = лидер) */
  rank?: number
  best?: number
}

/**
 * Зачесть забег с полной проверкой защиты:
 *   1) токен: HMAC(runId + серверное время старта) — подделка или чужой runId
 *      дают один и тот же ответ «no-run», чтобы не подсказывать взлому;
 *   2) тайминги: слишком быстрый результат отклоняется, зависший (3 ч) истекает;
 *   3) одноразовость: atomic UPDATE ... WHERE status='open' в транзакции —
 *      двойной submit того же runId невозможен даже при гонке.
 */
export async function submitLeaderRun(a: SubmitArgs): Promise<SubmitResult> {
  let run
  try {
    await ensureTables()
    run = await db.leaderRun.findUnique({
      where: { id: a.runId },
      select: { id: true, device: true, status: true, startedAt: true },
    })
  } catch (err) {
    console.error('[leaders] submit lookup failed:', err)
    return { ok: false, reason: 'db' }
  }
  /* Не существует / чужой device / неверная подпись — неотличимо друг от друга */
  if (!run || run.device !== a.device || !verifyRunToken(run.id, run.startedAt.getTime(), a.token)) {
    return { ok: false, reason: 'no-run' }
  }
  if (run.status !== 'open') return { ok: false, reason: 'replay' }

  const now = Date.now()
  const elapsed = now - run.startedAt.getTime()
  if (elapsed < MIN_RUN_MS) return { ok: false, reason: 'too-fast' }
  if (elapsed > MAX_RUN_MS) {
    await expireRun(run.id)
    return { ok: false, reason: 'expired' }
  }

  try {
    await db.$transaction(async (tx) => {
      const claimed = await tx.leaderRun.updateMany({
        where: { id: run.id, status: 'open' },
        data: { status: 'submitted', score: a.score, level: a.level, endedAt: new Date(now) },
      })
      if (claimed.count === 0) throw new Error('REPLAY')

      await tx.leaderSubmission.create({
        data: { runId: run.id, device: a.device, nick: a.nick, score: a.score, level: a.level },
      })

      const p = await tx.leaderPlayer.findUnique({ where: { device: a.device } })
      if (!p) {
        await tx.leaderPlayer.create({
          data: { device: a.device, nick: a.nick, bestScore: a.score, bestLevel: a.level, runs: 1 },
        })
      } else {
        await tx.leaderPlayer.update({
          where: { device: a.device },
          data: {
            nick: a.nick,
            runs: { increment: 1 },
            bestScore: Math.max(p.bestScore, a.score),
            bestLevel: Math.max(p.bestLevel, a.level),
          },
        })
      }
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'REPLAY') return { ok: false, reason: 'replay' }
    console.error('[leaders] submit failed:', err)
    return { ok: false, reason: 'db' }
  }

  /* Счётчики завершённых забегов и игрового времени + место игрока (некритично) */
  await bumpStat('runs')
  /* Игровое время: клиентские секунды чистой игры, зажатые таймингом забега */
  const playSecs = Math.max(0, Math.min(Math.floor(Number(a.secs) || 0), Math.floor(elapsed / 1000) + 5))
  if (playSecs > 0) await bumpStat('playsecs', playSecs)
  const rank = await playerRank(a.device)
  return { ok: true, rank: rank?.rank, best: rank?.best }
}

/** Истечь просроченный забег (записать, чтобы не висел open) */
export async function expireRun(runId: string): Promise<void> {
  try {
    await ensureTables()
    await db.leaderRun.updateMany({
      where: { id: runId, status: 'open' },
      data: { status: 'expired', endedAt: new Date() },
    })
  } catch (err) {
    console.error('[leaders] expire failed:', err)
  }
}

export interface PlayerRank {
  rank: number
  best: number
}

/** Место игрока по личному рекорду: 1 + сколько игроков строже */
export async function playerRank(device: string): Promise<PlayerRank | null> {
  try {
    await ensureTables()
    const p = await db.leaderPlayer.findUnique({
      where: { device },
      select: { bestScore: true },
    })
    if (!p || p.bestScore <= 0) return null
    const better = await db.leaderPlayer.count({
      where: { bestScore: { gt: p.bestScore } },
    })
    return { rank: better + 1, best: p.bestScore }
  } catch (err) {
    console.error('[leaders] rank failed:', err)
    return null
  }
}
