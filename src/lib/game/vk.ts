/**
 * VK BRIDGE (v0.0.71): тонкая безопасная обёртка над @vkontakte/vk-bridge.
 *
 * Какие правила размещения VK Mini Apps закрывает модуль:
 *  - п. 2.2.1  — библиотека vk-bridge подключена и корректно инициализирована
 *                (VKWebAppInit при старте);
 *  - п. 2.2.5  — VKWebAppViewHide глушит звук до закрытия вью (мобильные платформы);
 *  - п. 4.2.1  — механика монетизации каталога игр: вознаграждаемая медиареклама
 *                (VKWebAppShowNativeAds, ad_format 'rewarded', по целевому вызову
 *                пользователя за явно обозначенный бонус — как требует п. 5.1.5);
 *  - п. 1.2.2/1.2.3 — параметры запуска с подписью передаются на сервер, где
 *                подпись проверяется (leaderboard-guard.verifyVKParams).
 *
 * Вне VK (браузер, сторонние хостинги) всё молча деградирует:
 * isVKEnv() = false, реклама возвращает 'unsupported', подпись не прикладывается.
 */

type Bridge = typeof import('@vkontakte/vk-bridge')['default']

let bridge: Bridge | null = null
let inited = false
let embedded = false

/** Параметры запуска VK (VKWebAppGetLaunchParams) — кэш для подписи в API-запросах */
export interface VKLaunchParams {
  vk_user_id?: number
  app_id?: number
  sign?: string
  [key: string]: unknown
}
let launchParams: VKLaunchParams | null = null

/** true — запущены внутри VK (iframe/webview мини-приложения) */
export function isVKEnv(): boolean {
  return inited && embedded
}

/** true — bridge загружен и инициализирован (даже вне VK-окружения) */
export function isBridgeReady(): boolean {
  return bridge !== null
}

/** Кэшированные параметры запуска (null — недоступны) */
export function getVKLaunchParams(): VKLaunchParams | null {
  return launchParams
}

/* --- видимость вью (ViewHide/ViewRestore) --- */

type ViewHandler = (hidden: boolean) => void
const viewHandlers = new Set<ViewHandler>()

/** Подписка на скрытие/возврат вью VK. Возвращает отписку. */
export function onVKViewVisibility(fn: ViewHandler): () => void {
  viewHandlers.add(fn)
  return () => {
    viewHandlers.delete(fn)
  }
}

/** Инициализация bridge. Безопасно звать многократно; вне VK вернёт false. */
export async function initVK(): Promise<boolean> {
  if (inited) return embedded
  inited = true
  try {
    const mod = await import('@vkontakte/vk-bridge')
    bridge = mod.default
    /* Спрятать системный спиннер загрузки VK-клиента */
    await bridge.send('VKWebAppInit')
    embedded =
      typeof bridge.isEmbedded === 'function'
        ? bridge.isEmbedded()
        : /[?&](vk_app_id|vk_platform)=/.test(window.location.search)
    /* Параметры запуска с подписью — сервер проверит их (п. 1.2.2).
       Старые клиенты без метода — не беда, запросы уходят без vk-полей */
    try {
      const lp = await bridge.send('VKWebAppGetLaunchParams')
      if (lp && typeof lp === 'object') launchParams = lp as VKLaunchParams
    } catch {
      /* не критично */
    }
    bridge.subscribe((event) => {
      const type = event?.detail?.type
      if (type === 'VKWebAppViewHide') viewHandlers.forEach((fn) => fn(true))
      else if (type === 'VKWebAppViewRestore') viewHandlers.forEach((fn) => fn(false))
    })
    return embedded
  } catch {
    return false
  }
}

export type AdResult = 'completed' | 'skipped' | 'failed' | 'unsupported'

/**
 * Вознаграждаемая медиареклама (п. 5.1.5 правил VK: только по целевому вызову
 * пользователя за явно обозначенный бонус, не чаще одной за активацию).
 * resolve — 'completed' (награда разрешена), 'skipped', 'failed', 'unsupported'.
 */
export function showRewardedAd(): Promise<AdResult> {
  const b = bridge
  if (!b) return Promise.resolve('unsupported')
  if (typeof b.supports === 'function' && !b.supports('VKWebAppShowNativeAds')) {
    return Promise.resolve('unsupported')
  }
  return new Promise<AdResult>((resolve) => {
    let done = false
    let listener: Parameters<Bridge['subscribe']>[0] | null = null
    const finish = (result: AdResult): void => {
      if (done) return
      done = true
      if (listener && b) b.unsubscribe(listener)
      window.clearTimeout(hangGuard)
      resolve(result)
    }
    /* VK присылает VKWebAppShowNativeAdsResult c data.result 'completed'/'skipped' */
    listener = (event) => {
      if (event?.detail?.type !== 'VKWebAppShowNativeAdsResult') return
      const res = (event.detail.data as { result?: string } | undefined)?.result
      if (res === 'skipped') finish('skipped')
      else finish('completed')
    }
    b.subscribe(listener)
    /* Страховка от вечного висения: 60 c без ответа — считаем сбой */
    const hangGuard = window.setTimeout(() => finish('failed'), 60_000)
    void b
      .send('VKWebAppShowNativeAds', { ad_format: 'rewarded' })
      .then(() => {
        /* На части платформ событие-результат не приходит — промис
           разрешается после закрытия рекламы; даём событию 250 мс фору */
        window.setTimeout(() => finish('completed'), 250)
      })
      .catch(() => finish('failed'))
  })
}
