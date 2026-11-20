/**
 * САЙТ СТУДИИ RAIDO PERT (ᚱ ᛈ) (v0.0.74)
 *
 * Лендинг студии: кто мы, наши игры, контакты.
 * В проде открывается на https://raidopert.ru (см. src/proxy.ts —
 * апекс рерайтим сюда), в деве и на vercel.app доступен на /studio.
 *
 * Бренд: фиолетовый леопард + золото + руны ᚱ ᛈ — те же цвета,
 * что в boot-экранах игры (boot-screens.tsx).
 */

import type { Metadata } from "next";
import Image from "next/image";
import {
  Cat,
  Download,
  ExternalLink,
  FileDown,
  Gamepad2,
  Github,
  Heart,
  ImageDown,
  Mail,
  Monitor,
  Music,
  Newspaper,
  PawPrint,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { GAME_VERSION } from "@/lib/game/version";
import { DEVLOG } from "@/lib/studio/devlog";
import { CopyButton } from "@/components/studio/copy-button";

export const metadata: Metadata = {
  title: "Raido Pert Studio (ᚱ ᛈ) — игры, сделанные ради кошек",
  description:
    "Игровая студия RaidoPert и Kate HeyNANAhey: 8-битные игры, сделанные при помощи ИИ. Наш первый проект — POPCORN PAWS «Кошачий попкорнный Беспредел». Никого не хотим обидеть — только развеселить. Всё ради кошек. 0+",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Raido Pert Studio (ᚱ ᛈ)",
    description:
      "8-битные игры при помощи ИИ. Первый проект — POPCORN PAWS. Всё ради кошек. 0+",
    url: "https://raidopert.ru",
    siteName: "Raido Pert Studio",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "https://raidopert.ru/boot/logo-kitten-v1.jpg",
        width: 1024,
        height: 1024,
        alt: "Логотип Raido Pert Studio — рыжий котёнок в короне с ведёрком попкорна в золотом лавровом венке",
      },
    ],
  },
};

const pixel = { fontFamily: "var(--font-pixel)" } as const;

const GAMES_URL = "https://play.raidopert.ru";
const RELEASES_URL = "https://github.com/Raidopert/POPCORN_LAPI/releases";
const LATEST_RELEASE_URL = "https://github.com/Raidopert/POPCORN_LAPI/releases/latest";
const LICENSE_URL =
  "https://github.com/Raidopert/POPCORN_LAPI/blob/main/LICENSE";

/** Прямые ссылки на установщики в релизе v0.0.74 (GitHub Releases) */
const EXE_URL =
  "https://github.com/Raidopert/POPCORN_LAPI/releases/download/v0.0.75/POPCORN-PAWS-Setup-0.0.75.exe";
const APK_URL =
  "https://github.com/Raidopert/POPCORN_LAPI/releases/download/v0.0.75/POPCORN-PAWS-0.0.75.apk";

/** Пресс-кит: файлы лежат в public/studio/presskit/ */
const PRESSKIT_DIR = "/studio/presskit";

/** Тексты для прессы — те же, что внутри PRESS-KIT.txt */
const PRESS_SHORT =
  "POPCORN PAWS «Кошачий попкорнный Беспредел» — 8-битный рогалик-аркада про рыжих котиков, куницу и рассыпанный попкорн. Бесплатно, 0+.";
const PRESS_LONG =
  "POPCORN PAWS — бесконечный 8-битный рогалик-аркада про рыжих котиков и рассыпанный попкорн. Куница Лана таскает вкусняшки с кухни, а котики мешают ей как могут: бесконечные уровни, боссы каждые пять уровней (Малыш, Мега-Голубь, Лана-воровка, Лев и финальный Онлифансий), сундучки с перками, прокачка, леопардовый лут, боссовые баночки с эффектами и обмен 3→1: продай три одинаковых — получи вещь классом выше. Рекорды летят в мировую таблицу лидеров, чиптюн ускоряется к концу уровня. Игра сделана при помощи ИИ: код, графика и музыка — с ИИ-инструментами, идеи, стиль и любовь к котикам — только наши. Никого не хотим обидеть — только развеселить. Всё ради кошек. И немного ради попкорна.";

