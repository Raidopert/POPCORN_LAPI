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
  Gamepad2,
  Github,
  Heart,
  Mail,
  Music,
  PawPrint,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

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
        url: "https://raidopert.ru/boot/logo.jpg",
        width: 768,
        height: 768,
        alt: "Логотип Raido Pert Studio — фиолетовый леопардовый круг с рунами",
      },
    ],
  },
};

const pixel = { fontFamily: "var(--font-pixel)" } as const;

const GAMES_URL = "https://play.raidopert.ru";
const RELEASES_URL = "https://github.com/Raidopert/POPCORN_LAPI/releases";
const LICENSE_URL =
  "https://github.com/Raidopert/POPCORN_LAPI/blob/main/LICENSE";

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
            src="/boot/logo.jpg"
            alt="Логотип Raido Pert Studio"
            width={44}
            height={44}
            className="rounded-full border border-[#E8B95C]/60"
          />
          <span className="font-bold tracking-wide text-lg rps-gold-text" style={pixel}>
            RAIDO PERT STUDIO
          </span>
          <nav aria-label="Разделы сайта" className="ml-auto hidden sm:flex items-center gap-4 text-sm">
            <a className="hover:text-[#F4D489] transition-colors" href="#games">Игры</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#about">О студии</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#contacts">Контакты</a>
          </nav>
          <a
            href={GAMES_URL}
            className="ml-auto sm:ml-4 inline-flex items-center gap-2 rounded-xl bg-[#E24B3B] hover:bg-[#c93f31] px-3 py-2 text-sm font-bold transition-colors"
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
              src="/boot/logo.jpg"
              alt="Эмблема студии Raido Pert — фиолетовый леопардовый круг с золотой монограммой"
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
              помощи ИИ — весело, добро и по-семейному. Наши игры помечены{" "}
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
        <section id="games" aria-labelledby="games-title" className="mx-auto max-w-5xl w-full px-4 py-14">
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
                    href={RELEASES_URL}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E8B95C]/60 hover:bg-[#E8B95C]/10 px-4 py-2.5 font-bold transition-colors"
                  >
                    <Download className="size-4" aria-hidden />
                    Установщики (exe / apk)
                    <ExternalLink className="size-3.5 opacity-70" aria-hidden />
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

        {/* О СТУДИИ */}
        <section id="about" aria-labelledby="about-title" className="border-y border-[#E8B95C]/20 bg-[#2a0923]/60">
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
        <section id="contacts" aria-labelledby="contacts-title" className="mx-auto max-w-5xl w-full px-4 pb-16">
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
