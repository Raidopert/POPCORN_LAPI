'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  CirclePlus,
  Compass,
  EllipsisVertical,
  Gem,
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
  Settings,
  Share,
  Share2,
  ShoppingBag,
  Smartphone,
  SquarePlus,
  Store,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { PopcornEngine, bossKindForTier, bossTierForLevel, type BossKind, type EngineStats } from '@/lib/game/engine'
import { audio } from '@/lib/game/audio'
import {
  TREE_NODES,
  TREE_KEY,
  TREE_MAP,
  TREE_TOTAL_POINTS,
  ZERO_BONUS,
  buyNode,
  canBuy,
  capGain,
  mergeBonuses,
  parseTreeRaw,
  treeBonuses,
  treeNodesOpened,
  treePoints,
  treeSpent,
  type TreeBonus,
  type TreeBuyError,
  type TreeId,
  type TreeState,
} from '@/lib/game/skill-tree'
import {
  PERKS,
  PERK_MAP,
  isHarshCurse,
  perkCanvasFilter,
  quotaFor,
  rollPerkOffer,
  type PerkDef,
  type PerkId,
} from '@/lib/game/perks'
import {
  makeChestSprite,
  makeCutePawSprite,
  makeSmoothPopcornSprite,
  makeMineSprite,
  MINE_VARIANTS,
  PAW_DEFAULT_STYLE,
} from '@/lib/game/sprites'
import { PopcornSlicer, type SliceKind } from '@/components/game/popcorn-slicer'
import { BossIntroOverlay } from '@/components/game/boss-intro'
import {
  POSTER_COUNT,
  POSTER_EVERY,
  PosterInterstitial,
  VICTORY_POSTER_SRC,
  preloadPosters,
} from '@/components/game/poster-interstitial'
import { DEFAULT_PAW, PAWS, PAW_MAP, type PawDef, type PawId } from '@/lib/game/paws'
import {
  addCoins,
  addTotalXp,
  charLevel,
  charLevelProgress,
  getCoins,
  getTotalXp,
  migrateXpBank,
} from '@/lib/game/meta'
import {
  UPGRADES,
  UPGRADE_CATS,
  UPGRADE_MAP,
  parseUpgrades,
  upgradeBonuses,
  upgradesAllMaxed,
  upgradesBought,
  type UpgradeDef,
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
import { addLife, flushLife, getLife } from '@/lib/game/lifestats'
import QRCode from 'react-qr-code'
import { ROOMS, roomForLevel, roomSrcForLevel } from '@/lib/game/rooms'
import MartenScene from './marten-scene'
import {
  DEFAULT_MARTEN,
  addMartenXp,
  addMartenProgress,
  addMartenDiamonds,
  buyMartenBag,
  buyMartenBoots,
  buyMartenHat,
  claimMartenTrip,
  equipMartenBag,
  equipMartenBoots,
  equipMartenHat,
  fmtTripDur,
  fmtTripMs,
  getMartenSnapshot,
  martenLevelOf,
  martenMess,
  nanaClickCoins,
  nanaLevelBonus,
  progressToNext,
  spendMartenDiamonds,
  stageOf,
  startMartenTrip,
  subscribeMarten,
  tripReward,
  BAGS,
  BOOTS,
  HATS,
  HATS_MAP,
  TRIPS,
  type BagId,
  type BootsId,
  type HatId,
  type MartenState,
  type TripId,
} from '@/lib/game/marten'
import {
  ZERO_MARKET_BONUS,
  artifactReqLevel,
  DEFAULT_MARKET,
  addGrains,
  buyArtifact,
  countClick,
  exchangeQuote,
  getMarketSnapshot,
  marketBonuses,
  spendGrains,
  subscribeMarket,
  ARTIFACTS,
  ARTIFACT_MAP,
  CURRENCIES,
  MARKET_FEE,
  type ArtifactId,
  type Currency,
  type MarketBonuses,
  type MarketState,
} from '@/lib/game/market'
import { GAME_VERSION_LABEL } from '@/lib/game/version'
import { unlockNamesForRange, type LevelUnlock } from '@/lib/game/unlocks'
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

type Phase = 'start' | 'playing' | 'paused' | 'slicer' | 'chest' | 'ended'

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
  /** Почему забег кончился: время / сердечки / разграбленная корзина / сам завершил (победа) */
  reason: 'time' | 'hearts' | 'ransacked' | 'voluntary'
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

/** Перк → ачивка «сыграть с этим перком» (новые механики 0.0.9; 0.0.41 —
    «Ночная смена» удалена, добавлено «Парящая лапка») */
const PERK_ACH: Partial<Record<PerkId, AchId>> = {
  whiteout: 'bgWhite',
  popcornfall: 'bgPopcorn',
  rainbow: 'rainbowrun',
  neon: 'neonrun',
  pigeonfeast: 'pigeonfeast',
  hover: 'hover1',
}

const BEST_KEY = 'popcorn-best'
const MUTE_KEY = 'popcorn-muted'
const STORE_EVENT = 'popcorn-store-update'
/* Мета-прогресс: очки попкорна = опыт, магазин лапок и список лидеров */
const XP_KEY = 'popcorn-xp'
/** Суммарный опыт за всё время — растит уровень котика (не тратится) */
const TOTAL_KEY = 'popcorn-totalxp'
/** Курс опыта: 15 очков попкорна = 1 🍿 (0.0.31 — было 10: экономика строже,
    запрос «меньше опыта, меньше попкорна за всё». Вместе с урезанными очками
    забега доход попкорна в сумме ~втрое скромнее) */
const XP_PER_SCORE = 15

/* Разовая миграция: старые запасы опыта делятся на 10 под новый курс
   (банк лапок и стаж котика), чтобы экономика совпала с новыми ценами */
if (typeof window !== 'undefined') migrateXpBank()
const PAW_KEY = 'popcorn-paw'
const OWNED_KEY = 'popcorn-owned'
const LEADERS_KEY = 'popcorn-leaders'
const UPG_KEY = 'popcorn-upgrades'
const NAME_KEY = 'popcorn-name'
/** Флаг «ник уже задан» — по нему показываем вход по никнейму только раз */
const NICKSET_KEY = 'popcorn-nick-set'
/** Ф0-2: флаг «туториал первого забега показан» — не повторяем опыт */
const TUT_DONE_KEY = 'popcorn-tut-done'
/** Ф0-2: ключи подсказок туториала по шагам 1..5 */
const TUT_KEYS = ['tut.1', 'tut.2', 'tut.3', 'tut.4', 'tut.5'] as const
/** Анонимный id устройства для мирового лидерборда (ник — не идентификатор) */
const DEVICE_KEY = 'popcorn-device'

/** deviceId из localStorage: создаётся один раз, живёт на устройстве */
function getDeviceId(): string {
  try {
    let d = window.localStorage.getItem(DEVICE_KEY)
    if (!d) {
      const rnd =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `d${Date.now()}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
      d = rnd.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 48)
      window.localStorage.setItem(DEVICE_KEY, d)
    }
    return d
  } catch {
    return 'anonymous-device'
  }
}

interface LeaderEntry {
  score: number
  level: number
  date: number
  /** Ник игрока (старые записи без ника — показываем текущий ник устройства) */
  name?: string
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
  disabled,
  className,
  /** Пробегающий блик — для главной кнопки «ИГРАТЬ» */
  shine = false,
}: {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
  shine?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-[#E24B3B] px-6 py-3.5 font-pixel text-base text-white shadow-[0_5px_0_#9c2f22] transition-all hover:bg-[#ef5a4a] active:translate-y-[3px] active:shadow-[0_2px_0_#9c2f22] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg ${className ?? ''} ${shine ? 'relative overflow-hidden' : ''}`}
    >
      {shine && (
        <span
          aria-hidden
          className="logo-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      )}
      {children}
    </button>
  )
}

/** Пружинное появление блоков меню с каскадной задержкой (каскад-стаггер) */
const menuPop = (i: number) => ({
  initial: { opacity: 0, y: 14, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { delay: 0.04 + i * 0.06, type: 'spring' as const, stiffness: 340, damping: 24 },
})

/** Фон меню: падающие зёрна попкорна + дрейфующие тёплые световые пятна */
function MenuBackdrop() {
  const kernels = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: (i * 67 + 11) % 94,
        delay: (i * 1.31) % 5.5,
        dur: 6.5 + (i % 4) * 1.6,
        size: 8 + ((i * 5) % 3) * 4,
        drift: ((i % 5) - 2) * 22,
        op: 0.28 + (i % 3) * 0.12,
        isPop: i % 2 === 0,
      })),
    [],
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="glow-drift absolute -left-10 top-1/4 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
      <div
        className="glow-drift absolute -right-8 bottom-1/4 h-64 w-64 rounded-full bg-[#E24B3B]/10 blur-3xl"
        style={{ animationDelay: '2.8s' }}
      />
      {kernels.map((k, i) => (
        <span
          key={i}
          className="popcorn-fall absolute -top-6"
          style={
            {
              left: `${k.left}%`,
              '--pop-delay': `${k.delay}s`,
              '--pop-dur': `${k.dur}s`,
              '--pop-drift': `${k.drift}px`,
              '--pop-op': k.op,
            } as React.CSSProperties
          }
        >
          {k.isPop ? (
            <span className="block text-base leading-none opacity-90">🍿</span>
          ) : (
            <span
              className="block bg-gradient-to-br from-amber-200 to-amber-400 shadow-[inset_-1px_-2px_0_rgba(120,60,10,0.35)]"
              style={{ width: k.size, height: k.size, borderRadius: '40%' }}
            />
          )}
        </span>
      ))}
    </div>
  )
}

/** Сердечки и Zzz над сценой куницы: NANA отдыхает в меню — эмоции всплывают сами.
    В походе (away) комната пустая — эмоции не спавнятся. */
function MartenIdleEmotes({ away }: { away: boolean }) {
  const [emotes, setEmotes] = useState<{ id: number; emoji: string; left: number; big: boolean }[]>([])
  const seqRef = useRef(0)
  useEffect(() => {
    if (away) return // в походе комната пустая — эмоции не спавним
    const spawn = window.setInterval(() => {
      seqRef.current += 1
      const id = seqRef.current
      const emoji = ['💤', '❤️', '💤', '🐾', '💤'][Math.floor(Math.random() * 5)]
      setEmotes((cur) => [
        ...cur.slice(-2),
        { id, emoji, left: 16 + Math.random() * 60, big: Math.random() < 0.35 },
      ])
      window.setTimeout(() => {
        setEmotes((cur) => cur.filter((e) => e.id !== id))
      }, 2600)
    }, 3600)
    return () => window.clearInterval(spawn)
  }, [away])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {!away &&
        emotes.map((e) => (
          <motion.span
            key={e.id}
            className={`absolute bottom-12 ${e.big ? 'text-2xl' : 'text-lg'}`}
            style={{ left: `${e.left}%` }}
            initial={{ opacity: 0, y: 14, scale: 0.5, rotate: -8 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-4, -22, -40, -56], scale: 1, rotate: 8 }}
            transition={{ duration: 2.5, times: [0, 0.18, 0.72, 1], ease: 'easeOut' }}
          >
            {e.emoji}
          </motion.span>
        ))}
    </div>
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
  return <canvas ref={ref} aria-hidden className="pixelated h-auto w-16 sm:w-20 [@media(max-height:520px)]:w-11 sm:[@media(max-height:520px)]:w-11" />
}

/** Лапка выбранного окраса и стиля (магазин скинов) */
function PawImg({
  skinId,
  style = 0,
  className = 'w-9',
}: {
  skinId: PawId
  style?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    /* Hi-res спрайт 192×240 рисуется в канвас 1:1 — браузер сам плавно
       ужмёт к 36px, без пиксельной угловатости */
    const spr = makeCutePawSprite(style, PAW_MAP[skinId].palette)
    c.width = spr.canvas.width
    c.height = spr.canvas.height
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(spr.canvas, 0, 0)
  }, [skinId, style])
  return <canvas ref={ref} aria-hidden className={`h-auto shrink-0 ${className}`} />
}

