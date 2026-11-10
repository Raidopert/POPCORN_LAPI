/**
 * Достижения «Кошачьего попкорнного Беспредела» — 50 медалей.
 * Разблокировки хранятся локально в браузере (localStorage),
 * в меню открывается «АЧИВКИ» со всеми медалями.
 *
 * Проверки условий размазаны по местам событий:
 *  - по ходу забега (onStats): комбо, золотые, волны, щиты, мины…
 *  - конец уровня/лихорадки/забега: чистые уровни, очки, марафон;
 *  - меню: магазин, древо, уровень котика, монеты;
 *  - пожизненные счётчики — через lifestats.ts (getLife/addLife).
 */

export type AchId =
  | 'score100'
  | 'combo10'
  | 'golden1'
  | 'pigeon1'
  | 'level5'
  | 'level10'
  | 'rich1k'
  | 'shopper'
  | 'collector'
  | 'upgrade1'
  | 'grains100'
  | 'grains300'
  | 'grainsLife5k'
  | 'grainsLife25k'
  | 'golden10'
  | 'golden100'
  | 'combo20'
  | 'wave5'
  | 'wave10'
  | 'level20'
  | 'perfect'
  | 'fever1'
  | 'fever10'
  | 'fever500'
  | 'pigeon5'
  | 'pigeon25'
  | 'mine1'
  | 'shieldUse'
  | 'shield3'
  | 'coins10k'
  | 'coins50k'
  | 'xp100k'
  | 'tree5'
  | 'tree15'
  | 'catlvl10'
  | 'catlvl20'
  | 'runs10'
  | 'score10k'
  | 'score50k'
  | 'nightowl'
  | 'marathon'
  | 'nipple50'
  | 'bgBlack'
  | 'bgWhite'
  | 'bgPopcorn'
  | 'pigeonfeast'
  | 'rainbowrun'
  | 'neonrun'
  | 'curse5'
  | 'bonus10'

export interface AchDef {
  id: AchId
  name: string
  desc: string
  icon: string
}

