/**
 * Защита лидерборда от накрутки (простейшая, но честная связка):
 *
 * 1. HMAC-токен забега — сервер выдаёт его в /api/leaders/start,
 *    клиент обязан вернуть при submit. Подделать без секрета нельзя,
 *    replay (второй submit того же runId) отклоняется одноразовостью
 *    строки LeaderRun (atomic UPDATE ... WHERE status='open').
 * 2. Тайминги: результат не может прийти раньше MIN_RUN_MS после старта
 *    (реальный забег физически дольше) и позже MAX_RUN_MS.
 * 3. Разумность счёта: потолок scoreCap(level). Реальные максимумы честной
 *    игры: золотое зерно +50 × комбо ×5 × перк «Двойной улов» ×2 ×
 *    древо «Урожай» ×1.5 × перки-квота ×1.56 — до ~1000 очков с зерна
 *    и ~10–40k за уровень на высоких уровнях, поэтому потолок щедрый:
 *    15000 + 10000×L (абсолютный — 1 млн). Накрутка всё равно упирается
 *    в HMAC-токен и тайминги.
 * 4. Rate-limit в памяти инстанса (скользящее окно) на IP-хэш и
 *    deviceId: спам start/submit режется до обращения к базе.
 *
 * Секрет — env LEADERBOARD_SECRET (в dev есть fallback).
 */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/* ---------- константы защиты ---------- */

/** Результат раньше этого — забег физически не успел (END GAME сразу после старта) */
export const MIN_RUN_MS = 15_000
/** Результат позже этого — забег завис/подменён (3 часа) */
export const MAX_RUN_MS = 3 * 60 * 60 * 1000
/** Открытий забегов с одного IP в час */
export const STARTS_PER_HOUR = 40
/** Забегов с одного устройства в час */
export const DEVICE_STARTS_PER_HOUR = 24
/** Submit'ов с одного IP в час */
export const SUBMITS_PER_HOUR = 30
/** Минимальная пауза между submit'ами одного устройства */
export const DEVICE_SUBMIT_GAP_MS = 10_000
/** Мировой потолок очков (страховка поверх level-потолка) */
export const ABSOLUTE_SCORE_CAP = 1_000_000

function secret(): string {
  return process.env.LEADERBOARD_SECRET || 'popcorn-paws-dev-secret'
}

/* ---------- HMAC-токен забега ---------- */

/** Подпись: HMAC_SHA256(secret, `${runId}.${startedAtMs}`) — hex */
export function signRun(runId: string, startedAtMs: number): string {
  return createHmac('sha256', secret()).update(`${runId}.${startedAtMs}`).digest('hex')
}

/** Постоянная проверка подписи (timing-safe, без утечки через ранний return) */
export function verifyRunToken(runId: string, startedAtMs: number, token: unknown): boolean {
  if (typeof token !== 'string') return false
  const a = Buffer.from(signRun(runId, startedAtMs), 'hex')
  let b: Buffer
  try {
    b = Buffer.from(token, 'hex')
  } catch {
    return false
  }
  return a.length === b.length && timingSafeEqual(a, b)
}

/* ---------- IP ---------- */

/** Анонимный хэш IP (для rate-limit): sha256(ip + secret), 24 hex-символа */
export function ipHashOf(req: Request): string {
  const h = req.headers
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    'local'
  return createHash('sha256').update(`${ip}.${secret()}`).digest('hex').slice(0, 24)
}

/* ---------- rate-limit: скользящее окно в памяти ---------- */

const buckets = new Map<string, number[]>()

/** true — разрешено; false — лимит исчерпан */
export function rateLimit(key: string, max: number, windowMs: number, minGapMs = 0): boolean {
  const now = Date.now()
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (arr.length >= max) {
    buckets.set(key, arr)
    return false
  }
  if (minGapMs > 0 && arr.length > 0 && now - arr[arr.length - 1] < minGapMs) {
    buckets.set(key, arr)
    return false
  }
  arr.push(now)
  buckets.set(key, arr)
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k)
    }
  }
  return true
}

/* ---------- санитизация входа ---------- */

/** deviceId: строка 8..64 символов из безопасного алфавита */
export function cleanDevice(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const d = raw.trim().slice(0, 64)
  return /^[A-Za-z0-9_-]{8,64}$/.test(d) ? d : null
}

/** Ник: без управляющих символов, до 24 знаков, пустой → «Котик» */
export function cleanNick(raw: unknown): string {
  let name = typeof raw === 'string' ? raw : ''
  name = name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24)
  return name || 'Котик'
}

/** Потолок очков для уровня: честная игра не выбьет его даже с максимальными
    множителями (золото ×5 комбо ×2 перк ×1.5 древо ×1.56 квота → ~1000/зерно,
    ~10–40k за уровень на высоких) */
export function scoreCap(level: number): number {
  return Math.min(ABSOLUTE_SCORE_CAP, 15_000 + level * 10_000)
}

/** Проверка score/level; возвращает числа или null */
export function cleanScoreLevel(score: unknown, level: unknown): { score: number; level: number } | null {
  const s = Math.floor(Number(score))
  const l = Math.floor(Number(level))
  if (!Number.isFinite(s) || s < 0 || s > ABSOLUTE_SCORE_CAP) return null
  if (!Number.isFinite(l) || l < 1 || l > 999) return null
  if (s > scoreCap(l)) return null
  return { score: s, level: l }
}
