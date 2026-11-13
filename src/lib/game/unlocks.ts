/**
 * Разблокировки по уровню котика 🎖 «POPCORN PAWS» (v0.0.33).
 *
 *  ОПЫТ стал настоящей системой прогрессии:
 *    • за каждый забег капает опыт 🍿 (10 очков = 1 🍿 + награда за этапы);
 *    • уровень котика растёт от суммарного опыта и НИКОГДА не падает;
 *    • уровень открывает ЛАПКИ, АПГРЕЙДЫ и АРТЕФАКТЫ — без него даже
 *      с полным кошельком покупка закрыта («🔒 Ур. N»).
 *
 *  Здесь собраны помощники: проверка «открыто ли» и список названий,
 *  которые открываются НА конкретном уровне — чтобы тост повышения
 *  и экран результатов показывали игроку плоды роста.
 */

import { PAWS } from './paws'
import { UPGRADES } from './upgrades'
import { ARTIFACTS } from './market'

/** Минимальный уровень котика, требуемый лапке (1 — открыта сразу) */
export function pawReqLevel(pawId: string): number {
  return PAWS.find((p) => p.id === pawId)?.reqLevel ?? 1
}

/** Минимальный уровень котика, требуемый апгрейду */
export function upgradeReqLevel(upgId: string): number {
  return UPGRADES.find((u) => u.id === upgId)?.reqLevel ?? 1
}

export interface LevelUnlock {
  kind: 'paw' | 'upgrade' | 'artifact'
  /** Ключ i18n названия: paw.<id>.name / upg.<id>.name / artifact.<id>.name */
  nameKey: string
}

/** Что именно открывается на уровне N (для тостов и экрана результатов) */
export function unlocksAtLevel(level: number): LevelUnlock[] {
  const out: LevelUnlock[] = []
  for (const p of PAWS) {
    if ((p.reqLevel ?? 1) === level) out.push({ kind: 'paw', nameKey: `paw.${p.id}.name` })
  }
  for (const u of UPGRADES) {
    if ((u.reqLevel ?? 1) === level) out.push({ kind: 'upgrade', nameKey: `upg.${u.id}.name` })
  }
  for (const a of ARTIFACTS) {
    if ((a.reqLevel ?? 1) === level) out.push({ kind: 'artifact', nameKey: `artifact.${a.id}.name` })
  }
  return out
}

/**
 * Названия всего, что открылось на уровнях from+1…to (включительно).
 * Повышение сразу на несколько уровней за один забег — не редкость,
 * и все подарки должны быть перечислены.
 */
export function unlockNamesForRange(fromLevel: number, toLevel: number): LevelUnlock[] {
  const out: LevelUnlock[] = []
  for (let l = Math.max(1, fromLevel) + 1; l <= toLevel; l++) out.push(...unlocksAtLevel(l))
  return out
}
