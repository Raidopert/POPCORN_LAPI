import { NextResponse, type NextRequest } from "next/server";

/**
 * Рацион — кабинет нутрициолога.
 *
 * Приложение лежит статикой в public/nutricia/ (копия репозитория
 * Raidopert/Nutricia-: index.html + manifest.json + sw.js + icons/,
 * все пути относительные). Роут нужен, чтобы ссылка без индекс-файла —
 * /nutricia — не отдавала 404: HTTP-redirect ведёт на /nutricia/index.html,
 * где относительные пути (иконки, манифест, sw.js) резолвятся корректно.
 * (Rewrite не годится: он не меняет URL браузера и ломает относительные
 * пути; redirect меняет.)
 *
 * Источник: Raidopert/Nutricia- (MIT). Версия 1.0.0.
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/nutricia/index.html", request.url),
    307,
  );
}
