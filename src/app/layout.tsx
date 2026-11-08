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
  title: "Кошачий попкорнный Беспредел — 8-битная мини-игра",
  description:
    "Рогалик-аркада: собирай попкорн лапкой куницы в стаканчик, выполняй норму уровня и открывай сундучки со случайными перками — бонусы и проклятья! 8-битная музыка ускоряется к концу уровня. Играй бесплатно в браузере на смартфоне и ПК.",
  keywords: ["мини-игра", "попкорн", "куница", "кукуруза", "8-бит", "аркада", "браузерная игра"],
  authors: [{ name: "Z.ai" }],
  icons: {
    icon: "/marten-mascot.png",
  },
  openGraph: {
    title: "Кошачий попкорнный Беспредел — 8-битная мини-игра",
    description: "Собери попкорн лапкой куницы и не трогай кукурузу-ловушку!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1d110b",
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
