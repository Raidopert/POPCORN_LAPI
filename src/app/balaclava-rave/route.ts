import { NextResponse, type NextRequest } from "next/server";

/**
 * BALACLAVA RAVE — веб-версия ритм-игры.
 *
 * Игра лежит статикой в public/balaclava-rave/ (index.html — копия
 * репозитория Raidopert/BalaclavaRave). Этот роут нужен, чтобы ссылка
 * без индекс-файла — /balaclava-rave — не отдавала 404: HTTP-redirect
 * ведёт на /balaclava-rave/index.html, где относительные пути (манифест,
 * иконки, sw.js) резолвятся корректно. (Rewrite не годится: он не меняет
 * URL браузера и ломает относительные пути; redirect меняет.)
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/balaclava-rave/index.html", request.url),
    307,
  );
}
