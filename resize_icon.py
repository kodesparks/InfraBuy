import os
from PIL import Image
import glob

# Paths to process
mipmap_dirs = glob.glob('android/app/src/main/res/mipmap-*')
zoom_factor = 1.5 

for dir_path in mipmap_dirs:
    img_path = os.path.join(dir_path, 'ic_launcher_foreground.png')
    if not os.path.exists(img_path):
        continue
    
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        
        new_width = int(width * zoom_factor)
        new_height = int(height * zoom_factor)
        
        scaled_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        left = (new_width - width) / 2
        top = (new_height - height) / 2
        right = (new_width + width) / 2
        bottom = (new_height + height) / 2
        
        final_img = scaled_img.crop((left, top, right, bottom))
        
        final_img.save(img_path)
        print(f"Resized {img_path} using zoom factor {zoom_factor}")
