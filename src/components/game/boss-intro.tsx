'use client'

/**
 * «КАК ПОБЕДИТЬ?» — интро-карточка перед каждым босс-уровнем (0.0.42).
 *
 * Босс-уровень стартует на паузе (движок держит introHold): игрок читает
 * инструкцию и видит портрет босса, кнопка «В БОЙ!» отпускает геймплей.
 * Инструкция у каждого своя:
 *   МАЛЫШ          — толкай попкорн резким махом, малыш наестся и отвалит;
 *   КУНИЦА ЛАНА    — перерезай её длинные лапки свайпом;
 *   МЕГА-ГОЛУБЬ    — тело неуязвимо, бей точно по глазам;
 *   ЦЫГАНСКАЯ РУКА — шлёпай по ладони, уворачивайся от летящих зёрен.
 *
 * Портрет — пиксельный спрайт (sprites.makeBossPortraitSprite), рисуется
 * на канвасе с imageSmoothingEnabled=false: честный 8-бит, как в игре.
 * Текст — настоящий HTML поверх арта: чётко на любом из 4 языков.
 */

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { audio } from '@/lib/game/audio'
import type { TranslateFn } from '@/lib/game/i18n'
import { makeBossPortraitSprite, type BossPortraitKind } from '@/lib/game/sprites'

/** Ключ имени босса в HUD-словаре (МАЛЫШ / ЛАНА / ГОЛУБЬ / РУКА / ЛЬВ) */
const BOSS_NAME_KEY: Record<BossPortraitKind, string> = {
  kid: 'hud.boss',
  marten: 'hud.bossMarten',
  pigeon: 'hud.bossPigeon',
  gypsy: 'hud.bossGypsy',
  lion: 'hud.bossLion',
}

/** Иконка-эмодзи рядом с портретом — как в HUD */
const BOSS_ICON: Record<BossPortraitKind, string> = {
  kid: '👶',
  marten: '🦡',
  pigeon: '🐦',
  gypsy: '💍',
  lion: '🦁',
}

interface BossIntroProps {
  t: TranslateFn
  /** Номер босс-уровня (кратен 5) */
  level: number
  kind: BossPortraitKind
  /** Кнопка «В БОЙ!»: отпустить геймплей (движок.dismissBossIntro) */
  onGo: () => void
}

export function BossIntroOverlay({ t, level, kind, onGo }: BossIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  /* Портрет: рисуем пиксельный спрайт крупно без сглаживания */
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const spr = makeBossPortraitSprite(kind)
    const SCALE = 7
    const w = spr.w * SCALE
    const h = spr.h * SCALE
    cv.width = w
    cv.height = h
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(spr.canvas as CanvasImageSource, 0, 0, spr.w, spr.h, 0, 0, w, h)
  }, [kind])

  /* Барабанная дробь перед боем: вход в босс-бой — событие */
  useEffect(() => {
    const tm = window.setTimeout(() => audio.play('penalty'), 260)
    return () => window.clearTimeout(tm)
  }, [])

  return (
    <motion.div
      key="boss-intro"
      className="absolute inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[#1d0f06]/95 p-3 backdrop-blur-sm [@media(max-height:520px)]:p-2 sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      role="dialog"
      aria-label={t('bossintro.title')}
    >
      {/* Вращающиеся лучи позади портрета — чистый CSS */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% 38%, #e24b3b 0deg 6deg, transparent 6deg 18deg)',
        }}
      />

      {/* Шапка: красная лента «КАК ПОБЕДИТЬ?» */}
      <motion.div
        className="z-10 mt-1 flex shrink-0 items-center gap-2 rounded-full border-2 border-[#e3cba4]/40 bg-[#B33A26] px-4 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.45)] [@media(max-height:520px)]:py-1"
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 22 }}
      >
        <span aria-hidden className="text-sm leading-none">
          ⚔
        </span>
        <span className="font-pixel text-sm font-bold tracking-wide text-[#FFF3DC] [@media(max-height:520px)]:text-xs sm:text-base">
          {t('bossintro.title')}
        </span>
        <span aria-hidden className="text-sm leading-none">
          ⚔
        </span>
      </motion.div>

      {/* Подзаголовок: кто выходит и на каком уровне */}
      <motion.p
        className="z-10 mt-1.5 shrink-0 rounded-full border border-amber-300/40 bg-black/40 px-3 py-1 font-pixel text-[11px] font-bold text-amber-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
      >
        {t('bossintro.tag')} · {t('bossintro.lvl', { n: level })} · {t(BOSS_NAME_KEY[kind])}{' '}
        <span aria-hidden>{BOSS_ICON[kind]}</span>
      </motion.p>

      {/* Портрет босса в рамке «старой бумаги» */}
      <div className="z-10 flex min-h-0 w-full flex-1 items-center justify-center py-2 [@media(max-height:520px)]:py-1">
        <motion.div
          className="flex items-center justify-center rounded-lg border-[6px] border-[#f6e7c9] bg-[#f6e7c9] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.6)] [@media(max-height:520px)]:border-4 sm:border-[8px]"
          initial={{ scale: 0.82, rotate: -5, opacity: 0 }}
          animate={{ scale: 1, rotate: -1.5, opacity: 1 }}
          transition={{ delay: 0.14, type: 'spring', stiffness: 210, damping: 20 }}
        >
          <canvas
            ref={canvasRef}
            aria-hidden
            className="h-auto w-[clamp(96px,26vmin,150px)]"
            style={{ imageRendering: 'pixelated' }}
          />
        </motion.div>
      </div>

      {/* Инструкция: как именно побеждается этот босс */}
      <motion.div
        className="z-10 flex w-full max-w-md shrink-0 flex-col items-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] [@media(max-height:520px)]:gap-1"
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.22, type: 'spring', stiffness: 260, damping: 22 }}
      >
        <p className="rounded-lg bg-[#f6e7c9] px-4 py-2 text-center font-ui text-[13px] font-semibold leading-snug text-[#4A2A12] [@media(max-height:520px)]:px-3 [@media(max-height:520px)]:text-[11px] sm:text-sm">
          {t(`bossintro.${kind}`)}
        </p>
        <button
          type="button"
          autoFocus
          onClick={() => {
            audio.play('click')
            onGo()
          }}
          className="mt-0.5 w-full rounded-xl bg-[#E24B3B] px-6 py-3 font-pixel text-base text-white shadow-[0_5px_0_#9c2f22] transition-all hover:bg-[#ef5a4a] active:translate-y-[3px] active:shadow-[0_2px_0_#9c2f22] [@media(max-height:520px)]:py-2 sm:text-lg"
        >
          {t('bossintro.go')}
        </button>
      </motion.div>
    </motion.div>
  )
}
