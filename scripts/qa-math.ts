/**
 * QA-скрипт v0.0.22: проверка новой математики (запуск: bun run scripts/qa-math.ts)
 *  — кривая уровня котика (cumulative XP по уровням 10/20/30/52/90)
 *  — курс опыта 10:1 (сколько очков нужно на уровень)
 *  — кривая куницы (уровни 5/8/12/20/31/34)
 *  — «беспорядок NANA» по уровням
 *  — сумма очков древа (24 узла)
 */
import { charLevelProgress, needForLevel } from '../src/lib/game/meta'
import { martenLevelOf, martenMess, martenXpNeed, DEFAULT_MARTEN } from '../src/lib/game/marten'
import { TREE_NODES, treeSpent, parseTreeRaw } from '../src/lib/game/skill-tree'

function cumLevelXp(level: number): number {
  let acc = 0
  for (let l = 1; l < level; l++) acc += needForLevel(l)
  return acc
}

console.log('── Кривая уровня котика (курс 10 очков = 1 🍿) ──')
for (const L of [2, 5, 10, 14, 20, 30, 52, 90]) {
  const xp = cumLevelXp(L)
  console.log(
    `  ур.${String(L).padStart(3)}: ${String(xp).padStart(8)} 🍿  = ${(xp * 10).toLocaleString('ru-RU')} очков`,
  )
}

console.log('\n── Сколько уровней даёт один забег ──')
for (const score of [20000, 50000, 200000]) {
  const xp = Math.floor(score / 10)
  const prog = charLevelProgress(xp)
  console.log(`  забег ${score.toLocaleString('ru-RU')} очков → ${xp} 🍿 → уровень ${prog.level} (из 90)`)
}

console.log('\n── Кривая куницы NANA ──')
for (const L of [2, 5, 8, 12, 20, 31, 34]) {
  let acc = 0
  for (let l = 1; l < L; l++) acc += martenXpNeed(l)
  console.log(`  ур.${String(L).padStart(3)}: ${String(acc).padStart(7)} 🐾  (нужно на след.: ${martenXpNeed(L)})`)
}

console.log('\n── Беспорядок NANA (влияние на забег) ──')
for (const L of [1, 5, 10, 20, 31, 50]) {
  const m = martenMess(L)
  console.log(
    `  ур.${String(L).padStart(3)}: норма ×${m.quota.toFixed(2)}  волна ×${m.pop.toFixed(2)}  мины +${m.mines}`,
  )
}

console.log('\n── Древо улучшений ──')
console.log(`  узлов: ${TREE_NODES.length}`)
const full = parseTreeRaw(JSON.stringify(Object.fromEntries(TREE_NODES.map((n) => [n.id, n.maxLevel]))))
console.log(`  всего очков на полное дерево: ${treeSpent(full)}`)
const maxReq = Math.max(...TREE_NODES.map((n) => n.reqLevel))
console.log(`  макс. reqLevel: ${maxReq} (нужно ${cumLevelXp(maxReq)} 🍿 = ${(cumLevelXp(maxReq) * 10).toLocaleString('ru-RU')} очков)`)
const lvl = martenLevelOf({ ...DEFAULT_MARTEN, xp: 20000 })
console.log(`\n── Куница при 200 000 очков за забег (20 000 🐾): уровень ${lvl.level} ──`)
const mess = martenMess(lvl.level)
console.log(`  разгром: норма ×${mess.quota.toFixed(2)}, волна ×${mess.pop.toFixed(2)}, мины +${mess.mines}`)
