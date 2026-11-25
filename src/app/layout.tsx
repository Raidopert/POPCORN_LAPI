import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Handjet } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelSans = Handjet({
  variable: "--font-pixel",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  // block вместо swap: пока пиксельный шрифт не загружен, текст не мигает
  // запасным шрифтом — буквы не «прыгают» при подмене метрик
  display: "block",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://play.raidopert.ru"),
  title: "POPCORN PAWS — 8-битный рогалик-аркада",
  description:
    "Рогалик-аркада: собирай попкорн лапкой куницы в стаканчик, выполняй норму уровня и открывай сундучки со случайными перками — бонусы и волшебные эффекты! 8-битная музыка ускоряется к концу уровня. Играй бесплатно в браузере на смартфоне и ПК.",
  keywords: ["мини-игра", "попкорн", "куница", "кукуруза", "8-бит", "аркада", "браузерная игра"],
  authors: [{ name: "Raido Pert Studio", url: "https://raidopert.ru" }],
  creator: "Raido Pert Studio",
  publisher: "Raido Pert Studio",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "P.O.P.",
  },
  openGraph: {
    title: "POPCORN PAWS — 8-битный рогалик-аркада",
    description:
      "Собирай попкорн лапкой куницы, уворачивайся от мин-кукурузы и ставь рекорды. Играй бесплатно прямо в браузере!",
    url: "https://play.raidopert.ru",
    siteName: "POPCORN PAWS",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "POPCORN PAWS — куница со стаканчиком попкорна и мина-кукуруза",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "POPCORN PAWS — 8-битный рогалик-аркада",
    description:
      "Собирай попкорн лапкой куницы, уворачивайся от мин-кукурузы и ставь рекорды. Играй бесплатно прямо в браузере!",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#E24B3B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pixelSans.variable} antialiased bg-background text-foreground`}
      >
        {/* Яндекс Метрика (ID 114682712): обезличенная статистика посещений —
            что именно собираем и как отказаться, см. раздел «Сайты студии» на /privacy */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=114682712','ym');ym(114682712,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:'dataLayer',referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true})`,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/114682712"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        {children}
        <Toaster />
        {/* JSON-LD:VideoGame — поисковики понимают, что это игра (Google Rich Results) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              name: "POPCORN PAWS",
              alternateName: "Кошачий попкорнный Беспредел",
              url: "https://play.raidopert.ru",
              image: "https://play.raidopert.ru/og-image.png",
              description:
                "8-битный рогалик-аркада: собирай попкорн лапкой куницы NANA, выполняй норму уровня, открывай сундучки с перками, дежурь по попкорну и ставь мировые рекорды. Бесплатно, 0+, в браузере на телефоне и ПК.",
              genre: ["Arcade", "Roguelike", "Casual"],
              gamePlatform: ["Web browser", "Windows", "Android", "VK Mini App"],
              applicationCategory: "GameApplication",
              operatingSystem: "Любая (веб-браузер)",
              inLanguage: "ru",
              playMode: "SinglePlayer",
              author: {
                "@type": "Organization",
                name: "Raido Pert Studio",
                url: "https://raidopert.ru",
              },
              offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
              audience: { "@type": "PeopleAudience", suggestedMinAge: 0 },
            }),
          }}
        />
      </body>
    </html>
  );
}
