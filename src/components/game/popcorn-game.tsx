'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Popcorn, RotateCcw, Timer, Trophy, Volume2, VolumeX } from 'lucide-react'
import { PopcornEngine, type EngineStats } from '@/lib/game/engine'
import { audio } from '@/lib/game/audio'
import {
  PERK_MAP,
  quotaFor,
  rollPerkOffer,
  transformFor,
  type PerkDef,
  type PerkId,
  type ScreenTransform,
} from '@/lib/game/perks'
import { makeChestSprite } from '@/lib/game/sprites'

type Phase = 'start' | 'playing' | 'paused' | 'chest' | 'ended'

interface ResultState {
  score: number
  level: number
  record: boolean
}

interface ClearState {
  level: number
  bonus: number
}

const BEST_KEY = 'popcorn-best'
const MUTE_KEY = 'popcorn-muted'
const STORE_EVENT = 'popcorn-store-update'

const CONFETTI_COLORS = ['#E24B3B', '#FFE066', '#7BC47F', '#F2A65A', '#FFF6EC', '#E89A6B']

/* ---------- localStorage как внешний стор (без каскадных рендеров) ---------- */

function subscribeStore(onChange: () => void): () => void {
  window.addEventListener('storage', onChange)
  window.addEventListener(STORE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(STORE_EVENT, onChange)
  }
}

function useStoredValue(key: string, fallback: string): [string, (v: string) => void] {
  const value = useSyncExternalStore(
    subscribeStore,
    () => window.localStorage.getItem(key) ?? fallback,
    () => fallback,
  )
  const setValue = useCallback(
    (v: string) => {
      window.localStorage.setItem(key, v)
      window.dispatchEvent(new Event(STORE_EVENT))
    },
    [key],
  )
  return [value, setValue]
}

/* ---------- вспомогательные UI-элементы ---------- */

