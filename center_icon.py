import os
from PIL import Image
import glob

# Paths to process
mipmap_dirs = glob.glob('android/app/src/main/res/mipmap-*')

for dir_path in mipmap_dirs:
    img_path = os.path.join(dir_path, 'ic_launcher_foreground.png')
    if not os.path.exists(img_path):
        continue
    
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        width, height = img.size
        
        # Get the bounding box of the non-transparent pixels (left, upper, right, lower)
        bbox = img.getbbox()
        if bbox is None:
            continue
            
        bbox_top = bbox[1]
        bbox_bottom = bbox[3]
        bbox_height = bbox_bottom - bbox_top
        
        # Calculate how much to shift vertically to center the bounding box
        ideal_top = (height - bbox_height) / 2
        shift_y = int(ideal_top - bbox_top)
        
        # Since the user specifically complained it went upward, let's add a bit more downward bias
        # Maybe an extra 5% of the total height downwards to be safe, or just perfect centering + a small padding.
        # User said "move it to some down", perfect centering might still look slightly high if the logo is bottom-heavy.
        # Let's add 5% height shift down on top of perfect centering.
        shift_y += int(height * 0.05)
        
        if shift_y == 0:
            continue
            
        # Create a new transparent image and paste the original shifted
        new_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        new_img.paste(img, (0, shift_y))
        
        new_img.save(img_path)
        print(f"Centered and shifted {img_path} down by {shift_y} pixels")
