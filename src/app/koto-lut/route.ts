import { NextResponse, type NextRequest } from "next/server";

/**
 * КОТО-ЛУТ (v1.0) — «Лут героя»: айдл-рейд и extract-гача.
 *
 * Игра лежит статикой в public/koto-lut/ (index.html — самодостаточный
 * файл ~3.5 МБ, все арты и звуки вшиты). Роут нужен, чтобы ссылка без
 * индекс-файла — /koto-lut — не отдавала 404: HTTP-redirect ведёт на
 * /koto-lut/index.html (паттерн как у /catscribbles — см. роут выше
 * и комментарий в next.config.ts: rewrite не меняет URL браузера
 * и ломает относительные пути, redirect меняет).
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/koto-lut/index.html", request.url),
    307,
  );
}
