/**
 * FPS-монитор с автоматическим снижением качества («perf-тиры»).
 *
 * ЗАЧЕМ: на средних мобильных во время «Лихорадки» (много зёрен + дождь
 * монеток) FPS проседает. Вместо того чтобы просаживать картинку у всех,
 * движок сам замечает падение и на 2 секунды включает облегчённый режим:
 *   tier 0 — все эффекты (свечение, пульс-кольца, тени, дымка);
 *   tier 1 — без свечения и теней зёрен, частиц вдвое меньше;
 *   tier 2 — минимум: без пульс-колец и виньетки, DPR-потолок 1.2.
 *
 * КАК: экспоненциальное скользящее среднее (EMA) FPS устойчиво к одиночным
 * лагам. Решения принимаются раз в WINDOW секунд с гистерезисом:
 *   вниз — средний FPS < 45 (порог DOWN);
 *   вверх — 3 окна подряд > 55 (порог UP), чтобы не дёргалось на границе.
 *
 * ИЗМЕРЕНИЕ ВРУЧНУЮ (для отладки в консоли):
 *   let frames = 0, t0 = performance.now();
 *   function loop() { frames++; requestAnimationFrame(loop); }
 *   setInterval(() => console.log('FPS', Math.round(frames * 1000 / (performance.now() - t0)), ...
 */
export const FPS_DOWN = 45
export const FPS_UP = 55
export const MAX_TIER = 2

export class FpsMeter {
  /** Текущий уровень качества эффектов: 0 — полный, 2 — минимум */
  tier = 0
  /** Сглаженный FPS для отладки/HUD (обновляется каждый кадр) */
  fps = 60

  private ema = 60
  private windowStart = 0
  private windowSamples = 0
  private goodWindows = 0

  /**
   * Вызывать каждый кадр. dt — длительность кадра в секундах,
   * now — метка времени кадра (performance.now()/rAF-timestamp).
   * Возвращает tier, если он сменился в этом кадре, иначе null.
   */
  tick(dt: number, now: number): number | null {
    /* Свёрнутая вкладка или долгий фриз: кадр не показателен — сбрасываем окно */
    if (dt <= 0 || dt > 0.25) {
      this.windowStart = now
      this.windowSamples = 0
      return null
    }
    /* EMA: прошлые кадры весят больше, мгновенный скачок не дёргает решение */
    this.ema += (1 / dt - this.ema) * 0.08
    this.fps = this.ema

    if (this.windowStart === 0) this.windowStart = now
    this.windowSamples++
    if (now - this.windowStart < 2000) return null /* окно 2 секунды */

    const avg = this.ema
    this.windowStart = now
    this.windowSamples = 0

    if (avg < FPS_DOWN && this.tier < MAX_TIER) {
      this.goodWindows = 0
      this.tier++
      return this.tier
    }
    if (avg > FPS_UP && this.tier > 0) {
      /* Три хороших окна подряд — можно вернуть эффекты */
      this.goodWindows++
      if (this.goodWindows >= 3) {
        this.goodWindows = 0
        this.tier--
        return this.tier
      }
      return null
    }
    this.goodWindows = 0
    return null
  }
}
