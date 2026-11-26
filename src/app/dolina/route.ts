import { NextResponse, type NextRequest } from "next/server";

/**
 * Тихая долина — веб-версия 3D-тамагочи.
 *
 * Игра лежит статикой в public/dolina/ (index.html + vendor/three.min.js —
 * копия репозитория Raidopert/Zabotlivy). Этот роут нужен, чтобы ссылка
 * без индекс-файла — /dolina — не отдавала 404: HTTP-redirect ведёт на
 * /dolina/index.html, где относительные пути (vendor/, иконки, манифест,
 * sw.js) резолвятся корректно. (Rewrite не годится: он не меняет URL
 * браузера и ломает относительные пути; redirect меняет.)
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dolina/index.html", request.url), 307);
}
