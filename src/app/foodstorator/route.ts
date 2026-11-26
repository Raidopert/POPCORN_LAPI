import { NextResponse, type NextRequest } from "next/server";

/**
 * FOODSTORATOR TD — веб-версия tower defense.
 *
 * Игра лежит статикой в public/foodstorator/ (статический экспорт
 * репозитория Raidopert/FOODSTORATOR, basePath=/foodstorator). Этот роут
 * нужен, чтобы ссылка без индекс-файла — /foodstorator — не отдавала 404:
 * HTTP-redirect ведёт на /foodstorator/index.html, где относительные пути
 * (_next/, иконки, манифест) резолвятся корректно. (Rewrite не годится:
 * он не меняет URL браузера и ломает basePath; redirect меняет.)
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/foodstorator/index.html", request.url),
    307,
  );
}
