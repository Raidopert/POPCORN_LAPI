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
# welcome: 164x314 — вертикальная колонка, эмблема сверху, низ под текст
w, h = 164, 314
wel = Image.new('RGB', (w, h), (46, 10, 40))
badge = full.resize((150, 150), Image.LANCZOS).convert('RGB')
wel.paste(badge, (7, 12))
# нижняя часть — леопардовый орнамент-полоска из арта
strip = art.crop((120, 860, 904, 1000)).resize((164, 30), Image.LANCZOS).convert('RGB')
wel.paste(strip, (0, h - 30))
wel.save('nsis-welcome.bmp', format='BMP')

# header: 150x57 — маленькая эмблема
hdr = Image.new('RGB', (150, 57), (46, 10, 40))
mini = icon.resize((50, 50), Image.LANCZOS).convert('RGB')
hdr.paste(mini, (5, 3))
hdr.save('nsis-header.bmp', format='BMP')

print('BRAND_OK')
for f in ['icon-badge-1024.png', 'logo-full-1024.png', 'icon.ico',
          '../public/boot/logo.png', 'nsis-welcome.bmp', 'nsis-header.bmp']:
    print(f, os.path.getsize(f))
