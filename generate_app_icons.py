import os
import json
import glob
from PIL import Image, ImageDraw

# Source image path
source_path = r"C:\Users\Rohit\Infrabuy\assets stitch\infraexpert .jpeg"
project_dir = r"C:\Users\Rohit\Infrabuy\InfraBuy"

def generate_android_icons(src_img):
    print("Generating Android App Icons...")
    res_dir = os.path.join(project_dir, 'android', 'app', 'src', 'main', 'res')
    
    # Define sizes for each mipmap directory (baseline MDPI)
    # size is for ic_launcher & ic_launcher_round. foreground is 108dp baseline.
    densities = {
        'mipmap-mdpi': {'scale': 1.0, 'icon_size': 48, 'fg_size': 108},
        'mipmap-hdpi': {'scale': 1.5, 'icon_size': 72, 'fg_size': 162},
        'mipmap-xhdpi': {'scale': 2.0, 'icon_size': 96, 'fg_size': 216},
        'mipmap-xxhdpi': {'scale': 3.0, 'icon_size': 144, 'fg_size': 324},
        'mipmap-xxxhdpi': {'scale': 4.0, 'icon_size': 192, 'fg_size': 432},
    }
    
    for name, config in densities.items():
        dir_path = os.path.join(res_dir, name)
        os.makedirs(dir_path, exist_ok=True)
        
        # 1. Generate ic_launcher.png (Square with white background from source JPEG)
        icon_size = config['icon_size']
        launcher_img = src_img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        launcher_img.save(os.path.join(dir_path, 'ic_launcher.png'), 'PNG')
        
        # 2. Generate ic_launcher_round.png (Circular cropped image)
        mask = Image.new('L', (icon_size, icon_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, icon_size - 1, icon_size - 1), fill=255)
        
        round_img = Image.new('RGBA', (icon_size, icon_size), (0, 0, 0, 0))
        round_img.paste(launcher_img, (0, 0), mask=mask)
        round_img.save(os.path.join(dir_path, 'ic_launcher_round.png'), 'PNG')
        
        # 3. Generate ic_launcher_foreground.png (Centered and padded on transparent canvas)
        fg_size = config['fg_size']
        # The actual icon content should be centered and contained within a circular safe area
        # typical standard is 72dp inside 108dp (approx 66%)
        inner_size = int(fg_size * 0.70)
        inner_img = src_img.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
        
        # Apply rounded rect or circle mask to the foreground element so it's clean
        inner_mask = Image.new('L', (inner_size, inner_size), 0)
        inner_draw = ImageDraw.Draw(inner_mask)
        inner_draw.ellipse((0, 0, inner_size - 1, inner_size - 1), fill=255)
        
        inner_round = Image.new('RGBA', (inner_size, inner_size), (0, 0, 0, 0))
        inner_round.paste(inner_img, (0, 0), mask=inner_mask)
        
        # Paste centered on transparent fg_size canvas
        fg_canvas = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
        offset = (fg_size - inner_size) // 2
        fg_canvas.paste(inner_round, (offset, offset), mask=inner_round)
        fg_canvas.save(os.path.join(dir_path, 'ic_launcher_foreground.png'), 'PNG')
        
        print(f"  [OK] Generated icons in {name} (launcher: {icon_size}x{icon_size}, foreground: {fg_size}x{fg_size})")

    # Update background to white in colors.xml
    colors_xml_path = os.path.join(res_dir, 'values', 'colors.xml')
    if os.path.exists(colors_xml_path):
        with open(colors_xml_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the purple background with white to match the new logo's background perfectly
        if '#723FED' in content:
            content = content.replace('#723FED', '#FFFFFF')
            with open(colors_xml_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("  [OK] Updated ic_launcher_background to #FFFFFF in colors.xml")


def generate_ios_icons(src_img):
    print("Generating iOS App Icons...")
    appiconset_dir = os.path.join(project_dir, 'ios', 'InfraBuy', 'Images.xcassets', 'AppIcon.appiconset')
    contents_json_path = os.path.join(appiconset_dir, 'Contents.json')
    
    if not os.path.exists(contents_json_path):
        print("  [WARNING] iOS AppIcon.appiconset/Contents.json not found. Skipping iOS.")
        return
        
    with open(contents_json_path, 'r', encoding='utf-8') as f:
        contents = json.load(f)
        
    for item in contents.get('images', []):
        idiom = item.get('idiom')
        scale_str = item.get('scale', '1x')
        size_str = item.get('size', '1024x1024')
        
        # Parse scale e.g. "2x" -> 2
        scale = float(scale_str.replace('x', ''))
        
        # Parse size e.g. "20x20" -> 20
        size_width = float(size_str.split('x')[0])
        
        pixel_size = int(size_width * scale)
        filename = f"icon_{size_str}_{scale_str}.png"
        
        # Resize source JPEG to target pixel size as square
        icon_img = src_img.resize((pixel_size, pixel_size), Image.Resampling.LANCZOS)
        icon_img.save(os.path.join(appiconset_dir, filename), 'PNG')
        
        # Update entry with filename
        item['filename'] = filename
        print(f"  [OK] Generated iOS icon {filename} ({pixel_size}x{pixel_size})")
        
    # Save the updated Contents.json back
    with open(contents_json_path, 'w', encoding='utf-8') as f:
        json.dump(contents, f, indent=2)
    print("  [OK] Updated iOS Contents.json successfully.")


def main():
    if not os.path.exists(source_path):
        print(f"[ERROR] Source image not found at: {source_path}")
        return
        
    try:
        with Image.open(source_path) as img:
            # Convert source image to RGB to handle any JPEG-specific color space issues
            img_rgb = img.convert("RGB")
            
            generate_android_icons(img_rgb)
            generate_ios_icons(img_rgb)
            
            print("\nApp Icon generation completed successfully for both Android and iOS!")
    except Exception as e:
        print(f"[ERROR] Error during icon generation: {str(e)}")

if __name__ == "__main__":
    main()
