/**
 * Достижения «POPCORN PAWS» — 100 медалей.
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
  | 'rich10k'
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
  | 'heart1'
  | 'heartsFree5'
  | 'heartsLast'
  | 'pigeon50'
  | 'sevenhearts'
  | 'score100k'
  | 'score200k'
  | 'combo30'
  | 'combo50'
  | 'golden25'
  | 'goldenLife250'
  | 'grains500'
  | 'grainsLife50k'
  | 'grainsLife100k'
  | 'pigeon10'
  | 'pigeon100'
  | 'fever25'
  | 'fever50'
  | 'fever1000'
  | 'wave15'
  | 'wave20'
  | 'level30'
  | 'level40'
  | 'level50'
  | 'runs25'
  | 'runs50'
  | 'runs100'
  | 'coins100k'
  | 'coins250k'
  | 'bank50k'
  | 'catlvl30'
  | 'catlvl50'
  | 'tree30'
  | 'tree60'
  | 'treeFull'
  | 'paws10'
  | 'pawsAll'
  | 'upg5'
  | 'upg10'
  | 'upgAll'
  | 'secs3600'
  | 'secs18000'
  | 'visits10'
  | 'visits50'
  | 'curse25'
  | 'bonus25'
  | 'nipple200'
  | 'perfect10'
  | 'scoreLife100k'
  | 'scoreLife1m'
  | 'big1'
  | 'bigAll'
  | 'bigGrape5'
  | 'boss1'
  | 'boss3run'
  | 'bossNoHit'
  | 'boss5life'
  | 'lion1'
  | 'marten1'
  | 'menagerie'
  | 'xpRun250'
  | 'xpRun750'
  | 'slice1k'
  | 'slice2k5'
  | 'sliceCherry'
  | 'sliceGrape'
  | 'sliceAll3'

export interface AchDef {
  id: AchId
  name: string
  desc: string
  icon: string
}

export const ACHIEVEMENTS: AchDef[] = [
  /* ---------- классика (первые 10) ---------- */
  { id: 'score100', name: 'Первая сотня', desc: 'Набрать 100 очков за один забег', icon: '💯' },
  { id: 'combo10', name: 'Комбо-мастер', desc: 'Серия из 10 сдач подряд без мины', icon: '🔥' },
  { id: 'golden1', name: 'Золотая лапка', desc: 'Поймать золотое зерно (+50 очков)', icon: '✨' },
  { id: 'pigeon1', name: 'Птицебой', desc: 'Повалить голубя-воришку ударами лапки', icon: '🐦' },
  { id: 'level5', name: 'Киношка', desc: 'Дойти до 5-го уровня', icon: '🎬' },
  { id: 'level10', name: 'Мастер попкорна', desc: 'Дойти до 10-го уровня', icon: '🏆' },
  { id: 'rich10k', name: 'Попкорн-богач', desc: 'Накопить 10000 опыта в банке', icon: '💰' },
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
  /* ---------- сердечки (механика 5 жизней) ---------- */
  { id: 'heart1', name: 'Первый шрам', desc: 'Потерять первое сердечко ❤️ и продолжить бой', icon: '💔' },
  { id: 'heartsFree5', name: 'Целая и невредимая', desc: 'Пройти 5 уровней подряд без потери сердец', icon: '🛡️' },
  { id: 'heartsLast', name: 'На честном слове', desc: 'Пройти уровень, оставшись с одним сердечком', icon: '❤️‍🩹' },
  { id: 'pigeon50', name: 'Орнитолог', desc: 'Повалить 50 голубей за всё время', icon: '🪶' },
  { id: 'sevenhearts', name: 'Семь жизней', desc: 'Собрать максимум из 7 сердечек (апгрейд + древо + лапка)', icon: '😻' },
  /* ---------- сотка: очки забега ---------- */
  { id: 'score100k', name: 'Сто тысяч', desc: 'Набрать 100000 очков за один забег', icon: '💫' },
  { id: 'score200k', name: 'Двести тысяч', desc: 'Набрать 200000 очков за один забег', icon: '🌠' },
  /* ---------- комбо ---------- */
  { id: 'combo30', name: 'Тридцать подряд', desc: 'Серия из 30 сдач подряд', icon: '⚡' },
  { id: 'combo50', name: 'Полсотни без промаха', desc: 'Серия из 50 сдач подряд', icon: '🌪' },
  /* ---------- золото ---------- */
  { id: 'golden25', name: 'Золотой дождь', desc: '25 золотых зёрен за один забег', icon: '🌟' },
  { id: 'goldenLife250', name: 'Золотоискатель', desc: '250 золотых зёрен за всё время', icon: '🥇' },
  /* ---------- зёрна ---------- */
  { id: 'grains500', name: 'Полтысячи', desc: 'Сдать 500 зёрен в стаканчик за один забег', icon: '🥡' },
  { id: 'grainsLife50k', name: 'Цистерна', desc: '50000 зёрен за всё время', icon: '🛢' },
  { id: 'grainsLife100k', name: 'Элеватор', desc: '100000 зёрен за всё время', icon: '🏗' },
  /* ---------- голуби ---------- */
  { id: 'pigeon10', name: 'Перьевой шторм', desc: '10 голубей за один забег', icon: '🪽' },
  { id: 'pigeon100', name: 'Голубиный апокалипсис', desc: '100 голубей за всё время', icon: '🦅' },
  /* ---------- лихорадка ---------- */
  { id: 'fever25', name: 'Жаровня', desc: '25 ЛИХОРАДОК за всё время', icon: '🍳' },
  { id: 'fever50', name: 'Вечный огонь', desc: '50 ЛИХОРАДОК за всё время', icon: '🔥' },
  { id: 'fever1000', name: 'Тысяча в огне', desc: '1000 очков за одну ЛИХОРАДКУ', icon: '🚒' },
  /* ---------- волны ---------- */
  { id: 'wave15', name: 'Пятнадцатая волна', desc: 'Дожить до 15-й волны', icon: '🏄' },
  { id: 'wave20', name: 'Двадцатая волна', desc: 'Дожить до 20-й волны', icon: '🌊' },
  /* ---------- уровни ---------- */
  { id: 'level30', name: 'Тридцатка', desc: 'Дойти до 30-го уровня', icon: '🎢' },
  { id: 'level40', name: 'Сороковка', desc: 'Дойти до 40-го уровня', icon: '🎡' },
  { id: 'level50', name: 'Кинофестиваль', desc: 'Дойти до 50-го уровня', icon: '🎥' },
  /* ---------- забеги ---------- */
  { id: 'runs25', name: 'Сезонный абонемент', desc: 'Начать 25 забегов', icon: '🎟' },
  { id: 'runs50', name: 'Ветеран попкорна', desc: 'Начать 50 забегов', icon: '🧓' },
  { id: 'runs100', name: 'Сотня забегов', desc: 'Начать 100 забегов', icon: '🎪' },
  /* ---------- богатство ---------- */
  { id: 'coins100k', name: 'Сейф', desc: 'Накопить 100000 монет 🪙', icon: '🔐' },
  { id: 'coins250k', name: 'Сокровищница', desc: 'Накопить 250000 монет 🪙', icon: '🏰' },
  { id: 'bank50k', name: 'Хранилище', desc: 'Накопить 50000 опыта 🍿 в банке', icon: '🗄' },
  /* ---------- котик и древо ---------- */
  { id: 'catlvl30', name: 'Кот-сенсей', desc: 'Вырастить котика до 30 уровня', icon: '🥋' },
  { id: 'catlvl50', name: 'Кот-космонавт', desc: 'Вырастить котика до 50 уровня', icon: '🚀' },
  { id: 'tree30', name: 'Роща', desc: 'Прокачать 30 уровней древа улучшений', icon: '🌿' },
  { id: 'tree60', name: 'Дубрава', desc: 'Прокачать 60 уровней древа улучшений', icon: '🍀' },
  { id: 'treeFull', name: 'Древо жизни', desc: 'Полностью прокачать древо улучшений', icon: '🌲' },
  /* ---------- коллекции ---------- */
  { id: 'paws10', name: 'Гардероб', desc: 'Владеть 10 лапками одновременно', icon: '🧤' },
  { id: 'pawsAll', name: 'Все лапки мира', desc: 'Собрать все лапки из магазина', icon: '🧶' },
  { id: 'upg5', name: 'Мастер на все лапки', desc: 'Купить 5 постоянных апгрейдов', icon: '🔧' },
  { id: 'upg10', name: 'Инженер', desc: 'Купить 10 постоянных апгрейдов', icon: '⚙️' },
  { id: 'upgAll', name: 'Апгрейд-барон', desc: 'Выкупить все апгрейды магазина до максимума', icon: '⚒️' },
  /* ---------- время и визиты ---------- */
  { id: 'secs3600', name: 'Час в попкорне', desc: 'Наиграть 1 час чистого времени за всё время', icon: '⏰' },
  { id: 'secs18000', name: 'Попкорн-марафонец', desc: 'Наиграть 5 часов чистого времени', icon: '🕐' },
  { id: 'visits10', name: 'Постоянный зритель', desc: 'Заглянуть в игру 10 раз', icon: '🎫' },
  { id: 'visits50', name: 'Свой в доску', desc: 'Заглянуть в игру 50 раз', icon: '🏠' },
  /* ---------- сундучки ---------- */
  { id: 'curse25', name: 'Проклятый кот', desc: 'Взять 25 проклятий из сундучков за всё время', icon: '😼' },
  { id: 'bonus25', name: 'Кладоискатель', desc: 'Взять 25 бонусов из сундучков за всё время', icon: '🗝' },
  { id: 'nipple200', name: 'Молочная ферма', desc: '200 сосок 🍼 за всё время', icon: '🥛' },
  /* ---------- чистота и стаж ---------- */
  { id: 'perfect10', name: 'Без сучка', desc: '10 уровней без мин и краж за всё время', icon: '🧹' },
  { id: 'scoreLife100k', name: 'Счётчик очков', desc: 'Заработать 100000 очков за всё время', icon: '🧮' },
  { id: 'scoreLife1m', name: 'Миллион попкорна', desc: 'Заработать 1000000 очков за всё время', icon: '🌌' },
  /* ---------- босс «МАЛЫШ» и большие попкорнины (0.0.31) ---------- */
  { id: 'big1', name: 'Жирный улов', desc: 'Поймать большую попкорнину на поле за один забег', icon: '🎯' },
  { id: 'bigAll', name: 'Дегустатор', desc: 'Поймать все три сорта больших попкорнин за один забег', icon: '🧺' },
  { id: 'bigGrape5', name: 'Виноградный магнат', desc: 'Поймать 5 виноградных попкорнин за всё время', icon: '🍇' },
  { id: 'boss1', name: 'Малыш повержен', desc: 'Победить босса МАЛЫША в арканоид-бою', icon: '👶' },
  { id: 'boss3run', name: 'Три нянки', desc: 'Победить трёх малышей за один забег', icon: '🥊' },
  { id: 'bossNoHit', name: 'Неприкасаемый', desc: 'Победить малыша, не потеряв на его уровне ни одного сердечка', icon: '⭐' },
  { id: 'boss5life', name: 'Плюшевый громила', desc: 'Победить 5 малышей за всё время', icon: '🧸' },
  /* ---------- новые боссы и опыт котика (0.0.33) ---------- */
  { id: 'lion1', name: 'Царь попкорна', desc: 'Победить ЛЬВА: его грива-щит отбивает зёрна, бей после рёва!', icon: '🦁' },
  { id: 'marten1', name: 'Лана поймана', desc: 'Поймать воровку КУНИЦУ ЛАНУ — она швыряется зёрнами, уворачивайся!', icon: '🦡' },
  { id: 'menagerie', name: 'Фильм про зверей', desc: 'Победить всех трёх боссов: МАЛЫША, ЛЬВА и КУНИЦУ ЛАНУ', icon: '🎪' },
  { id: 'xpRun250', name: 'Опытный студент', desc: 'Заработать 250 опыта 🍿 за один забег', icon: '🎓' },
  { id: 'xpRun750', name: 'Профессор попкорна', desc: 'Заработать 750 опыта 🍿 за один забег', icon: '📚' },
  { id: 'slice1k', name: 'Мастер нарезки', desc: 'Набрать 1000 очков за одну нарезку', icon: '🔪' },
  { id: 'slice2k5', name: 'Гроссмейстер ножа', desc: 'Набрать 2500 очков за одну нарезку', icon: '⚔️' },
  { id: 'sliceCherry', name: 'Вишнёвый разгром', desc: 'Нарезать ВИШНЁВУЮ попкорнину на 2500 очков', icon: '🍒' },
  { id: 'sliceGrape', name: 'Виноградный титан', desc: 'Нарезать ВИНОГРАДНУЮ попкорнину на 4500 очков', icon: '🟣' },
  { id: 'sliceAll3', name: 'Полное меню', desc: 'За всё время нарезать все три сорта попкорнин', icon: '🎆' },
]

