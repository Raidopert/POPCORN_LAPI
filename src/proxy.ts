/**
 * ПРОКСИ ПО ДОМЕНУ (v0.0.74) — доменная архитектура Raido Pert Studio:
 *
 *   raidopert.ru  /  www.raidopert.ru  →  сайт студии (рендер маршрута /studio)
 *   play.raidopert.ru / *.vercel.app / localhost  →  игра POPCORN PAWS (как раньше)
 *
 * В Next.js 16 файл-конвенция middleware.ts переименована в proxy.ts.
 * Рерайтим ТОЛЬКО корень «/» на студийных хостах: API, ассеты и сам /studio
 * доступны с любого домена — ничего в игре и лидерборде не ломается.
 */

import { NextResponse, type NextRequest } from 'next/server'

const STUDIO_HOSTS = new Set(['raidopert.ru', 'www.raidopert.ru'])

export function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '')
    .toLowerCase()
    .split(':')[0]

  if (STUDIO_HOSTS.has(host) && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/studio', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/studio'],
}
