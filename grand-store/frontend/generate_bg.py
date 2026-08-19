import math
from PIL import Image, ImageDraw, ImageFilter

width = 2560
height = 1440

# 1. Base Luxury Deep Obsidian Canvas (#050403)
base = Image.new('RGBA', (width, height), (5, 4, 3, 255))

# 2. Left Side: Smooth Soft Ambient Golden Glow
spot_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
spot_draw = ImageDraw.Draw(spot_layer)

cx, cy = int(width * 0.10), int(height * 0.25)
max_r = int(width * 0.60)

steps = 200
for i in range(steps, 0, -1):
    r = int(max_r * (i / steps))
    factor = (1.0 - (i / steps)) ** 2.4
    
    red = int(240 * factor)
    green = int(180 * factor * 0.88)
    blue = int(55 * factor * 0.60)
    alpha = int(120 * factor)  # Very soft ambient opacity
    
    spot_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, alpha))

spot_layer = spot_layer.filter(ImageFilter.GaussianBlur(radius=85))
base = Image.alpha_composite(base, spot_layer)

# 3. Right Side: Exactly 3 Simple, Minimal, Low-Opacity Vertical Rectangle Boxes
col_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
col_draw = ImageDraw.Draw(col_layer)

num_cols = 3
col_width = 175
col_gap = 35
right_margin = 120
total_cols_w = num_cols * col_width + (num_cols - 1) * col_gap
start_x = width - right_margin - total_cols_w

for i in range(num_cols):
    c_x1 = start_x + i * (col_width + col_gap)
    c_x2 = c_x1 + col_width
    
    # Simple, elegant rounded rectangle box spanning vertically
    top_y = 120 + i * 40
    bottom_y = height
    
    # Very subtle, minimal fill (12-16% opacity)
    col_draw.rounded_rectangle(
        [c_x1, top_y, c_x2, bottom_y],
        radius=24,
        fill=(230, 165, 45, 20),
        outline=(255, 210, 100, 48),
        width=2
    )
    
    # Soft inner vertical gradient
    for y_step in range(top_y, bottom_y, 8):
        prog = (y_step - top_y) / (bottom_y - top_y)
        alpha = int(math.sin(prog * math.pi) * 22)
        col_draw.line([(c_x1 + 3, y_step), (c_x2 - 3, y_step)], fill=(240, 175, 50, alpha), width=8)

# Soft blur for natural glass reflection
col_blur = col_layer.filter(ImageFilter.GaussianBlur(radius=12))
col_sharp = col_layer.filter(ImageFilter.GaussianBlur(radius=1))

base = Image.alpha_composite(base, col_blur)
base = Image.alpha_composite(base, col_sharp)

# 4. Save Master Background
final_img = base.convert('RGB')
final_img.save('c:/office/store-new/grand-store/frontend/public/assets/hero-ambient-bg.jpg', 'JPEG', quality=98)
print("Successfully generated 3-box low-opacity hero-ambient-bg.jpg")
