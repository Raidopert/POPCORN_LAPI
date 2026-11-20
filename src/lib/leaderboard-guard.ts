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
 *
 * v0.0.71 (правила VK Mini Apps):
 *  - cleanNick — фильтр нецензурных ников (п. 2.5.2: пользовательский контент
 *    должен модерироваться; таблица лидеров — публичное место);
 *  - verifyVKParams — проверка подписи параметров запуска VK (п. 1.2.2:
 *    HMAC-SHA256 отсортированных параметров с VK_APP_SECRET, base64url).
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

/* ---------- модерация ников (п. 2.5.2) ---------- */

/** Корни нецензурных слов и грубых оскорблений (RU + EN), по включению */
const PROFANITY_ROOTS = [
  'хуй', 'хуе', 'хуи', 'хуё', 'хуя', 'пизд', 'бля', 'сука', 'суки',
  'еба', 'ебе', 'ёба', 'ёбе', 'еба', 'трахнут', 'мудак', 'мудац',
  'гандон', 'гондон', 'пидор', 'пидар', 'пидрас', 'залуп', 'дроч',
  'шлюх', 'шалав', 'долбоеб', 'долбаёб', 'долбоз', 'хер', 'лох ',
  'fuck', 'sh1t', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'dick ',
  'asshole', 'nigg', 'fagg', 'wanker', 'bastard',
]

/** Визуальные подмены латиницы/цифр кириллицей (p→р, 0→о, @→а…) */
const VISUAL_LEET: Record<string, string> = {
  a: 'а', c: 'с', e: 'е', o: 'о', p: 'р', y: 'у', x: 'х',
  '0': 'о', '1': 'и', '3': 'з', '4': 'ч', '6': 'б', '@': 'а',
}
/** Транслитерация латиницы (p→п, z→з, d→д…) — «p1zda» = «пизда» */
const TRANSLIT: Record<string, string> = {
  a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', g: 'г', i: 'и', k: 'к',
  l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т',
  u: 'у', v: 'в', y: 'ы', z: 'з',
  '0': 'о', '1': 'и', '3': 'з', '4': 'ч', '6': 'б', '@': 'а',
}

function applyMap(s: string, map: Record<string, string>): string {
  return s.replace(/[a-z0-9@]/g, (ch) => map[ch] ?? ch)
}

/** true — ник содержит нецензурное слово (нельзя в публичный топ).
    Проверяем исходник, визуальные подмены и транслит */
function isProfane(name: string): boolean {
  const lower = name.toLowerCase().replace(/ё/g, 'е')
  /* Ещё вариант со снятыми разделителями — «f.u.c.k», «ху-й» */
  const stripped = lower.replace(/[^a-z0-9а-я]/g, '')
  const variants = [lower, stripped, applyMap(lower, VISUAL_LEET), applyMap(lower, TRANSLIT)]
  return PROFANITY_ROOTS.some((root) => variants.some((v) => v.includes(root)))
}

/** Ник: без управляющих символов, до 24 знаков, пустой или нецензурный → «Котик» */
export function cleanNick(raw: unknown): string {
  let name = typeof raw === 'string' ? raw : ''
  name = name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24)
  if (!name || isProfane(name)) return 'Котик'
  return name
}

/* ---------- подпись параметров запуска VK (п. 1.2.2) ---------- */

/** PHP http_build_query (RFC1738): пробел → '+', спецсимволы → %XX */
function phpUrlEncode(s: string): string {
  return encodeURIComponent(s)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+')
}

/** HMAC-SHA256(base64url) от отсортированного «key=value&...» */
function vkSignOf(secret: string, flat: Record<string, string>, encode: boolean): string {
  const qs = Object.keys(flat)
    .sort()
    .map((k) => `${k}=${encode ? phpUrlEncode(flat[k]) : flat[k]}`)
    .join('&')
  return createHmac('sha256', secret).update(qs).digest('base64url')
}

/** Timing-safe сравнение двух строк одинаковой природы (base64url без паддинга) */
function safeEqB64(a: string, b: string): boolean {
  const ba = Buffer.from(a.replace(/=+$/, ''))
  const bb = Buffer.from(b.replace(/=+$/, ''))
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/**
 * Проверка подписи параметров запуска VK Mini App.
 * Схема VK: отсортированный `key=value&...` → HMAC-SHA256 с VK_APP_SECRET →
 * base64url. Нюанс, который ломал проверку в проде (0.0.74):
 *
 *   1) VK подписывает ПАРАМЕТРЫ URL ЗАПУСКА, а клиент раньше присылал объект
 *      из VKWebAppGetLaunchParams — у него фиксированный набор полей, часть
 *      vk_*-параметров конкретной точки входа (vk_is_recommended, vk_https…)
 *      там отсутствует → строка для HMAC не совпадает → 403 у КАЖДОГО
 *      VK-игрока, рекорды «не сохраняются». Клиент теперь присылает свежий
 *      парс window.location.search (см. getVKSignedParams в lib/game/vk.ts).
 *   2) Официальные примеры VK различаются: в одних в строку идут только
 *      vk_*-параметры, в других — ВСЕ параметры без sign; в примерах PHP
 *      значения проходят через http_build_query (URL-кодирование).
 *
 * Поэтому считаем подпись в четырёх канонических вариантах (vk_*-фильтр /
 * все поля × raw / php-кодирование) и принимаем любой совпавший —
 * подделать её без секрета по-прежнему невозможно.
 *
 * Мягкий режим: секрет не настроен (env отсутствует) или vk-полей нет в запросе
 * (клиент вне VK) → true. Подпись есть, но не сходится → false (запрос подделан).
 */
export function verifyVKParams(vk: unknown): boolean {
  const appSecret = process.env.VK_APP_SECRET
  if (!appSecret) return true
  if (vk === undefined || vk === null) return true
  if (typeof vk !== 'object') return false
  const rec = vk as Record<string, unknown>
  const sign = rec.sign
  if (typeof sign !== 'string' || !sign) return false
  const flatVK: Record<string, string> = {}
  const flatAll: Record<string, string> = {}
  for (const [k, v] of Object.entries(rec)) {
    if (k === 'sign' || k === 'sig' || v === undefined || v === null) continue
    flatAll[k] = String(v)
    if (k.startsWith('vk_')) flatVK[k] = String(v)
  }
  return (
    safeEqB64(vkSignOf(appSecret, flatVK, false), sign) ||
    safeEqB64(vkSignOf(appSecret, flatVK, true), sign) ||
    safeEqB64(vkSignOf(appSecret, flatAll, false), sign) ||
    safeEqB64(vkSignOf(appSecret, flatAll, true), sign)
  )
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