export const ACH_MAP: Record<AchId, AchDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchId, AchDef>

export const ACH_KEY = 'popcorn-ach'
export const ACH_EVENT = 'popcorn-ach-update'

/** Список уже открытых достижений (localStorage → массив id).
    Миграция: старый id «rich1k» (условие было 10000) переименовывается в rich10k */
export function readAch(): AchId[] {
  try {
    /* v0.0.26: «Банк попкорна» (100000) раньше ошибочно открывался при 10000 —
       отзываем у старых сохранений, у кого банка меньше 100000 (один раз) */
    if (window.localStorage.getItem('popcorn-ach-mig') !== '1') {
      const bank = Number(window.localStorage.getItem('popcorn-xp') ?? 0) || 0
      const raw: unknown = JSON.parse(window.localStorage.getItem(ACH_KEY) ?? '[]')
      if (Array.isArray(raw) && bank < 100000) {
        const cleaned = raw.filter((x) => x !== 'xp100k')
        if (cleaned.length !== raw.length) {
          window.localStorage.setItem(ACH_KEY, JSON.stringify(cleaned))
          window.dispatchEvent(new Event(ACH_EVENT))
        }
      }
      window.localStorage.setItem('popcorn-ach-mig', '1')
    }
    const v: unknown = JSON.parse(window.localStorage.getItem(ACH_KEY) ?? '[]')
    if (Array.isArray(v)) {
      const list = v
        .filter((x): x is string => typeof x === 'string')
        .map((x) => (x === 'rich1k' ? 'rich10k' : x))
      return list.filter((x): x is AchId => x in ACH_MAP)
    }
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
