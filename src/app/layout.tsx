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
  metadataBase: new URL("https://popcorn-lapi.vercel.app"),
  title: "POPCORN PAWS — 8-битный рогалик-аркада",
  description:
    "Рогалик-аркада: собирай попкорн лапкой куницы в стаканчик, выполняй норму уровня и открывай сундучки со случайными перками — бонусы и проклятья! 8-битная музыка ускоряется к концу уровня. Играй бесплатно в браузере на смартфоне и ПК.",
  keywords: ["мини-игра", "попкорн", "куница", "кукуруза", "8-бит", "аркада", "браузерная игра"],
  authors: [{ name: "Z.ai" }],
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
    url: "https://popcorn-lapi.vercel.app",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
