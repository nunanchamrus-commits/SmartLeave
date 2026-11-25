from PIL import Image

sheet_path = r"D:\SmartLeave\DinoLeaf’s Kawaii Farming Mascot Sheet.png"
img = Image.open(sheet_path).convert("RGB")
w, h = img.size

# Let's save a downsampled 600x600 preview with a 100px grid overlay so we can see exact coordinates!
preview = img.resize((627, 627))
# Draw grid on preview
grid_img = preview.copy()
data = bytearray(grid_img.tobytes())
pw, ph = grid_img.size

# Let's draw grid lines every 50px (which corresponds to 100px on full image)
for y in range(ph):
    for x in range(pw):
        # Full coords
        fx = int(x * (w / pw))
        fy = int(y * (h / ph))
        if fx % 100 < 2 or fy % 100 < 2:
            idx = (y * pw + x) * 3
            data[idx] = 255
            data[idx+1] = 0
            data[idx+2] = 0 # Red line

grid_img = Image.frombytes("RGB", (pw, ph), bytes(data))
grid_img.save(r"D:\SmartLeave\public\mascot\grid_preview.png")
print("Grid preview saved to public/mascot/grid_preview.png")
