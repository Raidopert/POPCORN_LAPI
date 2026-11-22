#!/usr/bin/env python3
"""
Сборка брендинга Raido Pert Studio (v0.0.72):
  - руны ᚱ (Raido) и ᛈ (Perthro) наносим программно (Noto Sans Runic) — чётко
    на любом размере, в отличие от нейро-отрисовки;
  - иконка-эмблема (art + руны) → .ico, android mipmap;
  - полное лого (art + руны + название) → boot-экран в игре, welcome-битмап NSIS.
"""
from PIL import Image, ImageDraw, ImageFont
import os

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)

ART = 'logo-art-1024.png'
GOLD = (244, 214, 140, 255)
GOLD_LIGHT = (252, 236, 190, 255)
CREAM = (250, 240, 214, 255)
DARK_PLUM = (58, 8, 38, 255)

name_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 76)
sub_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 42)

art = Image.open(ART).convert('RGBA')


def rune_raido(d, x, y, h, t, fill=GOLD, outline=DARK_PLUM, ow=None):
    """ᚱ РАЙДО (путь): ста́в + открытая чаша + диагональная нога. Возвращает ширину."""
    if ow is None:
        ow = max(6, t // 2)
    w = int(h * 0.72)
    sx = x + t / 2            # ось става
    vx = x + w * 0.62         # правая вершина чаши
    vy = y + h * 0.40         # высота вершины
    my = y + h * 0.58         # чаша возвращается к ставу
    lbx = x + w * 0.95        # низ ноги (правее)
    seg = [(sx, y), (sx, y + h)]                     # став
    seg += [(sx, y + t / 2), (vx, vy), (sx, my)]     # чаша
    seg += [(vx, vy), (lbx, y + h - t / 2)]          # нога
    for col, wdt in ((outline, t + 2 * ow), (fill, t)):
        d.line(seg[:2], fill=col, width=wdt)
        d.line([(sx, y + t / 2), (vx, vy)], fill=col, width=wdt)
        d.line([(vx, vy), (sx, my)], fill=col, width=wdt)
        d.line([(vx, vy), (lbx, y + h - t / 2)], fill=col, width=wdt)
    return w


def rune_perthro(d, x, y, h, t, fill=GOLD, outline=DARK_PLUM, ow=None):
    """ᛈ ПЕРТ (судьба/удача): ста́в + ромб-«кубик» на верхней половине."""
    if ow is None:
        ow = max(6, t // 2)
    w = int(h * 0.62)
    sx = x + t / 2
    cy = y + h * 0.40                      # центр ромба
    rx = int(h * 0.26)
    ry = int(h * 0.30)
    base = [(sx, cy), (sx + rx, cy - ry), (sx + 2 * rx, cy), (sx + rx, cy + ry)]
    # тёмная подложка: вершины раздвинуты от центра ромба на ow
    cx0 = sx + rx
    grown = []
    for (px, py) in base:
        dx, dy = px - cx0, py - cy
        n = (dx * dx + dy * dy) ** 0.5 or 1
        k = (n + ow) / n
        grown.append((cx0 + dx * k, cy + dy * k))
    d.polygon(grown, fill=outline)
    d.polygon(base, fill=fill)
    for col, wdt in ((outline, t + 2 * ow), (fill, t)):
        d.line([(sx, y), (sx, y + h)], fill=col, width=wdt)
    return w


def draw_runes(d, cx, cy, h=300, gap_ratio=0.20):
    """Пара рун ᚱᛈ, отцентрованная в (cx, cy)."""
    t = max(8, int(h * 0.13))
    w1 = int(h * 0.72)
    w2 = int(h * 0.62)
    gap = int(h * gap_ratio)
    total = w1 + gap + w2
    x0 = cx - total // 2
    rune_raido(d, x0, cy - h // 2, h, t)
    rune_perthro(d, x0 + w1 + gap, cy - h // 2, h, t)

# --- 1. Эмблема-иконка: art + руны в центре медальона ---
icon = art.copy()
d = ImageDraw.Draw(icon)
# медальон ~(205..810) => центр ~(510, 505); руны чуть выше геом. центра (звезда сверху)
draw_runes(d, 510, 470, h=300)
icon.save('icon-badge-1024.png')

# --- 2. Полное лого: руны выше + название под ними ---
full = art.copy()
d = ImageDraw.Draw(full)
draw_runes(d, 510, 430, h=270)
d.text((510, 640), 'RAIDO PERT', font=name_font, fill=CREAM,
       anchor='mm', stroke_width=6, stroke_fill=DARK_PLUM)
d.text((510, 712), 'S T U D I O', font=sub_font, fill=GOLD,
       anchor='mm', stroke_width=5, stroke_fill=DARK_PLUM)
full.save('logo-full-1024.png')

# --- 3. .ico 16..256 ---
sizes = [16, 24, 32, 48, 64, 96, 128, 256]
icon.resize((256, 256), Image.LANCZOS).save(
    'icon.ico', format='ICO', sizes=[(s, s) for s in sizes])

# --- 4. Android mipmap (иконка + круглая) ---
amap = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
os.makedirs('android', exist_ok=True)
for q, s in amap.items():
    img = icon.resize((s, s), Image.LANCZOS)
    img.save(f'android/ic_launcher-{q}.png')
    # круглая маска
    mask = Image.new('L', (s, s), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, s, s), fill=255)
    round_img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask)
    round_img.save(f'android/ic_launcher_round-{q}.png')

# --- 5. public/boot/logo.png (веб, 768px) ---
os.makedirs('../public/boot', exist_ok=True)
full.resize((768, 768), Image.LANCZOS).save('../public/boot/logo.png', optimize=True)

# --- 6. NSIS битмапы (24-bit BMP) ---
# 0.0.76: полностью переделано. Старая композиция «рвала» лото в окне
# установщика: эмблема вставалась впритык к краям (кольцо срезано), а внизу
# «приваривался» обрезок золотой дуги кольца (strip из низа арта).
# Теперь: медальон вырезается ЦЕЛИКОМ по кругу из арта и вставляется
# с полями; текст рисуется шрифтом; нижняя лента — чистая леопардовая
# шкура из угла арта, без золотых дуг.

GOLD_L = GOLD[:3]
CREAM_L = CREAM[:3]
PLUM_BG = (32, 6, 28)

# Медальон целиком: кольцо — центр (513,519), диаметр ~906 (замер по золоту).
# Резать из `icon` (арт + руны внутри медальона), НЕ из `art` — там пусто.
_med = icon.crop((43, 49, 983, 989))            # 940x940, кольцо и руны по кругу
_diam = _med.size[0]
_mask = Image.new('L', (_diam, _diam), 0)
ImageDraw.Draw(_mask).ellipse((2, 2, _diam - 2, _diam - 2), fill=255)
medallion = _med.convert('RGBA')
medallion.putalpha(_mask)

name_font16 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
name_font14 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
name_font22 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
sub_font12 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
sub_font10 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 10)


def paste_circular(dst, img, cx, cy):
    dst.paste(img, (int(cx - img.size[0] / 2), int(cy - img.size[1] / 2)), img.split()[3])


# welcome: 164x314 — герб целиком сверху, руны, имя студии и игры
w, h = 164, 314
wel = Image.new('RGB', (w, h), PLUM_BG)
paste_circular(wel, medallion.resize((140, 140), Image.LANCZOS), w / 2, 80)
dd = ImageDraw.Draw(wel)
draw_runes(dd, w // 2, 172, h=34)
dd.text((w / 2, 206), 'RAIDO PERT', font=name_font16, fill=CREAM_L,
        anchor='mm', stroke_width=3, stroke_fill=DARK_PLUM[:3])
dd.text((w / 2, 226), 'S T U D I O', font=sub_font10, fill=GOLD_L,
        anchor='mm', stroke_width=2, stroke_fill=DARK_PLUM[:3])
dd.text((w / 2, 254), 'POPCORN PAWS', font=name_font16, fill=GOLD_L,
        anchor='mm', stroke_width=3, stroke_fill=DARK_PLUM[:3])
dd.text((w / 2, 272), '0+ · 2026', font=sub_font10, fill=(214, 190, 160),
        anchor='mm')
# нижняя лента — чистая леопардовая шкура: патч из угла арта ПОЛНОСТЬЮ
# вне огромного кольца (центр 513,519, радиус ~460): точка (240,110) —
# на расстоянии ~491 от центра, за пределами золотого обода
strip = art.crop((0, 0, 240, 110)).resize((164, 34), Image.LANCZOS).convert('RGB')
wel.paste(strip, (0, h - 34))
wel.save('nsis-welcome.bmp', format='BMP')

# header: 150x57 — герб целиком слева, имя студии справа
hdr = Image.new('RGB', (150, 57), PLUM_BG)
paste_circular(hdr, medallion.resize((44, 44), Image.LANCZOS), 24, 28)
hd = ImageDraw.Draw(hdr)
hd.text((51, 21), 'RAIDO PERT', font=name_font14, fill=CREAM_L,
        anchor='lm', stroke_width=3, stroke_fill=DARK_PLUM[:3])
hd.text((51, 39), 'S T U D I O', font=sub_font10, fill=GOLD_L,
        anchor='lm', stroke_width=2, stroke_fill=DARK_PLUM[:3])
hdr.save('nsis-header.bmp', format='BMP')

print('BRAND_OK')
for f in ['icon-badge-1024.png', 'logo-full-1024.png', 'icon.ico',
          '../public/boot/logo.png', 'nsis-welcome.bmp', 'nsis-header.bmp']:
    print(f, os.path.getsize(f))
