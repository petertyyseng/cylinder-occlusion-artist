import numpy as np
from PIL import Image
import solid as sd
import os
from solid import scad_render_to_file

def process_image(image_path, output_path, max_height=20, cylinder_radius=1, spacing=0.5, resolution=100):
    # Load and process image
    img = Image.open(image_path).convert('L')
    img = img.resize((resolution, resolution), Image.Resampling.LANCZOS)
    pixels = np.array(img)
    
    # Normalize pixel values to desired height range
    pixels = (pixels / 255.0) * max_height
    
    # Calculate the size of the base block
    block_width = resolution * (2 * cylinder_radius + spacing)
    block_depth = resolution * (2 * cylinder_radius + spacing)
    block_height = max_height + 1  # Add 1mm for the base
    
    # Create base block
    base_block = sd.cube([block_width, block_depth, block_height])
    
    # Create holes for each pixel
    holes = []
    for y in range(resolution):
        for x in range(resolution):
            depth = pixels[y, x]
            if depth > 0:  # Only create holes where there's some depth
                # Create cylinder for the hole with high segment count for roundness
                hole = sd.cylinder(r=cylinder_radius, h=depth + 1, segments=32)  # Added segments parameter
                # Translate to position
                translated = sd.translate([
                    x * (2 * cylinder_radius + spacing) + cylinder_radius,
                    y * (2 * cylinder_radius + spacing) + cylinder_radius,
                    block_height - depth
                ])(hole)
                holes.append(translated)
    
    # Combine all holes
    all_holes = sd.union()(*holes)
    
    # Subtract holes from base block
    final_object = sd.difference()(base_block, all_holes)
    
    # Render to file
    scad_render_to_file(final_object, os.path.join(output_path, 'output.scad'))
    
    return os.path.join(output_path, 'output.scad')

def create_cylinder_primitives(output_path, base_height=1, cylinder_radius=1):
    """Create 255 cylinder primitives of different heights"""
    block_size = 20  # Size of the base block
    for i in range(256):
        depth = base_height + (i / 255.0) * base_height
        base = sd.cube([block_size, block_size, base_height])
        hole = sd.cylinder(r=cylinder_radius, h=depth, segments=32)  # Added segments parameter
        hole = sd.translate([block_size/2, block_size/2, base_height - depth])(hole)
        result = sd.difference()(base, hole)
        scad_render_to_file(result, os.path.join(output_path, f'cylinder_{i}.scad'))

if __name__ == "__main__":
    # Example usage
    process_image(
        'input.jpg',
        'output',
        max_height=20,
        cylinder_radius=1,
        spacing=0.5,
        resolution=100
    )