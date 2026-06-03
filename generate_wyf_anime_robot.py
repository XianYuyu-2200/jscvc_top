from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import random


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "wyf-assets"
OUT.mkdir(exist_ok=True)

W, H = 1600, 900
random.seed(7)


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient_background():
    img = Image.new("RGB", (W, H), "#061018")
    pix = img.load()
    for y in range(H):
        ty = y / H
        for x in range(W):
            tx = x / W
            r = lerp(6, 18, ty) + int(12 * tx)
            g = lerp(16, 30, ty) + int(22 * (1 - abs(tx - 0.35)))
            b = lerp(28, 48, ty) + int(38 * (1 - abs(tx - 0.72)))
            pix[x, y] = (min(r, 42), min(g, 70), min(b, 104))
    return img


def glow_layer():
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    for cx, cy, radius, color in [
        (300, 160, 320, (45, 216, 255, 85)),
        (1220, 250, 300, (255, 70, 105, 58)),
        (840, 650, 360, (120, 255, 156, 46)),
    ]:
        d.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)
    return glow.filter(ImageFilter.GaussianBlur(95))


def polygon(draw, pts, fill, outline=None, width=1):
    draw.polygon(pts, fill=fill)
    if outline:
        draw.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


def draw_grid(draw):
    horizon = 585
    for i in range(-18, 34):
        x = 800 + i * 82
        draw.line((800, horizon, x, H), fill=(255, 255, 255, 28), width=1)
    for j in range(13):
        y = horizon + (j * j) * 2.6
        draw.line((0, y, W, y), fill=(255, 255, 255, max(8, 28 - j)), width=1)


