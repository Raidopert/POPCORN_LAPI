'use client'

/**
 * BOOT-ЭКРАНЫ (v0.0.72) — пара стартовых экранов при загрузке игры:
 *   1. Логотип студии Raido Pert Studio (ᚱ ᛈ, фиолетовый леопард);
 *   2. Дисклеймер: игра сделана с любовью, никого не обидеть —
 *      только развеселить, всё ради кошек. 0+.
 *
 * Внутри VK (iframe мини-приложения) экраны пропускаются — карточка VK
 * уже помечена 0+ (п. 2.1.5 правил VK), лишние задержки в каталоге не нужны.
 * Вне VK (браузер, Windows- и Android-сборки) показываются каждый запуск.
 */

import { useEffect, useState } from 'react'

type Stage = 'logo' | 'notice' | 'done'

export function BootScreens() {
  const [stage, setStage] = useState<Stage>('logo')
  const [isVK, setIsVK] = useState(false)

  useEffect(() => {
    /* VK-iframe всегда приходит с vk_app_id/vk_platform в query запуска.
       Детект отложен на 0 мс (timer-callback), чтобы не дёргать рендер
       синхронно из тела эффекта (react-hooks/set-state-in-effect) */
    const t = window.setTimeout(() => {
      if (/[?&](vk_app_id|vk_platform)=/.test(window.location.search)) setIsVK(true)
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  /* Лого-экран показывается 2 секунды (клик — сразу к дисклеймеру) */
  useEffect(() => {
    if (stage !== 'logo') return
    const t = window.setTimeout(() => setStage('notice'), 2000)
    return () => window.clearTimeout(t)
  }, [stage])

  if (isVK || stage === 'done') return null

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 0%, #3d0d33 0%, #2a0923 55%, #1c0517 100%)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={stage === 'logo' ? 'Студия Raido Pert Studio' : 'Дисклеймер игры'}
    >
      <style>{`
        @keyframes rps-boot-fade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        @keyframes rps-boot-logo { from { opacity: 0; transform: scale(0.94) } to { opacity: 1; transform: scale(1) } }
      `}</style>

      {stage === 'logo' ? (
        <button
          type="button"
          onClick={() => setStage('notice')}
          className="flex flex-col items-center gap-5 cursor-pointer bg-transparent border-0 p-0 max-h-full"
          aria-label="Перейти к дисклеймеру"
        >
          <img
            src="/boot/logo.jpg"
            alt="Логотип Raido Pert Studio — фиолетовый леопардовый значок с рунами ᚱ ᛈ"
            className="w-[min(74vw,44vh)] h-[min(74vw,44vh)] object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
            style={{ animation: 'rps-boot-logo 0.7s ease-out both' }}
          />
          <p
            className="text-[#f6dfa0] text-sm sm:text-base tracking-[0.3em] uppercase opacity-90"
            style={{ animation: 'rps-boot-fade 0.7s ease-out 0.4s both' }}
          >
            представляет
          </p>
        </button>
      ) : (
        <div
          className="flex flex-col items-center gap-4 px-5 py-6 sm:gap-5 sm:px-8 sm:py-8 mx-3 rounded-2xl border-2 border-[#a9588b]/60 bg-[#2a0923]/85 shadow-[0_24px_70px_rgba(0,0,0,0.5)] max-w-[560px] max-h-[92vh] overflow-y-auto text-center"
          style={{ animation: 'rps-boot-fade 0.5s ease-out both' }}
        >
          {/* Знак 0+ */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#f0cb6e] text-[#f6dfa0] flex items-center justify-center text-2xl sm:text-3xl font-black">
            0+
          </div>

          <h1 className="text-[#fcefbe] text-xl sm:text-2xl font-extrabold tracking-wide">
            Сделано с любовью
          </h1>

          <p className="text-[#e9d3b8] text-sm sm:text-base leading-relaxed">
            «Кошачий попкорнный Беспредел» — игра про котиков, куницу и попкорн.
            Мы делали её с любовью и юмором: все котики, боссы и ситуации —
            вымышленные.
            <br />
            <span className="text-[#f6dfa0] font-semibold">
              Мы никого не хотим обидеть — только развеселить. Всё ради кошек!
            </span>
          </p>

          <button
            type="button"
            onClick={() => setStage('done')}
            className="mt-1 px-10 py-3 rounded-xl bg-[#e8952f] hover:bg-[#f6a53c] active:translate-y-[1px] text-[#2d1608] text-lg font-extrabold tracking-wide transition-colors min-h-[44px] cursor-pointer"
          >
            Играть
          </button>

          <p className="text-[#b986a5] text-[11px] sm:text-xs mt-1">
            © 2025–2026 Raido Pert Studio (ᚱ ᛈ) · 0+
          </p>
        </div>
      )}
    </div>
  )
}
