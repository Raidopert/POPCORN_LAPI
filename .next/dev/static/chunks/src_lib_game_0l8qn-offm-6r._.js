(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/game/achievements.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Достижения «POPCORN PAWS» — 106 медалей.
 * Разблокировки хранятся локально в браузере (localStorage),
 * в меню открывается «АЧИВКИ» со всеми медалями.
 *
 * Проверки условий размазаны по местам событий:
 *  - по ходу забега (onStats): комбо, золотые, волны, щиты, мины, подарки…
 *  - конец уровня/лихорадки/забега: чистые уровни, очки, марафон;
 *  - меню: магазин, древо, уровень котика, монеты;
 *  - пожизненные счётчики — через lifestats.ts (getLife/addLife).
 *
 * v0.0.41: медаль «Тьма» (Ночная смена) удалена вместе с перком; добавлены
 * медали подарочных коробок и «Парящей лапки».
 */ __turbopack_context__.s([
    "ACHIEVEMENTS",
    ()=>ACHIEVEMENTS,
    "ACH_EVENT",
    ()=>ACH_EVENT,
    "ACH_KEY",
    ()=>ACH_KEY,
    "ACH_MAP",
    ()=>ACH_MAP,
    "readAch",
    ()=>readAch,
    "unlockMany",
    ()=>unlockMany
]);
const ACHIEVEMENTS = [
    /* ---------- классика (первые 10) ---------- */ {
        id: 'score100',
        name: 'Первая сотня',
        desc: 'Набрать 100 очков за один забег',
        icon: '💯'
    },
    {
        id: 'combo10',
        name: 'Комбо-мастер',
        desc: 'Серия из 10 сдач подряд без мины',
        icon: '🔥'
    },
    {
        id: 'golden1',
        name: 'Золотая лапка',
        desc: 'Поймать золотое зерно (+50 очков)',
        icon: '✨'
    },
    {
        id: 'pigeon1',
        name: 'Птицебой',
        desc: 'Повалить голубя-воришку ударами лапки',
        icon: '🐦'
    },
    {
        id: 'level5',
        name: 'Киношка',
        desc: 'Дойти до 5-го уровня',
        icon: '🎬'
    },
    {
        id: 'level10',
        name: 'Мастер попкорна',
        desc: 'Дойти до 10-го уровня',
        icon: '🏆'
    },
    {
        id: 'rich10k',
        name: 'Попкорн-богач',
        desc: 'Накопить 10000 опыта в банке',
        icon: '💰'
    },
    {
        id: 'shopper',
        name: 'Модная лапка',
        desc: 'Купить любую лапку в магазине',
        icon: '🐾'
    },
    {
        id: 'collector',
        name: 'Коллекционер',
        desc: 'Владеть пятью лапками сразу',
        icon: '🎨'
    },
    {
        id: 'upgrade1',
        name: 'Обустроился',
        desc: 'Купить постоянный апгрейд',
        icon: '🛠️'
    },
    /* ---------- зёрна ---------- */ {
        id: 'grains100',
        name: 'Сотка',
        desc: 'Сдать 100 зёрен в стаканчик за один забег',
        icon: '🍿'
    },
    {
        id: 'grains300',
        name: 'Триста!',
        desc: 'Сдать 300 зёрен за один забег',
        icon: '🧺'
    },
    {
        id: 'grainsLife5k',
        name: 'Полполца',
        desc: '5000 зёрен за всё время',
        icon: '🌾'
    },
    {
        id: 'grainsLife25k',
        name: 'Попкорн-комбайн',
        desc: '25000 зёрен за всё время',
        icon: '🚜'
    },
    {
        id: 'golden10',
        name: 'Золотых дел мастер',
        desc: '10 золотых зёрен за один забег',
        icon: '🏅'
    },
    {
        id: 'golden100',
        name: 'Золотой фонд',
        desc: '100 золотых зёрен за всё время',
        icon: '👑'
    },
    /* ---------- комбо и волны ---------- */ {
        id: 'combo20',
        name: 'Серия века',
        desc: 'Серия из 20 сдач подряд',
        icon: '⚡'
    },
    {
        id: 'wave5',
        name: 'Пятая волна',
        desc: 'Дожить до 5-й волны в одном уровне',
        icon: '🌊'
    },
    {
        id: 'wave10',
        name: 'Цунами',
        desc: 'Дожить до 10-й волны',
        icon: '🌀'
    },
    {
        id: 'level20',
        name: 'Двадцатка',
        desc: 'Дойти до 20-го уровня',
        icon: '🎯'
    },
    {
        id: 'perfect',
        name: 'Чистая работа',
        desc: 'Пройти уровень без мин и без краж голубя',
        icon: '🧼'
    },
    /* ---------- лихорадка ---------- */ {
        id: 'fever1',
        name: 'Горячка',
        desc: 'Пережить первую ЛИХОРАДКУ',
        icon: '🥵'
    },
    {
        id: 'fever10',
        name: 'Жар-птица',
        desc: '10 ЛИХОРАДОК за всё время',
        icon: '🌡️'
    },
    {
        id: 'fever500',
        name: 'Пять сотен в огне',
        desc: 'Заработать 500 очков за одну ЛИХОРАДКУ',
        icon: '💥'
    },
    /* ---------- голуби ---------- */ {
        id: 'pigeon5',
        name: 'Гроза голубей',
        desc: 'Повалить 5 голубей за один забег',
        icon: '🪶'
    },
    {
        id: 'pigeon25',
        name: 'Птичий король',
        desc: '25 голубей за всё время',
        icon: '🕊️'
    },
    /* ---------- мины и щиты ---------- */ {
        id: 'mine1',
        name: 'Бум!',
        desc: 'Поймать мину и пережить шок лапки',
        icon: '💣'
    },
    {
        id: 'shieldUse',
        name: 'Прикрыт',
        desc: 'Щит спас лапку от мины',
        icon: '🛡️'
    },
    {
        id: 'shield3',
        name: 'Тройная броня',
        desc: 'Иметь 3 щита от мин за один забег',
        icon: '🛡️'
    },
    /* ---------- богатство ---------- */ {
        id: 'coins10k',
        name: 'Кошелёк',
        desc: 'Накопить 10000 монет 🪙',
        icon: '👛'
    },
    {
        id: 'coins50k',
        name: 'Золотая гора',
        desc: 'Накопить 50000 монет 🪙',
        icon: '⛰️'
    },
    {
        id: 'xp100k',
        name: 'Банк попкорна',
        desc: 'Накопить 100000 опыта в банке',
        icon: '🏦'
    },
    {
        id: 'tree5',
        name: 'Садовник',
        desc: 'Открыть 5 узлов древа улучшений',
        icon: '🌱'
    },
    {
        id: 'tree15',
        name: 'Лесовод',
        desc: 'Прокачать 15 уровней древа улучшений',
        icon: '🌳'
    },
    {
        id: 'catlvl10',
        name: 'Кот-мудрец',
        desc: 'Вырастить котика до 10 уровня',
        icon: '🎖'
    },
    {
        id: 'catlvl20',
        name: 'Кот-легенда',
        desc: 'Вырастить котика до 20 уровня',
        icon: '🗿'
    },
    /* ---------- забеги ---------- */ {
        id: 'runs10',
        name: 'Второе дыхание',
        desc: 'Начать 10-й забег',
        icon: '💨'
    },
    {
        id: 'score10k',
        name: 'Десять тысяч',
        desc: 'Набрать 10000 очков за один забег',
        icon: '🔟'
    },
    {
        id: 'score50k',
        name: 'Полтинник',
        desc: 'Набрать 50000 очков за один забег',
        icon: '💎'
    },
    {
        id: 'nightowl',
        name: 'Полуночник',
        desc: 'Играть ночью с 00:00 до 06:00',
        icon: '🦉'
    },
    {
        id: 'marathon',
        name: 'Марафон попкорна',
        desc: 'Провести в одном забеге 10 минут',
        icon: '⏳'
    },
    /* ---------- новые перки ---------- */ {
        id: 'nipple50',
        name: 'Нянька',
        desc: 'Поймать 50 сосок 🍼 за всё время',
        icon: '🍼'
    },
    {
        id: 'gift1',
        name: 'Первый подарок',
        desc: 'Поймать подарочную коробку 🎁 на поле',
        icon: '🎁'
    },
    {
        id: 'giftfreeze',
        name: 'Ледяная пауза',
        desc: 'Поймать коробку с ФРИЗОМ таймера',
        icon: '❄️'
    },
    {
        id: 'giftsweep',
        name: 'Чистый пол',
        desc: 'Поймать коробку-зачистку: все мины взорвались безвредно',
        icon: '🧨'
    },
    {
        id: 'gift10x',
        name: 'Десятикратный',
        desc: 'Поймать коробку с очками ×10!',
        icon: '🔟'
    },
    {
        id: 'gift10',
        name: 'Праздничный кот',
        desc: 'Поймать 10 подарочных коробок за всё время',
        icon: '🎊'
    },
    {
        id: 'hover1',
        name: 'Лёгкое крыло',
        desc: 'Взять перк «Парящая лапка» и проплыть над минами',
        icon: '🎈'
    },
    {
        id: 'bgWhite',
        name: 'Засвет',
        desc: 'Сыграть уровень с фоном «Засвет»',
        icon: '🔆'
    },
    {
        id: 'bgPopcorn',
        name: 'Попкорн до горизонта',
        desc: 'Сыграть с фоном «Попкорнопад»',
        icon: '🍿'
    },
    {
        id: 'pigeonfeast',
        name: 'Птичий переполох',
        desc: 'Взять перк «Птичий базар»',
        icon: '🐦'
    },
    {
        id: 'rainbowrun',
        name: 'Радуга',
        desc: 'Сыграть с перком «Хамелеон»',
        icon: '🦎'
    },
    {
        id: 'neonrun',
        name: 'Неоновый кот',
        desc: 'Сыграть с перком «Неон»',
        icon: '💜'
    },
    {
        id: 'curse5',
        name: 'Гладиатор',
        desc: 'Взять 5 проклятий из сундучков за всё время',
        icon: '☠️'
    },
    {
        id: 'bonus10',
        name: 'Везунчик',
        desc: 'Взять 10 бонусов из сундучков за всё время',
        icon: '🍀'
    },
    /* ---------- сердечки (механика 5 жизней) ---------- */ {
        id: 'heart1',
        name: 'Первый шрам',
        desc: 'Потерять первое сердечко ❤️ и продолжить бой',
        icon: '💔'
    },
    {
        id: 'heartsFree5',
        name: 'Целая и невредимая',
        desc: 'Пройти 5 уровней подряд без потери сердец',
        icon: '🛡️'
    },
    {
        id: 'heartsLast',
        name: 'На честном слове',
        desc: 'Пройти уровень, оставшись с одним сердечком',
        icon: '❤️‍🩹'
    },
    {
        id: 'pigeon50',
        name: 'Орнитолог',
        desc: 'Повалить 50 голубей за всё время',
        icon: '🪶'
    },
    {
        id: 'sevenhearts',
        name: 'Семь жизней',
        desc: 'Собрать максимум из 7 сердечек (апгрейд + древо + лапка)',
        icon: '😻'
    },
    /* ---------- сотка: очки забега ---------- */ {
        id: 'score100k',
        name: 'Сто тысяч',
        desc: 'Набрать 100000 очков за один забег',
        icon: '💫'
    },
    {
        id: 'score200k',
        name: 'Двести тысяч',
        desc: 'Набрать 200000 очков за один забег',
        icon: '🌠'
    },
    /* ---------- комбо ---------- */ {
        id: 'combo30',
        name: 'Тридцать подряд',
        desc: 'Серия из 30 сдач подряд',
        icon: '⚡'
    },
    {
        id: 'combo50',
        name: 'Полсотни без промаха',
        desc: 'Серия из 50 сдач подряд',
        icon: '🌪'
    },
    /* ---------- золото ---------- */ {
        id: 'golden25',
        name: 'Золотой дождь',
        desc: '25 золотых зёрен за один забег',
        icon: '🌟'
    },
    {
        id: 'goldenLife250',
        name: 'Золотоискатель',
        desc: '250 золотых зёрен за всё время',
        icon: '🥇'
    },
    /* ---------- зёрна ---------- */ {
        id: 'grains500',
        name: 'Полтысячи',
        desc: 'Сдать 500 зёрен в стаканчик за один забег',
        icon: '🥡'
    },
    {
        id: 'grainsLife50k',
        name: 'Цистерна',
        desc: '50000 зёрен за всё время',
        icon: '🛢'
    },
    {
        id: 'grainsLife100k',
        name: 'Элеватор',
        desc: '100000 зёрен за всё время',
        icon: '🏗'
    },
    /* ---------- голуби ---------- */ {
        id: 'pigeon10',
        name: 'Перьевой шторм',
        desc: '10 голубей за один забег',
        icon: '🪽'
    },
    {
        id: 'pigeon100',
        name: 'Голубиный апокалипсис',
        desc: '100 голубей за всё время',
        icon: '🦅'
    },
    /* ---------- лихорадка ---------- */ {
        id: 'fever25',
        name: 'Жаровня',
        desc: '25 ЛИХОРАДОК за всё время',
        icon: '🍳'
    },
    {
        id: 'fever50',
        name: 'Вечный огонь',
        desc: '50 ЛИХОРАДОК за всё время',
        icon: '🔥'
    },
    {
        id: 'fever1000',
        name: 'Тысяча в огне',
        desc: '1000 очков за одну ЛИХОРАДКУ',
        icon: '🚒'
    },
    /* ---------- волны ---------- */ {
        id: 'wave15',
        name: 'Пятнадцатая волна',
        desc: 'Дожить до 15-й волны',
        icon: '🏄'
    },
    {
        id: 'wave20',
        name: 'Двадцатая волна',
        desc: 'Дожить до 20-й волны',
        icon: '🌊'
    },
    /* ---------- уровни ---------- */ {
        id: 'level30',
        name: 'Тридцатка',
        desc: 'Дойти до 30-го уровня',
        icon: '🎢'
    },
    {
        id: 'level40',
        name: 'Сороковка',
        desc: 'Дойти до 40-го уровня',
        icon: '🎡'
    },
    {
        id: 'level50',
        name: 'Кинофестиваль',
        desc: 'Дойти до 50-го уровня',
        icon: '🎥'
    },
    /* ---------- забеги ---------- */ {
        id: 'runs25',
        name: 'Сезонный абонемент',
        desc: 'Начать 25 забегов',
        icon: '🎟'
    },
    {
        id: 'runs50',
        name: 'Ветеран попкорна',
        desc: 'Начать 50 забегов',
        icon: '🧓'
    },
    {
        id: 'runs100',
        name: 'Сотня забегов',
        desc: 'Начать 100 забегов',
        icon: '🎪'
    },
    /* ---------- богатство ---------- */ {
        id: 'coins100k',
        name: 'Сейф',
        desc: 'Накопить 100000 монет 🪙',
        icon: '🔐'
    },
    {
        id: 'coins250k',
        name: 'Сокровищница',
        desc: 'Накопить 250000 монет 🪙',
        icon: '🏰'
    },
    {
        id: 'bank50k',
        name: 'Хранилище',
        desc: 'Накопить 50000 опыта 🍿 в банке',
        icon: '🗄'
    },
    /* ---------- котик и древо ---------- */ {
        id: 'catlvl30',
        name: 'Кот-сенсей',
        desc: 'Вырастить котика до 30 уровня',
        icon: '🥋'
    },
    {
        id: 'catlvl50',
        name: 'Кот-космонавт',
        desc: 'Вырастить котика до 50 уровня',
        icon: '🚀'
    },
    {
        id: 'tree30',
        name: 'Роща',
        desc: 'Прокачать 30 уровней древа улучшений',
        icon: '🌿'
    },
    {
        id: 'tree60',
        name: 'Дубрава',
        desc: 'Прокачать 60 уровней древа улучшений',
        icon: '🍀'
    },
    {
        id: 'treeFull',
        name: 'Древо жизни',
        desc: 'Полностью прокачать древо улучшений',
        icon: '🌲'
    },
    /* ---------- коллекции ---------- */ {
        id: 'paws10',
        name: 'Гардероб',
        desc: 'Владеть 10 лапками одновременно',
        icon: '🧤'
    },
    {
        id: 'pawsAll',
        name: 'Все лапки мира',
        desc: 'Собрать все лапки из магазина',
        icon: '🧶'
    },
    {
        id: 'upg5',
        name: 'Мастер на все лапки',
        desc: 'Купить 5 постоянных апгрейдов',
        icon: '🔧'
    },
    {
        id: 'upg10',
        name: 'Инженер',
        desc: 'Купить 10 постоянных апгрейдов',
        icon: '⚙️'
    },
    {
        id: 'upgAll',
        name: 'Апгрейд-барон',
        desc: 'Выкупить все апгрейды магазина до максимума',
        icon: '⚒️'
    },
    /* ---------- время и визиты ---------- */ {
        id: 'secs3600',
        name: 'Час в попкорне',
        desc: 'Наиграть 1 час чистого времени за всё время',
        icon: '⏰'
    },
    {
        id: 'secs18000',
        name: 'Попкорн-марафонец',
        desc: 'Наиграть 5 часов чистого времени',
        icon: '🕐'
    },
    {
        id: 'visits10',
        name: 'Постоянный зритель',
        desc: 'Заглянуть в игру 10 раз',
        icon: '🎫'
    },
    {
        id: 'visits50',
        name: 'Свой в доску',
        desc: 'Заглянуть в игру 50 раз',
        icon: '🏠'
    },
    /* ---------- сундучки ---------- */ {
        id: 'curse25',
        name: 'Проклятый кот',
        desc: 'Взять 25 проклятий из сундучков за всё время',
        icon: '😼'
    },
    {
        id: 'bonus25',
        name: 'Кладоискатель',
        desc: 'Взять 25 бонусов из сундучков за всё время',
        icon: '🗝'
    },
    {
        id: 'nipple200',
        name: 'Молочная ферма',
        desc: '200 сосок 🍼 за всё время',
        icon: '🥛'
    },
    /* ---------- чистота и стаж ---------- */ {
        id: 'perfect10',
        name: 'Без сучка',
        desc: '10 уровней без мин и краж за всё время',
        icon: '🧹'
    },
    {
        id: 'scoreLife100k',
        name: 'Счётчик очков',
        desc: 'Заработать 100000 очков за всё время',
        icon: '🧮'
    },
    {
        id: 'scoreLife1m',
        name: 'Миллион попкорна',
        desc: 'Заработать 1000000 очков за всё время',
        icon: '🌌'
    },
    /* ---------- босс «МАЛЫШ» и большие попкорнины (0.0.31) ---------- */ {
        id: 'big1',
        name: 'Жирный улов',
        desc: 'Поймать большую попкорнину на поле за один забег',
        icon: '🎯'
    },
    {
        id: 'bigAll',
        name: 'Дегустатор',
        desc: 'Поймать все три сорта больших попкорнин за один забег',
        icon: '🧺'
    },
    {
        id: 'bigGrape5',
        name: 'Виноградный магнат',
        desc: 'Поймать 5 виноградных попкорнин за всё время',
        icon: '🍇'
    },
    {
        id: 'boss1',
        name: 'Малыш повержен',
        desc: 'Победить босса МАЛЫША в арканоид-бою',
        icon: '👶'
    },
    {
        id: 'boss3run',
        name: 'Три нянки',
        desc: 'Победить трёх малышей за один забег',
        icon: '🥊'
    },
    {
        id: 'bossNoHit',
        name: 'Неприкасаемый',
        desc: 'Победить малыша, не потеряв на его уровне ни одного сердечка',
        icon: '⭐'
    },
    {
        id: 'boss5life',
        name: 'Плюшевый громила',
        desc: 'Победить 5 малышей за всё время',
        icon: '🧸'
    },
    /* ---------- новые боссы и опыт котика (0.0.33) ---------- */ {
        id: 'lion1',
        name: 'Царь попкорна',
        desc: 'Победить ОНЛИФАНСИЯ: его грива-щит отбивает зёрна, бей после рёва!',
        icon: '🦁'
    },
    {
        id: 'marten1',
        name: 'Лана поймана',
        desc: 'Поймать воровку КУНИЦУ ЛАНУ — перерезай её длинные лапки, не дай дотянуться до корзинки!',
        icon: '🦡'
    },
    {
        id: 'pigeonBoss1',
        name: 'Голубь повержен',
        desc: 'Победить МЕГА-ГОЛУБЯ: тело неуязвимо — выбей лапкой его глаза!',
        icon: '🐦'
    },
    {
        id: 'gypsyBoss1',
        name: 'Рука повержена',
        desc: 'Победить ЦЫГАНСКУЮ РУКУ: она крадёт зёрна с поля и кидает их в тебя — шлёпай её лапкой!',
        icon: '💍'
    },
    {
        id: 'menagerie',
        name: 'Фильм про зверей',
        desc: 'Победить МАЛЫША и КУНИЦУ ЛАНУ за один забег (Онлифансий подождёт!)',
        icon: '🎪'
    },
    {
        id: 'onlyWitness',
        name: 'Свидетель',
        desc: 'Онлифансий высунул гигантскую когтистую лапу на уровнях 7/13/18 — и ты не запаниковал',
        icon: '🦁'
    },
    {
        id: 'xpRun250',
        name: 'Опытный студент',
        desc: 'Заработать 250 опыта 🍿 за один забег',
        icon: '🎓'
    },
    {
        id: 'xpRun750',
        name: 'Профессор попкорна',
        desc: 'Заработать 750 опыта 🍿 за один забег',
        icon: '📚'
    },
    {
        id: 'slice1k',
        name: 'Мастер нарезки',
        desc: 'Набрать 1000 очков за одну нарезку',
        icon: '🔪'
    },
    {
        id: 'slice2k5',
        name: 'Гроссмейстер ножа',
        desc: 'Набрать 2500 очков за одну нарезку',
        icon: '⚔️'
    },
    {
        id: 'sliceCherry',
        name: 'Вишнёвый разгром',
        desc: 'Нарезать ВИШНЁВУЮ попкорнину на 2500 очков',
        icon: '🍒'
    },
    {
        id: 'sliceGrape',
        name: 'Виноградный титан',
        desc: 'Нарезать ВИНОГРАДНУЮ попкорнину на 4500 очков',
        icon: '🟣'
    },
    {
        id: 'sliceAll3',
        name: 'Полное меню',
        desc: 'За всё время нарезать все три сорта попкорнин',
        icon: '🎆'
    }
];
const ACH_MAP = Object.fromEntries(_c1 = ACHIEVEMENTS.map(_c = (a)=>[
        a.id,
        a
    ]));
_c2 = ACH_MAP;
const ACH_KEY = 'popcorn-ach';
const ACH_EVENT = 'popcorn-ach-update';
function readAch() {
    try {
        /* v0.0.26: «Банк попкорна» (100000) раньше ошибочно открывался при 10000 —
       отзываем у старых сохранений, у кого банка меньше 100000 (один раз) */ if (window.localStorage.getItem('popcorn-ach-mig') !== '1') {
            const bank = Number(window.localStorage.getItem('popcorn-xp') ?? 0) || 0;
            const raw = JSON.parse(window.localStorage.getItem(ACH_KEY) ?? '[]');
            if (Array.isArray(raw) && bank < 100000) {
                const cleaned = raw.filter((x)=>x !== 'xp100k');
                if (cleaned.length !== raw.length) {
                    window.localStorage.setItem(ACH_KEY, JSON.stringify(cleaned));
                    window.dispatchEvent(new Event(ACH_EVENT));
                }
            }
            window.localStorage.setItem('popcorn-ach-mig', '1');
        }
        const v = JSON.parse(window.localStorage.getItem(ACH_KEY) ?? '[]');
        if (Array.isArray(v)) {
            const list = v.filter((x)=>typeof x === 'string').map((x)=>x === 'rich1k' ? 'rich10k' : x);
            return list.filter((x)=>x in ACH_MAP);
        }
    } catch  {
    /* пусто */ }
    return [];
}
function unlockMany(ids) {
    if (ids.length === 0) return [];
    const have = new Set(readAch());
    const fresh = ids.filter((id, i)=>!have.has(id) && ids.indexOf(id) === i);
    if (fresh.length === 0) return [];
    const next = [
        ...readAch(),
        ...fresh
    ];
    window.localStorage.setItem(ACH_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(ACH_EVENT));
    return fresh;
}
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ACH_MAP$Object.fromEntries$ACHIEVEMENTS.map");
__turbopack_context__.k.register(_c1, "ACH_MAP$Object.fromEntries");
__turbopack_context__.k.register(_c2, "ACH_MAP");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/audio.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 8-битный аудио-движок (чиптюн) на Web Audio API.
 * Никаких внешних файлов: музыка и звуки синтезируются в реальном времени.
 */ __turbopack_context__.s([
    "audio",
    ()=>audio
]);
const NOTE_OFFSETS = {
    C: 0,
    'C#': 1,
    D: 2,
    'D#': 3,
    E: 4,
    F: 5,
    'F#': 6,
    G: 7,
    'G#': 8,
    A: 9,
    'A#': 10,
    B: 11
};
/** Частота ноты вида "C5", "F#3" (A4 = 440 Гц) */ function noteFreq(name) {
    const m = /^([A-G]#?)(\d)$/.exec(name);
    if (!m) return 440;
    const midi = NOTE_OFFSETS[m[1]] + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
}
/* Мелодия A (спокойная) — 32 шага по 1/8, 4 такта */ const LEAD_A = [
    'E5',
    null,
    'E5',
    'G5',
    'A5',
    null,
    'G5',
    null,
    'F5',
    null,
    'F5',
    'A5',
    'C6',
    null,
    'A5',
    null,
    'G5',
    null,
    'G5',
    'B5',
    'D6',
    null,
    'B5',
    'G5',
    'C6',
    null,
    'G5',
    'E5',
    'C5',
    null,
    null,
    null
];
/* Мелодия B (энергичная, без пауз) — для высоких волн */ const LEAD_B = [
    'E5',
    'G5',
    'A5',
    'G5',
    'E5',
    'G5',
    'A5',
    'B5',
    'F5',
    'A5',
    'C6',
    'A5',
    'F5',
    'A5',
    'C6',
    'D6',
    'G5',
    'B5',
    'D6',
    'B5',
    'G5',
    'B5',
    'D6',
    'B5',
    'C6',
    'D6',
    'E6',
    'D6',
    'C6',
    null,
    'G5',
    null
];
/* Бас (треугольная волна) — играем на четвертях */ const BASS = [
    'C3',
    null,
    'G2',
    null,
    'C3',
    null,
    'G2',
    null,
    'F2',
    null,
    'C3',
    null,
    'F2',
    null,
    'C3',
    null,
    'G2',
    null,
    'D3',
    null,
    'G2',
    null,
    'D3',
    null,
    'C3',
    null,
    'G2',
    null,
    'C3',
    null,
    'G2',
    null
];
/* Темп по уровням напряжённости (от оставшегося времени):
   0 — база 140 · 1 — +25% (175) · 2 — +40% (196) · 3 — финиш 240 BPM */ const TEMPOS = [
    140,
    175,
    196,
    240
];
/* ЗАГЛАВНАЯ ТЕМА МЕНЮ «Попкорн и кот» — тёплая, уютная, 112 BPM.
   Кружевная мелодия в до-мажоре: гуляет по трезвучиям, как кот по подоконнику,
   и завершается мягкой каденцией — тема узнаваема с первых секунд. */ const MENU_TEMPO = 112;
const MENU_LEAD = [
    'E5',
    null,
    'G5',
    null,
    'C6',
    null,
    'G5',
    null,
    'A5',
    null,
    'G5',
    'E5',
    null,
    'D5',
    'E5',
    null,
    'F5',
    null,
    'A5',
    null,
    'G5',
    null,
    'E5',
    null,
    'D5',
    null,
    'E5',
    'D5',
    'C5',
    null,
    null,
    null
];
const MENU_BASS = [
    'C3',
    null,
    'G2',
    null,
    'C3',
    null,
    'G2',
    null,
    'A2',
    null,
    'E2',
    null,
    'A2',
    null,
    'E2',
    null,
    'F2',
    null,
    'C3',
    null,
    'F2',
    null,
    'C3',
    null,
    'G2',
    null,
    'B2',
    null,
    'C3',
    null,
    'G2',
    null
];
class ChipTuneAudio {
    ctx = null;
    master = null;
    musicBus = null;
    sfxBus = null;
    noiseBuf = null;
    timer = null;
    step = 0;
    nextTime = 0;
    playingMusic = false;
    _muted = false;
    /** Громкость музыки и звуков (0..1) — из настроек, применяются к шинам */ _volMusic = 1;
    _volSfx = 1;
    level = 0;
    stage = 0;
    /** Какая тема играет: игровая (ускоряется) или заглавная меню */ mode = 'game';
    /** Сколько эффектов проиграно всего — живой индикатор для QA-проверки звука */ playCount = 0;
    /** Уровень напряжённости 0–3: темп и мелодия зависят от оставшегося времени */ setIntensity(level) {
        this.level = Math.max(0, Math.min(3, level));
    }
    /** Сложность забега: с 3-го уровня мелодия энергичнее */ setMusicLevel(stage) {
        this.stage = stage >= 1 ? 1 : 0;
    }
    /** Создаёт/возобновляет AudioContext. Вызывать по жесту пользователя. */ ensure() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return false;
            try {
                this.ctx = new AC();
            } catch  {
                return false;
            }
            this.master = this.ctx.createGain();
            this.master.gain.value = this._muted ? 0 : 0.5;
            this.master.connect(this.ctx.destination);
            this.musicBus = this.ctx.createGain();
            this.musicBus.gain.value = 0.55 * this._volMusic;
            this.musicBus.connect(this.master);
            this.sfxBus = this.ctx.createGain();
            this.sfxBus.gain.value = 0.9 * this._volSfx;
            this.sfxBus.connect(this.master);
            // Белый шум для перкуссии (буфер на 1 секунду)
            const len = this.ctx.sampleRate;
            this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            const data = this.noiseBuf.getChannelData(0);
            for(let i = 0; i < len; i++)data[i] = Math.random() * 2 - 1;
        }
        if (this.ctx.state === 'suspended') void this.ctx.resume();
        return true;
    }
    get muted() {
        return this._muted;
    }
    setMuted(m) {
        this._muted = m;
        if (this.ctx && this.master) {
            this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.02);
        }
    }
    /** Громкость музыки и звуков по отдельности (0..1). Живой плавный переход без щелчков. */ setVolumes(music, sfx) {
        this._volMusic = Math.max(0, Math.min(1, music));
        this._volSfx = Math.max(0, Math.min(1, sfx));
        if (this.ctx && this.musicBus && this.sfxBus) {
            this.musicBus.gain.setTargetAtTime(0.55 * this._volMusic, this.ctx.currentTime, 0.02);
            this.sfxBus.gain.setTargetAtTime(0.9 * this._volSfx, this.ctx.currentTime, 0.02);
        }
    }
    /**
   * Запуск музыки. mode='menu' — заглавная тема (в меню), mode='game' — игровая.
   * Если музыка уже играет — просто переключаем тему без перезапуска (без щелчка).
   */ startMusic(mode = 'game') {
        if (!this.ensure()) return;
        if (this.playingMusic) {
            this.mode = mode;
            return;
        }
        this.playingMusic = true;
        this.mode = mode;
        this.step = 0;
        this.nextTime = this.ctx.currentTime + 0.08;
        this.timer = setInterval(()=>this.schedule(), 25);
    }
    /** Играет ли сейчас музыка (любая) */ get musicPlaying() {
        return this.playingMusic;
    }
    stopMusic() {
        this.playingMusic = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    schedule() {
        if (!this.ctx || !this.playingMusic) return;
        // Защита от «завала» нот: если вкладка была свёрнута и таймер троттилился,
        // nextTime отстаёт от currentTime — при возврате цикл создавал бы тысячи
        // осцилляторов разом и крашил вкладку. Просто перескакиваем пропущенное.
        if (this.nextTime < this.ctx.currentTime - 0.25) {
            this.nextTime = this.ctx.currentTime + 0.05;
            this.step = 0;
        }
        const bpm = this.mode === 'menu' ? MENU_TEMPO : TEMPOS[this.level];
        const stepDur = 60 / bpm / 2;
        while(this.nextTime < this.ctx.currentTime + 0.12){
            this.playStep(this.step % 32, this.nextTime, stepDur);
            this.nextTime += stepDur;
            this.step++;
        }
    }
    playStep(s, t, dur) {
        const bus = this.musicBus;
        const m8 = s % 8;
        if (this.mode === 'menu') {
            /* Заглавная тема: мягче и суше — барабаны почти неслышны */ const lead = MENU_LEAD[s];
            if (lead) {
                this.tone('square', noteFreq(lead), t, dur * 0.9, 0.11, bus);
                // Тёплое «эхо» октавой ниже — уютная подложка
                this.tone('triangle', noteFreq(lead) / 2, t, dur * 1.4, 0.07, bus);
            }
            const bass = MENU_BASS[s];
            if (bass) this.tone('triangle', noteFreq(bass), t, dur * 1.8, 0.2, bus);
            if (m8 === 0) this.tone('sine', 150, t, 0.09, 0.4, bus, 42);
            if (m8 === 4) this.noise(t, 0.05, 0.09, 'highpass', 7000, bus);
            return;
        }
        const lead = (this.level >= 2 || this.stage >= 1 ? LEAD_B : LEAD_A)[s];
        if (lead) this.tone('square', noteFreq(lead), t, dur * 0.92, 0.15, bus);
        const bass = BASS[s];
        if (bass) this.tone('triangle', noteFreq(bass), t, dur * 1.7, 0.24, bus);
        if (m8 === 0 || m8 === 4) this.tone('sine', 160, t, 0.1, 0.55, bus, 44);
        if (m8 === 2 || m8 === 6) this.noise(t, 0.07, 0.2, 'bandpass', 1800, bus);
        if (m8 % 2 === 0) this.noise(t, 0.03, 0.055, 'highpass', 6800, bus);
    }
    /* ---------- примитивы ---------- */ tone(type, freq, t, dur, gain, bus, slideTo) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(1, freq), t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g);
        g.connect(bus);
        osc.start(t);
        osc.stop(t + dur + 0.03);
    }
    noise(t, dur, gain, filterType, filterFreq, bus) {
        const ctx = this.ctx;
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = filterType;
        f.frequency.value = filterFreq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f);
        f.connect(g);
        g.connect(bus);
        src.start(t);
        src.stop(t + dur + 0.03);
    }
    /* ---------- звуковые эффекты ---------- */ play(name) {
        this.playCount++;
        if (!this.ensure()) return;
        const ctx = this.ctx;
        const bus = this.sfxBus;
        const t = ctx.currentTime + 0.001;
        switch(name){
            case 'pickup':
                this.tone('square', 620, t, 0.07, 0.22, bus, 980);
                break;
            case 'golden':
                this.tone('square', noteFreq('E6'), t, 0.06, 0.22, bus);
                this.tone('square', noteFreq('G6'), t + 0.06, 0.06, 0.22, bus);
                this.tone('square', noteFreq('C7'), t + 0.12, 0.12, 0.22, bus);
                break;
            case 'deposit':
                this.tone('sine', 540, t, 0.12, 0.4, bus, 170);
                this.noise(t, 0.07, 0.1, 'bandpass', 3200, bus);
                this.tone('square', noteFreq('C6'), t + 0.05, 0.06, 0.12, bus);
                break;
            case 'wave':
                ;
                [
                    'C5',
                    'E5',
                    'G5',
                    'C6'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.07, 0.09, 0.2, bus));
                break;
            case 'click':
                this.tone('square', 880, t, 0.05, 0.18, bus);
                break;
            case 'tick':
                this.tone('square', 1250, t, 0.045, 0.2, bus);
                break;
            case 'penalty':
                this.tone('square', 320, t, 0.2, 0.3, bus, 110);
                this.tone('sawtooth', 180, t + 0.02, 0.15, 0.14, bus, 80);
                break;
            case 'gameover':
                ;
                [
                    'C5',
                    'G4',
                    'E5',
                    'C5'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.16, 0.15, 0.22, bus));
                this.tone('triangle', noteFreq('C3'), t + 0.64, 0.4, 0.25, bus);
                break;
            case 'record':
                ;
                [
                    'C5',
                    'E5',
                    'G5',
                    'C6',
                    'E6',
                    'G6'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.09, 0.1, 0.22, bus));
                [
                    'C6',
                    'E6',
                    'G6',
                    'C7'
                ].forEach((n)=>this.tone('square', noteFreq(n), t + 0.56, 0.5, 0.12, bus));
                break;
            case 'chest':
                // Щелчок замка + скрип крышки
                this.tone('square', 220, t, 0.06, 0.26, bus, 150);
                this.noise(t + 0.09, 0.13, 0.16, 'bandpass', 900, bus);
                this.tone('triangle', 330, t + 0.12, 0.12, 0.16, bus, 240);
                break;
            case 'perk':
                // Фанфара открытия перка
                ;
                [
                    'C5',
                    'F5',
                    'A5',
                    'C6'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.08, 0.1, 0.22, bus));
                this.tone('triangle', noteFreq('F4'), t + 0.34, 0.3, 0.2, bus);
                break;
            case 'levelwin':
                // Победный джингл пройденного уровня
                ;
                [
                    'G5',
                    'C6',
                    'E6',
                    'G6'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.11, 0.14, 0.24, bus));
                [
                    'C6',
                    'E6',
                    'G6',
                    'C7'
                ].forEach((n)=>this.tone('square', noteFreq(n), t + 0.5, 0.4, 0.1, bus));
                break;
            case 'meow':
                // «Мяу!» кота-бонуса: два скольжения квадратной волной
                this.tone('square', 740, t, 0.11, 0.18, bus, 1080);
                this.tone('square', 900, t + 0.13, 0.2, 0.18, bus, 430);
                break;
            case 'pigeon':
                // «Жух-жуу» голубя: низкое воркование треугольной волной
                this.tone('triangle', 320, t, 0.16, 0.3, bus, 240);
                this.tone('triangle', 280, t + 0.2, 0.24, 0.3, bus, 190);
                break;
            case 'shoo':
                // Отгон голубя: резкий взлёт вверх + шорох крыльев
                this.tone('square', 480, t, 0.1, 0.24, bus, 1050);
                this.noise(t + 0.05, 0.22, 0.16, 'bandpass', 2400, bus);
                this.tone('triangle', 700, t + 0.12, 0.18, 0.18, bus, 1500);
                break;
            case 'plop':
                // Зёрнышко упало на дно стаканчика: глухой «плюх» + лёгкий шелест бумаги
                this.tone('sine', 300, t, 0.09, 0.32, bus, 120);
                this.noise(t, 0.045, 0.09, 'bandpass', 1500, bus);
                break;
            case 'plopGold':
                // Золотое зёрнышко: плюх повыше и звонкая искра
                this.tone('sine', 430, t, 0.09, 0.32, bus, 170);
                this.tone('square', noteFreq('E6'), t + 0.05, 0.08, 0.14, bus);
                this.noise(t, 0.045, 0.09, 'bandpass', 1500, bus);
                break;
            case 'fever':
                // «ЛИХОРАДКА»: звон игровых автоматов — джекпот-арпеджио вверх и встряска
                ;
                [
                    'C5',
                    'E5',
                    'G5',
                    'C6',
                    'E6',
                    'G6',
                    'C7'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.055, 0.09, 0.2, bus));
                this.noise(t + 0.38, 0.28, 0.1, 'highpass', 6000, bus);
                this.tone('triangle', noteFreq('C7'), t + 0.38, 0.34, 0.12, bus);
                break;
            case 'coin':
                // Звенящая монетка лихорадки
                this.tone('square', noteFreq('B6'), t, 0.05, 0.15, bus);
                this.tone('square', noteFreq('E7'), t + 0.05, 0.09, 0.15, bus);
                break;
            case 'roar':
                /* Рёв Онлифансия: низкий пилообразный стон вниз, второй слой ниже
            и шумовое рычание — страшно, но по-аркадному смешно */ this.tone('sawtooth', 190, t, 0.5, 0.32, bus, 66);
                this.tone('sawtooth', 96, t + 0.03, 0.62, 0.24, bus, 40);
                this.noise(t + 0.02, 0.55, 0.2, 'lowpass', 640, bus);
                this.tone('triangle', 55, t + 0.3, 0.42, 0.3, bus, 30);
                break;
            case 'rumble':
                /* Глухой грохот приближающейся лапы: земля дрожит заранее */ this.tone('triangle', 70, t, 0.5, 0.32, bus, 42);
                this.noise(t, 0.46, 0.16, 'lowpass', 280, bus);
                break;
            case 'gift':
                /* Подарочная коробка выпрыгнула: звонкая искра-«дзинь» — заметно,
            но не кричит: игрок ещё играет, а не слушает */ this.tone('triangle', noteFreq('A5'), t, 0.08, 0.16, bus);
                this.tone('triangle', noteFreq('D6'), t + 0.07, 0.12, 0.16, bus);
                this.noise(t, 0.05, 0.05, 'highpass', 7000, bus);
                break;
            case 'giftOpen':
                /* Коробка открыта: хлопок крышки + радостное арпеджио вверх */ this.tone('square', 300, t, 0.07, 0.2, bus, 520);
                [
                    'C5',
                    'E5',
                    'G5',
                    'C6',
                    'E6'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + 0.08 + i * 0.06, 0.09, 0.18, bus));
                break;
            case 'freeze':
                /* ❄ ФРИЗ: ледяное звяканье — стеклянные ноты вниз + кристаллический шум */ ;
                [
                    'E6',
                    'B5',
                    'G5',
                    'E5'
                ].forEach((n, i)=>this.tone('sine', noteFreq(n), t + i * 0.075, 0.16, 0.16, bus));
                this.noise(t, 0.3, 0.08, 'highpass', 9000, bus);
                this.tone('triangle', noteFreq('C7'), t + 0.02, 0.24, 0.1, bus);
                break;
            case 'sweep':
                /* 🧨 ЗАЧИСТКА МИН: серия глухих подрывов — бас + шум, весело и безвредно */ for(let i = 0; i < 3; i++){
                    const tt = t + i * 0.12;
                    this.tone('triangle', 150 - i * 30, tt, 0.16, 0.3, bus, 55);
                    this.noise(tt, 0.14, 0.18, 'bandpass', 700, bus);
                }
                this.tone('square', noteFreq('C6'), t + 0.4, 0.1, 0.14, bus);
                break;
            case 'mult':
                /* ×N МНОЖИТЕЛЬ: аркадный подъём — быстро вверх по трезвучию */ ;
                [
                    'C5',
                    'E5',
                    'G5',
                    'C6',
                    'E6',
                    'G6',
                    'C7'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.045, 0.07, 0.16, bus));
                this.tone('triangle', noteFreq('C6'), t + 0.32, 0.2, 0.12, bus);
                break;
            case 'bossIntro':
                /* Босс-карточка «КАК ПОБЕДИТЬ?»: глухой барабан + низкий рог —
            «вышел ТЫ-Ж», мрачно, но по-аркадному */ this.tone('sine', 90, t, 0.3, 0.4, bus, 40);
                this.noise(t, 0.22, 0.2, 'lowpass', 500, bus);
                [
                    'C4',
                    'G3',
                    'C4',
                    'D#4'
                ].forEach((n, i)=>this.tone('sawtooth', noteFreq(n), t + 0.24 + i * 0.16, 0.16, 0.16, bus));
                break;
            case 'bossWin':
                /* Победа над боссом: тёмный фанфарный ход вверх + салют-шум */ ;
                [
                    'G4',
                    'A#4',
                    'D5',
                    'F5',
                    'G5'
                ].forEach((n, i)=>this.tone('square', noteFreq(n), t + i * 0.09, 0.12, 0.2, bus));
                this.tone('sawtooth', noteFreq('G3'), t + 0.5, 0.5, 0.16, bus);
                this.noise(t + 0.5, 0.3, 0.08, 'highpass', 6000, bus);
                break;
            case 'achieve':
                /* Ачивка: колокольчик-трофей — стеклянный «динь» с призвуком октавой выше */ ;
                [
                    'A5',
                    'C#6',
                    'E6'
                ].forEach((n, i)=>this.tone('sine', noteFreq(n), t + i * 0.08, 0.22, 0.18, bus));
                this.tone('square', noteFreq('A6'), t + 0.26, 0.3, 0.08, bus);
                break;
            case 'claw':
                /* Вжух-ХЛОП: когтистая лапа Онлифансия влетает в поле —
            свист воздуха + глухой шлепок ладони об пол */ this.noise(t, 0.18, 0.22, 'bandpass', 1400, bus);
                this.tone('sine', 220, t + 0.14, 0.12, 0.36, bus, 60);
                this.noise(t + 0.14, 0.1, 0.16, 'lowpass', 420, bus);
                break;
        }
    }
}
const audio = new ChipTuneAudio();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/engine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIND_POINTS",
    ()=>KIND_POINTS,
    "PopcornEngine",
    ()=>PopcornEngine,
    "bossKindForTier",
    ()=>bossKindForTier,
    "bossTierForLevel",
    ()=>bossTierForLevel
]);
/**
 * Игровой движок POPCORN PAWS — рогалик-режим.
 * Canvas + requestAnimationFrame, независим от React.
 *
 * Игра бесконечна: каждый уровень = 60 секунд и норма (квота) попкорна.
 * Выполнил норму → уровень пройден, сундучок с перком, дальше сложнее.
 * Не успел → конец забега. Перки меняют правила одного уровня.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/audio.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$perks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/perks.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/paws.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/sprites.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$pool$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/pool.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$fps$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/fps.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/i18n.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$skill$2d$tree$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/skill-tree.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
const KIND_POINTS = {
    popcorn: 5,
    caramel: 10,
    butter: 15,
    golden: 25,
    nipple: 20
};
/** Относительный размер зерна на поле: чем ценнее — тем мельче.
    Белое +1 — крупное и заметное, золотое +5 — крохотное, но яркое.
    Соска — самая крупная: её видно издалека (и малышам удобнее) */ const KIND_SCALE = {
    popcorn: 1,
    caramel: 0.84,
    butter: 0.72,
    golden: 0.58,
    nipple: 1.06
};
const FEVER_SECONDS = 3;
/** Шанс, что на лихорадке среди зёрен спрячется одна мина-штраф */ const FEVER_MINE_CHANCE = 0.3;
/** Компенсация этапу, прерванному ВНЕЗАПНОЙ лихорадкой: к остатку таймера
    добавляем +3 сек — перерыв на бонус не должен съедать время этапа */ const FEVER_RESUME_BONUS = 3;
/* --- ПОДАРОЧНЫЕ КОРОБКИ (0.0.41): маленький приз прямо во время забега.
    Появляются случайно на обычных уровнях, ловятся лапкой:
    ❄ ФРИЗ — таймер этапа стоит 7 сек;
    🧨 ЗАЧИСТКА — все мины взрываются безвредно, до конца этапа новых нет;
    🎁 МНОЖИТЕЛЬ ОЧКОВ ×2 / ×5 / ×10 на ограниченное время. --- */ /** Сколько секунд коробка живёт на поле (последние 2.5 мигает) */ const GIFT_LIFE = 9;
/** Интервал между коробками (сек): базовый + разброс */ const GIFT_EVERY_MIN = 9;
const GIFT_EVERY_MAX = 15;
/** Первая коробка на уровне — побыстрее, чтобы механику было видно */ const GIFT_FIRST_MIN = 5;
const GIFT_FIRST_MAX = 9;
/** Фриз таймера из коробки (сек) */ const GIFT_FREEZE_SECONDS = 7;
/** Длительность множителей очков: значение → секунды */ const GIFT_MULT_DUR = {
    2: 15,
    5: 8,
    10: 4
};
/* --- БОЛЬШАЯ ПОПКОРНИНА: раз за уровень на поле появляется жирный приз.
    Живёт 5 секунд и пытается убежать — успел дотянуться: очки и монетки.
    Три сорта глазури (0.0.31 — экономика строже, запрос «все очки уменьшить»):
      • КАРАМЕЛЬНАЯ (белая, обычная) — плоские +500 без комбо;
      • ВИШНЁВАЯ (красная) — база 750 × комбо-множитель: обычный улов
        ~750–1500, у скилловых выше — потолка нет;
      • ВИНОГРАДНАЯ (фиолетовая, самая редкая) — база 3000 × комбо:
        комбо доходит до ×16, улов в идеале — до 48 000.
    Не успел — укатилась. Чем глубже забег, тем выше комбо — тем жирнее приз --- */ const BIG_LIFE = 5;
/** Скорость побега, u/с: вдогонку пальцем — но finger lag решает */ const BIG_SPEED = 74;
/** Появляется в случайный момент между 6-й и 16-й секундой уровня */ const BIG_AT_MIN = 6;
const BIG_AT_MAX = 16;
/** Сорта большой попкорнины: очки, монетки, работает ли комбо и шанс */ const BIG_VARIANTS = {
    caramel: {
        base: 500,
        coins: 25,
        combo: false,
        chance: 0.6,
        text: '#FFC93C',
        ring: '255, 201, 60',
        crumb: '#FFE066'
    },
    cherry: {
        base: 750,
        coins: 60,
        combo: true,
        chance: 0.29,
        text: '#FF7A5E',
        ring: '255, 122, 94',
        crumb: '#FFB3A0'
    },
    grape: {
        base: 3000,
        coins: 120,
        combo: true,
        chance: 0.11,
        text: '#C98AFF',
        ring: '201, 138, 255',
        crumb: '#E3CCFF'
    }
};
/** Взвешенный ролл сорта призовой попкорнины */ function rollBigKind() {
    const r = Math.random();
    let acc = 0;
    for (const kind of Object.keys(BIG_VARIANTS)){
        acc += BIG_VARIANTS[kind].chance;
        if (r < acc) return kind;
    }
    return 'caramel';
}
/* --- БОСС «МАЛЫШ»: на каждом 10-м уровне в зал вламывается ребёнок.
    Он крупнее воришки-голубя, рвётся к корзине и выгребает попкорн.
    Трогать малыша лапкой НЕЛЬЗЯ — слетает сердечко. Победить можно
    только издали: в босс-бою быстрый мах лапкой ПИНАЕТ попкорнинки,
    те летят как в арканоиде и бивают малыша. У первого босса 3 жизни,
    у каждого следующего — на одну больше. Время уровня ограничено --- */ const BOSS_EVERY = 4 // босс выходит на каждом 4-м уровне (4, 8, 12, 16, 20… — v0.0.46)
;
const BOSS_BASE_HP = 3 // жизней у первого босса
;
const BOSS_HP_PER_TIER = 1 // +1 жизнь за каждого следующего босса
;
const BOSS_TOUCH_R = 44 // радиус «трогать ребёнка», u: касание — минус сердечко
;
const BOSS_TOUCH_CD = 1.1 // «отдышка» малыша после касания — не жжёт сердца серией
;
const BOSS_BONUS_BASE = 300 // очки за победу над первым боссом (0.0.31: было 600)
;
const BOSS_BONUS_PER_TIER = 100 // + очки за каждого следующего босса (было 200)
;
const BOSS_COINS_BASE = 60 // монетки за победу (выдаёт компонент с множителями)
;
const BOSS_COINS_PER_TIER = 20 // + монетки за каждого следующего (было 40)
;
const BOSS_CHARGE_BASE = 3.6 // пауза между рывками малыша к корзине, с
;
const BOSS_STEAL = 3 // сколько зёрен выгребает за раз (растёт с номером босса)
;
/** Скорость лапки, с которой она ПИНАЕТ зерно (u/с): ниже — обычный подбор */ const FLING_MIN_SPEED = 430;
/** Трение летящего зерна (экспоненциальное, 1/с): полёт затухает плавно */ const FLING_FRICTION = 3.4;
function bossTierForLevel(lvl) {
    return Math.max(1, Math.floor(lvl / BOSS_EVERY));
}
function bossKindForTier(tier) {
    const i = (tier - 1) % 5;
    return i === 0 ? 'kid' : i === 1 ? 'marten' : i === 2 ? 'pigeon' : i === 3 ? 'gypsy' : 'lion';
}
/** +1 жизнь у льва: грива держит удар; v0.0.46 голубь стал ЖИЛИСТЫМ (+1):
    огромный, но цель мелкая — глаза-точки; цыганке −1: она юркая */ const BOSS_HP_BY_KIND = {
    kid: 0,
    lion: 1,
    marten: 0,
    pigeon: 1,
    gypsy: -1
};
/** Радиус попадания пнутым зерном (u): у голубя и цыганки зерно просто отскакивает.
    v0.0.46: лев подрос — и хитбокс зерна подрос вместе с ним */ const BOSS_HIT_R_BY_KIND = {
    kid: 48,
    lion: 64,
    marten: 38,
    pigeon: 58,
    gypsy: 46
};
/** Сколько зёрен выгребает за раз сверх базы: Лана и голубь — чемпионы воровства,
    цыганка сгребает с ПОЛЯ, у неё свой лимит (GYPSY_GRAB_MAX) */ const BOSS_STEAL_BY_KIND = {
    kid: 0,
    lion: 0,
    marten: 2,
    pigeon: 1,
    gypsy: 0
};
/** Множитель скорости рывка к корзине: голубь пикирует, цыганка ныряет к зёрнам */ const BOSS_CHARGE_MULT_BY_KIND = {
    kid: 1,
    lion: 1.15,
    marten: 1.3,
    pigeon: 1.25,
    gypsy: 1.1
};
/** Сокращение паузы перед рывком (с): v0.0.46 голубь злее — клюёт чаще */ const BOSS_ATTACK_CUT_BY_KIND = {
    kid: 0,
    lion: 0.4,
    marten: 0.8,
    pigeon: 0.6,
    gypsy: 0.6
};
/** Львиный рокт: пауза между роктами (с), длина (с) и сила отброса лапки */ const LION_ROAR_EVERY = 5.2;
const LION_ROAR_DUR = 0.9;
const LION_ROAR_PUSH = 520;
/* --- ОНЛИФАНСИЙ v0.0.46: ФИНАЛЬНЫЙ БОСС (уровень 20, 40, 60…) — царь-лев
    СО ВСЕМИ МЕХАНИКАМИ: рывки к корзине с греблей (как у МАЛЫША), РЁВ с
    гривой-щитом (зёрна отскакивают, лапка отлетает волной), а ещё он
    ЦЕЛИТСЯ КОГТИСТОЙ ЛАПОЙ СВЕРХУ — у лапки игрока загорается круг-
    телеграф, потом удар: не увёл лапку — минус сердечко и стан.
    Сам он бьётся только ПНУТЫМИ ЗЕРНОМ и то ВНЕ рокта --- */ const LION_SLAM_FIRST = 3.4 // передышка перед первым когтистым ударом, с
;
const LION_SLAM_EVERY = 4.4 // пауза между ударами (с); матёрый льёт чаще
;
const LION_SLAM_TELE = 1.15 // сколько секунд горит круг-телеграф, с
;
const LION_SLAM_R = 64 // радиус удара когтей (u)
;
/* --- v0.0.46: КАСКАД ОНЛИФАНСИЯ — разбросан МЕЖДУ БОССАМИ.
    Посередине между боссовыми уровнями (6, 10, 14, 18, 22…) в случайный
    момент этапа С ЛЕВОГО ИЛИ ПРАВОГО КРАЯ внезапно въезжает ОГРОМНАЯ
    КОГТИСТАЯ ЛАПА. Стоит 2 секунды: достаточно огромная, чтобы смутить
    и напугать игрока, но процессу не мешает — зёрна под ней целы и
    собираемы, таймер идёт, сердца не отнимаются. Потом уезжает --- */ const LION_CAMEO_FIRST = 6 // самый ранний каскад — сразу после МАЛЫША (4)
;
const LION_CAMEO_AT_MIN = 7 // самая ранняя задержка от старта этапа, с
;
const LION_CAMEO_AT_MAX = 16 // самая поздняя, с
;
const LION_CAMEO_WARN = 0.6 // грохот и пыль у края до появления, с
;
const LION_CAMEO_IN = 0.32 // стремительный въезд лапы, с
;
const LION_CAMEO_HOLD = 2 // сколько секунд лапа давит на поле (по ТЗ)
;
const LION_CAMEO_OUT = 0.55 // неспешный отъезд, с
;
/** Лана: дэш-бег в бродяжничестве — юркая воровка */ const MARTEN_DASH_STEP = 0.8 // длина рывка (с)
;
const MARTEN_DASH_SPEED = 195 // скорость рывка (u/с) — вдвое быстрее малыша
;
/* --- ЛАНА-ВОРОВКА v0.0.34: тянет к корзинке длинные лапки с когтями ---
    Лапку нужно ПЕРЕРЕЗАТЬ свайпом лапки — это и есть урон воровке.
    Дотянувшийся коготь выгребает попкорн из корзинки и уносит добычу */ const LANA_PAW_R = 15 // «толщина» лапки для разреза (u): свайп сквозь лапку
;
const LANA_GROW = 118 // скорость вытягивания лапки (u/с)
;
const LANA_GROW_TIER = 14 // + к скорости за каждый следующий тир Ланы
;
const LANA_HOLD = 1.6 // сколько секунд пустой коготь держится у корзины (с)
;
const LANA_RETRACT = 320 // скорость отступания лапки (u/с)
;
const LANA_STEAL = 2 // сколько зёрен выгребает коготь за раз (растёт с тиром)
;
const LANA_REGROW = 1.15 // пауза между вырастаниями лапок (с)
;
/* --- МЕГА-ГОЛУБЬ v0.0.38, усилен в v0.0.46 (уровень 12, 32, 52…): ---
    ОГРОМНАЯ птица (~25% экрана) висит над корзиной и периодически ПИКИРУЕТ
    КЛЮВАТЬ её — каждый клюв выгребает зёрна. Тело неуязвимо (зерно тоже
    отскакивает): побеждает только ТОЧНЫЙ удар лапкой ПО ГЛАЗАМ — их два,
    они СТАЛИ ЕЩЁ МЕЛЬЧЕ, а жизни у птицы прибавилось. Попал в глаз —
    птица вздрагивает и теряет жизнь */ const PIGEON_BOSS_R = 62 // базовый радиус тела (u): v0.0.46 — ещё огромнее
;
const PIGEON_BOSS_EYE_R = 5 // радиус глаза-уязвимости (u): стало меньше — бей в точку
;
const PIGEON_BOSS_HIT_CD = 0.35 // пауза между попаданиями по глазам (с)
;
const PIGEON_BOSS_IN_SPEED = 340 // скорость влёта в зал (u/с)
;
const PIGEON_BOSS_HOVER_DX = 130 // якорь парения сбоку от стаканчика (u)
;
const PIGEON_BOSS_HOVER_DY = 250 // якорь парения над стаканчиком (u)
;
/* --- ЦЫГАНСКАЯ РУКА v0.0.39: четвёртый босс (уровень 20, 35, 50…) ---
    Огромная женская рука в золотых кольцах тянется в зал с потолка,
    СГРЕБАЕТ рассыпанные по полу зёрна и ШВЫРЯЕТ их В ЭКРАН игрока:
    зерно летит НА КАМЕРУ, растёт и шлёпает — минус сердечко и лапка
    на секунду оглохла (стан, как от мины). Сама рука — мишень для
    ЛАПКИ: шлёпай по ладони, зерно ей безразлично — отскакивает */ const GYPSY_R = 46 // базовый радиус ладони (u)
;
const GYPSY_SLAP_R = 40 // радиус шлепка лапкой по ладони (u): большая, но юркая
;
const GYPSY_SLAP_MIN_SPEED = 150 // лапка должна ДВИГАТЬСЯ: припаркованная не бьёт (u/с)
;
const GYPSY_HIT_CD = 0.5 // пауза между шлепками (с)
;
const GYPSY_GRAB_R = 80 // радиус сгребания рассыпанных зёрен (u)
;
const GYPSY_GRAB_MAX = 3 // сколько зёрен уносит за один сгреб
;
const GYPSY_SEED_DUR = 1.25 // сколько секунд летит зерно в экран (с)
;
const GYPSY_SEED_POP_R = 56 // радиус шлепка зерном по экрану в точке прилёта (u)
;
const GYPSY_THROW_CD = 0.55 // пауза между бросками в очереди (с)
;
const GYPSY_DIVE_SPEED = 300 // скорость нырка к зёрнам (u/с)
;
/** Ближайшие точки двух отрезков: расстояние и средняя точка между ними.
    Используется для РЕЗА лапок Ланы — свайп лапки это отрезок за кадр */ function segSegClosest(ax, ay, bx, by, cx, cy, dx, dy) {
    const d1x = bx - ax;
    const d1y = by - ay;
    const d2x = dx - cx;
    const d2y = dy - cy;
    const rx = ax - cx;
    const ry = ay - cy;
    const a = d1x * d1x + d1y * d1y;
    const e = d2x * d2x + d2y * d2y;
    const f = d2x * rx + d2y * ry;
    let s = 0;
    let t = 0;
    if (a > 1e-9 && e > 1e-9) {
        const c = d1x * rx + d1y * ry;
        const bb = d1x * d2x + d1y * d2y;
        const denom = a * e - bb * bb;
        s = denom !== 0 ? Math.min(1, Math.max(0, (bb * f - c * e) / denom)) : 0;
        t = (bb * s + f) / e;
        if (t < 0) {
            t = 0;
            s = Math.min(1, Math.max(0, -c / a));
        } else if (t > 1) {
            t = 1;
            s = Math.min(1, Math.max(0, (bb - c) / a));
        }
    } else if (e > 1e-9) {
        t = Math.min(1, Math.max(0, f / e));
    } else if (a > 1e-9) {
        s = Math.min(1, Math.max(0, -(d1x * rx + d1y * ry) / a));
    }
    const p1x = ax + d1x * s;
    const p1y = ay + d1y * s;
    const p2x = cx + d2x * t;
    const p2y = cy + d2y * t;
    return {
        d: Math.hypot(p1x - p2x, p1y - p2y),
        x: (p1x + p2x) / 2,
        y: (p1y + p2y) / 2
    };
}
/** Расстояние от точки до отрезка: проверка «свайп лапки за кадр задел
    глаз мега-голубя» — быстрый мах не может проскочить мелкий глаз
    между кадрами */ function segPointDist(ax, ay, bx, by, px, py) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = 0;
    if (len2 > 1e-9) {
        t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    }
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}
/** Завод пустой частицы для Object Pool: поля заполняются при obtain() */ const makeParticle = ()=>({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        t: 0,
        ttl: 1,
        color: '',
        size: 0
    });
const LEVEL_SECONDS = 50;
const LEVEL_SECONDS_PERK = 62 // перк «Кошачьи часы»
;
const SPAWN_DUR = 0.35;
const CLEAR_DELAY = 0.5 // пауза до «уровень пройден», чтобы зёрна долетели
;
const PIGEON_FIRST_AT = 11 // голубь прилетает на этом отрезке уровня (с 3-го уровня)
;
const PIGEON_PECK_EVERY = 2.2 // раз в сколько секунд голубь таскает зерно
;
const PIGEON_RESPAWN = [
    18,
    30
] // диапазон возврата после прогона, секунд
;
const PIGEON_HIT_CD = 0.3 // минимальная пауза между ударами лапкой — равномерная серия
;
const PIGEON_HIT_R = 50 // радиус касания лапкой (в единицах u)
;
const PIGEON_KO_BONUS = 25 // очки за поверженного воришку (0.0.31: было 50)
;
const MINE_SHOCK_SECONDS = 1 // сколько секунд лапка «опешила» после мины
;
const MINE_SCORE_PENALTY = 50 // сколько очков сгорает при касании мины
;
const MAX_HEARTS_BASE = 5 // сердечек в забеге (плюс апгрейды, древо и лапка)
;
const REVIVE_SECONDS = 15 // «девятая жизнь»: столько секунд даёт второй шанс
;
const DEFAULT_OPTIONS = {
    difficulty: 'normal',
    quality: 'medium',
    shake: true,
    vibration: true,
    colorblind: false,
    pigeon: true,
    mineVariant: 0
};
/** Точки наполнения ВНУТРИ стаканчика (в единицах спрайта от центра, спрайт 48×54).
 *  Зёрна рисуются «за бумажной стенкой» — их не путают с попкорном на поле. */ const CUP_FILL_POS = [
    [
        -8,
        14.8
    ],
    [
        8,
        14.8
    ],
    [
        -13,
        5.2
    ],
    [
        1,
        6.4
    ],
    [
        13.6,
        4.4
    ],
    [
        -6.8,
        -5.2
    ],
    [
        8.4,
        -6.4
    ],
    [
        0,
        -15.2
    ]
];
class PopcornEngine {
    canvas;
    ctx;
    cb;
    raf = 0;
    lastTs = 0;
    destroyed = false;
    /** Телефон/планшет: меньше частиц и ниже разрешение — ради плавных 60 FPS */ coarse = false;
    /** Троттлинг вибрации: чаще, чем раз в 80 мс — нельзя (лаги на Android) */ lastBuzzAt = 0;
    W = 0;
    H = 0;
    dpr = 1;
    u = 1;
    phase = 'idle';
    paused = false;
    timeLeft = 0;
    duration = LEVEL_SECONDS;
    score = 0;
    lvl = 1;
    perk = null;
    quota = 9;
    collected = 0;
    /** Постоянные улучшения из магазина лапок (действуют весь забег и все забеги) */ pawBonus = {};
    /** v0.0.35 «примерка»: текущий стиль отрисовки лапки (0..PAW_STYLE_COUNT-1) */ pawStyle = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_DEFAULT_STYLE"];
    /** Текущий скин из магазина — палитра сохраняется при смене стиля */ pawSkinId = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_PAW"];
    wave = 1;
    popPerWave = 10;
    cornPerWave = 3;
    goldenChance = 0.12;
    /** Шанс карамельного зерна (+2): растёт с уровнем */ caramelChance = 0.04;
    /** Шанс масляного зерна (+3): с 3-го уровня */ butterChance = 0;
    baseWaveDelay = 0.82;
    waveDelay = -1;
    pendingClear = -1;
    debugFast = false;
    pieces = [];
    carried = [];
    flying = [];
    /* Частицы и монетки — через Object Pool: нулевые аллокации в кадре,
     «удаление» — swap-remove без splice и мусора для GC */ particles = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$pool$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pool"](192, makeParticle);
    texts = [];
    paw = {
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
        seen: false,
        pulse: 0,
        hurt: 0
    };
    cup = {
        x: 0,
        y: 0,
        squash: 0
    };
    banner = {
        text: '',
        t: 99
    };
    lastSec = -1;
    audioStage = -1;
    lastStatsKey = '';
    /* --- комбо: серия удачных сдач без мины --- */ streak = 0;
    /* --- счётчики забега для достижений --- */ goldenCount = 0;
    pigeonsRun = 0;
    /** Зёрен/сосок подобрано за забег (пожизненные ачивки) */ runGrains = 0;
    runNipples = 0;
    /** Мин поймано и мин погашено щитами за забег */ minesHit = 0;
    shieldSaves = 0;
    /** Кражи голубя и шоки мины за ТЕКУЩИЙ уровень (ачивка «Чистая работа») */ levelStolen = 0;
    levelShock = 0;
    /* --- голубь-воришка --- */ pigeon = null;
    pigeonTimer = -1;
    /* --- БОЛЬШАЯ ПОПКОРНИНА: раз за уровень, живёт секунды — успей дотянуться --- */ big = null;
    /** Текущий сорт призовой попкорнины (ролл при каждом спавне) */ bigKind = 'caramel';
    /** Секунд от начала уровня, когда появится большая попкорнина */ bigAt = 8;
    /** Своя большая попкорнина на этом уровне уже вышла (поймана или укатилась) */ bigDone = false;
    /** Сколько секунд живёт попкорнина в этом забеге («Живучая попкорнина» +1 сек/ступень) */ bigLife = BIG_LIFE;
    /** Поймано за забег (для статистики) */ bigCaught = 0;
    /** Монетки за большие попкорнины за забег (выдаёт компонент) */ bigCoinsRun = 0;
    /** Поймано за забег по сортам — ачивки «дегустатор» и пожизненные счётчики */ bigCaramelRun = 0;
    bigCherryRun = 0;
    bigGrapeRun = 0;
    /* --- БОССЫ v0.0.34: МАЛЫШ и КУНИЦА ЛАНА — чередуются каждые 10 уровней --- */ boss = null;
    /* --- ЗЁРНА В ЭКРАН (v0.0.39): броски цыганской руки — растут в полёте --- */ seeds = [];
    /** КОГТИ ОНЛИФАНСИЯ (v0.0.46): телеграфы и удары сверху по лапке */ lionSlams = [];
    /** Монетки за победы над боссами за забег (выдаёт компонент) */ bossCoinsRun = 0;
    /** Побед над боссами (любого вида) за забег — ачивки босса */ bossKillsRun = 0;
    /** Побед по видам за забег — ачивки «Царь попкорна» и «Лана поймана» */ bossKidKillsRun = 0;
    bossLionKillsRun = 0;
    bossMartenKillsRun = 0;
    bossPigeonKillsRun = 0;
    bossGypsyKillsRun = 0;
    /** Позиция лапки в прошлом кадре — свайп-сегмент для РЕЗА лапок Ланы */ pawPrevX = 0;
    pawPrevY = 0;
    /** Сердечек было при появлении босса — для «Неприкасаемого» */ bossHeartsAtSpawn = 0;
    /** Последний бой прошёл без потери сердечек (0/1 — в статистику) */ bossCleanLast = false;
    /* --- Отброс лапки ревом льва: импульс (px/с) затухает экспоненциально --- */ pawKnockX = 0;
    pawKnockY = 0;
    /* --- Скорость лапки (px/с, сглаженная): быстрым махом пинаем попкорн --- */ pawVX = 0;
    pawVY = 0;
    /* --- перк «Кошачий щит»: одно прощение мины за уровень --- */ shieldLeft = 0;
    /* --- постоянный апгрейд «Большой стаканчик» (+вместимость) --- */ upgCarry = 0;
    /* --- постоянный апгрейд «Крепкое сердце» (+максимум сердец) --- */ upgHearts = 0;
    /* --- «Комбо-броня»: сколько спасений серии осталось в этом забеге --- */ comboArmorLeft = 0;
    /* --- «Золотая сдача»: монетки за сданные золотые зёрна за забег (выдаёт компонент) --- */ goldCoinsRun = 0;
    /* ---------- механика сердец ---------- */ /** Сердечки-жизни: мина и повторный клюв голубя отнимают сердце,
      ноль сердец — поражение. За пройденный уровень +1 сердце */ hearts = MAX_HEARTS_BASE;
    maxHearts = MAX_HEARTS_BASE;
    /** Сердец потеряно за текущий уровень (ачивки «без потерь») */ heartLost = 0;
    /** Почему закончился забег */ endReason = 'time';
    /* --- «Девятая жизнь»: второй шанс уже использован в этом забеге? --- */ lifeUsed = false;
    /* --- «Лихорадка»: рандомный бонусный уровень на 3 секунды --- */ fever = null;
    feverMine = false;
    /** Пауза-итог после лихорадки, затем сразу следующий уровень */ feverAfter = -1;
    feverNextLvl = 0;
    lastFeverGained = 0;
    /* --- таймер шлейфа звёзд волшебной лапки --- */ starT = 0;
    /* --- «Шок» лапки после мины: замирает на секунду, ничего не берёт --- */ stun = 0;
    /* --- древо улучшений: постоянные бонусы (тестовая ветка) --- */ tree = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$skill$2d$tree$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZERO_BONUS"];
    /* --- «беспорядок NANA»: чем взрослее куница, тем жирнее забег (см. marten.ts) --- */ mess = {
        quota: 1,
        pop: 1,
        mines: 0
    };
    /** Рулетка внезапной ЛИХОРАДКИ: победила в кадре сбора — применяем в конце кадра */ pendingFever = false;
    /** Снимок этапа, прерванного внезапной лихорадкой. После лихорадки этап
      ПРОДОЛЖАЕТСЯ с тем же прогрессом нормы, перком и остатком времени
      (+3 сек компенсации) — фикс 0.0.40: раньше этап начинался заново и
      лихорадка не давала пройти уровень ( особенно на 1–9, где сдачи частые) */ feverResume = null;
    /* --- ПОДАРОЧНЫЕ КОРОБКИ (0.0.41): приз прямо во время забега --- */ gift = null;
    /** Отсчёт до появления следующей коробки (сек) */ giftTimer = 7;
    /** «Фриз»: сколько секунд таймер этапа заморожен */ freezeLeft = 0;
    /** Множитель очков из коробки: сколько секунд ещё действует и его значение */ multLeft = 0;
    multValue = 1;
    /** Коробка-зачистка сработала: до конца этапа мины не спавнятся */ mineSweep = false;
    /** Подарочных коробок поймано за забег (пожизненный счётчик ведёт компонент) */ giftsRun = 0;
    /* --- ОНЛИФАНСИЙ (0.0.43): гигантская лапа с краю поля на уровнях 7/13/18.
      Публичное поле — видно в отладке через window.__popcornEngine --- */ lionCameo = null;
    /** «Парящая лапка»: сколько секунд ещё мины под лапкой не срабатывают */ hoverLeft = 0;
    /** ИНТРО БОССА: геймплей заморожен, пока игрок читает инструкцию
      (не путать с paused — это отдельная пауза, кнопка паузы не влияет) */ introHold = false;
    cupScale = 5;
    cupH = 0;
    /** Уровень столешницы: стаканчик стоит на деревянном столике, а не висит в воздухе */ tableY = 0;
    /* --- настройки из меню (сложность/качество/тряска/вибрация/дальтоник/голубь) --- */ opts = {
        ...DEFAULT_OPTIONS
    };
    /** Язык внутриигровых надписей (баннеры, всплывающие тексты) */ L = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tFor"])('ru');
    /* --- анимация наполнения стаканчика: возраст каждого зёрнышка в кадре --- */ fillPop = [];
    lastFill = 0;
    /** Свечение-искра над стаканчиком после сданного золотого зерна */ cupGlow = 0;
    /** Тряска экрана (настройка «Тряска») */ shakeT = 0;
    shakeAmp = 0;
    /* --- визуальный сок: пылинки, кольца, след лапки, красная вспышка --- */ motes = [];
    rings = [];
    trail = [];
    hurtT = 0;
    sp;
    constructor(canvas, cb = {}){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', {
            alpha: true
        });
        this.cb = cb;
        this.coarse = ("TURBOPACK compile-time value", "object") !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
        this.sp = {
            popcorn: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeSmoothPopcornSprite"])('white'),
            caramel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeSmoothPopcornSprite"])('caramel'),
            butter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeSmoothPopcornSprite"])('butter'),
            golden: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeSmoothPopcornSprite"])('golden'),
            goldenGlow: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeGlowSprite"])('#FFE066'),
            mines: [
                0,
                1,
                2,
                3
            ].map((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMineSprite"])(k, false)),
            minesCB: [
                0,
                1,
                2,
                3
            ].map((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMineSprite"])(k, true)),
            cup: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeCupSprite"])(),
            paw: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeCutePawSprite"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_DEFAULT_STYLE"]),
            sparkle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeSparkleSprite"])(),
            pigeon0: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makePigeonSprite"])(false),
            pigeon1: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makePigeonSprite"])(true),
            nipple: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeSmoothNippleSprite"])(),
            gift: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeGiftSprite"])(),
            big: {
                caramel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeBigPopcornSprite"])('caramel'),
                cherry: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeBigPopcornSprite"])('cherry'),
                grape: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeBigPopcornSprite"])('grape')
            }
        };
        this.lastTs = performance.now();
        this.raf = requestAnimationFrame(this.loop);
    }
    destroy() {
        this.destroyed = true;
        cancelAnimationFrame(this.raf);
    }
    /* ================= публичное API ================= */ /** Скин лапки из магазина: палитра спрайта + постоянные улучшения */ setPawSkin(id) {
        const def = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_MAP"][id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_MAP"].classic;
        this.pawSkinId = id;
        this.pawBonus = def.bonus;
        this.sp.paw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeCutePawSprite"])(this.pawStyle, def.palette);
    }
    /** v0.0.35 «примерка»: стиль отрисовки лапки (0..PAW_STYLE_COUNT-1).
      Палитра текущего скина сохраняется — стиль меняет только рисунок */ setPawStyle(style) {
        this.pawStyle = (style % __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_STYLE_COUNT"] + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_STYLE_COUNT"]) % __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_STYLE_COUNT"];
        const def = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_MAP"][this.pawSkinId] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAW_MAP"].classic;
        this.sp.paw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeCutePawSprite"])(this.pawStyle, def.palette);
    }
    /** Постоянные апгрейды магазина (действуют во всех забегах) */ setUpgrades(u) {
        this.upgCarry = u.carryPlus ?? 0;
        this.upgHearts = u.heartsPlus ?? 0;
    }
    /** Древо улучшений: постоянные бонусы (пересчитывается при покупке узла) */ setTree(b) {
        this.tree = b;
    }
    /** QA: сколько звуковых эффектов проиграно за сессию — проверка озвучки
      в отладке: window.__popcornEngine.sfxCount() */ sfxCount() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].playCount;
    }
    /** Связь кликера с забегом: уровень куницы растит норму, волны и мины */ setMartenMess(m) {
        this.mess = m;
    }
    /** Настройки из меню: сложность, качество, тряска, вибрация, дальтоник, голубь */ setOptions(o) {
        this.opts = {
            ...this.opts,
            ...o
        };
    }
    /** Язык внутриигровых надписей (баннеры «УРОВЕНЬ 2», «УКРАЛ!», «КОМБО ×3»…) */ setLang(lang) {
        this.L = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tFor"])(lang);
    }
    /** Бонус «Нарезки» (мини-игра в конце уровня): добавить очки в счёт забега */ addBonus(n) {
        const add = Math.max(0, Math.floor(n));
        if (add <= 0 || this.phase === 'ended') return;
        this.score += add;
        this.emitStats(true);
    }
    /** Новый забег: счёт с нуля, уровень 1 (старт-апгрейд может дать бонусный перк) */ startRun(opts = {}) {
        this.debugFast = !!opts.fast;
        this.score = 0;
        /* «Быстрый старт»: серия сдач начинается с запасом (+5 за ступень) */ this.streak = Math.max(0, Math.floor(this.tree.comboStart ?? 0));
        /* «Комбо-броня»: по одному спасению серии за ступень на весь забег */ this.comboArmorLeft = Math.max(0, Math.floor(this.tree.comboArmor ?? 0));
        this.goldCoinsRun = 0;
        this.goldenCount = 0;
        this.pigeonsRun = 0;
        this.runGrains = 0;
        this.runNipples = 0;
        this.minesHit = 0;
        this.shieldSaves = 0;
        this.giftsRun = 0;
        this.bigCaught = 0;
        this.bigCoinsRun = 0;
        this.bigCaramelRun = 0;
        this.bigCherryRun = 0;
        this.bigGrapeRun = 0;
        this.bossKillsRun = 0;
        this.bossKidKillsRun = 0;
        this.bossLionKillsRun = 0;
        this.bossMartenKillsRun = 0;
        this.bossPigeonKillsRun = 0;
        this.bossGypsyKillsRun = 0;
        this.bossCleanLast = false;
        this.bossCoinsRun = 0;
        this.boss = null;
        this.lionCameo = null; // Онлифансий не переносится между забегами
        this.pawKnockX = 0;
        this.pawKnockY = 0;
        this.big = null;
        this.lifeUsed = false;
        this.fever = null;
        this.feverAfter = -1;
        this.feverResume = null;
        /* Сердечки: максимум зависит от апгрейдов, древа и лапки; в новом забеге запас полон */ this.maxHearts = Math.min(9, MAX_HEARTS_BASE + this.upgHearts + (this.tree.heartsMax ?? 0) + (this.pawBonus.heartsPlus ?? 0));
        this.hearts = this.maxHearts;
        this.startLevel(1, opts.perk ?? null);
    }
    /** Следующий уровень забега (счёт сохраняется) */ startLevel(level, perk) {
        this.lvl = level;
        this.perk = perk;
        /* Сложность из настроек: лёгкая (+10 сек), сложная (−10 сек) */ const diffTime = this.opts.difficulty === 'easy' ? 10 : this.opts.difficulty === 'hard' ? -10 : 0;
        /* «Долгий бой»: на боссовых уровнях (+3 сек за ступень) */ const bossTime = level % BOSS_EVERY === 0 ? this.tree.bossTime ?? 0 : 0;
        this.duration = Math.max(40, (perk === 'timeplus' ? LEVEL_SECONDS_PERK : LEVEL_SECONDS) + (this.pawBonus.timePlus ?? 0) + this.tree.timePlus + diffTime + bossTime);
        /* Нормы больше не упирается в потолок: чем глубже забег, тем труднее
       успеть. Босс-уровень переопределит её ниже — там победа другая */ this.quota = this.debugFast ? 3 : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$perks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["quotaFor"])(level, perk === 'doublepoints');
        /* Сложность: лёгкая — норма ×0.8, сложная — ×1.2 */ if (!this.debugFast && this.opts.difficulty !== 'normal') {
            this.quota = Math.max(3, Math.round(this.quota * (this.opts.difficulty === 'easy' ? 0.8 : 1.2)));
        }
        /* «Соски-малышки»: каждая соска жирнее (+40), потому и норма +20% */ if (perk === 'milky') this.quota = Math.max(3, Math.round(this.quota * 1.2));
        /* «Беспорядок NANA»: куница рассыпала попкорн — чем она взрослее, тем
       больше нужно собрать (×1…×2). Забег жирнее — и очков больше */ this.quota = Math.max(3, Math.round(this.quota * this.mess.quota));
        this.collected = 0;
        this.wave = 1;
        /* Ступень сложности каждые 5 уровней: пропорционально больше попкорна
       и мин на волне — за отведённое время нужно собирать всё больше, но без безумия */ const step = Math.floor((level - 1) / 5);
        /* Зёрен в волне — тоже больше вместе с NANA (×1…×1.6), потолка нет:
       скилловый игрок успевает собрать больше — у очков нет предела,
       а средний игрок всё равно упрётся в таймер уровня */ this.popPerWave = Math.round((Math.min(30, 10 + step * 3) + (this.tree.grains ?? 0)) * this.mess.pop);
        this.cornPerWave = Math.min(16, 4 + step);
        if (perk === 'cornrain') this.cornPerWave = Math.min(18, this.cornPerWave * 2);
        /* Лапка-оберег от мин: меньше кукурузы в каждой волне */ this.cornPerWave = Math.max(0, this.cornPerWave - (this.pawBonus.cornCut ?? 0));
        /* Древо «Шахтёр»: мин в волне стало меньше */ this.cornPerWave = Math.max(0, this.cornPerWave - (this.tree.cornCut ?? 0));
        /* Сложность: лёгкая — на мину меньше, сложная — на мину больше */ if (this.opts.difficulty === 'easy') this.cornPerWave = Math.max(0, this.cornPerWave - 1);
        if (this.opts.difficulty === 'hard') this.cornPerWave = Math.min(18, this.cornPerWave + 1);
        /* Разгром NANA: мины прибавляются (+1 за 10 уровней куницы, до +3) */ this.cornPerWave = Math.min(18, this.cornPerWave + this.mess.mines);
        this.goldenChance = perk === 'goldenvein' ? 0.26 : Math.min(0.3, 0.12 + (this.pawBonus.goldenAdd ?? 0) + (this.tree.goldAdd ?? 0));
        /* Разнообразие зёрен: карамель и масло появляются с ростом уровня */ this.caramelChance = Math.min(0.2, 0.04 + (this.lvl - 1) * 0.014);
        this.butterChance = this.lvl >= 3 ? Math.min(0.1, 0.015 + (this.lvl - 3) * 0.007) : 0;
        this.baseWaveDelay = Math.max(0.28, 0.8 - (level - 1) * 0.03);
        this.phase = 'playing';
        this.paused = false;
        this.timeLeft = this.duration;
        this.pendingClear = -1;
        this.fever = null;
        this.feverMine = false;
        this.feverAfter = -1;
        this.feverResume = null;
        this.starT = 0;
        this.stun = 0;
        /* ПОДАРОЧНЫЕ КОРОБКИ: на новом уровне всё с нуля; «Парящая лапка»
       начинает парить сразу, если перк взят в сундучке */ this.gift = null;
        this.giftTimer = GIFT_FIRST_MIN + Math.random() * (GIFT_FIRST_MAX - GIFT_FIRST_MIN);
        this.freezeLeft = 0;
        this.multLeft = 0;
        this.multValue = 1;
        this.mineSweep = false;
        this.hoverLeft = this.perk === 'hover' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$perks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HOVER_BASE_SECONDS"] + (this.tree.hoverPlus ?? 0) : 0;
        this.pieces = [];
        this.carried = [];
        this.flying = [];
        this.particles.clear();
        this.texts.length = 0;
        this.waveDelay = -1;
        this.lastSec = Math.ceil(this.timeLeft);
        this.banner = {
            text: this.L('banner.level', {
                n: level
            }),
            t: 0
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].setIntensity(0);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].setMusicLevel(level >= 3 ? 1 : 0);
        this.audioStage = 0;
        this.shieldLeft = (perk === 'shield' ? 1 : 0) + (this.tree.shields ?? 0);
        /* Голубь-воришка: с 3-го уровня, и чем дальше — тем раньше прилетает
        (с 3-го ~11 сек, дальше ramp до ~4 сек). «Птичий базар» — втрое раньше */ this.pigeon = null;
        this.pigeonTimer = this.opts.pigeon && level >= 3 ? perk === 'pigeonfeast' ? 3.5 + Math.random() * 1.5 : /* Апгрейд «Кроткий голубь»: первый прилёт позже */ Math.max(4, PIGEON_FIRST_AT - (level - 3) + this.tree.pigeonLate) + Math.random() * 3 : -1;
        /* Большая попкорнина: уходит вместе с уровнем, следующая появится
       в случайный момент уровня. «Ранняя попкорнина» сдвигает выход
       ближе к началу, «Живучая» удлиняет её жизнь */ this.big = null;
        this.bigDone = false;
        this.bigLife = BIG_LIFE + (this.tree.bigLife ?? 0);
        {
            const early = Math.min(9, this.tree.bigEarly ?? 0);
            const lo = Math.max(2, BIG_AT_MIN - early);
            const hi = Math.max(lo + 1, BIG_AT_MAX - early);
            this.bigAt = lo + Math.random() * (hi - lo);
        }
        /* КАСКАД ОНЛИФАНСИЯ (v0.0.46): посередине между боссовыми уровнями
        (6, 10, 14, 18, 22…) в случайный момент этапа — лапа с краю поля.
        Одна за этап; на боссовых уровнях не появляется (там и так жарко) */ this.lionCameo = level >= LION_CAMEO_FIRST && level % BOSS_EVERY === 2 ? {
            timer: LION_CAMEO_AT_MIN + Math.random() * (LION_CAMEO_AT_MAX - LION_CAMEO_AT_MIN),
            phase: 'idle',
            phaseT: 0,
            side: Math.random() < 0.5 ? -1 : 1
        } : null;
        /* Босс и скорость лапки с прошлого уровня не выживают */ this.boss = null;
        this.seeds = [];
        this.lionSlams = []; // когтистые удары тоже не переносятся
        this.pawVX = 0;
        this.pawVY = 0;
        /* Ачивка «Чистая работа»: считаем шоки и кражи за уровень; и потери сердец */ this.levelStolen = 0;
        this.levelShock = 0;
        this.heartLost = 0;
        /* Наполнение стаканчика сбрасывается: анимация зёрен заново */ this.fillPop = [];
        this.lastFill = 0;
        this.cupGlow = 0;
        this.shakeT = 0;
        this.shakeAmp = 0;
        if (!this.paw.seen) {
            this.paw.x = this.cup.x;
            this.paw.y = this.H * 0.4;
            this.paw.tx = this.paw.x;
            this.paw.ty = this.paw.y;
        }
        this.paw.hurt = 0;
        /* БОСС «МАЛЫШ»: каждый 10-й уровень вместо обычного — бой в тир-арканоид.
       Никаких мин и воришек: малыш сам рвётся к корзине, а попкорн для
       «стрельбы» подбрасывается волнами. Нормы нет — победить только босса */ if (level % BOSS_EVERY === 0) {
            this.quota = 999999; // победа — только жизни малыша в ноль
            this.popPerWave = 9; // попкорн-«снаряды» для пинков
            this.cornPerWave = 0; // мины в тире не нужны — и так жарко
            this.goldenChance = 0.04;
            this.caramelChance = 0.1;
            this.butterChance = 0;
            this.pigeon = null;
            this.pigeonTimer = -1;
            this.bigDone = true; // большая попкорнина не выживает рядом с малышом
            /* Лапка новичка отступает к нижнему краю: автопилот не должен висеть
         в верхней трети, где бродит малыш — иначе бесплатное сердце */ if (!this.paw.seen) {
                this.paw.seen = true;
                this.paw.x = Math.max(40 * this.u, this.W * 0.16);
                this.paw.y = this.H * 0.82;
            }
            this.paw.tx = this.paw.x;
            this.paw.ty = this.paw.y;
            this.spawnBoss();
            /* ИНТРО БОССА: замораживаем геймплей и просим компонент показать
         карточку «как победить» — каждый босс встречает своей инструкцией */ this.introHold = true;
            this.cb.onBossIntro?.(level, bossKindForTier(bossTierForLevel(level)));
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('wave');
        this.spawnWave();
        this.emitStats(true);
    }
    /** «ЛИХОРАДКА» — рандомный бонусный уровень: 3 секунды, весь экран в зёрнах
      без мин (изредка прячется одна мина-штраф). Очки капают в счёт; если
      схватить мину — всё заработанное в лихорадке сгорает. После итога
      забег сразу продолжается со следующего уровня, без сундучка. */ startFever(nextLevel) {
        if (this.phase !== 'clear' && this.phase !== 'playing') return;
        this.perk = null;
        this.phase = 'playing';
        this.paused = false;
        /* «Долгая лихорадка» из древа: +1 сек за каждый уровень узла */ const dur = FEVER_SECONDS + (this.tree.feverPlus ?? 0);
        this.duration = dur;
        this.timeLeft = dur;
        this.quota = 999999;
        this.collected = 0;
        this.fever = {
            gained: 0,
            startScore: this.score,
            next: nextLevel,
            coinT: 0
        };
        this.feverMine = Math.random() < FEVER_MINE_CHANCE;
        this.feverAfter = -1;
        this.lastFeverGained = 0;
        this.pieces = [];
        this.carried = [];
        this.flying = [];
        this.particles.clear();
        this.texts.length = 0;
        this.pigeon = null;
        this.pigeonTimer = -1;
        /* Большая попкорнина не выживает на лихорадке: поле очищается */ this.big = null;
        /* Онлифансий не пугает на лихорадке: лапа исчезает, страх отменяется */ this.lionCameo = null;
        this.seeds = []; // боссов на лихорадке нет и зёрен-снарядов тоже
        this.lionSlams = []; // и когти Онлифансия отменяются
        this.waveDelay = -1;
        this.pendingClear = -1;
        this.stun = 0;
        this.fillPop = [];
        this.lastFill = 0;
        this.cupGlow = 0;
        this.shakeT = 0;
        this.shakeAmp = 0;
        /* На лихорадке подарков нет (и фриз не имеет смысла — свой таймер);
       множитель очков сохраняется — приятная синергия */ this.gift = null;
        this.giftTimer = -1;
        this.freezeLeft = 0;
        this.banner = {
            text: this.L('banner.fever'),
            t: 0
        };
        this.lastSec = Math.ceil(this.timeLeft);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].setIntensity(3);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('fever');
        /* Золотой салют: лихорадка начинается с взрыва настроения */ this.confettiBurst(this.cup.x, this.cup.y - this.cupH * 0.5, 26);
        this.spawnFeverField();
        this.emitStats(true);
    }
    /** Экран лихорадки: смесь ценных зёрен, изредка — одна мина-штраф */ spawnFeverField() {
        const kinds = [];
        for(let i = 0; i < 36; i++){
            const r = Math.random();
            kinds.push(r < 0.16 ? 'golden' : r < 0.34 ? 'butter' : r < 0.55 ? 'caramel' : 'popcorn');
        }
        if (this.feverMine) kinds[Math.floor(Math.random() * kinds.length)] = 'corn';
        kinds.forEach((kind, i)=>this.spawnPiece(i, kind));
    }
    /** Подсыпка зёрен, если экран лихорадки опустел */ spawnFeverTop() {
        for(let i = 0; i < 6; i++){
            const r = Math.random();
            this.spawnPiece(i, r < 0.16 ? 'golden' : r < 0.34 ? 'butter' : r < 0.55 ? 'caramel' : 'popcorn');
        }
    }
    /** Итог лихорадки: успех — очки остаются; мина — всё заработанное сгорает */ feverEnd(success) {
        const f = this.fever;
        if (!f) return;
        this.fever = null;
        this.feverNextLvl = f.next;
        this.lastFeverGained = f.gained;
        /* Таймер-страховка: пока идёт пауза-итог, время не должно выйти */ this.timeLeft = 1.2;
        this.duration = 1.2;
        this.lastSec = Math.ceil(this.timeLeft);
        this.feverAfter = 1.15;
        if (success) {
            this.banner = {
                text: this.L('txt.feverWin', {
                    n: f.gained
                }),
                t: 0
            };
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('record');
            this.buzz([
                30,
                40,
                30,
                40,
                90
            ]);
            this.crumbs(this.paw.x, this.paw.y, '#FFE066', 12);
        } else {
            this.score = Math.max(0, this.score - f.gained);
            this.streak = 0;
            this.banner = {
                text: this.L('txt.feverBurn'),
                t: 0
            };
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('penalty');
            this.doShake(9);
            this.buzz([
                60,
                40,
                100
            ]);
            this.crumbs(this.paw.x, this.paw.y, '#E5342E', 9);
        }
        this.emitStats(true);
        this.cb.onFeverEnd?.({
            gained: success ? f.gained : 0,
            success,
            next: f.next,
            resumed: this.feverResume !== null,
            perk: this.feverResume ? this.feverResume.perk : null
        });
    }
    /** Продолжение этапа после ВНЕЗАПНОЙ лихорадки: прогресс нормы, перк и
      остаток таймера сохранены (+3 сек компенсации), поле пересыпано заново.
      Фикс 0.0.40: раньше startLevel() начинал этап с нуля — лихорадка
      сбрасывала его по несколько раз и не давала пройти */ resumeLevelAfterFever() {
        const snap = this.feverResume;
        this.feverResume = null;
        if (!snap) return;
        this.phase = 'playing';
        this.paused = false;
        this.perk = snap.perk;
        this.quota = snap.quota;
        this.collected = snap.collected;
        this.shieldLeft = snap.shieldLeft;
        /* Остаток времени этапа + компенсация за перерыв; duration = timeLeft,
       чтобы полоса таймера после возобновления была полной */ this.timeLeft = snap.timeLeft + FEVER_RESUME_BONUS;
        this.duration = this.timeLeft;
        this.pendingClear = -1;
        this.waveDelay = -1;
        this.stun = 0;
        this.pieces = []; // остатки лихорадочного поля не переживают возобновление
        this.carried = [];
        this.flying = [];
        this.lastSec = Math.ceil(this.timeLeft);
        this.audioStage = -1; // музыка пересинхронизируется сама в ближайший кадр
        this.banner = {
            text: this.L('txt.feverResume', {
                n: FEVER_RESUME_BONUS
            }),
            t: 0
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('wave');
        /* Подарки снова работают на возобновлённом этапе; «Парящая лапка»
       получает свежий запас парения — этап ведь продолжается */ this.gift = null;
        this.giftTimer = GIFT_FIRST_MIN + Math.random() * (GIFT_FIRST_MAX - GIFT_FIRST_MIN);
        this.hoverLeft = this.perk === 'hover' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$perks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HOVER_BASE_SECONDS"] + (this.tree.hoverPlus ?? 0) : 0;
        this.spawnWave();
        this.emitStats(true);
    }
    setPaused(p) {
        if (this.phase !== 'playing') return;
        this.paused = p;
        this.emitStats(true);
    }
    /** Инструкция босса прочитана («В БОЙ!»): отпускаем геймплей и показываем
      баннер уровня, который ждал под интро-карточкой */ dismissBossIntro() {
        if (!this.introHold) return;
        this.introHold = false;
        this.banner = {
            text: this.L('banner.level', {
                n: this.lvl
            }),
            t: 0
        };
        this.lastSec = Math.ceil(this.timeLeft);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('wave');
        this.emitStats(true);
    }
    /** «Конец игры»: мгновенно свернуть забег и вернуться в меню (без экрана результатов).
      Опыт при этом НЕ сгорает — компонент начисляет очки в банк по ходу забега. */ abort() {
        this.phase = 'idle';
        this.paused = false;
        this.pieces = [];
        this.carried = [];
        this.flying = [];
        this.particles.clear();
        this.texts.length = 0;
        this.pigeon = null;
        this.fever = null;
        this.feverAfter = -1;
        this.feverResume = null;
        this.introHold = false;
        this.gift = null;
        this.freezeLeft = 0;
        this.multLeft = 0;
        this.multValue = 1;
        this.seeds = [];
        this.lionSlams = [];
        this.banner = {
            text: '',
            t: 99
        };
        this.shakeT = 0;
        this.shakeAmp = 0;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].stopMusic();
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].setIntensity(0);
        this.emitStats(true);
    }
    /** «КОНЕЦ ИГРЫ» по воле игрока: честный ПОБЕДНЫЙ финал забега.
      Очки идут в рекорд и мировую таблицу как обычно, экран результата
      показывает победный плакат №7. Работает в бою (playing) и между
      уровнями (clear/сундук); на паузе — тоже (paused — отдельный флаг). */ finish() {
        if (this.phase !== 'playing' && this.phase !== 'clear') return false;
        this.paused = false;
        this.end('voluntary');
        return true;
    }
    /** «Девятая жизнь»: один раз за забег продолжить проваленный уровень (+15 секунд).
      Возвращает true, если второй шанс сработал. */ revive() {
        if (this.phase !== 'ended' || this.lifeUsed) return false;
        this.lifeUsed = true;
        this.phase = 'playing';
        this.paused = false;
        this.stun = 0;
        /* Второй шанс возвращает и сердца — полный запас */ this.hearts = this.maxHearts;
        this.timeLeft = REVIVE_SECONDS;
        this.duration = REVIVE_SECONDS;
        this.lastSec = Math.ceil(this.timeLeft);
        this.audioStage = -1;
        this.pendingClear = -1;
        this.banner = {
            text: this.L('banner.revive'),
            t: 0
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('wave');
        this.emitStats(true);
        return true;
    }
    /** Использован ли второй шанс в текущем забеге */ get lifeSpent() {
        return this.lifeUsed;
    }
    /** Координаты в системе игрового поля (трансформации экрана считает компонент) */ setPointer(x, y, lift = 0) {
        if (this.phase !== 'playing' || this.paused) return;
        this.paw.tx = x;
        this.paw.ty = y - lift * this.u;
        if (!this.paw.seen) {
            /* Первое касание: лапка ПОЯВЛЯЕТСЯ под пальцем, а не летит к нему —
         иначе первый «замет» через всё поле режет лапки Ланы без свайпа */ this.paw.x = x;
            this.paw.y = y - lift * this.u;
            this.pawPrevX = this.paw.x;
            this.pawPrevY = this.paw.y;
            this.paw.seen = true;
        }
    }
    /* ================= размеры ================= */ /** Размер игрового поля в CSS-пикселях (задаёт компонент с учётом перков) */ handleResize(w, h) {
        if (w === 0 || h === 0) return;
        const oldW = this.W;
        const oldH = this.H;
        this.W = w;
        this.H = h;
        /* DPR: потолок из настроек качества (+ авто-потолок на низком тире) */ this.applyDpr();
        this.u = Math.max(0.7, Math.min(1.5, Math.min(w, h) / 420));
        if (oldW > 0 && oldH > 0 && (oldW !== w || oldH !== h)) {
            const kx = w / oldW;
            const ky = h / oldH;
            for (const p of this.pieces){
                p.x *= kx;
                p.y *= ky;
            }
            this.paw.x *= kx;
            this.paw.y *= ky;
            this.paw.tx *= kx;
            this.paw.ty *= ky;
        }
        /* Детальный стаканчик 48×54: пиксели вдвое мельче при том же размере */ this.cupScale = 2.3 * this.u;
        this.cupH = 54 * this.cupScale;
        this.cup.x = w / 2;
        /* Столик внизу: стаканчик стоит на столешнице, а не висит в воздухе */ this.tableY = h - 30 * this.u;
        this.cup.y = this.tableY - this.cupH / 2;
    }
    /* ================= волны ================= */ spawnWave() {
        /* Точный состав волны: норма зёрен + мины (ступень каждые 5 уровней).
       Внутри «вкусной» нормы — смесь: белое/карамель/масло/золото. */ const kinds = [];
        for(let i = 0; i < this.popPerWave; i++){
            const r = Math.random();
            const cB = this.goldenChance;
            const cC = cB + this.caramelChance;
            const cM = cC + this.butterChance;
            kinds.push(r < cB ? 'golden' : r < cC ? 'caramel' : r < cM ? 'butter' : 'popcorn');
        }
        for(let i = 0; i < this.cornPerWave; i++)kinds.push('corn');
        /* «Соски-малышки»: все обычные зёрна — соски (золотые остаются золотыми) */ if (this.perk === 'milky') {
            for(let i = 0; i < kinds.length; i++){
                const k = kinds[i];
                if (k === 'popcorn' || k === 'caramel' || k === 'butter') kinds[i] = 'nipple';
            }
        }
        for(let i = kinds.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [kinds[i], kinds[j]] = [
                kinds[j],
                kinds[i]
            ];
        }
        kinds.forEach((kind, i)=>this.spawnPiece(i, kind));
    }
    spawnPiece(index, kind) {
        const u = this.u;
        const mX = 46 * u;
        /* Статистика вынесена в панель над полем — верх больше не перекрыт: зёрна
       заспавниваются выше, игровая зона больше */ const top = 46 + 4 * u;
        const bottom = this.H - 52 * u;
        let x = this.W / 2;
        let y = this.H / 2;
        for(let tries = 0; tries < 40; tries++){
            x = mX + Math.random() * (this.W - mX * 2);
            y = top + Math.random() * Math.max(10, bottom - top);
            const dc = Math.hypot(x - this.cup.x, y - this.cup.y);
            if (dc <= 135 * u) continue;
            // не даём зёрнам застрять в кластере — маршрут всегда проходим
            let crowded = false;
            for (const q of this.pieces){
                if (Math.hypot(x - q.x, y - q.y) < 40 * u) {
                    crowded = true;
                    break;
                }
            }
            if (!crowded) break;
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
            dA: Math.random() * Math.PI * 2
        });
    }
    /* ================= размеры и ступени сложности ================= */ /** Вместимость лапки: 3 зерна, после 5-го уровня — 4, после 10-го — 5 (+скин, +апгрейд, +перк, +древо) */ get carryMax() {
        const base = this.lvl >= 11 ? 5 : this.lvl >= 6 ? 4 : 3;
        return base + (this.pawBonus.carryPlus ?? 0) + this.upgCarry + (this.perk === 'secondcup' ? 2 : 0) + (this.tree.carry ?? 0);
    }
    /** Комбо-множитель: +1 за каждые 6 сдач подряд (с «Комбо-тренером» — 5).
      Потолка больше нет: серия мастера разгоняется без предела,
      а мины и воришки всё ещё сбивают её в ноль */ get comboMult() {
        return 1 + Math.floor(this.streak / (this.tree.comboFast ? 5 : 6));
    }
    /** Мина или воришка сбивают серию. «Комбо-броня» гасит первые удары за
      забег: серия сохраняется, вместо неё — надпись «БРОНЯ!» */ breakStreak(x, y) {
        const u = this.u;
        if (this.comboArmorLeft > 0) {
            this.comboArmorLeft--;
            this.texts.push({
                x,
                y,
                text: this.L('txt.comboarmor'),
                color: '#BFF3E6',
                t: 0,
                dur: 0.9,
                size: 20 * u
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
            return;
        }
        this.streak = 0;
    }
    /** Радиус подбора лапки: перки + скин + древо («Магнит» +8% за уровень) */ get grabR() {
        return (this.perk === 'bigpaw' ? 58 : this.perk === 'smallpaw' ? 34 : 44) * this.u * (this.pawBonus.grabR ?? 1) * (1 + (this.tree.grabR01 ?? 0));
    }
    /** Попкорн каждые 5 уровней немного мельчает — на поле остаётся место */ get popScale() {
        return Math.max(0.68, 1 - 0.035 * Math.floor((this.lvl - 1) / 5));
    }
    /** Мины-кукурузины каждые 5 уровней, наоборот, толстеют */ get cornScale() {
        return Math.min(1.5, 1 + 0.09 * Math.floor((this.lvl - 1) / 5));
    }
    /* ================= перки-механики ================= */ /** «Скользкий пол»: зёрна катаются по полу */ driftPieces(dt) {
        const u = this.u;
        const sp = 17 * u;
        const mX = 34 * u;
        const top = 50;
        const bottom = this.H - 56 * u;
        for (const p of this.pieces){
            p.dA += (Math.random() - 0.5) * dt * 2.4;
            p.x += Math.cos(p.dA) * sp * dt;
            p.y += Math.sin(p.dA) * sp * dt;
            if (p.x < mX) {
                p.x = mX;
                p.dA = Math.PI - p.dA;
            }
            if (p.x > this.W - mX) {
                p.x = this.W - mX;
                p.dA = Math.PI - p.dA;
            }
            if (p.y < top) {
                p.y = top;
                p.dA = -p.dA;
            }
            if (p.y > bottom) {
                p.y = bottom;
                p.dA = -p.dA;
            }
        }
    }
    /** «Магнитная лапа»: попкорн сам тянется к лапке */ magnetPull(dt) {
        const u = this.u;
        const r = 115 * u;
        const k = Math.min(1, dt * 3.4);
        for (const p of this.pieces){
            if (p.kind === 'corn' || p.spawn > 0.12) continue;
            const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y);
            if (d < r && d > 1) {
                p.x += (this.paw.x - p.x) * k;
                p.y += (this.paw.y - p.y) * k;
            }
        }
    }
    /* ================= большая попкорнина ================= */ /** Тик большой попкорнины: побег по полю, обратный отсчёт, спавн по расписанию */ updateBig(dt) {
        if (this.fever || this.feverAfter >= 0 || this.phase !== 'playing') return;
        const u = this.u;
        if (this.big) {
            const b = this.big;
            b.t += dt;
            /* Попкорнина пытается убежать: время от времени меняет направление */ b.wt -= dt;
            if (b.wt <= 0) {
                b.wt = 0.45 + Math.random() * 0.55;
                b.dir = Math.random() * Math.PI * 2;
            }
            b.x += Math.cos(b.dir) * BIG_SPEED * u * dt;
            b.y += Math.sin(b.dir) * BIG_SPEED * u * dt;
            /* Границы поля: отскок, как у зёрен в перке «Скользкий пол» */ const mX = 40 * u;
            const top = 40;
            const bot = this.H - 46 * u;
            if (b.x < mX) {
                b.x = mX;
                b.dir = Math.PI - b.dir;
            }
            if (b.x > this.W - mX) {
                b.x = this.W - mX;
                b.dir = Math.PI - b.dir;
            }
            if (b.y < top) {
                b.y = top;
                b.dir = -b.dir;
            }
            if (b.y > bot) {
                b.y = bot;
                b.dir = -b.dir;
            }
            /* Время вышло — укатилась: награда потеряна безвозвратно */ if (b.t >= this.bigLife) {
                this.crumbs(b.x, b.y, '#C9B38A', 9);
                this.texts.push({
                    x: b.x,
                    y: b.y - 40 * u,
                    text: this.L('big.miss'),
                    color: '#B9A88F',
                    t: 0,
                    dur: 1,
                    size: 22 * u
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('penalty');
                this.big = null;
            }
            return;
        }
        /* Ещё не появлялась на этом уровне — время пришло? Ровно одна на уровень:
       помечаем bigDone в момент выхода, иначе после поимки/промаха
       расписание сработало бы заново каждый кадр */ if (!this.bigDone && this.duration - this.timeLeft >= this.bigAt) {
            this.bigDone = true;
            this.spawnBig();
        }
    }
    /** Выпустить большую попкорнину: подальше от лапки, чтобы успели не все.
      forced — сорт для QA/E2E (обычно сорт рэндомится) */ spawnBig(forced) {
        const u = this.u;
        /* Ролл сорта: карамель 60% · вишня 29% · виноград 11% */ this.bigKind = forced ?? rollBigKind();
        const v = BIG_VARIANTS[this.bigKind];
        const mX = 52 * u;
        const top = 46 + 8 * u;
        const bottom = this.H - 60 * u;
        const diag = Math.hypot(this.W, this.H);
        let bx = this.W / 2;
        let by = this.H / 2;
        let best = -1;
        for(let tries = 0; tries < 44; tries++){
            const x = mX + Math.random() * (this.W - mX * 2);
            const y = top + Math.random() * Math.max(10, bottom - top);
            const dPaw = Math.hypot(x - this.paw.x, y - this.paw.y);
            if (dPaw <= best) continue;
            /* не в стаканчике и не впритык к минам/зёрнам */ if (Math.hypot(x - this.cup.x, y - this.cup.y) < 110 * u) continue;
            let bad = false;
            for (const q of this.pieces){
                if (Math.hypot(x - q.x, y - q.y) < 52 * u) {
                    bad = true;
                    break;
                }
            }
            if (bad) continue;
            bx = x;
            by = y;
            best = dPaw;
            if (best > diag * 0.52) break;
        /* уже достаточно далеко — хватит искать */ }
        this.big = {
            x: bx,
            y: by,
            t: 0,
            dir: Math.random() * Math.PI * 2,
            wt: 0.5,
            phase: Math.random() * Math.PI * 2
        };
        /* Ударная волна в цвете сорта + объявление: реакция игрока стартует сейчас */ this.rings.push({
            x: bx,
            y: by,
            t: 0,
            ttl: 0.7,
            color: v.ring,
            r0: 14 * u,
            r1: 110 * u
        });
        this.texts.push({
            x: bx,
            y: by - 48 * u,
            text: this.L(`big.${this.bigKind}`),
            color: v.text,
            t: 0,
            dur: 1.5,
            size: 26 * u
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('chest');
        this.buzz([
            20,
            30,
            20
        ]);
    }
    /** Поймала лапка: очки сорта (у вишни и винограда — с комбо-множителем)
      и монетки компоненту. Карамель — плоские +500 (0.0.31: было 1000) */ catchBig() {
        const u = this.u;
        const b = this.big;
        if (!b) return;
        this.big = null;
        this.bigCaught++;
        if (this.bigKind === 'caramel') this.bigCaramelRun++;
        else if (this.bigKind === 'cherry') this.bigCherryRun++;
        else this.bigGrapeRun++;
        const v = BIG_VARIANTS[this.bigKind];
        /* «Сладкая глазурь»: очки попкорнин +10% за ступень */ const pts = Math.round((v.combo ? v.base * this.comboMult : v.base) * (1 + (this.tree.bigMult01 ?? 0)));
        this.bigCoinsRun += v.coins;
        this.score += pts;
        this.paw.pulse = 1;
        this.rings.push({
            x: b.x,
            y: b.y,
            t: 0,
            ttl: 0.5,
            color: v.ring,
            r0: 12 * u,
            r1: 74 * u
        });
        this.crumbs(b.x, b.y, v.crumb, 14);
        this.texts.push({
            x: b.x,
            y: b.y - 44 * u,
            text: `+${pts}`,
            color: v.text,
            t: 0,
            dur: 1.2,
            size: 32 * u
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('golden');
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('coin');
        this.buzz(35);
    }
    /** QA/E2E: немедленно выпустить большую попкорнину, минуя расписание.
      Сорт можно задать — для проверки очков и цветов всех трёх */ debugSpawnBig(kind) {
        if (this.phase === 'playing' && !this.big && !this.fever) this.spawnBig(kind);
    }
    /** Отладка/E2E: принудительно выпустить босса на текущем уровне */ debugSpawnBoss() {
        if (this.phase === 'playing' && !this.boss && !this.fever) this.spawnBoss();
    }
    /* ================= обновление ================= */ update(dt) {
        const u = this.u;
        /* Пауза-итог лихорадки: показываем результат и сразу идём на следующий
       уровень (сундучок пропускается — так и задумано: было тяжело!) */ if (this.feverAfter >= 0) {
            this.feverAfter -= dt;
            if (this.feverAfter <= 0) {
                this.feverAfter = -1;
                /* ВНЕЗАПНАЯ лихорадка: этап ПРОДОЛЖАЕТСЯ с сохранённым прогрессом
           и временем (+3 сек), а не начинается заново (фикс 0.0.40).
           Обычная (после уровня) — как раньше: сразу следующий уровень */ if (this.feverResume) {
                    this.resumeLevelAfterFever();
                    return;
                }
                this.startLevel(this.feverNextLvl, null);
                return;
            }
        }
        /* Внезапная ЛИХОРАДКА из древа («Фарт»): стартуем после кадра сбора,
       когда никакие массивы не обходятся */ if (this.pendingFever) {
            this.pendingFever = false;
            if (!this.fever && !this.boss && this.feverAfter < 0 && this.pendingClear < 0 && this.phase === 'playing') {
                /* Фикс 0.0.40: снимаем состояние этапа ДО лихорадки — после неё
           этап продолжится с тем же прогрессом, а не начнётся заново */ this.feverResume = {
                    timeLeft: this.timeLeft,
                    perk: this.perk,
                    quota: this.quota,
                    collected: this.collected,
                    shieldLeft: this.shieldLeft
                };
                this.startFever(this.lvl);
                return;
            }
        }
        // Плавное следование лапки за пальцем/курсором («Тяжёлая лапа» — вдвое медленнее);
        // скины магазина делают лапку проворнее
        if (!this.paw.seen) {
            this.paw.tx = this.cup.x + Math.sin(performance.now() * 0.001) * 80 * u;
            this.paw.ty = this.H * 0.35;
        }
        if (this.stun > 0) {
            // Шок от мины: лапка «опешила» и застыла на месте — цель запоминается,
            // когда отпустит, лапка догонит палец
            this.pawVX = 0;
            this.pawVY = 0;
        } else {
            const prevX = this.paw.x;
            const prevY = this.paw.y;
            /* Свайп-сегмент кадра: им ПЕРЕРЕЗАЮТСЯ лапки Ланы */ this.pawPrevX = prevX;
            this.pawPrevY = prevY;
            const spd = 14 * (this.pawBonus.speed ?? 1) * (1 + (this.tree.speedAdd ?? 0));
            /* Ступени медленной лапки: чем выше ступень, тем медленнее follow —
         и тем щедрее награда очками (см. perkScoreMult) */ const slowFactor = this.perk === 'slowpaw' ? 0.46 : this.perk === 'slowpaw2' ? 0.3 : this.perk === 'slowpaw3' ? 0.22 : 1;
            const k = 1 - Math.exp(-dt * spd * slowFactor);
            this.paw.x += (this.paw.tx - this.paw.x) * k;
            this.paw.y += (this.paw.ty - this.paw.y) * k;
            /* РЁВ ЛЬВА: лапку сносит волной от зверя — импульс затухает быстро */ if (this.pawKnockX !== 0 || this.pawKnockY !== 0) {
                this.paw.x += this.pawKnockX * dt;
                this.paw.y += this.pawKnockY * dt;
                const kd = Math.exp(-dt * 5.5);
                this.pawKnockX *= kd;
                this.pawKnockY *= kd;
                if (Math.hypot(this.pawKnockX, this.pawKnockY) < 8 * u) {
                    this.pawKnockX = 0;
                    this.pawKnockY = 0;
                }
            }
            /* Статистика теперь в панели над полем: лапке доступен весь экран,
         снизу — до столика со стаканчиком */ this.paw.x = Math.max(22 * u, Math.min(this.W - 22 * u, this.paw.x));
            this.paw.y = Math.max(46, Math.min(this.H - 42 * u, this.paw.y));
            /* Скорость лапки (px/с), сглаженная: быстрым махом в босс-бою пинаем попкорн */ const ivx = (this.paw.x - prevX) / Math.max(dt, 0.001);
            const ivy = (this.paw.y - prevY) / Math.max(dt, 0.001);
            const kv = Math.min(1, dt * 14);
            this.pawVX += (ivx - this.pawVX) * kv;
            this.pawVY += (ivy - this.pawVY) * kv;
        }
        if (this.perk === 'drift') this.driftPieces(dt);
        if (this.perk === 'magnet') this.magnetPull(dt);
        // Голубь-воришка: влетает с 3-го уровня и таскает попкорн из стаканчика
        this.updatePigeon(dt);
        // БОСС: малыш ловит пинки зерном, а Лане режем лапки свайпом
        this.updateBoss(dt);
        if (this.phase !== 'playing') return; // босс повержен: уровень уже завершён
        // Летящий попкорн (пнутый лапкой): полёт, отскоки, попадания в босса
        this.updateThrownPieces(dt);
        // Зёрна цыганки, летящие В ЭКРАН: растут в подлёте — шлепают по лапке
        this.updateGypsySeeds(dt);
        // КОГТИ ОНЛИФАНСИЯ: телеграф горит, потом УДАР СВЕРХУ — уведи лапку!
        this.updateLionSlams(dt);
        // БОЛЬШАЯ ПОПКОРНИНА: побег, обратный отсчёт и выход на поле по расписанию
        this.updateBig(dt);
        // ПОДАРОЧНАЯ КОРОБКА: появление, жизнь на поле, сбор лапкой
        this.updateGift(dt);
        // ОНЛИФАНСИЙ: грохот, въезд, 2 секунды страха, отъезд — без коллизий
        this.updateLionCameo(dt);
        // Радиус подбора зависит от перка лапки, скина и древа (геттер grabR)
        const grabR = this.grabR;
        // Подбор попкорна / ловушка-кукуруза. В шоке лапка ничего не берёт
        // и мины не задевает — стоит столбом, пока не отпустит
        for(let i = this.pieces.length - 1; i >= 0; i--){
            const p = this.pieces[i];
            if (this.stun > 0) break; // «опешила»: ни подбора, ни новых подрывов
            if (p.spawn > 0.12) continue;
            const d = Math.hypot(this.paw.x - p.x, this.paw.y - p.y);
            /* ТИР-АРКАНОИД: в босс-бою быстрый мах лапкой ПИНАЕТ зерно — оно летит
         и бивает малыша. Медленное касание — обычный подбор, как всегда */ if (this.boss && p.kind !== 'corn' && /* «Меткий пинок»: порог пинка ниже (−6% за ступень) */ Math.hypot(this.pawVX, this.pawVY) > FLING_MIN_SPEED * u * (1 - Math.min(0.24, this.tree.flingEase01 ?? 0)) && d < grabR + 12 * u) {
                p.vx = this.pawVX * 0.94;
                p.vy = this.pawVY * 0.94;
                p.spin = (Math.random() < 0.5 ? -1 : 1) * 7;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('shoo');
                this.crumbs(p.x, p.y, '#FFF3D6', 4);
                this.paw.pulse = 1;
                continue;
            }
            if (p.kind === 'corn') {
                /* «Парящая лапка»: пока действует парение, мины под лапкой
           не срабатывают — проплываем над ними как ни в чём не бывало */ if (this.hoverLeft > 0) continue;
                // Кукуруза-мина: чем толще мина, тем шире радиус задевания
                if (d < 38 * u * (0.7 + 0.3 * this.cornScale)) {
                    this.pieces.splice(i, 1);
                    /* Ударная волна взрыва: красное кольцо расходится от точки подрыва */ this.rings.push({
                        x: p.x,
                        y: p.y,
                        t: 0,
                        ttl: 0.45,
                        color: '255, 90, 78',
                        r0: 10 * u,
                        r1: 64 * u * (0.7 + 0.3 * this.cornScale)
                    });
                    if (this.fever) {
                        // Мина на лихорадке: весь накопленный там бонус сгорает!
                        this.feverEnd(false);
                        return;
                    }
                    const guard = (this.pawBonus.guard ?? 0) + (this.tree.guardAdd ?? 0);
                    if (guard > 0 && Math.random() < guard) {
                        // «Коготки-обереги»: мина обезврежена без штрафа
                        this.texts.push({
                            x: this.paw.x,
                            y: this.paw.y - 34 * u,
                            text: this.L('txt.guard'),
                            color: '#BFF3E6',
                            t: 0,
                            dur: 0.9,
                            size: 22 * u
                        });
                        this.crumbs(p.x, p.y, '#BFF3E6', 6);
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                    } else if (this.shieldLeft > 0) {
                        // «Кошачий щит»: мина прощена — щит лопается вместо штрафа
                        this.shieldLeft--;
                        this.shieldSaves++;
                        this.texts.push({
                            x: this.paw.x,
                            y: this.paw.y - 34 * u,
                            text: this.L('txt.shield'),
                            color: '#BFF3E6',
                            t: 0,
                            dur: 0.9,
                            size: 22 * u
                        });
                        this.crumbs(p.x, p.y, '#BFF3E6', 7);
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                        this.buzz(20);
                    } else {
                        // Лапка ударилась о мину: ШОК! Очки горят, всё, что несла,
                        // высыпается на пол, а сама лапка секунду стоит столбом
                        this.breakStreak(this.paw.x, this.paw.y - 44 * u); // мина сбрасывает комбо (или гасится бронёй)
                        this.shockDrop();
                        this.minesHit++;
                        this.levelShock++;
                        this.stun = Math.max(0.4, MINE_SHOCK_SECONDS - (this.tree.stunCut ?? 0));
                        this.score = Math.max(0, this.score - MINE_SCORE_PENALTY);
                        this.paw.hurt = 1.6;
                        this.doShake(9); // тряска экрана (отключается в настройках)
                        this.texts.push({
                            x: this.paw.x,
                            y: this.paw.y - 40 * u,
                            text: this.L('txt.shock', {
                                n: MINE_SCORE_PENALTY
                            }),
                            color: '#FF6B5E',
                            t: 0,
                            dur: 1.1,
                            size: 24 * u
                        });
                        this.crumbs(p.x, p.y, '#E5342E', 9);
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('penalty');
                        this.buzz([
                            60,
                            40,
                            100
                        ]);
                        /* Мина теперь ещё и бьёт по сердцам */ this.loseHeart('mine');
                    }
                }
                continue;
            }
            if (d < grabR && this.carried.length < this.carryMax) {
                this.pieces.splice(i, 1);
                this.carried.push({
                    kind: p.kind,
                    grabT: 0
                });
                this.runGrains++;
                if (p.kind === 'nipple') this.runNipples++;
                if (p.kind === 'golden') this.goldenCount++;
                this.paw.pulse = 1;
                this.crumbs(p.x, p.y, p.kind === 'golden' ? '#FFE066' : p.kind === 'caramel' ? '#FFC98A' : p.kind === 'butter' ? '#FFED9C' : p.kind === 'nipple' ? '#FFC2D9' : '#FFF3D6', 6);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play(p.kind === 'golden' ? 'golden' : 'pickup');
                this.buzz(p.kind === 'golden' ? 18 : 8);
            }
        }
        /* БОЛЬШАЯ ПОПКОРНИНА: мгновенный приз за касание — пока кольцо не закрылось.
       В шоке лапка не ловит: стоит столбом, пока приз убегает */ if (this.big && this.stun <= 0) {
            const db = Math.hypot(this.paw.x - this.big.x, this.paw.y - this.big.y);
            if (db < grabR + 30 * u) this.catchBig();
        }
        // Высыпание в стаканчик (с перком «Двойной стаканчик» — с дальнего подлёта).
        // В шоке лапка не сдаёт — несла в клюв... несла в лапке, уронила на мину
        if (this.carried.length > 0 && this.stun <= 0) {
            const dc = Math.hypot(this.paw.x - this.cup.x, this.paw.y - this.cup.y);
            const dropR = this.perk === 'secondcup' ? 118 * u : 78 * u;
            if (dc < dropR) {
                let base = 0;
                let hasGold = false;
                let goldN = 0;
                for (const c of this.carried){
                    base += KIND_POINTS[c.kind];
                    hasGold = hasGold || c.kind === 'golden';
                    if (c.kind === 'golden') goldN++;
                }
                this.streak++;
                const cm = this.comboMult;
                const mult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$perks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["perkScoreMult"])(this.perk) * cm * (1 + (this.tree.grainMult01 ?? 0)) * /* Множитель из подарочной коробки ×2/×5/×10 */ (this.multLeft > 0 ? this.multValue : 1);
                const sum = base * mult;
                this.collected += this.carried.length;
                this.carried.forEach((c, i)=>{
                    this.flying.push({
                        x0: this.paw.x + (i - 1) * 8 * u,
                        y0: this.paw.y - 20 * u - i * 10 * u,
                        kind: c.kind,
                        t: 0
                    });
                });
                this.carried = [];
                this.score += sum;
                /* «Золотая сдача»: +N монеток за каждое золотое зерно (компонент выплатит с множителями) */ const gc = goldN * Math.max(0, Math.floor(this.tree.goldCoinPer ?? 0));
                if (gc > 0) this.goldCoinsRun += gc;
                this.cup.squash = 1;
                if (hasGold) this.cupGlow = 1; // искра над стаканчиком
                this.texts.push({
                    x: this.cup.x,
                    y: this.cup.y - this.cupH * 0.8,
                    text: cm > 1 ? `+${Math.round(sum)} ×${cm}` : `+${Math.round(sum)}`,
                    color: hasGold || sum >= 80 || cm > 1 ? '#FFC93C' : '#FFFFFF',
                    t: 0,
                    dur: 0.9,
                    size: 26 * u
                });
                /* Рулетка «Фарта лихорадки» из древа: сдача зерна может внезапно
           запустить ЛИХОРАДКУ. Откладываем до конца кадра — старт лихорадки
           очищает массивы, которые сейчас обходит цикл сдачи */ if (!this.fever && !this.boss && this.feverAfter < 0 && this.pendingClear < 0 && (this.tree.feverLuck ?? 0) > 0 && Math.random() < (this.tree.feverLuck ?? 0)) {
                    this.pendingFever = true;
                }
                if (cm > 1) {
                    this.texts.push({
                        x: this.paw.x,
                        y: this.paw.y - 44 * u,
                        text: this.L('txt.combo', {
                            n: cm
                        }),
                        color: '#FFE066',
                        t: 0,
                        dur: 1,
                        size: 24 * u
                    });
                }
                if (this.fever) {
                    /* «Жаркий урожай»: очки в ЛИХОРАДКЕ +10% за ступень */ this.fever.gained += Math.round(sum * (1 + (this.tree.feverMult01 ?? 0)));
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('coin');
                } else {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('deposit');
                }
                this.buzz(12);
            }
        }
        // Летящие в стаканчик зёрна: каждое приземление — «плюх» и лёгкий подскок
        for(let i = this.flying.length - 1; i >= 0; i--){
            const f = this.flying[i];
            f.t += dt / 0.3;
            if (f.t >= 1) {
                this.flying.splice(i, 1);
                this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.5, '#FFF6EC', 3);
                // Звук падения зёрнышка на дно (у дорогих — повыше и со искрой)
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play(f.kind === 'golden' || f.kind === 'butter' ? 'plopGold' : 'plop');
                this.cup.squash = Math.min(1, Math.max(this.cup.squash, 0.35));
            }
        }
        /* Наполнение стаканчика: синхронизируем анимацию зёрен с прогрессом нормы */ const fillN = Math.min(CUP_FILL_POS.length, this.quota > 0 ? Math.ceil(this.collected / this.quota * CUP_FILL_POS.length) : 0);
        if (fillN !== this.lastFill) {
            for(let i = this.lastFill; i < fillN; i++)this.fillPop[i] = 0; // новые зёрна — с пружинкой
            this.fillPop.length = Math.max(this.fillPop.length, fillN);
            this.lastFill = fillN;
        }
        /* Лихорадка: дождь монеток на фоне и подсыпка зёрен, чтобы экран
       оставался полным до конца трёх секунд */ if (this.fever) {
            this.fever.coinT -= dt;
            if (this.fever.coinT <= 0) {
                this.fever.coinT = 0.13;
                const c = this.particles.obtain();
                c.x = Math.random() * this.W;
                c.y = -8;
                c.vx = (Math.random() - 0.5) * 30 * u;
                c.vy = (110 + Math.random() * 90) * u;
                c.t = 0;
                c.ttl = 2.4;
                c.color = Math.random() < 0.5 ? '#FFE066' : '#FFC93C';
                c.size = (3.5 + Math.random() * 2.5) * u;
            }
            let food = 0;
            for (const p of this.pieces)if (p.kind !== 'corn') food++;
            if (food < 12) this.spawnFeverTop();
        }
        /* Волшебная лапка: шлейф звёздочек сыплется из меха */ if (this.pawBonus.stars) {
            this.starT -= dt;
            if (this.starT <= 0) {
                this.starT = 0.09;
                const starColors = [
                    '#FFE066',
                    '#FFF6EC',
                    '#FFC93C'
                ];
                const c = this.particles.obtain();
                c.x = this.paw.x + (Math.random() - 0.5) * 14 * u;
                c.y = this.paw.y + 20 * u + (Math.random() - 0.5) * 8 * u;
                c.vx = (Math.random() - 0.5) * 26 * u;
                c.vy = 46 * u;
                c.t = 0;
                c.ttl = 0.65;
                c.color = starColors[Math.floor(Math.random() * starColors.length)] ?? '#FFE066';
                c.size = (2 + Math.random() * 2) * u;
            }
        }
        if (!this.fever && this.feverAfter < 0) {
            // Вся волна собрана → следующая. Кукуруза-мины НЕ мешает: считаем только попкорн
            const hasPopcorn = this.pieces.some((p)=>p.kind !== 'corn');
            if (this.waveDelay < 0 && !hasPopcorn && this.carried.length === 0 && this.flying.length === 0) {
                this.waveDelay = this.baseWaveDelay;
            }
            if (this.waveDelay >= 0) {
                this.waveDelay -= dt;
                if (this.waveDelay <= 0) {
                    this.waveDelay = -1;
                    this.wave++;
                    this.banner = {
                        text: this.L('banner.wave', {
                            n: this.wave
                        }),
                        t: 0
                    };
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('wave');
                    this.spawnWave();
                }
            }
            // Норма выполнена → короткая пауза (зёрна долетают) → уровень пройден
            if (this.pendingClear < 0 && this.collected >= this.quota) {
                this.pendingClear = CLEAR_DELAY;
            }
            if (this.pendingClear >= 0) {
                this.pendingClear -= dt;
                if (this.pendingClear <= 0) {
                    this.levelComplete();
                    return;
                }
            }
        }
        // Музыка зависит от оставшегося времени: >30с база, ≤30с +25%, ≤15с +40%, ≤5с 240 BPM.
        // В лихорадке — максимальный накал: бешеный темп под звон автоматов!
        const stage = this.fever ? 3 : this.timeLeft > 30 ? 0 : this.timeLeft > 15 ? 1 : this.timeLeft > 5 ? 2 : 3;
        if (stage !== this.audioStage) {
            this.audioStage = stage;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].setIntensity(stage);
        }
        // Таймер («Черепаший час» тикает на четверть медленнее)
        /* ПОДАРОК-множитель и «Парящая лапка» тикают вниз;
       «Фриз» морозит таймер этапа — время как будто остановилось */ if (this.multLeft > 0) {
            this.multLeft = Math.max(0, this.multLeft - dt);
            if (this.multLeft <= 0) this.multValue = 1;
        }
        if (this.hoverLeft > 0) this.hoverLeft = Math.max(0, this.hoverLeft - dt);
        if (this.freezeLeft > 0) {
            this.freezeLeft = Math.max(0, this.freezeLeft - dt);
        } else {
            this.timeLeft -= dt * (this.perk === 'slowmo' ? 0.75 : 1);
        }
        const sec = Math.max(0, Math.ceil(this.timeLeft));
        if (sec !== this.lastSec) {
            this.lastSec = sec;
            if (sec <= 5 && sec > 0 && !this.fever && this.feverAfter < 0) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('tick');
        }
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            if (this.fever) {
                // Время лихорадки вышло: всё собранное остаётся в счёте!
                this.feverEnd(true);
                return;
            }
            this.end();
            return;
        }
        // Косметика
        this.paw.pulse = Math.max(0, this.paw.pulse - dt * 5);
        this.paw.hurt = Math.max(0, this.paw.hurt - dt * 2.2);
        this.stun = Math.max(0, this.stun - dt);
        this.cup.squash = Math.max(0, this.cup.squash - dt * 4);
        this.cupGlow = Math.max(0, this.cupGlow - dt * 1.6);
        this.shakeT = Math.max(0, this.shakeT - dt);
        if (this.shakeT <= 0) this.shakeAmp = 0;
        this.updateCosmetics(dt);
    }
    /** Косметика кадра: баннер, таймеры декора, частицы, кольца, пылинки,
      след лапки, всплывающие тексты. Живёт и в игре, и в паузе-праздновании
      'clear' — иначе салют и «ПРОЙДЕН!» замрут на первом же кадре */ updateCosmetics(dt) {
        const u = this.u;
        this.banner.t += dt;
        for (const p of this.pieces){
            p.spawn = Math.max(0, p.spawn - dt);
            p.rot += p.spin * dt;
        }
        for (const c of this.carried)c.grabT = Math.min(1, c.grabT + dt * 8);
        for(let i = 0; i < this.fillPop.length; i++)this.fillPop[i] += dt;
        /* Пылинки: ленивый дрейф вверх с покачиванием — фон «дышит».
       Создаём лениво при первом кадре, когда известны размеры поля */ if (this.motes.length === 0 && this.W > 0 && this.perfTier < 2) {
            const n = Math.max(8, Math.min(16, Math.round(this.W / 34)));
            for(let i = 0; i < n; i++){
                this.motes.push({
                    x: Math.random() * this.W,
                    y: Math.random() * this.H,
                    ph: Math.random() * Math.PI * 2,
                    sp: (5 + Math.random() * 9) * u,
                    r: (1 + Math.random() * 1.6) * u,
                    a: 0.05 + Math.random() * 0.07
                });
            }
        }
        for (const m of this.motes){
            m.y -= m.sp * dt;
            m.x += Math.sin(m.ph + m.y * 0.013) * 7 * u * dt;
            if (m.y < 40) {
                m.y = this.H - 20;
                m.x = Math.random() * this.W;
            }
        }
        /* Кольца-волны: растут и гаснут */ for(let i = this.rings.length - 1; i >= 0; i--){
            const r = this.rings[i];
            if (!r) continue;
            r.t += dt;
            if (r.t >= r.ttl) this.rings.splice(i, 1);
        }
        /* Красная вспышка при потере сердца */ if (this.hurtT > 0) this.hurtT = Math.max(0, this.hurtT - dt);
        /* След лапки: точка добавляется при заметном сдвиге, живёт четверть секунды */ const lastTrail = this.trail[this.trail.length - 1];
        if (this.phase === 'playing' && this.perfTier < 2 && (!lastTrail || Math.hypot(this.paw.x - lastTrail.x, this.paw.y - lastTrail.y) > 26 * u)) {
            this.trail.push({
                x: this.paw.x,
                y: this.paw.y,
                t: 0
            });
            if (this.trail.length > 9) this.trail.shift();
        }
        for(let i = this.trail.length - 1; i >= 0; i--){
            const d = this.trail[i];
            if (!d) continue;
            d.t += dt;
            if (d.t >= 0.26) this.trail.splice(i, 1);
        }
        /* Частицы: обход с конца + swap-remove — без splice и без мусора */ for(let i = this.particles.length - 1; i >= 0; i--){
            const p = this.particles.items[i];
            p.t += dt;
            p.vy += 900 * u * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.t >= p.ttl) this.particles.release(i);
        }
        /* Тексты: компактируем живые на месте — тоже без splice/аллокаций */ let w = 0;
        for(let i = 0; i < this.texts.length; i++){
            const t = this.texts[i];
            t.t += dt;
            if (t.t < t.dur) this.texts[w++] = t;
        }
        this.texts.length = w;
    }
    levelComplete() {
        this.phase = 'clear';
        /* Праздничный баннер: «УРОВЕНЬ N ПРОЙДЕН!» — игрок видит результат,
       пока салют из стаканчика сыплет конфетти (пауза до нарезки 1.15с) */ this.banner = {
            text: this.L('banner.level', {
                n: this.lvl
            }) + ' ' + this.L('banner.clear'),
            t: 0
        };
        /* Бонус за оставшееся время: секунды ×5 (0.0.31: было ×10 — экономика строже) */ const bonus = Math.ceil(this.timeLeft) * 5;
        this.score += bonus;
        /* За пройденный уровень возвращается +1 сердечко (древо «Лапка-целитель» — больше) */ this.hearts = Math.min(this.maxHearts, this.hearts + 1 + (this.tree.healPlus ?? 0));
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].stopMusic();
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('levelwin');
        this.buzz([
            30,
            40,
            60
        ]);
        /* Победный салют из стаканчика + золотая ударная волна */ this.confettiBurst(this.cup.x, this.cup.y - this.cupH * 0.5, 34);
        this.rings.push({
            x: this.cup.x,
            y: this.cup.y,
            t: 0,
            ttl: 0.6,
            color: '255, 214, 92',
            r0: 20 * this.u,
            r1: 120 * this.u
        });
        this.emitStats(true);
        this.cb.onLevelComplete?.({
            level: this.lvl,
            score: Math.floor(this.score),
            bonus,
            clean: this.levelShock === 0 && this.levelStolen === 0,
            hearts: this.hearts,
            lostHearts: this.heartLost
        });
    }
    end(reason = 'time') {
        if (this.phase === 'ended') return; // поражение уже зафиксировано
        this.endReason = reason;
        this.phase = 'ended';
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].stopMusic();
        this.feverResume = null; // забег кончился — возобновлять нечего
        this.lionCameo = null; // лапа Онлифансия не переживает конец забега
        this.introHold = false;
        this.boss = null;
        this.seeds = []; // летящие в экран зёрна не переживают забег
        this.lionSlams = []; // когтистые удары — тоже
        if (reason === 'voluntary') {
            /* Победный финал по воле игрока: радостный джингл вместо траурного гудка */ __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('levelwin');
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('gameover');
            this.buzz([
                60,
                40,
                60,
                40,
                120
            ]);
        }
        this.emitStats(true);
        this.cb.onEnd?.({
            score: Math.floor(this.score),
            level: this.lvl,
            reason
        });
    }
    /** Потеря сердечка: мина, повторный клюв голубя, касание босса-малыша или
      шлепок зерном цыганки о экран. Ноль — поражение */ loseHeart(where) {
        if (this.phase !== 'playing' || this.hearts <= 0) return;
        const u = this.u;
        this.hearts--;
        this.heartLost++;
        const hx = where === 'boss' ? this.boss?.x ?? this.paw.x : where === 'mine' || where === 'gypsy' ? this.paw.x : this.cup.x;
        const hy = where === 'boss' ? this.boss?.y ?? this.paw.y : where === 'mine' || where === 'gypsy' ? this.paw.y - 64 * u : this.cup.y - this.cupH * 1.5;
        this.texts.push({
            x: hx,
            y: hy,
            text: this.L('txt.heart'),
            color: '#FF6B8A',
            t: 0,
            dur: 1.1,
            size: 24 * u
        });
        this.doShake(6);
        this.hurtT = 0.55; // красная вспышка по краям экрана
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('penalty');
        this.buzz([
            40,
            60
        ]);
        this.emitStats(true);
        if (this.hearts <= 0) this.end('hearts');
    }
    /** Разноцветное конфетти из точки (победа уровня, старт лихорадки):
      те же квадратные частицы, но пёстрые, крупные и живут дольше —
      гравитация в update() сама уронит их красиво дождём */ confettiBurst(x, y, n) {
        const u = this.u;
        const tierMul = this.perfTier === 0 ? 1 : this.perfTier === 1 ? 0.55 : 0.3;
        const count = Math.max(4, Math.round((this.coarse ? 0.7 : 1) * tierMul * n));
        const palette = [
            '#E24B3B',
            '#FFD166',
            '#7BC47F',
            '#F2A65A',
            '#FFE066',
            '#BFF3E6'
        ];
        for(let i = 0; i < count; i++){
            const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
            const sp = (180 + Math.random() * 260) * u;
            const c = this.particles.obtain();
            c.x = x;
            c.y = y;
            c.vx = Math.cos(a) * sp;
            c.vy = Math.sin(a) * sp;
            c.t = 0;
            c.ttl = 0.8 + Math.random() * 0.6;
            c.color = palette[Math.floor(Math.random() * palette.length)] ?? '#FFD166';
            c.size = (2.5 + Math.random() * 3) * u;
        }
    }
    crumbs(x, y, color, n) {
        const u = this.u;
        // На телефонах режем количество частиц — слабые GPU скажут спасибо.
        // Автокачество (perfTier) урезает ещё сильнее, если FPS просел
        const tierMul = this.perfTier === 0 ? 1 : this.perfTier === 1 ? 0.5 : 0.3;
        const count = Math.max(2, Math.round((this.coarse ? 0.65 : 1) * tierMul * n));
        for(let i = 0; i < count; i++){
            const a = Math.random() * Math.PI * 2;
            const sp = (60 + Math.random() * 120) * u;
            const c = this.particles.obtain();
            c.x = x;
            c.y = y;
            c.vx = Math.cos(a) * sp;
            c.vy = Math.sin(a) * sp - 60 * u;
            c.t = 0;
            c.ttl = 0.35 + Math.random() * 0.25;
            c.color = color;
            c.size = (2 + Math.random() * 2.5) * u;
        }
    }
    /** Лёгкая вибрация на телефоне: только по событиям, коротко и не чаще 80 мс.
      Полностью отключается в настройках. */ buzz(ms) {
        try {
            if (!this.opts.vibration) return;
            if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
            const now = performance.now();
            if (now - this.lastBuzzAt < 80) return;
            this.lastBuzzAt = now;
            navigator.vibrate(ms);
        } catch  {
        /* вибрация недоступна — не страшно */ }
    }
    /** Тряска экрана при минах и голубе (отключается в настройках) */ doShake(amp) {
        if (!this.opts.shake) return;
        this.shakeAmp = Math.max(this.shakeAmp, amp * this.u);
        this.shakeT = 0.3;
    }
    /* ================= голубь-воришка ================= */ /** Полоска здоровья воришки: на первых уровнях хватает ТРЁХ ударов лапкой,
      дальше голубь крепчает (ур. 5 → 4, ур. 9 → 5, потолок 9).
      Сложность из настроек: лёгкая −1, сложная +1 */ pigeonMaxHp() {
        let hp = Math.min(9, 3 + Math.floor((this.lvl - 1) / 4));
        if (this.opts.difficulty === 'easy') hp = Math.max(2, hp - 1);
        if (this.opts.difficulty === 'hard') hp = Math.min(10, hp + 1);
        return hp;
    }
    spawnPigeon() {
        const u = this.u;
        const side = Math.random() < 0.5 ? -1 : 1;
        const maxHp = this.pigeonMaxHp();
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
            downed: false
        };
        this.texts.push({
            x: this.W / 2,
            y: this.H * 0.22,
            text: this.L('txt.pigeon'),
            color: '#C8CFD8',
            t: 0,
            dur: 1.6,
            size: 26 * u
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('pigeon');
        this.buzz(30);
        this.doShake(4);
    }
    /** Голубь летит к стаканчику и таскает попкорн; каждое касание лапкой —
      урон. Набьёшь полоску жизни — повален: вернёт украденное и +{{n}} очков */ updatePigeon(dt) {
        if (!this.pigeon) {
            if (this.pigeonTimer > 0) {
                this.pigeonTimer -= dt;
                if (this.pigeonTimer <= 0) this.spawnPigeon();
            }
            return;
        }
        const u = this.u;
        const g = this.pigeon;
        g.stateT += dt;
        if (g.state === 'in') {
            const dx = g.hx - g.x;
            const dy = g.hy - g.y;
            const d = Math.hypot(dx, dy);
            /* Голуби стали вдвое быстрее — успей запугать, пока не расклевала корзину */ const step = 300 * u * dt;
            if (d <= step) {
                g.x = g.hx;
                g.y = g.hy;
                g.state = 'hover';
                g.stateT = 0;
            } else {
                g.x += dx / d * step;
                g.y += dy / d * step;
            }
        } else if (g.state === 'hover') {
            g.y += Math.sin(g.stateT * 6) * 12 * u * dt;
            g.peckT -= dt;
            if (g.peckT <= 0) {
                /* Чем выше уровень, тем чаще клюёт (2.2с → 1.2с) */ g.peckT = Math.max(1.2, PIGEON_PECK_EVERY - this.lvl * 0.05) + Math.random() * 0.8;
                this.pigeonPeck();
            }
        } else {
            // 'flee': улетает за тот же борт, откуда прилетел.
            // Поверженный — быстрее, выше и кувырком
            const speed = g.downed ? 430 : 320;
            const rise = g.downed ? 150 : 40;
            g.x += -g.side * speed * u * dt;
            g.y -= rise * u * dt;
            if (g.x < -60 * u || g.x > this.W + 60 * u) {
                this.pigeon = null;
                /* Чем выше уровень, тем чаще возвращаются воришки: ramp с ×1 (3-й ур.)
           до ×0.32. «Птичий базар» убыстряет сверх того. С 7-го уровня птичья
           стая: шанс 40%, что воришка вернётся уже через пару секунд */ const ramp = Math.max(0.32, 1 - (this.lvl - 3) * 0.07);
                let base = (PIGEON_RESPAWN[0] + Math.random() * (PIGEON_RESPAWN[1] - PIGEON_RESPAWN[0])) * ramp;
                if (this.perk === 'pigeonfeast') base *= 0.35;
                if (this.lvl >= 7 && Math.random() < 0.4) base = 1.5 + Math.random() * 1.5;
                this.pigeonTimer = base;
            }
        }
        /* Отлёт после удара: импульс гаснет, в парении воришка возвращается
       к своей точке над стаканчиком */ if (g.state !== 'flee') {
            g.x += g.kx * dt;
            g.y += g.ky * dt;
            const dec = Math.min(1, dt * 5);
            g.kx -= g.kx * dec;
            g.ky -= g.ky * dec;
            if (g.state === 'hover') {
                g.x += (g.hx - g.x) * Math.min(1, dt * 1.5);
                g.y += (g.hy - g.y) * Math.min(1, dt * 1.5);
            }
        }
        /* УДАР ЛАПКОЙ: каждое касание (или проведение через него) — минус
       одно деление жизни. Короткий кулдаун держит серию ударов равномерной,
       а вздрагивание откидывает голубя — просто держать лапку на нём мало */ g.hitCd -= dt;
        g.flash = Math.max(0, g.flash - dt * 3);
        if (g.state !== 'flee' && g.hitCd <= 0 && Math.hypot(this.paw.x - g.x, this.paw.y - g.y) < PIGEON_HIT_R * u) {
            g.hitCd = PIGEON_HIT_CD;
            g.hp--;
            g.flash = 1;
            g.peckT = Math.max(g.peckT, 0.55); // оглушён — мгновение не ворует
            const d = Math.hypot(g.x - this.paw.x, g.y - this.paw.y) || 1;
            g.kx = (g.x - this.paw.x) / d * 300 * u;
            g.ky = (g.y - this.paw.y) / d * 300 * u;
            this.paw.pulse = 1;
            this.crumbs(g.x, g.y, '#E8E4DC', 7); // перья полетели
            if (g.hp <= 0) {
                // ПОВЕРЖЕН! Улетает кувырком, возвращая всё украденное в стаканчик.
                // «Птичий базар»: воришек больше — но и награда вдвое жирнее
                g.state = 'flee';
                g.downed = true;
                g.stateT = 0;
                this.pigeonsRun++;
                const ko = this.perk === 'pigeonfeast' ? PIGEON_KO_BONUS * 2 : PIGEON_KO_BONUS;
                this.score += ko;
                if (g.stolen > 0) {
                    this.collected += g.stolen;
                    for(let i = 0; i < g.stolen; i++){
                        this.flying.push({
                            x0: g.x + (Math.random() - 0.5) * 36 * u,
                            y0: g.y + (Math.random() - 0.5) * 24 * u,
                            kind: 'popcorn',
                            t: 0
                        });
                    }
                    g.stolen = 0;
                }
                this.texts.push({
                    x: g.x,
                    y: g.y - 34 * u,
                    text: this.L('txt.downed', {
                        n: ko
                    }),
                    color: '#FFE066',
                    t: 0,
                    dur: 1.2,
                    size: 26 * u
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('meow'); // кошка своего добилась!
                this.doShake(5);
                this.buzz([
                    30,
                    30,
                    60
                ]);
            } else {
                this.texts.push({
                    x: g.x,
                    y: g.y - 34 * u,
                    text: this.L('txt.hit'),
                    color: '#FFFFFF',
                    t: 0,
                    dur: 0.55,
                    size: 20 * u
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('shoo');
                this.buzz(15);
            }
        }
    }
    pigeonPeck() {
        const u = this.u;
        if (!this.pigeon) return;
        if (this.collected > 0) {
            const g = this.pigeon;
            /* Воришка становится наглее с уровнем: с 6-го тащит по 2 зерна,
         с 11-го — по 3, с 16-го — по 4 за клюв (1 + floor((lvl-1)/5)).
         «Мир с голубем»: тащит на 1 зерно меньше за ступень, но не меньше 1 */ const steal = Math.min(this.collected, Math.max(1, 1 + Math.floor((this.lvl - 1) / 5) - (this.tree.pigeonStealCut ?? 0)));
            this.collected -= steal;
            g.stolen += steal;
            g.pecks++; // со второго клюва — минус сердечко
            this.levelStolen++; // ачивка «Чистая работа» сгорела
            this.breakStreak(this.cup.x, this.cup.y - this.cupH * 0.9); // воришка сбивает серию (или гасится бронёй)
            this.pendingClear = -1; // украденное зерно отменяет близкое «уровень пройден»
            this.cup.squash = 1;
            this.doShake(5);
            this.texts.push({
                x: this.cup.x,
                y: this.cup.y - this.cupH * 0.9,
                text: this.L('txt.stole'),
                color: '#FF6B5E',
                t: 0,
                dur: 1,
                size: 26 * u
            });
            this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.4, '#C8CFD8', 6);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('penalty');
            this.buzz(40);
            /* Разграбленная корзина: унесли всё до последнего зерна — поражение */ if (this.collected <= 0) {
                this.end('ransacked');
                return;
            }
            /* Повторный клюв по корзине — минус сердечко */ if (g.pecks >= 2) this.loseHeart('pigeon');
        } else {
            this.texts.push({
                x: this.cup.x,
                y: this.cup.y - this.cupH * 0.9,
                text: this.L('txt.empty'),
                color: '#C8CFD8',
                t: 0,
                dur: 0.8,
                size: 20 * u
            });
        }
    }
    /** Лапка ударилась о мину: всё, что она несла, высыпается на пол рядом —
      зёрна не пропадают, их можно снова собрать, когда шок отпустит.
      На другие мины зёрна не кладём — не подставляем игрока дважды */ shockDrop() {
        const u = this.u;
        const mX = 40 * u;
        const top = 52;
        const bottom = this.H - 56 * u;
        const dropped = this.carried;
        this.carried = [];
        for (const c of dropped){
            let placed = false;
            for(let tries = 0; tries < 14 && !placed; tries++){
                const a = Math.random() * Math.PI * 2;
                const r = (36 + Math.random() * 52) * u;
                const x = Math.max(mX, Math.min(this.W - mX, this.paw.x + Math.cos(a) * r));
                const y = Math.max(top, Math.min(bottom, this.paw.y + Math.sin(a) * r));
                const onMine = this.pieces.some((q)=>q.kind === 'corn' && Math.hypot(x - q.x, y - q.y) < 34 * u);
                if (!onMine) {
                    this.pieces.push({
                        x,
                        y,
                        rot: (Math.random() - 0.5) * 0.9,
                        kind: c.kind,
                        phase: Math.random() * Math.PI * 2,
                        spawn: 0.3,
                        spin: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.5),
                        dA: 0
                    });
                    placed = true;
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
                    dA: 0
                });
            }
        }
    }
    /* ================= босс «МАЛЫШ» ================= */ /** Жизни босса: у первого (10-й уровень) 3, у каждого следующего +1.
      Лев на +1 крепче — грива держит удар. Сложность из настроек:
      лёгкая −1, сложная +1 */ bossMaxHp() {
        const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY));
        const kind = bossKindForTier(tier);
        let hp = BOSS_BASE_HP + (tier - 1) * BOSS_HP_PER_TIER + BOSS_HP_BY_KIND[kind];
        if (this.opts.difficulty === 'easy') hp = Math.max(2, hp - 1);
        if (this.opts.difficulty === 'hard') hp += 1;
        return hp;
    }
    spawnBoss() {
        const u = this.u;
        const maxHp = this.bossMaxHp();
        const tier = bossTierForLevel(this.lvl);
        const kind = bossKindForTier(tier);
        /* Запоминаем запас сердец на момент появления — ачивка «Неприкасаемый»
        сравнит его с запасом на момент победы */ this.bossHeartsAtSpawn = this.hearts;
        /* Голубь прилетает сбоку (side), остальные являются сверху */ const side = Math.random() < 0.5 ? -1 : 1;
        this.boss = {
            x: this.W / 2,
            y: -80 * u,
            vx: 0,
            vy: 0,
            hp: maxHp,
            maxHp,
            kind,
            state: 'in',
            stateT: 0,
            atkT: BOSS_CHARGE_BASE - BOSS_ATTACK_CUT_BY_KIND[kind],
            flash: 0,
            invuln: 0,
            wobble: Math.random() * Math.PI * 2,
            swing: 0,
            roarT: LION_ROAR_EVERY,
            roar: 0,
            deflectCd: 0,
            paws: [],
            pawT: 2,
            side,
            hx: this.cup.x - side * PIGEON_BOSS_HOVER_DX * u,
            hy: Math.max(90, this.cup.y - PIGEON_BOSS_HOVER_DY * u),
            loot: 0,
            slamT: LION_SLAM_FIRST
        };
        if (kind === 'pigeon') {
            /* Птица влетает с борта на высоте парения */ this.boss.x = side < 0 ? -100 * u : this.W + 100 * u;
            this.boss.y = Math.max(90, this.cup.y - PIGEON_BOSS_HOVER_DY * u);
        }
        /* У каждого вида своя явка и своё предупреждение */ if (kind === 'lion') {
            this.banner = {
                text: this.L('banner.bossLion'),
                t: 0
            };
            this.texts.push({
                x: this.W / 2,
                y: this.H * 0.32,
                text: this.L('txt.bossWarnLion'),
                color: '#FFC93C',
                t: 0,
                dur: 2.6,
                size: 22 * u
            });
        } else if (kind === 'marten') {
            this.banner = {
                text: this.L('banner.bossMarten'),
                t: 0
            };
            this.texts.push({
                x: this.W / 2,
                y: this.H * 0.32,
                text: this.L('txt.bossWarnMarten'),
                color: '#E2B98A',
                t: 0,
                dur: 2.6,
                size: 22 * u
            });
        } else if (kind === 'pigeon') {
            this.banner = {
                text: this.L('banner.bossPigeon'),
                t: 0
            };
            this.texts.push({
                x: this.W / 2,
                y: this.H * 0.32,
                text: this.L('txt.bossWarnPigeon'),
                color: '#C8CFD8',
                t: 0,
                dur: 2.8,
                size: 22 * u
            });
        } else if (kind === 'gypsy') {
            this.banner = {
                text: this.L('banner.bossGypsy'),
                t: 0
            };
            this.texts.push({
                x: this.W / 2,
                y: this.H * 0.32,
                text: this.L('txt.bossWarnGypsy'),
                color: '#FFC93C',
                t: 0,
                dur: 2.8,
                size: 22 * u
            });
        } else {
            this.banner = {
                text: this.L('banner.boss'),
                t: 0
            };
            this.texts.push({
                x: this.W / 2,
                y: this.H * 0.32,
                text: this.L('txt.bossWarn'),
                color: '#FF8FA3',
                t: 0,
                dur: 2.4,
                size: 23 * u
            });
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('pigeon');
        this.buzz([
            30,
            40,
            80
        ]);
        this.doShake(6);
        this.emitStats(true);
    }
    /** МЕГА-ГОЛУБЬ: мировые координаты ГЛАЗ-уязвимостей. Единая формула для
      боя и рендера — хитбоксы всегда совпадают с нарисованными глазами.
      В клевке голова выбрасывается вперёд — глаза уходят с места */ pigeonEyePoints(b) {
        const u = this.u;
        const R = PIGEON_BOSS_R * u;
        const face = this.cup.x > b.x ? 1 : -1 // клюв смотрит на корзину
        ;
        const lunge = (b.state === 'swat' ? b.swing : b.state === 'charge' ? 0.25 : 0) * R * 0.55;
        const bob = Math.sin(b.wobble) * 3 * u;
        const hx = b.x + face * (R * 0.72 + lunge);
        const hy = b.y + bob - R * 0.5;
        return [
            {
                x: hx + face * R * 0.14,
                y: hy - R * 0.05,
                r: PIGEON_BOSS_EYE_R * u
            },
            {
                x: hx - face * R * 0.14,
                y: hy + R * 0.13,
                r: PIGEON_BOSS_EYE_R * 0.8 * u
            }
        ];
    }
    /** Босс живёт своей жизнью: бродит по верхней половине, по таймеру РВЁТСЯ
      к корзине и выгребает попкорн. Касание лапкой — сердечко слетает.
      МАЛЫШ ловит пинки зерном, ЛАНА мелькает рывками-дэшами и тянет к
      корзинке длинные лапки с когтями — РЕЖЬ их свайпом лапки, а ГОЛУБЮ
      выбивай ГЛАЗА точными махами! */ updateBoss(dt) {
        const b = this.boss;
        if (!b) return;
        const u = this.u;
        b.stateT += dt;
        b.flash = Math.max(0, b.flash - dt * 3);
        b.invuln = Math.max(0, b.invuln - dt);
        b.swing = Math.max(0, b.swing - dt * 2.2);
        b.deflectCd = Math.max(0, b.deflectCd - dt);
        b.wobble += dt * (b.state === 'charge' ? 15 : 6.5);
        if (b.state === 'in') {
            if (b.kind === 'pigeon') {
                // птица ВЛЕТАЕТ с борта к своему якорю парения
                const dx = b.hx - b.x;
                const dy = b.hy - b.y;
                const d = Math.hypot(dx, dy);
                const step = PIGEON_BOSS_IN_SPEED * u * dt;
                if (d <= step) {
                    b.x = b.hx;
                    b.y = b.hy;
                    b.state = 'wander';
                    b.stateT = 0;
                    b.atkT = BOSS_CHARGE_BASE - BOSS_ATTACK_CUT_BY_KIND[b.kind];
                } else {
                    b.x += dx / d * step;
                    b.y += dy / d * step;
                }
            } else {
                // вламывается сверху к своей зоне бродяжничества
                const ty = this.H * 0.3;
                b.y += 230 * u * dt;
                if (b.y >= ty) {
                    b.y = ty;
                    b.state = 'wander';
                    b.stateT = 0;
                    b.atkT = BOSS_CHARGE_BASE - BOSS_ATTACK_CUT_BY_KIND[b.kind];
                }
            }
        } else if (b.state === 'wander') {
            if (b.kind === 'pigeon') {
                // ГОЛУБЬ ПАРИТ у своего якоря, лениво покачиваясь, — ждёт пикирования.
                // Тянемся к якорю, покачивание добавляет живости сверху
                const k = Math.min(1, dt * 1.8);
                b.x += (b.hx - b.x) * k;
                b.y += (b.hy - b.y) * k;
                b.y += Math.sin(b.stateT * 5.2) * 10 * u * dt;
            } else {
                // неторопливо бродит и меняет направление — в него ещё надо попасть.
                // ЛАНА бегает вдвое быстрее и мелькает короткими рывками-дэшами
                if (b.vx === 0 && b.vy === 0) {
                    const a = Math.random() * Math.PI * 2;
                    const sp = (b.kind === 'marten' ? MARTEN_DASH_SPEED : 62) * u;
                    b.vx = Math.cos(a) * sp;
                    b.vy = Math.sin(a) * sp * 0.72;
                }
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                const mX = (b.kind === 'marten' ? 40 : 62) * u // Лана мелькает у самых краёв
                ;
                const top = 84;
                const bottom = this.H * 0.55;
                if (b.x < mX || b.x > this.W - mX) {
                    b.vx *= -1;
                    b.x = Math.max(mX, Math.min(this.W - mX, b.x));
                }
                if (b.y < top || b.y > bottom) {
                    b.vy *= -1;
                    b.y = Math.max(top, Math.min(bottom, b.y));
                }
                if (b.stateT > (b.kind === 'marten' ? MARTEN_DASH_STEP : 1.7)) {
                    b.vx = 0;
                    b.vy = 0;
                    b.stateT = 0;
                }
            }
            /* ЛАНА сама к корзинке не рвётся — за неё тянутся лапки (ниже).
         ГОЛУБЬ парит и ПИКИРУЕТ клюнуть по таймеру как все,
         ЦЫГАНКА ныряет к РАССЫПАННЫМ зёрнам на полу */ if (b.kind === 'gypsy') {
                b.atkT -= dt;
                if (b.atkT <= 0) {
                    // НЫРОК ЗА ЗЁРНАМИ: цель — случайное ЛЕЖАЩЕЕ зерно на поле.
                    // Красть нечего — не ныряет: зависнет и кидает «ИЗ РУКАВА»
                    const loose = this.pieces.filter((p)=>(p.vx ?? 0) === 0 && p.spawn <= 0.12);
                    if (loose.length > 0) {
                        const tgt = loose[Math.floor(Math.random() * loose.length)];
                        if (tgt) {
                            b.hx = tgt.x;
                            b.hy = tgt.y;
                            const d = Math.hypot(b.hx - b.x, b.hy - b.y) || 1;
                            const sp = GYPSY_DIVE_SPEED * u * BOSS_CHARGE_MULT_BY_KIND[b.kind];
                            b.vx = (b.hx - b.x) / d * sp;
                            b.vy = (b.hy - b.y) / d * sp;
                            b.state = 'charge';
                            b.stateT = 0;
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('pigeon');
                        }
                    } else {
                        b.state = 'throw';
                        b.stateT = 0;
                        b.atkT = 0.4;
                        b.vx = 0;
                        b.vy = 0;
                    }
                }
            } else if (b.kind !== 'marten') {
                b.atkT -= dt;
                if (b.atkT <= 0) {
                    // РЫВОК К КОРЗИНЕ: каждый следующий босс злее и быстрее
                    const tier = bossTierForLevel(this.lvl);
                    b.state = 'charge';
                    b.stateT = 0;
                    const d = Math.hypot(this.cup.x - b.x, this.cup.y - b.y) || 1;
                    const sp = (155 + tier * 26) * u * BOSS_CHARGE_MULT_BY_KIND[b.kind];
                    b.vx = (this.cup.x - b.x) / d * sp;
                    b.vy = (this.cup.y - b.y) / d * sp;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play(b.kind === 'pigeon' ? 'pigeon' : 'fever');
                }
            }
            /* ЛЕВ: таймер рокта — в бродяжничестве набирается, до рывка не доходит,
         если рокт созрел раньше */ if (b.kind === 'lion') {
                b.roarT -= dt;
                if (b.roarT <= 0) {
                    b.state = 'roar';
                    b.stateT = 0;
                    b.roar = LION_ROAR_DUR;
                    b.vx = 0;
                    b.vy = 0;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('roar');
                    this.doShake(5);
                    this.buzz([
                        20,
                        60,
                        120
                    ]);
                    this.texts.push({
                        x: b.x,
                        y: b.y - 70 * u,
                        text: this.L('txt.roar'),
                        color: '#FFC93C',
                        t: 0,
                        dur: 1,
                        size: 26 * u
                    });
                    this.crumbs(b.x, b.y, '#FFC93C', 10);
                }
                /* v0.0.46: КОГТИ СВЕРХУ — целится в текущее место лапки. Круг горит
           LION_SLAM_TELE секунд, потом УДАР: не увёл лапку — сердечко и стан */ b.slamT -= dt;
                if (b.slamT <= 0) {
                    const tier = bossTierForLevel(this.lvl);
                    this.lionSlams.push({
                        x: this.paw.x,
                        y: this.paw.y,
                        t: 0
                    });
                    b.slamT = Math.max(3.2, LION_SLAM_EVERY - tier * 0.12) + Math.random() * 0.5;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('claw');
                    this.texts.push({
                        x: b.x,
                        y: b.y - 96 * u,
                        text: this.L('txt.lionClaws'),
                        color: '#FF8FA3',
                        t: 0,
                        dur: 1.1,
                        size: 22 * u
                    });
                }
            }
        } else if (b.state === 'roar') {
            // ЛЕВ РОКТУЕТ: грива-щит отбивает зёрна, лапку сносит волной.
            // Зверь стоит на месте и требует уважения — полсекунды терпения!
            b.roar -= dt;
            const d = Math.hypot(this.paw.x - b.x, this.paw.y - b.y) || 1;
            /* Отброс лапки волной — она затухает в общем ходу лапки (pawKnock) */ this.pawKnockX = (this.paw.x - b.x) / d * LION_ROAR_PUSH * u;
            this.pawKnockY = (this.paw.y - b.y) / d * LION_ROAR_PUSH * u;
            if (b.roar <= 0) {
                b.state = 'wander';
                b.stateT = 0;
                b.roar = 0;
                b.roarT = LION_ROAR_EVERY + Math.random() * 1.2;
                b.vx = 0;
                b.vy = 0;
            }
        } else if (b.state === 'charge') {
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            /* МАЛЫШ/ЛЬВ/ГОЛУБЬ добрались до корзины; ЦЫГАНКА — до точки нырка */ const arrived = b.kind === 'gypsy' ? Math.hypot(b.x - b.hx, b.y - b.hy) < 30 * u : Math.hypot(b.x - this.cup.x, b.y - this.cup.y) < 74 * u;
            if (arrived) {
                b.state = 'swat';
                b.stateT = 0;
                b.swing = 1;
                if (b.kind === 'gypsy') this.gypsyGrab();
                else this.bossSwat();
            }
        } else if (b.state === 'swat') {
            // клюёт/гребёт из корзины полсекунды — потом пятится и снова бродит;
            // ЦЫГАНКА сгребает быстрее и переходит к БРОСКАМ В ЭКРАН
            if (b.stateT > (b.kind === 'gypsy' ? 0.3 : 0.55)) {
                if (b.kind === 'gypsy') {
                    b.state = 'throw';
                    b.stateT = 0;
                    b.atkT = 0.35;
                    b.vx = 0;
                    b.vy = 0;
                } else {
                    b.state = 'wander';
                    b.stateT = 0;
                    b.atkT = Math.max(2.3, BOSS_CHARGE_BASE - bossTierForLevel(this.lvl) * 0.35) + Math.random() * 0.7 - BOSS_ATTACK_CUT_BY_KIND[b.kind];
                    const d = Math.hypot(b.x - this.cup.x, b.y - this.cup.y) || 1;
                    if (b.kind === 'pigeon') {
                        // клювнул — и отскакивает вверх, обратно в парение
                        b.vx = (b.x - this.cup.x) / d * 130 * u;
                        b.vy = -300 * u;
                    } else {
                        b.vx = (b.x - this.cup.x) / d * 130 * u;
                        b.vy = (b.y - this.cup.y) / d * 130 * u;
                    }
                }
            }
        } else if (b.state === 'throw') {
            // ЦЫГАНКА висит над местом добычи и швыряет украденные зёрна В ЭКРАН,
            // одно за другим. Кончилась добыча — злой бросок «ИЗ РУКАВА» —
            // и обратно к бродяжничеству
            const hoverK = Math.min(1, dt * 2);
            b.x += (b.hx - b.x) * hoverK;
            b.y += (b.hy - b.y) * hoverK;
            b.atkT -= dt;
            if (b.atkT <= 0) {
                if (b.loot > 0) {
                    b.loot--;
                    b.swing = 1;
                    this.gypsyThrow();
                    if (b.loot === 0) {
                        b.loot = -1; // маркер: очередь пуста — после прощального замаха уходит
                        b.atkT = 0.45;
                    } else {
                        b.atkT = GYPSY_THROW_CD;
                    }
                } else {
                    if (b.loot === 0) {
                        // украла ноль — всё равно не скучаем: бросок «ИЗ РУКАВА»
                        b.loot = -1;
                        b.swing = 1;
                        this.texts.push({
                            x: b.x,
                            y: b.y - GYPSY_R * u * 1.3,
                            text: this.L('txt.gypsySleeve'),
                            color: '#FFC93C',
                            t: 0,
                            dur: 1,
                            size: 21 * u
                        });
                        this.gypsyThrow();
                    }
                    b.state = 'wander';
                    b.stateT = 0;
                    b.vx = 0;
                    b.vy = 0;
                    b.atkT = Math.max(2.6, BOSS_CHARGE_BASE - bossTierForLevel(this.lvl) * 0.35) + Math.random() * 0.7 - BOSS_ATTACK_CUT_BY_KIND[b.kind];
                }
            }
        } else if (b.state === 'hurt') {
            // отшатнулся от пинка, тормозит — потом снова бродит
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            const dec = Math.max(0, 1 - dt * 4.5);
            b.vx *= dec;
            b.vy *= dec;
            const mX = 62 * u;
            b.x = Math.max(mX, Math.min(this.W - mX, b.x));
            b.y = Math.max(60, Math.min(this.H - 120 * u, b.y));
            if (b.stateT > 0.5) {
                b.state = 'wander';
                b.stateT = 0;
                b.vx = 0;
                b.vy = 0;
            }
        } else if (b.state === 'flee') {
            // побеждён: уплывает вверх, покачиваясь из стороны в сторону
            b.y -= 300 * u * dt;
            b.x += Math.sin(b.stateT * 9) * 40 * u * dt;
            if (b.y < -110 * u) {
                this.boss = null;
                this.bossDefeated();
            }
            return;
        }
        /* ЛАНА: лапки тянутся к корзинке, растут и РЕЖУТСЯ свайпом
       ('flee' вышел выше по return — лапки при победе уже убраны) */ if (b.kind === 'marten') this.updateLanaPaws(dt);
        /* МЕГА-ГОЛУБЬ: тело птицы НЕУЯЗВИМО, и сердечек за касание не слетает —
       лапка и должна её трогать. Урон — ТОЛЬКО точный удар лапкой ПО ГЛАЗУ:
       свайп-сегмент кадра или сама лапка в радиусе глаза. Промах по телу
       подсказывает, куда целить. У глаз общий с касанием кулдаун (invuln).
       Целиться можно в парении, пике, клевке и «вздрагивании» ('in'/'flee'
       птица недоступна — летит) */ const pigeonVulnerable = b.state === 'wander' || b.state === 'charge' || b.state === 'swat' || b.state === 'hurt';
        if (b.kind === 'pigeon' && pigeonVulnerable) {
            const eyes = this.pigeonEyePoints(b);
            let hitEye = null;
            if (b.invuln <= 0 && this.stun <= 0) {
                for (const e of eyes){
                    const dSw = segPointDist(this.pawPrevX, this.pawPrevY, this.paw.x, this.paw.y, e.x, e.y);
                    const dPaw = Math.hypot(this.paw.x - e.x, this.paw.y - e.y);
                    if (Math.min(dSw, dPaw) < (e.r + 3) * u) {
                        hitEye = e;
                        break;
                    }
                }
            }
            if (hitEye) {
                /* ТОЧНО В ГЛАЗ: птица вздрагивает, теряет жизнь, перья летят */ b.invuln = PIGEON_BOSS_HIT_CD;
                b.hp--;
                b.flash = 1;
                b.state = 'hurt';
                b.stateT = 0;
                const d = Math.hypot(b.x - this.paw.x, b.y - this.paw.y) || 1;
                b.vx = (b.x - this.paw.x) / d * 190 * u;
                b.vy = (b.y - this.paw.y) / d * 190 * u;
                this.rings.push({
                    x: hitEye.x,
                    y: hitEye.y,
                    t: 0,
                    ttl: 0.4,
                    color: '255, 143, 163',
                    r0: 6 * u,
                    r1: 42 * u
                });
                this.crumbs(hitEye.x, hitEye.y, '#E8E4DC', 8);
                this.doShake(4);
                this.buzz(20);
                if (b.hp <= 0) {
                    this.bossDown();
                } else {
                    this.texts.push({
                        x: b.x,
                        y: b.y - PIGEON_BOSS_R * u * 1.12,
                        text: this.L('txt.bossHit'),
                        color: '#FFFFFF',
                        t: 0,
                        dur: 0.7,
                        size: 22 * u
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('shoo');
                }
                this.emitStats(true);
            } else if (b.deflectCd <= 0 && this.stun <= 0 && this.paw.seen) {
                /* Мимо по телу: подсказка «бей по глазам» + пух — но без урона
           ни птице, ни котику */ const bodyD = Math.hypot(this.paw.x - b.x, this.paw.y - b.y);
                if (bodyD < PIGEON_BOSS_R * 1.08 * u) {
                    b.deflectCd = 1.5;
                    this.texts.push({
                        x: b.x,
                        y: b.y - PIGEON_BOSS_R * u * 1.12,
                        text: this.L('txt.pigeonEyes'),
                        color: '#C8CFD8',
                        t: 0,
                        dur: 1,
                        size: 21 * u
                    });
                    this.crumbs(this.paw.x, this.paw.y, '#E8E4DC', 4);
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                }
            }
        } else if (b.kind === 'gypsy') {
            /* ЦЫГАНСКУЮ РУКУ ШЛЁПАЕМ ЛАПКОЙ — её единственная уязвимость.
         Касание безвредно обеим сторонам: бей смело, как в голубя.
         Свайп-сегмент кадра или сама лапка в радиусе ладони —
         минус жизнь воровке. Опасность — её броски (seeds ниже) */ const gypsyVulnerable = b.state === 'wander' || b.state === 'charge' || b.state === 'swat' || b.state === 'throw' || b.state === 'hurt';
            if (gypsyVulnerable && b.invuln <= 0 && this.stun <= 0) {
                /* Шлепок — АКТИВНОЕ движение лапки: рука, наткнувшаяся на
           припаркованную лапку, бесплатной жизни не отдаёт */ const pawSpeed = Math.hypot(this.pawVX, this.pawVY);
                if (pawSpeed > GYPSY_SLAP_MIN_SPEED * u) {
                    const dSw = segPointDist(this.pawPrevX, this.pawPrevY, this.paw.x, this.paw.y, b.x, b.y);
                    const dPaw = Math.hypot(this.paw.x - b.x, this.paw.y - b.y);
                    if (Math.min(dSw, dPaw) < (GYPSY_SLAP_R + 3) * u) {
                        b.invuln = GYPSY_HIT_CD;
                        b.hp--;
                        b.flash = 1;
                        b.state = 'hurt';
                        b.stateT = 0;
                        const d = Math.hypot(b.x - this.paw.x, b.y - this.paw.y) || 1;
                        b.vx = (b.x - this.paw.x) / d * 210 * u;
                        b.vy = (b.y - this.paw.y) / d * 210 * u;
                        this.rings.push({
                            x: b.x,
                            y: b.y,
                            t: 0,
                            ttl: 0.4,
                            color: '255, 201, 60',
                            r0: 8 * u,
                            r1: 48 * u
                        });
                        this.crumbs(b.x, b.y, '#FFC93C', 8);
                        this.doShake(4);
                        this.buzz(20);
                        if (b.hp <= 0) {
                            this.bossDown();
                        } else {
                            this.texts.push({
                                x: b.x,
                                y: b.y - GYPSY_R * u * 1.25,
                                text: this.L('txt.bossHit'),
                                color: '#FFFFFF',
                                t: 0,
                                dur: 0.7,
                                size: 22 * u
                            });
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('shoo');
                        }
                        this.emitStats(true);
                    }
                }
            }
        } else if ((b.kind === 'kid' || b.kind === 'lion' || b.kind === 'marten') && b.invuln <= 0 && this.stun <= 0) {
            const dtouch = Math.hypot(this.paw.x - b.x, this.paw.y - b.y);
            if (dtouch < (BOSS_TOUCH_R + 24) * u) {
                b.invuln = BOSS_TOUCH_CD;
                b.flash = 1;
                const d = dtouch || 1;
                b.vx = (b.x - this.paw.x) / d * 170 * u;
                b.vy = (b.y - this.paw.y) / d * 170 * u;
                if (b.state === 'charge') {
                    b.state = 'hurt';
                    b.stateT = 0;
                }
                /* «Мягкие рукавички»: шанс 12% за ступень, что касание обойдётся
           без потери сердца — малыш отшатывается, но сердце остаётся */ const guard = this.tree.bossGuard01 ?? 0;
                if (guard > 0 && Math.random() < guard) {
                    this.texts.push({
                        x: this.paw.x,
                        y: this.paw.y - 40 * u,
                        text: this.L('txt.guard'),
                        color: '#BFF3E6',
                        t: 0,
                        dur: 0.9,
                        size: 22 * u
                    });
                    this.crumbs(b.x, b.y, '#BFF3E6', 6);
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                } else {
                    this.loseHeart('boss');
                }
            }
        }
    }
    /** МАЛЫШ добрался до корзины: гребёт из неё попкорн — как воришка-голубь,
      только жирнее (растёт с номером босса). Пустую корзину только трясёт.
      МЕГА-ГОЛУБЬ клюёт той же логикой — воришка-то семейный */ bossSwat() {
        const u = this.u;
        const b = this.boss;
        if (this.collected > 0) {
            const tier = bossTierForLevel(this.lvl);
            const steal = Math.min(this.collected, BOSS_STEAL + tier - 1 + BOSS_STEAL_BY_KIND[b?.kind ?? 'kid']);
            this.collected -= steal;
            this.levelStolen++;
            this.breakStreak(this.cup.x, this.cup.y - this.cupH * 0.9);
            this.cup.squash = 1;
            this.doShake(7);
            this.texts.push({
                x: this.cup.x,
                y: this.cup.y - this.cupH * 0.9,
                text: this.L('txt.stole'),
                color: '#FF6B5E',
                t: 0,
                dur: 1,
                size: 26 * u
            });
            this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.4, '#FFC2D9', 7);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('penalty');
            this.buzz(40);
        } else {
            this.texts.push({
                x: this.cup.x,
                y: this.cup.y - this.cupH * 0.9,
                text: this.L('txt.empty'),
                color: '#C8CFD8',
                t: 0,
                dur: 0.8,
                size: 20 * u
            });
        }
        this.emitStats(true);
    }
    /* ================= ЦЫГАНСКАЯ РУКА: кражи с поля и броски в экран ================= */ /** ЦЫГАНКА сгребает РАССЫПАННЫЕ зёрна с поля — те, что котик не успел
      подобрать. Собранное в стаканчике ей недоступно (она с полом возится) */ gypsyGrab() {
        const b = this.boss;
        if (!b) return;
        const u = this.u;
        let grabbed = 0;
        for(let i = this.pieces.length - 1; i >= 0 && grabbed < GYPSY_GRAB_MAX; i--){
            const p = this.pieces[i];
            if (!p || p.spawn > 0.12) continue; // ещё не проявилось — красть рано
            if (Math.hypot(p.x - b.x, p.y - b.y) > GYPSY_GRAB_R * u) continue;
            this.pieces.splice(i, 1);
            grabbed++;
            this.crumbs(p.x, p.y, '#FFF3D6', 3);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
        }
        b.loot = grabbed;
        if (grabbed > 0) {
            this.levelStolen += grabbed; // «Чистая работа»: кража есть кража
            this.breakStreak(b.x, b.y);
            this.cup.squash = Math.max(this.cup.squash, 0.4); // лёгкий вздрагиватель
            this.doShake(5);
            this.texts.push({
                x: b.x,
                y: b.y - GYPSY_R * u * 1.25,
                text: this.L('txt.stole'),
                color: '#FF6B5E',
                t: 0,
                dur: 1,
                size: 24 * u
            });
            this.buzz(30);
        }
        this.emitStats(true);
    }
    /** БРОСОК В ЭКРАН: зерно летит к ТОЧКЕ, ГДЕ СЕЙЧАС ЛАПКА (фиксируется в
      момент броска). Полёт ~1.25с, зерно РАСТЁТ — «летит на камеру». У цели
      проявляется круг-телеграф: успей увести лапку! */ gypsyThrow() {
        const b = this.boss;
        if (!b) return;
        const u = this.u;
        this.seeds.push({
            sx: b.x + (Math.random() - 0.5) * 24 * u,
            sy: b.y + 12 * u,
            tx: this.paw.x,
            ty: this.paw.y,
            t: 0,
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() < 0.5 ? -1 : 1) * 9
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('shoo');
        this.buzz(15);
    }
    /** Полёт зёрен в экран: растут по мере подлёта, у цели — круг-телеграф.
      Шлепок о экран: рядом с точкой прилёта — сердечко и оглохшая лапка
      (стан, как от мины); промах — просто треск и крошки */ updateGypsySeeds(dt) {
        if (this.seeds.length === 0) return;
        const u = this.u;
        for(let i = this.seeds.length - 1; i >= 0; i--){
            const s = this.seeds[i];
            if (!s) continue;
            s.t += dt;
            s.rot += s.spin * dt;
            if (s.t < GYPSY_SEED_DUR) continue;
            // ШЛЁП О ЭКРАН: попало по лапке — сердечко и стан; мимо — просто треснуло
            const hit = Math.hypot(this.paw.x - s.tx, this.paw.y - s.ty) < (GYPSY_SEED_POP_R + 10) * u;
            this.rings.push({
                x: s.tx,
                y: s.ty,
                t: 0,
                ttl: 0.35,
                color: '255, 107, 94',
                r0: 10 * u,
                r1: 52 * u
            });
            this.crumbs(s.tx, s.ty, '#FFF3D6', 6);
            this.doShake(hit ? 7 : 3);
            if (hit) {
                this.stun = Math.max(0.4, MINE_SHOCK_SECONDS - (this.tree.stunCut ?? 0));
                this.levelShock++;
                this.loseHeart('gypsy');
                this.texts.push({
                    x: this.paw.x,
                    y: this.paw.y - 46 * u,
                    text: this.L('txt.gypsyHit'),
                    color: '#FF6B8A',
                    t: 0,
                    dur: 1,
                    size: 22 * u
                });
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play(hit ? 'penalty' : 'click');
            this.seeds.splice(i, 1);
        }
    }
    /* ================= ОНЛИФАНСИЙ: когтистые удары сверху ================= */ /** Когти Онлифансия (v0.0.46): пока горит телеграф — лапке пора уходить.
      УДАР: рядом с точкой — сердечко и оглохшая лапка (стан, как от мины);
      увела лапку — просто грозный хлопок и пыль */ updateLionSlams(dt) {
        if (this.lionSlams.length === 0) return;
        const u = this.u;
        for(let i = this.lionSlams.length - 1; i >= 0; i--){
            const s = this.lionSlams[i];
            if (!s) continue;
            s.t += dt;
            if (s.t < LION_SLAM_TELE) continue;
            // УДАР СВЕРХУ: попало по лапке — сердечко и стан; мимо — просто грохот
            const hit = Math.hypot(this.paw.x - s.x, this.paw.y - s.y) < (LION_SLAM_R + 10) * u;
            this.rings.push({
                x: s.x,
                y: s.y,
                t: 0,
                ttl: 0.35,
                color: '255, 201, 60',
                r0: 12 * u,
                r1: 58 * u
            });
            this.crumbs(s.x, s.y, '#C9A15E', 7);
            this.doShake(hit ? 8 : 4);
            if (hit) {
                this.stun = Math.max(0.4, MINE_SHOCK_SECONDS - (this.tree.stunCut ?? 0));
                this.levelShock++;
                this.loseHeart('boss');
                this.texts.push({
                    x: this.paw.x,
                    y: this.paw.y - 46 * u,
                    text: this.L('txt.lionSlamHit'),
                    color: '#FF8FA3',
                    t: 0,
                    dur: 1,
                    size: 22 * u
                });
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play(hit ? 'penalty' : 'claw');
            this.buzz(hit ? 50 : 20);
            this.lionSlams.splice(i, 1);
        }
    }
    /* ================= ЛАНА-ВОРОВКА: лапки с когтями ================= */ /** Сколько лапок Лана тянет одновременно: 2 на первом тире, до 4 у матёрой */ lanaMaxPaws() {
        const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY));
        return Math.min(4, 1 + Math.ceil(tier / 2));
    }
    /** Вырастить лапку: корень сбоку от тела Ланы, кончик — у корзинки */ spawnLanaPaw() {
        const b = this.boss;
        if (!b || b.paws.length >= this.lanaMaxPaws()) return;
        const u = this.u;
        const side = b.paws.length % 2 === 0 ? -1 : 1;
        const offX = side * (14 + Math.random() * 8) * u;
        const offY = (6 + Math.random() * 8) * u;
        const rx = b.x + offX;
        const ry = b.y + offY;
        /* Веер целей вокруг корзинки — когти приходятся с разных сторон */ const aimA = Math.atan2(this.cup.y - ry, this.cup.x - rx) + (Math.random() - 0.5) * 0.44;
        const dist = Math.hypot(this.cup.x - rx, this.cup.y - ry);
        b.paws.push({
            offX,
            offY,
            rx,
            ry,
            tx: rx,
            ty: ry,
            dx: Math.cos(aimA),
            dy: Math.sin(aimA),
            px: -Math.sin(aimA),
            py: Math.cos(aimA),
            len: 12 * u,
            maxLen: dist + (18 + Math.random() * 14) * u,
            state: 'grow',
            stateT: 0,
            sway: Math.random() * Math.PI * 2,
            loot: 0,
            emptyShown: false,
            cutT: 0,
            cutX: 0,
            cutY: 0,
            cutVX: 0,
            cutVY: 0,
            cutRot: 0
        });
    }
    /** Жизнь лапок: тянутся к корзинке, гребут попкорн, отступают — и РЕЖУТСЯ
      свайпом лапки котика (свайп-сегмент кадра пересёк лапку — разрез!) */ updateLanaPaws(dt) {
        const b = this.boss;
        if (!b) return;
        const u = this.u;
        const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY));
        const growSp = (LANA_GROW + tier * LANA_GROW_TIER) * u;
        /* Зона кражи — не точка у центра, а вся горловина корзинки: Лана
       мелькает рывками, и кончик должен засчитываться у rim, а не в центре */ const grabR = Math.max(50 * u, this.cupH * 0.78);
        for(let i = b.paws.length - 1; i >= 0; i--){
            const p = b.paws[i];
            if (!p) break; // страховка: массив мог быть очищен посреди кадра
            p.stateT += dt;
            p.sway += dt * 2;
            /* Корень следует за телом Ланы, кончик — по направлению роста */ p.rx = b.x + p.offX;
            p.ry = b.y + p.offY;
            const sw = p.state === 'cut' ? 0 : Math.sin(p.sway) * 5 * u;
            p.tx = p.rx + p.dx * p.len - p.px * sw;
            p.ty = p.ry + p.dy * p.len - p.py * sw;
            const dCup = Math.hypot(p.tx - this.cup.x, p.ty - this.cup.y);
            if (p.state === 'cut') {
                /* Обрубок втягивается, отрезанный кончик с когтями отлетает */ p.len = Math.max(0, p.len - LANA_RETRACT * 1.7 * u * dt);
                p.cutT += dt;
                p.cutVY += 780 * u * dt;
                p.cutX += p.cutVX * dt;
                p.cutY += p.cutVY * dt;
                p.cutRot += dt * 9;
                if (p.cutT > 0.8) b.paws.splice(i, 1);
            } else if (p.state === 'grow') {
                p.len += growSp * dt;
                /* Дотянулась раньше расчётной длины (Лана дэшнулась к корзинке) —
           хватается сразу, как только коготь в горловине корзинки */ if (p.len >= p.maxLen || dCup < grabR) {
                    p.len = Math.min(p.len, p.maxLen);
                    p.state = 'hold';
                    p.stateT = 0;
                }
            } else if (p.state === 'hold') {
                /* Коготь добрался до корзинки: выгребает попкорн и уносит добычу */ if (p.loot === 0 && dCup < grabR) {
                    if (this.collected > 0) {
                        const steal = Math.min(this.collected, LANA_STEAL + Math.floor((tier - 1) / 2));
                        this.collected -= steal;
                        this.levelStolen++;
                        this.breakStreak(this.cup.x, this.cup.y - this.cupH * 0.9);
                        this.cup.squash = 1;
                        this.doShake(5);
                        this.texts.push({
                            x: this.cup.x,
                            y: this.cup.y - this.cupH * 0.9,
                            text: this.L('txt.stole'),
                            color: '#FF6B5E',
                            t: 0,
                            dur: 1,
                            size: 26 * u
                        });
                        this.crumbs(this.cup.x, this.cup.y - this.cupH * 0.4, '#FFC2D9', 6);
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('penalty');
                        this.buzz(40);
                        p.loot = steal;
                        p.stateT = 0;
                        this.emitStats(true);
                    } else if (!p.emptyShown) {
                        p.emptyShown = true;
                        this.texts.push({
                            x: this.cup.x,
                            y: this.cup.y - this.cupH * 0.9,
                            text: this.L('txt.empty'),
                            color: '#C8CFD8',
                            t: 0,
                            dur: 0.8,
                            size: 20 * u
                        });
                    }
                }
                if (p.loot > 0 ? p.stateT > 0.4 : p.stateT > LANA_HOLD) {
                    p.state = 'back';
                    p.stateT = 0;
                }
            } else if (p.state === 'back') {
                p.len -= (LANA_RETRACT + (p.loot > 0 ? 70 : 0)) * u * dt;
                if (p.len <= 10 * u) {
                    b.paws.splice(i, 1);
                    continue;
                }
            }
            /* РЕЗ: свайп лапки котика за кадр пересёк лапку. Режет только РЕАЛЬНЫЙ
         мах — свайп не короче 2*u за кадр: стоящая лапка и растущая сквозь
         неё лапка Ланы не считаются. Отступающую с добычей тоже можно
         подловить — вернёшь украденное! */ const swx = this.paw.x - this.pawPrevX;
            const swy = this.paw.y - this.pawPrevY;
            const cuttable = p.state === 'grow' || p.state === 'hold' || p.state === 'back' && p.loot > 0;
            if (cuttable && this.stun <= 0 && this.paw.seen && swx * swx + swy * swy > 2 * u * (2 * u)) {
                const hit = segSegClosest(this.pawPrevX, this.pawPrevY, this.paw.x, this.paw.y, p.rx, p.ry, p.tx, p.ty);
                if (hit.d < (LANA_PAW_R + 10) * u) {
                    this.cutLanaPaw(p, hit.x, hit.y);
                    /* Смертельный разрез: bossDown() чистит b.paws — сразу выходим из
             цикла, иначе следующая итерация читает stateT у undefined */ if (this.boss && this.boss.paws.length === 0) break;
                }
            }
        }
        /* Свободный слот — вырастить следующую лапку: пауза тает с каждым тиром */ if (b.state === 'wander' && b.paws.length < this.lanaMaxPaws()) {
            b.pawT -= dt;
            if (b.pawT <= 0) {
                this.spawnLanaPaw();
                b.pawT = Math.max(0.75, LANA_REGROW - tier * 0.05) + Math.random() * 0.4;
            }
        }
    }
    /** Разрез лапки: кончик отлетает, Лана теряет жизнь. Украденное вываливается */ cutLanaPaw(p, x, y) {
        const b = this.boss;
        if (!b) return;
        const u = this.u;
        p.state = 'cut';
        p.stateT = 0;
        p.cutT = 0;
        p.cutX = p.tx;
        p.cutY = p.ty;
        /* Кончик отлетает по маху лапки, как по лезвию */ const d = Math.hypot(this.pawVX, this.pawVY) || 1;
        const sp = Math.min(430, d * 0.5);
        p.cutVX = this.pawVX / d * sp * u + (Math.random() - 0.5) * 60 * u;
        p.cutVY = this.pawVY / d * sp * u - 130 * u;
        /* Украденные зёрна вываливаются обратно на поле — успей подобрать! */ if (p.loot > 0) {
            for(let k = 0; k < p.loot; k++){
                this.pieces.push({
                    x: x + (Math.random() - 0.5) * 30 * u,
                    y: y + (Math.random() - 0.5) * 30 * u,
                    rot: Math.random() * Math.PI * 2,
                    kind: 'popcorn',
                    phase: Math.random() * Math.PI * 2,
                    spawn: 0,
                    spin: (Math.random() < 0.5 ? -1 : 1) * 6,
                    dA: 0,
                    vx: (Math.random() - 0.5) * 240 * u,
                    vy: -(120 + Math.random() * 170) * u
                });
            }
            p.loot = 0;
            this.texts.push({
                x,
                y: y - 34 * u,
                text: this.L('txt.lootBack'),
                color: '#FFF3D6',
                t: 0,
                dur: 0.9,
                size: 21 * u
            });
        }
        /* УРОН: каждый разрез — минус жизнь воровке */ b.hp--;
        b.flash = 1;
        this.rings.push({
            x,
            y,
            t: 0,
            ttl: 0.4,
            color: '255, 143, 163',
            r0: 8 * u,
            r1: 46 * u
        });
        this.crumbs(x, y, '#C89B62', 8);
        this.doShake(4);
        this.buzz(20);
        if (b.hp <= 0) {
            this.bossDown();
        } else {
            this.texts.push({
                x,
                y: y - 30 * u,
                text: this.L('txt.pawCut'),
                color: '#FFE066',
                t: 0,
                dur: 0.7,
                size: 22 * u
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('shoo');
        }
        this.emitStats(true);
    }
    /** Боссу засчитан смертельный урон (пинок зерном или разрез лапки):
      очки, монетки, ачивки за забег — салют и уход за кадр */ bossDown() {
        const b = this.boss;
        if (!b) return;
        const u = this.u;
        b.state = 'flee';
        b.stateT = 0;
        b.paws.length = 0;
        /* Украденное цыганкой вываливается обратно на пол — успей подобрать! */ if (b.loot > 0) {
            for(let k = 0; k < b.loot; k++){
                this.pieces.push({
                    x: b.x + (Math.random() - 0.5) * 40 * u,
                    y: b.y + (Math.random() - 0.5) * 40 * u,
                    rot: Math.random() * Math.PI * 2,
                    kind: 'popcorn',
                    phase: Math.random() * Math.PI * 2,
                    spawn: 0,
                    spin: (Math.random() < 0.5 ? -1 : 1) * 6,
                    dA: 0,
                    vx: (Math.random() - 0.5) * 200 * u,
                    vy: -(100 + Math.random() * 150) * u
                });
            }
            b.loot = 0;
            this.texts.push({
                x: b.x,
                y: b.y + 40 * u,
                text: this.L('txt.lootBack'),
                color: '#FFF3D6',
                t: 0,
                dur: 0.9,
                size: 21 * u
            });
        }
        /* Летящие в экран зёрна при победе растворяются — не бьют по уставшему */ this.seeds.length = 0;
        const tier = Math.max(1, Math.floor(this.lvl / BOSS_EVERY));
        const bonus = BOSS_BONUS_BASE + (tier - 1) * BOSS_BONUS_PER_TIER;
        this.score += bonus;
        /* «Призовые малыша»: монетки с боссов +12% за ступень */ this.bossCoinsRun += Math.round((BOSS_COINS_BASE + (tier - 1) * BOSS_COINS_PER_TIER) * (1 + (this.tree.bossCoins01 ?? 0)));
        /* Ачивки босса: счёт побед за забег и «без царапин» — сердечек при
        победе не меньше, чем было при появлении босса */ this.bossKillsRun++;
        if (b.kind === 'kid') this.bossKidKillsRun++;
        else if (b.kind === 'lion') this.bossLionKillsRun++;
        else if (b.kind === 'pigeon') this.bossPigeonKillsRun++;
        else if (b.kind === 'gypsy') this.bossGypsyKillsRun++;
        else this.bossMartenKillsRun++;
        this.bossCleanLast = this.hearts >= this.bossHeartsAtSpawn;
        const downKey = b.kind === 'lion' ? 'txt.bossDownLion' : b.kind === 'marten' ? 'txt.bossDownMarten' : b.kind === 'pigeon' ? 'txt.bossDownPigeon' : b.kind === 'gypsy' ? 'txt.bossDownGypsy' : 'txt.bossDown';
        this.texts.push({
            x: b.x,
            y: b.y - 50 * u,
            text: this.L(downKey, {
                n: bonus
            }),
            color: '#FFE066',
            t: 0,
            dur: 1.6,
            size: 26 * u
        });
        this.confettiBurst(b.x, b.y, 26);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('bossWin');
        this.doShake(6);
        this.emitStats(true);
    }
    /** Летящий попкорн: пнутое лапкой зерно скользит с трением, отскакивает
      от краёв поля и, врезавшись в МАЛЫША, снимает ему жизнь.
      ЛАНА зерном не берётся — ловко отбивает лапкой: режь её лапки! */ updateThrownPieces(dt) {
        const u = this.u;
        const mX = 34 * u;
        const top = 50;
        const bottom = this.H - 52 * u;
        const b = this.boss;
        for(let i = this.pieces.length - 1; i >= 0; i--){
            const p = this.pieces[i];
            const vx = p.vx ?? 0;
            const vy = p.vy ?? 0;
            if (Math.hypot(vx, vy) < 26 * u) {
                if (vx !== 0 || vy !== 0) {
                    p.vx = 0;
                    p.vy = 0;
                }
                continue;
            }
            p.x += vx * dt;
            p.y += vy * dt;
            const fr = Math.exp(-FLING_FRICTION * dt);
            p.vx = vx * fr;
            p.vy = vy * fr;
            /* Отскоки от краёв поля: зерно не улетает за кадр */ if (p.x < mX) {
                p.x = mX;
                p.vx = Math.abs(vx) * 0.72;
            } else if (p.x > this.W - mX) {
                p.x = this.W - mX;
                p.vx = -Math.abs(vx) * 0.72;
            }
            if (p.y < top) {
                p.y = top;
                p.vy = Math.abs(vy) * 0.72;
            } else if (p.y > bottom) {
                p.y = bottom;
                p.vy = -Math.abs(vy) * 0.72;
            }
            /* ПОПАДАНИЕ В БОССА: зерно тратится, босс теряет жизнь.
         ЛЕВ В РОКТЕ — грива-щит отбивает зерно без урона.
         ЛАНА зерном вообще не берётся — отбивает лапкой */ if (b && b.state !== 'flee' && b.state !== 'in') {
                const hitR = BOSS_HIT_R_BY_KIND[b.kind] * u + 12 * u;
                if (b.kind === 'pigeon') {
                    /* Зерно по мега-голубю НЕ БЕРЁТ — отскакивает от оперения:
             единственная уязвимость — глаза, и то только лапкой */ if (Math.hypot(p.x - b.x, p.y - b.y) < hitR) {
                        p.vx = -vx * 0.6 + (Math.random() - 0.5) * 110 * u;
                        p.vy = -vy * 0.6 + (Math.random() - 0.5) * 110 * u;
                        if (b.deflectCd <= 0) {
                            b.deflectCd = 0.9;
                            this.texts.push({
                                x: b.x,
                                y: b.y - PIGEON_BOSS_R * u * 1.15,
                                text: this.L('txt.pigeonEyes'),
                                color: '#C8CFD8',
                                t: 0,
                                dur: 0.9,
                                size: 20 * u
                            });
                            this.crumbs(p.x, p.y, '#E8E4DC', 5);
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                        }
                    }
                    continue;
                }
                if (b.kind === 'gypsy') {
                    /* Зерно по цыганке НЕ БЕРЁТ — её ШЛЁПАЕТ только лапка */ if (Math.hypot(p.x - b.x, p.y - b.y) < hitR) {
                        p.vx = -vx * 0.6 + (Math.random() - 0.5) * 110 * u;
                        p.vy = -vy * 0.6 + (Math.random() - 0.5) * 110 * u;
                        if (b.deflectCd <= 0) {
                            b.deflectCd = 0.9;
                            this.texts.push({
                                x: b.x,
                                y: b.y - GYPSY_R * u * 1.3,
                                text: this.L('txt.gypsySlap'),
                                color: '#FFC93C',
                                t: 0,
                                dur: 0.9,
                                size: 20 * u
                            });
                            this.crumbs(p.x, p.y, '#FFF3D6', 5);
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                        }
                    }
                    continue;
                }
                if (b.kind === 'marten') {
                    if (Math.hypot(p.x - b.x, p.y - b.y) < hitR) {
                        p.vx = -vx * 0.65 + (Math.random() - 0.5) * 90 * u;
                        p.vy = -vy * 0.65 + (Math.random() - 0.5) * 90 * u;
                        if (b.deflectCd <= 0) {
                            b.deflectCd = 0.6;
                            this.texts.push({
                                x: b.x,
                                y: b.y - 60 * u,
                                text: this.L('txt.lanaDodge'),
                                color: '#E2B98A',
                                t: 0,
                                dur: 0.8,
                                size: 21 * u
                            });
                            this.crumbs(b.x, b.y, '#E8D9B0', 5);
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                        }
                    }
                    continue;
                }
                if (Math.hypot(p.x - b.x, p.y - b.y) < hitR) {
                    if (b.kind === 'lion' && b.roar > 0) {
                        /* ОТСКОК: зерно летит обратно под углом, жизни не теряет */ p.vx = -vx * 0.7 + (Math.random() - 0.5) * 120 * u;
                        p.vy = Math.abs(vy) * 0.7 + 90 * u;
                        if (b.deflectCd <= 0) {
                            b.deflectCd = 0.35;
                            this.texts.push({
                                x: b.x,
                                y: b.y - 60 * u,
                                text: this.L('txt.deflect'),
                                color: '#FFC93C',
                                t: 0,
                                dur: 0.8,
                                size: 22 * u
                            });
                            this.crumbs(b.x, b.y, '#FFC93C', 6);
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                            this.doShake(3);
                        }
                        continue;
                    }
                    this.pieces.splice(i, 1);
                    this.hitBoss(p.x, p.y, vx, vy);
                }
            }
        }
    }
    /** Пинок попкорном прилетел в босса: минус жизнь, отшатывается.
      Жизни кончились — побеждён, уплывает за кадр */ hitBoss(x, y, vx, vy) {
        const b = this.boss;
        if (!b) return;
        const u = this.u;
        b.hp--;
        b.flash = 1;
        b.state = 'hurt';
        b.stateT = 0;
        const d = Math.hypot(vx, vy) || 1;
        b.vx = vx / d * 150 * u;
        b.vy = vy / d * 150 * u;
        this.rings.push({
            x,
            y,
            t: 0,
            ttl: 0.4,
            color: '255, 143, 163',
            r0: 8 * u,
            r1: 46 * u
        });
        this.crumbs(x, y, '#FFF3D6', 8);
        this.doShake(4);
        this.buzz(20);
        if (b.hp <= 0) {
            this.bossDown();
        } else {
            this.texts.push({
                x: b.x,
                y: b.y - 50 * u,
                text: this.L('txt.bossHit'),
                color: '#FFFFFF',
                t: 0,
                dur: 0.7,
                size: 22 * u
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('shoo');
        }
        this.emitStats(true);
    }
    /** Малыш повержен и уплыл за кадр: уровень завершается той же дорогой,
      что и обычная сдача нормы — салют, сундучок, нарезка, следующий этап */ bossDefeated() {
        this.levelComplete();
    }
    /* ================= цикл ================= */ loop = (ts)=>{
        if (this.destroyed) return;
        const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
        this.lastTs = ts;
        if (this.phase === 'playing' && !this.paused && !this.introHold) {
            try {
                this.update(dt);
            } catch (err) {
                // Сбой кадра не должен замораживать игру — логируем и продолжаем
                console.error('[popcorn] update error:', err);
            }
        } else if (this.phase === 'clear' && !this.paused) {
            /* Празднование победы: геймплей стоит, но косметика живёт —
         баннер «ПРОЙДЕН!» проявляется, конфетти падает, кольцо расходится */ try {
                this.updateCosmetics(dt);
            } catch (err) {
                console.error('[popcorn] clear cosmetics error:', err);
            }
        }
        /* FPS-монитор: если долго ниже 45 — переходим на облегчённый режим,
       когда снова стабильно выше 55 — возвращаем эффекты */ const newTier = this.fpsMeter.tick(dt, ts);
        if (newTier !== null) this.setPerfTier(newTier);
        this.render(ts);
        this.emitStats(false);
        this.raf = requestAnimationFrame(this.loop);
    };
    /** Текущий сглаженный FPS (для отладки: window.__popcornEngine.fps) */ get fps() {
        return Math.round(this.fpsMeter.fps);
    }
    /** Активный perf-тир авто-качества (0 — все эффекты, 2 — минимум) */ get perfTier() {
        return this.fpsMeter.tier;
    }
    /** Смена авто-качества: на тире 2 ещё и урезаем DPR-потолок до 1.2 */ setPerfTier(tier) {
        this.applyDpr();
    }
    /** Пересчитать DPR канваса: потолок из настроек качества,
      плюс авто-потолок 1.2 на нижнем тире (реальный буст на телефонах) */ applyDpr() {
        const dprCap = this.opts.quality === 'low' ? 1.2 : this.opts.quality === 'high' ? 2 : this.coarse ? 1.6 : 2;
        const cap = this.fpsMeter.tier >= 2 ? Math.min(dprCap, 1.2) : dprCap;
        this.dpr = Math.min(window.devicePixelRatio || 1, cap);
        this.canvas.width = Math.round(this.W * this.dpr);
        this.canvas.height = Math.round(this.H * this.dpr);
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = false;
    }
    fpsMeter = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$fps$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FpsMeter"]();
    /** Момент последнего обновления HUD-статистики (троттлинг emitStats) */ lastStatsEmit = 0;
    /* ================= ПОДАРОЧНЫЕ КОРОБКИ (0.0.41) ================= */ /** Обновление подарочной коробки: появление по таймеру, жизнь на поле,
      сбор лапкой. На лихорадке и босс-боях подарки не появляются */ updateGift(dt) {
        if (this.phase !== 'playing') return;
        const u = this.u;
        if (this.gift) {
            this.gift.t += dt;
            if (this.gift.t >= GIFT_LIFE) {
                this.gift = null;
                this.giftTimer = this.nextGiftDelay();
                return;
            }
            /* Сбор: лапке достаточно коснуться коробки (радиус чуть шире подбора) */ const d = Math.hypot(this.paw.x - this.gift.x, this.paw.y - this.gift.y);
            if (this.stun <= 0 && d < this.grabR + 14 * u) {
                const g = this.gift;
                this.gift = null;
                this.giftTimer = this.nextGiftDelay();
                this.collectGift(g.kind, g.x, g.y);
            }
            return;
        }
        if (this.fever || this.boss || this.pendingClear >= 0 || this.feverAfter >= 0) return;
        this.giftTimer -= dt;
        if (this.giftTimer <= 0) this.spawnGift();
    }
    /** Пауза до следующей коробки: древо «Праздничный кот» укорачивает */ nextGiftDelay() {
        const base = GIFT_EVERY_MIN + Math.random() * (GIFT_EVERY_MAX - GIFT_EVERY_MIN);
        return Math.max(3, base * (1 - Math.min(0.5, this.tree.giftFreq01 ?? 0)));
    }
    /** Появить коробку в свободном месте поля (не на мине/зерне, не на корзинке) */ spawnGift() {
        const u = this.u;
        const mX = 46 * u;
        const top = 46 + 4 * u;
        const bottom = this.H - 52 * u;
        let x = this.W / 2;
        let y = this.H / 2;
        for(let tries = 0; tries < 40; tries++){
            x = mX + Math.random() * (this.W - mX * 2);
            y = top + Math.random() * Math.max(10, bottom - top);
            if (Math.hypot(x - this.cup.x, y - this.cup.y) <= 135 * u) continue;
            let blocked = false;
            for (const p of this.pieces){
                if (Math.hypot(x - p.x, y - p.y) < 34 * u) {
                    blocked = true;
                    break;
                }
            }
            if (blocked) continue;
            break;
        }
        const r = Math.random();
        const kind = r < 0.3 ? 'freeze' : r < 0.55 ? 'sweep' : r < 0.75 ? 'mult2' : r < 0.9 ? 'mult5' : 'mult10';
        this.gift = {
            x,
            y,
            t: 0,
            kind,
            phase: Math.random() * Math.PI * 2
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('gift');
    }
    /** Открыть подарок: ❄ фриз / 🧨 подрыв всех мин / ×2 ×5 ×10 к очкам */ collectGift(kind, x, y) {
        const u = this.u;
        this.giftsRun++;
        this.confettiBurst(x, y, 18);
        this.crumbs(x, y, '#FFE066', 10);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('giftOpen');
        this.buzz([
            30,
            40,
            60
        ]);
        if (kind === 'freeze') {
            this.freezeLeft = GIFT_FREEZE_SECONDS;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('freeze');
            this.banner = {
                text: this.L('gift.freeze', {
                    n: GIFT_FREEZE_SECONDS
                }),
                t: 0
            };
        } else if (kind === 'sweep') {
            /* Подрыв всех мин на поле: искры в небо, но без вреда. И до конца
         этапа — ни одной новой мины: волны становятся чистыми */ for(let i = this.pieces.length - 1; i >= 0; i--){
                const p = this.pieces[i];
                if (p.kind !== 'corn') continue;
                this.pieces.splice(i, 1);
                this.rings.push({
                    x: p.x,
                    y: p.y,
                    t: 0,
                    ttl: 0.5,
                    color: '255, 200, 90',
                    r0: 10 * u,
                    r1: 58 * u
                });
                this.crumbs(p.x, p.y, '#FFC93C', 6);
            }
            this.cornPerWave = 0;
            this.mineSweep = true;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('sweep');
            this.doShake(5);
            this.banner = {
                text: this.L('gift.sweep'),
                t: 0
            };
        } else {
            const v = kind === 'mult10' ? 10 : kind === 'mult5' ? 5 : 2;
            this.multValue = v;
            this.multLeft = GIFT_MULT_DUR[v] ?? 8;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('mult');
            this.banner = {
                text: this.L('gift.mult', {
                    n: v
                }),
                t: 0
            };
        }
        this.emitStats(true);
        this.cb.onGift?.(kind);
    }
    /* ================= ОНЛИФАНСИЙ — лапа с краю поля (0.0.43) ================= */ /** Обновление лапы Онлифансия: грохот → стремительный въезд → 2 секунды
      страха → неспешный отъезд. Чистый спектакль: ни одной коллизии —
      зёрна под лапой целы, таймер идёт, сердца не трогаются */ updateLionCameo(dt) {
        const c = this.lionCameo;
        if (!c) return;
        /* Спектакль только в живом обычном этапе: на лихорадке/боссу/финальной
        нарезке лапа замирает и ждёт своего часа */ if (this.phase !== 'playing' || this.fever || this.boss || this.pendingClear >= 0) return;
        const u = this.u;
        c.phaseT += dt;
        if (c.phase === 'idle') {
            c.timer -= dt;
            if (c.timer <= 0) {
                c.phase = 'warn';
                c.phaseT = 0;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('rumble');
                this.doShake(3);
            }
        } else if (c.phase === 'warn') {
            /* Пыль у края: оттуда сейчас вылетит лапа — последние полсекунды паники */ if (Math.random() < dt * 14) {
                this.crumbs(c.side < 0 ? 8 * u : this.W - 8 * u, this.H * (0.3 + Math.random() * 0.35), '#C9A15E', 3);
            }
            if (c.phaseT >= LION_CAMEO_WARN) {
                c.phase = 'in';
                c.phaseT = 0;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('claw'); // вжух-ХЛОП: лапа влетает в поле
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('roar');
                this.doShake(9);
                this.buzz([
                    30,
                    80,
                    160,
                    60
                ]);
                this.banner = {
                    text: this.L('cameo.caption'),
                    t: 0
                };
                this.cb.onLionScare?.();
            }
        } else if (c.phase === 'in') {
            if (c.phaseT >= LION_CAMEO_IN) {
                c.phase = 'hold';
                c.phaseT = 0;
            }
        } else if (c.phase === 'hold') {
            if (c.phaseT >= LION_CAMEO_HOLD) {
                c.phase = 'out';
                c.phaseT = 0;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('rumble');
            }
        } else if (c.phase === 'out') {
            if (c.phaseT >= LION_CAMEO_OUT) {
                this.lionCameo = null;
            }
        }
    }
    /** Рисование гигантской когтистой лапы Онлифансия (въезд/давление/отъезд).
      Рисуем поверх поля ПОСЛЕ лапки игрока — накрывает всё, но не мешает:
      под ней зёрна собираются как ни в чём не бывало */ drawLionCameo() {
        const c = this.lionCameo;
        if (!c || c.phase === 'idle' || c.phase === 'warn') return;
        const { ctx } = this;
        const u = this.u;
        const min = Math.min(this.W, this.H);
        const R = min * 0.17 // радиус ладони — просто огромная
        ;
        const reach = R * 2.05 // насколько глубоко лапа забирается в поле
        ;
        /* Прогресс въезда/отъезда: въезд резкий (ease-out), отъезд ленивый (ease-in) */ let p = 1;
        if (c.phase === 'in') {
            const t = Math.min(1, c.phaseT / LION_CAMEO_IN);
            p = 1 - Math.pow(1 - t, 3);
        } else if (c.phase === 'out') {
            const t = Math.min(1, c.phaseT / LION_CAMEO_OUT);
            p = 1 - t * t;
        }
        const cx = c.side < 0 ? reach * p : this.W - reach * p;
        const sway = c.phase === 'hold' ? Math.sin(c.phaseT * 4.2) : 0;
        const cy = this.H * 0.46 + sway * R * 0.05;
        const tilt = (c.side < 0 ? 1 : -1) * (0.12 + sway * 0.018);
        /* Тень на полу: тяжёлая лапа давит сверху — пол ощущается */ ctx.fillStyle = 'rgba(0, 0, 0, 0.13)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + R * 1.45, R * 1.15, R * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        if (c.side > 0) ctx.scale(-1, 1); // справа — зеркалим: когти смотрят в поле
        /* ПРЕДПЛЕЧЬЕ: мощный столб шерсти от края поля до ладони. Границы
        экрана обрезают конец руки — кажется, что она тянется из-за кулис */ const armW = R * 1.42;
        ctx.fillStyle = '#E9A23B';
        ctx.fillRect(-R * 3.3, -armW / 2, R * 3.3, armW);
        ctx.fillStyle = '#D08A2E'; // нижняя грань руки — объём
        ctx.fillRect(-R * 3.3, armW / 2 - armW * 0.3, R * 3.3, armW * 0.3);
        /* Меховая рюша по краям руки — грива Онлифансия доходит и до лапы */ ctx.fillStyle = '#B35A1F';
        for(let i = 0; i < 6; i++){
            const fx = -R * 2.9 + i * R * 0.48;
            const up = i % 2 === 0;
            ctx.beginPath();
            ctx.moveTo(fx, up ? -armW / 2 : armW / 2);
            ctx.lineTo(fx + R * 0.24, up ? -armW / 2 - R * 0.3 : armW / 2 + R * 0.3);
            ctx.lineTo(fx + R * 0.48, up ? -armW / 2 : armW / 2);
            ctx.closePath();
            ctx.fill();
        }
        /* ЛАДОНЬ: огромная, с контуром — читается даже на ярком поле */ ctx.fillStyle = '#E9A23B';
        ctx.strokeStyle = '#5C2E0E';
        ctx.lineWidth = Math.max(3, R * 0.055);
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        /* Объём ладони: тень снизу, блик сверху */ ctx.fillStyle = '#D08A2E';
        ctx.beginPath();
        ctx.arc(0, R * 0.3, R * 0.62, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F0B45A';
        ctx.beginPath();
        ctx.arc(-R * 0.3, -R * 0.34, R * 0.42, 0, Math.PI * 2);
        ctx.fill();
        /* ПОДУШЕЧКИ ПАЛЬЦЕВ: четыре мясистых бугра на переднем крае лапы */ const toes = [
            [
                R * 0.72,
                -R * 0.74,
                R * 0.34
            ],
            [
                R * 0.94,
                -R * 0.26,
                R * 0.36
            ],
            [
                R * 0.94,
                R * 0.26,
                R * 0.36
            ],
            [
                R * 0.72,
                R * 0.74,
                R * 0.34
            ]
        ];
        ctx.fillStyle = '#F0B45A';
        for (const [tx, ty, tr] of toes){
            ctx.beginPath();
            ctx.arc(tx, ty, tr, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        /* КОГТИ: длинные белые серпы с тёмным контуром — та самая «когтистость» */ ctx.fillStyle = '#FFF7E0';
        ctx.lineWidth = Math.max(2, R * 0.045);
        for (const [tx, ty, tr] of toes){
            const bx = tx + tr * 0.55;
            ctx.beginPath();
            ctx.moveTo(bx, ty - tr * 0.52);
            ctx.quadraticCurveTo(bx + R * 0.72, ty - tr * 0.3, bx + R * 0.95, ty + tr * 0.1);
            ctx.quadraticCurveTo(bx + R * 0.5, ty + tr * 0.34, bx, ty + tr * 0.52);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
        /* Мороз по краям — лапа на экране: лёгкое затемнение добавляет давления,
        но не выдаёт себя за урон (красная вспышка — только потеря сердца) */ if (c.phase === 'hold') {
            ctx.fillStyle = 'rgba(24, 10, 4, 0.09)';
            ctx.fillRect(0, 0, this.W, this.H);
        }
    }
    emitStats(force) {
        if (!this.cb.onStats) return;
        /* Троттлинг: HUD не нужен 60 раз в секунду — 7 Гц хватает глаз,
       а сборка строкового ключа каждый кадр — лишний мусор для GC */ const now = performance.now();
        if (!force && now - this.lastStatsEmit < 150) return;
        this.lastStatsEmit = now;
        const sec = Math.ceil(this.timeLeft);
        const fever = !!this.fever || this.feverAfter >= 0;
        const feverGained = this.fever ? this.fever.gained : this.feverAfter >= 0 ? this.lastFeverGained : 0;
        const key = `${this.score}|${this.lvl}|${this.quota}|${this.collected}|${this.carried.length}|${sec}|${this.paused}|${this.streak}|${this.goldenCount}|${this.pigeonsRun}|${fever}|${feverGained}|${this.wave}|${this.shieldLeft}|${this.runGrains}|${this.runNipples}|${this.minesHit}|${this.shieldSaves}|${this.hearts}|${this.maxHearts}|${this.bigCaught}|${this.bigCaramelRun}|${this.bigCherryRun}|${this.bigGrapeRun}|${this.bossCoinsRun}|${this.goldCoinsRun}|${this.bossKillsRun}|${this.bossKidKillsRun}|${this.bossLionKillsRun}|${this.bossMartenKillsRun}|${this.bossPigeonKillsRun}|${this.bossGypsyKillsRun}|${this.bossCleanLast ? 1 : 0}|${this.boss ? `${this.boss.hp}/${this.boss.maxHp}` : '-'}|${Math.ceil(this.freezeLeft)}|${this.multLeft > 0 ? this.multValue : 0}|${Math.ceil(this.multLeft)}|${this.giftsRun}`;
        if (!force && key === this.lastStatsKey) return;
        this.lastStatsKey = key;
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
            mineOn: this.pieces.some((p)=>p.kind === 'corn'),
            goldenOn: this.pieces.some((p)=>p.kind === 'golden'),
            bigCaught: this.bigCaught,
            bigCoins: this.bigCoinsRun,
            bigCaramel: this.bigCaramelRun,
            bigCherry: this.bigCherryRun,
            bigGrape: this.bigGrapeRun,
            bossKills: this.bossKillsRun,
            bossKidKills: this.bossKidKillsRun,
            bossLionKills: this.bossLionKillsRun,
            bossMartenKills: this.bossMartenKillsRun,
            bossPigeonKills: this.bossPigeonKillsRun,
            bossGypsyKills: this.bossGypsyKillsRun,
            bossClean: this.bossCleanLast,
            boss: !!this.boss,
            bossHp: this.boss?.hp ?? 0,
            bossMaxHp: this.boss?.maxHp ?? 0,
            bossCoins: this.bossCoinsRun,
            goldCoins: this.goldCoinsRun,
            giftFreeze: Math.ceil(this.freezeLeft),
            giftMult: this.multLeft > 0 ? this.multValue : 1,
            giftMultLeft: Math.ceil(this.multLeft),
            giftsRun: this.giftsRun
        });
    }
    /* ================= отрисовка ================= */ /** Тайловый паттерн для перка «Попкорнопад»: пререндерим плитку со
      россыпью зёрен один раз (256×256) и закрашиваем ей весь экран */ bgPattern = null;
    ensureBgPattern() {
        if (this.bgPattern) return this.bgPattern;
        const T = 128;
        const tile = document.createElement('canvas');
        tile.width = T;
        tile.height = T;
        const c = tile.getContext('2d');
        if (!c) return null;
        c.imageSmoothingEnabled = true;
        /* спрайты теперь hi-res: плитка со сглаживанием */ const kinds = [
            this.sp.popcorn,
            this.sp.caramel,
            this.sp.popcorn,
            this.sp.butter,
            this.sp.popcorn,
            this.sp.golden
        ];
        let i = 0;
        for(let y = 0; y < 4; y++){
            for(let x = 0; x < 4; x++){
                const spr = kinds[(x * 3 + y * 5 + i) % kinds.length] ?? this.sp.popcorn;
                i++;
                const scale = 1.9 + (x + y) % 3 * 0.45;
                const w = spr.w * scale;
                c.globalAlpha = 0.55 + (x + y * 2) % 4 * 0.1;
                c.drawImage(spr.canvas, x * 32 + y % 2 * 16 - w / 2, y * 32 + x % 2 * 16 - w / 2, w, w);
            }
        }
        this.bgPattern = this.ctx.createPattern(tile, 'repeat');
        return this.bgPattern;
    }
    render(ts) {
        const { ctx } = this;
        ctx.clearRect(0, 0, this.W, this.H);
        if (this.phase === 'idle') return;
        /* Фоновые перки: полностью перекрываем комнату (белое пекло или весь
        пол в попкорне). Заливка — в самом канвасе: не создаёт лишних
        DOM-слоёв. (Перки-тьма удалены в 0.0.41 — игроки их не любили) */ const bg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$perks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bgPerkFor"])(this.perk);
        if (bg === 'whiteout') {
            ctx.fillStyle = '#F5F1E4';
            ctx.fillRect(0, 0, this.W, this.H);
        } else if (bg === 'popcornfall') {
            const pat = this.ensureBgPattern();
            if (pat) {
                ctx.fillStyle = pat;
                ctx.fillRect(0, 0, this.W, this.H);
            }
        }
        /* Виньетка контраста: лёгкое затемнение игровой зоны поверх фоновой
       картинки — светлые зёрна, лапка и курсор читаются на любой комнате,
       включая старые Android с блеклой передачей (жалоба на уровень 10).
       С фоновыми перками не нужна — они сами красят всё поле */ if (!bg && this.phase === 'playing' && !this.paused) {
            ctx.fillStyle = 'rgba(30, 15, 5, 0.16)';
            ctx.fillRect(0, 0, this.W, this.H);
        }
        /* Пылинки в «луче света»: медленно всплывают сквозь кадр и делают
       статичную комнату живой. Рисуем до мира — они позади зёрен */ if (this.motes.length > 0) {
            ctx.fillStyle = '#FFF3D0';
            for (const m of this.motes){
                ctx.globalAlpha = m.a * (0.7 + 0.3 * Math.sin(m.ph + m.y * 0.02));
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        ctx.save();
        /* Тряска экрана при минах/голубе (настройка «Тряска экрана») */ if (this.opts.shake && this.shakeT > 0 && this.shakeAmp > 0) {
            const a = this.shakeAmp * (this.shakeT / 0.3);
            ctx.translate((Math.random() - 0.5) * 2 * a, (Math.random() - 0.5) * 2 * a);
        }
        this.drawCup(ts);
        this.drawPieces(ts);
        /* ПОДАРОЧНАЯ КОРОБКА поверх зёрен; морозная дымка — пока действует фриз */ this.drawGift(ts);
        if (this.freezeLeft > 0) {
            ctx.fillStyle = 'rgba(120, 190, 255, 0.08)';
            ctx.fillRect(0, 0, this.W, this.H);
            ctx.strokeStyle = 'rgba(150, 205, 255, 0.4)';
            ctx.lineWidth = 6 * this.u;
            ctx.strokeRect(3 * this.u, 3 * this.u, this.W - 6 * this.u, this.H - 6 * this.u);
        }
        if (this.pigeon && this.phase === 'playing') this.drawPigeon(ts);
        if (this.boss && this.phase === 'playing') this.drawBoss();
        // Зёрна, летящие В ЭКРАН: растут по подлёту, у цели — круг-телеграф
        if (this.seeds.length > 0) this.drawGypsySeeds(ts);
        // КОГТИ ОНЛИФАНСИЯ: круг-телеграф и опускающиеся когти — поверх босса
        if (this.lionSlams.length > 0) this.drawLionSlams();
        /* ЛАНА: длинные лапки с когтями — поверх босса и корзинки */ if (this.boss && this.boss.paws.length > 0) this.drawLanaPaws();
        this.drawFlying();
        this.drawParticles();
        /* Ударные волны поверх частиц: кольца взрывов и победы */ if (this.rings.length > 0) {
            for (const r of this.rings){
                const q = r.t / r.ttl;
                ctx.globalAlpha = (1 - q) * 0.75;
                ctx.strokeStyle = `rgb(${r.color})`;
                ctx.lineWidth = Math.max(2, (3.5 - q * 2.5) * this.u);
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * q, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        this.drawPaw(ts);
        /* ОНЛИФАНСИЙ: гигантская лапа с краю — поверх поля и лапки игрока,
        но ПОД баннером, чтобы подпись читалась сквозь спектакль */ this.drawLionCameo();
        /* Лихорадка: тёплая золотая дымка на фоне */ if (this.fever) this.drawFeverFx();
        /* Туман рисуем ДО надписей: баннер «ВОЛНА N» и всплывающие тексты
       читаются сквозь попкорновый туман (раньше туман их накрывал) */ if (this.perk === 'fog' && this.phase === 'playing') this.drawFog();
        this.drawTexts();
        this.drawBanner();
        if (this.phase === 'ended' || this.phase === 'clear') {
            ctx.fillStyle = 'rgba(24, 10, 4, 0.35)';
            ctx.fillRect(0, 0, this.W, this.H);
        }
        ctx.restore();
        /* Красная вспышка по краям при потере сердца — вне shake-трансформа,
       чтобы весь экран ровно «заливало» без рывков */ if (this.hurtT > 0) {
            const k = this.hurtT / 0.55;
            const g = ctx.createRadialGradient(this.W / 2, this.H / 2, Math.min(this.W, this.H) * 0.28, this.W / 2, this.H / 2, Math.max(this.W, this.H) * 0.72);
            g.addColorStop(0, 'rgba(229, 52, 46, 0)');
            g.addColorStop(1, `rgba(229, 52, 46, ${(0.42 * k).toFixed(3)})`);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, this.W, this.H);
        }
    }
    /** Голубь-воришка: пиксельный, с двумя кадрами взмаха, полоской жизни
      над головой и белой вспышкой при ударе лапкой */ drawPigeon(ts) {
        const g = this.pigeon;
        if (!g) return;
        const { ctx } = this;
        const u = this.u;
        // Взмах крыльев: в полёте часто, в парении — лениво
        const flapMs = g.state === 'hover' ? 260 : 90;
        const frame = Math.floor(ts / flapMs) % 2 === 0;
        // Тень под голубем — пока он в деле (поверженный уже улетает)
        if (!g.downed) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.ellipse(g.x, this.cup.y + 22 * u, 24 * u, 6 * u, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // Клюв смотрит в сторону движения/стаканчика (спрайт смотрит влево)
        let faceLeft = true;
        if (g.state === 'hover') faceLeft = g.x > this.cup.x - 10 * u;
        else if (g.state === 'flee') faceLeft = -g.side < 0;
        else faceLeft = (Math.sign(g.hx - g.x) || -g.side) < 0;
        const dive = g.state === 'hover' ? Math.max(0, Math.sin(g.stateT * 6)) * 5 * u : 0;
        // Поверженный улетает кувырком, крутясь через крыло
        const rot = g.downed ? ts * 0.028 * -g.side : g.state === 'flee' ? -0.3 : Math.sin(ts * 0.003) * 0.06;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, frame ? this.sp.pigeon0 : this.sp.pigeon1, g.x, g.y + dive, 3.1 * u, {
            rot,
            sx: faceLeft ? 1 : -1
        });
        // Вспышка попадания: белое кольцо вокруг взъерошенного воришки
        if (g.flash > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, g.flash) * 0.8;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = Math.max(2, 2.5 * u);
            ctx.beginPath();
            ctx.arc(g.x, g.y + dive, 36 * u, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // ПОЛОСКА ЖИЗНИ: насечки = сколько ударов ещё выдержит. Прячется,
        // когда воришка уже улетает (повержен или испугался)
        if (g.state !== 'flee') {
            const bw = 46 * u;
            const bh = 7 * u;
            const bx = g.x - bw / 2;
            const by = g.y - 42 * u + dive;
            ctx.fillStyle = 'rgba(24, 10, 4, 0.9)';
            ctx.fillRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u);
            ctx.fillStyle = '#3A2410';
            ctx.fillRect(bx, by, bw, bh);
            const frac = Math.max(0, g.hp / g.maxHp);
            ctx.fillStyle = frac > 0.5 ? '#7ED957' : frac > 0.25 ? '#FFC93C' : '#E5342E';
            ctx.fillRect(bx, by, bw * frac, bh);
            ctx.fillStyle = 'rgba(24, 10, 4, 0.55)';
            for(let i = 1; i < g.maxHp; i++){
                ctx.fillRect(bx + bw * i / g.maxHp - u, by, Math.max(1.5, 2 * u), bh);
            }
            if (g.flash > 0) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, g.flash);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = Math.max(1.5, 1.5 * u);
                ctx.strokeRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u);
                ctx.restore();
            }
        }
    }
    /** БОСС «МАЛЫШ»: упитанный ребёнок крупнее воришки-голубя. Зелёный
      комбинезончик с карманчиком, хохолок, сердитые брови и надутый ротик.
      Бродит, рвётся к корзине и гребёт из неё. Полоска жизней над головой */ drawBoss() {
        const b = this.boss;
        if (!b) return;
        const { ctx } = this;
        const u = this.u;
        const wob = Math.sin(b.wobble);
        const bob = wob * 3 * u;
        const tilt = wob * 0.07;
        const R = (b.kind === 'lion' ? 62 : b.kind === 'marten' ? 40 : b.kind === 'pigeon' ? 62 : 44) * u // базовый радиус тела
        ;
        // тень на полу — босс уже в деле
        if (b.state !== 'in') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.beginPath();
            ctx.ellipse(b.x, this.cup.y + 22 * u, (b.kind === 'pigeon' ? 44 : b.kind === 'marten' ? 24 : b.kind === 'lion' ? 40 : 30) * u, 7 * u, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        ctx.translate(b.x, b.y + bob);
        ctx.rotate(tilt);
        if (b.kind === 'lion') {
            /* ═══════ ЛЬВ: царь-зверь с гривой-щитом (v0.0.33), v0.0.46 —
         ФИНАЛЬНЫЙ БОСС: подрос, окутан мрачной аурой, глаза ГОРЯТ ═══════ */ const roarPulse = b.roar > 0 ? 1 + 0.16 * Math.sin(b.stateT * 26) : 1;
            /* АУРА ЦАРЯ: грозное зарево за гривой — финальный босс сам себе сцена */ const aura = ctx.createRadialGradient(0, -R * 0.42, R * 0.18, 0, -R * 0.42, R * 1.72);
            aura.addColorStop(0, 'rgba(255, 150, 40, 0.3)');
            aura.addColorStop(0.55, 'rgba(122, 42, 12, 0.2)');
            aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(0, -R * 0.42, R * 1.72, 0, Math.PI * 2);
            ctx.fill();
            // хвост с кисточкой
            ctx.strokeStyle = '#D08A2E';
            ctx.lineWidth = 6 * u;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(R * 0.55, R * 0.3);
            ctx.quadraticCurveTo(R * 1.25, R * 0.15, R * 1.1, -R * 0.35);
            ctx.stroke();
            ctx.fillStyle = '#8F4314';
            ctx.beginPath();
            ctx.arc(R * 1.12, -R * 0.42, 7 * u, 0, Math.PI * 2);
            ctx.fill();
            // четыре лапы-столбика
            const legSwing = Math.sin(b.wobble) * 4 * u;
            ctx.fillStyle = '#E9A23B';
            ctx.beginPath();
            ctx.ellipse(-R * 0.42 + legSwing, R * 0.66, 8 * u, 11 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(-R * 0.12 - legSwing, R * 0.7, 8 * u, 11 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(R * 0.16 + legSwing, R * 0.7, 8 * u, 11 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(R * 0.44 - legSwing, R * 0.66, 8 * u, 11 * u, 0, 0, Math.PI * 2);
            ctx.fill();
            // тело: золотой бок за гривой
            ctx.fillStyle = '#E9A23B';
            ctx.beginPath();
            ctx.ellipse(0, R * 0.22, R * 0.82, R * 0.58, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#D08A2E';
            ctx.beginPath();
            ctx.ellipse(0, R * 0.34, R * 0.4, R * 0.26, 0, 0, Math.PI * 2);
            ctx.fill();
            // ГРИВА-ЩИТ: шипованный венец вокруг головы; в рокте пульсирует и светлеет
            const maneC1 = b.roar > 0 ? '#D8752A' : '#B35A1F';
            const maneC2 = b.roar > 0 ? '#8F4314' : '#7E3A10';
            const spikes = 12;
            const maneIn = R * 0.62;
            const maneOut = R * (b.roar > 0 ? 1.06 : 0.96) * roarPulse;
            for(let i = 0; i < spikes; i++){
                const a = i / spikes * Math.PI * 2 + b.wobble * 0.12;
                const a1 = a - Math.PI / spikes;
                const a2 = a + Math.PI / spikes;
                const cx = 0;
                const cy = -R * 0.5;
                ctx.fillStyle = i % 2 === 0 ? maneC1 : maneC2;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * maneOut, cy + Math.sin(a) * maneOut);
                ctx.lineTo(cx + Math.cos(a1) * maneIn, cy + Math.sin(a1) * maneIn);
                ctx.lineTo(cx + Math.cos(a2) * maneIn, cy + Math.sin(a2) * maneIn);
                ctx.closePath();
                ctx.fill();
            }
            // голова в гриве
            ctx.fillStyle = '#F0B45A';
            ctx.beginPath();
            ctx.arc(0, -R * 0.5, R * 0.5, 0, Math.PI * 2);
            ctx.fill();
            // морда и нос
            ctx.fillStyle = '#F8DCA8';
            ctx.beginPath();
            ctx.ellipse(0, -R * 0.34, R * 0.26, R * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5C2E0E';
            ctx.beginPath();
            ctx.moveTo(0, -R * 0.44);
            ctx.lineTo(-5 * u, -R * 0.52);
            ctx.lineTo(5 * u, -R * 0.52);
            ctx.closePath();
            ctx.fill();
            // царственный оскал в рокте, иначе — суровая линия рта
            ctx.strokeStyle = '#5C2E0E';
            ctx.lineWidth = 3 * u;
            if (b.roar > 0) {
                ctx.beginPath();
                ctx.ellipse(0, -R * 0.3, 9 * u, 6 * u, 0, 0, Math.PI);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(0, -R * 0.24, 6 * u, Math.PI * 0.15, Math.PI * 0.85);
                ctx.stroke();
            }
            // сердитые глаза-щёлки под тяжёлыми бровями
            ctx.strokeStyle = '#7E3A10';
            ctx.lineWidth = 5 * u;
            ctx.beginPath();
            ctx.moveTo(-R * 0.34, -R * 0.72);
            ctx.lineTo(-R * 0.1, -R * 0.62);
            ctx.moveTo(R * 0.34, -R * 0.72);
            ctx.lineTo(R * 0.1, -R * 0.62);
            ctx.stroke();
            /* v0.0.46: ЯНТАРНЫЕ ГЛАЗА с вертикальным зрачком — в рокте ГОРЯТ */ ctx.save();
            if (b.roar > 0) {
                ctx.shadowColor = '#FFC93C';
                ctx.shadowBlur = 16 * u;
            }
            ctx.fillStyle = b.roar > 0 ? '#FFE066' : '#FFB43C';
            ctx.beginPath();
            ctx.ellipse(-R * 0.2, -R * 0.56, 5.2 * u, 6.4 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(R * 0.2, -R * 0.56, 5.2 * u, 6.4 * u, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1D0F06';
            ctx.beginPath();
            ctx.ellipse(-R * 0.2, -R * 0.56, 1.7 * u, 4.6 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(R * 0.2, -R * 0.56, 1.7 * u, 4.6 * u, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // клыки в рокте: царственный оскал виден издалека
            if (b.roar > 0) {
                ctx.fillStyle = '#FFF3D6';
                ctx.beginPath();
                ctx.moveTo(-7 * u, -R * 0.3);
                ctx.lineTo(-4 * u, -R * 0.3 + 10 * u);
                ctx.lineTo(-1.5 * u, -R * 0.3);
                ctx.closePath();
                ctx.moveTo(7 * u, -R * 0.3);
                ctx.lineTo(4 * u, -R * 0.3 + 10 * u);
                ctx.lineTo(1.5 * u, -R * 0.3);
                ctx.closePath();
                ctx.fill();
            }
        } else if (b.kind === 'pigeon') {
            /* ═══════ МЕГА-ГОЛУБЬ: огромная сизая птица, бей по ГЛАЗАМ (v0.0.38) ═══════
         Тело неуязвимо — зерно отскакивает, лапка по телу ничего не даёт.
         Два мелких глаза с красной радужкой на голове — единственные
         уязвимости; в клевке голова выбрасывается вперёд */ ctx.rotate(-tilt); // птица летит ровно: хитбоксы глаз считаются без поворота
            const face = this.cup.x > b.x ? 1 : -1 // клюв смотрит на корзину
            ;
            const lunge = (b.state === 'swat' ? b.swing : b.state === 'charge' ? 0.25 : 0) * R * 0.55;
            const flapA = Math.sin(b.state === 'charge' ? b.stateT * 34 : b.wobble * 1.6);
            // хвост: три пера-клина веером
            ctx.fillStyle = '#6E8299';
            for(let i = -1; i <= 1; i++){
                ctx.save();
                ctx.translate(-face * R * 0.85, R * 0.08);
                ctx.rotate(-face * (0.42 + i * 0.3));
                ctx.beginPath();
                ctx.moveTo(0, -3.5 * u);
                ctx.lineTo(-R * 0.62, -i * 3 * u);
                ctx.lineTo(0, 3.5 * u);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            // крыло: в пике машет часто, в парении лениво
            ctx.save();
            ctx.translate(-face * R * 0.08, -R * 0.05);
            ctx.rotate(-face * flapA * 0.42 - 0.2);
            ctx.fillStyle = '#7E93AB';
            ctx.beginPath();
            ctx.ellipse(-face * R * 0.34, 0, R * 0.46, R * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5C6E84';
            ctx.beginPath();
            ctx.ellipse(-face * R * 0.58, R * 0.05, R * 0.2, R * 0.13, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // лапки поджаты
            ctx.strokeStyle = '#D97C4A';
            ctx.lineWidth = 3.5 * u;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-face * R * 0.05, R * 0.56);
            ctx.lineTo(-face * R * 0.28, R * 0.66);
            ctx.moveTo(face * R * 0.18, R * 0.58);
            ctx.lineTo(-face * R * 0.02, R * 0.68);
            ctx.stroke();
            // тело: крупный сизый овал, брюшко светлее
            ctx.fillStyle = '#8FA3BF';
            ctx.beginPath();
            ctx.ellipse(0, 0, R * 0.95, R * 0.62, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#C9D6E4';
            ctx.beginPath();
            ctx.ellipse(face * R * 0.18, R * 0.2, R * 0.52, R * 0.34, 0, 0, Math.PI * 2);
            ctx.fill();
            // радужный отлив на шее — фирменный «городской» голубь
            ctx.fillStyle = 'rgba(76, 140, 108, 0.75)';
            ctx.beginPath();
            ctx.ellipse(face * R * 0.5, -R * 0.28, R * 0.26, R * 0.18, face * 0.5, 0, Math.PI * 2);
            ctx.fill();
            // ГОЛОВА: выбрасывается вперёд в клевке (координаты держать
            // СИНХРОННО с pigeonEyePoints — от них считаются хитбоксы глаз)
            const hcx = face * (R * 0.72 + lunge);
            const hcy = -R * 0.5;
            ctx.strokeStyle = '#8FA3BF';
            ctx.lineWidth = R * 0.3;
            ctx.beginPath();
            ctx.moveTo(face * R * 0.42, -R * 0.16);
            ctx.lineTo(hcx, hcy);
            ctx.stroke();
            ctx.fillStyle = '#8FA3BF';
            ctx.beginPath();
            ctx.arc(hcx, hcy, R * 0.4, 0, Math.PI * 2);
            ctx.fill();
            // клюв: верхний клин с восковицей
            ctx.fillStyle = '#D98E4A';
            ctx.beginPath();
            ctx.moveTo(hcx + face * R * 0.3, hcy - R * 0.1);
            ctx.lineTo(hcx + face * R * 0.78, hcy + R * 0.02);
            ctx.lineTo(hcx + face * R * 0.28, hcy + R * 0.12);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#C8CFD8';
            ctx.beginPath();
            ctx.arc(hcx + face * R * 0.24, hcy - R * 0.16, R * 0.08, 0, Math.PI * 2);
            ctx.fill();
            // ГЛАЗА-УЯЗВИМОСТИ: белок, красная радужка, зрачок, блик — мелкие,
            // но заметные. Координаты берём из pigeonEyePoints — они и хитбоксы
            const bossEyes = this.pigeonEyePoints(b);
            for (const e of bossEyes){
                const ex = e.x - b.x;
                const ey = e.y - (b.y + bob);
                ctx.fillStyle = '#F4F0E6';
                ctx.beginPath();
                ctx.arc(ex, ey, e.r * 1.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#E5342E';
                ctx.beginPath();
                ctx.arc(ex, ey, e.r * 0.95, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2B1A0E';
                ctx.beginPath();
                ctx.arc(ex + face * e.r * 0.15, ey, e.r * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(ex - e.r * 0.3, ey - e.r * 0.35, e.r * 0.22, 0, Math.PI * 2);
                ctx.fill();
                // сердитая бровь — читается как «целься сюда»
                ctx.strokeStyle = '#3E4C5E';
                ctx.lineWidth = 2.5 * u;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(ex - face * e.r * 1.6, ey - e.r * 1.8);
                ctx.lineTo(ex + face * e.r * 1.3, ey - e.r * 1.1);
                ctx.stroke();
            }
        } else if (b.kind === 'marten') {
            /* ═══════ КУНИЦА ЛАНА: юркая воровка в бордовом шарфе (v0.0.33) ═══════ */ const lean = Math.sin(b.wobble * 1.6) * 0.18;
            // длинный пышный хвост с тёмным кончиком
            ctx.strokeStyle = '#8A5A2B';
            ctx.lineWidth = 10 * u;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-R * 0.6, R * 0.25);
            ctx.quadraticCurveTo(-R * 1.5, R * 0.15 + lean * 30 * u, -R * 1.35, -R * 0.5);
            ctx.stroke();
            ctx.strokeStyle = '#4E2E10';
            ctx.lineWidth = 11 * u;
            ctx.beginPath();
            ctx.moveTo(-R * 1.28, -R * 0.3 + lean * 18 * u);
            ctx.lineTo(-R * 1.36, -R * 0.52);
            ctx.stroke();
            // тело: вытянутая волна — по земле стелется
            ctx.fillStyle = '#8A5A2B';
            ctx.beginPath();
            ctx.ellipse(0, R * 0.28, R * 0.92, R * 0.42, lean * 0.25, 0, Math.PI * 2);
            ctx.fill();
            // брюшко
            ctx.fillStyle = '#E8D9B0';
            ctx.beginPath();
            ctx.ellipse(0, R * 0.4, R * 0.5, R * 0.2, lean * 0.25, 0, Math.PI * 2);
            ctx.fill();
            // лапки-бегунки: мелькают под телом
            const runA = Math.sin(b.wobble * 3) * 7 * u;
            ctx.strokeStyle = '#6E4418';
            ctx.lineWidth = 7 * u;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-R * 0.35, R * 0.55);
            ctx.lineTo(-R * 0.35 + runA, R * 0.85);
            ctx.moveTo(R * 0.35, R * 0.55);
            ctx.lineTo(R * 0.35 - runA, R * 0.85);
            ctx.stroke();
            // голова с острой мордочкой
            ctx.save();
            ctx.rotate(lean * 0.5);
            ctx.fillStyle = '#9C6833';
            ctx.beginPath();
            ctx.arc(0, -R * 0.42, R * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(R * 0.18, -R * 0.52);
            ctx.lineTo(R * 0.62, -R * 0.34);
            ctx.lineTo(R * 0.16, -R * 0.2);
            ctx.closePath();
            ctx.fill();
            // носик
            ctx.fillStyle = '#241108';
            ctx.beginPath();
            ctx.arc(R * 0.6, -R * 0.34, 3.5 * u, 0, Math.PI * 2);
            ctx.fill();
            // светлая маска вокруг глаз — фирменный знак куницы
            ctx.fillStyle = '#E8D9B0';
            ctx.beginPath();
            ctx.arc(-R * 0.02, -R * 0.56, 9 * u, 0, Math.PI * 2);
            ctx.arc(R * 0.3, -R * 0.6, 7 * u, 0, Math.PI * 2);
            ctx.fill();
            // хитрые глазки
            ctx.fillStyle = '#241108';
            ctx.beginPath();
            ctx.arc(0, -R * 0.56, 4 * u, 0, Math.PI * 2);
            ctx.arc(R * 0.3, -R * 0.6, 3.5 * u, 0, Math.PI * 2);
            ctx.fill();
            // усмешка-дуга
            ctx.strokeStyle = '#4E2E10';
            ctx.lineWidth = 2.5 * u;
            ctx.beginPath();
            ctx.arc(R * 0.3, -R * 0.44, 7 * u, Math.PI * 0.1, Math.PI * 0.7);
            ctx.stroke();
            // БОРДОВЫЙ ШАРФ: чтобы не путали с домашней NANA
            ctx.fillStyle = '#A33327';
            ctx.beginPath();
            ctx.rect(-R * 0.34, -R * 0.3, R * 0.72, 10 * u);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(R * 0.05, -R * 0.22);
            ctx.lineTo(R * 0.3 + lean * 10 * u, R * 0.24);
            ctx.lineTo(R * 0.02, R * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (b.kind === 'gypsy') {
            /* ═══════ ЦЫГАНСКАЯ РУКА: огромная ладонь в кольцах (v0.0.39) ═══════
         Тянется с потолка, сгребает рассыпанные зёрна и швыряет их В ЭКРАН.
         Сама рука — мишень: шлёпай лапкой по ладони! */ const skin = '#C98A5E';
            const skinHi = '#DCA579';
            const skinLo = '#A96F44';
            const gold = '#FFC93C';
            const goldLo = '#E8A81C';
            // предплечье: лента от потолка к ладони, слегка изгибается
            ctx.strokeStyle = skin;
            ctx.lineWidth = R * 0.78;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(wob * 10 * u, -R * 2.7);
            ctx.quadraticCurveTo(R * 0.16, -R * 1.5, 0, -R * 0.5);
            ctx.stroke();
            ctx.strokeStyle = skinHi;
            ctx.lineWidth = R * 0.3;
            ctx.beginPath();
            ctx.moveTo(wob * 10 * u - R * 0.2, -R * 2.5);
            ctx.quadraticCurveTo(R * 0.02, -R * 1.5, -R * 0.14, -R * 0.62);
            ctx.stroke();
            // пышный рукав с золотой оторочкой — из темноты кулис
            ctx.fillStyle = '#8E3B5C';
            ctx.beginPath();
            ctx.ellipse(wob * 10 * u, -R * 2.55, R * 0.78, R * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = gold;
            ctx.lineWidth = 3.5 * u;
            ctx.beginPath();
            ctx.ellipse(wob * 10 * u, -R * 2.3, R * 0.66, R * 0.16, 0, 0, Math.PI * 2);
            ctx.stroke();
            // БРАСЛЕТ из монеток на запястье — позвякивает при движениях
            for(let i = -1; i <= 1; i++){
                const cxx = i * R * 0.24 + Math.sin(b.wobble * 2.2 + i) * 2.5 * u;
                const cyy = -R * 0.92;
                ctx.fillStyle = i === 0 ? gold : goldLo;
                ctx.beginPath();
                ctx.arc(cxx, cyy, R * 0.15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.beginPath();
                ctx.arc(cxx - R * 0.05, cyy - R * 0.05, R * 0.045, 0, Math.PI * 2);
                ctx.fill();
            }
            /* Ладонь с пальцами: при броске вся кисть делает ЗАМАХ от запястья */ const throwA = b.swing > 0 ? Math.sin(Math.min(1, b.swing) * Math.PI) * 0.42 : 0;
            ctx.save();
            ctx.translate(0, -R * 0.55);
            ctx.rotate(throwA);
            ctx.translate(0, R * 0.55);
            // ЛАДОНЬ: пухлая, с большим пальцем сбоку
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.ellipse(0, 0, R * 0.72, R * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            // большой палец врозь с ноготком
            ctx.save();
            ctx.rotate(-0.55);
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.ellipse(-R * 0.78, R * 0.12, R * 0.34, R * 0.17, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#D8485E';
            ctx.beginPath();
            ctx.ellipse(-R * 1.08, R * 0.16, R * 0.1, R * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // четыре пальца ВНИЗ — веером, на кончиках красные ноготки
            const gypFingers = [
                -0.4,
                -0.14,
                0.14,
                0.42
            ];
            for(let i = 0; i < gypFingers.length; i++){
                const fx = (gypFingers[i] ?? 0) * R;
                const fl = R * (0.52 + (i === 1 || i === 2 ? 0.16 : 0)) // средние длиннее
                ;
                ctx.strokeStyle = skin;
                ctx.lineWidth = R * 0.23;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(fx, R * 0.32);
                ctx.quadraticCurveTo(fx + Math.sin(b.wobble * 1.8 + i) * 4 * u, R * 0.62, fx, R * 0.32 + fl);
                ctx.stroke();
                ctx.fillStyle = '#D8485E';
                ctx.beginPath();
                ctx.ellipse(fx, R * 0.34 + fl, R * 0.085, R * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();
                // КОЛЬЦА: на среднем и безымянном — золото с камнем
                if (i === 1 || i === 2) {
                    const ry = R * 0.5;
                    ctx.strokeStyle = gold;
                    ctx.lineWidth = 4.5 * u;
                    ctx.beginPath();
                    ctx.ellipse(fx, ry, R * 0.16, R * 0.1, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.fillStyle = i === 1 ? '#E5342E' : '#3E9C6B';
                    ctx.beginPath();
                    ctx.arc(fx, ry - R * 0.1, R * 0.075, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            // линии ладони — рука оживает
            ctx.strokeStyle = skinLo;
            ctx.lineWidth = 2 * u;
            ctx.beginPath();
            ctx.arc(R * 0.1, R * 0.05, R * 0.3, Math.PI * 1.15, Math.PI * 1.75);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(R * 0.05, R * 0.12, R * 0.2, Math.PI * 1.1, Math.PI * 1.8);
            ctx.stroke();
            ctx.restore();
        } else {
            /* ═══════ МАЛЫШ: как был — комбинезончик и хохолок ═══════ */ // ножки-коротышки: шаркают вразнобой
            const legSwing = Math.sin(b.wobble) * 5 * u;
            ctx.fillStyle = '#E8B48C';
            ctx.beginPath();
            ctx.ellipse(-16 * u + legSwing, R * 0.82, 7 * u, 9 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(16 * u - legSwing, R * 0.82, 7 * u, 9 * u, 0, 0, Math.PI * 2);
            ctx.fill();
            // тело: круглый комбинезончик с карманчиком
            ctx.fillStyle = '#7BC47F';
            ctx.beginPath();
            ctx.ellipse(0, R * 0.18, R * 0.74, R * 0.66, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5FA65F';
            ctx.beginPath();
            ctx.ellipse(0, R * 0.32, R * 0.34, R * 0.26, 0, 0, Math.PI * 2);
            ctx.fill();
            // ручки: в гребле машут, в рывке выставлены вперёд-вниз
            const armA = b.swing > 0 ? Math.sin(b.stateT * 18) * 0.6 : wob * 0.2;
            ctx.strokeStyle = '#E8B48C';
            ctx.lineWidth = 9 * u;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-R * 0.58, -R * 0.08);
            ctx.lineTo(-R * 0.9, R * 0.2 + Math.sin(armA) * 12 * u);
            ctx.moveTo(R * 0.58, -R * 0.08);
            ctx.lineTo(R * 0.9, R * 0.2 - Math.sin(armA) * 12 * u);
            ctx.stroke();
            // голова: крупная, почти в размер тела
            ctx.fillStyle = '#F7C9A3';
            ctx.beginPath();
            ctx.arc(0, -R * 0.62, R * 0.58, 0, Math.PI * 2);
            ctx.fill();
            // хохолок-завиток
            ctx.strokeStyle = '#B4653C';
            ctx.lineWidth = 5 * u;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, -R * 1.04, 9 * u, Math.PI * 0.15, Math.PI * 1.05);
            ctx.stroke();
            // сердитые брови и глаза
            ctx.strokeStyle = '#6B421F';
            ctx.lineWidth = 4.5 * u;
            ctx.beginPath();
            ctx.moveTo(-R * 0.36, -R * 0.8);
            ctx.lineTo(-R * 0.12, -R * 0.7);
            ctx.moveTo(R * 0.36, -R * 0.8);
            ctx.lineTo(R * 0.12, -R * 0.7);
            ctx.stroke();
            ctx.fillStyle = '#2B1A0E';
            ctx.beginPath();
            ctx.arc(-R * 0.22, -R * 0.58, 4.5 * u, 0, Math.PI * 2);
            ctx.arc(R * 0.22, -R * 0.58, 4.5 * u, 0, Math.PI * 2);
            ctx.fill();
            // надутый ротик и румянец
            ctx.strokeStyle = '#B4653C';
            ctx.lineWidth = 3.5 * u;
            ctx.beginPath();
            ctx.arc(0, -R * 0.32, 7 * u, Math.PI * 0.15, Math.PI * 0.85);
            ctx.stroke();
            ctx.fillStyle = 'rgba(232, 108, 108, 0.55)';
            ctx.beginPath();
            ctx.arc(-R * 0.44, -R * 0.44, 6 * u, 0, Math.PI * 2);
            ctx.arc(R * 0.44, -R * 0.44, 6 * u, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        /* ЛЕВ В РОКТЕ: расходящиеся волны вокруг гривы — видна зона отброса */ if (b.kind === 'lion' && b.roar > 0) {
            const w1 = b.roar / LION_ROAR_DUR * 96 * u;
            ctx.strokeStyle = `rgba(255, 201, 60, ${Math.min(0.8, b.roar * 1.4)})`;
            ctx.lineWidth = 3 * u;
            ctx.beginPath();
            ctx.arc(b.x, b.y + bob, R * 1.15 + (LION_ROAR_DUR - b.roar) * 130 * u, 0, Math.PI * 2);
            ctx.stroke();
            if (w1 > 0) {
                ctx.globalAlpha = Math.min(0.5, b.roar);
                ctx.beginPath();
                ctx.arc(b.x, b.y + bob, R * 1.15 + (LION_ROAR_DUR - b.roar) * 60 * u, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
        // вспышка при попадании/касании: белое кольцо вокруг босса
        if (b.flash > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, b.flash) * 0.8;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = Math.max(2, 3 * u);
            ctx.beginPath();
            ctx.arc(b.x, b.y + bob, R * 1.18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // ПОЛОСКА ЖИЗНЕЙ над головой: насечки — сколько ещё пинков выдержит
        if (b.state !== 'flee') {
            const bw = 64 * u;
            const bh = 8 * u;
            const bx = b.x - bw / 2;
            const by = b.y - R * 1.38 + bob;
            ctx.fillStyle = 'rgba(24, 10, 4, 0.9)';
            ctx.fillRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u);
            ctx.fillStyle = '#3A2410';
            ctx.fillRect(bx, by, bw, bh);
            const frac = Math.max(0, b.hp / b.maxHp);
            ctx.fillStyle = frac > 0.5 ? '#FF8FA3' : frac > 0.25 ? '#FFC93C' : '#E5342E';
            ctx.fillRect(bx, by, bw * frac, bh);
            ctx.fillStyle = 'rgba(24, 10, 4, 0.55)';
            for(let i = 1; i < b.maxHp; i++){
                ctx.fillRect(bx + bw * i / b.maxHp - u, by, Math.max(1.5, 2 * u), bh);
            }
            if (b.flash > 0) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, b.flash);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = Math.max(1.5, 1.5 * u);
                ctx.strokeRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u);
                ctx.restore();
            }
        }
    }
    /** ЗЁРНА В ЭКРАН: растущая попкорнинка летит к цели + пульсирующий
      круг-телеграф у точки прилёта — успей увести лапку! */ drawGypsySeeds(ts) {
        const { ctx } = this;
        const u = this.u;
        for (const s of this.seeds){
            const p = Math.min(1, s.t / GYPSY_SEED_DUR);
            const x = s.sx + (s.tx - s.sx) * p;
            const y = s.sy + (s.ty - s.sy) * p;
            // ТЕЛЕГРАФ: круг у цели проявляется по мере подлёта
            ctx.save();
            ctx.globalAlpha = 0.16 + 0.3 * p + 0.08 * Math.sin(ts * 0.02);
            ctx.strokeStyle = '#FF6B5E';
            ctx.lineWidth = Math.max(1.5, 2.5 * u);
            ctx.setLineDash([
                7 * u,
                6 * u
            ]);
            ctx.beginPath();
            ctx.arc(s.tx, s.ty, GYPSY_SEED_POP_R * u * (0.55 + 0.45 * p), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            // САМО ЗЕРНО: растёт с ускорением — «летит НА КАМЕРУ»
            const grow = 0.5 + 1.9 * p * p;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.popcorn, x, y, 2.6 * this.popScale * u * grow, {
                rot: s.rot
            });
            // блик по краю — объём
            if (this.perfTier < 1) {
                ctx.save();
                ctx.globalAlpha = 0.5 + 0.5 * p;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = Math.max(1, 1.6 * u);
                ctx.beginPath();
                ctx.arc(x, y, (10 + 16 * grow) * u * this.popScale, Math.PI * 0.9, Math.PI * 1.6);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    /** КОГТИ ОНЛИФАНСИЯ (v0.0.46): пульсирующий круг-телеграф, в который
      сверху опускаются три когтистых дуги — удар следует сразу после */ drawLionSlams() {
        const { ctx } = this;
        const u = this.u;
        for (const s of this.lionSlams){
            const q = Math.min(1, s.t / LION_SLAM_TELE);
            const pulse = 1 + Math.sin(s.t * 22) * 0.07;
            const r = LION_SLAM_R * u * pulse;
            // КРУГ-ТЕЛЕГРАФ: сжимается к удару, к краю — краснеет
            ctx.save();
            ctx.strokeStyle = q > 0.72 ? '#FF6B5E' : '#FFC93C';
            ctx.globalAlpha = 0.4 + 0.4 * q;
            ctx.lineWidth = Math.max(2, 3.2 * u);
            ctx.beginPath();
            ctx.arc(s.x, s.y, r * (1.3 - 0.3 * q), 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = (0.14 + 0.24 * q) * 0.5;
            ctx.fillStyle = q > 0.72 ? '#FF6B5E' : '#FFC93C';
            ctx.beginPath();
            ctx.arc(s.x, s.y, r * (1.3 - 0.3 * q), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // ТРИ КОГТЯ СВЕРХУ: опускаются к кругу по мере телеграфа
            ctx.save();
            ctx.strokeStyle = 'rgba(92, 46, 14, 0.85)';
            ctx.lineWidth = 5 * u;
            ctx.lineCap = 'round';
            for(let k = 0; k < 3; k++){
                const off = (k - 1) * r * 0.46;
                const len = r * (0.55 + 1.05 * q);
                const topY = s.y - r * 1.55;
                ctx.beginPath();
                ctx.moveTo(s.x + off, topY);
                ctx.quadraticCurveTo(s.x + off + 10 * u, topY + len * 0.6, s.x + off - 5 * u, topY + len);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
    /** ЛАНА: длинные лапки с когтями — рука-лента от тела до корзинки */ drawLanaPaws() {
        const b = this.boss;
        if (!b) return;
        const { ctx } = this;
        const u = this.u;
        for (const p of b.paws){
            const px = p.px;
            const py = p.py;
            const w0 = 9.5 * u // полуширина у плеча
            ;
            const w1 = 5.5 * u // полуширина у кисти
            ;
            if (p.state === 'cut') {
                /* Отлетевший кончик: крутится и тает */ const a = Math.max(0, 1 - p.cutT / 0.8);
                ctx.save();
                ctx.globalAlpha = a;
                ctx.translate(p.cutX, p.cutY);
                ctx.rotate(p.cutRot);
                this.drawLanaHand(u);
                ctx.restore();
                /* Обрубок у плеча втягивается */ ctx.fillStyle = '#8A5A2B';
                ctx.beginPath();
                ctx.moveTo(p.rx + px * w0, p.ry + py * w0);
                ctx.lineTo(p.tx + px * w1 * 0.8, p.ty + py * w1 * 0.8);
                ctx.lineTo(p.tx - px * w1 * 0.8, p.ty - py * w1 * 0.8);
                ctx.lineTo(p.rx - px * w0, p.ry - py * w0);
                ctx.closePath();
                ctx.fill();
                continue;
            }
            /* Рука: сужающаяся лента (шерсть) */ ctx.fillStyle = '#8A5A2B';
            ctx.beginPath();
            ctx.moveTo(p.rx + px * w0, p.ry + py * w0);
            ctx.lineTo(p.tx + px * w1, p.ty + py * w1);
            ctx.lineTo(p.tx - px * w1, p.ty - py * w1);
            ctx.lineTo(p.rx - px * w0, p.ry - py * w0);
            ctx.closePath();
            ctx.fill();
            /* Светлая полоска-брюшко вдоль лапки */ ctx.fillStyle = '#C9A468';
            ctx.beginPath();
            ctx.moveTo(p.rx + px * w0 * 0.45, p.ry + py * w0 * 0.45);
            ctx.lineTo(p.tx + px * w1 * 0.45, p.ty + py * w1 * 0.45);
            ctx.lineTo(p.tx - px * w1 * 0.45, p.ty - py * w1 * 0.45);
            ctx.lineTo(p.rx - px * w0 * 0.45, p.ry - py * w0 * 0.45);
            ctx.closePath();
            ctx.fill();
            /* Борцовая манжета-шарф у плеча — фирменный знак Ланы */ const scx = p.rx + p.dx * 7 * u;
            const scy = p.ry + p.dy * 7 * u;
            ctx.fillStyle = '#A33327';
            ctx.beginPath();
            ctx.moveTo(scx + px * (w0 + 2.5 * u), scy + py * (w0 + 2.5 * u));
            ctx.lineTo(scx + p.dx * 11 * u + px * (w0 - u), scy + p.dy * 11 * u + py * (w0 - u));
            ctx.lineTo(scx + p.dx * 11 * u - px * (w0 - u), scy + p.dy * 11 * u - py * (w0 - u));
            ctx.lineTo(scx - px * (w0 + 2.5 * u), scy - py * (w0 + 2.5 * u));
            ctx.closePath();
            ctx.fill();
            /* Украденные зёрнышки вдоль лапки */ if (p.loot > 0) {
                ctx.fillStyle = '#FFF3D6';
                for(let k = 0; k < p.loot; k++){
                    const t = 0.4 + k * 0.18;
                    if (t > 1) break;
                    ctx.beginPath();
                    ctx.ellipse(p.rx + p.dx * p.len * t, p.ry + p.dy * p.len * t, 4 * u, 3 * u, Math.atan2(p.dy, p.dx), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            /* Кисть с когтями на кончике — у корзинки когти раздвинуты */ ctx.save();
            ctx.translate(p.tx, p.ty);
            ctx.rotate(Math.atan2(p.dy, p.dx));
            this.drawLanaHand(u, p.state === 'hold' ? 1.2 : 1);
            ctx.restore();
        }
    }
    /** Кисть лапки Ланы: мохнатый кулак и три серповидных когтя */ drawLanaHand(u, scale = 1) {
        const { ctx } = this;
        ctx.fillStyle = '#6E4418';
        ctx.beginPath();
        ctx.arc(0, 0, 6.5 * u * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F5EFE2';
        for (const [ox, oy, rot] of [
            [
                -4,
                -3,
                -0.55
            ],
            [
                0.5,
                -4.5,
                0
            ],
            [
                5,
                -2.5,
                0.55
            ]
        ]){
            ctx.save();
            ctx.translate(ox * u * scale, oy * u * scale);
            ctx.rotate(rot);
            ctx.beginPath();
            ctx.moveTo(-2.2 * u * scale, 0);
            ctx.quadraticCurveTo(-0.5 * u * scale, -8 * u * scale, 3 * u * scale, -1.4 * u * scale);
            ctx.quadraticCurveTo(0.6 * u * scale, -3 * u * scale, -2.2 * u * scale, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    /** «Попкорнный туман»: ступенчатые кольца темноты вокруг лапки (8-битный стиль) */ drawFog() {
        const { ctx } = this;
        const u = this.u;
        const rings = [
            [
                150,
                0.86
            ],
            [
                120,
                0.8
            ],
            [
                95,
                0.66
            ],
            [
                72,
                0.45
            ],
            [
                52,
                0.22
            ]
        ];
        for (const [r, a] of rings){
            ctx.fillStyle = `rgba(12, 6, 2, ${a})`;
            ctx.beginPath();
            ctx.rect(0, 0, this.W, this.H);
            ctx.arc(this.paw.x, this.paw.y, r * u, 0, Math.PI * 2);
            ctx.fill('evenodd');
        }
    }
    /** Деревянный столик + детальный стаканчик с анимацией наполнения.
      Корзина больше не «висит в воздухе»: стоит на столешнице. */ drawCup(ts) {
        const { ctx } = this;
        const u = this.u;
        const s = this.cupScale;
        const sq = this.cup.squash;
        // «Дыхание» стаканчика: лёгкое покачивание в такт музыке (кроме подскока при сдаче)
        const breathe = 1 + Math.sin(ts * 0.0023) * 0.012;
        const sx = 1 + 0.08 * sq;
        const sy = breathe - 0.1 * sq;
        /* --- столик: ножки и столешница --- */ const tableY = this.tableY;
        ctx.fillStyle = '#8a5330'; // ножки
        ctx.fillRect(this.cup.x - 56 * u, tableY + 6 * u, 9 * u, 24 * u);
        ctx.fillRect(this.cup.x + 47 * u, tableY + 6 * u, 9 * u, 24 * u);
        ctx.fillStyle = '#B07A3F'; // столешница
        ctx.fillRect(this.cup.x - 66 * u, tableY - 4 * u, 132 * u, 10 * u);
        ctx.fillStyle = '#6B421F'; // тёмная кромка столешницы
        ctx.fillRect(this.cup.x - 66 * u, tableY + 4 * u, 132 * u, 3 * u);
        /* --- тень стаканчика на столешнице --- */ ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
        ctx.beginPath();
        ctx.ellipse(this.cup.x, tableY + 2 * u, 46 * u * sx, 5 * u, 0, 0, Math.PI * 2);
        ctx.fill();
        /* --- корпус стаканчика (детальный спрайт 48×54) --- */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.cup, this.cup.x, this.cup.y, s, {
            sx,
            sy
        });
        /* --- наполнение ВНУТРИ стаканчика: растёт вместе с выполнением нормы --- */ const progress = this.quota > 0 ? this.collected / this.quota : 0;
        const fill = Math.min(CUP_FILL_POS.length, Math.ceil(progress * CUP_FILL_POS.length));
        if (fill > 0) {
            ctx.save();
            // Внутренняя трапеция стаканчика — зёрна не выходят за бумажные стенки
            const topY = this.cup.y - 22.4 * s * sy;
            const botY = this.cup.y + 22.4 * s * sy;
            const halfTop = 20.8 * s * sx;
            const halfBot = 12.8 * s * sx;
            ctx.beginPath();
            ctx.moveTo(this.cup.x - halfTop, topY);
            ctx.lineTo(this.cup.x + halfTop, topY);
            ctx.lineTo(this.cup.x + halfBot, botY);
            ctx.lineTo(this.cup.x - halfBot, botY);
            ctx.closePath();
            ctx.clip();
            for(let i = 0; i < fill; i++){
                const [ox, oy] = CUP_FILL_POS[i];
                // Каждое новое зёрнышко «пружинит» при появлении (easeOutBack)
                const age = this.fillPop[i] ?? 1;
                const pop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["easeOutBack"])(Math.min(1, age / 0.3));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.popcorn, this.cup.x + ox * s * sx, this.cup.y + oy * s * sy, s * 0.88 * (0.55 + 0.45 * pop), {
                    rot: i * 0.9 + (1 - pop) * 1.1,
                    alpha: Math.min(1, age * 3 + 0.25) * 0.88
                });
            }
            // Лёгкая притенённость — зёрна читаются «за стенкой», а не на поле
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = '#8a2f1d';
            ctx.fillRect(this.cup.x - halfTop, topY, halfTop * 2, botY - topY);
            ctx.restore();
        }
        /* --- искра над стаканчиком после сданного золотого зерна --- */ if (this.cupGlow > 0.01) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.sparkle, this.cup.x + 14 * u, this.cup.y - this.cupH * 0.62, 1.6 * u, {
                rot: ts * 0.006,
                alpha: Math.min(1, this.cupGlow) * 0.95
            });
        }
    }
    drawPieces(ts) {
        const { ctx } = this;
        const u = this.u;
        for (const p of this.pieces){
            // Мины-зерна статичны (никаких прыжков) — попкорн слегка «дышит»
            const bobAmp = p.kind === 'corn' ? 0 : 2.5;
            const bob = Math.sin(ts * 0.004 + p.phase) * bobAmp * u;
            const y = p.y + bob;
            const pop = p.spawn > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["easeOutBack"])(1 - p.spawn / (SPAWN_DUR + 0.5)) : 1;
            // Попкорн мельчает, мины толстеют — ступени каждые 5 уровней.
            // Ценные зёрна мельче: белое +1 крупное, золотое +5 — крохотное
            const base = p.kind === 'corn' ? 2.3 * this.cornScale : 2.6 * this.popScale * KIND_SCALE[p.kind];
            const scale = base * u * Math.max(0.05, pop);
            // Тень (плотнее — зерно заметно на любом фоне, даже на тёмном чердаке).
            // На низком тире авто-качества тени выключаются — экономим fillPath
            if (this.perfTier < 2) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
                ctx.beginPath();
                ctx.ellipse(p.x, p.y + 8 * u, 11 * u * pop, 5 * u * pop, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Кольцо опасности: пульсирует вокруг каждой мины — «заряжено!» видно
            // краем глаза, ещё до того, как рассмотрел шипы. На нижнем тире — статичный
            // спрайт мины и так красноречив, а stroke-дуги на слабых GPU дороги
            if (p.kind === 'corn' && this.perfTier < 2) {
                const pulse = 0.5 + 0.5 * Math.sin(ts * 0.006 + p.phase * 3);
                ctx.save();
                ctx.globalAlpha = 0.2 + 0.18 * pulse;
                ctx.strokeStyle = this.opts.colorblind ? '#7FB2FF' : '#FF5A4E';
                ctx.lineWidth = Math.max(1.5, 2 * u);
                ctx.beginPath();
                ctx.arc(p.x, y, (15 + 4 * pulse) * u * this.cornScale, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            const sprite = p.kind === 'corn' ? (this.opts.colorblind ? this.sp.minesCB : this.sp.mines)[this.opts.mineVariant] ?? this.sp.mines[0] : p.kind === 'golden' ? this.sp.golden : p.kind === 'caramel' ? this.sp.caramel : p.kind === 'butter' ? this.sp.butter : p.kind === 'nipple' ? this.sp.nipple : this.sp.popcorn;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, sprite, p.x, y, scale, {
                rot: p.rot
            });
            // Золотое зерно светится: готовый радиальный спрайт поверх зерна
            // с globalCompositeOperation='lighter' — свечение почти бесплатно,
            // потому что градиент пререндерен один раз в спрайт
            if (p.kind === 'golden' && this.perfTier < 1) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = 0.4 + 0.2 * Math.sin(ts * 0.005 + p.phase * 2);
                const glowScale = scale * this.sp.golden.w * 3.2 / this.sp.goldenGlow.w;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.goldenGlow, p.x, y, glowScale);
                ctx.restore();
            }
            // Режим дальтоников: пульсирующая белая метка над миной
            if (p.kind === 'corn' && this.opts.colorblind) {
                const blink = 0.6 + 0.4 * Math.sin(ts * 0.008 + p.phase);
                ctx.save();
                ctx.globalAlpha = blink;
                ctx.font = `700 ${Math.round(15 * u)}px system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.lineWidth = 3 * u;
                ctx.strokeStyle = 'rgba(18, 39, 92, 0.95)';
                ctx.strokeText('!', p.x, y - 16 * u);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('!', p.x, y - 16 * u);
                ctx.restore();
            }
            if (p.kind === 'golden') {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.sparkle, p.x + 10 * u, y - 11 * u, 1.15 * u, {
                    rot: ts * 0.004,
                    alpha: 0.95
                });
            }
            // Масляное зерно — скромный блеск, чтобы отличалось на бегу
            if (p.kind === 'butter') {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.sparkle, p.x - 9 * u, y - 10 * u, 0.8 * u, {
                    rot: -ts * 0.003,
                    alpha: 0.5 + 0.3 * Math.sin(ts * 0.005 + p.phase)
                });
            }
        }
        /* БОЛЬШАЯ ПОПКОРНИНА поверх зёрен: крупное облако с золотым свечением
       и кольцом-таймером — пока оно не замкнулось, приз можно поймать */ if (this.big) this.drawBig(ts);
    }
    /** Отрисовка большой попкорнины: облако, свечение, таймер-кольцо */ drawBig(ts) {
        const { ctx } = this;
        const u = this.u;
        const b = this.big;
        if (!b) return;
        const pop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["easeOutBack"])(Math.min(1, b.t / 0.35));
        const bob = Math.sin(ts * 0.005 + b.phase) * 3 * u;
        const y = b.y + bob;
        const scale = 2.3 * u * Math.max(0.05, pop);
        /* Тень под облаком */ if (this.perfTier < 2) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
            ctx.beginPath();
            ctx.ellipse(b.x, b.y + 14 * u, 20 * u * pop, 8 * u * pop, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        /* Золотое свечение — как у золотого зерна, но жирнее */ if (this.perfTier < 1) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.5 + 0.22 * Math.sin(ts * 0.006 + b.phase * 2);
            const glowScale = scale * this.sp.big[this.bigKind].w * 2.4 / this.sp.goldenGlow.w;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.goldenGlow, b.x, y, glowScale);
            ctx.restore();
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.big[this.bigKind], b.x, y, scale, {
            rot: Math.sin(ts * 0.003 + b.phase) * 0.12
        });
        if (this.perfTier < 1) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.sparkle, b.x + 16 * u, y - 15 * u, 1.4 * u, {
                rot: ts * 0.005,
                alpha: 0.95
            });
        }
        /* Кольцо-таймер: остаток времени до побега. Меньше секунды — красное */ const left = Math.max(0, 1 - b.t / this.bigLife);
        const urgent = left < 0.4;
        const R = 15 * scale + 10 * u;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = urgent ? '#FF5A4E' : BIG_VARIANTS[this.bigKind].text;
        ctx.lineWidth = Math.max(2, 3.2 * u);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(b.x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
        ctx.stroke();
        ctx.restore();
    }
    drawFlying() {
        const { ctx } = this;
        const u = this.u;
        const tx = this.cup.x;
        const ty = this.cup.y - 26 * this.cupScale // горлышко стаканчика
        ;
        for (const f of this.flying){
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["easeOutQuad"])(f.t);
            const x = f.x0 + (tx - f.x0) * q;
            const y = f.y0 + (ty - f.y0) * q - Math.sin(q * Math.PI) * 30 * u;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, f.kind === 'golden' ? this.sp.golden : f.kind === 'caramel' ? this.sp.caramel : f.kind === 'butter' ? this.sp.butter : f.kind === 'nipple' ? this.sp.nipple : this.sp.popcorn, x, y, 2.6 * u * this.popScale * (KIND_SCALE[f.kind] ?? 1) * (1 - 0.45 * q), {
                rot: q * 3
            });
        }
    }
    drawPaw(ts) {
        const { ctx } = this;
        const u = this.u;
        if (!this.paw.seen && this.phase === 'idle') return;
        // Тряска при штрафе + сильная дрожь перка «Нервная лапа»
        const shake = Math.sin(ts * 0.055) * 5 * this.paw.hurt;
        const shiver = this.perk === 'shaky';
        const jx = shiver ? Math.sin(ts * 0.021) * 9 * u + Math.sin(ts * 0.047) * 6 * u : 0;
        const jy = shiver ? Math.cos(ts * 0.017) * 7 * u + Math.sin(ts * 0.053) * 4 * u : 0;
        // Шок от мины: мелкая дрожь «опешившей» лапки, пока не отпустило
        const shockJx = this.stun > 0 ? Math.sin(ts * 0.049) * 3.2 * u : 0;
        const shockJy = this.stun > 0 ? Math.cos(ts * 0.037) * 2.4 * u : 0;
        const px = this.paw.x + shake + jx + shockJx;
        const py = this.paw.y + jy + shockJy;
        /* След быстрого движения: призрачные отпечатки лапки гаснут позади —
       движение читается даже на мелком экране, и просто приятно глазу */ if (this.trail.length > 0 && this.perfTier < 2) {
            const ghostS = (this.perk === 'bigpaw' ? 3.6 : this.perk === 'smallpaw' ? 2.17 : 2.85) * u;
            for (const d of this.trail){
                const k = 1 - d.t / 0.26;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.paw, d.x, d.y, ghostS * (0.72 + 0.12 * k), {
                    alpha: 0.16 * k
                });
            }
        }
        /* v0.0.35: ореол и пульсирующий пунктир зоны подбора УБРАНЫ по запросу
       игрока — они мешали аккуратно обходить мины. Видимость на тёмном фоне
       держит сам силуэт лапки: чёткий тёмный контур нового спрайта */ // Тень лапки
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.beginPath();
        ctx.ellipse(px, py + 28 * u, 24 * u, 6 * u, 0, 0, Math.PI * 2);
        ctx.fill();
        const basePaw = this.perk === 'bigpaw' ? 3.6 : this.perk === 'smallpaw' ? 2.17 : 2.85;
        const s = basePaw * u * (1 + 0.13 * this.paw.pulse);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.paw, px, py, s);
        // Зёрна в лапке (стопкой над подушечкой)
        this.carried.forEach((c, i)=>{
            const wig = Math.sin(ts * 0.012 + i * 2) * 1.6 * u;
            const y = py - 30 * u - i * 14 * u * this.popScale + (1 - c.grabT) * 10 * u;
            const spr = c.kind === 'golden' ? this.sp.golden : c.kind === 'caramel' ? this.sp.caramel : c.kind === 'butter' ? this.sp.butter : c.kind === 'nipple' ? this.sp.nipple : this.sp.popcorn;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, spr, px + wig, y, 2.3 * u * this.popScale * (KIND_SCALE[c.kind] ?? 1), {
                rot: Math.sin(ts * 0.006 + i) * 0.12
            });
        });
        /* Шок от мины: три звёздочки кружатся над лапкой — «голова кругом» */ if (this.stun > 0) {
            const fade = Math.min(1, this.stun * 2.5);
            for(let i = 0; i < 3; i++){
                const a = ts * 0.0075 + i * Math.PI * 2 / 3;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.sparkle, px + Math.cos(a) * 24 * u, py - 38 * u + Math.sin(a) * 8 * u, 1.25 * u, {
                    rot: ts * 0.012,
                    alpha: fade
                });
            }
        }
    }
    drawParticles() {
        const { ctx } = this;
        /* Активные частицы — префикс пула [0..length): рисуем без аллокаций */ const items = this.particles.items;
        for(let i = 0, n = this.particles.length; i < n; i++){
            const p = items[i];
            ctx.globalAlpha = 1 - p.t / p.ttl;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }
    drawTexts() {
        const { ctx } = this;
        for (const t of this.texts){
            const q = t.t / t.dur;
            const alpha = q < 0.15 ? q / 0.15 : 1 - Math.max(0, (q - 0.55) / 0.45);
            const y = t.y - 42 * this.u * q;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.font = `600 ${t.size}px "Handjet", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineWidth = Math.max(3, t.size * 0.16);
            ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)';
            ctx.strokeText(t.text, t.x, y);
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, y);
            ctx.restore();
        }
    }
    /** «Лихорадка»: тёплая золотая дымка + постоянная крупная надпись
      «ЛИХОРАДКА» с заработанным счётом — игрок всегда понимает, что идёт
      бонусный уровень, даже когда баннер давно погас */ drawFeverFx() {
        const { ctx } = this;
        ctx.fillStyle = 'rgba(255, 196, 60, 0.10)';
        ctx.fillRect(0, 0, this.W, this.H);
        ctx.fillStyle = 'rgba(255, 150, 40, 0.08)';
        ctx.fillRect(0, 0, this.W, 52);
        ctx.fillRect(0, this.H - 52, this.W, 52);
        const f = this.fever;
        if (!f) return;
        const u = this.u;
        const pulse = 1 + Math.sin(performance.now() * 0.009) * 0.06;
        const size = 26 * u * pulse;
        const y = 74 * u;
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.font = `700 ${size}px "Handjet", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = Math.max(4, size * 0.18);
        ctx.strokeStyle = 'rgba(46, 18, 6, 0.95)';
        ctx.strokeText(this.L('banner.fever'), this.W / 2, y);
        ctx.fillStyle = '#FFC93C';
        ctx.fillText(this.L('banner.fever'), this.W / 2, y);
        /* Заработанные в лихорадке очки — видно в реальном времени */ const gSize = 19 * u;
        ctx.font = `700 ${gSize}px "Handjet", system-ui, sans-serif`;
        ctx.globalAlpha = 0.85;
        const gained = `+${f.gained}`;
        ctx.lineWidth = Math.max(3, gSize * 0.16);
        ctx.strokeText(gained, this.W / 2, y + gSize * 1.15);
        ctx.fillStyle = '#FFE9B0';
        ctx.fillText(gained, this.W / 2, y + gSize * 1.15);
        ctx.restore();
    }
    /** Подарочная коробка: покачивается, пульсирует ореолом, мигает перед
      исчезновением — успей дотянуться лапкой! */ drawGift(ts) {
        if (!this.gift) return;
        const { ctx } = this;
        const u = this.u;
        const g = this.gift;
        const bob = Math.sin(ts * 0.003 + g.phase) * 3 * u;
        const y = g.y + bob;
        const left = GIFT_LIFE - g.t;
        /* Последние 2.5 секунды коробка мигает — пора успеть! */ const blink = left < 2.5 ? 0.45 + 0.55 * Math.abs(Math.sin(ts * 0.012)) : 1;
        ctx.save();
        if (this.perfTier < 2) {
            const pulse = 0.5 + 0.5 * Math.sin(ts * 0.005 + g.phase);
            ctx.globalAlpha = blink * (0.25 + 0.2 * pulse);
            ctx.strokeStyle = '#FFE066';
            ctx.lineWidth = Math.max(1.5, 2.2 * u);
            ctx.beginPath();
            ctx.arc(g.x, y, (20 + 3 * pulse) * u, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = blink;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawSprite"])(ctx, this.sp.gift, g.x, y, 3.2 * u);
        ctx.restore();
    }
    drawBanner() {
        if (this.banner.t > 1.5) return;
        const { ctx } = this;
        const t = this.banner.t;
        const alpha = t < 0.2 ? t / 0.2 : t > 1.1 ? Math.max(0, (1.5 - t) / 0.4) : 1;
        const pop = 1 + Math.max(0, 1 - t / 0.25) * 0.5;
        const size = 34 * this.u * pop;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `700 ${size}px "Handjet", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = Math.max(4, size * 0.18);
        ctx.strokeStyle = 'rgba(46, 18, 6, 0.9)';
        ctx.strokeText(this.banner.text, this.W / 2, this.H * 0.3);
        ctx.fillStyle = '#FFE066';
        ctx.fillText(this.banner.text, this.W / 2, this.H * 0.3);
        ctx.restore();
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/fps.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * FPS-монитор с автоматическим снижением качества («perf-тиры»).
 *
 * ЗАЧЕМ: на средних мобильных во время «Лихорадки» (много зёрен + дождь
 * монеток) FPS проседает. Вместо того чтобы просаживать картинку у всех,
 * движок сам замечает падение и на 2 секунды включает облегчённый режим:
 *   tier 0 — все эффекты (свечение, пульс-кольца, тени, дымка);
 *   tier 1 — без свечения и теней зёрен, частиц вдвое меньше;
 *   tier 2 — минимум: без пульс-колец и виньетки, DPR-потолок 1.2.
 *
 * КАК: экспоненциальное скользящее среднее (EMA) FPS устойчиво к одиночным
 * лагам. Решения принимаются раз в WINDOW секунд с гистерезисом:
 *   вниз — средний FPS < 45 (порог DOWN);
 *   вверх — 3 окна подряд > 55 (порог UP), чтобы не дёргалось на границе.
 *
 * ИЗМЕРЕНИЕ ВРУЧНУЮ (для отладки в консоли):
 *   let frames = 0, t0 = performance.now();
 *   function loop() { frames++; requestAnimationFrame(loop); }
 *   setInterval(() => console.log('FPS', Math.round(frames * 1000 / (performance.now() - t0)), ...
 */ __turbopack_context__.s([
    "FPS_DOWN",
    ()=>FPS_DOWN,
    "FPS_UP",
    ()=>FPS_UP,
    "FpsMeter",
    ()=>FpsMeter,
    "MAX_TIER",
    ()=>MAX_TIER
]);
const FPS_DOWN = 45;
const FPS_UP = 55;
const MAX_TIER = 2;
class FpsMeter {
    /** Текущий уровень качества эффектов: 0 — полный, 2 — минимум */ tier = 0;
    /** Сглаженный FPS для отладки/HUD (обновляется каждый кадр) */ fps = 60;
    ema = 60;
    windowStart = 0;
    windowSamples = 0;
    goodWindows = 0;
    /**
   * Вызывать каждый кадр. dt — длительность кадра в секундах,
   * now — метка времени кадра (performance.now()/rAF-timestamp).
   * Возвращает tier, если он сменился в этом кадре, иначе null.
   */ tick(dt, now) {
        /* Свёрнутая вкладка или долгий фриз: кадр не показателен — сбрасываем окно */ if (dt <= 0 || dt > 0.25) {
            this.windowStart = now;
            this.windowSamples = 0;
            return null;
        }
        /* EMA: прошлые кадры весят больше, мгновенный скачок не дёргает решение */ this.ema += (1 / dt - this.ema) * 0.08;
        this.fps = this.ema;
        if (this.windowStart === 0) this.windowStart = now;
        this.windowSamples++;
        if (now - this.windowStart < 2000) return null;
        /* окно 2 секунды */ const avg = this.ema;
        this.windowStart = now;
        this.windowSamples = 0;
        if (avg < FPS_DOWN && this.tier < MAX_TIER) {
            this.goodWindows = 0;
            this.tier++;
            return this.tier;
        }
        if (avg > FPS_UP && this.tier > 0) {
            /* Три хороших окна подряд — можно вернуть эффекты */ this.goodWindows++;
            if (this.goodWindows >= 3) {
                this.goodWindows = 0;
                this.tier--;
                return this.tier;
            }
            return null;
        }
        this.goodWindows = 0;
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/i18n.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Переводы «POPCORN PAWS» на 4 языка:
 * русский · английский · немецкий · испанский.
 *
 * Каждая строка — кортеж [ru, en, de, es]. Плейсхолдеры вида {{n}}
 * подставляются через vars. Движок получает tFor(lang) через setLang.
 */ __turbopack_context__.s([
    "LANGS",
    ()=>LANGS,
    "LOCALES",
    ()=>LOCALES,
    "T",
    ()=>T,
    "detectLang",
    ()=>detectLang,
    "tFor",
    ()=>tFor
]);
const LANGS = [
    {
        id: 'ru',
        label: 'Русский',
        flag: '🇷🇺'
    },
    {
        id: 'en',
        label: 'English',
        flag: '🇬🇧'
    },
    {
        id: 'de',
        label: 'Deutsch',
        flag: '🇩🇪'
    },
    {
        id: 'es',
        label: 'Español',
        flag: '🇪🇸'
    }
];
const LOCALES = {
    ru: 'ru-RU',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES'
};
const T = {
    /* ---------- меню ---------- */ /* Бренд игры — единый на всех языках, только английский (запрос игрока) */ 'app.title': [
        'POPCORN PAWS',
        'POPCORN PAWS',
        'POPCORN PAWS',
        'POPCORN PAWS'
    ],
    'menu.record': [
        'Рекорд: {{n}}',
        'Best: {{n}}',
        'Rekord: {{n}}',
        'Récord: {{n}}'
    ],
    'menu.world': [
        'Заходов: {{n}} · Котиков: {{v}}',
        'Visits: {{n}} · Cats: {{v}}',
        'Starts: {{n}} · Katzen: {{v}}',
        'Visitas: {{n}} · Gatos: {{v}}'
    ],
    'menu.xp': [
        'Опыт: {{n}}',
        'XP: {{n}}',
        'XP: {{n}}',
        'Exp: {{n}}'
    ],
    'menu.charLevel': [
        '🎖 Котик: ур. {{n}}',
        '🎖 Kitty: lvl {{n}}',
        '🎖 Kätzchen: Lvl {{n}}',
        '🎖 Gatito: nv {{n}}'
    ],
    'menu.charLevelHint': [
        'Уровень котика растёт сам — за каждый пройденный этап и каждую попытку. Стаж не сгорает никогда!',
        'Your kitty level grows by itself — for every stage cleared and every attempt. It never burns away!',
        'Das Kätzchen-Level steigt von selbst — für jedes geschaffte Level und jeden Versuch. Es verfällt nie!',
        'El nivel del gatito crece solo: por cada nivel superado y cada intento. ¡Nunca se pierde!'
    ],
    'char.levelUp': [
        '🎖 Котик подрос до уровня {{n}}! +1 очко древа улучшений',
        '🎖 Kitty reached level {{n}}! +1 tree point',
        '🎖 Kätzchen erreicht Level {{n}}! +1 Baum-Punkt',
        '🎖 ¡El gatito llegó al nivel {{n}}! +1 punto del árbol'
    ],
    /* v0.0.33: повышение уровня с наградой-разблокировкой */ 'char.levelUpUnlocks': [
        '🎖 Уровень {{n}}! Открыто: {{list}} · +1 очко древа',
        '🎖 Level {{n}}! Unlocked: {{list}} · +1 tree point',
        '🎖 Level {{n}}! Freigeschaltet: {{list}} · +1 Baum-Punkt',
        '🎖 ¡Nivel {{n}}! Desbloqueado: {{list}} · +1 punto del árbol'
    ],
    'menu.play': [
        '▶ ИГРАТЬ',
        '▶ PLAY',
        '▶ SPIELEN',
        '▶ JUGAR'
    ],
    'menu.rules': [
        'ПРАВИЛА',
        'RULES',
        'REGELN',
        'REGLAS'
    ],
    'menu.leaders': [
        'ЛИДЕРЫ',
        'RANKING',
        'BESTEN',
        'RÉCORDS'
    ],
    'menu.paws': [
        'ЛАПКИ',
        'PAWS',
        'PFOTEN',
        'PATITAS'
    ],
    'menu.ach': [
        'АЧИВКИ',
        'AWARDS',
        'ERFOLGE',
        'LOGROS'
    ],
    'menu.creators': [
        'СОЗДАТЕЛИ',
        'CREDITS',
        'AUTOREN',
        'CREDITOS'
    ],
    'menu.settings': [
        'НАСТРОЙКИ',
        'SETTINGS',
        'EINSTELLUNGEN',
        'AJUSTES'
    ],
    'menu.install': [
        'УСТАНОВИТЬ ИГРУ',
        'INSTALL GAME',
        'SPIEL INSTALLIEREN',
        'INSTALAR JUEGO'
    ],
    /* Экран установки: нативный диалог Chrome/Android/ПК или ручная инструкция iOS */ 'install.title': [
        '📲 Установить игру',
        '📲 Install the game',
        '📲 Spiel installieren',
        '📲 Instalar el juego'
    ],
    'install.nativeBtn': [
        'УСТАНОВИТЬ',
        'INSTALL',
        'INSTALLIEREN',
        'INSTALAR'
    ],
    'install.nativeHint': [
        'Нажми — браузер сам предложит добавить игру на устройство',
        'Tap — the browser will offer to add the game to your device',
        'Tippe — der Browser schlägt das Installieren vor',
        'Toca: el navegador propondrá instalar el juego'
    ],
    'install.where': [
        'Игра появится на домашнем экране / рабочем столе, откроется во весь экран и будет работать даже без интернета.',
        'The game will appear on your home screen / desktop, open fullscreen and work even offline.',
        'Das Spiel erscheint auf dem Homescreen / Desktop, öffnet sich im Vollbild und läuft auch offline.',
        'El juego aparecerá en la pantalla de inicio / escritorio, se abrirá a pantalla completa y funcionará sin internet.'
    ],
    'install.iosTitle': [
        'iPhone / iPad · Safari',
        'iPhone / iPad · Safari',
        'iPhone / iPad · Safari',
        'iPhone / iPad · Safari'
    ],
    'install.iosStep1': [
        'Нажми кнопку «Поделиться» внизу Safari',
        'Tap the Share button at the bottom of Safari',
        'Tippe unten in Safari auf „Teilen“',
        'Toca el botón «Compartir» abajo en Safari'
    ],
    'install.iosStep2': [
        'Выбери «На экран “Домой”»',
        'Choose “Add to Home Screen”',
        'Wähle „Zum Home-Bildschirm“',
        'Elige «Añadir a pantalla de inicio»'
    ],
    'install.iosStep3': [
        'Тапни «Добавить» — готово!',
        'Tap “Add” — done!',
        'Tippe auf „Hinzufügen“ — fertig!',
        'Toca «Añadir» — ¡listo!'
    ],
    'install.androidTitle': [
        'Android · Chrome',
        'Android · Chrome',
        'Android · Chrome',
        'Android · Chrome'
    ],
    'install.androidStep': [
        'Меню ⋮ (справа вверху) → «Установить приложение»',
        'Menu ⋮ (top right) → “Install app”',
        'Menü ⋮ (oben rechts) → „App installieren“',
        'Menú ⋮ (arriba a la derecha) → «Instalar aplicación»'
    ],
    'install.desktopTitle': [
        'Компьютер · Chrome / Edge',
        'Desktop · Chrome / Edge',
        'PC · Chrome / Edge',
        'PC · Chrome / Edge'
    ],
    'install.desktopStep': [
        'Значок ⊕ в адресной строке → «Установить»',
        'The ⊕ icon in the address bar → “Install”',
        'Das ⊕-Symbol in der Adressleiste → „Installieren“',
        'El icono ⊕ en la barra de direcciones → «Instalar»'
    ],
    'install.close': [
        'ПОНЯТНО',
        'GOT IT',
        'VERSTANDEN',
        'ENTENDIDO'
    ],
    /* Древо улучшений (тестовая ветка) */ 'menu.tree': [
        '🌳 ДРЕВО УЛУЧШЕНИЙ',
        '🌳 UPGRADE TREE',
        '🌳 UPGRADE-BAUM',
        '🌳 ÁRBOL DE MEJORAS'
    ],
    'menu.treeShort': [
        'ДРЕВО',
        'TREE',
        'BAUM',
        'ÁRBOL'
    ],
    'tree.title': [
        'Древо улучшений',
        'Upgrade Tree',
        'Upgrade-Baum',
        'Árbol de mejoras'
    ],
    'tree.points': [
        'Очки: {{n}}',
        'Points: {{n}}',
        'Punkte: {{n}}',
        'Puntos: {{n}}'
    ],
    'tree.hint': [
        '+1 очко за каждый уровень котика. Улучшения постоянные!',
        '+1 point per cat level. Upgrades are permanent!',
        '+1 Punkt pro Katzen-Level. Upgrades sind dauerhaft!',
        '+1 punto por nivel de gato. ¡Las mejoras son permanentes!'
    ],
    'tree.locked': [
        'ур. {{n}}',
        'lvl {{n}}',
        'Lvl {{n}}',
        'niv. {{n}}'
    ],
    /* карточка выбранного узла древа */ 'tree.card.level': [
        'Уровень {{a}} из {{b}}',
        'Level {{a}} of {{b}}',
        'Stufe {{a}} von {{b}}',
        'Nivel {{a}} de {{b}}'
    ],
    'tree.card.gives': [
        'Даст:',
        'Will give:',
        'Wird geben:',
        'Dará:'
    ],
    'tree.card.now': [
        'Сейчас:',
        'Now:',
        'Jetzt:',
        'Ahora:'
    ],
    'tree.card.next': [
        'Станет:',
        'Next:',
        'Wird:',
        'Siguiente:'
    ],
    'tree.buy': [
        'КУПИТЬ ЗА 1 ОЧКО',
        'BUY FOR 1 POINT',
        'FÜR 1 PUNKT KAUFEN',
        'COMPRAR POR 1 PUNTO'
    ],
    'tree.maxed': [
        'МАКС',
        'MAX',
        'MAX',
        'MÁX'
    ],
    'tree.needPoints': [
        'Нет очков — проходи уровни!',
        'No points — play levels!',
        'Keine Punkte — spiele Level!',
        'Sin puntos: ¡juega niveles!'
    ],
    'tree.needLevel': [
        'Котик ещё мал: нужен уровень {{n}}',
        'Kitty is too young: level {{n}} required',
        'Kätzchen zu jung: Level {{n}} nötig',
        'Gatito muy joven: se necesita nivel {{n}}'
    ],
    'tree.harvest.name': [
        'Урожай',
        'Harvest',
        'Ernte',
        'Cosecha'
    ],
    'tree.harvest.effect': [
        '+{{n}}% к очкам за зёрна',
        '+{{n}}% grain points',
        '+{{n}}% Punkte pro Korn',
        '+{{n}}% puntos por grano'
    ],
    'tree.swift.name': [
        'Проворство',
        'Swiftness',
        'Flinkheit',
        'Presteza'
    ],
    'tree.swift.effect': [
        '+{{n}}% к скорости лапки',
        '+{{n}}% paw speed',
        '+{{n}}% Pfotentempo',
        '+{{n}}% velocidad de la pata'
    ],
    'tree.seeds.name': [
        'Засев',
        'Sowing',
        'Saat',
        'Siembra'
    ],
    'tree.seeds.effect': [
        '+{{n}} зёрен в каждой волне',
        '+{{n}} grains each wave',
        '+{{n}} Körner pro Welle',
        '+{{n}} granos por oleada'
    ],
    'tree.feverluck.name': [
        'Фарт лихорадки',
        'Fever luck',
        'Fieberglück',
        'Suerte de fiebre'
    ],
    'tree.feverluck.effect': [
        '+{{n}}% шанс внезапной ЛИХОРАДКИ',
        '+{{n}}% sudden FEVER chance',
        '+{{n}}% Chance auf plötzliches FIEBER',
        '+{{n}}% probabilidad de FIEBRE repentina'
    ],
    'tree.goldluck.name': [
        'Золотая жила',
        'Golden vein',
        'Goldader',
        'Veta dorada'
    ],
    'tree.goldluck.effect': [
        '+{{n}}% шанс золотого зерна',
        '+{{n}}% golden grain chance',
        '+{{n}}% Chance auf Goldkorn',
        '+{{n}}% probabilidad de grano dorado'
    ],
    'tree.cap.name': [
        'Вместимость',
        'Capacity',
        'Kapazität',
        'Capacidad'
    ],
    'tree.cap.effect': [
        'Запас лапки: +{{n}}',
        'Paw holds +{{n}}',
        'Pfote fasst +{{n}}',
        'Pata guarda +{{n}}'
    ],
    'tree.shield.name': [
        'Щит',
        'Shield',
        'Schild',
        'Escudo'
    ],
    'tree.shield.effect': [
        'Щитов на забег: {{n}}',
        'Shields per run: {{n}}',
        'Schilde pro Lauf: {{n}}',
        'Escudos por ronda: {{n}}'
    ],
    'tree.heartmax.name': [
        'Плюшевое сердце',
        'Plush Heart',
        'Plüschherz',
        'Corazón de peluche'
    ],
    'tree.heartmax.effect': [
        'Максимум сердец +{{n}}',
        'Max hearts +{{n}}',
        'Max. Herzen +{{n}}',
        'Máx. corazones +{{n}}'
    ],
    'tree.healer.name': [
        'Лапка-целитель',
        'Healing Paw',
        'Heilpfote',
        'Patita sanadora'
    ],
    'tree.healer.effect': [
        'Сердец за уровень: +{{n}}',
        'Hearts per level: +{{n}}',
        'Herzen pro Level: +{{n}}',
        'Corazones por nivel: +{{n}}'
    ],
    'tree.needParent': [
        'Сначала открой «{{s}}»!',
        'Unlock “{{s}}” first!',
        'Zuerst „{{s}}“ freischalten!',
        '¡Primero desbloquea «{{s}}»!'
    ],
    'tree.magnet.name': [
        'Магнит',
        'Magnet',
        'Magnet',
        'Imán'
    ],
    'tree.magnet.effect': [
        '+{{n}}% к радиусу подбора',
        '+{{n}}% grab radius',
        '+{{n}}% Greifradius',
        '+{{n}}% radio de agarre'
    ],
    'tree.guard.name': [
        'Коготки',
        'Claws',
        'Krallen',
        'Garras'
    ],
    'tree.guard.effect': [
        '{{n}}% шанс игнорировать мину',
        '{{n}}% chance to ignore mines',
        '{{n}}% Chance Minen zu ignorieren',
        '{{n}}% de ignorar minas'
    ],
    'tree.coins.name': [
        'Монетный дождь',
        'Coin Rain',
        'Münzenregen',
        'Lluvia de Monedas'
    ],
    'tree.coins.effect': [
        '+{{n}}% монеток с этапов',
        '+{{n}}% coins from stages',
        '+{{n}}% Münzen pro Etappe',
        '+{{n}}% monedas por nivel'
    ],
    'tree.fevertime.name': [
        'Долгая лихорадка',
        'Long Fever',
        'Langes Fieber',
        'Fiebre Larga'
    ],
    'tree.fevertime.effect': [
        '+{{n}} сек к ЛИХОРАДКЕ',
        '+{{n}}s of FEVER',
        '+{{n}}s FIEBER',
        '+{{n}}s de FIEBRE'
    ],
    'tree.giftluck.name': [
        'Праздничный кот',
        'Party Cat',
        'Party-Katze',
        'Gato de Fiesta'
    ],
    'tree.giftluck.effect': [
        'Подарки 🎁 на {{n}}% чаще',
        'Gift boxes 🎁 {{n}}% more often',
        'Geschenke 🎁 {{n}}% öfter',
        'Regalos 🎁 {{n}}% más a menudo'
    ],
    'tree.hoverwing.name': [
        'Лёгкое крыло',
        'Light Wing',
        'Leichter Flügel',
        'Ala Ligera'
    ],
    'tree.hoverwing.effect': [
        'Парение над минами +{{n}} сек',
        'Mine floating +{{n}}s',
        'Schweben über Minen +{{n}}s',
        'Flotar sobre minas +{{n}}s'
    ],
    'tree.swift2.name': [
        'Сверхпроворство',
        'Super Agility',
        'SuperBehändigkeit',
        'Súper Agilidad'
    ],
    'tree.swift2.effect': [
        '+{{n}}% скорости лапки',
        '+{{n}}% paw speed',
        '+{{n}}% Pfotentempo',
        '+{{n}}% velocidad de patita'
    ],
    'tree.miner.name': [
        'Шахтёр',
        'Miner',
        'Minenarbeiter',
        'Minero'
    ],
    'tree.miner.effect': [
        '−{{n}} мина в каждой волне',
        '−{{n}} mine per wave',
        '−{{n}} Mine pro Welle',
        '−{{n}} mina por oleada'
    ],
    'tree.stun.name': [
        'Крепкий нос',
        'Tough Nose',
        'Stupsnase',
        'Nariz Dura'
    ],
    'tree.stun.effect': [
        '−{{n}}с шока от мины',
        '−{{n}}s mine shock',
        '−{{n}}s Minen-Schock',
        '−{{n}}s de choque'
    ],
    'tree.combo.name': [
        'Комбо-тренер',
        'Combo Coach',
        'Combo-Trainer',
        'Entrenador'
    ],
    'tree.combo.effect': [
        'Комбо растёт каждые 5 сдач',
        'Combo grows every 5 deliveries',
        'Combo wächst alle 5 Abgaben',
        'Combo crece cada 5 entregas'
    ],
    'tree.xpboost.name': [
        'Стаж',
        'Seniority',
        'Erfahrung',
        'Antigüedad'
    ],
    'tree.xpboost.effect': [
        '+{{n}}% опыта котика за этап',
        '+{{n}}% kitty XP per stage',
        '+{{n}}% Katzen-XP pro Etappe',
        '+{{n}}% XP del gato por nivel'
    ],
    'tree.double.name': [
        'Щедрость',
        'Generosity',
        'Großzügigkeit',
        'Generosidad'
    ],
    'tree.double.effect': [
        '+{{n}}% ценность сундучков',
        '+{{n}}% chest gift value',
        '+{{n}}% Truhengeschenke',
        '+{{n}}% regalos de cofres'
    ],
    /* ярус 6 — верхушка для ветеранов */ 'tree.biggrain.name': [
        'Мега-урожай',
        'Mega Harvest',
        'Mega-Ernte',
        'Mega-cosecha'
    ],
    'tree.biggrain.effect': [
        '+{{n}}% к очкам за зёрна',
        '+{{n}}% grain points',
        '+{{n}}% Punkte pro Korn',
        '+{{n}}% puntos por grano'
    ],
    'tree.seeds2.name': [
        'Поле чудес',
        'Wonder Field',
        'Wunderfeld',
        'Campo de maravillas'
    ],
    'tree.seeds2.effect': [
        '+{{n}} зёрен в каждой волне',
        '+{{n}} grains each wave',
        '+{{n}} Körner pro Welle',
        '+{{n}} granos por oleada'
    ],
    'tree.magnet2.name': [
        'Сверхмагнит',
        'Super Magnet',
        'Supermagnet',
        'Súper imán'
    ],
    'tree.magnet2.effect': [
        '+{{n}}% к радиусу подбора',
        '+{{n}}% grab radius',
        '+{{n}}% Greifradius',
        '+{{n}}% radio de agarre'
    ],
    'tree.goldrain.name': [
        'Золотопад',
        'Gold Rain',
        'Goldregen',
        'Lluvia de oro'
    ],
    'tree.goldrain.effect': [
        '+{{n}}% шанс золотого зерна',
        '+{{n}}% golden grain chance',
        '+{{n}}% Chance auf Goldkorn',
        '+{{n}}% probabilidad de grano dorado'
    ],
    'tree.coins2.name': [
        'Монетный ливень',
        'Coin Storm',
        'Münzensturm',
        'Tormenta de monedas'
    ],
    'tree.coins2.effect': [
        '+{{n}}% монеток с этапов',
        '+{{n}}% coins from stages',
        '+{{n}}% Münzen pro Etappe',
        '+{{n}}% monedas por nivel'
    ],
    'tree.fevertime2.name': [
        'Огненный вихрь',
        'Fire Whirl',
        'Feuerwirbel',
        'Remolino de fuego'
    ],
    'tree.fevertime2.effect': [
        '+{{n}} сек к ЛИХОРАДКЕ',
        '+{{n}}s of FEVER',
        '+{{n}}s FIEBER',
        '+{{n}}s de FIEBRE'
    ],
    'set.crt': [
        'CRT-развёртка',
        'CRT scanlines',
        'CRT-Raster',
        'Líneas CRT'
    ],
    'set.crtHint': [
        'Ретро-эффект старого телевизора. Почти не влияет на FPS',
        'Retro TV effect. Almost no FPS impact',
        'Retro-TV-Effekt. Fast kein FPS-Einfluss',
        'Efecto de TV retro. Casi sin impacto en FPS'
    ],
    'main.aria': [
        'Игровое поле: соберите рассыпанный попкорн в стаканчик лапкой куницы',
        'Play field: gather spilled popcorn into the cup with the marten paw',
        'Spielfeld: verstreutes Popcorn mit der Marderpfote einsammeln',
        'Campo de juego: recoge las palomitas en el vaso con la patita de marta'
    ],
    'footer.text': [
        '🌽 POPCORN PAWS · 8-битный рогалик · сделано с ❤️',
        '🌽 POPCORN PAWS · 8-bit roguelike · made with ❤️',
        '🌽 POPCORN PAWS · 8-Bit-Roguelike · mit ❤️ gemacht',
        '🌽 POPCORN PAWS · roguelike 8 bits · hecho con ❤️'
    ],
    /* ---------- ник ---------- */ 'nick.gate.title': [
        'КАК ТЕБЯ ЗОВУТ?',
        "WHAT'S YOUR NAME?",
        'WIE HEISST DU?',
        '¿CÓMO TE LLAMAS?'
    ],
    'nick.edit.title': [
        'СМЕНИТЬ НИК',
        'CHANGE NICKNAME',
        'NICKNAME ÄNDERN',
        'CAMBIAR APODO'
    ],
    'nick.gate.desc': [
        'Введи имя кота-ловца — под ним ты попадёшь в мировую таблицу лидеров! 🌍',
        'Type your catcher-cat name — the world leaderboard will know you by it! 🌍',
        'Gib den Namen deiner Fangkatze ein — so kennt dich die Weltbestenliste! 🌍',
        'Escribe el nombre de tu gato cazador: ¡entrarás en la tabla mundial! 🌍'
    ],
    'nick.after.title': [
        'КАК ЗАПИСАТЬ ТЕБЯ В ИСТОРИЮ?',
        'HOW SHOULD WE WRITE YOU DOWN?',
        'WIE SOLLLEN WIR DICH EINTRAGEN?',
        '¿CÓMO TE ANOTAMOS?'
    ],
    'nick.after.desc': [
        'Первый забег позади! Оставь имя — под ним твой рекорд попадёт в мировую таблицу. 🌍',
        'First run done! Leave a name — your record will join the world table under it. 🌍',
        'Erster Lauf geschafft! Hinterlasse einen Namen — dein Rekord kommt damit in die Welttabelle. 🌍',
        '¡Primera partida lista! Deja un nombre: tu récord entrará en la tabla mundial con él. 🌍'
    ],
    'nick.edit.desc': [
        'Новое имя сразу появится в мировой таблице под твоим рекордом',
        'The new name appears in the world table right away under your record',
        'Der neue Name erscheint sofort in der Welttabelle unter deinem Rekord',
        'El nuevo nombre aparecerá enseguida en la tabla mundial con tu récord'
    ],
    'nick.placeholder': [
        'Мурзик',
        'Whiskers',
        'Minka',
        'Bigotes'
    ],
    'nick.aria': [
        'Никнейм для мировой таблицы лидеров',
        'Nickname for the world leaderboard',
        'Nickname für die Weltbestenliste',
        'Apodo para la tabla mundial'
    ],
    'nick.hint': [
        'От 2 до 24 символов',
        'From 2 to 24 characters',
        '2 bis 24 Zeichen',
        'De 2 a 24 caracteres'
    ],
    'nick.confirm': [
        'ЭТО Я! ▶',
        "THAT'S ME! ▶",
        'DAS BIN ICH! ▶',
        '¡SOY YO! ▶'
    ],
    'nick.save': [
        'СОХРАНИТЬ',
        'SAVE',
        'SPEICHERN',
        'GUARDAR'
    ],
    'nick.enter': [
        'ВВЕДИ ИМЯ',
        'TYPE A NAME',
        'NAMEN EINGEBEN',
        'ESCRIBE UN NOMBRE'
    ],
    'nick.anon': [
        'ОСТАВИТЬСЯ АНОНИМНЫМ КОТИКОМ',
        'STAY ANONYMOUS KITTY',
        'ANONYM ALS KATZE BLEIBEN',
        'SEGUIR ANÓNIMO GATITO'
    ],
    'nick.cancel': [
        'ОТМЕНА',
        'CANCEL',
        'ABBRECHEN',
        'CANCELAR'
    ],
    'nick.default': [
        'Котик',
        'Kitty',
        'Kätzchen',
        'Gatito'
    ],
    /* 0.0.47: имена в мировом топе уникальны — занятое имя закрепить нельзя */ 'nick.taken': [
        'Это имя уже занял другой котик — придумай своё!',
        'That name is taken by another cat — pick your own!',
        'Dieser Name ist schon von einer anderen Katze belegt — such dir einen eigenen!',
        'Ese nombre ya lo tomó otro gato: ¡elige uno tuyo!'
    ],
    /* ---------- туториал первого забега (Ф0-2) ---------- */ 'tut.1': [
        'Води пальцем — лапка летит следом',
        'Move your finger — the paw follows',
        'Beweg den Finger — die Pfote folgt',
        'Mueve el dedo: la patita te seguirá'
    ],
    'tut.2': [
        'Собирай зёрна в стаканчик',
        'Collect grains into the cup',
        'Sammle Körner im Becher',
        'Recoge granos en el vaso'
    ],
    'tut.3': [
        'Осторожно: мины-кукуруза! Не трогай!',
        'Careful: corn mines! Do not touch!',
        'Vorsicht: Mais-Minen! Nicht anfassen!',
        'Cuidado: minas de maíz. ¡No las toques!'
    ],
    'tut.4': [
        'Золотое зерно = +50 очков! Хватай!',
        'Golden grain = +50 points! Grab it!',
        'Goldkorn = +50 Punkte! Schnapp es!',
        'Grano dorado = +50 puntos. ¡Atrápalo!'
    ],
    'tut.5': [
        'Комбо: сдавай подряд без мин — множитель растёт',
        'Combo: deliver in a row — the multiplier grows',
        'Combo: Ketten ohne Minen — der Multiplikator wächst',
        'Combo: entrega seguido sin minas y el multiplicador crece'
    ],
    /* ---------- магазин ---------- */ 'shop.title': [
        'МАГАЗИН',
        'SHOP',
        'LADEN',
        'TIENDA'
    ],
    'shop.wallet': [
        '🍿 Опыт: {{x}} · 🪙 Монетки: {{c}}',
        '🍿 XP: {{x}} · 🪙 Coins: {{c}}',
        '🍿 XP: {{x}} · 🪙 Münzen: {{c}}',
        '🍿 Exp: {{x}} · 🪙 Monedas: {{c}}'
    ],
    'shop.tab.paws': [
        '🐾 ЛАПКИ',
        '🐾 PAWS',
        '🐾 PFOTEN',
        '🐾 PATITAS'
    ],
    'shop.tab.upgrades': [
        '🛠 АПГРЕЙДЫ',
        '🛠 UPGRADES',
        '🛠 UPGRADES',
        '🛠 MEJORAS'
    ],
    'shop.badge.base': [
        'БАЗОВАЯ',
        'BASIC',
        'STANDARD',
        'BÁSICA'
    ],
    'shop.equipped': [
        'НАДЕТА',
        'EQUIPPED',
        'ANGELEGT',
        'EQUIPADA'
    ],
    'shop.equip': [
        'НАДЕТЬ',
        'EQUIP',
        'ANLEGEN',
        'EQUIPAR'
    ],
    'shop.max': [
        'МАКСИМУМ',
        'MAXED',
        'MAXIMUM',
        'MÁXIMO'
    ],
    /* v0.0.33: гейтинг по уровню котика — замок вместо цены */ 'shop.locked': [
        '🔒 ур. {{n}}',
        '🔒 lvl {{n}}',
        '🔒 Lvl {{n}}',
        '🔒 nv {{n}}'
    ],
    'shop.lockedHint': [
        'Откроется, когда котик вырастет до уровня {{n}} — играй забеги и качай опыт!',
        'Unlocks when your kitty reaches level {{n}} — play runs and grow your XP!',
        'Öffnet sich, wenn dein Kätzchen Level {{n}} erreicht — spiele und sammle XP!',
        'Se abre cuando tu gatito llegue al nivel {{n}}: ¡juega y gana exp!'
    ],
    'shop.note': [
        'Очки попкорна = опыт: играй забеги и копи на улучшения!',
        'Popcorn points = XP: play runs and save up for upgrades!',
        'Popcorn-Punkte = XP: spiele Läufe und spare für Upgrades!',
        'Puntos de palomitas = exp: ¡juega y ahorra para mejoras!'
    ],
    'shop.close': [
        'ЗАКРЫТЬ',
        'CLOSE',
        'SCHLIESSEN',
        'CERRAR'
    ],
    'paw.classic.name': [
        'Рыжая классика',
        'Classic Red',
        'Klassisches Rot',
        'Clásica Roja'
    ],
    'paw.classic.desc': [
        'Родная тёплая лапка куницы. Проверена попкорном!',
        "The marten's own warm paw. Popcorn-tested!",
        'Die warme Pfote der heimischen Marder. Popcorn-erprobt!',
        'La patita cálida de la marta. ¡Probada con palomitas!'
    ],
    'paw.classic.bonus': [
        'Без бонуса — чистое мастерство',
        'No bonus — pure skill',
        'Kein Bonus — pures Können',
        'Sin bonus: pura maestría'
    ],
    'paw.ember.name': [
        'Уголёк',
        'Ember',
        'Glutkohle',
        'Brasita'
    ],
    'paw.ember.desc': [
        'Чёрная как смоль, но зёрна чует чуть лучше всех.',
        'Black as coal, yet smells kernels a bit better than all.',
        'Schwarz wie Kohle, riecht Körner aber etwas besser.',
        'Negra como el carbón, pero huele los granos un poco mejor.'
    ],
    'paw.ember.bonus': [
        'Радиус подбора +10%',
        'Grab radius +10%',
        'Greifradius +10%',
        'Radio +10%'
    ],
    'paw.snow.name': [
        'Снежка',
        'Snowball',
        'Schneeball',
        'Bola de Nieve'
    ],
    'paw.snow.desc': [
        'Белая пушистика с красными коготками-оберегами.',
        'White fluffball with red charm-claws.',
        'Weißes Flauschtier mit roten Schutzkrallen.',
        'Bola blanca y esponjosa con garras-amuleto rojas.'
    ],
    'paw.snow.bonus': [
        '25% шанс: мина не отнимет очко',
        '25% chance a mine costs no point',
        '25% Chance: Mine kostet keinen Punkt',
        '25% de que la mina no quite punto'
    ],
    'paw.flame.name': [
        'Огонёк',
        'Flame',
        'Flämmchen',
        'Llamita'
    ],
    'paw.flame.desc': [
        'Горячая шёрстка подгоняет часы — времени чуть больше.',
        'Hot fur speeds the clock — a bit more time.',
        'Heißes Fell beschleunigt die Uhr — etwas mehr Zeit.',
        'Su pelaje caliente da un poco más de tiempo.'
    ],
    'paw.flame.bonus': [
        '+5 секунд к каждому уровню',
        '+5 seconds to every level',
        '+5 Sekunden pro Level',
        '+5 segundos por nivel'
    ],
    'paw.lime.name': [
        'Лаймовая',
        'Lime',
        'Limette',
        'Lima'
    ],
    'paw.lime.desc': [
        'Яркая, как летний луг. Золото само липнет к шерсти.',
        'Bright as a summer meadow. Gold sticks to this fur.',
        'Leuchtend wie eine Sommerwiese. Gold bleibt am Fell kleben.',
        'Viva como un prado de verano. El oro se le pega.'
    ],
    'paw.lime.bonus': [
        'Золотых зёрен заметно больше',
        'Noticeably more golden kernels',
        'Deutlich mehr goldene Körner',
        'Bastantes más granos dorados'
    ],
    'paw.teal.name': [
        'Бирюзовая',
        'Teal',
        'Türkis',
        'Turquesa'
    ],
    'paw.teal.desc': [
        'Прохладный морской окрас. Кукуруза её побаивается.',
        'Cool sea color. Even corn fears it.',
        'Kühles Meereskleid. Sogar der Mais fürchtet sie.',
        'Color marino fresco. Hasta el maíz la teme.'
    ],
    'paw.teal.bonus': [
        'На одну мину меньше в каждой волне',
        'One mine less in every wave',
        'Eine Mine weniger pro Welle',
        'Una mina menos por oleada'
    ],
    'paw.thimble.name': [
        'Напёрсток',
        'Thimble',
        'Fingerhut',
        'Dedal'
    ],
    'paw.thimble.desc': [
        'Портновская точность: лапка и юркая, и цепкая, как игла.',
        'Tailor-precision: nimble and needle-sharp.',
        'Schneiderpräzision: flink und nadelspitz.',
        'Precisión de sastre: ágil y fina como una aguja.'
    ],
    'paw.thimble.bonus': [
        'Радиус +15% и лапка проворнее',
        'Radius +15% and a nimbler paw',
        'Radius +15% und flinker',
        'Radio +15% y más ágil'
    ],
    'paw.berry.name': [
        'Малиновая',
        'Raspberry',
        'Himbeere',
        'Frambuesa'
    ],
    'paw.berry.desc': [
        'Сладкая и шустрая — ягодный заряд бодрости.',
        'Sweet and quick — a berry energy boost.',
        'Süß und flink — Beeren-Energiekick.',
        'Dulce y veloz: un impulso de fruta.'
    ],
    'paw.berry.bonus': [
        'Радиус +20% и лапка проворнее',
        'Radius +20% and a nimbler paw',
        'Radius +20% und flinker',
        'Radio +20% y más ágil'
    ],
    'paw.strawberry.name': [
        'Клубничная',
        'Strawberry',
        'Erdbeere',
        'Fresa'
    ],
    'paw.strawberry.desc': [
        'Спелая ягода в крапинку — мины на неё натыкаются и стесняются.',
        'A ripe speckled berry — mines bump in and feel shy.',
        'Eine reife gepunktete Beere — Minen scheuen sich.',
        'Baya madura con pecas: las minas se avergüenzan.'
    ],
    'paw.strawberry.bonus': [
        '35% шанс: мина не отнимет очко',
        '35% chance a mine costs no point',
        '35% Chance: Mine kostet keinen Punkt',
        '35% de que la mina no quite punto'
    ],
    'paw.rainbow.name': [
        'Радужная',
        'Rainbow',
        'Regenbogen',
        'Arcoíris'
    ],
    'paw.rainbow.desc': [
        'Все цвета радуги на четырёх пальцах! Носит больше зерна.',
        'All rainbow colors on four fingers! Carries more kernels.',
        'Alle Regenbogenfarben an vier Fingern! Trägt mehr Körner.',
        '¡Todos los colores del arcoíris en cuatro dedos! Lleva más granos.'
    ],
    'paw.rainbow.bonus': [
        'Вместимость +1 зерно',
        'Capacity +1 kernel',
        'Kapazität +1 Korn',
        'Capacidad +1 grano'
    ],
    'paw.leopard.name': [
        'Леопардовая',
        'Leopard',
        'Leopard',
        'Leopardo'
    ],
    'paw.leopard.desc': [
        'Королевский зверь: пятнистая роскошь и вся мощь сразу!',
        'A royal beast: spotted luxury and all powers at once!',
        'Königliches Tier: gepunkteter Luxus und alle Kräfte!',
        'Bestia real: lujo moteado y todos los poderes.'
    ],
    'paw.leopard.bonus': [
        '+5 сек · радиус +15% · мин −1 · больше золота',
        '+5 sec · radius +15% · −1 mine · more gold',
        '+5 Sek · Radius +15% · −1 Mine · mehr Gold',
        '+5 seg · radio +15% · −1 mina · más oro'
    ],
    'paw.neon.name': [
        'Неоновая',
        'Neon',
        'Neon',
        'Neón'
    ],
    'paw.neon.desc': [
        'Светится в темноте кинозала и мелькает быстрее всех!',
        'Glows in the dark cinema hall and flashes faster than all!',
        'Leuchtet im dunklen Kino und blitzt schneller als alle!',
        'Brilla en la sala oscura y es la más rápida.'
    ],
    'paw.neon.bonus': [
        'Скорость лапки +40%',
        'Paw speed +40%',
        'Pfotentempo +40%',
        'Velocidad +40%'
    ],
    'paw.goldenpaw.name': [
        'Золотая лапка',
        'Golden Paw',
        'Goldpfote',
        'Patita de Oro'
    ],
    'paw.goldenpaw.desc': [
        'Легендарный артефакт: золото липнет к ней, как попкорн к маслу!',
        'A legendary artifact: gold sticks to it like popcorn to butter!',
        'Legendärer Artefakt: Gold haftet wie Popcorn an Butter!',
        'Artefacto legendario: ¡el oro se le pega como palomitas a la mantequilla!'
    ],
    'paw.goldenpaw.bonus': [
        'Золота +10% и вместимость +1',
        'Gold +10% and capacity +1',
        'Gold +10% und Kapazität +1',
        'Oro +10% y capacidad +1'
    ],
    'paw.double.name': [
        'Двойная лапка',
        'Double Paw',
        'Doppelpfote',
        'Patita Doble'
    ],
    'paw.double.desc': [
        'Двурукая лапка-чудо: гребёт шире и уносит больше зерна за раз!',
        'A two-pawed wonder: scoops wider and carries more kernels at once!',
        'Eine wunderliche Doppelpfote: greift weiter und trägt mehr Körner!',
        '¡Una maravilla de doble pata: recoge más ancho y lleva más granos!'
    ],
    'paw.double.bonus': [
        'Вместимость +1 зерно · радиус +10%',
        'Capacity +1 kernel · radius +10%',
        'Kapazität +1 Korn · Radius +10%',
        'Capacidad +1 grano · radio +10%'
    ],
    'paw.ghost.name': [
        'Призрачная шапка',
        'Ghost Hat',
        'Geisterhut',
        'Sombrero Fantasma'
    ],
    'paw.ghost.desc': [
        'Полупрозрачная лапка в волшебном колпаке — мины проходят сквозь неё мимо!',
        'A translucent paw in a magic hat — mines pass right through it!',
        'Eine durchscheinende Pfote im Zaubershut — Minen fliegen einfach durch!',
        '¡Una pata translúcida con sombrero mágico: las minas la atraviesan!'
    ],
    'paw.ghost.bonus': [
        '50% шанс: мина не отнимет очко',
        '50% chance a mine costs no point',
        '50% Chance: Mine kostet keinen Punkt',
        '50% de que la mina no quite punto'
    ],
    'paw.magic.name': [
        'Волшебная лапка',
        'Magic Paw',
        'Zauberpfote',
        'Patita Mágica'
    ],
    'paw.magic.desc': [
        'Из меха сыплются звёздочки шлейфом, а золото липнет к ней само!',
        'A trail of stars spills from its fur, and gold sticks to it by itself!',
        'Ein Sternenschleifchen rieselt aus dem Fell, Gold bleibt von allein kleben!',
        '¡Un estela de estrellas cae de su pelaje y el oro se le pega solo!'
    ],
    'paw.magic.bonus': [
        'Шлейф звёзд · золота +6% · проворнее',
        'Star trail · gold +6% · nimbler',
        'Sternenschleif · Gold +6% · flinker',
        'Estela de estrellas · oro +6% · más ágil'
    ],
    'paw.heartpaw.name': [
        'Сердоликовая лапка',
        'Carnelian Paw',
        'Karnellenpfote',
        'Patita cornalina'
    ],
    'paw.heartpaw.desc': [
        'Тёплая лапка с сердоликовой подушечкой: любовь котика — лучшая броня. Дарит лишнее сердечко в каждом забеге!',
        'A warm paw with a carnelian pad: a cat’s love is the best armor. Grants an extra heart every run!',
        'Eine warme Pfote mit Karnell-Kissen: Katzenliebe ist die beste Rüstung. Schenkt jedem Lauf ein Extra-Herz!',
        'Patita cálida con almohadilla cornalina: el amor gatuno es la mejor armadura. ¡Regala un corazón extra por partida!'
    ],
    'paw.heartpaw.bonus': [
        'Сердечек +1 · оберег от мин 15%',
        'Hearts +1 · 15% mine guard',
        'Herzen +1 · 15% Minenschutz',
        'Corazones +1 · 15% antaminas'
    ],
    'paw.candy.name': [
        'Мурчащая валентинка',
        'Purring Valentine',
        'Schnurrende Valentin',
        'Sanvalentín ronroneante'
    ],
    'paw.candy.desc': [
        'Розовая лапка с карамельными сердечками: мурчет так, что зёрна сами прыгают в ладошку!',
        'A pink paw with caramel hearts: it purrs so sweetly that kernels hop in by themselves!',
        'Eine rosa Pfote mit Karamell-Herzen: Sie schnurrt so süß, dass Körner von allein hüpfen!',
        'Patita rosa con corazones de caramelo: ronronea tan bonito que los granos saltan solos!'
    ],
    'paw.candy.bonus': [
        'Сладкий шлейф · проворнее на 5%',
        'Sweet trail · 5% nimbler',
        'Süßer Schleif · 5% flinker',
        'Estela dulce · 5% más ágil'
    ],
    'upg.capacity.name': [
        'Большой стаканчик',
        'Big Cup',
        'Großer Becher',
        'Vaso Grande'
    ],
    'upg.capacity.desc': [
        'Лапка носит на одно зерно больше в каждом забеге. Можно купить четырежды!',
        'The paw carries one more kernel every run. Buyable four times!',
        'Die Pfote trägt pro Lauf ein Korn mehr. Viermal kaufbar!',
        'La patita lleva un grano más en cada partida. ¡Se compra cuatro veces!'
    ],
    'upg.capacity.effect': [
        'Вместимость +{{n}} зерно(-а)',
        'Capacity +{{n}}',
        'Kapazität +{{n}}',
        'Capacidad +{{n}}'
    ],
    'upg.life.name': [
        'Девятая жизнь',
        'Ninth Life',
        'Neuntes Leben',
        'Novena Vida'
    ],
    'upg.life.desc': [
        'Один раз за забег, когда время выйдет, можно продолжить с тем же счётом (+15 секунд).',
        'Once per run, when time runs out, you may continue with the same score (+15 sec).',
        'Einmal pro Lauf darfst du nach Ablauf weitermachen (+15 Sek).',
        'Una vez por partida puedes seguir al acabarse el tiempo (+15 seg).'
    ],
    'upg.life.effect': [
        'Второй шанс доступен каждый забег',
        'Second chance available every run',
        'Zweite Chance in jedem Lauf',
        'Segunda oportunidad en cada partida'
    ],
    'upg.life.effectNone': [
        'Пока без второго шанса',
        'No second chance yet',
        'Noch keine zweite Chance',
        'Sin segunda oportunidad aún'
    ],
    'upg.hearts.name': [
        'Крепкое сердце',
        'Strong Heart',
        'Starkes Herz',
        'Corazón fuerte'
    ],
    'upg.hearts.desc': [
        'Плюс одно сердечко к максимуму в каждом забеге. Можно купить четырежды!',
        'Plus one heart to the maximum in every run. Can be bought four times!',
        'Plus ein Herz zum Maximum in jedem Lauf. Viermal kaufbar!',
        'Un corazón más al máximo en cada partida. ¡Se compra cuatro veces!'
    ],
    'upg.hearts.effect': [
        'Максимум сердец +{{n}}',
        'Max hearts +{{n}}',
        'Max. Herzen +{{n}}',
        'Máx. corazones +{{n}}'
    ],
    'upg.hearts.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.startperk.name': [
        'Счастливый сундучок',
        'Lucky Chest',
        'Glückstruhe',
        'Cofre Afortunado'
    ],
    'upg.startperk.desc': [
        'Каждый новый забег начинается со случайным БОНУСНЫМ перком первого уровня.',
        'Every new run starts with a random BONUS perk of level one.',
        'Jeder Lauf startet mit einem zufälligen BONUS-Perk.',
        'Cada partida empieza con un perk de BONUS aleatorio.'
    ],
    'upg.startperk.effect': [
        'Забег стартует с бонус-перком',
        'Run starts with a bonus perk',
        'Lauf startet mit Bonus-Perk',
        'La partida empieza con un perk'
    ],
    'upg.startperk.effectNone': [
        'Пока без стартового перка',
        'No starting perk yet',
        'Noch kein Start-Perk',
        'Sin perk inicial aún'
    ],
    'upg.capacity.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.butter.name': [
        'Сливочное масло',
        'Butter',
        'Butter',
        'Mantequilla'
    ],
    'upg.butter.desc': [
        'Каждое сданное зерно жирнее: +5% очков за зерно за ступень. Можно купить четырежды!',
        'Every delivered kernel is richer: +5% kernel score per tier. Buyable four times!',
        'Jedes gelieferte Korn ist fetter: +5% Korn-Punkte pro Stufe. Viermal kaufbar!',
        'Cada grano entregado es más rico: +5% de puntos por grano por nivel. ¡Se compra cuatro veces!'
    ],
    'upg.butter.effect': [
        'Очки за зерно +{{n}}%',
        'Kernel score +{{n}}%',
        'Korn-Punkte +{{n}}%',
        'Puntos por grano +{{n}}%'
    ],
    'upg.butter.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.goldluck.name': [
        'Золотая удача',
        'Golden Luck',
        'Goldglück',
        'Suerte Dorada'
    ],
    'upg.goldluck.desc': [
        'Золотые зёрна падают чаще: +4% к шансу за ступень. Можно купить четырежды!',
        'Golden kernels drop more often: +4% chance per tier. Buyable four times!',
        'Goldkörner fallen häufiger: +4% Chance pro Stufe. Viermal kaufbar!',
        'Los granos dorados caen más a menudo: +4% de probabilidad por nivel. ¡Se compra cuatro veces!'
    ],
    'upg.goldluck.effect': [
        'Шанс золотого +{{n}}%',
        'Golden chance +{{n}}%',
        'Gold-Chance +{{n}}%',
        'Prob. dorado +{{n}}%'
    ],
    'upg.goldluck.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.magnet.name': [
        'Магнит-приманка',
        'Magnet Lure',
        'Magnetköder',
        'Imán Atrapante'
    ],
    'upg.magnet.desc': [
        'Лапка собирает зёрна с большего расстояния: +6% к радиусу подбора за ступень. Можно купить четырежды!',
        'The paw gathers kernels from farther away: +6% grab radius per tier. Buyable four times!',
        'Die Pfote sammelt aus größerer Entfernung: +6% Radius pro Stufe. Viermal kaufbar!',
        'La patita recoge desde más lejos: +6% de radio por nivel. ¡Se compra cuatro veces!'
    ],
    'upg.magnet.effect': [
        'Радиус подбора +{{n}}%',
        'Grab radius +{{n}}%',
        'Radius +{{n}}%',
        'Radio +{{n}}%'
    ],
    'upg.magnet.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.seeds.name': [
        'Щедрая волна',
        'Generous Wave',
        'Großzügige Welle',
        'Ola Generosa'
    ],
    'upg.seeds.desc': [
        'В каждой волне на 2 зерна больше — больше урожая за то же время. Можно купить четырежды!',
        'Each wave has 2 more kernels — more harvest in the same time. Buyable four times!',
        'Jede Welle hat 2 Körner mehr — mehr Ernte in derselben Zeit. Viermal kaufbar!',
        'Cada ola trae 2 granos más: más cosecha en el mismo tiempo. ¡Se compra cuatro veces!'
    ],
    'upg.seeds.effect': [
        'Зёрен в волне +{{n}}',
        'Kernels per wave +{{n}}',
        'Körner pro Welle +{{n}}',
        'Granos por ola +{{n}}'
    ],
    'upg.seeds.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.timeplus.name': [
        'Длинный сеанс',
        'Long Session',
        'Lange Vorstellung',
        'Sesión Larga'
    ],
    'upg.timeplus.desc': [
        'Каждый уровень длиннее на 3 секунды — время успеть всё. Можно купить четырежды!',
        'Every level is 3 seconds longer — time to do it all. Buyable four times!',
        'Jedes Level ist 3 Sekunden länger — Zeit für alles. Viermal kaufbar!',
        'Cada nivel dura 3 segundos más: tiempo para todo. ¡Se compra cuatro veces!'
    ],
    'upg.timeplus.effect': [
        'Уровень длиннее на {{n}} сек',
        'Level +{{n}} sec',
        'Level +{{n}} Sek',
        'Nivel +{{n}} seg'
    ],
    'upg.timeplus.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.speed.name': [
        'Проворная лапка',
        'Nimble Paw',
        'Flink Pfote',
        'Patita Ágil'
    ],
    'upg.speed.desc': [
        'Лапка летит за пальцем на 5% быстрее за ступень. Можно купить четырежды!',
        'The paw follows your finger 5% faster per tier. Buyable four times!',
        'Die Pfote folgt dem Finger 5% schneller pro Stufe. Viermal kaufbar!',
        'La patita sigue tu dedo 5% más rápido por nivel. ¡Se compra cuatro veces!'
    ],
    'upg.speed.effect': [
        'Скорость лапки +{{n}}%',
        'Paw speed +{{n}}%',
        'Pfoten-Tempo +{{n}}%',
        'Velocidad +{{n}}%'
    ],
    'upg.speed.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.miner.name': [
        'Сапёр',
        'Sapper',
        'Minenräumer',
        'Minador'
    ],
    'upg.miner.desc': [
        'На одну мину-кукурузину меньше в каждой волне. Можно купить трижды!',
        'One less corn-mine in every wave. Buyable thrice!',
        'Eine Minus-Mine weniger pro Welle. Dreimal kaufbar!',
        'Una mina de maíz menos en cada ola. ¡Se compra tres veces!'
    ],
    'upg.miner.effect': [
        'Мин в волне −{{n}}',
        'Mines per wave −{{n}}',
        'Minen pro Welle −{{n}}',
        'Minas por ola −{{n}}'
    ],
    'upg.miner.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.shield.name': [
        'Запасной щит',
        'Spare Shield',
        'Reserve-Schild',
        'Escudo de Repuesto'
    ],
    'upg.shield.desc': [
        'Каждый забег начинается с +1 щитом: одна мина прощается. Можно купить трижды!',
        'Every run starts with +1 shield: one mine is forgiven. Buyable thrice!',
        'Jeder Lauf startet mit +1 Schild: eine Mine wird verziehen. Dreimal kaufbar!',
        'Cada partida empieza con +1 escudo: una mina se perdona. ¡Se compra tres veces!'
    ],
    'upg.shield.effect': [
        'Щитов за забег +{{n}}',
        'Shields per run +{{n}}',
        'Schilder pro Lauf +{{n}}',
        'Escudos por partida +{{n}}'
    ],
    'upg.shield.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.stun.name': [
        'Крепкий нос',
        'Tough Nose',
        'Stabile Nase',
        'Nariz Fuerte'
    ],
    'upg.stun.desc': [
        'Шок от мины короче на 0.3 секунды за ступень — быстрее снова в бой. Можно купить трижды!',
        'Mine shock is 0.3 sec shorter per tier — back to action sooner. Buyable thrice!',
        'Minen-Schock 0,3 Sek kürzer pro Stufe. Dreimal kaufbar!',
        'El shock de mina es 0.3 seg más corto por nivel. ¡Se compra tres veces!'
    ],
    'upg.stun.effect': [
        'Шок короче на {{n}} сек',
        'Shock −{{n}} sec',
        'Schock −{{n}} Sek',
        'Shock −{{n}} seg'
    ],
    'upg.stun.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.pigeonlate.name': [
        'Кроткий голубь',
        'Meek Pigeon',
        'Zahme Taube',
        'Paloma Mansa'
    ],
    'upg.pigeonlate.desc': [
        'Голубь-воришка прилетает на 3 секунды позже за ступень. Можно купить трижды!',
        'The thieving pigeon arrives 3 seconds later per tier. Buyable thrice!',
        'Die Taube kommt 3 Sekunden später pro Stufe. Dreimal kaufbar!',
        'La paloma ladrona llega 3 segundos más tarde por nivel. ¡Se compra tres veces!'
    ],
    'upg.pigeonlate.effect': [
        'Голубь позже на {{n}} сек',
        'Pigeon +{{n}} sec later',
        'Taube +{{n}} Sek später',
        'Paloma +{{n}} seg tarde'
    ],
    'upg.pigeonlate.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.fevertime.name': [
        'Долгая жара',
        'Long Fever',
        'Langes Fieber',
        'Fiebre Larga'
    ],
    'upg.fevertime.desc': [
        'ЛИХОРАДКА длится на 1 секунду дольше за ступень. Можно купить трижды!',
        'FEVER lasts 1 second longer per tier. Buyable thrice!',
        'FIEBER dauert 1 Sekunde länger pro Stufe. Dreimal kaufbar!',
        'La FIEBRE dura 1 segundo más por nivel. ¡Se compra tres veces!'
    ],
    'upg.fevertime.effect': [
        'Лихорадка длиннее на {{n}} сек',
        'Fever +{{n}} sec',
        'Fieber +{{n}} Sek',
        'Fiebre +{{n}} seg'
    ],
    'upg.fevertime.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.feverluck.name': [
        'Фартовщик',
        'Lucky Streak',
        'Glückspilz',
        'Afortunado'
    ],
    'upg.feverluck.desc': [
        'Сдача зерна чаще запускает внезапную ЛИХОРАДКУ: +5% шанса за ступень. Можно купить трижды!',
        'Delivering kernels more often triggers a sudden FEVER: +5% chance per tier. Buyable thrice!',
        'Korn-Abgabe löst häufiger ein plötzliches FIEBER aus: +5% pro Stufe. Dreimal kaufbar!',
        'Entregar granos activa más a menudo la FIEBRE: +5% por nivel. ¡Se compra tres veces!'
    ],
    'upg.feverluck.effect': [
        'Шанс лихорадки +{{n}}%',
        'Fever chance +{{n}}%',
        'Fieber-Chance +{{n}}%',
        'Prob. fiebre +{{n}}%'
    ],
    'upg.feverluck.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.gift.name': [
        'Щедрые сундуки',
        'Generous Chests',
        'Großzügige Truhen',
        'Cofres Generosos'
    ],
    'upg.gift.desc': [
        'Подарки из сундучков ценнее на 25% за ступень. Можно купить трижды!',
        'Chest gifts are 25% more valuable per tier. Buyable thrice!',
        'Truhengeschenke sind 25% wertvoller pro Stufe. Dreimal kaufbar!',
        'Los regalos de cofres valen un 25% más por nivel. ¡Se compra tres veces!'
    ],
    'upg.gift.effect': [
        'Подарки дороже на {{n}}%',
        'Gifts +{{n}}% value',
        'Geschenke +{{n}}%',
        'Regalos +{{n}}%'
    ],
    'upg.gift.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.combo.name': [
        'Комбо-тренер',
        'Combo Coach',
        'Combo-Trainer',
        'Entrenador de Combo'
    ],
    'upg.combo.desc': [
        'Комбо-множитель растёт каждые 5 сдач вместо 6. Купи один раз — и навсегда!',
        'The combo multiplier grows every 5 deliveries instead of 6. One-time buy — forever!',
        'Der Combo-Multiplikator steigt alle 5 statt 6 Abgaben. Einmal kaufen — für immer!',
        'El multiplicador de combo crece cada 5 entregas en vez de 6. ¡Se compra una vez, para siempre!'
    ],
    'upg.combo.effect': [
        'Комбо растёт каждые 5 сдач',
        'Combo grows every 5',
        'Combo wächst alle 5',
        'Combo crece cada 5'
    ],
    'upg.combo.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.coins.name': [
        'Монетный магнит',
        'Coin Magnet',
        'Münzmagnet',
        'Imán de Monedas'
    ],
    'upg.coins.desc': [
        '+10% монеток с этапов, сундучков и ЛИХОРАДКИ за ступень. Можно купить четырежды!',
        '+10% coins from stages, chests and FEVER per tier. Buyable four times!',
        '+10% Münzen aus Levels, Truhen und FIEBER pro Stufe. Viermal kaufbar!',
        '+10% de monedas por niveles, cofres y FIEBRE por nivel. ¡Se compra cuatro veces!'
    ],
    'upg.coins.effect': [
        'Монетки +{{n}}%',
        'Coins +{{n}}%',
        'Münzen +{{n}}%',
        'Monedas +{{n}}%'
    ],
    'upg.coins.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.xpboost.name': [
        'Умный котик',
        'Clever Kitty',
        'Kluges Kätzchen',
        'Gatito Listo'
    ],
    'upg.xpboost.desc': [
        '+10% опыта-стажа за пройденные этапы за ступень. Можно купить четырежды!',
        '+10% kitty XP for cleared stages per tier. Buyable four times!',
        '+10% Kätzchen-XP pro geschafftem Level und Stufe. Viermal kaufbar!',
        '+10% de XP del gatito por nivel superado y nivel de mejora. ¡Se compra cuatro veces!'
    ],
    'upg.xpboost.effect': [
        'Опыт-стаж +{{n}}%',
        'Kitty XP +{{n}}%',
        'Kätzchen-XP +{{n}}%',
        'XP gatito +{{n}}%'
    ],
    'upg.xpboost.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    /* ---------- разделы вкладки «АПГРЕЙДЫ» (v0.0.32) ---------- */ 'shop.cat.base': [
        'БАЗА ВЫЖИВАНИЯ',
        'SURVIVAL BASICS',
        'ÜBERLEBENSBASIS',
        'BASE DE SUPERVIVENCIA'
    ],
    'shop.cat.yield': [
        'УРОЖАЙ И СБОР',
        'HARVEST & GRAB',
        'ERNTE & SAMMELN',
        'COSECHA Y RECOGIDA'
    ],
    'shop.cat.big': [
        'БОЛЬШИЕ ПОПКОРНИНЫ',
        'BIG POPCORNS',
        'GROSSE POPCORNS',
        'PALOMITAS GRANDES'
    ],
    'shop.cat.boss': [
        'БОСС «МАЛЫШ»',
        'BOSS «KID»',
        'BOSS «KNIRPS»',
        'JEFE «PEQUE»'
    ],
    'shop.cat.tempo': [
        'ВРЕМЯ И СКОРОСТЬ',
        'TIME & SPEED',
        'ZEIT & TEMPO',
        'TIEMPO Y VELOCIDAD'
    ],
    'shop.cat.guard': [
        'БЕЗОПАСНОСТЬ',
        'SAFETY',
        'SICHERHEIT',
        'SEGURIDAD'
    ],
    'shop.cat.lucky': [
        'АЗАРТ И КОМБО',
        'LUCK & COMBO',
        'GLÜCK & COMBO',
        'SUERTE Y COMBO'
    ],
    'shop.cat.meta': [
        'МЕТА-ЭКОНОМИКА',
        'META ECONOMY',
        'META-ÖKONOMIE',
        'METAECONOMÍA'
    ],
    /* ---------- новые апгрейды 0.0.32: попкорнины, босс, комбо, касса ---------- */ 'upg.bigchance.name': [
        'Ранняя попкорнина',
        'Early Popcorn',
        'Früh-Popcorn',
        'Palomita Precoz'
    ],
    'upg.bigchance.desc': [
        'БОЛЬШАЯ ПОПКОРНИНА выскакивает на 1.5 сек раньше за ступень — больше шансов успеть. Можно купить четырежды!',
        'The BIG POPCORN pops up 1.5 sec earlier per tier — more time to catch it. Buyable four times!',
        'Das GROSSE POPCORN erscheint 1,5 Sek früher pro Stufe — mehr Zeit zum Fangen. Viermal kaufbar!',
        'La PALOMITA GRANDE sale 1.5 seg antes por nivel: más tiempo para atraparla. ¡Se compra cuatro veces!'
    ],
    'upg.bigchance.effect': [
        'Попкорнина раньше на {{n}} сек',
        'Popcorn {{n}} sec earlier',
        'Popcorn {{n}} Sek früher',
        'Palomita {{n}} seg antes'
    ],
    'upg.bigchance.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.bigtime.name': [
        'Живучая попкорнина',
        'Tough Popcorn',
        'Zähes Popcorn',
        'Palomita Resistente'
    ],
    'upg.bigtime.desc': [
        'Большая попкорнина живёт на 1 секунду дольше за ступень — не убежит так скоро. Можно купить трижды!',
        "The big popcorn lives 1 second longer per tier — it won't run off so soon. Buyable thrice!",
        'Das große Popcorn lebt 1 Sekunde länger pro Stufe. Dreimal kaufbar!',
        'La palomita grande vive 1 segundo más por nivel. ¡Se compra tres veces!'
    ],
    'upg.bigtime.effect': [
        'Живёт дольше на {{n}} сек',
        'Lives +{{n}} sec',
        'Lebt +{{n}} Sek',
        'Vive +{{n}} seg'
    ],
    'upg.bigtime.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.bigmult.name': [
        'Сладкая глазурь',
        'Sweet Glaze',
        'Süße Glasur',
        'Glaseado Dulce'
    ],
    'upg.bigmult.desc': [
        'Очки за любую БОЛЬШУЮ ПОПКОРНИНУ +10% за ступень: карамель, вишня и виноград жирнее. Можно купить пять раз!',
        'Score for any BIG POPCORN +10% per tier: caramel, cherry and grape get richer. Buyable five times!',
        'Punkte für jedes GROSSE POPCORN +10% pro Stufe. Fünffach kaufbar!',
        'Puntos por cualquier PALOMITA GRANDE +10% por nivel. ¡Se compra cinco veces!'
    ],
    'upg.bigmult.effect': [
        'Очки попкорнин +{{n}}%',
        'Popcorn score +{{n}}%',
        'Popcorn-Punkte +{{n}}%',
        'Puntos +{{n}}%'
    ],
    'upg.bigmult.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.goldcoin.name': [
        'Золотая сдача',
        'Golden Delivery',
        'Gold-Abgabe',
        'Entrega Dorada'
    ],
    'upg.goldcoin.desc': [
        'Каждое сданное ЗОЛОТОЕ зерно приносит +1 монетку за ступень. Можно купить трижды!',
        'Every delivered GOLDEN kernel pays +1 coin per tier. Buyable thrice!',
        'Jedes gelieferte GOLDKORN zahlt +1 Münze pro Stufe. Dreimal kaufbar!',
        'Cada grano DORADO entregado paga +1 moneda por nivel. ¡Se compra tres veces!'
    ],
    'upg.goldcoin.effect': [
        '+{{n}} монетка(-и) за золотое',
        '+{{n}} coin(s) per golden',
        '+{{n}} Münze(n) pro Goldkorn',
        '+{{n}} moneda(s) por dorado'
    ],
    'upg.goldcoin.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.bosscoins.name': [
        'Призовые малыша',
        'Kid Prize Money',
        'Knirps-Prämie',
        'Premio del Peque'
    ],
    'upg.bosscoins.desc': [
        'Монетки за победу над малышом +12% за ступень. Можно купить трижды!',
        'Coins for beating the kid +12% per tier. Buyable thrice!',
        'Münzen für den Sieg über den Knirps +12% pro Stufe. Dreimal kaufbar!',
        'Monedas por vencer al pequeño +12% por nivel. ¡Se compra tres veces!'
    ],
    'upg.bosscoins.effect': [
        'Монетки с боссов +{{n}}%',
        'Boss coins +{{n}}%',
        'Boss-Münzen +{{n}}%',
        'Monedas de jefe +{{n}}%'
    ],
    'upg.bosscoins.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.bosstime.name': [
        'Долгий бой',
        'Long Fight',
        'Langer Kampf',
        'Pelea Larga'
    ],
    'upg.bosstime.desc': [
        'Босс-бой длится на 3 секунды дольше за ступень — время на добивание. Можно купить трижды!',
        'The boss fight lasts 3 seconds longer per tier — time to finish him. Buyable thrice!',
        'Der Boss-Kampf dauert 3 Sek länger pro Stufe. Dreimal kaufbar!',
        'La pelea del jefe dura 3 seg más por nivel. ¡Se compra tres veces!'
    ],
    'upg.bosstime.effect': [
        'Босс-бой +{{n}} сек',
        'Boss fight +{{n}} sec',
        'Boss-Kampf +{{n}} Sek',
        'Pelea +{{n}} seg'
    ],
    'upg.bosstime.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.flingease.name': [
        'Меткий пинок',
        'Sharp Kick',
        'Präziser Kick',
        'Patada Precisa'
    ],
    'upg.flingease.desc': [
        'Пинок лапкой срабатывает легче: порог скорости −6% за ступень. Можно купить трижды!',
        'The paw kick triggers easier: speed threshold −6% per tier. Buyable thrice!',
        'Der Pfoten-Kick löst leichter aus: Tempo-Grenze −6% pro Stufe. Dreimal kaufbar!',
        'La patada activa más fácil: umbral de velocidad −6% por nivel. ¡Se compra tres veces!'
    ],
    'upg.flingease.effect': [
        'Порог пинка −{{n}}%',
        'Kick threshold −{{n}}%',
        'Kick-Grenze −{{n}}%',
        'Umbral −{{n}}%'
    ],
    'upg.flingease.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.bossheart.name': [
        'Мягкие рукавички',
        'Soft Mittens',
        'Weiche Fäustlinge',
        'Mitones Suaves'
    ],
    'upg.bossheart.desc': [
        'Шанс 12% за ступень, что касание малыша не отнимет сердечко. Можно купить четырежды!',
        '12% chance per tier that touching the kid costs no heart. Buyable four times!',
        '12% Chance pro Stufe, dass eine Berührung kein Herz kostet. Viermal kaufbar!',
        '12% de probabilidad por nivel de no perder corazón al tocar al pequeño. ¡Se compra cuatro veces!'
    ],
    'upg.bossheart.effect': [
        'Шанс не потерять сердце {{n}}%',
        'No-heart chance {{n}}%',
        'Herz-Schutz {{n}}%',
        'Protección {{n}}%'
    ],
    'upg.bossheart.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.pigeonguard.name': [
        'Мир с голубем',
        'Pigeon Truce',
        'Frieden mit der Taube',
        'Paz con la Paloma'
    ],
    'upg.pigeonguard.desc': [
        'Голубь-воришка тащит на 1 зерно меньше за ступень. Можно купить трижды!',
        'The thieving pigeon steals 1 kernel less per tier. Buyable thrice!',
        'Die Taube stiehlt 1 Korn weniger pro Stufe. Dreimal kaufbar!',
        'La paloma ladrona roba 1 grano menos por nivel. ¡Se compra tres veces!'
    ],
    'upg.pigeonguard.effect': [
        'Голубь тащит на {{n}} меньше',
        'Pigeon steals −{{n}}',
        'Taube stiehlt −{{n}}',
        'Paloma roba −{{n}}'
    ],
    'upg.pigeonguard.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.combostart.name': [
        'Быстрый старт',
        'Fast Start',
        'Schnellstart',
        'Arranque Rápido'
    ],
    'upg.combostart.desc': [
        'Серия сдач начинается с запасом +5 за ступень: комбо-множитель сразу выше. Можно купить трижды!',
        'Your delivery streak starts with +5 per tier: combo multiplier is higher right away. Buyable thrice!',
        'Die Serie startet mit +5 pro Stufe: Combo-Multiplikator sofort höher. Dreimal kaufbar!',
        'Tu serie empieza con +5 por nivel: multiplicador de combo más alto desde ya. ¡Se compra tres veces!'
    ],
    'upg.combostart.effect': [
        'Серия стартует с +{{n}}',
        'Streak starts at +{{n}}',
        'Serie startet mit +{{n}}',
        'Serie empieza +{{n}}'
    ],
    'upg.combostart.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.comboarmor.name': [
        'Комбо-броня',
        'Combo Armor',
        'Combo-Panzer',
        'Armadura de Combo'
    ],
    'upg.comboarmor.desc': [
        'Мина или воришка НЕ сбивают серию — по одному спасению за ступень в каждом забеге. Можно купить трижды!',
        'A mine or thief does NOT break the streak — one save per tier, every run. Buyable thrice!',
        'Mine oder Dieb brechen die Serie NICHT — eine Rettung pro Stufe je Lauf. Dreimal kaufbar!',
        'Una mina o ladrón NO rompe la serie: un salvamento por nivel por partida. ¡Se compra tres veces!'
    ],
    'upg.comboarmor.effect': [
        'Серию не сбить {{n}} раз(-а)',
        'Streak saved {{n}} time(s)',
        'Serie {{n}}× gerettet',
        'Serie salva {{n}} vez/veces'
    ],
    'upg.comboarmor.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.fevermult.name': [
        'Жаркий урожай',
        'Hot Harvest',
        'Heiße Ernte',
        'Cosecha Ardiente'
    ],
    'upg.fevermult.desc': [
        'Очки в ЛИХОРАДКЕ +10% за ступень — жара становится жирнее. Можно купить четырежды!',
        'Score in FEVER +10% per tier — the heat gets richer. Buyable four times!',
        'Punkte im FIEBER +10% pro Stufe. Viermal kaufbar!',
        'Puntos en la FIEBRE +10% por nivel. ¡Se compra cuatro veces!'
    ],
    'upg.fevermult.effect': [
        'Очки в Лихорадке +{{n}}%',
        'Fever score +{{n}}%',
        'Fieber-Punkte +{{n}}%',
        'Puntos fiebre +{{n}}%'
    ],
    'upg.fevermult.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'upg.scorecoins.name': [
        'Кассовый куш',
        'Box-Office Cut',
        'Kassen-Bonus',
        'Ganancia Taquilla'
    ],
    'upg.scorecoins.desc': [
        'В конце забега кэшбэк: 0.5% очков забега возвращаются монетками за ступень. Можно купить трижды!',
        'Run-end cashback: 0.5% of the run score comes back as coins per tier. Buyable thrice!',
        'Cashback am Lauf-Ende: 0.5% der Punkte als Münzen pro Stufe. Dreimal kaufbar!',
        'Cashback al final: 0.5% de los puntos vuelven en monedas por nivel. ¡Se compra tres veces!'
    ],
    'upg.scorecoins.effect': [
        'Кэшбэк {{n}}% очков',
        'Cashback {{n}}% of score',
        'Cashback {{n}}% der Punkte',
        'Cashback {{n}}% de puntos'
    ],
    'upg.scorecoins.effectNone': [
        'Пока без бонуса',
        'No bonus yet',
        'Noch kein Bonus',
        'Sin bonus aún'
    ],
    'txt.comboarmor': [
        'БРОНЯ!',
        'ARMOR!',
        'PANZER!',
        '¡ARMADURA!'
    ],
    /* ---------- достижения ---------- */ 'ach.title': [
        'ДОСТИЖЕНИЯ',
        'AWARDS',
        'ERFOLGE',
        'LOGROS'
    ],
    'ach.progress': [
        'Открыто {{a}} из {{b}}',
        'Unlocked {{a}} of {{b}}',
        '{{a}} von {{b}} offen',
        'Abierto {{a}} de {{b}}'
    ],
    'ach.score100.name': [
        'Первая сотня',
        'First Hundred',
        'Erste Hundert',
        'Primera Centena'
    ],
    'ach.score100.desc': [
        'Набрать 100 очков за один забег',
        'Score 100 points in one run',
        '100 Punkte in einem Lauf',
        'Conseguir 100 puntos en una partida'
    ],
    'ach.combo10.name': [
        'Комбо-мастер',
        'Combo Master',
        'Combo-Meister',
        'Maestro del Combo'
    ],
    'ach.combo10.desc': [
        'Серия из 10 сдач подряд без мины',
        'A streak of 10 clean deliveries',
        '10 Übergaben in Serie ohne Mine',
        'Racha de 10 entregas seguidas sin mina'
    ],
    'ach.golden1.name': [
        'Золотая лапка',
        'Golden Catch',
        'Goldkorn',
        'Grano Dorado'
    ],
    'ach.golden1.desc': [
        'Поймать золотое зерно (+50 очков)',
        'Catch a golden kernel (+50 points)',
        'Ein goldenes Korn fangen (+50 Punkte)',
        'Atrapar un grano dorado (+50 puntos)'
    ],
    'ach.pigeon1.name': [
        'Птицебой',
        'Bird Knocker',
        'Tauben-Boxer',
        'Boxeador de Palomas'
    ],
    'ach.pigeon1.desc': [
        'Повалить голубя-воришку ударами лапки',
        'Knock down the thieving pigeon with paw hits',
        'Die klauende Taube mit Pfotenhieben erledigen',
        'Derribar a la paloma ladrona a golpes de pata'
    ],
    'ach.level5.name': [
        'Киношка',
        'Movie Buff',
        'Kino-Fan',
        'Cinéfilo'
    ],
    'ach.level5.desc': [
        'Дойти до 5-го уровня',
        'Reach level 5',
        'Erreiche Level 5',
        'Llega al nivel 5'
    ],
    'ach.level10.name': [
        'Мастер попкорна',
        'Popcorn Master',
        'Popcorn-Meister',
        'Maestro de Palomitas'
    ],
    'ach.level10.desc': [
        'Дойти до 10-го уровня',
        'Reach level 10',
        'Erreiche Level 10',
        'Llega al nivel 10'
    ],
    'ach.rich10k.name': [
        'Попкорн-богач',
        'Popcorn Tycoon',
        'Popcorn-Magnat',
        'Magnate de Palomitas'
    ],
    'ach.rich10k.desc': [
        'Накопить 10000 опыта в банке',
        'Bank 10000 XP',
        '10000 XP ansparen',
        'Ahorrar 10000 de experiencia'
    ],
    'ach.shopper.name': [
        'Модная лапка',
        'Stylish Paw',
        'Modische Pfote',
        'Patita a la Moda'
    ],
    'ach.shopper.desc': [
        'Купить любую лапку в магазине',
        'Buy any paw in the shop',
        'Eine Pfote im Laden kaufen',
        'Compra cualquier patita en la tienda'
    ],
    'ach.collector.name': [
        'Коллекционер',
        'Collector',
        'Sammler',
        'Coleccionista'
    ],
    'ach.collector.desc': [
        'Владеть пятью лапками сразу',
        'Own five paws at once',
        'Fünf Pfoten gleichzeitig besitzen',
        'Tener cinco patitas a la vez'
    ],
    'ach.upgrade1.name': [
        'Обустроился',
        'Well Equipped',
        'Eingerichtet',
        'Bien Equipado'
    ],
    'ach.upgrade1.desc': [
        'Купить постоянный апгрейд',
        'Buy a permanent upgrade',
        'Ein dauerhaftes Upgrade kaufen',
        'Compra una mejora permanente'
    ],
    'ach.toast': [
        'Достижение открыто!',
        'Achievement unlocked!',
        'Erfolg freigeschaltet!',
        '¡Logro desbloqueado!'
    ],
    /* ---------- ачивки: зёрна ---------- */ 'ach.grains100.name': [
        'Сотка',
        'Hundred',
        'Hundert',
        'Cientazo'
    ],
    'ach.grains100.desc': [
        'Сдать 100 зёрен в стаканчик за один забег',
        'Deliver 100 kernels in one run',
        '100 Körner in einem Lauf liefern',
        'Entrega 100 granos en una partida'
    ],
    'ach.grains300.name': [
        'Триста!',
        'Three Hundred!',
        'Dreihundert!',
        '¡Trescientos!'
    ],
    'ach.grains300.desc': [
        'Сдать 300 зёрен за один забег',
        'Deliver 300 kernels in one run',
        '300 Körner in einem Lauf liefern',
        'Entrega 300 granos en una partida'
    ],
    'ach.grainsLife5k.name': [
        'Полполца',
        'Half a Pole',
        'Halber Stock',
        'Media Asta'
    ],
    'ach.grainsLife5k.desc': [
        '5000 зёрен за всё время',
        '5,000 kernels all time',
        '5.000 Körner insgesamt',
        '5.000 granos en total'
    ],
    'ach.grainsLife25k.name': [
        'Попкорн-комбайн',
        'Popcorn Combine',
        'Popcorn-Mähdrescher',
        'Cosechadora'
    ],
    'ach.grainsLife25k.desc': [
        '25000 зёрен за всё время',
        '25,000 kernels all time',
        '25.000 Körner insgesamt',
        '25.000 granos en total'
    ],
    'ach.golden10.name': [
        'Золотых дел мастер',
        'Goldsmith',
        'Goldschmied',
        'Maestro del Oro'
    ],
    'ach.golden10.desc': [
        '10 золотых зёрен за один забег',
        '10 golden kernels in one run',
        '10 Goldkörner in einem Lauf',
        '10 granos dorados en una partida'
    ],
    'ach.golden100.name': [
        'Золотой фонд',
        'Gold Reserve',
        'Goldreserve',
        'Reserva de Oro'
    ],
    'ach.golden100.desc': [
        '100 золотых зёрен за всё время',
        '100 golden kernels all time',
        '100 Goldkörner insgesamt',
        '100 granos dorados en total'
    ],
    /* ---------- комбо и волны ---------- */ 'ach.combo20.name': [
        'Серия века',
        'Streak of the Century',
        'Jahrhundert-Serie',
        'Racha del Siglo'
    ],
    'ach.combo20.desc': [
        'Серия из 20 сдач подряд',
        'A streak of 20 deliveries',
        '20 Abgaben in Serie',
        'Racha de 20 entregas'
    ],
    'ach.wave5.name': [
        'Пятая волна',
        'Fifth Wave',
        'Fünfte Welle',
        'Quinta Oleada'
    ],
    'ach.wave5.desc': [
        'Дожить до 5-й волны в одном уровне',
        'Reach wave 5 in one level',
        'Welle 5 in einem Level erreichen',
        'Llega a la oleada 5 en un nivel'
    ],
    'ach.wave10.name': [
        'Цунами',
        'Tsunami',
        'Tsunami',
        'Tsunami'
    ],
    'ach.wave10.desc': [
        'Дожить до 10-й волны',
        'Reach wave 10',
        'Welle 10 erreichen',
        'Llega a la oleada 10'
    ],
    'ach.level20.name': [
        'Двадцатка',
        'Twenty',
        'Zwanzig',
        'Veintena'
    ],
    'ach.level20.desc': [
        'Дойти до 20-го уровня',
        'Reach level 20',
        'Erreiche Level 20',
        'Llega al nivel 20'
    ],
    'ach.perfect.name': [
        'Чистая работа',
        'Clean Job',
        'Sauber gearbeitet',
        'Trabajo Limpio'
    ],
    'ach.perfect.desc': [
        'Пройти уровень без мин и без краж голубя',
        'Clear a level without mines or pigeon thefts',
        'Level ohne Minen und Tauben-Diebstahl',
        'Nivel sin minas ni robos de paloma'
    ],
    /* ---------- лихорадка ---------- */ 'ach.fever1.name': [
        'Горячка',
        'Fever',
        'Fieber',
        'Fiebre'
    ],
    'ach.fever1.desc': [
        'Пережить первую ЛИХОРАДКУ',
        'Survive your first FEVER',
        'Überstehe dein erstes FIEBER',
        'Sobrevive a tu primera FIEBRE'
    ],
    'ach.fever10.name': [
        'Жар-птица',
        'Firebird',
        'Feuervogel',
        'Pájaro de Fuego'
    ],
    'ach.fever10.desc': [
        '10 ЛИХОРАДОК за всё время',
        '10 FEVERS all time',
        '10 FIEBER insgesamt',
        '10 FIEBRES en total'
    ],
    'ach.fever500.name': [
        'Пять сотен в огне',
        'Five Hundred in Fire',
        'Fünfhundert im Feuer',
        'Quinientos en Fuego'
    ],
    'ach.fever500.desc': [
        'Заработать 500 очков за одну ЛИХОРАДКУ',
        'Score 500 points in one FEVER',
        '500 Punkte in einem FIEBER',
        '500 puntos en una FIEBRE'
    ],
    /* ---------- голуби ---------- */ 'ach.pigeon5.name': [
        'Гроза голубей',
        'Pigeon Scourge',
        'Taubenschreck',
        'Azote de Palomas'
    ],
    'ach.pigeon5.desc': [
        'Повалить 5 голубей за один забег',
        'Knock down 5 pigeons in one run',
        '5 Tauben in einem Lauf erledigen',
        'Derriba 5 palomas en una partida'
    ],
    'ach.pigeon25.name': [
        'Птичий король',
        'Bird King',
        'Vogelkönig',
        'Rey de las Aves'
    ],
    'ach.pigeon25.desc': [
        '25 голубей за всё время',
        '25 pigeons all time',
        '25 Tauben insgesamt',
        '25 palomas en total'
    ],
    /* ---------- мины и щиты ---------- */ 'ach.mine1.name': [
        'Бум!',
        'Boom!',
        'Bumm!',
        '¡Bum!'
    ],
    'ach.mine1.desc': [
        'Поймать мину и пережить шок лапки',
        'Hit a mine and survive the shock',
        'Eine Mine treffen und den Schock überstehen',
        'Toca una mina y sobrevive al choque'
    ],
    'ach.shieldUse.name': [
        'Прикрыт',
        'Covered',
        'Gedeckt',
        'Cubierto'
    ],
    'ach.shieldUse.desc': [
        'Щит спас лапку от мины',
        'A shield saved the paw from a mine',
        'Ein Schild rettete die Pfote',
        'Un escudo salvó la patita'
    ],
    'ach.shield3.name': [
        'Тройная броня',
        'Triple Armor',
        'Dreifache Rüstung',
        'Triple Armadura'
    ],
    'ach.shield3.desc': [
        'Иметь 3 щита от мин за один забег',
        'Have 3 mine shields in one run',
        '3 Minenschilde in einem Lauf',
        'Ten 3 escudos en una partida'
    ],
    /* ---------- богатство ---------- */ 'ach.coins10k.name': [
        'Кошелёк',
        'Wallet',
        'Geldbeutel',
        'Cartera'
    ],
    'ach.coins10k.desc': [
        'Накопить 10000 монет 🪙',
        'Save up 10,000 coins 🪙',
        '10.000 Münzen 🪙 ansammeln',
        'Ahorra 10.000 monedas 🪙'
    ],
    'ach.coins50k.name': [
        'Золотая гора',
        'Golden Mountain',
        'Goldener Berg',
        'Montaña Dorada'
    ],
    'ach.coins50k.desc': [
        'Накопить 50000 монет 🪙',
        'Save up 50,000 coins 🪙',
        '50.000 Münzen 🪙 ansammeln',
        'Ahorra 50.000 monedas 🪙'
    ],
    'ach.xp100k.name': [
        'Банк попкорна',
        'Popcorn Bank',
        'Popcorn-Bank',
        'Banco de Palomitas'
    ],
    'ach.xp100k.desc': [
        'Накопить 100000 опыта в банке',
        'Save up 100,000 XP in the bank',
        '100.000 XP in der Bank',
        'Ahorra 100.000 XP en el banco'
    ],
    'ach.tree5.name': [
        'Садовник',
        'Gardener',
        'Gärtner',
        'Jardinero'
    ],
    'ach.tree5.desc': [
        'Открыть 5 узлов древа улучшений',
        'Unlock 5 upgrade tree nodes',
        '5 Knoten des Baums freischalten',
        'Desbloquea 5 nodos del árbol'
    ],
    'ach.tree15.name': [
        'Лесовод',
        'Arborist',
        'Baumpfleger',
        'Arborista'
    ],
    'ach.tree15.desc': [
        'Прокачать 15 уровней древа улучшений',
        'Buy 15 upgrade tree levels',
        '15 Baumstufen kaufen',
        'Compra 15 niveles del árbol'
    ],
    'ach.catlvl10.name': [
        'Кот-мудрец',
        'Wise Cat',
        'Weise Katze',
        'Gato Sabio'
    ],
    'ach.catlvl10.desc': [
        'Вырастить котика до 10 уровня',
        'Raise the kitty to level 10',
        'Kätzchen auf Level 10',
        'Cría al gatito al nivel 10'
    ],
    'ach.catlvl20.name': [
        'Кот-легенда',
        'Legend Cat',
        'Legenden-Katze',
        'Gato Leyenda'
    ],
    'ach.catlvl20.desc': [
        'Вырастить котика до 20 уровня',
        'Raise the kitty to level 20',
        'Kätzchen auf Level 20',
        'Cría al gatito al nivel 20'
    ],
    /* ---------- забеги ---------- */ 'ach.runs10.name': [
        'Второе дыхание',
        'Second Wind',
        'Zweiter Atem',
        'Segundo Aliento'
    ],
    'ach.runs10.desc': [
        'Начать 10-й забег',
        'Start your 10th run',
        'Starte den 10. Lauf',
        'Comienza tu décima partida'
    ],
    'ach.score10k.name': [
        'Десять тысяч',
        'Ten Thousand',
        'Zehntausend',
        'Diez Mil'
    ],
    'ach.score10k.desc': [
        'Набрать 10000 очков за один забег',
        'Score 10,000 points in one run',
        '10.000 Punkte in einem Lauf',
        '10.000 puntos en una partida'
    ],
    'ach.score50k.name': [
        'Полтинник',
        'Fifty Grand',
        'Fünfzigtausend',
        'Cincuenta Mil'
    ],
    'ach.score50k.desc': [
        'Набрать 50000 очков за один забег',
        'Score 50,000 points in one run',
        '50.000 Punkte in einem Lauf',
        '50.000 puntos en una partida'
    ],
    'ach.nightowl.name': [
        'Полуночник',
        'Night Owl',
        'Nachteule',
        'Búho Nocturno'
    ],
    'ach.nightowl.desc': [
        'Играть ночью с 00:00 до 06:00',
        'Play between midnight and 6 AM',
        'Zwischen Mitternacht und 6 Uhr spielen',
        'Juega entre medianoche y las 6 AM'
    ],
    'ach.marathon.name': [
        'Марафон попкорна',
        'Popcorn Marathon',
        'Popcorn-Marathon',
        'Maratón de Palomitas'
    ],
    'ach.marathon.desc': [
        'Провести в одном забеге 10 минут',
        'Spend 10 minutes in a single run',
        '10 Minuten in einem Lauf',
        '10 minutos en una sola partida'
    ],
    /* ---------- новые перки ---------- */ 'ach.nipple50.name': [
        'Нянька',
        'Babysitter',
        'Babysitter',
        'Niñera'
    ],
    'ach.nipple50.desc': [
        'Поймать 50 сосок 🍼 за всё время',
        'Catch 50 pacifiers 🍼 all time',
        '50 Schnuller 🍼 insgesamt',
        'Atrapa 50 chupetes 🍼 en total'
    ],
    'ach.gift1.name': [
        'Первый подарок',
        'First Gift',
        'Erstes Geschenk',
        'Primer Regalo'
    ],
    'ach.gift1.desc': [
        'Поймать подарочную коробку 🎁 на поле',
        'Catch a gift box 🎁 on the field',
        'Fange eine Geschenkbox 🎁 auf dem Feld',
        'Atrapa una caja de regalo 🎁 en el campo'
    ],
    'ach.giftfreeze.name': [
        'Ледяная пауза',
        'Icy Pause',
        'Eispause',
        'Pausa Helada'
    ],
    'ach.giftfreeze.desc': [
        'Поймать коробку с ФРИЗОМ таймера',
        'Catch a TIMER FREEZE box',
        'Fange eine Box mit TIMER-STOPP',
        'Atrapa una caja de CONGELACIÓN del tiempo'
    ],
    'ach.giftsweep.name': [
        'Чистый пол',
        'Clean Floor',
        'Reiner Boden',
        'Suelo Limpio'
    ],
    'ach.giftsweep.desc': [
        'Поймать коробку-зачистку: все мины взорвались безвредно',
        'Catch a MINE SWEEP box: all mines blew up harmlessly',
        'Fange eine Minen-Räum-Box: alle Minen Harmlos explodiert',
        'Atrapa una caja de LIMPIEZA: todas las minas explotaron sin daño'
    ],
    'ach.gift10x.name': [
        'Десятикратный',
        'Tenfold',
        'Zehnfach',
        'Diez Veces'
    ],
    'ach.gift10x.desc': [
        'Поймать коробку с очками ×10!',
        'Catch a ×10 points box!',
        'Fange eine Box mit ×10 Punkten!',
        '¡Atrapa una caja de ×10 puntos!'
    ],
    'ach.gift10.name': [
        'Праздничный кот',
        'Party Cat',
        'Party-Katze',
        'Gato de Fiesta'
    ],
    'ach.gift10.desc': [
        'Поймать 10 подарочных коробок за всё время',
        'Catch 10 gift boxes all time',
        '10 Geschenkboxen insgesamt',
        'Atrapa 10 cajas de regalo en total'
    ],
    'ach.hover1.name': [
        'Лёгкое крыло',
        'Light Wing',
        'Leichter Flügel',
        'Ala Ligera'
    ],
    'ach.hover1.desc': [
        'Взять перк «Парящая лапка» и проплыть над минами',
        'Take the “Floating Paw” perk and glide over mines',
        'Nimm „Schwebende Pfote“ und gleite über Minen',
        'Toma “Patita Flotante” y flota sobre las minas'
    ],
    'ach.bgWhite.name': [
        'Засвет',
        'Whiteout',
        'Weißblende',
        'Blanco Total'
    ],
    'ach.bgWhite.desc': [
        'Сыграть уровень с фоном «Засвет»',
        'Play a level with the “Whiteout” background',
        'Level mit „Weißblende“-Hintergrund',
        'Nivel con el fondo “Blanco Total”'
    ],
    'ach.bgPopcorn.name': [
        'Попкорн до горизонта',
        'Popcorn to the Horizon',
        'Popcorn bis zum Horizont',
        'Palomitas al Horizonte'
    ],
    'ach.bgPopcorn.desc': [
        'Сыграть с фоном «Попкорнопад»',
        'Play with the “Popcorn Fall” background',
        'Mit „Popcornregen“-Hintergrund',
        'Juega con el fondo “Lluvia de Palomitas”'
    ],
    'ach.pigeonfeast.name': [
        'Птичий переполох',
        'Birdy Chaos',
        'Vogel-Trubel',
        'Alboroto de Aves'
    ],
    'ach.pigeonfeast.desc': [
        'Взять перк «Птичий базар»',
        'Take the “Bird Bazaar” perk',
        'Nimm den „Vogelmarkt“-Perk',
        'Toma la ventaja “Bazar de Aves”'
    ],
    'ach.rainbowrun.name': [
        'Радуга',
        'Rainbow',
        'Regenbogen',
        'Arcoíris'
    ],
    'ach.rainbowrun.desc': [
        'Сыграть с перком «Хамелеон»',
        'Play with the “Chameleon” perk',
        'Spiele mit dem „Chamäleon“-Perk',
        'Juega con la ventaja “Camaleón”'
    ],
    'ach.neonrun.name': [
        'Неоновый кот',
        'Neon Cat',
        'Neon-Katze',
        'Gato Neón'
    ],
    'ach.neonrun.desc': [
        'Сыграть с перком «Неон»',
        'Play with the “Neon” perk',
        'Spiele mit dem „Neon“-Perk',
        'Juega con la ventaja “Neón”'
    ],
    'ach.curse5.name': [
        'Гладиатор',
        'Gladiator',
        'Gladiator',
        'Gladiador'
    ],
    'ach.curse5.desc': [
        'Взять 5 проклятий из сундучков за всё время',
        'Take 5 curses from chests all time',
        '5 Flüche aus Truhen insgesamt',
        'Toma 5 maldiciones de cofres en total'
    ],
    'ach.bonus10.name': [
        'Везунчик',
        'Lucky One',
        'Glückspilz',
        'Afortunado'
    ],
    'ach.bonus10.desc': [
        'Взять 10 бонусов из сундучков за всё время',
        'Take 10 bonuses from chests all time',
        '10 Boni aus Truhen insgesamt',
        'Toma 10 bonus de cofres en total'
    ],
    'ach.heart1.name': [
        'Первый шрам',
        'First Scar',
        'Erste Narbe',
        'Primera cicatriz'
    ],
    'ach.heart1.desc': [
        'Потерять первое сердечко ❤️ и продолжить бой',
        'Lose your first heart and fight on',
        'Verliere das erste Herz und kämpfe weiter',
        'Pierde el primer corazón y sigue luchando'
    ],
    'ach.heartsFree5.name': [
        'Целая и невредимая',
        'Unscathed',
        'Unversehrt',
        'Intacta'
    ],
    'ach.heartsFree5.desc': [
        'Пройти 5 уровней подряд без потери сердец',
        'Clear 5 levels in a row without losing a heart',
        '5 Level in Folge ohne Herzverlust schaffen',
        'Supera 5 niveles seguidos sin perder corazones'
    ],
    'ach.heartsLast.name': [
        'На честном слове',
        'By a Whisker',
        'Haarscharf',
        'Por los pelos'
    ],
    'ach.heartsLast.desc': [
        'Пройти уровень, оставшись с одним сердечком',
        'Clear a level with just one heart left',
        'Level mit nur einem Herz übrig schaffen',
        'Supera un nivel con un solo corazón'
    ],
    'ach.pigeon50.name': [
        'Орнитолог',
        'Ornithologist',
        'Ornithologe',
        'Ornitóloga'
    ],
    'ach.pigeon50.desc': [
        'Повалить 50 голубей за всё время',
        'Down 50 pigeons all time',
        '50 Tauben insgesamt erledigt',
        'Abate 50 palomas en total'
    ],
    'ach.sevenhearts.name': [
        'Семь жизней',
        'Seven Lives',
        'Sieben Leben',
        'Siete vidas'
    ],
    'ach.sevenhearts.desc': [
        'Собрать максимум из 7 сердечек (апгрейд + древо + лапка)',
        'Reach a maximum of 7 hearts (upgrade + tree + paw)',
        'Erreiche 7 Max-Herzen (Upgrade + Baum + Pfote)',
        'Alcanza 7 corazones (mejora + árbol + patita)'
    ],
    /* ---------- сотка: медали 56–100 ---------- */ 'ach.score100k.name': [
        'Сто тысяч',
        'One Hundred K',
        'Hunderttausend',
        'Cien Mil'
    ],
    'ach.score100k.desc': [
        'Набрать 100000 очков за один забег',
        'Score 100,000 points in one run',
        '100.000 Punkte in einem Lauf',
        'Anota 100.000 puntos en una partida'
    ],
    'ach.score200k.name': [
        'Двести тысяч',
        'Two Hundred K',
        'Zweihunderttausend',
        'Doscientos Mil'
    ],
    'ach.score200k.desc': [
        'Набрать 200000 очков за один забег',
        'Score 200,000 points in one run',
        '200.000 Punkte in einem Lauf',
        'Anota 200.000 puntos en una partida'
    ],
    'ach.combo30.name': [
        'Тридцать подряд',
        'Thirty Straight',
        'Dreißig in Folge',
        'Treinta Seguidas'
    ],
    'ach.combo30.desc': [
        'Серия из 30 сдач подряд',
        'A streak of 30 deliveries in a row',
        'Serie aus 30 Abgaben in Folge',
        'Racha de 30 entregas seguidas'
    ],
    'ach.combo50.name': [
        'Полсотни без промаха',
        'Fifty Clean',
        'Fünfzig ohne Fehler',
        'Cincuenta Limpias'
    ],
    'ach.combo50.desc': [
        'Серия из 50 сдач подряд',
        'A streak of 50 deliveries in a row',
        'Serie aus 50 Abgaben in Folge',
        'Racha de 50 entregas seguidas'
    ],
    'ach.golden25.name': [
        'Золотой дождь',
        'Golden Rain',
        'Goldregen',
        'Lluvia Dorada'
    ],
    'ach.golden25.desc': [
        '25 золотых зёрен за один забег',
        '25 golden kernels in one run',
        '25 Goldkörner in einem Lauf',
        '25 granos dorados en una partida'
    ],
    'ach.goldenLife250.name': [
        'Золотоискатель',
        'Gold Digger',
        'Goldsucher',
        'Buscador de Oro'
    ],
    'ach.goldenLife250.desc': [
        '250 золотых зёрен за всё время',
        '250 golden kernels all time',
        '250 Goldkörner insgesamt',
        '250 granos dorados en total'
    ],
    'ach.grains500.name': [
        'Полтысячи',
        'Five Hundred',
        'Fünfhundert',
        'Quinientos'
    ],
    'ach.grains500.desc': [
        'Сдать 500 зёрен в стаканчик за один забег',
        'Deliver 500 kernels to the cup in one run',
        '500 Körner in einem Lauf liefern',
        'Entrega 500 granos al vaso en una partida'
    ],
    'ach.grainsLife50k.name': [
        'Цистерна',
        'Tanker',
        'Tankwagen',
        'Cisterna'
    ],
    'ach.grainsLife50k.desc': [
        '50000 зёрен за всё время',
        '50,000 kernels all time',
        '50.000 Körner insgesamt',
        '50.000 granos en total'
    ],
    'ach.grainsLife100k.name': [
        'Элеватор',
        'Granary',
        'Getreidesilo',
        'Granero'
    ],
    'ach.grainsLife100k.desc': [
        '100000 зёрен за всё время',
        '100,000 kernels all time',
        '100.000 Körner insgesamt',
        '100.000 granos en total'
    ],
    'ach.pigeon10.name': [
        'Перьевой шторм',
        'Feather Storm',
        'Federsturm',
        'Tormenta de Plumas'
    ],
    'ach.pigeon10.desc': [
        '10 голубей за один забег',
        '10 pigeons in one run',
        '10 Tauben in einem Lauf',
        '10 palomas en una partida'
    ],
    'ach.pigeon100.name': [
        'Голубиный апокалипсис',
        'Pigeon Apocalypse',
        'Tauben-Apokalypse',
        'Apocalipsis de Palomas'
    ],
    'ach.pigeon100.desc': [
        '100 голубей за всё время',
        '100 pigeons all time',
        '100 Tauben insgesamt',
        '100 palomas en total'
    ],
    'ach.fever25.name': [
        'Жаровня',
        'Brazier',
        'Bratpfanne',
        'Brasero'
    ],
    'ach.fever25.desc': [
        '25 ЛИХОРАДОК за всё время',
        '25 FEVERS all time',
        '25 FIEBER insgesamt',
        '25 FIEBRES en total'
    ],
    'ach.fever50.name': [
        'Вечный огонь',
        'Eternal Flame',
        'Ewiges Feuer',
        'Llama Eterna'
    ],
    'ach.fever50.desc': [
        '50 ЛИХОРАДОК за всё время',
        '50 FEVERS all time',
        '50 FIEBER insgesamt',
        '50 FIEBRES en total'
    ],
    'ach.fever1000.name': [
        'Тысяча в огне',
        'Thousand in Flames',
        'Tausend im Feuer',
        'Mil en Llamas'
    ],
    'ach.fever1000.desc': [
        '1000 очков за одну ЛИХОРАДКУ',
        '1,000 points in one FEVER',
        '1.000 Punkte in einem FIEBER',
        '1.000 puntos en una FIEBRE'
    ],
    'ach.wave15.name': [
        'Пятнадцатая волна',
        'Fifteenth Wave',
        'Fünfzehnte Welle',
        'Decimoquinta Ola'
    ],
    'ach.wave15.desc': [
        'Дожить до 15-й волны',
        'Survive to wave 15',
        'Welle 15 erreichen',
        'Sobrevive a la ola 15'
    ],
    'ach.wave20.name': [
        'Двадцатая волна',
        'Twentieth Wave',
        'Zwanzigste Welle',
        'Vigésima Ola'
    ],
    'ach.wave20.desc': [
        'Дожить до 20-й волны',
        'Survive to wave 20',
        'Welle 20 erreichen',
        'Sobrevive a la ola 20'
    ],
    'ach.level30.name': [
        'Тридцатка',
        'Thirty',
        'Dreißig',
        'Treinta'
    ],
    'ach.level30.desc': [
        'Дойти до 30-го уровня',
        'Reach level 30',
        'Level 30 erreichen',
        'Alcanza el nivel 30'
    ],
    'ach.level40.name': [
        'Сороковка',
        'Forty',
        'Vierzig',
        'Cuarenta'
    ],
    'ach.level40.desc': [
        'Дойти до 40-го уровня',
        'Reach level 40',
        'Level 40 erreichen',
        'Alcanza el nivel 40'
    ],
    'ach.level50.name': [
        'Кинофестиваль',
        'Film Festival',
        'Filmfestival',
        'Festival de Cine'
    ],
    'ach.level50.desc': [
        'Дойти до 50-го уровня',
        'Reach level 50',
        'Level 50 erreichen',
        'Alcanza el nivel 50'
    ],
    'ach.runs25.name': [
        'Сезонный абонемент',
        'Season Pass',
        'Dauerkarte',
        'Abono de Temporada'
    ],
    'ach.runs25.desc': [
        'Начать 25 забегов',
        'Start 25 runs',
        '25 Läufe starten',
        'Empieza 25 partidas'
    ],
    'ach.runs50.name': [
        'Ветеран попкорна',
        'Popcorn Veteran',
        'Popcorn-Veteran',
        'Veterano del Popcorn'
    ],
    'ach.runs50.desc': [
        'Начать 50 забегов',
        'Start 50 runs',
        '50 Läufe starten',
        'Empieza 50 partidas'
    ],
    'ach.runs100.name': [
        'Сотня забегов',
        'Hundred Runs',
        'Hundert Läufe',
        'Cien Partidas'
    ],
    'ach.runs100.desc': [
        'Начать 100 забегов',
        'Start 100 runs',
        '100 Läufe starten',
        'Empieza 100 partidas'
    ],
    'ach.coins100k.name': [
        'Сейф',
        'Safe',
        'Tresor',
        'Caja Fuerte'
    ],
    'ach.coins100k.desc': [
        'Накопить 100000 монет 🪙',
        'Save 100,000 coins 🪙',
        '100.000 Münzen sparen 🪙',
        'Ahorra 100.000 monedas 🪙'
    ],
    'ach.coins250k.name': [
        'Сокровищница',
        'Treasury',
        'Schatzkammer',
        'Tesorería'
    ],
    'ach.coins250k.desc': [
        'Накопить 250000 монет 🪙',
        'Save 250,000 coins 🪙',
        '250.000 Münzen sparen 🪙',
        'Ahorra 250.000 monedas 🪙'
    ],
    'ach.bank50k.name': [
        'Хранилище',
        'Vault',
        'Kerker',
        'Bóveda'
    ],
    'ach.bank50k.desc': [
        'Накопить 50000 опыта 🍿 в банке',
        'Save 50,000 XP 🍿 in the bank',
        '50.000 XP 🍿 in der Bank sparen',
        'Ahorra 50.000 XP 🍿 en el banco'
    ],
    'ach.catlvl30.name': [
        'Кот-сенсей',
        'Kitty Sensei',
        'Kätzchen-Sensei',
        'Gatito Sensei'
    ],
    'ach.catlvl30.desc': [
        'Вырастить котика до 30 уровня',
        'Raise the kitty to level 30',
        'Kätzchen auf Level 30',
        'Cría al gatito hasta el nivel 30'
    ],
    'ach.catlvl50.name': [
        'Кот-космонавт',
        'Space Kitty',
        'Kosmo-Kätzchen',
        'Gatito Astronauta'
    ],
    'ach.catlvl50.desc': [
        'Вырастить котика до 50 уровня',
        'Raise the kitty to level 50',
        'Kätzchen auf Level 50',
        'Cría al gatito hasta el nivel 50'
    ],
    'ach.tree30.name': [
        'Роща',
        'Grove',
        'Hain',
        'Arboleda'
    ],
    'ach.tree30.desc': [
        'Прокачать 30 уровней древа улучшений',
        'Upgrade 30 levels of the improvement tree',
        '30 Ebenen des Verbesserungsbaums',
        'Mejora 30 niveles del árbol'
    ],
    'ach.tree60.name': [
        'Дубрава',
        'Oakwood',
        'Eichenhain',
        'Robledal'
    ],
    'ach.tree60.desc': [
        'Прокачать 60 уровней древа улучшений',
        'Upgrade 60 levels of the improvement tree',
        '60 Ebenen des Verbesserungsbaums',
        'Mejora 60 niveles del árbol'
    ],
    'ach.treeFull.name': [
        'Древо жизни',
        'Tree of Life',
        'Lebensbaum',
        'Árbol de la Vida'
    ],
    'ach.treeFull.desc': [
        'Полностью прокачать древо улучшений',
        'Fully upgrade the whole improvement tree',
        'Den Verbesserungsbaum ganz ausbauen',
        'Mejora por completo el árbol'
    ],
    'ach.paws10.name': [
        'Гардероб',
        'Wardrobe',
        'Garderobe',
        'Guardarropa'
    ],
    'ach.paws10.desc': [
        'Владеть 10 лапками одновременно',
        'Own 10 paws at once',
        '10 Pfoten gleichzeitig besitzen',
        'Reúne 10 patitas a la vez'
    ],
    'ach.pawsAll.name': [
        'Все лапки мира',
        'Every Paw in the World',
        'Alle Pfoten der Welt',
        'Todas las Patitas'
    ],
    'ach.pawsAll.desc': [
        'Собрать все лапки из магазина',
        'Collect every paw from the shop',
        'Alle Pfoten aus dem Shop sammeln',
        'Consigue todas las patitas de la tienda'
    ],
    'ach.upg5.name': [
        'Мастер на все лапки',
        'Jack of All Paws',
        'Meister aller Pfoten',
        'Maestro de Patitas'
    ],
    'ach.upg5.desc': [
        'Купить 5 постоянных апгрейдов',
        'Buy 5 permanent upgrades',
        '5 permanente Upgrades kaufen',
        'Compra 5 mejoras permanentes'
    ],
    'ach.upg10.name': [
        'Инженер',
        'Engineer',
        'Ingenieur',
        'Ingeniero'
    ],
    'ach.upg10.desc': [
        'Купить 10 постоянных апгрейдов',
        'Buy 10 permanent upgrades',
        '10 permanente Upgrades kaufen',
        'Compra 10 mejoras permanentes'
    ],
    'ach.upgAll.name': [
        'Апгрейд-барон',
        'Upgrade Baron',
        'Upgrade-Baron',
        'Barón de Mejoras'
    ],
    'ach.upgAll.desc': [
        'Выкупить все апгрейды магазина до максимума',
        'Max out every upgrade in the shop',
        'Alle Shop-Upgrades maximal ausbauen',
        'Lleva todas las mejoras de la tienda al máximo'
    ],
    'ach.secs3600.name': [
        'Час в попкорне',
        'Hour of Popcorn',
        'Stunde Popcorn',
        'Hora de Popcorn'
    ],
    'ach.secs3600.desc': [
        'Наиграть 1 час чистого времени за всё время',
        'Play 1 hour of pure game time all time',
        '1 Stunde reine Spielzeit insgesamt',
        'Juega 1 hora de tiempo puro en total'
    ],
    'ach.secs18000.name': [
        'Попкорн-марафонец',
        'Popcorn Marathoner',
        'Popcorn-Marathonläufer',
        'Maratonista del Popcorn'
    ],
    'ach.secs18000.desc': [
        'Наиграть 5 часов чистого времени',
        'Play 5 hours of pure game time',
        '5 Stunden reine Spielzeit',
        'Juega 5 horas de tiempo puro'
    ],
    'ach.visits10.name': [
        'Постоянный зритель',
        'Regular Viewer',
        'Stammgast',
        'Espectador Frecuente'
    ],
    'ach.visits10.desc': [
        'Заглянуть в игру 10 раз',
        'Visit the game 10 times',
        'Das Spiel 10 Mal besuchen',
        'Visita el juego 10 veces'
    ],
    'ach.visits50.name': [
        'Свой в доску',
        'One of Our Own',
        'Einer von uns',
        'De la Casa'
    ],
    'ach.visits50.desc': [
        'Заглянуть в игру 50 раз',
        'Visit the game 50 times',
        'Das Spiel 50 Mal besuchen',
        'Visita el juego 50 veces'
    ],
    'ach.curse25.name': [
        'Проклятый кот',
        'Cursed Cat',
        'Verfluchte Katze',
        'Gato Maldito'
    ],
    'ach.curse25.desc': [
        'Взять 25 проклятий из сундучков за всё время',
        'Take 25 curses from chests all time',
        '25 Flüche aus Truhen insgesamt',
        'Toma 25 maldiciones de cofres en total'
    ],
    'ach.bonus25.name': [
        'Кладоискатель',
        'Treasure Hunter',
        'Schatzjäger',
        'Cazador de Tesoros'
    ],
    'ach.bonus25.desc': [
        'Взять 25 бонусов из сундучков за всё время',
        'Take 25 bonuses from chests all time',
        '25 Boni aus Truhen insgesamt',
        'Toma 25 bonos de cofres en total'
    ],
    'ach.nipple200.name': [
        'Молочная ферма',
        'Dairy Farm',
        'Milchhof',
        'Granja Lechera'
    ],
    'ach.nipple200.desc': [
        '200 сосок 🍼 за всё время',
        '200 pacifiers 🍼 all time',
        '200 Schnuller 🍼 insgesamt',
        '200 chupetes 🍼 en total'
    ],
    'ach.perfect10.name': [
        'Без сучка',
        'Without a Flaw',
        'Ohne Makel',
        'Sin un Fallo'
    ],
    'ach.perfect10.desc': [
        '10 уровней без мин и краж за всё время',
        '10 levels without mines or thefts all time',
        '10 Level ohne Minen und Diebstähle',
        '10 niveles sin minas ni robos en total'
    ],
    'ach.scoreLife100k.name': [
        'Счётчик очков',
        'Score Counter',
        'Punkte-Zähler',
        'Contador de Puntos'
    ],
    'ach.scoreLife100k.desc': [
        'Заработать 100000 очков за всё время',
        'Earn 100,000 points all time',
        '100.000 Punkte insgesamt',
        'Gana 100.000 puntos en total'
    ],
    'ach.scoreLife1m.name': [
        'Миллион попкорна',
        'Popcorn Million',
        'Popcorn-Million',
        'Millón de Popcorn'
    ],
    'ach.scoreLife1m.desc': [
        'Заработать 1000000 очков за всё время',
        'Earn 1,000,000 points all time',
        '1.000.000 Punkte insgesamt',
        'Gana 1.000.000 puntos en total'
    ],
    /* ---------- ачивки 0.0.31: босс «МАЛЫШ», большие попкорнины, нарезка ---------- */ 'ach.big1.name': [
        'Жирный улов',
        'Fat Catch',
        'Fetter Fang',
        'Captura Gorda'
    ],
    'ach.big1.desc': [
        'Поймать большую попкорнину на поле за один забег',
        'Catch a big popcorn on the field in one run',
        'Fange ein großes Popcorn im Lauf',
        'Atrapa una palomita grande en una partida'
    ],
    'ach.bigAll.name': [
        'Дегустатор',
        'Taster',
        'Verkoster',
        'Catador'
    ],
    'ach.bigAll.desc': [
        'Поймать все три сорта больших попкорнин за один забег',
        'Catch all three big popcorn kinds in one run',
        'Fange alle drei Sorten in einem Lauf',
        'Atrapa las tres clases de palomitas en una partida'
    ],
    'ach.bigGrape5.name': [
        'Виноградный магнат',
        'Grape Magnate',
        'Trauben-Magnat',
        'Magnate de Uvas'
    ],
    'ach.bigGrape5.desc': [
        'Поймать 5 виноградных попкорнин за всё время',
        'Catch 5 grape popcorns all time',
        'Fange 5 Trauben-Popcorns insgesamt',
        'Atrapa 5 palomitas de uva en total'
    ],
    'ach.boss1.name': [
        'Малыш повержен',
        'Kid Defeated',
        'Knirps besiegt',
        'Niño Derrotado'
    ],
    'ach.boss1.desc': [
        'Победить босса МАЛЫША в арканоид-бою',
        'Defeat the KID boss in the arkanoid fight',
        'Besiege den BOSS-Knirps im Arkanoid-Kampf',
        'Derrota al jefe NIÑO en la pelea arkanoid'
    ],
    'ach.boss3run.name': [
        'Три нянки',
        'Three Nannies',
        'Drei Kindermädchen',
        'Tres Niñeras'
    ],
    'ach.boss3run.desc': [
        'Победить трёх малышей за один забег',
        'Defeat three kids in one run',
        'Besiege drei Knirpse in einem Lauf',
        'Derrota tres niños en una partida'
    ],
    'ach.bossNoHit.name': [
        'Неприкасаемый',
        'Untouchable',
        'Unberührbar',
        'Intocable'
    ],
    'ach.bossNoHit.desc': [
        'Победить малыша, не потеряв на его уровне ни одного сердечка',
        'Defeat the kid without losing a single heart on his level',
        'Besiege den Knirps ohne ein einziges Herz zu verlieren',
        'Derrota al niño sin perder ni un corazón en su nivel'
    ],
    'ach.boss5life.name': [
        'Плюшевый громила',
        'Plush Brute',
        'Plüsch-Bully',
        'Bruto de Peluche'
    ],
    'ach.boss5life.desc': [
        'Победить 5 малышей за всё время',
        'Defeat 5 kids all time',
        'Besiege 5 Knirpse insgesamt',
        'Derrota 5 niños en total'
    ],
    'ach.slice1k.name': [
        'Мастер нарезки',
        'Slice Master',
        'Schnitt-Meister',
        'Maestro del Corte'
    ],
    'ach.slice1k.desc': [
        'Набрать 1000 очков за одну нарезку',
        'Score 1,000 points in one slicing bonus',
        '1.000 Punkte in einem Schnitt',
        '1.000 puntos en un corte'
    ],
    'ach.slice2k5.name': [
        'Гроссмейстер ножа',
        'Blade Grandmaster',
        'Klingen-Großmeister',
        'Gran Maestro de la Hoja'
    ],
    'ach.slice2k5.desc': [
        'Набрать 2500 очков за одну нарезку',
        'Score 2,500 points in one slicing bonus',
        '2.500 Punkte in einem Schnitt',
        '2.500 puntos en un corte'
    ],
    'ach.sliceCherry.name': [
        'Вишнёвый разгром',
        'Cherry Smash',
        'Kirsch-Kracher',
        'Golpe de Cereza'
    ],
    'ach.sliceCherry.desc': [
        'Нарезать ВИШНЁВУЮ попкорнину на 2500 очков',
        'Slice the CHERRY popcorn for 2,500 points',
        'Schneide das KIRSCH-Popcorn für 2.500 Punkte',
        'Corta la palomita CEREZA por 2.500 puntos'
    ],
    'ach.sliceGrape.name': [
        'Виноградный титан',
        'Grape Titan',
        'Trauben-Titan',
        'Titán de Uva'
    ],
    'ach.sliceGrape.desc': [
        'Нарезать ВИНОГРАДНУЮ попкорнину на 4500 очков',
        'Slice the GRAPE popcorn for 4,500 points',
        'Schneide das TRAUBEN-Popcorn für 4.500 Punkte',
        'Corta la palomita UVA por 4.500 puntos'
    ],
    'ach.sliceAll3.name': [
        'Полное меню',
        'Full Menu',
        'Volle Karte',
        'Menú Completo'
    ],
    'ach.sliceAll3.desc': [
        'За всё время нарезать все три сорта попкорнин',
        'Slice all three popcorn kinds all time',
        'Schneide alle drei Sorten insgesamt',
        'Corta las tres clases de palomitas en total'
    ],
    /* ---------- перки ----------
     v0.0.41: перки-перевороты (rot180/rot90), зеркало и «Ночная смена»
     удалены — инвертированное управление и полная тьма не нравятся игрокам */ 'perk.tag.curse': [
        '☠ ПРОКЛЯТЬЕ',
        '☠ CURSE',
        '☠ FLUCH',
        '☠ MALDICIÓN'
    ],
    'perk.tag.bonus': [
        '✨ БОНУС',
        '✨ BONUS',
        '✨ BONUS',
        '✨ PREMIO'
    ],
    'perk.grayscale.name': [
        'Чёрно-белое кино',
        'Black & White',
        'Schwarzweißkino',
        'Cine Blanco y Negro'
    ],
    'perk.grayscale.desc': [
        'Мир теряет краски. Ищи попкорн среди серых теней, как в старом фильме!',
        'The world loses color — find popcorn among gray shadows, like an old film!',
        'Die Welt verliert Farben — suche Popcorn in grauen Schatten!',
        'El mundo pierde color: busca palomitas entre sombras grises.'
    ],
    'perk.slowpaw.name': [
        'Тяжёлая лапа',
        'Heavy Paw',
        'Schwere Pfote',
        'Patita Pesada'
    ],
    'perk.slowpaw.desc': [
        'Лапка налила свинца: тянется к цели вдвое медленнее. Награда за терпение — очки ×1.35!',
        'The paw turned to lead: reaches twice as slowly. Patience pays — ×1.35 points!',
        'Die Pfote ist schwer wie Blei: doppelt so langsam. Geduld zahlt — ×1.35 Punkte!',
        'La patita se llenó de plomo: llega el doble de lenta. La paciencia paga: ¡×1.35 puntos!'
    ],
    'perk.slowpaw2.name': [
        'Каменная лапа',
        'Stone Paw',
        'Steinerne Pfote',
        'Patita de Piedra'
    ],
    'perk.slowpaw2.desc': [
        'Лапка окаменела: тянется к цели втрое медленнее. Сложно, но очки ×1.8!',
        'The paw turned to stone: three times slower. Hard, but ×1.8 points!',
        'Die Pfote ist Stein: dreimal so langsam. Schwer, aber ×1.8 Punkte!',
        'La patita se volvió piedra: tres veces más lenta. ¡Difícil, pero ×1.8 puntos!'
    ],
    'perk.slowpaw3.name': [
        'Лапа-валун',
        'Boulder Paw',
        'Felsenpfote',
        'Patita Roca'
    ],
    'perk.slowpaw3.desc': [
        'Едва ползёт — в 4 раза медленнее. Испытание для мастеров: очки ×2.5!',
        'It barely crawls — four times slower. A master’s trial: ×2.5 points!',
        'Sie kriecht nur — viermal so langsam. Meisterprüfung: ×2.5 Punkte!',
        'Apenas se arrastra: cuatro veces más lenta. ¡Prueba de maestros: ×2.5 puntos!'
    ],
    'perk.hover.name': [
        'Парящая лапка',
        'Floating Paw',
        'Schwebende Pfote',
        'Patita Flotante'
    ],
    'perk.hover.desc': [
        'Лапка парит над минами: первые 8 секунд уровня мины под ней не взрываются!',
        'The paw floats above mines: for the first 8 seconds of a level, mines don’t explode beneath it!',
        'Die Pfote schwebt über Minen: die ersten 8 Sekunden explodieren Minen darunter nicht!',
        'La patita flota sobre las minas: ¡en los primeros 8 segundos no explotan bajo ella!'
    ],
    'perk.smallpaw.name': [
        'Мини-лапка',
        'Mini Paw',
        'Mini-Pfote',
        'Minipatita'
    ],
    'perk.smallpaw.desc': [
        'Лапка заметно уменьшилась — зачерпнуть зерно можно только вплотную.',
        'The paw shrank — you can only scoop kernels up close.',
        'Die Pfote schrumpfte — nur im direkten Kontakt greifen.',
        'La patita se encogió: solo atrapas granos pegada a ellos.'
    ],
    'perk.shaky.name': [
        'Нервная лапа',
        'Nervous Paw',
        'Nervöse Pfote',
        'Patita Nerviosa'
    ],
    'perk.shaky.desc': [
        'Лапка подрагивает и дёргается — прицелиться стало трудно.',
        'The paw twitches and jolts — aiming is hard now.',
        'Die Pfote zuckt — Zielen wird schwer.',
        'La patita tiembla y tira: apuntar es difícil.'
    ],
    'perk.cornrain.name': [
        'Кукурузный ливень',
        'Corn Downpour',
        'Mais-Schauer',
        'Lluvia de Maíz'
    ],
    'perk.cornrain.desc': [
        'Кукурузы-мин падает вдвое больше! Маршрут — только по чистому полу.',
        'Twice as many corn mines fall! Route through the clean floor only.',
        'Doppelt so viele Minen! Nur über den freien Boden laufen.',
        '¡Cae el doble de minas! Pasa solo por el suelo limpio.'
    ],
    'perk.fog.name': [
        'Попкорнный туман',
        'Popcorn Fog',
        'Popcornnebel',
        'Niebla de Palomitas'
    ],
    'perk.fog.desc': [
        'Поле тонет в тумане: видно только то, что рядом с лапкой.',
        'The field sinks into fog: you only see what is near the paw.',
        'Das Feld versinkt im Nebel: nur das Nahe ist sichtbar.',
        'El campo se hunde en niebla: solo ves lo que rodea a la patita.'
    ],
    'perk.drift.name': [
        'Скользкий пол',
        'Slippery Floor',
        'Rutschiger Boden',
        'Suelo Resbaladizo'
    ],
    'perk.drift.desc': [
        'Зёрна катаются по полу в разные стороны — поймай их первыми!',
        'Kernels roll in every direction — beat them to it!',
        'Körner rollen in alle Richtungen — sei schneller!',
        'Los granos ruedan en todas direcciones: ¡gánalos la carrera!'
    ],
    'perk.magnet.name': [
        'Магнитная лапа',
        'Magnet Paw',
        'Magnetpfote',
        'Patita Imán'
    ],
    'perk.magnet.desc': [
        'Попкорн сам прыгает в лапку, стоит подойти поближе!',
        'Nearby popcorn hops right into the paw!',
        'Popcorn springt von selbst in die nahe Pfote!',
        'Las palomitas saltan solas a la patita cercana.'
    ],
    'perk.goldenvein.name': [
        'Золотая жила',
        'Golden Vein',
        'Goldader',
        'Vena Dorada'
    ],
    'perk.goldenvein.desc': [
        'Золотых зёрен (+50 очков) стало в разы больше. Греби богатство!',
        'Far more golden kernels (+50 points). Rake in the riches!',
        'Viel mehr goldene Körner (+50). Ernte den Reichtum!',
        'Muchos más granos dorados (+50). ¡Amasa la fortuna!'
    ],
    'perk.doublepoints.name': [
        'Двойной улов',
        'Double Catch',
        'Doppelfang',
        'Doble Captura'
    ],
    'perk.doublepoints.desc': [
        'Все очки удваиваются! Но и норма попкорна на уровень +30%.',
        'All points doubled! But the level goal is +30%.',
        'Alle Punkte doppelt! Aber das Ziel +30%.',
        '¡Puntos ×2! Pero la meta del nivel es +30%.'
    ],
    'perk.bigpaw.name': [
        'Лапа великана',
        'Giant Paw',
        'Riesenpfote',
        'Patitón'
    ],
    'perk.bigpaw.desc': [
        'Лапка выросла и гребёт разом — зерно летит в неё с большого радиуса.',
        'The paw grew huge — kernels fly in from a wide radius.',
        'Die Pfote wuchs riesig — Körner fliegen von weit her.',
        'La patita creció: los granos vuelan hacia ella desde lejos.'
    ],
    'perk.timeplus.name': [
        'Кошачьи часы',
        'Cat Clock',
        'Katzenuhr',
        'Reloj Felino'
    ],
    'perk.timeplus.desc': [
        'Целых 75 секунд на уровень вместо 60. Время — резиновое!',
        'A whole 75 seconds per level instead of 60. Stretchy time!',
        'Volle 75 Sekunden statt 60. Die Zeit ist dehnbar!',
        '75 segundos por nivel en vez de 60. ¡Tiempo elástico!'
    ],
    'perk.shield.name': [
        'Кошачий щит',
        'Cat Shield',
        'Katzenschild',
        'Escudo Felino'
    ],
    'perk.shield.desc': [
        'Первое попадание в мину за уровень прощается — щит лопается с шипением!',
        'The first mine hit this level is forgiven — the shield pops with a hiss!',
        'Die erste Mine wird verziehen — der Schild platzt zischend!',
        'La primera mina se perdona: ¡el escudo estalla con un siseo!'
    ],
    'perk.secondcup.name': [
        'Двойной стаканчик',
        'Double Cup',
        'Doppelter Becher',
        'Vaso Doble'
    ],
    'perk.secondcup.desc': [
        'Лапка носит на 2 зерна больше, а сдавать попкорн можно с дальнего подлёта!',
        'The paw carries +2 kernels and delivers from afar!',
        'Die Pfote trägt +2 Körner, Abgabe aus der Ferne!',
        'La patita lleva +2 granos y entrega a distancia.'
    ],
    'perk.slowmo.name': [
        'Черепаший час',
        'Turtle Hour',
        'Schildkrötenstunde',
        'Hora Tortuga'
    ],
    'perk.slowmo.desc': [
        'Таймер тикает на четверть медленнее: по сути, 80 секунд вместо 60!',
        'The timer ticks 25% slower: 80 seconds instead of 60!',
        'Der Timer tickt 25% langsamer: 80 statt 60 Sekunden!',
        'El reloj corre un 25% más lento: ¡80 segundos en vez de 60!'
    ],
    'perk.milky.name': [
        'Соски-малышки',
        'Baby Pacifiers',
        'Baby-Schnuller',
        'Chupetes Bebé'
    ],
    'perk.milky.desc': [
        'Все обычные зёрна заменены на соски 🍼: каждая +40 очков, но и норма подросла на 20%!',
        'All regular kernels become pacifiers 🍼: +40 each, but the goal grew 20%!',
        'Alle normalen Körner werden Schnuller 🍼: +40 pro Stück, aber das Ziel wächst um 20%!',
        '¡Los granos normales se vuelven chupetes 🍼: +40 cada uno, pero la meta crece 20%!'
    ],
    'perk.whiteout.name': [
        'Засвет',
        'Whiteout',
        'Weißblende',
        'Blanco Total'
    ],
    'perk.whiteout.desc': [
        'Белое пекло: фон выжигает все краски, белые зёрна почти невидимы! +25% очков.',
        'White blaze: the background burns out all colors, white kernels are almost invisible! +25% points.',
        'Weiße Glut: Der Hintergrund brennt alle Farben weg, weiße Körner sind fast unsichtbar! +25% Punkte.',
        'Resplandor blanco: el fondo quema los colores, ¡los granos blancos casi no se ven! +25% puntos.'
    ],
    'perk.popcornfall.name': [
        'Попкорнопад',
        'Popcorn Fall',
        'Popcornregen',
        'Lluvia de Palomitas'
    ],
    'perk.popcornfall.desc': [
        'Весь пол засыпан фоновым попкорном — свои зёрна ищи среди тысяч! +40% очков.',
        'The whole floor is covered with background popcorn — find yours among thousands! +40% points.',
        'Der ganze Boden ist mit Popcorn bedeckt — finde deine unter Tausenden! +40% Punkte.',
        '¡El suelo entero está cubierto de palomitas — encuentra las tuyas entre miles! +40% puntos.'
    ],
    'perk.neon.name': [
        'Неон',
        'Neon',
        'Neon',
        'Neón'
    ],
    'perk.neon.desc': [
        'Мир перекрашен в кислотные цвета — ищи зёрна по форме, а не по цвету!',
        'The world is repainted in acid colors — find kernels by shape, not color!',
        'Die Welt ist in Säurefarben gestrichen — finde Körner nach Form, nicht Farbe!',
        '¡El mundo se pinta de colores ácidos: busca granos por forma, no por color!'
    ],
    'perk.rainbow.name': [
        'Хамелеон',
        'Chameleon',
        'Chamäleon',
        'Camaleón'
    ],
    'perk.rainbow.desc': [
        'Цвета бегут по кругу каждые несколько секунд — глаза разбегаются!',
        'Colors cycle every few seconds — your eyes will run wild!',
        'Farben wechseln alle paar Sekunden — die Augen laufen davon!',
        '¡Los colores ciclan cada pocos segundos: los ojos se te van!'
    ],
    'perk.pigeonfeast.name': [
        'Птичий базар',
        'Bird Bazaar',
        'Vogelmarkt',
        'Bazar de Aves'
    ],
    'perk.pigeonfeast.desc': [
        'Голуби прилетают втрое чаще, но за каждого поверженного — двойные очки!',
        'Pigeons arrive three times as often, but each knockdown pays double!',
        'Tauben kommen dreimal öfter, aber jeder Sieg zahlt doppelt!',
        'Las palomas llegan el triple de seguido, ¡pero cada derrota paga doble!'
    ],
    /* ---------- сундук ---------- */ 'chest.title': [
        'УРОВЕНЬ {{n}} ПРОЙДЕН!',
        'LEVEL {{n}} CLEARED!',
        'LEVEL {{n}} GESCHAFFT!',
        '¡NIVEL {{n}} SUPERADO!'
    ],
    'chest.bonus': [
        'Бонус за скорость: +{{b}} · Счёт: {{s}}',
        'Speed bonus: +{{b}} · Score: {{s}}',
        'Tempobonus: +{{b}} · Punkte: {{s}}',
        'Bonus de velocidad: +{{b}} · Puntos: {{s}}'
    ],
    'chest.choose': [
        'Никто не знает, что внутри — выбирай вслепую!',
        'Nobody knows what is inside — pick blind!',
        'Niemand weiß, was drin ist — wähle blind!',
        'Nadie sabe qué hay dentro: ¡elige a ciegas!'
    ],
    'chest.pick': [
        '👇 Выбери сундучок!',
        '👇 Pick a chest!',
        '👇 Wähle eine Truhe!',
        '👇 ¡Elige un cofre!'
    ],
    'chest.chest': [
        'СУНДУК',
        'CHEST',
        'TRUHE',
        'COFRE'
    ],
    'chest.openN': [
        'Открыть сундучок {{n}}',
        'Open chest {{n}}',
        'Truhe {{n}} öffnen',
        'Abrir cofre {{n}}'
    ],
    'chest.quotaInfo': [
        'Уровень {{n}}: норма {{q}} 🍿 за {{s}} сек',
        'Level {{n}}: goal {{q}} 🍿 in {{s}} sec',
        'Level {{n}}: Ziel {{q}} 🍿 in {{s}} Sek',
        'Nivel {{n}}: meta {{q}} 🍿 en {{s}} seg'
    ],
    'chest.next': [
        'ДАЛЬШЕ: УРОВЕНЬ {{n}} ▶',
        'NEXT: LEVEL {{n}} ▶',
        'WEITER: LEVEL {{n}} ▶',
        'SIGUIENTE: NIVEL {{n}} ▶'
    ],
    'chest.shop': [
        '🛒 МАГАЗИН ЛАПОК',
        '🛒 PAW SHOP',
        '🛒 PFOTEN-LADEN',
        '🛒 TIENDA DE PATITAS'
    ],
    'chest.noperks': [
        'Перки отключены в настройках — уровень готов, беги дальше!',
        'Perks are disabled in settings — level is ready, keep running!',
        'Perks sind deaktiviert — das Level wartet, weiter geht',
        'Perks desactivados en ajustes: ¡el nivel espera, sigue!'
    ],
    'chest.bonusCoins': [
        'Сундучок подарил: +{{n}} 🪙 монеток!',
        'The chest gave: +{{n}} 🪙 coins!',
        'Die Truhe schenkte: +{{n}} 🪙 Münzen!',
        '¡El cofre regaló: +{{n}} 🪙 monedas!'
    ],
    'chest.bonusXp': [
        'Сундучок подарил: +{{n}} 🍿 опыта!',
        'The chest gave: +{{n}} 🍿 XP!',
        'Die Truhe schenkte: +{{n}} 🍿 XP!',
        '¡El cofre regaló: +{{n}} 🍿 de exp!'
    ],
    /* ── Бонус-мини-игра «Нарезка»: большой попкорн в конце уровня ── */ 'slicer.title': [
        'БОЛЬШОЙ ПОПКОРН! РЕЖЬ!',
        'GIANT POPCORN! SLICE IT!',
        'RIESEN-POPCORN! SCHNEID!',
        '¡PALOMITA GIGANTE! ¡CORTA!'
    ],
    'slicer.hint': [
        'Режь свайпами все 5 секунд: цель сжимается и уворачивается — комбо множит очки!',
        'Slice for 5 seconds: the target shrinks and drifts — combos multiply points!',
        'Schneide 5 Sekunden lang: das Ziel schrumpft und wandert — Combos vervielfachen Punkte!',
        '¡Corta 5 segundos: el objetivo se encoge y se mueve! Los combos multiplican puntos.'
    ],
    'slicer.kindCaramel': [
        'КАРАМЕЛЬНАЯ!',
        'CARAMEL!',
        'KARAMELL!',
        '¡CARAMELO!'
    ],
    'slicer.kindCherry': [
        'ВИШНЁВАЯ!',
        'CHERRY!',
        'KIRSCHE!',
        '¡CEREZA!'
    ],
    'slicer.kindGrape': [
        'ВИНОГРАДНАЯ! ×16',
        'GRAPE! ×16',
        'TRAUBE! ×16',
        '¡UVA! ×16'
    ],
    'slicer.combo': [
        'КОМБО ×{{n}}',
        'COMBO ×{{n}}',
        'COMBO ×{{n}}',
        'COMBO ×{{n}}'
    ],
    'slicer.crit': [
        'КРИТ!',
        'CRIT!',
        'KRIT!',
        '¡CRÍT!'
    ],
    'slicer.burst': [
        'ВЗРЫВ! +{{n}}',
        'BOOM! +{{n}}',
        'BUMM! +{{n}}',
        '¡BOOM! +{{n}}'
    ],
    'slicer.resultTitle': [
        'БОНУС НАРЕЗАН!',
        'SLICED!',
        'ZERSCHNITTEN!',
        '¡CORTADA!'
    ],
    'slicer.swipes': [
        'взмахов: {{n}}',
        'slices: {{n}}',
        'Schnitte: {{n}}',
        'cortes: {{n}}'
    ],
    'slicer.maxcombo': [
        'макс. комбо ×{{n}}',
        'best combo ×{{n}}',
        'bestes Combo ×{{n}}',
        'mejor combo ×{{n}}'
    ],
    'slicer.take': [
        'ЗАБРАТЬ 🎁',
        'TAKE IT 🎁',
        'HOLEN 🎁',
        '¡RECOGER 🎁!'
    ],
    'slicer.reward': [
        'Награда: +{{n}} 🪙',
        'Reward: +{{n}} 🪙',
        'Belohnung: +{{n}} 🪙',
        'Premio: +{{n}} 🪙'
    ],
    'slicer.aria': [
        'Бонус-мини-игра: режь большой попкорн свайпами',
        'Bonus mini-game: slice the giant popcorn with swipes',
        'Bonus-Minispiel: schneide das Riesen-Popcorn mit Wischgesten',
        'Minijuego de bono: corta la palomita gigante con deslizamientos'
    ],
    /* ---------- плакатная перебивка (каждые 5 уровней) ---------- */ 'poster.banner': [
        'ЭТАП {{n}} ПРОЙДЕН',
        'STAGE {{n}} CLEARED',
        'ABSCHNITT {{n}} GESCHAFFT',
        'ETAPA {{n}} SUPERADA'
    ],
    'poster.score': [
        'Очки: {{n}}',
        'Score: {{n}}',
        'Punkte: {{n}}',
        'Puntos: {{n}}'
    ],
    'poster.best': [
        'Рекорд: {{n}}',
        'Best: {{n}}',
        'Rekord: {{n}}',
        'Récord: {{n}}'
    ],
    'poster.btn': [
        'ПРОДОЛЖИТЬ БОРЬБУ',
        'KEEP FIGHTING!',
        'WEITER KÄMPFEN!',
        '¡SEGUIR LUCHANDO!'
    ],
    'poster.alt': [
        'Трудовой плакат: куница Нана призывает продолжать побеждать',
        'Labor poster: marten NANA urges you to keep winning',
        'Agitationsplakat: Marderin NANA fordert zum Weitersiegen auf',
        'Cartel laboral: la marta NANA anima a seguir ganando'
    ],
    'poster.1.title': [
        'ТАК ДЕРЖАТЬ!',
        'KEEP IT UP!',
        'SO MACHT ES WEITER!',
        '¡ASÍ SE HACE!'
    ],
    'poster.1.sub': [
        'продолжай в том же духе — победы будут за нами',
        'keep the streak going — victory will be ours',
        'weiter im selben Geist — der Sieg wird unser sein',
        'sigue en la misma línea: la victoria será nuestra'
    ],
    'poster.2.title': [
        'БЕЙ СВОЙ РЕКОРД!',
        'BEAT YOUR OWN RECORD!',
        'Schlag deinen Rekord!',
        '¡Supera tu récord!'
    ],
    'poster.2.sub': [
        'прошлые победы — только разминка',
        'past victories are just a warm-up',
        'frühere Siege sind nur Aufwärmen',
        'las victorias pasadas son solo calentamiento'
    ],
    'poster.3.title': [
        'ПЛАН ВЫПОЛНЕН!',
        'PLAN FULFILLED!',
        'PLAN ERFÜLLT!',
        '¡PLAN CUMPLIDO!'
    ],
    'poster.3.sub': [
        'норма перевыполнена — впереди новые рубежи',
        'goal exceeded — new heights ahead',
        'Norm übertroffen — neue Ziele voraus',
        'meta superada: nuevas alturas por delante'
    ],
    'poster.4.title': [
        'К НОВЫМ ВЫСОТАМ!',
        'TO NEW HEIGHTS!',
        'ZU NEUEN HÖHEN!',
        '¡A NUEVAS ALTURAS!'
    ],
    'poster.4.sub': [
        'каждый этап — шаг к вершине',
        'every stage is a step to the top',
        'jeder Abschnitt ein Schritt zum Gipfel',
        'cada etapa es un paso hacia la cima'
    ],
    'poster.5.title': [
        'РЕКОРД ПОБИТ!',
        'RECORD BROKEN!',
        'REKORD GEBROCHEN!',
        '¡RÉCORD ROTO!'
    ],
    'poster.5.sub': [
        'попкорн не ждёт — побеждай снова',
        'the popcorn won’t wait — win again',
        'das Popcorn wartet nicht — siege erneut',
        'las palomitas no esperan: gana otra vez'
    ],
    'poster.6.title': [
        'ДАЁШЬ РЕКОРД!',
        'GIVE US A RECORD!',
        'HER MIT DEM REKORD!',
        '¡DA TU RÉCORD!'
    ],
    'poster.6.sub': [
        'заслуженный перерыв — и снова в бой',
        'a well-earned break — then back to battle',
        'verdiente Pause — und zurück in die Schlacht',
        'descanso merecido y de vuelta a la lucha'
    ],
    'quit.button': [
        '⏹ КОНЕЦ ИГРЫ — победа (опыт сохранится)',
        '⏹ END GAME — win (XP is kept)',
        '⏹ SPIEL BEENDEN — Sieg (XP bleibt)',
        '⏹ FIN DEL JUEGO — victoria (la exp se guarda)'
    ],
    'quit.short': [
        '⏹ КОНЕЦ ИГРЫ',
        '⏹ END GAME',
        '⏹ SPIELENDE',
        '⏹ FIN DEL JUEGO'
    ],
    'quit.pauseMenu': [
        '⏹ КОНЕЦ ИГРЫ — ПОБЕДА',
        '⏹ END GAME — WIN',
        '⏹ ENDE — SIEG',
        '⏹ FIN — VICTORIA'
    ],
    /* ---------- пауза ---------- */ 'pause.title': [
        'ПАУЗА',
        'PAUSED',
        'PAUSE',
        'PAUSA'
    ],
    'pause.info': [
        'Уровень {{l}} · Счёт: {{s}} · Норма {{c}}/{{q}}',
        'Level {{l}} · Score: {{s}} · Goal {{c}}/{{q}}',
        'Level {{l}} · Punkte: {{s}} · Ziel {{c}}/{{q}}',
        'Nivel {{l}} · Puntos: {{s}} · Meta {{c}}/{{q}}'
    ],
    'pause.resume': [
        '▶ ПРОДОЛЖИТЬ',
        '▶ RESUME',
        '▶ WEITER',
        '▶ CONTINUAR'
    ],
    'hud.pause': [
        'Пауза',
        'Pause',
        'Pause',
        'Pausa'
    ],
    'hud.mute': [
        'Выключить звук',
        'Mute sound',
        'Ton aus',
        'Silenciar'
    ],
    'hud.unmute': [
        'Включить звук',
        'Unmute sound',
        'Ton an',
        'Activar sonido'
    ],
    /* ---------- HUD ---------- */ 'hud.streak': [
        'серия {{n}}',
        'streak {{n}}',
        'Serie {{n}}',
        'racha {{n}}'
    ],
    'hud.level': [
        'УР. {{n}}',
        'LV {{n}}',
        'LVL {{n}}',
        'NV {{n}}'
    ],
    'hud.fever': [
        '🔥 ЛИХОРАДКА +{{n}}',
        '🔥 FEVER +{{n}}',
        '🔥 FIEBER +{{n}}',
        '🔥 FIEBRE +{{n}}'
    ],
    'hud.freeze': [
        '❄ ФРИЗ {{n}} СЕК',
        '❄ FREEZE {{n}} SEC',
        '❄ STOPP {{n}} SEK',
        '❄ PAUSA {{n}} SEG'
    ],
    'hud.giftmult': [
        'ОЧКИ ×{{n}} · {{s}} СЕК',
        'SCORE ×{{n}} · {{s}} SEC',
        'PUNKTE ×{{n}} · {{s}} SEK',
        'PUNTOS ×{{n}} · {{s}} SEG'
    ],
    'gift.freeze': [
        '❄ ПОДАРОК: ФРИЗ {{n}} СЕК!',
        '❄ GIFT: FREEZE {{n}} SEC!',
        '❄ GESCHENK: STOPP {{n}} SEK!',
        '❄ REGALO: ¡PAUSA {{n}} SEG!'
    ],
    'gift.sweep': [
        '🧨 ПОДАРОК: МИНЫ ПОДОРВАНЫ!',
        '🧨 GIFT: MINES SWEPT!',
        '🧨 GESCHENK: MINEN GESPRENGT!',
        '🧨 REGALO: ¡MINAS EXPLOTADAS!'
    ],
    'gift.mult': [
        '🎁 ПОДАРОК: ОЧКИ ×{{n}}!',
        '🎁 GIFT: SCORE ×{{n}}!',
        '🎁 GESCHENK: PUNKTE ×{{n}}!',
        '🎁 REGALO: ¡PUNTOS ×{{n}}!'
    ],
    /* ---------- v0.0.43: ОНЛИФАНСИЙ — босс-лев пугает с краю поля ---------- */ 'cameo.caption': [
        'ОНЛИФАНСИЙ НАБЛЮДАЕТ…',
        'ONLYFANSIUS IS WATCHING…',
        'ONLYFANSIUS SIEHT ZU…',
        'ONLYFANSIUS TE OBSERVA…'
    ],
    /* ---------- интро босса: карточка «КАК ПОБЕДИТЬ?» (0.0.42) ---------- */ 'bossintro.title': [
        'КАК ПОБЕДИТЬ?',
        'HOW TO BEAT IT?',
        'SO SIEGT MAN!',
        '¿CÓMO GANAR?'
    ],
    'bossintro.tag': [
        'БОСС',
        'BOSS',
        'BOSS',
        'JEFE'
    ],
    'bossintro.lvl': [
        'УРОВЕНЬ {{n}}',
        'LEVEL {{n}}',
        'LEVEL {{n}}',
        'NIVEL {{n}}'
    ],
    'bossintro.go': [
        'В БОЙ!',
        'FIGHT!',
        'LOS!',
        '¡A LUCHAR!'
    ],
    'bossintro.kid': [
        'Малыш несётся к корзинке — не дай схватить себя: касание минус сердечко! Толкай попкорн РЕЗКИМ МАХОМ лапки — летящее зерно бьёт его как снежком. Сбей все сердечки: наестся и отвалит!',
        'The baby charges at your cup — don’t let him grab you: a touch costs a heart! Flick popcorn with a SHARP paw swing — flying kernels hit him like snowballs. Drain his hearts and he’ll eat up and roll away!',
        'Das Baby rast auf den Becher zu — lass dich nicht greifen: Berührung kostet ein Herz! Schleudere Popcorn mit kurzem Pfotenschwung — fliegende Körner treffen ihn wie Schneebälle. Alle Herzen weg — er ist satt und verschwindet!',
        '¡El bebé corre hacia la taza — no dejes que te agarre: un toque cuesta un corazón! Lanza palomitas con un golpe SECO de la patita — los granos voladores lo golpean como bolas de nieve. Quita todos sus corazones: ¡comerá y se irá!'
    ],
    'bossintro.marten': [
        'Куница Лана тянет к корзинке ДЛИННЫЕ ЛАПКИ с когтями! ПЕРЕРЕЗАЙ их быстрым свайпом лапки — каждый разрез отнимает у воровки жизнь. Дотянувшийся коготь выгребает попкорн из стаканчика!',
        'Marten NANA stretches LONG CLAWED PAWS toward your cup! SLICE them with a fast paw swipe — every cut costs the thief a life. A claw that lands scoops popcorn right out of the cup!',
        'Marderin LANA streckt Lange Krallenpfoten zum Becher! SCHNITT sie mit schnellem Pfotenschwung — jeder Schnitt kostet die Diebin ein Leben. Eine in Reichweite gekommene Kralle klaut Popcorn aus dem Becher!',
        '¡La marta LANA estira PATAS LARGAS con garras hacia tu taza! CORTALAS con un rápido barrido de la patita: cada corte quita una vida a la ladrona. ¡La garra que llega roba palomitas de la taza!'
    ],
    'bossintro.pigeon': [
        'Мега-голубь висит над корзиной и клюёт её! Тело неуязвимо — бей лапкой точно ПО ГЛАЗАМ: их два и они мелкие. Каждый точный удар отнимает у птицы жизнь!',
        'The mega pigeon hangs over your cup and PECKS it! The body is invulnerable — hit precisely AT THE EYES: there are two and they’re tiny. Every precise strike costs the bird a life!',
        'Die Mega-Taube hängt über dem Becher und PICKT ihn! Der Körper ist unverwundbar — triff genau DIE AUGEN: nur zwei und winzig. Jeder Präzisionstreffer kostet den Vogel ein Leben!',
        '¡La paloma mega cuelga sobre tu taza y la PICA! El cuerpo es invulnerable: golpea justo EN LOS OJOS: son dos y diminutos. ¡Cada golpe preciso quita una vida al pájaro!'
    ],
    'bossintro.gypsy': [
        'Цыганская рука крадёт зёрна с поля и швыряет их В ТЕБЯ — уводи лапку из круга-телеграфа, попадание минус сердечко! Бей по ладони АКТИВНЫМ махом лапки: зерно ей безразлично, а шлепки отнимают жизни.',
        'The gypsy hand steals kernels off the floor and flings them AT YOU — steer the paw out of the warning circle, a hit costs a heart! Slap the palm with an ACTIVE paw swing: kernels don’t hurt her, but your slaps do.',
        'Die Zigeunerhand klaut Körner vom Feld und wirft sie NACH DIR — führ die Pfote aus dem Warnkreis, ein Treffer kostet ein Herz! Klatsche mit AKTIVEM Pfotenschwung auf die Handfläche: Körner stören sie nicht, aber deine Schläge schon.',
        '¡La mano gitana roba granos del suelo y los lanza HACIA TI — saca la patita del círculo de aviso: un golpe cuesta un corazón! Dale palmadas a la palma con un barrido ACTIVO: los granos no la dañan, pero tus golpes sí.'
    ],
    'bossintro.lion': [
        'ОНЛИФАНСИЙ — ФИНАЛЬНЫЙ БОСС со всеми механиками! Рвётся к корзине и гребёт попкорн; РЁВ закрывает гриву-щит: зёрна отскакивают, лапку сносит волной. А ещё бьёт КОГТЯМИ СВЕРХУ — уводи лапку из круга-телеграфа! Пинай зёрна резким махом в морду: вне рёва каждый удар отнимает жизнь у зверя.',
        'ONLYFANSIUS — the FINAL BOSS with ALL the tricks! He charges the cup and scoops popcorn; his ROAR raises a mane-shield: kernels bounce off and the blast sweeps your paw away. And he strikes CLAWS FROM ABOVE — steer the paw out of the warning circle! Flick kernels into his muzzle with a sharp swing: outside the roar every hit costs the beast a life.',
        'ONLYFANSIUS — der ENDBOSS mit ALLEN Tricks! Er stürmt zum Becher und schaufelt Popcorn; sein BRÜLLEN hebt den Mähneschild: Körner prallen ab, die Welle schleudert die Pfote fort. Und er schlägt KRALLEN VON OBEN — führ die Pfote aus dem Warnkreis! Schleudere Körner mit kurem Schwung auf die Schnauze: außerhalb des Brüllens kostet jeder Treffer ein Leben.',
        'ONLYFANSIUS — el JEFE FINAL con TODAS las mañas! Embiste contra la taza y atrapa palomitas; su RUGIDO levanta la melena-escudo: los granos rebotan y la onda barre tu patita. Y golpea con GARRAS DESDE ARRIBA — saca la patita del círculo de aviso! Lanza granos al hocico con un golpe seco: fuera del rugido, cada golpe quita una vida a la bestia.'
    ],
    'hud.shields': [
        'Щиты от мин: {{n}}',
        'Mine shields: {{n}}',
        'Minenschilde: {{n}}',
        'Escudos antaminas: {{n}}'
    ],
    'hud.hearts': [
        'Сердечки: {{n}} из {{m}}',
        'Hearts: {{n}} of {{m}}',
        'Herzen: {{n}} von {{m}}',
        'Corazones: {{n}} de {{m}}'
    ],
    /* ---------- конец игры ---------- */ 'over.title': [
        'ЦЕЛЬ ПРОВАЛЕНА!',
        'GOAL FAILED!',
        'ZIEL VERPASST!',
        '¡META FALLIDA!'
    ],
    'over.timeup': [
        'Время вышло на {{n}} уровне',
        'Time ran out on level {{n}}',
        'Die Zeit lief in Level {{n}} ab',
        'Se acabó el tiempo en el nivel {{n}}'
    ],
    'over.hearts': [
        'Сердечки кончились!',
        'Out of hearts!',
        'Keine Herzen mehr!',
        '¡Sin corazones!'
    ],
    'over.ransacked': [
        'Голуби разграбили корзину!',
        'Pigeons ransacked the cup!',
        'Tauben haben den Becher geplündert!',
        '¡Las palomas saquearon el vaso!'
    ],
    /* Победный финал: игрок сам завершил забег через «КОНЕЦ ИГРЫ» */ 'over.victoryTitle': [
        'ПОБЕДА!',
        'YOU WIN!',
        'SIEG!',
        '¡VICTORIA!'
    ],
    'over.victoryNote': [
        'Забег завершён по твоей воле — план выполнен!',
        'You ended the run yourself — mission complete!',
        'Du hast den Lauf selbst beendet — Plan erfüllt!',
        '¡Terminaste la carrera tú mismo: plan cumplido!'
    ],
    'over.posterAlt': [
        'Пиксельный плакат: куница Нана отдаёт честь со стаканом попкорна на фоне знамени со звездой',
        'Pixel poster: marten Nana salutes with a popcorn bucket in front of a starred banner',
        'Pixel-Plakat: Marder Nana salutiert mit Popcorn-Becher vor einem Sternenbanner',
        'Póster pixelado: la marta Nana saluda con balde de palomitas ante una bandera estrellada'
    ],
    'over.points': [
        'очков · дошёл до уровня {{n}}',
        'points · reached level {{n}}',
        'Punkte · bis Level {{n}}',
        'puntos · llegaste al nivel {{n}}'
    ],
    'over.xp': [
        '🍿 +{{s}} опыта · всего: {{t}}',
        '🍿 +{{s}} XP · total: {{t}}',
        '🍿 +{{s}} XP · gesamt: {{t}}',
        '🍿 +{{s}} exp · total: {{t}}'
    ],
    /* v0.0.33: уровень котика на экране результатов — реальный опыт за забег */ 'over.lvlBadge': [
        '⬆ УРОВЕНЬ!',
        '⬆ LEVEL UP!',
        '⬆ LEVEL!',
        '⬆ ¡NIVEL!'
    ],
    'over.unlocked': [
        'Открыто: {{list}}',
        'Unlocked: {{list}}',
        'Freigeschaltet: {{list}}',
        'Desbloqueado: {{list}}'
    ],
    'over.lvlNext': [
        'до ур. {{n}}: {{left}} 🍿',
        'to lvl {{n}}: {{left}} 🍿',
        'bis Lvl {{n}}: {{left}} 🍿',
        'al nv {{n}}: {{left}} 🍿'
    ],
    'over.rank': [
        '🏆 Место {{n}} в списке лидеров!',
        '🏆 Rank {{n}} on the leaderboard!',
        '🏆 Platz {{n}} in der Bestenliste!',
        '🏆 ¡Puesto {{n}} en la tabla!'
    ],
    'over.nameLabel': [
        'Имя в мировой таблице:',
        'Name on the world board:',
        'Name in der Weltliste:',
        'Nombre en la tabla mundial:'
    ],
    'over.newRecord': [
        '🎉 НОВЫЙ РЕКОРД!',
        '🎉 NEW RECORD!',
        '🎉 NEUER REKORD!',
        '🎉 ¡NUEVO RÉCORD!'
    ],
    'over.retry': [
        'ЗАБЕГ ЗАНОВО',
        'NEW RUN',
        'NEUER LAUF',
        'NUEVA PARTIDA'
    ],
    'over.revive': [
        '❤️ ВТОРОЙ ШАНС · +15 СЕК',
        '❤️ SECOND CHANCE · +15 SEC',
        '❤️ ZWEITE CHANCE · +15 SEK',
        '❤️ SEGUNDA OPORTUNIDAD · +15 SEG'
    ],
    'over.share': [
        'ПОДЕЛИТЬСЯ РЕКОРДОМ',
        'SHARE RECORD',
        'REKORD TEILEN',
        'COMPARTIR RÉCORD'
    ],
    'share.text': [
        'Я набрал {{s}} очков (уровень {{l}}) в POPCORN PAWS! 🐱🍿',
        'I scored {{s}} points (level {{l}}) in POPCORN PAWS! 🐱🍿',
        'Ich habe {{s}} Punkte (Level {{l}}) in POPCORN PAWS geholt! 🐱🍿',
        '¡Conseguí {{s}} puntos (nivel {{l}}) en POPCORN PAWS! 🐱🍿'
    ],
    'share.cardLevel': [
        'уровень {{l}} · рекорд {{b}}',
        'level {{l}} · best {{b}}',
        'Level {{l}} · Rekord {{b}}',
        'nivel {{l}} · récord {{b}}'
    ],
    'share.copied': [
        'Текст скопирован!',
        'Text copied!',
        'Text kopiert!',
        '¡Texto copiado!'
    ],
    'share.sent': [
        'Отправлено!',
        'Sent!',
        'Gesendet!',
        '¡Enviado!'
    ],
    'share.fail': [
        'Не удалось — расскажите друзьям словами 🐾',
        'Failed — tell your friends the old way 🐾',
        'Fehlgeschlagen — erzähle es selbst 🐾',
        'No se pudo: cuéntaselo a tus amigos 🐾'
    ],
    /* ---------- лидеры ---------- */ 'lead.title': [
        'ЛИДЕРЫ',
        'RANKING',
        'BESTENLISTE',
        'RÉCORDS'
    ],
    'lead.stats': [
        '🚀 Запусков: {{n}} · 🎬 Забегов: {{r}} · 🐱 Котиков: {{p}}',
        '🚀 Launches: {{n}} · 🎬 Runs: {{r}} · 🐱 Cats: {{p}}',
        '🚀 Starts: {{n}} · 🎬 Läufe: {{r}} · 🐱 Katzen: {{p}}',
        '🚀 Inicios: {{n}} · 🎬 Partidas: {{r}} · 🐱 Gatos: {{p}}'
    ],
    'lead.world': [
        '🌐 МИР',
        '🌐 WORLD',
        '🌐 WELT',
        '🌐 MUNDO'
    ],
    'lead.local': [
        '📱 МОЙ ТЕЛЕФОН',
        '📱 MY PHONE',
        '📱 MEIN HANDY',
        '📱 MI MÓVIL'
    ],
    'lead.checking': [
        'Проверяем мировую таблицу…',
        'Checking the world board…',
        'Weltliste wird geprüft…',
        'Comprobando la tabla mundial…'
    ],
    'lead.offline': [
        'Мировая таблица недоступна — играем на этом устройстве',
        'World board unavailable — playing on this device',
        'Weltliste nicht erreichbar — es wird auf diesem Gerät gespielt',
        'Tabla mundial no disponible — jugando en este dispositivo'
    ],
    'lead.offlineHint': [
        'Бывает: нет сети или база просыпается. Нажми «Повторить» — мир подключится сам.',
        'Happens: no network or the database is waking up. Tap "Retry" — the world will connect.',
        'Kommt vor: kein Netz oder die Datenbank startet. Tippe „Nochmal“ — die Welt verbindet sich.',
        'Pasa: sin red o la base despierta. Toca «Reintentar»: el mundo se conectará.'
    ],
    'lead.retry': [
        'ПОВТОРИТЬ',
        'RETRY',
        'NOCHMAL',
        'REINTENTAR'
    ],
    'lead.myRank': [
        '🌍 Твоё место в мире: {{n}} · рекорд {{best}}',
        '🌍 Your world rank: {{n}} · best {{best}}',
        '🌍 Dein Weltrang: {{n}} · Bestwert {{best}}',
        '🌍 Tu lugar en el mundo: {{n}} · récord {{best}}'
    ],
    'lead.emptyLocal': [
        'Пока пусто — поставь первый рекорд! 🍿',
        'Empty so far — set the first record! 🍿',
        'Noch leer — setze den ersten Rekord! 🍿',
        'Vacío aún: ¡marca el primer récord! 🍿'
    ],
    'lead.emptyWorld': [
        'Мировая таблица ждёт первый рекорд — стань первым! 🌍',
        'The world board awaits its first record — be first! 🌍',
        'Die Weltliste wartet auf den ersten Rekord — sei dabei! 🌍',
        'La tabla mundial espera su primer récord: ¡sé el primero! 🌍'
    ],
    /* 0.0.47: топ — «один котик = одна строка», только максимальный рекорд */ 'lead.unique': [
        'Один котик — одна строка: только самый большой рекорд 🏆',
        'One cat, one row: only their best score counts 🏆',
        'Eine Katze, eine Zeile: nur der beste Lauf zählt 🏆',
        'Un gato, una fila: solo cuenta su mejor puntuación 🏆'
    ],
    'lead.lvl': [
        'ур. {{n}}',
        'lv {{n}}',
        'Lvl {{n}}',
        'nv {{n}}'
    ],
    'lead.you': [
        '← ты!',
        '← you!',
        '← du!',
        '← ¡tú!'
    ],
    'lead.reject': [
        '🌐 Мировой рекорд не принят сервером',
        '🌐 World record not accepted by server',
        '🌐 Weltrekord vom Server abgelehnt',
        '🌐 Récord mundial rechazado por el servidor'
    ],
    /* ---------- правила ---------- */ 'rules.title': [
        'ПРАВИЛА',
        'RULES',
        'REGELN',
        'REGLAS'
    ],
    'rules.ok': [
        'ПОНЯТНО!',
        'GOT IT!',
        'VERSTANDEN!',
        '¡ENTENDIDO!'
    ],
    'rules.note': [
        '🎵 Лучше со звуком: музыка ускоряется к финишу!',
        '🎵 Best with sound: the music speeds up near the finish!',
        '🎵 Am besten mit Ton: die Musik wird schneller!',
        '🎵 Mejor con sonido: ¡la música acelera al final!'
    ],
    'rules.ios': [
        '📱 На iPhone: «Поделиться» → «На экран „Домой“» — игра станет приложением.',
        '📱 iPhone: Share → Add to Home Screen to install the game.',
        '📱 iPhone: Teilen → Startbildschirm — Spiel wird installiert.',
        '📱 iPhone: Compartir → Pantalla de inicio y se instala.'
    ],
    /* 7 коротких пунктов — все цифры сверены с движком (engine.ts) */ 'rules.r1': [
        'Веди лапку пальцем (на ПК — мышкой): собирай зёрна и сдавай их в стаканчик. Набери норму за 60 секунд!',
        'Drag the paw with your finger (mouse on PC): grab kernels and deliver them to the cup. Reach the goal within 60 seconds!',
        'Führe die Pfote mit dem Finger (am PC mit der Maus): sammle Körner und liefere sie im Becher. Erreiche das Ziel in 60 Sekunden!',
        'Mueve la patita con el dedo (ratón en PC): recoge granos y entrégalos en el vaso. ¡Cumple la meta en 60 segundos!'
    ],
    'rules.r2': [
        'Цена зёрен: белое +10 · карамель +20 · масляное +30 · золотое +50',
        'Kernel values: white +10 · caramel +20 · butter +30 · golden +50',
        'Kornwerte: weiß +10 · Karamell +20 · Butter +30 · golden +50',
        'Valores: blanco +10 · caramelo +20 · mantequilla +30 · dorado +50'
    ],
    'rules.r3': [
        'Мины-звёзды: −50 очков, зёрна высыпаются и минус сердечко (в забеге их 5). Сдачи без мины копят комбо до ×5!',
        'Star mines: −50 points, kernels drop and you lose a heart (5 per run). Clean deliveries build a combo up to ×5!',
        'Sternenminen: −50 Punkte, Körner fallen raus und ein Herz weg (5 pro Lauf). Saubere Übergaben bauen Combo bis ×5!',
        'Minas estrella: −50 puntos, se caen los granos y pierdes un corazón (5 por partida). Entregas limpias hacen combo hasta ×5.'
    ],
    'rules.r4': [
        'Лапка растёт: несёт 3 зерна, после 5-го уровня — 4, после 10-го — 5',
        'The paw grows: carries 3 kernels, 4 after level 5, 5 after level 10',
        'Die Pfote wächst: trägt 3 Körner, 4 ab Level 5, 5 ab Level 10',
        'La patita crece: lleva 3 granos, 4 tras el nivel 5, 5 tras el 10'
    ],
    'rules.r5': [
        'С 3-го уровня прилетает голубь-воришка: стукни лапкой несколько раз — прогонишь и получишь +50',
        'From level 3 a thieving pigeon arrives: tap it a few times with the paw — shoo it away for +50',
        'Ab Level 3 klaut eine Taube: tippe mehrmals mit der Pfote — vertreibe sie für +50',
        'Desde el nivel 3 llega una paloma ladrona: tócala varias veces con la patita — ahúyentala y gana +50'
    ],
    'rules.r6': [
        'Между уровнями — бонус-нарезка и сундучок с перками (шанс 25% — Лихорадка!). Каждые 5 уровней — плакат Наны и новая волна сложности',
        'Between levels — bonus slicing and a chest with perks (25% chance — Fever!). Every 5 levels — a Nana poster and a new wave of difficulty',
        'Zwischen den Leveln — Bonus-Hacken und Truhe mit Perks (25% Chance — Fieber!). Alle 5 Level — ein Nana-Poster und neue Schwierigkeit',
        'Entre niveles — corte de bonificación y cofre con perks (25% — ¡Fiebre!). Cada 5 niveles — un póster de Nana y nueva dificultad'
    ],
    'rules.r7': [
        'Очки = опыт (10 очков = 1 🍿): копятся сразу и остаются после «Конца игры». Трать их в магазине, древе и на Нану. Рекорды — в мировой таблице',
        'Points = XP (10 points = 1 🍿): banked instantly and kept even after END GAME. Spend them in the shop, tree and on Nana. Best runs enter the world board',
        'Punkte = XP (10 Punkte = 1 🍿): sofort gutgeschrieben und bleiben auch nach ENDE. Ausgeben im Laden, im Baum und für Nana. Rekorde in der Weltliste',
        'Puntos = exp (10 puntos = 1 🍿): se guardan al instante y quedan tras el FIN. Gástalos en la tienda, el árbol y Nana. Récords en la tabla mundial'
    ],
    'rules.r8': [
        'Куница NANA рассыпала попкорн: чем она взрослее, тем больше норма и зёрен в волне — но и мин больше. Кликай по ней и растите вместе!',
        'NANA the marten scattered popcorn: the older she gets, the bigger the goal and the waves — and more mines. Tap her and grow together!',
        'NANA hat Popcorn verstreut: Je älter sie wird, desto größer sind Ziel und Wellen — und mehr Minen. Tipp sie an und wächst zusammen!',
        'NANA derramó palomitas: cuanto mayor es, mayor la meta y las oleadas — y más minas. ¡Tócala y crezcan juntos!'
    ],
    /* ---------- создатели ---------- */ 'creators.title': [
        'СОЗДАТЕЛИ',
        'CREATED BY',
        'AUTOREN',
        'CREADORES'
    ],
    'creators.text': [
        'Мы сделали игру с любовью к кошкам, попкорну, куницам и друг другу!',
        'We made this game with love for cats, popcorn, martens — and each other!',
        'Wir haben dieses Spiel mit Liebe zu Katzen, Popcorn, Mardern — und uns gemacht!',
        'Hicimos este juego con amor a los gatos, las palomitas, las martas y entre nosotros!'
    ],
    'creators.ok': [
        'ОТЛИЧНО!',
        'AWESOME!',
        'SUPER!',
        '¡GENIAL!'
    ],
    'creators.author': [
        'Автор и правообладатель',
        'Author & copyright holder',
        'Autor & Urheber',
        'Autor y propietario'
    ],
    'creators.muse': [
        'муза и соавтор',
        'muse & co-author',
        'Muse & Mitautorin',
        'musa y coautora'
    ],
    'creators.contact': [
        'Связаться с автором:',
        'Contact the author:',
        'Autor kontaktieren:',
        'Contacta al autor:'
    ],
    'creators.support': [
        '💛 ПОДДЕРЖАТЬ АВТОРА',
        '💛 SUPPORT THE AUTHOR',
        '💛 AUTOR UNTERSTÜTZEN',
        '💛 APOYA AL AUTOR'
    ],
    'creators.donateHint': [
        'Наведи камеру банковского приложения на QR — банк спросит, сколько перевести. Или тапни по номеру карты, чтобы скопировать.',
        'Point your banking app camera at the QR — the bank will ask how much to transfer. Or tap the card number to copy it.',
        'Richte die Kamera deiner Bank-App auf den QR — die Bank fragt nach dem Betrag. Oder tippe zum Kopieren auf die Kartennummer.',
        'Apunta la cámara de tu banco al QR: el banco preguntará cuánto transferir. O toca el número para copiarlo.'
    ],
    'creators.card': [
        'Карта МИР',
        'MIR card',
        'MIR-Karte',
        'Tarjeta MIR'
    ],
    'creators.copied': [
        '✅ Скопировано! Вставь в приложении банка',
        '✅ Copied! Paste it in your banking app',
        '✅ Kopiert! In der Bank-App einfügen',
        '✅ ¡Copiado! Pégalo en tu banco'
    ],
    'creators.donateThanks': [
        'Каждый перевод — новая комната для котиков 🐾',
        'Every donation means a new room for the cats 🐾',
        'Jede Spende bedeutet einen neuen Raum für die Katzen 🐾',
        'Cada donación significa una nueva sala para los gatos 🐾'
    ],
    /* ---------- куница в меню ---------- */ 'marten.aria': [
        'Живая куница NANA играет с попкорном в своей комнате',
        'Live marten NANA playing with popcorn in her room',
        'Die lebende Marderin NANA spielt mit Popcorn in ihrem Zimmer',
        'La marta viva NANA jugando con palomitas en su habitación'
    ],
    'marten.title': [
        'Куница NANA',
        'NANA the marten',
        'Marderin NANA',
        'Marta NANA'
    ],
    'marten.st0': [
        'Котёнок',
        'Kitten',
        'Marderbaby',
        'Cachorra'
    ],
    'marten.st1': [
        'Малышка',
        'Little one',
        'Kleinemaus',
        'Pequeña'
    ],
    'marten.st2': [
        'Юная',
        'Young',
        'Jungmard',
        'Joven'
    ],
    'marten.st3': [
        'Ловкая',
        'Agile',
        'Flink',
        'Ágil'
    ],
    'marten.st4': [
        'Пушистая',
        'Fluffy',
        'Flauschig',
        'Esponjosa'
    ],
    'marten.st5': [
        'Величественная',
        'Majestic',
        'Majestätisch',
        'Majestuosa'
    ],
    'marten.st6': [
        'Легенда попкорна',
        'Popcorn legend',
        'Popcorn-Legende',
        'Leyenda del pop'
    ],
    'marten.growHint': [
        'NANA растёт от пройденных уровней и времени в игре: каждые 4–5 уровней она подрастает, а её комната обставляется красивее — гирлянды, ковры, монеты, игрушки!',
        'NANA grows with cleared levels and play time: every 4–5 levels she gets bigger and her room gets fancier — garlands, rugs, coins, toys!',
        'NANA wächst mit geschafften Leveln und Spielzeit: alle 4–5 Level wird sie größer, ihr Zimmer schöner — Girlanden, Teppiche, Münzen, Spielzeug!',
        'NANA crece con los niveles superados y el tiempo de juego: cada 4–5 niveles crece y su habitación se adorna: guirnaldas, alfombras, monedas, juguetes!'
    ],
    'marten.levelUp': [
        '🐾 NANA подросла! Комната стала наряднее!',
        '🐾 NANA grew up! Her room got fancier!',
        '🐾 NANA ist gewachsen! Ihr Zimmer ist schöner!',
        '🐾 ¡NANA creció! ¡Su habitación es más bonita!'
    ],
    /* ---------- куница: уровень, алмазы, панель управления ---------- */ 'marten.lvlFull': [
        'Уровень NANA: {{n}}',
        'NANA level: {{n}}',
        'NANA-Level: {{n}}',
        'Nivel de NANA: {{n}}'
    ],
    'marten.lvlBadge': [
        'УР.',
        'LVL',
        'LST.',
        'NIV.'
    ],
    'marten.lvlBonusHint': [
        'путешествия +{{n}}%',
        'trips +{{n}}%',
        'Reisen +{{n}}%',
        'viajes +{{n}}%'
    ],
    'marten.messLine': [
        'разгром: ×{{q}} 🍿 · +{{m}} 🌽',
        'mess: ×{{q}} 🍿 · +{{m}} 🌽',
        'Chaos: ×{{q}} 🍿 · +{{m}} 🌽',
        'desorden: ×{{q}} 🍿 · +{{m}} 🌽'
    ],
    'marten.messHint': [
        'Разгром NANA: она рассыпала попкорн — чем она взрослее, тем больше норма и зёрен в волне (до ×2), но и мин больше (до +3). Растёт от кликера, путешествий и забегов!',
        'NANA’s mess: she scattered the popcorn — the older she gets, the bigger the goal and waves (up to ×2), but also more mines (up to +3). She grows from the clicker, trips and runs!',
        'NANAs Chaos: sie hat Popcorn verstreut — je älter sie wird, desto größer sind Ziel und Wellen (bis ×2), aber auch mehr Minen (bis +3). Sie wächst durch Klicker, Reisen und Läufe!',
        'Desorden de NANA: derramó palomitas — cuanto mayor es, mayor la meta y las oleadas (hasta ×2), pero también más minas (hasta +3). ¡Crece con el clicador, los viajes y las partidas!'
    ],
    'marten.xpHint': [
        'Опыт NANA: очки в забегах, путешествия и кликер — тапай по кунице в меню! Каждый уровень: награды путешествий +2% и монетка за клик чаще (+1🪙 за 10 уровней, до 3🪙); дальние маршруты открываются на 5/8/12 уровнях.',
        'NANA XP: run scores, travels and the clicker — tap NANA in the menu! Every level: trip rewards +2% and click coins grow (+1🪙 per 10 levels, up to 3🪙); far destinations unlock at levels 5/8/12.',
        'NANA-XP: Laufpunkte, Reisen und Klicker — tipp NANA im Menü an! Jedes Level: Reisebelohnungen +2% und mehr Klick-Münzen (+1🪙 pro 10 Stufen, bis 3🪙); ferne Ziele ab Stufe 5/8/12.',
        'XP de NANA: puntos de partidas, viajes y clicador: ¡toca a NANA en el menú! Cada nivel: premios de viaje +2% y más monedas por toque (+1🪙 cada 10 niveles, hasta 3🪙); destinos lejanos en niveles 5/8/12.'
    ],
    'marten.clickStats': [
        '🐾 {{n}} кликов · {{c}}🪙 за клик — тапай по комнате, чтобы NANA росла!',
        '🐾 {{n}} taps · {{c}}🪙 per tap — tap the room to help NANA grow!',
        '🐾 {{n}} Tipps · {{c}}🪙 pro Tipp — tipp in das Zimmer, damit NANA wächst!',
        '🐾 {{n}} toques · {{c}}🪙 por toque: ¡toca la habitación para que NANA crezca!'
    ],
    'marten.diamondsHint': [
        'Алмазы: NANA приносит их из путешествий. Трать в лавке и на рынке!',
        'Diamonds: NANA brings them from travels. Spend them in the shop and at the market!',
        'Diamanten: NANA bringt sie aus Reisen. Im Laden und auf dem Markt ausgeben!',
        'Diamantes: NANA los trae de sus viajes. ¡Gástalos en la tienda y el mercado!'
    ],
    'marten.travel': [
        'В ПУТЬ',
        'TRAVEL',
        'AUF REISE',
        'DE VIAJE'
    ],
    'marten.shop': [
        'ЛАВКА',
        'SHOP',
        'LADEN',
        'TIENDA'
    ],
    'marten.market': [
        'РЫНОК',
        'MARKET',
        'MARKT',
        'MERCADO'
    ],
    'marten.away': [
        'В ПОХОДЕ',
        'ON A TRIP',
        'UNTERWEGS',
        'DE EXCURSIÓN'
    ],
    'marten.claim': [
        'ЗАБРАТЬ!',
        'CLAIM!',
        'ABHOLEN!',
        '¡RECOGER!'
    ],
    'marten.xpToast': [
        '🐾 NANA выросла до уровня {{n}}! Путешествия +{{p}}%',
        '🐾 NANA reached level {{n}}! Trips +{{p}}%',
        '🐾 NANA ist jetzt Level {{n}}! Reisen +{{p}}%',
        '🐾 ¡NANA llegó al nivel {{n}}! ¡Viajes +{{p}}%'
    ],
    /* ---------- путешествия ---------- */ 'travel.title': [
        'ПУТЕШЕСТВИЕ NANA',
        'NANA’S JOURNEY',
        'NANAS REISE',
        'VIAJE DE NANA'
    ],
    'travel.subtitle': [
        'NANA сама сбегает за добычей — таймер идёт, даже когда игра закрыта. Каждый её уровень усиливает награды!',
        'NANA runs off to fetch loot on her own — the timer keeps going even when the game is closed. Every level of hers boosts the rewards!',
        'NANA holt selbständig Beute — der Timer läuft weiter, auch wenn das Spiel zu ist. Jedes ihrer Level verstärkt die Belohnungen!',
        'NANA va sola por el botín: el temporizador sigue incluso con el juego cerrado. ¡Cada nivel suyo mejora los premios!'
    ],
    'travel.send': [
        'ОТПРАВИТЬ!',
        'SEND!',
        'AUFBRECHEN!',
        '¡ENVIAR!'
    ],
    'travel.awayTitle': [
        'NANA гуляет…',
        'NANA is out…',
        'NANA ist unterwegs…',
        'NANA está fuera…'
    ],
    'travel.left': [
        'Вернётся через',
        'Back in',
        'Zurück in',
        'Vuelve en'
    ],
    'travel.ready': [
        'NANA вернулась с добычей!',
        'NANA is back with the loot!',
        'NANA ist mit Beute zurück!',
        '¡NANA volvió con el botín!'
    ],
    'travel.claim': [
        'ЗАБРАТЬ НАГРАДУ',
        'CLAIM REWARD',
        'BELOHNUNG HOLEN',
        'RECOGER PREMIO'
    ],
    'travel.reward': [
        'Награда',
        'Reward',
        'Belohnung',
        'Premio'
    ],
    'travel.t10.name': [
        'Соседская кухня',
        'Neighbor’s kitchen',
        'Nachbars Küche',
        'Cocina vecina'
    ],
    'travel.t30.name': [
        'Клумбы и лавки',
        'Flower beds and stalls',
        'Beete und Buden',
        'Macizos y puestos'
    ],
    'travel.t60.name': [
        'Дальний амбар',
        'The far barn',
        'Die ferne Scheune',
        'El granero lejano'
    ],
    'travel.t180.name': [
        'Ночной рынок',
        'The night market',
        'Der Nachmarkt',
        'El mercado nocturno'
    ],
    'travel.t360.name': [
        'Загородная ферма',
        'The country farm',
        'Der Landhof',
        'La granja del campo'
    ],
    'travel.t720.name': [
        'Полночный склад',
        'The midnight warehouse',
        'Das Mitternachtslager',
        'El almacén de medianoche'
    ],
    'travel.special': [
        'особый лут!',
        'special loot!',
        'Spezialbeute!',
        '¡botín especial!'
    ],
    'travel.lock': [
        'Откроется, когда NANA вырастет до уровня {{n}}',
        'Unlocks when NANA reaches level {{n}}',
        'Öffnet sich, wenn NANA Level {{n}} erreicht',
        'Se abre cuando NANA llega al nivel {{n}}'
    ],
    /* ---------- лавка куницы: ботинки, шляпки, сумочки ---------- */ 'mshop.title': [
        'ГАРДЕРОБ NANA',
        'NANA’S WARDROBE',
        'NANAS GARDEROBE',
        'ARMARIO DE NANA'
    ],
    'mshop.subtitle': [
        'Снаряжение путешественницы: ботинки, шляпки и сумочки усиливают награды.',
        'Traveler’s gear: boots, hats and bags boost the rewards.',
        'Reiseausrüstung: Stiefel, Hüte und Taschen verstärken die Belohnungen.',
        'Equipo de viajera: botas, sombreros y bolsos mejoran los premios.'
    ],
    'mshop.tabBoots': [
        'БОТИНКИ',
        'BOOTS',
        'STIEFEL',
        'BOTAS'
    ],
    'mshop.tabHats': [
        'ШЛЯПКИ',
        'HATS',
        'HÜTE',
        'SOMBREROS'
    ],
    'mshop.tabBags': [
        'СУМКИ',
        'BAGS',
        'TASCHEN',
        'BOLSOS'
    ],
    'mshop.equip': [
        'Надеть',
        'Equip',
        'Anziehen',
        'Poner'
    ],
    'mshop.on': [
        'Надето',
        'Worn',
        'Angezogen',
        'Puesto'
    ],
    'mshop.bare': [
        'Босиком',
        'Barepaw',
        'Barfuß',
        'Descalza'
    ],
    'mshop.need': [
        'Мало алмазов',
        'Not enough diamonds',
        'Zu wenig Diamanten',
        'Faltan diamantes'
    ],
    'boots.none.name': [
        'Мохнатые лапки',
        'Bare paws',
        'Zottepfoten',
        'Patitas peludas'
    ],
    'boots.none.desc': [
        'Как у всех приличных куниц. Стильно, бесплатно, без бонусов.',
        'Like every respectable marten. Stylish, free, no bonuses.',
        'Wie es sich für eine anständige Mardin gehört. Stylish, gratis, ohne Bonus.',
        'Como toda marta decente. Estiloso, gratis, sin bonus.'
    ],
    'boots.sapozhki.name': [
        'Сапожки',
        'Little boots',
        'Stiefelchen',
        'Botitas'
    ],
    'boots.sapozhki.desc': [
        'Первые шаги путешественницы: путь чуть короче, награда чуть щедрее.',
        'A traveler’s first steps: a slightly shorter trip, a slightly richer reward.',
        'Die ersten Schritte der Reisenden: Weg etwas kürzer, Belohnung etwas reicher.',
        'Primeros pasos de viajera: camino algo más corto, premio algo mayor.'
    ],
    'boots.krest.name': [
        'Крестьянские',
        'Peasant boots',
        'Bauernstiefel',
        'Botas campesinas'
    ],
    'boots.krest.desc': [
        'Прочные деревенские ботики: NANA топает бодро и возвращается с полными щёками.',
        'Sturdy village boots: NANA strides briskly and returns with full cheeks.',
        'Feste Dorf-Stiefel: NANA schreitet munter und kommt mit vollen Backen zurück.',
        'Botas rústicas: NANA camina enérgica y vuelve con las mejillas llenas.'
    ],
    'boots.valenki.name': [
        'Валенки-самоходы',
        'Self-walking felt boots',
        'Selbstlaufende Filzstiefel',
        'Botas de fieltro andarinas'
    ],
    'boots.valenki.desc': [
        'Пухлые валенки сами топают к алмазам! Поездки: алмазы и опыт +40%, путь −8%.',
        'Plush felt boots walk to gems by themselves! Trips: gems and XP +40%, trip −8%.',
        'Flauschige Filzstiefel laufen zu den Diamanten! Reisen: Diamanten und XP +40%, Weg −8%.',
        'Las botas de fieltro caminan solas hacia los diamantes: +40% de diamantes y XP, viaje −8%.'
    ],
    'boots.sluzh.name': [
        'Служанчатые',
        'Maid booties',
        'Dienstmädchen-Puschen',
        'Zapatillas de sirvienta'
    ],
    'boots.sluzh.desc': [
        'Лёгкие тапочки на шнурочках: заметно короче путь и заметно больше добычи.',
        'Light lace-up slippers: a notably shorter trip and notably more loot.',
        'Leichte Schnürpuschen: deutlich kürzerer Weg und deutlich mehr Beute.',
        'Zapatillas con cordones: camino notablemente más corto y más botín.'
    ],
    'boots.leopard.name': [
        'Леопардовые',
        'Leopard boots',
        'Leopardenstiefel',
        'Botas leopardo'
    ],
    'boots.leopard.desc': [
        'Пять звёзд куничьей моды! ×2 алмазы и опыт, путь −25%. Королева саванны!',
        'Five stars of marten fashion! ×2 diamonds and XP, trip −25%. Savanna queen!',
        'Fünf Sterne Mardenmode! ×2 Diamanten und XP, Weg −25%. Savannen-Königin!',
        '¡Cinco estrellas de moda marta! ×2 diamantes y XP, viaje −25%. ¡Reina de la sabana!'
    ],
    'boots.meteor.name': [
        'Метео-кроссы',
        'Meteor sneakers',
        'Meteor-Sneaker',
        'Zapatillas meteoro'
    ],
    'boots.meteor.desc': [
        'Космическая тяга! Поездки: алмазы и опыт ×2.4, путь −32%. Скорость — её второе имя!',
        'Cosmic thrust! Trips: gems and XP ×2.4, trip −32%. Speed is its second name!',
        'Kosmischer Schub! Reisen: Diamanten und XP ×2.4, Weg −32%. Schnelligkeit ist ihr Zweitname!',
        '¡Propulsión cósmica! Viajes: diamantes y XP ×2.4, viaje −32%. ¡La velocidad es su segundo nombre!'
    ],
    'boots.lunnie.name': [
        'Лунные боты',
        'Moon boots',
        'Mondstiefel',
        'Botas lunares'
    ],
    'boots.lunnie.desc': [
        'Гравитация больше не указ! Поездки: алмазы и опыт ×3, путь −40%. Куница гуляет по Луне!',
        'Gravity no longer rules! Trips: gems and XP ×3, trip −40%. NANA strolls on the Moon!',
        'Die Schwerkraft regiert nicht mehr! Reisen: Diamanten und XP ×3, Weg −40%. NANA spaziert auf dem Mond!',
        '¡La gravedad ya no manda! Viajes: diamantes y XP ×3, viaje −40%. ¡NANA pasea por la Luna!'
    ],
    /* ---------- шляпки ---------- */ 'hat.none.name': [
        'Головка мохнатая',
        'Bare head',
        'Zottekopf',
        'Cabeza peluda'
    ],
    'hat.none.desc': [
        'Причёска «натуральный пух». Бесплатно и по погоде.',
        'The “natural fluff” hairstyle. Free and weather-proof.',
        'Frisur „Naturflausch“. Gratis und wetterfest.',
        'Peinado «peluche natural». Gratis y a prueba de clima.'
    ],
    'hat.straw.name': [
        'Соломенная шляпка',
        'Straw hat',
        'Strohhut',
        'Sombrero de paja'
    ],
    'hat.straw.desc': [
        'Деревенский шик: клик по NANA даёт +1🐾, путешествия: опыт +25%, алмазы +5%.',
        'Village chic: tapping NANA gives +1🐾, trips: XP +25%, gems +5%.',
        'Dorfschick: Tippen auf NANA gibt +1🐾, Reisen: XP +25%, Diamanten +5%.',
        'Chic rural: tocar a NANA da +1🐾, viajes: XP +25%, diamantes +5%.'
    ],
    'hat.cap.name': [
        'Кепка-задира',
        'Sassy cap',
        'Freche Mütze',
        'Gorra pillo'
    ],
    'hat.cap.desc': [
        'Козырёк назад — вперёд к добыче! Клик +2🐾, поездки: опыт +50%, алмазы +10%, путь −3%.',
        'Cap backwards — forward to the loot! Tap +2🐾, trips: XP +50%, gems +10%, trip −3%.',
        'Mütze verkehrt — ab zur Beute! Tipp +2🐾, Reisen: XP +50%, Diamanten +10%, Weg −3%.',
        'Gorra al revés: ¡a por el botín! Toque +2🐾, viajes: XP +50%, diamantes +10%, viaje −3%.'
    ],
    'hat.beret.name': [
        'Берет-художница',
        'Artist beret',
        'Künstler-Baskenmütze',
        'Boina de artista'
    ],
    'hat.beret.desc': [
        'Шик парижских бульваров! Клик +3🐾, поездки: опыт +35%, алмазы +8%.',
        'Paris boulevard chic! Tap +3🐾, trips: XP +35%, gems +8%.',
        'Pariser Boulevardschick! Tipp +3🐾, Reisen: XP +35%, Diamanten +8%.',
        '¡Chic de los bulevares de París! Toque +3🐾, viajes: XP +35%, diamantes +8%.'
    ],
    'hat.wizard.name': [
        'Колпак волшебницы',
        'Wizard hat',
        'Zaubererhut',
        'Sombrero de maga'
    ],
    'hat.wizard.desc': [
        'Алмазы находят сами себя! Клик +6🐾, поездки: опыт +75%, алмазы +22%, путь −4%.',
        'Gems find themselves! Tap +6🐾, trips: XP +75%, gems +22%, trip −4%.',
        'Diamanten finden sich selbst! Tipp +6🐾, Reisen: XP +75%, Diamanten +22%, Weg −4%.',
        '¡Los diamantes se encuentran solos! Toque +6🐾, viajes: XP +75%, diamantes +22%, viaje −4%.'
    ],
    'hat.crown.name': [
        'Корона прЫнцессы',
        'Prrrincess crown',
        'Prinzessinenkrone',
        'Corona de princesa'
    ],
    'hat.crown.desc': [
        'Блестит ярче попкорна! Клик +4🐾, поездки: опыт ×2, алмазы +20%, путь −6%.',
        'Shines brighter than popcorn! Tap +4🐾, trips: XP ×2, gems +20%, trip −6%.',
        'Glänzt heller als Popcorn! Tipp +4🐾, Reisen: XP ×2, Diamanten +20%, Weg −6%.',
        '¡Brilla más que las palomitas! Toque +4🐾, viajes: XP ×2, diamantes +20%, viaje −6%.'
    ],
    'hat.star.name': [
        'Звёздная шляпа',
        'Star hat',
        'Sternenhut',
        'Sombrero estelar'
    ],
    'hat.star.desc': [
        'Сшита из звёздного неба! Клик +10🐾, поездки: опыт ×2.2, алмазы +40%, путь −8%.',
        'Sewn from the night sky! Tap +10🐾, trips: XP ×2.2, gems +40%, trip −8%.',
        'Aus dem Nachthimmel genäht! Tipp +10🐾, Reisen: XP ×2.2, Diamanten +40%, Weg −8%.',
        '¡Cosida con cielo estrellado! Toque +10🐾, viajes: XP ×2.2, diamantes +40%, viaje −8%.'
    ],
    'hat.superleo.name': [
        'Леопардовая супер-шляпа',
        'Leopard super-hat',
        'Leopard-Superhut',
        'Súper sombrero leopardo'
    ],
    'hat.superleo.desc': [
        'Самые вкусные бонусы джунглей! Клик +9🐾, поездки: опыт ×2.5, алмазы +35%, путь −10%.',
        'The tastiest bonuses of the jungle! Tap +9🐾, trips: XP ×2.5, gems +35%, trip −10%.',
        'Die leckersten Dschungel-Boni! Tipp +9🐾, Reisen: XP ×2.5, Diamanten +35%, Weg −10%.',
        '¡Los bonuses más sabrosos de la selva! Toque +9🐾, viajes: XP ×2.5, diamantes +35%, viaje −10%.'
    ],
    'hat.astronaut.name': [
        'Шлем звёздочёта',
        'Stargazer helmet',
        'Sternenfahrthelm',
        'Casco de astrónoma'
    ],
    'hat.astronaut.desc': [
        'Официальная экипировка Млечного Пути! Клик +15🐾, поездки: опыт ×3.2, алмазы +55%, путь −15%.',
        'Official Milky Way gear! Tap +15🐾, trips: XP ×3.2, gems +55%, trip −15%.',
        'Offizielle Ausrüstung der Milchstraße! Tipp +15🐾, Reisen: XP ×3.2, Diamanten +55%, Weg −15%.',
        '¡Equipo oficial de la Vía Láctea! Toque +15🐾, viajes: XP ×3.2, diamantes +55%, viaje −15%.'
    ],
    /* ---------- сумочки ---------- */ 'bag.none.name': [
        'Без сумочки',
        'No bag',
        'Ohne Tasche',
        'Sin bolso'
    ],
    'bag.none.desc': [
        'Лапки-то всё равно цепкие. Ничего не приносит.',
        'Paws are grippy anyway. Brings nothing.',
        'Pfoten greifen eh gut. Bringt nichts.',
        'Las patitas agarran igual. No trae nada.'
    ],
    'bag.packet.name': [
        'Пакетик',
        'Little tote',
        'Beutelchen',
        'Bolsita'
    ],
    'bag.packet.desc': [
        'Каждое путешествие приносит +4🪙 и +30🌾 сверху.',
        'Every trip brings +4🪙 and +30🌾 on top.',
        'Jede Reise bringt zusätzlich +4🪙 und +30🌾.',
        'Cada viaje trae +4🪙 y +30🌾 extra.'
    ],
    'bag.meshok.name': [
        'Мешочек удачи',
        'Luck pouch',
        'Glückssäckchen',
        'Bolsita de suerte'
    ],
    'bag.meshok.desc': [
        'Уютный мешочек с тайником: +7🪙 и +55🌾 к каждому путешествию.',
        'A cozy pouch with a stash: +7🪙 and +55🌾 per trip.',
        'Gemütliches Säckchen mit Versteck: +7🪙 und +55🌾 pro Reise.',
        'Bolsita acogedora con escondite: +7🪙 y +55🌾 por viaje.'
    ],
    'bag.tote.name': [
        'Кошёлка-тоут',
        'Roomy tote',
        'Riesentasche',
        'Bolso grande'
    ],
    'bag.tote.desc': [
        'Вместительная хозяйственная: +10🪙 и +80🌾 к каждому путешествию.',
        'Roomy and practical: +10🪙 and +80🌾 to every trip.',
        'Geräumig und praktisch: +10🪙 und +80🌾 zu jeder Reise.',
        'Amplio y práctico: +10🪙 y +80🌾 en cada viaje.'
    ],
    'bag.ryukzak.name': [
        'Рюкзак следопыта',
        'Pathfinder backpack',
        'Pfadfinder-Rucksack',
        'Mochila exploradora'
    ],
    'bag.ryukzak.desc': [
        'Всё своё ношу с собой! +20🪙 и +160🌾 к каждому путешествию.',
        'Carries everything needed! +20🪙 and +160🌾 per trip.',
        'Alles dabei! +20🪙 und +160🌾 pro Reise.',
        '¡Lleva todo lo necesario! +20🪙 y +160🌾 por viaje.'
    ],
    'bag.baguette.name': [
        'Сумка-багет',
        'Baguette bag',
        'Baguette-Tasche',
        'Bolso baguette'
    ],
    'bag.baguette.desc': [
        'Пахнет выпечкой (или это зерно?): +24🪙 и +180🌾 к каждому путешествию.',
        'Smells of fresh bread (or is it grain?): +24🪙 and +180🌾 per trip.',
        'Riecht nach Brot (oder nach Körnern?): +24🪙 und +180🌾 pro Reise.',
        'Huele a pan (¿o a granos?): +24🪙 y +180🌾 por viaje.'
    ],
    'bag.shkatulka.name': [
        'Шкатулка сокровищ',
        'Treasure box',
        'Schatzkästchen',
        'Cofre del tesoro'
    ],
    'bag.shkatulka.desc': [
        'Драгоценности стынут в бархате: +42🪙 и +330🌾, ещё и алмазы +6%.',
        'Jewels rest on velvet: +42🪙 and +330🌾, plus +6% diamonds.',
        'Juwehlen ruhen auf Samt: +42🪙 und +330🌾, plus +6% Diamanten.',
        'Joyas sobre terciopelo: +42🪙 y +330🌾, más +6% diamantes.'
    ],
    'bag.leobag.name': [
        'Леопардовая сумка',
        'Leopard bag',
        'Leoparden-Tasche',
        'Bolso leopardo'
    ],
    'bag.leobag.desc': [
        'Пик стиля! +55🪙 и +420🌾 к каждому путешествию, ещё и алмазы +5%.',
        'Peak of style! +55🪙 and +420🌾 per trip, plus +5% diamonds.',
        'Höhepunkt des Stils! +55🪙 und +420🌾 pro Reise, plus +5% Diamanten.',
        '¡La cima del estilo! +55🪙 y +420🌾 por viaje, más +5% diamantes.'
    ],
    'bag.kosmos.name': [
        'Космоящик',
        'Space case',
        'Weltraumkoffer',
        'Maleta espacial'
    ],
    'bag.kosmos.desc': [
        'Вмещает целую комету! +85🪙 и +660🌾 к каждому путешествию, алмазы +15%.',
        'Fits a whole comet! +85🪙 and +660🌾 per trip, gems +15%.',
        'Fasst einen ganzen Kometen! +85🪙 und +660🌾 pro Reise, Diamanten +15%.',
        '¡Cabe un cometa entero! +85🪙 y +660🌾 por viaje, diamantes +15%.'
    ],
    /* ---------- РЫНОК: обмен валют и артефакты ---------- */ 'market.title': [
        'РЫНОК',
        'THE MARKET',
        'DER MARKT',
        'EL MERCADO'
    ],
    'market.subtitle': [
        'Меняй алмазы, монетки, опыт и зёрна между собой. Вкладывай алмазы и в артефакты!',
        'Swap gems, coins, XP and grains. Invest diamonds in artifacts!',
        'Tausche Diamanten, Münzen, XP und Körner. Investiere Diamanten in Artefakte!',
        'Cambia diamantes, monedas, XP y granos. ¡Invierte diamantes en artefactos!'
    ],
    'market.tabSwap': [
        'ОБМЕН',
        'SWAP',
        'TAUSCH',
        'CAMBIO'
    ],
    'market.tabArtifacts': [
        'АРТЕФАКТЫ',
        'ARTIFACTS',
        'ARTEFAKTE',
        'ARTEFACTOS'
    ],
    'market.give': [
        'Отдаёшь',
        'You give',
        'Du gibst',
        'Entregas'
    ],
    'market.get': [
        'Получаешь',
        'You get',
        'Du bekommst',
        'Recibes'
    ],
    'market.max': [
        'ВСЁ',
        'MAX',
        'ALLES',
        'TODO'
    ],
    'market.swap': [
        'ОБМЕНЯТЬ',
        'SWAP',
        'TAUSCHEN',
        'CAMBIAR'
    ],
    'market.same': [
        'Выбери две разные валюты',
        'Pick two different currencies',
        'Wähle zwei verschiedene Währungen',
        'Elige dos monedas distintas'
    ],
    'market.fee': [
        'Рынок берёт {{n}}% комиссии — курс чёрный, но честный.',
        'The market takes a {{n}}% fee — street rate, but fair.',
        'Der Markt nimmt {{n}}% Gebühr — Schwarzmarktkurs, aber fair.',
        'El mercado cobra un {{n}}% de comisión: tasa libre, pero justa.'
    ],
    'market.owned': [
        'Куплено',
        'Owned',
        'Gekauft',
        'Comprado'
    ],
    'market.cur.gems': [
        '💎 Алмазы — приносит NANA из путешествий',
        '💎 Diamonds — brought by NANA from travels',
        '💎 Diamanten — bringt NANA aus Reisen mit',
        '💎 Diamantes — los trae NANA de sus viajes'
    ],
    'market.cur.coins': [
        '🪙 Монетки — этапы, Лихорадка, сундучки и кликер',
        '🪙 Coins — stages, Fever, chests and the clicker',
        '🪙 Münzen — Level, Fieber, Truhen und Klicker',
        '🪙 Monedas — niveles, fiebre, cofres y el clicador'
    ],
    'market.cur.xp': [
        '🍿 Опыт — очки попкорна, тратятся в магазине лапок',
        '🍿 XP — popcorn score, spent in the paw shop',
        '🍿 XP — Popcorn-Punkte, für den Pfoten-Shop',
        '🍿 XP — puntos de palomitas, para la tienda de patitas'
    ],
    'market.cur.grains': [
        '🌾 Зерновой сейф — копится из сданных зёрен',
        '🌾 Grain vault — grows from delivered kernels',
        '🌾 Kornspeicher — wächst mit gelieferten Körnern',
        '🌾 Bóveda de granos — crece con los granos entregados'
    ],
    /* ---------- артефакты рынка ---------- */ 'artifact.piggy.name': [
        'Копилка-хрюшка',
        'Piggy bank',
        'Sparschwein',
        'Hucha cerdito'
    ],
    'artifact.piggy.effect': [
        '🪙 из Лихорадки и сундучков +25%',
        '🪙 from Fever and chests +25%',
        '🪙 aus Fieber und Truhen +25%',
        '🪙 de fiebre y cofres +25%'
    ],
    'artifact.piggy.desc': [
        'Хрюшка бережёт каждую монетку: подарки из сундучков и Лихорадки становятся на четверть жирнее.',
        'The piggy guards every coin: chest and Fever gifts get a quarter fatter.',
        'Das Sparschwein hütet jede Münze: Truhen- und Fiebergeschenke werden ein Viertel fetter.',
        'El cerdito cuida cada moneda: los regalos de cofres y fiebre suben un cuarto.'
    ],
    'artifact.academy.name': [
        'Котоакадемия',
        'Cat Academy',
        'Katzenakademie',
        'Academia Gatuna'
    ],
    'artifact.academy.effect': [
        '🎖 опыт-стаж за этапы и сундучки +25%',
        '🎖 lifetime XP from stages and chests +25%',
        '🎖 Lebens-XP aus Leveln und Truhen +25%',
        '🎖 XP de vida por niveles y cofres +25%'
    ],
    'artifact.academy.desc': [
        'Диплом котика-отличника: награда за пройденные этапы и подарки опытом растёт на четверть.',
        'An honor-student diploma: stage rewards and XP gifts grow by a quarter.',
        'Diplom eines Musterkaters: Level-Belohnungen und XP-Geschenke wachsen um ein Viertel.',
        'Diploma de gato ejemplar: las recompensas de nivel y los regalos de XP crecen un cuarto.'
    ],
    'artifact.sieve.name': [
        'Золотое ситечко',
        'Golden sieve',
        'Goldenes Sieb',
        'Tamiz dorado'
    ],
    'artifact.sieve.effect': [
        '🌾 зерновой сейф наполняется на +25% быстрее',
        '🌾 grain vault fills 25% faster',
        '🌾 Kornspeicher füllt sich 25% schneller',
        '🌾 bóveda de granos se llena 25% más rápido'
    ],
    'artifact.sieve.desc': [
        'Просеивает зерно без потерь: каждое сданное зерно капает в сейф с четвертью сверху.',
        'Sifts the grain without loss: every delivered kernel drips into the vault plus a quarter.',
        'Siebt das Korn verlustfrei: jedes gelieferte Korn tropft plus ein Viertel in den Speicher.',
        'Tamiza el grano sin pérdidas: cada grano entregado cae en la bóveda más un cuarto.'
    ],
    'artifact.travelmap.name': [
        'Карта странствий',
        'Wanderer’s map',
        'Wanderkarte',
        'Mapa viajero'
    ],
    'artifact.travelmap.effect': [
        '✈ награды путешествий: 💎 и 🐾 +15%',
        '✈ trip rewards: 💎 and 🐾 +15%',
        '✈ Reisebelohnungen: 💎 und 🐾 +15%',
        '✈ premios de viaje: 💎 y 🐾 +15%'
    ],
    'artifact.travelmap.desc': [
        'Помечены все тайные тропы: NANA возвращается с алмазами и опытом на пятнадцать процентов богаче.',
        'All secret trails marked: NANA returns fifteen percent richer in gems and XP.',
        'Alle Geheimpfade markiert: NANA kommt fünfzehn Prozent reicher an Diamanten und XP zurück.',
        'Todos los senderos secretos marcados: NANA vuelve un quince por ciento más rica.'
    ],
    'artifact.bell.name': [
        'Кликер-колокольчик',
        'Clicker bell',
        'Klicker-Glöckchen',
        'Cencerro clicador'
    ],
    'artifact.bell.effect': [
        '👆 каждый клик по NANA — монетки ×1.5',
        '👆 every tap on NANA gives ×1.5 coins',
        '👆 jeder Tipp auf NANA gibt ×1,5 Münzen',
        '👆 cada toque en NANA da monedas ×1.5'
    ],
    'artifact.bell.desc': [
        'Дзынь-дзынь! Куница растроганно урчит, и каждый тап по комнате приносит полторы монетки (округление вверх).',
        'Ding-ding! The marten purrs with emotion and every tap brings one and a half coins (rounded up).',
        'Kling-kling! Die Mardin schnurrt gerührt, jeder Tipp bringt anderthalb Münzen (aufgerundet).',
        '¡Tin-tin! La marta ronronea conmovida y cada toque trae moneda y media (redondeo arriba).'
    ],
    'artifact.rattle.name': [
        'Погремушка',
        'Rattle toy',
        'Rassel',
        'Sonajero'
    ],
    'artifact.rattle.effect': [
        '👆 +2🪙 к каждому клику по NANA',
        '👆 +2🪙 added to every NANA tap',
        '👆 +2🪙 zu jedem NANA-Tipp',
        '👆 +2🪙 a cada toque en NANA'
    ],
    'artifact.rattle.desc': [
        'Дзык-дзык! Любимая игрушка куницы: пока она трясёт погремушку, каждый тап приносит две лишние монетки.',
        'Shake-shake! NANA’s favorite toy: while she rattles it, every tap brings two extra coins.',
        'Rassel-rassel! NANAS Lieblingsspielzeug: während sie schüttelt, bringt jeder Tipp zwei Extra-Münzen.',
        '¡Son-Son! El juguete favorito de NANA: mientras lo sacude, cada toque trae dos monedas extra.'
    ],
    /* ---------- настройки ---------- */ 'set.title': [
        'НАСТРОЙКИ',
        'SETTINGS',
        'EINSTELLUNGEN',
        'AJUSTES'
    ],
    /* ---------- статистика в настройках ---------- */ 'set.stats': [
        'СТАТИСТИКА',
        'STATS',
        'STATISTIK',
        'ESTADÍSTICAS'
    ],
    'set.stats.here': [
        'На этом устройстве',
        'This device',
        'Dieses Gerät',
        'Este dispositivo'
    ],
    'set.stats.world': [
        'Весь мир',
        'Whole world',
        'Ganze Welt',
        'Todo el mundo'
    ],
    'set.stats.time': [
        'Время в игре',
        'Time in game',
        'Spielzeit',
        'Tiempo de juego'
    ],
    'set.stats.record': [
        'Рекорд',
        'Best score',
        'Rekord',
        'Récord'
    ],
    'set.stats.runs': [
        'Забегов',
        'Runs',
        'Läufe',
        'Partidas'
    ],
    'set.stats.launches': [
        'Запусков',
        'Launches',
        'Starts',
        'Inicios'
    ],
    'set.stats.users': [
        'Пользователей',
        'Players',
        'Spieler',
        'Jugadores'
    ],
    'set.stats.players': [
        'Играли',
        'Played runs',
        'Gespielt',
        'Jugaron'
    ],
    'set.stats.offline': [
        'Мир не отвечает — только локальные данные',
        'World offline — local data only',
        'Welt offline — nur lokale Daten',
        'Mundo sin conexión: solo datos locales'
    ],
    /* ---------- Ф0-4: код-бэкап сохранения ---------- */ 'set.save': [
        'Сохранение',
        'Save slot',
        'Spielstand',
        'Guardado'
    ],
    'set.save.hint': [
        'Код хранит весь прогресс: монетки, лапки, ачивки, NANA. Экспортируй и храни в заметках — вставишь на любом устройстве и продолжишь с того же места.',
        'The code holds all progress: coins, paws, medals, NANA. Export it, keep it in your notes — paste on any device to continue right where you left.',
        'Der Code enthält den ganzen Fortschritt: Münzen, Pfoten, Medaillen, NANA. Exportieren, in Notizen aufbewahren — auf jedem Gerät einfügen und weitermachen.',
        'El código guarda todo el progreso: monedas, patitas, logros, NANA. Expórtalo, guárdalo en tus notas: pégalo en cualquier dispositivo y continúa.'
    ],
    'set.save.export': [
        'ЭКСПОРТ КОДА',
        'EXPORT CODE',
        'CODE EXPORTIEREN',
        'EXPORTAR CÓDIGO'
    ],
    'set.save.import': [
        'ВОССТАНОВИТЬ',
        'RESTORE',
        'WIEDERHERSTELLEN',
        'RESTAURAR'
    ],
    'set.save.copy': [
        'Скопировать заново',
        'Copy again',
        'Erneut kopieren',
        'Copiar de nuevo'
    ],
    'set.save.codeAria': [
        'Код сохранения',
        'Save code',
        'Spielstand-Code',
        'Código de guardado'
    ],
    'set.save.placeholder': [
        'Вставь сюда код сохранения и нажми «Восстановить»',
        'Paste a save code here, then tap Restore',
        'Spielstand-Code hier einfügen, dann „Wiederherstellen“',
        'Pega aquí el código y pulsa «Restaurar»'
    ],
    'set.save.exported': [
        'Код скопирован! Храни его в заметках',
        'Code copied! Keep it in your notes',
        'Code kopiert! Bewahre ihn in Notizen auf',
        '¡Código copiado! Guárdalo en tus notas'
    ],
    'set.save.imported': [
        'Сохранение восстановлено! Обновляю…',
        'Save restored! Reloading…',
        'Spielstand wiederhergestellt! Lade neu…',
        '¡Guardado restaurado! Actualizando…'
    ],
    'set.save.badcode': [
        'Код не похож на сохранение — вставь его целиком',
        'That does not look like a save code — paste the whole thing',
        'Das sieht nicht nach einem Spielstand aus — füge ihn komplett ein',
        'Eso no parece un código de guardado: pégalo completo'
    ],
    'stats.h': [
        'ч',
        'h',
        'Std',
        'h'
    ],
    'stats.m': [
        'м',
        'm',
        'Min',
        'min'
    ],
    'stats.lt1m': [
        '< 1 мин',
        '< 1 min',
        '< 1 Min',
        '< 1 min'
    ],
    'set.nick': [
        'Ник персонажа',
        'Cat nickname',
        'Katzen-Name',
        'Apodo del gato'
    ],
    'set.nick.edit': [
        'Сменить',
        'Change',
        'Ändern',
        'Cambiar'
    ],
    'set.lang': [
        'Язык',
        'Language',
        'Sprache',
        'Idioma'
    ],
    'set.diff': [
        'Сложность',
        'Difficulty',
        'Schwierigkeit',
        'Dificultad'
    ],
    'set.diff.easy': [
        'Лёгкая',
        'Easy',
        'Leicht',
        'Fácil'
    ],
    'set.diff.normal': [
        'Нормальная',
        'Normal',
        'Normal',
        'Normal'
    ],
    'set.diff.hard': [
        'Сложная',
        'Hard',
        'Schwer',
        'Difícil'
    ],
    'set.diffHint': [
        'лёгкая: −1 мина в волне · норма ×0.8 · +10 сек к таймеру · сложная: +1 мина · норма ×1.2 · −10 сек',
        'easy: −1 mine per wave · goal ×0.8 · +10 sec · hard: +1 mine · goal ×1.2 · −10 sec',
        'Leicht: −1 Mine pro Welle · Ziel ×0.8 · +10 Sek. · Schwer: +1 Mine · Ziel ×1.2 · −10 Sek.',
        'fácil: −1 mina por oleada · meta ×0.8 · +10 seg · difícil: +1 mina · meta ×1.2 · −10 seg'
    ],
    'set.quality': [
        'Качество',
        'Quality',
        'Qualität',
        'Calidad'
    ],
    'set.quality.low': [
        'Низкое',
        'Low',
        'Niedrig',
        'Baja'
    ],
    'set.quality.medium': [
        'Среднее',
        'Medium',
        'Mittel',
        'Media'
    ],
    'set.quality.high': [
        'Высокое',
        'High',
        'Hoch',
        'Alta'
    ],
    'set.qualityHint': [
        'частицы, эффекты и чёткость картинки',
        'particles, effects and picture sharpness',
        'Partikel, Effekte und Bildschärfe',
        'partículas, efectos y nitidez'
    ],
    'set.orient': [
        'Ориентация',
        'Orientation',
        'Orientierung',
        'Orientación'
    ],
    'set.orient.portrait': [
        'Портрет',
        'Portrait',
        'Hochformat',
        'Vertical'
    ],
    'set.orient.landscape': [
        'Ландшафт',
        'Landscape',
        'Querformat',
        'Horizontal'
    ],
    'set.orient.auto': [
        'Авто',
        'Auto',
        'Auto',
        'Auto'
    ],
    'set.perksCurse': [
        'Перки-испытания (проклятья)',
        'Challenge perks (curses)',
        'Herausforderungs-Perks (Flüche)',
        'Perks de desafío (maldiciones)'
    ],
    'set.perksBonus': [
        'Бонусные перки',
        'Bonus perks',
        'Bonus-Perks',
        'Perks de bonus'
    ],
    'set.pigeon': [
        'Голубь-воришка',
        'Thieving pigeon',
        'Klauernde Taube',
        'Paloma ladrona'
    ],
    'set.shake': [
        'Тряска экрана',
        'Screen shake',
        'Bildschirmwackeln',
        'Sacudida de pantalla'
    ],
    'set.sound': [
        '🔊 Звук',
        '🔊 Sound',
        '🔊 Ton',
        '🔊 Sonido'
    ],
    'set.music': [
        'Музыка',
        'Music',
        'Musik',
        'Música'
    ],
    'set.sfx': [
        'Звуки и эффекты',
        'Sound effects',
        'Soundeffekte',
        'Efectos de sonido'
    ],
    'set.soundHint': [
        'двигайте ползунки — звук меняется сразу · кнопка 🔈 в шапке выключает всё',
        'move the sliders — sound changes instantly · the 🔈 button in the top bar mutes everything',
        'Schieberegler wirken sofort · die 🔈-Taste oben schaltet alles stumm',
        'mueve los deslizadores — el sonido cambia al instante · el botón 🔈 arriba silencia todo'
    ],
    'set.vibro': [
        'Вибрация',
        'Vibration',
        'Vibration',
        'Vibración'
    ],
    'set.colorblind': [
        'Режим для дальтоников',
        'Colorblind mode',
        'Farbenblind-Modus',
        'Modo daltónico'
    ],
    'set.colorblindHint': [
        'мины становятся сине-оранжевыми с белой меткой',
        'mines become blue-orange with a white marker',
        'Minen werden blau-orange mit weißer Markierung',
        'las minas pasan a azul-naranja con marca blanca'
    ],
    'set.bright': [
        'Яркость',
        'Brightness',
        'Helligkeit',
        'Brillo'
    ],
    'set.contrast': [
        'Контрастность',
        'Contrast',
        'Kontrast',
        'Contraste'
    ],
    'set.reset': [
        'СБРОСИТЬ ВСЁ',
        'RESET ALL',
        'ALLES ZURÜCKSETZEN',
        'RESTABLECER TODO'
    ],
    'set.close': [
        'ГОТОВО',
        'DONE',
        'FERTIG',
        'LISTO'
    ],
    /* ---------- комнаты ---------- */ 'room.cinema.name': [
        'Кинозал',
        'Cinema Hall',
        'Kinosaal',
        'Sala de Cine'
    ],
    'room.kitchen.name': [
        'Кухня пиццерии',
        'Pizzeria Kitchen',
        'Pizzeria-Küche',
        'Cocina de Pizzería'
    ],
    'room.yard.name': [
        'Ночной двор',
        'Night Yard',
        'Nachthof',
        'Patio Nocturno'
    ],
    'room.arcade.name': [
        'Аркадный зал',
        'Arcade Hall',
        'Arcade-Halle',
        'Sala Arcade'
    ],
    'room.roof.name': [
        'Крыша на закате',
        'Sunset Roof',
        'Dach im Abendrot',
        'Azotea al Atardecer'
    ],
    'room.park.name': [
        'Дневной парк',
        'Day Park',
        'Tagespark',
        'Parque de Día'
    ],
    'room.attic.name': [
        'Чердак',
        'Attic',
        'Dachboden',
        'Ático'
    ],
    'room.basement.name': [
        'Кладовка',
        'Pantry',
        'Vorratskammer',
        'Despensa'
    ],
    /* ---------- тексты движка ---------- */ 'banner.level': [
        'УРОВЕНЬ {{n}}',
        'LEVEL {{n}}',
        'LEVEL {{n}}',
        'NIVEL {{n}}'
    ],
    'banner.clear': [
        'ПРОЙДЕН!',
        'CLEARED!',
        'GESCHAFFT!',
        '¡SUPERADO!'
    ],
    'banner.wave': [
        'ВОЛНА {{n}}',
        'WAVE {{n}}',
        'WELLE {{n}}',
        'OLEADA {{n}}'
    ],
    'banner.fever': [
        '🔥 ЛИХОРАДКА! 🔥',
        '🔥 FEVER! 🔥',
        '🔥 FIEBER! 🔥',
        '🔥 ¡FIEBRE! 🔥'
    ],
    'banner.revive': [
        'ВТОРОЙ ШАНС!',
        'SECOND CHANCE!',
        'ZWEITE CHANCE!',
        '¡SEGUNDA OPORTUNIDAD!'
    ],
    'txt.combo': [
        'КОМБО ×{{n}}',
        'COMBO ×{{n}}',
        'COMBO ×{{n}}',
        'COMBO ×{{n}}'
    ],
    'txt.pigeon': [
        'ЖУХ-ЖУХ! ГОЛУБЬ!',
        'COO-COO! PIGEON!',
        'GRU-GRU! TAUBE!',
        '¡BU-BU! ¡PALOMA!'
    ],
    'txt.hit': [
        'ФУДЫК!',
        'BONK!',
        'KNUTSCH!',
        '¡PUM!'
    ],
    'txt.downed': [
        'ВЗБИТ! +{{n}}',
        'DOWNED! +{{n}}',
        'PLATT! +{{n}}',
        '¡ABATIDA! +{{n}}'
    ],
    'txt.shock': [
        'ШОК! -{{n}}',
        'SHOCK! -{{n}}',
        'SCHOCK! -{{n}}',
        '¡ATURDIDA! -{{n}}'
    ],
    'txt.stole': [
        'УКРАЛ!',
        'STOLEN!',
        'GEKLAUT!',
        '¡ROBADO!'
    ],
    'txt.heart': [
        '-1 ❤️',
        '-1 ❤️',
        '-1 ❤️',
        '-1 ❤️'
    ],
    'txt.empty': [
        'ПУСТО!',
        'EMPTY!',
        'LEER!',
        '¡VACÍO!'
    ],
    'txt.guard': [
        'ОБЕРЕГ!',
        'SAVED!',
        'GERETTET!',
        '¡SALVADO!'
    ],
    'txt.shield': [
        'ЩИТ!',
        'SHIELD!',
        'SCHILD!',
        '¡ESCUDO!'
    ],
    /* ---------- БОСС «МАЛЫШ» (каждый 10-й уровень) ---------- */ 'banner.boss': [
        '👶 МАЛЫШ ИДЁТ!',
        '👶 THE KID ATTACKS!',
        '👶 DER KNIRPS!',
        '¡👶 EL PEQUEÑO!'
    ],
    'txt.bossWarn': [
        'НЕ ТРОГАЙ РУКАМИ — ПИНЬ ПОПКОРН!',
        'DON’T TOUCH — KICK POPCORN!',
        'NICHT ANFASSEN — POPCORN TRETTEN!',
        'NO LO TOQUES: ¡PATEA PALOMITAS!'
    ],
    'txt.bossHit': [
        'ФЫРК! ПОПАЛ!',
        'HIT!',
        'GETROFFEN!',
        '¡GOLPE!'
    ],
    'txt.bossDown': [
        'МАЛЫШ ПОВЕРЖЕН! +{{n}}',
        'KID DEFEATED! +{{n}}',
        'KNIRPS BESIEGT! +{{n}}',
        '¡PEQUEÑO DERROTADO! +{{n}}'
    ],
    'hud.boss': [
        'МАЛЫШ',
        'KID',
        'KNIRPS',
        'PEQUE'
    ],
    /* ---------- v0.0.33: ЛЬВ и КУНИЦА ЛАНА — боссы чередуются каждые 10 уровней ---------- */ 'banner.bossLion': [
        '🦁 ОНЛИФАНСИЙ ИДЁТ!',
        '🦁 ONLYFANSIUS ATTACKS!',
        '🦁 ONLYFANSIUS KOMMT!',
        '¡🦁 ONLYFANSIUS ATACA!'
    ],
    'banner.bossMarten': [
        '🦡 КУНИЦА ЛАНА!',
        '🦡 LANA THE MARTEN!',
        '🦡 MARDER LANA!',
        '🦡 LA MARTA LANA!'
    ],
    'txt.bossWarnLion': [
        'В РЁВЕ ГРИВА-ЩИТ: ЗЁРНА ОТСКОЧАТ — БЕЙ ПОСЛЕ!',
        'IN THE ROAR HIS MANE DEFLECTS — STRIKE AFTER IT!',
        'IM BRÜLLEN WEHRT DIE MÄHNE AB — TRIFF DANACH!',
        'EN EL RUGIDO LA MELÉNA REBOTA: ¡GOLPEA DESPUÉS!'
    ],
    /* v0.0.46: когтистые удары Онлифансия — телеграф и шлепок сверху */ 'txt.lionClaws': [
        '🦁 КОГТИ СВЕРХУ!',
        '🦁 CLAWS FROM ABOVE!',
        '🦁 KRALLEN VON OBEN!',
        '¡🦁 GARRAS DESDE ARRIBA!'
    ],
    'txt.lionSlamHit': [
        'ЦАРАП! КОГТИ ЦАРЯ!',
        'SCRATCHED! ROYAL CLAWS!',
        'KRATZ! KRALLEN DES KÖNIGS!',
        '¡GARRAÑAZO REAL!'
    ],
    'txt.bossWarnMarten': [
        'ЛАНА ТЯНЕТ ЛАПКИ К КОРЗИНКЕ — РЕЖЬ ИХ СВАЙПОМ!',
        'LANA STRETCHES HER PAWS — SLICE THEM!',
        'LANA STRECKT PFOTEN — SCHNEIDE SIE AB!',
        '¡LANA ESTIRA LAS PATAS: CÓRTALAS!'
    ],
    /* v0.0.38: МЕГА-ГОЛУБЬ — третий босс (каждый 15-й уровень): клюёт корзину,
     тело неуязвимо — бить лапкой точно по мелким глазам */ 'banner.bossPigeon': [
        '🐦 МЕГА-ГОЛУБЬ!',
        '🐦 MEGA-PIGEON!',
        '🐦 MEGA-TAUBE!',
        '¡🐦 PALOMA MEGA!'
    ],
    'txt.bossWarnPigeon': [
        'ОН ОГРОМНЫЙ И КЛЮЁТ КОРЗИНУ! БЕЙ ЛАПКОЙ ПО ГЛАЗАМ!',
        'HUGE, AND HE PECKS THE CUP! HIT THE EYES WITH YOUR PAW!',
        'RIESIG UND PICKT DEN BECHER! TRIFF MIT DER PFOTE DIE AUGEN!',
        '¡ENORME Y PICOTEA EL VASO! ¡GOLPEA LOS OJOS CON LA PATA!'
    ],
    'txt.pigeonEyes': [
        'БЕЙ ПО ГЛАЗАМ!',
        'AIM FOR THE EYES!',
        'TRIFF DIE AUGEN!',
        '¡APUNTA A LOS OJOS!'
    ],
    'txt.bossDownPigeon': [
        'ГОЛУБЬ ПОВЕРЖЕН! +{{n}}',
        'PIGEON DEFEATED! +{{n}}',
        'TAUBE BESIEGT! +{{n}}',
        '¡PALOMA DERROTADA! +{{n}}'
    ],
    /* v0.0.39: ЦЫГАНСКАЯ РУКА — четвёртый босс (каждый 20-й уровень): сгребает
     рассыпанные зёрна с поля и кидает их В ЭКРАН — минус сердечко и стан лапки.
     Саму руку шлёпать лапкой — это и есть урон */ 'banner.bossGypsy': [
        '💍 ЦЫГАНСКАЯ РУКА!',
        '💍 GYPSY HAND!',
        '💍 ZIGEUNERHAND!',
        '¡💍 MANO GITANA!'
    ],
    'txt.bossWarnGypsy': [
        'ОНА КРАДЁТ ЗЁРНА С ПОЛА И КИДАЕТ ИХ В ЭКРАН! ШЛЁПАЙ ЛАПКОЙ ПО РУКЕ!',
        'SHE STEALS KERNELS OFF THE FLOOR AND THROWS THEM AT YOU! SLAP THE HAND!',
        'SIE STIEHLT KÖRNER UND WIRFT SIE AUF DICH! KLATSCH DIE HAND WEG!',
        '¡ROBA GRANOS DEL SUELO Y TE LOS TIRA! ¡DALE UNA MANOTEADA!'
    ],
    'txt.gypsySlap': [
        'ЗЕРНО НЕ БЕРЁТ — ШЛЁПАЙ ЛАПКОЙ!',
        "KERNELS DON'T HURT IT — SLAP IT!",
        'KÖRNER NÜTZEN NICHT — KLATSCHEN!',
        '¡LOS GRANOS NO LE HACEN NADA: ¡MANOTAZO!'
    ],
    'txt.gypsyHit': [
        'ЗЕРНО В ЛАПКУ! ОГЛОХЛА!',
        'KERNEL HIT YOUR PAW! DAZED!',
        'KORN IN DER PFOTE! TAUB!',
        '¡GRANO EN LA PATA! ¡ATURDIDA!'
    ],
    'txt.gypsySleeve': [
        'БРОСОК ИЗ РУКАВА!',
        'THROWN FROM HER SLEEVE!',
        'WURF AUS DEM ÄRMEL!',
        '¡TIRO DESDE LA MANGA!'
    ],
    'txt.bossDownGypsy': [
        'РУКА ПОБЕЖДЕНА! +{{n}}',
        'HAND DEFEATED! +{{n}}',
        'HAND BESIEGT! +{{n}}',
        '¡MANO DERROTADA! +{{n}}'
    ],
    'ach.gypsyBoss1.name': [
        'Рука повержена',
        'Hand Downed',
        'Hand Besiegt',
        'Mano Derribada'
    ],
    'ach.gypsyBoss1.desc': [
        'Победить ЦЫГАНСКУЮ РУКУ: крадёт зёрна и кидает их в тебя — шлёпай её лапкой!',
        'Defeat the GYPSY HAND: she steals kernels and hurls them at you — slap her!',
        'Die ZIGEUNERHAND besiegen: Sie stiehlt Körner — klatsch sie weg!',
        'Vence a la MANO GITANA: roba granos y te los tira: ¡manotéala!'
    ],
    /* Ачивки боссов 0.0.33+: раньше показывался сырой ключ — теперь все 4 языка */ 'ach.lion1.name': [
        'Царь попкорна',
        'Popcorn King',
        'Popcorn-König',
        'Rey del Palomitas'
    ],
    'ach.onlyWitness.name': [
        'Свидетель',
        'The Witness',
        'Der Zeuge',
        'El Testigo'
    ],
    'ach.onlyWitness.desc': [
        'Онлифансий высунул гигантскую когтистую лапу на уровнях 7/13/18 — и ты не запаниковал!',
        'OnlyFansius thrust his giant clawed paw in at levels 7/13/18 — and you kept your cool!',
        'OnlyFansius schob seine Riesenpranke bei Level 7/13/18 herein — und du bliebst cool!',
        'OnlyFansius metió su pata gigante con garras en los niveles 7/13/18 — ¡y no te acobardaste!'
    ],
    'ach.lion1.desc': [
        'Победить ОНЛИФАНСИЯ: грива-щит отбивает зёрна — бей после рёва!',
        'Defeat ONLYFANSIUS: his mane deflects kernels — strike after the roar!',
        'ONLYFANSIUS besiegen: Die Mähne wehrt Körner ab — triff nach dem Brüllen!',
        'Vencer a ONLYFANSIUS: su meléna rebota granos: ¡ataca tras el rugido!'
    ],
    'ach.marten1.name': [
        'Лана поймана',
        'Lana Caught',
        'Lana Gefangen',
        'Lana Atrapada'
    ],
    'ach.marten1.desc': [
        'Поймать воровку КУНИЦУ ЛАНУ — перерезай её лапки свайпом!',
        'Catch LANA THE MARTEN — slice her paws with swipes!',
        'Den Marder LANA fangen — schneide ihre Pfoten mit Swipes ab!',
        '¡Atrapa a la marta LANA — corta sus patas con gestos!'
    ],
    'ach.pigeonBoss1.name': [
        'Голубь повержен',
        'Pigeon Downed',
        'Taube Erlegt',
        'Paloma Derribada'
    ],
    'ach.pigeonBoss1.desc': [
        'Победить МЕГА-ГОЛУБЯ: тело неуязвимо — выбей лапкой его глаза!',
        'Defeat the MEGA-PIGEON: its body is invincible — knock out its eyes!',
        'Die MEGA-TAUBE besiegen: Der Körper ist unverwundbar — triff die Augen!',
        'Vence a la PALOMA MEGA: su cuerpo es invencible: ¡saca sus ojos!'
    ],
    /* 0.0.50: ключи для menagerie/xpRun250/xpRun750 — раньше выводились как сырые ach.xxx */ 'ach.menagerie.name': [
        'Фильм про зверей',
        'Animal Movie',
        'Tierfilm',
        'Película de Animales'
    ],
    'ach.menagerie.desc': [
        'Победить МАЛЫША и КУНИЦУ ЛАНУ за один забег (Онлифансий подождёт!)',
        'Defeat the KID boss and LANA THE MARTEN in one run (OnlyFansius will wait!)',
        'Besiege den Knirps und den Marder LANA in einem Lauf (OnlyFansius wartet!)',
        'Vence al Niño y a la marta LANA en una partida (¡OnlyFansius puede esperar!)'
    ],
    'ach.xpRun250.name': [
        'Опытный студент',
        'Seasoned Student',
        'Erfahrener Student',
        'Estudiante Experto'
    ],
    'ach.xpRun250.desc': [
        'Заработать 250 опыта 🍿 за один забег',
        'Earn 250 XP 🍿 in one run',
        '250 XP in einem Lauf verdienen',
        'Gana 250 XP 🍿 en una partida'
    ],
    'ach.xpRun750.name': [
        'Профессор попкорна',
        'Popcorn Professor',
        'Popcorn-Professor',
        'Profesor de Palomitas'
    ],
    'ach.xpRun750.desc': [
        'Заработать 750 опыта 🍿 за один забег',
        'Earn 750 XP 🍿 in one run',
        '750 XP in einem Lauf verdienen',
        'Gana 750 XP 🍿 en una partida'
    ],
    'txt.roar': [
        'Р-Р-РЁВ!',
        'ROAAAR!',
        'R-R-RÖHR!',
        '¡RRRR!'
    ],
    'txt.deflect': [
        'ОТСКОК!',
        'DEFLECTED!',
        'ABGEPRALLT!',
        '¡REBOTE!'
    ],
    'txt.pawCut': [
        'РЕЗ!',
        'SLICE!',
        'SCHNITT!',
        '¡CORTE!'
    ],
    'txt.lanaDodge': [
        'УВЕРНУЛАСЬ!',
        'TOO SLICK!',
        'ZU FLINK!',
        '¡ESCURRIDIZA!'
    ],
    'txt.lootBack': [
        'ОБРАТНО!',
        'GIVEN BACK!',
        'ZURÜCK!',
        '¡DEVUELTO!'
    ],
    'txt.bossDownLion': [
        'ОНЛИФАНСИЙ ПОВЕРЖЕН! +{{n}}',
        'ONLYFANSIUS DEFEATED! +{{n}}',
        'ONLYFANSIUS BESIEGT! +{{n}}',
        '¡ONLYFANSIUS DERROTADO! +{{n}}'
    ],
    'txt.bossDownMarten': [
        'ЛАНА ПОЙМАНА! +{{n}}',
        'LANA CAUGHT! +{{n}}',
        'LANA GEFANGEN! +{{n}}',
        '¡LANA ATRAPADA! +{{n}}'
    ],
    'hud.bossLion': [
        'ОНЛИФАНСИЙ',
        'ONLYFANSIUS',
        'ONLYFANSIUS',
        'ONLYFANSIUS'
    ],
    'hud.bossMarten': [
        'ЛАНА',
        'LANA',
        'LANA',
        'LANA'
    ],
    'hud.bossPigeon': [
        'ГОЛУБЬ',
        'PIGEON',
        'TAUBE',
        'PALOMA'
    ],
    'hud.bossGypsy': [
        'РУКА',
        'HAND',
        'HAND',
        'MANO'
    ],
    'txt.feverWin': [
        '🔥 +{{n}} ЗА ЛИХОРАДКУ!',
        '🔥 +{{n}} FEVER BONUS!',
        '🔥 +{{n}} FIEBER-BONUS!',
        '🔥 +{{n}} DE FIEBRE!'
    ],
    'txt.feverBurn': [
        'МИНА! ОЧКИ СГОРЕЛИ!',
        'MINE! FEVER POINTS BURNED!',
        'MINE! FIEBER-PUNKTE VERBRANNT!',
        '¡MINA! ¡PUNTOS PERDIDOS!'
    ],
    /* Внезапная лихорадка (посреди этапа, «Фарт» из древа): этап продолжается
     с сохранённым прогрессом и компенсацией времени (+3 сек) */ 'txt.feverResume': [
        'ЭТАП ПРОДОЛЖАЕТСЯ! +{{n}} СЕК',
        'STAGE CONTINUES! +{{n}} SEC',
        'LEVEL GEHT WEITER! +{{n}} SEK',
        '¡FASE CONTINÚA! +{{n}} SEG'
    ],
    /* БОЛЬШАЯ ПОПКОРНИНА: объявление сорта при появлении и горький промах.
     Сорта: карамель (обычная, +1000) · вишня (комбо-приз) ·
     виноград (самая редкая, ×комбо — жирнейший улов) */ 'big.caramel': [
        'КАРАМЕЛЬНАЯ!',
        'CARAMEL!',
        'KARAMELL!',
        '¡CARAMELO!'
    ],
    'big.cherry': [
        'ВИШНЁВАЯ!',
        'CHERRY!',
        'KIRSCHE!',
        '¡CEREZA!'
    ],
    'big.grape': [
        'ВИНОГРАДНАЯ!',
        'GRAPE!',
        'TRAUBE!',
        '¡UVA!'
    ],
    'big.miss': [
        'УКАТИЛАСЬ!',
        'IT GOT AWAY!',
        'WEGGEROLLT!',
        '¡SE ESCAPÓ!'
    ],
    'fever.coins': [
        'монеток',
        'coins',
        'Münzen',
        'monedas'
    ]
};
function detectLang() {
    if (typeof navigator === 'undefined') return 'ru';
    const n = (navigator.language || 'ru').toLowerCase();
    if (n.startsWith('ru')) return 'ru';
    if (n.startsWith('de')) return 'de';
    if (n.startsWith('es')) return 'es';
    return 'en';
}
function tFor(lang) {
    const idx = LANGS.findIndex((l)=>l.id === lang);
    const i = idx < 0 ? 0 : idx;
    return (key, vars)=>{
        const row = T[key];
        let s = row ? row[i] || row[0] : key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)){
                s = s.split(`{{${k}}}`).join(String(v));
            }
        }
        return s;
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/lifestats.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Накопительные счётчики за всё время — «стаж охотника».
 * Нужны для достижений с пожизненными условиями (5000 зёрен, 25 голубей,
 * 10 лихорадок, 50 сосок…). Хранятся в localStorage одним JSON-объектом.
 *
 * Пишет лениво: изменения копятся в памяти и сбрасываются на диск
 * не чаще раза в 1.5 секунды (или принудительно flushLife()),
 * чтобы частые события (каждое зёрнышко) не дёргали localStorage.
 */ __turbopack_context__.s([
    "LIFE_KEY",
    ()=>LIFE_KEY,
    "addLife",
    ()=>addLife,
    "flushLife",
    ()=>flushLife,
    "getLife",
    ()=>getLife
]);
const LIFE_KEY = 'popcorn-lifestats';
const DEFAULT_LIFE = {
    grains: 0,
    golden: 0,
    pigeons: 0,
    mines: 0,
    fevers: 0,
    runs: 0,
    curse: 0,
    bonus: 0,
    nipples: 0,
    gifts: 0,
    secs: 0,
    visits: 0,
    perfects: 0,
    score: 0,
    bigCaught: 0,
    bigCaramel: 0,
    bigCherry: 0,
    bigGrape: 0,
    bossKills: 0,
    bossLionKills: 0,
    bossMartenKills: 0,
    bossPigeonKills: 0,
    bossGypsyKills: 0,
    sliceCaramel: 0,
    sliceCherry: 0,
    sliceGrape: 0
};
/** Живой объект в памяти — единый источник между кадрами */ let cache = null;
let dirty = false;
let flushTimer = null;
function parseLife(raw) {
    try {
        const v = JSON.parse(raw ?? '');
        if (v && typeof v === 'object') {
            const o = v;
            const out = {
                ...DEFAULT_LIFE
            };
            for (const k of Object.keys(DEFAULT_LIFE)){
                const n = Number(o[k]);
                if (Number.isFinite(n) && n > 0) out[k] = Math.floor(n);
            }
            return out;
        }
    } catch  {
    /* пусто — дефолты */ }
    return {
        ...DEFAULT_LIFE
    };
}
function getLife() {
    if (cache) return cache;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        cache = parseLife(window.localStorage.getItem(LIFE_KEY));
    } catch  {
        cache = {
            ...DEFAULT_LIFE
        };
    }
    return cache;
}
function addLife(patch) {
    const cur = getLife();
    for (const k of Object.keys(patch)){
        const d = patch[k];
        if (typeof d === 'number' && d > 0) cur[k] += Math.floor(d);
    }
    dirty = true;
    scheduleFlush();
    return cur;
}
function scheduleFlush() {
    if (flushTimer !== null || ("TURBOPACK compile-time value", "object") === 'undefined') return;
    flushTimer = window.setTimeout(()=>{
        flushTimer = null;
        flushLife();
    }, 1500);
}
function flushLife() {
    if (!dirty || !cache || ("TURBOPACK compile-time value", "object") === 'undefined') return;
    try {
        window.localStorage.setItem(LIFE_KEY, JSON.stringify(cache));
    } catch  {
    /* приватный режим — молча */ }
    dirty = false;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/market.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Рынок «POPCORN PAWS» — обменник валют и лавка
 * постоянных артефактов.
 *
 * Четыре валюты ходят по рынку:
 *  💎 Алмазы     — из путешествий NANA (активная валюта её лавки);
 *  🪙 Монетки    — из этапов, Лихорадки и сундучков; кликер тоже даёт;
 *  🍿 Опыт       — очки попкорна (банк опыта, им же куплены лапки);
 *  🌾 Зёрнышки   — зерновой сейф: каждое сданное в игре зерно капает сюда.
 *
 * Курсы привязаны к монетке (см. VAL), рынок берёт комиссию 15% —
 * туда-сюда гонять валюту невыгодно. Артефакты — постоянные усиления
 * за алмазы (экономические множители), покупаются один раз.
 *
 * Хранится в localStorage одним JSON-объектом; изменения бродкастятся
 * событием MARKET_EVENT (useSyncExternalStore в UI).
 */ /* ════════════════ Валюты и курсы ════════════════ */ __turbopack_context__.s([
    "ARTIFACTS",
    ()=>ARTIFACTS,
    "ARTIFACT_MAP",
    ()=>ARTIFACT_MAP,
    "CURRENCIES",
    ()=>CURRENCIES,
    "CURRENCY_KEYS",
    ()=>CURRENCY_KEYS,
    "DEFAULT_MARKET",
    ()=>DEFAULT_MARKET,
    "MARKET_EVENT",
    ()=>MARKET_EVENT,
    "MARKET_FEE",
    ()=>MARKET_FEE,
    "MARKET_KEY",
    ()=>MARKET_KEY,
    "ZERO_MARKET_BONUS",
    ()=>ZERO_MARKET_BONUS,
    "addGrains",
    ()=>addGrains,
    "artifactReqLevel",
    ()=>artifactReqLevel,
    "buyArtifact",
    ()=>buyArtifact,
    "countClick",
    ()=>countClick,
    "exchangeQuote",
    ()=>exchangeQuote,
    "getMarketSnapshot",
    ()=>getMarketSnapshot,
    "hasArtifact",
    ()=>hasArtifact,
    "isArtifactId",
    ()=>isArtifactId,
    "loadMarket",
    ()=>loadMarket,
    "marketBonuses",
    ()=>marketBonuses,
    "saveMarket",
    ()=>saveMarket,
    "spendGrains",
    ()=>spendGrains,
    "subscribeMarket",
    ()=>subscribeMarket
]);
const CURRENCIES = [
    'gems',
    'coins',
    'xp',
    'grains'
];
/** Стоимость единицы валюты в монетках (основа курсов).
    Опыт 🍿 с v0.0.21 идёт по курсу «10 очков = 1 🍿», поэтому единица опыта
    в 10 раз дороже прежней (0.2 → 2): обменник остаётся честным */ const VAL = {
    gems: 12,
    coins: 1,
    xp: 2,
    grains: 0.1
};
const MARKET_FEE = 0.2;
function exchangeQuote(from, to, n) {
    if (from === to || n <= 0) return 0;
    const value = Math.floor(n) * VAL[from] * (1 - MARKET_FEE);
    return Math.max(0, Math.floor(value / VAL[to]));
}
const ARTIFACTS = [
    {
        id: 'piggy',
        price: 280,
        reqLevel: 2
    },
    {
        id: 'academy',
        price: 280,
        reqLevel: 2
    },
    {
        id: 'sieve',
        price: 240,
        reqLevel: 2
    },
    {
        id: 'travelmap',
        price: 450,
        reqLevel: 4
    },
    {
        id: 'rattle',
        price: 500,
        reqLevel: 5
    },
    {
        id: 'bell',
        price: 650,
        reqLevel: 6
    }
];
const ARTIFACT_MAP = ARTIFACTS.reduce(_c = (acc, a)=>{
    acc[a.id] = a;
    return acc;
}, {});
_c1 = ARTIFACT_MAP;
function artifactReqLevel(id) {
    return ARTIFACT_MAP[id]?.reqLevel ?? 1;
}
const isArtifactId = (v)=>v === 'piggy' || v === 'academy' || v === 'sieve' || v === 'travelmap' || v === 'bell' || v === 'rattle';
const MARKET_KEY = 'popcorn-market';
const MARKET_EVENT = 'popcorn-market-update';
const DEFAULT_MARKET = {
    artifacts: [],
    clicks: 0,
    grains: 0
};
function loadMarket() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = window.localStorage.getItem(MARKET_KEY);
        if (!raw) return {
            ...DEFAULT_MARKET,
            artifacts: []
        };
        const o = JSON.parse(raw);
        const artifacts = Array.isArray(o.artifacts) ? o.artifacts.filter(isArtifactId) : [];
        return {
            artifacts: [
                ...new Set(artifacts)
            ],
            clicks: Math.max(0, Math.floor(Number(o.clicks) || 0)),
            grains: Math.max(0, Math.floor(Number(o.grains) || 0))
        };
    } catch  {
        return {
            ...DEFAULT_MARKET,
            artifacts: []
        };
    }
}
let snapshotCache = null;
function getMarketSnapshot() {
    if (snapshotCache === null) snapshotCache = loadMarket();
    return snapshotCache;
}
function subscribeMarket(cb) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.addEventListener(MARKET_EVENT, cb);
    return ()=>window.removeEventListener(MARKET_EVENT, cb);
}
function saveMarket(s) {
    snapshotCache = s;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        window.localStorage.setItem(MARKET_KEY, JSON.stringify(s));
        window.dispatchEvent(new Event(MARKET_EVENT));
    } catch  {
    /* приватный режим — игнорируем */ }
}
function countClick() {
    const cur = getMarketSnapshot();
    const next = {
        ...cur,
        clicks: cur.clicks + 1
    };
    saveMarket(next);
    return next;
}
function addGrains(n) {
    const add = Math.max(0, Math.floor(n));
    if (add <= 0) return getMarketSnapshot();
    const cur = getMarketSnapshot();
    const next = {
        ...cur,
        grains: cur.grains + add
    };
    saveMarket(next);
    return next;
}
function spendGrains(n) {
    const cost = Math.max(0, Math.floor(n));
    const cur = getMarketSnapshot();
    if (cur.grains < cost) return false;
    saveMarket({
        ...cur,
        grains: cur.grains - cost
    });
    return true;
}
function buyArtifact(id, diamonds) {
    const def = ARTIFACT_MAP[id];
    if (!def) return false;
    const cur = getMarketSnapshot();
    if (cur.artifacts.includes(id) || diamonds < def.price) return false;
    saveMarket({
        ...cur,
        artifacts: [
            ...cur.artifacts,
            id
        ]
    });
    return true;
}
function hasArtifact(id) {
    return getMarketSnapshot().artifacts.includes(id);
}
const ZERO_MARKET_BONUS = {
    coinGift: 1,
    xpGift: 1,
    grain: 1,
    gemTrip: 1,
    xpTrip: 1,
    clickCoin: 1,
    clickAdd: 0
};
function marketBonuses(state = getMarketSnapshot()) {
    const has = (id)=>state.artifacts.includes(id);
    return {
        coinGift: has('piggy') ? 1.25 : 1,
        xpGift: has('academy') ? 1.25 : 1,
        grain: has('sieve') ? 1.25 : 1,
        gemTrip: has('travelmap') ? 1.15 : 1,
        xpTrip: has('travelmap') ? 1.15 : 1,
        /* Колокольчик ×1.5 (округление вверх в точке начисления): инфляция кликера
       держится под контролем, но артефакт остаётся ощутимым */ clickCoin: has('bell') ? 1.5 : 1,
        clickAdd: has('rattle') ? 2 : 0
    };
}
const CURRENCY_KEYS = {
    coins: 'popcorn-coins',
    xp: 'popcorn-xp'
};
var _c, _c1;
__turbopack_context__.k.register(_c, "ARTIFACT_MAP$ARTIFACTS.reduce");
__turbopack_context__.k.register(_c1, "ARTIFACT_MAP");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/marten.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Рост куницы NANA — живого питомца в главном меню.
 *
 * Куница растёт от прогресса игрока: каждый пройденный уровень и время,
 * проведённое в игре, копят «опыт роста». Каждые 4–5 уровней (плюс бонус
 * за минуты) куница переходит на следующую стадию — становится крупнее,
 * а комната в меню обставляется богаче: гирлянда, леопардовый ковёр,
 * монеты, кошачьи игрушки.
 *
 * Помимо стадий у NANA есть боевой уровень (xp от очков игрока в забегах,
 * путешествий и кликера), алмазы 💎 и снаряжение путешественницы из
 * лавки: ботиночки, шляпки и сумочки. Куница сама ходит в авто-забеги
 * (путешествия) за зерном, алмазами и особым лутом: таймер идёт в
 * реальном времени, даже когда игра закрыта.
 *
 * Хранится в localStorage одним JSON-объектом.
 */ /** Идентификатор путешествия */ __turbopack_context__.s([
    "BAGS",
    ()=>BAGS,
    "BAGS_MAP",
    ()=>BAGS_MAP,
    "BOOTS",
    ()=>BOOTS,
    "BOOTS_MAP",
    ()=>BOOTS_MAP,
    "DEFAULT_MARTEN",
    ()=>DEFAULT_MARTEN,
    "HATS",
    ()=>HATS,
    "HATS_MAP",
    ()=>HATS_MAP,
    "MARTEN_EVENT",
    ()=>MARTEN_EVENT,
    "MARTEN_KEY",
    ()=>MARTEN_KEY,
    "MAX_MARTEN_STAGE",
    ()=>MAX_MARTEN_STAGE,
    "TRIPS",
    ()=>TRIPS,
    "TRIP_MAP",
    ()=>TRIP_MAP,
    "addMartenDiamonds",
    ()=>addMartenDiamonds,
    "addMartenProgress",
    ()=>addMartenProgress,
    "addMartenXp",
    ()=>addMartenXp,
    "buyMartenBag",
    ()=>buyMartenBag,
    "buyMartenBoots",
    ()=>buyMartenBoots,
    "buyMartenHat",
    ()=>buyMartenHat,
    "claimMartenTrip",
    ()=>claimMartenTrip,
    "equipMartenBag",
    ()=>equipMartenBag,
    "equipMartenBoots",
    ()=>equipMartenBoots,
    "equipMartenHat",
    ()=>equipMartenHat,
    "fmtTripDur",
    ()=>fmtTripDur,
    "fmtTripMs",
    ()=>fmtTripMs,
    "getMartenSnapshot",
    ()=>getMartenSnapshot,
    "growthOf",
    ()=>growthOf,
    "isBagId",
    ()=>isBagId,
    "isBootsId",
    ()=>isBootsId,
    "isHatId",
    ()=>isHatId,
    "isTripId",
    ()=>isTripId,
    "levelsToNext",
    ()=>levelsToNext,
    "loadMarten",
    ()=>loadMarten,
    "martenLevelOf",
    ()=>martenLevelOf,
    "martenMess",
    ()=>martenMess,
    "martenXpNeed",
    ()=>martenXpNeed,
    "nanaClickCoins",
    ()=>nanaClickCoins,
    "nanaLevelBonus",
    ()=>nanaLevelBonus,
    "progressToNext",
    ()=>progressToNext,
    "saveMarten",
    ()=>saveMarten,
    "spendMartenDiamonds",
    ()=>spendMartenDiamonds,
    "stageOf",
    ()=>stageOf,
    "startMartenTrip",
    ()=>startMartenTrip,
    "subscribeMarten",
    ()=>subscribeMarten,
    "tripReward",
    ()=>tripReward
]);
const MARTEN_KEY = 'popcorn-marten';
const MARTEN_EVENT = 'popcorn-marten-update';
/** Каждые 4 минуты в игре дают +1 очко роста */ const SECONDS_PER_POINT = 240;
/** Пороги очков роста для стадий 0..6 (первый рост — после ~4 уровней) */ const GROWTH_THRESHOLDS = [
    0,
    4,
    9,
    15,
    22,
    30,
    40
];
const MAX_MARTEN_STAGE = GROWTH_THRESHOLDS.length - 1;
const DEFAULT_MARTEN = {
    levels: 0,
    seconds: 0,
    xp: 0,
    diamonds: 0,
    boots: 'none',
    ownedBoots: [
        'none'
    ],
    hat: 'none',
    ownedHats: [
        'none'
    ],
    bag: 'none',
    ownedBags: [
        'none'
    ],
    trip: null,
    trips: 0
};
const TRIPS = [
    {
        id: 't10',
        ms: 10 * 60_000,
        diamonds: 10,
        xp: 20,
        coins: 0,
        grains: 0,
        lock: 0
    },
    {
        id: 't30',
        ms: 30 * 60_000,
        diamonds: 30,
        xp: 70,
        coins: 0,
        grains: 0,
        lock: 0
    },
    {
        id: 't60',
        ms: 60 * 60_000,
        diamonds: 100,
        xp: 180,
        coins: 0,
        grains: 0,
        lock: 0
    },
    {
        id: 't180',
        ms: 180 * 60_000,
        diamonds: 340,
        xp: 620,
        coins: 30,
        grains: 140,
        lock: 5
    },
    {
        id: 't360',
        ms: 360 * 60_000,
        diamonds: 760,
        xp: 1400,
        coins: 70,
        grains: 340,
        lock: 8
    },
    {
        id: 't720',
        ms: 720 * 60_000,
        diamonds: 1600,
        xp: 3000,
        coins: 170,
        grains: 850,
        lock: 12
    }
];
const TRIP_MAP = TRIPS.reduce(_c = (acc, t)=>{
    acc[t.id] = t;
    return acc;
}, {});
_c1 = TRIP_MAP;
const isTripId = (v)=>v === 't10' || v === 't30' || v === 't60' || v === 't180' || v === 't360' || v === 't720';
const BOOTS = [
    {
        id: 'none',
        price: 0,
        gemMul: 1,
        xpMul: 1,
        timeMul: 1
    },
    {
        id: 'sapozhki',
        price: 90,
        gemMul: 1.15,
        xpMul: 1.15,
        timeMul: 0.95
    },
    {
        id: 'krest',
        price: 280,
        gemMul: 1.3,
        xpMul: 1.3,
        timeMul: 0.9
    },
    {
        id: 'valenki',
        price: 620,
        gemMul: 1.4,
        xpMul: 1.4,
        timeMul: 0.92
    },
    {
        id: 'sluzh',
        price: 1600,
        gemMul: 1.55,
        xpMul: 1.55,
        timeMul: 0.82
    },
    {
        id: 'leopard',
        price: 4200,
        gemMul: 2,
        xpMul: 2,
        timeMul: 0.75
    },
    {
        id: 'meteor',
        price: 7500,
        gemMul: 2.4,
        xpMul: 2.4,
        timeMul: 0.68
    },
    {
        id: 'lunnie',
        price: 14000,
        gemMul: 3,
        xpMul: 3,
        timeMul: 0.6
    }
];
const BOOTS_MAP = BOOTS.reduce(_c2 = (acc, b)=>{
    acc[b.id] = b;
    return acc;
}, {});
_c3 = BOOTS_MAP;
const isBootsId = (v)=>v === 'none' || v === 'sapozhki' || v === 'krest' || v === 'valenki' || v === 'sluzh' || v === 'leopard' || v === 'meteor' || v === 'lunnie';
const HATS = [
    {
        id: 'none',
        price: 0,
        clickXp: 0,
        gemMul: 1,
        xpMul: 1,
        timeMul: 1
    },
    {
        id: 'straw',
        price: 160,
        clickXp: 1,
        gemMul: 1.05,
        xpMul: 1.25,
        timeMul: 1
    },
    {
        id: 'cap',
        price: 480,
        clickXp: 2,
        gemMul: 1.1,
        xpMul: 1.5,
        timeMul: 0.97
    },
    {
        id: 'beret',
        price: 700,
        clickXp: 3,
        gemMul: 1.08,
        xpMul: 1.35,
        timeMul: 1
    },
    {
        id: 'wizard',
        price: 2200,
        clickXp: 6,
        gemMul: 1.22,
        xpMul: 1.75,
        timeMul: 0.96
    },
    {
        id: 'crown',
        price: 3000,
        clickXp: 4,
        gemMul: 1.2,
        xpMul: 2,
        timeMul: 0.94
    },
    {
        id: 'star',
        price: 6500,
        clickXp: 10,
        gemMul: 1.4,
        xpMul: 2.2,
        timeMul: 0.92
    },
    {
        id: 'superleo',
        price: 9000,
        clickXp: 9,
        gemMul: 1.35,
        xpMul: 2.5,
        timeMul: 0.9
    },
    {
        id: 'astronaut',
        price: 13000,
        clickXp: 15,
        gemMul: 1.55,
        xpMul: 3.2,
        timeMul: 0.85
    }
];
const HATS_MAP = HATS.reduce(_c4 = (acc, h)=>{
    acc[h.id] = h;
    return acc;
}, {});
_c5 = HATS_MAP;
const isHatId = (v)=>v === 'none' || v === 'straw' || v === 'cap' || v === 'beret' || v === 'wizard' || v === 'crown' || v === 'star' || v === 'superleo' || v === 'astronaut';
const BAGS = [
    {
        id: 'none',
        price: 0,
        coins: 0,
        grains: 0,
        gemAdd: 0
    },
    {
        id: 'packet',
        price: 130,
        coins: 4,
        grains: 30,
        gemAdd: 0
    },
    {
        id: 'meshok',
        price: 650,
        coins: 7,
        grains: 55,
        gemAdd: 0
    },
    {
        id: 'tote',
        price: 900,
        coins: 10,
        grains: 80,
        gemAdd: 0
    },
    {
        id: 'ryukzak',
        price: 1900,
        coins: 20,
        grains: 160,
        gemAdd: 0
    },
    {
        id: 'baguette',
        price: 2600,
        coins: 24,
        grains: 180,
        gemAdd: 0
    },
    {
        id: 'shkatulka',
        price: 4800,
        coins: 42,
        grains: 330,
        gemAdd: 1.06
    },
    {
        id: 'leobag',
        price: 7000,
        coins: 55,
        grains: 420,
        gemAdd: 1.05
    },
    {
        id: 'kosmos',
        price: 11000,
        coins: 85,
        grains: 660,
        gemAdd: 1.15
    }
];
const BAGS_MAP = BAGS.reduce(_c6 = (acc, b)=>{
    acc[b.id] = b;
    return acc;
}, {});
_c7 = BAGS_MAP;
const isBagId = (v)=>v === 'none' || v === 'packet' || v === 'meshok' || v === 'tote' || v === 'ryukzak' || v === 'baguette' || v === 'shkatulka' || v === 'leobag' || v === 'kosmos';
function tripReward(trip, gear, gemMult = 1, xpMult = 1, coinMult = 1, grainMult = 1) {
    const def = TRIP_MAP[trip];
    const b = BOOTS_MAP[gear.boots] ?? BOOTS_MAP.none;
    const h = HATS_MAP[gear.hat] ?? HATS_MAP.none;
    const bag = BAGS_MAP[gear.bag] ?? BAGS_MAP.none;
    const bagGem = Math.round(def.diamonds * (bag.gemAdd - 1 > 0 ? bag.gemAdd - 1 : 0));
    return {
        diamonds: Math.max(1, Math.round(def.diamonds * b.gemMul * h.gemMul * gemMult)) + bagGem,
        xp: Math.max(1, Math.round(def.xp * b.xpMul * h.xpMul * xpMult)),
        /* Особый лут дальних маршрутов (t180/t360/t720) + плоский лут сумочки;
       маршрутный лут множится артефактами «Хрюшка»/«Ситечко» — как в текстах */ coins: bag.coins + Math.round(def.coins * coinMult),
        grains: bag.grains + Math.round(def.grains * grainMult),
        ms: Math.max(15_000, Math.round(def.ms * b.timeMul * h.timeMul))
    };
}
function martenXpNeed(level) {
    const k = Math.max(1, level) - 1;
    return 60 + 30 * k + 8 * k * k;
}
function nanaLevelBonus(level) {
    return 1 + (Math.max(1, level) - 1) * 0.02;
}
function nanaClickCoins(level) {
    return Math.min(3, 1 + Math.floor((Math.max(1, level) - 1) / 10));
}
function martenMess(level) {
    const k = Math.max(1, Math.floor(level)) - 1;
    return {
        quota: Math.min(2, 1 + k * 0.03),
        pop: Math.min(1.6, 1 + k * 0.02),
        mines: Math.min(3, Math.floor(k / 10))
    };
}
function martenLevelOf(s) {
    let lvl = 1;
    let rest = Math.max(0, Math.floor(s.xp));
    while(lvl < 999 && rest >= martenXpNeed(lvl)){
        rest -= martenXpNeed(lvl);
        lvl += 1;
    }
    return {
        level: lvl,
        into: rest,
        need: martenXpNeed(lvl)
    };
}
function growthOf(s) {
    return Math.max(0, Math.floor(s.levels)) + Math.floor(Math.max(0, s.seconds) / SECONDS_PER_POINT);
}
function stageOf(s) {
    const g = growthOf(s);
    let stage = 0;
    for(let i = 0; i < GROWTH_THRESHOLDS.length; i++){
        if (g >= GROWTH_THRESHOLDS[i]) stage = i;
    }
    return stage;
}
function progressToNext(s) {
    const stage = stageOf(s);
    if (stage >= MAX_MARTEN_STAGE) return 1;
    const cur = GROWTH_THRESHOLDS[stage];
    const next = GROWTH_THRESHOLDS[stage + 1];
    return Math.min(1, Math.max(0, (growthOf(s) - cur) / (next - cur)));
}
function levelsToNext(s) {
    const stage = stageOf(s);
    if (stage >= MAX_MARTEN_STAGE) return 0;
    const g = growthOf(s);
    const next = GROWTH_THRESHOLDS[stage + 1];
    const levelsLeft = Math.ceil(next - g);
    return Math.max(0, levelsLeft);
}
function loadMarten() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = window.localStorage.getItem(MARTEN_KEY);
        if (!raw) return {
            ...DEFAULT_MARTEN,
            ownedBoots: [
                'none'
            ],
            ownedHats: [
                'none'
            ],
            ownedBags: [
                'none'
            ]
        };
        const o = JSON.parse(raw);
        const ownedBoots = Array.isArray(o.ownedBoots) ? o.ownedBoots.filter(isBootsId) : [];
        if (!ownedBoots.includes('none')) ownedBoots.unshift('none');
        const boots = isBootsId(o.boots) ? o.boots : 'none';
        const ownedHats = Array.isArray(o.ownedHats) ? o.ownedHats.filter(isHatId) : [];
        if (!ownedHats.includes('none')) ownedHats.unshift('none');
        const hat = isHatId(o.hat) ? o.hat : 'none';
        const ownedBags = Array.isArray(o.ownedBags) ? o.ownedBags.filter(isBagId) : [];
        if (!ownedBags.includes('none')) ownedBags.unshift('none');
        const bag = isBagId(o.bag) ? o.bag : 'none';
        const trip = o.trip && typeof o.trip === 'object' ? (()=>{
            const t = o.trip;
            if (!isTripId(t.id)) return null;
            const startedAt = Math.max(0, Math.floor(Number(t.startedAt) || 0));
            const endsAt = Math.max(0, Math.floor(Number(t.endsAt) || 0));
            if (endsAt <= startedAt) return null;
            return {
                id: t.id,
                startedAt,
                endsAt,
                diamonds: Math.max(0, Math.floor(Number(t.diamonds) || 0)),
                xp: Math.max(0, Math.floor(Number(t.xp) || 0)),
                coins: Math.max(0, Math.floor(Number(t.coins) || 0)),
                grains: Math.max(0, Math.floor(Number(t.grains) || 0))
            };
        })() : null;
        return {
            levels: Math.max(0, Math.floor(Number(o.levels) || 0)),
            seconds: Math.max(0, Math.floor(Number(o.seconds) || 0)),
            xp: Math.max(0, Math.floor(Number(o.xp) || 0)),
            diamonds: Math.max(0, Math.floor(Number(o.diamonds) || 0)),
            boots: ownedBoots.includes(boots) ? boots : 'none',
            ownedBoots,
            hat: ownedHats.includes(hat) ? hat : 'none',
            ownedHats,
            bag: ownedBags.includes(bag) ? bag : 'none',
            ownedBags,
            trip,
            trips: Math.max(0, Math.floor(Number(o.trips) || 0))
        };
    } catch  {
        return {
            ...DEFAULT_MARTEN,
            ownedBoots: [
                'none'
            ],
            ownedHats: [
                'none'
            ],
            ownedBags: [
                'none'
            ]
        };
    }
}
/** Сохранить состояние: обновляем кеш-снапшот, хранилище и подписчиков */ let snapshotCache = null;
function getMartenSnapshot() {
    if (snapshotCache === null) snapshotCache = loadMarten();
    return snapshotCache;
}
function subscribeMarten(cb) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.addEventListener(MARTEN_EVENT, cb);
    return ()=>window.removeEventListener(MARTEN_EVENT, cb);
}
function saveMarten(s) {
    snapshotCache = s;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        window.localStorage.setItem(MARTEN_KEY, JSON.stringify(s));
        window.dispatchEvent(new Event(MARTEN_EVENT));
    } catch  {
    /* переполнение приватного режима — игнорируем */ }
}
function addMartenProgress(levels, seconds) {
    const cur = getMartenSnapshot();
    const next = {
        ...cur,
        levels: cur.levels + Math.max(0, Math.floor(levels)),
        seconds: cur.seconds + Math.max(0, Math.floor(seconds))
    };
    saveMarten(next);
    return next;
}
function addMartenXp(n) {
    const add = Math.max(0, Math.floor(n));
    if (add <= 0) return getMartenSnapshot();
    const cur = getMartenSnapshot();
    const next = {
        ...cur,
        xp: cur.xp + add
    };
    saveMarten(next);
    return next;
}
function addMartenDiamonds(n) {
    const add = Math.max(0, Math.floor(n));
    if (add <= 0) return getMartenSnapshot();
    const cur = getMartenSnapshot();
    const next = {
        ...cur,
        diamonds: cur.diamonds + add
    };
    saveMarten(next);
    return next;
}
function spendMartenDiamonds(n) {
    const cost = Math.max(0, Math.floor(n));
    if (cost <= 0) return true;
    const cur = getMartenSnapshot();
    if (cur.diamonds < cost) return false;
    saveMarten({
        ...cur,
        diamonds: cur.diamonds - cost
    });
    return true;
}
function startMartenTrip(id, gemMult = 1, xpMult = 1, coinMult = 1, grainMult = 1) {
    const cur = getMartenSnapshot();
    if (cur.trip) return cur // уже в пути
    ;
    const lvl = martenLevelOf(cur).level;
    const def = TRIP_MAP[id];
    if (lvl < def.lock) return cur // маршрут ещё закрыт
    ;
    const rw = tripReward(id, {
        boots: cur.boots,
        hat: cur.hat,
        bag: cur.bag
    }, gemMult, xpMult, coinMult, grainMult);
    const now = Date.now();
    const next = {
        ...cur,
        trip: {
            id,
            startedAt: now,
            endsAt: now + rw.ms,
            diamonds: rw.diamonds,
            xp: rw.xp,
            coins: rw.coins,
            grains: rw.grains
        }
    };
    saveMarten(next);
    return next;
}
function claimMartenTrip() {
    const cur = getMartenSnapshot();
    if (!cur.trip || Date.now() < cur.trip.endsAt) return null;
    const { diamonds, xp, coins, grains } = cur.trip;
    const next = {
        ...cur,
        diamonds: cur.diamonds + diamonds,
        xp: cur.xp + xp,
        trip: null,
        trips: cur.trips + 1
    };
    saveMarten(next);
    return {
        state: next,
        diamonds,
        xp,
        coins,
        grains
    };
}
function buyMartenBoots(id) {
    const def = BOOTS_MAP[id];
    if (!def || id === 'none') return false;
    const cur = getMartenSnapshot();
    if (cur.ownedBoots.includes(id) || cur.diamonds < def.price) return false;
    saveMarten({
        ...cur,
        diamonds: cur.diamonds - def.price,
        ownedBoots: [
            ...cur.ownedBoots,
            id
        ],
        boots: id
    });
    return true;
}
function equipMartenBoots(id) {
    const cur = getMartenSnapshot();
    if (!cur.ownedBoots.includes(id)) return;
    if (cur.boots === id) return;
    saveMarten({
        ...cur,
        boots: id
    });
}
function buyMartenHat(id) {
    const def = HATS_MAP[id];
    if (!def || id === 'none') return false;
    const cur = getMartenSnapshot();
    if (cur.ownedHats.includes(id) || cur.diamonds < def.price) return false;
    saveMarten({
        ...cur,
        diamonds: cur.diamonds - def.price,
        ownedHats: [
            ...cur.ownedHats,
            id
        ],
        hat: id
    });
    return true;
}
function equipMartenHat(id) {
    const cur = getMartenSnapshot();
    if (!cur.ownedHats.includes(id)) return;
    if (cur.hat === id) return;
    saveMarten({
        ...cur,
        hat: id
    });
}
function buyMartenBag(id) {
    const def = BAGS_MAP[id];
    if (!def || id === 'none') return false;
    const cur = getMartenSnapshot();
    if (cur.ownedBags.includes(id) || cur.diamonds < def.price) return false;
    saveMarten({
        ...cur,
        diamonds: cur.diamonds - def.price,
        ownedBags: [
            ...cur.ownedBags,
            id
        ],
        bag: id
    });
    return true;
}
function equipMartenBag(id) {
    const cur = getMartenSnapshot();
    if (!cur.ownedBags.includes(id)) return;
    if (cur.bag === id) return;
    saveMarten({
        ...cur,
        bag: id
    });
}
function fmtTripMs(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const s = total % 60;
    const m = Math.floor(total / 60) % 60;
    const h = Math.floor(total / 3600);
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
function fmtTripDur(ms) {
    const min = Math.round(ms / 60_000);
    if (min < 60) return `${min} мин`;
    return `${Math.round(min / 60 * 10) / 10} ч`;
}
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "TRIP_MAP$TRIPS.reduce");
__turbopack_context__.k.register(_c1, "TRIP_MAP");
__turbopack_context__.k.register(_c2, "BOOTS_MAP$BOOTS.reduce");
__turbopack_context__.k.register(_c3, "BOOTS_MAP");
__turbopack_context__.k.register(_c4, "HATS_MAP$HATS.reduce");
__turbopack_context__.k.register(_c5, "HATS_MAP");
__turbopack_context__.k.register(_c6, "BAGS_MAP$BAGS.reduce");
__turbopack_context__.k.register(_c7, "BAGS_MAP");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/meta.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XP_BANK_KEY",
    ()=>XP_BANK_KEY,
    "addCoins",
    ()=>addCoins,
    "addTotalXp",
    ()=>addTotalXp,
    "charLevel",
    ()=>charLevel,
    "charLevelProgress",
    ()=>charLevelProgress,
    "getCoins",
    ()=>getCoins,
    "getTotalXp",
    ()=>getTotalXp,
    "migrateXpBank",
    ()=>migrateXpBank,
    "needForLevel",
    ()=>needForLevel
]);
/**
 * Мета-прогресс «POPCORN PAWS» — монетки и уровни котика.
 *
 *  🪙 Монетки — отдельная валюта: капают за каждый пройденный этап,
 *    выпадают из сундучков и за успех в «Лихорадке». Ими покупаются
 *    редкие артефактные лапки в магазине.
 *  🎖 Уровень котика — растёт от ВСЕГО опыта, заработанного за всё время
 *    (очки попкорна + бонус за каждый пройденный этап). Уровень никогда
 *    не уменьшается — это чистый показатель стажа охотника.
 *
 * Хранится в localStorage; изменения бродкастятся тем же событием,
 * что и остальной магазин, чтобы UI обновлялся мгновенно.
 */ const COINS_KEY = 'popcorn-coins';
const TOTAL_KEY = 'popcorn-totalxp';
const XP_BANK_KEY = 'popcorn-xp';
/** Тот же ивент, что у магазина: один стор на всё меню */ const STORE_EVENT = 'popcorn-store-update';
function readNum(key) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return Math.max(0, Math.floor(Number(window.localStorage.getItem(key)) || 0));
    } catch  {
        return 0;
    }
}
function writeNum(key, value) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        window.localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
        window.dispatchEvent(new Event(STORE_EVENT));
    } catch  {
    /* приватный режим — игнорируем */ }
}
function getCoins() {
    migrateXpBank();
    return readNum(COINS_KEY);
}
function addCoins(delta) {
    migrateXpBank();
    writeNum(COINS_KEY, readNum(COINS_KEY) + delta);
}
/* ================= уровень котика 🎖 ================= */ /* --- разовая миграция v0.0.21 ---
   Опыт теперь начисляется по курсу «10 очков = 1 🍿» (см. popcorn-game),
   поэтому старые запасы (банк + стаж) делим на 10 — курс совпадает
   с новыми ценами лапок, и ничего не обесценивается. */ const XP_MIG_KEY = 'popcorn-xp-mig10';
let xpMigrated = false;
function migrateXpBank() {
    if (xpMigrated || ("TURBOPACK compile-time value", "object") === 'undefined') return;
    xpMigrated = true;
    try {
        /* --- разовая миграция v0.0.27: экономика стала строже — цены апгрейдов
        ×3 и крутее кривая уровня. Старые запасы (заработанные ещё в мягкой
        экономике) делим на 2.5 — купленное остаётся, но прогрессия снова
        ощущается --- */ const MIG2_KEY = 'popcorn-xp-mig25';
        if (window.localStorage.getItem(MIG2_KEY) !== '1') {
            window.localStorage.setItem(MIG2_KEY, '1');
            for (const key of [
                TOTAL_KEY,
                XP_BANK_KEY
            ]){
                const v = Math.max(0, Math.floor(Number(window.localStorage.getItem(key)) || 0));
                window.localStorage.setItem(key, String(Math.floor(v / 2.5)));
            }
            window.dispatchEvent(new Event(STORE_EVENT));
        }
        /* --- разовая миграция v0.0.28: цены апгрейдов пересобраны под новую
        политику «вся прокачка ≈ 10–15 тысяч 🪙» (было 3.3 млн). Банк монет,
        накопленный в прежней экономике, делим на 10 — купленное остаётся,
        а мелкий запас не даёт выкупить лавку в первый день --- */ const MIG3_KEY = 'popcorn-coins-mig28';
        if (window.localStorage.getItem(MIG3_KEY) !== '1') {
            window.localStorage.setItem(MIG3_KEY, '1');
            const v = Math.max(0, Math.floor(Number(window.localStorage.getItem(COINS_KEY)) || 0));
            window.localStorage.setItem(COINS_KEY, String(Math.floor(v / 10)));
            window.dispatchEvent(new Event(STORE_EVENT));
        }
        if (window.localStorage.getItem(XP_MIG_KEY) === '1') return;
        window.localStorage.setItem(XP_MIG_KEY, '1');
        for (const key of [
            TOTAL_KEY,
            XP_BANK_KEY
        ]){
            const v = Math.max(0, Math.floor(Number(window.localStorage.getItem(key)) || 0));
            window.localStorage.setItem(key, String(Math.floor(v / 10)));
        }
        window.dispatchEvent(new Event(STORE_EVENT));
    } catch  {
    /* приватный режим — не беда */ }
}
function getTotalXp() {
    migrateXpBank();
    return readNum(TOTAL_KEY);
}
function addTotalXp(delta) {
    if (delta <= 0) return;
    writeNum(TOTAL_KEY, readNum(TOTAL_KEY) + delta);
}
function needForLevel(level) {
    const l = Math.max(1, Math.floor(level));
    return 1100 + Math.round(90 * Math.pow(l - 1, 1.6));
}
function charLevel(total) {
    let level = 1;
    let acc = 0;
    while(total >= acc + needForLevel(level) && level < 999){
        acc += needForLevel(level);
        level++;
    }
    return level;
}
function charLevelProgress(total) {
    const level = charLevel(total);
    let acc = 0;
    for(let l = 1; l < level; l++)acc += needForLevel(l);
    const into = Math.max(0, total - acc);
    return {
        level,
        into,
        need: needForLevel(level)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/paws.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Магазин лапок «POPCORN PAWS».
 * Очки попкорна — это опыт игрока (курс: 15 очков = 1 🍿): за опыт
 * покупаются лапки, чьи улучшения действуют ПОСТОЯННО (в каждом забеге,
 * каждый уровень). От простой рыжей до самой дорогой леопардовой.
 *
 * ЦЕНОВАЯ ПОЛИТИКА 0.0.31 (запрос игрока: «цена лапок неадекватно низкая,
 * все цены поднять»): цены опыта ×2.5 от 0.0.28, артефакты за монетки ×2.
 * Вместе с урезанным доходом это возвращает лапкам вес покупок.
 */ __turbopack_context__.s([
    "DEFAULT_PAW",
    ()=>DEFAULT_PAW,
    "PAWS",
    ()=>PAWS,
    "PAW_MAP",
    ()=>PAW_MAP
]);
const PAWS = [
    /* ---------- простые (первые 3) ---------- */ {
        id: 'classic',
        name: 'Рыжая классика',
        desc: 'Родная тёплая лапка куницы. Проверена попкорном!',
        bonusLabel: 'Без бонуса — чистое мастерство',
        price: 0,
        palette: {},
        bonus: {}
    },
    {
        id: 'ember',
        name: 'Уголёк',
        desc: 'Чёрная как смоль, но зёрна чует чуть лучше всех.',
        bonusLabel: 'Радиус подбора +10%',
        price: 1500,
        reqLevel: 1,
        palette: {
            fur: '#3A3432',
            furShade: '#2B2624',
            pad: '#6E5A55',
            beans: '#C9BBB2',
            claw: '#18120F',
            edge: '#0D0B0A'
        },
        bonus: {
            grabR: 1.1
        }
    },
    {
        id: 'snow',
        name: 'Снежка',
        desc: 'Белая пушистика с красными коготками-оберегами.',
        bonusLabel: '25% шанс: мина не отнимет очко',
        price: 3300,
        reqLevel: 3,
        palette: {
            fur: '#F8F2E9',
            furShade: '#E3D6C5',
            pad: '#F5B9AD',
            beans: '#FFEDE6',
            claw: '#E24B3B',
            edge: '#97785F'
        },
        bonus: {
            guard: 0.25
        }
    },
    /* ---------- основные — уже яркие ---------- */ {
        id: 'flame',
        name: 'Огонёк',
        desc: 'Горячая шёрстка подгоняет часы — времени чуть больше.',
        bonusLabel: '+5 секунд к каждому уровню',
        price: 5200,
        reqLevel: 4,
        palette: {
            fur: '#F4552F',
            furShade: '#D8381C',
            pad: '#FFB36B',
            beans: '#FFE0A8',
            claw: '#7A1D08',
            edge: '#8E2410'
        },
        bonus: {
            timePlus: 5
        }
    },
    {
        id: 'lime',
        name: 'Лаймовая',
        desc: 'Яркая, как летний луг. Золото само липнет к шерсти.',
        bonusLabel: 'Золотых зёрен заметно больше',
        price: 8000,
        reqLevel: 5,
        palette: {
            fur: '#7BC447',
            furShade: '#5E9E33',
            pad: '#D9F0A8',
            beans: '#F4FFD6',
            claw: '#2F5D14',
            edge: '#3E7019'
        },
        bonus: {
            goldenAdd: 0.06
        }
    },
    {
        id: 'teal',
        name: 'Бирюзовая',
        desc: 'Прохладный морской окрас. Кукуруза её побаивается.',
        bonusLabel: 'На одну мину меньше в каждой волне',
        price: 11000,
        reqLevel: 6,
        palette: {
            fur: '#2FB8A6',
            furShade: '#1F8F80',
            pad: '#A8EFE3',
            beans: '#E2FFF8',
            claw: '#0F5A50',
            edge: '#136459'
        },
        bonus: {
            cornCut: 1
        }
    },
    {
        id: 'thimble',
        name: 'Напёрсток',
        desc: 'Портновская точность: лапка и юркая, и цепкая, как игла.',
        bonusLabel: 'Радиус +15% и лапка проворнее',
        price: 13000,
        reqLevel: 8,
        palette: {
            fur: '#C9B37E',
            furShade: '#A98F58',
            pad: '#EFE0BC',
            beans: '#FBF3DC',
            claw: '#8A6A30',
            edge: '#6B5322'
        },
        bonus: {
            grabR: 1.15,
            speed: 1.1
        }
    },
    {
        id: 'berry',
        name: 'Малиновая',
        desc: 'Сладкая и шустрая — ягодный заряд бодрости.',
        bonusLabel: 'Радиус +20% и лапка проворнее',
        price: 15000,
        reqLevel: 9,
        palette: {
            fur: '#E23B7A',
            furShade: '#BC2459',
            pad: '#FFA8C8',
            beans: '#FFE2EE',
            claw: '#6E0F31',
            edge: '#7E1240'
        },
        bonus: {
            grabR: 1.2,
            speed: 1.2
        }
    },
    {
        id: 'strawberry',
        name: 'Клубничная',
        desc: 'Спелая ягода в крапинку — мины на неё натыкаются и стесняются.',
        bonusLabel: '35% шанс: мина не отнимет очко',
        price: 19000,
        reqLevel: 10,
        palette: {
            fur: '#F0526A',
            furShade: '#CC3550',
            pad: '#FFC3CE',
            beans: '#FFE8EC',
            claw: '#7C1228',
            edge: '#8E1A32',
            spots: '#FFE8EC'
        },
        bonus: {
            guard: 0.35,
            goldenAdd: 0.03
        }
    },
    {
        id: 'rainbow',
        name: 'Радужная',
        desc: 'Все цвета радуги на трёх пальцах! Носит больше зерна.',
        bonusLabel: 'Вместимость +1 зерно',
        price: 21000,
        reqLevel: 12,
        palette: {
            fur: '#F2B35A',
            furShade: '#D8923C',
            pad: '#FFB1C8',
            beans: '#FFF3D9',
            claw: '#6E3A12',
            edge: '#8A4A14',
            fingers: [
                '#E24B3B',
                '#7BC47F',
                '#4FA8BF',
                '#B48CD9'
            ]
        },
        bonus: {
            carryPlus: 1
        }
    },
    /* ---------- самая дорогая ---------- */ {
        id: 'leopard',
        name: 'Леопардовая',
        desc: 'Королевский зверь: пятнистая роскошь и вся мощь сразу!',
        bonusLabel: '+5 сек · радиус +15% · мин −1 · больше золота',
        price: 30000,
        reqLevel: 15,
        palette: {
            fur: '#E9C46A',
            furShade: '#D1A94E',
            pad: '#F6E3C0',
            beans: '#FFF7E0',
            claw: '#3A2A10',
            edge: '#6B4E1B',
            spots: '#3B2B12'
        },
        bonus: {
            grabR: 1.15,
            timePlus: 5,
            cornCut: 1,
            goldenAdd: 0.04
        }
    },
    {
        id: 'neon',
        name: 'Неоновая',
        desc: 'Светится в темноте кинозала и мелькает быстрее всех!',
        bonusLabel: 'Скорость лапки +40%',
        price: 24000,
        reqLevel: 14,
        palette: {
            fur: '#FF3DA6',
            furShade: '#D91E86',
            pad: '#4FFFF0',
            beans: '#E6FFFB',
            claw: '#7A0F52',
            edge: '#8E135E',
            fingers: [
                '#4FFFF0',
                '#FFE94A',
                '#8C5BFF',
                '#FF5FD0'
            ]
        },
        bonus: {
            speed: 1.4
        }
    },
    {
        id: 'goldenpaw',
        name: 'Золотая лапка',
        desc: 'Легендарный артефакт: золото липнет к ней, как попкорн к маслу!',
        bonusLabel: 'Золота +10% и вместимость +1',
        price: 38000,
        reqLevel: 16,
        palette: {
            fur: '#FFD24A',
            furShade: '#E0AE2C',
            pad: '#FFF0B8',
            beans: '#FFFBEB',
            claw: '#8A6410',
            edge: '#A37813',
            spots: '#FFF0B8'
        },
        bonus: {
            goldenAdd: 0.1,
            carryPlus: 1
        }
    },
    /* ---------- артефакты за монетки 🪙 (выпадают из сундучков и лихорадки) ---------- */ {
        id: 'double',
        name: 'Двойная лапка',
        desc: 'Двурукая лапка-чудо: гребёт шире и уносит больше зерна за раз!',
        bonusLabel: 'Вместимость +1 зерно · радиус +10%',
        price: 39000,
        currency: 'coins',
        reqLevel: 12,
        palette: {
            fur: '#9B6BB3',
            furShade: '#7E4F96',
            pad: '#E7C7F5',
            beans: '#F8ECFF',
            claw: '#4A2A5E',
            edge: '#5E3A72'
        },
        bonus: {
            carryPlus: 1,
            grabR: 1.1
        }
    },
    {
        id: 'ghost',
        name: 'Призрачная шапка',
        desc: 'Полупрозрачная лапка в волшебном колпаке — мины проходят сквозь неё мимо!',
        bonusLabel: '50% шанс: мина не отнимет очко',
        price: 63000,
        currency: 'coins',
        reqLevel: 18,
        palette: {
            fur: '#DCE3F5',
            furShade: '#BCC8E8',
            pad: '#9FB4E8',
            beans: '#F2F6FF',
            claw: '#5A6BA8',
            edge: '#6C7BB0',
            hat: true
        },
        bonus: {
            guard: 0.5
        }
    },
    {
        id: 'magic',
        name: 'Волшебная лапка',
        desc: 'Из меха сыплются звёздочки шлейфом, а золото липнет к ней само!',
        bonusLabel: 'Шлейф звёзд · золота +6% · проворнее',
        price: 90000,
        currency: 'coins',
        reqLevel: 20,
        palette: {
            fur: '#4A5FBF',
            furShade: '#38499A',
            pad: '#FFD86B',
            beans: '#FFF3C4',
            claw: '#1E2A66',
            edge: '#2A3780'
        },
        bonus: {
            stars: true,
            goldenAdd: 0.06,
            speed: 1.15
        }
    },
    /* ---------- сердечная ветка (механика 5 жизней) ---------- */ {
        id: 'heartpaw',
        name: 'Сердоликовая лапка',
        desc: 'Тёплая лапка с сердоликовой подушечкой: любовь котика — лучшая броня. Дарит лишнее сердечко в каждом забеге!',
        bonusLabel: 'Сердечек +1 ❤️ · оберег от мин 15%',
        price: 18000,
        reqLevel: 11,
        palette: {
            fur: '#E86A8A',
            furShade: '#C74E6E',
            pad: '#FFC2D4',
            beans: '#FFE4EC',
            claw: '#8A3350',
            edge: '#A34462',
            spots: '#FFD1DE'
        },
        bonus: {
            heartsPlus: 1,
            guard: 0.15
        }
    },
    {
        id: 'candy',
        name: 'Мурчащая валентинка',
        desc: 'Розовая лапка с карамельными сердечками: мурчет так, что зёрна сами прыгают в ладошку!',
        bonusLabel: 'Сладкий шлейф · проворнее на 5%',
        price: 8200,
        reqLevel: 2,
        palette: {
            fur: '#FF9EBB',
            furShade: '#E87DA0',
            pad: '#FFDCE7',
            beans: '#FFF0F5',
            claw: '#A34A6B',
            edge: '#C25C80'
        },
        bonus: {
            stars: true,
            speed: 1.05
        }
    }
];
const PAW_MAP = Object.fromEntries(_c1 = PAWS.map(_c = (p)=>[
        p.id,
        p
    ]));
_c2 = PAW_MAP;
const DEFAULT_PAW = 'classic';
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "PAW_MAP$Object.fromEntries$PAWS.map");
__turbopack_context__.k.register(_c1, "PAW_MAP$Object.fromEntries");
__turbopack_context__.k.register(_c2, "PAW_MAP");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/perks.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Рогалик-перки «POPCORN PAWS».
 * Между уровнями игрок открывает один из трёх сундучков и получает
 * случайный перк, действующий весь следующий уровень.
 *
 * v0.0.41: перки, ИНВЕРТИРУЮЩИЕ управление (переворот экрана rot180/rot90,
 * зеркало) и режим «нет света» (Ночная смена) УДАЛЕНЫ — игроки их не любят.
 * Вместо них — ступени медленной лапки (сложность с наградой очков) и
 * «Парящая лапка» (мины не срабатывают первые секунды уровня).
 */ __turbopack_context__.s([
    "HOVER_BASE_SECONDS",
    ()=>HOVER_BASE_SECONDS,
    "PERKS",
    ()=>PERKS,
    "PERK_MAP",
    ()=>PERK_MAP,
    "bgPerkFor",
    ()=>bgPerkFor,
    "isHarshCurse",
    ()=>isHarshCurse,
    "perkCanvasFilter",
    ()=>perkCanvasFilter,
    "perkScoreMult",
    ()=>perkScoreMult,
    "quotaFor",
    ()=>quotaFor,
    "rollPerkOffer",
    ()=>rollPerkOffer,
    "transformFor",
    ()=>transformFor
]);
const PERKS = [
    /* ---------- проклятья ---------- */ {
        id: 'grayscale',
        name: 'Чёрно-белое кино',
        desc: 'Мир теряет краски. Ищи попкорн среди серых теней, как в старом фильме!',
        icon: '🎞️',
        curse: true
    },
    {
        id: 'slowpaw',
        name: 'Тяжёлая лапа',
        desc: 'Лапка налила свинца: тянется к цели в два раза медленнее. Награда за терпение — очки ×1.35!',
        icon: '🐾',
        curse: true
    },
    {
        id: 'slowpaw2',
        name: 'Каменная лапа',
        desc: 'Лапка окаменела: тянется к цели втрое медленнее. Сложно, но за то очки ×1.8!',
        icon: '🗿',
        curse: true
    },
    {
        id: 'slowpaw3',
        name: 'Лапа-валун',
        desc: 'Едва ползёт — в 4 раза медленнее. Испытание для мастеров: очки ×2.5!',
        icon: '🪨',
        curse: true
    },
    {
        id: 'smallpaw',
        name: 'Мини-лапка',
        desc: 'Лапка заметно уменьшилась — зачерпнуть зерно можно только вплотную.',
        icon: '🤏',
        curse: true
    },
    {
        id: 'shaky',
        name: 'Нервная лапа',
        desc: 'Лапка подрагивает и дёргается — прицелиться стало трудно.',
        icon: '😵',
        curse: true
    },
    {
        id: 'cornrain',
        name: 'Кукурузный ливень',
        desc: 'Кукурузы-мин падает вдвое больше! Маршрут — только по чистому полу.',
        icon: '🌽',
        curse: true
    },
    {
        id: 'fog',
        name: 'Попкорнный туман',
        desc: 'Поле тонет в тумане: видно только то, что рядом с лапкой.',
        icon: '🌫️',
        curse: true
    },
    {
        id: 'drift',
        name: 'Скользкий пол',
        desc: 'Зёрна катаются по полу в разные стороны — поймай их первыми!',
        icon: '🧊',
        curse: true
    },
    /* ---------- бонусы ---------- */ {
        id: 'hover',
        name: 'Парящая лапка',
        desc: 'Лапка парит над минами: первые 8 секунд уровня мины не взрываются под ней!',
        icon: '🎈',
        curse: false
    },
    {
        id: 'magnet',
        name: 'Магнитная лапа',
        desc: 'Попкорн сам прыгает в лапку, стоит подойти поближе!',
        icon: '🧲',
        curse: false
    },
    {
        id: 'goldenvein',
        name: 'Золотая жила',
        desc: 'Золотых зёрен (+5 очков) стало в разы больше. Греби богатство!',
        icon: '✨',
        curse: false
    },
    {
        id: 'doublepoints',
        name: 'Двойной улов',
        desc: 'Все очки удваиваются! Но и норма попкорна на уровень +30%.',
        icon: '💰',
        curse: false
    },
    {
        id: 'bigpaw',
        name: 'Лапа великана',
        desc: 'Лапка выросла и гребёт разом — зерно летит в неё с большого радиуса.',
        icon: '🐱',
        curse: false
    },
    {
        id: 'timeplus',
        name: 'Кошачьи часы',
        desc: 'Целых 75 секунд на уровень вместо 60. Время — резиновое!',
        icon: '⏱️',
        curse: false
    },
    {
        id: 'shield',
        name: 'Кошачий щит',
        desc: 'Первое попадание в мину за уровень прощается — щит лопается с шипением вместо минуса!',
        icon: '🛡️',
        curse: false
    },
    {
        id: 'secondcup',
        name: 'Двойной стаканчик',
        desc: 'Лапка носит на 2 зерна больше, а сдавать попкорн можно с дальнего подлёта!',
        icon: '🥤',
        curse: false
    },
    {
        id: 'slowmo',
        name: 'Черепаший час',
        desc: 'Таймер тикает на четверть медленнее: по сути, 80 секунд вместо 60!',
        icon: '🐢',
        curse: false
    },
    {
        id: 'milky',
        name: 'Соски-малышки',
        desc: 'Все обычные зёрна заменены на соски 🍼: каждая +40 очков, но и норма подросла на 20%!',
        icon: '🍼',
        curse: false
    },
    {
        id: 'whiteout',
        name: 'Засвет',
        desc: 'Белое пекло: фон выжигает все краски, белые зёрна почти невидимы! +25% очков.',
        icon: '🔆',
        curse: false
    },
    {
        id: 'popcornfall',
        name: 'Попкорнопад',
        desc: 'Весь пол засыпан фоновым попкорном — свои зёрна ищи среди тысяч! +40% очков.',
        icon: '🍿',
        curse: false
    },
    {
        id: 'neon',
        name: 'Неон',
        desc: 'Мир перекрашен в кислотные цвета — ищи зёрна по форме, а не по цвету!',
        icon: '🟣',
        curse: true
    },
    {
        id: 'rainbow',
        name: 'Хамелеон',
        desc: 'Цвета бегут по кругу каждые несколько секунд — глаза разбегаются!',
        icon: '🦎',
        curse: true
    },
    {
        id: 'pigeonfeast',
        name: 'Птичий базар',
        desc: 'Голуби прилетают втрое чаще, но за каждого поверженного — двойные очки!',
        icon: '🕊️',
        curse: true
    }
];
const PERK_MAP = Object.fromEntries(_c1 = PERKS.map(_c = (p)=>[
        p.id,
        p
    ]));
_c2 = PERK_MAP;
/* ============ «злость» перков → адекватные призы сундучков ============ */ /** Жёсткие проклятья: целиком перекрашивают, засыпают или сильно
    замедляют игру — играть с ними труднее всего, поэтому сундучок с таким
    перком обязан компенсировать игрока опытом 🍿 (туман, каменная лапа и т.п.) */ const HARSH_CURSES = [
    'grayscale',
    'slowpaw2',
    'slowpaw3',
    'fog',
    'whiteout',
    'popcornfall',
    'neon',
    'rainbow',
    /* «Птичий базар»: голуби втрое чаще — темп уровня заметно меняется,
     поэтому сундучок с ним тоже обязан компенсировать (раньше перк
     помечался curse, но компенсации не давал — сундук всегда пустовал) */ 'pigeonfeast'
];
function isHarshCurse(id) {
    return HARSH_CURSES.includes(id);
}
function rollPerkOffer(count = 3, force, allow) {
    const pool = allow ? PERKS.filter(allow) : [
        ...PERKS
    ];
    for(let i = pool.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [
            pool[j],
            pool[i]
        ];
    }
    const picked = [];
    if (force && PERK_MAP[force] && (!allow || allow(PERK_MAP[force]))) picked.push(PERK_MAP[force]);
    for (const p of pool){
        if (picked.length >= count) break;
        if (picked.some((q)=>q.id === p.id)) continue;
        picked.push(p);
    }
    return picked;
}
function quotaFor(level, double = false) {
    const q = Math.round(9 + (level - 1) * 3.2);
    return double ? Math.round(q * 1.3) : q;
}
function transformFor(_perk) {
    return 'none';
}
function perkScoreMult(perk) {
    if (perk === 'doublepoints') return 2;
    if (perk === 'slowpaw3') return 2.5;
    if (perk === 'slowpaw2') return 1.8;
    if (perk === 'slowpaw') return 1.35;
    if (perk === 'popcornfall') return 1.4;
    if (perk === 'whiteout') return 1.25;
    return 1;
}
function perkCanvasFilter(perk) {
    if (perk === 'grayscale') return 'grayscale(1) contrast(1.05)';
    if (perk === 'neon') return 'hue-rotate(150deg) saturate(2.2) contrast(1.1)';
    return '';
}
function bgPerkFor(perk) {
    if (perk === 'whiteout' || perk === 'popcornfall') return perk;
    return null;
}
const HOVER_BASE_SECONDS = 8;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "PERK_MAP$Object.fromEntries$PERKS.map");
__turbopack_context__.k.register(_c1, "PERK_MAP$Object.fromEntries");
__turbopack_context__.k.register(_c2, "PERK_MAP");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/pool.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Object Pool — переиспользуемый пул объектов для горячего кода игры.
 *
 * ЗАЧЕМ: во время «Лихорадки» игра создаёт десятки объектов в секунду
 * (частицы монеток, крошки, всплывающие тексты). Каждое `push`/`splice`
 * и каждый объект-литерал — мусор для сборщика GC, а GC-пауза на среднем
 * телефоне = фриз на 30–80 мс прямо посреди экшена.
 *
 * КАК: пул заранее выделяет фиксированное число объектов и держит их в
 * одном массиве. Активная зона — префикс [0..length), «удаление» — это
 * swap-remove за O(1) без splice и без аллокаций. Если пул исчерпан,
 * вырастает на один элемент (бывает редко, дальше живёт в пуле).
 *
 * ПРИМЕР:
 *   const pool = new Pool<Particle>(192, () => ({ x: 0, y: 0, ... }))
 *   const p = pool.obtain()      // «создать» (на деле переиспользовать)
 *   p.x = 10; p.ttl = 0.4        // заполнить поля целиком!
 *   pool.release(i)              // «удалить» по индексу обхода
 *   pool.clear()                 // убрать все разом (новый уровень)
 */ __turbopack_context__.s([
    "Pool",
    ()=>Pool
]);
class Pool {
    /** Внутренний массив: [0..length) — активные, [length..) — свободные */ items;
    active = 0;
    factory;
    constructor(size, factory){
        this.factory = factory;
        this.items = new Array(size);
        for(let i = 0; i < size; i++)this.items[i] = factory();
    }
    /** Сколько объектов сейчас живых */ get length() {
        return this.active;
    }
    /** Взять свободный объект из пула. Поля нужно заполнить целиком! */ obtain() {
        if (this.active >= this.items.length) this.items.push(this.factory());
        return this.items[this.active++];
    }
    /** «Удалить» элемент с индексом i: swap-remove за O(1), без splice */ release(i) {
        const last = --this.active;
        if (i !== last) {
            const tmp = this.items[i];
            this.items[i] = this.items[last];
            this.items[last] = tmp;
        }
    }
    /** Освободить всё сразу (начало уровня/лихорадки) — память остаётся в пуле */ clear() {
        this.active = 0;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/rooms.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Фоны уровней «POPCORN PAWS».
 * 8 локаций в едином 16-битном стиле: кинозал + 7 новых комнат.
 * Уровень N играет в комнате (N-1) % 8 — круг замыкается каждые 8 уровней.
 * Название локации локализуется через i18n: room.<id>.name.
 */ __turbopack_context__.s([
    "ROOMS",
    ()=>ROOMS,
    "roomForLevel",
    ()=>roomForLevel,
    "roomSrcForLevel",
    ()=>roomSrcForLevel
]);
const ROOMS = [
    {
        id: 'cinema',
        src: '/rooms/cinema.webp',
        name: 'Кинозал',
        icon: '🎬'
    },
    {
        id: 'kitchen',
        src: '/rooms/kitchen.webp',
        name: 'Кухня пиццерии',
        icon: '🍕'
    },
    {
        id: 'yard',
        src: '/rooms/yard.webp',
        name: 'Ночной двор',
        icon: '🌙'
    },
    {
        id: 'arcade',
        src: '/rooms/arcade.webp',
        name: 'Аркадный зал',
        icon: '🕹️'
    },
    {
        id: 'roof',
        src: '/rooms/roof.webp',
        name: 'Крыша на закате',
        icon: '🌇'
    },
    {
        id: 'park',
        src: '/rooms/park.webp',
        name: 'Дневной парк',
        icon: '🌳'
    },
    {
        id: 'attic',
        src: '/rooms/attic.webp',
        name: 'Чердак',
        icon: '📦'
    },
    {
        id: 'basement',
        src: '/rooms/basement.webp',
        name: 'Кладовка',
        icon: '🫙'
    }
];
const FALLBACK = ROOMS[0];
function roomForLevel(level) {
    const idx = (Math.max(1, Math.floor(level)) - 1) % ROOMS.length;
    return ROOMS[idx] ?? FALLBACK;
}
function roomSrcForLevel(level) {
    return roomForLevel(level).src;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/settings.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_SETTINGS",
    ()=>DEFAULT_SETTINGS,
    "SETTINGS_EVENT",
    ()=>SETTINGS_EVENT,
    "SETTINGS_KEY",
    ()=>SETTINGS_KEY,
    "loadSettings",
    ()=>loadSettings,
    "parseSettingsRaw",
    ()=>parseSettingsRaw,
    "saveSettings",
    ()=>saveSettings
]);
/**
 * Настройки игрока «POPCORN PAWS».
 * Хранятся в localStorage одним JSON-объектом, применяются
 * к движку (сложность/качество/тряска/вибрация/дальтоник/голубь),
 * к интерфейсу (язык) и к обёртке (яркость/контраст/ориентация).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/i18n.ts [app-client] (ecmascript)");
;
const DEFAULT_SETTINGS = {
    lang: 'ru',
    difficulty: 'normal',
    quality: 'medium',
    orientation: 'auto',
    perksCurse: true,
    perksBonus: true,
    pigeon: true,
    shake: true,
    vibration: true,
    volumeMusic: 1,
    volumeSfx: 1,
    colorblind: false,
    crt: false,
    brightness: 1,
    contrast: 1
};
const SETTINGS_KEY = 'popcorn-settings';
const SETTINGS_EVENT = 'popcorn-settings-update';
;
function clamp(v, min, max, fallback) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}
function parseSettingsRaw(raw) {
    const base = {
        ...DEFAULT_SETTINGS
    };
    try {
        if (!raw) return base;
        const o = JSON.parse(raw);
        return {
            lang: [
                'ru',
                'en',
                'de',
                'es'
            ].includes(o.lang) ? o.lang : base.lang,
            difficulty: [
                'easy',
                'normal',
                'hard'
            ].includes(o.difficulty) ? o.difficulty : 'normal',
            quality: [
                'low',
                'medium',
                'high'
            ].includes(o.quality) ? o.quality : 'medium',
            orientation: [
                'portrait',
                'landscape',
                'auto'
            ].includes(o.orientation) ? o.orientation : 'auto',
            perksCurse: o.perksCurse !== false,
            perksBonus: o.perksBonus !== false,
            pigeon: o.pigeon !== false,
            shake: o.shake !== false,
            vibration: o.vibration !== false,
            volumeMusic: clamp(o.volumeMusic, 0, 1, 1),
            volumeSfx: clamp(o.volumeSfx, 0, 1, 1),
            colorblind: o.colorblind === true,
            crt: o.crt === true,
            brightness: clamp(o.brightness, 0.6, 1.4, 1),
            contrast: clamp(o.contrast, 0.6, 1.6, 1)
        };
    } catch  {
        /* битый JSON — отдаём дефолты */ return base;
    }
}
function loadSettings() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) return parseSettingsRaw(raw);
    // Нет сохранённых настроек — определяем язык интерфейса по браузеру
    return {
        ...parseSettingsRaw(raw ?? ''),
        lang: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectLang"])()
    };
}
function saveSettings(s) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        window.dispatchEvent(new Event(SETTINGS_EVENT));
    } catch  {
    /* переполнение приватного режима — игнорируем */ }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/skill-tree.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TREE_KEY",
    ()=>TREE_KEY,
    "TREE_MAP",
    ()=>TREE_MAP,
    "TREE_NODES",
    ()=>TREE_NODES,
    "TREE_TOTAL_POINTS",
    ()=>TREE_TOTAL_POINTS,
    "ZERO_BONUS",
    ()=>ZERO_BONUS,
    "buyNode",
    ()=>buyNode,
    "canBuy",
    ()=>canBuy,
    "capGain",
    ()=>capGain,
    "mergeBonuses",
    ()=>mergeBonuses,
    "parseTreeRaw",
    ()=>parseTreeRaw,
    "treeBonuses",
    ()=>treeBonuses,
    "treeNodesOpened",
    ()=>treeNodesOpened,
    "treePoints",
    ()=>treePoints,
    "treeSpent",
    ()=>treeSpent
]);
/**
 * Древо улучшений «POPCORN PAWS» — БОЛЬШОЕ ДЕРЕВО.
 *
 *  🌳 Постоянные улучшения в виде дерева-сетки (6 ярусов, 24 узла):
 *
 *     Ярус 1 — корень «Урожай» (+5% к очкам за зёрна, качается до 14 раз);
 *     Ярус 2 — три ветки: «Проворство» (скорость лапки), «Вместимость»
 *              (+1..+10 зерна в лапке) и «Засев» (больше зёрен в волне);
 *     Ярус 3 — по двое детей у каждой ветки:
 *              Ловкость → «Магнит» (радиус подбора) и «Коготки-обереги» (шианс
 *                          игнорировать мину);
 *              Запасы   → «Золотая жила» (шанс золота) и «Монетный дождь»
 *                          (+10% монеток с этапов и сундуков);
 *              Урожай   → «Фарт лихорадки» (шанс внезапной ЛИХОРАДКИ) и
 *                          «Долгая лихорадка» (+1 сек);
 *     Ярус 4 — вершины: «Шахтёр» (−1 мина в волне), «Крепкий нос» (шок от
 *              мины короче), «Комбо-тренер» (комбо растёт быстрее), «Стаж»
 *              (+10% опыта котика), «Щит» (1–4 щита от мин), «Щедрость»
 *              (+25% ценность подарков из сундучков) и «Лёгкое крыло»
 *              (перк «Парящая лапка» держится дольше);
 *     Ярус 5 — сердечная ветка: «Плюшевое сердце» (+1 максимум сердец) и
 *              «Лапка-целитель» (+1 сердце за пройденный уровень сверх обычного);
 *     Ярус 6 — верхушка для ветеранов: «Мега-урожай», «Поле чудес»,
 *              «Сверхмагнит», «Золотопад», «Монетный ливень»,
 *              «Огненный вихрь» и «Сверхпроворство» (ещё быстрее лапка) —
 *              мощные продолжения основных веток.
 *
 *  🎖 Очки древа: по 1 очку за каждый уровень котика (опыт за всё время).
 *    Узел открывается, только если куплен его родитель. Всего в дереве 98 очков
 *    — при новом курсе опыта (10 очков = 1 🍿) полное древо — путь на недели.
 *
 * Хранится в localStorage ('popcorn-tree' → {id: куплено раз}),
 * бродкастит то же событие магазина, что и остальное меню.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$meta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/meta.ts [app-client] (ecmascript)");
;
const TREE_NODES = [
    /* ярус 1 — корень */ {
        id: 'harvest',
        tier: 1,
        reqLevel: 1,
        maxLevel: 14,
        icon: '🍿'
    },
    /* ярус 2 — три ветки */ {
        id: 'swift',
        tier: 2,
        reqLevel: 2,
        maxLevel: 4,
        parent: 'harvest',
        icon: '💨'
    },
    {
        id: 'cap',
        tier: 2,
        reqLevel: 2,
        maxLevel: 4,
        parent: 'harvest',
        icon: '🎒'
    },
    {
        id: 'seeds',
        tier: 2,
        reqLevel: 2,
        maxLevel: 5,
        parent: 'harvest',
        icon: '🧺'
    },
    /* ярус 3 — дети веток */ {
        id: 'magnet',
        tier: 3,
        reqLevel: 4,
        maxLevel: 3,
        parent: 'swift',
        icon: '🧲'
    },
    {
        id: 'guard',
        tier: 3,
        reqLevel: 5,
        maxLevel: 2,
        parent: 'swift',
        icon: '🐾'
    },
    {
        id: 'goldluck',
        tier: 3,
        reqLevel: 4,
        maxLevel: 4,
        parent: 'cap',
        icon: '✨'
    },
    {
        id: 'coins',
        tier: 3,
        reqLevel: 5,
        maxLevel: 5,
        parent: 'cap',
        icon: '🪙'
    },
    {
        id: 'giftluck',
        tier: 3,
        reqLevel: 6,
        maxLevel: 3,
        parent: 'cap',
        icon: '🎁'
    },
    {
        id: 'feverluck',
        tier: 3,
        reqLevel: 4,
        maxLevel: 3,
        parent: 'seeds',
        icon: '🔥'
    },
    {
        id: 'fevertime',
        tier: 3,
        reqLevel: 5,
        maxLevel: 3,
        parent: 'seeds',
        icon: '⏱️'
    },
    /* ярус 4 — вершины */ {
        id: 'miner',
        tier: 4,
        reqLevel: 7,
        maxLevel: 3,
        parent: 'magnet',
        icon: '⛏️'
    },
    {
        id: 'stun',
        tier: 4,
        reqLevel: 8,
        maxLevel: 3,
        parent: 'guard',
        icon: '💪'
    },
    {
        id: 'hoverwing',
        tier: 4,
        reqLevel: 9,
        maxLevel: 3,
        parent: 'guard',
        icon: '🎈'
    },
    {
        id: 'combo',
        tier: 4,
        reqLevel: 7,
        maxLevel: 1,
        parent: 'goldluck',
        icon: '🎯'
    },
    {
        id: 'xpboost',
        tier: 4,
        reqLevel: 8,
        maxLevel: 5,
        parent: 'coins',
        icon: '🎖'
    },
    {
        id: 'shield',
        tier: 4,
        reqLevel: 7,
        maxLevel: 4,
        parent: 'feverluck',
        icon: '🛡️'
    },
    {
        id: 'double',
        tier: 4,
        reqLevel: 8,
        maxLevel: 3,
        parent: 'fevertime',
        icon: '🍀'
    },
    /* ярус 5 — сердечная ветка */ {
        id: 'heartmax',
        tier: 5,
        reqLevel: 10,
        maxLevel: 3,
        parent: 'shield',
        icon: '🧸'
    },
    {
        id: 'healer',
        tier: 5,
        reqLevel: 12,
        maxLevel: 2,
        parent: 'double',
        icon: '💞'
    },
    /* ярус 6 — верхушка для ветеранов */ {
        id: 'biggrain',
        tier: 6,
        reqLevel: 14,
        maxLevel: 4,
        parent: 'harvest',
        icon: '🌰'
    },
    {
        id: 'seeds2',
        tier: 6,
        reqLevel: 14,
        maxLevel: 3,
        parent: 'seeds',
        icon: '🌱'
    },
    {
        id: 'magnet2',
        tier: 6,
        reqLevel: 15,
        maxLevel: 3,
        parent: 'magnet',
        icon: '🌀'
    },
    {
        id: 'goldrain',
        tier: 6,
        reqLevel: 16,
        maxLevel: 3,
        parent: 'goldluck',
        icon: '🌟'
    },
    {
        id: 'coins2',
        tier: 6,
        reqLevel: 17,
        maxLevel: 3,
        parent: 'coins',
        icon: '💰'
    },
    {
        id: 'fevertime2',
        tier: 6,
        reqLevel: 18,
        maxLevel: 2,
        parent: 'fevertime',
        icon: '🌋'
    },
    {
        id: 'swift2',
        tier: 6,
        reqLevel: 16,
        maxLevel: 3,
        parent: 'swift',
        icon: '🌪'
    }
];
const TREE_MAP = Object.fromEntries(_c1 = TREE_NODES.map(_c = (n)=>[
        n.id,
        n
    ]));
_c2 = TREE_MAP;
const TREE_TOTAL_POINTS = TREE_NODES.reduce(_c3 = (s, n)=>s + n.maxLevel, 0);
_c4 = TREE_TOTAL_POINTS;
const TREE_KEY = 'popcorn-tree';
/** Тот же ивент, что у магазина: один стор на всё меню */ const STORE_EVENT = 'popcorn-store-update';
function parseTreeRaw(raw) {
    try {
        const v = JSON.parse(raw ?? '{}');
        if (v && typeof v === 'object') {
            const out = {};
            for (const n of TREE_NODES){
                const val = v[n.id];
                if (typeof val === 'number' && val > 0) {
                    out[n.id] = Math.min(n.maxLevel, Math.floor(val));
                }
            }
            return out;
        }
    } catch  {
    /* пусто */ }
    return {};
}
function treeSpent(state) {
    return TREE_NODES.reduce((s, n)=>s + (state[n.id] ?? 0), 0);
}
function treeNodesOpened(state) {
    return TREE_NODES.reduce((s, n)=>s + ((state[n.id] ?? 0) > 0 ? 1 : 0), 0);
}
function treePoints(totalXp, spent) {
    return Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$meta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["charLevel"])(totalXp) - spent);
}
function canBuy(id, state, totalXp) {
    const def = TREE_MAP[id];
    if ((state[id] ?? 0) >= def.maxLevel) return 'max';
    if (def.parent && (state[def.parent] ?? 0) < 1) return 'root';
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$meta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["charLevel"])(totalXp) < def.reqLevel) return 'level';
    if (treePoints(totalXp, treeSpent(state)) < 1) return 'points';
    return 'ok';
}
function buyNode(id) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const state = parseTreeRaw(window.localStorage.getItem(TREE_KEY));
    if (canBuy(id, state, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$meta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTotalXp"])()) !== 'ok') return null;
    const next = {
        ...state,
        [id]: (state[id] ?? 0) + 1
    };
    try {
        window.localStorage.setItem(TREE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(STORE_EVENT));
    } catch  {
        /* приватный режим — игнорируем */ return null;
    }
    return next;
}
function capGain(level) {
    return level * (level + 1) / 2;
}
const ZERO_BONUS = {
    grainMult01: 0,
    speedAdd: 0,
    carry: 0,
    grains: 0,
    feverLuck: 0,
    giftFreq01: 0,
    hoverPlus: 0,
    shields: 0,
    goldAdd: 0,
    grabR01: 0,
    guardAdd: 0,
    cornCut: 0,
    stunCut: 0,
    feverPlus: 0,
    comboFast: false,
    coinsAdd: 0,
    xpAdd: 0,
    giftAdd: 0,
    heartsMax: 0,
    healPlus: 0,
    timePlus: 0,
    pigeonLate: 0,
    /* Новый блок 0.0.32 — его даёт только магазин апгрейдов */ bigEarly: 0,
    bigLife: 0,
    bigMult01: 0,
    goldCoinPer: 0,
    bossCoins01: 0,
    bossTime: 0,
    flingEase01: 0,
    bossGuard01: 0,
    pigeonStealCut: 0,
    comboStart: 0,
    comboArmor: 0,
    feverMult01: 0,
    scoreCoins01: 0
};
function treeBonuses(state) {
    return {
        /* «Урожай» + «Мега-урожай» (ярус 6): до 14×5% + 4×4% = 86% очков сверху */ grainMult01: 0.05 * (state.harvest ?? 0) + 0.04 * (state.biggrain ?? 0),
        /* «Проворство» + «Сверхпроворство» (ярус 6): до 20% + 18% скорости */ speedAdd: 0.05 * (state.swift ?? 0) + 0.06 * (state.swift2 ?? 0),
        carry: capGain(state.cap ?? 0),
        /* «Засев» + «Поле чудес» (ярус 6): до 10 + 9 = +19 зёрен в волне */ grains: 2 * (state.seeds ?? 0) + 3 * (state.seeds2 ?? 0),
        feverLuck: 0.05 * (state.feverluck ?? 0),
        giftFreq01: 0.12 * (state.giftluck ?? 0),
        hoverPlus: 1.5 * (state.hoverwing ?? 0),
        shields: state.shield ?? 0,
        /* «Золотая жила» + «Золотопад» (ярус 6) */ goldAdd: 0.1 * (state.goldluck ?? 0) + 0.08 * (state.goldrain ?? 0),
        /* «Магнит» + «Сверхмагнит» (ярус 6): до 24% + 30% радиуса */ grabR01: 0.08 * (state.magnet ?? 0) + 0.1 * (state.magnet2 ?? 0),
        guardAdd: 0.15 * (state.guard ?? 0),
        cornCut: state.miner ?? 0,
        stunCut: 0.3 * (state.stun ?? 0),
        /* «Долгая лихорадка» + «Огненный вихрь» (ярус 6): до 3 + 4 = +7 сек */ feverPlus: (state.fevertime ?? 0) + 2 * (state.fevertime2 ?? 0),
        comboFast: (state.combo ?? 0) > 0,
        /* «Монетный дождь» + «Монетный ливень» (ярус 6): до 50% + 45% */ coinsAdd: 0.1 * (state.coins ?? 0) + 0.15 * (state.coins2 ?? 0),
        xpAdd: 0.1 * (state.xpboost ?? 0),
        giftAdd: 0.25 * (state.double ?? 0),
        heartsMax: state.heartmax ?? 0,
        healPlus: state.healer ?? 0,
        /* Само древо эти бонусы не даёт — их приносят постоянные апгрейды
       («Длинный сеанс» и «Кроткий голубь») через mergeBonuses */ timePlus: 0,
        pigeonLate: 0,
        /* Весь блок 0.0.32 — только из магазина апгрейдов, древо тут нулевой */ bigEarly: 0,
        bigLife: 0,
        bigMult01: 0,
        goldCoinPer: 0,
        bossCoins01: 0,
        bossTime: 0,
        flingEase01: 0,
        bossGuard01: 0,
        pigeonStealCut: 0,
        comboStart: 0,
        comboArmor: 0,
        feverMult01: 0,
        scoreCoins01: 0
    };
}
function mergeBonuses(tree, extra) {
    return {
        grainMult01: tree.grainMult01 + (extra.grainMult01 ?? 0),
        speedAdd: tree.speedAdd + (extra.speedAdd ?? 0),
        carry: tree.carry,
        grains: tree.grains + (extra.grains ?? 0),
        feverLuck: tree.feverLuck + (extra.feverLuck ?? 0),
        giftFreq01: tree.giftFreq01 + (extra.giftFreq01 ?? 0),
        hoverPlus: tree.hoverPlus + (extra.hoverPlus ?? 0),
        shields: tree.shields + (extra.shields ?? 0),
        goldAdd: tree.goldAdd + (extra.goldAdd ?? 0),
        grabR01: tree.grabR01 + (extra.grabR01 ?? 0),
        guardAdd: tree.guardAdd,
        cornCut: tree.cornCut + (extra.cornCut ?? 0),
        stunCut: tree.stunCut + (extra.stunCut ?? 0),
        feverPlus: tree.feverPlus + (extra.feverPlus ?? 0),
        comboFast: tree.comboFast || extra.comboFast === true,
        coinsAdd: tree.coinsAdd + (extra.coinsAdd ?? 0),
        xpAdd: tree.xpAdd + (extra.xpAdd ?? 0),
        giftAdd: tree.giftAdd + (extra.giftAdd ?? 0),
        heartsMax: tree.heartsMax,
        healPlus: tree.healPlus,
        timePlus: tree.timePlus + (extra.timePlus ?? 0),
        pigeonLate: tree.pigeonLate + (extra.pigeonLate ?? 0),
        /* v0.0.32: блок больших попкорнин, босса и комбо (постоянные апгрейды) */ bigEarly: tree.bigEarly + (extra.bigEarly ?? 0),
        bigLife: tree.bigLife + (extra.bigLife ?? 0),
        bigMult01: tree.bigMult01 + (extra.bigMult01 ?? 0),
        goldCoinPer: tree.goldCoinPer + (extra.goldCoinPer ?? 0),
        bossCoins01: tree.bossCoins01 + (extra.bossCoins01 ?? 0),
        bossTime: tree.bossTime + (extra.bossTime ?? 0),
        flingEase01: tree.flingEase01 + (extra.flingEase01 ?? 0),
        bossGuard01: tree.bossGuard01 + (extra.bossGuard01 ?? 0),
        pigeonStealCut: tree.pigeonStealCut + (extra.pigeonStealCut ?? 0),
        comboStart: tree.comboStart + (extra.comboStart ?? 0),
        comboArmor: tree.comboArmor + (extra.comboArmor ?? 0),
        feverMult01: tree.feverMult01 + (extra.feverMult01 ?? 0),
        scoreCoins01: tree.scoreCoins01 + (extra.scoreCoins01 ?? 0)
    };
}
;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "TREE_MAP$Object.fromEntries$TREE_NODES.map");
__turbopack_context__.k.register(_c1, "TREE_MAP$Object.fromEntries");
__turbopack_context__.k.register(_c2, "TREE_MAP");
__turbopack_context__.k.register(_c3, "TREE_TOTAL_POINTS$TREE_NODES.reduce");
__turbopack_context__.k.register(_c4, "TREE_TOTAL_POINTS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/sprites.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Процедурные пиксельные спрайты для игры.
 * Каждый спрайт строится на маленькой сетке пикселей и рисуется
 * с imageSmoothingEnabled = false — получается честный 8-битный вид.
 */ __turbopack_context__.s([
    "MINE_VARIANTS",
    ()=>MINE_VARIANTS,
    "PAW_DEFAULT_STYLE",
    ()=>PAW_DEFAULT_STYLE,
    "PAW_STYLE_COUNT",
    ()=>PAW_STYLE_COUNT,
    "drawSprite",
    ()=>drawSprite,
    "easeOutBack",
    ()=>easeOutBack,
    "easeOutQuad",
    ()=>easeOutQuad,
    "makeBigPopcornSprite",
    ()=>makeBigPopcornSprite,
    "makeBossPortraitSprite",
    ()=>makeBossPortraitSprite,
    "makeChestSprite",
    ()=>makeChestSprite,
    "makeCornSprite",
    ()=>makeCornSprite,
    "makeCupSprite",
    ()=>makeCupSprite,
    "makeCutePawSprite",
    ()=>makeCutePawSprite,
    "makeGiftSprite",
    ()=>makeGiftSprite,
    "makeGlowSprite",
    ()=>makeGlowSprite,
    "makeMineSprite",
    ()=>makeMineSprite,
    "makeNippleSprite",
    ()=>makeNippleSprite,
    "makePawSprite",
    ()=>makePawSprite,
    "makePigeonSprite",
    ()=>makePigeonSprite,
    "makePopcornSprite",
    ()=>makePopcornSprite,
    "makeSmoothNippleSprite",
    ()=>makeSmoothNippleSprite,
    "makeSmoothPawSprite",
    ()=>makeSmoothPawSprite,
    "makeSmoothPopcornSprite",
    ()=>makeSmoothPopcornSprite,
    "makeSparkleSprite",
    ()=>makeSparkleSprite
]);
/**
 * Создать канвас для пререндера. Если браузер умеет OffscreenCanvas —
 * используем его: рисование в такой канвас может уходить в фоновый поток,
 * а главное — он не участвует в DOM-компоновке страницы.
 * (Старые Android/iOS спокойно падают обратно на обычный canvas.)
 */ function mkCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
        try {
            return new OffscreenCanvas(w, h);
        } catch  {
        /* очень старый Safari: конструктор есть, а работать не умеет */ }
    }
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
}
function createGrid(cols, rows) {
    return Array.from({
        length: rows
    }, ()=>Array(cols).fill(null));
}
/** Заливает круг цветом (все пиксели) */ function paintCircle(g, cx, cy, r, color) {
    const rows = g.length;
    const cols = g[0].length;
    for(let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++){
        for(let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++){
            if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
            if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) g[y][x] = color;
        }
    }
}
/** Заливает прямоугольник включительно (координаты пиксельные) */ function fillRect(g, x0, y0, x1, y1, color) {
    for(let y = y0; y <= y1; y++){
        for(let x = x0; x <= x1; x++){
            if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = color;
        }
    }
}
/** Кладёт цвет только поверх уже закрашенных пикселей (тень/блик) */ function tintCircle(g, cx, cy, r, color) {
    const rows = g.length;
    const cols = g[0].length;
    for(let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++){
        for(let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++){
            if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
            if (g[y][x] && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) g[y][x] = color;
        }
    }
}
/** Автоматическая пиксельная обводка вокруг силуэта */ function outlineGrid(g, color) {
    const rows = g.length;
    const cols = g[0].length;
    const toOutline = [];
    for(let y = 0; y < rows; y++){
        for(let x = 0; x < cols; x++){
            if (g[y][x]) continue;
            let near = false;
            for(let dy = -1; dy <= 1 && !near; dy++){
                for(let dx = -1; dx <= 1 && !near; dx++){
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && g[ny][nx]) near = true;
                }
            }
            if (near) toOutline.push([
                x,
                y
            ]);
        }
    }
    for (const [x, y] of toOutline)g[y][x] = color;
}
function renderGrid(g) {
    const rows = g.length;
    const cols = g[0].length;
    const canvas = mkCanvas(cols, rows);
    const c = canvas.getContext('2d');
    if (!c) return {
        canvas,
        w: cols,
        h: rows
    };
    c.imageSmoothingEnabled = false;
    for(let y = 0; y < rows; y++){
        for(let x = 0; x < cols; x++){
            const color = g[y][x];
            if (color) {
                c.fillStyle = color;
                c.fillRect(x, y, 1, 1);
            }
        }
    }
    return {
        canvas,
        w: cols,
        h: rows
    };
}
function makeGlowSprite(color = '#FFE066') {
    const S = 48;
    const canvas = mkCanvas(S, S);
    const c = canvas.getContext('2d');
    if (c) {
        const g = c.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
        g.addColorStop(0, color);
        g.addColorStop(0.45, color + '55');
        /* 8-битный hex-alpha: полупрозрачно */ g.addColorStop(1, color + '00');
        c.fillStyle = g;
        c.fillRect(0, 0, S, S);
    }
    return {
        canvas,
        w: S,
        h: S
    };
}
function makePopcornSprite(variant = 'white') {
    const pal = {
        white: {
            body: '#FFFDF4',
            shade: '#F7D97B',
            shine: '#FFF0C9',
            edge: '#B8863B'
        },
        golden: {
            body: '#FFDF6B',
            shade: '#EFB83C',
            shine: '#FFFBEB',
            edge: '#9A6A12'
        },
        caramel: {
            body: '#FFC98A',
            shade: '#D97E2E',
            shine: '#FFE9CB',
            edge: '#9A5615'
        },
        butter: {
            body: '#FFED9C',
            shade: '#F0C235',
            shine: '#FFFBDC',
            edge: '#A87B14'
        }
    }[variant];
    const g = createGrid(14, 14);
    // Пышные «облачка»
    paintCircle(g, 7, 6.4, 3.9, pal.body);
    paintCircle(g, 4.2, 8.6, 2.7, pal.body);
    paintCircle(g, 9.8, 8.6, 2.7, pal.body);
    paintCircle(g, 7, 3.8, 2.6, pal.body);
    // Тень снизу-справа
    tintCircle(g, 9.4, 9.2, 2.7, pal.shade);
    tintCircle(g, 10.2, 5.2, 1.2, pal.shade);
    // Блик сверху-слева
    tintCircle(g, 5, 4.2, 1.6, pal.shine);
    tintCircle(g, 6.6, 7.4, 1.1, pal.shine);
    // Карамелька: поливка-дуга через верхушку
    if (variant === 'caramel') {
        tintCircle(g, 6.5, 2.4, 2.3, '#C8741F');
        tintCircle(g, 4.4, 3.6, 1.1, '#C8741F');
        tintCircle(g, 8.6, 3.6, 1.1, '#C8741F');
    }
    // Масляное: жирный белый блик-капля
    if (variant === 'butter') {
        tintCircle(g, 4.8, 6.6, 1.1, '#FFFFFF');
        tintCircle(g, 9.6, 4.6, 0.9, '#FFFFFF');
    }
    outlineGrid(g, pal.edge);
    return renderGrid(g);
}
function makeCupSprite() {
    const cols = 48;
    const rows = 54;
    const g = createGrid(cols, rows);
    const red = '#E24B3B';
    const redLight = '#F2685A' // блик слева
    ;
    const redDark = '#C43A2A' // тень справа
    ;
    const redCrease = '#D94432' // смятие бумаги
    ;
    const cream = '#FFF6EC';
    const creamDark = '#F0DFC8';
    const rimShadow = '#E3C9B4' // тень под ободком
    ;
    const base = '#C43A2A';
    const baseDark = '#A32E20';
    const edge = '#572014';
    /* Трапеция: ширина 44 сверху → 26 снизу */ const halfSpan = (y)=>{
        const t = y / (rows - 1);
        const w = Math.round(44 - 18 * t);
        const x0 = Math.floor((cols - w) / 2);
        return {
            x0,
            x1: x0 + w - 1
        };
    };
    for(let y = 0; y < rows; y++){
        const { x0, x1 } = halfSpan(y);
        for(let x = x0; x <= x1; x++){
            const rel = (x - x0) / Math.max(1, x1 - x0) // 0 слева → 1 справа
            ;
            let col;
            if (y === 0) {
                col = '#FFFFFF'; // верхняя кромка ободка
            } else if (y <= 3) {
                col = cream; // белый ободок
                if (y === 3 && rel > 0.06 && rel < 0.94) col = rimShadow;
            } else if (y >= rows - 4) {
                col = y >= rows - 2 ? baseDark : base; // тёмное дно
            } else if (y >= 27 && y <= 40) {
                // кремовая лента с логотипом
                col = rel < 0.12 ? redLight : rel > 0.86 ? redDark : cream;
                if (col === cream && rel > 0.78) col = creamDark;
            } else {
                const abs = x - 2;
                const stripe = Math.floor(abs / 7) % 2 === 0;
                col = stripe ? red : cream;
                // объём цилиндра: свет слева, тень справа
                if (rel < 0.12) col = stripe ? redLight : cream;
                else if (rel > 0.84) col = stripe ? redDark : creamDark;
                // сгибы бумаги на верхней половине
                if ((y === 21 || y === 22) && stripe) col = redCrease;
                if ((y === 21 || y === 22) && !stripe) col = creamDark;
                // «открытое горлышко»: тень первых рядов под ободком
                if ((y === 4 || y === 5) && rel > 0.06 && rel < 0.94) {
                    col = stripe ? redDark : rimShadow;
                }
            }
            g[y][x] = col;
        }
    }
    // Логотип: три пухлых попкорн-облачка на ленте
    paintCircle(g, 24, 31.5, 3.4, '#FFFDF4');
    paintCircle(g, 19.2, 34.2, 2.7, '#FFFDF4');
    paintCircle(g, 28.8, 34.2, 2.7, '#FFFDF4');
    tintCircle(g, 26, 33.4, 2.4, '#F7D97B');
    tintCircle(g, 20.6, 35.4, 1.7, '#F7D97B');
    tintCircle(g, 30, 35.4, 1.7, '#F7D97B');
    tintCircle(g, 23.2, 29.8, 1.3, '#FFF3D6');
    outlineGrid(g, edge);
    return renderGrid(g);
}
const PAW_DEFAULT = {
    fur: '#A2673D',
    furShade: '#8A5330',
    pad: '#E89A6B',
    beans: '#F6DCA8',
    claw: '#5C3A1E',
    edge: '#4E2C14'
};
function makePawSprite(pal = {}) {
    const p = {
        ...PAW_DEFAULT,
        ...pal
    };
    const light = p.furLight ?? p.pad;
    const g = createGrid(24, 30);
    // Пушистая рука/запястье снизу (длинное) + клочья меха по бокам
    paintCircle(g, 12, 24.5, 5.6, p.fur);
    paintCircle(g, 12, 27.6, 5.0, p.fur);
    paintCircle(g, 8.4, 22.2, 3.0, p.fur);
    paintCircle(g, 15.6, 22.2, 3.0, p.fur);
    paintCircle(g, 6.6, 25.4, 1.8, p.fur);
    paintCircle(g, 17.4, 25.4, 1.8, p.fur);
    paintCircle(g, 12, 29.4, 3.7, p.fur);
    // Основная пясть
    paintCircle(g, 12, 15.5, 6.0, p.fur);
    // Три пальца
    paintCircle(g, 6.4, 8.2, 3.0, p.fur);
    paintCircle(g, 12, 6.0, 3.2, p.fur);
    paintCircle(g, 17.6, 8.2, 3.0, p.fur);
    // Пушистые перепонки между пальцами и пястью
    paintCircle(g, 8.8, 11.0, 2.3, p.fur);
    paintCircle(g, 15.2, 11.0, 2.3, p.fur);
    // Объём: свет слева-сверху, тень справа
    tintCircle(g, 8.4, 14.2, 2.6, light);
    tintCircle(g, 10.4, 8.6, 1.6, light);
    tintCircle(g, 15.0, 18.2, 3.6, p.furShade);
    tintCircle(g, 13.8, 25.4, 3.2, p.furShade);
    tintCircle(g, 19.0, 10.6, 1.6, p.furShade);
    // Складка меха между пальцами
    tintCircle(g, 8.8, 12.4, 1.0, p.furShade);
    tintCircle(g, 15.2, 12.4, 1.0, p.furShade);
    // Коготки с белыми бликами
    paintCircle(g, 6.4, 4.4, 1.15, p.claw);
    paintCircle(g, 12, 2.4, 1.2, p.claw);
    paintCircle(g, 17.6, 4.4, 1.15, p.claw);
    tintCircle(g, 6.0, 4.0, 0.5, '#FFF6EC');
    tintCircle(g, 11.6, 2.0, 0.5, '#FFF6EC');
    tintCircle(g, 17.2, 4.0, 0.5, '#FFF6EC');
    // Подушечка и «бобышки» + микро-тени под ними
    paintCircle(g, 12, 16.4, 3.8, p.pad);
    tintCircle(g, 13.4, 18.2, 2.0, p.furShade);
    paintCircle(g, 6.6, 8.0, 1.5, p.beans);
    paintCircle(g, 12, 5.8, 1.6, p.beans);
    paintCircle(g, 17.4, 8.0, 1.5, p.beans);
    tintCircle(g, 7.3, 8.7, 0.8, p.furShade);
    tintCircle(g, 12.8, 6.5, 0.85, p.furShade);
    tintCircle(g, 18.1, 8.7, 0.8, p.furShade);
    // Пятнистый окрас (леопард) — только по уже закрашенной шерсти
    if (p.spots) {
        const dots = [
            [
                8.0,
                12.6,
                1.25
            ],
            [
                15.8,
                15.6,
                1.3
            ],
            [
                9.6,
                21.4,
                1.1
            ],
            [
                14.6,
                20.8,
                1.1
            ],
            [
                12.0,
                10.6,
                0.9
            ],
            [
                16.4,
                25.6,
                1.1
            ],
            [
                7.6,
                17.0,
                1.0
            ]
        ];
        for (const [dx, dy, dr] of dots)tintCircle(g, dx, dy, dr, p.spots);
    }
    // Радужные пальцы — перекрашиваем поверх и возвращаем «бобышки»
    if (p.fingers) {
        paintCircle(g, 6.4, 8.2, 3.0, p.fingers[0]);
        paintCircle(g, 12, 6.0, 3.2, p.fingers[1]);
        paintCircle(g, 17.6, 8.2, 3.0, p.fingers[2]);
        paintCircle(g, 6.6, 8.0, 1.5, p.beans);
        paintCircle(g, 12, 5.8, 1.6, p.beans);
        paintCircle(g, 17.4, 8.0, 1.5, p.beans);
    }
    // Волшебный колпак (призрачная шапка): острый треугольник с кантами
    if (p.hat) {
        const hatMain = '#8AA0D8';
        const hatDark = '#66739F';
        fillRect(g, 11, 0, 13, 0, hatDark); // острая верхушка
        fillRect(g, 10, 1, 14, 1, hatMain);
        fillRect(g, 9, 2, 15, 2, hatMain);
        fillRect(g, 8, 3, 16, 3, hatDark);
        fillRect(g, 7, 4, 17, 4, hatMain); // поля
        fillRect(g, 7, 5, 17, 5, hatDark); // кант
        g[1][12] = '#F2F6FF'; // блик
    }
    outlineGrid(g, p.edge);
    return renderGrid(g);
}
function makeCornSprite(colorblind = false) {
    const g = createGrid(14, 14);
    // Обычный режим: красная мина. Режим дальтоников: сине-оранжевая
    // палитра — красный-зелёный контраст заменён на сине-жёлтый
    const body = colorblind ? '#3D7BFF' : '#E5342E' // яркий сигнал опасности
    ;
    const dark = colorblind ? '#274F99' : '#9E1512' // тёмная тень
    ;
    const spike = colorblind ? '#12275C' : '#570606' // шипы
    ;
    const white = '#FFF6EC';
    const edge = colorblind ? '#0A1540' : '#3A0303' // тёмная обводка
    ;
    // Шипы: 4 по сторонам света + 4 по диагоналям — классическая морская мина
    fillRect(g, 6, 0, 7, 1, spike); // верх
    fillRect(g, 6, 12, 7, 13, spike); // низ
    fillRect(g, 0, 6, 1, 7, spike); // лево
    fillRect(g, 12, 6, 13, 7, spike); // право
    g[1][2] = spike;
    g[2][1] = spike;
    g[1][11] = spike;
    g[2][12] = spike;
    g[12][2] = spike;
    g[11][1] = spike;
    g[11][12] = spike;
    g[12][11] = spike;
    // Круглый корпус
    paintCircle(g, 6.5, 6.5, 4.7, body);
    // Тень снизу-справа
    tintCircle(g, 8.4, 8.4, 3.4, dark);
    // Блик сверху-слева
    tintCircle(g, 4.4, 4.0, 1.4, white);
    // Злые глаза: белки с косым разрезом и тёмными зрачками
    g[5][4] = white;
    g[5][5] = white;
    g[6][4] = white;
    g[6][5] = dark; // зрачок косо вниз-внутрь
    g[5][9] = white;
    g[5][8] = white;
    g[6][9] = white;
    g[6][8] = dark;
    // Сердитые брови
    g[4][3] = dark;
    g[4][4] = dark;
    g[4][9] = dark;
    g[4][10] = dark;
    // Оскал с опущенными уголками
    fillRect(g, 4, 9, 9, 9, dark);
    g[8][3] = dark;
    g[8][10] = dark;
    outlineGrid(g, edge);
    return renderGrid(g);
}
function makeChestSprite(open = false) {
    const g = createGrid(18, 17);
    const wood = '#B07A3F';
    const woodLight = '#C98F4F';
    const woodDark = '#8A5330';
    const band = '#6B421F';
    const gold = '#FFE066';
    const goldPale = '#FFF7C2';
    const goldDark = '#D99A1B';
    const edge = '#4A2A12';
    if (!open) {
        // Крышка (полукруглая сверху)
        fillRect(g, 4, 1, 13, 1, woodDark);
        fillRect(g, 3, 2, 14, 2, wood);
        fillRect(g, 2, 3, 15, 5, wood);
        fillRect(g, 2, 6, 15, 6, woodDark); // стык крышки
        // Корпус
        fillRect(g, 1, 7, 16, 15, wood);
        fillRect(g, 1, 7, 16, 8, woodLight); // блик сверху корпуса
        // Металлические полосы по краям
        fillRect(g, 2, 7, 3, 15, band);
        fillRect(g, 14, 7, 15, 15, band);
        // Замок по центру
        fillRect(g, 8, 7, 9, 11, gold);
        g[9][8] = edge;
        g[9][9] = edge;
        g[10][8] = goldDark;
        g[10][9] = goldDark;
    } else {
        // Открытая крышка, откинутая назад
        fillRect(g, 3, 0, 14, 0, woodDark);
        fillRect(g, 2, 1, 15, 2, wood);
        // Светящееся нутро
        fillRect(g, 2, 3, 15, 5, gold);
        fillRect(g, 4, 3, 7, 4, goldPale);
        g[3][10] = goldPale;
        g[5][12] = goldPale;
        g[5][5] = goldDark;
        // Корпус
        fillRect(g, 1, 6, 16, 15, wood);
        fillRect(g, 1, 6, 16, 7, woodLight);
        fillRect(g, 2, 6, 3, 15, band);
        fillRect(g, 14, 6, 15, 15, band);
        // Передняя накладка замка
        fillRect(g, 8, 6, 9, 9, gold);
        g[8][8] = goldDark;
        g[8][9] = goldDark;
    }
    outlineGrid(g, edge);
    return renderGrid(g);
}
function makeGiftSprite() {
    const g = createGrid(14, 15);
    const box = '#E23B3B' // красный корпус
    ;
    const boxLight = '#F26B5E' // блик слева
    ;
    const boxDark = '#A82626' // тень справа
    ;
    const ribbon = '#FFE066' // жёлтая лента
    ;
    const ribbonDark = '#D99A1B';
    const bow = '#FFC93C' // бант
    ;
    const bowLight = '#FFE9A0';
    const edge = '#5A1A12';
    // Бант: два «уха» и узелок
    paintCircle(g, 4.2, 2.4, 2.0, bow);
    paintCircle(g, 9.8, 2.4, 2.0, bow);
    tintCircle(g, 3.4, 1.8, 0.9, bowLight);
    tintCircle(g, 9.0, 1.8, 0.9, bowLight);
    fillRect(g, 6, 3, 7, 4, ribbonDark); // узелок
    // Корпус коробки
    fillRect(g, 2, 5, 11, 13, box);
    fillRect(g, 2, 5, 4, 13, boxLight); // блик слева
    fillRect(g, 10, 5, 11, 13, boxDark); // тень справа
    // Лента крестом
    fillRect(g, 6, 5, 7, 13, ribbon);
    fillRect(g, 2, 8, 11, 9, ribbon);
    // Вертикальная лента продолжается вверх к банту
    fillRect(g, 6, 3, 7, 4, ribbon);
    outlineGrid(g, edge);
    return renderGrid(g);
}
function makeBossPortraitSprite(kind) {
    if (kind === 'kid') return makeBossKidPortrait();
    if (kind === 'marten') return makeBossMartenPortrait();
    if (kind === 'pigeon') return makeBossPigeonPortrait();
    if (kind === 'gypsy') return makeBossGypsyPortrait();
    return makeBossLionPortrait();
}
/** МАЛЫШ: розовая морда младенца, хитрая брови, соска во рту */ function makeBossKidPortrait() {
    const g = createGrid(18, 18);
    const skin = '#F8C9A0';
    const edge = '#7A4526';
    // Круглая голова + хохолок
    paintCircle(g, 9, 9.6, 7.0, skin);
    paintCircle(g, 9, 2.6, 1.7, '#B4652F');
    tintCircle(g, 8.2, 2.2, 0.8, '#D98F52');
    // Сердитые брови: наружные концы выше, внутренние ниже
    g[6][4] = '#5A3A1F';
    g[6][5] = '#5A3A1F';
    g[7][6] = '#5A3A1F';
    g[8][7] = '#5A3A1F';
    g[6][13] = '#5A3A1F';
    g[6][12] = '#5A3A1F';
    g[7][11] = '#5A3A1F';
    g[8][10] = '#5A3A1F';
    // Глаза
    paintCircle(g, 6, 10.4, 1.9, '#FFFDF4');
    paintCircle(g, 12, 10.4, 1.9, '#FFFDF4');
    tintCircle(g, 6.2, 10.6, 1.0, '#3A2414');
    tintCircle(g, 11.8, 10.6, 1.0, '#3A2414');
    // Румяные щёки
    tintCircle(g, 3.6, 12.4, 1.7, '#F5A66B');
    tintCircle(g, 14.4, 12.4, 1.7, '#F5A66B');
    // Соска: розовое кольцо с белым наконечником
    paintCircle(g, 9, 13.9, 2.5, '#FF8FB8');
    paintCircle(g, 9, 13.9, 1.3, '#FFFDF4');
    tintCircle(g, 10.6, 15.0, 1.1, '#D96A96');
    outlineGrid(g, edge);
    return renderGrid(g);
}
/** ЛАНА: рыже-бурая морда куницы, тёмная маска вора, хитрый прищур */ function makeBossMartenPortrait() {
    const g = createGrid(18, 18);
    const edge = '#4A2A12';
    // Уши
    paintCircle(g, 4.6, 3.8, 1.9, '#A85F28');
    paintCircle(g, 13.4, 3.8, 1.9, '#A85F28');
    tintCircle(g, 4.6, 3.9, 0.9, '#F5E3C4');
    tintCircle(g, 13.4, 3.9, 0.9, '#F5E3C4');
    // Голова
    paintCircle(g, 9, 10.2, 6.7, '#C97A3A');
    // Тёмная воровская маска через глаза
    fillRect(g, 3, 7, 6, 9, '#6B421F');
    fillRect(g, 11, 7, 14, 9, '#6B421F');
    fillRect(g, 3, 6, 6, 6, '#8A5330');
    fillRect(g, 11, 6, 14, 6, '#8A5330');
    // Хитрые жёлтые глаза
    paintCircle(g, 5.5, 8.4, 1.4, '#FFD24A');
    paintCircle(g, 12.5, 8.4, 1.4, '#FFD24A');
    tintCircle(g, 5.7, 8.6, 0.7, '#3A2414');
    tintCircle(g, 12.3, 8.6, 0.7, '#3A2414');
    // Кремовая мордочка + нос
    paintCircle(g, 9, 13.4, 3.4, '#F5E3C4');
    paintCircle(g, 9, 11.8, 0.9, '#3A2414');
    g[14][9] = '#B98A5E';
    outlineGrid(g, edge);
    return renderGrid(g);
}
/** МЕГА-ГОЛУБЬ: сизая голова, БОЛЬШИЕ глаза с красной радужкой (слабое место!) */ function makeBossPigeonPortrait() {
    const g = createGrid(18, 18);
    const edge = '#3E4A5C';
    // Хохолок
    paintCircle(g, 9, 2.8, 1.7, '#7E8CA0');
    // Голова
    paintCircle(g, 9, 10, 6.9, '#9AA7B8');
    tintCircle(g, 5, 13.5, 2.0, '#B8C4D4'); // блик щеки
    // Сердитые брови над глазами
    fillRect(g, 3, 4, 7, 5, '#5C6B7E');
    fillRect(g, 10, 4, 14, 5, '#5C6B7E');
    // ДВА глаза с красной радужкой — единственная уязвимость
    paintCircle(g, 5.8, 8.3, 2.5, '#FFFDF4');
    paintCircle(g, 12.2, 8.3, 2.5, '#FFFDF4');
    tintCircle(g, 5.8, 8.4, 1.5, '#E2543B');
    tintCircle(g, 12.2, 8.4, 1.5, '#E2543B');
    tintCircle(g, 5.8, 8.4, 0.6, '#2E2418');
    tintCircle(g, 12.2, 8.4, 0.6, '#2E2418');
    // Клюв: верх + тёмная нижняя половина
    fillRect(g, 7, 12, 10, 13, '#F09A3E');
    fillRect(g, 6, 14, 11, 14, '#D9822A');
    g[15][8] = '#D9822A';
    g[15][9] = '#D9822A';
    outlineGrid(g, edge);
    return renderGrid(g);
}
/** ЦЫГАНСКАЯ РУКА: раскрытая ладонь с золотыми кольцами и браслетом */ function makeBossGypsyPortrait() {
    const g = createGrid(18, 18);
    const skin = '#F8C9A0';
    const edge = '#7A4526';
    // Ладонь
    paintCircle(g, 8.8, 12.2, 4.3, skin);
    fillRect(g, 5, 9, 12, 15, skin);
    // Большой палец сбоку
    paintCircle(g, 13.6, 11.2, 1.9, skin);
    // Четыре пальца: средний выше всех, мизинец короче
    fillRect(g, 4, 5, 6, 10, skin);
    paintCircle(g, 5, 4.4, 1.1, skin);
    fillRect(g, 7, 3, 8, 9, skin);
    paintCircle(g, 7.8, 2.6, 1.1, skin);
    fillRect(g, 10, 4, 11, 10, skin);
    paintCircle(g, 10.6, 3.8, 1.1, skin);
    fillRect(g, 12, 6, 13, 11, skin);
    paintCircle(g, 12.6, 5.6, 1.0, skin);
    // Золотые кольца: с камнем на среднем, простые на соседних
    fillRect(g, 7, 7, 8, 7, '#FFE066');
    fillRect(g, 7, 8, 8, 8, '#D99A1B');
    paintCircle(g, 7.9, 6.2, 1.2, '#FFE066');
    paintCircle(g, 7.9, 6.2, 0.7, '#E2543B');
    fillRect(g, 4, 7, 5, 7, '#FFE066');
    fillRect(g, 4, 8, 5, 8, '#D99A1B');
    fillRect(g, 10, 8, 11, 8, '#FFE066');
    fillRect(g, 10, 9, 11, 9, '#D99A1B');
    // Браслет у запястья
    fillRect(g, 4, 15, 13, 15, '#FFE066');
    fillRect(g, 4, 16, 13, 16, '#D99A1B');
    outlineGrid(g, edge);
    return renderGrid(g);
}
/** ЛЕВ (в запасе): грива-щит вокруг царской морды */ function makeBossLionPortrait() {
    const g = createGrid(18, 18);
    const edge = '#7A4526';
    // Грива: внешний круг темнее + внутренний ярче
    paintCircle(g, 9, 9.4, 8.0, '#D97A2E');
    paintCircle(g, 9, 9.4, 6.4, '#E89A3C');
    // Морда
    paintCircle(g, 9, 9.9, 5.1, '#F8C980');
    // Глаза + сердитые брови
    fillRect(g, 4, 5, 6, 5, '#8A4A2E');
    fillRect(g, 11, 5, 13, 5, '#8A4A2E');
    paintCircle(g, 6.4, 7.6, 1.2, '#3A2414');
    paintCircle(g, 11.6, 7.6, 1.2, '#3A2414');
    // Мордочка: нос-треугольник и усы
    paintCircle(g, 9, 12.6, 3.0, '#FFF3D6');
    fillRect(g, 8, 10, 10, 11, '#8A4A2E');
    fillRect(g, 8, 12, 10, 12, '#C98F6A');
    g[13][4] = '#8A4A2E';
    g[13][13] = '#8A4A2E';
    outlineGrid(g, edge);
    return renderGrid(g);
}
function makeNippleSprite() {
    const g = createGrid(14, 14);
    const ring = '#FF8FB8' // розовое кольцо
    ;
    const ringDark = '#D96A96';
    const ringLight = '#FFC2D9';
    const knob = '#FFFDF4' // белый наконечник
    ;
    const knobShade = '#F0DFC8';
    const edge = '#8A4A5E';
    // Кольцо-держатель: широкая «бублик»-дуга снизу
    paintCircle(g, 7, 9.4, 4.4, ring);
    paintCircle(g, 7, 9.0, 2.1, '#FCEFF2'); // дырка бублика
    tintCircle(g, 9.6, 11.4, 2.2, ringDark);
    tintCircle(g, 4.6, 7.2, 1.6, ringLight);
    // Наконечник: белый овал сверху, чуть смещён вверх
    paintCircle(g, 7, 4.6, 3.3, knob);
    tintCircle(g, 5.6, 3.4, 1.5, '#FFFFFF');
    tintCircle(g, 8.6, 6.0, 1.8, knobShade);
    outlineGrid(g, edge);
    return renderGrid(g);
}
function makeSparkleSprite() {
    const g = createGrid(7, 7);
    const bright = '#FFFFFF';
    const gold = '#FFE066';
    for(let i = 0; i < 7; i++){
        g[3][i] = i === 3 ? bright : gold;
        g[i][3] = i === 3 ? bright : gold;
    }
    g[2][2] = gold;
    g[4][2] = gold;
    g[2][4] = gold;
    g[4][4] = gold;
    return renderGrid(g);
}
function makePigeonSprite(flap = false) {
    const g = createGrid(18, 15);
    const body = '#8E9AA6';
    const dark = '#5F6B76';
    const belly = '#E8E4DC';
    const beak = '#F2A24B';
    const eye = '#22150C';
    const wing = '#77828D';
    const neck = '#6FA08A';
    // Хвост
    fillRect(g, 14, 8, 17, 10, dark);
    // Крыло (за телом): вверх при взмахе, вниз в исходном
    if (flap) {
        paintCircle(g, 11, 3.4, 2.9, wing);
        tintCircle(g, 12.6, 2.6, 1.6, body);
    } else {
        paintCircle(g, 11, 11.2, 2.7, wing);
        tintCircle(g, 12.8, 12.0, 1.5, body);
    }
    // Тело
    paintCircle(g, 10, 8.5, 4.2, body);
    // Светлое брюшко
    tintCircle(g, 8.4, 10.4, 2.5, belly);
    // Голова
    paintCircle(g, 4.6, 5.4, 2.5, dark);
    // Зелёный отлив на шее
    tintCircle(g, 6.6, 7.2, 1.2, neck);
    // Клюв
    fillRect(g, 1, 5, 3, 6, beak);
    // Глаз
    g[5][4] = eye;
    outlineGrid(g, '#3A424B');
    return renderGrid(g);
}
/* ================= ГЛАДКАЯ ВЕКТОРНАЯ ОТРИСОВКА (supersampling) =================
   Игрок просил убрать видимую пиксельность и угловатость у лапки, зёрен
   и мин. Решение: те же силуэты и логические размеры (вся игровая
   математика — хитбоксы, радиусы подбора — не меняется), но арт строится
   векторно на канвасе 4×–6× логического размера и выводится вниз со
   сглаживанием: кривые Безье, радиальные градиенты, мягкий объём. */ /** Путь-силуэт из кругов (union — перекрытия не создают швов) */ function circlesPath(list, k, inflate = 0) {
    const p = new Path2D();
    for (const [x, y, r] of list){
        const rr = (r + inflate) * k;
        p.moveTo(x * k + rr, y * k);
        p.arc(x * k, y * k, rr, 0, Math.PI * 2);
    }
    return p;
}
/** Радиальный градиент с мягким затуханием (для света/тени внутри клипа) */ function softSpot(c, x, y, r, color) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, color.slice(0, 7) + '00');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
}
function makeSmoothPopcornSprite(variant = 'white') {
    const S = 56;
    const k = S / 14;
    const canvas = mkCanvas(S, S);
    const c = canvas.getContext('2d');
    if (!c) return {
        canvas,
        w: 14,
        h: 14,
        smooth: true
    };
    const pal = {
        white: {
            body: '#FFFDF4',
            shade: '#F7D97B',
            shine: '#FFF0C9',
            edge: '#B8863B'
        },
        golden: {
            body: '#FFDF6B',
            shade: '#EFB83C',
            shine: '#FFFBEB',
            edge: '#9A6A12'
        },
        caramel: {
            body: '#FFC98A',
            shade: '#D97E2E',
            shine: '#FFE9CB',
            edge: '#9A5615'
        },
        butter: {
            body: '#FFED9C',
            shade: '#F0C235',
            shine: '#FFFBDC',
            edge: '#A87B14'
        }
    }[variant];
    const blobs = [
        [
            7,
            6.4,
            3.9
        ],
        [
            4.2,
            8.6,
            2.7
        ],
        [
            9.8,
            8.6,
            2.7
        ],
        [
            7,
            3.8,
            2.6
        ]
    ];
    /* Обводка-силуэт: каждый круг чуть шире тёмным, поверх — основная заливка */ c.fillStyle = pal.edge;
    c.fill(circlesPath(blobs, k, 0.55));
    c.fillStyle = pal.body;
    const body = circlesPath(blobs, k);
    c.fill(body);
    /* Объём: свет сверху-слева, тень снизу-справа — мягкие пятна в клипе */ c.save();
    c.clip(body);
    softSpot(c, 10.6, 10.6, 5.4 * k, pal.shade + 'B4');
    softSpot(c, 4.9, 4.5, 3.4 * k, pal.shine + 'F0');
    softSpot(c, 6.6, 7.8, 1.6 * k, pal.shine + 'C0');
    if (variant === 'golden') softSpot(c, 8.6, 4.4, 1.8 * k, '#FFFBEB' + 'D0');
    /* Складки-«пушинки»: пара дуг, чтобы облако не было стерильным */ c.strokeStyle = 'rgba(120, 70, 10, 0.10)';
    c.lineWidth = 0.5 * k;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(7 * k, 7.2 * k, 4.4 * k, Math.PI * 0.35, Math.PI * 0.75);
    c.stroke();
    c.beginPath();
    c.arc(5.4 * k, 6 * k, 2.2 * k, Math.PI * 0.9, Math.PI * 1.5);
    c.stroke();
    /* Карамельная поливка: волнистая дуга через верх + капли */ if (variant === 'caramel') {
        c.strokeStyle = '#C8741F';
        c.lineWidth = 1.55 * k;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(3.4 * k, 5.2 * k);
        c.bezierCurveTo(5 * k, 1.6 * k, 9 * k, 1.6 * k, 10.6 * k, 5.2 * k);
        c.stroke();
        c.lineWidth = 1.1 * k;
        c.beginPath();
        c.moveTo(5.6 * k, 4.6 * k);
        c.lineTo(5.6 * k, 6.2 * k);
        c.moveTo(8.6 * k, 4.6 * k);
        c.lineTo(8.6 * k, 5.8 * k);
        c.stroke();
    }
    /* Масляное: жирные белые капли */ if (variant === 'butter') {
        c.fillStyle = '#FFFFFF';
        c.beginPath();
        c.ellipse(4.9 * k, 6.8 * k, 1.25 * k, 0.85 * k, -0.5, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(9.7 * k, 4.7 * k, 0.95 * k, 0.65 * k, 0.4, 0, Math.PI * 2);
        c.fill();
    }
    c.restore();
    return {
        canvas,
        w: 14,
        h: 14,
        smooth: true
    };
}
const BIG_PALETTES = {
    /* карамельно-золотая классика */ caramel: {
        body: '#FFD98A',
        shade: '#E39B36',
        shine: '#FFF6DC',
        edge: '#A06514',
        drizzle: '#D88A22'
    },
    /* вишнёвая глазурь: тёплый красный с ягодным отливом */ cherry: {
        body: '#FF8A78',
        shade: '#D0422E',
        shine: '#FFDCD2',
        edge: '#8C1F16',
        drizzle: '#A8261A'
    },
    /* виноградная глазурь: насыщенный фиолет с сиреневыми бликами */ grape: {
        body: '#C9A0F0',
        shade: '#8A5CC8',
        shine: '#F0DCFF',
        edge: '#52307E',
        drizzle: '#6A3FA0'
    }
};
/** Спрайты кэшируются: сортов три, каждая 96×96 — строится один раз */ const bigSpriteCache = {};
function makeBigPopcornSprite(kind = 'caramel') {
    const hit = bigSpriteCache[kind];
    if (hit) return hit;
    const pal = BIG_PALETTES[kind];
    const S = 96;
    const k = S / 30;
    const canvas = mkCanvas(S, S);
    const c = canvas.getContext('2d');
    if (!c) return {
        canvas,
        w: 30,
        h: 30,
        smooth: true
    };
    /* Шесть пузырей: пухлое облако-кластер, заметно крупнее любого зерна */ const blobs = [
        [
            15,
            12.6,
            7.6
        ],
        [
            8.4,
            17.2,
            5.4
        ],
        [
            21.6,
            17.2,
            5.4
        ],
        [
            15,
            6.9,
            4.9
        ],
        [
            5.9,
            11.8,
            4.1
        ],
        [
            24.1,
            11.8,
            4.1
        ],
        [
            11.5,
            21.3,
            4.3
        ],
        [
            18.5,
            21.3,
            4.3
        ]
    ];
    /* Силуэт: чуть шире тёмным, поверх — основная заливка */ c.fillStyle = pal.edge;
    c.fill(circlesPath(blobs, k, 0.6));
    c.fillStyle = pal.body;
    const body = circlesPath(blobs, k);
    c.fill(body);
    /* Объём внутри клипа: тень снизу, блики сверху-слева, карамельная поливка */ c.save();
    c.clip(body);
    softSpot(c, 19, 21, 13 * k, pal.shade + 'B0');
    softSpot(c, 9.5, 7.5, 8.5 * k, pal.shine + 'F0');
    softSpot(c, 16.5, 11, 4 * k, pal.shine + 'C8');
    softSpot(c, 6.5, 15.5, 2.6 * k, '#FFFBEB' + 'D0');
    /* Складки-«пушинки», чтобы облако не было стерильным */ c.strokeStyle = 'rgba(120, 70, 10, 0.12)';
    c.lineWidth = 0.7 * k;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(15 * k, 14 * k, 9.6 * k, Math.PI * 0.3, Math.PI * 0.72);
    c.stroke();
    c.beginPath();
    c.arc(10.5 * k, 12 * k, 4.6 * k, Math.PI * 0.85, Math.PI * 1.5);
    c.stroke();
    c.beginPath();
    c.arc(20 * k, 13.5 * k, 3.8 * k, Math.PI * 1.1, Math.PI * 1.8);
    c.stroke();
    /* Поливка сорта: волна через верх + капли */ c.strokeStyle = pal.drizzle;
    c.lineWidth = 1.7 * k;
    c.beginPath();
    c.moveTo(6.2 * k, 10.4 * k);
    c.bezierCurveTo(9 * k, 3.4 * k, 21 * k, 3.4 * k, 23.8 * k, 10.4 * k);
    c.stroke();
    c.lineWidth = 1.15 * k;
    c.beginPath();
    c.moveTo(10.8 * k, 9.2 * k);
    c.lineTo(10.8 * k, 12.4 * k);
    c.moveTo(15 * k, 8.2 * k);
    c.lineTo(15 * k, 10.6 * k);
    c.moveTo(19.2 * k, 9.2 * k);
    c.lineTo(19.2 * k, 12 * k);
    c.stroke();
    /* Пара вшитых блёсток-звёздочек */ c.strokeStyle = '#FFFFFF';
    c.lineWidth = 0.55 * k;
    c.beginPath();
    c.moveTo(8.6 * k, 6.6 * k);
    c.lineTo(8.6 * k, 9.4 * k);
    c.moveTo(7.2 * k, 8 * k);
    c.lineTo(10 * k, 8 * k);
    c.stroke();
    c.globalAlpha = 0.8;
    c.beginPath();
    c.moveTo(21.4 * k, 6.2 * k);
    c.lineTo(21.4 * k, 8.4 * k);
    c.moveTo(20.3 * k, 7.3 * k);
    c.lineTo(22.5 * k, 7.3 * k);
    c.stroke();
    c.restore();
    const out = {
        canvas,
        w: 30,
        h: 30,
        smooth: true
    };
    bigSpriteCache[kind] = out;
    return out;
}
function makeSmoothNippleSprite() {
    const S = 56;
    const k = S / 14;
    const canvas = mkCanvas(S, S);
    const c = canvas.getContext('2d');
    if (!c) return {
        canvas,
        w: 14,
        h: 14,
        smooth: true
    };
    const ring = '#FF8FB8';
    const ringLight = '#FFC2D9';
    const knob = '#FFFDF4';
    const edge = '#8A4A5E';
    /* Обводка колечка: толстый тёмный тор */ c.strokeStyle = edge;
    c.lineWidth = 2.9 * k;
    c.beginPath();
    c.arc(7 * k, 9.4 * k, 3.25 * k, 0, Math.PI * 2);
    c.stroke();
    /* Наконечник: тёмный блин чуть шире, поверх — белый с объёмом */ c.fillStyle = edge;
    c.beginPath();
    c.arc(7 * k, 4.6 * k, 3.75 * k, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = knob;
    c.beginPath();
    c.arc(7 * k, 4.6 * k, 3.3 * k, 0, Math.PI * 2);
    c.fill();
    softSpot(c, 8.7 * k, 6.2 * k, 2 * k, '#F0DFC8' + 'C8');
    softSpot(c, 5.7 * k, 3.3 * k, 1.5 * k, '#FFFFFF');
    /* Розовое кольцо поверх обводки + блик дугой */ c.strokeStyle = ring;
    c.lineWidth = 2.3 * k;
    c.beginPath();
    c.arc(7 * k, 9.4 * k, 3.25 * k, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = ringLight;
    c.lineWidth = 0.9 * k;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(7 * k, 9.4 * k, 3.25 * k, Math.PI * 0.72, Math.PI * 1.25);
    c.stroke();
    return {
        canvas,
        w: 14,
        h: 14,
        smooth: true
    };
}
function makeSmoothPawSprite(pal = {}) {
    const p = {
        ...PAW_DEFAULT,
        ...pal
    };
    const light = p.furLight ?? p.pad;
    const W = 192;
    const H = 240;
    const k = W / 24;
    const canvas = mkCanvas(W, H);
    const c = canvas.getContext('2d');
    if (!c) return {
        canvas,
        w: 24,
        h: 30,
        smooth: true
    };
    const x = (v)=>v * k;
    const y = (v)=>v * k;
    /* Детерминированный «рандом» меха: одна и та же шубка при каждом рендере */ let seed = 0x2f6e2b1;
    const rnd = ()=>{
        seed = seed * 1664525 + 1013904223 >>> 0;
        return seed / 4294967296;
    };
    /* Шерстинка: изогнутое «пёрышко» с острым кончиком.
     hx,hy — корень (лог. ед.), ang — направление роста, len — длина,
     w — полуширина корня, bend — изгиб по перпендикуляру */ const hair = (hx, hy, ang, len, w, color, bend)=>{
        const ex = hx + Math.cos(ang) * len;
        const ey = hy + Math.sin(ang) * len;
        const px = -Math.sin(ang);
        const py = Math.cos(ang);
        const cx = hx + Math.cos(ang) * len * 0.5 + px * bend;
        const cy = hy + Math.sin(ang) * len * 0.5 + py * bend;
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(x(hx + px * w), y(hy + py * w));
        c.quadraticCurveTo(x(cx + px * w * 0.4), y(cy + py * w * 0.4), x(ex), y(ey));
        c.quadraticCurveTo(x(cx - px * w * 0.4), y(cy - py * w * 0.4), x(hx - px * w), y(hy - py * w));
        c.closePath();
        c.fill();
    };
    /* Серповидный коготок: корень под кончиком пальца, изгиб наружу */ const sickle = (rx, ry, tx, ty, w, bend, color)=>{
        const dx = tx - rx;
        const dy = ty - ry;
        const L = Math.hypot(dx, dy) || 1;
        const ux = dx / L;
        const uy = dy / L;
        const px = -uy;
        const py = ux;
        const cx = (rx + tx) / 2 + px * bend;
        const cy = (ry + ty) / 2 + py * bend;
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(x(rx + px * w), y(ry + py * w));
        c.quadraticCurveTo(x(cx + px * w * 0.55), y(cy + py * w * 0.55), x(tx), y(ty));
        c.quadraticCurveTo(x(cx - px * w * 0.55), y(cy - py * w * 0.55), x(rx - px * w), y(ry - py * w));
        c.closePath();
        c.fill();
    };
    /* Силуэт: запястье + бахрома + пясть + перепонки + 4 вытянутых пальца + коготки */ const FUR = [
        /* запястье: узкая колонна, меховые клочья по бокам */ [
            12,
            24.4,
            4.4
        ],
        [
            12,
            27.4,
            4.2
        ],
        [
            12,
            29.5,
            3.3
        ],
        [
            7.6,
            23.0,
            1.5
        ],
        [
            16.6,
            23.4,
            1.6
        ],
        [
            8.9,
            26.6,
            1.25
        ],
        [
            15.5,
            27.0,
            1.3
        ],
        [
            6.5,
            25.7,
            1.0
        ],
        [
            17.7,
            26.1,
            1.05
        ],
        /* пясть */ [
            12,
            16.2,
            5.3
        ],
        [
            8.4,
            17.9,
            2.3
        ],
        [
            15.6,
            17.9,
            2.3
        ],
        /* пушистые перепонки между пальцами */ [
            7.9,
            13.2,
            1.5
        ],
        [
            11.5,
            12.2,
            1.6
        ],
        [
            15.3,
            13.4,
            1.5
        ],
        /* мосты шерсти между пальцами: не «сосиски», а живая лапа */ [
            7.5,
            10.8,
            1.2
        ],
        [
            12.0,
            9.9,
            1.25
        ],
        [
            16.3,
            10.6,
            1.15
        ],
        /* боковые клочья на пястье */ [
            6.6,
            15.2,
            0.9
        ],
        [
            17.4,
            15.4,
            0.9
        ],
        [
            7.0,
            19.6,
            1.0
        ],
        [
            17.0,
            19.8,
            1.0
        ],
        /* 4 пальца: по два кружка каждый — тонкие, дугой, средний длиннее */ [
            5.7,
            11.0,
            1.7
        ],
        [
            5.5,
            9.3,
            1.5
        ],
        [
            9.4,
            8.8,
            1.8
        ],
        [
            9.3,
            6.9,
            1.6
        ],
        [
            13.5,
            8.4,
            1.85
        ],
        [
            13.7,
            6.3,
            1.7
        ],
        [
            17.6,
            10.1,
            1.7
        ],
        [
            18.1,
            8.5,
            1.5
        ]
    ];
    const CLAWS = [
        [
            4.7,
            6.6,
            0.8
        ],
        [
            8.95,
            4.25,
            0.85
        ],
        [
            13.75,
            3.7,
            0.9
        ],
        [
            19.0,
            6.15,
            0.8
        ]
    ];
    const silhouette = circlesPath([
        ...FUR,
        ...CLAWS
    ], k);
    /* Чёткий тёмный контур: узкое кольцо вместо прежней «жирной» обводки */ c.fillStyle = p.edge;
    c.fill(circlesPath([
        ...FUR,
        ...CLAWS
    ], k, 0.52));
    /* База: шерсть */ c.fillStyle = p.fur;
    c.fill(silhouette);
    /* Шубка: всё только внутри силуэта */ c.save();
    c.clip(silhouette);
    /* Контурное кольцо изнутри — БЕЗ швов: полупрозрачный тёмный слой
     чуть шире шубки; заливка-объединение не рисует стыки кружков */ c.globalAlpha = 0.5;
    c.fillStyle = p.edge;
    c.fill(circlesPath([
        ...FUR,
        ...CLAWS
    ], k, 0.3));
    c.globalAlpha = 1;
    /* Световая база шубки: непрозрачная, перерисовывает внутренность —
     остаётся только тонкое тёмное кольцо [0.10..0.30] */ const furBase = c.createRadialGradient(x(9.6), y(12.5), 1.6 * k, x(12), y(17), 14 * k);
    furBase.addColorStop(0, light + 'E0');
    furBase.addColorStop(0.42, p.fur);
    furBase.addColorStop(1, p.furShade);
    c.fillStyle = furBase;
    c.fill(silhouette);
    /* Точка внутри силуэта — посев шерстинок без «летающего меха» */ const inSil = (sx, sy)=>{
        for (const [fx, fy, fr] of FUR){
            if (Math.hypot(sx - fx, sy - fy) < fr * 0.95) return true;
        }
        return false;
    };
    const rndInSil = ()=>{
        for(;;){
            const sx = 3.2 + rnd() * 17.6;
            const sy = 4.6 + rnd() * 25.4;
            if (inSil(sx, sy)) return [
                sx,
                sy
            ];
        }
    };
    /* Подшёрсток: жирные изогнутые шерстинки. Тёмных больше и они шире
     (плотный подшёрсток), светлых меньше и они уже (пряные блики) —
     так мех не превращается в полосатую «зебру» */ const UP = -Math.PI / 2;
    for(let i = 0; i < 170; i++){
        const [hx, hy] = rndInSil();
        const r = rnd();
        const isLight = r < (hx < 12 ? 0.48 : 0.2);
        const isDark = !isLight && r > 1 - ((hx > 12.4 ? 0.48 : 0.26) + (hy > 21 ? 0.24 : 0));
        const tone = isLight ? light + 'D4' : isDark ? p.furShade + 'B4' : p.fur + '8C';
        const wBase = isLight ? 0.18 + rnd() * 0.12 : 0.26 + rnd() * 0.18;
        if (hy < 11.8) {
            /* пальцы: шерсть по оси пальца к кончику */ const fi = hx < 7.2 ? 0 : hx < 11.4 ? 1 : hx < 15.6 ? 2 : 3;
            const fa = UP + [
                -0.22,
                -0.14,
                -0.02,
                0.24
            ][fi];
            hair(hx, hy, fa + (rnd() - 0.5) * 0.6, 1.1 + rnd() * 1.0, wBase * 0.85, tone, (rnd() - 0.5) * 0.8);
        } else if (hy < 21.4) {
            /* пясть: веер вверх от центра */ hair(hx, hy, UP + (hx - 12) * 0.12 + (rnd() - 0.5) * 0.5, 2.0 + rnd() * 1.6, wBase, tone, (rnd() - 0.5) * 1.0);
        } else {
            /* запястье: уверенный поток вверх */ hair(hx, hy, UP + (hx - 12) * 0.08 + (rnd() - 0.5) * 0.44, 2.2 + rnd() * 1.6, wBase, tone, (rnd() - 0.5) * 0.8);
        }
    }
    /* Остевые волоски куницы: редкие длинные на запястье — «дикая» шубка */ for(let i = 0; i < 22; i++){
        const [hx, hy] = rndInSil();
        if (hy < 19) continue;
        const tone = rnd() < 0.5 ? light + 'B8' : p.furShade + 'A8';
        hair(hx, hy, UP + (hx - 12) * 0.05 + (rnd() - 0.5) * 0.2, 4.2 + rnd() * 2.0, 0.12 + rnd() * 0.08, tone, (rnd() - 0.5) * 0.9);
    }
    /* Глубина: щели между пальцами, тень под пястьем, вес запястья */ softSpot(c, x(8.4), y(11.2), 1.0 * k, p.furShade + '7C');
    softSpot(c, x(12.6), y(10.2), 1.0 * k, p.furShade + '7C');
    softSpot(c, x(16.4), y(11.4), 0.95 * k, p.furShade + '74');
    softSpot(c, x(8.8), y(13.8), 1.15 * k, p.furShade + '70');
    softSpot(c, x(12.4), y(12.8), 1.15 * k, p.furShade + '70');
    softSpot(c, x(16.0), y(13.9), 1.15 * k, p.furShade + '70');
    softSpot(c, x(14.6), y(18.6), 5.5 * k, p.furShade + '72');
    softSpot(c, x(13.6), y(26.2), 5 * k, p.furShade + '66');
    /* Контровой свет: мягкие светлые пятна вдоль верхне-левого края —
     без stroke() по пути из кружков: он рисовал швы между ними */ softSpot(c, x(7.6), y(10.8), 3.0 * k, light + '66');
    softSpot(c, x(6.4), y(15.8), 2.6 * k, light + '5A');
    softSpot(c, x(9.4), y(7.8), 2.0 * k, light + '66');
    /* Пятнистый окрас (леопард) */ if (p.spots) {
        const dots = [
            [
                8.6,
                13.0,
                1.15
            ],
            [
                15.2,
                15.8,
                1.2
            ],
            [
                9.6,
                21.6,
                1.05
            ],
            [
                14.4,
                21.0,
                1.05
            ],
            [
                12.0,
                11.8,
                0.85
            ],
            [
                16.0,
                25.4,
                1.0
            ],
            [
                7.6,
                17.6,
                0.95
            ]
        ];
        c.fillStyle = p.spots;
        for (const [dx, dy, dr] of dots){
            c.beginPath();
            c.arc(x(dx), y(dy), dr * k, 0, Math.PI * 2);
            c.fill();
        }
    }
    /* Радужные/неоновые пальцы — перекрашиваем все 4, «бобышки» вернутся ниже */ if (p.fingers) {
        const toes = [
            [
                5.7,
                11.0,
                1.7,
                p.fingers[0]
            ],
            [
                5.5,
                9.3,
                1.5,
                p.fingers[0]
            ],
            [
                9.4,
                8.8,
                1.8,
                p.fingers[1]
            ],
            [
                9.3,
                6.9,
                1.6,
                p.fingers[1]
            ],
            [
                13.5,
                8.4,
                1.85,
                p.fingers[2]
            ],
            [
                13.7,
                6.3,
                1.7,
                p.fingers[2]
            ],
            [
                17.6,
                10.1,
                1.7,
                p.fingers[3]
            ],
            [
                18.1,
                8.5,
                1.5,
                p.fingers[3]
            ]
        ];
        for (const [tx, ty, tr, col] of toes){
            c.fillStyle = col;
            c.beginPath();
            c.arc(x(tx), y(ty), tr * k, 0, Math.PI * 2);
            c.fill();
        }
    }
    /* Подушечка-сердечко: ОДИН непрерывный градиент на весь профиль —
     заливка общей фигуры без колец на стыках мочек */ const padPath = new Path2D();
    for (const [px, py, pr] of [
        [
            10.1,
            15.4,
            1.65
        ],
        [
            13.9,
            15.4,
            1.65
        ],
        [
            12.0,
            17.2,
            3.0
        ]
    ]){
        padPath.moveTo(x(px + pr), y(py));
        padPath.arc(x(px), y(py), pr * k, 0, Math.PI * 2);
    }
    const padGrad = c.createRadialGradient(x(10.8), y(15.2), 0.3 * k, x(12.0), y(17.0), 3.8 * k);
    padGrad.addColorStop(0, '#FFFFFF' + '70');
    padGrad.addColorStop(0.3, p.pad);
    padGrad.addColorStop(0.7, p.pad + 'B4');
    padGrad.addColorStop(1, p.furShade + '00');
    c.fillStyle = padGrad;
    c.fill(padPath);
    softSpot(c, x(12.3), y(19.9), 2.4 * k, p.furShade + '4C');
    /* «Бобышки»: 4 объёмные капли в середине пальцев — светлый верх,
     розоватый низ (как у живой кошки), микро-тень под каждой */ const beans = [
        [
            5.7,
            10.0,
            0.72
        ],
        [
            9.3,
            7.6,
            0.75
        ],
        [
            13.7,
            7.1,
            0.78
        ],
        [
            18.0,
            9.2,
            0.72
        ]
    ];
    for (const [bx, by, br] of beans){
        softSpot(c, x(bx), y(by + 0.15), br * 1.3 * k, p.furShade + '44');
        const beanGrad = c.createRadialGradient(x(bx - 0.18), y(by - 0.22), 0.04 * k, x(bx), y(by), br * 1.2 * k);
        beanGrad.addColorStop(0, '#FFFFFF' + 'E6');
        beanGrad.addColorStop(0.3, '#FFFFFF' + '5E');
        beanGrad.addColorStop(0.52, p.beans);
        beanGrad.addColorStop(0.85, p.beans + '8C');
        beanGrad.addColorStop(1, p.pad + '00');
        c.fillStyle = beanGrad;
        c.beginPath();
        c.arc(x(bx), y(by), br * 1.08 * k, 0, Math.PI * 2);
        c.fill();
    }
    /* Коготки: серповидные, корень уходит под кончик пальца,
     изгиб наружу — когти куницы, приготовившейся к прыжку */ const clawDefs = [
        {
            tip: [
                5.5,
                9.3,
                1.5
            ],
            to: [
                4.5,
                6.3
            ],
            bend: -0.34
        },
        {
            tip: [
                9.3,
                6.9,
                1.6
            ],
            to: [
                8.85,
                3.85
            ],
            bend: -0.12
        },
        {
            tip: [
                13.7,
                6.3,
                1.7
            ],
            to: [
                13.85,
                3.3
            ],
            bend: 0.12
        },
        {
            tip: [
                18.1,
                8.5,
                1.5
            ],
            to: [
                19.3,
                5.8
            ],
            bend: 0.34
        }
    ];
    for (const { tip, to, bend } of clawDefs){
        const [tx2, ty2, tr2] = tip;
        const dx2 = to[0] - tx2;
        const dy2 = to[1] - ty2;
        const L2 = Math.hypot(dx2, dy2) || 1;
        const ux2 = dx2 / L2;
        const uy2 = dy2 / L2;
        const rx2 = tx2 + ux2 * tr2 * 0.62;
        const ry2 = ty2 + uy2 * tr2 * 0.62;
        sickle(rx2, ry2, to[0], to[1], 0.52, bend, p.claw);
        /* корень чуть темнее — коготь выходит из-под меха */ softSpot(c, x(rx2), y(ry2), 0.8 * k, p.edge + '66');
        /* блик у острия */ softSpot(c, x(to[0] - ux2 * 0.4), y(to[1] - uy2 * 0.4), 0.5 * k, '#FFF6EC' + 'D2');
    }
    c.restore();
    /* Пухлые клочья поверх контура: рвут силуэт — живой мех, не «тапок» */ const TUFTS = [
        /* запястье: бока и низ */ [
            7.3,
            22.8,
            -2.1
        ],
        [
            6.3,
            24.9,
            -2.85
        ],
        [
            6.7,
            27.1,
            3.05
        ],
        [
            8.4,
            29.1,
            2.45
        ],
        [
            16.9,
            23.0,
            -1.05
        ],
        [
            17.9,
            25.2,
            -0.2
        ],
        [
            17.4,
            27.5,
            0.45
        ],
        [
            15.7,
            29.3,
            1.05
        ],
        /* пясть: бока */ [
            6.9,
            16.4,
            -2.5
        ],
        [
            6.3,
            18.6,
            -3.05
        ],
        [
            17.3,
            16.6,
            -0.6
        ],
        [
            17.9,
            18.9,
            0.05
        ],
        /* перепонки и макушка пястья между пальцами */ [
            7.5,
            12.3,
            -1.9
        ],
        [
            11.1,
            11.2,
            -1.62
        ],
        [
            15.1,
            12.5,
            -1.3
        ],
        [
            9.0,
            10.4,
            -1.8
        ],
        [
            13.1,
            10.0,
            -1.48
        ],
        [
            16.4,
            11.3,
            -1.1
        ]
    ];
    for (const [tux, tuy, tua] of TUFTS){
        const ang = tua + (rnd() - 0.5) * 0.3;
        const tone = rnd() < 0.62 ? p.fur : rnd() < 0.55 ? light + 'D8' : p.furShade + 'D0';
        hair(tux, tuy, ang, 1.1 + rnd() * 0.9, 0.2 + rnd() * 0.1, tone, (rnd() - 0.5) * 0.5);
        hair(tux, tuy, ang + (rnd() - 0.5) * 0.5, 0.7 + rnd() * 0.5, 0.14, p.fur + 'F0', (rnd() - 0.5) * 0.4);
    }
    /* Внутренняя линия контура уже наложена в начале (кольцо без швов) */ /* Волшебный колпак: гладкий конус с кантом и бликом — сидит на среднем пальце */ if (p.hat) {
        const hatMain = '#8AA0D8';
        const hatDark = '#66739F';
        c.save();
        c.strokeStyle = '#4A5578';
        c.lineWidth = 0.5 * k;
        c.lineJoin = 'round';
        c.fillStyle = hatDark;
        c.beginPath();
        c.ellipse(x(13.2), y(4.9), x(4.6), y(0.95), 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        const grad = c.createLinearGradient(x(9), 0, x(17), 0);
        grad.addColorStop(0, hatMain);
        grad.addColorStop(0.55, hatMain);
        grad.addColorStop(1, hatDark);
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(x(13.2), y(0.4));
        c.bezierCurveTo(x(12.2), y(1.4), x(10.9), y(2.4), x(9.3), y(4.0));
        c.lineTo(x(17.0), y(4.0));
        c.bezierCurveTo(x(15.5), y(2.4), x(14.2), y(1.4), x(13.2), y(0.4));
        c.closePath();
        c.fill();
        c.stroke();
        softSpot(c, x(12.4), y(1.6), 0.9 * k, '#F2F6FF' + 'D0');
        c.restore();
    }
    return {
        canvas,
        w: 24,
        h: 30,
        smooth: true
    };
}
const PAW_STYLE_COUNT = 4;
const PAW_DEFAULT_STYLE = 3;
const CUTE_CFGS = [
    /* 1 «ПУХЛЯШКА» — плюшевый чиби: тёплый мёд, крупные розовые бобышки,
     крошечные кремовые коготки, толстенькие пальчики, чистый силуэт */ {
        fur: '#B9824A',
        furHi: '#EDC28A',
        furLo: '#8E5A2C',
        belly: '#F4E0BC',
        bellyHi: '#FFF2D8',
        bellyZone: null,
        pad: '#F2A0A8',
        beans: '#F5A9B2',
        claw: '#F6E7CE',
        clawTip: '#DDBA8E',
        edge: '#3A2210',
        edgeW: 0.5,
        toeR: 1.06,
        spread: 0,
        clawLen: 1.7,
        clawW: 0.56,
        bridges: false,
        tufts: 0,
        strokes: 0
    },
    /* 2 «КУНИЧКА» — настоящий окрас куницы: тёплая спинка и кремовый
     «нагрудник» на ладони, ловкие ivory-коготки, шустрые клочья по бокам */ {
        fur: '#A56A33',
        furHi: '#DCA75F',
        furLo: '#7A4A20',
        belly: '#F4E5C6',
        bellyHi: '#FFF7E2',
        bellyZone: 'palm',
        pad: '#EFA292',
        beans: '#F4B0A0',
        claw: '#F5ECD8',
        clawTip: '#C9A96E',
        edge: '#33200E',
        edgeW: 0.44,
        toeR: 1.0,
        spread: 0.08,
        clawLen: 1.8,
        clawW: 0.58,
        bridges: true,
        tufts: 0,
        strokes: 10
    },
    /* 3 «КОШЕЧКА» — мягкий персиковый пух: пушистый край, коготки выглядывают
     наполовину, крупное розовое сердечко-подушечка */ {
        fur: '#DDB088',
        furHi: '#F7DCB4',
        furLo: '#A97448',
        belly: '#F6E8CC',
        bellyHi: '#FFF2DA',
        bellyZone: null,
        pad: '#F0A2AE',
        beans: '#F0A2AE',
        claw: '#F4E6D6',
        clawTip: '#D9AE94',
        edge: '#46301C',
        edgeW: 0.44,
        toeR: 1.0,
        spread: 0.18,
        clawLen: 1.5,
        clawW: 0.52,
        bridges: true,
        tufts: 0,
        strokes: 14
    },
    /* 4 «ОХОТНИЦА» — лапка приготовилась к прыжку: пальцы растопырены,
     серповидные коготки полной длины, кремовые кончики, тёмный шатён */ {
        fur: '#8C5A2E',
        furHi: '#C08A50',
        furLo: '#5E3A18',
        belly: '#EFE0C0',
        bellyHi: '#FFF6DE',
        bellyZone: 'fingers',
        pad: '#EF9E92',
        beans: '#F2B0A0',
        claw: '#F2E8D0',
        clawTip: '#B98B4C',
        edge: '#2E1B0C',
        edgeW: 0.44,
        toeR: 0.98,
        spread: 0.2,
        clawLen: 1.9,
        clawW: 0.64,
        bridges: true,
        tufts: 0,
        strokes: 8
    }
];
function makeCutePawSprite(style, pal = {}) {
    const idx = (style % PAW_STYLE_COUNT + PAW_STYLE_COUNT) % PAW_STYLE_COUNT;
    const base = CUTE_CFGS[idx];
    const cfg = {
        ...base,
        fur: pal.fur ?? base.fur,
        furHi: pal.furLight ?? base.furHi,
        furLo: pal.furShade ?? base.furLo,
        belly: base.bellyZone === 'palm' ? pal.furLight ?? base.belly : base.belly,
        pad: pal.pad ?? base.pad,
        beans: pal.beans ?? base.beans,
        claw: pal.claw ?? base.claw,
        edge: pal.edge ?? base.edge
    };
    const W = 192;
    const H = 240;
    const k = W / 24;
    const canvas = mkCanvas(W, H);
    const c = canvas.getContext('2d');
    if (!c) return {
        canvas,
        w: 24,
        h: 30,
        smooth: true
    };
    const X = (v)=>v * k;
    /* Детерминированный «рандом» — одна и та же шубка при каждом рендере */ let seed = 0x9e3779b9 ^ (idx + 1) * 0x85ebca6b;
    const rnd = ()=>{
        seed = seed * 1664525 + 1013904223 >>> 0;
        return seed / 4294967296;
    };
    /* Закрытая «шерстинка/клочок»: изогнутый листик с острым кончиком */ const hairPath = (hx, hy, ang, len, w, bend)=>{
        const ex = hx + Math.cos(ang) * len;
        const ey = hy + Math.sin(ang) * len;
        const px = -Math.sin(ang);
        const py = Math.cos(ang);
        const cx = hx + Math.cos(ang) * len * 0.5 + px * bend;
        const cy = hy + Math.sin(ang) * len * 0.5 + py * bend;
        const p = new Path2D();
        p.moveTo(X(hx + px * w), X(hy + py * w));
        p.quadraticCurveTo(X(cx + px * w * 0.4), X(cy + py * w * 0.4), X(ex), X(ey));
        p.quadraticCurveTo(X(cx - px * w * 0.4), X(cy - py * w * 0.4), X(hx - px * w), X(hy - py * w));
        p.closePath();
        return p;
    };
    const hair = (hx, hy, ang, len, w, color, bend)=>{
        c.fillStyle = color;
        c.fill(hairPath(hx, hy, ang, len, w, bend));
    };
    /* РОВНЫЙ КОНТУР без швов: «раздувание» — фигура заливается контурным
     цветом в 12 направлениях, поверх идёт чистая заливка. Тонкое кольцо
     получается идеально равномерным по всей фигуре */ const dilate = (g, path, d, color, dirs = 12)=>{
        g.fillStyle = color;
        for(let i = 0; i < dirs; i++){
            const a = i * Math.PI * 2 / dirs;
            g.save();
            g.translate(Math.cos(a) * d, Math.sin(a) * d);
            g.fill(path);
            g.restore();
        }
        g.fill(path);
    };
    /* ---------- Геометрия: запястье, пясть, 4 пухлых пальца ---------- */ const s = cfg.spread;
    const toes = [
        {
            cx: 5.9 - s * 0.9,
            cy: 11.4,
            r: 1.8 * cfg.toeR
        },
        {
            cx: 9.7 - s * 0.35,
            cy: 9.2,
            r: 2.0 * cfg.toeR
        },
        {
            cx: 14.3 + s * 0.35,
            cy: 9.2,
            r: 2.0 * cfg.toeR
        },
        {
            cx: 18.1 + s * 0.9,
            cy: 11.4,
            r: 1.8 * cfg.toeR
        }
    ];
    const SIL = [
        /* запястье: мягкая колонна с пухом по бокам */ [
            12,
            24.2,
            2.5
        ],
        [
            12,
            26.6,
            2.3
        ],
        [
            12,
            28.6,
            2.0
        ],
        [
            12,
            29.7,
            1.7
        ],
        [
            9.2,
            23.4,
            0.95
        ],
        [
            14.8,
            23.4,
            0.95
        ],
        [
            8.6,
            26.0,
            0.75
        ],
        [
            15.4,
            26.0,
            0.75
        ],
        [
            9.9,
            28.5,
            0.65
        ],
        [
            14.1,
            28.5,
            0.65
        ],
        /* переход пясть→запястье: без пережатой «талии» */ [
            12,
            21.9,
            2.55
        ],
        [
            9.8,
            21.0,
            1.5
        ],
        [
            14.2,
            21.0,
            1.5
        ],
        /* пясть */ [
            12,
            16.4,
            5.1
        ],
        [
            8.9,
            17.9,
            2.2
        ],
        [
            15.1,
            17.9,
            2.2
        ],
        [
            9.3,
            14.4,
            2.4
        ],
        [
            14.7,
            14.4,
            2.4
        ]
    ];
    if (cfg.bridges) {
        SIL.push([
            7.7,
            12.4,
            1.1
        ], [
            12,
            11.4,
            1.25
        ], [
            16.3,
            12.4,
            1.1
        ]);
    }
    for (const t of toes){
        /* пухлый пальчик: круг + чуть вытянутый верх (не «сосиска») */ SIL.push([
            t.cx,
            t.cy,
            t.r
        ], [
            t.cx,
            t.cy - 1.25,
            t.r * 0.9
        ]);
    }
    const sil = circlesPath(SIL, k);
    /* Жёсткая маска-союз кружков */ const hard = mkCanvas(W, H);
    const hc = hard.getContext('2d');
    if (!hc) return {
        canvas,
        w: 24,
        h: 30,
        smooth: true
    };
    hc.fillStyle = '#000';
    hc.fill(sil);
    /* ГЛАДКИЙ СИЛУЭТ «метаболлами»: blur смягчает стыки кружков в цельную
     фигуру, contrast возвращает резкий край; затем ЖЁСТКАЯ отсечка альфы —
     контур получается идеально чётким, без мягкого «ореола».
     Без поддержки filter остаётся обычный союз кружков */ const blurPx = (0.5 * k).toFixed(1);
    const hasFilter = typeof c.filter === 'string';
    const blob = mkCanvas(W, H);
    const bc = blob.getContext('2d');
    if (!bc) return {
        canvas,
        w: 24,
        h: 30,
        smooth: true
    };
    bc.save();
    if (hasFilter) bc.filter = `blur(${blurPx}px) contrast(24)`;
    bc.drawImage(hard, 0, 0);
    bc.restore();
    if (hasFilter) {
        /* порог альфы: всё, что полупрозрачно — прочь. Канва маленькая,
       это делается один раз при создании спрайта */ const img = bc.getImageData(0, 0, W, H);
        const dd = img.data;
        for(let i = 3; i < dd.length; i += 4)dd[i] = dd[i] > 110 ? 255 : 0;
        bc.putImageData(img, 0, 0);
    }
    c.drawImage(blob, 0, 0);
    /** Слой-копия силуэта, залитая цветом/градиентом (source-in) */ const tinted = (fill)=>{
        const t = mkCanvas(W, H);
        const tc = t.getContext('2d');
        if (!tc) return t;
        tc.drawImage(blob, 0, 0);
        tc.globalCompositeOperation = 'source-in';
        tc.fillStyle = fill;
        tc.fillRect(0, 0, W, H);
        return t;
    };
    /* Меховая база: свет падает сверху-слева (рисуется ПОСЛЕ контура) */ const furGrad = c.createRadialGradient(X(9.8), X(11.8), 1.5 * k, X(12.2), X(17.5), 13 * k);
    furGrad.addColorStop(0, cfg.furHi);
    furGrad.addColorStop(0.48, cfg.fur);
    furGrad.addColorStop(1, cfg.furLo);
    /* ---------- Коготки: выглядывают ИЗ-ПОД верхнего края меха.
     Слой когтей (с контуром) стирается по гладкому силуэту — остаётся
     только выглядывающий кончик; контур ляжет ПОВЕРХ основания когтя,
     мех закроет корень — коготь аккуратно «выползает» из-под шёрстки ---------- */ {
        const clCanvas = mkCanvas(W, H);
        const cc = clCanvas.getContext('2d');
        if (cc) {
            const tilts = [
                -0.34,
                -0.12,
                0.12,
                0.34
            ];
            toes.forEach((t, i)=>{
                if (cfg.clawLen <= 0) return;
                const tilt = tilts[i];
                const ux = Math.sin(tilt);
                const uy = -Math.cos(tilt);
                const px = -uy;
                const py = ux;
                const topY = t.cy - 1.25 - t.r * 0.9;
                const B = {
                    x: t.cx + ux * 0.3,
                    y: topY + 0.75
                };
                const L = 0.75 + cfg.clawLen;
                const T = {
                    x: B.x + ux * L,
                    y: B.y + uy * L
                };
                const bend = tilt * 0.45;
                const C = {
                    x: B.x + ux * L * 0.5 + px * bend,
                    y: B.y + uy * L * 0.5 + py * bend
                };
                const bw = cfg.clawW;
                const clawP = new Path2D();
                clawP.moveTo(X(B.x + px * bw), X(B.y + py * bw));
                clawP.quadraticCurveTo(X(C.x + px * bw * 0.5), X(C.y + py * bw * 0.5), X(T.x), X(T.y));
                clawP.quadraticCurveTo(X(C.x - px * bw * 0.5), X(C.y - py * bw * 0.5), X(B.x - px * bw), X(B.y - py * bw));
                clawP.closePath();
                dilate(cc, clawP, 0.2 * k, cfg.edge, 8);
                const cg = cc.createLinearGradient(X(B.x), X(B.y), X(T.x), X(T.y));
                cg.addColorStop(0, cfg.claw);
                cg.addColorStop(0.75, cfg.claw);
                cg.addColorStop(1, cfg.clawTip);
                cc.fillStyle = cg;
                cc.fill(clawP);
            });
            /* часть когтей ПОД мехом — прочь: остаются только выглядывающие кончики */ cc.globalCompositeOperation = 'destination-out';
            if (hasFilter) cc.filter = `blur(${blurPx}px) contrast(24)`;
            cc.drawImage(hard, 0, 0);
            cc.filter = 'none';
            cc.globalCompositeOperation = 'source-over';
            c.drawImage(clCanvas, 0, 0);
        }
    }
    /* ЧЁТКИЙ КОНТУР: 12 смещённых копий контурного слоя + центр —
     кольцо ложится идеально ровно по всей фигуре */ const dOut = cfg.edgeW * k;
    const edgeLayer = tinted(cfg.edge);
    for(let i = 0; i < 12; i++){
        const a = i * Math.PI * 2 / 12;
        c.drawImage(edgeLayer, Math.cos(a) * dOut, Math.sin(a) * dOut);
    }
    c.drawImage(edgeLayer, 0, 0);
    /* Мех поверх контура: остаётся только тонкое ровное кольцо */ c.drawImage(tinted(furGrad), 0, 0);
    /* ---------- Объём внутри силуэта ---------- */ c.save();
    c.globalCompositeOperation = 'source-atop';
    /* Кремовый нагрудник куницы: мягкое пятно на ладони и запястье */ if (cfg.bellyZone === 'palm') {
        const bellyList = [
            [
                12,
                19.6,
                3.9
            ],
            [
                12,
                22.4,
                3.4
            ],
            [
                12,
                25.2,
                2.8
            ],
            [
                12,
                27.8,
                2.1
            ],
            [
                9.6,
                21.6,
                1.7
            ],
            [
                14.4,
                21.6,
                1.7
            ],
            [
                10.1,
                24.6,
                1.5
            ],
            [
                13.9,
                24.6,
                1.5
            ]
        ];
        const lg = c.createLinearGradient(0, X(14.6), 0, X(17.6));
        lg.addColorStop(0, cfg.belly + '00');
        lg.addColorStop(0.6, cfg.belly + 'AC');
        lg.addColorStop(1, cfg.belly);
        c.fillStyle = lg;
        c.fill(circlesPath(bellyList, k));
        softSpot(c, X(12), X(23.8), 5 * k, cfg.bellyHi + 'A0');
    }
    /* Кремовые кончики пальцев охотницы */ if (cfg.bellyZone === 'fingers') {
        for (const t of toes){
            const tip = {
                x: t.cx,
                y: t.cy - 1.25,
                r: t.r * 0.9
            };
            c.fillStyle = cfg.belly;
            c.beginPath();
            c.arc(X(tip.x), X(tip.y), tip.r * 0.78 * k, 0, Math.PI * 2);
            c.fill();
            softSpot(c, X(tip.x), X(tip.y), tip.r * 1.1 * k, cfg.furLo + '3C');
        }
    }
    /* Радужные/неоновые пальцы скина */ if (pal.fingers) {
        toes.forEach((t, i)=>{
            const col = pal.fingers[i % 4];
            c.fillStyle = col;
            c.beginPath();
            c.arc(X(t.cx), X(t.cy), t.r * 0.95 * k, 0, Math.PI * 2);
            c.fill();
            c.beginPath();
            c.arc(X(t.cx), X(t.cy - 1.25), t.r * 0.9 * 0.9 * k, 0, Math.PI * 2);
            c.fill();
        });
    }
    /* Леопардовые пятна скина */ if (pal.spots) {
        const dots = [
            [
                8.6,
                13.0,
                1.05
            ],
            [
                15.2,
                15.8,
                1.1
            ],
            [
                9.6,
                21.6,
                1.0
            ],
            [
                14.4,
                21.0,
                1.0
            ],
            [
                12.0,
                12.6,
                0.8
            ],
            [
                16.0,
                25.4,
                0.95
            ],
            [
                7.6,
                17.6,
                0.9
            ]
        ];
        c.globalAlpha = 0.85;
        c.fillStyle = pal.spots;
        for (const [dx, dy, dr] of dots){
            c.beginPath();
            c.arc(X(dx), X(dy), dr * k, 0, Math.PI * 2);
            c.fill();
        }
        c.globalAlpha = 1;
    }
    /* Щёлочки между пальцами: отдельные пальчики читаются лучше */ {
        const ca = cfg.bridges ? '40' : '58';
        softSpot(c, X(7.8), X(11.9), 0.8 * k, cfg.furLo + ca);
        softSpot(c, X(12), X(10.9), 0.8 * k, cfg.furLo + ca);
        softSpot(c, X(16.2), X(11.9), 0.8 * k, cfg.furLo + ca);
    }
    /* Тень веса справа-снизу + контровой свет слева-сверху */ softSpot(c, X(15.6), X(19.6), 6 * k, cfg.furLo + '54');
    softSpot(c, X(13.8), X(26.4), 5 * k, cfg.furLo + '4C');
    softSpot(c, X(7.9), X(10.8), 2.8 * k, cfg.furHi + '8C');
    softSpot(c, X(6.7), X(15.8), 2.4 * k, cfg.furHi + '78');
    for (const t of toes){
        softSpot(c, X(t.cx - 0.3), X(t.cy - 1.0), t.r * 0.62 * k, cfg.furHi + '8C');
    }
    /* Лёгкие штрихи шерсти: направление роста — от запястья к пальцам */ if (cfg.strokes > 0) {
        const UP = -Math.PI / 2;
        const marks = [
            [
                8.2,
                13.2
            ],
            [
                10.6,
                12.4
            ],
            [
                13.3,
                12.2
            ],
            [
                15.8,
                13.3
            ],
            [
                7.4,
                16.4
            ],
            [
                16.6,
                16.5
            ],
            [
                8.0,
                20.2
            ],
            [
                16.0,
                20.3
            ],
            [
                9.8,
                23.4
            ],
            [
                14.2,
                23.6
            ],
            [
                10.4,
                26.0
            ],
            [
                13.6,
                26.2
            ],
            [
                6.6,
                15.0
            ],
            [
                17.4,
                15.2
            ],
            [
                12.0,
                14.6
            ],
            [
                12.0,
                22.6
            ]
        ];
        for(let i = 0; i < Math.min(cfg.strokes, marks.length); i++){
            const [hx, hy] = marks[i];
            const tone = hx < 12 ? cfg.furHi + 'A6' : cfg.furLo + '96';
            hair(hx, hy, UP + (hx - 12) * 0.1 + (rnd() - 0.5) * 0.4, 0.7 + rnd() * 0.5, 0.15, tone, (rnd() - 0.5) * 0.5);
        }
    }
    /* ---------- Бобышки: розовые капли с мягким бликом (в центре пальчика) ---------- */ toes.forEach((t, i)=>{
        const bx = t.cx;
        const by = t.cy - 0.2;
        const br = t.r * 0.46 + (i === 1 || i === 2 ? 0.05 : 0);
        softSpot(c, X(bx), X(by + 0.24), br * 1.55 * k, cfg.furLo + '48');
        c.globalAlpha = 0.3;
        c.fillStyle = cfg.edge;
        c.beginPath();
        c.arc(X(bx), X(by), br * 1.14 * k, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
        const bg = c.createRadialGradient(X(bx - 0.18), X(by - 0.26), 0.04 * k, X(bx), X(by), br * 1.16 * k);
        bg.addColorStop(0, '#FFFFFFD9');
        bg.addColorStop(0.3, '#FFFFFF5E');
        bg.addColorStop(0.6, cfg.beans);
        bg.addColorStop(0.9, cfg.beans + 'A6');
        bg.addColorStop(1, cfg.beans + '00');
        c.fillStyle = bg;
        c.beginPath();
        c.arc(X(bx), X(by), br * 1.08 * k, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#FFFFFF8C';
        c.beginPath();
        c.arc(X(bx - 0.2), X(by - 0.28), 0.18 * k, 0, Math.PI * 2);
        c.fill();
    });
    /* ---------- Подушечка-сердечко (компактная — не занимает всю пясть) ---------- */ const padPath = new Path2D();
    for (const [qx, qy, qr] of [
        [
            10.6,
            15.4,
            1.25
        ],
        [
            13.4,
            15.4,
            1.25
        ],
        [
            12.0,
            17.1,
            2.2
        ]
    ]){
        padPath.moveTo(X(qx + qr), X(qy));
        padPath.arc(X(qx), X(qy), qr * k, 0, Math.PI * 2);
    }
    c.globalAlpha = 0.45;
    dilate(c, padPath, 0.2 * k, cfg.edge);
    c.globalAlpha = 1;
    const padGrad = c.createRadialGradient(X(11.1), X(15.4), 0.25 * k, X(12.0), X(16.9), 2.5 * k);
    padGrad.addColorStop(0, '#FFFFFF8C');
    padGrad.addColorStop(0.4, cfg.pad);
    padGrad.addColorStop(0.82, cfg.pad + 'C0');
    padGrad.addColorStop(1, cfg.pad + '00');
    c.fillStyle = padGrad;
    c.fill(padPath);
    softSpot(c, X(12.2), X(19.6), 1.8 * k, cfg.furLo + '40');
    c.restore();
    /* ---------- Волшебный колпак скина ---------- */ if (pal.hat) {
        const hatMain = '#8AA0D8';
        const hatDark = '#66739F';
        c.save();
        c.strokeStyle = '#4A5578';
        c.lineWidth = 0.5 * k;
        c.lineJoin = 'round';
        c.fillStyle = hatDark;
        c.beginPath();
        c.ellipse(X(13.4), X(5.0), X(4.6), X(0.95), 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        const grad = c.createLinearGradient(X(9), 0, X(17), 0);
        grad.addColorStop(0, hatMain);
        grad.addColorStop(0.55, hatMain);
        grad.addColorStop(1, hatDark);
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(X(13.4), X(0.4));
        c.bezierCurveTo(X(12.4), X(1.4), X(11.1), X(2.4), X(9.5), X(4.1));
        c.lineTo(X(17.2), X(4.1));
        c.bezierCurveTo(X(15.7), X(2.4), X(14.4), X(1.4), X(13.4), X(0.4));
        c.closePath();
        c.fill();
        c.stroke();
        softSpot(c, X(12.6), X(1.6), 0.9 * k, '#F2F6FFD0');
        c.restore();
    }
    return {
        canvas,
        w: 24,
        h: 30,
        smooth: true
    };
}
const MINE_VARIANTS = 4;
const MINE_NORMAL = {
    body1: '#FF6A5A',
    body2: '#E5342E',
    body3: '#9E1512',
    core: '#FFF6EC',
    edge: '#120303'
};
const MINE_CB = {
    body1: '#6FA0FF',
    body2: '#3D7BFF',
    body3: '#274F99',
    core: '#FFFFFF',
    edge: '#0A1540'
};
/** Звезда: points вершин, внешний/внутренний радиус, поворот (рад) */ function starPath(c, cx, cy, outer, inner, points, rot) {
    c.beginPath();
    for(let i = 0; i < points * 2; i++){
        const r = i % 2 === 0 ? outer : inner;
        const a = rot + i * Math.PI / points;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
    }
    c.closePath();
}
function makeMineSprite(kind, colorblind = false) {
    const S = 96;
    const k = S / 14;
    const canvas = mkCanvas(S, S);
    const c = canvas.getContext('2d');
    if (!c) return {
        canvas,
        w: 14,
        h: 14,
        smooth: true
    };
    const pal = colorblind ? MINE_CB : MINE_NORMAL;
    const cx = 7 * k;
    const cy = 7 * k;
    const kindIdx = (kind % MINE_VARIANTS + MINE_VARIANTS) % MINE_VARIANTS;
    const bodyGrad = (r)=>{
        const g = c.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.15, cx, cy, r);
        g.addColorStop(0, pal.body1);
        g.addColorStop(0.55, pal.body2);
        g.addColorStop(1, pal.body3);
        return g;
    };
    /* Мягкое светящееся гало за звездой — «маленькая, но яркая» */ softSpot(c, cx, cy, 6.9 * k, (colorblind ? '#7FB2FF' : '#FF5A4E') + '3C');
    if (kindIdx === 2) {
        /* Морская мина: 8 шипов-конусов + гладкая сфера */ c.fillStyle = pal.body3;
        for(let i = 0; i < 8; i++){
            const a = i * Math.PI / 4 + Math.PI / 8;
            const tx = cx + Math.cos(a) * 6.7 * k;
            const ty = cy + Math.sin(a) * 6.7 * k;
            const b1a = a - 0.26;
            const b1b = a + 0.26;
            c.beginPath();
            c.moveTo(cx + Math.cos(b1a) * 3.7 * k, cy + Math.sin(b1a) * 3.7 * k);
            c.lineTo(tx, ty);
            c.lineTo(cx + Math.cos(b1b) * 3.7 * k, cy + Math.sin(b1b) * 3.7 * k);
            c.closePath();
            c.fill();
            c.save();
            c.strokeStyle = pal.edge;
            c.lineWidth = 0.5 * k;
            c.stroke();
            c.restore();
        }
        c.fillStyle = pal.edge;
        c.beginPath();
        c.arc(cx, cy, 4.95 * k, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = bodyGrad(4.6 * k);
        c.beginPath();
        c.arc(cx, cy, 4.6 * k, 0, Math.PI * 2);
        c.fill();
        softSpot(c, cx - 1.7 * k, cy - 1.8 * k, 1.9 * k, '#FFFFFF' + 'E8');
        softSpot(c, cx + 1.9 * k, cy + 2 * k, 1.7 * k, pal.body3 + 'B0');
    } else {
        const points = kindIdx === 1 ? 8 : 9;
        const inner = kindIdx === 1 ? 3.7 : 3.05;
        const outer = 6.55;
        const rot = -Math.PI / 2 + (kindIdx === 1 ? Math.PI / 8 : 0);
        /* Тёмная подложка чуть шире — читаемый чёрный контур */ starPath(c, cx, cy, (outer + 0.62) * k, (inner + 0.5) * k, points, rot);
        c.fillStyle = pal.edge;
        c.fill();
        starPath(c, cx, cy, outer * k, inner * k, points, rot);
        c.fillStyle = bodyGrad(outer * k);
        c.fill();
        /* Раскалённое ядро: белое сердце звезды */ const coreR = kindIdx === 1 ? 2.9 : 2.5;
        const cg = c.createRadialGradient(cx, cy, 0, cx, cy, coreR * k);
        cg.addColorStop(0, '#FFFFFF');
        cg.addColorStop(0.5, pal.core);
        cg.addColorStop(1, pal.core + '00');
        c.fillStyle = cg;
        c.beginPath();
        c.arc(cx, cy, coreR * k, 0, Math.PI * 2);
        c.fill();
        if (kindIdx === 3) {
            /* Злюка: мордочка на белом ядре — косые глаза, оскал */ const ink = '#1A0505';
            c.fillStyle = ink;
            for (const ex of [
                -1.15,
                1.15
            ]){
                c.beginPath();
                c.arc(cx + ex * k, cy + 0.1 * k, 0.62 * k, 0, Math.PI * 2);
                c.fill();
            }
            c.fillStyle = pal.core;
            c.beginPath();
            c.arc(cx - 1.28 * k, cy + 0.22 * k, 0.18 * k, 0, Math.PI * 2);
            c.arc(cx + 1.02 * k, cy + 0.22 * k, 0.18 * k, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = ink;
            c.lineWidth = 0.42 * k;
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(cx - 1.8 * k, cy - 1.1 * k);
            c.lineTo(cx - 0.5 * k, cy - 0.55 * k);
            c.moveTo(cx + 1.8 * k, cy - 1.1 * k);
            c.lineTo(cx + 0.5 * k, cy - 0.55 * k);
            c.stroke();
            c.beginPath();
            c.arc(cx, cy + 0.7 * k, 1.25 * k, Math.PI * 0.15, Math.PI * 0.85);
            c.stroke();
        }
    }
    /* Яркие искорки: крохотные белые звёздочки-точки по краям */ c.fillStyle = '#FFFFFF';
    for (const [gx, gy, gr] of [
        [
            10.6,
            3.6,
            0.55
        ],
        [
            3.4,
            9.6,
            0.4
        ],
        [
            11.2,
            9.8,
            0.3
        ]
    ]){
        c.beginPath();
        c.arc(gx * k, gy * k, gr * k, 0, Math.PI * 2);
        c.fill();
    }
    return {
        canvas,
        w: 14,
        h: 14,
        smooth: true
    };
}
function drawSprite(ctx, s, cx, cy, scale, opts) {
    const { rot = 0, alpha = 1, sx = 1, sy = 1 } = opts ?? {};
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.scale(sx, sy);
    ctx.imageSmoothingEnabled = s.smooth === true;
    ctx.drawImage(s.canvas, -s.w * scale / 2, -s.h * scale / 2, s.w * scale, s.h * scale);
    ctx.restore();
}
function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const p = Math.min(1, Math.max(0, t));
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
}
function easeOutQuad(t) {
    const p = Math.min(1, Math.max(0, t));
    return 1 - (1 - p) * (1 - p);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/unlocks.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pawReqLevel",
    ()=>pawReqLevel,
    "unlockNamesForRange",
    ()=>unlockNamesForRange,
    "unlocksAtLevel",
    ()=>unlocksAtLevel,
    "upgradeReqLevel",
    ()=>upgradeReqLevel
]);
/**
 * Разблокировки по уровню котика 🎖 «POPCORN PAWS» (v0.0.33).
 *
 *  ОПЫТ стал настоящей системой прогрессии:
 *    • за каждый забег капает опыт 🍿 (10 очков = 1 🍿 + награда за этапы);
 *    • уровень котика растёт от суммарного опыта и НИКОГДА не падает;
 *    • уровень открывает ЛАПКИ, АПГРЕЙДЫ и АРТЕФАКТЫ — без него даже
 *      с полным кошельком покупка закрыта («🔒 Ур. N»).
 *
 *  Здесь собраны помощники: проверка «открыто ли» и список названий,
 *  которые открываются НА конкретном уровне — чтобы тост повышения
 *  и экран результатов показывали игроку плоды роста.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/paws.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$upgrades$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/upgrades.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$market$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/market.ts [app-client] (ecmascript)");
;
;
;
function pawReqLevel(pawId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAWS"].find((p)=>p.id === pawId)?.reqLevel ?? 1;
}
function upgradeReqLevel(upgId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$upgrades$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UPGRADES"].find((u)=>u.id === upgId)?.reqLevel ?? 1;
}
function unlocksAtLevel(level) {
    const out = [];
    for (const p of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$paws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAWS"]){
        if ((p.reqLevel ?? 1) === level) out.push({
            kind: 'paw',
            nameKey: `paw.${p.id}.name`
        });
    }
    for (const u of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$upgrades$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UPGRADES"]){
        if ((u.reqLevel ?? 1) === level) out.push({
            kind: 'upgrade',
            nameKey: `upg.${u.id}.name`
        });
    }
    for (const a of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$market$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ARTIFACTS"]){
        if ((a.reqLevel ?? 1) === level) out.push({
            kind: 'artifact',
            nameKey: `artifact.${a.id}.name`
        });
    }
    return out;
}
function unlockNamesForRange(fromLevel, toLevel) {
    const out = [];
    for(let l = Math.max(1, fromLevel) + 1; l <= toLevel; l++)out.push(...unlocksAtLevel(l));
    return out;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/upgrades.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Постоянные апгрейды «POPCORN PAWS» — 33 штуки в 8 разделах.
 *
 *  Покупаются за опыт 🍿 и действуют в каждом забеге навсегда.
 *  Это «магазин механик» в отличие от древа улучшений (очки за уровень котика):
 *  древо тонко настраивает забег, а апгрейды — крупные вехи, которые видны сразу.
 *
 *  Разделы вкладки «АПГРЕЙДЫ» (v0.0.32 — наведён порядок, у каждого раздела
 *  свой заголовок в магазине):
 *    🧱 База выживания   — стаканчик, сердца, жизнь, щит, старт-перк;
 *    🧺 Урожай и сбор    — масло, золото, магнит, волна;
 *    🍿 Большие попкорнины — ранний выход, живучесть, глазурь, золотая сдача;
 *    👶 Босс «Малыш»     — призовые, время боя, меткий пинок, рукавички;
 *    ⏱ Время и скорость — длинный сеанс, проворная лапка;
 *    🛡 Безопасность     — сапёр, крепкий нос, голубиные договоры;
 *    🔥 Азарт и комбо    — лихорадка, сундуки, быстрый старт, комбо-броня;
 *    🏦 Мета-экономика   — монетки, опыт, кассовый куш.
 *
 *  Численные бонусы собираются upgradeBonuses() и в компоненте игры
 *  сливаются с бонусами древа (mergeBonuses) — движок получает единый пакет.
 *
 *  v0.0.28 — вся прокачка ≈ 14 400 🍿.
 *  v0.0.31 — строже: ×2.5 → ≈ 36 000 🍿.
 *  v0.0.32 — ЗАПРОС ИГРОКА: «постоянные апдейты должны быть НАМНОГО дороже,
 *  10-15 новых штук, в каждом по 3-5 улучшений». Что сделано:
 *    • каждый апгрейд доработан до 3–5 ступеней (одиночные — только редкие
 *      «вехи»: Девятая жизнь, Счастливый сундучок, Комбо-тренер);
 *    • цены ×3–×4 от 0.0.31: первые ступени по-прежнему по зубам (~700–1800),
 *      финальные ступени стоят как дорогие лапки (10–55 тысяч);
 *    • добавлено 13 новых апгрейдов под механики больших попкорнин и босса;
 *    • полная покупка вкладки ≈ 640 000 🍿 — путь на долгие недели.
 *  v0.0.33 — ОПЫТ КОТИКА СТАЛ СИСТЕМОЙ: у каждого апгрейда появился
 *  reqLevel — уровень котика 🎖, с которого покупка открывается.
 *  Растёт за реальный опыт забегов; замок виден в магазине заранее.
 */ __turbopack_context__.s([
    "DEFAULT_UPGRADES",
    ()=>DEFAULT_UPGRADES,
    "UPGRADES",
    ()=>UPGRADES,
    "UPGRADE_CATS",
    ()=>UPGRADE_CATS,
    "UPGRADE_MAP",
    ()=>UPGRADE_MAP,
    "parseUpgrades",
    ()=>parseUpgrades,
    "upgradeBonuses",
    ()=>upgradeBonuses,
    "upgradesAllMaxed",
    ()=>upgradesAllMaxed,
    "upgradesBought",
    ()=>upgradesBought
]);
const UPGRADE_CATS = [
    {
        id: 'base',
        key: 'shop.cat.base',
        icon: '🧱'
    },
    {
        id: 'yield',
        key: 'shop.cat.yield',
        icon: '🧺'
    },
    {
        id: 'big',
        key: 'shop.cat.big',
        icon: '🍿'
    },
    {
        id: 'boss',
        key: 'shop.cat.boss',
        icon: '👶'
    },
    {
        id: 'tempo',
        key: 'shop.cat.tempo',
        icon: '⏱'
    },
    {
        id: 'guard',
        key: 'shop.cat.guard',
        icon: '🛡'
    },
    {
        id: 'lucky',
        key: 'shop.cat.lucky',
        icon: '🔥'
    },
    {
        id: 'meta',
        key: 'shop.cat.meta',
        icon: '🏦'
    }
];
const UPGRADES = [
    /* ══════════ 🧱 База выживания ══════════ */ {
        id: 'capacity',
        cat: 'base',
        name: 'Большой стаканчик',
        desc: 'Лапка носит на одно зерно больше в каждом забеге. Можно купить четырежды!',
        icon: '🥡',
        prices: [
            1200,
            3200,
            8000,
            18000
        ],
        reqLevel: 1,
        step: 1
    },
    {
        id: 'hearts',
        cat: 'base',
        name: 'Крепкое сердце',
        desc: 'Плюс одно сердечко ❤️ к максимуму в каждом забеге: мины и голуби станут не так страшны. Можно купить четырежды!',
        icon: '❤️',
        prices: [
            1500,
            4200,
            10000,
            24000
        ],
        reqLevel: 1,
        step: 1
    },
    {
        id: 'life',
        cat: 'base',
        name: 'Девятая жизнь',
        desc: 'Один раз за забег, когда время выйдет, можно продолжить с тем же счётом (+15 секунд).',
        icon: '❤️‍🔥',
        prices: [
            4000
        ],
        reqLevel: 5,
        step: 1
    },
    {
        id: 'startperk',
        cat: 'base',
        name: 'Счастливый сундучок',
        desc: 'Каждый новый забег начинается со случайным БОНУСНЫМ перком первого уровня.',
        icon: '🍀',
        prices: [
            5000
        ],
        reqLevel: 6,
        step: 1
    },
    {
        id: 'shield',
        cat: 'base',
        name: 'Запасной щит',
        desc: 'Каждый забег начинается с +1 щитом 🛡️: одна мина прощается. Можно купить трижды!',
        icon: '🛡️',
        prices: [
            1100,
            3000,
            7400
        ],
        reqLevel: 2,
        step: 1
    },
    /* ══════════ 🧺 Урожай и сбор ══════════ */ {
        id: 'butter',
        cat: 'yield',
        name: 'Сливочное масло',
        desc: 'Каждое сданное зерно жирнее: +5% очков за зерно за ступень. Можно купить четырежды!',
        icon: '🧈',
        prices: [
            900,
            2200,
            5500,
            13000
        ],
        reqLevel: 1,
        step: 5
    },
    {
        id: 'goldluck',
        cat: 'yield',
        name: 'Золотая удача',
        desc: 'Золотые зёрна падают чаще: +4% к шансу за ступень. Можно купить четырежды!',
        icon: '🌟',
        prices: [
            800,
            2000,
            4800,
            11000
        ],
        reqLevel: 1,
        step: 4
    },
    {
        id: 'magnet',
        cat: 'yield',
        name: 'Магнит-приманка',
        desc: 'Лапка собирает зёрна с большего расстояния: +6% к радиусу подбора за ступень. Можно купить четырежды!',
        icon: '🧲',
        prices: [
            700,
            1800,
            4400,
            10000
        ],
        reqLevel: 2,
        step: 6
    },
    {
        id: 'seeds',
        cat: 'yield',
        name: 'Щедрая волна',
        desc: 'В каждой волне на 2 зерна больше — больше урожая за то же время. Можно купить четырежды!',
        icon: '🧺',
        prices: [
            1000,
            2600,
            6400,
            15000
        ],
        reqLevel: 3,
        step: 2
    },
    /* ══════════ 🍿 Большие попкорнины ══════════ */ {
        id: 'bigchance',
        cat: 'big',
        name: 'Ранняя попкорнина',
        desc: 'БОЛЬШАЯ ПОПКОРНИНА выскакивает на 1.5 сек раньше за ступень — больше шансов успеть. Можно купить четырежды!',
        icon: '🍿',
        prices: [
            1400,
            3600,
            8800,
            20000
        ],
        reqLevel: 6,
        step: 1.5
    },
    {
        id: 'bigtime',
        cat: 'big',
        name: 'Живучая попкорнина',
        desc: 'Большая попкорнина живёт на 1 секунду дольше за ступень — не убежит так скоро. Можно купить трижды!',
        icon: '⌛',
        prices: [
            1200,
            3200,
            7800
        ],
        reqLevel: 7,
        step: 1
    },
    {
        id: 'bigmult',
        cat: 'big',
        name: 'Сладкая глазурь',
        desc: 'Очки за любую БОЛЬШУЮ ПОПКОРНИНУ +10% за ступень: карамель, вишня и виноград жирнее. Можно купить пять раз!',
        icon: '🍯',
        prices: [
            1800,
            4500,
            11000,
            26000,
            55000
        ],
        reqLevel: 9,
        step: 10
    },
    {
        id: 'goldcoin',
        cat: 'big',
        name: 'Золотая сдача',
        desc: 'Каждое сданное ЗОЛОТОЕ зерно приносит +1 монетку 🪙 за ступень. Можно купить трижды!',
        icon: '🌟',
        prices: [
            1300,
            3400,
            8200
        ],
        reqLevel: 7,
        step: 1
    },
    /* ══════════ 👶 Босс «Малыш» ══════════ */ {
        id: 'bosscoins',
        cat: 'boss',
        name: 'Призовые малыша',
        desc: 'Монетки 🪙 за победу над малышом +12% за ступень. Можно купить трижды!',
        icon: '🏅',
        prices: [
            1500,
            3800,
            9200
        ],
        reqLevel: 5,
        step: 12
    },
    {
        id: 'bosstime',
        cat: 'boss',
        name: 'Долгий бой',
        desc: 'Босс-бой длится на 3 секунды дольше за ступень — время на добивание. Можно купить трижды!',
        icon: '⏱',
        prices: [
            1200,
            3000,
            7400
        ],
        reqLevel: 5,
        step: 3
    },
    {
        id: 'flingease',
        cat: 'boss',
        name: 'Меткий пинок',
        desc: 'Пинок лапкой срабатывает легче: порог скорости −6% за ступень. Можно купить трижды!',
        icon: '🎯',
        prices: [
            1600,
            4000,
            9600
        ],
        reqLevel: 6,
        step: 6
    },
    {
        id: 'bossheart',
        cat: 'boss',
        name: 'Мягкие рукавички',
        desc: 'Шанс 12% за ступень, что касание малыша не отнимет сердечко. Можно купить четырежды!',
        icon: '🧤',
        prices: [
            1500,
            3800,
            9200,
            21000
        ],
        reqLevel: 8,
        step: 12
    },
    /* ══════════ ⏱ Время и скорость ══════════ */ {
        id: 'timeplus',
        cat: 'tempo',
        name: 'Длинный сеанс',
        desc: 'Каждый уровень длиннее на 3 секунды — время успеть всё. Можно купить четырежды!',
        icon: '⏱',
        prices: [
            1100,
            2800,
            7000,
            16000
        ],
        reqLevel: 2,
        step: 3
    },
    {
        id: 'speed',
        cat: 'tempo',
        name: 'Проворная лапка',
        desc: 'Лапка летит за пальцем на 5% быстрее за ступень. Можно купить четырежды!',
        icon: '💨',
        prices: [
            650,
            1700,
            4200,
            9500
        ],
        reqLevel: 1,
        step: 5
    },
    /* ══════════ 🛡 Безопасность ══════════ */ {
        id: 'miner',
        cat: 'guard',
        name: 'Сапёр',
        desc: 'На одну мину-кукурузину меньше в каждой волне. Можно купить трижды!',
        icon: '⛏️',
        prices: [
            1300,
            3400,
            8500
        ],
        reqLevel: 4,
        step: 1
    },
    {
        id: 'stun',
        cat: 'guard',
        name: 'Крепкий нос',
        desc: 'Шок от мины короче на 0.3 секунды за ступень — быстрее снова в бой. Можно купить трижды!',
        icon: '💪',
        prices: [
            700,
            1900,
            4800
        ],
        reqLevel: 3,
        step: 0.3
    },
    {
        id: 'pigeonlate',
        cat: 'guard',
        name: 'Кроткий голубь',
        desc: 'Голубь-воришка прилетает на 3 секунды позже за ступень. Можно купить трижды!',
        icon: '🕊',
        prices: [
            800,
            2200,
            5600
        ],
        reqLevel: 3,
        step: 3
    },
    {
        id: 'pigeonguard',
        cat: 'guard',
        name: 'Мир с голубем',
        desc: 'Голубь-воришка тащит на 1 зерно меньше за ступень. Можно купить трижды!',
        icon: '🕊',
        prices: [
            1100,
            2800,
            7000
        ],
        reqLevel: 4,
        step: 1
    },
    /* ══════════ 🔥 Азарт и комбо ══════════ */ {
        id: 'fevertime',
        cat: 'lucky',
        name: 'Долгая жара',
        desc: 'ЛИХОРАДКА длится на 1 секунду дольше за ступень. Можно купить трижды!',
        icon: '🔥',
        prices: [
            900,
            2400,
            6000
        ],
        reqLevel: 3,
        step: 1
    },
    {
        id: 'feverluck',
        cat: 'lucky',
        name: 'Фартовщик',
        desc: 'Сдача зерна чаще запускает внезапную ЛИХОРАДКУ: +5% шанса за ступень. Можно купить трижды!',
        icon: '🎲',
        prices: [
            1000,
            2700,
            6800
        ],
        reqLevel: 4,
        step: 5
    },
    {
        id: 'fevermult',
        cat: 'lucky',
        name: 'Жаркий урожай',
        desc: 'Очки в ЛИХОРАДКЕ +10% за ступень — жара становится жирнее. Можно купить четырежды!',
        icon: '🔥',
        prices: [
            1200,
            3000,
            7400,
            17000
        ],
        reqLevel: 5,
        step: 10
    },
    {
        id: 'gift',
        cat: 'lucky',
        name: 'Щедрые сундуки',
        desc: 'Подарки из сундучков ценнее на 25% за ступень. Можно купить трижды!',
        icon: '🎁',
        prices: [
            1100,
            2900,
            7200
        ],
        reqLevel: 6,
        step: 25
    },
    {
        id: 'combostart',
        cat: 'lucky',
        name: 'Быстрый старт',
        desc: 'Серия сдач начинается с запасом +5 за ступень: комбо-множитель сразу выше. Можно купить трижды!',
        icon: '🚀',
        prices: [
            900,
            2300,
            5800
        ],
        reqLevel: 5,
        step: 5
    },
    {
        id: 'comboarmor',
        cat: 'lucky',
        name: 'Комбо-броня',
        desc: 'Мина или воришка НЕ сбивают серию — по одному спасению за ступень в каждом забеге. Можно купить трижды!',
        icon: '🎢',
        prices: [
            1400,
            3500,
            8600
        ],
        reqLevel: 7,
        step: 1
    },
    {
        id: 'combo',
        cat: 'lucky',
        name: 'Комбо-тренер',
        desc: 'Комбо-множитель растёт каждые 5 сдач вместо 6. Купи один раз — и навсегда!',
        icon: '🎯',
        prices: [
            7000
        ],
        reqLevel: 10,
        step: 1
    },
    /* ══════════ 🏦 Мета-экономика ══════════ */ {
        id: 'coins',
        cat: 'meta',
        name: 'Монетный магнит',
        desc: '+10% монеток 🪙 с этапов, сундучков и ЛИХОРАДКИ за ступень. Можно купить четырежды!',
        icon: '🪙',
        prices: [
            900,
            2300,
            5800,
            13500
        ],
        reqLevel: 2,
        step: 10
    },
    {
        id: 'xpboost',
        cat: 'meta',
        name: 'Умный котик',
        desc: '+10% опыта-стажа 🎖 за пройденные этапы за ступень. Можно купить четырежды!',
        icon: '🎖',
        prices: [
            1000,
            2500,
            6200,
            14000
        ],
        reqLevel: 3,
        step: 10
    },
    {
        id: 'scorecoins',
        cat: 'meta',
        name: 'Кассовый куш',
        desc: 'В конце забега кэшбэк: 0.5% очков забега возвращаются монетками 🪙 за ступень. Можно купить трижды!',
        icon: '🏦',
        prices: [
            1600,
            4000,
            9800
        ],
        reqLevel: 8,
        step: 0.5
    }
];
const UPGRADE_MAP = Object.fromEntries(_c1 = UPGRADES.map(_c = (u)=>[
        u.id,
        u
    ]));
_c2 = UPGRADE_MAP;
const DEFAULT_UPGRADES = Object.fromEntries(_c4 = UPGRADES.map(_c3 = (u)=>[
        u.id,
        0
    ]));
_c5 = DEFAULT_UPGRADES;
function parseUpgrades(raw) {
    const out = {
        ...DEFAULT_UPGRADES
    };
    try {
        const v = JSON.parse(raw ?? '');
        if (v && typeof v === 'object') {
            const o = v;
            for (const def of UPGRADES){
                const n = Number(o[def.id]);
                if (Number.isFinite(n) && n > 0) out[def.id] = Math.min(def.prices.length, Math.floor(n));
            }
        }
    } catch  {
    /* пусто — дефолты */ }
    return out;
}
function upgradesBought(state) {
    return UPGRADES.reduce((s, u)=>s + (state[u.id] > 0 ? 1 : 0), 0);
}
function upgradesAllMaxed(state) {
    return UPGRADES.every((u)=>state[u.id] >= u.prices.length);
}
function upgradeBonuses(state) {
    return {
        carryPlus: state.capacity,
        heartsPlus: state.hearts,
        /* «Сливочное масло» */ grainMult01: 0.05 * state.butter,
        /* «Золотая удача» */ goldAdd: 0.04 * state.goldluck,
        /* «Магнит-приманка» */ grabR01: 0.06 * state.magnet,
        /* «Щедрая волна» */ grains: 2 * state.seeds,
        /* «Длинный сеанс» */ timePlus: 3 * state.timeplus,
        /* «Проворная лапка» */ speedAdd: 0.05 * state.speed,
        /* «Сапёр» */ cornCut: state.miner,
        /* «Запасной щит» */ shields: state.shield,
        /* «Крепкий нос» */ stunCut: 0.3 * state.stun,
        /* «Кроткий голубь» */ pigeonLate: 3 * state.pigeonlate,
        /* «Мир с голубем»: воришка тащит на 1 зерно меньше за ступень */ pigeonStealCut: state.pigeonguard,
        /* «Долгая жара» */ feverPlus: state.fevertime,
        /* «Фартовщик» */ feverLuck: 0.05 * state.feverluck,
        /* «Жаркий урожай»: очки в ЛИХОРАДКЕ +10% за ступень */ feverMult01: 0.1 * state.fevermult,
        /* «Щедрые сундуки» */ giftAdd: 0.25 * state.gift,
        /* «Комбо-тренер» */ comboFast: state.combo > 0,
        /* «Быстрый старт»: серия начинается с запаса +5 за ступень */ comboStart: 5 * state.combostart,
        /* «Комбо-броня»: по одному спасению серии за ступень */ comboArmor: state.comboarmor,
        /* «Монетный магнит» */ coinsAdd: 0.1 * state.coins,
        /* «Умный котик» */ xpAdd: 0.1 * state.xpboost,
        /* «Кассовый куш»: 0.5% очков забега монетками за ступень */ scoreCoins01: 0.005 * state.scorecoins,
        /* «Ранняя попкорнина»: выходит на 1.5 сек раньше за ступень */ bigEarly: 1.5 * state.bigchance,
        /* «Живучая попкорнина»: +1 сек к жизни за ступень */ bigLife: state.bigtime,
        /* «Сладкая глазурь»: очки попкорнин +10% за ступень */ bigMult01: 0.1 * state.bigmult,
        /* «Золотая сдача»: +1 монетка за золотое зерно за ступень */ goldCoinPer: state.goldcoin,
        /* «Призовые малыша»: монетки с боссов +12% за ступень */ bossCoins01: 0.12 * state.bosscoins,
        /* «Долгий бой»: +3 сек в босс-бою за ступень */ bossTime: 3 * state.bosstime,
        /* «Меткий пинок»: порог пинка −6% за ступень */ flingEase01: 0.06 * state['flingease'],
        /* «Мягкие рукавички»: шанс не потерять сердце от касания босса */ bossGuard01: 0.12 * state.bossheart
    };
}
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "UPGRADE_MAP$Object.fromEntries$UPGRADES.map");
__turbopack_context__.k.register(_c1, "UPGRADE_MAP$Object.fromEntries");
__turbopack_context__.k.register(_c2, "UPGRADE_MAP");
__turbopack_context__.k.register(_c3, "DEFAULT_UPGRADES$Object.fromEntries$UPGRADES.map");
__turbopack_context__.k.register(_c4, "DEFAULT_UPGRADES$Object.fromEntries");
__turbopack_context__.k.register(_c5, "DEFAULT_UPGRADES");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/game/version.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Версия игры POPCORN PAWS.
 * Меняется вручную при каждом релизе; бейдж виден в главном меню
 * справа внизу, чтобы всегда можно было понять, какая сборка на проде.
 */ __turbopack_context__.s([
    "GAME_STAGE",
    ()=>GAME_STAGE,
    "GAME_VERSION",
    ()=>GAME_VERSION,
    "GAME_VERSION_LABEL",
    ()=>GAME_VERSION_LABEL
]);
const GAME_VERSION = '0.0.51';
const GAME_STAGE = 'pre-alpha';
const GAME_VERSION_LABEL = `${GAME_STAGE} ${GAME_VERSION}`;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_game_0l8qn-offm-6r._.js.map