package ru.raidopert.popcornpaws;

import android.content.res.AssetManager;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;

/**
 * Отдаёт встроенную офлайн-статику игры из assets/ APK по адресу
 * https://appassets.androidplatform.net/assets/...
 * (собственный аналог androidx.webkit WebViewAssetLoader: локальный d8
 * из build-tools 34 не умеет дексировать androidx-классы, см. README).
 *
 * ВАЖНО: класс намеренно верхнего уровня, без this$0/внутренних классов.
 */
public class PawWebViewClient extends WebViewClient {

    static final String HOST = "appassets.androidplatform.net";
    private static final String PREFIX = "/assets/";

    private final AssetManager am;

    PawWebViewClient(AssetManager am) {
        this.am = am;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri u = request.getUrl();
        if (!HOST.equals(u.getHost())) {
            return null;
        }
        String path = u.getPath();
        if (path == null || !path.startsWith(PREFIX)) {
            return null;
        }
        String asset = path.substring(PREFIX.length());
        try {
            InputStream in = am.open(asset);
            String mime = guessMime(asset);
            boolean text = mime.startsWith("text/") || mime.equals("application/javascript")
                    || mime.equals("application/json");
            return new WebResourceResponse(mime, text ? "utf-8" : null, in);
        } catch (IOException e) {
            // Файла нет (в т.ч. запрос каталога) - пусть WebView вернёт 404
            return null;
        }
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        // Разрешаем только встроенные ассеты; внешние адреса блокируем
        return !HOST.equals(request.getUrl().getHost());
    }

    private static String guessMime(String name) {
        String n = name.toLowerCase();
        if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html";
        if (n.endsWith(".js") || n.endsWith(".mjs")) return "application/javascript";
        if (n.endsWith(".css")) return "text/css";
        if (n.endsWith(".json")) return "application/json";
        if (n.endsWith(".webp")) return "image/webp";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".gif")) return "image/gif";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".ico")) return "image/x-icon";
        if (n.endsWith(".woff2")) return "font/woff2";
        if (n.endsWith(".woff")) return "font/woff";
        if (n.endsWith(".ttf")) return "font/ttf";
        if (n.endsWith(".otf")) return "font/otf";
        if (n.endsWith(".mp3")) return "audio/mpeg";
        if (n.endsWith(".ogg")) return "audio/ogg";
        if (n.endsWith(".wav")) return "audio/wav";
        if (n.endsWith(".mp4")) return "video/mp4";
        if (n.endsWith(".txt")) return "text/plain";
        String g = URLConnection.guessContentTypeFromName(n);
        return g != null ? g : "application/octet-stream";
    }
}
