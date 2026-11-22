#!/usr/bin/env python3
"""Сборка ассетов для карточки VK-мини-приложения POPCORN PAWS."""
import os, json, sys
from PIL import Image, ImageChops, ImageDraw, ImageFont

WORK = "/home/z/my-project/vk-work"
OUT = os.path.join(WORK, "vk-assets")
os.makedirs(os.path.join(OUT, "bonus"), exist_ok=True)

# ---------- 1. Иконка каталога 278x278 + фавикон 32x32 ----------
src = Image.open(os.path.join(WORK, "gen-icon-1024.png")).convert("RGB")

# обрезаем белые поля вокруг скруглённого квадрата
bg = Image.new("RGB", src.size, (255, 255, 255))
bbox = ImageChops.difference(src, bg).getbbox()
art = src.crop(bbox)
w, h = art.size
print(f"full-bleed crop: {art.size}")

# лёгкий зум, чтобы белые уголки скругления ушли за кадр
inset = int(min(w, h) * 0.055)
art = art.crop((inset, inset, w - inset, h - inset))
w, h = art.size
side = min(w, h)
art = art.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
print(f"squared: {art.size}")

icon278 = art.resize((278, 278), Image.LANCZOS)
icon278.save(os.path.join(OUT, "01-icon-catalog-278x278.png"), optimize=True)

