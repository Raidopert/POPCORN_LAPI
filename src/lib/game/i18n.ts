/**
 * Переводы «Кошачьего попкорнного Беспредела» на 4 языка:
 * русский · английский · немецкий · испанский.
 *
 * Каждая строка — кортеж [ru, en, de, es]. Плейсхолдеры вида {{n}}
 * подставляются через vars. Движок получает tFor(lang) через setLang.
 */

export type Lang = 'ru' | 'en' | 'de' | 'es'

export const LANGS: Array<{ id: Lang; label: string; flag: string }> = [
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
]

export const LOCALES: Record<Lang, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
}

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string

type Row = [string, string, string, string]

const T: Record<string, Row> = {
  /* ---------- меню ---------- */
  'app.title': [
    'КОШАЧИЙ ПОПКОРННЫЙ БЕСПРЕДЕЛ',
    'CAT POPCORN MAYHEM',
    'KATZEN-POPKORN-CHAOS',
    'CAOS GATUNO DE PALOMITAS',
  ],
  'app.tagline': [
    '8-битный рогалик-аркада · бесконечные уровни',
    '8-bit roguelike arcade · endless levels',
    '8-Bit-Roguelike-Arcade · endlose Level',
    'Arcade roguelike 8 bits · niveles infinitos',
  ],
  'menu.record': ['Рекорд: {{n}}', 'Best: {{n}}', 'Rekord: {{n}}', 'Récord: {{n}}'],
  'menu.xp': ['Опыт: {{n}}', 'XP: {{n}}', 'XP: {{n}}', 'Exp: {{n}}'],
  'menu.play': ['▶ ИГРАТЬ', '▶ PLAY', '▶ SPIELEN', '▶ JUGAR'],
  'menu.rules': ['📖 ПРАВИЛА', '📖 RULES', '📖 REGELN', '📖 REGLAS'],
  'menu.leaders': ['ЛИДЕРЫ', 'RANKING', 'BESTEN', 'RÉCORDS'],
  'menu.paws': ['ЛАПКИ', 'PAWS', 'PFOTEN', 'PATITAS'],
  'menu.ach': ['АЧИВКИ', 'AWARDS', 'ERFOLGE', 'LOGROS'],
  'menu.creators': ['СОЗДАТЕЛИ', 'CREDITS', 'AUTOREN', 'CREDITOS'],
  'menu.settings': ['⚙️ НАСТРОЙКИ', '⚙️ SETTINGS', '⚙️ EINSTELLUNGEN', '⚙️ AJUSTES'],
  'menu.install': [
    'УСТАНОВИТЬ НА ТЕЛЕФОН',
    'INSTALL ON PHONE',
    'AUF HANDY INSTALLIEREN',
    'INSTALAR EN EL MÓVIL',
  ],
  'main.aria': [
    'Игровое поле: соберите рассыпанный попкорн в стаканчик лапкой куницы',
    'Play field: gather spilled popcorn into the cup with the marten paw',
    'Spielfeld: verstreutes Popcorn mit der Marderpfote einsammeln',
    'Campo de juego: recoge las palomitas en el vaso con la patita de marta',
  ],
  'footer.text': [
    '🌽 Кошачий попкорнный Беспредел · 8-битный рогалик · сделано с ❤️',
    '🌽 Cat Popcorn Mayhem · 8-bit roguelike · made with ❤️',
    '🌽 Katzen-Popkorn-Chaos · 8-Bit-Roguelike · mit ❤️ gemacht',
    '🌽 Caos Gatuno de Palomitas · roguelike 8 bits · hecho con ❤️',
  ],
  'img.catMenu': [
    'Рыжий кот держит ведро с попкорном',
    'Red cat holding a popcorn bucket',
    'Rote Katze mit einem Popcorneimer',
    'Gato rojo sosteniendo un cubo de palomitas',
  ],

  /* ---------- ник ---------- */
  'nick.gate.title': [
    'КАК ТЕБЯ ЗОВУТ?',
    "WHAT'S YOUR NAME?",
    'WIE HEISST DU?',
    '¿CÓMO TE LLAMAS?',
  ],
  'nick.edit.title': [
    'СМЕНИТЬ НИК',
    'CHANGE NICKNAME',
    'NICKNAME ÄNDERN',
    'CAMBIAR APODO',
  ],
  'nick.gate.desc': [
    'Введи имя кота-ловца — под ним ты попадёшь в мировую таблицу лидеров! 🌍',
    'Type your catcher-cat name — the world leaderboard will know you by it! 🌍',
    'Gib den Namen deiner Fangkatze ein — so kennt dich die Weltbestenliste! 🌍',
    'Escribe el nombre de tu gato cazador: ¡entrarás en la tabla mundial! 🌍',
  ],
  'nick.edit.desc': [
    'Новое имя появится в мировом рейтинге после следующего забега',
    'The new name appears in the world ranking after your next run',
    'Der neue Name erscheint nach dem nächsten Lauf in der Weltrangliste',
    'El nuevo nombre aparecerá en el ranking mundial tras la próxima partida',
  ],
  'nick.placeholder': ['Мурзик', 'Whiskers', 'Minka', 'Bigotes'],
  'nick.aria': [
    'Никнейм для мировой таблицы лидеров',
    'Nickname for the world leaderboard',
    'Nickname für die Weltbestenliste',
    'Apodo para la tabla mundial',
  ],
  'nick.hint': ['От 2 до 24 символов', 'From 2 to 24 characters', '2 bis 24 Zeichen', 'De 2 a 24 caracteres'],
  'nick.confirm': ['ЭТО Я! ▶', "THAT'S ME! ▶", 'DAS BIN ICH! ▶', '¡SOY YO! ▶'],
  'nick.save': ['СОХРАНИТЬ', 'SAVE', 'SPEICHERN', 'GUARDAR'],
  'nick.enter': ['ВВЕДИ ИМЯ', 'TYPE A NAME', 'NAMEN EINGEBEN', 'ESCRIBE UN NOMBRE'],
  'nick.anon': [
    'ОСТАВИТЬСЯ АНОНИМНЫМ КОТИКОМ',
    'STAY ANONYMOUS KITTY',
    'ANONYM ALS KATZE BLEIBEN',
    'SEGUIR ANÓNIMO GATITO',
  ],
  'nick.cancel': ['ОТМЕНА', 'CANCEL', 'ABBRECHEN', 'CANCELAR'],
  'nick.default': ['Котик', 'Kitty', 'Kätzchen', 'Gatito'],
  'nick.editHint': [
    'Сменить ник для мировой таблицы',
    'Change world board nickname',
    'Weltriste-Nickname ändern',
    'Cambiar apodo de la tabla mundial',
  ],

  /* ---------- магазин ---------- */
  'shop.title': ['МАГАЗИН', 'SHOP', 'LADEN', 'TIENDA'],
  'shop.xp': [
    'Опыт: {{n}} 🍿 · покупки остаются навсегда',
    'XP: {{n}} 🍿 · purchases are yours forever',
    'XP: {{n}} 🍿 · Käufe bleiben für immer',
    'Exp: {{n}} 🍿 · las compras son para siempre',
  ],
  'shop.tab.paws': ['🐾 ЛАПКИ', '🐾 PAWS', '🐾 PFOTEN', '🐾 PATITAS'],
  'shop.tab.upgrades': ['🛠 АПГРЕЙДЫ', '🛠 UPGRADES', '🛠 UPGRADES', '🛠 MEJORAS'],
  'shop.badge.base': ['БАЗОВАЯ', 'BASIC', 'STANDARD', 'BÁSICA'],
  'shop.equipped': ['НАДЕТА', 'EQUIPPED', 'ANGELEGT', 'EQUIPADA'],
  'shop.equip': ['НАДЕТЬ', 'EQUIP', 'ANLEGEN', 'EQUIPAR'],
  'shop.max': ['МАКСИМУМ', 'MAXED', 'MAXIMUM', 'MÁXIMO'],
  'shop.note': [
    'Очки попкорна = опыт: играй забеги и копи на улучшения!',
    'Popcorn points = XP: play runs and save up for upgrades!',
    'Popcorn-Punkte = XP: spiele Läufe und spare für Upgrades!',
    'Puntos de palomitas = exp: ¡juega y ahorra para mejoras!',
  ],
  'shop.close': ['ЗАКРЫТЬ', 'CLOSE', 'SCHLIESSEN', 'CERRAR'],

  'paw.classic.name': ['Рыжая классика', 'Classic Red', 'Klassisches Rot', 'Clásica Roja'],
  'paw.classic.desc': [
    'Родная тёплая лапка куницы. Проверена попкорном!',
    "The marten's own warm paw. Popcorn-tested!",
    'Die warme Pfote der heimischen Marder. Popcorn-erprobt!',
    'La patita cálida de la marta. ¡Probada con palomitas!',
  ],
  'paw.classic.bonus': [
    'Без бонуса — чистое мастерство',
    'No bonus — pure skill',
    'Kein Bonus — pures Können',
    'Sin bonus: pura maestría',
  ],
  'paw.ember.name': ['Уголёк', 'Ember', 'Glutkohle', 'Brasita'],
  'paw.ember.desc': [
    'Чёрная как смоль, но зёрна чует чуть лучше всех.',
    'Black as coal, yet smells kernels a bit better than all.',
    'Schwarz wie Kohle, riecht Körner aber etwas besser.',
    'Negra como el carbón, pero huele los granos un poco mejor.',
  ],
  'paw.ember.bonus': ['Радиус подбора +10%', 'Grab radius +10%', 'Greifradius +10%', 'Radio +10%'],
  'paw.snow.name': ['Снежка', 'Snowball', 'Schneeball', 'Bola de Nieve'],
  'paw.snow.desc': [
    'Белая пушистика с красными коготками-оберегами.',
    'White fluffball with red charm-claws.',
    'Weißes Flauschtier mit roten Schutzkrallen.',
    'Bola blanca y esponjosa con garras-amuleto rojas.',
  ],
  'paw.snow.bonus': [
    '25% шанс: мина не отнимет очко',
    '25% chance a mine costs no point',
    '25% Chance: Mine kostet keinen Punkt',
    '25% de que la mina no quite punto',
  ],
  'paw.flame.name': ['Огонёк', 'Flame', 'Flämmchen', 'Llamita'],
  'paw.flame.desc': [
    'Горячая шёрстка подгоняет часы — времени чуть больше.',
    'Hot fur speeds the clock — a bit more time.',
    'Heißes Fell beschleunigt die Uhr — etwas mehr Zeit.',
    'Su pelaje caliente da un poco más de tiempo.',
  ],
  'paw.flame.bonus': [
    '+5 секунд к каждому уровню',
    '+5 seconds to every level',
    '+5 Sekunden pro Level',
    '+5 segundos por nivel',
  ],
  'paw.lime.name': ['Лаймовая', 'Lime', 'Limette', 'Lima'],
  'paw.lime.desc': [
    'Яркая, как летний луг. Золото само липнет к шерсти.',
    'Bright as a summer meadow. Gold sticks to this fur.',
    'Leuchtend wie eine Sommerwiese. Gold bleibt am Fell kleben.',
    'Viva como un prado de verano. El oro se le pega.',
  ],
  'paw.lime.bonus': [
    'Золотых зёрен заметно больше',
    'Noticeably more golden kernels',
    'Deutlich mehr goldene Körner',
    'Bastantes más granos dorados',
  ],
  'paw.teal.name': ['Бирюзовая', 'Teal', 'Türkis', 'Turquesa'],
  'paw.teal.desc': [
    'Прохладный морской окрас. Кукуруза её побаивается.',
    'Cool sea color. Even corn fears it.',
    'Kühles Meereskleid. Sogar der Mais fürchtet sie.',
    'Color marino fresco. Hasta el maíz la teme.',
  ],
  'paw.teal.bonus': [
    'На одну мину меньше в каждой волне',
    'One mine less in every wave',
    'Eine Mine weniger pro Welle',
    'Una mina menos por oleada',
  ],
  'paw.thimble.name': ['Напёрсток', 'Thimble', 'Fingerhut', 'Dedal'],
  'paw.thimble.desc': [
    'Портновская точность: лапка и юркая, и цепкая, как игла.',
    'Tailor-precision: nimble and needle-sharp.',
    'Schneiderpräzision: flink und nadelspitz.',
    'Precisión de sastre: ágil y fina como una aguja.',
  ],
  'paw.thimble.bonus': [
    'Радиус +15% и лапка проворнее',
    'Radius +15% and a nimbler paw',
    'Radius +15% und flinker',
    'Radio +15% y más ágil',
  ],
  'paw.berry.name': ['Малиновая', 'Raspberry', 'Himbeere', 'Frambuesa'],
  'paw.berry.desc': [
    'Сладкая и шустрая — ягодный заряд бодрости.',
    'Sweet and quick — a berry energy boost.',
    'Süß und flink — Beeren-Energiekick.',
    'Dulce y veloz: un impulso de fruta.',
  ],
  'paw.berry.bonus': [
    'Радиус +20% и лапка проворнее',
    'Radius +20% and a nimbler paw',
    'Radius +20% und flinker',
    'Radio +20% y más ágil',
  ],
  'paw.strawberry.name': ['Клубничная', 'Strawberry', 'Erdbeere', 'Fresa'],
  'paw.strawberry.desc': [
    'Спелая ягода в крапинку — мины на неё натыкаются и стесняются.',
    'A ripe speckled berry — mines bump in and feel shy.',
    'Eine reife gepunktete Beere — Minen scheuen sich.',
    'Baya madura con pecas: las minas se avergüenzan.',
  ],
  'paw.strawberry.bonus': [
    '35% шанс: мина не отнимет очко',
    '35% chance a mine costs no point',
    '35% Chance: Mine kostet keinen Punkt',
    '35% de que la mina no quite punto',
  ],
  'paw.rainbow.name': ['Радужная', 'Rainbow', 'Regenbogen', 'Arcoíris'],
  'paw.rainbow.desc': [
    'Все цвета радуги на трёх пальцах! Носит больше зерна.',
    'All rainbow colors on three fingers! Carries more kernels.',
    'Alle Regenbogenfarben an drei Fingern! Trägt mehr Körner.',
    '¡Todos los colores del arcoíris! Lleva más granos.',
  ],
  'paw.rainbow.bonus': ['Вместимость +1 зерно', 'Capacity +1 kernel', 'Kapazität +1 Korn', 'Capacidad +1 grano'],
  'paw.leopard.name': ['Леопардовая', 'Leopard', 'Leopard', 'Leopardo'],
  'paw.leopard.desc': [
    'Королевский зверь: пятнистая роскошь и вся мощь сразу!',
    'A royal beast: spotted luxury and all powers at once!',
    'Königliches Tier: gepunkteter Luxus und alle Kräfte!',
    'Bestia real: lujo moteado y todos los poderes.',
  ],
  'paw.leopard.bonus': [
    '+5 сек · радиус +15% · мин −1 · больше золота',
    '+5 sec · radius +15% · −1 mine · more gold',
    '+5 Sek · Radius +15% · −1 Mine · mehr Gold',
    '+5 seg · radio +15% · −1 mina · más oro',
  ],
  'paw.neon.name': ['Неоновая', 'Neon', 'Neon', 'Neón'],
  'paw.neon.desc': [
    'Светится в темноте кинозала и мелькает быстрее всех!',
    'Glows in the dark cinema hall and flashes faster than all!',
    'Leuchtet im dunklen Kino und blitzt schneller als alle!',
    'Brilla en la sala oscura y es la más rápida.',
  ],
  'paw.neon.bonus': ['Скорость лапки +40%', 'Paw speed +40%', 'Pfotentempo +40%', 'Velocidad +40%'],
  'paw.goldenpaw.name': ['Золотая лапка', 'Golden Paw', 'Goldpfote', 'Patita de Oro'],
  'paw.goldenpaw.desc': [
    'Легендарный артефакт: золото липнет к ней, как попкорн к маслу!',
    'A legendary artifact: gold sticks to it like popcorn to butter!',
    'Legendärer Artefakt: Gold haftet wie Popcorn an Butter!',
    'Artefacto legendario: ¡el oro se le pega como palomitas a la mantequilla!',
  ],
  'paw.goldenpaw.bonus': [
    'Золота +10% и вместимость +1',
    'Gold +10% and capacity +1',
    'Gold +10% und Kapazität +1',
    'Oro +10% y capacidad +1',
  ],

  'upg.capacity.name': ['Большой стаканчик', 'Big Cup', 'Großer Becher', 'Vaso Grande'],
  'upg.capacity.desc': [
    'Лапка носит на одно зерно больше в каждом забеге. Можно купить дважды!',
    'The paw carries one more kernel every run. Buyable twice!',
    'Die Pfote trägt pro Lauf ein Korn mehr. Zweimal kaufbar!',
    'La patita lleva un grano más en cada partida. ¡Se compra dos veces!',
  ],
  'upg.capacity.effect': ['Вместимость +{{n}} зерно(-а)', 'Capacity +{{n}}', 'Kapazität +{{n}}', 'Capacidad +{{n}}'],
  'upg.life.name': ['Девятая жизнь', 'Ninth Life', 'Neuntes Leben', 'Novena Vida'],
  'upg.life.desc': [
    'Один раз за забег, когда время выйдет, можно продолжить с тем же счётом (+15 секунд).',
    'Once per run, when time runs out, you may continue with the same score (+15 sec).',
    'Einmal pro Lauf darfst du nach Ablauf weitermachen (+15 Sek).',
    'Una vez por partida puedes seguir al acabarse el tiempo (+15 seg).',
  ],
  'upg.life.effect': [
    'Второй шанс доступен каждый забег',
    'Second chance available every run',
    'Zweite Chance in jedem Lauf',
    'Segunda oportunidad en cada partida',
  ],
  'upg.life.effectNone': [
    'Пока без второго шанса',
    'No second chance yet',
    'Noch keine zweite Chance',
    'Sin segunda oportunidad aún',
  ],
  'upg.startperk.name': ['Счастливый сундучок', 'Lucky Chest', 'Glückstruhe', 'Cofre Afortunado'],
  'upg.startperk.desc': [
    'Каждый новый забег начинается со случайным БОНУСНЫМ перком первого уровня.',
    'Every new run starts with a random BONUS perk of level one.',
    'Jeder Lauf startet mit einem zufälligen BONUS-Perk.',
    'Cada partida empieza con un perk de BONUS aleatorio.',
  ],
  'upg.startperk.effect': [
    'Забег стартует с бонус-перком',
    'Run starts with a bonus perk',
    'Lauf startet mit Bonus-Perk',
    'La partida empieza con un perk',
  ],
  'upg.startperk.effectNone': [
    'Пока без стартового перка',
    'No starting perk yet',
    'Noch kein Start-Perk',
    'Sin perk inicial aún',
  ],
  'upg.none': ['Пока без бонуса', 'No bonus yet', 'Noch kein Bonus', 'Sin bonus aún'],

  /* ---------- достижения ---------- */
  'ach.title': ['ДОСТИЖЕНИЯ', 'AWARDS', 'ERFOLGE', 'LOGROS'],
  'ach.progress': ['Открыто {{a}} из {{b}}', 'Unlocked {{a}} of {{b}}', '{{a}} von {{b}} offen', 'Abierto {{a}} de {{b}}'],
  'ach.score100.name': ['Первая сотня', 'First Hundred', 'Erste Hundert', 'Primera Centena'],
  'ach.score100.desc': [
    'Набрать 100 очков за один забег',
    'Score 100 points in one run',
    '100 Punkte in einem Lauf',
    'Conseguir 100 puntos en una partida',
  ],
  'ach.combo10.name': ['Комбо-мастер', 'Combo Master', 'Combo-Meister', 'Maestro del Combo'],
  'ach.combo10.desc': [
    'Серия из 10 сдач подряд без мины',
    'A streak of 10 clean deliveries',
    '10 Übergaben in Serie ohne Mine',
    'Racha de 10 entregas seguidas sin mina',
  ],
  'ach.golden1.name': ['Золотая лапка', 'Golden Catch', 'Goldkorn', 'Grano Dorado'],
  'ach.golden1.desc': [
    'Поймать золотое зерно (+5 очков)',
    'Catch a golden kernel (+5 points)',
    'Ein goldenes Korn fangen (+5 Punkte)',
    'Atrapar un grano dorado (+5 puntos)',
  ],
  'ach.pigeon1.name': ['Птице-гонщик', 'Bird Chaser', 'Taubenjäger', 'Cazador de Palomas'],
  'ach.pigeon1.desc': [
    'Прогнать голубя-воришку лапкой',
    'Shoo away the thieving pigeon',
    'Den klauenden Tauber vertreiben',
    'Ahuyentar a la paloma ladrona',
  ],
  'ach.level5.name': ['Киношка', 'Movie Buff', 'Kino-Fan', 'Cinéfilo'],
  'ach.level5.desc': ['Дойти до 5-го уровня', 'Reach level 5', 'Erreiche Level 5', 'Llega al nivel 5'],
  'ach.level10.name': ['Мастер попкорна', 'Popcorn Master', 'Popcorn-Meister', 'Maestro de Palomitas'],
  'ach.level10.desc': ['Дойти до 10-го уровня', 'Reach level 10', 'Erreiche Level 10', 'Llega al nivel 10'],
  'ach.rich1k.name': ['Попкорн-богач', 'Popcorn Tycoon', 'Popcorn-Magnat', 'Magnate de Palomitas'],
  'ach.rich1k.desc': [
    'Накопить 1000 опыта в банке',
    'Bank 1000 XP',
    '1000 XP ansparen',
    'Ahorrar 1000 de experiencia',
  ],
  'ach.shopper.name': ['Модная лапка', 'Stylish Paw', 'Modische Pfote', 'Patita a la Moda'],
  'ach.shopper.desc': [
    'Купить любую лапку в магазине',
    'Buy any paw in the shop',
    'Eine Pfote im Laden kaufen',
    'Compra cualquier patita en la tienda',
  ],
  'ach.collector.name': ['Коллекционер', 'Collector', 'Sammler', 'Coleccionista'],
  'ach.collector.desc': [
    'Владеть пятью лапками сразу',
    'Own five paws at once',
    'Fünf Pfoten gleichzeitig besitzen',
    'Tener cinco patitas a la vez',
  ],
  'ach.upgrade1.name': ['Обустроился', 'Well Equipped', 'Eingerichtet', 'Bien Equipado'],
  'ach.upgrade1.desc': [
    'Купить постоянный апгрейд',
    'Buy a permanent upgrade',
    'Ein dauerhaftes Upgrade kaufen',
    'Compra una mejora permanente',
  ],
  'ach.toast': [
    'Достижение открыто!',
    'Achievement unlocked!',
    'Erfolg freigeschaltet!',
    '¡Logro desbloqueado!',
  ],

  /* ---------- перки ---------- */
  'perk.tag.curse': ['☠ ПРОКЛЯТЬЕ', '☠ CURSE', '☠ FLUCH', '☠ MALDICIÓN'],
  'perk.tag.bonus': ['✨ БОНУС', '✨ BONUS', '✨ BONUS', '✨ PREMIO'],
  'perk.rot180.name': ['Вверх тормашками', 'Upside Down', 'Kopfständig', 'Boca Abajo'],
  'perk.rot180.desc': [
    'Экран переворачивается на 180°, и лапка идёт против пальца!',
    'The screen flips 180° — the paw moves against your finger!',
    'Der Bildschirm dreht sich um 180° — die Pfote wandert gegen den Finger!',
    '¡La pantalla gira 180° y la patita va al revés del dedo!',
  ],
  'perk.rot90.name': ['Всё на боку!', 'On Its Side!', 'Alles Quer!', '¡Todo de Lado!'],
  'perk.rot90.desc': [
    'Экран ложится набок, а лапка двигается «наоборот» — двойная путаница!',
    'The screen lies on its side and the paw moves the "wrong" way — double trouble!',
    'Der Bildschirm liegt quer, die Pfote bewegt sich "verkehrt" — doppelt wild!',
    'La pantalla se tumba de lado y la patita va "al revés": ¡doble lío!',
  ],
  'perk.mirror.name': ['Зеркальный мир', 'Mirror World', 'Spiegelwelt', 'Mundo Espejo'],
  'perk.mirror.desc': [
    'Мир отражён по горизонтали: тянешь вправо — лапка уходит влево!',
    'The world is mirrored: pull right, the paw goes left!',
    'Die Welt ist gespiegelt: rechts ziehen, Pfote geht links!',
    '¡Mundo reflejado: tiras a la derecha y la patita va a la izquierda!',
  ],
  'perk.grayscale.name': ['Чёрно-белое кино', 'Black & White', 'Schwarzweißkino', 'Cine Blanco y Negro'],
  'perk.grayscale.desc': [
    'Мир теряет краски. Ищи попкорн среди серых теней, как в старом фильме!',
    'The world loses color — find popcorn among gray shadows, like an old film!',
    'Die Welt verliert Farben — suche Popcorn in grauen Schatten!',
    'El mundo pierde color: busca palomitas entre sombras grises.',
  ],
  'perk.slowpaw.name': ['Тяжёлая лапа', 'Heavy Paw', 'Schwere Pfote', 'Patita Pesada'],
  'perk.slowpaw.desc': [
    'Лапка налила свинца: тянется к цели в два раза медленнее.',
    'The paw turned to lead: reaches twice as slowly.',
    'Die Pfote ist schwer wie Blei: doppelt so langsam.',
    'La patita se llenó de plomo: llega el doble de lenta.',
  ],
  'perk.smallpaw.name': ['Мини-лапка', 'Mini Paw', 'Mini-Pfote', 'Minipatita'],
  'perk.smallpaw.desc': [
    'Лапка заметно уменьшилась — зачерпнуть зерно можно только вплотную.',
    'The paw shrank — you can only scoop kernels up close.',
    'Die Pfote schrumpfte — nur im direkten Kontakt greifen.',
    'La patita se encogió: solo atrapas granos pegada a ellos.',
  ],
  'perk.shaky.name': ['Нервная лапа', 'Nervous Paw', 'Nervöse Pfote', 'Patita Nerviosa'],
  'perk.shaky.desc': [
    'Лапка подрагивает и дёргается — прицелиться стало трудно.',
    'The paw twitches and jolts — aiming is hard now.',
    'Die Pfote zuckt — Zielen wird schwer.',
    'La patita tiembla y tira: apuntar es difícil.',
  ],
  'perk.cornrain.name': ['Кукурузный ливень', 'Corn Downpour', 'Mais-Schauer', 'Lluvia de Maíz'],
  'perk.cornrain.desc': [
    'Кукурузы-мин падает вдвое больше! Маршрут — только по чистому полу.',
    'Twice as many corn mines fall! Route through the clean floor only.',
    'Doppelt so viele Minen! Nur über den freien Boden laufen.',
    '¡Cae el doble de minas! Pasa solo por el suelo limpio.',
  ],
  'perk.fog.name': ['Попкорнный туман', 'Popcorn Fog', 'Popcornnebel', 'Niebla de Palomitas'],
  'perk.fog.desc': [
    'Поле тонет в тумане: видно только то, что рядом с лапкой.',
    'The field sinks into fog: you only see what is near the paw.',
    'Das Feld versinkt im Nebel: nur das Nahe ist sichtbar.',
    'El campo se hunde en niebla: solo ves lo que rodea a la patita.',
  ],
  'perk.drift.name': ['Скользкий пол', 'Slippery Floor', 'Rutschiger Boden', 'Suelo Resbaladizo'],
  'perk.drift.desc': [
    'Зёрна катаются по полу в разные стороны — поймай их первыми!',
    'Kernels roll in every direction — beat them to it!',
    'Körner rollen in alle Richtungen — sei schneller!',
    'Los granos ruedan en todas direcciones: ¡gánalos la carrera!',
  ],
  'perk.magnet.name': ['Магнитная лапа', 'Magnet Paw', 'Magnetpfote', 'Patita Imán'],
  'perk.magnet.desc': [
    'Попкорн сам прыгает в лапку, стоит подойти поближе!',
    'Nearby popcorn hops right into the paw!',
    'Popcorn springt von selbst in die nahe Pfote!',
    'Las palomitas saltan solas a la patita cercana.',
  ],
  'perk.goldenvein.name': ['Золотая жила', 'Golden Vein', 'Goldader', 'Vena Dorada'],
  'perk.goldenvein.desc': [
    'Золотых зёрен (+5 очков) стало в разы больше. Греби богатство!',
    'Far more golden kernels (+5 points). Rake in the riches!',
    'Viel mehr goldene Körner (+5). Ernte den Reichtum!',
    'Muchos más granos dorados (+5). ¡Amasa la fortuna!',
  ],
  'perk.doublepoints.name': ['Двойной улов', 'Double Catch', 'Doppelfang', 'Doble Captura'],
  'perk.doublepoints.desc': [
    'Все очки удваиваются! Но и норма попкорна на уровень +30%.',
    'All points doubled! But the level quota is +30%.',
    'Alle Punkte doppelt! Aber die Quote +30%.',
    '¡Puntos ×2! Pero la cuota del nivel es +30%.',
  ],
  'perk.bigpaw.name': ['Лапа великана', 'Giant Paw', 'Riesenpfote', 'Patitón'],
  'perk.bigpaw.desc': [
    'Лапка выросла и гребёт разом — зерно летит в неё с большого радиуса.',
    'The paw grew huge — kernels fly in from a wide radius.',
    'Die Pfote wuchs riesig — Körner fliegen von weit her.',
    'La patita creció: los granos vuelan hacia ella desde lejos.',
  ],
  'perk.timeplus.name': ['Кошачьи часы', 'Cat Clock', 'Katzenuhr', 'Reloj Felino'],
  'perk.timeplus.desc': [
    'Целых 75 секунд на уровень вместо 60. Время — резиновое!',
    'A whole 75 seconds per level instead of 60. Stretchy time!',
    'Volle 75 Sekunden statt 60. Die Zeit ist dehnbar!',
    '75 segundos por nivel en vez de 60. ¡Tiempo elástico!',
  ],
  'perk.shield.name': ['Кошачий щит', 'Cat Shield', 'Katzenschild', 'Escudo Felino'],
  'perk.shield.desc': [
    'Первое попадание в мину за уровень прощается — щит лопается с шипением!',
    'The first mine hit this level is forgiven — the shield pops with a hiss!',
    'Die erste Mine wird verziehen — der Schild platzt zischend!',
    'La primera mina se perdona: ¡el escudo estalla con un siseo!',
  ],
  'perk.secondcup.name': ['Двойной стаканчик', 'Double Cup', 'Doppelter Becher', 'Vaso Doble'],
  'perk.secondcup.desc': [
    'Лапка носит на 2 зерна больше, а сдавать попкорн можно с дальнего подлёта!',
    'The paw carries +2 kernels and delivers from afar!',
    'Die Pfote trägt +2 Körner, Abgabe aus der Ferne!',
    'La patita lleva +2 granos y entrega a distancia.',
  ],
  'perk.slowmo.name': ['Черепаший час', 'Turtle Hour', 'Schildkrötenstunde', 'Hora Tortuga'],
  'perk.slowmo.desc': [
    'Таймер тикает на четверть медленнее: по сути, 80 секунд вместо 60!',
    'The timer ticks 25% slower: 80 seconds instead of 60!',
    'Der Timer tickt 25% langsamer: 80 statt 60 Sekunden!',
    'El reloj corre un 25% más lento: ¡80 segundos en vez de 60!',
  ],

  /* ---------- сундук ---------- */
  'chest.title': [
    'УРОВЕНЬ {{n}} ПРОЙДЕН!',
    'LEVEL {{n}} CLEARED!',
    'LEVEL {{n}} GESCHAFFT!',
    '¡NIVEL {{n}} SUPERADO!',
  ],
  'chest.bonus': [
    'Бонус за скорость: +{{b}} · Счёт: {{s}}',
    'Speed bonus: +{{b}} · Score: {{s}}',
    'Tempobonus: +{{b}} · Punkte: {{s}}',
    'Bonus de velocidad: +{{b}} · Puntos: {{s}}',
  ],
  'chest.choose': [
    'Выбери сундучок — он решит судьбу следующего уровня',
    'Pick a chest — it decides the fate of your next level',
    'Wähle eine Truhe — sie entscheidet das nächste Level',
    'Elige un cofre: decidirá el destino de tu próximo nivel',
  ],
  'chest.chest': ['СУНДУК', 'CHEST', 'TRUHE', 'COFRE'],
  'chest.opened': ['ОТКРЫТ', 'OPENED', 'GEÖFFNET', 'ABIERTO'],
  'chest.openN': ['Открыть сундучок {{n}}', 'Open chest {{n}}', 'Truhe {{n}} öffnen', 'Abrir cofre {{n}}'],
  'chest.quotaInfo': [
    'Уровень {{n}}: норма {{q}} 🍿 за {{s}} сек',
    'Level {{n}}: quota {{q}} 🍿 in {{s}} sec',
    'Level {{n}}: Quote {{q}} 🍿 in {{s}} Sek',
    'Nivel {{n}}: cuota {{q}} 🍿 en {{s}} seg',
  ],
  'chest.next': [
    'ДАЛЬШЕ: УРОВЕНЬ {{n}} ▶',
    'NEXT: LEVEL {{n}} ▶',
    'WEITER: LEVEL {{n}} ▶',
    'SIGUIENTE: NIVEL {{n}} ▶',
  ],
  'chest.shop': ['🛒 МАГАЗИН ЛАПОК', '🛒 PAW SHOP', '🛒 PFOTEN-LADEN', '🛒 TIENDA DE PATITAS'],
  'chest.noperks': [
    'Перки отключены в настройках — уровень готов, беги дальше!',
    'Perks are disabled in settings — level is ready, keep running!',
    'Perks sind deaktiviert — das Level wartet, weiter geht',
    'Perks desactivados en ajustes: ¡el nivel espera, sigue!',
  ],
  'quit.button': [
    '⏹ КОНЕЦ ИГРЫ — выйти в меню (опыт сохранится)',
    '⏹ END GAME — back to menu (XP is kept)',
    '⏹ SPIEL BEENDEN — zurück ins Menü (XP bleibt)',
    '⏹ FIN DEL JUEGO — al menú (la exp se guarda)',
  ],
  'quit.short': ['⏹ КОНЕЦ ИГРЫ', '⏹ END GAME', '⏹ SPIELENDE', '⏹ FIN DEL JUEGO'],
  'quit.pauseMenu': [
    '⏹ КОНЕЦ ИГРЫ — В МЕНЮ',
    '⏹ END GAME — MENU',
    '⏹ ENDE — MENÜ',
    '⏹ FIN — MENÚ',
  ],

  /* ---------- пауза ---------- */
  'pause.title': ['ПАУЗА', 'PAUSED', 'PAUSE', 'PAUSA'],
  'pause.info': [
    'Уровень {{l}} · Счёт: {{s}} · Норма {{c}}/{{q}}',
    'Level {{l}} · Score: {{s}} · Quota {{c}}/{{q}}',
    'Level {{l}} · Punkte: {{s}} · Quote {{c}}/{{q}}',
    'Nivel {{l}} · Puntos: {{s}} · Cuota {{c}}/{{q}}',
  ],
  'pause.resume': ['▶ ПРОДОЛЖИТЬ', '▶ RESUME', '▶ WEITER', '▶ CONTINUAR'],
  'hud.pause': ['Пауза', 'Pause', 'Pause', 'Pausa'],
  'hud.mute': ['Выключить звук', 'Mute sound', 'Ton aus', 'Silenciar'],
  'hud.unmute': ['Включить звук', 'Unmute sound', 'Ton an', 'Activar sonido'],

  /* ---------- HUD ---------- */
  'hud.streak': ['серия {{n}}', 'streak {{n}}', 'Serie {{n}}', 'racha {{n}}'],
  'hud.level': ['УР. {{n}}', 'LV {{n}}', 'LVL {{n}}', 'NV {{n}}'],
  'hud.bestPill': ['Рекорд', 'Best', 'Rekord', 'Récord'],

  /* ---------- конец игры ---------- */
  'over.title': ['КВОТА ПРОВАЛЕНА!', 'QUOTA FAILED!', 'QUOTE VERPASST!', '¡CUOTA FALLIDA!'],
  'over.timeup': [
    'Время вышло на {{n}} уровне',
    'Time ran out on level {{n}}',
    'Die Zeit lief in Level {{n}} ab',
    'Se acabó el tiempo en el nivel {{n}}',
  ],
  'over.points': [
    'очков · дошёл до уровня {{n}}',
    'points · reached level {{n}}',
    'Punkte · bis Level {{n}}',
    'puntos · llegaste al nivel {{n}}',
  ],
  'over.xp': [
    '🍿 +{{s}} опыта · всего: {{t}}',
    '🍿 +{{s}} XP · total: {{t}}',
    '🍿 +{{s}} XP · gesamt: {{t}}',
    '🍿 +{{s}} exp · total: {{t}}',
  ],
  'over.rank': [
    '🏆 Место {{n}} в списке лидеров!',
    '🏆 Rank {{n}} on the leaderboard!',
    '🏆 Platz {{n}} in der Bestenliste!',
    '🏆 ¡Puesto {{n}} en la tabla!',
  ],
  'over.nameLabel': [
    'Имя в мировой таблице:',
    'Name on the world board:',
    'Name in der Weltliste:',
    'Nombre en la tabla mundial:',
  ],
  'over.newRecord': ['🎉 НОВЫЙ РЕКОРД!', '🎉 NEW RECORD!', '🎉 NEUER REKORD!', '🎉 ¡NUEVO RÉCORD!'],
  'over.retry': ['ЗАБЕГ ЗАНОВО', 'NEW RUN', 'NEUER LAUF', 'NUEVA PARTIDA'],
  'over.revive': [
    '❤️ ВТОРОЙ ШАНС · +15 СЕК',
    '❤️ SECOND CHANCE · +15 SEC',
    '❤️ ZWEITE CHANCE · +15 SEK',
    '❤️ SEGUNDA OPORTUNIDAD · +15 SEG',
  ],
  'over.share': ['ПОДЕЛИТЬСЯ РЕКОРДОМ', 'SHARE RECORD', 'REKORD TEILEN', 'COMPARTIR RÉCORD'],
  'over.menu': ['В МЕНЮ', 'MENU', 'MENÜ', 'MENÚ'],
  'share.text': [
    'Я набрал {{s}} очков (уровень {{l}}) в «Кошачьем попкорнном Беспределе»! 🐱🍿',
    'I scored {{s}} points (level {{l}}) in Cat Popcorn Mayhem! 🐱🍿',
    'Ich habe {{s}} Punkte (Level {{l}}) im Katzen-Popkorn-Chaos geholt! 🐱🍿',
    '¡Conseguí {{s}} puntos (nivel {{l}}) en Caos Gatuno de Palomitas! 🐱🍿',
  ],
  'share.cardLevel': [
    'уровень {{l}} · рекорд {{b}}',
    'level {{l}} · best {{b}}',
    'Level {{l}} · Rekord {{b}}',
    'nivel {{l}} · récord {{b}}',
  ],
  'share.copied': ['Текст скопирован!', 'Text copied!', 'Text kopiert!', '¡Texto copiado!'],
  'share.sent': ['Отправлено!', 'Sent!', 'Gesendet!', '¡Enviado!'],
  'share.fail': [
    'Не удалось — расскажите друзьям словами 🐾',
    'Failed — tell your friends the old way 🐾',
    'Fehlgeschlagen — erzähle es selbst 🐾',
    'No se pudo: cuéntaselo a tus amigos 🐾',
  ],

  /* ---------- лидеры ---------- */
  'lead.title': ['ЛИДЕРЫ', 'RANKING', 'BESTENLISTE', 'RÉCORDS'],
  'lead.stats': [
    '🚀 Запусков: {{n}} · 🎬 Забегов: {{r}} · 🐱 Котиков: {{p}}',
    '🚀 Launches: {{n}} · 🎬 Runs: {{r}} · 🐱 Cats: {{p}}',
    '🚀 Starts: {{n}} · 🎬 Läufe: {{r}} · 🐱 Katzen: {{p}}',
    '🚀 Inicios: {{n}} · 🎬 Partidas: {{r}} · 🐱 Gatos: {{p}}',
  ],
  'menu.worldLaunches': [
    '🚀 {{n}} запусков в мире',
    '🚀 {{n}} launches worldwide',
    '🚀 {{n}} Starts weltweit',
    '🚀 {{n}} inicios en el mundo',
  ],
  'lead.world': ['🌐 МИР', '🌐 WORLD', '🌐 WELT', '🌐 MUNDO'],
  'lead.local': ['📱 МОЙ ТЕЛЕФОН', '📱 MY PHONE', '📱 MEIN HANDY', '📱 MI MÓVIL'],
  'lead.checking': [
    'Проверяем мировую таблицу…',
    'Checking the world board…',
    'Weltliste wird geprüft…',
    'Comprobando la tabla mundial…',
  ],
  'lead.offline': [
    'Топ-10 забегов на этом устройстве · мировая таблица скоро!',
    'Top-10 runs on this device · world board coming soon!',
    'Top 10 auf diesem Gerät · Weltliste kommt bald!',
    'Top-10 en este dispositivo · ¡tabla mundial pronto!',
  ],
  'lead.emptyLocal': [
    'Пока пусто — поставь первый рекорд! 🍿',
    'Empty so far — set the first record! 🍿',
    'Noch leer — setze den ersten Rekord! 🍿',
    'Vacío aún: ¡marca el primer récord! 🍿',
  ],
  'lead.emptyWorld': [
    'Мировая таблица ждёт первый рекорд — стань первым! 🌍',
    'The world board awaits its first record — be first! 🌍',
    'Die Weltliste wartet auf den ersten Rekord — sei dabei! 🌍',
    'La tabla mundial espera su primer récord: ¡sé el primero! 🌍',
  ],
  'lead.lvl': ['ур. {{n}}', 'lv {{n}}', 'Lvl {{n}}', 'nv {{n}}'],
  'lead.you': ['← ты!', '← you!', '← du!', '← ¡tú!'],

  /* ---------- правила ---------- */
  'rules.title': ['ПРАВИЛА', 'RULES', 'REGELN', 'REGLAS'],
  'rules.ok': ['ПОНЯТНО!', 'GOT IT!', 'VERSTANDEN!', '¡ENTENDIDO!'],
  'rules.note': [
    '🎵 Лучше со звуком: музыка ускоряется к финишу!',
    '🎵 Best with sound: the music speeds up near the finish!',
    '🎵 Am besten mit Ton: die Musik wird schneller!',
    '🎵 Mejor con sonido: ¡la música acelera al final!',
  ],
  'rules.ios': [
    '📱 На iPhone: «Поделиться» → «На экран „Домой“» — игра станет приложением.',
    '📱 iPhone: Share → Add to Home Screen to install the game.',
    '📱 iPhone: Teilen → Startbildschirm — Spiel wird installiert.',
    '📱 iPhone: Compartir → Pantalla de inicio y se instala.',
  ],
  'rules.r1': [
    'Веди лапку пальцем по экрану (на ПК — мышкой)',
    'Drag the paw with your finger (mouse on PC)',
    'Führe die Pfote mit dem Finger (am PC mit der Maus)',
    'Mueve la patita con el dedo (ratón en PC)',
  ],
  'rules.r2': [
    'Собирай попкорн в стаканчик. Золотое зерно = +5!',
    'Gather popcorn into the cup. Golden kernel = +5!',
    'Sammle Popcorn im Becher. Goldenes Korn = +5!',
    'Recoge palomitas en el vaso. ¡Grano dorado = +5!',
  ],
  'rules.r3': [
    'Кукуруза — мины: обходи, заденешь — минус балл',
    'Corn kernels are mines: dodge them or lose a point',
    'Maiskörner sind Minen: ausweichen, sonst Punktabzug',
    'El maíz son minas: evítalas o pierdes un punto',
  ],
  'rules.r4': [
    'Собери норму за 60 секунд — и уровень пройден!',
    'Meet the quota within 60 seconds to clear the level!',
    'Erreiche die Quote in 60 Sekunden — Level geschafft!',
    'Cumple la cuota en 60 segundos y superas el nivel',
  ],
  'rules.r5': [
    'Лапка растёт: сначала несёт 3 зерна, после 5-го уровня — 4, после 10-го — 5!',
    'The paw grows: 3 kernels first, 4 after level 5, 5 after level 10!',
    'Die Pfote wächst: 3 Körner, 4 ab Level 5, 5 ab Level 10!',
    'La patita crece: 3 granos, 4 tras el nivel 5, 5 tras el 10',
  ],
  'rules.r6': [
    'Между уровнями открывай сундучок со случайным перком: бывают бонусы и проклятья',
    'Between levels open a chest with a random perk: bonuses and curses await',
    'Zwischen den Leveln: Truhe mit zufälligem Perk — Bonus oder Fluch',
    'Entre niveles abre un cofre con un perk aleatorio: premios y maldiciones',
  ],
  'rules.r7': [
    'Комбо: за каждую сдачу без мины растёт серия — множитель до ×5! Мина или голубь сбрасывают серию',
    'Combo: every clean delivery grows the streak — up to ×5! Mines and pigeons reset it',
    'Combo: jede saubere Übung wächst bis ×5! Mine oder Taube setzen sie zurück',
    'Combo: cada entrega limpia crece la racha hasta ×5. ¡Mina o paloma la reinician!',
  ],
  'rules.r8': [
    'С 3-го уровня прилетает голубь-воришка: он таскает попкорн из стаканчика — отпугни лапкой и получи +2!',
    'From level 3 a thieving pigeon arrives: it steals popcorn from the cup — shoo it for +2!',
    'Ab Level 3 klaut eine Taube Popcorn aus dem Becher — vertreibe sie für +2!',
    'Desde el nivel 3 viene una paloma ladrona: ahúyentala con la patita y gana +2',
  ],
  'rules.r9': [
    'Каждые 5 уровней попкорна и мин больше, зёрна мельчают, а мины толстеют. Держись!',
    'Every 5 levels: more popcorn and mines, kernels shrink, mines fatten. Hang in there!',
    'Alle 5 Level: mehr Popcorn und Minen, Körner schrumpfen, Minen werden fetter. Halte durch!',
    'Cada 5 niveles: más palomitas y minas, granos más pequeños y minas más gordas. ¡Aguanta!',
  ],
  'rules.r10': [
    'Очки попкорна = опыт: капают в банк сразу. В магазине — лапки и постоянные апгрейды: большой стаканчик, вторая жизнь, стартовый перк!',
    'Popcorn points = XP, banked instantly. In the shop: paws and permanent upgrades — big cup, second life, starting perk!',
    'Popcorn-Punkte = XP, sofort gutgeschrieben. Im Laden: Pfoten und Dauer-Upgrades!',
    'Puntos = exp al instante. En la tienda: patitas y mejoras permanentes.',
  ],
  'rules.r11': [
    'Каждый уровень — новая локация: кинозал, кухня пиццерии, ночной двор, аркадный зал, крыша, парк, чердак и кладовка!',
    'Every level is a new location: cinema hall, pizzeria kitchen, night yard, arcade, sunset roof, park, attic and pantry!',
    'Jedes Level ein neuer Ort: Kino, Pizzeria, Nachthof, Arcade, Dach, Park, Dachboden und Vorratskammer!',
    'Cada nivel es un lugar nuevo: cine, pizzería, patio nocturno, arcade, azotea, parque, ático y despensa.',
  ],
  'rules.r12': [
    'Выполняй достижения — они открываются в меню навсегда',
    'Complete achievements — they unlock in the menu forever',
    'Erfolge abschließen — für immer im Menü sichtbar',
    'Completa logros: se abren para siempre en el menú',
  ],
  'rules.r13': [
    'Кнопка «КОНЕЦ ИГРЫ» — сразу в меню. Собранный опыт сохраняется!',
    'The END GAME button quits to menu instantly. Earned XP is kept!',
    'Die ENDE-Taste führt sofort ins Menü. Gesammeltes XP bleibt!',
    'El botón FIN te lleva al menú al instante. La exp conseguida se guarda.',
  ],
  'rules.r14': [
    'Лучшие забеги попадают в мировую таблицу лидеров под твоим ником (меняется в меню)',
    'Best runs enter the world leaderboard under your nickname (change it in the menu)',
    'Beste Läufe kommen unter deinem Nicknamen in die Weltliste (änderbar im Menü)',
    'Las mejores partidas entran en la tabla mundial con tu apodo (cámbialo en el menú)',
  ],

  /* ---------- создатели ---------- */
  'creators.title': ['СОЗДАТЕЛИ', 'CREATED BY', 'AUTOREN', 'CREADORES'],
  'creators.text': [
    'Мы сделали игру с любовью к кошкам, попкорну, куницам и друг другу!',
    'We made this game with love for cats, popcorn, martens — and each other!',
    'Wir haben dieses Spiel mit Liebe zu Katzen, Popcorn, Mardern — und uns gemacht!',
    'Hicimos este juego con amor a los gatos, las palomitas, las martas y entre nosotros!',
  ],
  'creators.ok': ['ОТЛИЧНО!', 'AWESOME!', 'SUPER!', '¡GENIAL!'],
  'creators.author': ['Автор и правообладатель', 'Author & copyright holder', 'Autor & Urheber', 'Autor y propietario'],
  'creators.muse': ['муза и соавтор', 'muse & co-author', 'Muse & Mitautorin', 'musa y coautora'],
  'creators.contact': ['Связаться с автором:', 'Contact the author:', 'Autor kontaktieren:', 'Contacta al autor:'],
  'creators.support': ['💛 ПОДДЕРЖАТЬ АВТОРА', '💛 SUPPORT THE AUTHOR', '💛 AUTOR UNTERSTÜTZEN', '💛 APOYA AL AUTOR'],
  'creators.donateHint': [
    'Наведи камеру банковского приложения на QR — банк спросит, сколько перевести. Или тапни по номеру карты, чтобы скопировать.',
    'Point your banking app camera at the QR — the bank will ask how much to transfer. Or tap the card number to copy it.',
    'Richte die Kamera deiner Bank-App auf den QR — die Bank fragt nach dem Betrag. Oder tippe zum Kopieren auf die Kartennummer.',
    'Apunta la cámara de tu banco al QR: el banco preguntará cuánto transferir. O toca el número para copiarlo.',
  ],
  'creators.card': ['Карта МИР', 'MIR card', 'MIR-Karte', 'Tarjeta MIR'],
  'creators.copied': ['✅ Скопировано! Вставь в приложении банка', '✅ Copied! Paste it in your banking app', '✅ Kopiert! In der Bank-App einfügen', '✅ ¡Copiado! Pégalo en tu banco'],
  'creators.donateThanks': [
    'Каждый перевод — новая комната для котиков 🐾',
    'Every donation means a new room for the cats 🐾',
    'Jede Spende bedeutet einen neuen Raum für die Katzen 🐾',
    'Cada donación significa una nueva sala para los gatos 🐾',
  ],

  /* ---------- куница в меню ---------- */
  'marten.aria': [
    'Живая куница NANA играет с попкорном в своей комнате',
    'Live marten NANA playing with popcorn in her room',
    'Die lebende Marderin NANA spielt mit Popcorn in ihrem Zimmer',
    'La marta viva NANA jugando con palomitas en su habitación',
  ],
  'marten.title': ['Куница NANA', 'NANA the marten', 'Marderin NANA', 'Marta NANA'],
  'marten.st0': ['Котёнок', 'Kitten', 'Marderbaby', 'Cachorra'],
  'marten.st1': ['Малышка', 'Little one', 'Kleinemaus', 'Pequeña'],
  'marten.st2': ['Юная', 'Young', 'Jungmard', 'Joven'],
  'marten.st3': ['Ловкая', 'Agile', 'Flink', 'Ágil'],
  'marten.st4': ['Пушистая', 'Fluffy', 'Flauschig', 'Esponjosa'],
  'marten.st5': ['Величественная', 'Majestic', 'Majestätisch', 'Majestuosa'],
  'marten.st6': ['Легенда попкорна', 'Popcorn legend', 'Popcorn-Legende', 'Leyenda del pop'],
  'marten.growHint': [
    'NANA растёт от пройденных уровней и времени в игре: каждые 4–5 уровней она подрастает, а её комната обставляется красивее — гирлянды, ковры, монеты, игрушки!',
    'NANA grows with cleared levels and play time: every 4–5 levels she gets bigger and her room gets fancier — garlands, rugs, coins, toys!',
    'NANA wächst mit geschafften Leveln und Spielzeit: alle 4–5 Level wird sie größer, ihr Zimmer schöner — Girlanden, Teppiche, Münzen, Spielzeug!',
    'NANA crece con los niveles superados y el tiempo de juego: cada 4–5 niveles crece y su habitación se adorna: guirnaldas, alfombras, monedas, juguetes!',
  ],
  'marten.levelUp': [
    '🐾 NANA подросла! Комната стала наряднее!',
    '🐾 NANA grew up! Her room got fancier!',
    '🐾 NANA ist gewachsen! Ihr Zimmer ist schöner!',
    '🐾 ¡NANA creció! ¡Su habitación es más bonita!',
  ],
  'rules.grains': [
    'Зёрна разной ценности: белое +1, карамель +2, масляное +3, золотое +5. Собирай дороже — комбо умножает всё!',
    'Grains have different values: white +1, caramel +2, buttery +3, golden +5. Grab the pricey ones — combos multiply everything!',
    'Körner haben unterschiedliche Werte: weiß +1, Karamell +2, Butter +3, golden +5. Nimm die teuren — Kombos vervielfachen alles!',
    'Los granos valen distinto: blanco +1, caramelo +2, manteca +3, dorado +5. ¡Toma los caros: los combos lo multiplican todo!',
  ],

  /* ---------- настройки ---------- */
  'set.title': ['НАСТРОЙКИ', 'SETTINGS', 'EINSTELLUNGEN', 'AJUSTES'],
  'set.lang': ['Язык', 'Language', 'Sprache', 'Idioma'],
  'set.diff': ['Сложность', 'Difficulty', 'Schwierigkeit', 'Dificultad'],
  'set.diff.easy': ['Лёгкая', 'Easy', 'Leicht', 'Fácil'],
  'set.diff.normal': ['Нормальная', 'Normal', 'Normal', 'Normal'],
  'set.diff.hard': ['Сложная', 'Hard', 'Schwer', 'Difícil'],
  'set.diffHint': [
    'лёгкая: −1 мина в волне · норма ×0.8 · +10 сек к таймеру · сложная: +1 мина · норма ×1.2 · −10 сек',
    'easy: −1 mine per wave · quota ×0.8 · +10 sec · hard: +1 mine · quota ×1.2 · −10 sec',
    'Leicht: −1 Mine pro Welle · Quote ×0.8 · +10 Sek. · Schwer: +1 Mine · Quote ×1.2 · −10 Sek.',
    'fácil: −1 mina por oleada · cuota ×0.8 · +10 seg · difícil: +1 mina · cuota ×1.2 · −10 seg',
  ],
  'set.quality': ['Качество', 'Quality', 'Qualität', 'Calidad'],
  'set.quality.low': ['Низкое', 'Low', 'Niedrig', 'Baja'],
  'set.quality.medium': ['Среднее', 'Medium', 'Mittel', 'Media'],
  'set.quality.high': ['Высокое', 'High', 'Hoch', 'Alta'],
  'set.qualityHint': [
    'частицы, эффекты и чёткость картинки',
    'particles, effects and picture sharpness',
    'Partikel, Effekte und Bildschärfe',
    'partículas, efectos y nitidez',
  ],
  'set.orient': ['Ориентация', 'Orientation', 'Orientierung', 'Orientación'],
  'set.orient.portrait': ['Портрет', 'Portrait', 'Hochformat', 'Vertical'],
  'set.orient.landscape': ['Ландшафт', 'Landscape', 'Querformat', 'Horizontal'],
  'set.orient.auto': ['Авто', 'Auto', 'Auto', 'Auto'],
  'set.perksCurse': [
    'Перки-испытания (проклятья)',
    'Challenge perks (curses)',
    'Herausforderungs-Perks (Flüche)',
    'Perks de desafío (maldiciones)',
  ],
  'set.perksBonus': ['Бонусные перки', 'Bonus perks', 'Bonus-Perks', 'Perks de bonus'],
  'set.pigeon': ['Голубь-воришка', 'Thieving pigeon', 'Klauernde Taube', 'Paloma ladrona'],
  'set.shake': ['Тряска экрана', 'Screen shake', 'Bildschirmwackeln', 'Sacudida de pantalla'],
  'set.sound': ['🔊 Звук', '🔊 Sound', '🔊 Ton', '🔊 Sonido'],
  'set.music': ['Музыка', 'Music', 'Musik', 'Música'],
  'set.sfx': ['Звуки и эффекты', 'Sound effects', 'Soundeffekte', 'Efectos de sonido'],
  'set.soundHint': [
    'двигайте ползунки — звук меняется сразу · кнопка 🔈 в шапке выключает всё',
    'move the sliders — sound changes instantly · the 🔈 button in the top bar mutes everything',
    'Schieberegler wirken sofort · die 🔈-Taste oben schaltet alles stumm',
    'mueve los deslizadores — el sonido cambia al instante · el botón 🔈 arriba silencia todo',
  ],
  'set.vibro': ['Вибрация', 'Vibration', 'Vibration', 'Vibración'],
  'set.colorblind': ['Режим для дальтоников', 'Colorblind mode', 'Farbenblind-Modus', 'Modo daltónico'],
  'set.colorblindHint': [
    'мины становятся сине-оранжевыми с белой меткой',
    'mines become blue-orange with a white marker',
    'Minen werden blau-orange mit weißer Markierung',
    'las minas pasan a azul-naranja con marca blanca',
  ],
  'set.bright': ['Яркость', 'Brightness', 'Helligkeit', 'Brillo'],
  'set.contrast': ['Контрастность', 'Contrast', 'Kontrast', 'Contraste'],
  'set.reset': ['СБРОСИТЬ ВСЁ', 'RESET ALL', 'ALLES ZURÜCKSETZEN', 'RESTABLECER TODO'],
  'set.close': ['ГОТОВО', 'DONE', 'FERTIG', 'LISTO'],

  /* ---------- комнаты ---------- */
  'room.cinema.name': ['Кинозал', 'Cinema Hall', 'Kinosaal', 'Sala de Cine'],
  'room.kitchen.name': ['Кухня пиццерии', 'Pizzeria Kitchen', 'Pizzeria-Küche', 'Cocina de Pizzería'],
  'room.yard.name': ['Ночной двор', 'Night Yard', 'Nachthof', 'Patio Nocturno'],
  'room.arcade.name': ['Аркадный зал', 'Arcade Hall', 'Arcade-Halle', 'Sala Arcade'],
  'room.roof.name': ['Крыша на закате', 'Sunset Roof', 'Dach im Abendrot', 'Azotea al Atardecer'],
  'room.park.name': ['Дневной парк', 'Day Park', 'Tagespark', 'Parque de Día'],
  'room.attic.name': ['Чердак', 'Attic', 'Dachboden', 'Ático'],
  'room.basement.name': ['Кладовка', 'Pantry', 'Vorratskammer', 'Despensa'],

  /* ---------- тексты движка ---------- */
  'banner.level': ['УРОВЕНЬ {{n}}', 'LEVEL {{n}}', 'LEVEL {{n}}', 'NIVEL {{n}}'],
  'banner.wave': ['ВОЛНА {{n}}', 'WAVE {{n}}', 'WELLE {{n}}', 'OLEADA {{n}}'],
  'banner.revive': [
    'ВТОРОЙ ШАНС!',
    'SECOND CHANCE!',
    'ZWEITE CHANCE!',
    '¡SEGUNDA OPORTUNIDAD!',
  ],
  'txt.combo': ['КОМБО ×{{n}}', 'COMBO ×{{n}}', 'COMBO ×{{n}}', 'COMBO ×{{n}}'],
  'txt.pigeon': ['ЖУХ-ЖУХ! ГОЛУБЬ!', 'COO-COO! PIGEON!', 'GRU-GRU! TAUBE!', '¡BU-BU! ¡PALOMA!'],
  'txt.shoo': ['+2 КЫШ!', '+2 SHOO!', '+2 FORT!', '+2 ¡FUERA!'],
  'txt.stole': ['УКРАЛ!', 'STOLEN!', 'GEKLAUT!', '¡ROBADO!'],
  'txt.empty': ['ПУСТО!', 'EMPTY!', 'LEER!', '¡VACÍO!'],
  'txt.guard': ['ОБЕРЕГ!', 'SAVED!', 'GERETTET!', '¡SALVADO!'],
  'txt.shield': ['ЩИТ!', 'SHIELD!', 'SCHILD!', '¡ESCUDO!'],
}

/** Определение языка по браузеру (только при самом первом запуске) */
export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'ru'
  const n = (navigator.language || 'ru').toLowerCase()
  if (n.startsWith('ru')) return 'ru'
  if (n.startsWith('de')) return 'de'
  if (n.startsWith('es')) return 'es'
  return 'en'
}

/** Функция перевода для выбранного языка (с подстановкой {{vars}}) */
export function tFor(lang: Lang): TranslateFn {
  const idx = LANGS.findIndex((l) => l.id === lang)
  const i = idx < 0 ? 0 : idx
  return (key, vars) => {
    const row = T[key]
    let s = row ? row[i] || row[0] : key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.split(`{{${k}}}`).join(String(v))
      }
    }
    return s
  }
}