export const ACHIEVEMENTS: AchDef[] = [
  /* ---------- классика (первые 10) ---------- */
  { id: 'score100', name: 'Первая тысяча', desc: 'Набрать 1000 очков за один забег', icon: '💯' },
  { id: 'combo10', name: 'Комбо-мастер', desc: 'Серия из 10 сдач подряд без мины', icon: '🔥' },
  { id: 'golden1', name: 'Золотая лапка', desc: 'Поймать золотое зерно (+50 очков)', icon: '✨' },
  { id: 'pigeon1', name: 'Птицебой', desc: 'Повалить голубя-воришку ударами лапки', icon: '🐦' },
  { id: 'level5', name: 'Киношка', desc: 'Дойти до 5-го уровня', icon: '🎬' },
  { id: 'level10', name: 'Мастер попкорна', desc: 'Дойти до 10-го уровня', icon: '🏆' },
  { id: 'rich1k', name: 'Попкорн-богач', desc: 'Накопить 10000 опыта в банке', icon: '💰' },
  { id: 'shopper', name: 'Модная лапка', desc: 'Купить любую лапку в магазине', icon: '🐾' },
  { id: 'collector', name: 'Коллекционер', desc: 'Владеть пятью лапками сразу', icon: '🎨' },
  { id: 'upgrade1', name: 'Обустроился', desc: 'Купить постоянный апгрейд', icon: '🛠️' },
  /* ---------- зёрна ---------- */
  { id: 'grains100', name: 'Сотка', desc: 'Сдать 100 зёрен в стаканчик за один забег', icon: '🍿' },
  { id: 'grains300', name: 'Триста!', desc: 'Сдать 300 зёрен за один забег', icon: '🧺' },
  { id: 'grainsLife5k', name: 'Полполца', desc: '5000 зёрен за всё время', icon: '🌾' },
  { id: 'grainsLife25k', name: 'Попкорн-комбайн', desc: '25000 зёрен за всё время', icon: '🚜' },
  { id: 'golden10', name: 'Золотых дел мастер', desc: '10 золотых зёрен за один забег', icon: '🏅' },
  { id: 'golden100', name: 'Золотой фонд', desc: '100 золотых зёрен за всё время', icon: '👑' },
  /* ---------- комбо и волны ---------- */
  { id: 'combo20', name: 'Серия века', desc: 'Серия из 20 сдач подряд', icon: '⚡' },
  { id: 'wave5', name: 'Пятая волна', desc: 'Дожить до 5-й волны в одном уровне', icon: '🌊' },
  { id: 'wave10', name: 'Цунами', desc: 'Дожить до 10-й волны', icon: '🌀' },
  { id: 'level20', name: 'Двадцатка', desc: 'Дойти до 20-го уровня', icon: '🎯' },
  { id: 'perfect', name: 'Чистая работа', desc: 'Пройти уровень без мин и без краж голубя', icon: '🧼' },
  /* ---------- лихорадка ---------- */
  { id: 'fever1', name: 'Горячка', desc: 'Пережить первую ЛИХОРАДКУ', icon: '🥵' },
  { id: 'fever10', name: 'Жар-птица', desc: '10 ЛИХОРАДОК за всё время', icon: '🌡️' },
  { id: 'fever500', name: 'Пять сотен в огне', desc: 'Заработать 500 очков за одну ЛИХОРАДКУ', icon: '💥' },
  /* ---------- голуби ---------- */
  { id: 'pigeon5', name: 'Гроза голубей', desc: 'Повалить 5 голубей за один забег', icon: '🪶' },
  { id: 'pigeon25', name: 'Птичий король', desc: '25 голубей за всё время', icon: '🕊️' },
  /* ---------- мины и щиты ---------- */
  { id: 'mine1', name: 'Бум!', desc: 'Поймать мину и пережить шок лапки', icon: '💣' },
  { id: 'shieldUse', name: 'Прикрыт', desc: 'Щит спас лапку от мины', icon: '🛡️' },
  { id: 'shield3', name: 'Тройная броня', desc: 'Иметь 3 щита от мин за один забег', icon: '🛡️' },
  /* ---------- богатство ---------- */
  { id: 'coins10k', name: 'Кошелёк', desc: 'Накопить 10000 монет 🪙', icon: '👛' },
  { id: 'coins50k', name: 'Золотая гора', desc: 'Накопить 50000 монет 🪙', icon: '⛰️' },
  { id: 'xp100k', name: 'Банк попкорна', desc: 'Накопить 100000 опыта в банке', icon: '🏦' },
  { id: 'tree5', name: 'Садовник', desc: 'Открыть 5 узлов древа улучшений', icon: '🌱' },
  { id: 'tree15', name: 'Лесовод', desc: 'Прокачать 15 уровней древа улучшений', icon: '🌳' },
  { id: 'catlvl10', name: 'Кот-мудрец', desc: 'Вырастить котика до 10 уровня', icon: '🎖' },
  { id: 'catlvl20', name: 'Кот-легенда', desc: 'Вырастить котика до 20 уровня', icon: '🗿' },
  /* ---------- забеги ---------- */
  { id: 'runs10', name: 'Второе дыхание', desc: 'Начать 10-й забег', icon: '💨' },
  { id: 'score10k', name: 'Десять тысяч', desc: 'Набрать 10000 очков за один забег', icon: '🔟' },
  { id: 'score50k', name: 'Полтинник', desc: 'Набрать 50000 очков за один забег', icon: '💎' },
  { id: 'nightowl', name: 'Полуночник', desc: 'Играть ночью с 00:00 до 06:00', icon: '🦉' },
  { id: 'marathon', name: 'Марафон попкорна', desc: 'Провести в одном забеге 10 минут', icon: '⏳' },
  /* ---------- новые перки ---------- */
  { id: 'nipple50', name: 'Нянька', desc: 'Поймать 50 сосок 🍼 за всё время', icon: '🍼' },
  { id: 'bgBlack', name: 'Тьма', desc: 'Сыграть уровень с фоном «Ночная смена»', icon: '🌙' },
  { id: 'bgWhite', name: 'Засвет', desc: 'Сыграть уровень с фоном «Засвет»', icon: '🔆' },
  { id: 'bgPopcorn', name: 'Попкорн до горизонта', desc: 'Сыграть с фоном «Попкорнопад»', icon: '🍿' },
  { id: 'pigeonfeast', name: 'Птичий переполох', desc: 'Взять перк «Птичий базар»', icon: '🐦' },
  { id: 'rainbowrun', name: 'Радуга', desc: 'Сыграть с перком «Хамелеон»', icon: '🦎' },
  { id: 'neonrun', name: 'Неоновый кот', desc: 'Сыграть с перком «Неон»', icon: '💜' },
  { id: 'curse5', name: 'Гладиатор', desc: 'Взять 5 проклятий из сундучков за всё время', icon: '☠️' },
  { id: 'bonus10', name: 'Везунчик', desc: 'Взять 10 бонусов из сундучков за всё время', icon: '🍀' },
]

export const ACH_MAP: Record<AchId, AchDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchId, AchDef>

export const ACH_KEY = 'popcorn-ach'
export const ACH_EVENT = 'popcorn-ach-update'

/** Список уже открытых достижений (localStorage → массив id) */
export function readAch(): AchId[] {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem(ACH_KEY) ?? '[]')
    if (Array.isArray(v)) return v.filter((x): x is AchId => typeof x === 'string' && x in ACH_MAP)
  } catch {
    /* пусто */
  }
  return []
}

/**
 * Попытаться открыть достижения. Возвращает только НОВО открытыe id
 * (для тостов). Пустой вызов дёшев: всё уже открытое отфильтровывается.
 */
export function unlockMany(ids: AchId[]): AchId[] {
  if (ids.length === 0) return []
  const have = new Set<AchId>(readAch())
  const fresh = ids.filter((id, i) => !have.has(id) && ids.indexOf(id) === i)
  if (fresh.length === 0) return []
  const next = [...readAch(), ...fresh]
  window.localStorage.setItem(ACH_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(ACH_EVENT))
  return fresh
}
