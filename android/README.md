# POPCORN PAWS — Android APK (v0.0.75)

Package `ru.raidopert.popcornpaws`, versionCode 75, versionName 0.0.75, minSdk 24 / targetSdk 34.
Разрешений нет вообще (включая INTERNET) — приложение полностью автономно: офлайн-статика игры
(`desktop-build/web/`) встроена в APK (`assets/`) и раздаётся `PawWebViewClient` (чистый android.webkit)
по адресу `https://appassets.androidplatform.net/assets/...`; внешние адреса блокируются.
androidx.webkit (WebViewAssetLoader) не используется: локальный d8 8.2.2-dev (build-tools 34) падает
с NPE при дексировании его classes.jar (проверено: jar, распакованный каталог, --no-desugaring).

## Пересборка (из корня проекта)

```sh
TOOLS=/home/z/my-project/.tools/android; BT=$TOOLS/android-14; AJ=$TOOLS/android-34/android.jar
JAVA_BIN=/home/z/my-project/.tools/jdk21/usr/lib/jvm/java-21-openjdk-amd64/bin
export LD_LIBRARY_PATH=/usr/lib/jvm/java-21-openjdk-amd64/lib; export PATH=$JAVA_BIN:$PATH
mkdir -p android-build/assets && cp -r desktop-build/web/* android-build/assets/
$BT/aapt2 compile --dir android/res -o android-build/res.zip
$BT/aapt2 link -o android-build/base-unsigned.apk -I $AJ --manifest android/AndroidManifest.xml \
  -A android-build/assets --min-sdk-version 24 --target-sdk-version 34 \
  --version-code 72 --version-name 0.0.75 --auto-add-overlay android-build/res.zip
mkdir -p android-build/obj && $JAVA_BIN/javac -nowarn -source 11 -target 11 -cp $AJ \
  -d android-build/obj $(find android/java -name '*.java')
mkdir -p android-build/dex && $BT/d8 --release --lib $AJ --min-api 24 \
  --output android-build/dex $(find android-build/obj -name '*.class')
python3 -c "import zipfile; z=zipfile.ZipFile('android-build/base-unsigned.apk','a'); z.write('android-build/dex/classes.dex','classes.dex',compress_type=zipfile.ZIP_DEFLATED); z.close()"
$BT/zipalign -f 4 android-build/base-unsigned.apk android-build/base-aligned.apk
$BT/apksigner sign --ks android/keystore/popcorn-release.jks --ks-key-alias popcorn \
  --ks-pass pass:popcornpaws2026 --key-pass pass:popcornpaws2026 \
  --out android-build/POPCORN-PAWS-0.0.75.apk android-build/base-aligned.apk
$BT/apksigner verify --print-certs android-build/POPCORN-PAWS-0.0.75.apk
```

Keystore: `android/keystore/popcorn-release.jks`, alias `popcorn`, пароли (store и key): `popcornpaws2026`.
Ключ терять нельзя: обновления устанавливаются поверх старых только при совпадении подписи (same signature).
Обновление: пересобрать статику (`scripts/build-offline.sh`), поднять versionCode/versionName в манифесте
и в aapt2 link, прогнать команды выше, проверить подпись и скопировать APK в `public/downloads/`.
