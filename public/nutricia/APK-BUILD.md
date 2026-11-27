# Сборка .apk через PWABuilder (Android)

Это гайд — как собрать установочный `.apk` из PWA-приложения «Рацион», чтобы клиенты на Android могли установить его как обычное приложение (из файла, без браузера и без Google Play).

> Для iOS `.ipa` так просто не собрать (нужен $99/год Apple Developer + Xcode + ревью). iOS-клиенты устанавливают PWA через Safari — см. `install.html`.

## Что понадобится

- PWA уже задеплоен на `https://raidopert.ru/nutricia/` (после мержа PR #2)
- Аккаунт на https://www.pwabuilder.com (бесплатно, вход через GitHub/Microsoft)
- ~15 минут

## Шаг 1. Проверить PWA-готовность

Откройте https://www.pwabuilder.com и вставьте URL:

```
https://raidopert.ru/nutricula/
```

Нажмите **Start**. PWABuilder проанализирует манифест, иконки, SW и покажет оценку.

Должно быть:
- ✅ Manifest: OK (есть `manifest.json` с иконками 192/512)
- ✅ Service Worker: OK (`sw.js` регистрируется)
- ✅ Installable: Yes

Если что-то красное — PWABuilder подскажет чего не хватает. Скорее всего всё уже на месте.

## Шаг 2. Сгенерировать .apk

1. На странице анализа нажмите **Package For Stores** → выберите **Android**.
2. Заполните форму:
   - **Package ID**: `ru.raidopert.nutricia`
   - **App name**: `Рацион`
   - **App version**: `1.1.0`
   - **Signing key**: выберите **New key** (PWABuilder сгенерирует), **скачайте `.keystore`** и сохраните в надёжном месте — без него не обновить приложение потом
   - **Signing key password**: придумайте, сохраните
   - Остальное — по умолчанию
3. Нажмите **Generate**. Через ~1 минуту скачается `.zip` с:
   - `app-release-signed.apk` — это и есть установочный файл
   - `*.keystore` — ключ для подписи (сохранить!)
   - `release-notes.txt`

## Шаг 3. Разместить .apk для скачивания

Загрузите `app-release-signed.apk` в репозиторий POPCORN_LAPI в папку `public/nutricia/`:

```bash
# в локальном клоне POPCORN_LAPI
cp ~/Downloads/app-release-signed.apk public/nutricia/ration.apk
git add public/nutricula/ration.apk
git commit -m "feat(nutricula): добавить .apk для установки на Android"
git push
```

После мержа файл будет доступен по адресу: `https://raidopert.ru/nutricula/ration.apk`

## Шаг 4. Обновить install.html

В `install.html` найдите кнопку `b_apk` и замените заглушку на прямую ссылку:

```js
// было:
document.getElementById("b_apk").onclick = function(){
  alert("Файл .apk пока не загружен...");
};

// стало:
document.getElementById("b_apk").onclick = function(){
  window.location.href = "./ration.apk";
};
```

## Как клиенты устанавливают .apk

1. Клиент открывает `https://raidopert.ru/nutricula/install.html` на Android.
2. Нажимает **«Скачать ration.apk»**.
3. Android показывает предупреждение «установка из неизвестных источников» → клиент разрешает (один раз).
4. Файл скачивается → открывается → «Установить».
5. Иконка «Р» появляется в меню приложений, как у обычного приложения.

## Обновление .apk (когда вышла новая версия)

1. Поменяйте версию в форме PWABuilder (например `1.2.0`).
2. Используйте **тот же `.keystore`** (иначе Android не даст обновить — будет «конфликт подписи»).
3. Сгенерируйте новый `.apk`, загрузите поверх старого в `public/nutricia/ration.apk`.
4. Клиенты при следующем открытии получат уведомление об обновлении (TWA умеет автообновляться через Play, но для sideload нужно переустановить вручную).

## Альтернатива: публикация в Google Play

Если клиентов станет много и нужен маркетинг через поиск Play — тот же `.apk` можно залить в Google Play Console ($25 разовый взнос за аккаунт разработчика). PWABuilder даёт готовый `.aab` (App Bundle) для Play. Процесс:

1. https://play.google.com/console → $25 → создать приложение
2. Заполнить карточку (название, описание, иконки, скриншоты)
3. Загрузить `.aab` (PWABuilder отдаёт его вместе с `.apk`)
4. Пройти проверку (обычно 1-3 дня)
5. Опубликовать

Это уже опциональный шаг — для MVP достаточно `.apk` через sideload + PWA для iOS.

---

**Резюме для быстрого старта:** откройте https://www.pwabuilder.com → вставьте `https://raidopert.ru/nutricula/` → Android → Generate → скачайте `.apk` → положите в `public/nutricula/ration.apk` → обновите `install.html`. Готово.
