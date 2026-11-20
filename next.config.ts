import type { NextConfig } from "next";

/*
 * ОФЛАЙН-ЭКСПОРТ (v0.0.72): при POPCORN_EXPORT=1 собирается статический
 * клон игры (без серверных API-роутов) для Windows-установщика и Android-APK.
 * Свой distDir (.next-export) — чтобы не трогать .next боевого dev-сервера.
 * Лидерборд в офлайн-сборке деградирует в локальный топ (online:false) —
 * это штатное поведение (см. src/app/api/leaders/route.ts и leaders-db.ts).
 */
const isExport = process.env.POPCORN_EXPORT === "1";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /* v0.0.72: dev-ресурсы (HMR/шрифты) для 127.0.0.1 — иначе hydration в браузере
     проверки не подцепляется к SSR-оверлеям */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  ...(isExport
    ? {
        output: "export",
        distDir: ".next-export",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
