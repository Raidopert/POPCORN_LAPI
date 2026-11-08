import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
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

const pixelSans = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Марта и Попкорн — 8-битная мини-игра",
  description:
    "Собери рассыпанный попкорн лапкой куницы в бумажный стаканчик! 8-битная музыка, тач-управление, рекорды. Мини-игра в браузере для смартфона и ПК.",
  keywords: ["мини-игра", "попкорн", "куница", "8-бит", "аркада", "браузерная игра"],
  authors: [{ name: "Z.ai" }],
  icons: {
    icon: "/marten-mascot.png",
  },
  openGraph: {
    title: "Марта и Попкорн — 8-битная мини-игра",
    description: "Собери рассыпанный попкорн лапкой куницы в бумажный стаканчик!",
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
