import numpy as np
from PIL import Image
import solid as sd
import os
from solid import scad_render_to_file
import math

def create_hexagon(radius):
    """Create a hexagonal prism"""
    points = []
    for i in range(6):
        angle = i * math.pi / 3
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        points.append([x, y])
    
    return sd.linear_extrude(height=1)(
        sd.polygon(points=points)
    )

def process_image(image_path, output_path, max_height=20, cylinder_radius=1, spacing=0.5, resolution=50, base_thickness=1, backlight_optimized=False):
    # Load and process image
    original_img = Image.open(image_path)
    
    # Convert to grayscale and resize while maintaining aspect ratio
    img = original_img.convert('L')
    
    # Calculate dimensions to match original image size (1:1 pixel to mm ratio)
    target_width = original_img.width / 10  # 10 pixels = 1mm
    target_length = original_img.height / 10
    
    # Resize image to match resolution while maintaining aspect ratio
    aspect_ratio = original_img.height / original_img.width
    new_height = int(resolution * aspect_ratio)
    img = img.resize((resolution, new_height), Image.Resampling.LANCZOS)
    pixels = np.array(img)
    
    # Invert pixels if backlight optimization is enabled
    if backlight_optimized:
        pixels = 255 - pixels
    
    # Normalize pixel values to desired height range
    pixels = (pixels / 255.0) * max_height
    
    # Calculate hexagon dimensions
    hex_width = 2 * cylinder_radius
    hex_height = 2 * cylinder_radius * math.sqrt(3) / 2
    
    # Calculate the natural size based on resolution and hexagon dimensions
    natural_width = resolution * (hex_width + spacing)
    natural_length = new_height * (hex_height + spacing)
    
    # Calculate scaling factors
    width_scale = target_width / natural_width
    length_scale = target_length / natural_length
    
    # Create base block with exact target dimensions
    base_block = sd.cube([target_width, target_length, max_height + base_thickness])
    
    # Create holes for each pixel, excluding edge pixels if they would create broken holes
    holes = []
    edge_margin = 1  # Number of pixels to exclude from edges
    
    for y in range(edge_margin, new_height - edge_margin):
        for x in range(edge_margin, resolution - edge_margin):
            depth = pixels[y, x]
            if depth > 0:  # Only create holes where there's some depth
                # Add a small epsilon to ensure proper boolean operations
                epsilon = 0.01
                
                # Create hexagonal hole
                hole = create_hexagon(cylinder_radius)
                # Scale the hole
                hole = sd.scale([width_scale, length_scale, depth + epsilon])(hole)
                
                # Calculate scaled positions
                x_offset = (hex_width * width_scale + spacing) * x
                if y % 2 == 1:
                    x_offset += (hex_width * width_scale + spacing) / 2
                    
                y_offset = y * (hex_height * length_scale + spacing)
                
                # Translate to position
                translated = sd.translate([
                    x_offset + (cylinder_radius * width_scale),
                    y_offset + (cylinder_radius * length_scale),
                    max_height + base_thickness - depth - epsilon/2
                ])(hole)
                holes.append(translated)
    
    # Combine all holes with union() before difference operation
    if holes:
        all_holes = sd.union()(*holes)
        final_object = sd.difference()(
            base_block,
            all_holes
        )
    else:
        final_object = base_block
    
    # Render to file with higher special variables for better mesh quality
    scad_render_to_file(
        final_object,
        os.path.join(output_path, 'output.scad'),
        file_header='$fn = 6;\n$fs = 0.1;\n$fa = 5;'
    )
    
    return os.path.join(output_path, 'output.scad')

def create_cylinder_primitives(output_path, base_height=1, cylinder_radius=1):
    """Create 255 cylinder primitives of different heights"""
    # ... keep existing code (cylinder primitives creation)

if __name__ == "__main__":
    process_image(
        'input.jpg',
        'output',
        max_height=20,
        cylinder_radius=1,
        spacing=0.5,
        resolution=50,
        base_thickness=1,
        backlight_optimized=False
    )
