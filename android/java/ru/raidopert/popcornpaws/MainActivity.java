package ru.raidopert.popcornpaws;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;

/**
 * WebView-обёртка игры POPCORN PAWS.
 * Офлайн-статика встроена в APK (assets/) и раздаётся клиентом
 * PawWebViewClient по адресу https://appassets.androidplatform.net/assets/...
 * Разрешения INTERNET нет: приложение полностью автономно.
 */
public class MainActivity extends Activity {

    private WebView wv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        wv = new WebView(this);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        // Сохранения игры (рекорды, инвентарь, настройки) живут в localStorage
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        // Звук стартует без первого клика пользователя
        s.setMediaPlaybackRequiresUserGesture(false);
        // Игнорируем системный масштаб шрифта, чтобы вёрстка не ломалась
        s.setTextZoom(100);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);

        // Клиент раздаёт встроенные ассеты по "https"-подобному адресу
        wv.setWebViewClient(new PawWebViewClient(getAssets()));

        setContentView(wv);
        wv.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Immersive sticky: прячем статус-бар и системную навигацию
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN);
        }
    }

    @Override
    public void onBackPressed() {
        // Кнопка "назад" сворачивает приложение, игра не убивается
        moveTaskToBack(true);
    }

    @Override
    protected void onPause() {
        super.onPause();
        wv.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        wv.onResume();
    }

    @Override
    protected void onDestroy() {
        wv.destroy();
        super.onDestroy();
    }
}