def add_neon(draw, overlay, xy, color, width=6, blur=14):
    gd = ImageDraw.Draw(overlay)
    gd.line(xy, fill=color, width=width)
    gd.line(xy, fill=(255, 255, 255, 210), width=max(1, width // 3))


def draw_mecha(base):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    gd = ImageDraw.Draw(glow)

    cx, cy = 820, 475
    metal = (18, 27, 38, 242)
    metal2 = (34, 47, 62, 245)
    edge = (100, 225, 255, 185)
    blue = (48, 210, 255, 230)
    red = (255, 72, 94, 220)
    green = (125, 255, 158, 220)

    # Shadow
    d.ellipse((450, 710, 1160, 805), fill=(0, 0, 0, 120))

    # Chassis body
    polygon(d, [(430, 570), (1220, 565), (1320, 705), (310, 715)], metal, edge, 3)
    polygon(d, [(520, 515), (1130, 510), (1210, 600), (450, 605)], metal2, (210, 240, 255, 110), 2)
    polygon(d, [(610, 455), (1030, 455), (1110, 530), (540, 535)], (11, 22, 34, 245), edge, 3)

    # Armor plates
    for x in [500, 720, 940, 1140]:
        polygon(d, [(x - 88, 610), (x + 70, 608), (x + 95, 685), (x - 120, 690)], (8, 16, 26, 235), (120, 220, 255, 105), 2)
    polygon(d, [(695, 560), (945, 558), (985, 678), (650, 682)], (22, 35, 48, 245), (255, 255, 255, 90), 2)

    # Center emblem
    d.rounded_rectangle((746, 585, 884, 665), radius=10, fill=(5, 12, 20, 245), outline=(255, 255, 255, 150), width=2)
    try:
        font = ImageFont.truetype("arialbd.ttf", 42)
    except Exception:
        font = ImageFont.load_default()
    d.text((782, 602), "RM", fill=(245, 252, 255, 230), font=font)

    # Turret stem and head
    d.rounded_rectangle((750, 335, 890, 530), radius=20, fill=(12, 22, 34, 245), outline=edge, width=3)
    d.rounded_rectangle((650, 252, 980, 398), radius=28, fill=(18, 30, 44, 248), outline=edge, width=4)
    d.rounded_rectangle((695, 282, 885, 350), radius=16, fill=(6, 14, 24, 245), outline=(255, 255, 255, 88), width=2)
    d.rounded_rectangle((890, 300, 1110, 330), radius=12, fill=(18, 30, 44, 245), outline=edge, width=2)
    d.polygon([(1110, 294), (1210, 315), (1110, 338)], fill=(26, 44, 62, 245), outline=edge)

    # Dome / sensor
    d.ellipse((745, 190, 895, 320), fill=(42, 69, 92, 155), outline=(180, 245, 255, 145), width=2)
    d.arc((755, 200, 885, 310), 195, 338, fill=(255, 255, 255, 105), width=3)

    # Mecanum wheels
    for wx, wy, r in [(415, 694, 72), (652, 713, 72), (1038, 709, 72), (1250, 688, 72)]:
        gd.ellipse((wx - r - 14, wy - r - 14, wx + r + 14, wy + r + 14), outline=(48, 210, 255, 120), width=10)
        d.ellipse((wx - r, wy - r, wx + r, wy + r), fill=(15, 20, 26, 255), outline=(150, 180, 195, 160), width=4)
        for k in range(12):
            ang = math.radians(k * 30 + 12)
            x1 = wx + math.cos(ang) * 18
            y1 = wy + math.sin(ang) * 18
            x2 = wx + math.cos(ang) * (r - 8)
            y2 = wy + math.sin(ang) * (r - 8)
            d.line((x1, y1, x2, y2), fill=(190, 215, 225, 120), width=5)
        d.ellipse((wx - 18, wy - 18, wx + 18, wy + 18), fill=(5, 10, 16, 255), outline=edge, width=2)

    # Neon bars
    for pts, color, width in [
        ([(505, 548), (645, 548)], blue, 10),
        ([(1005, 542), (1162, 540)], blue, 10),
        ([(610, 678), (760, 676)], red, 9),
        ([(890, 674), (1045, 672)], green, 9),
        ([(702, 322), (872, 322)], blue, 8),
        ([(930, 315), (1120, 315)], green, 6),
    ]:
        gd.line(pts, fill=(*color[:3], 150), width=width + 18)
        d.line(pts, fill=color, width=width)
        d.line(pts, fill=(255, 255, 255, 210), width=max(2, width // 3))

    # Circuit strokes
    for y in [470, 495, 520]:
        d.line((520, y, 610, y, 640, y + 18, 710, y + 18), fill=(80, 230, 255, 88), width=2)
        d.line((1010, y, 930, y, 905, y + 18, 840, y + 18), fill=(80, 230, 255, 88), width=2)

    # Small particles
    for _ in range(95):
        x = random.randint(110, 1490)
        y = random.randint(70, 760)
        if random.random() < 0.62 and 520 < y < 780:
            continue
        c = random.choice([(70, 220, 255, 120), (120, 255, 156, 110), (255, 120, 150, 90)])
        gd.ellipse((x - 2, y - 2, x + 2, y + 2), fill=c)

    glow = glow.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(glow)
    base.alpha_composite(overlay)
    return base


bg = gradient_background().convert("RGBA")
bg.alpha_composite(glow_layer())
d = ImageDraw.Draw(bg)
draw_grid(d)
draw_mecha(bg)

# Top-left label baked into the image as a subtle poster detail.
label = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ld = ImageDraw.Draw(label)
try:
    small = ImageFont.truetype("arialbd.ttf", 30)
    tiny = ImageFont.truetype("arial.ttf", 20)
except Exception:
    small = ImageFont.load_default()
    tiny = ImageFont.load_default()
ld.rounded_rectangle((54, 48, 410, 124), radius=10, fill=(0, 0, 0, 80), outline=(255, 255, 255, 55), width=1)
ld.text((78, 62), "RoboMaster EC", fill=(230, 250, 255, 230), font=small)
ld.text((80, 99), "embedded control / chassis / gimbal", fill=(165, 200, 214, 210), font=tiny)
bg.alpha_composite(label)

out = OUT / "wyf-anime-robot.webp"
bg.convert("RGB").save(out, "WEBP", quality=91, method=6)
print(f"{out} {W}x{H}")