/** Dev-полоса сравнения вариантов мины: включается через ?mine=1..4 */
function MineStrip({ active }: { active: number }) {
  const refs = useRef<Array<HTMLCanvasElement | null>>([])
  useEffect(() => {
    for (let i = 0; i < MINE_VARIANTS; i++) {
      const c = refs.current[i]
      if (!c) continue
      const spr = makeMineSprite(i, false)
      c.width = spr.canvas.width
      c.height = spr.canvas.height
      const ctx = c.getContext('2d')
      if (!ctx) continue
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.drawImage(spr.canvas, 0, 0)
    }
  }, [])
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-2 top-24 z-[60] flex flex-col gap-1 rounded-xl border-2 border-[#572014] bg-[#FFF6EC]/95 p-1.5 shadow-lg sm:top-2"
    >
      {Array.from({ length: MINE_VARIANTS }, (_, i) => (
        <div
          key={i}
          className={`flex items-center gap-1 rounded-lg px-1 py-0.5 ${
            i === active ? 'bg-[#FFE066] ring-2 ring-[#E24B3B]' : 'opacity-70'
          }`}
        >
          <canvas
            ref={(el) => {
              refs.current[i] = el
            }}
            className="h-7 w-7"
          />
          <span className="w-4 font-ui text-[10px] font-bold text-[#572014]">{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

/** Маленькая кнопка меню (лидеры / магазин / создатели / древо) */
function MenuSmallBtn({
  onClick,
  icon,
  children,
  title,
  accent,
}: {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
  title?: string
  /** Зелёный акцент + пульс: у древа, когда есть нераспределённые очки */
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center gap-1 rounded-xl border-2 px-1 py-2 font-pixel text-[11px] font-bold shadow-[0_3px_0_#c9a97a] transition-all hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_#c9a97a] ${
        accent
          ? 'animate-pulse border-[#5C8A3A] bg-[#eaf3dd] text-[#3f6b28] hover:bg-[#e0efcc]'
          : 'border-[#8a5330] bg-[#f3e2c8] text-[#8a5330] hover:bg-[#eed7b4]'
      }`}
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

/* ---------- Путешествие куницы: авто-забег за зерном, алмазами и особым лутом ---------- */

/** Иконки маршрутов: классика и дальние «особые» путешествия */
const TRIP_ICON: Record<TripId, string> = {
  t10: '🏠',
  t30: '🌻',
  t60: '🌾',
  t180: '🌙',
  t360: '🚜',
  t720: '🏭',
}

/** Строка особых наград маршрута: 🪙 и 🌾 (пусто, если их нет) */
function tripLootText(coins: number, grains: number): string {
  const parts: string[] = []
  if (coins > 0) parts.push(`🪙 +${coins}`)
  if (grains > 0) parts.push(`🌾 +${grains}`)
  return parts.join(' · ')
}

function TravelOverlay({
  marten,
  martenLvl,
  gemMult,
  xpMult,
  coinMult,
  grainMult,
  t,
  onSend,
  onClaim,
  onClose,
}: {
  marten: MartenState
  martenLvl: number
  gemMult: number
  xpMult: number
  /** «Копилка-хрюшка» × уровень NANA — множит монетки дальних маршрутов */
  coinMult: number
  /** «Золотое ситечко» × уровень NANA — множит зёрна дальних маршрутов */
  grainMult: number
  t: TranslateFn
  onSend: (id: TripId) => void
  onClaim: () => void
  onClose: () => void
}) {
  const trip = marten.trip
  /* Активный поход: прогресс-бар от startedAt до endsAt */
  if (trip) {
    const done = Date.now() >= trip.endsAt
    const total = Math.max(1, trip.endsAt - trip.startedAt)
    const left = Math.max(0, trip.endsAt - Date.now())
    const pct = Math.min(100, Math.round(((total - left) / total) * 100))
    const loot = tripLootText(trip.coins, trip.grains)
    return (
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, pointerEvents: 'none' }}
      >
        <motion.div
          className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
          initial={{ scale: 0.92, y: 14 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div aria-hidden className="text-3xl">
            {done ? '🎒✨' : '🧭✈️'}
          </div>
          <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('travel.title')}</h2>
          <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
            {done ? t('travel.ready') : t('travel.awayTitle')}
          </p>
          <div className="mt-3 rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] p-3">
            <div className="font-pixel text-sm font-bold text-[#5C3A1E]">
              {t(`travel.${trip.id}.name`)}
            </div>
            {/* Прогресс пути */}
            <span
              aria-hidden
              className="mt-2 block h-3 w-full overflow-hidden rounded-full bg-[#e3cba4] ring-2 ring-[#d8bd92]"
            >
              <span
                className={`block h-full rounded-full transition-all duration-1000 ${
                  done ? 'bg-[#5C8A3A]' : 'bg-gradient-to-r from-[#F2A24B] to-[#E24B3B]'
                }`}
                style={{ width: `${done ? 100 : pct}%` }}
              />
            </span>
            <div className="mt-2 font-ui text-xs font-semibold text-[#8a5330]">
              {done ? (
                <span className="font-pixel text-[13px] text-[#3f6b28]">
                  {t('travel.reward')}: 💎 {trip.diamonds} · 🐾 {trip.xp} XP
                  {loot ? ` · ${loot}` : ''}
                </span>
              ) : (
                <>
                  {t('travel.left')}:{' '}
                  <span className="font-pixel tabular-nums text-[#B33A26]">
                    {fmtTripMs(left)}
                  </span>
                </>
              )}
            </div>
          </div>
          {done ? (
            <div className="mt-3">
              <GameButton onClick={onClaim}>
                {t('travel.claim')} · 💎{trip.diamonds} 🐾{trip.xp}
                {trip.coins > 0 ? ` 🪙${trip.coins}` : ''}
                {trip.grains > 0 ? ` 🌾${trip.grains}` : ''}
              </GameButton>
            </div>
          ) : (
            <p className="mt-2 font-ui text-[10px] text-[#a97c50]">
              {t('travel.reward')}: 💎 {trip.diamonds} · 🐾 {trip.xp} XP
              {loot ? ` · ${loot}` : ''}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
          >
            {t('shop.close')}
          </button>
        </motion.div>
      </motion.div>
    )
  }

  /* Дома: выбор из шести путешествий (с учётом снаряжения и артефактов) */
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          🧭✈️
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('travel.title')}</h2>
        <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">{t('travel.subtitle')}</p>

        <ul
          className={`mt-3 max-h-[46vh] space-y-2 overflow-y-auto pr-1 text-left sm:max-h-[26rem] ${OVERLAY_SCROLL}`}
        >
          {TRIPS.map((def) => {
            const locked = martenLvl < def.lock
            const rw = tripReward(
              def.id,
              { boots: marten.boots, hat: marten.hat, bag: marten.bag },
              gemMult,
              xpMult,
              coinMult,
              grainMult,
            )
            const loot = tripLootText(rw.coins, rw.grains)
            return (
              <li
                key={def.id}
                className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 ${
                  locked ? 'border-[#d9c6a8] bg-[#f3e8d8] opacity-80' : 'border-[#e3cba4] bg-[#fdf3e0]'
                }`}
              >
                <span aria-hidden className="text-2xl">
                  {TRIP_ICON[def.id]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-pixel text-[13px] font-bold leading-tight text-[#5C3A1E]">
                    {locked ? '🔒 ' : ''}
                    {t(`travel.${def.id}.name`)}
                  </div>
                  <div className="font-ui text-[11px] font-semibold leading-snug text-[#8a5330]">
                    ⏱ {fmtTripDur(rw.ms)} · 💎 {rw.diamonds} · 🐾 {rw.xp} XP
                  </div>
                  {loot ? (
                    <div className="font-ui text-[10px] font-bold leading-snug text-[#3f6b28]">
                      {loot} · {t('travel.special')}
                    </div>
                  ) : null}
                  {locked ? (
                    <div className="font-ui text-[10px] font-bold leading-snug text-[#B33A26]">
                      {t('travel.lock', { n: def.lock })}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => onSend(def.id)}
                  className={`shrink-0 rounded-lg px-2.5 py-2 font-ui text-[11px] font-bold transition active:scale-95 ${
                    locked
                      ? 'cursor-not-allowed bg-[#d9c6a8] text-[#8a755c]'
                      : 'bg-[#E24B3B] text-white shadow-[0_3px_0_#9c2f22] hover:bg-[#ef5a4a]'
                  }`}
                >
                  {locked ? '🔒' : t('travel.send')}
                </button>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
        >
          {t('shop.close')}
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ---------- Лавка куницы: ботиночки, шляпки и сумочки ---------- */

/** Иконки снаряжения для карточек лавки */
const BOOTS_ICON: Record<BootsId, string> = {
  none: '🐾',
  sapozhki: '🥿',
  krest: '🥾',
  valenki: '🧶',
  sluzh: '👠',
  leopard: '🐆',
  meteor: '🚀',
  lunnie: '🌙',
}
const HAT_ICON: Record<HatId, string> = {
  none: '🐾',
  straw: '👒',
  cap: '🧢',
  beret: '🎨',
  wizard: '🔮',
  crown: '👑',
  star: '🌟',
  superleo: '🎩',
  astronaut: '🪐',
}
const BAG_ICON: Record<BagId, string> = {
  none: '🐾',
  packet: '🛍️',
  meshok: '🧺',
  tote: '👝',
  ryukzak: '🎒',
  baguette: '👜',
  shkatulka: '🎁',
  leobag: '👛',
  kosmos: '🧳',
}

/** Общая строка «эффектов снаряжения»: 💎+15% · 🐾+15% · ⏱−5% · 👆+4 · 🪙+10 · 🌾+80 */
function gearEffText(parts: Array<[string, string]>): string {
  return parts.length > 0 ? parts.map(([k, v]) => `${k} ${v}`).join(' · ') : '—'
}

function MShopOverlay({
  marten,
  t,
  onBuyBoots,
  onEquipBoots,
  onBuyHat,
  onEquipHat,
  onBuyBag,
  onEquipBag,
  onClose,
}: {
  marten: MartenState
  t: TranslateFn
  onBuyBoots: (id: BootsId) => void
  onEquipBoots: (id: BootsId) => void
  onBuyHat: (id: HatId) => void
  onEquipHat: (id: HatId) => void
  onBuyBag: (id: BagId) => void
  onEquipBag: (id: BagId) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'boots' | 'hats' | 'bags'>('boots')
  /* Порядок карточек: дешёвые сверху */
  const list =
    tab === 'boots'
      ? BOOTS.map((d) => ({
          id: d.id,
          price: d.price,
          owned: marten.ownedBoots.includes(d.id),
          equipped: marten.boots === d.id,
          icon: BOOTS_ICON[d.id],
          eff: gearEffText([
            ...(d.gemMul !== 1 ? ([['💎', `+${Math.round((d.gemMul - 1) * 100)}%`]] as Array<[string, string]>) : []),
            ...(d.xpMul !== 1 ? ([['🐾', `+${Math.round((d.xpMul - 1) * 100)}%`]] as Array<[string, string]>) : []),
            ...(d.timeMul !== 1 ? ([['⏱', `−${Math.round((1 - d.timeMul) * 100)}%`]] as Array<[string, string]>) : []),
          ]),
          nameKey: `boots.${d.id}.name`,
          descKey: `boots.${d.id}.desc`,
          premium: d.id === 'leopard' || d.id === 'meteor' || d.id === 'lunnie',
        }))
      : tab === 'hats'
        ? HATS.map((d) => ({
            id: d.id,
            price: d.price,
            owned: marten.ownedHats.includes(d.id),
            equipped: marten.hat === d.id,
            icon: HAT_ICON[d.id],
            eff: gearEffText([
              ...(d.clickXp > 0 ? ([['👆', `+${d.clickXp}🐾`]] as Array<[string, string]>) : []),
              ...(d.gemMul !== 1 ? ([['💎', `+${Math.round((d.gemMul - 1) * 100)}%`]] as Array<[string, string]>) : []),
              ...(d.xpMul !== 1 ? ([['🐾', `+${Math.round((d.xpMul - 1) * 100)}%`]] as Array<[string, string]>) : []),
              ...(d.timeMul !== 1 ? ([['⏱', `−${Math.round((1 - d.timeMul) * 100)}%`]] as Array<[string, string]>) : []),
            ]),
            nameKey: `hat.${d.id}.name`,
            descKey: `hat.${d.id}.desc`,
            premium: d.id === 'superleo' || d.id === 'astronaut',
          }))
        : BAGS.map((d) => ({
            id: d.id,
            price: d.price,
            owned: marten.ownedBags.includes(d.id),
            equipped: marten.bag === d.id,
            icon: BAG_ICON[d.id],
            eff: gearEffText([
              ...(d.coins > 0 ? ([['🪙', `+${d.coins}`]] as Array<[string, string]>) : []),
              ...(d.grains > 0 ? ([['🌾', `+${d.grains}`]] as Array<[string, string]>) : []),
              ...(d.gemAdd > 1 ? ([['💎', `+${Math.round((d.gemAdd - 1) * 100)}%`]] as Array<[string, string]>) : []),
            ]),
            nameKey: `bag.${d.id}.name`,
            descKey: `bag.${d.id}.desc`,
            premium: d.id === 'leobag' || d.id === 'kosmos',
          }))

  const handleBuy =
    tab === 'boots'
      ? (id: string) => onBuyBoots(id as BootsId)
      : tab === 'hats'
        ? (id: string) => onBuyHat(id as HatId)
        : (id: string) => onBuyBag(id as BagId)
  const handleEquip =
    tab === 'boots'
      ? (id: string) => onEquipBoots(id as BootsId)
      : tab === 'hats'
        ? (id: string) => onEquipHat(id as HatId)
        : (id: string) => onEquipBag(id as BagId)

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          🛍️👢👒👛
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('mshop.title')}</h2>
        <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">{t('mshop.subtitle')}</p>
        {/* Кошелёк: алмазы */}
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eaf3dd] px-3 py-1 ring-2 ring-[#7FB069]">
          <Gem className="h-4 w-4 text-[#3f6b28]" aria-hidden />
          <span className="font-pixel text-sm font-bold tabular-nums text-[#3f6b28]">
            {marten.diamonds}
          </span>
        </div>

        {/* Табы: ботинки / шляпки / сумки */}
        <div className="mt-3 grid grid-cols-3 gap-1" role="tablist" aria-label={t('mshop.title')}>
          {(
            [
              ['boots', '👢', 'mshop.tabBoots'],
              ['hats', '👒', 'mshop.tabHats'],
              ['bags', '👛', 'mshop.tabBags'],
            ] as Array<['boots' | 'hats' | 'bags', string, string]>
          ).map(([id, icon, key]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                audio.play('click')
                setTab(id)
              }}
              className={`rounded-lg border-2 px-1 py-1.5 font-pixel text-[10px] font-bold transition active:scale-95 ${
                tab === id
                  ? 'border-[#E24B3B] bg-[#ffe9e2] text-[#B33A26]'
                  : 'border-[#d9c6a8] bg-[#f3e2c8] text-[#8a5330] hover:bg-[#eed7b4]'
              }`}
            >
              <span aria-hidden className="mr-0.5">
                {icon}
              </span>
              {t(key)}
            </button>
          ))}
        </div>

        <ul
          className={`mt-3 max-h-[34vh] space-y-2 overflow-y-auto pr-1 text-left sm:max-h-56 ${OVERLAY_SCROLL}`}
        >
          {list.map((item) => {
            const canBuy = !item.owned && marten.diamonds >= item.price
            return (
              <li
                key={item.id}
                className={`flex items-center gap-2.5 rounded-xl border-2 p-2 ${
                  item.equipped ? 'border-amber-400 bg-amber-50' : 'border-[#e3cba4] bg-[#fdf3e0]'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl ${
                    item.premium
                      ? 'bg-[#3a2a12] shadow-[inset_0_0_12px_rgba(255,209,102,0.35)]'
                      : 'bg-[#f3e2c8]'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-pixel text-sm font-bold leading-tight text-[#5C3A1E]">
                    {t(item.nameKey)}
                  </div>
                  <div
                    className="font-ui text-[10px] font-bold leading-snug text-[#3f6b28]"
                    title={t(item.descKey)}
                  >
                    {item.eff}
                  </div>
                  <div
                    className="font-ui text-[10px] leading-tight text-[#a97c50]"
                    title={t(item.descKey)}
                  >
                    {t(item.descKey)}
                  </div>
                </div>
                {item.equipped ? (
                  <span className="shrink-0 rounded-full bg-amber-400 px-2.5 py-1.5 font-ui text-[10px] font-bold text-[#5C3A1E]">
                    {t('mshop.on')}
                  </span>
                ) : item.owned ? (
                  <button
                    type="button"
                    onClick={() => handleEquip(item.id)}
                    className="shrink-0 rounded-lg border-2 border-[#8a5330] bg-[#FFF6E6] px-2.5 py-1.5 font-ui text-[11px] font-bold text-[#8a5330] transition hover:bg-[#f3e2c8] active:scale-95"
                  >
                    {t('mshop.equip')}
                  </button>
                ) : item.price === 0 ? (
                  <span className="shrink-0 font-ui text-[10px] text-[#a97c50]">
                    {t('mshop.bare')}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!canBuy}
                    onClick={() => handleBuy(item.id)}
                    title={canBuy ? t(item.descKey) : t('mshop.need')}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 font-ui text-[11px] font-bold transition active:scale-95 ${
                      canBuy
                        ? 'bg-[#E24B3B] text-white shadow-[0_3px_0_#9c2f22] hover:bg-[#ef5a4a]'
                        : 'cursor-not-allowed bg-[#d9c6a8] text-[#8a755c]'
                    }`}
                  >
                    💎 {item.price}
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
        >
          {t('shop.close')}
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ---------- РЫНОК: обмен всех валют + постоянные артефакты ---------- */

/** Короткая подпись валюты для чипов кошелька */
const CURRENCY_META: Record<Currency, { icon: string; hintKey: string }> = {
  gems: { icon: '💎', hintKey: 'market.cur.gems' },
  coins: { icon: '🪙', hintKey: 'market.cur.coins' },
  xp: { icon: '🍿', hintKey: 'market.cur.xp' },
  grains: { icon: '🌾', hintKey: 'market.cur.grains' },
}

/** Артефактные иконки */
const ARTIFACT_ICON: Record<ArtifactId, string> = {
  piggy: '🐷',
  academy: '🎓',
  sieve: '🧺',
  travelmap: '🧭',
  bell: '🔔',
  rattle: '🪇',
}

function MarketOverlay({
  marten,
  coins,
  xp,
  market,
  catLevel,
  t,
  onExchange,
  onBuyArtifact,
  onClose,
}: {
  marten: MartenState
  coins: number
  xp: number
  market: MarketState
  /** Уровень котика 🎖: часть артефактов закрыта замком (v0.0.33) */
  catLevel: number
  t: TranslateFn
  onExchange: (from: Currency, to: Currency, amount: number) => boolean
  onBuyArtifact: (id: ArtifactId) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'swap' | 'artifacts'>('swap')
  const [from, setFrom] = useState<Currency>('grains')
  const [to, setTo] = useState<Currency>('coins')
  /** Доля кошелька на обмен: 0.1..1 (кнопки 10% / 25% / 50% / MAX) */
  const [frac, setFrac] = useState(0.25)

  const balanceOf = (c: Currency): number =>
    c === 'gems' ? marten.diamonds : c === 'coins' ? coins : c === 'xp' ? xp : market.grains

  const wallet: Array<[Currency, number]> = [
    ['gems', marten.diamonds],
    ['coins', coins],
    ['xp', xp],
    ['grains', market.grains],
  ]

  const bank = balanceOf(from)
  const amount = Math.floor(bank * frac)
  const got = exchangeQuote(from, to, amount)
  const sameCur = from === to
  const canSwap = !sameCur && amount > 0 && got > 0

  const pickCurrency = (slot: 'from' | 'to', c: Currency): void => {
    if (slot === 'from') {
      if (c === to) setTo(from) // обмен местами
      setFrom(c)
    } else {
      if (c === from) setFrom(to)
      setTo(c)
    }
    audio.play('click')
  }

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-3xl">
          🏪💱
        </div>
        <h2 className="mt-0.5 font-pixel text-xl font-bold text-[#B33A26]">{t('market.title')}</h2>
        <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">{t('market.subtitle')}</p>

        {/* Кошелёк: все четыре валюты */}
        <div className="mt-2 grid grid-cols-4 gap-1">
          {wallet.map(([c, n]) => (
            <div
              key={c}
              className="rounded-lg border-2 border-[#e3cba4] bg-[#fdf3e0] px-1 py-1"
              title={t(CURRENCY_META[c].hintKey)}
            >
              <div aria-hidden className="text-sm leading-none">
                {CURRENCY_META[c].icon}
              </div>
              <div className="font-pixel text-[10px] font-bold tabular-nums text-[#5C3A1E]">
                {n >= 100000 ? `${Math.floor(n / 1000)}k` : n}
              </div>
            </div>
          ))}
        </div>

        {/* Табы: обмен / артефакты */}
        <div className="mt-3 grid grid-cols-2 gap-1" role="tablist" aria-label={t('market.title')}>
          {(
            [
              ['swap', '🔁', 'market.tabSwap'],
              ['artifacts', '🏺', 'market.tabArtifacts'],
            ] as Array<['swap' | 'artifacts', string, string]>
          ).map(([id, icon, key]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                audio.play('click')
                setTab(id)
              }}
              className={`rounded-lg border-2 px-1 py-1.5 font-pixel text-[10px] font-bold transition active:scale-95 ${
                tab === id
                  ? 'border-[#E24B3B] bg-[#ffe9e2] text-[#B33A26]'
                  : 'border-[#d9c6a8] bg-[#f3e2c8] text-[#8a5330] hover:bg-[#eed7b4]'
              }`}
            >
              <span aria-hidden className="mr-0.5">
                {icon}
              </span>
              {t(key)}
            </button>
          ))}
        </div>

        {tab === 'swap' ? (
          <div className="mt-3 text-left">
            {/* Отдаём */}
            <div className="font-ui text-[10px] font-bold uppercase tracking-wide text-[#a97c50]">
              {t('market.give')}
            </div>
            <div className="mt-1 grid grid-cols-4 gap-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={from === c}
                  onClick={() => pickCurrency('from', c)}
                  className={`rounded-lg border-2 py-1.5 text-center transition active:scale-95 ${
                    from === c
                      ? 'border-[#B33A26] bg-[#ffe9e2]'
                      : 'border-[#e3cba4] bg-[#fdf3e0] hover:bg-[#f3e2c8]'
                  }`}
                >
                  <span aria-hidden className="block text-base leading-none">
                    {CURRENCY_META[c].icon}
                  </span>
                </button>
              ))}
            </div>
            {/* Получаем */}
            <div className="mt-2 font-ui text-[10px] font-bold uppercase tracking-wide text-[#a97c50]">
              {t('market.get')}
            </div>
            <div className="mt-1 grid grid-cols-4 gap-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={to === c}
                  onClick={() => pickCurrency('to', c)}
                  className={`rounded-lg border-2 py-1.5 text-center transition active:scale-95 ${
                    to === c
                      ? 'border-[#3f6b28] bg-[#eaf3dd]'
                      : 'border-[#e3cba4] bg-[#fdf3e0] hover:bg-[#f3e2c8]'
                  }`}
                >
                  <span aria-hidden className="block text-base leading-none">
                    {CURRENCY_META[c].icon}
                  </span>
                </button>
              ))}
            </div>

            {/* Доля кошелька */}
            <div className="mt-2 grid grid-cols-4 gap-1">
              {(
                [
                  [0.1, '10%'],
                  [0.25, '25%'],
                  [0.5, '50%'],
                  [1, t('market.max')],
                ] as Array<[number, string]>
              ).map(([f, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={frac === f}
                  onClick={() => {
                    audio.play('click')
                    setFrac(f)
                  }}
                  className={`rounded-lg border-2 py-1 font-pixel text-[10px] font-bold transition active:scale-95 ${
                    frac === f
                      ? 'border-[#8a5330] bg-[#f3e2c8] text-[#5C3A1E]'
                      : 'border-[#e3cba4] bg-[#fdf3e0] text-[#8a5330] hover:bg-[#f3e2c8]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Итог обмена */}
            <div className="mt-2 rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] p-2.5 text-center">
              {sameCur ? (
                <p className="font-ui text-[11px] font-bold text-[#B33A26]">{t('market.same')}</p>
              ) : (
                <>
                  <div className="font-pixel text-[13px] font-bold text-[#5C3A1E]">
                    {CURRENCY_META[from].icon} {amount} →{' '}
                    <span className="text-[#3f6b28]">
                      {CURRENCY_META[to].icon} {got}
                    </span>
                  </div>
                  <p className="mt-1 font-ui text-[10px] leading-tight text-[#a97c50]">
                    {t('market.fee', { n: Math.round(MARKET_FEE * 100) })}
                  </p>
                </>
              )}
            </div>

            <GameButton
              onClick={() => {
                if (!canSwap) return
                if (onExchange(from, to, amount)) audio.play('perk')
                else audio.play('penalty')
              }}
              disabled={!canSwap}
              className={canSwap ? '' : 'pointer-events-none opacity-50'}
            >
              {t('market.swap')} · {CURRENCY_META[from].icon}
              {amount} → {CURRENCY_META[to].icon}
              {got}
            </GameButton>
          </div>
        ) : (
          /* Артефакты: постоянные усиления за алмазы */
          <ul
            className={`mt-3 max-h-[36vh] space-y-2 overflow-y-auto pr-1 text-left sm:max-h-60 ${OVERLAY_SCROLL}`}
          >
            {ARTIFACTS.map((def) => {
              const owned = market.artifacts.includes(def.id)
              /* v0.0.33: артефакт закрыт до нужного уровня котика */
              const reqLvl = artifactReqLevel(def.id)
              const levelLocked = reqLvl > catLevel
              const canBuy = !owned && !levelLocked && marten.diamonds >= def.price
              return (
                <li
                  key={def.id}
                  title={levelLocked ? t('shop.lockedHint', { n: reqLvl }) : undefined}
                  className={`flex items-center gap-2.5 rounded-xl border-2 p-2 ${
                    owned
                      ? 'border-amber-400 bg-amber-50'
                      : levelLocked
                        ? 'border-[#e3cba4] bg-[#fdf3e0] opacity-60'
                        : 'border-[#e3cba4] bg-[#fdf3e0]'
                  }`}
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3e2c8] text-2xl"
                  >
                    {ARTIFACT_ICON[def.id]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-pixel text-sm font-bold leading-tight text-[#5C3A1E]">
                      {t(`artifact.${def.id}.name`)}
                    </div>
                    <div
                      className="font-ui text-[10px] font-bold leading-snug text-[#3f6b28]"
                      title={t(`artifact.${def.id}.desc`)}
                    >
                      {t(`artifact.${def.id}.effect`)}
                    </div>
                    <div className="font-ui text-[10px] leading-tight text-[#a97c50]">
                      {t(`artifact.${def.id}.desc`)}
                    </div>
                  </div>
                  {owned ? (
                    <span className="shrink-0 rounded-full bg-amber-400 px-2.5 py-1.5 font-ui text-[10px] font-bold text-[#5C3A1E]">
                      {t('market.owned')}
                    </span>
                  ) : levelLocked ? (
                    <span
                      aria-label={t('shop.lockedHint', { n: reqLvl })}
                      className="shrink-0 rounded-lg bg-[#d9c6a8] px-2.5 py-1.5 font-ui text-[11px] font-bold text-[#6b5233]"
                    >
                      {t('shop.locked', { n: reqLvl })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onBuyArtifact(def.id)}
                      title={canBuy ? t(`artifact.${def.id}.desc`) : t('mshop.need')}
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 font-ui text-[11px] font-bold transition active:scale-95 ${
                        canBuy
                          ? 'bg-[#E24B3B] text-white shadow-[0_3px_0_#9c2f22] hover:bg-[#ef5a4a]'
                          : 'cursor-not-allowed bg-[#d9c6a8] text-[#8a755c]'
                      }`}
                    >
                      💎 {def.price}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
        >
          {t('shop.close')}
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ---------- Магазин: лапки (за опыт 🍿 или монетки 🪙) + постоянные апгрейды ---------- */

function ShopOverlay({
  xp,
  coins,
  owned,
  equipped,
  upgrades,
  catLevel,
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
  /** Уровень котика 🎖: часть товаров закрыта замком до нужного стажа (v0.0.33) */
  catLevel: number
  t: TranslateFn
  onBuy: (def: PawDef) => void
  onEquip: (id: PawId) => void
  onBuyUpgrade: (id: UpgradeId) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'paws' | 'upgrades'>('paws')
  /* Эффект любого апгрейда описан в i18n: upg.<id>.effect (+{{n}}) и upg.<id>.effectNone.
     {{n}} — шаг эффекта × купленные ступени (у «Крепкого носа» шаг 0.3 сек) */
  const effectText = (def: UpgradeDef, level: number): string =>
    level > 0
      ? t(`upg.${def.id}.effect`, { n: level * def.step })
      : t(`upg.${def.id}.effectNone`)
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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
              /* v0.0.33: лапка закрыта, пока котик не дорос до нужного уровня */
              const reqLvl = def.reqLevel ?? 1
              const levelLocked = reqLvl > catLevel
              const canBuy = !isOwned && !levelLocked && (cur === 'coins' ? coins >= def.price : xp >= def.price)
              return (
                <li
                  key={def.id}
                  title={levelLocked ? t('shop.lockedHint', { n: reqLvl }) : undefined}
                  className={`flex items-center gap-2.5 rounded-xl border-2 p-2 ${
                    isEquipped
                      ? 'border-amber-400 bg-amber-50'
                      : levelLocked
                        ? 'border-[#e3cba4] bg-[#fdf3e0] opacity-60'
                        : 'border-[#e3cba4] bg-[#fdf3e0]'
                  }`}
                >
                  <PawImg skinId={def.id} style={PAW_DEFAULT_STYLE} />
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
                  {levelLocked && !isOwned ? (
                    <span
                      aria-label={t('shop.lockedHint', { n: reqLvl })}
                      className="shrink-0 rounded-lg bg-[#d9c6a8] px-2.5 py-1.5 font-ui text-[11px] font-bold text-[#6b5233]"
                    >
                      {t('shop.locked', { n: reqLvl })}
                    </span>
                  ) : isEquipped ? (
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
          <div
            className={`mt-3 max-h-[46vh] overflow-y-auto pr-1 text-left sm:max-h-80 ${OVERLAY_SCROLL}`}
          >
            {/* v0.0.32: вкладка разбита на разделы — 33 апгрейда в 8 темах */}
            {UPGRADE_CATS.map((cat) => {
              const items = UPGRADES.filter((d) => d.cat === cat.id)
              if (items.length === 0) return null
              return (
                <section key={cat.id} aria-label={t(cat.key)}>
                  <div className="sticky top-0 z-10 mb-1.5 flex items-center gap-1.5 rounded-lg bg-[#f3e2c8]/95 px-2 py-1 backdrop-blur-sm">
                    <span aria-hidden className="text-sm leading-none">
                      {cat.icon}
                    </span>
                    <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-[#a97c50]">
                      {t(cat.key)}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {items.map((def) => {
                      const level = upgrades[def.id]
                      const maxed = level >= def.prices.length
                      const cost = maxed ? 0 : def.prices[level]
                      /* v0.0.33: апгрейд закрыт до нужного уровня котика */
                      const reqLvl = def.reqLevel ?? 1
                      const levelLocked = reqLvl > catLevel
                      const canBuy = !maxed && !levelLocked && xp >= cost
                      return (
                        <li
                          key={def.id}
                          title={levelLocked ? t('shop.lockedHint', { n: reqLvl }) : undefined}
                          className={`rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] p-2 ${levelLocked ? 'opacity-60' : ''}`}
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
                                {effectText(def, level)}
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
                            ) : levelLocked ? (
                              <span
                                aria-label={t('shop.lockedHint', { n: reqLvl })}
                                className="inline-block rounded-lg bg-[#d9c6a8] px-2.5 py-1.5 font-ui text-[11px] font-bold text-[#6b5233]"
                              >
                                {t('shop.locked', { n: reqLvl })}
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
                </section>
              )
            })}
          </div>
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
    /** Место игрока по личному рекорду в мировом топе (если уже играл) */
    me?: { rank: number; best: number }
  }>({ status: 'loading', rows: [] })
  const [tab, setTab] = useState<'world' | 'local'>('world')
  /** Номер попытки подключения: кнопка «Повторить» перезапускает fetch */
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    fetch(`/api/leaders?device=${encodeURIComponent(getDeviceId())}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then(
        (d: {
          online?: boolean
          leaders?: OnlineLeader[]
          me?: { rank: number; best: number }
        }) => {
          if (!alive) return
          if (d?.online && Array.isArray(d.leaders)) {
            setWorld({ status: 'on', rows: d.leaders, me: d.me })
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
  }, [attempt])

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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
          <div className="mt-1.5 rounded-xl border-2 border-dashed border-[#d9b98c] bg-[#fdf3e0] px-3 py-2">
            <p className="font-ui text-xs font-medium text-[#8a5330]">
              {world.status === 'loading' ? t('lead.checking') : t('lead.offline')}
            </p>
            {world.status === 'off' && (
              <>
                <p className="mt-1 font-ui text-[11px] leading-snug text-[#a97c50]">{t('lead.offlineHint')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setWorld({ status: 'loading', rows: [] })
                    setAttempt((a) => a + 1)
                  }}
                  className="mt-1.5 rounded-lg border-2 border-[#E24B3B] px-3 py-1 font-pixel text-[11px] font-bold text-[#B33A26] transition hover:bg-[#E24B3B] hover:text-white active:translate-y-px"
                >
                  {t('lead.retry')}
                </button>
              </>
            )}
          </div>
        )}

        {/* Мировая статистика теперь живёт отдельно — в НАСТРОЙКАХ */}

        {tab === 'local' || world.status !== 'on' ? (
          leaders.length === 0 ? (
            <p className="mt-4 font-ui text-sm font-medium text-[#5C3A1E]">{t('lead.emptyLocal')}</p>
          ) : (
            <ol className={`mt-3 max-h-[42vh] space-y-1.5 overflow-y-auto pr-1 sm:max-h-72 ${OVERLAY_SCROLL}`}>
              {leaders.map((e, i) => {
                const mine =
                  myName.trim().length > 1 && (e.name ?? '').toLowerCase() === myName.trim().toLowerCase()
                return (
                  <li
                    key={`${e.date}-${e.score}-${i}`}
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
                    {/* Ник игрока: старые записи без ника показываем под текущим ником устройства */}
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate font-pixel text-sm font-bold text-[#5C3A1E]">
                        {e.name ?? myName}
                        {mine && (
                          <span className="ml-1 font-ui text-[10px] text-[#B33A26]">{t('lead.you')}</span>
                        )}
                      </span>
                      <span className="block font-ui text-[10px] text-[#8a5330]">
                        {t('lead.lvl', { n: e.level })} ·{' '}
                        {new Date(e.date).toLocaleDateString(LOCALES[lang])}
                      </span>
                    </span>
                    <Popcorn className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                    <span className="font-pixel text-base font-bold tabular-nums text-[#5C3A1E]">
                      {e.score}
                    </span>
                  </li>
                )
              })}
            </ol>
          )
        ) : (
          <>
            {typeof world.me?.rank === 'number' && world.me.rank > 0 && (
              <p className="mt-2 rounded-xl bg-[#eaf6e6] px-3 py-1.5 font-pixel text-[11px] font-bold text-[#3f6b28]">
                {t('lead.myRank', { n: `#${world.me.rank}`, best: world.me.best })}
              </p>
            )}
            {world.rows.length === 0 ? (
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
          </>
        )}
        <div className="mt-3">
          <GameButton onClick={onClose}>{t('shop.close')}</GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Экран «Правила»: 8 коротких пунктов — только проверенные актуальные цифры */
function RulesOverlay({ t, onClose }: { t: TranslateFn; onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ['👆', 'rules.r1'],
    ['🍿', 'rules.r2'],
    ['☠️', 'rules.r3'],
    ['🐾', 'rules.r4'],
    ['🐦', 'rules.r5'],
    ['🎁', 'rules.r6'],
    ['💾', 'rules.r7'],
    ['🌽', 'rules.r8'],
  ]
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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

/** Позиции узлов древа на SVG-сетке (в процентах контейнера):
    корень → 3 ветки → 7 детей → 7 вершин → сердца → верхушка (6 ярусов, 27 узлов).
    Ярусы уплотнены: нижний ряд с именами не вылезает за контейнер.
    v0.0.41: «Праздничный кот» (подарки чаще), «Лёгкое крыло» (парение дольше),
    «Сверхпроворство» (буст лапки для облегчения) */
const TREE_POS: Record<TreeId, { x: number; y: number }> = {
  harvest: { x: 50, y: 4 },
  swift: { x: 20, y: 16 },
  cap: { x: 50, y: 16 },
  seeds: { x: 80, y: 16 },
  magnet: { x: 7.5, y: 34 },
  guard: { x: 21.7, y: 34 },
  goldluck: { x: 35.8, y: 34 },
  coins: { x: 50, y: 34 },
  giftluck: { x: 64.2, y: 34 },
  feverluck: { x: 78.3, y: 34 },
  fevertime: { x: 92.5, y: 34 },
  miner: { x: 7.5, y: 54 },
  stun: { x: 21.7, y: 54 },
  hoverwing: { x: 35.8, y: 54 },
  combo: { x: 50, y: 54 },
  xpboost: { x: 64.2, y: 54 },
  shield: { x: 78.3, y: 54 },
  double: { x: 92.5, y: 54 },
  /* ярус 5 — сердечная ветка */
  heartmax: { x: 66.5, y: 72 },
  healer: { x: 83, y: 72 },
  /* ярус 6 — верхушка для ветеранов */
  magnet2: { x: 7.5, y: 88 },
  swift2: { x: 21.7, y: 88 },
  biggrain: { x: 35.8, y: 88 },
  goldrain: { x: 50, y: 88 },
  coins2: { x: 64.2, y: 88 },
  seeds2: { x: 78.3, y: 88 },
  fevertime2: { x: 92.5, y: 88 },
}

/** Ветви дерева строятся из родителей: каждый узел ведёт от своего предка */
function treeLinkPath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2 + 7
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`
}

const TREE_LINKS: Array<{ to: TreeId; d: string }> = TREE_NODES.flatMap((n) =>
  n.parent ? [{ to: n.id, d: treeLinkPath(TREE_POS[n.parent], TREE_POS[n.id]) }] : [],
)

/** Число в подсказке узла: суммарный эффект на текущем уровне
    (для не купленных — эффект первой покупки) */
function treeEffectN(id: TreeId, lvl: number): number {
  const L = Math.max(lvl, 1)
  if (id === 'harvest') return 5 * L // +5% за каждый уровень
  if (id === 'cap') return capGain(L) // +1, +3, +6, +10 зерна всего
  if (id === 'swift') return 5 * L
  if (id === 'seeds') return 2 * L
  if (id === 'magnet') return 8 * L
  if (id === 'guard') return 15 * L
  if (id === 'goldluck') return 10 * L
  if (id === 'coins') return 10 * L
  if (id === 'feverluck') return 5 * L
  if (id === 'fevertime') return L
  if (id === 'giftluck') return 12 * L
  if (id === 'miner') return L
  if (id === 'stun') return Math.round(0.3 * L * 10) / 10
  if (id === 'hoverwing') {
    /* 1.5с за уровень; округляем до 0.5 для читаемой подсказки */
    return Math.round(1.5 * L * 2) / 2
  }
  if (id === 'xpboost') return 10 * L
  if (id === 'shield') return L
  if (id === 'double') return 25 * L
  if (id === 'heartmax') return L
  if (id === 'healer') return L
  /* ярус 6 — верхушка для ветеранов */
  if (id === 'biggrain') return 4 * L
  if (id === 'seeds2') return 3 * L
  if (id === 'magnet2') return 10 * L
  if (id === 'goldrain') return 8 * L
  if (id === 'coins2') return 15 * L
  if (id === 'fevertime2') return 2 * L
  if (id === 'swift2') return 6 * L
  return 1 // комбо
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
  /** Выбранный узел: его полный эффект показывается в карточке под деревом */
  const [sel, setSel] = useState<TreeId>('harvest')

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

  /** Покупка из карточки: та же проверка, что раньше была на тапе узла */
  const tryBuy = useCallback(
    (id: TreeId) => {
      const check = canBuy(id, tree, totalXp)
      if (check !== 'ok') {
        const def = TREE_MAP[id]
        if (check === 'root') {
          const pid = def.parent
          showErr(t('tree.needParent', { s: pid ? t(`tree.${pid}.name`) : t('tree.harvest.name') }))
        } else if (check === 'points') showErr(t('tree.needPoints'))
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
    const check = canBuy(id, tree, totalXp)
    if (check === 'ok') return 'ready'
    if (lvl > 0) return 'idle' // куплен, но очков на следующий уровень нет
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
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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

        {/* Сетка-дерево: SVG-ветки под узлами (6 ярусов, 27 узлов) */}
        <div className="relative mx-auto h-[640px] w-full max-w-[430px]">
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
            const selected = sel === node.id
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSel(node.id)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                aria-pressed={selected}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E24B3B]"
                aria-label={`${t(`tree.${node.id}.name`)} — ${t(`tree.${node.id}.effect`, { n: treeEffectN(node.id, lvl) })}`}
              >
                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border-4 text-xl transition active:scale-90 sm:h-12 sm:w-12 ${styles[st]} ${
                    selected
                      ? 'ring-2 ring-[#B33A26] ring-offset-2 ring-offset-[#FFF6E6]'
                      : ''
                  }`}
                >
                  <span aria-hidden>{node.icon}</span>
                  {lvl > 0 && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#5C8A3A] px-1 font-ui text-[9px] font-bold text-white">
                      {lvl >= node.maxLevel ? 'MAX' : lvl}
                    </span>
                  )}
                  {st === 'locked' && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-white bg-[#8d7f6d] px-1 font-ui text-[8px] font-bold text-white">
                      🔒{TREE_MAP[node.id].reqLevel}
                    </span>
                  )}
                </span>
                {/* Короткое имя под узлом; полный эффект — в карточке выбора.
                    Ширина ≤ зазора колонок (59–71px), чтобы имена не слипались */}
                <span className="mt-1 w-14 text-center font-pixel text-[9px] font-bold leading-[1.15] text-[#5C3A1E] sm:w-16 sm:text-[10px]">
                  {t(`tree.${node.id}.name`)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Карточка выбранного узла: весь текст эффекта — крупно и читаемо */}
        {(() => {
          const def = TREE_MAP[sel]
          const lvl = tree[sel] ?? 0
          const check = canBuy(sel, tree, totalXp)
          const ready = check === 'ok'
          return (
            <div
              className="mt-1 rounded-xl border-2 border-[#e3cba4] bg-white p-2.5 text-left"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 text-lg ${styles[nodeState(sel)]}`}
                >
                  {def.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-pixel text-[13px] font-bold text-[#5C3A1E]">
                    {t(`tree.${sel}.name`)}
                  </div>
                  <div className="font-ui text-[10px] font-semibold text-[#8a5330]">
                    {t('tree.card.level', { a: lvl, b: def.maxLevel })}
                    {def.reqLevel > 1 && ` · ${t('tree.locked', { n: def.reqLevel })}`}
                  </div>
                </div>
              </div>

              <p className="mt-1.5 font-ui text-[11px] leading-snug text-[#5C3A1E]">
                {lvl > 0 ? (
                  <>
                    {t('tree.card.now')}{' '}
                    <b>{t(`tree.${sel}.effect`, { n: treeEffectN(sel, lvl) })}</b>
                    {check !== 'max' && (
                      <>
                        {' · '}
                        {t('tree.card.next')}{' '}
                        <b>{t(`tree.${sel}.effect`, { n: treeEffectN(sel, lvl + 1) })}</b>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {t('tree.card.gives')}{' '}
                    <b>{t(`tree.${sel}.effect`, { n: treeEffectN(sel, 1) })}</b>
                  </>
                )}
              </p>

              {ready ? (
                <button
                  type="button"
                  onClick={() => tryBuy(sel)}
                  className="mt-2 w-full rounded-xl bg-[#E24B3B] px-4 py-2 font-pixel text-[12px] font-bold text-white shadow-[0_3px_0_#9c2f22] transition hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_#9c2f22]"
                >
                  {t('tree.buy')}
                </button>
              ) : (
                <p
                  className={`mt-2 rounded-xl px-3 py-1.5 text-center font-pixel text-[10px] font-bold ${
                    check === 'max'
                      ? 'bg-[#eaf3dd] text-[#3f6b28]'
                      : 'bg-[#f3e2c8] text-[#8a5330]'
                  }`}
                >
                  {check === 'max'
                    ? t('tree.maxed')
                    : check === 'root'
                      ? t('tree.needParent', {
                          s: def.parent ? t(`tree.${def.parent}.name`) : t('tree.harvest.name'),
                        })
                      : check === 'level'
                        ? t('tree.needLevel', { n: def.reqLevel })
                        : t('tree.needPoints')}
                </p>
              )}
            </div>
          )
        })()}

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
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-6"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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

/** 3700 → «1 ч 1 м», 590 → «< 1 мин» — короткий формат игрового времени */
function fmtPlaytime(secs: number, t: TranslateFn): string {
  const s = Math.max(0, Math.floor(secs))
  if (s < 60) return t('stats.lt1m')
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h} ${t('stats.h')} ${m} ${t('stats.m')}` : `${m} ${t('stats.m')}`
}

/** Строка статистики: иконка — подпись — значение */
function StatsLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-[#f0e0c8] py-1 first:border-t-0 first:pt-0">
      <span className="flex min-w-0 items-center gap-1.5 font-ui text-[11px] font-semibold text-[#5C3A1E]">
        <span aria-hidden>{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-pixel text-[12px] font-bold tabular-nums text-[#8a5330]">
        {value}
      </span>
    </div>
  )
}

/** Экран «Настройки»: язык, сложность, качество, ориентация, перки, экран, вибрация */
function SettingsOverlay({
  settings,
  onChange,
  nick,
  onEditNick,
  t,
  onClose,
}: {
  settings: GameSettings
  onChange: (s: GameSettings) => void
  /** Текущий ник персонажа — показываем в настройках */
  nick: string
  /** Открыть диалог смены ника */
  onEditNick: () => void
  t: TranslateFn
  onClose: () => void
}) {
  const set = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch })
  /* Локальная статистика устройства: читаем один раз при открытии настроек */
  const [local] = useState(() => getLife())
  /* Ф0-4: код-бэкап — экспорт/импорт сохранения одной строкой */
  const [saveCode, setSaveCode] = useState('')
  const [importDraft, setImportDraft] = useState('')
  const [saveNote, setSaveNote] = useState<{ ok: boolean; msg: string } | null>(null)

  const doExport = () => {
    try {
      const code = exportSaveCode()
      setSaveCode(code)
      if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(code)
      setSaveNote({ ok: true, msg: t('set.save.exported') })
    } catch {
      setSaveNote({ ok: false, msg: t('set.save.badcode') })
    }
  }
  const copySaveCode = () => {
    if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(saveCode)
    setSaveNote({ ok: true, msg: t('set.save.exported') })
  }
  const doImport = () => {
    try {
      if (importSaveCode(importDraft) < 0) throw new Error('bad')
      setSaveNote({ ok: true, msg: t('set.save.imported') })
      window.setTimeout(() => window.location.reload(), 1300)
    } catch {
      setSaveNote({ ok: false, msg: t('set.save.badcode') })
    }
  }
  const [best] = useState(() => Number(window.localStorage.getItem(BEST_KEY) ?? 0))
  /* Мировая статистика: свежие цифры при каждом открытии настроек */
  const [world, setWorld] = useState<{
    status: 'loading' | 'on' | 'off'
    stats?: { launches: number; runs: number; players: number; playSecs?: number; visitors?: number }
  }>({ status: 'loading' })
  useEffect(() => {
    let alive = true
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((d: { online?: boolean; stats?: { launches: number; runs: number; players: number; playSecs?: number; visitors?: number } }) => {
        if (!alive) return
        if (d?.online && d.stats) setWorld({ status: 'on', stats: d.stats })
        else setWorld({ status: 'off' })
      })
      .catch(() => {
        if (!alive) return
        setWorld({ status: 'off' })
      })
    return () => {
      alive = false
    }
  }, [])
  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:p-5"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
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

          {/* Ник персонажа: тап — диалог смены (раньше был в главном меню) */}
          <section>
            <div className="mb-1 font-pixel text-[12px] font-bold text-[#8a5330]">
              🐱 {t('set.nick')}
            </div>
            <button
              type="button"
              onClick={onEditNick}
              className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-[#e3cba4] bg-white px-3 py-2.5 transition hover:border-amber-400 active:scale-[0.99]"
            >
              <span className="min-w-0 truncate font-pixel text-base font-bold text-[#5C3A1E]">
                {nick}
              </span>
              <span className="flex shrink-0 items-center gap-1 font-pixel text-[10px] font-bold text-[#8a5330]">
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                {t('set.nick.edit')}
              </span>
            </button>
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

          {/* Статистика: устройство и весь мир — отдельно от таблицы лидеров */}
          <section className="space-y-2">
            <div className="font-pixel text-[12px] font-bold text-[#8a5330]">
              📊 {t('set.stats')}
            </div>

            {/* На этом устройстве */}
            <div className="rounded-xl border-2 border-[#e3cba4] bg-white px-2.5 py-2">
              <div className="mb-1 font-pixel text-[10px] font-bold text-[#B33A26]">
                📱 {t('set.stats.here')}
              </div>
              <StatsLine icon="⏱" label={t('set.stats.time')} value={fmtPlaytime(local.secs, t)} />
              <StatsLine icon="🏆" label={t('set.stats.record')} value={String(Math.max(0, best))} />
              <StatsLine icon="🎬" label={t('set.stats.runs')} value={String(local.runs)} />
              <StatsLine icon="🚀" label={t('set.stats.launches')} value={String(local.visits)} />
            </div>

            {/* Весь мир */}
            <div className="rounded-xl border-2 border-[#e3cba4] bg-white px-2.5 py-2">
              <div className="mb-1 font-pixel text-[10px] font-bold text-[#B33A26]">
                🌍 {t('set.stats.world')}
              </div>
              {world.status === 'on' && world.stats ? (
                <>
                  <StatsLine
                    icon="⏱"
                    label={t('set.stats.time')}
                    value={fmtPlaytime(world.stats.playSecs ?? 0, t)}
                  />
                  <StatsLine icon="🚀" label={t('set.stats.launches')} value={String(world.stats.launches)} />
                  <StatsLine icon="🎬" label={t('set.stats.runs')} value={String(world.stats.runs)} />
                  <StatsLine icon="🐱" label={t('set.stats.users')} value={String(world.stats.visitors ?? world.stats.players)} />
                  <StatsLine icon="🎮" label={t('set.stats.players')} value={String(world.stats.players)} />
                </>
              ) : (
                <p className="py-0.5 font-ui text-[11px] font-medium text-[#a97c50]">
                  {world.status === 'loading' ? t('lead.checking') : t('set.stats.offline')}
                </p>
              )}
            </div>
          </section>

          {/* Ф0-4: код-бэкап — весь прогресс одной строкой на любое устройство */}
          <section className="space-y-2">
            <div className="font-pixel text-[12px] font-bold text-[#8a5330]">💾 {t('set.save')}</div>
            <p className="font-ui text-[11px] font-medium leading-snug text-[#a97c50]">
              {t('set.save.hint')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={doExport}
                className="rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2.5 font-pixel text-[11px] font-bold text-[#5C3A1E] transition hover:border-[#E24B3B] active:scale-[0.98]"
              >
                ⬇ {t('set.save.export')}
              </button>
              <button
                type="button"
                onClick={doImport}
                disabled={importDraft.trim().length < 20}
                className="rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2.5 font-pixel text-[11px] font-bold text-[#5C3A1E] transition enabled:hover:border-[#E24B3B] enabled:active:scale-[0.98] disabled:opacity-50"
              >
                ⬆ {t('set.save.import')}
              </button>
            </div>
            <textarea
              value={importDraft}
              onChange={(e) => setImportDraft(e.target.value)}
              rows={3}
              placeholder={t('set.save.placeholder')}
              aria-label={t('set.save.placeholder')}
              className="w-full resize-none rounded-xl border-2 border-[#e3cba4] bg-white px-3 py-2 font-mono text-[10px] leading-snug text-[#5C3A1E] outline-none transition placeholder:text-[#c9a97a] focus:border-amber-400"
            />
            {saveCode !== '' && (
              <div className="rounded-xl border-2 border-[#e3cba4] bg-white px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[10px] font-bold text-[#B33A26]">
                    {t('set.save.codeAria')}
                  </span>
                  <button
                    type="button"
                    onClick={copySaveCode}
                    className="font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
                  >
                    ⎘ {t('set.save.copy')}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={saveCode}
                  rows={3}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label={t('set.save.codeAria')}
                  className="mt-1 w-full resize-none bg-transparent font-mono text-[10px] leading-snug text-[#5C3A1E] outline-none"
                />
              </div>
            )}
            {saveNote && (
              <p
                role="status"
                className={`font-ui text-[11px] font-semibold ${saveNote.ok ? 'text-[#3e7a44]' : 'text-[#B33A26]'}`}
              >
                {saveNote.msg}
              </p>
            )}
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

/** Диалог ника: mode='gate' — первый вход (после забега или в меню-страховке),
    mode='edit' — смена ника в меню. afterRun — текст «первый забег позади!» */
function NickDialog({
  mode,
  current,
  t,
  onDone,
  onClose,
  afterRun = false,
}: {
  mode: 'gate' | 'edit'
  current: string
  t: TranslateFn
  onDone: (name: string) => void
  onClose: () => void
  afterRun?: boolean
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
      exit={{ opacity: 0, pointerEvents: 'none' }}
    >
      <motion.div
        className="my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div aria-hidden className="text-4xl">
          🐱
        </div>
        <h2 className="mt-1 font-pixel text-xl font-bold text-[#B33A26]">
          {mode === 'gate' ? (afterRun ? t('nick.after.title') : t('nick.gate.title')) : t('nick.edit.title')}
        </h2>
        {mode === 'gate' ? (
          <p className="mt-1 font-ui text-xs font-medium leading-snug text-[#8a5330]">
            {afterRun ? t('nick.after.desc') : t('nick.gate.desc')}
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

/* ---------- Ф0-4: код-бэкап сохранения ---------- */

/** Собрать все popcorn-* ключи localStorage в base64-код.
    device id не включаем: у каждого устройства свой след в мировом лидерборде */
function exportSaveCode(): string {
  flushLife() // дольём ленивую статистику, чтобы код был свежим
  const bag: Record<string, string> = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && k.startsWith('popcorn-') && k !== DEVICE_KEY) {
      bag[k] = window.localStorage.getItem(k) ?? ''
    }
  }
  const json = JSON.stringify(bag)
  const bytes = new TextEncoder().encode(json)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return window.btoa(bin)
}

/** Вставить код сохранения: возвращает число восстановленных ключей,
    -1 — код битый/чужой. device id не трогаем даже если он в коде */
function importSaveCode(raw: string): number {
  const bin = window.atob(raw.trim())
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0))
  const obj = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
  if (!obj || typeof obj !== 'object') return -1
  const entries = Object.entries(obj).filter(
    ([k, v]) => k.startsWith('popcorn-') && k !== DEVICE_KEY && typeof v === 'string',
  ) as Array<[string, string]>
  if (entries.length < 3) return -1
  for (const [k, v] of entries) window.localStorage.setItem(k, v)
  return entries.length
}

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
    c.imageSmoothingEnabled = true /* гладкое зерно на шерин-карточке */
    const spr = makeSmoothPopcornSprite('white')
    c.drawImage(spr.canvas, 300 - 80, 66, 160, 160)
    c.textAlign = 'center'
    c.fillStyle = '#B33A26'
    c.font = '700 44px "Handjet", system-ui, sans-serif'
    c.fillText('P.O.P.', 300, 282)
    c.fillStyle = '#8a5330'
    c.font = '600 26px "Handjet", system-ui, sans-serif'
    c.fillText(t('app.title'), 300, 326)
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
  const layoutRef = useRef<() => void>(() => {})
  const devRef = useRef<{
    fast: boolean
    forced: PerkId | null
    fever: boolean
    poster: boolean
    mine: number
    mineShown: boolean
    /** DEV QA: старт забега с уровня N (?lvl=20/30/100 — проверка кривых) */
    lvl: number
  }>({
    fast: false,
    forced: null,
    fever: false,
    poster: false,
    mine: 0,
    mineShown: false,
    lvl: 0,
  })
  /* Полоса сравнения вариантов мины: показывается только при ?mine=N */
  const [mineStrip, setMineStrip] = useState<{ on: boolean; active: number }>({
    on: false,
    active: 0,
  })
  /* Сердечки: сколько было на прошлом HUD-тике (потеря → ачивка «Первый шрам») */
  const prevHeartsRef = useRef<number>(5)
  /* Серия уровней без потери сердец (ачивка «Целая и невредимая») */
  const heartFreeStreakRef = useRef<number>(0)
  const equippedRef = useRef<PawId>(DEFAULT_PAW)
  /** Счёт забега, уже зачисленный в банк опыта (очки = опыт) */
  const lastScoreRef = useRef(0)
  /** Опыт 🍿, заработанный ТЕКУЩИМ забегом (курс 10:1 с округлением вниз по дельтам) */
  const runXpGainRef = useRef(0)
  const [runXpGain, setRunXpGain] = useState(0)
  /* Настройки: язык, сложность, качество, ориентация, перки, экран, вибрация */
  const [settings, setSettings] = useSettings()
  const settingsRef = useRef(settings)

  const [phase, setPhase] = useState<Phase>('start')
  /** Таймер «празднования» перед бонус-нарезкой: даём салюту програть */
  const slicerDelayRef = useRef<number | null>(null)
  /** Таймер перебивки: ждём секунду празднования, потом показываем плакат */
  const posterDelayRef = useRef<number | null>(null)
  /** Сколько плакатов уже показано в забеге: для строгой ротации 1→2→…→6→1 */
  const posterSeqRef = useRef(0)
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
    runGrains: 0,
    runNipples: 0,
    minesHit: 0,
    shieldSaves: 0,
    hearts: 5,
    maxHearts: 5,
    mineOn: false,
    goldenOn: false,
    bigCaught: 0,
    bigCoins: 0,
    bigCaramel: 0,
    bigCherry: 0,
    bigGrape: 0,
    boss: false,
    bossHp: 0,
    bossMaxHp: 0,
    bossKills: 0,
    bossKidKills: 0,
    bossLionKills: 0,
    bossMartenKills: 0,
    bossPigeonKills: 0,
    bossGypsyKills: 0,
    bossClean: false,
    bossCoins: 0,
    goldCoins: 0,
    giftFreeze: 0,
    giftMult: 1,
    giftMultLeft: 0,
    giftsRun: 0,
  })
  const [bestRaw, storeBest] = useStoredValue(BEST_KEY, '0')
  const [mutedRaw, storeMuted] = useStoredValue(MUTE_KEY, '0')
  const best = Number(bestRaw) || 0
  const muted = mutedRaw === '1'
  const [result, setResult] = useState<ResultState | null>(null)
  const [clearInfo, setClearInfo] = useState<ClearState | null>(null)
  /** ПЛАКАТНАЯ ПЕРЕБИВКА: каждые 5 уровней после победы показываем
      трудовой плакат Наны. mode: 'normal' — дальше нарезка и сундучок,
      'fever' — сразу Лихорадка (перебивка врезается до ветки Fever,
      чтобы рубеж не потерялся при выпадении бонус-уровня) */
  const [posterPending, setPosterPending] = useState<{
    level: number
    mode: 'normal' | 'fever'
    posterIdx: number
  } | null>(null)
  /** ИНТРО БОССА (0.0.42): карточка «КАК ПОБЕДИТЬ?» перед босс-уровнем.
      Движок держит геймплей на introHold, пока игрок не нажмёт «В БОЙ!» */
  const [bossIntro, setBossIntro] = useState<{ level: number; kind: BossKind } | null>(null)
  const [offers, setOffers] = useState<PerkDef[]>([])
  /** Подарки в сундуках: монетки/опыт (null — только перк) */
  const [extras, setExtras] = useState<Array<ChestExtra | null>>([null, null, null])
  const [openedIdx, setOpenedIdx] = useState<number | null>(null)
  const [runLevel, setRunLevel] = useState(2)
  const [perk, setPerk] = useState<PerkId | null>(null)
  /** Тост «Котик подрос»: уровень персонажа вырос */
  const [charToast, setCharToast] = useState<number | null>(null)
  /** Названия разблокировок в тосте повышения уровня (v0.0.33) */
  const [charToastUnlocks, setCharToastUnlocks] = useState<string[]>([])
  /** Разблокировки, открывшиеся за весь забег — список на экране результатов */
  const [runLevelUnlocks, setRunLevelUnlocks] = useState<string[]>([])
  /** HTML-индикатор волны: виден поверх попкорнового тумана (туман — в канвасе) */
  const [waveToast, setWaveToast] = useState<number | null>(null)
  /* ---------- Ф0-2: туториал первого забега ----------
     Логика живёт в ref (onStats создаётся один раз и видит актуальные данные),
     tutStep — только для рендера облачка. Шаги: 1 палец · 2 зёрна ·
     3 мины · 4 золото · 5 комбо; 0 — неактивен */
  const [tutStep, setTutStep] = useState(0)
  const tutRef = useRef({
    active: false,
    step: 0,
    pawMoved: false,
    seenMine: false,
    seenGolden: false,
    seenCombo: false,
    /** ТС времени первого появления мины/золота на поле в этом шаге (0 — ещё не было) */
    mineAt: 0,
    goldenAt: 0,
    /** Дедлайн пятого шага (комбо): показываем подсказку ещё 5с после триггера */
    comboHold: 0,
    stepAt: 0,
  })
  /** Номер волны, для которой тост уже показан — не перезапускаем анимацию */
  const waveShownRef = useRef(0)
  /** Таймер скрытия тоста волны: гасим при новой волне, чтобы не мигало */
  const waveTimerRef = useRef<number | null>(null)
  /** Тост «монетки за Лихорадку» — сколько 🪙 упало в кошелёк */
  const [feverCoins, setFeverCoins] = useState<number | null>(null)
  /** Сколько счётчиков забега уже учтено в пожизненной статистике (ачивки) */
  const prevRunRef = useRef({ grains: 0, golden: 0, pigeons: 0, nipples: 0, mines: 0, saves: 0 })
  /** Большие попкорнины/босс за забег: дельты для пожизненных счётчиков и ачивок */
  const prevBigRef = useRef({ big: 0, caramel: 0, cherry: 0, grape: 0 })
  const prevBossKillsRef = useRef(0)
  /** Победы по видам боссов за забег: дельты для ачивок ЛЬВА и ЛАНЫ (v0.0.33) */
  const prevBossKidRef = useRef(0)
  const prevBossLionRef = useRef(0)
  const prevBossMartenRef = useRef(0)
  const prevBossPigeonRef = useRef(0)
  const prevBossGypsyRef = useRef(0)
  /** Уровень котика на старте забега — экран результатов покажет повышение.
      Дубль в состоянии для рендера + ref для колбэков движка */
  const [runStartLevel, setRunStartLevel] = useState(1)
  const runStartLevelRef = useRef(1)
  /** Сколько опыта уже показано чипом 🍿 в HUD (чтобы не дёргать setState впустую) */
  const lastRunXpShownRef = useRef(0)
  /** Таймер тоста повышения уровня: общий для очков забега и наград этапов */
  const lvlToastTimerRef = useRef<number | null>(null)
  /** БОЛЬШАЯ ПОПКОРНИНА: сколько монеток за неё уже выдано в этом забеге */
  const bigCoinsPaidRef = useRef(0)
  /** Монетки за победы над боссами, уже выданные в этом забеге */
  const bossCoinsPaidRef = useRef(0)
  /** «Золотая сдача»: монетки за золотые зёрна, уже выданные в этом забеге */
  const goldCoinsPaidRef = useRef(0)
  /** Когда начался текущий забег (ачивка-марафон) */
  const runStartRef = useRef(0)
  /** Серверный забег мирового лидерборда: HMAC-токен для защищённого submit */
  const runTokenRef = useRef<{ runId: string; token: string; startedAt: number } | null>(null)

  /* Мета-прогресс: опыт, магазин лапок, апгрейды, ачивки, лидеры, имя */
  const [xpRaw, storeXp] = useStoredValue(XP_KEY, '0')
  /** Суммарный опыт за всё время — уровень котика */
  const [totalRaw] = useStoredValue(TOTAL_KEY, '0')
  /** Монетки — валюта артефактных лапок */
  const [coinsRaw] = useStoredValue('popcorn-coins', '0')
  const [pawRaw, storePaw] = useStoredValue(PAW_KEY, DEFAULT_PAW)
  const [ownedRaw, storeOwned] = useStoredValue(OWNED_KEY, JSON.stringify([DEFAULT_PAW]))
  const [leadersRaw] = useStoredValue(LEADERS_KEY, '[]')
  const [upgRaw, storeUpgrades] = useStoredValue(
    UPG_KEY,
    JSON.stringify({ capacity: 0, life: 0, startperk: 0, hearts: 0 }),
  )
  const [achRaw] = useStoredValue(ACH_KEY, '[]')
  const [nameRaw, storeName] = useStoredValue(NAME_KEY, 'Котик')
  const [nickSetRaw, storeNickSet] = useStoredValue(NICKSET_KEY, '0')
  /* Ф0-1: новичок играет сразу, ник спрашиваем ПОСЛЕ первого забега.
     playedOnce = у игрока уже есть хотя бы один забег за всё время.
     useSyncExternalStore гидратационно-безопасен: SSR — false, клиент — по факту */
  const playedOnce = useSyncExternalStore(
    subscribeStore,
    () => getLife().runs > 0,
    () => false,
  )
  const [nickEdit, setNickEdit] = useState(false)
  const [overlay, setOverlay] = useState<
    | 'leaders'
    | 'shop'
    | 'creators'
    | 'rules'
    | 'ach'
    | 'settings'
    | 'install'
    | 'tree'
    | 'travel'
    | 'mshop'
    | 'market'
    | null
  >(null)
  const [achToast, setAchToast] = useState<{ icon: string; name: string } | null>(null)
  const [shareNote, setShareNote] = useState<string | null>(null)
  /* Мировой рекорд отклонён сервером (тост на экране результата) */
  const [leaderNote, setLeaderNote] = useState(false)
  /* Мировая статистика: запуски/забеги/котики + время в игре и пользователи (null — офлайн) */
  const [worldStats, setWorldStats] = useState<{
    launches: number
    runs: number
    players: number
    playSecs?: number
    visitors?: number
  } | null>(null)
  const installRef = useRef<InstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  /** Игра уже работает как установленное приложение (standalone/fullscreen) */
  const [isStandalone, setIsStandalone] = useState(false)
  /* Древо улучшений: купленные узлы (localStorage + событие магазина) */
  const [treeRaw] = useStoredValue(TREE_KEY, '{}')
  const tree = useMemo(() => parseTreeRaw(treeRaw), [treeRaw])
  /** Числовые бонусы древа — в ref для колбэков без перезапуска эффектов */
  const treeRef = useRef<TreeBonus>(ZERO_BONUS)
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

  /* Скрытые dev-параметры URL: ?fast=1 (короткая норма), ?perk=hover (гарантированный перк),
     ?fever=1 (лихорадка после каждого уровня — для проверки),
     ?poster=1 (плакатная перебивка после КАЖДОГО уровня — для проверки),
     ?mine=N (вариант звезды-мины 1..4 + полоса сравнения в углу),
     ?lvl=N (старт забега с уровня N — QA кривых 20/30/100) */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const mineRaw = parseInt(sp.get('mine') ?? '', 10)
    const mine =
      Number.isFinite(mineRaw) && mineRaw >= 1 && mineRaw <= MINE_VARIANTS ? mineRaw - 1 : 0
    const lvlRaw = parseInt(sp.get('lvl') ?? '', 10)
    const lvl = Number.isFinite(lvlRaw) && lvlRaw >= 1 && lvlRaw <= 999 ? lvlRaw : 0
    devRef.current = {
      fast: sp.has('fast'),
      forced: (sp.get('perk') as PerkId | null) ?? null,
      fever: sp.has('fever'),
      poster: sp.has('poster'),
      mine,
      mineShown: sp.has('mine'),
      lvl,
    }
    /* Dev-полоса — чисто клиентский оверлей: откладываем на следующий кадр,
       чтобы не словить hydration mismatch (SSR рисует страницу без неё) */
    const raf = window.requestAnimationFrame(() => {
      setMineStrip({ on: sp.has('mine'), active: mine })
    })
    return () => window.cancelAnimationFrame(raf)
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
      mineVariant: devRef.current.mine,
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
    /* Локальные запуски сайта — для статистики в настройках */
    addLife({ visits: 1 })
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device: getDeviceId() }),
    })
      .then((r) => r.json())
      .then(
        (d: {
          ok?: boolean
          stats?: {
            launches: number
            runs: number
            players: number
            playSecs?: number
            visitors?: number
          }
        }) => {
          if (d?.stats) setWorldStats(d.stats)
        },
      )
      .catch(() => {})
  }, [])

  /* ===== Куница NANA: растёт от пройденных уровней и времени в игре ===== */
  const marten = useSyncExternalStore(subscribeMarten, getMartenSnapshot, () => DEFAULT_MARTEN)
  /* ===== РЫНОК: зерновой сейф, артефакты и счётчик кликов ===== */
  const market = useSyncExternalStore(subscribeMarket, getMarketSnapshot, () => DEFAULT_MARKET)
  const [martenCheer, setMartenCheer] = useState(false)
  const martenStage = stageOf(marten)
  /* Боевой уровень куницы (xp от очков и путешествий) + тост левелапа */
  const martenLvl = useMemo(() => martenLevelOf(marten), [marten])
  const [martenLvlToast, setMartenLvlToast] = useState<number | null>(null)
  /* «Беспорядок NANA»: куница рассыпала попкорн — уровень куницы растит
     норму/волны/мины забегов. Держим готовые значения для UI и движка */
  const mess = useMemo(() => martenMess(martenLvl.level), [martenLvl.level])
  useEffect(() => {
    engineRef.current?.setMartenMess(mess)
  }, [mess])
  /* Секунды забега копятся в ref и периодически сбрасываются в копилку роста */
  const playSecsRef = useRef(0)
  /** Секунды текущего забега — в конце уходят в статистику (настройки + мир) */
  const runSecsRef = useRef(0)

  /* Множители артефактов рынка — в ref для колбэков без перезапуска эффектов */
  const marketRef = useRef<MarketBonuses>(ZERO_MARKET_BONUS)
  useEffect(() => {
    marketRef.current = marketBonuses(market)
  }, [market])
  /* Те же множители для рендера (карточки путешествий показывают итоговые награды) */
  const marketBonus = useMemo<MarketBonuses>(() => marketBonuses(market), [market])

  /* Сеттер банка опыта в ref: обменник рынка пишет напрямую, без зависимостей */
  const storeXpRef = useRef(storeXp)
  useEffect(() => {
    storeXpRef.current = storeXp
  }, [storeXp])

  /** Добавить прогресс куницы; при переходе на новую стадию — праздничная плашка */
  const growMarten = useCallback((lv: number, sec: number) => {
    const before = stageOf(getMartenSnapshot())
    const next = addMartenProgress(lv, sec)
    if (stageOf(next) > before) {
      setMartenCheer(true)
      window.setTimeout(() => setMartenCheer(false), 4000)
    }
  }, [])

  /** Дать кунице боевой опыт; при новом уровне — тост «NANA подросла» */
  const grantMartenXp = useCallback((n: number) => {
    const before = martenLevelOf(getMartenSnapshot()).level
    addMartenXp(n)
    const after = martenLevelOf(getMartenSnapshot()).level
    if (after > before) {
      setMartenLvlToast(after)
      window.setTimeout(() => setMartenLvlToast(null), 3600)
    }
  }, [])

  /* ===== КЛИКЕР: тап по кунице/комнате = опыт NANA + монетки =====
     Опыт: 1 базово + шляпка (+1…+9🐾). Монетки: база по уровню NANA
     (+1🪙 за 10 уровней, потолок 3) + «Погремушка» (+2), затем
     «Кликер-колокольчик» ×1.5 (округление вверх) — так кликер остаётся
     карманным доходом, а не обгоняет награду за целый уровень.
     Частицы «+N» рисует сцена — передаём ей честные значения. */
  const tapCoins = useMemo(() => {
    const base = nanaClickCoins(martenLvl.level) + Math.max(0, Math.round(marketBonus.clickAdd))
    return Math.max(1, Math.ceil(base * Math.max(1, marketBonus.clickCoin)))
  }, [martenLvl.level, marketBonus.clickAdd, marketBonus.clickCoin])
  const tapXp = useMemo(() => 1 + (HATS_MAP[marten.hat] ?? HATS_MAP.none).clickXp, [marten.hat])
  const handleMartenTap = useCallback(() => {
    addCoins(tapCoins)
    countClick()
    /* grantMartenXp (не addMartenXp): левелап от кликера тоже показывает тост */
    grantMartenXp(tapXp)
  }, [tapXp, tapCoins, grantMartenXp])

  /* Тик таймера путешествия: перерисовка раз в секунду, пока NANA в пути */
  const [, tripTick] = useReducer((c: number) => c + 1, 0)
  const tripActive = marten.trip !== null
  useEffect(() => {
    if (!tripActive) return
    const iv = window.setInterval(tripTick, 1000)
    return () => window.clearInterval(iv)
  }, [tripActive])

  /* Куница вернулась, пока открыт экран путешествия — один звук по готовности */
  const tripReadyAnnouncedRef = useRef<string | null>(null)
  const tripReady = marten.trip !== null && Date.now() >= marten.trip.endsAt
  useEffect(() => {
    if (tripReady && marten.trip) {
      if (tripReadyAnnouncedRef.current !== marten.trip.id) {
        tripReadyAnnouncedRef.current = marten.trip.id
        audio.play('coin')
      }
    } else {
      tripReadyAnnouncedRef.current = null
    }
  }, [tripReady, marten.trip])

  /* ===== Управление куницей: путешествия, лавка, рынок ===== */

  const handleSendTrip = useCallback((id: TripId) => {
    audio.play('click')
    /* Множители артефактов и уровня NANA фиксируются в момент отправки:
       Карта странствий (💎/🐾), уровень NANA, Хрюшка (🪙) и Ситечко (🌾)
       — чтобы показанное в списке совпадало с реально выплаченным */
    const b = marketRef.current
    const lvlBonus = nanaLevelBonus(martenLevelOf(getMartenSnapshot()).level)
    startMartenTrip(id, b.gemTrip * lvlBonus, b.xpTrip * lvlBonus, b.coinGift, b.grain)
  }, [])

  const handleClaimTrip = useCallback(() => {
    const before = martenLevelOf(getMartenSnapshot()).level
    const res = claimMartenTrip()
    if (!res) return
    audio.play('coin')
    /* Особый лут дальних маршрутов: монетки котика и зёрна в сейф */
    if (res.coins > 0) addCoins(res.coins)
    if (res.grains > 0) addGrains(res.grains)
    const after = martenLevelOf(getMartenSnapshot()).level
    if (after > before) {
      setMartenLvlToast(after)
      window.setTimeout(() => setMartenLvlToast(null), 3600)
    }
  }, [])

  const handleBuyBoots = useCallback((id: BootsId) => {
    if (buyMartenBoots(id)) {
      audio.play('coin')
    } else {
      audio.play('penalty')
    }
  }, [])

  const handleEquipBoots = useCallback((id: BootsId) => {
    audio.play('click')
    equipMartenBoots(id)
  }, [])

  const handleBuyHat = useCallback((id: HatId) => {
    if (buyMartenHat(id)) {
      audio.play('coin')
    } else {
      audio.play('penalty')
    }
  }, [])

  const handleEquipHat = useCallback((id: HatId) => {
    audio.play('click')
    equipMartenHat(id)
  }, [])

  const handleBuyBag = useCallback((id: BagId) => {
    if (buyMartenBag(id)) {
      audio.play('coin')
    } else {
      audio.play('penalty')
    }
  }, [])

  const handleEquipBag = useCallback((id: BagId) => {
    audio.play('click')
    equipMartenBag(id)
  }, [])

  /* ===== РЫНОК: обмен валют ===== */
  const handleExchange = useCallback((from: Currency, to: Currency, amount: number): boolean => {
    const quote = exchangeQuote(from, to, amount)
    if (from === to || amount <= 0 || quote <= 0) return false
    /* Списываем валюту from */
    if (from === 'gems') {
      if (!spendMartenDiamonds(amount)) return false
    } else if (from === 'coins') {
      if (getCoins() < amount) return false
      addCoins(-amount)
    } else if (from === 'xp') {
      const bank = Math.max(0, Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0)
      if (bank < amount) return false
      /* Прямая запись: рынок не добавляет стаж котику — только банк опыта */
      storeXpRef.current(String(bank - amount))
    } else {
      if (!spendGrains(amount)) return false
    }
    /* Начисляем валюту to */
    if (to === 'gems') {
      addMartenDiamonds(quote)
    } else if (to === 'coins') {
      addCoins(quote)
    } else if (to === 'xp') {
      const bank = Math.max(0, Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0)
      storeXpRef.current(String(bank + quote))
    } else {
      addGrains(quote)
    }
    audio.play('coin')
    return true
  }, [])

  /* ===== РЫНОК: покупка постоянного артефакта за алмазы ===== */
  const handleBuyArtifact = useCallback((id: ArtifactId) => {
    const def = ARTIFACT_MAP[id]
    if (!def) return
    if (getMarketSnapshot().artifacts.includes(id)) return
    /* v0.0.33: артефакт закрыт до нужного уровня котика — даже с алмазами */
    if (artifactReqLevel(id) > charLevel(getTotalXp())) {
      audio.play('penalty')
      return
    }
    if (getMartenSnapshot().diamonds < def.price) {
      audio.play('penalty')
      return
    }
    if (spendMartenDiamonds(def.price) && buyArtifact(id, def.price)) {
      audio.play('perk')
    } else {
      audio.play('penalty')
    }
  }, [])

  /* Таймер времени в игре: +1 сек, каждые 20 сек — флеш в копилку куницы */
  useEffect(() => {
    if (phase !== 'playing') return
    const iv = window.setInterval(() => {
      playSecsRef.current += 1
      runSecsRef.current += 1
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
      /* Незачтённые секунды забега — в локальную статистику (закрыл страницу посреди забега) */
      if (runSecsRef.current > 0) {
        addLife({ secs: runSecsRef.current })
        runSecsRef.current = 0
      }
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

  /* Раскладка холста: канвас всегда занимает контейнер целиком.
     (Перки-трансформации — поворот экрана, зеркало — удалены в 0.0.41:
     инвертированное управление не нравилось игрокам) */
  const applyLayout = useCallback(() => {
    const main = mainRef.current
    const canvas = canvasRef.current
    if (!main || !canvas) return
    const cw = main.clientWidth
    const ch = main.clientHeight
    if (cw === 0 || ch === 0) return
    engineRef.current?.handleResize(cw, ch)
    canvas.style.width = `${cw}px`
    canvas.style.height = `${ch}px`
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.transform = 'none'
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

  /** Проверить пожизненные условия ачивок: счётчики стажа, монеты, банк,
      уровень котика, время в игре. Дёшево — можно звать после любого события. */
  const checkLifeAch = useCallback(() => {
    const L = getLife()
    const cand: AchId[] = []
    if (L.grains >= 5000) cand.push('grainsLife5k')
    if (L.grains >= 25000) cand.push('grainsLife25k')
    if (L.grains >= 50000) cand.push('grainsLife50k')
    if (L.grains >= 100000) cand.push('grainsLife100k')
    if (L.golden >= 100) cand.push('golden100')
    if (L.golden >= 250) cand.push('goldenLife250')
    if (L.pigeons >= 25) cand.push('pigeon25')
    if (L.pigeons >= 50) cand.push('pigeon50')
    if (L.pigeons >= 100) cand.push('pigeon100')
    if (L.nipples >= 50) cand.push('nipple50')
    if (L.nipples >= 200) cand.push('nipple200')
    if (L.mines >= 1) cand.push('mine1')
    if (L.fevers >= 10) cand.push('fever10')
    if (L.fevers >= 25) cand.push('fever25')
    if (L.fevers >= 50) cand.push('fever50')
    if (L.curse >= 5) cand.push('curse5')
    if (L.curse >= 25) cand.push('curse25')
    if (L.bonus >= 10) cand.push('bonus10')
    if (L.bonus >= 25) cand.push('bonus25')
    if (L.gifts >= 10) cand.push('gift10')
    if (L.perfects >= 10) cand.push('perfect10')
    /* НОВЫЕ МЕХАНИКИ 0.0.31: босс «МАЛЫШ», большие попкорнины, сорта нарезки */
    if (L.bigGrape >= 5) cand.push('bigGrape5')
    if (L.bossKills >= 5) cand.push('boss5life')
    /* v0.0.34: МАЛЫШ (bossKills) и ЛАНА побеждены за один забег (лев в запасе) */
    if (L.bossKills >= 1 && L.bossMartenKills >= 1) cand.push('menagerie')
    if (L.sliceCaramel > 0 && L.sliceCherry > 0 && L.sliceGrape > 0) cand.push('sliceAll3')
    if (L.runs >= 10) cand.push('runs10')
    if (L.runs >= 25) cand.push('runs25')
    if (L.runs >= 50) cand.push('runs50')
    if (L.runs >= 100) cand.push('runs100')
    if (L.score >= 100000) cand.push('scoreLife100k')
    if (L.score >= 1000000) cand.push('scoreLife1m')
    if (L.secs >= 3600) cand.push('secs3600')
    if (L.secs >= 18000) cand.push('secs18000')
    if (L.visits >= 10) cand.push('visits10')
    if (L.visits >= 50) cand.push('visits50')
    const coins = getCoins()
    if (coins >= 10000) cand.push('coins10k')
    if (coins >= 50000) cand.push('coins50k')
    if (coins >= 100000) cand.push('coins100k')
    if (coins >= 250000) cand.push('coins250k')
    try {
      const bank = Math.max(0, Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0)
      if (bank >= 100000) cand.push('xp100k')
      if (bank >= 50000) cand.push('bank50k')
    } catch {
      /* нет localStorage — не беда */
    }
    const cl = charLevel(getTotalXp())
    if (cl >= 10) cand.push('catlvl10')
    if (cl >= 20) cand.push('catlvl20')
    if (cl >= 30) cand.push('catlvl30')
    if (cl >= 50) cand.push('catlvl50')
    announceAch(cand)
  }, [announceAch])

  /** Начислить дельту очков в банк опыта сразу — 10 очков попкорна = 1 🍿 опыта.
      Та же дельта (с курсом) капает в суммарный стаж котика. Курс ×0.1 держит
      древо и магазин в долгой прогрессии: рекордный забег — это плюс
      несколько уровней, а не полдерева. Отрицательные дельты (мины,
      сгоревшая Лихорадка) бьют по СЧЁТУ, но не по валюте — опыт — стаж,
      он не сгорает */
  const addXpDelta = useCallback((delta: number) => {
    if (!delta) return
    const gain = Math.floor(delta / XP_PER_SCORE)
    if (gain <= 0) return
    runXpGainRef.current += gain
    const cur = Math.max(0, Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0)
    const next = Math.max(0, Math.floor(cur + gain))
    window.localStorage.setItem(XP_KEY, String(next))
    const tot = Math.max(0, Number(window.localStorage.getItem(TOTAL_KEY) ?? 0) || 0)
    window.localStorage.setItem(TOTAL_KEY, String(Math.floor(tot + gain)))
    /* v0.0.33: уровень может вырасти ПРЯМО ЗАБЕГОМ (очки = опыт) —
       тост с плодами роста не ждёт конца этапа. Дубликат исключён:
       awardStage сравнивает уровни на момент своей работы */
    const lvlBefore = charLevel(tot)
    const lvlAfter = charLevel(tot + gain)
    if (lvlAfter > lvlBefore) {
      setCharToast(lvlAfter)
      audio.play('record')
      setCharToastUnlocks(
        unlockNamesForRange(lvlBefore, lvlAfter).map((u) => tFor(settingsRef.current.lang)(u.nameKey)),
      )
      window.clearTimeout(lvlToastTimerRef.current ?? undefined)
      lvlToastTimerRef.current = window.setTimeout(() => {
        setCharToast(null)
        setCharToastUnlocks([])
      }, 3400)
    }
    window.dispatchEvent(new Event(STORE_EVENT))
  }, [])

  /** Награда за пройденный этап: опыт стажа котика + горсть монеток.
      Если уровень персонажа вырос — праздничный тост.
      Древо («Стаж», «Монетный дождь») умножает обе награды.
      ЭКОНОМИКА 0.0.31 (запрос «все цены поднять, все очки уменьшить»):
      монетки скромнее (+10/уровень вместо +30), опыт — 6 + уровень за этап */
  const awardStage = useCallback(
    (lvl: number) => {
      const before = charLevel(getTotalXp())
      /* Награда за этап: монетки ×10 с нулями, опыт — стаж котика.
         Артефакт «Котоакадемия» добавляет +25% к опыту-стажу,
         «Копилка-хрюшка» — +25% к монеткам этапа (бережёт каждую монетку) */
      const tr = treeRef.current
      addTotalXp(Math.round((6 + lvl) * (1 + (tr.xpAdd ?? 0)) * marketRef.current.xpGift))
      addCoins(
        Math.round((40 + (lvl - 1) * 10) * (1 + (tr.coinsAdd ?? 0)) * marketRef.current.coinGift),
      )
      const after = charLevel(getTotalXp())
      if (after > before) {
        setCharToast(after)
        audio.play('record')
        /* v0.0.33: повышение уровня — это ПЛОДЫ роста: тост перечисляет,
           какие лапки/апгрейды/артефакты открылись на новом уровне */
        const unlocks = unlockNamesForRange(before, after).map((u) => t(u.nameKey))
        setCharToastUnlocks(unlocks)
        window.clearTimeout(lvlToastTimerRef.current ?? undefined)
        lvlToastTimerRef.current = window.setTimeout(() => {
          setCharToast(null)
          setCharToastUnlocks([])
        }, 3400)
      }
      checkLifeAch()
    },
    [checkLifeAch, t],
  )

  /** Приз в каждом из трёх сундуков — адекватен «злости» перка:
      тяжёлое проклятье (туман, каменная лапа…) → обязательная компенсация
      опытом 🍿; лёгкое проклятье → изредка мелочь монетками 🪙 или опытом;
      бонусный перк сам по себе приз → сундучок пуст (0).
      Древо «Щедрость» усиливает ценность подарков, а сами награды
      подрастают с уровнем (+5%/уровень) — поздние сундуки не обесцениваются. */
  const rollExtras = useCallback(
    (offers: PerkDef[], lvl: number): Array<ChestExtra | null> => {
      const gift = 1 + (treeRef.current.giftAdd ?? 0)
      const lvlScale = 1 + Math.max(0, lvl - 1) * 0.05
      /* Монетки — с нулями (×10), опыт — по курсу 1/10 очков (округление до 5)
         ЭКОНОМИКА 0.0.31: суммы вдвое скромнее */
      const round10 = (n: number) => Math.max(10, Math.round((n * gift * lvlScale) / 10) * 10)
      const round5 = (n: number) => Math.max(5, Math.round((n * gift * lvlScale) / 5) * 5)
      return offers.map((p) => {
        /* Тяжёлое проклятье — заметная компенсация опытом */
        if (isHarshCurse(p.id)) {
          return { kind: 'xp' as const, n: round5([30, 50, 90][Math.floor(Math.random() * 3)] ?? 30) }
        }
        if (p.curse) {
          /* Лёгкое проклятье — иногда маленький подарок */
          const r = Math.random()
          if (r < 0.4) return { kind: 'coins' as const, n: round10([40, 60, 100][Math.floor(Math.random() * 3)] ?? 40) }
          if (r < 0.6) return { kind: 'xp' as const, n: round5([8, 15, 25][Math.floor(Math.random() * 3)] ?? 8) }
          return null
        }
        /* Бонусный перк — ноль: сам перк и есть приз */
        return null
      })
    },
    [],
  )

  /* Древо улучшений и постоянные апгрейды: при покупке чего-нибудь сразу
     пересобираем общий пакет бонусов (древо + магазин) и перекидываем в движок;
     застройка дерева — тоже ачивки («Садовник», «Лесовод», «Роща», «Дубрава», «Древо жизни») */
  useEffect(() => {
    const bonuses = mergeBonuses(treeBonuses(tree), upgradeBonuses(upgrades))
    treeRef.current = bonuses
    engineRef.current?.setTree(bonuses)
    const cand: AchId[] = []
    if (treeNodesOpened(tree) >= 5) cand.push('tree5')
    const spent = treeSpent(tree)
    if (spent >= 15) cand.push('tree15')
    if (spent >= 30) cand.push('tree30')
    if (spent >= 60) cand.push('tree60')
    if (spent >= TREE_TOTAL_POINTS) cand.push('treeFull')
    if (cand.length > 0) {
      /* Отложенный тост: не дёргаем setState синхронно внутри эффекта */
      window.setTimeout(() => announceAch(cand), 0)
    }
  }, [tree, upgrades, announceAch])

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
        /* Ф0-2: машина туториала — дешёвая, только на тиках статистики */
        if (tutRef.current.active && !s.paused) {
          const T = tutRef.current
          const now = Date.now()
          /* Фиксируем момент первого появления триггера на поле: шаг 3/4 живёт
             3.5с ОТ ЭТОГО момента, а не «пока триггер на поле» — иначе мина,
             простоявшая всю волну, растянула бы шаг на ползабега */
          if (s.mineOn) {
            T.seenMine = true
            if (T.mineAt === 0) T.mineAt = now
          }
          if (s.goldenOn) {
            T.seenGolden = true
            if (T.goldenAt === 0) T.goldenAt = now
          }
          if (s.streak >= 5) T.seenCombo = true
          let next = T.step
          switch (T.step) {
            case 1: /* ждём первого движения лапки */
              if (T.pawMoved) next = 2
              break
            case 2: /* ждём первой сдачи зерна в стаканчик */
              if (s.collected > 0 || now - T.stepAt > 26000) next = 3
              break
            case 3: /* мина: 3.5с после первого появления, запасной лимит 12с */
              if ((T.mineAt > 0 && now - T.mineAt > 3500) || now - T.stepAt > 12000) next = 4
              break
            case 4: /* золотое зерно — так же */
              if ((T.goldenAt > 0 && now - T.goldenAt > 3500) || now - T.stepAt > 12000) next = 5
              break
            case 5: /* комбо — фиксированные 5с после триггера */
              if (T.comboHold === 0 && (T.seenCombo || now - T.stepAt > 15000)) T.comboHold = now + 5000
              if (T.comboHold > 0 && now >= T.comboHold) next = 6
              break
          }
          if (next !== T.step) {
            T.step = next
            T.stepAt = now
            T.mineAt = 0
            T.goldenAt = 0
            T.comboHold = 0
            /* триггер проскакивал на прошлых шагах — короткая напоминалка 3.5с */
            if (next === 3 && T.seenMine) T.mineAt = now
            if (next === 4 && T.seenGolden) T.goldenAt = now
            if (next >= 6) {
              T.active = false
              window.localStorage.setItem(TUT_DONE_KEY, '1')
              setTutStep(0)
            } else {
              setTutStep(next)
            }
          }
        }
        /* Очки = опыт: зачисляем каждую положительную дельту счёта в банк сразу,
           чтобы магазин лапок работал уже между уровнями. Отрицательные дельты
           (мины, сгоревшая Лихорадка) бьют по СЧЁТУ, но не по валюте —
           опыт — стаж, он не сгорает */
        const delta = s.score - lastScoreRef.current
        lastScoreRef.current = s.score
        if (delta > 0) {
          addXpDelta(delta)
          /* Суммарный счёт за всё время — стаж для ачивок-миллионщиков */
          addLife({ score: delta })
        }
        /* БОЛЬШАЯ ПОПКОРНИНА: монетки капают сразу при поимке — с множителями
           «Монетного магнита» (+10%/ступень) и «Копилки-хрюшки» (+25%),
           как у наград этапов. Счётчик обнулился — забег новый, сбрасываем выдачу */
        if (s.bigCoins > bigCoinsPaidRef.current) {
          const diff = s.bigCoins - bigCoinsPaidRef.current
          bigCoinsPaidRef.current = s.bigCoins
          addCoins(
            Math.round(diff * (1 + (treeRef.current.coinsAdd ?? 0)) * marketRef.current.coinGift),
          )
        } else if (s.bigCoins < bigCoinsPaidRef.current) {
          bigCoinsPaidRef.current = s.bigCoins
        }
        /* БОСС «МАЛЫШ»: монетки за победу капают сразу — с теми же множителями
           монет, что и у наград этапов. Счётчик обнулился — забег новый */
        if (s.bossCoins > bossCoinsPaidRef.current) {
          const diff = s.bossCoins - bossCoinsPaidRef.current
          bossCoinsPaidRef.current = s.bossCoins
          addCoins(
            Math.round(diff * (1 + (treeRef.current.coinsAdd ?? 0)) * marketRef.current.coinGift),
          )
        } else if (s.bossCoins < bossCoinsPaidRef.current) {
          bossCoinsPaidRef.current = s.bossCoins
        }
        /* «Золотая сдача»: монетки за сданные золотые зёрна капают сразу —
           с теми же множителями монет, что у наград этапов */
        if (s.goldCoins > goldCoinsPaidRef.current) {
          const diff = s.goldCoins - goldCoinsPaidRef.current
          goldCoinsPaidRef.current = s.goldCoins
          addCoins(
            Math.round(diff * (1 + (treeRef.current.coinsAdd ?? 0)) * marketRef.current.coinGift),
          )
        } else if (s.goldCoins < goldCoinsPaidRef.current) {
          goldCoinsPaidRef.current = s.goldCoins
        }
        /* HTML-индикатор «ВОЛНА N»: поверх тумана и любых тёмных комнат.
           Таймер держим в ref: новая волна перезапускает тост, а старый
           таймаут не гасит его раньше времени */
        if (s.wave > 1 && s.wave !== waveShownRef.current) {
          waveShownRef.current = s.wave
          setWaveToast(s.wave)
          if (waveTimerRef.current) window.clearTimeout(waveTimerRef.current)
          waveTimerRef.current = window.setTimeout(() => setWaveToast(null), 1900)
        }
        /* Достижения по ходу забега + пожизненные счётчики */
        const cand: AchId[] = []
        if (s.goldenCount > 0) cand.push('golden1')
        if (s.goldenCount >= 10) cand.push('golden10')
        if (s.goldenCount >= 25) cand.push('golden25')
        if (s.streak >= 10) cand.push('combo10')
        if (s.streak >= 20) cand.push('combo20')
        if (s.streak >= 30) cand.push('combo30')
        if (s.streak >= 50) cand.push('combo50')
        if (s.pigeonShooed > 0) cand.push('pigeon1')
        if (s.pigeonShooed >= 5) cand.push('pigeon5')
        if (s.pigeonShooed >= 10) cand.push('pigeon10')
        if (s.wave >= 5) cand.push('wave5')
        if (s.wave >= 10) cand.push('wave10')
        if (s.wave >= 15) cand.push('wave15')
        if (s.wave >= 20) cand.push('wave20')
        if (s.level >= 5) cand.push('level5')
        if (s.level >= 10) cand.push('level10')
        if (s.level >= 20) cand.push('level20')
        if (s.level >= 30) cand.push('level30')
        if (s.level >= 40) cand.push('level40')
        if (s.level >= 50) cand.push('level50')
        if (s.runGrains >= 100) cand.push('grains100')
        if (s.runGrains >= 300) cand.push('grains300')
        if (s.runGrains >= 500) cand.push('grains500')
        if (s.shields >= 3) cand.push('shield3')
        if (s.minesHit > 0) cand.push('mine1')
        if (s.shieldSaves > 0) cand.push('shieldUse')
        /* Сердечки: потеря — «Первый шрам»; собран максимум 7+ — «Семь жизней» */
        if (s.hearts < prevHeartsRef.current) announceAch(['heart1'])
        prevHeartsRef.current = s.hearts
        if (s.maxHearts >= 7) cand.push('sevenhearts')
        /* Дельты в пожизненную статистику (ленивая запись — flushLife) */
        const pv = prevRunRef.current
        if (s.runGrains > pv.grains) {
          addLife({ grains: s.runGrains - pv.grains })
          /* Зерновой сейф рынка: каждое сданное зерно капает туда же
             (артефакт «Золотое ситечко» — +25%) */
          addGrains(Math.round((s.runGrains - pv.grains) * marketRef.current.grain))
          pv.grains = s.runGrains
        }
        if (s.goldenCount > pv.golden) {
          addLife({ golden: s.goldenCount - pv.golden })
          pv.golden = s.goldenCount
        }
        if (s.pigeonShooed > pv.pigeons) {
          addLife({ pigeons: s.pigeonShooed - pv.pigeons })
          pv.pigeons = s.pigeonShooed
        }
        if (s.runNipples > pv.nipples) {
          addLife({ nipples: s.runNipples - pv.nipples })
          pv.nipples = s.runNipples
        }
        if (s.minesHit > pv.mines) {
          addLife({ mines: s.minesHit - pv.mines })
          pv.mines = s.minesHit
        }
        /* БОЛЬШИЕ ПОПКОРНИНЫ 0.0.31: «Жирный улов», «Дегустатор»
           (все три сорта за забег), пожизненные счётчики по сортам */
        if (s.bigCaught > prevBigRef.current.big) announceAch(['big1'])
        if (s.bigCaramel > 0 && s.bigCherry > 0 && s.bigGrape > 0) cand.push('bigAll')
        addLife({
          bigCaught: Math.max(0, s.bigCaught - prevBigRef.current.big),
          bigCaramel: Math.max(0, s.bigCaramel - prevBigRef.current.caramel),
          bigCherry: Math.max(0, s.bigCherry - prevBigRef.current.cherry),
          bigGrape: Math.max(0, s.bigGrape - prevBigRef.current.grape),
        })
        prevBigRef.current = { big: s.bigCaught, caramel: s.bigCaramel, cherry: s.bigCherry, grape: s.bigGrape }
        /* БОССЫ 0.0.31/0.0.33: «Малыш повержен», «Три нянки» (3 за забег),
           «Неприкасаемый» (бой без потери сердец), пожизненные счётчики;
           ЛЬВ и КУНИЦА ЛАНА — свои ачивки и пожизненные счётчики по видам */
        if (s.bossKills > prevBossKillsRef.current) {
          announceAch(['boss1'])
          if (s.bossKills >= 3) announceAch(['boss3run'])
          if (s.bossClean) announceAch(['bossNoHit'])
          const dKid = Math.max(0, s.bossKidKills - prevBossKidRef.current)
          const dLion = Math.max(0, s.bossLionKills - prevBossLionRef.current)
          const dMarten = Math.max(0, s.bossMartenKills - prevBossMartenRef.current)
          const dPigeon = Math.max(0, s.bossPigeonKills - prevBossPigeonRef.current)
          const dGypsy = Math.max(0, s.bossGypsyKills - prevBossGypsyRef.current)
          if (dLion > 0) announceAch(['lion1'])
          if (dMarten > 0) announceAch(['marten1'])
          if (dPigeon > 0) announceAch(['pigeonBoss1'])
          if (dGypsy > 0) announceAch(['gypsyBoss1'])
          addLife({
            bossKills: s.bossKills - prevBossKillsRef.current,
            bossLionKills: dLion,
            bossMartenKills: dMarten,
            bossPigeonKills: dPigeon,
            bossGypsyKills: dGypsy,
          })
          prevBossKillsRef.current = s.bossKills
          prevBossKidRef.current = s.bossKidKills
          prevBossLionRef.current = s.bossLionKills
          prevBossMartenRef.current = s.bossMartenKills
          prevBossPigeonRef.current = s.bossPigeonKills
          prevBossGypsyRef.current = s.bossGypsyKills
        } else if (s.bossKills < prevBossKillsRef.current) {
          /* Новый забег: счётчики сбросились */
          prevBossKillsRef.current = s.bossKills
          prevBossKidRef.current = s.bossKidKills
          prevBossLionRef.current = s.bossLionKills
          prevBossMartenRef.current = s.bossMartenKills
          prevBossPigeonRef.current = s.bossPigeonKills
          prevBossGypsyRef.current = s.bossGypsyKills
        }
        /* Живой чип опыта 🍿 в панели сверху — опыт за забег виден сразу */
        if (runXpGainRef.current !== lastRunXpShownRef.current) {
          lastRunXpShownRef.current = runXpGainRef.current
          setRunXpGain(runXpGainRef.current)
        }
        if ((Number(window.localStorage.getItem(XP_KEY) ?? 0) || 0) >= 10000) cand.push('rich10k')
        announceAch(cand)
        checkLifeAch()
      },
      onLevelComplete: (r) => {
        /* Куница NANA: уровень пройден — +1 к росту (плюс накопленные секунды) */
        growMarten(1, playSecsRef.current)
        playSecsRef.current = 0
        /* Награда за этап: опыт стажа котика + горсть монеток (мета-прогресс) */
        awardStage(r.level)
        /* «Чистая работа»: уровень без мин и краж — медаль + пожизненный счётчик */
        if (r.clean) {
          announceAch(['perfect'])
          addLife({ perfects: 1 })
        }
        /* Сердечные ачивки: 5 уровней без потерь; уровень на одном сердечке */
        if (r.lostHearts === 0) {
          heartFreeStreakRef.current++
          if (heartFreeStreakRef.current >= 5) announceAch(['heartsFree5'])
        } else {
          heartFreeStreakRef.current = 0
        }
        if (r.hearts === 1) announceAch(['heartsLast'])
        /* ЛИХОРАДКА: случайный бонусный уровень (шанс 25%, не раньше 2-го;
           ?fever=1 — всегда). Вместо сундучка — 3 секунды безумного сбора,
           потом сразу следующий обычный уровень.
           ПЛАКАТНАЯ ПЕРЕБИВКА: каждые 5 уровней (?poster=1 — после каждого)
           после празднования показываем трудовой плакат Наны. Врезается
           ДО ветки лихорадки — иначе перебивка на рубеже терялась бы,
           потому что Лихорадка стартует уровень напрямую, без сундучка. */
        const feverNow = (devRef.current.fever || Math.random() < 0.25) && r.level >= 2
        const posterEvery = devRef.current.poster ? 1 : POSTER_EVERY
        if (r.level % posterEvery === 0) {
          if (!feverNow) {
            /* Подготовка обычного продолжения: сундучок уже ждёт за плакатом */
            setClearInfo({ level: r.level, bonus: r.bonus })
            const offs = rollOffers(3, devRef.current.forced ?? undefined)
            setOffers(offs)
            setExtras(rollExtras(offs, r.level))
            setOpenedIdx(null)
            setRunLevel(r.level + 1)
          }
          /* Секунда празднования («УРОВЕНЬ ПРОЙДЕН» в канвасе), потом плакат.
             Порядок плакатов — по счётчику рубежей забега, не по номеру
             уровня: работает и с обычным шагом 5, и с dev-шагом 1 */
          posterSeqRef.current += 1
          const posterIdx = (posterSeqRef.current - 1) % POSTER_COUNT
          if (posterDelayRef.current !== null) window.clearTimeout(posterDelayRef.current)
          posterDelayRef.current = window.setTimeout(() => {
            posterDelayRef.current = null
            setPosterPending({ level: r.level, mode: feverNow ? 'fever' : 'normal', posterIdx })
          }, 1150)
          return
        }
        if (feverNow) {
          setPerk(null)
          const cv = canvasRef.current
          if (cv) cv.style.filter = ''
          layoutRef.current()
          engineRef.current?.startFever(r.level + 1)
          setPhase('playing')
          return
        }
        setClearInfo({ level: r.level, bonus: r.bonus })
        const offs = rollOffers(3, devRef.current.forced ?? undefined)
        setOffers(offs)
        /* Подарки зависят от того, какой перк лежит в каждом сундучке */
        setExtras(rollExtras(offs, r.level))
        setOpenedIdx(null)
        setRunLevel(r.level + 1)
        /* БОНУС-НАРЕЗКА: гигантский попкорн перед сундучком — режем лапкой.
           СНАЧАЛА — секунда празднования: конфетти из стаканчика, золотая
           волна и баннер «УРОВЕНЬ ПРОЙДЕН» должны быть увидены */
        if (slicerDelayRef.current !== null) window.clearTimeout(slicerDelayRef.current)
        slicerDelayRef.current = window.setTimeout(() => {
          slicerDelayRef.current = null
          /* Защита: если за секунду забег кончился/вышли в меню — не выбрасываем
             на нарезку из чужого экрана */
          setPhase((p) => (p === 'playing' ? 'slicer' : p))
        }, 1150)
      },
      onFeverEnd: (r) => {
        /* После лихорадки. ВНЕЗАПНАЯ (посреди этапа, «Фарт») — этап сейчас
           продолжится с сохранённым прогрессом: возвращаем перк в HUD и
           трансформации. Обычная (после уровня) — сбрасываем перк */
        if (r.resumed) {
          setPerk(r.perk ?? null)
        } else {
          setPerk(null)
          const cv = canvasRef.current
          if (cv) {
            cv.style.filter = ''
            cv.classList.remove('popcorn-hue')
          }
          layoutRef.current()
        }
        /* Монетки за успех: чем больше очков — тем щедрее награда.
           ЭКОНОМИКА 0.0.31: курс gained/4 вместо /3, минимум 50.
           Артефакт «Копилка-хрюшка» добавляет +25% */
        if (r.success) {
          const coins = Math.max(50, Math.round((r.gained / 4) * marketRef.current.coinGift))
          addCoins(coins)
          setFeverCoins(coins)
          window.setTimeout(() => setFeverCoins(null), 3200)
        }
        /* Ачивки лихорадки: «Горячка», «Жар-птица», «Пять сотен в огне», «Тысяча в огне» */
        addLife({ fevers: 1 })
        announceAch(['fever1'])
        if (r.success && r.gained >= 500) announceAch(['fever500'])
        if (r.success && r.gained >= 1000) announceAch(['fever1000'])
        checkLifeAch()
      },
      onGift: (kind) => {
        /* Подарочная коробка 🎁 поймана: пожизненный счётчик + ачивки.
           «Первый подарок» — за любой; за содержимое — своя медаль */
        addLife({ gifts: 1 })
        const cand: AchId[] = ['gift1']
        if (kind === 'freeze') cand.push('giftfreeze')
        else if (kind === 'sweep') cand.push('giftsweep')
        else if (kind === 'mult10') cand.push('gift10x')
        announceAch(cand)
        checkLifeAch()
      },
      onLionScare: () => {
        /* ОНЛИФАНСИЙ высунул гигантскую лапу с краю (уровни 7/13/18):
           ачивка-свидетель «Свидетель» — испугался, но не запаниковал */
        announceAch(['onlyWitness'])
      },
      onBossIntro: (level, kind) => {
        /* Босс-уровень начался: движок держит паузу, показываем карточку
           с портретом и инструкцией «КАК ПОБЕДИТЬ?» */
        setBossIntro({ level, kind })
      },
      onEnd: (r) => {
        /* Интро босса больше не нужно: забег кончился (страховка от
           застрявшего оверлея при QA-вызовах end() через debug-API) */
        setBossIntro(null)
        /* Куница NANA: фиксируем время забега (уровни уже учтены по ходу) */
        growMarten(0, playSecsRef.current)
        playSecsRef.current = 0
        /* Время в игре: секунды чистого геймплея — в локальную статистику (настройки) */
        const runSecs = Math.max(0, Math.floor(runSecsRef.current))
        runSecsRef.current = 0
        if (runSecs > 0) addLife({ secs: runSecs })
        /* Боевой опыт куницы: 1 🐾XP за каждые 10 очков забега */
        grantMartenXp(Math.round(r.score / 10))
        /* «Кассовый куш»: кэшбэк — доля очков забега возвращается монетками
           🪙 («Копилка-хрюшка» умножает). Сыграл жирно — забрал кассу */
        const cashback = Math.round(
          r.score * (treeRef.current.scoreCoins01 ?? 0) * marketRef.current.coinGift,
        )
        if (cashback > 0) {
          addCoins(cashback)
          audio.play('coin')
        }
        const prevBest = Number(window.localStorage.getItem(BEST_KEY) ?? 0)
        const record = r.score > prevBest
        if (record) {
          storeBest(String(r.score))
          window.setTimeout(() => audio.play('record'), 700)
        }
        /* Ник игрока — и в локальный список, и в мировую таблицу */
        const nick = (window.localStorage.getItem(NAME_KEY) || 'Котик').trim() || 'Котик'
        /* Опыт уже зачислен по ходу забега (onStats) — здесь только список лидеров */
        const entry: LeaderEntry = { score: r.score, level: r.level, date: Date.now(), name: nick }
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
        /* Достижения конца забега: очки за забег (уровневые — по ходу в onStats) */
        const cand: AchId[] = []
        if (r.score >= 100) cand.push('score100')
        if (r.score >= 10000) cand.push('score10k')
        if (r.score >= 50000) cand.push('score50k')
        if (r.score >= 100000) cand.push('score100k')
        if (r.score >= 200000) cand.push('score200k')
        announceAch(cand)
        /* «Марафон попкорна»: 10 минут в одном забеге */
        if (runStartRef.current > 0 && Date.now() - runStartRef.current >= 10 * 60 * 1000) {
          announceAch(['marathon'])
        }
        flushLife()
        /* «Девятая жизнь»: если апгрейд куплен и ещё не потрачен — предлагаем второй шанс.
           Победному финалу по воле игрока второй шанс не нужен — это не провал */
        const ups = parseUpgrades(window.localStorage.getItem(UPG_KEY))
        const canRevive =
          r.reason !== 'voluntary' && ups.life > 0 && !(engineRef.current?.lifeSpent ?? true)
        /* Мировая таблица: отправляем только финальный забег.
           Защита: device + HMAC-токен забега (runId выдаётся сервером при старте) */
        if (!canRevive) {
          const tok = runTokenRef.current
          runTokenRef.current = null
          void fetch('/api/leaders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device: getDeviceId(),
              name: nick,
              score: r.score,
              level: r.level,
              secs: runSecs,
              runId: tok?.runId ?? '',
              token: tok?.token ?? '',
            }),
          })
            .then((res) => {
              /* Отказ сервера (битый токен, rate-limit, потолок очков)
                 больше не глотается молча — игрок видит, что мировой
                 рекорд не засчитан, и понимает почему нет его в таблице */
              if (!res.ok) {
                setLeaderNote(true)
                window.setTimeout(() => setLeaderNote(false), 3600)
              }
            })
            .catch(() => {})
        }
        setRunXpGain(runXpGainRef.current)
        /* v0.0.33: опыт за забег — ачивки «студента» и «профессора» */
        if (runXpGainRef.current >= 250) announceAch(['xpRun250'])
        if (runXpGainRef.current >= 750) announceAch(['xpRun750'])
        /* Разблокировки за весь забег: список на экране результатов.
           Перевод берём из ref настроек — колбэк движка создаётся один раз */
        const tt = tFor(settingsRef.current.lang)
        setRunLevelUnlocks(
          unlockNamesForRange(runStartLevelRef.current, charLevel(getTotalXp())).map(
            (u: LevelUnlock) => tt(u.nameKey),
          ),
        )
        setResult({ score: r.score, level: r.level, record, rank: list.indexOf(entry), canRevive, reason: r.reason })
        /* Забег кончился — перебивка больше не актуальна */
        setPosterPending(null)
        /* Ф0-2: забег кончился — закрываем туториал и запоминаем, что он был */
        if (tutRef.current.active) {
          tutRef.current.active = false
          window.localStorage.setItem(TUT_DONE_KEY, '1')
          setTutStep(0)
        }
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
    engine.setTree(treeRef.current)
    /* «Беспорядок NANA»: уровень куницы — жирнее забеги (квота/волны/мины) */
    engine.setMartenMess(martenMess(martenLevelOf(getMartenSnapshot()).level))
    layoutRef.current()

    return () => {
      engine.destroy()
      engineRef.current = null
      delete (window as unknown as { __popcornEngine?: PopcornEngine }).__popcornEngine
      /* Не оставляем «хвост»: таймеры празднования и перебивки не должны
         сработать после размонтирования */
      if (slicerDelayRef.current !== null) {
        window.clearTimeout(slicerDelayRef.current)
        slicerDelayRef.current = null
      }
      if (posterDelayRef.current !== null) {
        window.clearTimeout(posterDelayRef.current)
        posterDelayRef.current = null
      }
    }
  }, [storeBest, addXpDelta, announceAch, checkLifeAch, rollExtras, rollOffers, growMarten, awardStage, grantMartenXp])

  /* Следим за размером контейнера */
  useEffect(() => {
    const main = mainRef.current
    if (!main || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => layoutRef.current())
    ro.observe(main)
    return () => ro.disconnect()
  }, [])

  /* Ввод: лапка следует за пальцем по всему полю.

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
      eng.setPointer(sx, sy, e.pointerType === 'touch' ? 64 : 0)
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

  /* Цветовые фильтры перков действуют только во время уровня */
  useEffect(() => {
    const onLevel = phase === 'playing' || phase === 'paused'
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.filter = onLevel ? perkCanvasFilter(perk) : ''
      canvas.classList.toggle('popcorn-hue', onLevel && perk === 'rainbow')
    }
    layoutRef.current()
  }, [perk, phase])

  /* Пожизненные счётчики ачивок дольём на диск при уходе со страницы */
  useEffect(() => {
    const onFlush = () => flushLife()
    window.addEventListener('pagehide', onFlush)
    document.addEventListener('visibilitychange', onFlush)
    return () => {
      window.removeEventListener('pagehide', onFlush)
      document.removeEventListener('visibilitychange', onFlush)
    }
  }, [])

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
    bigCoinsPaidRef.current = 0
    bossCoinsPaidRef.current = 0
    goldCoinsPaidRef.current = 0
    runXpGainRef.current = 0
    lastRunXpShownRef.current = 0
    const startLvl = charLevel(getTotalXp())
    runStartLevelRef.current = startLvl
    setRunStartLevel(startLvl)
    setRunLevelUnlocks([])
    setRunXpGain(0)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.filter = ''
      canvas.classList.remove('popcorn-hue')
    }
    audio.ensure()
    audio.setMuted(mutedRef.current)
    audio.startMusic('game')
    audio.play('click')
    /* Постоянные апгрейды: вместимость — в движок, счастливый сундучок — случайный бонус-перк */
    const ups = parseUpgrades(window.localStorage.getItem(UPG_KEY))
    engineRef.current?.setUpgrades({ carryPlus: ups.capacity, heartsPlus: ups.hearts })
    let startPerk: PerkId | null = null
    if (ups.startperk > 0 && settingsRef.current.perksBonus) {
      const bonusPool = PERKS.filter((p) => !p.curse)
      startPerk = bonusPool[Math.floor(Math.random() * bonusPool.length)]?.id ?? null
    }
    engineRef.current?.setPawSkin(equippedRef.current)
    engineRef.current?.startRun({ fast: devRef.current.fast, perk: startPerk })
    /* Плакаты перебивки грузим ЗАРАНЕЕ — к 5-му уровню они уже в кэше
        (иначе оверлей открывается с пустой рамкой на мобильной сети) */
    preloadPosters()
    /* DEV: ?lvl=N — QA-старт забега с уровня N (кривые 20/30/100 без долгих прогонов).
       startLevel сбрасывает волну/норму под уровень, счёт забега сохраняется */
    if (devRef.current.lvl > 1) engineRef.current?.startLevel(devRef.current.lvl, startPerk)
    /* Сердечные счётчики нового забега */
    prevHeartsRef.current = -1 // первый же HUD-тик проставит актуальное
    heartFreeStreakRef.current = 0
    /* Счётчики больших попкорнин и босса нового забега */
    prevBigRef.current = { big: 0, caramel: 0, cherry: 0, grape: 0 }
    prevBossKillsRef.current = 0
    prevBossKidRef.current = 0
    prevBossLionRef.current = 0
    prevBossMartenRef.current = 0
    prevBossPigeonRef.current = 0
    prevBossGypsyRef.current = 0
    setPerk(startPerk)
    lockOrientation(settingsRef.current.orientation)
    setPhase('playing')
    /* Ачивки забега: счётчик забегов, ночная игра; дельты — с нуля */
    addLife({ runs: 1 })
    /* Ф0-2: туториал — только самому первому забегу новичка */
    if ((window.localStorage.getItem(TUT_DONE_KEY) ?? '0') !== '1' && getLife().runs <= 1) {
      tutRef.current = {
        active: true,
        step: 1,
        pawMoved: false,
        seenMine: false,
        seenGolden: false,
        seenCombo: false,
        mineAt: 0,
        goldenAt: 0,
        comboHold: 0,
        stepAt: Date.now(),
      }
      setTutStep(1)
      /* Шаг 1 завершится первым движением лапки (once — слушатель снимется сам) */
      const onFirstMove = (): void => {
        tutRef.current.pawMoved = true
      }
      window.addEventListener('pointermove', onFirstMove, { passive: true, once: true })
    }
    prevRunRef.current = { grains: 0, golden: 0, pigeons: 0, nipples: 0, mines: 0, saves: 0 }
    runStartRef.current = Date.now()
    /* Секунды чистого времени забега — с нуля (статистика времени в игре) */
    runSecsRef.current = 0
    /* Мировой лидерборд: открываем серверный забег (HMAC-токен против накрутки).
       Офлайн/ошибка — забег просто локальный, ничего не ломается */
    runTokenRef.current = null
    void fetch('/api/leaders/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device: getDeviceId() }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ok?: boolean; runId?: string; token?: string; startedAt?: number } | null) => {
        if (d?.ok && typeof d.runId === 'string' && typeof d.token === 'string' && typeof d.startedAt === 'number') {
          runTokenRef.current = { runId: d.runId, token: d.token, startedAt: d.startedAt }
        }
      })
      .catch(() => {})
    if (new Date().getHours() < 6) announceAch(['nightowl'])
    checkLifeAch()
  }, [lockOrientation, announceAch, checkLifeAch])

  const beginLevel = useCallback(
    (lvl: number, perkId: PerkId | null) => {
      audio.ensure()
      audio.setMuted(mutedRef.current)
      audio.startMusic('game')
      audio.play('click')
      const canvas = canvasRef.current
      if (canvas) {
        /* Цветовые перки — CSS-фильтром канваса; «Хамелеон» — анимированным классом */
        canvas.style.filter = perkCanvasFilter(perkId)
        canvas.classList.toggle('popcorn-hue', perkId === 'rainbow')
      }
      layoutRef.current()
      engineRef.current?.startLevel(lvl, perkId)
      setPerk(perkId)
      lockOrientation(settingsRef.current.orientation)
      setPhase('playing')
      /* Статистика перков: проклятья/бонусы за всё время + ачивки новых механик */
      if (perkId) {
        const def = PERK_MAP[perkId]
        addLife(def.curse ? { curse: 1 } : { bonus: 1 })
        const ach = PERK_ACH[perkId]
        if (ach) announceAch([ach])
        checkLifeAch()
      }
    },
    [lockOrientation, announceAch, checkLifeAch],
  )

  const resumeGame = useCallback(() => {
    audio.play('click')
    audio.startMusic('game')
    engineRef.current?.setPaused(false)
    setPhase('playing')
  }, [])

  /** Нарезка закончена: бонусные очки уходят в счёт забега, монетки —
      в кошелёк (награды в стиле Fruit Ninja) → сундучок с перком.
      0.0.31: ачивки нарезки — пороги очков, сорта вишня/виноград,
      пожизненное «Полное меню» */
  const handleSlicerDone = useCallback(
    (total: number, rewards?: { coins?: number }, meta?: { kind?: SliceKind }) => {
      if (rewards?.coins && rewards.coins > 0) addCoins(rewards.coins)
      engineRef.current?.addBonus(total)
      const cand: AchId[] = []
      if (total >= 1000) cand.push('slice1k')
      if (total >= 2500) cand.push('slice2k5')
      if (meta?.kind === 'cherry' && total >= 2500) cand.push('sliceCherry')
      if (meta?.kind === 'grape' && total >= 4500) cand.push('sliceGrape')
      /* Сорт в пожизненный счётчик — три сорта хотя бы по разу = «Полное меню» */
      if (meta?.kind === 'caramel') addLife({ sliceCaramel: 1 })
      else if (meta?.kind === 'cherry') addLife({ sliceCherry: 1 })
      else if (meta?.kind === 'grape') addLife({ sliceGrape: 1 })
      announceAch(cand)
      checkLifeAch()
      setPhase('chest')
    },
    [announceAch, checkLifeAch],
  )

  /** Плакат закрыт: 'normal' → бонус-нарезка; 'fever' → сразу Лихорадка.
      Оба пути снимают паузу сами (startLevel/startFever делают paused=false),
      поэтому перебивка безопасна даже после паузы во время празднования */
  const continueFromPoster = useCallback(() => {
    const p = posterPending
    if (!p) return
    setPosterPending(null)
    if (p.mode === 'fever') {
      setPerk(null)
      const cv = canvasRef.current
      if (cv) {
        cv.style.filter = ''
        cv.classList.remove('popcorn-hue')
      }
      layoutRef.current()
      engineRef.current?.startFever(p.level + 1)
      setPhase('playing')
      return
    }
    setPhase('slicer')
  }, [posterPending])

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
    setPosterPending(null)
    if (posterDelayRef.current !== null) {
      window.clearTimeout(posterDelayRef.current)
      posterDelayRef.current = null
    }
    setPerk(null)
    setOpenedIdx(null)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.filter = ''
      canvas.classList.remove('popcorn-hue')
    }
    flushLife() // дольём пожизненные счётчики перед выходом
    unlockOrientation()
    layoutRef.current()
    /* Ф0-2: игрок вышел в меню посреди туториала — закрываем и запоминаем */
    if (tutRef.current.active) {
      tutRef.current.active = false
      window.localStorage.setItem(TUT_DONE_KEY, '1')
      setTutStep(0)
    }
    setPhase('start')
  }, [unlockOrientation])

  /** «КОНЕЦ ИГРЫ» по воле игрока: завершаем забег как ПОБЕДУ — с победным
      экраном результата и плакатом №7. Очки идут в рекорд и мировую таблицу. */
  const finishRun = useCallback(() => {
    audio.play('click')
    const finished = engineRef.current?.finish() ?? false
    if (!finished) quitToMenu() // страховка: активного забега нет — просто в меню
  }, [quitToMenu])

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
      /* Подарок из сундука: монетки или опыт — начисляем сразу.
         Артефакты рынка усиливают подарки: Копилка (монетки), Котоакадемия (опыт) */
      const ex = extras[i]
      if (ex) {
        if (ex.kind === 'coins') addCoins(Math.round(ex.n * marketRef.current.coinGift))
        else addTotalXp(Math.round(ex.n * marketRef.current.xpGift))
        /* Пожизненные ачивки богатства (кошелёк/банк) проверяем сразу —
           иначе медаль открывалась бы только на следующем событии статистики */
        checkLifeAch()
      }
      window.setTimeout(() => audio.play('perk'), 380)
    },
    [extras, checkLifeAch],
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
      /* v0.0.33: лапка закрыта до нужного уровня котика — даже с полным банком */
      if ((def.reqLevel ?? 1) > charLevel(getTotalXp())) {
        audio.play('penalty')
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
      if (nextOwned.length >= 10) announceAch(['paws10'])
      if (nextOwned.length >= PAWS.length) announceAch(['pawsAll'])
    },
    [ownedPaws, storeXp, storeOwned, storePaw, equipPaw, announceAch],
  )

  /** Покупка постоянного апгрейда за опыт */
  const buyUpgrade = useCallback(
    (id: UpgradeId) => {
      const def = UPGRADE_MAP[id]
      /* v0.0.33: апгрейд закрыт до нужного уровня котика */
      if ((def.reqLevel ?? 1) > charLevel(getTotalXp())) {
        audio.play('penalty')
        return
      }
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
      const next: UpgradeState = { ...state, [id]: level + 1 }
      storeUpgrades(JSON.stringify(next))
      /* Вместимость подействует с нового забега; жизнь и старт-перк — сразу */
      announceAch(['upgrade1'])
      const bought = upgradesBought(next)
      if (bought >= 5) announceAch(['upg5'])
      if (bought >= 10) announceAch(['upg10'])
      if (upgradesAllMaxed(next)) announceAch(['upgAll'])
    },
    [storeXp, storeUpgrades, announceAch],
  )

  const sec = Math.ceil(stats.timeLeft)
  const urgent = sec <= 10
  const onLevel = phase === 'playing' || phase === 'paused'
  /* Вид босса текущего босс-уровня: HUD показывает его имя и значок (v0.0.33) */
  const hudBossKind = bossKindForTier(bossTierForLevel(stats.level))
  const quotaPct = Math.min(100, (stats.collected / Math.max(1, stats.quota)) * 100)
  const chosen: PerkDef | null = openedIdx !== null ? (offers[openedIdx] ?? null) : null
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
          {/* v0.0.33: живой чип опыта 🍿 — видно, как забег качает уровень котика */}
          {runXpGain > 0 && (
            <StatPill aria-label={t('over.xp', { s: runXpGain, t: xp })} className="font-pixel text-[11px]">
              <span className="tabular-nums text-amber-200">+{runXpGain}</span>
              <span aria-hidden>🍿</span>
            </StatPill>
          )}
          {/* Сердечки-жизни: мина и повторный клюв голубя отнимают, за уровень возвращается */}
          <StatPill
            aria-label={t('hud.hearts', { n: stats.hearts, m: stats.maxHearts })}
            className={stats.hearts <= 1 ? 'animate-pulse border-red-400/70' : ''}
          >
            <span className="flex items-center gap-px" aria-hidden>
              {Array.from({ length: stats.maxHearts }).map((_, i) => (
                <Heart
                  key={i}
                  strokeWidth={2.5}
                  className={`h-3.5 w-3.5 ${i < stats.hearts ? 'fill-red-500 text-red-500' : 'text-white/25'}`}
                />
              ))}
            </span>
          </StatPill>
          {/* Норма — или, в босс-бою, жизни босса: трогать его нельзя!
              v0.0.33: у каждого вида свой значок и имя — МАЛЫШ / ЛЬВ / ЛАНА */}
          {stats.boss ? (
            <StatPill className="border-pink-300/60 text-pink-200">
              <span aria-hidden>
                {hudBossKind === 'lion'
                  ? '🦁'
                  : hudBossKind === 'marten'
                    ? '🦡'
                    : hudBossKind === 'pigeon'
                      ? '🐦'
                      : hudBossKind === 'gypsy'
                        ? '💅'
                        : '👶'}
              </span>
              <span className="font-pixel">
                {hudBossKind === 'lion'
                  ? t('hud.bossLion')
                  : hudBossKind === 'marten'
                    ? t('hud.bossMarten')
                    : hudBossKind === 'pigeon'
                      ? t('hud.bossPigeon')
                      : hudBossKind === 'gypsy'
                        ? t('hud.bossGypsy')
                        : t('hud.boss')}
              </span>
              <span className="flex items-center gap-px" aria-hidden>
                {Array.from({ length: stats.bossMaxHp }).map((_, i) => (
                  <Heart
                    key={i}
                    strokeWidth={2.5}
                    className={`h-3.5 w-3.5 ${
                      i < stats.bossHp ? 'fill-red-400 text-red-400' : 'text-white/25'
                    }`}
                  />
                ))}
              </span>
            </StatPill>
          ) : (
            <StatPill>
              <span aria-hidden>🥤</span>
              {/* Босс-уровень: нормы нет (999999 = «победить малыша»),
                  после победы показываем только собранное, без фейковой цифры */}
              {stats.quota >= 999999 ? (
                <span className="tabular-nums">{stats.collected}</span>
              ) : (
                <span className="tabular-nums">
                  {stats.collected}/{stats.quota}
                </span>
              )}
              {stats.quota < 999999 && (
                <span className="relative h-1.5 w-9 overflow-hidden rounded-full bg-white/15">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-300 transition-[width] duration-200"
                    style={{ width: `${quotaPct}%` }}
                  />
                </span>
              )}
            </StatPill>
          )}
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
          {stats.giftFreeze > 0 && (
            <StatPill className="animate-pulse border-sky-300/80 bg-sky-400/20 text-sky-100">
              <span className="font-pixel tabular-nums">
                {t('hud.freeze', { n: stats.giftFreeze })}
              </span>
            </StatPill>
          )}
          {stats.giftMult > 1 && (
            <StatPill className="animate-pulse border-fuchsia-300/80 bg-fuchsia-400/20 text-fuchsia-100">
              <span className="font-pixel tabular-nums">
                {t('hud.giftmult', { n: stats.giftMult, s: stats.giftMultLeft })}
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
                onClick={finishRun}
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
              exit={{ opacity: 0, pointerEvents: 'none' }}
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

        {/* Ф0-2: подсказки туториала первого забега — тёмное облачко в стиле
            волны-тоста, чуть ниже, чтобы не сталкиваться с «ВОЛНА N» */}
        <AnimatePresence>
          {tutStep > 0 && phase === 'playing' && (
            <motion.div
              key={`tut-${tutStep}`}
              className="pointer-events-none absolute inset-x-0 top-[104px] z-20 flex justify-center px-3"
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <span
                aria-live="polite"
                className="text-shadow-pixel max-w-[92%] rounded-2xl border-2 border-amber-300/70 bg-[#2b1a0e]/85 px-4 py-2 text-center font-pixel text-xs font-bold leading-snug text-amber-200 shadow-[0_6px_20px_rgba(0,0,0,0.5)] sm:text-sm"
              >
                {t(TUT_KEYS[tutStep - 1])}
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
              exit={{ opacity: 0, pointerEvents: 'none' }}
            >
              {/* Сочность: падающие зёрна и тёплые пятна света за карточкой */}
              <MenuBackdrop />
              <motion.div
                className="relative my-auto w-full max-w-sm rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)] [@media(max-height:700px)]:p-3 sm:p-6"
                initial={{ scale: 0.92, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10, opacity: 0, pointerEvents: 'none' }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                {/* Живая куница NANA + панель управления справа (путешествия, маркет) */}
                <motion.div {...menuPop(0)} className="relative mx-auto w-full max-w-[21rem]">
                  <div className="flex items-stretch gap-1.5">
                    {/* Сцена: куница играет с зерном (в походе — комната пустая) */}
                    <div className="relative min-w-0 flex-1">
                      {/* Бейдж боевого уровня NANA: цифра + полоска опыта + бонус уровня + разгром */}
                      <div
                        className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded-lg border-2 border-amber-300/80 bg-[#2b1a0e]/85 px-1.5 py-0.5 shadow-md"
                        title={`${t('marten.xpHint')} ${t('marten.messHint')}`}
                      >
                        <div className="flex items-center gap-1">
                          <PawPrint className="h-3 w-3 text-amber-200" aria-hidden />
                          <span className="font-pixel text-[10px] font-bold leading-none text-amber-200 tabular-nums">
                            {t('marten.lvlBadge')} {martenLvl.level}
                          </span>
                        </div>
                        <span
                          aria-hidden
                          className="mt-0.5 block h-1 w-full overflow-hidden rounded-full bg-white/20"
                        >
                          <span
                            className="block h-full rounded-full bg-amber-300 transition-all duration-700"
                            style={{
                              width: `${Math.min(100, Math.round((martenLvl.into / Math.max(1, martenLvl.need)) * 100))}%`,
                            }}
                          />
                        </span>
                        <div className="mt-0.5 font-ui text-[8px] font-bold leading-none text-amber-100/90">
                          {t('marten.lvlBonusHint', {
                            n: Math.round((nanaLevelBonus(martenLvl.level) - 1) * 100),
                          })}
                        </div>
                        {/* Разгром: связь кликера с забегом — жирнее попкорн, больше мин */}
                        <div className="mt-0.5 font-ui text-[8px] font-bold leading-none text-orange-300/90">
                          {t('marten.messLine', {
                            q: mess.quota.toFixed(1).replace('.', ','),
                            m: mess.mines,
                          })}
                        </div>
                      </div>
                      <MartenScene
                        stage={martenStage}
                        away={tripActive}
                        onTap={handleMartenTap}
                        tapCoins={tapCoins}
                        tapXp={tapXp}
                        ariaLabel={t('marten.aria')}
                        className="h-44 w-full rounded-2xl border-4 border-[#E24B3B] bg-[#FFF0D8] shadow-lg sm:h-52"
                      />
                      {/* Н2: сердечки и Zzz — NANA отдыхает в меню */}
                      <MartenIdleEmotes away={tripActive} />
                      {/* Бейдж похода: таймер или «забрать награду» */}
                      <AnimatePresence>
                        {marten.trip && (
                          <motion.div
                            className="absolute inset-x-1.5 bottom-1.5 z-10 flex justify-center"
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                          >
                            {Date.now() >= marten.trip.endsAt ? (
                              <button
                                type="button"
                                onClick={handleClaimTrip}
                                className="animate-pulse rounded-full border-2 border-amber-300 bg-[#5C8A3A] px-2.5 py-1 font-pixel text-[9px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition active:scale-95 sm:text-[10px]"
                              >
                                🎉 {t('marten.claim')}
                              </button>
                            ) : (
                              <span className="rounded-full border-2 border-amber-300/80 bg-[#2b1a0e]/90 px-2.5 py-1 font-pixel text-[9px] font-bold text-amber-200 shadow-lg sm:text-[10px]">
                                ✈ {t('marten.away')} ·{' '}
                                <span className="tabular-nums">
                                  {fmtTripMs(marten.trip.endsAt - Date.now())}
                                </span>
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Вертикальная панель управления куницей (справа) */}
                    <div className="flex w-[4.25rem] shrink-0 flex-col gap-1 sm:w-20">
                      {/* Алмазы */}
                      <div
                        className="flex items-center justify-center gap-1 rounded-xl border-2 border-[#7FB069] bg-[#eaf3dd] px-1 py-1.5"
                        title={t('marten.diamondsHint')}
                      >
                        <Gem className="h-3.5 w-3.5 shrink-0 text-[#3f6b28]" aria-hidden />
                        <span className="font-pixel text-[11px] font-bold tabular-nums text-[#3f6b28]">
                          {marten.diamonds}
                        </span>
                      </div>
                      {/* Уровень куницы + прогресс опыта */}
                      <div
                        className="flex items-center justify-center gap-1 rounded-xl border-2 border-[#E24B3B] bg-[#ffe9e2] px-1 py-1.5"
                        title={`${t('marten.xpHint')} ${t('marten.messHint')}`}
                        aria-label={t('marten.lvlFull', { n: martenLvl.level })}
                      >
                        <PawPrint className="h-3.5 w-3.5 shrink-0 text-[#B33A26]" aria-hidden />
                        <span className="font-pixel text-[11px] font-bold tabular-nums text-[#B33A26]">
                          {martenLvl.level}
                        </span>
                      </div>
                      <span
                        aria-hidden
                        className="mx-auto block h-1.5 w-full max-w-14 overflow-hidden rounded-full bg-[#f0d9c8]"
                      >
                        <span
                          className="block h-full rounded-full bg-[#E24B3B] transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.round((martenLvl.into / Math.max(1, martenLvl.need)) * 100))}%`,
                          }}
                        />
                      </span>
                      {/* Кнопка: отправить в путешествие */}
                      <button
                        type="button"
                        onClick={() => {
                          audio.play('click')
                          setOverlay('travel')
                        }}
                        className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-1 py-1 text-[#8a5330] shadow-[0_3px_0_#c9a97a] transition hover:bg-[#eed7b4] active:translate-y-[2px] active:shadow-[0_1px_0_#c9a97a]"
                      >
                        <Compass className="h-4.5 w-4.5" aria-hidden />
                        <span className="font-pixel text-[8px] font-bold leading-none">
                          {t('marten.travel')}
                        </span>
                      </button>
                      {/* Ряд: ЛАВКА (снаряжение) + РЫНОК (обмен валют) */}
                      <div className="grid shrink-0 grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            audio.play('click')
                            setOverlay('mshop')
                          }}
                          title={t('mshop.title')}
                          aria-label={t('mshop.title')}
                          className="flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-0.5 py-1 text-[#8a5330] shadow-[0_3px_0_#c9a97a] transition hover:bg-[#eed7b4] active:translate-y-[2px] active:shadow-[0_1px_0_#c9a97a] sm:h-12"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
                          <span className="font-pixel text-[8px] font-bold leading-none">
                            {t('marten.shop')}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            audio.play('click')
                            setOverlay('market')
                          }}
                          title={t('market.title')}
                          aria-label={t('market.title')}
                          className="relative flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-[#3f6b28] bg-[#eaf3dd] px-0.5 py-1 text-[#3f6b28] shadow-[0_3px_0_#5C8A3A] transition hover:bg-[#e0eecb] active:translate-y-[2px] active:shadow-[0_1px_0_#5C8A3A] sm:h-12"
                        >
                          <Store className="h-3.5 w-3.5" aria-hidden />
                          <span className="font-pixel text-[8px] font-bold leading-none">
                            {t('marten.market')}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Тост: боевой уровень куницы вырос */}
                  <AnimatePresence>
                    {martenLvlToast !== null && (
                      <motion.div
                        className="pointer-events-none absolute inset-x-0 bottom-9 z-20 flex justify-center"
                        initial={{ opacity: 0, y: 12, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8 }}
                      >
                        <span className="rounded-full bg-[#5C8A3A] px-3 py-1.5 font-pixel text-[10px] font-bold text-white shadow-lg">
                          {t('marten.xpToast', {
                            n: martenLvlToast,
                            p: Math.round((nanaLevelBonus(martenLvlToast) - 1) * 100),
                          })}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                  {/* Кликер-статистика: сколько кликов сделано и монеток за клик —
                      цена клика видна ДО тапа (апгрейды видны сразу) */}
                  <div
                    className="mt-1 flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 ring-2 ring-amber-100"
                    title={t('marten.xpHint')}
                  >
                    <span aria-hidden className="text-xs">👆</span>
                    <span className="truncate font-ui text-[10px] font-bold tabular-nums text-[#a97c50]">
                      {t('marten.clickStats', { n: market.clicks, c: tapCoins })}
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
                </motion.div>
                {/* Логотип: акроним P.O.P. — первые 3 заглавные буквы с точками (точки-зёрна), полное имя ниже.
                    Слоган «8-битный рогалик…» убран с экрана (запрос игрока); бренд только на английском на всех языках */}
                <motion.h1 aria-label={t('app.title')} className="relative mt-2.5 font-pixel leading-none" {...menuPop(1)}>
                  {/* Тёплое дыхание света за логотипом */}
                  <span
                    aria-hidden
                    className="logo-glow pointer-events-none absolute -ml-20 left-1/2 top-0 h-14 w-40 rounded-full bg-amber-400/25 blur-2xl"
                  />
                  <span aria-hidden className="text-shadow-pixel relative block text-4xl font-bold tracking-wide text-[#B33A26] sm:text-5xl">
                    <span className="-mx-1 relative inline-block overflow-hidden px-1 align-top">
                      P<span className="pop-dot text-amber-500" style={{ animationDelay: '0s' }}>.</span>
                      O<span className="pop-dot text-amber-500" style={{ animationDelay: '0.45s' }}>.</span>
                      P<span className="pop-dot text-amber-500" style={{ animationDelay: '0.9s' }}>.</span>
                      {/* Блик, пробегающий по буквам */}
                      <span
                        aria-hidden
                        className="logo-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      />
                    </span>
                  </span>
                  <span aria-hidden className="mt-1.5 block font-pixel text-[11px] font-bold uppercase tracking-[0.35em] text-[#8a5330] sm:text-sm">
                    {t('app.title')}
                  </span>
                </motion.h1>

                {/* Компактный статус: рекорд (+мировая стат.), опыт, уровень котика, ник */}
                <motion.div className="mt-2.5 flex flex-wrap items-center justify-center gap-1" {...menuPop(2)}>
                  {best > 0 && (
                    <div
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-ui text-[11px] font-semibold text-[#8a5330] ring-2 ring-amber-200"
                      title={
                        worldStats
                          ? t('lead.stats', {
                              n: worldStats.launches,
                              r: worldStats.runs,
                              p: worldStats.players,
                            })
                          : undefined
                      }
                    >
                      <Trophy className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                      {t('menu.record', { n: best })}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-ui text-[11px] font-semibold text-[#8a5330] ring-2 ring-amber-200">
                    <Popcorn className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                    {t('menu.xp', { n: xp })}
                  </div>
                  {/* Стаж котика: мета-прогресс — уровень + тонкая полоска внутри уровня */}
                  <div
                    className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-ui text-[11px] font-semibold text-[#8a5330] ring-2 ring-amber-200"
                    aria-label={t('menu.charLevel', { n: charInfo.level })}
                    title={t('menu.charLevelHint')}
                  >
                    {t('menu.charLevel', { n: charInfo.level })}
                    <span
                      aria-hidden
                      className="h-1.5 w-10 min-w-4 overflow-hidden rounded-full bg-[#3a2210]"
                    >
                      <span
                        className="block h-full rounded-full bg-amber-200 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.round((charInfo.into / Math.max(1, charInfo.need)) * 100))}%`,
                        }}
                      />
                    </span>
                  </div>
                  {/* Ник теперь меняется в настройках (шестерёнка) */}
                </motion.div>

                {/* ИГРАТЬ — на всю ширину; правила уехали вниз к настройкам */}
                <motion.div className="mt-3" {...menuPop(3)}>
                  <div className="relative">
                    <span
                      aria-hidden
                      className="play-pulse pointer-events-none absolute inset-0 rounded-xl"
                    />
                    <GameButton onClick={startGame} shine>
                      {t('menu.play')}
                    </GameButton>
                  </div>
                </motion.div>

                {/* Ряд: ЛАПКИ · АЧИВКИ · ДРЕВО — сразу под ИГРАТЬ (дерево уменьшено, бейдж очков сохранён) */}
                <motion.div className="mt-2.5 grid grid-cols-3 gap-2" {...menuPop(4)}>
                  <MenuSmallBtn
                    onClick={() => {
                      audio.play('click')
                      setOverlay('shop')
                    }}
                    icon={<PawPrint className="h-4 w-4" aria-hidden />}
                    title={t(`paw.${equippedPaw}.name`)}
                  >
                    {t('menu.paws')}
                  </MenuSmallBtn>
                  <MenuSmallBtn
                    onClick={() => {
                      audio.play('click')
                      setOverlay('ach')
                    }}
                    icon={<span aria-hidden className="text-sm">🏅</span>}
                  >
                    {t('menu.ach')}
                  </MenuSmallBtn>
                  <MenuSmallBtn
                    accent={treePts > 0}
                    onClick={() => {
                      audio.play('click')
                      setOverlay('tree')
                    }}
                    icon={<Network className="h-4 w-4" aria-hidden />}
                    title={t('menu.tree')}
                  >
                    {t('menu.treeShort')}
                    {treePts > 0 && (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#5C8A3A] px-1 font-ui text-[10px] font-bold text-white">
                        {treePts}
                      </span>
                    )}
                  </MenuSmallBtn>
                </motion.div>

                {/* Ряд ниже: ЛИДЕРЫ · СОЗДАТЕЛИ */}
                <motion.div className="mt-2 grid grid-cols-2 gap-2" {...menuPop(5)}>
                  <MenuSmallBtn
                    onClick={() => {
                      audio.play('click')
                      setOverlay('leaders')
                    }}
                    icon={<Trophy className="h-4 w-4" aria-hidden />}
                  >
                    {t('menu.leaders')}
                  </MenuSmallBtn>
                  <MenuSmallBtn
                    onClick={() => {
                      audio.play('click')
                      setOverlay('creators')
                    }}
                    icon={<Heart className="h-4 w-4" aria-hidden />}
                  >
                    {t('menu.creators')}
                  </MenuSmallBtn>
                </motion.div>

                {/* Низ: ПРАВИЛА · НАСТРОЙКИ — вспомогательный ряд, выровнен с остальными */}
                <motion.div className="mt-2 grid grid-cols-2 gap-2" {...menuPop(6)}>
                  <MenuSmallBtn
                    onClick={() => {
                      audio.play('click')
                      setOverlay('rules')
                    }}
                    icon={<BookOpen className="h-4 w-4" aria-hidden />}
                  >
                    {t('menu.rules')}
                  </MenuSmallBtn>
                  <MenuSmallBtn
                    onClick={() => {
                      audio.play('click')
                      setOverlay('settings')
                    }}
                    icon={<Settings className="h-4 w-4" aria-hidden />}
                  >
                    {t('menu.settings')}
                  </MenuSmallBtn>
                </motion.div>

                {/* Установка PWA — когда приложение ещё не стоит */}
                <motion.div className="mt-2" {...menuPop(7)}>
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                    >
                      <Smartphone className="h-4 w-4" aria-hidden /> {t('menu.install')}
                    </button>
                  )}
                </motion.div>

                {/* Версия сборки: правый нижний угол меню — сразу видно, что на проде */}
                <span
                  aria-label={GAME_VERSION_LABEL}
                  className="pointer-events-none absolute bottom-0.5 right-2 font-ui text-[9px] font-semibold lowercase tracking-wide text-[#a97c50]/60 sm:bottom-1 sm:right-2.5"
                >
                  {GAME_VERSION_LABEL}
                </span>

                {/* Счётчик заходов в мир (v0.0.36): сколько раз игру открывали
                    и сколько уникальных устройств приходило — левый нижний угол.
                    Цифры живые: приходят из /api/sessions при открытии меню */}
                {worldStats && (
                  <span
                    title={t('lead.stats', {
                      n: worldStats.launches,
                      r: worldStats.runs,
                      p: worldStats.players,
                    })}
                    className="pointer-events-none absolute bottom-0.5 left-2 font-ui text-[9px] font-semibold tracking-wide text-[#a97c50]/60 sm:bottom-1 sm:left-2.5"
                  >
                    {t('menu.world', {
                      n: worldStats.launches,
                      v: worldStats.visitors ?? worldStats.players,
                    })}
                  </span>
                )}
              </motion.div>
            </motion.div>
          )}

          {phase === 'paused' && (
            <motion.div
              key="paused"
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
            >
              <motion.div
                className="w-full max-w-xs rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-6 text-center shadow-2xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.94, opacity: 0, pointerEvents: 'none' }}
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
                  onClick={finishRun}
                  className="mt-2 w-full rounded-xl px-4 py-1.5 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
                >
                  {t('quit.pauseMenu')}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* БОНУС-НАРЕЗКА: гигантский попкорн — режь лапкой как можно чаще */}
          {phase === 'slicer' && clearInfo && (
            <PopcornSlicer
              key="slicer"
              t={t}
              level={clearInfo.level}
              onDone={handleSlicerDone}
            />
          )}

          {phase === 'chest' && clearInfo && (
            <motion.div
              key="chest"
              className="absolute inset-0 z-30 flex flex-col bg-black/70 p-2 backdrop-blur-sm sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
            >
              <motion.div
                className="mx-auto my-auto flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:max-w-md"
                initial={{ scale: 0.9, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                {/* Прокручиваемое содержимое: сундуки с надписями и описание перка.
                    На низких экранах (телефон боком) всё ужимается, чтобы сундуки
                    с описаниями были видны без прокрутки */}
                <div className="min-h-0 flex-1 overflow-y-auto p-3 text-center sm:p-4 [@media(max-height:520px)]:p-2 sm:[@media(max-height:520px)]:p-2">
                  <div aria-hidden className="text-3xl sm:text-4xl [@media(max-height:520px)]:hidden">
                    🎁
                  </div>
                  <h2 className="mt-0.5 font-pixel text-lg font-bold text-[#B33A26] sm:text-2xl [@media(max-height:520px)]:mt-0 [@media(max-height:520px)]:text-sm sm:[@media(max-height:520px)]:mt-0 sm:[@media(max-height:520px)]:text-sm">
                    {t('chest.title', { n: clearInfo.level })}
                  </h2>
                  <p className="mt-0.5 font-ui text-[11px] font-medium text-[#8a5330] sm:text-xs [@media(max-height:520px)]:mt-0 [@media(max-height:520px)]:text-[9px] sm:[@media(max-height:520px)]:mt-0 sm:[@media(max-height:520px)]:text-[9px]">
                    {t('chest.bonus', { b: clearInfo.bonus, s: stats.score })}
                  </p>
                  {offers.length > 0 ? (
                    <>
                      <p className="mt-1.5 font-ui text-[11px] text-[#5C3A1E] [@media(max-height:520px)]:hidden">{t('chest.choose')}</p>
                      {/* Сундучки: ДО выбора — тайна (никто не знает, что внутри),
                          ПОСЛЕ открытия — показываем содержимое ВСЕХ трёх */}
                      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2 [@media(max-height:520px)]:mt-1">
                        {offers.map((p, i) => {
                          const isOpen = openedIdx === i
                          const revealed = openedIdx !== null
                          const dimmed = revealed && !isOpen
                          const ex = extras[i]
                          return (
                            <motion.button
                              key={p.id}
                              type="button"
                              aria-label={
                                revealed
                                  ? `${t('chest.openN', { n: i + 1 })}: ${t(`perk.${p.id}.name`)} — ${t(`perk.${p.id}.desc`)}`
                                  : t('chest.openN', { n: i + 1 })
                              }
                              disabled={revealed}
                              onClick={() => openChest(i)}
                              className={`flex flex-col items-center rounded-xl border-[3px] px-1 pb-1.5 pt-1.5 transition-colors [@media(max-height:520px)]:pb-1 [@media(max-height:520px)]:pt-1 ${
                                isOpen
                                  ? 'border-amber-400 bg-amber-100'
                                  : dimmed
                                    ? 'border-[#c9a97a] bg-[#f3e2c8] opacity-40'
                                    : 'border-[#8a5330] bg-[#f3e2c8] hover:bg-[#eed7b4] active:scale-95'
                              }`}
                              animate={isOpen ? { rotate: [0, -6, 6, -3, 0], y: [0, -6, 0] } : {}}
                              transition={{ duration: 0.45 }}
                            >
                              <ChestImg open={isOpen} />
                              {revealed ? (
                                <>
                                  {/* Содержимое открыто: перк, метка и подарок */}
                                  <span className="mt-1 flex items-center justify-center gap-1">
                                    <span aria-hidden className="text-sm leading-none">
                                      {p.icon}
                                    </span>
                                    <span
                                      className={`font-pixel text-[9px] font-bold leading-tight sm:text-[11px] ${
                                        p.curse ? 'text-[#B33A26]' : 'text-[#3f6b28]'
                                      }`}
                                    >
                                      {t(`perk.${p.id}.name`)}
                                    </span>
                                  </span>
                                  <span
                                    className={`mt-0.5 rounded-full px-1.5 py-px font-ui text-[8px] font-bold leading-tight sm:text-[9px] ${
                                      p.curse ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
                                    }`}
                                  >
                                    {p.curse ? t('perk.tag.curse') : t('perk.tag.bonus')}
                                  </span>
                                  {ex && (
                                    <span
                                      className="mt-0.5 font-ui text-[9px] font-bold text-[#8a5a16]"
                                      title={
                                        ex.kind === 'coins'
                                          ? t('chest.bonusCoins', { n: ex.n })
                                          : t('chest.bonusXp', { n: ex.n })
                                      }
                                    >
                                      {ex.kind === 'coins' ? `+${ex.n} 🪙` : `+${ex.n} 🍿`}
                                    </span>
                                  )}
                                  {/* Полное описание — только у выбранного сундучка */}
                                  {isOpen && (
                                    <span className="mt-1 break-words font-ui text-[9px] font-medium leading-tight text-[#5C3A1E] sm:text-[10px] [@media(max-height:520px)]:mt-0.5">
                                      {t(`perk.${p.id}.desc`)}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* ДО выбора — тайна: только номер и знак вопроса */}
                                  <span className="mt-1 font-pixel text-[9px] font-bold leading-tight text-[#8a5330] sm:text-[11px]">
                                    {t('chest.chest')} {i + 1}
                                  </span>
                                  <span aria-hidden className="font-pixel text-lg font-bold leading-none text-[#c9a97a]">
                                    ?
                                  </span>
                                </>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>

                      {/* Описание выбранного перка + что ждёт на следующем уровне */}
                      <AnimatePresence mode="wait">
                        {chosen && (
                          <motion.div
                            key={chosen.id}
                            className={`mt-2.5 rounded-xl border-2 p-2 ${
                              chosen.curse ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'
                            }`}
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                          >
                            <p className="break-words font-ui text-[11px] leading-snug text-[#5C3A1E]">
                              {t(`perk.${chosen.id}.desc`)}
                            </p>
                            <p className="mt-1 font-ui text-[10px] leading-tight text-[#8a5330]">
                              {t('chest.quotaInfo', {
                                n: runLevel,
                                q: Math.round(
                                  quotaFor(runLevel, chosen.id === 'doublepoints') *
                                    (settings.difficulty === 'easy'
                                      ? 0.8
                                      : settings.difficulty === 'hard'
                                        ? 1.2
                                        : 1) *
                                    (chosen.id === 'milky' ? 1.2 : 1),
                                ),
                                s:
                                  (chosen.id === 'timeplus' ? 75 : 60) +
                                  (PAW_MAP[equippedPaw].bonus.timePlus ?? 0) +
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
                    </>
                  ) : (
                    <p className="mt-2 font-ui text-xs text-[#5C3A1E]">{t('chest.noperks')}</p>
                  )}
                </div>

                {/* ЗАКРЕПЛЁННЫЙ низ: кнопка «ДАЛЕЕ» всегда видна без прокрутки —
                    даже на телефоне боком, когда высоты впритык */}
                <div className="shrink-0 space-y-1.5 border-t-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
                  {chosen ? (
                    <>
                      <GameButton onClick={() => beginLevel(runLevel, chosen.id)}>
                        {t('chest.next', { n: runLevel })}
                      </GameButton>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setOverlay('shop')}
                          className="min-h-9 flex-1 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-2 py-1.5 font-pixel text-[11px] font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                        >
                          {t('chest.shop')}
                        </button>
                        <button
                          type="button"
                          onClick={finishRun}
                          className="min-h-9 rounded-xl px-2 py-1.5 font-ui text-[10px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
                        >
                          {t('quit.short')}
                        </button>
                      </div>
                    </>
                  ) : offers.length > 0 ? (
                    <p className="text-center font-pixel text-[11px] font-bold text-[#8a5330]">
                      {t('chest.pick')}
                    </p>
                  ) : (
                    <>
                      <GameButton onClick={() => beginLevel(runLevel, null)}>
                        {t('chest.next', { n: runLevel })}
                      </GameButton>
                      <button
                        type="button"
                        onClick={finishRun}
                        className="w-full rounded-xl px-4 py-1 font-ui text-[11px] font-semibold text-[#a97c50] transition hover:text-[#8a5330] hover:underline"
                      >
                        {t('quit.button')}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ПЛАКАТНАЯ ПЕРЕБИВКА: каждые 5 уровней — трудовой плакат Наны.
              Поверх всего (z-50), поверх паузы тоже; плакаты идут по
              порядку вместе с рубежами сложности: 1→2→3→4→5→6→1… */}
          {posterPending && (
            <PosterInterstitial
              key={`poster-${posterPending.level}-${posterPending.posterIdx}`}
              t={t}
              level={posterPending.level}
              score={stats.score}
              best={best}
              posterIdx={posterPending.posterIdx}
              onContinue={continueFromPoster}
            />
          )}

          {/* ИНТРО БОССА (0.0.42): карточка «КАК ПОБЕДИТЬ?» перед босс-уровнем.
              Поверх всего (z-50); геймплей держится на паузе движка (introHold),
              кнопка «В БОЙ!» отпускает его */}
          {bossIntro && phase === 'playing' && (
            <BossIntroOverlay
              key={`bossintro-${bossIntro.level}`}
              t={t}
              level={bossIntro.level}
              kind={bossIntro.kind}
              onGo={() => {
                setBossIntro(null)
                engineRef.current?.dismissBossIntro()
              }}
            />
          )}

          {/* Dev-полоса сравнения вариантов мины (?mine=1..4): не блокирует касания */}
          {mineStrip.on && <MineStrip active={mineStrip.active} />}

          {phase === 'ended' && result && (
            <motion.div
              key="ended"
              className="absolute inset-0 z-30 flex flex-col bg-black/60 p-2 backdrop-blur-sm sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
            >
              <motion.div
                className="relative mx-auto my-auto flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
                initial={{ scale: 0.9, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, pointerEvents: 'none' }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                {(result.record || result.reason === 'voluntary') && <Confetti />}
                {/* Прокручиваемая сводка */}
                <div className="min-h-0 flex-1 overflow-y-auto p-4 text-center sm:p-6">
                  <h2
                    className={`font-pixel text-xl font-bold sm:text-2xl ${
                      result.reason === 'voluntary' ? 'text-[#3f6b28]' : 'text-[#B33A26]'
                    }`}
                  >
                    {result.reason === 'voluntary' ? t('over.victoryTitle') : t('over.title')}
                  </h2>
                  <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                    {result.reason === 'voluntary'
                      ? t('over.victoryNote')
                      : result.reason === 'hearts'
                        ? t('over.hearts')
                        : result.reason === 'ransacked'
                          ? t('over.ransacked')
                          : t('over.timeup', { n: result.level })}
                  </p>
                  {/* ПОБЕДА: плакат №7 — куница отдаёт честь со стаканом попкорна */}
                  {result.reason === 'voluntary' && (
                    <motion.img
                      src={VICTORY_POSTER_SRC}
                      alt={t('over.posterAlt')}
                      draggable={false}
                      loading="eager"
                      className="pixelated mx-auto mt-2.5 max-h-44 w-auto rounded-md border-4 border-[#f6e7c9] bg-[#f6e7c9] object-contain shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
                      initial={{ scale: 0.85, rotate: -3, opacity: 0 }}
                      animate={{ scale: 1, rotate: -1.5, opacity: 1 }}
                      transition={{ delay: 0.12, type: 'spring', stiffness: 220, damping: 20 }}
                    />
                  )}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Popcorn className="h-8 w-8 text-amber-500" aria-hidden />
                    <span className="font-pixel text-5xl font-bold tabular-nums text-[#5C3A1E]">
                      {result.score}
                    </span>
                  </div>
                  <p className="mt-1 font-ui text-xs font-medium text-[#8a5330]">
                    {t('over.points', { n: result.level })}
                  </p>
                  <p className="mt-1.5 font-ui text-xs font-bold text-[#5C3A1E]">
                    {t('over.xp', { s: runXpGain, t: xp })}
                  </p>

                  {/* v0.0.33: УРОВЕНЬ КОТИКА на результатах — реальный опыт
                      за забег виден в полосе стажа, повышение — с наградами */}
                  <div className="mx-auto mt-2.5 max-w-[260px] rounded-xl border-2 border-[#e3cba4] bg-[#fdf3e0] px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pixel text-xs font-bold text-[#5C3A1E]">
                        {t('menu.charLevel', { n: charInfo.level })}
                      </span>
                      {charInfo.level > runStartLevel && (
                        <span className="rounded-full bg-[#B33A26] px-2 py-0.5 font-pixel text-[10px] font-bold text-white">
                          {t('over.lvlBadge')}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#3a2210]">
                      <div
                        className="h-full rounded-full bg-amber-300 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.round((charInfo.into / Math.max(1, charInfo.need)) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 font-ui text-[10px] font-medium text-[#8a5330]">
                      {t('over.lvlNext', {
                        n: charInfo.level + 1,
                        left: Math.max(0, charInfo.need - charInfo.into),
                      })}
                    </p>
                    {charInfo.level > runStartLevel && runLevelUnlocks.length > 0 && (
                      <p className="mt-1 font-ui text-[10px] font-bold leading-snug text-[#3f6b28]">
                        {t('over.unlocked', { list: runLevelUnlocks.join(', ') })}
                      </p>
                    )}
                  </div>
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
                      className="mt-3 inline-block rounded-full bg-amber-400 px-4 py-2 font-ui text-xs font-bold text-[#5C3A1E] shadow-md"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                    >
                      {t('over.newRecord')}
                    </motion.div>
                  ) : (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 font-ui text-xs font-semibold text-[#8a5330] ring-2 ring-amber-200">
                      <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                      {t('menu.record', { n: best })}
                    </div>
                  )}
                  {shareNote && (
                    <p className="mt-2 font-ui text-[11px] font-semibold text-emerald-700">
                      {shareNote}
                    </p>
                  )}
                </div>

                {/* ЗАКРЕПЛЁННЫЙ низ: «ЕЩЁ РАЗ» видна без прокрутки на любом экране */}
                <div className="shrink-0 space-y-2 border-t-2 border-[#e3cba4] bg-[#fdf3e0] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  {result.canRevive && <GameButton onClick={reviveRun}>{t('over.revive')}</GameButton>}
                  <GameButton onClick={startGame}>
                    <span className="inline-flex items-center justify-center gap-2">
                      <RotateCcw className="h-5 w-5" aria-hidden /> {t('over.retry')}
                    </span>
                  </GameButton>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => void handleShare()}
                      className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-3 py-1.5 font-pixel text-[11px] font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                    >
                      <Share2 className="h-4 w-4" aria-hidden /> {t('over.share')}
                    </button>
                    <button
                      type="button"
                      onClick={quitToMenu}
                      className="min-h-9 rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-3 py-1.5 font-pixel text-[11px] font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]"
                    >
                      {t('quit.short')}
                    </button>
                  </div>
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
              catLevel={charInfo.level}
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

        {/* Куница: путешествие, лавка и рынок — поверх меню (отдельный AnimatePresence,
            чтобы тик таймера не мешал остальным оверлеям) */}
        <AnimatePresence>
          {phase === 'start' && overlay === 'travel' && (
            <TravelOverlay
              marten={marten}
              martenLvl={martenLvl.level}
              gemMult={marketBonus.gemTrip * nanaLevelBonus(martenLvl.level)}
              xpMult={marketBonus.xpTrip * nanaLevelBonus(martenLvl.level)}
              coinMult={marketBonus.coinGift}
              grainMult={marketBonus.grain}
              t={t}
              onSend={handleSendTrip}
              onClaim={handleClaimTrip}
              onClose={() => setOverlay(null)}
            />
          )}
          {phase === 'start' && overlay === 'mshop' && (
            <MShopOverlay
              marten={marten}
              t={t}
              onBuyBoots={handleBuyBoots}
              onEquipBoots={handleEquipBoots}
              onBuyHat={handleBuyHat}
              onEquipHat={handleEquipHat}
              onBuyBag={handleBuyBag}
              onEquipBag={handleEquipBag}
              onClose={() => setOverlay(null)}
            />
          )}
          {phase === 'start' && overlay === 'market' && (
            <MarketOverlay
              marten={marten}
              coins={coins}
              xp={xp}
              market={market}
              catLevel={charInfo.level}
              t={t}
              onExchange={handleExchange}
              onBuyArtifact={handleBuyArtifact}
              onClose={() => setOverlay(null)}
            />
          )}
        </AnimatePresence>

        {/* Ник-гейт Ф0-1: спрашиваем имя после первого забега (поверх экрана
            результата). Страховка: игрок, который уже играл, но закрыл вкладку
            до конца забега, увидит вопрос в меню. Совсем новички — не видят. */}
        <AnimatePresence>
          {nickSetRaw !== '1' && (phase === 'ended' || (phase === 'start' && playedOnce)) && (
            <NickDialog
              mode="gate"
              current=""
              t={t}
              onDone={handleNickDone}
              onClose={() => {}}
              afterRun={phase === 'ended'}
            />
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
            nick={nameRaw}
            onEditNick={() => {
              audio.play('click')
              setOverlay(null)
              setNickEdit(true)
            }}
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

      {/* Тост «мировой рекорд не принят»: сервер отклонил submit — не молчим */}
      <AnimatePresence>
        {leaderNote && (
          <motion.div
            className="absolute bottom-44 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <div className="max-w-[86vw] rounded-full border-2 border-red-300 bg-[#2b1a0e]/95 px-4 py-2 text-center shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              <div className="font-pixel text-xs font-bold leading-tight text-red-200">
                {t('lead.reject')}
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
            <div className="flex max-w-[86vw] items-center gap-2 rounded-full border-2 border-amber-300 bg-[#2b1a0e]/95 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              {/* 🎖 уже внутри строки char.levelUp — не дублируем эмодзи */}
              <div className="font-pixel text-sm font-bold leading-tight text-amber-200">
                {charToastUnlocks.length > 0
                  ? t('char.levelUpUnlocks', { n: charToast, list: charToastUnlocks.join(', ') })
                  : t('char.levelUp', { n: charToast })}
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
