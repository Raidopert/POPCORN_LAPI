import { NextResponse, type NextRequest } from "next/server";

/**
 * CatScribbles (КошачьиЗакорючки) — веб-версия приложения.
 *
 * Само приложение лежит статикой в public/catscribbles/ (index.html +
 * app.js — см. репозиторий Raidopert/catscribbles). Этот роут нужен,
 * чтобы ссылка без индекс-файла — /catscribbles — не отдавала 404:
 * HTTP-redirect ведёт на /catscribbles/index.html, где относительные
 * пути (app.js, иконки, манифест, sw.js) резолвятся корректно.
 * (Rewrite здесь не годится: он не меняет URL браузера и ломает
 * относительные пути; redirect меняет — поэтому route handler.)
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/catscribbles/index.html", request.url),
    307,
  );
}