function Pill({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 font-ui text-xs font-semibold text-white backdrop-blur-sm sm:text-sm ${className}`}
    >
      {children}
    </div>
  )
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 active:scale-90"
    >
      {children}
    </button>
  )
}

function GameButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-[#E24B3B] px-6 py-3.5 font-pixel text-base text-white shadow-[0_5px_0_#9c2f22] transition-all hover:bg-[#ef5a4a] active:translate-y-[3px] active:shadow-[0_2px_0_#9c2f22] sm:text-lg"
    >
      {children}
    </button>
  )
}

function HowToRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base ring-2 ring-amber-200"
      >
        {icon}
      </span>
      <span className="pt-1.5">{children}</span>
    </li>
  )
}

function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-[2px]"
          style={{
            left: `${(i * 37 + 5) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
          initial={{ y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: '115%', rotate: 420 + i * 35 }}
          transition={{
            duration: 2.4 + (i % 5) * 0.4,
            repeat: Infinity,
            delay: (i % 8) * 0.22,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

/** Пиксельный сундучок (закрытый/открытый), отрисованный на canvas */
function ChestImg({ open }: { open: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const spr = makeChestSprite(open)
    const px = 6
    c.width = spr.w * px
    c.height = spr.h * px
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(spr.canvas, 0, 0, c.width, c.height)
  }, [open])
  return <canvas ref={ref} aria-hidden className="pixelated h-auto w-16 sm:w-20" />
}

/* ---------- основной компонент ---------- */

export function PopcornGame() {
  const mainRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<PopcornEngine | null>(null)
  const mutedRef = useRef(false)
  const transformRef = useRef<ScreenTransform>('none')
  const layoutRef = useRef<() => void>(() => {})
  const devRef = useRef<{ fast: boolean; forced: PerkId | null }>({ fast: false, forced: null })

  const [phase, setPhase] = useState<Phase>('start')
  const [stats, setStats] = useState<EngineStats>({
    score: 0,
    timeLeft: 60,
    duration: 60,
    level: 1,
    quota: 9,
    collected: 0,
    carrying: 0,
    carryMax: 3,
    freezeLeft: 0,
    paused: false,
  })
  const [bestRaw, storeBest] = useStoredValue(BEST_KEY, '0')
  const [mutedRaw, storeMuted] = useStoredValue(MUTE_KEY, '0')
  const best = Number(bestRaw) || 0
  const muted = mutedRaw === '1'
  const [result, setResult] = useState<ResultState | null>(null)
  const [clearInfo, setClearInfo] = useState<ClearState | null>(null)
  const [offers, setOffers] = useState<PerkDef[]>([])
  const [openedIdx, setOpenedIdx] = useState<number | null>(null)
  const [runLevel, setRunLevel] = useState(2)
  const [perk, setPerk] = useState<PerkId | null>(null)

  /* Скрытые dev-параметры URL: ?fast=1 (короткая норма) и ?perk=rot180 */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    devRef.current = {
      fast: sp.has('fast'),
      forced: (sp.get('perk') as PerkId | null) ?? null,
    }
  }, [])

  /* Синхронизируем состояние звука с аудио-движком (внешняя система) */
  useEffect(() => {
    mutedRef.current = muted
    audio.setMuted(muted)
  }, [muted])

  /* Раскладка холста с учётом трансформации перка (ротация/зеркало) */
  const applyLayout = useCallback(() => {
    const main = mainRef.current
    const canvas = canvasRef.current
    if (!main || !canvas) return
    const cw = main.clientWidth
    const ch = main.clientHeight
    if (cw === 0 || ch === 0) return
    const t = transformRef.current
    const rot90 = t === 'rot90'
    const gw = rot90 ? ch : cw
    const gh = rot90 ? cw : ch
    engineRef.current?.handleResize(gw, gh)
    canvas.style.width = `${gw}px`
    canvas.style.height = `${gh}px`
    if (rot90) {
      canvas.style.left = '50%'
      canvas.style.top = '50%'
      canvas.style.transform = 'translate(-50%, -50%) rotate(90deg)'
    } else {
      canvas.style.left = '0'
      canvas.style.top = '0'
      canvas.style.transform =
        t === 'rot180' ? 'rotate(180deg)' : t === 'mirror' ? 'scaleX(-1)' : 'none'
    }
  }, [])

  useEffect(() => {
    layoutRef.current = applyLayout
  }, [applyLayout])

  /* Инициализация движка */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new PopcornEngine(canvas, {
      onStats: (s) => setStats(s),
      onLevelComplete: (r) => {
        setClearInfo({ level: r.level, bonus: r.bonus })
        setOffers(rollPerkOffer(3, devRef.current.forced ?? undefined))
        setOpenedIdx(null)
        setRunLevel(r.level + 1)
        setPhase('chest')
      },
      onEnd: (r) => {
        const prevBest = Number(window.localStorage.getItem(BEST_KEY) ?? 0)
        const record = r.score > prevBest
        if (record) {
          storeBest(String(r.score))
          window.setTimeout(() => audio.play('record'), 700)
        }
        setResult({ score: r.score, level: r.level, record })
        setPhase('ended')
      },
    })
    engineRef.current = engine
    ;(window as unknown as { __popcornEngine?: PopcornEngine }).__popcornEngine = engine
    layoutRef.current()

    return () => {
      engine.destroy()
      engineRef.current = null
      delete (window as unknown as { __popcornEngine?: PopcornEngine }).__popcornEngine
    }
  }, [storeBest])

  /* Следим за размером контейнера */
  useEffect(() => {
    const main = mainRef.current
    if (!main || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => layoutRef.current())
    ro.observe(main)
    return () => ro.disconnect()
  }, [])

  /* Ввод: инверсия управления для перков-трансформаций.
     rot180/mirror — сырые координаты: CSS-зеркало переворачивает картинку,
     и лапка на экране идёт в противоположную сторону от пальца.
     rot90 — мир повёрнут с заменой измерений, поэтому даём развёрнутую инверсию. */
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const onPointer = (e: PointerEvent) => {
      const eng = engineRef.current
      if (!eng) return
      const r = main.getBoundingClientRect()
      const sx = e.clientX - r.left
      const sy = e.clientY - r.top
      let x = sx
      let y = sy
      if (transformRef.current === 'rot90') {
        x = r.height - sy
        y = sx
      }
      eng.setPointer(x, y, e.pointerType === 'touch' ? 64 : 0)
    }
    main.addEventListener('pointerdown', onPointer)
    main.addEventListener('pointermove', onPointer)
    return () => {
      main.removeEventListener('pointerdown', onPointer)
      main.removeEventListener('pointermove', onPointer)
    }
  }, [])

  /* Трансформации экрана и фильтры действуют только во время уровня */
  useEffect(() => {
    const onLevel = phase === 'playing' || phase === 'paused'
    transformRef.current = onLevel ? transformFor(perk) : 'none'
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.filter = onLevel && perk === 'grayscale' ? 'grayscale(1) contrast(1.05)' : ''
    }
    layoutRef.current()
  }, [perk, phase])

  /* Автопауза при сворачивании вкладки: игру и музыку ставим на паузу,
     чтобы троттлинг таймеров не копил отставание аудио-планировщика */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        audio.stopMusic()
        engineRef.current?.setPaused(true)
        setPhase((p) => (p === 'playing' ? 'paused' : p))
      } else if (engineRef.current?.phase === 'playing') {
        audio.startMusic()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const startGame = useCallback(() => {
    setResult(null)
    setClearInfo(null)
    setPerk(null)
    transformRef.current = 'none'
    const canvas = canvasRef.current
    if (canvas) canvas.style.filter = ''
    audio.ensure()
    audio.setMuted(mutedRef.current)
    audio.startMusic()
    audio.play('click')
    engineRef.current?.startRun({ fast: devRef.current.fast })
    setPhase('playing')
  }, [])

  const beginLevel = useCallback((lvl: number, perkId: PerkId | null) => {
    audio.ensure()
    audio.setMuted(mutedRef.current)
    audio.startMusic()
    audio.play('click')
    transformRef.current = transformFor(perkId)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.filter = perkId === 'grayscale' ? 'grayscale(1) contrast(1.05)' : ''
    }
    layoutRef.current()
    engineRef.current?.startLevel(lvl, perkId)
    setPerk(perkId)
    setPhase('playing')
  }, [])

  const resumeGame = useCallback(() => {
    audio.play('click')
    audio.startMusic()
    engineRef.current?.setPaused(false)
    setPhase('playing')
  }, [])

  const pauseGame = useCallback(() => {
    audio.play('click')
    audio.stopMusic()
    engineRef.current?.setPaused(true)
    setPhase('paused')
  }, [])

  const toggleMute = useCallback(() => {
    storeMuted(muted ? '0' : '1')
  }, [muted, storeMuted])

  const openChest = useCallback((i: number) => {
    audio.play('chest')
    setOpenedIdx(i)
    window.setTimeout(() => audio.play('perk'), 380)
  }, [])

  const sec = Math.ceil(stats.timeLeft)
  const urgent = sec <= 10
  const playing = phase === 'playing' || phase === 'paused'
  const quotaPct = Math.min(100, (stats.collected / Math.max(1, stats.quota)) * 100)
  const chosen: PerkDef | null = openedIdx !== null ? (offers[openedIdx] ?? null) : null
  const activePerk = perk ? PERK_MAP[perk] : null

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#1d110b] select-none">
      <main
        ref={mainRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        aria-label="Игровое поле: соберите рассыпанный попкорн в стаканчик лапкой куницы"
      >
        {/* Фон — ретро комната */}
        <div
          aria-hidden
          className="absolute inset-0 scale-105 bg-[url('/popcorn-room.png')] bg-cover bg-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/55"
        />

        {/* Игровой холст (трансформации перков применяются инлайн) */}
        <canvas
          ref={canvasRef}
          className="absolute z-10 touch-none"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Фриз-тайм кота: большие красные цифры отсчёта на фоне */}
        {playing && stats.freezeLeft > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-center gap-2"
          >
            <span className="rounded-full bg-black/45 px-3 py-1 font-pixel text-sm font-bold tracking-widest text-emerald-100 ring-1 ring-emerald-200/40 sm:text-base">
              ТАЙМЕР ЗАМОРОЖЕН · ПРОДУМАЙ МАРШРУТ
            </span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={Math.ceil(stats.freezeLeft)}
                initial={{ scale: 1.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="font-pixel text-[44vw] font-bold leading-none text-red-500/90 drop-shadow-[0_6px_0_rgba(0,0,0,0.45)] sm:text-[230px]"
              >
                {Math.ceil(stats.freezeLeft)}
              </motion.span>
            </AnimatePresence>
          </div>
        )}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex flex-col gap-2">
            {playing ? (
              <>
                <Pill>
                  <Popcorn className="h-4 w-4 text-amber-300" aria-hidden />
                  <span className="min-w-6 font-pixel text-base tabular-nums">{stats.score}</span>
                </Pill>
                {/* Полоска нормы: наполняемость стаканчика */}
                <Pill className="w-36 sm:w-40">
                  <Popcorn className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                  <span className="tabular-nums">
                    {stats.collected}/{stats.quota}
                  </span>
                  <span className="relative ml-auto h-2.5 w-12 overflow-hidden rounded-full bg-white/15 sm:w-14">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-300 transition-[width] duration-200"
                      style={{ width: `${quotaPct}%` }}
                    />
                  </span>
                </Pill>
                {/* Вместимость лапки: 3 → 4 → 5 зёрен за раз */}
                <Pill>
                  <span aria-hidden>🐾</span>
                  <span className="tabular-nums">
                    {stats.carrying}/{stats.carryMax}
                  </span>
                </Pill>
                <Pill className={`relative overflow-hidden ${urgent ? 'animate-pulse border-red-400/60' : ''}`}>
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-red-400/25"
                    style={{
                      width: `${Math.max(0, Math.min(100, (stats.timeLeft / Math.max(1, stats.duration)) * 100))}%`,
                    }}
                  />
                  <Timer
                    className={`relative h-4 w-4 ${urgent ? 'text-red-400' : 'text-amber-300'}`}
                    aria-hidden
                  />
                  <span className="relative tabular-nums">{sec} с</span>
                </Pill>
              </>
            ) : (
              <Pill>
                <Trophy className="h-4 w-4 text-amber-300" aria-hidden />
                <span className="font-pixel text-base tabular-nums">{best}</span>
              </Pill>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {playing && (
              <>
                <Pill>
                  <span className="font-pixel text-sm">УР. {stats.level}</span>
                </Pill>
                {activePerk && (
                  <Pill
                    className={
                      activePerk.curse
                        ? 'border-red-400/50 text-red-200'
                        : 'border-emerald-300/50 text-emerald-200'
                    }
                  >
                    <span aria-hidden>{activePerk.icon}</span>
                    <span className="max-w-36 truncate text-[11px] sm:max-w-none sm:text-xs">
                      {activePerk.name}
                    </span>
                  </Pill>
                )}
              </>
            )}
            <div className="flex gap-2">
              {phase === 'playing' && (
                <IconBtn onClick={pauseGame} label="Пауза">
                  <Pause className="h-5 w-5" aria-hidden />
                </IconBtn>
              )}
              <IconBtn onClick={toggleMute} label={muted ? 'Включить звук' : 'Выключить звук'}>
                {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
              </IconBtn>
            </div>
          </div>
        </div>

        {/* Оверлеи */}
        <AnimatePresence>
          {phase === 'start' && (
            <motion.div
              key="start"
              className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] [@media(max-height:700px)]:p-3 sm:p-6"
                initial={{ scale: 0.92, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <Image
                  src="/marten-mascot.png"
                  alt="Куница Марта держит стаканчик с попкорном"
                  width={220}
                  height={220}
                  priority
                  className="pixelated animate-float-y mx-auto h-28 w-28 rounded-2xl border-4 border-[#E24B3B] bg-[#F8D8B8] object-cover shadow-lg [@media(max-height:700px)]:h-20 [@media(max-height:700px)]:w-20 sm:h-40 sm:w-40"
                />
                <h1 className="text-shadow-pixel mt-2 font-pixel text-2xl font-bold leading-tight text-[#B33A26] [@media(max-height:700px)]:mt-1.5 sm:text-3xl">
                  КОШАЧИЙ ПОПКОРННЫЙ БЕСПРЕДЕЛ
                </h1>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330] sm:text-sm">
                  8-битный рогалик-аркада · бесконечные уровни
                </p>

                <ul className="mt-3 space-y-1.5 text-left font-ui text-xs leading-snug text-[#5C3A1E] [@media(max-height:700px)]:mt-2 sm:text-sm">
                  <HowToRow icon="👆">Веди лапку пальцем по экрану (на ПК — мышкой)</HowToRow>
                  <HowToRow icon="🍿">Собирай попкорн в стаканчик. Золотое зерно = +5!</HowToRow>
                  <HowToRow icon="🌽">Кукуруза — мины: обходи, заденешь — минус балл</HowToRow>
                  <HowToRow icon="🎯">Собери норму за 60 секунд — и уровень пройден!</HowToRow>
                  <HowToRow icon="🐱">
                    Кот-бонус: каждые 3–7 уровней в начале уровня прибегает кот — ткни в лапку и
                    получи 5 секунд стоп-таймера, чтобы продумать маршрут!
                  </HowToRow>
                  <HowToRow icon="🐾">
                    Лапка растёт: сначала несёт 3 зерна, после 5-го уровня — 4, после 10-го — 5!
                  </HowToRow>
                  <HowToRow icon="🎁">Между уровнями открывай сундучок со случайным перком: бывают бонусы и проклятья</HowToRow>
                  <HowToRow icon="♾️">
                    Каждые 5 уровней попкорна и мин больше, зёрна мельчают, а мины толстеют. Держись!
                  </HowToRow>
                </ul>

                {best > 0 && (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200">
                    <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                    Рекорд: {best}
                  </div>
                )}

                <div className="mt-3 [@media(max-height:700px)]:mt-2.5">
                  <GameButton onClick={startGame}>▶ ИГРАТЬ</GameButton>
                </div>
                <p className="mt-2.5 font-ui text-[11px] leading-snug text-[#a97c50] [@media(max-height:700px)]:mt-1.5">
                  🎵 Лучше со звуком: музыка ускоряется на 30-й, 15-й и последних секундах!
                </p>
              </motion.div>
            </motion.div>
          )}

          {phase === 'paused' && (
            <motion.div
              key="paused"
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-xs rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-6 text-center shadow-2xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
              >
                <h2 className="font-pixel text-2xl font-bold text-[#B33A26]">ПАУЗА</h2>
                <p className="mt-2 font-ui text-xs font-medium text-[#8a5330]">
                  Уровень {stats.level} · Счёт: {stats.score} · Норма {stats.collected}/{stats.quota}
                </p>
                <div className="mt-5">
                  <GameButton onClick={resumeGame}>▶ ПРОДОЛЖИТЬ</GameButton>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === 'chest' && clearInfo && (
            <motion.div
              key="chest"
              className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-6"
                initial={{ scale: 0.9, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <div aria-hidden className="text-4xl">
                  🎁
                </div>
                <h2 className="mt-1 font-pixel text-xl font-bold text-[#B33A26] sm:text-2xl">
                  УРОВЕНЬ {clearInfo.level} ПРОЙДЕН!
                </h2>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                  Бонус за скорость: +{clearInfo.bonus} · Счёт: {stats.score}
                </p>
                <p className="mt-2 font-ui text-xs text-[#5C3A1E]">
                  Выбери сундучок — он решит судьбу следующего уровня
                </p>

                <div className="mt-3 flex items-end justify-center gap-2 sm:gap-4">
                  {offers.map((p, i) => {
                    const isOpen = openedIdx === i
                    const dimmed = openedIdx !== null && !isOpen
                    return (
                      <motion.button
                        key={p.id}
                        type="button"
                        aria-label={`Открыть сундучок ${i + 1}`}
                        disabled={openedIdx !== null}
                        onClick={() => openChest(i)}
                        className={`flex flex-col items-center rounded-xl border-4 px-3 pb-1.5 pt-2.5 transition-colors sm:px-4 ${
                          isOpen
                            ? 'border-amber-400 bg-amber-100'
                            : dimmed
                              ? 'border-[#c9a97a] bg-[#f3e2c8] opacity-40'
                              : 'border-[#8a5330] bg-[#f3e2c8] hover:bg-[#eed7b4] active:scale-95'
                        }`}
                        animate={isOpen ? { rotate: [0, -7, 7, -4, 0], y: [0, -8, 0] } : {}}
                        transition={{ duration: 0.45 }}
                      >
                        <ChestImg open={isOpen} />
                        <span className="font-pixel text-[10px] text-[#8a5330] sm:text-xs">
                          {isOpen ? 'ОТКРЫТ' : 'СУНДУК'}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {chosen && (
                    <motion.div
                      key={chosen.id}
                      className={`mt-3 rounded-xl border-2 p-3 ${
                        chosen.curse
                          ? 'border-red-300 bg-red-50'
                          : 'border-emerald-300 bg-emerald-50'
                      }`}
                      initial={{ opacity: 0, y: 12, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span aria-hidden className="text-3xl">
                          {chosen.icon}
                        </span>
                        <div className="text-left">
                          <div className="font-pixel text-base font-bold text-[#5C3A1E] sm:text-lg">
                            {chosen.name}
                          </div>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 font-ui text-[10px] font-bold ${
                              chosen.curse
                                ? 'bg-red-200 text-red-800'
                                : 'bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {chosen.curse ? '☠ ПРОКЛЯТЬЕ' : '✨ БОНУС'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 font-ui text-xs leading-snug text-[#5C3A1E]">
                        {chosen.desc}
                      </p>
                      <p className="mt-1.5 font-ui text-[11px] text-[#8a5330]">
                        Уровень {runLevel}: норма {quotaFor(runLevel, chosen.id === 'doublepoints')}{' '}
                        🍿 за {chosen.id === 'timeplus' ? 75 : 60} сек
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {chosen && (
                  <div className="mt-3">
                    <GameButton onClick={() => beginLevel(runLevel, chosen.id)}>
                      ДАЛЬШЕ: УРОВЕНЬ {runLevel} ▶
                    </GameButton>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {phase === 'ended' && result && (
            <motion.div
              key="ended"
              className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative my-auto w-full max-w-sm overflow-hidden rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
                initial={{ scale: 0.9, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                {result.record && <Confetti />}
                <h2 className="font-pixel text-xl font-bold text-[#B33A26] sm:text-2xl">
                  КВОТА ПРОВАЛЕНА!
                </h2>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                  Время вышло на {result.level} уровне
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Popcorn className="h-8 w-8 text-amber-500" aria-hidden />
                  <span className="font-pixel text-5xl font-bold tabular-nums text-[#5C3A1E]">
                    {result.score}
                  </span>
                </div>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                  очков · дошёл до уровня {result.level}
                </p>

                {result.record ? (
                  <motion.div
                    className="mt-4 inline-block rounded-full bg-amber-400 px-4 py-2 font-ui text-xs font-bold text-[#5C3A1E] shadow-md"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9 }}
                  >
                    🎉 НОВЫЙ РЕКОРД!
                  </motion.div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200">
                    <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                    Рекорд: {best}
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <GameButton onClick={startGame}>
                    <span className="inline-flex items-center justify-center gap-2">
                      <RotateCcw className="h-5 w-5" aria-hidden /> ЗАБЕГ ЗАНОВО
                    </span>
                  </GameButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Липкий футер */}
      <footer className="relative z-30 mt-auto border-t border-amber-100/10 bg-[#160c07] px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-center">
        <p className="font-ui text-[11px] tracking-wide text-amber-200/70 sm:text-xs">
          🌽 Кошачий попкорнный Беспредел · 8-битный рогалик · сделано с ❤️
        </p>
      </footer>
    </div>
  )
}
