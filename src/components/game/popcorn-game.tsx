'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Cat,
  CirclePlus,
  EllipsisVertical,
  Heart,
  Home,
  MonitorDown,
  Music,
  Network,
  Pause,
  Pencil,
  PawPrint,
  Popcorn,
  RotateCcw,
  Share,
  Share2,
  Settings,
  Smartphone,
  SquarePlus,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { PopcornEngine, type EngineStats } from '@/lib/game/engine'
import { audio } from '@/lib/game/audio'
import {
  TREE_NODES,
  TREE_KEY,
  TREE_MAP,
  buyNode,
  canBuy,
  capGain,
  parseTreeRaw,
  treeBonuses,
  treePoints,
  treeSpent,
  type TreeBuyError,
  type TreeId,
  type TreeState,
} from '@/lib/game/skill-tree'
import {
  PERKS,
  PERK_MAP,
  quotaFor,
  rollPerkOffer,
  transformFor,
  type PerkDef,
  type PerkId,
  type ScreenTransform,
} from '@/lib/game/perks'
import { makeChestSprite, makePawSprite, makePopcornSprite } from '@/lib/game/sprites'
import { DEFAULT_PAW, PAWS, PAW_MAP, type PawDef, type PawId } from '@/lib/game/paws'
import {
  addCoins,
  addTotalXp,
  charLevel,
  charLevelProgress,
  getCoins,
  getTotalXp,
} from '@/lib/game/meta'
import {
  UPGRADES,
  UPGRADE_MAP,
  parseUpgrades,
  type UpgradeId,
  type UpgradeState,
} from '@/lib/game/upgrades'
import {
  ACH_EVENT,
  ACH_KEY,
  ACHIEVEMENTS,
  ACH_MAP,
  unlockMany,
  type AchId,
} from '@/lib/game/achievements'
import QRCode from 'react-qr-code'
import { ROOMS, roomForLevel, roomSrcForLevel } from '@/lib/game/rooms'
import MartenScene from './marten-scene'
import {
  DEFAULT_MARTEN,
  addMartenProgress,
  getMartenSnapshot,
  progressToNext,
  stageOf,
  subscribeMarten,
} from '@/lib/game/marten'
import { GAME_VERSION_LABEL } from '@/lib/game/version'
import { tFor, LANGS, LOCALES, type Lang, type TranslateFn } from '@/lib/game/i18n'
import {
  DEFAULT_SETTINGS,
  parseSettingsRaw,
  saveSettings,
  SETTINGS_EVENT,
  SETTINGS_KEY,
  type GameSettings,
  type Orientation,
} from '@/lib/game/settings'

type Phase = 'start' | 'playing' | 'paused' | 'chest' | 'ended'

/* ---------- автор и донаты (см. LICENSE / AUTHORS.md в корне репо) ---------- */
/** Ник автора-правообладателя */
const AUTHOR_NICK = 'RaidoPert'
/** Муза и соавтор проекта */
const AUTHOR_MUSE = 'Kate HeyNANAhey'
/** Страница автора ВКонтакте */
const AUTHOR_VK = 'https://vk.ru/raido_pert'
/** Почта автора (коммерческие предложения и связь) */
const AUTHOR_EMAIL = 'raidopert@gmail.com'
/** Номер карты МИР для донатов (формат для отображения) */
const AUTHOR_CARD = '2200 7020 0120 0364'
/** Номер карты без пробелов — его кодирует QR-код и получает копирование */
const AUTHOR_CARD_RAW = '2200702001200364'

/** Скопировать номер карты в буфер (с fallback для старых браузеров) */
function copyCardNumber(): void {
  const done = () => {
    try {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(AUTHOR_CARD_RAW)
        return
      }
    } catch {
      /* переходим к fallback */
    }
    try {
      const ta = document.createElement('textarea')
      ta.value = AUTHOR_CARD_RAW
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    } catch {
      /* совсем без буфера — ничего не делаем */
    }
  }
  done()
}

interface ResultState {
  score: number
  level: number
  record: boolean
  /** Место в топ-10 списка лидеров (−1 — не вошёл) */
  rank: number
  /** Куплен апгрейд «Девятая жизнь» и он ещё не использован в этом забеге */
  canRevive: boolean
}

interface ClearState {
  level: number
  bonus: number
}

/** Дополнительный подарок внутри сундучка: монетки или опыт (null — только перк) */
interface ChestExtra {
  kind: 'coins' | 'xp'
  n: number
}

/** Строка мировой таблицы лидеров */
interface OnlineLeader {
  name: string
  score: number
  level: number
  date: number
}

/** Событие браузера «установить приложение» (PWA) */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const BEST_KEY = 'popcorn-best'
const MUTE_KEY = 'popcorn-muted'
const STORE_EVENT = 'popcorn-store-update'
/* Мета-прогресс: очки попкорна = опыт, магазин лапок и список лидеров */
const XP_KEY = 'popcorn-xp'
/** Суммарный опыт за всё время — растит уровень котика (не тратится) */
const TOTAL_KEY = 'popcorn-totalxp'
const PAW_KEY = 'popcorn-paw'
const OWNED_KEY = 'popcorn-owned'
const LEADERS_KEY = 'popcorn-leaders'
const UPG_KEY = 'popcorn-upgrades'
const NAME_KEY = 'popcorn-name'
/** Флаг «ник уже задан» — по нему показываем вход по никнейму только раз */
const NICKSET_KEY = 'popcorn-nick-set'

interface LeaderEntry {
  score: number
  level: number
  date: number
}

const CONFETTI_COLORS = ['#E24B3B', '#FFE066', '#7BC47F', '#F2A65A', '#FFF6EC', '#E89A6B']

/* ---------- localStorage как внешний стор (без каскадных рендеров) ---------- */

