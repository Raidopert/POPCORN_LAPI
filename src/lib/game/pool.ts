/**
 * Object Pool — переиспользуемый пул объектов для горячего кода игры.
 *
 * ЗАЧЕМ: во время «Лихорадки» игра создаёт десятки объектов в секунду
 * (частицы монеток, крошки, всплывающие тексты). Каждое `push`/`splice`
 * и каждый объект-литерал — мусор для сборщика GC, а GC-пауза на среднем
 * телефоне = фриз на 30–80 мс прямо посреди экшена.
 *
 * КАК: пул заранее выделяет фиксированное число объектов и держит их в
 * одном массиве. Активная зона — префикс [0..length), «удаление» — это
 * swap-remove за O(1) без splice и без аллокаций. Если пул исчерпан,
 * вырастает на один элемент (бывает редко, дальше живёт в пуле).
 *
 * ПРИМЕР:
 *   const pool = new Pool<Particle>(192, () => ({ x: 0, y: 0, ... }))
 *   const p = pool.obtain()      // «создать» (на деле переиспользовать)
 *   p.x = 10; p.ttl = 0.4        // заполнить поля целиком!
 *   pool.release(i)              // «удалить» по индексу обхода
 *   pool.clear()                 // убрать все разом (новый уровень)
 */
export class Pool<T> {
  /** Внутренний массив: [0..length) — активные, [length..) — свободные */
  readonly items: T[]
  private active = 0
  private factory: () => T

  constructor(size: number, factory: () => T) {
    this.factory = factory
    this.items = new Array<T>(size)
    for (let i = 0; i < size; i++) this.items[i] = factory()
  }

  /** Сколько объектов сейчас живых */
  get length(): number {
    return this.active
  }

  /** Взять свободный объект из пула. Поля нужно заполнить целиком! */
  obtain(): T {
    if (this.active >= this.items.length) this.items.push(this.factory())
    return this.items[this.active++]
  }

  /** «Удалить» элемент с индексом i: swap-remove за O(1), без splice */
  release(i: number): void {
    const last = --this.active
    if (i !== last) {
      const tmp = this.items[i]
      this.items[i] = this.items[last]
      this.items[last] = tmp
    }
  }

  /** Освободить всё сразу (начало уровня/лихорадки) — память остаётся в пуле */
  clear(): void {
    this.active = 0
  }
}