# фавикон: крупный план мордочки (верхняя часть арта)
fw, fh = art.size
face = art.crop((int(fw * 0.24), int(fh * 0.02), int(fw * 0.94), int(fh * 0.72)))
# квадратизация кропа мордочки
cw, ch = face.size
cs = min(cw, ch)
face = face.crop(((cw - cs) // 2, (ch - cs) // 2, (cw + cs) // 2, (ch + cs) // 2))
fav32 = face.resize((32, 32), Image.LANCZOS)
fav32.save(os.path.join(OUT, "02-favicon-32x32.png"), optimize=True)
# превью фавикона x8 (только для проверки, не в архив)
fav32.resize((256, 256), Image.NEAREST).save(os.path.join(WORK, "preview-favicon-x8.png"))
icon278.resize((96, 96), Image.LANCZOS).save(os.path.join(WORK, "preview-icon-96.png"))

art.resize((512, 512), Image.LANCZOS).save(
    os.path.join(OUT, "bonus", "icon-source-512x512.png"), optimize=True)

# ---------- 2. Большой сниппет 1120x630 ----------
og = Image.open("/home/z/my-project/public/og-image.png").convert("RGB")
ow, oh = og.size  # 1344x768
tw, th = 1120, 630
# cover: масштаб по ширине, обрезка по высоте
scale_w = tw
scale_h = round(oh * tw / ow)  # 640
og_r = og.resize((scale_w, scale_h), Image.LANCZOS)
crop_y = (scale_h - th) // 2
snip = og_r.crop((0, crop_y, tw, crop_y + th))

draw = ImageDraw.Draw(snip, "RGBA")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font_sub = ImageFont.truetype(FONT, 34)
sub = "Кошачий попкорнный Беспредел"
sw = draw.textlength(sub, font=font_sub)
sh = font_sub.getbbox(sub)[3] - font_sub.getbbox(sub)[1]
px, py = 28, th - sh - 46  # плашка слева внизу
pad_x, pad_y = 22, 12
draw.rounded_rectangle(
    (px, py, px + sw + pad_x * 2, py + sh + pad_y * 2),
    radius=16, fill=(45, 22, 8, 205), outline=(255, 214, 130, 230), width=3)
draw.text((px + pad_x, py + pad_y - font_sub.getbbox(sub)[1]),
          sub, font=font_sub, fill=(255, 236, 190, 255))
snip.save(os.path.join(OUT, "03-snippet-large-1120x630.png"), optimize=True)
print("snippet done")

# ---------- 3. Lottie-загрузчик 96x96 ----------
W = H = 96
FPS = 30
OP = 60  # 2 секунды, цикл

def kf_scalar(points):
    """points: [(t, value), ...] -> keyframes с плавным easing"""
    kfs = []
    for i, (t, v) in enumerate(points):
        if i < len(points) - 1:
            kfs.append({"i": {"x": [0.45], "y": [1.0]},
                        "o": {"x": [0.55], "y": [0.0]},
                        "t": t, "s": [v]})
        else:
            kfs.append({"t": t, "s": [v]})
    return {"a": 1, "k": kfs}

def kf_vec(points):
    kfs = []
    for i, (t, v) in enumerate(points):
        if i < len(points) - 1:
            kfs.append({"i": {"x": [0.45, 0.45, 0.45], "y": [1.0, 1.0, 1.0]},
                        "o": {"x": [0.55, 0.55, 0.55], "y": [0.0, 0.0, 0.0]},
                        "t": t, "s": list(v)})
        else:
            kfs.append({"t": t, "s": list(v)})
    return {"a": 1, "k": kfs}

def st_val(v):
    return {"a": 0, "k": v}

ORANGE = [1.0, 0.62, 0.26, 1.0]     # pads
CREAM  = [0.99, 0.94, 0.85, 1.0]    # kernel
BROWN  = [0.42, 0.24, 0.07, 1.0]    # stroke

def paw_shapes():
    """лапка: основная подушечка + 3 пальчика"""
    def grp(pos, size, parent_off):
        return {"ty": "gr", "nm": "p", "it": [
            {"ty": "el", "nm": "e", "p": st_val([0, 0]), "s": st_val(list(size))},
            {"ty": "fl", "nm": "f", "c": st_val(ORANGE), "o": st_val(100)},
            {"ty": "tr", "p": st_val(list(pos)), "a": st_val([0, 0]),
             "s": st_val([100, 100]), "r": st_val(0), "o": st_val(100),
             "sk": st_val(0), "sa": st_val(0)},
        ], "np": 3}
    items = [
        grp([0, 8], [20, 15], None),          # подушечка
        grp([-11, -6], [8, 8], None),         # пальцы
        grp([0, -9], [8, 8], None),
        grp([11, -6], [8, 8], None),
    ]
    return items

def paw_layer(ind, x):
    cyc = ind * 20  # волна: 0/20/40
    o = kf_scalar([(cyc, 25), (cyc + 6, 100), (cyc + 14, 25)])
    if ind == 2:
        o["k"][-1]["t"] = OP  # цикл ровно до конца
    s = kf_vec([(cyc, (100, 100, 100)), (cyc + 4, (126, 126, 100)),
                (cyc + 12, (100, 100, 100))])
    if ind == 2:
        s["k"][-1]["t"] = OP
    return {"ddd": 0, "ind": ind + 1, "ty": 4, "nm": f"paw{ind+1}", "sr": 1,
            "ks": {"o": o, "r": st_val(0), "p": st_val([x, 66, 0]),
                   "a": st_val([0, 0, 0]), "s": s},
            "ao": 0, "shapes": paw_shapes(), "ip": 0, "op": OP, "st": 0, "bm": 0}

def kernel_layer():
    return {"ddd": 0, "ind": 4, "ty": 4, "nm": "kernel", "sr": 1,
            "ks": {"o": st_val(100),
                   "r": kf_scalar([(0, 0), (15, 14), (30, -14), (45, 14), (OP, 0)]),
                   "p": kf_vec([(0, (48, 34, 0)), (10, (48, 19, 0)), (20, (48, 34, 0)),
                                (30, (48, 19, 0)), (40, (48, 34, 0)), (50, (48, 19, 0)),
                                (OP, (48, 34, 0))]),
                   "a": st_val([0, 0, 0]),
                   "s": st_val([100, 100, 100])},
            "ao": 0,
            "shapes": [{"ty": "gr", "nm": "k", "it": [
                {"ty": "el", "nm": "body", "p": st_val([0, 0]), "s": st_val([19, 15])},
                {"ty": "fl", "nm": "fc", "c": st_val(CREAM), "o": st_val(100)},
                {"ty": "st", "nm": "ln", "c": st_val(BROWN), "o": st_val(100),
                 "w": st_val(2.5), "lc": 2, "lj": 2, "ml": 4},
                {"ty": "tr", "p": st_val([0, 0]), "a": st_val([0, 0]),
                 "s": st_val([100, 100]), "r": st_val(0), "o": st_val(100),
                 "sk": st_val(0), "sa": st_val(0)},
            ], "np": 4},
            {"ty": "gr", "nm": "patch", "it": [
                {"ty": "el", "nm": "p1", "p": st_val([3, -3]), "s": st_val([6, 5])},
                {"ty": "fl", "nm": "fy", "c": st_val([1.0, 0.80, 0.42, 1.0]), "o": st_val(100)},
                {"ty": "tr", "p": st_val([0, 0]), "a": st_val([0, 0]),
                 "s": st_val([100, 100]), "r": st_val(0), "o": st_val(100),
                 "sk": st_val(0), "sa": st_val(0)},
            ], "np": 3}],
            "ip": 0, "op": OP, "st": 0, "bm": 0}

lottie = {
    "v": "5.7.4", "fr": FPS, "ip": 0, "op": OP, "w": W, "h": H,
    "nm": "popcorn-paws-loading", "ddd": 0, "assets": [],
    "layers": [kernel_layer(), paw_layer(0, 26), paw_layer(1, 48), paw_layer(2, 70)],
}
lp = os.path.join(OUT, "04-loading-lottie-96x96.json")
with open(lp, "w") as f:
    json.dump(lottie, f, separators=(",", ":"))
print(f"lottie bytes: {os.path.getsize(lp)}")

# ---------- итоги ----------
for root, _, files in os.walk(OUT):
    for fn in sorted(files):
        p = os.path.join(root, fn)
        print(f"{os.path.relpath(p, OUT)}: {os.path.getsize(p)} bytes")
print("OK")
