import { NextResponse, type NextRequest } from "next/server";

/**
 * МузСтудия (MuzStudio) — веб-версия приложения.
 *
 * Само приложение лежит статикой в public/muz-studia/ (index.html —
 * см. репозиторий Raidopert/E_qua_lizer). Этот роут нужен, чтобы
 * ссылка без индекс-файла — /muz-studia — не отдавала 404:
 * HTTP-redirect ведёт на /muz-studia/index.html, где относительные
 * пути (иконки, скриншоты) резолвятся корректно.
 * (Rewrite здесь не годится: он не меняет URL браузера и ломает
 * относительные пути; redirect меняет — поэтому route handler.)
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/muz-studia/index.html", request.url),
    307,
  );
}
