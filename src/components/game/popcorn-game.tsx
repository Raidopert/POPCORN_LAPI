'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Popcorn, RotateCcw, Timer, Trophy, Volume2, VolumeX } from 'lucide-react'
import { PopcornEngine, type EngineStats } from '@/lib/game/engine'
import { audio } from '@/lib/game/audio'

type Phase = 'start' | 'playing' | 'paused' | 'ended'

interface ResultState {
  score: number
  waves: number
  record: boolean
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

/* ---------- основной компонент ---------- */

export function PopcornGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<PopcornEngine | null>(null)
  const mutedRef = useRef(false)

  const [phase, setPhase] = useState<Phase>('start')
  const [stats, setStats] = useState<EngineStats>({
    score: 0,
    timeLeft: 60,
    wave: 1,
    carrying: 0,
    paused: false,
  })
  const [bestRaw, storeBest] = useStoredValue(BEST_KEY, '0')
  const [mutedRaw, storeMuted] = useStoredValue(MUTE_KEY, '0')
  const best = Number(bestRaw) || 0
  const muted = mutedRaw === '1'
  const [result, setResult] = useState<ResultState | null>(null)

  /* Синхронизируем состояние звука с аудио-движком (внешняя система) */
  useEffect(() => {
    mutedRef.current = muted
    audio.setMuted(muted)
  }, [muted])

  /* Инициализация движка */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new PopcornEngine(canvas, {
      onStats: (s) => setStats(s),
      onEnd: (r) => {
        const prevBest = Number(window.localStorage.getItem(BEST_KEY) ?? 0)
        const record = r.score > prevBest
        if (record) {
          storeBest(String(r.score))
          window.setTimeout(() => audio.play('record'), 700)
        }
        setResult({ score: r.score, waves: r.waves, record })
        setPhase('ended')
      },
    })
    engineRef.current = engine

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [storeBest])

  /* Автопауза при сворачивании вкладки */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        engineRef.current?.setPaused(true)
        setPhase((p) => (p === 'playing' ? 'paused' : p))
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const startGame = useCallback(() => {
    audio.ensure()
    audio.setMuted(muted)
    audio.startMusic()
    audio.play('click')
    engineRef.current?.start()
    setResult(null)
    setPhase('playing')
  }, [muted])


  const resumeGame = useCallback(() => {
    audio.play('click')
    engineRef.current?.setPaused(false)
    setPhase('playing')
  }, [])

  const pauseGame = useCallback(() => {
    audio.play('click')
    engineRef.current?.setPaused(true)
    setPhase('paused')
  }, [])

  const toggleMute = useCallback(() => {
    storeMuted(muted ? '0' : '1')
  }, [muted, storeMuted])

  const sec = Math.ceil(stats.timeLeft)
  const urgent = sec <= 10
  const playing = phase === 'playing' || phase === 'paused'

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#1d110b] select-none">
      <main
        className="relative min-h-0 flex-1 overflow-hidden"
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

        {/* Игровой холст */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 h-full w-full touch-none"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex flex-col gap-2">
            {playing ? (
              <>
                <Pill>
                  <Popcorn className="h-4 w-4 text-amber-300" aria-hidden />
                  <span className="min-w-6 font-pixel text-base tabular-nums">{stats.score}</span>
                </Pill>
                <Pill className={`relative overflow-hidden ${urgent ? 'animate-pulse border-red-400/60' : ''}`}>
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-red-400/25"
                    style={{ width: `${Math.max(0, Math.min(100, (stats.timeLeft / 60) * 100))}%` }}
                  />
                  <Timer className={`relative h-4 w-4 ${urgent ? 'text-red-400' : 'text-amber-300'}`} aria-hidden />
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
            {playing && <Pill>Волна {stats.wave}</Pill>}
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
                  className="pixelated animate-float-y mx-auto h-32 w-32 rounded-2xl border-4 border-[#E24B3B] bg-[#F8D8B8] object-cover shadow-lg [@media(max-height:700px)]:h-24 [@media(max-height:700px)]:w-24 sm:h-44 sm:w-44"
                />
                <h1 className="text-shadow-pixel mt-2 font-pixel text-2xl font-bold leading-tight text-[#B33A26] [@media(max-height:700px)]:mt-1.5 sm:text-3xl">
                  КОШАЧИЙ ПОПКОРННЫЙ БЕСПРЕДЕЛ
                </h1>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330] sm:text-sm">
                  8-битная мини-игра · 60 секунд на рекорд
                </p>

                <ul className="mt-3 space-y-1.5 text-left font-ui text-xs leading-snug text-[#5C3A1E] [@media(max-height:700px)]:mt-2 sm:text-sm">
                  <HowToRow icon="👆">Веди лапку пальцем по экрану (на ПК — мышкой)</HowToRow>
                  <HowToRow icon="🍿">Собирай попкорн — до 3 зёрен за раз. Золотое зерно = +5!</HowToRow>
                  <HowToRow icon="🌽">Кукуруза — мины: обходи, заденешь — минус балл</HowToRow>
                  <HowToRow icon="🥤">Высыпай добычу в стаканчик внизу экрана</HowToRow>
                  <HowToRow icon="🏁">Волна пройдена, когда собран весь попкорн. Мины остаются!</HowToRow>
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
                  Счёт: {stats.score} · Волна {stats.wave}
                </p>
                <div className="mt-5">
                  <GameButton onClick={resumeGame}>▶ ПРОДОЛЖИТЬ</GameButton>
                </div>
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
                  ВРЕМЯ ВЫШЛО!
                </h2>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Popcorn className="h-8 w-8 text-amber-500" aria-hidden />
                  <span className="font-pixel text-5xl font-bold tabular-nums text-[#5C3A1E]">
                    {result.score}
                  </span>
                </div>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                  зёрен собрано · волна {result.waves}
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
                      <RotateCcw className="h-5 w-5" aria-hidden /> ИГРАТЬ ЕЩЁ
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
          🌽 Кошачий попкорнный Беспредел · 8-битная мини-игра · сделано с ❤️
        </p>
      </footer>
    </div>
  )
}
