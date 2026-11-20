#!/usr/bin/env python3
"""POPCORN PAWS: процедурные концепт-заготовки в стиле игры (пиксель-арт). v2

  public/studio/concepts/popcorn-varieties.png  — лист 8 видов зёрен
  public/studio/concepts/avatars-space.png      — лист 4 пиксельных аватаров (с ушами!)
  public/studio/concepts/room-lab.png           — «Лаборатория» с полкой колб
  public/studio/concepts/room-cosmodrome.png    — «Космодром» с пультом
  public/studio/concepts/room-haunted.png       — «Дом с призраками» со свечой и духом
"""
from PIL import Image, ImageDraw

OUT = "/home/z/my-project/public/studio/concepts"

TRAY = (58, 40, 66)
WOOD = (122, 82, 52)
WOOD_D = (94, 62, 40)
CREAM = (255, 247, 234)
CARAMEL = (224, 154, 78)
GOLD = (255, 213, 74)
TEAL = (112, 199, 181)
PANEL = (72, 52, 86)


def draw_puff(dr, cx, cy, s, base, light, dark, seed=0):
    bumps = [(-4, -3, 6), (4, -3, 6), (0, -5, 5), (-3, 3, 6), (3, 3, 6)]
    for i, (dx, dy, r) in enumerate(bumps):
        dr.ellipse([cx + dx * s - r * s, cy + dy * s - r * s,
                    cx + dx * s + r * s, cy + dy * s + r * s],
                   fill=base if i % 2 or seed % 3 else dark)
    dr.ellipse([cx - 6 * s, cy - 5 * s, cx + 6 * s, cy + 5 * s], fill=base)
    dr.ellipse([cx - 5 * s, cy + 1 * s, cx + 5 * s, cy + 5 * s], fill=dark)
    dr.ellipse([cx - 5 * s, cy - 1 * s, cx + 5 * s, cy + 3 * s], fill=base)
    dr.ellipse([cx - 4 * s, cy - 5 * s, cx + 1 * s, cy - 1 * s], fill=light)


