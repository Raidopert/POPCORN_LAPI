/**
 * Игровой движок POPCORN PAWS — рогалик-режим.
 * Canvas + requestAnimationFrame, независим от React.
 *
 * Игра бесконечна: каждый уровень = 60 секунд и норма (квота) попкорна.
 * Выполнил норму → уровень пройден, сундучок с перком, дальше сложнее.
 * Не успел → конец забега. Перки меняют правила одного уровня.
 */

import { audio } from './audio'
import {
  quotaFor,
  perkScoreMult,
  bgPerkFor,
  type PerkId,
} from './perks'
import { PAW_MAP, type PawBonus, type PawId } from './paws'
import {
  makeSmoothPopcornSprite,
  makeCupSprite,
  makeSmoothPawSprite,
  makeSparkleSprite,
  makeMineSprite,
  makePigeonSprite,
  makeGlowSprite,
  makeSmoothNippleSprite,
  makeBigPopcornSprite,
  drawSprite,
  easeOutBack,
  easeOutQuad,
  type BigKind,
  type Sprite,
} from './sprites'
import { Pool } from './pool'
import { FpsMeter } from './fps'
import { tFor, type Lang, type TranslateFn } from './i18n'
import type { Difficulty, Quality } from './settings'
import type { TreeBonus } from './skill-tree'
import { ZERO_BONUS } from './skill-tree'
import type { MartenMess } from './marten'

export interface EngineStats {
  score: number
  timeLeft: number
  duration: number
  level: number
  quota: number
  collected: number
  carrying: number
  carryMax: number
  paused: boolean
  /** Комбо: серия удачных сдач подряд (сбрасывается миной или голубем) */
  streak: number
  /** Текущий множитель комбо ×1..×5 */
  comboMult: number
  /** Золотых зёрен поймано за забег (для достижений) */
  goldenCount: number
  /** Прогнано голубей за забег (для достижений) */
  pigeonShooed: number
  /** Сейчас идёт «Лихорадка» (бонусный уровень) или её итоговая пауза */
  fever: boolean
  /** Осталось щитов от мин на текущем забеге (древо улучшений + перк лапки) */
  shields: number
  /** Очки, заработанные в текущей/только что закончившейся лихорадке */
  feverGained: number
  /** Номер текущей волны внутри уровня — для HTML-индикатора поверх тумана */
  wave: number
  /** Зёрен подобрано за забег (для пожизненных ачивок) */
  runGrains: number
  /** Сосок 🍼 подобрано за забег (перк «Соски-малышки») */
  runNipples: number
  /** Мин поймано (со шком) за забег */
  minesHit: number
  /** Сколько мин за забег погасили щиты */
  shieldSaves: number
  /** Сердечек осталось (механика 5 жизней) */
  hearts: number
  /** Максимум сердечек в этом забеге */
  maxHearts: number
  /** Ф0-2 туториал: мина-кукуруза сейчас на поле */
  mineOn: boolean
  /** Ф0-2 туториал: золотое зерно сейчас на поле */
  goldenOn: boolean
  /** БОЛЬШАЯ ПОПКОРНИНА: поймано за забег */
  bigCaught: number
  /** Поймано за забег по сортам — ачивки «Дегустатор» и пожизненные */
  bigCaramel: number
  bigCherry: number
  bigGrape: number
  /** Монетки, накопленные за большие попкорнины за забег (выдаёт компонент) */
  bigCoins: number
  /** БОСС: сейчас идёт бой с малышом (каждый 10-й уровень) */
  boss: boolean
  /** Жизней у малыша сейчас */
  bossHp: number
  /** Всего жизней у малыша */
  bossMaxHp: number
  /** Побед над малышами за забег (ачивки босса) */
  bossKills: number
  /** Последний бой прошёл без потери сердечек (ачивка «Неприкасаемый») */
  bossClean: boolean
  /** Монетки, накопленные за победы над боссами за забег (выдаёт компонент) */
  bossCoins: number
  /** Монетки за сданные ЗОЛОТЫЕ зёрна за забег («Золотая сдача», выдаёт компонент) */
  goldCoins: number
}

export interface LevelResult {
  level: number
  score: number
  bonus: number
  /** Уровень пройден без единого шока от мины и без краж голубя */
  clean: boolean
  /** Осталось сердечек к моменту сдачи нормы */
  hearts: number
  /** Сколько сердечек потеряно за уровень */
  lostHearts: number
}

export interface EndResult {
  score: number
  level: number
  /** Почему забег кончился: время вышло / сердечки кончились / голуби разграбили корзину / игрок сам завершил забег (победа) */
  reason: 'time' | 'hearts' | 'ransacked' | 'voluntary'
}

/** Итог «Лихорадки»: gained — заработанные очки (0, если схватил мину) */
export interface FeverResult {
  gained: number
  success: boolean
  next: number
}

export interface EngineCallbacks {
  onStats?(s: EngineStats): void
  onLevelComplete?(r: LevelResult): void
  onEnd?(r: EndResult): void
  onFeverEnd?(r: FeverResult): void
}

export type PieceKind = 'popcorn' | 'caramel' | 'butter' | 'golden' | 'corn' | 'nipple'

/** Очки за зёрна (экономика 0.0.31 — вдвое строже, запрос игрока «все очки
    уменьшить»): белое +5 · карамель +10 · масляное +15 · золотое +25 ·
    соска (перк «Соски-малышки») +20.
    Цифры по-прежнему чистые — читать легко, но набивать стало вдвое труднее */
export const KIND_POINTS: Record<Exclude<PieceKind, 'corn'>, number> = {
  popcorn: 5,
  caramel: 10,
  butter: 15,
  golden: 25,
  nipple: 20,
}

/** Относительный размер зерна на поле: чем ценнее — тем мельче.
    Белое +1 — крупное и заметное, золотое +5 — крохотное, но яркое.
    Соска — самая крупная: её видно издалека (и малышам удобнее) */
const KIND_SCALE: Record<Exclude<PieceKind, 'corn'>, number> = {
  popcorn: 1,
  caramel: 0.84,
  butter: 0.72,
  golden: 0.58,
  nipple: 1.06,
}

const FEVER_SECONDS = 3
/** Шанс, что на лихорадке среди зёрен спрячется одна мина-штраф */
const FEVER_MINE_CHANCE = 0.3

/* --- БОЛЬШАЯ ПОПКОРНИНА: раз за уровень на поле появляется жирный приз.
    Живёт 5 секунд и пытается убежать — успел дотянуться: очки и монетки.
    Три сорта глазури (0.0.31 — экономика строже, запрос «все очки уменьшить»):
      • КАРАМЕЛЬНАЯ (белая, обычная) — плоские +500 без комбо;
      • ВИШНЁВАЯ (красная) — база 750 × комбо-множитель: обычный улов
        ~750–1500, у скилловых выше — потолка нет;
      • ВИНОГРАДНАЯ (фиолетовая, самая редкая) — база 3000 × комбо:
        комбо доходит до ×16, улов в идеале — до 48 000.
    Не успел — укатилась. Чем глубже забег, тем выше комбо — тем жирнее приз --- */
const BIG_LIFE = 5
/** Скорость побега, u/с: вдогонку пальцем — но finger lag решает */
const BIG_SPEED = 74
/** Появляется в случайный момент между 6-й и 16-й секундой уровня */
const BIG_AT_MIN = 6
const BIG_AT_MAX = 16

/** Сорта большой попкорнины: очки, монетки, работает ли комбо и шанс */
const BIG_VARIANTS: Record<
  BigKind,
  { base: number; coins: number; combo: boolean; chance: number; text: string; ring: string; crumb: string }
> = {
  caramel: { base: 500, coins: 25, combo: false, chance: 0.6, text: '#FFC93C', ring: '255, 201, 60', crumb: '#FFE066' },
  cherry: { base: 750, coins: 60, combo: true, chance: 0.29, text: '#FF7A5E', ring: '255, 122, 94', crumb: '#FFB3A0' },
  grape: { base: 3000, coins: 120, combo: true, chance: 0.11, text: '#C98AFF', ring: '201, 138, 255', crumb: '#E3CCFF' },
}

/** Взвешенный ролл сорта призовой попкорнины */
function rollBigKind(): BigKind {
  const r = Math.random()
  let acc = 0
  for (const kind of Object.keys(BIG_VARIANTS) as BigKind[]) {
    acc += BIG_VARIANTS[kind].chance
    if (r < acc) return kind
  }
  return 'caramel'
}

/* --- БОСС «МАЛЫШ»: на каждом 10-м уровне в зал вламывается ребёнок.
    Он крупнее воришки-голубя, рвётся к корзине и выгребает попкорн.
    Трогать малыша лапкой НЕЛЬЗЯ — слетает сердечко. Победить можно
    только издали: в босс-бою быстрый мах лапкой ПИНАЕТ попкорнинки,
    те летят как в арканоиде и бивают малыша. У первого босса 3 жизни,
    у каждого следующего — на одну больше. Время уровня ограничено --- */
const BOSS_EVERY = 10 // босс выходит на каждом 10-м уровне (10, 20, 30…)
const BOSS_BASE_HP = 3 // жизней у первого босса
const BOSS_HP_PER_TIER = 1 // +1 жизнь за каждого следующего босса
const BOSS_TOUCH_R = 44 // радиус «трогать ребёнка», u: касание — минус сердечко
const BOSS_TOUCH_CD = 1.1 // «отдышка» малыша после касания — не жжёт сердца серией
const BOSS_BONUS_BASE = 300 // очки за победу над первым боссом (0.0.31: было 600)
const BOSS_BONUS_PER_TIER = 100 // + очки за каждого следующего босса (было 200)
const BOSS_COINS_BASE = 60 // монетки за победу (выдаёт компонент с множителями)
const BOSS_COINS_PER_TIER = 20 // + монетки за каждого следующего (было 40)
const BOSS_CHARGE_BASE = 3.6 // пауза между рывками малыша к корзине, с
const BOSS_STEAL = 3 // сколько зёрен выгребает за раз (растёт с номером босса)
/** Скорость лапки, с которой она ПИНАЕТ зерно (u/с): ниже — обычный подбор */
const FLING_MIN_SPEED = 430
/** Трение летящего зерна (экспоненциальное, 1/с): полёт затухает плавно */
const FLING_FRICTION = 3.4

interface FieldPiece {
  x: number
  y: number
  rot: number
  kind: PieceKind
  phase: number
  spawn: number
  /** скорость вращения (рад/с): попкорн лениво крутится, мины стоят */
  spin: number
  /** угол дрейфа для перка «Скользкий пол» */
  dA: number
  /** Скорость летящего зерна (пинок лапкой в босс-бою): 0/undefined — лежит спокойно */
  vx?: number
  vy?: number
}

/** БОЛЬШАЯ ПОПКОРНИНА: жирный приз, который живёт секунды и пытается убежать */
interface BigPiece {
  x: number
  y: number
  /** Сколько секунд уже на поле (BIG_LIFE — укатилась) */
  t: number
  /** Текущее направление побега (рад) */
  dir: number
  /** Сколько ещё держать направление до следующего поворота */
  wt: number
  phase: number
}

/** Пылинка-мошка в луче света: медленно дрейфует, оживляет фон */
interface Mote {
  x: number
  y: number
  ph: number
  sp: number
  r: number
  a: number
}

/** Ударная волна: расширяющееся кольцо при взрыве мины и победе */
interface Ring {
  x: number
  y: number
  t: number
  ttl: number
  color: string
  r0: number
  r1: number
}

/** След лапки: призрачные отпечатки при быстром движении */
interface TrailDot {
  x: number
  y: number
  t: number
}

interface Carried {
  kind: Exclude<PieceKind, 'corn'>
  grabT: number
}

interface Flying {
  x0: number
  y0: number
  kind: Exclude<PieceKind, 'corn'>
  t: number
}

/** Голубь-воришка: влетает, висит над стаканчиком и таскает попкорн.
    У него есть полоска жизни: чтобы прогнать, нужно НАНЕСТИ УДАРЫ лапкой —
    на первых уровнях хватает трёх, дальше воришка крепчает */
interface Pigeon {
  x: number
  y: number
  state: 'in' | 'hover' | 'flee'
  stateT: number
  peckT: number
  /** борт, с которого прилетел: −1 слева, 1 справа */
  side: 1 | -1
  hx: number
  hy: number
  /** Здоровье воришки: каждое касание лапкой — минус одно деление */
  hp: number
  maxHp: number
  /** Сколько зёрен успел украсть: при победе вернутся в стаканчик */
  stolen: number
  /** Сколько раз уже клюнул корзину: со второго клюва — минус сердечко */
  pecks: number
  /** Кулдаун между ударами и вспышка после попадания */
  hitCd: number
  flash: number
  /** Импульс-отлёт после удара (вздрагивает и отлетает) */
  kx: number
  ky: number
  /** Повержен: улетает кувырком, выронив всё украденное */
  downed: boolean
}

/** БОСС «МАЛЫШ»: ребёнок крупнее голубя, рвётся к корзине. Трогать нельзя —
    сердечко слетит. Побеждается только попкорном, пнутым лапкой */
interface Boss {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  maxHp: number
  /** 'in' — вламывается · 'wander' — бродит · 'charge' — рвётся к корзине ·
      'swat' — гребёт из корзины · 'hurt' — отшатнулся после попадания ·
      'flee' — побеждён, уходит */
  state: 'in' | 'wander' | 'charge' | 'swat' | 'hurt' | 'flee'
  stateT: number
  /** Пауза до рывка к корзине */
  atkT: number
  flash: number
  /** «Отдышка» после касания лапкой */
  invuln: number
  /** Фаза шага: тело покачивается при ходьбе */
  wobble: number
  /** Взмах руки при гребле корзины (1 → 0) */
  swing: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  t: number
  ttl: number
  color: string
  size: number
}

/** Завод пустой частицы для Object Pool: поля заполняются при obtain() */
const makeParticle = (): Particle => ({ x: 0, y: 0, vx: 0, vy: 0, t: 0, ttl: 1, color: '', size: 0 })

interface FloatText {
  x: number
  y: number
  text: string
  color: string
  t: number
  dur: number
  size: number
}

const LEVEL_SECONDS = 50
const LEVEL_SECONDS_PERK = 62 // перк «Кошачьи часы»
const SPAWN_DUR = 0.35
const CLEAR_DELAY = 0.5 // пауза до «уровень пройден», чтобы зёрна долетели
const PIGEON_FIRST_AT = 11 // голубь прилетает на этом отрезке уровня (с 3-го уровня)
const PIGEON_PECK_EVERY = 2.2 // раз в сколько секунд голубь таскает зерно
const PIGEON_RESPAWN = [18, 30] // диапазон возврата после прогона, секунд
const PIGEON_HIT_CD = 0.3 // минимальная пауза между ударами лапкой — равномерная серия
const PIGEON_HIT_R = 50 // радиус касания лапкой (в единицах u)
const PIGEON_KO_BONUS = 25 // очки за поверженного воришку (0.0.31: было 50)
const MINE_SHOCK_SECONDS = 1 // сколько секунд лапка «опешила» после мины
const MINE_SCORE_PENALTY = 50 // сколько очков сгорает при касании мины
const MAX_HEARTS_BASE = 5 // сердечек в забеге (плюс апгрейды, древо и лапка)
const REVIVE_SECONDS = 15 // «девятая жизнь»: столько секунд даёт второй шанс

/** Настройки игрового процесса, управляемые из меню настроек */
export interface EngineOptions {
  difficulty: Difficulty
  quality: Quality
  /** Тряска экрана при минах и голубе */
  shake: boolean
  /** Вибрация на телефоне */
  vibration: boolean
  /** Режим дальтоников: сине-оранжевые мины с меткой */
  colorblind: boolean
  /** Голубь-воришка включён */
  pigeon: boolean
  /** Вариант отрисовки мины (0-3, ?mine=1..4 — для выбора арт-варианта) */
  mineVariant: number
}

const DEFAULT_OPTIONS: EngineOptions = {
  difficulty: 'normal',
  quality: 'medium',
  shake: true,
  vibration: true,
  colorblind: false,
  pigeon: true,
  mineVariant: 0,
}

/** Точки наполнения ВНУТРИ стаканчика (в единицах спрайта от центра, спрайт 48×54).
 *  Зёрна рисуются «за бумажной стенкой» — их не путают с попкорном на поле. */
const CUP_FILL_POS: Array<[number, number]> = [
  [-8, 14.8],
  [8, 14.8],
  [-13, 5.2],
  [1, 6.4],
  [13.6, 4.4],
  [-6.8, -5.2],
  [8.4, -6.4],
  [0, -15.2],
]