function subscribeStore(onChange: () => void): () => void {
  window.addEventListener('storage', onChange)
  window.addEventListener(STORE_EVENT, onChange)
  window.addEventListener(ACH_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(STORE_EVENT, onChange)
    window.removeEventListener(ACH_EVENT, onChange)
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

/* Кэш разобранных настроек: getSnapshot должен быть стабильным между рендерами */
let settingsCacheRaw: string | null = null
let settingsCache: GameSettings = DEFAULT_SETTINGS

function snapshotSettings(): GameSettings {
  const raw = window.localStorage.getItem(SETTINGS_KEY)
  if (raw !== settingsCacheRaw) {
    settingsCacheRaw = raw
    settingsCache = parseSettingsRaw(raw ?? '')
  }
  return settingsCache
}

function subscribeSettings(onChange: () => void): () => void {
  window.addEventListener(SETTINGS_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(SETTINGS_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** Настройки как внешний стор: localStorage + событие, сервер — дефолты */
function useSettings(): [GameSettings, (s: GameSettings) => void] {
  const value = useSyncExternalStore(subscribeSettings, snapshotSettings, () => DEFAULT_SETTINGS)
  const setValue = useCallback((s: GameSettings) => saveSettings(s), [])
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
    /* Без backdrop-blur: на телефонах блюр поверх canvas
       каждый кадр перемешивается заново и роняет FPS */
    <div
      className={`flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 font-ui text-xs font-semibold text-white sm:text-sm ${className}`}
    >
      {children}
    </div>
  )
}

function IconBtn({
  onClick,
  label,
  size = 'md',
  children,
}: {
  onClick: () => void
  label: string
  size?: 'md' | 'sm'
  children: React.ReactNode
}) {
  const dim = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:bg-black/75 active:scale-90`}
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

/** Пиксельная лапка выбранного окраса (магазин скинов) */
function PawImg({ skinId, className = 'w-9' }: { skinId: PawId; className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const spr = makePawSprite(PAW_MAP[skinId].palette)
    const px = 5
    c.width = spr.w * px
    c.height = spr.h * px
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(spr.canvas, 0, 0, c.width, c.height)
  }, [skinId])
  return <canvas ref={ref} aria-hidden className={`pixelated h-auto shrink-0 ${className}`} />
}

/** Маленькая кнопка меню (лидеры / магазин / создатели) */
function MenuSmallBtn({
  onClick,
  icon,
  children,
}: {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-1 py-2 font-pixel text-[11px] font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-95"
    >
      {icon}
      {children}
    </button>
  )
}

/** Компактная пилюля панели статистики (над игровой зоной, поле не перекрывает) */
function StatPill({
  children,
  className = '',
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  className?: string
  'aria-label'?: string
}) {
  return (
    <span
      aria-label={ariaLabel}
      className={`flex items-center gap-1 rounded-full border border-white/15 bg-[#231108]/90 px-2 py-1 font-ui text-[11px] font-semibold text-white ${className}`}
    >
      {children}
    </span>
  )
}

/** Сегментный переключатель (сложность / качество / ориентация / язык) */
function Seg({
  options,
  cur,
  onPick,
}: {
  options: Array<{ v: string; label: string }>
  cur: string
  onPick: (v: string) => void
}) {
  return (
    <div className="grid gap-1 rounded-xl bg-[#f3e2c8] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onPick(o.v)}
          className={`rounded-lg px-1.5 py-1.5 font-pixel text-[11px] font-bold transition ${
            cur === o.v
              ? 'bg-[#E24B3B] text-white shadow-[0_2px_0_#9c2f22]'
              : 'text-[#8a5330] hover:bg-[#eed7b4]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Строка-переключатель в настройках */
function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2">
      <div className="min-w-0">
        <div className="font-pixel text-[12px] font-bold text-[#5C3A1E]">{label}</div>
        {hint && <div className="font-ui text-[10px] leading-tight text-[#a97c50]">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
          value ? 'border-[#9c2f22] bg-[#E24B3B]' : 'border-[#c9a97a] bg-[#e3cba4]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all ${
            value ? 'left-[1.4rem]' : 'left-0.5'
          }`}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  )
}

const OVERLAY_SCROLL =
  '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d9b98c] [&::-webkit-scrollbar-track]:bg-transparent'

/** Магазин: лапки (за опыт 🍿 или монетки 🪙) + постоянные апгрейды */
function ShopOverlay({
  xp,
  coins,
  owned,
  equipped,
  upgrades,
  t,
  onBuy,
  onEquip,
  onBuyUpgrade,
  onClose,
}: {
  xp: number
  coins: number
  owned: PawId[]
  equipped: PawId
  upgrades: UpgradeState
  t: TranslateFn
  onBuy: (def: PawDef) => void
  onEquip: (id: PawId) => void
  onBuyUpgrade: (id: UpgradeId) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'paws' | 'upgrades'>('paws')
  const effectText = (id: UpgradeId, level: number): string => {
    if (id === 'capacity') {
      return level > 0 ? t('upg.capacity.effect', { n: level }) : t('upg.none')
    }
    if (id === 'life') {
      return level > 0 ? t('upg.life.effect') : t('upg.life.effectNone')
    }
    return level > 0 ? t('upg.startperk.effect') : t('upg.startperk.effectNone')
  }
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          🛒
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('shop.title')}</h2>
        <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
          {t('shop.wallet', { x: xp, c: coins })}
        </p>

        {/* Вкладки: ЛАПКИ / АПГРЕЙДЫ */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-[#f3e2c8] p-1">
          {(
            [
              ['paws', t('shop.tab.paws')],
              ['upgrades', t('shop.tab.upgrades')],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-2 py-1.5 font-pixel text-xs font-bold transition ${
                tab === id
                  ? 'bg-[#E24B3B] text-white shadow-[0_2px_0_#9c2f22]'
                  : 'text-[#8a5330] hover:bg-[#eed7b4]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'paws' ? (
          <ul
            className={`mt-3 max-h-[42vh] space-y-2 overflow-y-auto pr-1 text-left sm:max-h-72 ${OVERLAY_SCROLL}`}
          >
            {PAWS.map((def) => {
              const isOwned = owned.includes(def.id)
              const isEquipped = equipped === def.id
              const cur = def.currency ?? 'xp'
              const canBuy = !isOwned && (cur === 'coins' ? coins >= def.price : xp >= def.price)
              return (
                <li
                  key={def.id}
                  className={`flex items-center gap-2.5 rounded-xl border-2 p-2 ${
                    isEquipped ? 'border-amber-400 bg-amber-50' : 'border-[#e3cba4] bg-[#fdf3e0]'
                  }`}
                >
                  <PawImg skinId={def.id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-sm font-bold leading-tight text-[#5C3A1E]">
                        {t(`paw.${def.id}.name`)}
                      </span>
                      {def.price === 0 && (
                        <span className="shrink-0 rounded-full bg-[#e3cba4] px-1.5 font-ui text-[9px] font-bold text-[#5C3A1E]">
                          {t('shop.badge.base')}
                        </span>
                      )}
                    </div>
                    <div
                      className="font-ui text-[11px] leading-snug text-[#8a5330]"
                      title={t(`paw.${def.id}.desc`)}
                    >
                      {t(`paw.${def.id}.bonus`)}
                    </div>
                  </div>
                  {isEquipped ? (
                    <span className="shrink-0 rounded-full bg-amber-400 px-2.5 py-1.5 font-ui text-[10px] font-bold text-[#5C3A1E]">
                      {t('shop.equipped')}
                    </span>
                  ) : isOwned ? (
                    <button
                      type="button"
                      onClick={() => onEquip(def.id)}
                      className="shrink-0 rounded-lg border-2 border-[#8a5330] bg-[#FFF6E6] px-2.5 py-1.5 font-ui text-[11px] font-bold text-[#8a5330] transition hover:bg-[#f3e2c8] active:scale-95"
                    >
                      {t('shop.equip')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onBuy(def)}
                      title={t(`paw.${def.id}.desc`)}
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 font-ui text-[11px] font-bold transition active:scale-95 ${
                        canBuy
                          ? 'bg-[#E24B3B] text-white shadow-[0_3px_0_#9c2f22] hover:bg-[#ef5a4a]'
                          : 'cursor-not-allowed bg-[#d9c6a8] text-[#8a755c]'
                      }`}
                    >
                      {cur === 'coins' ? '🪙' : '🍿'} {def.price}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <ul
            className={`mt-3 max-h-[42vh] space-y-2 overflow-y-auto pr-1 text-left sm:max-h-72 ${OVERLAY_SCROLL}`}
          >
            {UPGRADES.map((def) => {
              const level = upgrades[def.id]
              const maxed = level >= def.prices.length
              const cost = maxed ? 0 : def.prices[level]
              const canBuy = !maxed && xp >= cost
              return (
                <li
                  key={def.id}
                  className="rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] p-2"
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="text-2xl">
                      {def.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-pixel text-sm font-bold text-[#5C3A1E]">
                        {t(`upg.${def.id}.name`)}
                      </div>
                      <div className="font-ui text-[11px] leading-tight text-[#8a5330]">
                        {effectText(def.id, level)}
                      </div>
                    </div>
                    {/* Ступени */}
                    <span aria-hidden className="shrink-0 tracking-widest">
                      {def.prices.map((_, i) => (
                        <span key={i} className={i < level ? 'opacity-100' : 'opacity-30'}>
                          ●
                        </span>
                      ))}
                    </span>
                  </div>
                  <p className="mt-1 font-ui text-[10px] leading-tight text-[#a97c50]">
                    {t(`upg.${def.id}.desc`)}
                  </p>
                  <div className="mt-1.5 text-right">
                    {maxed ? (
                      <span className="inline-block rounded-full bg-amber-400 px-2.5 py-1.5 font-ui text-[10px] font-bold text-[#5C3A1E]">
                        {t('shop.max')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onBuyUpgrade(def.id)}
                        className={`rounded-lg px-2.5 py-1.5 font-ui text-[11px] font-bold transition active:scale-95 ${
                          canBuy
                            ? 'bg-[#E24B3B] text-white shadow-[0_3px_0_#9c2f22] hover:bg-[#ef5a4a]'
                            : 'cursor-not-allowed bg-[#d9c6a8] text-[#8a755c]'
                        }`}
                      >
                        🍿 {cost}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-2 font-ui text-[10px] leading-snug text-[#a97c50]">{t('shop.note')}</p>
        <div className="mt-2.5">
          <GameButton onClick={onClose}>{t('shop.close')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Топ-10 на устройстве + мировая таблица (если подключена база) */
function LeadersOverlay({
  leaders,
  myName,
  lang,
  t,
  onClose,
}: {
  leaders: LeaderEntry[]
  myName: string
  lang: Lang
  t: TranslateFn
  onClose: () => void
}) {
  const [world, setWorld] = useState<{
    status: 'loading' | 'on' | 'off'
    rows: OnlineLeader[]
    stats?: { launches: number; runs: number; players: number }
  }>({ status: 'loading', rows: [] })
  const [tab, setTab] = useState<'world' | 'local'>('world')

  useEffect(() => {
    let alive = true
    fetch('/api/leaders')
      .then((r) => r.json())
      .then(
        (d: {
          online?: boolean
          leaders?: OnlineLeader[]
          stats?: { launches: number; runs: number; players: number }
        }) => {
          if (!alive) return
          if (d?.online && Array.isArray(d.leaders)) {
            setWorld({ status: 'on', rows: d.leaders, stats: d.stats })
            setTab('world')
          } else {
            setWorld({ status: 'off', rows: [] })
            setTab('local')
          }
        },
      )
      .catch(() => {
        if (!alive) return
        setWorld({ status: 'off', rows: [] })
        setTab('local')
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          🏆
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('lead.title')}</h2>

        {world.status === 'on' ? (
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-[#f3e2c8] p-1">
            {(
              [
                ['world', t('lead.world')],
                ['local', t('lead.local')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-lg px-2 py-1.5 font-pixel text-[11px] font-bold transition ${
                  tab === id
                    ? 'bg-[#E24B3B] text-white shadow-[0_2px_0_#9c2f22]'
                    : 'text-[#8a5330] hover:bg-[#eed7b4]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
            {world.status === 'loading' ? t('lead.checking') : t('lead.offline')}
          </p>
        )}

        {/* Мировая статистика: счётчик запусков, забегов и уникальных котиков */}
        {world.status === 'on' && world.stats && (
          <p className="mt-2 rounded-xl bg-[#fdf3e0] px-2.5 py-1.5 font-ui text-[10px] font-semibold leading-snug text-[#8a5330] ring-1 ring-[#e3cba4]">
            {t('lead.stats', {
              n: world.stats.launches,
              r: world.stats.runs,
              p: world.stats.players,
            })}
          </p>
        )}

        {tab === 'local' || world.status !== 'on' ? (
          leaders.length === 0 ? (
            <p className="mt-4 font-ui text-sm font-medium text-[#5C3A1E]">{t('lead.emptyLocal')}</p>
          ) : (
            <ol className={`mt-3 max-h-[42vh] space-y-1.5 overflow-y-auto pr-1 sm:max-h-72 ${OVERLAY_SCROLL}`}>
              {leaders.map((e, i) => (
                <li
                  key={`${e.date}-${e.score}-${i}`}
                  className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 ${
                    i === 0 ? 'border-amber-400 bg-amber-50' : 'border-[#e3cba4] bg-[#fdf3e0]'
                  }`}
                >
                  <span aria-hidden className="w-7 text-center font-pixel text-sm">
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </span>
                  <Popcorn className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                  <span className="font-pixel text-base font-bold tabular-nums text-[#5C3A1E]">
                    {e.score}
                  </span>
                  <span className="ml-auto font-ui text-[11px] text-[#8a5330]">
                    {t('lead.lvl', { n: e.level })} ·{' '}
                    {new Date(e.date).toLocaleDateString(LOCALES[lang])}
                  </span>
                </li>
              ))}
            </ol>
          )
        ) : world.rows.length === 0 ? (
          <p className="mt-4 font-ui text-sm font-medium text-[#5C3A1E]">{t('lead.emptyWorld')}</p>
        ) : (
          <ol className={`mt-3 max-h-[42vh] space-y-1.5 overflow-y-auto pr-1 sm:max-h-72 ${OVERLAY_SCROLL}`}>
            {world.rows.map((e, i) => {
              const mine =
                myName.trim().length > 1 && e.name.toLowerCase() === myName.trim().toLowerCase()
              return (
                <li
                  key={`${e.date}-${e.name}-${i}`}
                  className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 ${
                    mine
                      ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-300'
                      : i === 0
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-[#e3cba4] bg-[#fdf3e0]'
                  }`}
                >
                  <span aria-hidden className="w-7 text-center font-pixel text-sm">
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left font-pixel text-sm font-bold text-[#5C3A1E]">
                    {e.name}
                    {mine && <span className="ml-1 font-ui text-[10px] text-[#B33A26]">{t('lead.you')}</span>}
                  </span>
                  <Popcorn className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                  <span className="font-pixel text-base font-bold tabular-nums text-[#5C3A1E]">
                    {e.score}
                  </span>
                  <span className="shrink-0 font-ui text-[11px] text-[#8a5330]">
                    {t('lead.lvl', { n: e.level })}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
        <div className="mt-3">
          <GameButton onClick={onClose}>{t('shop.close')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Экран «Правила»: подробный список механик (вынесен из главного меню) */
function RulesOverlay({ t, onClose }: { t: TranslateFn; onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ['👆', 'rules.r1'],
    ['🍿', 'rules.r2'],
    ['🌽', 'rules.r3'],
    ['🎯', 'rules.r4'],
    ['🐾', 'rules.r5'],
    ['🎁', 'rules.r6'],
    ['🔥', 'rules.r7'],
    ['🐦', 'rules.r8'],
    ['♾️', 'rules.r9'],
    ['🛒', 'rules.r10'],
    ['🗺️', 'rules.r11'],
    ['🧺', 'rules.grains'],
    ['🏅', 'rules.r12'],
    ['⏹', 'rules.r13'],
    ['🏆', 'rules.r14'],
  ]
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          📖
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('rules.title')}</h2>
        <ul
          className={`mt-3 max-h-[52vh] space-y-2 overflow-y-auto pr-1 text-left font-ui text-xs leading-snug text-[#5C3A1E] sm:max-h-80 sm:text-sm ${OVERLAY_SCROLL}`}
        >
          {rows.map(([icon, key]) => (
            <HowToRow key={key} icon={icon}>
              {t(key)}
            </HowToRow>
          ))}
        </ul>
        <p className="mt-2.5 font-ui text-[11px] leading-snug text-[#a97c50]">
          {t('rules.note')}
          <br />
          {t('rules.ios')}
        </p>
        <div className="mt-3">
          <GameButton onClick={onClose}>{t('rules.ok')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

type InstallPlatform = 'ios' | 'android' | 'desktop'

/** Какая перед пользователем платформа: от неё зависит инструкция установки */
function detectInstallPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

/** Экран «Установить игру»: нативный диалог Chrome/Android/ПК или
    пошаговая инструкция (iPhone/iPad — Safari не даёт beforeinstallprompt) */
function InstallOverlay({
  t,
  canNative,
  onNative,
  onClose,
}: {
  t: TranslateFn
  canNative: boolean
  onNative: () => void
  onClose: () => void
}) {
  const platform = useMemo(() => detectInstallPlatform(), [])

  const rows: Record<InstallPlatform, Array<{ icon: React.ReactNode; key: string }>> = {
    ios: [
      { icon: <Share className="h-4 w-4" aria-hidden />, key: 'install.iosStep1' },
      { icon: <Home className="h-4 w-4" aria-hidden />, key: 'install.iosStep2' },
      { icon: <SquarePlus className="h-4 w-4" aria-hidden />, key: 'install.iosStep3' },
    ],
    android: [
      { icon: <EllipsisVertical className="h-4 w-4" aria-hidden />, key: 'install.androidStep' },
    ],
    desktop: [
      { icon: <CirclePlus className="h-4 w-4" aria-hidden />, key: 'install.desktopStep' },
    ],
  }
  const titles: Record<InstallPlatform, string> = {
    ios: t('install.iosTitle'),
    android: t('install.androidTitle'),
    desktop: t('install.desktopTitle'),
  }
  const order: InstallPlatform[] = ['ios', 'android', 'desktop']
  const sorted = [...order].sort((a, b) => (a === platform ? -1 : b === platform ? 1 : 0))

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          📲
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('install.title')}</h2>

        {canNative && (
          <div className="mt-3 rounded-xl bg-amber-100 p-3 ring-2 ring-amber-200">
            <GameButton onClick={onNative}>{t('install.nativeBtn')}</GameButton>
            <p className="mt-2 font-ui text-[11px] leading-snug text-[#8a5330]">
              {t('install.nativeHint')}
            </p>
          </div>
        )}

        <ul className="mt-3 space-y-2 text-left">
          {sorted.map((p) => (
            <li
              key={p}
              className={`rounded-xl p-2.5 ring-2 ${
                p === platform
                  ? 'bg-amber-100 ring-amber-300'
                  : 'bg-[#f3e2c8]/60 opacity-70 ring-amber-200/60'
              }`}
            >
              <div className="mb-1.5 flex items-center gap-1.5 font-pixel text-[11px] font-bold text-[#8a5330]">
                <MonitorDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {titles[p]}
              </div>
              <ul className="space-y-1.5">
                {rows[p].map((row) => (
                  <li key={row.key} className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#E24B3B] ring-2 ring-amber-200"
                    >
                      {row.icon}
                    </span>
                    <span className="font-ui text-xs leading-snug text-[#5C3A1E]">
                      {t(row.key)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <p className="mt-2.5 font-ui text-[11px] leading-snug text-[#a97c50]">
          {t('install.where')}
        </p>
        <div className="mt-3">
          <GameButton onClick={onClose}>{t('install.close')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Позиции узлов древа на SVG-сетке (в процентах контейнера): корень → 3 ветки → 3 вершины */
const TREE_POS: Record<TreeId, { x: number; y: number }> = {
  harvest: { x: 50, y: 10 },
  swift: { x: 18, y: 45 },
  cap: { x: 50, y: 45 },
  seeds: { x: 82, y: 45 },
  feverluck: { x: 16, y: 81 },
  shield: { x: 50, y: 81 },
  goldluck: { x: 84, y: 81 },
}

/** Ветки дерева: корень расходится на 3 ветки, каждая ведёт к своей вершине */
const TREE_LINKS: Array<{ to: TreeId; d: string }> = [
  { to: 'swift', d: 'M50,10 Q31,24 18,45' },
  { to: 'cap', d: 'M50,10 Q50,26 50,45' },
  { to: 'seeds', d: 'M50,10 Q69,24 82,45' },
  { to: 'feverluck', d: 'M18,45 Q12,62 16,81' },
  { to: 'shield', d: 'M50,45 Q50,62 50,81' },
  { to: 'goldluck', d: 'M82,45 Q88,62 84,81' },
]

/** Число в подсказке узла: суммарный эффект на текущем уровне
    (для не купленных — эффект первой покупки) */
function treeEffectN(id: TreeId, lvl: number): number {
  if (id === 'harvest') return 5 * Math.max(lvl, 1) // +5% за каждый уровень
  if (id === 'cap') return capGain(Math.max(lvl, 1)) // +1, +3, +6, +10 зерна всего
  return Math.max(lvl, 1) // щит: 1/2/3 щита за забег
}

/** Экран «Древо улучшений» (тестовая ветка): постоянные бонусы за очки
    уровня котика. Корень +5% зёрен за уровень, ветки на скорость,
    вместимость/засев и щит/удачу */
function TreeOverlay({
  t,
  tree,
  points,
  totalXp,
  onClose,
}: {
  t: TranslateFn
  tree: TreeState
  points: number
  totalXp: number
  onClose: () => void
}) {
  const [err, setErr] = useState<string | null>(null)
  const errTimer = useRef<number | null>(null)

  const showErr = useCallback((msg: string) => {
    audio.play('penalty')
    setErr(msg)
    if (errTimer.current) window.clearTimeout(errTimer.current)
    errTimer.current = window.setTimeout(() => setErr(null), 2000)
  }, [])

  useEffect(
    () => () => {
      if (errTimer.current) window.clearTimeout(errTimer.current)
    },
    [],
  )

  const onNode = useCallback(
    (id: TreeId) => {
      const check = canBuy(id, tree, totalXp)
      if (check !== 'ok') {
        const def = TREE_MAP[id]
        if (check === 'root') showErr(t('tree.needRoot'))
        else if (check === 'points') showErr(t('tree.needPoints'))
        else if (check === 'level') showErr(t('tree.needLevel', { n: def.reqLevel }))
        else showErr(t('tree.maxed'))
        return
      }
      audio.play('record')
      buyNode(id)
    },
    [tree, totalXp, showErr, t],
  )

  const nodeState = (id: TreeId): 'bought' | 'ready' | 'idle' | 'locked' => {
    const lvl = tree[id] ?? 0
    if (lvl >= TREE_MAP[id].maxLevel) return 'bought'
    if (lvl > 0) return 'ready' // «Урожай» докупается за новые очки
    const check = canBuy(id, tree, totalXp)
    if (check === 'ok') return 'ready'
    if (check === 'level' || check === 'root') return 'locked'
    return 'idle'
  }

  const styles: Record<'bought' | 'ready' | 'idle' | 'locked', string> = {
    bought: 'border-[#5C8A3A] bg-[#eaf3dd] text-[#3f6b28] shadow-[0_4px_0_#b9d29b]',
    ready: 'border-[#E2A23B] bg-amber-100 text-[#8a5330] shadow-[0_4px_0_#e9c98a] animate-pulse',
    idle: 'border-[#c9a97a] bg-[#f3e2c8]/80 text-[#a97c50] opacity-90',
    locked: 'border-[#b0a08c] bg-[#e8e2d8] text-[#8d7f6d] opacity-80 grayscale',
  }

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          🌳
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('tree.title')}</h2>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 font-pixel text-sm font-bold text-[#8a5330] ring-2 ring-amber-200">
            {t('tree.points', { n: points })}
          </span>
        </div>
        <p className="mt-1 font-ui text-[10px] leading-snug text-[#a97c50]">{t('tree.hint')}</p>
        <div aria-live="polite" className="h-4">
          {err && (
            <span className="font-pixel text-[11px] font-bold text-[#B33A26]">{err}</span>
          )}
        </div>

        {/* Сетка-дерево: SVG-ветки под узлами (3 яруса) */}
        <div className="relative mx-auto h-80 w-full max-w-[340px]">
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {TREE_LINKS.map(({ to, d }) => {
              const st = nodeState(to)
              const stroke =
                st === 'bought' ? '#5C8A3A' : st === 'ready' ? '#E2A23B' : '#c9b18f'
              return (
                <path
                  key={to}
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={3}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={st === 'bought' ? undefined : '2 4'}
                  opacity={st === 'bought' || st === 'ready' ? 0.9 : 0.55}
                />
              )
            })}
          </svg>
          {TREE_NODES.map((node) => {
            const p = TREE_POS[node.id]
            const st = nodeState(node.id)
            const lvl = tree[node.id] ?? 0
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onNode(node.id)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E24B3B] rounded-lg"
                aria-label={`${t(`tree.${node.id}.name`)} — ${t(`tree.${node.id}.effect`, { n: treeEffectN(node.id, lvl) })}`}
              >
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full border-4 text-2xl transition active:scale-90 ${styles[st]}`}
                >
                  <span aria-hidden>{node.icon}</span>
                  {lvl > 0 && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#5C8A3A] px-1 font-ui text-[10px] font-bold text-white">
                      {lvl >= node.maxLevel ? 'MAX' : lvl}
                    </span>
                  )}
                  {st === 'locked' && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#8d7f6d] px-1 font-ui text-[9px] font-bold text-white">
                      🔒{t('tree.locked', { n: TREE_MAP[node.id].reqLevel })}
                    </span>
                  )}
                </span>
                <span className="mt-1 w-24 text-center font-pixel text-[10px] font-bold leading-tight text-[#5C3A1E]">
                  {t(`tree.${node.id}.name`)}
                </span>
                <span className="w-24 text-center font-ui text-[9px] leading-tight text-[#a97c50]">
                  {t(`tree.${node.id}.effect`, { n: treeEffectN(node.id, lvl) })}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-2">
          <GameButton onClick={onClose}>{t('install.close')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Экран «Создатели»: авторство, контакты и поддержка автора (QR + карта) */
function CreatorsOverlay({ t, onClose }: { t: TranslateFn; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | null>(null)

  /** Тап по номеру карты / QR: копируем и показываем подсказку */
  const onDonateTap = useCallback(() => {
    copyCardNumber()
    audio.play('click')
    setCopied(true)
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2600)
  }, [])

  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    },
    [],
  )

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-6"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-4xl">
          🐱🍿🐈
        </div>
        <h2 className="mt-1 font-pixel text-xl font-bold text-[#B33A26]">{t('creators.title')}</h2>

        {/* Авторство */}
        <div className="mt-3 rounded-xl bg-[#fdf3e0] px-3 py-2.5 ring-1 ring-[#e3cba4]">
          <p className="font-pixel text-lg font-bold leading-snug text-[#5C3A1E] sm:text-xl">
            {AUTHOR_NICK}
          </p>
          <p className="mt-0.5 font-ui text-[11px] font-semibold text-[#8a5330]">
            {t('creators.author')}
          </p>
          <p className="mt-1.5 font-pixel text-sm font-bold leading-snug text-[#B33A26]">
            {AUTHOR_MUSE}
          </p>
          <p className="font-ui text-[11px] font-semibold text-[#8a5330]">
            {t('creators.muse')}
          </p>
        </div>
        <motion.p
          aria-hidden
          className="mt-1 font-pixel text-3xl font-bold text-[#E24B3B]"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
        >
          !!!!
        </motion.p>
        <p className="mt-1.5 font-ui text-sm leading-relaxed text-[#5C3A1E]">{t('creators.text')}</p>
        <motion.p
          aria-hidden
          className="mt-1.5 text-2xl tracking-widest"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: 0.3 }}
        >
          ❤️🧡💛💚
        </motion.p>

        {/* Контакты автора */}
        <div className="mt-3 rounded-xl bg-[#fdf3e0] px-3 py-2.5 ring-1 ring-[#e3cba4]">
          <p className="font-ui text-[11px] font-bold uppercase tracking-wide text-[#8a5330]">
            {t('creators.contact')}
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <a
              href={AUTHOR_VK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audio.play('click')}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#E24B3B] px-3 py-1.5 font-ui text-xs font-bold text-white shadow-[0_2px_0_#9c2f22] transition hover:bg-[#c73d2e] active:scale-95"
            >
              💬 VK
            </a>
            <a
              href={`mailto:${AUTHOR_EMAIL}`}
              onClick={() => audio.play('click')}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#8a5330] px-3 py-1.5 font-ui text-xs font-bold text-white shadow-[0_2px_0_#5f3a20] transition hover:bg-[#6f4426] active:scale-95"
            >
              ✉️ Email
            </a>
          </div>
        </div>

        {/* Донаты: QR + номер карты МИР (тап — копирование) */}
        <div className="mt-3 rounded-xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-[#fdf3e0] px-3 py-3">
          <p className="font-pixel text-sm font-bold text-[#B33A26]">{t('creators.support')}</p>
          <button
            type="button"
            onClick={onDonateTap}
            aria-label={`${t('creators.card')}: ${AUTHOR_CARD}`}
            className="mx-auto mt-2 block w-fit rounded-xl bg-white p-2 shadow-[0_3px_10px_rgba(0,0,0,0.18)] ring-2 ring-amber-200 transition active:scale-95"
          >
            <QRCode
              value={AUTHOR_CARD_RAW}
              size={104}
              bgColor="#ffffff"
              fgColor="#3d2412"
              aria-hidden
            />
          </button>
          <p className="mt-2 font-ui text-[11px] font-medium leading-snug text-[#8a5330]">
            {t('creators.donateHint')}
          </p>
          <button
            type="button"
            onClick={onDonateTap}
            className={`mt-2 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl px-3 py-2 font-ui font-bold transition active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white shadow-[0_2px_0_#047857]'
                : 'bg-amber-100 text-[#5C3A1E] ring-2 ring-amber-300 hover:bg-amber-200'
            }`}
          >
            <span className="font-mono text-base tracking-wider">{AUTHOR_CARD}</span>
          </button>
          <p
            className={`mt-1.5 font-ui text-[11px] font-semibold ${
              copied ? 'text-emerald-600' : 'text-transparent'
            }`}
            role="status"
            aria-live="polite"
          >
            {copied ? t('creators.copied') : '·'}
          </p>
          <p className="font-ui text-[10px] font-medium text-[#a97c50]">
            {t('creators.card')} · {t('creators.donateThanks')}
          </p>
        </div>

        <div className="mt-4">
          <GameButton onClick={onClose}>{t('creators.ok')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Экран «Достижения»: медали за игровые подвиги */
function AchievementsOverlay({
  unlocked,
  t,
  onClose,
}: {
  unlocked: AchId[]
  t: TranslateFn
  onClose: () => void
}) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          🏅
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('ach.title')}</h2>
        <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
          {t('ach.progress', { a: unlocked.length, b: ACHIEVEMENTS.length })}
        </p>
        <div
          className={`mt-3 grid max-h-[42vh] grid-cols-2 gap-2 overflow-y-auto pr-1 text-left sm:max-h-72 ${OVERLAY_SCROLL}`}
        >
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a.id)
            return (
              <div
                key={a.id}
                className={`rounded-xl border-2 p-2 ${
                  got
                    ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 shadow-[0_2px_0_#e8c96a]'
                    : 'border-[#e3cba4] bg-[#f3e9d8] opacity-70 grayscale'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span aria-hidden className="text-xl">
                    {got ? a.icon : '🔒'}
                  </span>
                  <span
                    className={`truncate font-pixel text-[11px] font-bold ${got ? 'text-[#5C3A1E]' : 'text-[#a97c50]'}`}
                  >
                    {t(`ach.${a.id}.name`)}
                  </span>
                </div>
                <p
                  className={`mt-1 font-ui text-[10px] leading-tight ${got ? 'text-[#8a5330]' : 'text-[#b39a76]'}`}
                >
                  {t(`ach.${a.id}.desc`)}
                </p>
              </div>
            )
          })}
        </div>
        <div className="mt-3">
          <GameButton onClick={onClose}>{t('shop.close')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Экран «Настройки»: язык, сложность, качество, ориентация, перки, экран, вибрация */
function SettingsOverlay({
  settings,
  onChange,
  t,
  onClose,
}: {
  settings: GameSettings
  onChange: (s: GameSettings) => void
  t: TranslateFn
  onClose: () => void
}) {
  const set = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch })
  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          ⚙️
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('set.title')}</h2>

        <div
          className={`mt-3 max-h-[56vh] space-y-3 overflow-y-auto pr-1 text-left ${OVERLAY_SCROLL}`}
        >
          {/* Язык */}
          <section>
            <div className="mb-1 font-pixel text-[12px] font-bold text-[#8a5330]">
              🌐 {t('set.lang')}
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-[#f3e2c8] p-1">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => set({ lang: l.id })}
                  className={`rounded-lg px-1 py-1.5 font-pixel text-[11px] font-bold transition ${
                    settings.lang === l.id
                      ? 'bg-[#E24B3B] text-white shadow-[0_2px_0_#9c2f22]'
                      : 'text-[#8a5330] hover:bg-[#eed7b4]'
                  }`}
                  aria-label={l.label}
                >
                  {l.flag} {l.id.toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          {/* Сложность */}
          <section>
            <div className="mb-1 font-pixel text-[12px] font-bold text-[#8a5330]">
              🎯 {t('set.diff')}
            </div>
            <Seg
              cur={settings.difficulty}
              onPick={(v) => set({ difficulty: v as GameSettings['difficulty'] })}
              options={[
                { v: 'easy', label: t('set.diff.easy') },
                { v: 'normal', label: t('set.diff.normal') },
                { v: 'hard', label: t('set.diff.hard') },
              ]}
            />
            <p className="mt-1 font-ui text-[10px] leading-tight text-[#a97c50]">
              {t('set.diffHint')}
            </p>
          </section>

          {/* Качество */}
          <section>
            <div className="mb-1 font-pixel text-[12px] font-bold text-[#8a5330]">
              ✨ {t('set.quality')}
            </div>
            <Seg
              cur={settings.quality}
              onPick={(v) => set({ quality: v as GameSettings['quality'] })}
              options={[
                { v: 'low', label: t('set.quality.low') },
                { v: 'medium', label: t('set.quality.medium') },
                { v: 'high', label: t('set.quality.high') },
              ]}
            />
            <p className="mt-1 font-ui text-[10px] leading-tight text-[#a97c50]">
              {t('set.qualityHint')}
            </p>
          </section>

          {/* Ориентация */}
          <section>
            <div className="mb-1 font-pixel text-[12px] font-bold text-[#8a5330]">
              📱 {t('set.orient')}
            </div>
            <Seg
              cur={settings.orientation}
              onPick={(v) => set({ orientation: v as Orientation })}
              options={[
                { v: 'portrait', label: t('set.orient.portrait') },
                { v: 'landscape', label: t('set.orient.landscape') },
                { v: 'auto', label: t('set.orient.auto') },
              ]}
            />
          </section>

          {/* Игровые механики */}
          <section className="space-y-1.5">
            <div className="font-pixel text-[12px] font-bold text-[#8a5330]">🎲</div>
            <ToggleRow
              label={t('set.perksCurse')}
              value={settings.perksCurse}
              onChange={(v) => set({ perksCurse: v })}
            />
            <ToggleRow
              label={t('set.perksBonus')}
              value={settings.perksBonus}
              onChange={(v) => set({ perksBonus: v })}
            />
            <ToggleRow
              label={t('set.pigeon')}
              value={settings.pigeon}
              onChange={(v) => set({ pigeon: v })}
            />
          </section>

          {/* Экран и отклик */}
          <section className="space-y-1.5">
            <div className="font-pixel text-[12px] font-bold text-[#8a5330]">
              🖥 {t('set.shake')}/{t('set.vibro')}/{t('set.colorblind')}
            </div>
            <ToggleRow
              label={t('set.shake')}
              value={settings.shake}
              onChange={(v) => set({ shake: v })}
            />
            <ToggleRow
              label={t('set.vibro')}
              value={settings.vibration}
              onChange={(v) => set({ vibration: v })}
            />
            <ToggleRow
              label={t('set.colorblind')}
              hint={t('set.colorblindHint')}
              value={settings.colorblind}
              onChange={(v) => set({ colorblind: v })}
            />
            <ToggleRow
              label={t('set.crt')}
              hint={t('set.crtHint')}
              value={settings.crt}
              onChange={(v) => set({ crt: v })}
            />
          </section>

          {/* Громкость: музыка и звуки отдельно — живой эффект */}
          <section className="space-y-2">
            <div className="font-pixel text-[12px] font-bold text-[#8a5330]">
              {t('set.sound')}
            </div>
            <label className="block rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2">
              <span className="flex items-center justify-between font-ui text-[11px] font-semibold text-[#5C3A1E]">
                <span className="flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5 text-[#B33A26]" aria-hidden />
                  {t('set.music')}
                </span>
                <span className="tabular-nums">
                  {Math.round(settings.volumeMusic * 100)}%
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volumeMusic}
                onChange={(e) => set({ volumeMusic: Number(e.target.value) })}
                className="mt-1 w-full accent-[#E24B3B]"
                aria-label={t('set.music')}
              />
            </label>
            <label className="block rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2">
              <span className="flex items-center justify-between font-ui text-[11px] font-semibold text-[#5C3A1E]">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-[#B33A26]" aria-hidden />
                  {t('set.sfx')}
                </span>
                <span className="tabular-nums">
                  {Math.round(settings.volumeSfx * 100)}%
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volumeSfx}
                onChange={(e) => {
                  set({ volumeSfx: Number(e.target.value) })
                  // мгновенный отклик: пробный «клик» при изменении громкости звуков
                  audio.play('tick')
                }}
                className="mt-1 w-full accent-[#E24B3B]"
                aria-label={t('set.sfx')}
              />
            </label>
            <p className="font-ui text-[10px] leading-tight text-[#a97c50]">
              {t('set.soundHint')}
            </p>
          </section>

          {/* Яркость и контраст */}
          <section className="space-y-2">
            <div className="font-pixel text-[12px] font-bold text-[#8a5330]">
              🔅 {t('set.bright')} / {t('set.contrast')}
            </div>
            <label className="block rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2">
              <span className="flex items-center justify-between font-ui text-[11px] font-semibold text-[#5C3A1E]">
                {t('set.bright')}
                <span className="tabular-nums">{Math.round(settings.brightness * 100)}%</span>
              </span>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.05}
                value={settings.brightness}
                onChange={(e) => set({ brightness: Number(e.target.value) })}
                className="mt-1 w-full accent-[#E24B3B]"
                aria-label={t('set.bright')}
              />
            </label>
            <label className="block rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2">
              <span className="flex items-center justify-between font-ui text-[11px] font-semibold text-[#5C3A1E]">
                {t('set.contrast')}
                <span className="tabular-nums">{Math.round(settings.contrast * 100)}%</span>
              </span>
              <input
                type="range"
                min={0.6}
                max={1.6}
                step={0.05}
                value={settings.contrast}
                onChange={(e) => set({ contrast: Number(e.target.value) })}
                className="mt-1 w-full accent-[#E24B3B]"
                aria-label={t('set.contrast')}
              />
            </label>
          </section>
        </div>

        <div className="mt-3 space-y-2">
          <GameButton onClick={onClose}>{t('set.close')}</GameButton>
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_SETTINGS, lang: settings.lang })}
            className="w-full rounded-xl px-4 py-1.5 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
          >
            ↺ {t('set.reset')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ---------- вход по никнейму ---------- */

/** Диалог ника: первый вход в игру (mode='gate') и смена ника в меню (mode='edit') */
function NickDialog({
  mode,
  current,
  t,
  onDone,
  onClose,
}: {
  mode: 'gate' | 'edit'
  current: string
  t: TranslateFn
  onDone: (name: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(current)
  const clean = draft.trim().replace(/\s+/g, ' ')
  const valid = clean.length >= 2 && clean.length <= 24
  const submit = () => {
    if (valid) onDone(clean.slice(0, 24))
  }
  return (
    <motion.div
      className="absolute inset-0 z-[46] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-4xl">
          🐱
        </div>
        <h2 className="mt-1 font-pixel text-xl font-bold text-[#B33A26]">
          {mode === 'gate' ? t('nick.gate.title') : t('nick.edit.title')}
        </h2>
        {mode === 'gate' ? (
          <p className="mt-1 font-ui text-xs font-medium leading-snug text-[#8a5330]">
            {t('nick.gate.desc')}
          </p>
        ) : (
          <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">{t('nick.edit.desc')}</p>
        )}
        <input
          autoFocus
          type="text"
          inputMode="text"
          autoComplete="off"
          maxLength={24}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 24))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) submit()
          }}
          placeholder={t('nick.placeholder')}
          aria-label={t('nick.aria')}
          className="mt-3 w-full rounded-xl border-[3px] border-[#e3cba4] bg-white px-3 py-2.5 text-center font-pixel text-lg font-bold text-[#5C3A1E] outline-none transition placeholder:text-[#c9a97a] focus:border-amber-400"
        />
        <p className="mt-1.5 font-ui text-[11px] text-[#a97c50]">{t('nick.hint')}</p>
        <div className="mt-3 space-y-2">
          {valid ? (
            <GameButton onClick={submit}>
              {mode === 'gate' ? t('nick.confirm') : t('nick.save')}
            </GameButton>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-[#d9c6a8] px-6 py-3.5 font-pixel text-base text-[#8a755c] sm:text-lg"
            >
              {t('nick.enter')}
            </button>
          )}
          {mode === 'gate' ? (
            <button
              type="button"
              onClick={() => onDone(t('nick.default'))}
              className="w-full rounded-xl px-4 py-1.5 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
            >
              {t('nick.anon')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl px-4 py-1.5 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
            >
              {t('nick.cancel')}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ---------- шаринг рекорда: картинка-карточка + Web Share API ---------- */

async function shareResult(
  score: number,
  level: number,
  best: number,
  t: TranslateFn,
): Promise<'shared' | 'copied' | 'fail'> {
  const text = t('share.text', { s: score, l: level })
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  try {
    // Рисуем праздничную карточку результата
    const card = document.createElement('canvas')
    card.width = 600
    card.height = 600
    const c = card.getContext('2d')
    if (!c) throw new Error('no ctx')
    c.fillStyle = '#1d110b'
    c.fillRect(0, 0, 600, 600)
    c.fillStyle = '#E24B3B'
    c.fillRect(20, 20, 560, 560)
    c.fillStyle = '#FFF6E6'
    c.fillRect(38, 38, 524, 524)
    c.imageSmoothingEnabled = false
    const spr = makePopcornSprite('white')
    c.drawImage(spr.canvas, 300 - 80, 66, 160, 160)
    c.textAlign = 'center'
    c.fillStyle = '#B33A26'
    c.font = '700 44px "Handjet", system-ui, sans-serif'
    c.fillText(t('app.title').split(' ').slice(0, 2).join(' '), 300, 282)
    c.fillText(t('app.title').split(' ').slice(2).join(' ') || ' ', 300, 326)
    c.fillStyle = '#5C3A1E'
    c.font = '700 150px "Handjet", system-ui, sans-serif'
    c.fillText(String(score), 300, 480)
    c.fillStyle = '#8a5330'
    c.font = '600 32px "Handjet", system-ui, sans-serif'
    c.fillText(t('share.cardLevel', { l: level, b: best }), 300, 532)
    c.fillStyle = '#E24B3B'
    c.font = '600 28px "Handjet", system-ui, sans-serif'
    c.fillText(url.replace(/^https?:\/\//, '') || 'popcorn-lapi.vercel.app', 300, 574)

    const blob = await new Promise<Blob | null>((resolve) => card.toBlob(resolve, 'image/png'))
    const file = blob ? new File([blob], 'popcorn-record.png', { type: 'image/png' }) : null
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
    if (file && nav.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: t('app.title'),
        text,
      })
      return 'shared'
    }
    if (navigator.share) {
      await navigator.share({ title: t('app.title'), text: `${text}\n${url}` })
      return 'shared'
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      return 'copied'
    } catch {
      // Запасной путь: скрытая textarea + execCommand (старые браузеры/строгие права)
      const ta = document.createElement('textarea')
      ta.value = `${text}\n${url}`
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        if (document.execCommand('copy')) return 'copied'
      } finally {
        document.body.removeChild(ta)
      }
    }
    return 'fail'
  } catch {
    // Пользователь отменил системное окно — это не ошибка
    return 'fail'
  }
}

/* ---------- основной компонент ---------- */

export function PopcornGame() {
  const mainRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<PopcornEngine | null>(null)
  /** Кэш рамки игрового поля: getBoundingClientRect дорогой на каждый move */
  const rectRef = useRef<DOMRect | null>(null)
  const mutedRef = useRef(false)
  const transformRef = useRef<ScreenTransform>('none')
  const layoutRef = useRef<() => void>(() => {})
  const devRef = useRef<{ fast: boolean; forced: PerkId | null; fever: boolean }>({
    fast: false,
    forced: null,
    fever: false,
  })
  const equippedRef = useRef<PawId>(DEFAULT_PAW)
  /** Счёт забега, уже зачисленный в банк опыта (очки = опыт) */
  const lastScoreRef = useRef(0)

  /* Настройки: язык, сложность, качество, ориентация, перки, экран, вибрация */
  const [settings, setSettings] = useSettings()
  const settingsRef = useRef(settings)

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
    paused: false,
    streak: 0,
    comboMult: 1,
    goldenCount: 0,
    pigeonShooed: 0,
    fever: false,
    feverGained: 0,
    wave: 0,
    shields: 0,
  })
  const [bestRaw, storeBest] = useStoredValue(BEST_KEY, '0')
  const [mutedRaw, storeMuted] = useStoredValue(MUTE_KEY, '0')
  const best = Number(bestRaw) || 0
  const muted = mutedRaw === '1'
  const [result, setResult] = useState<ResultState | null>(null)
  const [clearInfo, setClearInfo] = useState<ClearState | null>(null)
  const [offers, setOffers] = useState<PerkDef[]>([])
  /** Подарки в сундуках: монетки/опыт (null — только перк) */
  const [extras, setExtras] = useState<Array<ChestExtra | null>>([null, null, null])
  const [openedIdx, setOpenedIdx] = useState<number | null>(null)
  const [runLevel, setRunLevel] = useState(2)
  const [perk, setPerk] = useState<PerkId | null>(null)
  /** Тост «Котик подрос»: уровень персонажа вырос */
  const [charToast, setCharToast] = useState<number | null>(null)
  /** HTML-индикатор волны: виден поверх попкорнового тумана (туман — в канвасе) */
  const [waveToast, setWaveToast] = useState<number | null>(null)
  /** Номер волны, для которой тост уже показан — не перезапускаем анимацию */
  const waveShownRef = useRef(0)
  /** Таймер скрытия тоста волны: гасим при новой волне, чтобы не мигало */
  const waveTimerRef = useRef<number | null>(null)
  /** Тост «монетки за Лихорадку» — сколько 🪙 упало в кошелёк */
  const [feverCoins, setFeverCoins] = useState<number | null>(null)

  /* Мета-прогресс: опыт, магазин лапок, апгрейды, ачивки, лидеры, имя */
  const [xpRaw, storeXp] = useStoredValue(XP_KEY, '0')
  /** Суммарный опыт за всё время — уровень котика */
  const [totalRaw] = useStoredValue(TOTAL_KEY, '0')
  /** Монетки — валюта артефактных лапок */
  const [coinsRaw] = useStoredValue('popcorn-coins', '0')
  const [pawRaw, storePaw] = useStoredValue(PAW_KEY, DEFAULT_PAW)
  const [ownedRaw, storeOwned] = useStoredValue(OWNED_KEY, JSON.stringify([DEFAULT_PAW]))
  const [leadersRaw] = useStoredValue(LEADERS_KEY, '[]')
  const [upgRaw, storeUpgrades] = useStoredValue(UPG_KEY, JSON.stringify({ capacity: 0, life: 0, startperk: 0 }))
  const [achRaw] = useStoredValue(ACH_KEY, '[]')
  const [nameRaw, storeName] = useStoredValue(NAME_KEY, 'Котик')
  const [nickSetRaw, storeNickSet] = useStoredValue(NICKSET_KEY, '0')
  const [nickEdit, setNickEdit] = useState(false)
  const [overlay, setOverlay] = useState<
    'leaders' | 'shop' | 'creators' | 'rules' | 'ach' | 'settings' | 'install' | 'tree' | null
  >(null)
  const [achToast, setAchToast] = useState<{ icon: string; name: string } | null>(null)
  const [shareNote, setShareNote] = useState<string | null>(null)
  /* Мировая статистика: счётчик запусков/забегов/котиков (null — офлайн или ещё грузится) */
  const [worldStats, setWorldStats] = useState<{
    launches: number
    runs: number
    players: number
  } | null>(null)
  const installRef = useRef<InstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  /** Игра уже работает как установленное приложение (standalone/fullscreen) */
  const [isStandalone, setIsStandalone] = useState(false)
  /* Древо улучшений: купленные узлы (localStorage + событие магазина) */
  const [treeRaw] = useStoredValue(TREE_KEY, '{}')
  const tree = useMemo(() => parseTreeRaw(treeRaw), [treeRaw])
  const treeRef = useRef(tree)
  /** Доступные очки древа: уровень котика − потрачено */
  const treePts = useMemo(
    () => treePoints(Math.max(0, Number(totalRaw) || 0), treeSpent(tree)),
    [tree, totalRaw],
  )

  const xp = Math.max(0, Number(xpRaw) || 0)
  const coins = Math.max(0, Number(coinsRaw) || 0)
  /** Уровень котика и прогресс внутри уровня */
  const charInfo = useMemo(() => charLevelProgress(Math.max(0, Number(totalRaw) || 0)), [totalRaw])
  const equippedPaw: PawId = PAW_MAP[pawRaw as PawId] ? (pawRaw as PawId) : DEFAULT_PAW
  const upgrades = useMemo<UpgradeState>(() => parseUpgrades(upgRaw), [upgRaw])
  const unlockedAch = useMemo<AchId[]>(() => {
    try {
      const v: unknown = JSON.parse(achRaw)
      return Array.isArray(v) ? (v as AchId[]) : []
    } catch {
      return []
    }
  }, [achRaw])
  const ownedPaws = useMemo<PawId[]>(() => {
    try {
      const v: unknown = JSON.parse(ownedRaw)
      return Array.isArray(v) && v.includes(DEFAULT_PAW) ? (v as PawId[]) : [DEFAULT_PAW]
    } catch {
      return [DEFAULT_PAW]
    }
  }, [ownedRaw])
  const leaders = useMemo<LeaderEntry[]>(() => {
    try {
      const v: unknown = JSON.parse(leadersRaw)
      return Array.isArray(v) ? (v as LeaderEntry[]) : []
    } catch {
      return []
    }
  }, [leadersRaw])

  /* Функция перевода текущего языка */
  const t = useMemo(() => tFor(settings.lang), [settings.lang])

  /* Скрытые dev-параметры URL: ?fast=1 (короткая норма), ?perk=rot180 (гарантированный перк),
     ?fever=1 (лихорадка после каждого уровня — для проверки) */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    devRef.current = {
      fast: sp.has('fast'),
      forced: (sp.get('perk') as PerkId | null) ?? null,
      fever: sp.has('fever'),
    }
  }, [])

  /* Настройки → ref + движок (язык, сложность, качество, отклик). Сам стор
     сохраняет в localStorage уже при записи — эффект только применяет к движку */
  useEffect(() => {
    settingsRef.current = settings
    engineRef.current?.setOptions({
      difficulty: settings.difficulty,
      quality: settings.quality,
      shake: settings.shake,
      vibration: settings.vibration,
      colorblind: settings.colorblind,
      pigeon: settings.pigeon,
    })
    engineRef.current?.setLang(settings.lang)
    /* Громкость музыки и звуков из настроек — живой эффект, без перезагрузки */
    audio.setVolumes(settings.volumeMusic, settings.volumeSfx)
  }, [settings])

  /* Счётчик мировых запусков: один раз за открытие страницы.
     Без сети/базы просто не учитывается — игра работает офлайн. */
  const sessionCountedRef = useRef(false)
  useEffect(() => {
    if (sessionCountedRef.current) return
    sessionCountedRef.current = true
    fetch('/api/sessions', { method: 'POST' })
      .then((r) => r.json())
      .then(
        (d: {
          ok?: boolean
          stats?: { launches: number; runs: number; players: number }
        }) => {
          if (d?.stats) setWorldStats(d.stats)
        },
      )
      .catch(() => {})
  }, [])

  /* ===== Куница NANA: растёт от пройденных уровней и времени в игре ===== */
  const marten = useSyncExternalStore(subscribeMarten, getMartenSnapshot, () => DEFAULT_MARTEN)
  const [martenCheer, setMartenCheer] = useState(false)
  const martenStage = stageOf(marten)
  /* Секунды забега копятся в ref и периодически сбрасываются в копилку роста */
  const playSecsRef = useRef(0)

  /** Добавить прогресс куницы; при переходе на новую стадию — праздничная плашка */
  const growMarten = useCallback((lv: number, sec: number) => {
    const before = stageOf(getMartenSnapshot())
    const next = addMartenProgress(lv, sec)
    if (stageOf(next) > before) {
      setMartenCheer(true)
      window.setTimeout(() => setMartenCheer(false), 4000)
    }
  }, [])

  /* Таймер времени в игре: +1 сек, каждые 20 сек — флеш в копилку куницы */
  useEffect(() => {
    if (phase !== 'playing') return
    const iv = window.setInterval(() => {
      playSecsRef.current += 1
      if (playSecsRef.current >= 20) {
        growMarten(0, playSecsRef.current)
        playSecsRef.current = 0
      }
    }, 1000)
    return () => window.clearInterval(iv)
  }, [phase, growMarten])

  /* Финальный флеш при уходе со страницы */
  useEffect(
    () => () => {
      if (playSecsRef.current > 0) addMartenProgress(0, playSecsRef.current)
    },
    [],
  )

  /* Синхронизируем состояние звука с аудио-движком (внешняя система) */
  useEffect(() => {
    mutedRef.current = muted
    audio.setMuted(muted)
  }, [muted])

  /* Музыка в меню: заглавная тема «Попкорн и кот». Автозвук браузеры
     разрешают только после жеста — ждём первого касания/клавиши. */
  useEffect(() => {
    if (phase !== 'start') return
    const kick = () => {
      audio.ensure()
      audio.setMuted(mutedRef.current)
      if (!audio.musicPlaying) audio.startMusic('menu')
    }
    window.addEventListener('pointerdown', kick)
    window.addEventListener('keydown', kick)
    return () => {
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
    }
  }, [phase])

  /* Предзагрузка фонов всех комнат — смена локации мгновенная и без рывков */
  useEffect(() => {
    for (const r of ROOMS) {
      const img = new window.Image()
      img.src = r.src
    }
  }, [])

  /* Надетая лапка — в ref для колбэков без перезапуска эффектов */
  useEffect(() => {
    equippedRef.current = equippedPaw
  }, [equippedPaw])

  /** Блокировка ориентации экрана во время игры (настройка, где поддерживается) */
  const lockOrientation = useCallback((o: Orientation) => {
    try {
      if (o === 'auto') return
      const so = window.screen?.orientation as
        | (ScreenOrientation & { lock?: (x: string) => Promise<void> })
        | undefined
      void so?.lock?.(o)?.catch?.(() => {})
    } catch {
      /* блокировка не поддерживается — играем как есть */
    }
  }, [])

  const unlockOrientation = useCallback(() => {
    try {
      window.screen?.orientation?.unlock?.()
    } catch {
      /* не поддерживается — не страшно */
    }
  }, [])

  /* Раскладка холста с учётом трансформации перка (ротация/зеркало) */
  const applyLayout = useCallback(() => {
    const main = mainRef.current
    const canvas = canvasRef.current
    if (!main || !canvas) return
    const cw = main.clientWidth
    const ch = main.clientHeight
    if (cw === 0 || ch === 0) return
    const tr = transformRef.current
    const rot90 = tr === 'rot90'
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
        tr === 'rot180' ? 'rotate(180deg)' : tr === 'mirror' ? 'scaleX(-1)' : 'none'
    }
  }, [])

  useEffect(() => {
    layoutRef.current = applyLayout
  }, [applyLayout])

  /** Случайные перки для сундучков с учётом настроек (проклятья/бонусы можно выключить) */
  const rollOffers = useCallback((n: number, force?: PerkId): PerkDef[] => {
    const s = settingsRef.current
    return rollPerkOffer(n, force, (p) => (p.curse ? s.perksCurse : s.perksBonus))
  }, [])

  /** Открыть достижения с тостом и фанфарой */
  const announceAch = useCallback(
    (ids: AchId[]) => {
      if (ids.length === 0) return
      const fresh = unlockMany(ids)
      if (fresh.length === 0) return
      const def = ACH_MAP[fresh[0]]
      setAchToast({ icon: def.icon, name: t(`ach.${fresh[0]}.name`) })
      audio.play('record')
      window.setTimeout(() => setAchToast(null), 3200)
    },
    [t],
  )

  /** Начислить дельту очков в банк опыта сразу — очки попкорна = опыт.
      Та же дельта (без минуса) капает в суммарный стаж котика. */
  const addXpDelta = useCallback((delta: number) => {
    if (!delta) return
    const cur = Math.max(0, Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0)
    const next = Math.max(0, Math.floor(cur + delta))
    window.localStorage.setItem(XP_KEY, String(next))
    if (delta > 0) {
      const tot = Math.max(0, Number(window.localStorage.getItem(TOTAL_KEY) ?? 0) || 0)
      window.localStorage.setItem(TOTAL_KEY, String(Math.floor(tot + delta)))
    }
    window.dispatchEvent(new Event(STORE_EVENT))
  }, [])

  /** Награда за пройденный этап: опыт стажа котика + горсть монеток.
      Если уровень персонажа вырос — праздничный тост. */
  const awardStage = useCallback((lvl: number) => {
    const before = charLevel(getTotalXp())
    /* Награда за этап — с нулями: опыт ×10, монетки ×10 (и цены в магазине тоже) */
    addTotalXp(100 + lvl * 10)
    addCoins(120)
    const after = charLevel(getTotalXp())
    if (after > before) {
      setCharToast(after)
      audio.play('record')
      window.setTimeout(() => setCharToast(null), 3400)
    }
  }, [])

  /** Случайный подарок в каждом из трёх сундуков (или null — просто перк) */
  const rollExtras = useCallback((): Array<ChestExtra | null> => {
    return [0, 1, 2].map(() => {
      const r = Math.random()
      if (r < 0.3) {
        return { kind: 'coins' as const, n: [150, 250, 400][Math.floor(Math.random() * 3)] ?? 150 }
      }
      if (r < 0.55) {
        return { kind: 'xp' as const, n: [250, 600, 1200][Math.floor(Math.random() * 3)] ?? 250 }
      }
      return null
    })
  }, [])

  /* Древо улучшений: при покупке узла сразу перекидываем бонусы в движок */
  useEffect(() => {
    treeRef.current = tree
    engineRef.current?.setTree(treeBonuses(tree))
  }, [tree])

  /* PWA: ловим событие установки и регистрируем service worker (только прод) */
  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      installRef.current = e as InstallPromptEvent
      setCanInstall(true)
    }
    /* Установили — прячем кнопку: игра уже открывается из иконки на устройстве */
    const onInstalled = () => {
      installRef.current = null
      setCanInstall(false)
      setIsStandalone(true)
    }
    const nav = window.navigator as Navigator & { standalone?: boolean }
    const mq = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)')
    const syncMode = () => setIsStandalone(mq.matches || nav.standalone === true)
    syncMode()
    mq.addEventListener?.('change', syncMode)
    window.addEventListener('beforeinstallprompt', onBip)
    window.addEventListener('appinstalled', onInstalled)
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
      mq.removeEventListener?.('change', syncMode)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    const ev = installRef.current
    if (!ev) return
    audio.play('click')
    void ev.prompt()
    const choice = await ev.userChoice
    if (choice.outcome === 'accepted') {
      installRef.current = null
      setCanInstall(false)
    }
  }, [])

  /* Инициализация движка */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new PopcornEngine(canvas, {
      onStats: (s) => {
        setStats(s)
        /* Очки = опыт: зачисляем каждую положительную дельту счёта в банк сразу,
           чтобы магазин лапок работал уже между уровнями. Отрицательные дельты
           (мины, сгоревшая Лихорадка) бьют по СЧЁТУ, но не по валюте —
           опыт — стаж, он не сгорает */
        const delta = s.score - lastScoreRef.current
        lastScoreRef.current = s.score
        if (delta > 0) addXpDelta(delta)
        /* HTML-индикатор «ВОЛНА N»: поверх тумана и любых тёмных комнат.
           Таймер держим в ref: новая волна перезапускает тост, а старый
           таймаут не гасит его раньше времени */
        if (s.wave > 1 && s.wave !== waveShownRef.current) {
          waveShownRef.current = s.wave
          setWaveToast(s.wave)
          if (waveTimerRef.current) window.clearTimeout(waveTimerRef.current)
          waveTimerRef.current = window.setTimeout(() => setWaveToast(null), 1900)
        }
        /* Достижения по ходу забега */
        const cand: AchId[] = []
        if (s.goldenCount > 0) cand.push('golden1')
        if (s.streak >= 10) cand.push('combo10')
        if (s.pigeonShooed > 0) cand.push('pigeon1')
        if ((Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0) >= 10000) cand.push('rich1k')
        if (cand.length > 0) announceAch(cand)
      },
      onLevelComplete: (r) => {
        /* Куница NANA: уровень пройден — +1 к росту (плюс накопленные секунды) */
        growMarten(1, playSecsRef.current)
        playSecsRef.current = 0
        /* Награда за этап: опыт стажа котика + горсть монеток (мета-прогресс) */
        awardStage(r.level)
        /* ЛИХОРАДКА: случайный бонусный уровень (шанс 25%, не раньше 2-го;
           ?fever=1 — всегда). Вместо сундучка — 3 секунды безумного сбора,
           потом сразу следующий обычный уровень */
        if ((devRef.current.fever || Math.random() < 0.25) && r.level >= 2) {
          setPerk(null)
          transformRef.current = 'none'
          const cv = canvasRef.current
          if (cv) cv.style.filter = ''
          layoutRef.current()
          engineRef.current?.startFever(r.level + 1)
          setPhase('playing')
          return
        }
        setClearInfo({ level: r.level, bonus: r.bonus })
        setOffers(rollOffers(3, devRef.current.forced ?? undefined))
        setExtras(rollExtras())
        setOpenedIdx(null)
        setRunLevel(r.level + 1)
        setPhase('chest')
      },
      onFeverEnd: (r) => {
        /* После лихорадки — обычный уровень: сбрасываем перк и трансформации */
        setPerk(null)
        transformRef.current = 'none'
        const cv = canvasRef.current
        if (cv) cv.style.filter = ''
        layoutRef.current()
        /* Монетки за успех: чем больше очков — тем щедрее награда */
        if (r.success) {
          const coins = Math.max(100, Math.round(r.gained / 3))
          addCoins(coins)
          setFeverCoins(coins)
          window.setTimeout(() => setFeverCoins(null), 3200)
        }
      },
      onEnd: (r) => {
        /* Куница NANA: фиксируем время забега (уровни уже учтены по ходу) */
        growMarten(0, playSecsRef.current)
        playSecsRef.current = 0
        const prevBest = Number(window.localStorage.getItem(BEST_KEY) ?? 0)
        const record = r.score > prevBest
        if (record) {
          storeBest(String(r.score))
          window.setTimeout(() => audio.play('record'), 700)
        }
        /* Опыт уже зачислен по ходу забега (onStats) — здесь только список лидеров */
        const entry: LeaderEntry = { score: r.score, level: r.level, date: Date.now() }
        let list: LeaderEntry[] = []
        try {
          const parsed: unknown = JSON.parse(window.localStorage.getItem(LEADERS_KEY) ?? '[]')
          if (Array.isArray(parsed)) list = parsed as LeaderEntry[]
        } catch {
          list = []
        }
        list.push(entry)
        list.sort((a, b) => b.score - a.score)
        list = list.slice(0, 10)
        window.localStorage.setItem(LEADERS_KEY, JSON.stringify(list))
        window.dispatchEvent(new Event(STORE_EVENT))
        /* Достижения конца забега */
        const cand: AchId[] = []
        if (r.score >= 1000) cand.push('score100')
        if (r.level >= 5) cand.push('level5')
        if (r.level >= 10) cand.push('level10')
        announceAch(cand)
        /* «Девятая жизнь»: если апгрейд куплен и ещё не потрачен — предлагаем второй шанс */
        const ups = parseUpgrades(window.localStorage.getItem(UPG_KEY))
        const canRevive = ups.life > 0 && !(engineRef.current?.lifeSpent ?? true)
        /* Мировая таблица: отправляем только финальный забег */
        if (!canRevive) {
          const name = (window.localStorage.getItem(NAME_KEY) || 'Котик').trim() || 'Котик'
          void fetch('/api/leaders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score: r.score, level: r.level }),
          }).catch(() => {})
        }
        setResult({ score: r.score, level: r.level, record, rank: list.indexOf(entry), canRevive })
        setPhase('ended')
      },
    })
    engineRef.current = engine
    ;(window as unknown as { __popcornEngine?: PopcornEngine }).__popcornEngine = engine
    /* Применяем сохранённые настройки сразу после создания движка */
    const s = settingsRef.current
    engine.setOptions({
      difficulty: s.difficulty,
      quality: s.quality,
      shake: s.shake,
      vibration: s.vibration,
      colorblind: s.colorblind,
      pigeon: s.pigeon,
    })
    engine.setLang(s.lang)
    /* Древо улучшений: применяем купленные узлы к движку */
    engine.setTree(treeBonuses(treeRef.current))
    layoutRef.current()

    return () => {
      engine.destroy()
      engineRef.current = null
      delete (window as unknown as { __popcornEngine?: PopcornEngine }).__popcornEngine
    }
  }, [storeBest, addXpDelta, announceAch, rollExtras, rollOffers, growMarten, awardStage])

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
     rot90 — мир повёрнут с заменой измерений, поэтому даём развёрнутую инверсию.

     ПЕРФ: getBoundingClientRect на каждый pointermove заставлял браузер
     пересчитывать layout 60–120 раз в секунду — главная причина лагов лапки
     на телефонах. Меряем точную рамку только на pointerdown и ресайзе,
     между ними берём кэш. */
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const onPointer = (e: PointerEvent) => {
      const eng = engineRef.current
      if (!eng) return
      /* Кнопки панели не должны двигать лапку */
      if (e.target instanceof Element && e.target.closest('button')) return
      let r = rectRef.current
      if (e.type === 'pointerdown' || !r) {
        r = main.getBoundingClientRect()
        rectRef.current = r
      }
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
    const onReflow = () => {
      rectRef.current = main.getBoundingClientRect()
    }
    main.addEventListener('pointerdown', onPointer)
    main.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('resize', onReflow)
    window.addEventListener('orientationchange', onReflow)
    return () => {
      main.removeEventListener('pointerdown', onPointer)
      main.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('orientationchange', onReflow)
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
     чтобы троттлинг таймеров не копил отставание аудио-планировщика.
     Музыку меню (фаза 'start') не трогаем — она тихая и не копит отставание. */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        if (engineRef.current?.phase !== 'playing') return
        audio.stopMusic()
        engineRef.current.setPaused(true)
        setPhase((p) => (p === 'playing' ? 'paused' : p))
      } else if (engineRef.current?.phase === 'playing') {
        audio.startMusic('game')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const startGame = useCallback(() => {
    setResult(null)
    setClearInfo(null)
    lastScoreRef.current = 0
    transformRef.current = 'none'
    const canvas = canvasRef.current
    if (canvas) canvas.style.filter = ''
    audio.ensure()
    audio.setMuted(mutedRef.current)
    audio.startMusic('game')
    audio.play('click')
    /* Постоянные апгрейды: вместимость — в движок, счастливый сундучок — случайный бонус-перк */
    const ups = parseUpgrades(window.localStorage.getItem(UPG_KEY))
    engineRef.current?.setUpgrades({ carryPlus: ups.capacity })
    let startPerk: PerkId | null = null
    if (ups.startperk > 0 && settingsRef.current.perksBonus) {
      const bonusPool = PERKS.filter((p) => !p.curse)
      startPerk = bonusPool[Math.floor(Math.random() * bonusPool.length)]?.id ?? null
    }
    engineRef.current?.setPawSkin(equippedRef.current)
    engineRef.current?.startRun({ fast: devRef.current.fast, perk: startPerk })
    setPerk(startPerk)
    lockOrientation(settingsRef.current.orientation)
    setPhase('playing')
  }, [lockOrientation])

  const beginLevel = useCallback(
    (lvl: number, perkId: PerkId | null) => {
      audio.ensure()
      audio.setMuted(mutedRef.current)
      audio.startMusic('game')
      audio.play('click')
      transformRef.current = transformFor(perkId)
      const canvas = canvasRef.current
      if (canvas) {
        canvas.style.filter = perkId === 'grayscale' ? 'grayscale(1) contrast(1.05)' : ''
      }
      layoutRef.current()
      engineRef.current?.startLevel(lvl, perkId)
      setPerk(perkId)
      lockOrientation(settingsRef.current.orientation)
      setPhase('playing')
    },
    [lockOrientation],
  )

  const resumeGame = useCallback(() => {
    audio.play('click')
    audio.startMusic('game')
    engineRef.current?.setPaused(false)
    setPhase('playing')
  }, [])

  const pauseGame = useCallback(() => {
    audio.play('click')
    audio.stopMusic()
    engineRef.current?.setPaused(true)
    setPhase('paused')
  }, [])

  /** «КОНЕЦ ИГРЫ»: сразу в меню. Собранный попкорн уже лежит в банке опыта. */
  const quitToMenu = useCallback(() => {
    audio.play('click')
    engineRef.current?.abort() // останавливает игровую музыку
    audio.startMusic('menu') // возвращаем заглавную тему (жест пользователя уже есть)
    setResult(null)
    setClearInfo(null)
    setPerk(null)
    setOpenedIdx(null)
    transformRef.current = 'none'
    const canvas = canvasRef.current
    if (canvas) canvas.style.filter = ''
    unlockOrientation()
    layoutRef.current()
    setPhase('start')
  }, [unlockOrientation])

  const toggleMute = useCallback(() => {
    storeMuted(muted ? '0' : '1')
  }, [muted, storeMuted])

  /** «Девятая жизнь»: продолжить проваленный забег (+15 секунд) */
  const reviveRun = useCallback(() => {
    audio.ensure()
    audio.setMuted(mutedRef.current)
    audio.startMusic('game')
    audio.play('click')
    if (engineRef.current?.revive()) {
      setPhase('playing')
    }
  }, [])

  /** Сохранить ник (первый вход или смена в меню) */
  const handleNickDone = useCallback(
    (name: string) => {
      storeName(name)
      storeNickSet('1')
      audio.play('perk')
      setNickEdit(false)
    },
    [storeName, storeNickSet],
  )

  /** Поделиться рекордом: карточка-картинка, а на ПК — копирование текста */
  const handleShare = useCallback(async () => {
    if (!result) return
    audio.play('click')
    const r = await shareResult(result.score, result.level, best, t)
    if (r === 'copied') setShareNote(t('share.copied'))
    else if (r === 'shared') setShareNote(t('share.sent'))
    else setShareNote(t('share.fail'))
    window.setTimeout(() => setShareNote(null), 2600)
  }, [result, best, t])

  const openChest = useCallback(
    (i: number) => {
      audio.play('chest')
      setOpenedIdx(i)
      /* Подарок из сундука: монетки или опыт — начисляем сразу */
      const ex = extras[i]
      if (ex) {
        if (ex.kind === 'coins') addCoins(ex.n)
        else addTotalXp(ex.n)
      }
      window.setTimeout(() => audio.play('perk'), 380)
    },
    [extras],
  )

  /** Надеть купленную лапку (действует и в текущем забеге) */
  const equipPaw = useCallback(
    (id: PawId) => {
      if (!ownedPaws.includes(id)) return
      audio.play('click')
      storePaw(id)
      engineRef.current?.setPawSkin(id)
    },
    [ownedPaws, storePaw],
  )

  /** Покупка лапки: за опыт 🍿 или монетки 🪙 (артефактные лапки — за монетки) */
  const buyPaw = useCallback(
    (def: PawDef) => {
      if (ownedPaws.includes(def.id)) {
        equipPaw(def.id)
        return
      }
      const coins = (def.currency ?? 'xp') === 'coins'
      if (coins) {
        /* Артефактная лапка: монетки падают из сундучков и Лихорадки */
        if (getCoins() < def.price) {
          audio.play('penalty')
          return
        }
        addCoins(-def.price)
      } else {
        /* Читаем банк прямо из localStorage: очки капают в него в реальном времени */
        const bank = Math.max(0, Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0)
        if (bank < def.price) {
          audio.play('penalty')
          return
        }
        storeXp(String(bank - def.price))
      }
      audio.play('perk')
      const nextOwned = [...ownedPaws, def.id]
      storeOwned(JSON.stringify(nextOwned))
      storePaw(def.id)
      engineRef.current?.setPawSkin(def.id)
      announceAch(['shopper'])
      if (nextOwned.length >= 5) announceAch(['collector'])
    },
    [ownedPaws, storeXp, storeOwned, storePaw, equipPaw, announceAch],
  )

  /** Покупка постоянного апгрейда за опыт */
  const buyUpgrade = useCallback(
    (id: UpgradeId) => {
      const def = UPGRADE_MAP[id]
      const state = parseUpgrades(window.localStorage.getItem(UPG_KEY))
      const level = state[id]
      if (level >= def.prices.length) return
      const cost = def.prices[level]
      const bank = Math.max(0, Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0)
      if (bank < cost) {
        audio.play('penalty')
        return
      }
      audio.play('perk')
      storeXp(String(bank - cost))
      storeUpgrades(JSON.stringify({ ...state, [id]: level + 1 }))
      /* Вместимость подействует с нового забега; жизнь и старт-перк — сразу */
      announceAch(['upgrade1'])
    },
    [storeXp, storeUpgrades, announceAch],
  )

  const sec = Math.ceil(stats.timeLeft)
  const urgent = sec <= 10
  const onLevel = phase === 'playing' || phase === 'paused'
  const quotaPct = Math.min(100, (stats.collected / Math.max(1, stats.quota)) * 100)
  const chosen: PerkDef | null = openedIdx !== null ? (offers[openedIdx] ?? null) : null
  /** Подарок выбранного сундука: монетки или опыт */
  const chosenExtra: ChestExtra | null =
    openedIdx !== null ? (extras[openedIdx] ?? null) : null
  const activePerk = perk ? PERK_MAP[perk] : null
  /* Локация уровня: в меню — кинозал, в игре — комната по номеру уровня */
  const activeRoom = roomForLevel(stats.level)
  const roomSrc = phase === 'start' ? ROOMS[0].src : roomSrcForLevel(stats.level)
  /* Яркость/контраст из настроек: применяем фильтр только если он не 100% */
  const needsFilter =
    Math.abs(settings.brightness - 1) > 0.001 || Math.abs(settings.contrast - 1) > 0.001

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-[#1d110b] select-none"
      style={needsFilter ? { filter: `brightness(${settings.brightness}) contrast(${settings.contrast})` } : undefined}
    >
      {/* Панель статистики НАД игровой зоной: поле остаётся чистым */}
      {onLevel && (
        <div className="relative z-30 flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-[#160c07] px-2 pb-1.5 pt-[max(0.45rem,env(safe-area-inset-top))]">
          <StatPill className="font-pixel text-[13px]">
            <Popcorn className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            <span className="tabular-nums">{stats.score}</span>
          </StatPill>
          <StatPill>
            <span aria-hidden>🥤</span>
            <span className="tabular-nums">
              {stats.collected}/{stats.quota}
            </span>
            <span className="relative h-1.5 w-9 overflow-hidden rounded-full bg-white/15">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-amber-300 transition-[width] duration-200"
                style={{ width: `${quotaPct}%` }}
              />
            </span>
          </StatPill>
          <StatPill>
            <span aria-hidden>🐾</span>
            <span className="tabular-nums">
              {stats.carrying}/{stats.carryMax}
            </span>
          </StatPill>
          {stats.shields > 0 && (
            <StatPill aria-label={t('hud.shields', { n: stats.shields })}>
              <span aria-hidden>🛡️</span>
              <span className="font-pixel tabular-nums">×{stats.shields}</span>
            </StatPill>
          )}
          {stats.comboMult > 1 && (
            <StatPill className="border-amber-300/60 text-amber-200">
              <span aria-hidden>🔥</span>
              <span className="font-pixel tabular-nums">×{stats.comboMult}</span>
              <span className="text-[10px] opacity-80">
                {t('hud.streak', { n: stats.streak })}
              </span>
            </StatPill>
          )}
          <StatPill className={urgent ? 'animate-pulse border-red-400/60 text-red-200' : ''}>
            <Timer className={`h-3.5 w-3.5 ${urgent ? 'text-red-400' : 'text-amber-300'}`} aria-hidden />
            <span className="tabular-nums">{sec}</span>
          </StatPill>
          <StatPill className="font-pixel">{t('hud.level', { n: stats.level })}</StatPill>
          {stats.fever && (
            <StatPill className="animate-pulse border-amber-300/80 bg-amber-400/20 text-amber-200">
              <span className="font-pixel tabular-nums">
                {t('hud.fever', { n: stats.feverGained })}
              </span>
            </StatPill>
          )}
          <StatPill className="max-w-40 sm:max-w-none">
            <span aria-hidden>{activeRoom.icon}</span>
            <span className="truncate">{t(`room.${activeRoom.id}.name`)}</span>
          </StatPill>
          {activePerk && (
            <StatPill
              className={
                activePerk.curse
                  ? 'border-red-400/50 text-red-200'
                  : 'border-emerald-300/50 text-emerald-200'
              }
            >
              <span aria-hidden>{activePerk.icon}</span>
              <span className="max-w-40 leading-tight sm:max-w-none">{t(`perk.${activePerk.id}.name`)}</span>
            </StatPill>
          )}
          <span className="ml-auto flex items-center gap-1.5">
            {phase === 'playing' && (
              <IconBtn size="sm" onClick={pauseGame} label={t('hud.pause')}>
                <Pause className="h-4 w-4" aria-hidden />
              </IconBtn>
            )}
            <IconBtn size="sm" onClick={toggleMute} label={muted ? t('hud.unmute') : t('hud.mute')}>
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden />
              )}
            </IconBtn>
            {phase === 'playing' && (
              <button
                type="button"
                onClick={quitToMenu}
                className="rounded-lg border-2 border-red-300/50 bg-black/60 px-2 py-1.5 font-pixel text-[10px] font-bold text-red-200 transition hover:bg-black/80 active:scale-95"
              >
                {t('quit.short')}
              </button>
            )}
          </span>
        </div>
      )}

      <main
        ref={mainRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        aria-label={t('main.aria')}
      >
        {/* Фон — комната уровня: 8 локаций с кроссфейдом при смене */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={roomSrc}
              className="absolute inset-0 scale-105 bg-cover bg-center"
              style={{ backgroundImage: `url('${roomSrc}')` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          </AnimatePresence>
        </div>
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

        {/* CRT-развёртка (настройка): чистый CSS поверх канваса — канвас
            и игровой цикл не трогаем, рисует композитор GPU бесплатно */}
        {settings.crt && <div aria-hidden className="popcorn-crt pointer-events-none absolute inset-0 z-20" />}

        {/* Индикатор «ВОЛНА N»: HTML поверх канваса — виден сквозь попкорновый
            туман и любую темноту (туман рисуется внутри канваса) */}
        <AnimatePresence>
          {waveToast !== null && (phase === 'playing' || phase === 'paused') && (
            <motion.div
              key={`wave-${waveToast}`}
              className="pointer-events-none absolute inset-x-0 top-14 z-20 flex justify-center"
              initial={{ opacity: 0, y: -18, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              <span className="text-shadow-pixel rounded-full border-2 border-amber-300/70 bg-[#2b1a0e]/85 px-4 py-1.5 font-pixel text-lg font-bold text-amber-200 shadow-[0_6px_20px_rgba(0,0,0,0.5)]">
                🌊 {t('banner.wave', { n: waveToast })}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD в меню (вне забега): рекорд слева сверху */}
        {phase === 'start' && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-start p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <Pill>
              <Trophy className="h-4 w-4 text-amber-300" aria-hidden />
              <span className="font-pixel text-base tabular-nums">{best}</span>
            </Pill>
          </div>
        )}

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
                {/* Живая куница NANA: играет с попкорном, растёт с прогрессом игрока */}
                <div className="relative mx-auto w-full max-w-[21rem]">
                  <MartenScene
                    stage={martenStage}
                    ariaLabel={t('marten.aria')}
                    className="h-44 w-full rounded-2xl border-4 border-[#E24B3B] bg-[#FFF0D8] shadow-lg sm:h-52"
                  />
                  {/* Стадия и прогресс до следующего роста */}
                  <div
                    className="mt-2 flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 ring-2 ring-amber-200"
                    title={t('marten.growHint')}
                  >
                    <span aria-hidden className="text-sm">🐾</span>
                    <span className="font-ui text-[11px] font-bold text-[#8a5330]">
                      {t('marten.title')} · {t(`marten.st${martenStage}`)}
                    </span>
                    <span className="ml-auto h-2 w-20 overflow-hidden rounded-full bg-[#e3cba4]">
                      <span
                        className="block h-full rounded-full bg-[#E24B3B] transition-all duration-700"
                        style={{ width: `${Math.round(progressToNext(marten) * 100)}%` }}
                      />
                    </span>
                  </div>
                  <AnimatePresence>
                    {martenCheer && (
                      <motion.div
                        className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center"
                        initial={{ opacity: 0, y: -8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8 }}
                      >
                        <span className="rounded-full bg-[#E24B3B] px-3 py-1.5 font-pixel text-[10px] font-bold text-white shadow-lg">
                          {t('marten.levelUp')}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <h1 className="text-shadow-pixel mt-2.5 font-pixel text-2xl font-bold leading-tight text-[#B33A26] sm:text-3xl">
                  {t('app.title')}
                </h1>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330] sm:text-sm">
                  {t('app.tagline')}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                  {best > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200">
                      <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                      {t('menu.record', { n: best })}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200">
                    <Popcorn className="h-4 w-4 text-amber-500" aria-hidden />
                    {t('menu.xp', { n: xp })}
                  </div>
                  {/* Стаж котика: мета-прогресс — уровень + тонкая полоска внутри уровня */}
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200"
                    aria-label={t('menu.charLevel', { n: charInfo.level })}
                    title={t('menu.charLevelHint')}
                  >
                    {t('menu.charLevel', { n: charInfo.level })}
                    <span
                      aria-hidden
                      className="h-1.5 w-14 max-w-32 min-w-6 overflow-hidden rounded-full bg-[#3a2210]"
                    >
                      <span
                        className="block h-full rounded-full bg-amber-200 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.round((charInfo.into / Math.max(1, charInfo.need)) * 100))}%`,
                        }}
                      />
                    </span>
                  </div>
                  {worldStats && (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200"
                      title={t('lead.stats', {
                        n: worldStats.launches,
                        r: worldStats.runs,
                        p: worldStats.players,
                      })}
                    >
                      {t('menu.worldLaunches', { n: worldStats.launches })}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200">
                    <PawPrint className="h-4 w-4 text-amber-500" aria-hidden />
                    {t(`paw.${equippedPaw}.name`)}
                  </div>
                  {/* Ник для мировой таблицы: тап — сменить */}
                  <button
                    type="button"
                    onClick={() => {
                      audio.play('click')
                      setNickEdit(true)
                    }}
                    title={t('nick.editHint')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200 transition hover:bg-amber-200 active:scale-95"
                  >
                    <Cat className="h-4 w-4 text-amber-500" aria-hidden />
                    <span className="max-w-28 truncate">{nameRaw}</span>
                    <Pencil className="h-3 w-3 opacity-60" aria-hidden />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-[1.5fr_1fr] gap-2">
                  <GameButton onClick={startGame}>{t('menu.play')}</GameButton>
                  <button
                    type="button"
                    onClick={() => setOverlay('rules')}
                    className="rounded-xl border-[3px] border-[#8a5330] bg-[#f3e2c8] px-2 py-3 font-pixel text-sm font-bold text-[#8a5330] shadow-[0_5px_0_#c9a97a] transition-all hover:bg-[#eed7b4] active:translate-y-[3px] active:shadow-[0_2px_0_#c9a97a] sm:text-base"
                  >
                    {t('menu.rules')}
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  <MenuSmallBtn
                    onClick={() => setOverlay('leaders')}
                    icon={<Trophy className="h-4 w-4" aria-hidden />}
                  >
                    {t('menu.leaders')}
                  </MenuSmallBtn>
                  <MenuSmallBtn
                    onClick={() => setOverlay('shop')}
                    icon={<PawPrint className="h-4 w-4" aria-hidden />}
                  >
                    {t('menu.paws')}
                  </MenuSmallBtn>
                  <MenuSmallBtn
                    onClick={() => setOverlay('ach')}
                    icon={<span aria-hidden className="text-sm">🏅</span>}
                  >
                    {t('menu.ach')}
                  </MenuSmallBtn>
                  <MenuSmallBtn
                    onClick={() => setOverlay('creators')}
                    icon={<Heart className="h-4 w-4" aria-hidden />}
                  >
                    {t('menu.creators')}
                  </MenuSmallBtn>
                </div>

                {/* Древо улучшений: отдельная заметная кнопка с бейджем очков */}
                <button
                  type="button"
                  onClick={() => {
                    audio.play('click')
                    setOverlay('tree')
                  }}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 font-pixel text-sm font-bold transition active:scale-[0.98] ${
                    treePts > 0
                      ? 'border-[#5C8A3A] bg-[#eaf3dd] text-[#3f6b28] shadow-[0_4px_0_#b9d29b] hover:bg-[#e0efcc] animate-pulse'
                      : 'border-[#8a5330] bg-[#f3e2c8] text-[#8a5330] shadow-[0_4px_0_#c9a97a] hover:bg-[#eed7b4]'
                  }`}
                >
                  <Network className="h-4 w-4" aria-hidden />
                  {t('menu.tree')}
                  {treePts > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5C8A3A] px-1 font-ui text-[11px] font-bold text-white">
                      {treePts}
                    </span>
                  )}
                </button>

                {/* Языки + настройки */}
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="grid flex-1 grid-cols-4 gap-1 rounded-xl bg-[#f3e2c8] p-1">
                    {LANGS.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          audio.play('click')
                          setSettings({ ...settings, lang: l.id })
                        }}
                        aria-label={l.label}
                        className={`rounded-lg px-1 py-1.5 font-pixel text-[11px] font-bold transition ${
                          settings.lang === l.id
                            ? 'bg-[#E24B3B] text-white shadow-[0_2px_0_#9c2f22]'
                            : 'text-[#8a5330] hover:bg-[#eed7b4]'
                        }`}
                      >
                        {l.flag} {l.id.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audio.play('click')
                      setOverlay('settings')
                    }}
                    aria-label={t('menu.settings')}
                    className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-95"
                  >
                    <Settings className="h-4.5 w-4.5" aria-hidden />
                  </button>
                </div>

                {!isStandalone && (
                  <button
                    type="button"
                    onClick={() => {
                      audio.play('click')
                      if (canInstall) {
                        void handleInstall()
                      } else {
                        setOverlay('install')
                      }
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                  >
                    <Smartphone className="h-4 w-4" aria-hidden /> {t('menu.install')}
                  </button>
                )}

                {/* Версия сборки: правый нижний угол меню — сразу видно, что на проде */}
                <span
                  aria-label={GAME_VERSION_LABEL}
                  className="pointer-events-none absolute bottom-0.5 right-2 font-ui text-[9px] font-semibold lowercase tracking-wide text-[#a97c50]/60 sm:bottom-1 sm:right-2.5"
                >
                  {GAME_VERSION_LABEL}
                </span>
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
                <h2 className="font-pixel text-2xl font-bold text-[#B33A26]">{t('pause.title')}</h2>
                <p className="mt-2 font-ui text-xs font-medium text-[#8a5330]">
                  {t('pause.info', {
                    l: stats.level,
                    s: stats.score,
                    c: stats.collected,
                    q: stats.quota,
                  })}
                </p>
                <div className="mt-5">
                  <GameButton onClick={resumeGame}>{t('pause.resume')}</GameButton>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audio.play('click')
                    setOverlay('settings')
                  }}
                  className="mt-2 w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                >
                  {t('menu.settings')}
                </button>
                <button
                  type="button"
                  onClick={quitToMenu}
                  className="mt-2 w-full rounded-xl px-4 py-1.5 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
                >
                  {t('quit.pauseMenu')}
                </button>
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
                  {t('chest.title', { n: clearInfo.level })}
                </h2>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                  {t('chest.bonus', { b: clearInfo.bonus, s: stats.score })}
                </p>
                {offers.length > 0 ? (
                  <>
                    <p className="mt-2 font-ui text-xs text-[#5C3A1E]">{t('chest.choose')}</p>
                    <div className="mt-3 flex items-end justify-center gap-2 sm:gap-4">
                      {offers.map((p, i) => {
                        const isOpen = openedIdx === i
                        const dimmed = openedIdx !== null && !isOpen
                        return (
                          <motion.button
                            key={p.id}
                            type="button"
                            aria-label={t('chest.openN', { n: i + 1 })}
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
                              {isOpen ? t('chest.opened') : t('chest.chest')}
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
                          <div className="flex min-w-0 items-center justify-center gap-2">
                            <span aria-hidden className="shrink-0 text-3xl">
                              {chosen.icon}
                            </span>
                            <div className="min-w-0 text-left">
                              <div className="break-words font-pixel text-base font-bold leading-snug text-[#5C3A1E] sm:text-lg">
                                {t(`perk.${chosen.id}.name`)}
                              </div>
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 font-ui text-[10px] font-bold ${
                                  chosen.curse
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-emerald-200 text-emerald-800'
                                }`}
                              >
                                {chosen.curse ? t('perk.tag.curse') : t('perk.tag.bonus')}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 font-ui text-xs leading-snug text-[#5C3A1E]">
                            {t(`perk.${chosen.id}.desc`)}
                          </p>
                          {/* Подарок из выбранного сундука: монетки или опыт */}
                          {chosenExtra && (
                            <p
                              className={`mt-2 rounded-xl px-2.5 py-1.5 font-ui text-[11px] font-bold leading-snug ${
                                chosenExtra.kind === 'coins'
                                  ? 'bg-amber-100 text-[#8a5a16]'
                                  : 'bg-sky-50 text-[#2b6a7c]'
                              }`}
                            >
                              {chosenExtra.kind === 'coins'
                                ? t('chest.bonusCoins', { n: chosenExtra.n })
                                : t('chest.bonusXp', { n: chosenExtra.n })}
                            </p>
                          )}
                          <p className="mt-1.5 font-ui text-[11px] text-[#8a5330]">
                            {t('chest.quotaInfo', {
                              n: runLevel,
                              q: Math.round(
                                quotaFor(runLevel, chosen.id === 'doublepoints') *
                                  (settings.difficulty === 'easy'
                                    ? 0.8
                                    : settings.difficulty === 'hard'
                                      ? 1.2
                                      : 1),
                              ),
                              s:
                                (chosen.id === 'timeplus' ? 75 : 60) +
                                (settings.difficulty === 'easy'
                                  ? 10
                                  : settings.difficulty === 'hard'
                                    ? -10
                                    : 0),
                            })}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Прозрачные сундуки: после выбора показываем, что лежало в остальных */}
                    {chosen && offers.length > 1 && (
                      <div className="mt-2.5 rounded-xl bg-[#f7e8cf] px-3 py-2 ring-1 ring-[#e3cba4]">
                        <p className="font-ui text-[10px] font-semibold uppercase tracking-wide text-[#a97c50]">
                          {t('chest.others')}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-stretch justify-center gap-1.5">
                          {offers.map((p, i) => {
                            if (i === openedIdx) return null
                            const ex = extras[i]
                            return (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#FFF6E6] px-2 py-1 ring-1 ring-[#e3cba4]"
                              >
                                <span aria-hidden className="text-sm">
                                  {p.icon}
                                </span>
                                <span className="max-w-36 break-words text-left font-ui text-[11px] font-semibold leading-snug text-[#5C3A1E]">
                                  {t(`perk.${p.id}.name`)}
                                </span>
                                {ex && (
                                  <span className="font-ui text-[10px] font-bold text-[#8a5330]">
                                    {ex.kind === 'coins' ? `+${ex.n}🪙` : `+${ex.n}🍿`}
                                  </span>
                                )}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-2 font-ui text-xs text-[#5C3A1E]">{t('chest.noperks')}</p>
                )}

                {chosen && (
                  <div className="mt-3 space-y-2">
                    <GameButton onClick={() => beginLevel(runLevel, chosen.id)}>
                      {t('chest.next', { n: runLevel })}
                    </GameButton>
                    <button
                      type="button"
                      onClick={() => setOverlay('shop')}
                      className="w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                    >
                      {t('chest.shop')}
                    </button>
                    <button
                      type="button"
                      onClick={quitToMenu}
                      className="w-full rounded-xl px-4 py-1.5 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
                    >
                      {t('quit.button')}
                    </button>
                  </div>
                )}
                {offers.length === 0 && (
                  <div className="mt-3 space-y-2">
                    <GameButton onClick={() => beginLevel(runLevel, null)}>
                      {t('chest.next', { n: runLevel })}
                    </GameButton>
                    <button
                      type="button"
                      onClick={quitToMenu}
                      className="w-full rounded-xl px-4 py-1.5 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
                    >
                      {t('quit.button')}
                    </button>
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
                  {t('over.title')}
                </h2>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                  {t('over.timeup', { n: result.level })}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Popcorn className="h-8 w-8 text-amber-500" aria-hidden />
                  <span className="font-pixel text-5xl font-bold tabular-nums text-[#5C3A1E]">
                    {result.score}
                  </span>
                </div>
                <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                  {t('over.points', { n: result.level })}
                </p>
                <p className="mt-1.5 font-ui text-xs font-bold text-[#5C3A1E]">
                  {t('over.xp', { s: result.score, t: xp })}
                </p>
                {result.rank >= 0 && result.rank < 10 && (
                  <p className="mt-1 font-ui text-xs font-bold text-[#B33A26]">
                    {t('over.rank', { n: result.rank + 1 })}
                  </p>
                )}

                {/* Имя для мировой таблицы лидеров */}
                <div className="mt-3 text-left">
                  <label
                    htmlFor="leader-name"
                    className="font-ui text-[10px] font-semibold text-[#8a5330]"
                  >
                    {t('over.nameLabel')}
                  </label>
                  <input
                    id="leader-name"
                    type="text"
                    inputMode="text"
                    maxLength={24}
                    value={nameRaw}
                    onChange={(e) => storeName(e.target.value.slice(0, 24))}
                    placeholder={t('nick.default')}
                    className="mt-1 w-full rounded-lg border-2 border-[#e3cba4] bg-white/70 px-2.5 py-1.5 font-ui text-sm text-[#5C3A1E] outline-none transition focus:border-amber-400"
                  />
                </div>

                {result.record ? (
                  <motion.div
                    className="mt-4 inline-block rounded-full bg-amber-400 px-4 py-2 font-ui text-xs font-bold text-[#5C3A1E] shadow-md"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9 }}
                  >
                    {t('over.newRecord')}
                  </motion.div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200">
                    <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                    {t('menu.record', { n: best })}
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  {result.canRevive && (
                    <GameButton onClick={reviveRun}>{t('over.revive')}</GameButton>
                  )}
                  <GameButton onClick={startGame}>
                    <span className="inline-flex items-center justify-center gap-2">
                      <RotateCcw className="h-5 w-5" aria-hidden /> {t('over.retry')}
                    </span>
                  </GameButton>
                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                  >
                    <Share2 className="h-4 w-4" aria-hidden /> {t('over.share')}
                  </button>
                  {shareNote && (
                    <p className="font-ui text-[11px] font-semibold text-emerald-700">{shareNote}</p>
                  )}
                  <button
                    type="button"
                    onClick={quitToMenu}
                    className="w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                  >
                    {t('over.menu')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Оверлеи меню: список лидеров / магазин / достижения / создатели / правила */}
        <AnimatePresence>
          {overlay === 'leaders' && (
            <LeadersOverlay
              leaders={leaders}
              myName={nameRaw}
              lang={settings.lang}
              t={t}
              onClose={() => setOverlay(null)}
            />
          )}
          {overlay === 'shop' && (
            <ShopOverlay
              xp={xp}
              coins={coins}
              owned={ownedPaws}
              equipped={equippedPaw}
              upgrades={upgrades}
              t={t}
              onBuy={buyPaw}
              onEquip={equipPaw}
              onBuyUpgrade={buyUpgrade}
              onClose={() => setOverlay(null)}
            />
          )}
          {overlay === 'ach' && (
            <AchievementsOverlay unlocked={unlockedAch} t={t} onClose={() => setOverlay(null)} />
          )}
          {overlay === 'creators' && <CreatorsOverlay t={t} onClose={() => setOverlay(null)} />}
          {overlay === 'rules' && <RulesOverlay t={t} onClose={() => setOverlay(null)} />}
          {overlay === 'install' && (
            <InstallOverlay
              t={t}
              canNative={canInstall}
              onNative={() => void handleInstall()}
              onClose={() => setOverlay(null)}
            />
          )}
          {overlay === 'tree' && (
            <TreeOverlay
              t={t}
              tree={tree}
              points={treePts}
              totalXp={Math.max(0, Number(totalRaw) || 0)}
              onClose={() => setOverlay(null)}
            />
          )}
        </AnimatePresence>

        {/* Вход по никнейму (первый визит) и смена ника из меню */}
        <AnimatePresence>
          {phase === 'start' && nickSetRaw !== '1' && (
            <NickDialog mode="gate" current="" t={t} onDone={handleNickDone} onClose={() => {}} />
          )}
          {nickEdit && (
            <NickDialog
              mode="edit"
              current={nameRaw === 'Котик' ? '' : nameRaw}
              t={t}
              onDone={handleNickDone}
              onClose={() => setNickEdit(false)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Настройки: поверх всего (включая панель статистики и паузу) */}
      <AnimatePresence>
        {overlay === 'settings' && (
          <SettingsOverlay
            settings={settings}
            onChange={(s) => setSettings(s)}
            t={t}
            onClose={() => setOverlay(null)}
          />
        )}
      </AnimatePresence>

      {/* Тост монеток за Лихорадку: 🪙 улетели в кошелёк */}
      <AnimatePresence>
        {feverCoins !== null && (
          <motion.div
            key={`fever-coins-${feverCoins}`}
            className="absolute bottom-28 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <div className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-[#2b1a0e]/95 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              <span aria-hidden className="text-xl">
                🪙
              </span>
              <div className="font-pixel text-sm font-bold leading-tight text-amber-200">
                +{feverCoins} {t('fever.coins')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Тост «котик подрос»: мета-прогресс — этап засчитан в стаж котика.
          Автоскрытие через 3400 мс уже ставит awardStage (setTimeout) */}
      <AnimatePresence>
        {charToast !== null && (
          <motion.div
            key={`char-${charToast}`}
            className="absolute bottom-36 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <div className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-[#2b1a0e]/95 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              {/* 🎖 уже внутри строки char.levelUp — не дублируем эмодзи */}
              <div className="font-pixel text-sm font-bold leading-tight text-amber-200">
                {t('char.levelUp', { n: charToast })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Тост нового достижения */}
      <AnimatePresence>
        {achToast && (
          <motion.div
            key={`${achToast.name}-${unlockedAch.length}`}
            className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <div className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-[#2b1a0e]/95 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              <span aria-hidden className="text-xl">
                {achToast.icon}
              </span>
              <div>
                <div className="font-ui text-[9px] font-bold uppercase tracking-wider text-amber-300">
                  {t('ach.toast')}
                </div>
                <div className="font-pixel text-sm font-bold leading-tight text-white">
                  {achToast.name}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Липкий футер */}
      <footer className="relative z-30 mt-auto border-t border-amber-100/10 bg-[#160c07] px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-center">
        <p className="font-ui text-[11px] tracking-wide text-amber-200/70 sm:text-xs">
          {t('footer.text')}
        </p>
      </footer>
    </div>
  )
}