def decorate(dr, img, cx, cy, s, kind):
    if kind == "cheese":
        for dx, dy in [(-3, -2), (2, 0), (-1, 3), (3, 3)]:
            dr.ellipse([cx + dx * s - s, cy + dy * s - s, cx + dx * s + s, cy + dy * s + s], fill=(200, 148, 30))
    elif kind == "choco":
        for dx, dy in [(-5, -2), (-2, 0), (1, -2), (4, 0), (-3, 3), (2, 3)]:
            dr.rectangle([cx + dx * s - 2 * s, cy + dy * s, cx + dx * s + 2 * s, cy + dy * s + s], fill=(122, 74, 43))
    elif kind == "ice":
        for dx, dy in [(-4, -4), (4, -3), (0, -1), (-3, 3), (3, 4)]:
            dr.line([cx + dx * s - s, cy + dy * s, cx + dx * s + s, cy + dy * s], fill=(226, 246, 255), width=s)
            dr.line([cx + dx * s, cy + dy * s - s, cx + dx * s, cy + dy * s + s], fill=(226, 246, 255), width=s)
    elif kind == "pepper":
        dr.polygon([(cx - 2 * s, cy - 8 * s), (cx - 4 * s, cy - 3 * s), (cx + 1 * s, cy - 4 * s)], fill=(224, 75, 58))
        dr.polygon([(cx + 2 * s, cy - 7 * s), (cx + 4 * s, cy - 2 * s), (cx + 1 * s, cy - 3 * s)], fill=(255, 152, 60))
    elif kind == "rainbow":
        # переливы: диагональные полоски, обрезанные по маске зерна
        R = 12 * s
        stripes = Image.new("RGBA", (R, R), (0, 0, 0, 0))
        sd = ImageDraw.Draw(stripes)
        bands = [(224, 75, 58), (255, 152, 60), (255, 213, 74), (112, 199, 181), (99, 152, 236), (170, 120, 200)]
        bw = R / len(bands)
        for i, c in enumerate(bands):
            x0 = i * bw
            sd.polygon([(x0, 0), (x0 + bw, 0), (x0 + bw - R, R), (x0 - R, R)], fill=c + (235,))
        mask = Image.new("L", (R, R), 0)
        md = ImageDraw.Draw(mask)
        md.ellipse([s, s, R - s, R - s], fill=255)
        img.paste(stripes, (cx - R // 2, cy - R // 2), mask)
        dr.ellipse([cx - 4 * s, cy - 5 * s, cx + 1 * s, cy - 1 * s], fill=(255, 255, 255, 235))
    elif kind == "ghost":
        dr.ellipse([cx - 3 * s, cy - 3 * s, cx - 1 * s, cy - 1 * s], fill=(40, 40, 60))
        dr.ellipse([cx + 1 * s, cy - 3 * s, cx + 3 * s, cy - 1 * s], fill=(40, 40, 60))
    elif kind == "goldbar":
        dr.rounded_rectangle([cx - 7 * s, cy + 2 * s, cx + 7 * s, cy + 7 * s], radius=s, fill=(255, 213, 74))
        dr.rounded_rectangle([cx - 7 * s, cy + 2 * s, cx + 7 * s, cy + 4 * s], radius=s, fill=(255, 240, 170))
        dr.rectangle([cx - 5 * s, cy + 5 * s, cx - 2 * s, cy + 6 * s], fill=(255, 240, 170))
    elif kind == "hoppy":
        dr.arc([cx - 8 * s, cy - 8 * s, cx - 2 * s, cy - 2 * s], 180, 320, fill=(154, 220, 240), width=s)
        dr.arc([cx + 2 * s, cy - 8 * s, cx + 8 * s, cy - 2 * s], 220, 360, fill=(154, 220, 240), width=s)


def kernel_card(path):
    S = 6
    W, H = 1344, 768
    img = Image.new("RGB", (W, H), TRAY)
    dr = ImageDraw.Draw(img, "RGBA")
    dr.rounded_rectangle([40, 120, W - 40, H - 90], radius=48, fill=WOOD)
    dr.rounded_rectangle([40, 120, W - 40, H - 90], radius=48, outline=WOOD_D, width=10)
    kinds = [
        ("classic", CREAM, (255, 255, 255), (228, 214, 196)),
        ("cheese", (246, 196, 69), (255, 231, 140), (206, 158, 46)),
        ("choco", (150, 92, 52), (188, 124, 76), (106, 62, 34)),
        ("ice", (154, 220, 240), (222, 246, 255), (110, 180, 210)),
        ("pepper", (232, 96, 74), (255, 152, 120), (186, 62, 48)),
        ("rainbow", (170, 120, 200), (240, 230, 255), (130, 90, 160)),
        ("ghost", (232, 236, 244), (255, 255, 255), (200, 206, 220)),
        ("goldbar", (255, 213, 74), (255, 236, 150), (214, 168, 40)),
    ]
    cw, ch = (W - 160) // 4, (H - 300) // 2
    for i, (kind, base, light, dark) in enumerate(kinds):
        row, col = divmod(i, 4)
        cx, cy = 120 + col * cw + cw // 2, 220 + row * ch + ch // 2
        draw_puff(dr, cx, cy, S, base, light, dark, seed=i)
        decorate(dr, img, cx, cy, S, kind)
    img.save(path)
    print("OK", path)


# ---------- АВАТАРЫ ----------
CAT_GRID = [
    ".O..........O...",  # 0  ушки
    ".OO........OO...",
    ".OOO......OOO...",
    ".OOOOOOOOOOOO...",
    "..OOOOOOOOOO....",  # 4  лоб
    ".OOOOOOOOOOOO...",
    "OOOOOOOOOOOOOO..",
    "OOOOWKOOOOWKOO..",  # 7  глаза
    "OOOOWKOOOOWKOO..",
    "OOOOOOOPOOOOOO..",  # 9  нос
    "OOOOOOWWOOOOOO..",  # 10 мордочка
    "OOOOOOOOOOOOOO..",
    ".OOOOOOOOOOOO...",
    "..OOOOOOOOOO....",
    "................",
    "................",
]

AVATAR_SETS = {
    "cosmo":  {"O": (176, 126, 206), "W": (255, 255, 255), "K": (30, 30, 46), "P": (60, 46, 78)},
    "ghosty": {"O": (236, 238, 246), "W": (255, 255, 255), "K": (30, 30, 46), "P": (184, 188, 202)},
    "knight": {"O": (204, 208, 216), "W": (255, 255, 255), "K": (30, 30, 46), "P": (166, 170, 182)},
    "wizard": {"O": (150, 156, 168), "W": (255, 255, 255), "K": (30, 30, 46), "P": (112, 118, 132)},
}


def avatar_card(path):
    S = 12
    PAD = 26
    cell = 16 * S + PAD * 2
    W = H = cell * 2 + PAD * 2
    img = Image.new("RGB", (W, H), TRAY)
    dr = ImageDraw.Draw(img)
    names = ["cosmo", "ghosty", "knight", "wizard"]
    outlines = [GOLD, CARAMEL, GOLD, CARAMEL]
    for i, name in enumerate(names):
        row, col = divmod(i, 2)
        x0 = PAD + col * cell
        y0 = PAD + row * cell
        dr.rounded_rectangle([x0, y0, x0 + cell - 4, y0 + cell - 4], radius=16, fill=PANEL,
                             outline=outlines[i], width=4)
        gx = x0 + PAD + (cell - 4 - 16 * S - PAD) // 2
        gy = y0 + PAD + (cell - 4 - 16 * S - PAD) // 2
        pal = AVATAR_SETS[name]
        for yy, rowv in enumerate(CAT_GRID):
            for xx, ch in enumerate(rowv):
                if ch in pal:
                    dr.rectangle([gx + xx * S, gy + yy * S, gx + xx * S + S - 1, gy + yy * S + S - 1],
                                 fill=pal[ch])
        if name == "cosmo":  # шлем-купол + визор
            dr.arc([gx - 3 * S, gy - 4 * S, gx + 17 * S, gy + 12 * S], 150, 390, fill=(224, 230, 244), width=int(S * 0.8))
            dr.rectangle([gx + 2 * S, gy + 6 * S, gx + 14 * S, gy + 8 * S], fill=(96, 160, 210))
            dr.rectangle([gx + 2 * S, gy + 6 * S, gx + 14 * S, gy + 7 * S], fill=(130, 190, 235))
            for sx in (4, 9):
                dr.rectangle([gx + sx * S, gy + 6 * S, gx + sx * S + 3, gy + 6 * S + 3], fill=(255, 255, 255))
        elif name == "ghosty":  # простынка с волной
            dr.arc([gx - 2 * S, gy - 3 * S, gx + 16 * S, gy + 11 * S], 180, 360, fill=(255, 255, 255), width=int(S * 1.1))
            for k in range(4):
                xx = gx + k * 4 * S + S
                dr.rectangle([xx, gy + 12 * S, xx + 3 * S, gy + 13 * S + k % 2 * S], fill=(255, 255, 255))
            dr.ellipse([gx + 4 * S, gy + 5 * S, gx + 5 * S, gy + 6 * S], fill=(30, 30, 46))
            dr.ellipse([gx + 9 * S, gy + 5 * S, gx + 10 * S, gy + 6 * S], fill=(30, 30, 46))
        elif name == "knight":  # обруч + золотой гребень, уши видны
            dr.rectangle([gx + 0 * S, gy + 3 * S, gx + 15 * S, gy + 5 * S], fill=(176, 180, 192))
            dr.polygon([(gx + 8 * S, gy - 3 * S), (gx + 6 * S, gy + 3 * S), (gx + 10 * S, gy + 3 * S)], fill=GOLD)
            dr.rectangle([gx + 3 * S, gy + 4 * S, gx + 6 * S, gy + 5 * S], fill=(255, 255, 255))
            dr.rectangle([gx + 9 * S, gy + 4 * S, gx + 12 * S, gy + 5 * S], fill=(255, 255, 255))
        elif name == "wizard":  # островерхая шляпа между ушами
            dr.polygon([(gx + 7 * S, gy - 5 * S), (gx + 2 * S, gy + 3 * S), (gx + 12 * S, gy + 3 * S)], fill=(96, 76, 150))
            dr.rectangle([gx - 1 * S, gy + 3 * S, gx + 15 * S, gy + 5 * S], fill=(66, 52, 112))
            for sx, sy in [(8, -2), (6, 0), (9, 1)]:
                dr.rectangle([gx + sx * S, gy + sy * S, gx + sx * S + 4, gy + sy * S + 4], fill=GOLD)
    img.save(path)
    print("OK", path)


# ---------- КОМНАТЫ ----------
def prop_lab(dr, x0, y0, w, h):
    """Полка с колбами."""
    dr.rectangle([x0, y0 + h - 18, x0 + w, y0 + h], fill=(94, 62, 40))
    cols = [(112, 199, 181), (99, 152, 236), (255, 213, 74)]
    for i, c in enumerate(cols):
        fx = x0 + 26 + i * (w - 52) // 3
        fw = (w - 52) // 3 - 20
        dr.rounded_rectangle([fx, y0 + 20, fx + fw, y0 + h - 24], radius=10, fill=(230, 240, 244))
        dr.rectangle([fx + 6, y0 + h // 2, fx + fw - 6, y0 + h - 30], fill=c)
        dr.rectangle([fx + fw // 2 - 6, y0 + 8, fx + fw // 2 + 6, y0 + 24], fill=(200, 210, 216))


def prop_cosmodrome(dr, x0, y0, w, h):
    """Пульт с лампочками и большой кнопкой."""
    dr.rounded_rectangle([x0, y0 + 30, x0 + w, y0 + h], radius=14, fill=(96, 106, 138))
    lamps = [(255, 99, 88), (255, 213, 74), (112, 199, 181), (255, 152, 60), (99, 152, 236)]
    for i, c in enumerate(lamps):
        lx = x0 + 22 + i * (w - 44) // len(lamps)
        dr.ellipse([lx, y0 + 52, lx + 26, y0 + 78], fill=c)
    dr.rectangle([x0 + 20, y0 + 96, x0 + w - 20, y0 + 120], fill=(40, 44, 60))
    for i in range(6):
        bx = x0 + 26 + i * (w - 52) // 6
        dr.rectangle([bx, y0 + 100, bx + (w - 52) // 6 - 8, y0 + 116], fill=(154, 220, 240))
    dr.ellipse([x0 + w // 2 - 34, y0 + 140, x0 + w // 2 + 34, y0 + 208], fill=(224, 96, 88))
    dr.ellipse([x0 + w // 2 - 34, y0 + 140, x0 + w // 2 + 34, y0 + 208], outline=(255, 255, 255), width=4)


def prop_haunted(dr, x0, y0, w, h):
    """Свеча и милый дух."""
    dr.rectangle([x0 + w // 2 - 14, y0 + h - 40, x0 + w // 2 + 14, y0 + h - 14], fill=(236, 226, 205))
    dr.polygon([(x0 + w // 2 - 10, y0 + h - 46), (x0 + w // 2 + 10, y0 + h - 46), (x0 + w // 2, y0 + h - 76)], fill=(255, 213, 74))
    dr.polygon([(x0 + w // 2 - 5, y0 + h - 52), (x0 + w // 2 + 5, y0 + h - 52), (x0 + w // 2, y0 + h - 70)], fill=(255, 240, 170))
    # дух
    gx, gy = x0 + w // 2, y0 + 60
    dr.ellipse([gx - 34, gy - 40, gx + 34, gy + 30], fill=(232, 236, 244))
    dr.polygon([(gx - 34, gy + 10), (gx - 34, gy + 60), (gx - 20, gy + 44), (gx - 6, gy + 60), (gx + 8, gy + 44), (gx + 22, gy + 60), (gx + 34, gy + 40), (gx + 34, gy + 10)], fill=(232, 236, 244))
    dr.ellipse([gx - 18, gy - 14, gx - 8, gy - 2], fill=(40, 40, 60))
    dr.ellipse([gx + 8, gy - 14, gx + 18, gy - 2], fill=(40, 40, 60))


def room_card(path, wall, floor, accent, night, prop):
    W, H = 1344, 768
    img = Image.new("RGB", (W, H), wall)
    dr = ImageDraw.Draw(img)
    dr.rectangle([0, int(H * 0.72), W, H], fill=floor)
    for i in range(0, W, 64):
        dr.line([i, int(H * 0.72), i, H], fill=tuple(max(0, c - 12) for c in floor), width=2)
    wx, wy, ww, wh = int(W * 0.60), int(H * 0.12), int(W * 0.28), int(H * 0.44)
    dr.rounded_rectangle([wx - 14, wy - 14, wx + ww + 14, wy + wh + 14], radius=20, fill=WOOD)
    dr.rectangle([wx, wy, wx + ww, wy + wh], fill=night)
    cx, cy = wx + ww // 2, wy + wh // 2
    dr.ellipse([cx - 26, cy - 26, cx + 26, cy + 26], fill=CREAM)
    for sx, sy in [(30, -60), (-50, 30), (70, 50)]:
        dr.rectangle([cx + sx, cy + sy, cx + sx + 4, cy + sy + 4], fill=(255, 255, 255))
    px0, py0 = int(W * 0.10), int(H * 0.30)
    dr.rounded_rectangle([px0, py0, px0 + int(W * 0.22), int(H * 0.72)], radius=18, fill=accent)
    prop(dr, px0 + 14, py0 + 14, int(W * 0.22) - 28, int(H * 0.42) - 14)
    bx, by = W // 2, int(H * 0.84)
    dr.polygon([(bx - 70, by - 90), (bx + 70, by - 90), (bx + 50, by + 60), (bx - 50, by + 60)], fill=CREAM)
    dr.rectangle([bx - 70, by - 90, bx + 70, by - 60], fill=(224, 96, 88))
    for sx in (-44, -20, 4, 28):
        dr.rectangle([bx + sx, by - 30, bx + sx + 12, by + 50], fill=(224, 96, 88))
    for dx, dy in [(-180, 40), (-120, 70), (140, 50), (190, 80), (60, 90), (-60, 20)]:
        dr.ellipse([bx + dx - 10, by + dy - 8, bx + dx + 10, by + dy + 8], fill=CREAM)
    img.save(path)
    print("OK", path)


kernel_card(f"{OUT}/popcorn-varieties.png")
avatar_card(f"{OUT}/avatars-space.png")
room_card(f"{OUT}/room-lab.png", (44, 62, 66), (86, 64, 46), TEAL, (24, 34, 44), prop_lab)
room_card(f"{OUT}/room-cosmodrome.png", (52, 44, 78), (70, 58, 92), (120, 130, 160), (20, 16, 44), prop_cosmodrome)
room_card(f"{OUT}/room-haunted.png", (40, 36, 52), (56, 48, 44), (86, 60, 96), (16, 14, 26), prop_haunted)
