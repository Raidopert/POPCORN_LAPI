import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.raidopert.ru"),
  title: "Политика конфиденциальности — Raido Pert Studio",
  description:
    "Какие данные собирают игра POPCORN PAWS, МузСтудия и сайты студии: ник и рекорды для таблицы лидеров плюс анонимная статистика посещений. Как запросить удаление своих данных.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Политика конфиденциальности — Raido Pert Studio",
    description:
      "Ник и рекорды для таблицы лидеров плюс анонимная статистика посещений. Как удалить свои данные.",
    url: "https://www.raidopert.ru/privacy",
    siteName: "Raido Pert Studio",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "https://www.raidopert.ru/boot/logo-kitten-v1.jpg",
        width: 1024,
        height: 1024,
        alt: "Логотип Raido Pert Studio — рыжий котёнок в короне с ведёрком попкорна в золотом лавровом венке",
      },
    ],
  },
};

const pixel = { fontFamily: "var(--font-pixel)" } as const;

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Игра POPCORN PAWS (play.raidopert.ru)",
    body: [
      "Для мировой таблицы лидеров игра хранит три вещи: придуманный тобой ник, результат забега (очки, уровень и дату) и технический идентификатор устройства — он нужен, чтобы каждый котик в таблице был ровно один раз, показывать твоё место и защищать таблицу от накрутки. Ни почты, ни телефона, ни геолокации игра не спрашивает и не хранит.",
      "IP-адрес используется сервером только на несколько секунд — для защиты от флуда (лимит запросов) — и долговременно не сохраняется.",
      "Захочешь удалить свой ник и рекорды — напиши автору в VK или на почту (контакты ниже), удалим в течение суток. Это то же обещание, что написано прямо в игре, в разделе «СОЗДАТЕЛИ».",
    ],
  },
  {
    title: "МузСтудия",
    body: [
      "Приложение работает полностью офлайн: голосовые записи и треки хранятся только на твоём устройстве и никуда не отправляются. Облаков, регистрации и аналитики внутри приложения нет.",
    ],
  },
  {
    title: "CatScribbles (КошачьиЗакорючки)",
    body: [
      "Доска для рисования работает напрямую между браузерами участников (P2P): рисунок передается собеседнику в реальном времени и на сервере студии не хранится.",
    ],
  },
  {
    title: "Сайты студии",
    body: [
      "Сайты raidopert.ru и play.raidopert.ru размещены на хостинге Vercel, который ведёт стандартные технические журналы безопасности (в том числе IP-адрес) — так работает любой хостинг.",
      "На сайтах стоит счётчик Яндекс Метрики — он собирает обезличенную статистику посещений: какие страницы открывают, с каких устройств и откуда приходят, плюс записи сессий и карту кликов (Вебвизор). Это техническая статистика, а не данные твоего аккаунта: почту, телефон или платёжные данные мы через неё не получаем. Рекламных трекеров и отслеживающих cookie у нас нет. Не хочешь попадать в статистику — включи в браузере блокировщик рекламы, игре это не помешает.",
    ],
  },
  {
    title: "Дети (0+)",
    body: [
      "Играм студии присвоен рейтинг 0+, и мы сознательно не собираем никаких данных, кроме выдуманного ника для таблицы лидеров. Просим называть в игре не настоящее имя, а игровой ник.",
    ],
  },
  {
    title: "Твои права",
    body: [
      "Можешь спросить, какие данные о тебе хранятся, попросить их исправить или удалить — одним сообщением в VK или на почту. Отвечаем быстро: удаление данных из таблицы лидеров — в течение суток.",
    ],
  },
  {
    title: "Закон и изменения",
    body: [
      "Студия российская, и мы руководствуемся принципами Федерального закона «О персональных данных» (152-ФЗ): собираем минимум данных, только для заявленной цели — таблицы лидеров.",
      "Если политика изменится, мы обновим дату на этой странице. Существенные изменения (например, появление нового сервиса) продублируем на лендинге.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col text-[#FFF6E6] rps-site">
      <style>{`
        .rps-site { background-color: #1c0517; }
        .rps-panel { background: rgba(61,13,51,.55); border: 1px solid rgba(232,185,92,.28); }
        .rps-a { color: #E8B95C; text-decoration: underline; text-underline-offset: 3px; }
        .rps-a:hover { color: #F4D489; }
      `}</style>

      <header className="border-b border-[#E8B95C]/25 bg-[#2a0923]/60">
        <div className="mx-auto max-w-3xl w-full px-4 py-8">
          <p className="text-xs uppercase tracking-widest text-[#E8B95C]/80" style={pixel}>
            Raido Pert Studio (ᚱ ᛈ)
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#E8B95C]" style={pixel}>
            Политика конфиденциальности
          </h1>
          <p className="mt-2 text-sm text-[#F2E3CF]/70">
            Обновлено 25.11.2026 · коротко и по-человечески, без юридического тумана
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl w-full px-4 py-8 flex flex-col gap-6 flex-1">
        <div className="rps-panel rounded-2xl p-5 sm:p-6">
          <p className="text-[#F2E3CF]/90">
            Мы — небольшая игровая студия RaidoPert и Kate HeyNANAhey. Делаем
            8-битные игры при помощи ИИ, всё ради кошек. Эта страница честно
            объясняет, какие данные наших игроков и посетителей сайты
            собирают, зачем и как их удалить. Принцип один:{" "}
            <b className="text-[#E8B95C]">собираем только то, без чего игра не работает</b>{" "}
            — ник и рекорды для таблицы лидеров — плюс обезличенная
            статистика посещений сайтов (Яндекс Метрика).
          </p>
        </div>

        {SECTIONS.map((s) => (
          <section key={s.title} className="rps-panel rounded-2xl p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[#E8B95C]" style={pixel}>
              {s.title}
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {s.body.map((p, i) => (
                <p key={i} className="text-[#F2E3CF]/85 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="rps-panel rounded-2xl p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[#E8B95C]" style={pixel}>
            Контакты для вопросов о данных
          </h2>
          <p className="mt-3 text-[#F2E3CF]/85">
            Пиши в любое время — ответим:
          </p>
          <ul className="mt-2 space-y-1 text-[#F2E3CF]/85">
            <li>
              VK автора:{" "}
              <a className="rps-a" href="https://vk.ru/raido_pert" target="_blank" rel="noopener noreferrer">
                vk.ru/raido_pert
              </a>
            </li>
            <li>
              Почта:{" "}
              <a className="rps-a" href="mailto:raidopert@gmail.com">
                raidopert@gmail.com
              </a>
            </li>
            <li>Телефон: +7 908 190-46-75</li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-3 justify-center pb-2">
          <a
            href="https://www.raidopert.ru/studio"
            className="rounded-xl border border-[#E8B95C]/60 hover:bg-[#E8B95C]/10 px-4 py-2.5 font-bold transition-colors text-[#E8B95C]"
          >
            ← На главную студии
          </a>
          <a
            href="https://play.raidopert.ru/"
            className="rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-4 py-2.5 font-bold transition-colors text-white"
          >
            К игре POPCORN PAWS
          </a>
        </div>
      </main>

      <footer className="border-t border-[#E8B95C]/25 bg-[#1c0517]">
        <div className="mx-auto max-w-3xl w-full px-4 py-5 text-center text-sm text-[#F2E3CF]/70">
          © 2025–2026 Raido Pert Studio (ᚱ ᛈ). Всё ради кошек. 0+
        </div>
      </footer>
    </div>
  );
}