export class PopcornEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private cb: EngineCallbacks
  private raf = 0
  private lastTs = 0
  private destroyed = false
  /** Телефон/планшет: меньше частиц и ниже разрешение — ради плавных 60 FPS */
  private coarse = false
  /** Троттлинг вибрации: чаще, чем раз в 80 мс — нельзя (лаги на Android) */
  private lastBuzzAt = 0

  private W = 0
  private H = 0
  private dpr = 1
  private u = 1

  phase: 'idle' | 'playing' | 'clear' | 'ended' = 'idle'
  paused = false

  private timeLeft = 0
  private duration = LEVEL_SECONDS
  private score = 0
  private lvl = 1
  private perk: PerkId | null = null
  private quota = 9
  private collected = 0
  /** Постоянные улучшения из магазина лапок (действуют весь забег и все забеги) */
  private pawBonus: PawBonus = {}
  private wave = 1
  private popPerWave = 10
  private cornPerWave = 3
  private goldenChance = 0.12
  /** Шанс карамельного зерна (+2): растёт с уровнем */
  private caramelChance = 0.04
  /** Шанс масляного зерна (+3): с 3-го уровня */
  private butterChance = 0
  private baseWaveDelay = 0.82
  private waveDelay = -1
  private pendingClear = -1
  private debugFast = false

  private pieces: FieldPiece[] = []
  private carried: Carried[] = []
  private flying: Flying[] = []
  /* Частицы и монетки — через Object Pool: нулевые аллокации в кадре,
     «удаление» — swap-remove без splice и мусора для GC */
  private particles = new Pool<Particle>(192, makeParticle)
  private texts: FloatText[] = []
  private paw = { x: 0, y: 0, tx: 0, ty: 0, seen: false, pulse: 0, hurt: 0 }
  private cup = { x: 0, y: 0, squash: 0 }
  private banner = { text: '', t: 99 }
  private lastSec = -1
  private audioStage = -1
  private lastStatsKey = ''

  /* --- комбо: серия удачных сдач без мины --- */
  private streak = 0
  /* --- счётчики забега для достижений --- */
  private goldenCount = 0
  private pigeonsRun = 0
  /** Зёрен/сосок подобрано за забег (пожизненные ачивки) */
  private runGrains = 0
  private runNipples = 0
  /** Мин поймано и мин погашено щитами за забег */
  private minesHit = 0
  private shieldSaves = 0
  /** Кражи голубя и шоки мины за ТЕКУЩИЙ уровень (ачивка «Чистая работа») */
  private levelStolen = 0
  private levelShock = 0
  /* --- голубь-воришка --- */
  private pigeon: Pigeon | null = null
  private pigeonTimer = -1
  /* --- БОЛЬШАЯ ПОПКОРНИНА: раз за уровень, живёт секунды — успей дотянуться --- */
  private big: BigPiece | null = null
  /** Текущий сорт призовой попкорнины (ролл при каждом спавне) */
  private bigKind: BigKind = 'caramel'
  /** Секунд от начала уровня, когда появится большая попкорнина */
  private bigAt = 8
  /** Своя большая попкорнина на этом уровне уже вышла (поймана или укатилась) */
  private bigDone = false
  /** Сколько секунд живёт попкорнина в этом забеге («Живучая попкорнина» +1 сек/ступень) */
  private bigLife = BIG_LIFE
  /** Поймано за забег (для статистики) */
  private bigCaught = 0
  /** Монетки за большие попкорнины за забег (выдаёт компонент) */
  private bigCoinsRun = 0
  /** Поймано за забег по сортам — ачивки «дегустатор» и пожизненные счётчики */
  private bigCaramelRun = 0
  private bigCherryRun = 0
  private bigGrapeRun = 0
  /* --- БОСС «МАЛЫШ»: каждый 10-й уровень — бой в тир-арканоид --- */
  private boss: Boss | null = null
  /** Монетки за победы над боссами за забег (выдаёт компонент) */
  private bossCoinsRun = 0
  /** Побед над малышами за забег — ачивки босса */
  private bossKillsRun = 0
  /** Сердечек было при появлении малыша — для «Неприкасаемого» */
  private bossHeartsAtSpawn = 0
  /** Последний бой прошёл без потери сердечек (0/1 — в статистику) */
  private bossCleanLast = false
  /* --- Скорость лапки (px/с, сглаженная): быстрым махом пинаем попкорн --- */
  private pawVX = 0
  private pawVY = 0
  /* --- перк «Кошачий щит»: одно прощение мины за уровень --- */
  private shieldLeft = 0
  /* --- постоянный апгрейд «Большой стаканчик» (+вместимость) --- */
  private upgCarry = 0
  /* --- постоянный апгрейд «Крепкое сердце» (+максимум сердец) --- */
  private upgHearts = 0
  /* --- «Комбо-броня»: сколько спасений серии осталось в этом забеге --- */
  private comboArmorLeft = 0
  /* --- «Золотая сдача»: монетки за сданные золотые зёрна за забег (выдаёт компонент) --- */
  private goldCoinsRun = 0
  /* ---------- механика сердец ---------- */
  /** Сердечки-жизни: мина и повторный клюв голубя отнимают сердце,
      ноль сердец — поражение. За пройденный уровень +1 сердце */
  private hearts = MAX_HEARTS_BASE
  private maxHearts = MAX_HEARTS_BASE
  /** Сердец потеряно за текущий уровень (ачивки «без потерь») */
  private heartLost = 0
  /** Почему закончился забег */
  private endReason: EndResult['reason'] = 'time'
  /* --- «Девятая жизнь»: второй шанс уже использован в этом забеге? --- */
  private lifeUsed = false
  /* --- «Лихорадка»: рандомный бонусный уровень на 3 секунды --- */
  private fever: { gained: number; startScore: number; next: number; coinT: number } | null = null
  private feverMine = false
  /** Пауза-итог после лихорадки, затем сразу следующий уровень */
  private feverAfter = -1
  private feverNextLvl = 0
  private lastFeverGained = 0
  /* --- таймер шлейфа звёзд волшебной лапки --- */
  private starT = 0
  /* --- «Шок» лапки после мины: замирает на секунду, ничего не берёт --- */
  private stun = 0
  /* --- древо улучшений: постоянные бонусы (тестовая ветка) --- */
  private tree: TreeBonus = ZERO_BONUS
  /* --- «беспорядок NANA»: чем взрослее куница, тем жирнее забег (см. marten.ts) --- */
  private mess: MartenMess = { quota: 1, pop: 1, mines: 0 }
  /** Рулетка внезапной ЛИХОРАДКИ: победила в кадре сбора — применяем в конце кадра */
  private pendingFever = false

  private cupScale = 5
  private cupH = 0
  /** Уровень столешницы: стаканчик стоит на деревянном столике, а не висит в воздухе */
  private tableY = 0

  /* --- настройки из меню (сложность/качество/тряска/вибрация/дальтоник/голубь) --- */
  private opts: EngineOptions = { ...DEFAULT_OPTIONS }
  /** Язык внутриигровых надписей (баннеры, всплывающие тексты) */
  private L: TranslateFn = tFor('ru')

  /* --- анимация наполнения стаканчика: возраст каждого зёрнышка в кадре --- */
  private fillPop: number[] = []
  private lastFill = 0
  /** Свечение-искра над стаканчиком после сданного золотого зерна */
  private cupGlow = 0
  /** Тряска экрана (настройка «Тряска») */
  private shakeT = 0
  private shakeAmp = 0
  /* --- визуальный сок: пылинки, кольца, след лапки, красная вспышка --- */
  private motes: Mote[] = []
  private rings: Ring[] = []
  private trail: TrailDot[] = []
  private hurtT = 0

  private sp: {
    popcorn: Sprite
    caramel: Sprite
    butter: Sprite
    golden: Sprite
    goldenGlow: Sprite
    /** 4 варианта гладкой звезды-мины (?mine=1..4 — выбор арт-варианта) */
    mines: Sprite[]
    minesCB: Sprite[]
    cup: Sprite
    paw: Sprite
    sparkle: Sprite
    pigeon0: Sprite
    pigeon1: Sprite
    nipple: Sprite
    /** БОЛЬШАЯ ПОПКОРНИНА: пухлое облако-приз в трёх сортах глазури */
    big: Record<BigKind, Sprite>
  }

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true })!
    this.cb = cb
    this.coarse =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    this.sp = {
      popcorn: makeSmoothPopcornSprite('white'),
      caramel: makeSmoothPopcornSprite('caramel'),
      butter: makeSmoothPopcornSprite('butter'),
      golden: makeSmoothPopcornSprite('golden'),
      goldenGlow: makeGlowSprite('#FFE066'),
      mines: [0, 1, 2, 3].map((k) => makeMineSprite(k, false)),
      minesCB: [0, 1, 2, 3].map((k) => makeMineSprite(k, true)),
      cup: makeCupSprite(),
      paw: makeSmoothPawSprite(),
      sparkle: makeSparkleSprite(),
      pigeon0: makePigeonSprite(false),
      pigeon1: makePigeonSprite(true),
      nipple: makeSmoothNippleSprite(),
      big: {
        caramel: makeBigPopcornSprite('caramel'),
        cherry: makeBigPopcornSprite('cherry'),
        grape: makeBigPopcornSprite('grape'),
      },
    }
    this.lastTs = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.raf)
  }

  /* ================= публичное API ================= */

  /** Скин лапки из магазина: палитра спрайта + постоянные улучшения */
  setPawSkin(id: PawId): void {
    const def = PAW_MAP[id] ?? PAW_MAP.classic
    this.pawBonus = def.bonus
    this.sp.paw = makeSmoothPawSprite(def.palette)
  }

  /** Постоянные апгрейды магазина (действуют во всех забегах) */
  setUpgrades(u: { carryPlus?: number; heartsPlus?: number }): void {
    this.upgCarry = u.carryPlus ?? 0
    this.upgHearts = u.heartsPlus ?? 0
  }

  /** Древо улучшений: постоянные бонусы (пересчитывается при покупке узла) */
  setTree(b: TreeBonus): void {
    this.tree = b
  }

  /** Связь кликера с забегом: уровень куницы растит норму, волны и мины */
  setMartenMess(m: MartenMess): void {
    this.mess = m
  }

  /** Настройки из меню: сложность, качество, тряска, вибрация, дальтоник, голубь */
  setOptions(o: Partial<EngineOptions>): void {
    this.opts = { ...this.opts, ...o }
  }

  /** Язык внутриигровых надписей (баннеры «УРОВЕНЬ 2», «УКРАЛ!», «КОМБО ×3»…) */
  setLang(lang: Lang): void {
    this.L = tFor(lang)
  }

  /** Бонус «Нарезки» (мини-игра в конце уровня): добавить очки в счёт забега */
  addBonus(n: number): void {
    const add = Math.max(0, Math.floor(n))
    if (add <= 0 || this.phase === 'ended') return
    this.score += add
    this.emitStats(true)
  }

  /** Новый забег: счёт с нуля, уровень 1 (старт-апгрейд может дать бонусный перк) */
  startRun(opts: { fast?: boolean; perk?: PerkId | null } = {}): void {
    this.debugFast = !!opts.fast
    this.score = 0
    /* «Быстрый старт»: серия сдач начинается с запасом (+5 за ступень) */
    this.streak = Math.max(0, Math.floor(this.tree.comboStart ?? 0))
    /* «Комбо-броня»: по одному спасению серии за ступень на весь забег */
    this.comboArmorLeft = Math.max(0, Math.floor(this.tree.comboArmor ?? 0))
    this.goldCoinsRun = 0
    this.goldenCount = 0
    this.pigeonsRun = 0
    this.runGrains = 0
    this.runNipples = 0
    this.minesHit = 0
    this.shieldSaves = 0
    this.bigCaught = 0
    this.bigCoinsRun = 0
    this.bigCaramelRun = 0
    this.bigCherryRun = 0
    this.bigGrapeRun = 0
    this.bossKillsRun = 0
    this.bossCleanLast = false
    this.bossCoinsRun = 0
    this.boss = null
    this.big = null
    this.lifeUsed = false
    this.fever = null
    this.feverAfter = -1
    /* Сердечки: максимум зависит от апгрейдов, древа и лапки; в новом забеге запас полон */
    this.maxHearts = Math.min(
      9,
      MAX_HEARTS_BASE + this.upgHearts + (this.tree.heartsMax ?? 0) + (this.pawBonus.heartsPlus ?? 0),
    )
    this.hearts = this.maxHearts
    this.startLevel(1, opts.perk ?? null)
  }

  /** Следующий уровень забега (счёт сохраняется) */
  startLevel(level: number, perk: PerkId | null): void {
    this.lvl = level
    this.perk = perk
    /* Сложность из настроек: лёгкая (+10 сек), сложная (−10 сек) */
    const diffTime = this.opts.difficulty === 'easy' ? 10 : this.opts.difficulty === 'hard' ? -10 : 0
    /* «Долгий бой»: на боссовых уровнях (+3 сек за ступень) */
    const bossTime = level % BOSS_EVERY === 0 ? (this.tree.bossTime ?? 0) : 0
    this.duration =
      Math.max(
        40,
        (perk === 'timeplus' ? LEVEL_SECONDS_PERK : LEVEL_SECONDS) +
          (this.pawBonus.timePlus ?? 0) +
          this.tree.timePlus +
          diffTime +
          bossTime,
      )
    /* Нормы больше не упирается в потолок: чем глубже забег, тем труднее
       успеть. Босс-уровень переопределит её ниже — там победа другая */
    this.quota = this.debugFast ? 3 : quotaFor(level, perk === 'doublepoints')
    /* Сложность: лёгкая — норма ×0.8, сложная — ×1.2 */
    if (!this.debugFast && this.opts.difficulty !== 'normal') {
      this.quota = Math.max(3, Math.round(this.quota * (this.opts.difficulty === 'easy' ? 0.8 : 1.2)))
    }
    /* «Соски-малышки»: каждая соска жирнее (+40), потому и норма +20% */
    if (perk === 'milky') this.quota = Math.max(3, Math.round(this.quota * 1.2))
    /* «Беспорядок NANA»: куница рассыпала попкорн — чем она взрослее, тем
       больше нужно собрать (×1…×2). Забег жирнее — и очков больше */
    this.quota = Math.max(3, Math.round(this.quota * this.mess.quota))
    this.collected = 0
    this.wave = 1
    /* Ступень сложности каждые 5 уровней: пропорционально больше попкорна
       и мин на волне — за отведённое время нужно собирать всё больше, но без безумия */
    const step = Math.floor((level - 1) / 5)
    /* Зёрен в волне — тоже больше вместе с NANA (×1…×1.6), потолка нет:
       скилловый игрок успевает собрать больше — у очков нет предела,
       а средний игрок всё равно упрётся в таймер уровня */
    this.popPerWave = Math.round(
      (Math.min(30, 10 + step * 3) + (this.tree.grains ?? 0)) * this.mess.pop,
    )
    this.cornPerWave = Math.min(16, 4 + step)
    if (perk === 'cornrain') this.cornPerWave = Math.min(18, this.cornPerWave * 2)
    /* Лапка-оберег от мин: меньше кукурузы в каждой волне */
    this.cornPerWave = Math.max(0, this.cornPerWave - (this.pawBonus.cornCut ?? 0))
    /* Древо «Шахтёр»: мин в волне стало меньше */
    this.cornPerWave = Math.max(0, this.cornPerWave - (this.tree.cornCut ?? 0))
    /* Сложность: лёгкая — на мину меньше, сложная — на мину больше */
    if (this.opts.difficulty === 'easy') this.cornPerWave = Math.max(0, this.cornPerWave - 1)
    if (this.opts.difficulty === 'hard') this.cornPerWave = Math.min(18, this.cornPerWave + 1)
    /* Разгром NANA: мины прибавляются (+1 за 10 уровней куницы, до +3) */
    this.cornPerWave = Math.min(18, this.cornPerWave + this.mess.mines)
    this.goldenChance =
      perk === 'goldenvein'
        ? 0.26
        : Math.min(0.3, 0.12 + (this.pawBonus.goldenAdd ?? 0) + (this.tree.goldAdd ?? 0))
    /* Разнообразие зёрен: карамель и масло появляются с ростом уровня */
    this.caramelChance = Math.min(0.2, 0.04 + (this.lvl - 1) * 0.014)
    this.butterChance = this.lvl >= 3 ? Math.min(0.1, 0.015 + (this.lvl - 3) * 0.007) : 0
    this.baseWaveDelay = Math.max(0.28, 0.8 - (level - 1) * 0.03)

    this.phase = 'playing'
    this.paused = false
    this.timeLeft = this.duration
    this.pendingClear = -1
    this.fever = null
    this.feverMine = false
    this.feverAfter = -1
    this.starT = 0
    this.stun = 0
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles.clear()
    this.texts.length = 0
    this.waveDelay = -1
    this.lastSec = Math.ceil(this.timeLeft)
    this.banner = { text: this.L('banner.level', { n: level }), t: 0 }
    audio.setIntensity(0)
    audio.setMusicLevel(level >= 3 ? 1 : 0)
    this.audioStage = 0
    this.shieldLeft = (perk === 'shield' ? 1 : 0) + (this.tree.shields ?? 0)
    /* Голубь-воришка: с 3-го уровня, и чем дальше — тем раньше прилетает
        (с 3-го ~11 сек, дальше ramp до ~4 сек). «Птичий базар» — втрое раньше */
    this.pigeon = null
    this.pigeonTimer =
      this.opts.pigeon && level >= 3
        ? perk === 'pigeonfeast'
          ? 3.5 + Math.random() * 1.5
          : /* Апгрейд «Кроткий голубь»: первый прилёт позже */
            Math.max(4, PIGEON_FIRST_AT - (level - 3) + this.tree.pigeonLate) + Math.random() * 3
        : -1
    /* Большая попкорнина: уходит вместе с уровнем, следующая появится
       в случайный момент уровня. «Ранняя попкорнина» сдвигает выход
       ближе к началу, «Живучая» удлиняет её жизнь */
    this.big = null
    this.bigDone = false
    this.bigLife = BIG_LIFE + (this.tree.bigLife ?? 0)
    {
      const early = Math.min(9, this.tree.bigEarly ?? 0)
      const lo = Math.max(2, BIG_AT_MIN - early)
      const hi = Math.max(lo + 1, BIG_AT_MAX - early)
      this.bigAt = lo + Math.random() * (hi - lo)
    }
    /* Босс и скорость лапки с прошлого уровня не выживают */
    this.boss = null
    this.pawVX = 0
    this.pawVY = 0
    /* Ачивка «Чистая работа»: считаем шоки и кражи за уровень; и потери сердец */
    this.levelStolen = 0
    this.levelShock = 0
    this.heartLost = 0
    /* Наполнение стаканчика сбрасывается: анимация зёрен заново */
    this.fillPop = []
    this.lastFill = 0
    this.cupGlow = 0
    this.shakeT = 0
    this.shakeAmp = 0
    if (!this.paw.seen) {
      this.paw.x = this.cup.x
      this.paw.y = this.H * 0.4
      this.paw.tx = this.paw.x
      this.paw.ty = this.paw.y
    }
    this.paw.hurt = 0
    /* БОСС «МАЛЫШ»: каждый 10-й уровень вместо обычного — бой в тир-арканоид.
       Никаких мин и воришек: малыш сам рвётся к корзине, а попкорн для
       «стрельбы» подбрасывается волнами. Нормы нет — победить только босса */
    if (level % BOSS_EVERY === 0) {
      this.quota = 999999 // победа — только жизни малыша в ноль
      this.popPerWave = 9 // попкорн-«снаряды» для пинков
      this.cornPerWave = 0 // мины в тире не нужны — и так жарко
      this.goldenChance = 0.04
      this.caramelChance = 0.1
      this.butterChance = 0
      this.pigeon = null
      this.pigeonTimer = -1
      this.bigDone = true // большая попкорнина не выживает рядом с малышом
      /* Лапка новичка отступает к нижнему краю: автопилот не должен висеть
         в верхней трети, где бродит малыш — иначе бесплатное сердце */
      if (!this.paw.seen) {
        this.paw.seen = true
        this.paw.x = Math.max(40 * this.u, this.W * 0.16)
        this.paw.y = this.H * 0.82
      }
      this.paw.tx = this.paw.x
      this.paw.ty = this.paw.y
      this.spawnBoss()
    }
    audio.play('wave')
    this.spawnWave()
    this.emitStats(true)
  }

  /** «ЛИХОРАДКА» — рандомный бонусный уровень: 3 секунды, весь экран в зёрнах
      без мин (изредка прячется одна мина-штраф). Очки капают в счёт; если
      схватить мину — всё заработанное в лихорадке сгорает. После итога
      забег сразу продолжается со следующего уровня, без сундучка. */
  startFever(nextLevel: number): void {
    if (this.phase !== 'clear' && this.phase !== 'playing') return
    this.perk = null
    this.phase = 'playing'
    this.paused = false
    /* «Долгая лихорадка» из древа: +1 сек за каждый уровень узла */
    const dur = FEVER_SECONDS + (this.tree.feverPlus ?? 0)
    this.duration = dur
    this.timeLeft = dur
    this.quota = 999999
    this.collected = 0
    this.fever = { gained: 0, startScore: this.score, next: nextLevel, coinT: 0 }
    this.feverMine = Math.random() < FEVER_MINE_CHANCE
    this.feverAfter = -1
    this.lastFeverGained = 0
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles.clear()
    this.texts.length = 0
    this.pigeon = null
    this.pigeonTimer = -1
    /* Большая попкорнина не выживает на лихорадке: поле очищается */
    this.big = null
    this.waveDelay = -1
    this.pendingClear = -1
    this.stun = 0
    this.fillPop = []
    this.lastFill = 0
    this.cupGlow = 0
    this.shakeT = 0
    this.shakeAmp = 0
    this.banner = { text: this.L('banner.fever'), t: 0 }
    this.lastSec = Math.ceil(this.timeLeft)
    audio.setIntensity(3)
    audio.play('fever')
    /* Золотой салют: лихорадка начинается с взрыва настроения */
    this.confettiBurst(this.cup.x, this.cup.y - this.cupH * 0.5, 26)
    this.spawnFeverField()
    this.emitStats(true)
  }

  /** Экран лихорадки: смесь ценных зёрен, изредка — одна мина-штраф */
  private spawnFeverField(): void {
    const kinds: PieceKind[] = []
    for (let i = 0; i < 36; i++) {
      const r = Math.random()
      kinds.push(r < 0.16 ? 'golden' : r < 0.34 ? 'butter' : r < 0.55 ? 'caramel' : 'popcorn')
    }
    if (this.feverMine) kinds[Math.floor(Math.random() * kinds.length)] = 'corn'
    kinds.forEach((kind, i) => this.spawnPiece(i, kind))
  }

  /** Подсыпка зёрен, если экран лихорадки опустел */
  private spawnFeverTop(): void {
    for (let i = 0; i < 6; i++) {
      const r = Math.random()
      this.spawnPiece(i, r < 0.16 ? 'golden' : r < 0.34 ? 'butter' : r < 0.55 ? 'caramel' : 'popcorn')
    }
  }

  /** Итог лихорадки: успех — очки остаются; мина — всё заработанное сгорает */
  private feverEnd(success: boolean): void {
    const f = this.fever
    if (!f) return
    this.fever = null
    this.feverNextLvl = f.next
    this.lastFeverGained = f.gained
    /* Таймер-страховка: пока идёт пауза-итог, время не должно выйти */
    this.timeLeft = 1.2
    this.duration = 1.2
    this.lastSec = Math.ceil(this.timeLeft)
    this.feverAfter = 1.15
    if (success) {
      this.banner = { text: this.L('txt.feverWin', { n: f.gained }), t: 0 }
      audio.play('record')
      this.buzz([30, 40, 30, 40, 90])
      this.crumbs(this.paw.x, this.paw.y, '#FFE066', 12)
    } else {
      this.score = Math.max(0, this.score - f.gained)
      this.streak = 0
      this.banner = { text: this.L('txt.feverBurn'), t: 0 }
      audio.play('penalty')
      this.doShake(9)
      this.buzz([60, 40, 100])
      this.crumbs(this.paw.x, this.paw.y, '#E5342E', 9)
    }
    this.emitStats(true)
    this.cb.onFeverEnd?.({ gained: success ? f.gained : 0, success, next: f.next })
  }

  setPaused(p: boolean): void {
    if (this.phase !== 'playing') return
    this.paused = p
    this.emitStats(true)
  }

  /** «Конец игры»: мгновенно свернуть забег и вернуться в меню (без экрана результатов).
      Опыт при этом НЕ сгорает — компонент начисляет очки в банк по ходу забега. */
  abort(): void {
    this.phase = 'idle'
    this.paused = false
    this.pieces = []
    this.carried = []
    this.flying = []
    this.particles.clear()
    this.texts.length = 0
    this.pigeon = null
    this.fever = null
    this.feverAfter = -1
    this.banner = { text: '', t: 99 }
    this.shakeT = 0
    this.shakeAmp = 0
    audio.stopMusic()
    audio.setIntensity(0)
    this.emitStats(true)
  }

  /** «КОНЕЦ ИГРЫ» по воле игрока: честный ПОБЕДНЫЙ финал забега.
      Очки идут в рекорд и мировую таблицу как обычно, экран результата
      показывает победный плакат №7. Работает в бою (playing) и между
      уровнями (clear/сундук); на паузе — тоже (paused — отдельный флаг). */
  finish(): boolean {
    if (this.phase !== 'playing' && this.phase !== 'clear') return false
    this.paused = false
    this.end('voluntary')
    return true
  }

  /** «Девятая жизнь»: один раз за забег продолжить проваленный уровень (+15 секунд).
      Возвращает true, если второй шанс сработал. */
  revive(): boolean {
    if (this.phase !== 'ended' || this.lifeUsed) return false
    this.lifeUsed = true
    this.phase = 'playing'
    this.paused = false
    this.stun = 0
    /* Второй шанс возвращает и сердца — полный запас */
    this.hearts = this.maxHearts
    this.timeLeft = REVIVE_SECONDS
    this.duration = REVIVE_SECONDS
    this.lastSec = Math.ceil(this.timeLeft)
    this.audioStage = -1
    this.pendingClear = -1
    this.banner = { text: this.L('banner.revive'), t: 0 }
    audio.play('wave')
    this.emitStats(true)
    return true
  }

  /** Использован ли второй шанс в текущем забеге */
  get lifeSpent(): boolean {
    return this.lifeUsed
  }

  /** Координаты в системе игрового поля (трансформации экрана считает компонент) */
  setPointer(x: number, y: number, lift = 0): void {
    if (this.phase !== 'playing' || this.paused) return
    this.paw.tx = x
    this.paw.ty = y - lift * this.u
    this.paw.seen = true
  }

  /* ================= размеры ================= */

  /** Размер игрового поля в CSS-пикселях (задаёт компонент с учётом перков) */
  handleResize(w: number, h: number): void {
    if (w === 0 || h === 0) return

    const oldW = this.W
    const oldH = this.H
    this.W = w
    this.H = h
    /* DPR: потолок из настроек качества (+ авто-потолок на низком тире) */
    this.applyDpr()

    this.u = Math.max(0.7, Math.min(1.5, Math.min(w, h) / 420))

    if (oldW > 0 && oldH > 0 && (oldW !== w || oldH !== h)) {
      const kx = w / oldW
      const ky = h / oldH
      for (const p of this.pieces) {
        p.x *= kx
        p.y *= ky
      }
      this.paw.x *= kx
      this.paw.y *= ky
      this.paw.tx *= kx
      this.paw.ty *= ky
    }

    /* Детальный стаканчик 48×54: пиксели вдвое мельче при том же размере */
    this.cupScale = 2.3 * this.u
    this.cupH = 54 * this.cupScale
    this.cup.x = w / 2
    /* Столик внизу: стаканчик стоит на столешнице, а не висит в воздухе */
    this.tableY = h - 30 * this.u
    this.cup.y = this.tableY - this.cupH / 2
  }

  /* ================= волны ================= */

  private spawnWave(): void {
    /* Точный состав волны: норма зёрен + мины (ступень каждые 5 уровней).
       Внутри «вкусной» нормы — смесь: белое/карамель/масло/золото. */
    const kinds: PieceKind[] = []
    for (let i = 0; i < this.popPerWave; i++) {
      const r = Math.random()
      const cB = this.goldenChance
      const cC = cB + this.caramelChance
      const cM = cC + this.butterChance
      kinds.push(r < cB ? 'golden' : r < cC ? 'caramel' : r < cM ? 'butter' : 'popcorn')
    }
    for (let i = 0; i < this.cornPerWave; i++) kinds.push('corn')
    /* «Соски-малышки»: все обычные зёрна — соски (золотые остаются золотыми) */
    if (this.perk === 'milky') {
      for (let i = 0; i < kinds.length; i++) {
        const k = kinds[i]
        if (k === 'popcorn' || k === 'caramel' || k === 'butter') kinds[i] = 'nipple'
      }
    }
    for (let i = kinds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[kinds[i], kinds[j]] = [kinds[j], kinds[i]]
    }
    kinds.forEach((kind, i) => this.spawnPiece(i, kind))
  }

  private spawnPiece(index: number, kind: PieceKind): void {
    const u = this.u
    const mX = 46 * u
    /* Статистика вынесена в панель над полем — верх больше не перекрыт: зёрна
       заспавниваются выше, игровая зона больше */
    const top = 46 + 4 * u
    const bottom = this.H - 52 * u
    let x = this.W / 2
    let y = this.H / 2
    for (let tries = 0; tries < 40; tries++) {
      x = mX + Math.random() * (this.W - mX * 2)
      y = top + Math.random() * Math.max(10, bottom - top)
      const dc = Math.hypot(x - this.cup.x, y - this.cup.y)
      if (dc <= 135 * u) continue
      // не даём зёрнам застрять в кластере — маршрут всегда проходим
      let crowded = false
      for (const q of this.pieces) {
        if (Math.hypot(x - q.x, y - q.y) < 40 * u) {
          crowded = true
          break
        }
      }
      if (!crowded) break
    }
    this.pieces.push({
      x,
      y,
      rot: (Math.random() - 0.5) * 0.7,
      kind,
      phase: Math.random() * Math.PI * 2,
      spawn: SPAWN_DUR + index * 0.045,
      // Мины стоят угрожающе неподвижно, зёрна лениво покачиваются-крутятся
      spin: kind === 'corn' ? 0 : (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.5),
      dA: Math.random() * Math.PI * 2,
    })
  }

  /* ================= размеры и ступени сложности ================= */

  /** Вместимость лапки: 3 зерна, после 5-го уровня — 4, после 10-го — 5 (+скин, +апгрейд, +перк, +древо) */
  private get carryMax(): number {
    const base = this.lvl >= 11 ? 5 : this.lvl >= 6 ? 4 : 3
    return (
      base +
      (this.pawBonus.carryPlus ?? 0) +
      this.upgCarry +
      (this.perk === 'secondcup' ? 2 : 0) +
      (this.tree.carry ?? 0)
    )
  }

  /** Комбо-множитель: +1 за каждые 6 сдач подряд (с «Комбо-тренером» — 5).
      Потолка больше нет: серия мастера разгоняется без предела,
      а мины и воришки всё ещё сбивают её в ноль */
  private get comboMult(): number {
    return 1 + Math.floor(this.streak / (this.tree.comboFast ? 5 : 6))
  }

  /** Мина или воришка сбивают серию. «Комбо-броня» гасит первые удары за
      забег: серия сохраняется, вместо неё — надпись «БРОНЯ!» */
  private breakStreak(x: number, y: number): void {
    const u = this.u
    if (this.comboArmorLeft > 0) {
      this.comboArmorLeft--
      this.texts.push({
        x,
        y,
        text: this.L('txt.comboarmor'),
        color: '#BFF3E6',
        t: 0,
        dur: 0.9,
        size: 20 * u,
      })
      audio.play('click')
      return
    }
    this.streak = 0
  }

  /** Радиус подбора лапки: перки + скин + древо («Магнит» +8% за уровень) */
  private get grabR(): number {
    return (
      (this.perk === 'bigpaw' ? 58 : this.perk === 'smallpaw' ? 34 : 44) *
      this.u *
      (this.pawBonus.grabR ?? 1) *
      (1 + (this.tree.grabR01 ?? 0))
    )
  }

  /** Попкорн каждые 5 уровней немного мельчает — на поле остаётся место */
  private get popScale(): number {
    return Math.max(0.68, 1 - 0.035 * Math.floor((this.lvl - 1) / 5))
  }

  /** Мины-кукурузины каждые 5 уровней, наоборот, толстеют */
  private get cornScale(): number {
    return Math.min(1.5, 1 + 0.09 * Math.floor((this.lvl - 1) / 5))
  }

  /* ================= перки-механики ================= */

  /** «Скользкий пол»: зёрна катаются по полу */
  private driftPieces(dt: number): void {
    const u = this.u
    const sp = 17 * u
    const mX = 34 * u
    const top = 50
    const bottom = this.H - 56 * u
    for (const p of this.pieces) {
      p.dA += (Math.random() - 0.5) * dt * 2.4
      p.x += Math.cos(p.dA) * sp * dt
      p.y += Math.sin(p.dA) * sp * dt
      if (p.x < mX) {
        p.x = mX
        p.dA = Math.PI - p.dA
      }
      if (p.x > this.W - mX) {
        p.x = this.W - mX
        p.dA = Math.PI - p.dA
      }
      if (p.y < top) {
        p.y = top
        p.dA = -p.dA
      }
      if (p.y > bottom) {
        p.y = bottom
        p.dA = -p.dA
      }
    }
  }

  /** «Магнитная лапа»: попкорн сам тянется к лапке */
  private magnetPull(dt: number): void {
    const u = this.u
    const r = 115 * u
    const k = Math.min(1, dt * 3.4)
    for (const p of this.pieces) {
      if (p.kind === 'corn' || p.spawn > 0.12) continue
      const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y)
      if (d < r && d > 1) {
        p.x += (this.paw.x - p.x) * k
        p.y += (this.paw.y - p.y) * k
      }
    }
  }

  /* ================= большая попкорнина ================= */

  /** Тик большой попкорнины: побег по полю, обратный отсчёт, спавн по расписанию */
  private updateBig(dt: number): void {
    if (this.fever || this.feverAfter >= 0 || this.phase !== 'playing') return
    const u = this.u
    if (this.big) {
      const b = this.big
      b.t += dt
      /* Попкорнина пытается убежать: время от времени меняет направление */
      b.wt -= dt
      if (b.wt <= 0) {
        b.wt = 0.45 + Math.random() * 0.55
        b.dir = Math.random() * Math.PI * 2
      }
      b.x += Math.cos(b.dir) * BIG_SPEED * u * dt
      b.y += Math.sin(b.dir) * BIG_SPEED * u * dt
      /* Границы поля: отскок, как у зёрен в перке «Скользкий пол» */
      const mX = 40 * u
      const top = 40
      const bot = this.H - 46 * u
      if (b.x < mX) {
        b.x = mX
        b.dir = Math.PI - b.dir
      }
      if (b.x > this.W - mX) {
        b.x = this.W - mX
        b.dir = Math.PI - b.dir
      }
      if (b.y < top) {
        b.y = top
        b.dir = -b.dir
      }
      if (b.y > bot) {
        b.y = bot
        b.dir = -b.dir
      }
      /* Время вышло — укатилась: награда потеряна безвозвратно */
      if (b.t >= this.bigLife) {
        this.crumbs(b.x, b.y, '#C9B38A', 9)
        this.texts.push({
          x: b.x,
          y: b.y - 40 * u,
          text: this.L('big.miss'),
          color: '#B9A88F',
          t: 0,
          dur: 1,
          size: 22 * u,
        })
        audio.play('penalty')
        this.big = null
      }
      return
    }
    /* Ещё не появлялась на этом уровне — время пришло? Ровно одна на уровень:
       помечаем bigDone в момент выхода, иначе после поимки/промаха
       расписание сработало бы заново каждый кадр */
    if (!this.bigDone && this.duration - this.timeLeft >= this.bigAt) {
      this.bigDone = true
      this.spawnBig()
    }
  }

  /** Выпустить большую попкорнину: подальше от лапки, чтобы успели не все.
      forced — сорт для QA/E2E (обычно сорт рэндомится) */
  private spawnBig(forced?: BigKind): void {
    const u = this.u
    /* Ролл сорта: карамель 60% · вишня 29% · виноград 11% */
    this.bigKind = forced ?? rollBigKind()
    const v = BIG_VARIANTS[this.bigKind]
    const mX = 52 * u
    const top = 46 + 8 * u
    const bottom = this.H - 60 * u
    const diag = Math.hypot(this.W, this.H)
    let bx = this.W / 2
    let by = this.H / 2
    let best = -1
    for (let tries = 0; tries < 44; tries++) {
      const x = mX + Math.random() * (this.W - mX * 2)
      const y = top + Math.random() * Math.max(10, bottom - top)
      const dPaw = Math.hypot(x - this.paw.x, y - this.paw.y)
      if (dPaw <= best) continue
      /* не в стаканчике и не впритык к минам/зёрнам */
      if (Math.hypot(x - this.cup.x, y - this.cup.y) < 110 * u) continue
      let bad = false
      for (const q of this.pieces) {
        if (Math.hypot(x - q.x, y - q.y) < 52 * u) {
          bad = true
          break
        }
      }
      if (bad) continue
      bx = x
      by = y
      best = dPaw
      if (best > diag * 0.52) break /* уже достаточно далеко — хватит искать */
    }
    this.big = { x: bx, y: by, t: 0, dir: Math.random() * Math.PI * 2, wt: 0.5, phase: Math.random() * Math.PI * 2 }
    /* Ударная волна в цвете сорта + объявление: реакция игрока стартует сейчас */
    this.rings.push({ x: bx, y: by, t: 0, ttl: 0.7, color: v.ring, r0: 14 * u, r1: 110 * u })
    this.texts.push({
      x: bx,
      y: by - 48 * u,
      text: this.L(`big.${this.bigKind}`),
      color: v.text,
      t: 0,
      dur: 1.5,
      size: 26 * u,
    })
    audio.play('chest')
    this.buzz([20, 30, 20])
  }

  /** Поймала лапка: очки сорта (у вишни и винограда — с комбо-множителем)
      и монетки компоненту. Карамель — плоские +500 (0.0.31: было 1000) */
  private catchBig(): void {
    const u = this.u
    const b = this.big
    if (!b) return
    this.big = null
    this.bigCaught++
    if (this.bigKind === 'caramel') this.bigCaramelRun++
    else if (this.bigKind === 'cherry') this.bigCherryRun++
    else this.bigGrapeRun++
    const v = BIG_VARIANTS[this.bigKind]
    /* «Сладкая глазурь»: очки попкорнин +10% за ступень */
    const pts = Math.round(
      (v.combo ? v.base * this.comboMult : v.base) * (1 + (this.tree.bigMult01 ?? 0)),
    )
    this.bigCoinsRun += v.coins
    this.score += pts
    this.paw.pulse = 1
    this.rings.push({ x: b.x, y: b.y, t: 0, ttl: 0.5, color: v.ring, r0: 12 * u, r1: 74 * u })
    this.crumbs(b.x, b.y, v.crumb, 14)
    this.texts.push({
      x: b.x,
      y: b.y - 44 * u,
      text: `+${pts}`,
      color: v.text,
      t: 0,
      dur: 1.2,
      size: 32 * u,
    })
    audio.play('golden')
    audio.play('coin')
    this.buzz(35)
  }

  /** QA/E2E: немедленно выпустить большую попкорнину, минуя расписание.
      Сорт можно задать — для проверки очков и цветов всех трёх */
  debugSpawnBig(kind?: BigKind): void {
    if (this.phase === 'playing' && !this.big && !this.fever) this.spawnBig(kind)
  }

  /** Отладка/E2E: принудительно выпустить босса на текущем уровне */
  debugSpawnBoss(): void {
    if (this.phase === 'playing' && !this.boss && !this.fever) this.spawnBoss()
  }

  /* ================= обновление ================= */

  private update(dt: number): void {
    const u = this.u

    /* Пауза-итог лихорадки: показываем результат и сразу идём на следующий
       уровень (сундучок пропускается — так и задумано: было тяжело!) */
    if (this.feverAfter >= 0) {
      this.feverAfter -= dt
      if (this.feverAfter <= 0) {
        this.feverAfter = -1
        this.startLevel(this.feverNextLvl, null)
        return
      }
    }

    /* Внезапная ЛИХОРАДКА из древа («Фарт»): стартуем после кадра сбора,
       когда никакие массивы не обходятся */
    if (this.pendingFever) {
      this.pendingFever = false
      if (
        !this.fever &&
        !this.boss &&
        this.feverAfter < 0 &&
        this.pendingClear < 0 &&
        this.phase === 'playing'
      ) {
        this.startFever(this.lvl)
        return
      }
    }

    // Плавное следование лапки за пальцем/курсором («Тяжёлая лапа» — вдвое медленнее);
    // скины магазина делают лапку проворнее
    if (!this.paw.seen) {
      this.paw.tx = this.cup.x + Math.sin(performance.now() * 0.001) * 80 * u
      this.paw.ty = this.H * 0.35
    }
    if (this.stun > 0) {
      // Шок от мины: лапка «опешила» и застыла на месте — цель запоминается,
      // когда отпустит, лапка догонит палец
      this.pawVX = 0
      this.pawVY = 0
    } else {
      const prevX = this.paw.x
      const prevY = this.paw.y
      const spd = 14 * (this.pawBonus.speed ?? 1) * (1 + (this.tree.speedAdd ?? 0))
      const k = 1 - Math.exp(-dt * (this.perk === 'slowpaw' ? spd * 0.46 : spd))
      this.paw.x += (this.paw.tx - this.paw.x) * k
      this.paw.y += (this.paw.ty - this.paw.y) * k
      /* Статистика теперь в панели над полем: лапке доступен весь экран,
         снизу — до столика со стаканчиком */
      this.paw.x = Math.max(22 * u, Math.min(this.W - 22 * u, this.paw.x))
      this.paw.y = Math.max(46, Math.min(this.H - 42 * u, this.paw.y))
      /* Скорость лапки (px/с), сглаженная: быстрым махом в босс-бою пинаем попкорн */
      const ivx = (this.paw.x - prevX) / Math.max(dt, 0.001)
      const ivy = (this.paw.y - prevY) / Math.max(dt, 0.001)
      const kv = Math.min(1, dt * 14)
      this.pawVX += (ivx - this.pawVX) * kv
      this.pawVY += (ivy - this.pawVY) * kv
    }

    if (this.perk === 'drift') this.driftPieces(dt)
    if (this.perk === 'magnet') this.magnetPull(dt)

    // Голубь-воришка: влетает с 3-го уровня и таскает попкорн из стаканчика
    this.updatePigeon(dt)

    // БОСС «МАЛЫШ»: бродит, рвётся к корзине, гребёт из неё — и ловит пинки
    this.updateBoss(dt)
    if (this.phase !== 'playing') return // босс повержен: уровень уже завершён

    // Летящий попкорн (пнутый лапкой): полёт, отскоки, попадания в малыша
    this.updateThrownPieces(dt)

    // БОЛЬШАЯ ПОПКОРНИНА: побег, обратный отсчёт и выход на поле по расписанию
    this.updateBig(dt)

    // Радиус подбора зависит от перка лапки, скина и древа (геттер grabR)
    const grabR = this.grabR

    // Подбор попкорна / ловушка-кукуруза. В шоке лапка ничего не берёт
    // и мины не задевает — стоит столбом, пока не отпустит
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i]
      if (this.stun > 0) break // «опешила»: ни подбора, ни новых подрывов
      if (p.spawn > 0.12) continue
      const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y)
      /* ТИР-АРКАНОИД: в босс-бою быстрый мах лапкой ПИНАЕТ зерно — оно летит
         и бивает малыша. Медленное касание — обычный подбор, как всегда */
      if (
        this.boss &&
        p.kind !== 'corn' &&
        /* «Меткий пинок»: порог пинка ниже (−6% за ступень) */
        Math.hypot(this.pawVX, this.pawVY) > FLING_MIN_SPEED * u * (1 - Math.min(0.24, this.tree.flingEase01 ?? 0)) &&
        d < grabR + 12 * u
      ) {
        p.vx = this.pawVX * 0.94
        p.vy = this.pawVY * 0.94
        p.spin = (Math.random() < 0.5 ? -1 : 1) * 7
        audio.play('shoo')
        this.crumbs(p.x, p.y, '#FFF3D6', 4)
        this.paw.pulse = 1
        continue
      }
      if (p.kind === 'corn') {
        // Кукуруза-мина: чем толще мина, тем шире радиус задевания
        if (d < 38 * u * (0.7 + 0.3 * this.cornScale)) {
          this.pieces.splice(i, 1)
          /* Ударная волна взрыва: красное кольцо расходится от точки подрыва */
          this.rings.push({
            x: p.x,
            y: p.y,
            t: 0,
            ttl: 0.45,
            color: '255, 90, 78',
            r0: 10 * u,
            r1: 64 * u * (0.7 + 0.3 * this.cornScale),
          })
          if (this.fever) {
            // Мина на лихорадке: весь накопленный там бонус сгорает!
            this.feverEnd(false)
            return
          }
          const guard = (this.pawBonus.guard ?? 0) + (this.tree.guardAdd ?? 0)
          if (guard > 0 && Math.random() < guard) {
            // «Коготки-обереги»: мина обезврежена без штрафа
            this.texts.push({
              x: this.paw.x,
              y: this.paw.y - 34 * u,
              text: this.L('txt.guard'),
              color: '#BFF3E6',
              t: 0,
              dur: 0.9,
              size: 22 * u,
            })
            this.crumbs(p.x, p.y, '#BFF3E6', 6)
            audio.play('click')
          } else if (this.shieldLeft > 0) {
            // «Кошачий щит»: мина прощена — щит лопается вместо штрафа
            this.shieldLeft--
            this.shieldSaves++
            this.texts.push({
              x: this.paw.x,
              y: this.paw.y - 34 * u,
              text: this.L('txt.shield'),
              color: '#BFF3E6',
              t: 0,
              dur: 0.9,
              size: 22 * u,
            })
            this.crumbs(p.x, p.y, '#BFF3E6', 7)
            audio.play('click')
            this.buzz(20)
          } else {
            // Лапка ударилась о мину: ШОК! Очки горят, всё, что несла,
            // высыпается на пол, а сама лапка секунду стоит столбом
            this.breakStreak(this.paw.x, this.paw.y - 44 * u) // мина сбрасывает комбо (или гасится бронёй)
            this.shockDrop()
            this.minesHit++
            this.levelShock++
            this.stun = Math.max(0.4, MINE_SHOCK_SECONDS - (this.tree.stunCut ?? 0))
            this.score = Math.max(0, this.score - MINE_SCORE_PENALTY)
            this.paw.hurt = 1.6
            this.doShake(9) // тряска экрана (отключается в настройках)
            this.texts.push({
              x: this.paw.x,
              y: this.paw.y - 40 * u,
              text: this.L('txt.shock', { n: MINE_SCORE_PENALTY }),
              color: '#FF6B5E',
              t: 0,
              dur: 1.1,
              size: 24 * u,
            })
            this.crumbs(p.x, p.y, '#E5342E', 9)
            audio.play('penalty')
            this.buzz([60, 40, 100])
            /* Мина теперь ещё и бьёт по сердцам */
            this.loseHeart('mine')
          }
        }
        continue
      }
      if (d < grabR && this.carried.length < this.carryMax) {
        this.pieces.splice(i, 1)
        this.carried.push({ kind: p.kind as Exclude<PieceKind, 'corn'>, grabT: 0 })
        this.runGrains++
        if (p.kind === 'nipple') this.runNipples++
        if (p.kind === 'golden') this.goldenCount++
        this.paw.pulse = 1
        this.crumbs(
          p.x,
          p.y,
          p.kind === 'golden'
            ? '#FFE066'
            : p.kind === 'caramel'
              ? '#FFC98A'
              : p.kind === 'butter'
                ? '#FFED9C'
                : p.kind === 'nipple'
                  ? '#FFC2D9'
                  : '#FFF3D6',
          6,
        )
        audio.play(p.kind === 'golden' ? 'golden' : 'pickup')
        this.buzz(p.kind === 'golden' ? 18 : 8)
      }
    }

    /* БОЛЬШАЯ ПОПКОРНИНА: мгновенный приз за касание — пока кольцо не закрылось.
       В шоке лапка не ловит: стоит столбом, пока приз убегает */
    if (this.big && this.stun <= 0) {
      const db = Math.hypot(this.paw.x - this.big.x, this.paw.y - this.big.y)
      if (db < grabR + 30 * u) this.catchBig()
    }

    // Высыпание в стаканчик (с перком «Двойной стаканчик» — с дальнего подлёта).
    // В шоке лапка не сдаёт — несла в клюв... несла в лапке, уронила на мину
    if (this.carried.length > 0 && this.stun <= 0) {
      const dc = Math.hypot(this.paw.x - this.cup.x, this.paw.y - this.cup.y)
      const dropR = this.perk === 'secondcup' ? 118 * u : 78 * u
      if (dc < dropR) {
        let base = 0
        let hasGold = false
        let goldN = 0
        for (const c of this.carried) {
          base += KIND_POINTS[c.kind]
          hasGold = hasGold || c.kind === 'golden'
          if (c.kind === 'golden') goldN++
        }
        this.streak++
        const cm = this.comboMult
        const mult =
          perkScoreMult(this.perk) * cm * (1 + (this.tree.grainMult01 ?? 0))
        const sum = base * mult
        this.collected += this.carried.length
        this.carried.forEach((c, i) => {
          this.flying.push({
            x0: this.paw.x + (i - 1) * 8 * u,
            y0: this.paw.y - 20 * u - i * 10 * u,
            kind: c.kind,
            t: 0,
          })
        })
        this.carried = []
        this.score += sum
        /* «Золотая сдача»: +N монеток за каждое золотое зерно (компонент выплатит с множителями) */
        const gc = goldN * Math.max(0, Math.floor(this.tree.goldCoinPer ?? 0))
        if (gc > 0) this.goldCoinsRun += gc
        this.cup.squash = 1
        if (hasGold) this.cupGlow = 1 // искра над стаканчиком
        this.texts.push({
          x: this.cup.x,
          y: this.cup.y - this.cupH * 0.8,
          text: cm > 1 ? `+${Math.round(sum)} ×${cm}` : `+${Math.round(sum)}`,
          color: hasGold || sum >= 80 || cm > 1 ? '#FFC93C' : '#FFFFFF',
          t: 0,
          dur: 0.9,
          size: 26 * u,
        })
        /* Рулетка «Фарта лихорадки» из древа: сдача зерна может внезапно
           запустить ЛИХОРАДКУ. Откладываем до конца кадра — старт лихорадки
           очищает массивы, которые сейчас обходит цикл сдачи */
        if (
          !this.fever &&
          !this.boss &&
          this.feverAfter < 0 &&
          this.pendingClear < 0 &&
          (this.tree.feverLuck ?? 0) > 0 &&
          Math.random() < (this.tree.feverLuck ?? 0)
        ) {
          this.pendingFever = true
        }
        if (cm > 1) {
          this.texts.push({
            x: this.paw.x,
            y: this.paw.y - 44 * u,
            text: this.L('txt.combo', { n: cm }),
            color: '#FFE066',
            t: 0,
            dur: 1,
            size: 24 * u,
          })
        }
        if (this.fever) {
          /* «Жаркий урожай»: очки в ЛИХОРАДКЕ +10% за ступень */
          this.fever.gained += Math.round(sum * (1 + (this.tree.feverMult01 ?? 0)))
          audio.play('coin')
        } else {
          audio.play('deposit')
        }
        this.buzz(12)
      }
    }

    // Летящие в стаканчик зёрна: каждое приземление — «плюх» и лёгкий подскок
    for (let i = this.flying.length - 1; i >= 0; i--) {
      const f = this.flying[i]
      f.t += dt / 0.3
      if (f.t >= 1) {
        this.flying.splice(i, 1)
        this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.5, '#FFF6EC', 3)
        // Звук падения зёрнышка на дно (у дорогих — повыше и со искрой)
        audio.play(f.kind === 'golden' || f.kind === 'butter' ? 'plopGold' : 'plop')
        this.cup.squash = Math.min(1, Math.max(this.cup.squash, 0.35))
      }
    }

    /* Наполнение стаканчика: синхронизируем анимацию зёрен с прогрессом нормы */
    const fillN = Math.min(
      CUP_FILL_POS.length,
      this.quota > 0 ? Math.ceil((this.collected / this.quota) * CUP_FILL_POS.length) : 0,
    )
    if (fillN !== this.lastFill) {
      for (let i = this.lastFill; i < fillN; i++) this.fillPop[i] = 0 // новые зёрна — с пружинкой
      this.fillPop.length = Math.max(this.fillPop.length, fillN)
      this.lastFill = fillN
    }

    /* Лихорадка: дождь монеток на фоне и подсыпка зёрен, чтобы экран
       оставался полным до конца трёх секунд */
    if (this.fever) {
      this.fever.coinT -= dt
      if (this.fever.coinT <= 0) {
        this.fever.coinT = 0.13
        const c = this.particles.obtain()
        c.x = Math.random() * this.W
        c.y = -8
        c.vx = (Math.random() - 0.5) * 30 * u
        c.vy = (110 + Math.random() * 90) * u
        c.t = 0
        c.ttl = 2.4
        c.color = Math.random() < 0.5 ? '#FFE066' : '#FFC93C'
        c.size = (3.5 + Math.random() * 2.5) * u
      }
      let food = 0
      for (const p of this.pieces) if (p.kind !== 'corn') food++
      if (food < 12) this.spawnFeverTop()
    }

    /* Волшебная лапка: шлейф звёздочек сыплется из меха */
    if (this.pawBonus.stars) {
      this.starT -= dt
      if (this.starT <= 0) {
        this.starT = 0.09
        const starColors = ['#FFE066', '#FFF6EC', '#FFC93C']
        const c = this.particles.obtain()
        c.x = this.paw.x + (Math.random() - 0.5) * 14 * u
        c.y = this.paw.y + 20 * u + (Math.random() - 0.5) * 8 * u
        c.vx = (Math.random() - 0.5) * 26 * u
        c.vy = 46 * u
        c.t = 0
        c.ttl = 0.65
        c.color = starColors[Math.floor(Math.random() * starColors.length)] ?? '#FFE066'
        c.size = (2 + Math.random() * 2) * u
      }
    }

    if (!this.fever && this.feverAfter < 0) {
      // Вся волна собрана → следующая. Кукуруза-мины НЕ мешает: считаем только попкорн
      const hasPopcorn = this.pieces.some((p) => p.kind !== 'corn')
      if (
        this.waveDelay < 0 &&
        !hasPopcorn &&
        this.carried.length === 0 &&
        this.flying.length === 0
      ) {
        this.waveDelay = this.baseWaveDelay
      }
      if (this.waveDelay >= 0) {
        this.waveDelay -= dt
        if (this.waveDelay <= 0) {
          this.waveDelay = -1
          this.wave++
          this.banner = { text: this.L('banner.wave', { n: this.wave }), t: 0 }
          audio.play('wave')
          this.spawnWave()
        }
      }

      // Норма выполнена → короткая пауза (зёрна долетают) → уровень пройден
      if (this.pendingClear < 0 && this.collected >= this.quota) {
        this.pendingClear = CLEAR_DELAY
      }
      if (this.pendingClear >= 0) {
        this.pendingClear -= dt
        if (this.pendingClear <= 0) {
          this.levelComplete()
          return
        }
      }
    }

    // Музыка зависит от оставшегося времени: >30с база, ≤30с +25%, ≤15с +40%, ≤5с 240 BPM.
    // В лихорадке — максимальный накал: бешеный темп под звон автоматов!
    const stage = this.fever
      ? 3
      : this.timeLeft > 30
        ? 0
        : this.timeLeft > 15
          ? 1
          : this.timeLeft > 5
            ? 2
            : 3
    if (stage !== this.audioStage) {
      this.audioStage = stage
      audio.setIntensity(stage)
    }

    // Таймер («Черепаший час» тикает на четверть медленнее)
    this.timeLeft -= dt * (this.perk === 'slowmo' ? 0.75 : 1)
    const sec = Math.max(0, Math.ceil(this.timeLeft))
    if (sec !== this.lastSec) {
      this.lastSec = sec
      if (sec <= 5 && sec > 0 && !this.fever && this.feverAfter < 0) audio.play('tick')
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0
      if (this.fever) {
        // Время лихорадки вышло: всё собранное остаётся в счёте!
        this.feverEnd(true)
        return
      }
      this.end()
      return
    }

    // Косметика
    this.paw.pulse = Math.max(0, this.paw.pulse - dt * 5)
    this.paw.hurt = Math.max(0, this.paw.hurt - dt * 2.2)
    this.stun = Math.max(0, this.stun - dt)
    this.cup.squash = Math.max(0, this.cup.squash - dt * 4)
    this.cupGlow = Math.max(0, this.cupGlow - dt * 1.6)
    this.shakeT = Math.max(0, this.shakeT - dt)
    if (this.shakeT <= 0) this.shakeAmp = 0
    this.updateCosmetics(dt)
  }

  /** Косметика кадра: баннер, таймеры декора, частицы, кольца, пылинки,
      след лапки, всплывающие тексты. Живёт и в игре, и в паузе-праздновании
      'clear' — иначе салют и «ПРОЙДЕН!» замрут на первом же кадре */
  private updateCosmetics(dt: number): void {
    const u = this.u
    this.banner.t += dt
    for (const p of this.pieces) {
      p.spawn = Math.max(0, p.spawn - dt)
      p.rot += p.spin * dt
    }
    for (const c of this.carried) c.grabT = Math.min(1, c.grabT + dt * 8)
    for (let i = 0; i < this.fillPop.length; i++) this.fillPop[i] += dt

    /* Пылинки: ленивый дрейф вверх с покачиванием — фон «дышит».
       Создаём лениво при первом кадре, когда известны размеры поля */
    if (this.motes.length === 0 && this.W > 0 && this.perfTier < 2) {
      const n = Math.max(8, Math.min(16, Math.round(this.W / 34)))
      for (let i = 0; i < n; i++) {
        this.motes.push({
          x: Math.random() * this.W,
          y: Math.random() * this.H,
          ph: Math.random() * Math.PI * 2,
          sp: (5 + Math.random() * 9) * u,
          r: (1 + Math.random() * 1.6) * u,
          a: 0.05 + Math.random() * 0.07,
        })
      }
    }
    for (const m of this.motes) {
      m.y -= m.sp * dt
      m.x += Math.sin(m.ph + m.y * 0.013) * 7 * u * dt
      if (m.y < 40) {
        m.y = this.H - 20
        m.x = Math.random() * this.W
      }
    }
    /* Кольца-волны: растут и гаснут */
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i]
      if (!r) continue
      r.t += dt
      if (r.t >= r.ttl) this.rings.splice(i, 1)
    }
    /* Красная вспышка при потере сердца */
    if (this.hurtT > 0) this.hurtT = Math.max(0, this.hurtT - dt)
    /* След лапки: точка добавляется при заметном сдвиге, живёт четверть секунды */
    const lastTrail = this.trail[this.trail.length - 1]
    if (
      this.phase === 'playing' &&
      this.perfTier < 2 &&
      (!lastTrail || Math.hypot(this.paw.x - lastTrail.x, this.paw.y - lastTrail.y) > 26 * u)
    ) {
      this.trail.push({ x: this.paw.x, y: this.paw.y, t: 0 })
      if (this.trail.length > 9) this.trail.shift()
    }
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const d = this.trail[i]
      if (!d) continue
      d.t += dt
      if (d.t >= 0.26) this.trail.splice(i, 1)
    }
    /* Частицы: обход с конца + swap-remove — без splice и без мусора */
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles.items[i]
      p.t += dt
      p.vy += 900 * u * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.t >= p.ttl) this.particles.release(i)
    }
    /* Тексты: компактируем живые на месте — тоже без splice/аллокаций */
    let w = 0
    for (let i = 0; i < this.texts.length; i++) {
      const t = this.texts[i]
      t.t += dt
      if (t.t < t.dur) this.texts[w++] = t
    }
    this.texts.length = w
  }

  private levelComplete(): void {
    this.phase = 'clear'
    /* Праздничный баннер: «УРОВЕНЬ N ПРОЙДЕН!» — игрок видит результат,
       пока салют из стаканчика сыплет конфетти (пауза до нарезки 1.15с) */
    this.banner = { text: this.L('banner.level', { n: this.lvl }) + ' ' + this.L('banner.clear'), t: 0 }
    /* Бонус за оставшееся время: секунды ×5 (0.0.31: было ×10 — экономика строже) */
    const bonus = Math.ceil(this.timeLeft) * 5
    this.score += bonus
    /* За пройденный уровень возвращается +1 сердечко (древо «Лапка-целитель» — больше) */
    this.hearts = Math.min(this.maxHearts, this.hearts + 1 + (this.tree.healPlus ?? 0))
    audio.stopMusic()
    audio.play('levelwin')
    this.buzz([30, 40, 60])
    /* Победный салют из стаканчика + золотая ударная волна */
    this.confettiBurst(this.cup.x, this.cup.y - this.cupH * 0.5, 34)
    this.rings.push({
      x: this.cup.x,
      y: this.cup.y,
      t: 0,
      ttl: 0.6,
      color: '255, 214, 92',
      r0: 20 * this.u,
      r1: 120 * this.u,
    })
    this.emitStats(true)
    this.cb.onLevelComplete?.({
      level: this.lvl,
      score: Math.floor(this.score),
      bonus,
      clean: this.levelShock === 0 && this.levelStolen === 0,
      hearts: this.hearts,
      lostHearts: this.heartLost,
    })
  }

  private end(reason: EndResult['reason'] = 'time'): void {
    if (this.phase === 'ended') return // поражение уже зафиксировано
    this.endReason = reason
    this.phase = 'ended'
    audio.stopMusic()
    if (reason === 'voluntary') {
      /* Победный финал по воле игрока: радостный джингл вместо траурного гудка */
      audio.play('levelwin')
    } else {
      audio.play('gameover')
      this.buzz([60, 40, 60, 40, 120])
    }
    this.emitStats(true)
    this.cb.onEnd?.({ score: Math.floor(this.score), level: this.lvl, reason })
  }

  /** Потеря сердечка: мина, повторный клюв голубя или касание босса-малыша.
      Ноль — поражение */
  private loseHeart(where: 'mine' | 'pigeon' | 'boss'): void {
    if (this.phase !== 'playing' || this.hearts <= 0) return
    const u = this.u
    this.hearts--
    this.heartLost++
    const hx =
      where === 'boss'
        ? (this.boss?.x ?? this.paw.x)
        : where === 'mine'
          ? this.paw.x
          : this.cup.x
    const hy =
      where === 'boss'
        ? (this.boss?.y ?? this.paw.y)
        : where === 'mine'
          ? this.paw.y - 64 * u
          : this.cup.y - this.cupH * 1.5
    this.texts.push({
      x: hx,
      y: hy,
      text: this.L('txt.heart'),
      color: '#FF6B8A',
      t: 0,
      dur: 1.1,
      size: 24 * u,
    })
    this.doShake(6)
    this.hurtT = 0.55 // красная вспышка по краям экрана
    audio.play('penalty')
    this.buzz([40, 60])
    this.emitStats(true)
    if (this.hearts <= 0) this.end('hearts')
  }

  /** Разноцветное конфетти из точки (победа уровня, старт лихорадки):
      те же квадратные частицы, но пёстрые, крупные и живут дольше —
      гравитация в update() сама уронит их красиво дождём */
  private confettiBurst(x: number, y: number, n: number): void {
    const u = this.u
    const tierMul = this.perfTier === 0 ? 1 : this.perfTier === 1 ? 0.55 : 0.3
    const count = Math.max(4, Math.round((this.coarse ? 0.7 : 1) * tierMul * n))
    const palette = ['#E24B3B', '#FFD166', '#7BC47F', '#F2A65A', '#FFE066', '#BFF3E6']
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
      const sp = (180 + Math.random() * 260) * u
      const c = this.particles.obtain()
      c.x = x
      c.y = y
      c.vx = Math.cos(a) * sp
      c.vy = Math.sin(a) * sp
      c.t = 0
      c.ttl = 0.8 + Math.random() * 0.6
      c.color = palette[Math.floor(Math.random() * palette.length)] ?? '#FFD166'
      c.size = (2.5 + Math.random() * 3) * u
    }
  }

  private crumbs(x: number, y: number, color: string, n: number): void {
    const u = this.u
    // На телефонах режем количество частиц — слабые GPU скажут спасибо.
    // Автокачество (perfTier) урезает ещё сильнее, если FPS просел
    const tierMul = this.perfTier === 0 ? 1 : this.perfTier === 1 ? 0.5 : 0.3
    const count = Math.max(
      2,
      Math.round((this.coarse ? 0.65 : 1) * tierMul * n),
    )
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = (60 + Math.random() * 120) * u
      const c = this.particles.obtain()
      c.x = x
      c.y = y
      c.vx = Math.cos(a) * sp
      c.vy = Math.sin(a) * sp - 60 * u
      c.t = 0
      c.ttl = 0.35 + Math.random() * 0.25
      c.color = color
      c.size = (2 + Math.random() * 2.5) * u
    }
  }

  /** Лёгкая вибрация на телефоне: только по событиям, коротко и не чаще 80 мс.
      Полностью отключается в настройках. */
  private buzz(ms: number | number[]): void {
    try {
      if (!this.opts.vibration) return
      if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
      const now = performance.now()
      if (now - this.lastBuzzAt < 80) return
      this.lastBuzzAt = now
      navigator.vibrate(ms)
    } catch {
      /* вибрация недоступна — не страшно */
    }
  }

  /** Тряска экрана при минах и голубе (отключается в настройках) */
  private doShake(amp: number): void {
    if (!this.opts.shake) return
    this.shakeAmp = Math.max(this.shakeAmp, amp * this.u)
    this.shakeT = 0.3
  }

  /* ================= голубь-воришка ================= */

  /** Полоска здоровья воришки: на первых уровнях хватает ТРЁХ ударов лапкой,
      дальше голубь крепчает (ур. 5 → 4, ур. 9 → 5, потолок 9).
      Сложность из настроек: лёгкая −1, сложная +1 */
  private pigeonMaxHp(): number {
    let hp = Math.min(9, 3 + Math.floor((this.lvl - 1) / 4))
    if (this.opts.difficulty === 'easy') hp = Math.max(2, hp - 1)
    if (this.opts.difficulty === 'hard') hp = Math.min(10, hp + 1)
    return hp
  }

  private spawnPigeon(): void {
    const u = this.u
    const side: 1 | -1 = Math.random() < 0.5 ? -1 : 1
    const maxHp = this.pigeonMaxHp()
    this.pigeon = {
      x: side < 0 ? -50 * u : this.W + 50 * u,
      y: 100 * u + Math.random() * 30 * u,
      state: 'in',
      stateT: 0,
      peckT: PIGEON_PECK_EVERY,
      side,
      hx: this.cup.x - side * 95 * u,
      hy: this.cup.y - 165 * u,
      hp: maxHp,
      maxHp,
      stolen: 0,
      pecks: 0,
      hitCd: 0,
      flash: 0,
      kx: 0,
      ky: 0,
      downed: false,
    }
    this.texts.push({
      x: this.W / 2,
      y: this.H * 0.22,
      text: this.L('txt.pigeon'),
      color: '#C8CFD8',
      t: 0,
      dur: 1.6,
      size: 26 * u,
    })
    audio.play('pigeon')
    this.buzz(30)
    this.doShake(4)
  }

  /** Голубь летит к стаканчику и таскает попкорн; каждое касание лапкой —
      урон. Набьёшь полоску жизни — повален: вернёт украденное и +{{n}} очков */
  private updatePigeon(dt: number): void {
    if (!this.pigeon) {
      if (this.pigeonTimer > 0) {
        this.pigeonTimer -= dt
        if (this.pigeonTimer <= 0) this.spawnPigeon()
      }
      return
    }
    const u = this.u
    const g = this.pigeon
    g.stateT += dt
    if (g.state === 'in') {
      const dx = g.hx - g.x
      const dy = g.hy - g.y
      const d = Math.hypot(dx, dy)
      /* Голуби стали вдвое быстрее — успей запугать, пока не расклевала корзину */
      const step = 300 * u * dt
      if (d <= step) {
        g.x = g.hx
        g.y = g.hy
        g.state = 'hover'
        g.stateT = 0
      } else {
        g.x += (dx / d) * step
        g.y += (dy / d) * step
      }
    } else if (g.state === 'hover') {
      g.y += Math.sin(g.stateT * 6) * 12 * u * dt
      g.peckT -= dt
      if (g.peckT <= 0) {
        /* Чем выше уровень, тем чаще клюёт (2.2с → 1.2с) */
        g.peckT = Math.max(1.2, PIGEON_PECK_EVERY - this.lvl * 0.05) + Math.random() * 0.8
        this.pigeonPeck()
      }
    } else {
      // 'flee': улетает за тот же борт, откуда прилетел.
      // Поверженный — быстрее, выше и кувырком
      const speed = g.downed ? 430 : 320
      const rise = g.downed ? 150 : 40
      g.x += -g.side * speed * u * dt
      g.y -= rise * u * dt
      if (g.x < -60 * u || g.x > this.W + 60 * u) {
        this.pigeon = null
        /* Чем выше уровень, тем чаще возвращаются воришки: ramp с ×1 (3-й ур.)
           до ×0.32. «Птичий базар» убыстряет сверх того. С 7-го уровня птичья
           стая: шанс 40%, что воришка вернётся уже через пару секунд */
        const ramp = Math.max(0.32, 1 - (this.lvl - 3) * 0.07)
        let base = (PIGEON_RESPAWN[0] + Math.random() * (PIGEON_RESPAWN[1] - PIGEON_RESPAWN[0])) * ramp
        if (this.perk === 'pigeonfeast') base *= 0.35
        if (this.lvl >= 7 && Math.random() < 0.4) base = 1.5 + Math.random() * 1.5
        this.pigeonTimer = base
      }
    }
    /* Отлёт после удара: импульс гаснет, в парении воришка возвращается
       к своей точке над стаканчиком */
    if (g.state !== 'flee') {
      g.x += g.kx * dt
      g.y += g.ky * dt
      const dec = Math.min(1, dt * 5)
      g.kx -= g.kx * dec
      g.ky -= g.ky * dec
      if (g.state === 'hover') {
        g.x += (g.hx - g.x) * Math.min(1, dt * 1.5)
        g.y += (g.hy - g.y) * Math.min(1, dt * 1.5)
      }
    }
    /* УДАР ЛАПКОЙ: каждое касание (или проведение через него) — минус
       одно деление жизни. Короткий кулдаун держит серию ударов равномерной,
       а вздрагивание откидывает голубя — просто держать лапку на нём мало */
    g.hitCd -= dt
    g.flash = Math.max(0, g.flash - dt * 3)
    if (
      g.state !== 'flee' &&
      g.hitCd <= 0 &&
      Math.hypot(this.paw.x - g.x, this.paw.y - g.y) < PIGEON_HIT_R * u
    ) {
      g.hitCd = PIGEON_HIT_CD
      g.hp--
      g.flash = 1
      g.peckT = Math.max(g.peckT, 0.55) // оглушён — мгновение не ворует
      const d = Math.hypot(g.x - this.paw.x, g.y - this.paw.y) || 1
      g.kx = ((g.x - this.paw.x) / d) * 300 * u
      g.ky = ((g.y - this.paw.y) / d) * 300 * u
      this.paw.pulse = 1
      this.crumbs(g.x, g.y, '#E8E4DC', 7) // перья полетели
      if (g.hp <= 0) {
        // ПОВЕРЖЕН! Улетает кувырком, возвращая всё украденное в стаканчик.
        // «Птичий базар»: воришек больше — но и награда вдвое жирнее
        g.state = 'flee'
        g.downed = true
        g.stateT = 0
        this.pigeonsRun++
        const ko = this.perk === 'pigeonfeast' ? PIGEON_KO_BONUS * 2 : PIGEON_KO_BONUS
        this.score += ko
        if (g.stolen > 0) {
          this.collected += g.stolen
          for (let i = 0; i < g.stolen; i++) {
            this.flying.push({
              x0: g.x + (Math.random() - 0.5) * 36 * u,
              y0: g.y + (Math.random() - 0.5) * 24 * u,
              kind: 'popcorn',
              t: 0,
            })
          }
          g.stolen = 0
        }
        this.texts.push({
          x: g.x,
          y: g.y - 34 * u,
          text: this.L('txt.downed', { n: ko }),
          color: '#FFE066',
          t: 0,
          dur: 1.2,
          size: 26 * u,
        })
        audio.play('meow') // кошка своего добилась!
        this.doShake(5)
        this.buzz([30, 30, 60])
      } else {
        this.texts.push({
          x: g.x,
          y: g.y - 34 * u,
          text: this.L('txt.hit'),
          color: '#FFFFFF',
          t: 0,
          dur: 0.55,
          size: 20 * u,
        })
        audio.play('shoo')
        this.buzz(15)
      }
    }
  }

  private pigeonPeck(): void {
    const u = this.u
    if (!this.pigeon) return
    if (this.collected > 0) {
      const g = this.pigeon
      /* Воришка становится наглее с уровнем: с 6-го тащит по 2 зерна,
         с 11-го — по 3, с 16-го — по 4 за клюв (1 + floor((lvl-1)/5)).
         «Мир с голубем»: тащит на 1 зерно меньше за ступень, но не меньше 1 */
      const steal = Math.min(
        this.collected,
        Math.max(1, 1 + Math.floor((this.lvl - 1) / 5) - (this.tree.pigeonStealCut ?? 0)),
      )
      this.collected -= steal
      g.stolen += steal
      g.pecks++ // со второго клюва — минус сердечко
      this.levelStolen++ // ачивка «Чистая работа» сгорела
      this.breakStreak(this.cup.x, this.cup.y - this.cupH * 0.9) // воришка сбивает серию (или гасится бронёй)
      this.pendingClear = -1 // украденное зерно отменяет близкое «уровень пройден»
      this.cup.squash = 1
      this.doShake(5)
      this.texts.push({
        x: this.cup.x,
        y: this.cup.y - this.cupH * 0.9,
        text: this.L('txt.stole'),
        color: '#FF6B5E',
        t: 0,
        dur: 1,
        size: 26 * u,
      })
      this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.4, '#C8CFD8', 6)
      audio.play('penalty')
      this.buzz(40)
      /* Разграбленная корзина: унесли всё до последнего зерна — поражение */
      if (this.collected <= 0) {
        this.end('ransacked')
        return
      }
      /* Повторный клюв по корзине — минус сердечко */
      if (g.pecks >= 2) this.loseHeart('pigeon')
    } else {
      this.texts.push({
        x: this.cup.x,
        y: this.cup.y - this.cupH * 0.9,
        text: this.L('txt.empty'),
        color: '#C8CFD8',
        t: 0,
        dur: 0.8,
        size: 20 * u,
      })
    }
  }

  /** Лапка ударилась о мину: всё, что она несла, высыпается на пол рядом —
      зёрна не пропадают, их можно снова собрать, когда шок отпустит.
      На другие мины зёрна не кладём — не подставляем игрока дважды */
  private shockDrop(): void {
    const u = this.u
    const mX = 40 * u
    const top = 52
    const bottom = this.H - 56 * u
    const dropped = this.carried
    this.carried = []
    for (const c of dropped) {
      let placed = false
      for (let tries = 0; tries < 14 && !placed; tries++) {
        const a = Math.random() * Math.PI * 2
        const r = (36 + Math.random() * 52) * u
        const x = Math.max(mX, Math.min(this.W - mX, this.paw.x + Math.cos(a) * r))
        const y = Math.max(top, Math.min(bottom, this.paw.y + Math.sin(a) * r))
        const onMine = this.pieces.some(
          (q) => q.kind === 'corn' && Math.hypot(x - q.x, y - q.y) < 34 * u,
        )
        if (!onMine) {
          this.pieces.push({
            x,
            y,
            rot: (Math.random() - 0.5) * 0.9,
            kind: c.kind,
            phase: Math.random() * Math.PI * 2,
            spawn: 0.3, // короткая «пружинка» появления
            spin: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.5),
            dA: 0,
          })
          placed = true
        }
      }
      if (!placed) {
        // вокруг сплошь мины — кладём под лапку, пусть будет счастливый билет
        this.pieces.push({
          x: this.paw.x,
          y: Math.max(top, Math.min(bottom, this.paw.y)),
          rot: 0,
          kind: c.kind,
          phase: 0,
          spawn: 0.3,
          spin: 0,
          dA: 0,
        })
      }
    }
  }

  /* ================= босс «МАЛЫШ» ================= */

  /** Жизни босса: у первого (10-й уровень) 3, у каждого следующего +1.
      Сложность из настроек: лёгкая −1, сложная +1 */
  private bossMaxHp(): number {
    const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY))
    let hp = BOSS_BASE_HP + (tier - 1) * BOSS_HP_PER_TIER
    if (this.opts.difficulty === 'easy') hp = Math.max(2, hp - 1)
    if (this.opts.difficulty === 'hard') hp += 1
    return hp
  }

  private spawnBoss(): void {
    const u = this.u
    const maxHp = this.bossMaxHp()
    /* Запоминаем запас сердец на момент появления — ачивка «Неприкасаемый»
        сравнит его с запасом на момент победы */
    this.bossHeartsAtSpawn = this.hearts
    this.boss = {
      x: this.W / 2,
      y: -80 * u,
      vx: 0,
      vy: 0,
      hp: maxHp,
      maxHp,
      state: 'in',
      stateT: 0,
      atkT: BOSS_CHARGE_BASE,
      flash: 0,
      invuln: 0,
      wobble: Math.random() * Math.PI * 2,
      swing: 0,
    }
    this.banner = { text: this.L('banner.boss'), t: 0 }
    this.texts.push({
      x: this.W / 2,
      y: this.H * 0.32,
      text: this.L('txt.bossWarn'),
      color: '#FF8FA3',
      t: 0,
      dur: 2.4,
      size: 23 * u,
    })
    audio.play('pigeon')
    this.buzz([30, 40, 80])
    this.doShake(6)
    this.emitStats(true)
  }

  /** Босс живёт своей жизнью: бродит по верхней половине, по таймеру РВЁТСЯ
      к корзине и выгребает попкорн. Касание лапкой — сердечко слетает */
  private updateBoss(dt: number): void {
    const b = this.boss
    if (!b) return
    const u = this.u
    b.stateT += dt
    b.flash = Math.max(0, b.flash - dt * 3)
    b.invuln = Math.max(0, b.invuln - dt)
    b.swing = Math.max(0, b.swing - dt * 2.2)
    b.wobble += dt * (b.state === 'charge' ? 15 : 6.5)

    if (b.state === 'in') {
      // вламывается сверху к своей зоне бродяжничества
      const ty = this.H * 0.3
      b.y += 230 * u * dt
      if (b.y >= ty) {
        b.y = ty
        b.state = 'wander'
        b.stateT = 0
        b.atkT = BOSS_CHARGE_BASE
      }
    } else if (b.state === 'wander') {
      // неторопливо бродит и меняет направление — в него ещё надо попасть
      if (b.vx === 0 && b.vy === 0) {
        const a = Math.random() * Math.PI * 2
        b.vx = Math.cos(a) * 62 * u
        b.vy = Math.sin(a) * 44 * u
      }
      b.x += b.vx * dt
      b.y += b.vy * dt
      const mX = 62 * u
      const top = 84
      const bottom = this.H * 0.55
      if (b.x < mX || b.x > this.W - mX) {
        b.vx *= -1
        b.x = Math.max(mX, Math.min(this.W - mX, b.x))
      }
      if (b.y < top || b.y > bottom) {
        b.vy *= -1
        b.y = Math.max(top, Math.min(bottom, b.y))
      }
      if (b.stateT > 1.7) {
        b.vx = 0
        b.vy = 0
        b.stateT = 0
      }
      b.atkT -= dt
      if (b.atkT <= 0) {
        // РЫВОК К КОРЗИНЕ: каждый следующий босс злее и быстрее
        const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY))
        b.state = 'charge'
        b.stateT = 0
        const d = Math.hypot(this.cup.x - b.x, this.cup.y - b.y) || 1
        const sp = (155 + tier * 26) * u
        b.vx = ((this.cup.x - b.x) / d) * sp
        b.vy = ((this.cup.y - b.y) / d) * sp
        audio.play('fever')
      }
    } else if (b.state === 'charge') {
      b.x += b.vx * dt
      b.y += b.vy * dt
      if (Math.hypot(b.x - this.cup.x, b.y - this.cup.y) < 74 * u) {
        b.state = 'swat'
        b.stateT = 0
        b.swing = 1
        this.bossSwat()
      }
    } else if (b.state === 'swat') {
      // гребёт из корзины полсекунды — потом пятится и снова бродит
      if (b.stateT > 0.55) {
        b.state = 'wander'
        b.stateT = 0
        b.atkT =
          Math.max(2.3, BOSS_CHARGE_BASE - Math.floor(this.lvl / BOSS_EVERY) * 0.35) +
          Math.random() * 0.7
        const d = Math.hypot(b.x - this.cup.x, b.y - this.cup.y) || 1
        b.vx = ((b.x - this.cup.x) / d) * 130 * u
        b.vy = ((b.y - this.cup.y) / d) * 130 * u
      }
    } else if (b.state === 'hurt') {
      // отшатнулся от пинка, тормозит — потом снова бродит
      b.x += b.vx * dt
      b.y += b.vy * dt
      const dec = Math.max(0, 1 - dt * 4.5)
      b.vx *= dec
      b.vy *= dec
      const mX = 62 * u
      b.x = Math.max(mX, Math.min(this.W - mX, b.x))
      b.y = Math.max(60, Math.min(this.H - 120 * u, b.y))
      if (b.stateT > 0.5) {
        b.state = 'wander'
        b.stateT = 0
        b.vx = 0
        b.vy = 0
      }
    } else if (b.state === 'flee') {
      // побеждён: уплывает вверх, покачиваясь из стороны в сторону
      b.y -= 300 * u * dt
      b.x += Math.sin(b.stateT * 9) * 40 * u * dt
      if (b.y < -110 * u) {
        this.boss = null
        this.bossDefeated()
      }
      return
    }

    /* КАСАНИЕ ЛАПКОЙ: трогать малыша НЕЛЬЗЯ — минус сердечко.
       «Отдышка» после касания не даёт выжечь все сердца одним махом.
       Сюда попадают только состояния на земле — 'in'/'flee' ушли выше */
    if (b.invuln <= 0 && this.stun <= 0) {
      const dtouch = Math.hypot(this.paw.x - b.x, this.paw.y - b.y)
      if (dtouch < (BOSS_TOUCH_R + 24) * u) {
        b.invuln = BOSS_TOUCH_CD
        b.flash = 1
        const d = dtouch || 1
        b.vx = ((b.x - this.paw.x) / d) * 170 * u
        b.vy = ((b.y - this.paw.y) / d) * 170 * u
        if (b.state === 'charge') {
          b.state = 'hurt'
          b.stateT = 0
        }
        /* «Мягкие рукавички»: шанс 12% за ступень, что касание обойдётся
           без потери сердца — малыш отшатывается, но сердце остаётся */
        const guard = this.tree.bossGuard01 ?? 0
        if (guard > 0 && Math.random() < guard) {
          this.texts.push({
            x: this.paw.x,
            y: this.paw.y - 40 * u,
            text: this.L('txt.guard'),
            color: '#BFF3E6',
            t: 0,
            dur: 0.9,
            size: 22 * u,
          })
          this.crumbs(b.x, b.y, '#BFF3E6', 6)
          audio.play('click')
        } else {
          this.loseHeart('boss')
        }
      }
    }
  }

  /** Малыш добрался до корзины: гребёт из неё попкорн — как воришка-голубь,
      только жирнее (растёт с номером босса). Пустую корзину только трясёт */
  private bossSwat(): void {
    const u = this.u
    if (this.collected > 0) {
      const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY))
      const steal = Math.min(this.collected, BOSS_STEAL + tier - 1)
      this.collected -= steal
      this.levelStolen++
      this.breakStreak(this.cup.x, this.cup.y - this.cupH * 0.9)
      this.cup.squash = 1
      this.doShake(7)
      this.texts.push({
        x: this.cup.x,
        y: this.cup.y - this.cupH * 0.9,
        text: this.L('txt.stole'),
        color: '#FF6B5E',
        t: 0,
        dur: 1,
        size: 26 * u,
      })
      this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.4, '#FFC2D9', 7)
      audio.play('penalty')
      this.buzz(40)
    } else {
      this.texts.push({
        x: this.cup.x,
        y: this.cup.y - this.cupH * 0.9,
        text: this.L('txt.empty'),
        color: '#C8CFD8',
        t: 0,
        dur: 0.8,
        size: 20 * u,
      })
    }
    this.emitStats(true)
  }

  /** Летящий попкорн: пнутое лапкой зерно скользит с трением, отскакивает
      от краёв поля и, врезавшись в малыша, снимает ему жизнь */
  private updateThrownPieces(dt: number): void {
    const u = this.u
    const mX = 34 * u
    const top = 50
    const bottom = this.H - 52 * u
    const b = this.boss
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i]
      const vx = p.vx ?? 0
      const vy = p.vy ?? 0
      if (Math.hypot(vx, vy) < 26 * u) {
        if (vx !== 0 || vy !== 0) {
          p.vx = 0
          p.vy = 0
        }
        continue
      }
      p.x += vx * dt
      p.y += vy * dt
      const fr = Math.exp(-FLING_FRICTION * dt)
      p.vx = vx * fr
      p.vy = vy * fr
      /* Отскоки от краёв поля: зерно не улетает за кадр */
      if (p.x < mX) {
        p.x = mX
        p.vx = Math.abs(vx) * 0.72
      } else if (p.x > this.W - mX) {
        p.x = this.W - mX
        p.vx = -Math.abs(vx) * 0.72
      }
      if (p.y < top) {
        p.y = top
        p.vy = Math.abs(vy) * 0.72
      } else if (p.y > bottom) {
        p.y = bottom
        p.vy = -Math.abs(vy) * 0.72
      }
      /* ПОПАДАНИЕ В МАЛЫША: зерно тратится, малыш теряет жизнь */
      if (b && b.state !== 'flee' && b.state !== 'in') {
        if (Math.hypot(p.x - b.x, p.y - b.y) < 48 * u + 12 * u) {
          this.pieces.splice(i, 1)
          this.hitBoss(p.x, p.y, vx, vy)
        }
      }
    }
  }

  /** Пинок попкорном прилетел в малыша: минус жизнь, малыш отшатывается.
      Жизни кончились — побеждён, уплывает за кадр */
  private hitBoss(x: number, y: number, vx: number, vy: number): void {
    const b = this.boss
    if (!b) return
    const u = this.u
    b.hp--
    b.flash = 1
    b.state = 'hurt'
    b.stateT = 0
    const d = Math.hypot(vx, vy) || 1
    b.vx = (vx / d) * 150 * u
    b.vy = (vy / d) * 150 * u
    this.rings.push({
      x,
      y,
      t: 0,
      ttl: 0.4,
      color: '255, 143, 163',
      r0: 8 * u,
      r1: 46 * u,
    })
    this.crumbs(x, y, '#FFF3D6', 8)
    this.doShake(4)
    this.buzz(20)
    if (b.hp <= 0) {
      b.state = 'flee'
      b.stateT = 0
      const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY))
      const bonus = BOSS_BONUS_BASE + (tier - 1) * BOSS_BONUS_PER_TIER
      this.score += bonus
      /* «Призовые малыша»: монетки с боссов +12% за ступень */
      this.bossCoinsRun += Math.round(
        (BOSS_COINS_BASE + (tier - 1) * BOSS_COINS_PER_TIER) * (1 + (this.tree.bossCoins01 ?? 0)),
      )
      /* Ачивки босса: счёт побед за забег и «без царапин» — сердечек при
          победе не меньше, чем было при появлении малыша */
      this.bossKillsRun++
      this.bossCleanLast = this.hearts >= this.bossHeartsAtSpawn
      this.texts.push({
        x: b.x,
        y: b.y - 50 * u,
        text: this.L('txt.bossDown', { n: bonus }),
        color: '#FFE066',
        t: 0,
        dur: 1.6,
        size: 26 * u,
      })
      this.confettiBurst(b.x, b.y, 26)
      audio.play('meow')
      this.doShake(6)
    } else {
      this.texts.push({
        x: b.x,
        y: b.y - 50 * u,
        text: this.L('txt.bossHit'),
        color: '#FFFFFF',
        t: 0,
        dur: 0.7,
        size: 22 * u,
      })
      audio.play('shoo')
    }
    this.emitStats(true)
  }

  /** Малыш повержен и уплыл за кадр: уровень завершается той же дорогой,
      что и обычная сдача нормы — салют, сундучок, нарезка, следующий этап */
  private bossDefeated(): void {
    this.levelComplete()
  }

  /* ================= цикл ================= */

  private loop = (ts: number): void => {
    if (this.destroyed) return
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000)
    this.lastTs = ts
    if (this.phase === 'playing' && !this.paused) {
      try {
        this.update(dt)
      } catch (err) {
        // Сбой кадра не должен замораживать игру — логируем и продолжаем
        console.error('[popcorn] update error:', err)
      }
    } else if (this.phase === 'clear' && !this.paused) {
      /* Празднование победы: геймплей стоит, но косметика живёт —
         баннер «ПРОЙДЕН!» проявляется, конфетти падает, кольцо расходится */
      try {
        this.updateCosmetics(dt)
      } catch (err) {
        console.error('[popcorn] clear cosmetics error:', err)
      }
    }
    /* FPS-монитор: если долго ниже 45 — переходим на облегчённый режим,
       когда снова стабильно выше 55 — возвращаем эффекты */
    const newTier = this.fpsMeter.tick(dt, ts)
    if (newTier !== null) this.setPerfTier(newTier)
    this.render(ts)
    this.emitStats(false)
    this.raf = requestAnimationFrame(this.loop)
  }

  /** Текущий сглаженный FPS (для отладки: window.__popcornEngine.fps) */
  get fps(): number {
    return Math.round(this.fpsMeter.fps)
  }

  /** Активный perf-тир авто-качества (0 — все эффекты, 2 — минимум) */
  get perfTier(): number {
    return this.fpsMeter.tier
  }

  /** Смена авто-качества: на тире 2 ещё и урезаем DPR-потолок до 1.2 */
  private setPerfTier(tier: number): void {
    this.applyDpr()
  }

  /** Пересчитать DPR канваса: потолок из настроек качества,
      плюс авто-потолок 1.2 на нижнем тире (реальный буст на телефонах) */
  private applyDpr(): void {
    const dprCap =
      this.opts.quality === 'low'
        ? 1.2
        : this.opts.quality === 'high'
          ? 2
          : this.coarse
            ? 1.6
            : 2
    const cap = this.fpsMeter.tier >= 2 ? Math.min(dprCap, 1.2) : dprCap
    this.dpr = Math.min(window.devicePixelRatio || 1, cap)
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.ctx.imageSmoothingEnabled = false
  }

  private fpsMeter = new FpsMeter()
  /** Момент последнего обновления HUD-статистики (троттлинг emitStats) */
  private lastStatsEmit = 0

  private emitStats(force: boolean): void {
    if (!this.cb.onStats) return
    /* Троттлинг: HUD не нужен 60 раз в секунду — 7 Гц хватает глаз,
       а сборка строкового ключа каждый кадр — лишний мусор для GC */
    const now = performance.now()
    if (!force && now - this.lastStatsEmit < 150) return
    this.lastStatsEmit = now
    const sec = Math.ceil(this.timeLeft)
    const fever = !!this.fever || this.feverAfter >= 0
    const feverGained = this.fever
      ? this.fever.gained
      : this.feverAfter >= 0
        ? this.lastFeverGained
        : 0
    const key = `${this.score}|${this.lvl}|${this.quota}|${this.collected}|${this.carried.length}|${sec}|${this.paused}|${this.streak}|${this.goldenCount}|${this.pigeonsRun}|${fever}|${feverGained}|${this.wave}|${this.shieldLeft}|${this.runGrains}|${this.runNipples}|${this.minesHit}|${this.shieldSaves}|${this.hearts}|${this.maxHearts}|${this.bigCaught}|${this.bigCaramelRun}|${this.bigCherryRun}|${this.bigGrapeRun}|${this.bossCoinsRun}|${this.goldCoinsRun}|${this.bossKillsRun}|${this.bossCleanLast ? 1 : 0}|${this.boss ? `${this.boss.hp}/${this.boss.maxHp}` : '-'}`
    if (!force && key === this.lastStatsKey) return
    this.lastStatsKey = key
    this.cb.onStats({
      score: Math.floor(this.score),
      timeLeft: this.timeLeft,
      duration: this.duration,
      level: this.lvl,
      quota: this.quota,
      collected: this.collected,
      carrying: this.carried.length,
      carryMax: this.carryMax,
      paused: this.paused,
      streak: this.streak,
      comboMult: this.comboMult,
      goldenCount: this.goldenCount,
      pigeonShooed: this.pigeonsRun,
      fever,
      feverGained,
      wave: this.wave,
      shields: this.shieldLeft,
      runGrains: this.runGrains,
      runNipples: this.runNipples,
      minesHit: this.minesHit,
      shieldSaves: this.shieldSaves,
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      mineOn: this.pieces.some((p) => p.kind === 'corn'),
      goldenOn: this.pieces.some((p) => p.kind === 'golden'),
      bigCaught: this.bigCaught,
      bigCoins: this.bigCoinsRun,
      bigCaramel: this.bigCaramelRun,
      bigCherry: this.bigCherryRun,
      bigGrape: this.bigGrapeRun,
      bossKills: this.bossKillsRun,
      bossClean: this.bossCleanLast,
      boss: !!this.boss,
      bossHp: this.boss?.hp ?? 0,
      bossMaxHp: this.boss?.maxHp ?? 0,
      bossCoins: this.bossCoinsRun,
      goldCoins: this.goldCoinsRun,
    })
  }

  /* ================= отрисовка ================= */

  /** Тайловый паттерн для перка «Попкорнопад»: пререндерим плитку со
      россыпью зёрен один раз (256×256) и закрашиваем ей весь экран */
  private bgPattern: CanvasPattern | null = null
  private ensureBgPattern(): CanvasPattern | null {
    if (this.bgPattern) return this.bgPattern
    const T = 128
    const tile = document.createElement('canvas')
    tile.width = T
    tile.height = T
    const c = tile.getContext('2d')
    if (!c) return null
    c.imageSmoothingEnabled = true /* спрайты теперь hi-res: плитка со сглаживанием */
    const kinds = [this.sp.popcorn, this.sp.caramel, this.sp.popcorn, this.sp.butter, this.sp.popcorn, this.sp.golden]
    let i = 0
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const spr = kinds[(x * 3 + y * 5 + i) % kinds.length] ?? this.sp.popcorn
        i++
        const scale = 1.9 + ((x + y) % 3) * 0.45
        const w = spr.w * scale
        c.globalAlpha = 0.55 + ((x + y * 2) % 4) * 0.1
        c.drawImage(spr.canvas, x * 32 + (y % 2) * 16 - w / 2, y * 32 + (x % 2) * 16 - w / 2, w, w)
      }
    }
    this.bgPattern = this.ctx.createPattern(tile, 'repeat')
    return this.bgPattern
  }

  private render(ts: number): void {
    const { ctx } = this
    ctx.clearRect(0, 0, this.W, this.H)
    if (this.phase === 'idle') return

    /* Фоновые перки: полностью перекрываем комнату (чёрная тьма, белое пекло
        или весь пол в попкорне). Заливка — в самом канвасе: не создаёт
        лишних DOM-слоёв и честно переворачивается вместе с миром */
    const bg = bgPerkFor(this.perk)
    if (bg === 'nightshift') {
      ctx.fillStyle = '#0A0502'
      ctx.fillRect(0, 0, this.W, this.H)
    } else if (bg === 'whiteout') {
      ctx.fillStyle = '#F5F1E4'
      ctx.fillRect(0, 0, this.W, this.H)
    } else if (bg === 'popcornfall') {
      const pat = this.ensureBgPattern()
      if (pat) {
        ctx.fillStyle = pat
        ctx.fillRect(0, 0, this.W, this.H)
      }
    }

    /* Виньетка контраста: лёгкое затемнение игровой зоны поверх фоновой
       картинки — светлые зёрна, лапка и курсор читаются на любой комнате,
       включая старые Android с блеклой передачей (жалоба на уровень 10).
       С фоновыми перками не нужна — они сами красят всё поле */
    if (!bg && this.phase === 'playing' && !this.paused) {
      ctx.fillStyle = 'rgba(30, 15, 5, 0.16)'
      ctx.fillRect(0, 0, this.W, this.H)
    }

    /* Пылинки в «луче света»: медленно всплывают сквозь кадр и делают
       статичную комнату живой. Рисуем до мира — они позади зёрен */
    if (this.motes.length > 0) {
      ctx.fillStyle = '#FFF3D0'
      for (const m of this.motes) {
        ctx.globalAlpha = m.a * (0.7 + 0.3 * Math.sin(m.ph + m.y * 0.02))
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    ctx.save()
    /* Тряска экрана при минах/голубе (настройка «Тряска экрана») */
    if (this.opts.shake && this.shakeT > 0 && this.shakeAmp > 0) {
      const a = this.shakeAmp * (this.shakeT / 0.3)
      ctx.translate((Math.random() - 0.5) * 2 * a, (Math.random() - 0.5) * 2 * a)
    }

    this.drawCup(ts)
    this.drawPieces(ts)
    if (this.pigeon && this.phase === 'playing') this.drawPigeon(ts)
    if (this.boss && this.phase === 'playing') this.drawBoss()
    this.drawFlying()
    this.drawParticles()
    /* Ударные волны поверх частиц: кольца взрывов и победы */
    if (this.rings.length > 0) {
      for (const r of this.rings) {
        const q = r.t / r.ttl
        ctx.globalAlpha = (1 - q) * 0.75
        ctx.strokeStyle = `rgb(${r.color})`
        ctx.lineWidth = Math.max(2, (3.5 - q * 2.5) * this.u)
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * q, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    this.drawPaw(ts)
    /* Лихорадка: тёплая золотая дымка на фоне */
    if (this.fever) this.drawFeverFx()
    /* Туман рисуем ДО надписей: баннер «ВОЛНА N» и всплывающие тексты
       читаются сквозь попкорновый туман (раньше туман их накрывал) */
    if (this.perk === 'fog' && this.phase === 'playing') this.drawFog()
    this.drawTexts()
    this.drawBanner()

    if (this.phase === 'ended' || this.phase === 'clear') {
      ctx.fillStyle = 'rgba(24, 10, 4, 0.35)'
      ctx.fillRect(0, 0, this.W, this.H)
    }
    ctx.restore()

    /* Красная вспышка по краям при потере сердца — вне shake-трансформа,
       чтобы весь экран ровно «заливало» без рывков */
    if (this.hurtT > 0) {
      const k = this.hurtT / 0.55
      const g = ctx.createRadialGradient(
        this.W / 2,
        this.H / 2,
        Math.min(this.W, this.H) * 0.28,
        this.W / 2,
        this.H / 2,
        Math.max(this.W, this.H) * 0.72,
      )
      g.addColorStop(0, 'rgba(229, 52, 46, 0)')
      g.addColorStop(1, `rgba(229, 52, 46, ${(0.42 * k).toFixed(3)})`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, this.W, this.H)
    }
  }

  /** Голубь-воришка: пиксельный, с двумя кадрами взмаха, полоской жизни
      над головой и белой вспышкой при ударе лапкой */
  private drawPigeon(ts: number): void {
    const g = this.pigeon
    if (!g) return
    const { ctx } = this
    const u = this.u
    // Взмах крыльев: в полёте часто, в парении — лениво
    const flapMs = g.state === 'hover' ? 260 : 90
    const frame = Math.floor(ts / flapMs) % 2 === 0
    // Тень под голубем — пока он в деле (поверженный уже улетает)
    if (!g.downed) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.beginPath()
      ctx.ellipse(g.x, this.cup.y + 22 * u, 24 * u, 6 * u, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    // Клюв смотрит в сторону движения/стаканчика (спрайт смотрит влево)
    let faceLeft = true
    if (g.state === 'hover') faceLeft = g.x > this.cup.x - 10 * u
    else if (g.state === 'flee') faceLeft = -g.side < 0
    else faceLeft = (Math.sign(g.hx - g.x) || -g.side) < 0
    const dive = g.state === 'hover' ? Math.max(0, Math.sin(g.stateT * 6)) * 5 * u : 0
    // Поверженный улетает кувырком, крутясь через крыло
    const rot = g.downed
      ? ts * 0.028 * -g.side
      : g.state === 'flee'
        ? -0.3
        : Math.sin(ts * 0.003) * 0.06
    drawSprite(ctx, frame ? this.sp.pigeon0 : this.sp.pigeon1, g.x, g.y + dive, 3.1 * u, {
      rot,
      sx: faceLeft ? 1 : -1,
    })

    // Вспышка попадания: белое кольцо вокруг взъерошенного воришки
    if (g.flash > 0) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, g.flash) * 0.8
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = Math.max(2, 2.5 * u)
      ctx.beginPath()
      ctx.arc(g.x, g.y + dive, 36 * u, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // ПОЛОСКА ЖИЗНИ: насечки = сколько ударов ещё выдержит. Прячется,
    // когда воришка уже улетает (повержен или испугался)
    if (g.state !== 'flee') {
      const bw = 46 * u
      const bh = 7 * u
      const bx = g.x - bw / 2
      const by = g.y - 42 * u + dive
      ctx.fillStyle = 'rgba(24, 10, 4, 0.9)'
      ctx.fillRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u)
      ctx.fillStyle = '#3A2410'
      ctx.fillRect(bx, by, bw, bh)
      const frac = Math.max(0, g.hp / g.maxHp)
      ctx.fillStyle = frac > 0.5 ? '#7ED957' : frac > 0.25 ? '#FFC93C' : '#E5342E'
      ctx.fillRect(bx, by, bw * frac, bh)
      ctx.fillStyle = 'rgba(24, 10, 4, 0.55)'
      for (let i = 1; i < g.maxHp; i++) {
        ctx.fillRect(bx + (bw * i) / g.maxHp - u, by, Math.max(1.5, 2 * u), bh)
      }
      if (g.flash > 0) {
        ctx.save()
        ctx.globalAlpha = Math.min(1, g.flash)
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = Math.max(1.5, 1.5 * u)
        ctx.strokeRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u)
        ctx.restore()
      }
    }
  }

  /** БОСС «МАЛЫШ»: упитанный ребёнок крупнее воришки-голубя. Зелёный
      комбинезончик с карманчиком, хохолок, сердитые брови и надутый ротик.
      Бродит, рвётся к корзине и гребёт из неё. Полоска жизней над головой */
  private drawBoss(): void {
    const b = this.boss
    if (!b) return
    const { ctx } = this
    const u = this.u
    const wob = Math.sin(b.wobble)
    const bob = wob * 3 * u
    const tilt = wob * 0.07
    const R = 44 * u // базовый радиус тела малыша

    // тень на полу — малыш уже в деле
    if (b.state !== 'in') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
      ctx.beginPath()
      ctx.ellipse(b.x, this.cup.y + 22 * u, 30 * u, 7 * u, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.save()
    ctx.translate(b.x, b.y + bob)
    ctx.rotate(tilt)

    // ножки-коротышки: шаркают вразнобой
    const legSwing = Math.sin(b.wobble) * 5 * u
    ctx.fillStyle = '#E8B48C'
    ctx.beginPath()
    ctx.ellipse(-16 * u + legSwing, R * 0.82, 7 * u, 9 * u, 0, 0, Math.PI * 2)
    ctx.ellipse(16 * u - legSwing, R * 0.82, 7 * u, 9 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    // тело: круглый комбинезончик с карманчиком
    ctx.fillStyle = '#7BC47F'
    ctx.beginPath()
    ctx.ellipse(0, R * 0.18, R * 0.74, R * 0.66, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#5FA65F'
    ctx.beginPath()
    ctx.ellipse(0, R * 0.32, R * 0.34, R * 0.26, 0, 0, Math.PI * 2)
    ctx.fill()

    // ручки: в гребле машут, в рывке выставлены вперёд-вниз
    const armA = b.swing > 0 ? Math.sin(b.stateT * 18) * 0.6 : wob * 0.2
    ctx.strokeStyle = '#E8B48C'
    ctx.lineWidth = 9 * u
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-R * 0.58, -R * 0.08)
    ctx.lineTo(-R * 0.9, R * 0.2 + Math.sin(armA) * 12 * u)
    ctx.moveTo(R * 0.58, -R * 0.08)
    ctx.lineTo(R * 0.9, R * 0.2 - Math.sin(armA) * 12 * u)
    ctx.stroke()

    // голова: крупная, почти в размер тела
    ctx.fillStyle = '#F7C9A3'
    ctx.beginPath()
    ctx.arc(0, -R * 0.62, R * 0.58, 0, Math.PI * 2)
    ctx.fill()
    // хохолок-завиток
    ctx.strokeStyle = '#B4653C'
    ctx.lineWidth = 5 * u
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(0, -R * 1.04, 9 * u, Math.PI * 0.15, Math.PI * 1.05)
    ctx.stroke()

    // сердитые брови и глаза
    ctx.strokeStyle = '#6B421F'
    ctx.lineWidth = 4.5 * u
    ctx.beginPath()
    ctx.moveTo(-R * 0.36, -R * 0.8)
    ctx.lineTo(-R * 0.12, -R * 0.7)
    ctx.moveTo(R * 0.36, -R * 0.8)
    ctx.lineTo(R * 0.12, -R * 0.7)
    ctx.stroke()
    ctx.fillStyle = '#2B1A0E'
    ctx.beginPath()
    ctx.arc(-R * 0.22, -R * 0.58, 4.5 * u, 0, Math.PI * 2)
    ctx.arc(R * 0.22, -R * 0.58, 4.5 * u, 0, Math.PI * 2)
    ctx.fill()
    // надутый ротик и румянец
    ctx.strokeStyle = '#B4653C'
    ctx.lineWidth = 3.5 * u
    ctx.beginPath()
    ctx.arc(0, -R * 0.32, 7 * u, Math.PI * 0.15, Math.PI * 0.85)
    ctx.stroke()
    ctx.fillStyle = 'rgba(232, 108, 108, 0.55)'
    ctx.beginPath()
    ctx.arc(-R * 0.44, -R * 0.44, 6 * u, 0, Math.PI * 2)
    ctx.arc(R * 0.44, -R * 0.44, 6 * u, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // вспышка при попадании/касании: белое кольцо вокруг малыша
    if (b.flash > 0) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, b.flash) * 0.8
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = Math.max(2, 3 * u)
      ctx.beginPath()
      ctx.arc(b.x, b.y + bob, R * 1.18, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // ПОЛОСКА ЖИЗНЕЙ над головой: насечки — сколько ещё пинков выдержит
    if (b.state !== 'flee') {
      const bw = 64 * u
      const bh = 8 * u
      const bx = b.x - bw / 2
      const by = b.y - R * 1.38 + bob
      ctx.fillStyle = 'rgba(24, 10, 4, 0.9)'
      ctx.fillRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u)
      ctx.fillStyle = '#3A2410'
      ctx.fillRect(bx, by, bw, bh)
      const frac = Math.max(0, b.hp / b.maxHp)
      ctx.fillStyle = frac > 0.5 ? '#FF8FA3' : frac > 0.25 ? '#FFC93C' : '#E5342E'
      ctx.fillRect(bx, by, bw * frac, bh)
      ctx.fillStyle = 'rgba(24, 10, 4, 0.55)'
      for (let i = 1; i < b.maxHp; i++) {
        ctx.fillRect(bx + (bw * i) / b.maxHp - u, by, Math.max(1.5, 2 * u), bh)
      }
      if (b.flash > 0) {
        ctx.save()
        ctx.globalAlpha = Math.min(1, b.flash)
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = Math.max(1.5, 1.5 * u)
        ctx.strokeRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u)
        ctx.restore()
      }
    }
  }

  /** «Попкорнный туман»: ступенчатые кольца темноты вокруг лапки (8-битный стиль) */
  private drawFog(): void {
    const { ctx } = this
    const u = this.u
    const rings: Array<[number, number]> = [
      [150, 0.86],
      [120, 0.8],
      [95, 0.66],
      [72, 0.45],
      [52, 0.22],
    ]
    for (const [r, a] of rings) {
      ctx.fillStyle = `rgba(12, 6, 2, ${a})`
      ctx.beginPath()
      ctx.rect(0, 0, this.W, this.H)
      ctx.arc(this.paw.x, this.paw.y, r * u, 0, Math.PI * 2)
      ctx.fill('evenodd')
    }
  }

  /** Деревянный столик + детальный стаканчик с анимацией наполнения.
      Корзина больше не «висит в воздухе»: стоит на столешнице. */
  private drawCup(ts: number): void {
    const { ctx } = this
    const u = this.u
    const s = this.cupScale
    const sq = this.cup.squash
    // «Дыхание» стаканчика: лёгкое покачивание в такт музыке (кроме подскока при сдаче)
    const breathe = 1 + Math.sin(ts * 0.0023) * 0.012
    const sx = 1 + 0.08 * sq
    const sy = breathe - 0.1 * sq

    /* --- столик: ножки и столешница --- */
    const tableY = this.tableY
    ctx.fillStyle = '#8a5330' // ножки
    ctx.fillRect(this.cup.x - 56 * u, tableY + 6 * u, 9 * u, 24 * u)
    ctx.fillRect(this.cup.x + 47 * u, tableY + 6 * u, 9 * u, 24 * u)
    ctx.fillStyle = '#B07A3F' // столешница
    ctx.fillRect(this.cup.x - 66 * u, tableY - 4 * u, 132 * u, 10 * u)
    ctx.fillStyle = '#6B421F' // тёмная кромка столешницы
    ctx.fillRect(this.cup.x - 66 * u, tableY + 4 * u, 132 * u, 3 * u)

    /* --- тень стаканчика на столешнице --- */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)'
    ctx.beginPath()
    ctx.ellipse(this.cup.x, tableY + 2 * u, 46 * u * sx, 5 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    /* --- корпус стаканчика (детальный спрайт 48×54) --- */
    drawSprite(ctx, this.sp.cup, this.cup.x, this.cup.y, s, { sx, sy })

    /* --- наполнение ВНУТРИ стаканчика: растёт вместе с выполнением нормы --- */
    const progress = this.quota > 0 ? this.collected / this.quota : 0
    const fill = Math.min(CUP_FILL_POS.length, Math.ceil(progress * CUP_FILL_POS.length))
    if (fill > 0) {
      ctx.save()
      // Внутренняя трапеция стаканчика — зёрна не выходят за бумажные стенки
      const topY = this.cup.y - 22.4 * s * sy
      const botY = this.cup.y + 22.4 * s * sy
      const halfTop = 20.8 * s * sx
      const halfBot = 12.8 * s * sx
      ctx.beginPath()
      ctx.moveTo(this.cup.x - halfTop, topY)
      ctx.lineTo(this.cup.x + halfTop, topY)
      ctx.lineTo(this.cup.x + halfBot, botY)
      ctx.lineTo(this.cup.x - halfBot, botY)
      ctx.closePath()
      ctx.clip()
      for (let i = 0; i < fill; i++) {
        const [ox, oy] = CUP_FILL_POS[i]
        // Каждое новое зёрнышко «пружинит» при появлении (easeOutBack)
        const age = this.fillPop[i] ?? 1
        const pop = easeOutBack(Math.min(1, age / 0.3))
        drawSprite(
          ctx,
          this.sp.popcorn,
          this.cup.x + ox * s * sx,
          this.cup.y + oy * s * sy,
          s * 0.88 * (0.55 + 0.45 * pop),
          { rot: i * 0.9 + (1 - pop) * 1.1, alpha: Math.min(1, age * 3 + 0.25) * 0.88 },
        )
      }
      // Лёгкая притенённость — зёрна читаются «за стенкой», а не на поле
      ctx.globalAlpha = 0.18
      ctx.fillStyle = '#8a2f1d'
      ctx.fillRect(this.cup.x - halfTop, topY, halfTop * 2, botY - topY)
      ctx.restore()
    }

    /* --- искра над стаканчиком после сданного золотого зерна --- */
    if (this.cupGlow > 0.01) {
      drawSprite(ctx, this.sp.sparkle, this.cup.x + 14 * u, this.cup.y - this.cupH * 0.62, 1.6 * u, {
        rot: ts * 0.006,
        alpha: Math.min(1, this.cupGlow) * 0.95,
      })
    }
  }

  private drawPieces(ts: number): void {
    const { ctx } = this
    const u = this.u
    for (const p of this.pieces) {
      // Мины-зерна статичны (никаких прыжков) — попкорн слегка «дышит»
      const bobAmp = p.kind === 'corn' ? 0 : 2.5
      const bob = Math.sin(ts * 0.004 + p.phase) * bobAmp * u
      const y = p.y + bob
      const pop = p.spawn > 0 ? easeOutBack(1 - p.spawn / (SPAWN_DUR + 0.5)) : 1
      // Попкорн мельчает, мины толстеют — ступени каждые 5 уровней.
      // Ценные зёрна мельче: белое +1 крупное, золотое +5 — крохотное
      const base =
        p.kind === 'corn'
          ? 2.3 * this.cornScale
          : 2.6 * this.popScale * KIND_SCALE[p.kind]
      const scale = base * u * Math.max(0.05, pop)

      // Тень (плотнее — зерно заметно на любом фоне, даже на тёмном чердаке).
      // На низком тире авто-качества тени выключаются — экономим fillPath
      if (this.perfTier < 2) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.24)'
        ctx.beginPath()
        ctx.ellipse(p.x, p.y + 8 * u, 11 * u * pop, 5 * u * pop, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // Кольцо опасности: пульсирует вокруг каждой мины — «заряжено!» видно
      // краем глаза, ещё до того, как рассмотрел шипы. На нижнем тире — статичный
      // спрайт мины и так красноречив, а stroke-дуги на слабых GPU дороги
      if (p.kind === 'corn' && this.perfTier < 2) {
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.006 + p.phase * 3)
        ctx.save()
        ctx.globalAlpha = 0.2 + 0.18 * pulse
        ctx.strokeStyle = this.opts.colorblind ? '#7FB2FF' : '#FF5A4E'
        ctx.lineWidth = Math.max(1.5, 2 * u)
        ctx.beginPath()
        ctx.arc(p.x, y, (15 + 4 * pulse) * u * this.cornScale, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      const sprite = p.kind === 'corn'
        ? (this.opts.colorblind ? this.sp.minesCB : this.sp.mines)[this.opts.mineVariant] ??
          this.sp.mines[0]
        : p.kind === 'golden'
          ? this.sp.golden
          : p.kind === 'caramel'
            ? this.sp.caramel
            : p.kind === 'butter'
              ? this.sp.butter
              : p.kind === 'nipple'
                ? this.sp.nipple
                : this.sp.popcorn
      drawSprite(ctx, sprite, p.x, y, scale, { rot: p.rot })
      // Золотое зерно светится: готовый радиальный спрайт поверх зерна
      // с globalCompositeOperation='lighter' — свечение почти бесплатно,
      // потому что градиент пререндерен один раз в спрайт
      if (p.kind === 'golden' && this.perfTier < 1) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.4 + 0.2 * Math.sin(ts * 0.005 + p.phase * 2)
        const glowScale = (scale * this.sp.golden.w * 3.2) / this.sp.goldenGlow.w
        drawSprite(ctx, this.sp.goldenGlow, p.x, y, glowScale)
        ctx.restore()
      }
      // Режим дальтоников: пульсирующая белая метка над миной
      if (p.kind === 'corn' && this.opts.colorblind) {
        const blink = 0.6 + 0.4 * Math.sin(ts * 0.008 + p.phase)
        ctx.save()
        ctx.globalAlpha = blink
        ctx.font = `700 ${Math.round(15 * u)}px system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        this.applyUpright(ctx, p.x, y - 16 * u)
        ctx.lineWidth = 3 * u
        ctx.strokeStyle = 'rgba(18, 39, 92, 0.95)'
        ctx.strokeText('!', p.x, y - 16 * u)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('!', p.x, y - 16 * u)
        ctx.restore()
      }
      if (p.kind === 'golden') {
        drawSprite(ctx, this.sp.sparkle, p.x + 10 * u, y - 11 * u, 1.15 * u, {
          rot: ts * 0.004,
          alpha: 0.95,
        })
      }
      // Масляное зерно — скромный блеск, чтобы отличалось на бегу
      if (p.kind === 'butter') {
        drawSprite(ctx, this.sp.sparkle, p.x - 9 * u, y - 10 * u, 0.8 * u, {
          rot: -ts * 0.003,
          alpha: 0.5 + 0.3 * Math.sin(ts * 0.005 + p.phase),
        })
      }
    }

    /* БОЛЬШАЯ ПОПКОРНИНА поверх зёрен: крупное облако с золотым свечением
       и кольцом-таймером — пока оно не замкнулось, приз можно поймать */
    if (this.big) this.drawBig(ts)
  }

  /** Отрисовка большой попкорнины: облако, свечение, таймер-кольцо */
  private drawBig(ts: number): void {
    const { ctx } = this
    const u = this.u
    const b = this.big
    if (!b) return
    const pop = easeOutBack(Math.min(1, b.t / 0.35))
    const bob = Math.sin(ts * 0.005 + b.phase) * 3 * u
    const y = b.y + bob
    const scale = 2.3 * u * Math.max(0.05, pop)
    /* Тень под облаком */
    if (this.perfTier < 2) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.24)'
      ctx.beginPath()
      ctx.ellipse(b.x, b.y + 14 * u, 20 * u * pop, 8 * u * pop, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    /* Золотое свечение — как у золотого зерна, но жирнее */
    if (this.perfTier < 1) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = 0.5 + 0.22 * Math.sin(ts * 0.006 + b.phase * 2)
      const glowScale = (scale * this.sp.big[this.bigKind].w * 2.4) / this.sp.goldenGlow.w
      drawSprite(ctx, this.sp.goldenGlow, b.x, y, glowScale)
      ctx.restore()
    }
    drawSprite(ctx, this.sp.big[this.bigKind], b.x, y, scale, {
      rot: Math.sin(ts * 0.003 + b.phase) * 0.12,
    })
    if (this.perfTier < 1) {
      drawSprite(ctx, this.sp.sparkle, b.x + 16 * u, y - 15 * u, 1.4 * u, {
        rot: ts * 0.005,
        alpha: 0.95,
      })
    }
    /* Кольцо-таймер: остаток времени до побега. Меньше секунды — красное */
    const left = Math.max(0, 1 - b.t / this.bigLife)
    const urgent = left < 0.4
    const R = 15 * scale + 10 * u
    ctx.save()
    ctx.globalAlpha = 0.85
    ctx.strokeStyle = urgent ? '#FF5A4E' : BIG_VARIANTS[this.bigKind].text
    ctx.lineWidth = Math.max(2, 3.2 * u)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(b.x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left)
    ctx.stroke()
    ctx.restore()
  }

  private drawFlying(): void {
    const { ctx } = this
    const u = this.u
    const tx = this.cup.x
    const ty = this.cup.y - 26 * this.cupScale // горлышко стаканчика
    for (const f of this.flying) {
      const q = easeOutQuad(f.t)
      const x = f.x0 + (tx - f.x0) * q
      const y = f.y0 + (ty - f.y0) * q - Math.sin(q * Math.PI) * 30 * u
      drawSprite(
        ctx,
        f.kind === 'golden'
          ? this.sp.golden
          : f.kind === 'caramel'
            ? this.sp.caramel
            : f.kind === 'butter'
              ? this.sp.butter
              : f.kind === 'nipple'
                ? this.sp.nipple
                : this.sp.popcorn,
        x,
        y,
        2.6 * u * this.popScale * (KIND_SCALE[f.kind] ?? 1) * (1 - 0.45 * q),
        {
          rot: q * 3,
        },
      )
    }
  }

  private drawPaw(ts: number): void {
    const { ctx } = this
    const u = this.u
    if (!this.paw.seen && this.phase === 'idle') return

    // Тряска при штрафе + сильная дрожь перка «Нервная лапа»
    const shake = Math.sin(ts * 0.055) * 5 * this.paw.hurt
    const shiver = this.perk === 'shaky'
    const jx = shiver ? Math.sin(ts * 0.021) * 9 * u + Math.sin(ts * 0.047) * 6 * u : 0
    const jy = shiver ? Math.cos(ts * 0.017) * 7 * u + Math.sin(ts * 0.053) * 4 * u : 0
    // Шок от мины: мелкая дрожь «опешившей» лапки, пока не отпустило
    const shockJx = this.stun > 0 ? Math.sin(ts * 0.049) * 3.2 * u : 0
    const shockJy = this.stun > 0 ? Math.cos(ts * 0.037) * 2.4 * u : 0
    const px = this.paw.x + shake + jx + shockJx
    const py = this.paw.y + jy + shockJy

    /* След быстрого движения: призрачные отпечатки лапки гаснут позади —
       движение читается даже на мелком экране, и просто приятно глазу */
    if (this.trail.length > 0 && this.perfTier < 2) {
      const ghostS = (this.perk === 'bigpaw' ? 3.6 : this.perk === 'smallpaw' ? 2.17 : 2.85) * u
      for (const d of this.trail) {
        const k = 1 - d.t / 0.26
        drawSprite(ctx, this.sp.paw, d.x, d.y, ghostS * (0.72 + 0.12 * k), {
          alpha: 0.16 * k,
        })
      }
    }

    // Светлое пятно под лапкой: курсор виден на ЛЮБОМ фоне — тёмный чердак,
    // ночной двор, старые Android-браузеры (была жалоба: «курсора не видно»)
    ctx.fillStyle = 'rgba(255, 247, 220, 0.16)'
    ctx.beginPath()
    ctx.ellipse(px, py - 2 * u, 46 * u, 34 * u, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 247, 220, 0.22)'
    ctx.beginPath()
    ctx.ellipse(px, py - 2 * u, 30 * u, 22 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    /* Кольцо зоны подбора: тонкий пунктир, по которому видно «очертания»
       ловли на любом фоне и любом экране (старые Android, тёмные комнаты) */
    if (this.phase === 'playing' && !this.paused) {
      const gr = this.grabR
      ctx.save()
      ctx.globalAlpha = 0.16 + 0.05 * Math.sin(ts * 0.004)
      ctx.strokeStyle = '#FFF3D0'
      ctx.lineWidth = Math.max(1.5, 1.6 * u)
      ctx.setLineDash([7 * u, 6 * u])
      ctx.beginPath()
      ctx.ellipse(px, py + 4 * u, gr * 1.12, gr * 0.82, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // Тень лапки
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.beginPath()
    ctx.ellipse(px, py + 28 * u, 26 * u, 7 * u, 0, 0, Math.PI * 2)
    ctx.fill()

    const basePaw = this.perk === 'bigpaw' ? 3.6 : this.perk === 'smallpaw' ? 2.17 : 2.85
    const s = basePaw * u * (1 + 0.13 * this.paw.pulse)
    drawSprite(ctx, this.sp.paw, px, py, s)

    // Зёрна в лапке (стопкой над подушечкой)
    this.carried.forEach((c, i) => {
      const wig = Math.sin(ts * 0.012 + i * 2) * 1.6 * u
      const y = py - 30 * u - i * 14 * u * this.popScale + (1 - c.grabT) * 10 * u
      const spr =
        c.kind === 'golden'
          ? this.sp.golden
          : c.kind === 'caramel'
            ? this.sp.caramel
            : c.kind === 'butter'
              ? this.sp.butter
              : c.kind === 'nipple'
                ? this.sp.nipple
                : this.sp.popcorn
      drawSprite(ctx, spr, px + wig, y, 2.3 * u * this.popScale * (KIND_SCALE[c.kind] ?? 1), {
        rot: Math.sin(ts * 0.006 + i) * 0.12,
      })
    })

    /* Шок от мины: три звёздочки кружатся над лапкой — «голова кругом» */
    if (this.stun > 0) {
      const fade = Math.min(1, this.stun * 2.5)
      for (let i = 0; i < 3; i++) {
        const a = ts * 0.0075 + (i * Math.PI * 2) / 3
        drawSprite(
          ctx,
          this.sp.sparkle,
          px + Math.cos(a) * 24 * u,
          py - 38 * u + Math.sin(a) * 8 * u,
          1.25 * u,
          { rot: ts * 0.012, alpha: fade },
        )
      }
    }
  }

  private drawParticles(): void {
    const { ctx } = this
    /* Активные частицы — префикс пула [0..length): рисуем без аллокаций */
    const items = this.particles.items
    for (let i = 0, n = this.particles.length; i < n; i++) {
      const p = items[i]
      ctx.globalAlpha = 1 - p.t / p.ttl
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1
  }

  private drawTexts(): void {
    const { ctx } = this
    for (const t of this.texts) {
      const q = t.t / t.dur
      const alpha = q < 0.15 ? q / 0.15 : 1 - Math.max(0, (q - 0.55) / 0.45)
      const y = t.y - 42 * this.u * q
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.font = `600 ${t.size}px "Handjet", system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      /* Даже в зеркальном мире и на боку всплывающие тексты читаются прямо */
      this.applyUpright(ctx, t.x, y)
      ctx.lineWidth = Math.max(3, t.size * 0.16)
      ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)'
      ctx.strokeText(t.text, t.x, y)
      ctx.fillStyle = t.color
      ctx.fillText(t.text, t.x, y)
      ctx.restore()
    }
  }

  /** «Лихорадка»: тёплая золотая дымка + постоянная крупная надпись
      «ЛИХОРАДКА» с заработанным счётом — игрок всегда понимает, что идёт
      бонусный уровень, даже когда баннер давно погас */
  private drawFeverFx(): void {
    const { ctx } = this
    ctx.fillStyle = 'rgba(255, 196, 60, 0.10)'
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.fillStyle = 'rgba(255, 150, 40, 0.08)'
    ctx.fillRect(0, 0, this.W, 52)
    ctx.fillRect(0, this.H - 52, this.W, 52)

    const f = this.fever
    if (!f) return
    const u = this.u
    const pulse = 1 + Math.sin(performance.now() * 0.009) * 0.06
    const size = 26 * u * pulse
    const y = 74 * u
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.font = `700 ${size}px "Handjet", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    /* Надпись читается прямо даже в зеркальном мире и на боку */
    this.applyUpright(ctx, this.W / 2, y)
    ctx.lineWidth = Math.max(4, size * 0.18)
    ctx.strokeStyle = 'rgba(46, 18, 6, 0.95)'
    ctx.strokeText(this.L('banner.fever'), this.W / 2, y)
    ctx.fillStyle = '#FFC93C'
    ctx.fillText(this.L('banner.fever'), this.W / 2, y)
    /* Заработанные в лихорадке очки — видно в реальном времени */
    const gSize = 19 * u
    ctx.font = `700 ${gSize}px "Handjet", system-ui, sans-serif`
    ctx.globalAlpha = 0.85
    const gained = `+${f.gained}`
    ctx.lineWidth = Math.max(3, gSize * 0.16)
    ctx.strokeText(gained, this.W / 2, y + gSize * 1.15)
    ctx.fillStyle = '#FFE9B0'
    ctx.fillText(gained, this.W / 2, y + gSize * 1.15)
    ctx.restore()
  }

  /** Компенсация трансформаций экрана (зеркало/повороты): локально обращаем
      трансформацию вокруг точки надписи — буквы всегда читаются прямо */
  private applyUpright(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (this.perk === 'mirror') {
      ctx.translate(x, y)
      ctx.scale(-1, 1)
      ctx.translate(-x, -y)
    } else if (this.perk === 'rot180') {
      ctx.translate(x, y)
      ctx.rotate(Math.PI)
      ctx.translate(-x, -y)
    } else if (this.perk === 'rot90') {
      ctx.translate(x, y)
      ctx.rotate(-Math.PI / 2)
      ctx.translate(-x, -y)
    }
  }

  private drawBanner(): void {
    if (this.banner.t > 1.5) return
    const { ctx } = this
    const t = this.banner.t
    const alpha = t < 0.2 ? t / 0.2 : t > 1.1 ? Math.max(0, (1.5 - t) / 0.4) : 1
    const pop = 1 + Math.max(0, 1 - t / 0.25) * 0.5
    const size = 34 * this.u * pop
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `700 ${size}px "Handjet", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    /* Даже в зеркальном мире и на боку надписи баннера читаются прямо */
    this.applyUpright(ctx, this.W / 2, this.H * 0.3)
    ctx.lineWidth = Math.max(4, size * 0.18)
    ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)'
    ctx.strokeText(this.banner.text, this.W / 2, this.H * 0.3)
    ctx.fillStyle = '#FFE066'
    ctx.fillText(this.banner.text, this.W / 2, this.H * 0.3)
    ctx.restore()
  }
}