export default function StudioPage() {
  return (
    <div className="min-h-screen flex flex-col text-[#FFF6E6] rps-site">
      <style>{`
        .rps-site { background-color: #1c0517; }
        .rps-leopard {
          background-image:
            radial-gradient(circle at 12% 18%, rgba(112,48,98,.5) 0 18px, rgba(58,20,50,.5) 19px 24px, transparent 25px),
            radial-gradient(circle at 34% 62%, rgba(96,40,84,.45) 0 22px, rgba(52,16,44,.45) 23px 29px, transparent 30px),
            radial-gradient(circle at 72% 24%, rgba(112,48,98,.4) 0 16px, rgba(58,20,50,.4) 17px 21px, transparent 22px),
            radial-gradient(circle at 88% 74%, rgba(96,40,84,.42) 0 20px, rgba(52,16,44,.42) 21px 26px, transparent 27px),
            radial-gradient(circle at 52% 88%, rgba(112,48,98,.35) 0 17px, rgba(58,20,50,.35) 18px 23px, transparent 24px),
            radial-gradient(circle at 8% 84%, rgba(96,40,84,.4) 0 15px, rgba(52,16,44,.4) 16px 20px, transparent 21px),
            radial-gradient(120% 120% at 50% 0%, #3d0d33 0%, #2a0923 55%, #1c0517 100%);
        }
        .rps-panel { background: rgba(61,13,51,.55); border: 1px solid rgba(232,185,92,.28); }
        .rps-gold-text {
          background: linear-gradient(180deg,#F4D489 0%, #E8B95C 55%, #C98F3C 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        @keyframes rps-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .rps-float { animation: rps-float 5s ease-in-out infinite; }
        .rps-a { color: #F4D489; text-decoration: underline; text-underline-offset: 3px; }
        .rps-a:hover { color: #FFDF9E; }
      `}</style>

      {/* ШАПКА */}
      <header className="sticky top-0 z-40 border-b border-[#E8B95C]/25 backdrop-blur-md bg-[#1c0517]/80">
        <div className="mx-auto max-w-5xl w-full px-4 py-3 flex items-center gap-3">
          <Image
            src="/boot/logo-kitten-v1.jpg"
            alt="Логотип Raido Pert Studio — рыжий котёнок в короне с попкорном"
            width={44}
            height={44}
            className="rounded-full border border-[#E8B95C]/60"
          />
          <span className="font-bold tracking-wide text-lg rps-gold-text" style={pixel}>
            RAIDO PERT STUDIO
          </span>
          <nav aria-label="Разделы сайта" className="ml-auto hidden lg:flex items-center gap-4 text-sm">
            <a className="hover:text-[#F4D489] transition-colors" href="#games">Игры</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#download">Скачать</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#about">О студии</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#devlog">Devlog</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#presskit">Press-kit</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#contacts">Контакты</a>
          </nav>
          <nav aria-label="Разделы сайта — компактно" className="ml-auto hidden sm:flex lg:hidden items-center gap-4 text-sm">
            <a className="hover:text-[#F4D489] transition-colors" href="#games">Игры</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#download">Скачать</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#devlog">Devlog</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#contacts">Контакты</a>
          </nav>
          <a
            href="#download"
            aria-label="Скачать игру"
            className="ml-auto sm:hidden inline-flex items-center justify-center rounded-xl border border-[#E8B95C]/60 hover:bg-[#E8B95C]/10 p-2.5 transition-colors"
          >
            <Download className="size-5" aria-hidden />
          </a>
          <a
            href={GAMES_URL}
            className="sm:ml-4 inline-flex items-center gap-2 rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-3 py-2 text-sm font-bold transition-colors"
          >
            <Gamepad2 className="size-4" aria-hidden />
            Играть
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* ГЕРОЙ */}
        <section className="rps-leopard">
          <div className="mx-auto max-w-5xl w-full px-4 py-14 sm:py-20 flex flex-col items-center text-center gap-6">
            <p className="text-[#E8B95C] tracking-[0.35em] text-sm sm:text-base" style={pixel}>
              ᚱ &nbsp;ᛈ&nbsp; РАЙДО · ПЕРТ &nbsp;ᛈ&nbsp; ᚱ
            </p>
            <Image
              src="/boot/logo-kitten-v1.jpg"
              alt="Логотип Raido Pert Studio — рыжий котёнок в золотой короне с ведёрком попкорна в золотом лавровом венке"
              width={192}
              height={192}
              priority
              className="rounded-full border-4 border-[#E8B95C]/70 shadow-[0_0_60px_rgba(232,185,92,.25)] rps-float"
            />
            <h1 className="text-4xl sm:text-6xl font-bold rps-gold-text" style={pixel}>
              RAIDO PERT STUDIO
            </h1>
            <p className="max-w-2xl text-base sm:text-lg text-[#F2E3CF]/90">
              Небольшая игровая студия двух котолюбов. Делаем 8-битные игры при
              помощи ИИ — весело, кайфово и по-семейному. Наши игры помечены{" "}
              <span className="font-bold text-[#E8B95C]">0+</span>: в них может
              играть кто угодно.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
              <span className="rps-panel rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-[#E8B95C]" aria-hidden /> 0+ для всей семьи
              </span>
              <span className="rps-panel rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
                <Sparkles className="size-4 text-[#E8B95C]" aria-hidden /> Сделано с помощью ИИ
              </span>
              <span className="rps-panel rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
                <Cat className="size-4 text-[#E8B95C]" aria-hidden /> Всё ради кошек
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href={GAMES_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-5 py-3 font-bold transition-colors"
              >
                <Gamepad2 className="size-5" aria-hidden />
                Играть в POPCORN PAWS
              </a>
              <a
                href="#games"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E8B95C]/60 hover:bg-[#E8B95C]/10 px-5 py-3 font-bold transition-colors"
              >
                Наши игры
              </a>
            </div>
          </div>
        </section>

        {/* ИГРЫ */}
        <section id="games" aria-labelledby="games-title" className="mx-auto max-w-5xl w-full px-4 py-14 scroll-mt-20">
          <h2 id="games-title" className="text-3xl sm:text-4xl font-bold rps-gold-text mb-2" style={pixel}>
            НАШИ ИГРЫ
          </h2>
          <p className="text-[#F2E3CF]/80 mb-8">
            Несколько проектов идёт параллельно — начали с самого вкусного.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* POPCORN PAWS */}
            <article className="rps-panel rounded-2xl overflow-hidden flex flex-col md:col-span-2">
              <Image
                src="/screenshots/desktop-1280x720.png"
                alt="POPCORN PAWS: геймплей — куница собирает попкорн на кухне"
                width={1280}
                height={720}
                className="w-full h-auto"
              />
              <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
                <h3 className="text-2xl font-bold text-[#E8B95C]" style={pixel}>
                  POPCORN PAWS
                </h3>
                <p className="font-bold">«Кошачий попкорнный Беспредел» (Cat Popcorn Mayhem)</p>
                <p className="text-[#F2E3CF]/85">
                  8-битный рогалик-аркада про рыжих котиков, куницу и рассыпанный
                  попкорн. Бесконечные уровни, боссы, сундучки с перками, мировая
                  таблица лидеров и чиптюн, который ускоряется к концу уровня.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Рогалик-аркада", "PWA — ставится на телефон", "VK Mini App", "Windows и Android"].map(
                    (t) => (
                      <span key={t} className="rounded-full bg-[#2a0923] border border-[#E8B95C]/30 px-2.5 py-1">
                        {t}
                      </span>
                    )
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-auto pt-2">
                  <a
                    href={GAMES_URL}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-4 py-2.5 font-bold transition-colors"
                  >
                    <Gamepad2 className="size-4" aria-hidden />
                    Играть онлайн
                  </a>
                  <a
                    href="#download"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E8B95C]/60 hover:bg-[#E8B95C]/10 px-4 py-2.5 font-bold transition-colors"
                  >
                    <Download className="size-4" aria-hidden />
                    Скачать (ПК / Android)
                  </a>
                </div>
              </div>
            </article>

            {/* ПЛЕЙСХОЛДЕРЫ */}
            <div className="flex flex-col gap-6">
              {[1, 2].map((n) => (
                <article
                  key={n}
                  className="rps-panel rounded-2xl border-dashed p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[180px]"
                >
                  <PawPrint className="size-8 text-[#E8B95C]/70" aria-hidden />
                  <h3 className="text-xl font-bold text-[#E8B95C]" style={pixel}>
                    ПРОЕКТ №{n + 1}
                  </h3>
                  <p className="text-sm text-[#F2E3CF]/80">
                    Ещё одна кошачья затея — в разработке. Скоро расскажем подробнее.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* СКАЧАТЬ */}
        <section id="download" aria-labelledby="download-title" className="border-y border-[#E8B95C]/20 bg-[#2a0923]/60 scroll-mt-20">
          <div className="mx-auto max-w-5xl w-full px-4 py-14">
            <h2 id="download-title" className="text-3xl sm:text-4xl font-bold rps-gold-text mb-2" style={pixel}>
              СКАЧАТЬ
            </h2>
            <p className="text-[#F2E3CF]/80 mb-8">
              POPCORN PAWS v{GAME_VERSION} — на компьютер и на телефон.
              Кнопки качают файлы напрямую из последнего релиза GitHub —
              искать в блоке «Assets» не нужно.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* ПК — Windows */}
              <article className="rps-panel rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-[#2a0923] border border-[#E8B95C]/40 p-2.5">
                    <Monitor className="size-6 text-[#E8B95C]" aria-hidden />
                  </span>
                  <h3 className="text-xl font-bold text-[#E8B95C]" style={pixel}>
                    НА КОМПЬЮТЕР
                  </h3>
                </div>
                <p className="text-[#F2E3CF]/85">
                  Установщик .exe для Windows: ярлык на рабочем столе, игра
                  работает офлайн, без браузера.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Windows 10/11 · 64-бит", ".exe · ~93 МБ", "Офлайн"].map((t) => (
                    <span key={t} className="rounded-full bg-[#2a0923] border border-[#E8B95C]/30 px-2.5 py-1">
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={EXE_URL}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-4 py-3 font-bold transition-colors"
                >
                  <Download className="size-4" aria-hidden />
                  Скачать для ПК (.exe)
                </a>
                <p className="text-xs text-[#F2E3CF]/60">
                  Если Windows покажет синее окно SmartScreen — «Подробнее» →
                  «Выполнить в любом случае». Так бывает у новых независимых
                  игр без платной подписи кода.
                </p>
              </article>

              {/* Телефон — Android */}
              <article className="rps-panel rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-[#2a0923] border border-[#E8B95C]/40 p-2.5">
                    <Smartphone className="size-6 text-[#E8B95C]" aria-hidden />
                  </span>
                  <h3 className="text-xl font-bold text-[#E8B95C]" style={pixel}>
                    НА ТЕЛЕФОН
                  </h3>
                </div>
                <p className="text-[#F2E3CF]/85">
                  Установщик .apk для Android: игра всегда под рукой, рекорды
                  сохраняются на устройстве.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Android 8.0+", ".apk · ~16 МБ", "Офлайн", "Без разрешений"].map((t) => (
                    <span key={t} className="rounded-full bg-[#2a0923] border border-[#E8B95C]/30 px-2.5 py-1">
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={APK_URL}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-4 py-3 font-bold transition-colors"
                >
                  <Download className="size-4" aria-hidden />
                  Скачать для Android (.apk)
                </a>
                <p className="text-xs text-[#F2E3CF]/60">
                  Android спросит «разрешить установку из этого источника» —
                  это нормально для .apk не из магазина. Приложение без
                  единого разрешения: не ходит в сеть и ничего не читает.
                </p>
              </article>
            </div>

            {/* Онлайн / PWA — без установки */}
            <div className="rps-panel rounded-2xl mt-6 p-5 flex flex-col sm:flex-row items-center gap-4">
              <Gamepad2 className="size-7 text-[#E8B95C] shrink-0" aria-hidden />
              <p className="text-[#F2E3CF]/85 flex-1 text-center sm:text-left">
                <span className="font-bold text-[#E8B95C]">Не хотите ничего скачивать?</span>{" "}
                Играйте прямо в браузере. А на телефоне можно «Добавить на главный
                экран» — получится значок, как у обычного приложения (PWA).
              </p>
              <a
                href={GAMES_URL}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#E8B95C]/60 hover:bg-[#E8B95C]/10 px-4 py-2.5 font-bold transition-colors"
              >
                Играть онлайн
              </a>
            </div>

            <p className="text-center text-xs text-[#F2E3CF]/55 mt-4">
              История версий и все релизы:{" "}
              <a className="rps-a" href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
                github.com/Raidopert/POPCORN_LAPI/releases
              </a>
            </p>
          </div>
        </section>

        {/* О СТУДИИ */}
        <section id="about" aria-labelledby="about-title" className="border-y border-[#E8B95C]/20 bg-[#2a0923]/60 scroll-mt-20">
          <div className="mx-auto max-w-5xl w-full px-4 py-14">
            <h2 id="about-title" className="text-3xl sm:text-4xl font-bold rps-gold-text mb-6" style={pixel}>
              О СТУДИИ
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4 text-[#F2E3CF]/90">
                <p>
                  <span className="font-bold text-[#E8B95C]">Raido Pert Studio</span> —
                  студия автора <span className="font-bold">RaidoPert</span> и соавтора,
                  музы проекта <span className="font-bold">Kate HeyNANAhey</span>. Название
                  собрано из старших рун: <span className="text-[#E8B95C] font-bold">ᚱ Райдо</span> —
                  путь и дорога, <span className="text-[#E8B95C] font-bold">ᛈ Перт</span> —
                  тайна и игра в кости. Мы идём своим путём и играем честно.
                </p>
                <p>
                  Код, графика и музыка наших игр создаются при участии
                  ИИ-инструментов — но идеи, стиль и вся любовь к котикам только
                  наши. Мы за добрые игры без злобы:{" "}
                  <span className="font-bold">никого не хотим обидеть — только
                  развеселить</span>.
                </p>
                <p className="inline-flex items-center gap-2 rps-panel rounded-xl px-4 py-3">
                  <Heart className="size-5 text-[#E24B3B] shrink-0" aria-hidden />
                  <span>Всё ради кошек. И немного ради попкорна.</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 content-start">
                {[
                  { icon: ShieldCheck, t: "0+", d: "играй всей семьёй" },
                  { icon: Sparkles, t: "ИИ внутри", d: "честно и с любовью" },
                  { icon: Music, t: "Чиптюн", d: "8-битный Web Audio" },
                  { icon: Users, t: "2 человека", d: "и целая стая котиков" },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="rps-panel rounded-xl p-4 flex flex-col gap-1.5">
                    <Icon className="size-5 text-[#E8B95C]" aria-hidden />
                    <p className="font-bold text-lg" style={pixel}>{t}</p>
                    <p className="text-sm text-[#F2E3CF]/75">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DEVLOG — история разработки */}
        <section id="devlog" aria-labelledby="devlog-title" className="mx-auto max-w-5xl w-full px-4 py-14 scroll-mt-20">
          <h2 id="devlog-title" className="text-3xl sm:text-4xl font-bold rps-gold-text mb-2" style={pixel}>
            DEVLOG
          </h2>
          <p className="text-[#F2E3CF]/80 mb-8">
            Настоящая история разработки POPCORN PAWS — из git-тегов и
            релизов. От первого босса до сайта студии — за неделю.
          </p>

          <div className="flex flex-col gap-4">
            {DEVLOG.map((e) => (
              <article
                key={e.version}
                className="rps-panel rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                <div className="sm:w-44 shrink-0 flex sm:flex-col items-baseline sm:items-start gap-2">
                  <span
                    className="text-2xl font-bold rps-gold-text"
                    style={pixel}
                  >
                    {e.version}
                  </span>
                  <time dateTime={e.date.split(".").reverse().join("-")} className="text-sm text-[#F2E3CF]/60">
                    {e.date}
                  </time>
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <h3 className="text-lg font-bold text-[#F4D489]">{e.title}</h3>
                  <p className="text-[#F2E3CF]/85">{e.text}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#2a0923] border border-[#E8B95C]/30 px-2.5 py-1 text-[#E8B95C]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="text-center text-xs text-[#F2E3CF]/55 mt-6">
            Полная история коммитов:{" "}
            <a className="rps-a" href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
              github.com/Raidopert/POPCORN_LAPI/releases
            </a>
          </p>
        </section>

        {/* PRESS-KIT — материалы для прессы и блогеров */}
        <section id="presskit" aria-labelledby="presskit-title" className="border-y border-[#E8B95C]/20 bg-[#2a0923]/60 scroll-mt-20">
          <div className="mx-auto max-w-5xl w-full px-4 py-14">
            <h2 id="presskit-title" className="text-3xl sm:text-4xl font-bold rps-gold-text mb-2" style={pixel}>
              PRESS-KIT
            </h2>
            <p className="text-[#F2E3CF]/80 mb-8">
              Пишете обзор, делаете видео или пост? Всё нужное — здесь:
              факты, тексты, логотипы и скриншоты. Забирайте свободно, автора
              указывайте — Raido Pert Studio.
            </p>

            {/* весь пакет одним архивом */}
            <div className="rps-panel rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center gap-4">
              <FileDown className="size-8 text-[#E8B95C] shrink-0" aria-hidden />
              <p className="flex-1 text-[#F2E3CF]/85 text-center sm:text-left">
                <span className="font-bold text-[#E8B95C]">Всё одним архивом:</span>{" "}
                логотипы, скриншоты, факт-лист и тексты —{" "}
                <span className="font-mono text-sm">popcorn-paws-presskit-0.0.75.zip</span> (~2,8 МБ).
              </p>
              <a
                href={`${PRESSKIT_DIR}/popcorn-paws-presskit-0.0.75.zip`}
                download
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-4 py-2.5 font-bold transition-colors"
              >
                <FileDown className="size-4" aria-hidden />
                Скачать архив
              </a>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Факт-лист + тексты */}
              <div className="rps-panel rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#E8B95C]" style={pixel}>
                  ФАКТ-ЛИСТ
                </h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Игра", "POPCORN PAWS «Кошачий попкорнный Беспредел»"],
                    ["Жанр", "рогалик-аркада, 8-бит"],
                    ["Платформы", "браузер/PWA, VK Mini App, Windows, Android"],
                    ["Версия", `0.0.75 (20.11.2026)`],
                    ["Цена", "бесплатно, без внутриигровых покупок"],
                    ["Рейтинг", "0+"],
                    ["Студия", "Raido Pert Studio — RaidoPert + Kate HeyNANAhey"],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="font-bold text-[#E8B95C] whitespace-nowrap">{k}</dt>
                      <dd className="text-[#F2E3CF]/85">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rps-panel rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#E8B95C]" style={pixel}>
                  ТЕКСТЫ ДЛЯ ПУБЛИКАЦИЙ
                </h3>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-[#F2E3CF]/85">
                    <span className="font-bold text-[#F4D489]">Короткое:</span>{" "}
                    {PRESS_SHORT}
                  </p>
                  <CopyButton text={PRESS_SHORT} label="Скопировать короткое" />
                  <p className="text-sm text-[#F2E3CF]/85">
                    <span className="font-bold text-[#F4D489]">Длинное:</span>{" "}
                    {PRESS_LONG}
                  </p>
                  <CopyButton text={PRESS_LONG} label="Скопировать длинное" />
                </div>
              </div>
            </div>

            {/* Логотипы */}
            <h3 className="text-xl font-bold text-[#E8B95C] mt-10 mb-4" style={pixel}>
              ЛОГОТИПЫ
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  file: "logo-full-1024.png",
                  title: "Логотип в венке",
                  d: "круглый, с лаврами",
                },
                {
                  file: "logo-art-1024.png",
                  title: "Арт логотипа",
                  d: "котёнок крупно",
                },
                {
                  file: "icon-badge-1024.png",
                  title: "Иконка приложения",
                  d: "квадрат со скруглением",
                },
              ].map(({ file, title, d }) => (
                <figure key={file} className="rps-panel rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
                  <Image
                    src={`${PRESSKIT_DIR}/${file}`}
                    alt={`${title} Raido Pert Studio — ${d}`}
                    width={112}
                    height={112}
                    className="rounded-xl border border-[#E8B95C]/40"
                  />
                  <figcaption className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm">{title}</span>
                    <span className="text-xs text-[#F2E3CF]/65">
                      {d} · PNG 1024×1024
                    </span>
                  </figcaption>
                  <a
                    href={`${PRESSKIT_DIR}/${file}`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8B95C]/50 px-3 py-1.5 text-sm font-bold hover:bg-[#E8B95C]/10 transition-colors"
                  >
                    <FileDown className="size-4" aria-hidden />
                    Скачать PNG
                  </a>
                </figure>
              ))}
            </div>

            {/* Скриншоты */}
            <h3 className="text-xl font-bold text-[#E8B95C] mt-10 mb-4" style={pixel}>
              СКРИНШОТЫ
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  file: "desktop-1280x720.png",
                  w: 1280,
                  h: 720,
                  title: "Геймплей на ПК",
                },
                {
                  file: "menu-720x1280.png",
                  w: 720,
                  h: 1280,
                  title: "Меню на телефоне",
                },
                {
                  file: "play-720x1280.png",
                  w: 720,
                  h: 1280,
                  title: "Геймплей на телефоне",
                },
              ].map(({ file, w, h, title }) => (
                <figure key={file} className="rps-panel rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
                  <Image
                    src={`/screenshots/${file}`}
                    alt={`POPCORN PAWS: ${title}`}
                    width={w}
                    height={h}
                    className="w-full h-auto rounded-xl border border-[#E8B95C]/40"
                  />
                  <figcaption className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm">{title}</span>
                    <span className="text-xs text-[#F2E3CF]/65">PNG {w}×{h}</span>
                  </figcaption>
                  <a
                    href={`/screenshots/${file}`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8B95C]/50 px-3 py-1.5 text-sm font-bold hover:bg-[#E8B95C]/10 transition-colors"
                  >
                    <ImageDown className="size-4" aria-hidden />
                    Скачать
                  </a>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ДИСКЛЕЙМЕР (эхо boot-экрана игры) */}
        <section aria-label="Дисклеймер" className="mx-auto max-w-5xl w-full px-4 py-10">
          <div className="rps-panel rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Heart className="size-8 text-[#E24B3B] shrink-0" aria-hidden />
            <p className="text-[#F2E3CF]/90">
              <span className="font-bold text-[#E8B95C]">Дисклеймер:</span> игры
              Raido Pert Studio сделаны с помощью ИИ. Мы никого не хотим обидеть —
              только развеселить. Всё ради кошек.{" "}
              <span className="font-bold">0+</span>
            </p>
          </div>
        </section>

        {/* КОНТАКТЫ */}
        <section id="contacts" aria-labelledby="contacts-title" className="mx-auto max-w-5xl w-full px-4 pb-16 scroll-mt-20">
          <h2 id="contacts-title" className="text-3xl sm:text-4xl font-bold rps-gold-text mb-6" style={pixel}>
            КОНТАКТЫ
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Send,
                t: "ВКонтакте — автор",
                d: "vk.ru/raido_pert",
                href: "https://vk.ru/raido_pert",
              },
              {
                icon: Users,
                t: "Сообщество POPCORN PAWS",
                d: "vk.ru/club243375070",
                href: "https://vk.ru/club243375070",
              },
              {
                icon: Mail,
                t: "Почта",
                d: "raidopert@gmail.com",
                href: "mailto:raidopert@gmail.com",
              },
              {
                icon: Phone,
                t: "Телефон",
                d: "+7 908 190-46-75",
                href: "tel:+79081904675",
              },
              {
                icon: Github,
                t: "GitHub",
                d: "github.com/Raidopert",
                href: "https://github.com/Raidopert",
              },
            ].map(({ icon: Icon, t, d, href }) => (
              <a
                key={t}
                href={href}
                className="rps-panel rounded-xl p-4 flex items-center gap-4 hover:border-[#E8B95C]/60 transition-colors"
              >
                <Icon className="size-6 text-[#E8B95C] shrink-0" aria-hidden />
                <span className="flex flex-col">
                  <span className="font-bold">{t}</span>
                  <span className="text-sm text-[#F2E3CF]/75 underline underline-offset-2">
                    {d}
                  </span>
                </span>
              </a>
            ))}
            <div className="rps-panel rounded-xl p-4 flex items-center gap-4">
              <Heart className="size-6 text-[#E24B3B] shrink-0" aria-hidden />
              <span className="flex flex-col">
                <span className="font-bold">Поддержать студию</span>
                <span className="text-sm text-[#F2E3CF]/85">Карта МИР: 2200 7020 0120 0364</span>
                <span className="text-xs text-[#F2E3CF]/60">
                  QR-код и копирование — в игре, раздел «СОЗДАТЕЛИ»
                </span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ФУТЕР — прилипает к низу */}
      <footer className="mt-auto border-t border-[#E8B95C]/25 bg-[#1c0517]">
        <div className="mx-auto max-w-5xl w-full px-4 py-6 flex flex-col sm:flex-row items-center gap-2 text-sm text-[#F2E3CF]/70 text-center sm:justify-between">
          <p>© 2025–2026 Raido Pert Studio (ᚱ ᛈ). Все права защищены.</p>
          <p>Игры сделаны с помощью ИИ — всё ради кошек. 0+</p>
          <p>
            <a className="rps-a" href={GAMES_URL}>play.raidopert.ru</a>
            {" · "}
            <a className="rps-a" href={LICENSE_URL}>лицензия</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
