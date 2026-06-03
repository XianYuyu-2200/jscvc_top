from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "wyf-assets"
OUT.mkdir(exist_ok=True)

SOURCES = [
    (
        Path(r"C:\Users\39468\Documents\Tencent Files\3805183811\nt_qq\nt_data\Pic\2026-06\Thumb\2e9a9fd19ceb9201dc4e62b830785f58_720.png"),
        "wyf-robots.webp",
        "robots",
    ),
    (
        Path(r"C:\Users\39468\Documents\Tencent Files\3805183811\nt_qq\nt_data\Pic\2026-06\Thumb\31710b5c51821ecfece6a5e457f175ec_720.png"),
        "wyf-debug.webp",
        "debug",
    ),
]


def scale_to_width(img, width):
    if img.width <= width:
        return img
    height = round(img.height * width / img.width)
    return img.resize((width, height), Image.Resampling.LANCZOS)


def enhance(img, profile):
    img = ImageOps.exif_transpose(img).convert("RGB")
    img = scale_to_width(img, 1600)

    if profile == "robots":
        img = ImageEnhance.Brightness(img).enhance(1.04)
        img = ImageEnhance.Contrast(img).enhance(1.16)
        img = ImageEnhance.Color(img).enhance(1.16)
    else:
        img = ImageEnhance.Brightness(img).enhance(1.035)
        img = ImageEnhance.Contrast(img).enhance(1.12)
        img = ImageEnhance.Color(img).enhance(1.08)

    sharp = img.filter(ImageFilter.UnsharpMask(radius=1.8, percent=130, threshold=3))
    return sharp


for source, filename, profile in SOURCES:
    image = Image.open(source)
    final = enhance(image, profile)
    out_path = OUT / filename
    final.save(out_path, "WEBP", quality=88, method=6)
    print(f"{out_path} {final.width}x{final.height}")
