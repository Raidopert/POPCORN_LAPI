'use client'

/**
 * «ПЛАКАТНАЯ ПЕРЕБИВКА» — трудовая мотивационная вставка каждые 5 уровней.
 *
 * После победного баннера на весь экран разворачивается плакат с куницей
 * Наной в духе советской трудовой пропаганды и ретро-пин-апа: знамёна,
 * лучи, «план выполнен», «бей свой рекорд». Плакаты ротируются строго
 * по порядку — каждый следующий рубеж сложности получает следующий плакат
 * (5-й уровень → №1, 10-й → №2 … 30-й → №6, 35-й → снова №1).
 *
 * ВАЖНО: арт нарисован БЕЗ текста — AI-генератор искажает кириллицу.
 * Слоган, подзаголовок и статистика накладываются настоящим HTML:
 * чётко на любом экране и на любом из 4 языков игры.
 *
 * Пиксельный плакат №7 (в стиле самой игры) — в запасе на будущее.
 */

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { audio } from '@/lib/game/audio'
import type { TranslateFn } from '@/lib/game/i18n'

/** Игровые плакаты: порядок = порядок усложнения. №7 — про запас. */
const POSTERS = [
  { src: '/posters/game/poster-1.webp', key: '1' },
  { src: '/posters/game/poster-2.webp', key: '2' },
  { src: '/posters/game/poster-3.webp', key: '3' },
  { src: '/posters/game/poster-4.webp', key: '4' },
  { src: '/posters/game/poster-5.webp', key: '5' },
  { src: '/posters/game/poster-6.webp', key: '6' },
] as const

/** Интервал перебивки: плакат показывается после каждого 5-го уровня */
export const POSTER_EVERY = 5
export const POSTER_COUNT = POSTERS.length

interface PosterInterstitialProps {
  t: TranslateFn
  /** Пройденный этап (кратен POSTER_EVERY) */
  level: number
  score: number
  best: number
  /** Индекс плаката: растёт с каждым рубежом, циклично */
  posterIdx: number
  onContinue: () => void
}

export function PosterInterstitial({
  t,
  level,
  score,
  best,
  posterIdx,
  onContinue,
}: PosterInterstitialProps) {
  const idx = ((posterIdx % POSTER_COUNT) + POSTER_COUNT) % POSTER_COUNT
  const poster = POSTERS[idx]

  /* Победная фанфара: плакат — награда за рубеж сложности */
  useEffect(() => {
    const tm = window.setTimeout(() => audio.play('record'), 320)
    return () => window.clearTimeout(tm)
  }, [])

  return (
    <motion.div
      key="poster"
      className="absolute inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[#1d0f06]/95 p-3 backdrop-blur-sm [@media(max-height:520px)]:p-2 sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      role="dialog"
      aria-label={t('poster.banner', { n: level })}
    >
      {/* Пропагандистские лучи за плакатом — чистый CSS, без канваса */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% 42%, #e8b64c 0deg 6deg, transparent 6deg 18deg)',
        }}
      />

      {/* Шапка: красная лента «ЭТАП N ПРОЙДЕН» */}
      <motion.div
        className="z-10 mt-1 flex shrink-0 items-center gap-2 rounded-full border-2 border-[#e3cba4]/40 bg-[#B33A26] px-4 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.45)] [@media(max-height:520px)]:py-1"
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 22 }}
      >
        <span aria-hidden className="text-sm leading-none">
          ★
        </span>
        <span className="font-pixel text-sm font-bold tracking-wide text-[#FFF3DC] [@media(max-height:520px)]:text-xs sm:text-base">
          {t('poster.banner', { n: level })}
        </span>
        <span aria-hidden className="text-sm leading-none">
          ★
        </span>
      </motion.div>

      {/* Плакат: рамка «старой бумаги», лёгкий наклон как на стене */}
      <div className="z-10 flex min-h-0 w-full flex-1 items-center justify-center py-2 [@media(max-height:520px)]:py-1">
        <motion.img
          src={poster.src}
          alt={t('poster.alt')}
          draggable={false}
          loading="eager"
          className="max-h-full max-w-full rounded-sm border-[6px] border-[#f6e7c9] bg-[#f6e7c9] object-contain shadow-[0_18px_50px_rgba(0,0,0,0.6)] [@media(max-height:520px)]:border-4 sm:border-[8px]"
          initial={{ scale: 0.82, rotate: -5, opacity: 0 }}
          animate={{ scale: 1, rotate: -1.5, opacity: 1 }}
          transition={{ delay: 0.14, type: 'spring', stiffness: 210, damping: 20 }}
        />
      </div>

      {/* Слоган + статистика + кнопка: настоящий текст поверх арта */}
      <motion.div
        className="z-10 flex w-full max-w-md shrink-0 flex-col items-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] [@media(max-height:520px)]:gap-1"
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.22, type: 'spring', stiffness: 260, damping: 22 }}
      >
        {/* Слоган на кремовой ленте — как шапка трудового плаката */}
        <h2 className="text-shadow-pixel rounded-lg bg-[#f6e7c9] px-4 py-1 text-center font-pixel text-xl font-bold uppercase leading-tight text-[#B33A26] [@media(max-height:520px)]:px-3 [@media(max-height:520px)]:text-sm sm:text-2xl">
          {t(`poster.${poster.key}.title`)}
        </h2>
        <p className="hidden text-center font-ui text-xs font-medium text-[#d9b98c] [@media(max-height:560px)]:hidden sm:block">
          {t(`poster.${poster.key}.sub`)}
        </p>

        {/* Статистика рубежа: очки забега и личный рекорд */}
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-black/40 px-3 py-1 font-ui text-[11px] font-semibold text-amber-100 [@media(max-height:520px)]:text-[10px]">
            {t('poster.score', { n: score })}
          </span>
          <span className="rounded-full border border-amber-300/40 bg-black/40 px-3 py-1 font-ui text-[11px] font-semibold text-amber-100 [@media(max-height:520px)]:text-[10px]">
            {t('poster.best', { n: best })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            audio.play('click')
            onContinue()
          }}
          className="mt-0.5 w-full rounded-xl bg-[#E24B3B] px-6 py-3 font-pixel text-base text-white shadow-[0_5px_0_#9c2f22] transition-all hover:bg-[#ef5a4a] active:translate-y-[3px] active:shadow-[0_2px_0_#9c2f22] [@media(max-height:520px)]:py-2 sm:text-lg"
        >
          {t('poster.btn')}
        </button>
      </motion.div>
    </motion.div>
  )
}
