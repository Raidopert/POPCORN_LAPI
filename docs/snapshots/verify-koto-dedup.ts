/**
 * Одноразовая проверка развязки дублей ников в кото-топе (фикс fetchKotoTop).
 * Сеет два устройства с одним ником + одного уникального, печатает топ, чистит за собой.
 * Запуск: bun docs/snapshots/verify-koto-dedup.ts
 */
import { fetchKotoTop } from '@/lib/kotolut-db'
import { db } from '@/lib/db'

const MARK = 'zz-dedup-check'

async function main() {
  await db.kotoLeader.deleteMany({ where: { device: { contains: MARK } } })

  const now = new Date()
  await db.kotoLeader.createMany({
    data: [
      { device: 'a1-' + MARK, name: 'Дублёр Тест', wave: 30, bosses: 3, xp: 0, maxLvl: 5, playtime: 60, createdAt: now, updatedAt: now },
      { device: 'b2-' + MARK, name: 'Дублёр Тест', wave: 12, bosses: 1, xp: 0, maxLvl: 3, playtime: 30, createdAt: now, updatedAt: now },
      { device: 'c3-' + MARK, name: 'Одинокий Кот', wave: 7, bosses: 0, xp: 0, maxLvl: 2, playtime: 10, createdAt: now, updatedAt: now },
    ],
  })

  const top = await fetchKotoTop(20)
  const rows = (top ?? []).filter((r) => r.name.startsWith('Дублёр Тест') || r.name === 'Одинокий Кот')
  for (const r of rows) console.log(`${r.name}  wave=${r.wave}`)

  const dubs = rows.filter((r) => r.name.startsWith('Дублёр Тест•'))
  const uniq = rows.find((r) => r.name === 'Одинокий Кот')
  const ok = dubs.length === 2 && dubs[0].name.split('•')[1]?.length === 4 && !!uniq
  console.log(ok ? 'OK: дубли развязаны «•тег», уникальное имя чистое' : 'FAIL: развязка не сработала')

  await db.kotoLeader.deleteMany({ where: { device: { contains: MARK } } })
  await db.$disconnect()
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error('FAIL:', e)
  process.exit(1)
})
