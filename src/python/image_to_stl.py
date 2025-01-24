import numpy as np
from PIL import Image
import solid as sd
import os
from solid import scad_render_to_file
import math

def create_hexagon(radius):
    """Create a hexagonal prism"""
    # Calculate the points for a regular hexagon
    points = []
    for i in range(6):
        angle = i * math.pi / 3  # 60 degrees in radians
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        points.append([x, y])
    
    # Create a linear extrusion of the 2D polygon
    return sd.linear_extrude(height=1)(
        sd.polygon(points=points)
    )

def process_image(image_path, output_path, max_height=20, cylinder_radius=1, spacing=0.5, resolution=50, base_thickness=1):
    # Load and process image
    original_img = Image.open(image_path)
    
    # Get the actual dimensions of the image in pixels
    img_width = original_img.width
    img_height = original_img.height
    
    # Convert pixels to millimeters (10 pixels = 1mm)
    target_width = img_width / 10
    target_length = img_height / 10
    
    # Convert to grayscale and resize
    img = original_img.convert('L')
    img = img.resize((resolution, resolution), Image.Resampling.LANCZOS)
    pixels = np.array(img)
    
    # Normalize pixel values to desired height range
    pixels = (pixels / 255.0) * max_height
    
    # Calculate the size of the base block based on target dimensions
    hex_width = 2 * cylinder_radius
    hex_height = 2 * cylinder_radius * math.sqrt(3) / 2
    
    # Calculate the natural size based on resolution and hexagon dimensions
    natural_width = resolution * (hex_width + spacing)
    natural_length = resolution * (hex_height + spacing)
    
    # Calculate scaling factors to achieve target dimensions
    width_scale = target_width / natural_width
    length_scale = target_length / natural_length
    
    # Apply scaling to the base block and hexagon dimensions
    block_width = target_width
    block_depth = target_length
    block_height = max_height + base_thickness
    
    # Create base block
    base_block = sd.cube([block_width, block_depth, block_height])
    
    # Create holes for each pixel
    holes = []
    for y in range(resolution):
        for x in range(resolution):
            depth = pixels[y, x]
            if depth > 0:  # Only create holes where there's some depth
                # Add a small epsilon to ensure proper boolean operations
                epsilon = 0.01
                # Create hexagonal hole
                hole = create_hexagon(cylinder_radius)
                # Scale the hole to the desired height and width/length
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
                    block_height - depth - epsilon/2
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
        file_header='$fn = 6;\n$fs = 0.1;\n$fa = 5;'  # Reduced $fn to 6 for hexagons
    )
    
    return os.path.join(output_path, 'output.scad')

def create_cylinder_primitives(output_path, base_height=1, cylinder_radius=1):
    """Create 255 cylinder primitives of different heights"""
    block_size = 20  # Size of the base block
    for i in range(256):
        depth = base_height + (i / 255.0) * base_height
        base = sd.cube([block_size, block_size, base_height])
        hole = create_hexagon(cylinder_radius)
        hole = sd.scale([1, 1, depth])(hole)
        hole = sd.translate([block_size/2, block_size/2, base_height - depth])(hole)
        result = sd.difference()(base, hole)
        scad_render_to_file(result, os.path.join(output_path, f'cylinder_{i}.scad'))

if __name__ == "__main__":
    process_image(
        'input.jpg',
        'output',
        max_height=20,
        cylinder_radius=1,
        spacing=0.5,
        resolution=50,
        base_thickness=1
    )
