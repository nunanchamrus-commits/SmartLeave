import os
from collections import deque
from PIL import Image

def process_mascot_cutout(crop_img, output_path):
    crop_img = crop_img.convert("RGBA")
    w, h = crop_img.size
    raw = bytearray(crop_img.tobytes())
    
    # 1. Flood fill from outer edges
    # We will mark background pixels
    is_bg = [[False]*w for _ in range(h)]
    queue = deque()
    
    def is_white_or_light(x, y):
        idx = (y * w + x) * 4
        r, g, b = raw[idx], raw[idx+1], raw[idx+2]
        return min(r, g, b) >= 238
        
    # Add border pixels that are near-white
    for x in range(w):
        if is_white_or_light(x, 0):
            is_bg[0][x] = True
            queue.append((x, 0))
        if is_white_or_light(x, h-1):
            is_bg[h-1][x] = True
            queue.append((x, h-1))
            
    for y in range(h):
        if is_white_or_light(0, y):
            is_bg[y][0] = True
            queue.append((0, y))
        if is_white_or_light(w-1, y):
            is_bg[y][w-1] = True
            queue.append((w-1, y))
            
    # BFS
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not is_bg[ny][nx]:
                if is_white_or_light(nx, ny):
                    is_bg[ny][nx] = True
                    queue.append((nx, ny))
                    
    # 2. Set alpha for background & smooth edge antialiasing
    # For antialiasing: pixels adjacent to is_bg that have min(r,g,b) >= 230 get soft alpha
    for y in range(h):
        for x in range(w):
            idx = (y * w + x) * 4
            if is_bg[y][x]:
                raw[idx+3] = 0 # 100% transparent
            else:
                # Check if it borders a bg pixel and is light (feathering)
                has_bg_neighbor = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and is_bg[ny][nx]:
                        has_bg_neighbor = True
                        break
                if has_bg_neighbor:
                    r, g, b = raw[idx], raw[idx+1], raw[idx+2]
                    lightness = min(r, g, b)
                    if lightness >= 248:
                        raw[idx+3] = 0
                    elif lightness >= 230:
                        # Smooth feather
                        factor = (248 - lightness) / 18.0
                        raw[idx+3] = int(255 * factor)
                        
    result = Image.frombytes("RGBA", (w, h), bytes(raw))
    
    # Auto-trim transparent borders with small 4px margin
    bbox = result.getbbox()
    if bbox:
        # pad by 6px
        p_left = max(0, bbox[0] - 6)
        p_top = max(0, bbox[1] - 6)
        p_right = min(w, bbox[2] + 6)
        p_bottom = min(h, bbox[3] + 6)
        result = result.crop((p_left, p_top, p_right, p_bottom))
        
    result.save(output_path, "PNG")
    print(f"Saved {output_path}: {result.size}")
    return result

# Now let's extract all 6 poses!
sheet_path = r"D:\SmartLeave\DinoLeaf’s Kawaii Farming Mascot Sheet.png"
out_dir = r"D:\SmartLeave\public\mascot"
sheet = Image.open(sheet_path).convert("RGBA")

# 1. Main DinoLeaf (Top-Left: thumbs-up, leaf, winking)
# Box: x=(20, 585), y=(20, 805)
crop_main = sheet.crop((20, 20, 585, 805))
process_mascot_cutout(crop_main, os.path.join(out_dir, "dinoleaf_main.png"))

# 2. Tablet DinoLeaf ("ยิ้มแฉ่ง" holding tablet with red heart)
# Original box: x=(665, 935), y=(395, 395+336=731)
crop_tablet = sheet.crop((665, 395, 935, 732))
process_mascot_cutout(crop_tablet, os.path.join(out_dir, "dinoleaf_tablet.png"))

# 3. Curious DinoLeaf ("สงสัย" with question mark)
# Original box: x=(940, 1220), y=(395, 395+336=731)
crop_curious = sheet.crop((940, 395, 1220, 732))
process_mascot_cutout(crop_curious, os.path.join(out_dir, "dinoleaf_curious.png"))

# 4. Cheer DinoLeaf ("ดีใจ" hands up cheering, smiling, sparkles)
# Original box: x=(40, 395), y=(815, 815+368=1183)
crop_cheer = sheet.crop((40, 815, 395, 1184))
process_mascot_cutout(crop_cheer, os.path.join(out_dir, "dinoleaf_cheer.png"))

# 5. Farmer DinoLeaf ("ตั้งใจทำงาน" with farmer woven hat, planting sprout)
# Original box: x=(440, 835), y=(810, 810+362=1172)
crop_farmer = sheet.crop((440, 810, 835, 1172))
process_mascot_cutout(crop_farmer, os.path.join(out_dir, "dinoleaf_farmer.png"))

# 6. Sleep DinoLeaf ("หลับฝันดี" curled up sleeping peacefully with z z z)
# Original box: x=(845, 1235), y=(825, 825+342=1167)
crop_sleep = sheet.crop((845, 825, 1235, 1167))
process_mascot_cutout(crop_sleep, os.path.join(out_dir, "dinoleaf_sleep.png"))

print("All 6 3D DinoLeaf poses extracted and saved successfully!")
