import { NextResponse, type NextRequest } from "next/server";

/**
 * Kate Leopard — веб-версия прототипа мягкого похудения (v0.5).
 *
 * Приложение лежит статикой в public/kate-leopard/ (копия репозитория
 * Raidopert/KAteLeoPard: index.html + manifest.json + sw.js + icons/ +
 * sprites/, все пути относительные). Роут нужен, чтобы ссылка без
 * индекс-файла — /kate-leopard — не отдавала 404: HTTP-redirect ведёт
 * на /kate-leopard/index.html, где относительные пути (спрайты, иконки,
 * манифест, sw.js) резолвятся корректно. (Rewrite не годится: он не
 * меняет URL браузера и ломает относительные пути; redirect меняет.)
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/kate-leopard/index.html", request.url),
    307,
  );
}
