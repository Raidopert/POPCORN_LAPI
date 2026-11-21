/**
 * ВНУТРЕННИЕ МАТЕРИАЛЫ СТУДИИ RAIDO PERT (ᚱ ᛈ) — страница «Разработка»
 *
 * Здесь живут рабочие данные, которым не место на витрине главной
 * страницы: девлог, план развития, концепт-заготовки, сравнение с
 * рынком и логотипы. Ссылка на страницу — в шапке и футере сайта.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ImageDown,
  Map,
  Palette,
  Scale,
} from "lucide-react";
import { DEVLOG } from "@/lib/studio/devlog";
import {
  CONCEPT_IMAGES,
  MARKET_NOTES,
  ROADMAP_DIRECTIONS,
  ROADMAP_PLAN,
} from "@/lib/studio/roadmap";

export const metadata: Metadata = {
  title: "Разработка — Raido Pert Studio (ᚱ ᛈ)",
  description:
    "Внутренние материалы студии: девлог POPCORN PAWS, план развития, концепт-заготовки, сравнение с рынком и логотипы. Всё ради кошек. 0+",
};

const pixel = { fontFamily: "var(--font-pixel)" } as const;

const RELEASES_URL = "https://github.com/Raidopert/POPCORN_LAPI/releases";

export default function StudioInternalPage() {
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
            radial-gradient(120% 120% at 50% 0%, #3d0d33 0%, #2a0923 55%, #1c0517 100%);
        }
        .rps-panel { background: rgba(61,13,51,.55); border: 1px solid rgba(232,185,92,.28); }
        .rps-gold-text {
          background: linear-gradient(180deg,#F4D489 0%, #E8B95C 55%, #C98F3C 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .rps-a { color: #F4D489; text-decoration: underline; text-underline-offset: 3px; }
        .rps-a:hover { color: #FFDF9E; }
      `}</style>

      {/* ШАПКА */}
      <header className="sticky top-0 z-40 border-b border-[#E8B95C]/25 backdrop-blur-md bg-[#1c0517]/80">
        <div className="mx-auto max-w-5xl w-full px-4 py-3 flex items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8B95C]/50 hover:bg-[#E8B95C]/10 px-3 py-2 text-sm font-bold transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden />
            На главную
          </Link>
          <span className="font-bold tracking-wide text-lg rps-gold-text" style={pixel}>
            РАЗРАБОТКА
          </span>
          <nav aria-label="Разделы страницы разработки" className="ml-auto hidden md:flex items-center gap-4 text-sm">
            <a className="hover:text-[#F4D489] transition-colors" href="#devlog">Девлог</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#plan">План</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#concepts">Заготовки</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#market">Рынок</a>
            <a className="hover:text-[#F4D489] transition-colors" href="#logos">Логотипы</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ГЕРОЙ */}
        <section className="rps-leopard border-b border-[#E8B95C]/20">
          <div className="mx-auto max-w-5xl w-full px-4 py-10 flex flex-col items-center text-center gap-4">
            <p className="text-[#E8B95C] tracking-[0.35em] text-sm" style={pixel}>
              ᚱ &nbsp;ᛈ&nbsp; РАЙДО · ПЕРТ &nbsp;ᛈ&nbsp; ᚱ
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold rps-gold-text" style={pixel}>
              РАЗРАБОТКА
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-[#F2E3CF]/90">
              Рабочая кухня студии: история разработки, планы, концепт-эскизы,
              сравнение с рынком и логотипы. Эти материалы — внутренние,
              поэтому живут на отдельной странице.
            </p>
          </div>
        </section>

        {/* DEVLOG — история разработки */}
        <section id="devlog" aria-labelledby="devlog-title" className="mx-auto max-w-5xl w-full px-4 py-14 scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="size-6 text-[#E8B95C]" aria-hidden />
            <h2 id="devlog-title" className="text-3xl sm:text-4xl font-bold rps-gold-text" style={pixel}>
              DEVLOG
            </h2>
          </div>
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

        {/* ПЛАН РАЗВИТИЯ — roadmap и направления */}
        <section
          id="plan"
          aria-labelledby="plan-title"
          className="border-y border-[#E8B95C]/20 bg-[#2a0923]/60 scroll-mt-20"
        >
          <div className="mx-auto max-w-5xl w-full px-4 py-14">
            <div className="flex items-center gap-3 mb-2">
              <Map className="size-6 text-[#E8B95C]" aria-hidden />
              <h2 id="plan-title" className="text-3xl sm:text-4xl font-bold rps-gold-text" style={pixel}>
                ПЛАН РАЗВИТИЯ
              </h2>
            </div>
            <p className="text-[#F2E3CF]/80 mb-8">
              Куда растёт POPCORN PAWS: направления уже заготовлены в коде
              (реестры контента и флаги фич). Всё ниже — планы, а не обещания:
              игра остаётся бесплатной, честной и 0+.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 mb-10">
              {ROADMAP_DIRECTIONS.map((d) => (
                <article key={d.title} className="rps-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>{d.icon}</span>
                    <h3 className="text-lg font-bold text-[#F4D489]">{d.title}</h3>
                  </div>
                  <p className="text-[#F2E3CF]/85 text-sm sm:text-base">{d.text}</p>
                  <code className="text-xs text-[#E8B95C]/80 mt-auto break-all">
                    заготовка: {d.stub}
                  </code>
                </article>
              ))}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold rps-gold-text mb-4" style={pixel}>
              Дорожная карта по версиям
            </h3>
            <div className="flex flex-col gap-3">
              {ROADMAP_PLAN.map((r) => (
                <article
                  key={r.version}
                  className="rps-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-6"
                >
                  <div className="sm:w-28 shrink-0">
                    <span className="text-xl font-bold rps-gold-text" style={pixel}>{r.version}</span>
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <h4 className="font-bold text-[#F4D489]">{r.title}</h4>
                    <ul className="text-sm text-[#F2E3CF]/85 flex flex-col gap-1">
                      {r.items.map((it) => (
                        <li key={it} className="flex gap-2">
                          <span className="text-[#E8B95C]" aria-hidden>—</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* КОНЦЕПТ-ЗАГОТОВКИ */}
        <section id="concepts" aria-labelledby="concepts-title" className="mx-auto max-w-5xl w-full px-4 py-14 scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="size-6 text-[#E8B95C]" aria-hidden />
            <h2 id="concepts-title" className="text-3xl sm:text-4xl font-bold rps-gold-text" style={pixel}>
              КОНЦЕПТ-ЗАГОТОВКИ
            </h2>
          </div>
          <p className="text-sm text-[#F2E3CF]/75 mb-8">
            Эскизы нарисованы процедурно — тем же способом, каким игра рисует
            свои спрайты (scripts/gen-concepts-pixel.py). Это референсы для
            будущих спрайтов и комнат, а не финальный арт.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {CONCEPT_IMAGES.map((img) => (
              <figure key={img.src} className="rps-panel rounded-2xl overflow-hidden flex flex-col">
                <Image
                  src={img.src}
                  alt={`Концепт-заготовка POPCORN PAWS: ${img.caption}`}
                  width={1344}
                  height={768}
                  className="w-full h-auto"
                  sizes="(max-width: 640px) 100vw, 480px"
                />
                <figcaption className="p-4 text-sm text-[#F2E3CF]/80">{img.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* СРАВНЕНИЕ С РЫНКОМ */}
        <section
          id="market"
          aria-labelledby="market-title"
          className="border-y border-[#E8B95C]/20 bg-[#2a0923]/60 scroll-mt-20"
        >
          <div className="mx-auto max-w-5xl w-full px-4 py-14">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="size-6 text-[#E8B95C]" aria-hidden />
              <h2 id="market-title" className="text-3xl sm:text-4xl font-bold rps-gold-text" style={pixel}>
                СРАВНЕНИЕ С РЫНКОМ
              </h2>
            </div>
            <p className="text-[#F2E3CF]/80 mb-8">
              Что мы смотрели у других и чему учимся — краткая рабочая заметка.
            </p>
            <div className="flex flex-col gap-3">
              {MARKET_NOTES.map((m) => (
                <article key={m.who} className="rps-panel rounded-2xl p-4 sm:p-5">
                  <h3 className="font-bold text-[#F4D489] mb-1">{m.who}</h3>
                  <p className="text-sm text-[#F2E3CF]/85">{m.lesson}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ЛОГОТИПЫ */}
        <section id="logos" aria-labelledby="logos-title" className="mx-auto max-w-5xl w-full px-4 py-14 scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <ImageDown className="size-6 text-[#E8B95C]" aria-hidden />
            <h2 id="logos-title" className="text-3xl sm:text-4xl font-bold rps-gold-text" style={pixel}>
              ЛОГОТИПЫ
            </h2>
          </div>
          <p className="text-sm text-[#F2E3CF]/75 mb-8">
            Фирменные логотипы студии в полном размере. Полный набор — в
            пресс-ките на главной странице.
          </p>
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
                  src={`/studio/presskit/${file}`}
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
                  href={`/studio/presskit/${file}`}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8B95C]/50 px-3 py-1.5 text-sm font-bold hover:bg-[#E8B95C]/10 transition-colors"
                >
                  <ImageDown className="size-4" aria-hidden />
                  Скачать PNG
                </a>
              </figure>
            ))}
          </div>
        </section>
      </main>

      {/* ФУТЕР — прилипает к низу */}
      <footer className="mt-auto border-t border-[#E8B95C]/25 bg-[#1c0517]">
        <div className="mx-auto max-w-5xl w-full px-4 py-6 flex flex-col sm:flex-row items-center gap-2 text-sm text-[#F2E3CF]/70 text-center sm:justify-between">
          <p>© 2025–2026 Raido Pert Studio (ᚱ ᛈ). Все права защищены.</p>
          <p>Игры сделаны с помощью ИИ — всё ради кошек. 0+</p>
          <p>
            <Link className="rps-a" href="/studio">Главная</Link>
            {" · "}
            <a className="rps-a" href="/catscribbles/">CatScribbles</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
