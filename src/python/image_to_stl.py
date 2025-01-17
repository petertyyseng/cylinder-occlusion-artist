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
    
    # Create OpenSCAD code for all cylinders
    cylinders = []
    for y in range(resolution):
        for x in range(resolution):
            height = pixels[y, x]
            # Create cylinder at position
            cylinder = sd.cylinder(r=cylinder_radius, h=height)
            # Translate to position
            translated = sd.translate([x * (2 * cylinder_radius + spacing),
                                    y * (2 * cylinder_radius + spacing),
                                    0])(cylinder)
            cylinders.append(translated)
    
    # Combine all cylinders
    final_object = sd.union()(*cylinders)
    
    # Render to file
    scad_render_to_file(final_object, os.path.join(output_path, 'output.scad'))
    
    # Note: You'll need to use OpenSCAD CLI to convert .scad to .stl
    # Example command: openscad -o output.stl output.scad
    
    return os.path.join(output_path, 'output.scad')

def create_cylinder_primitives(output_path, base_height=1, cylinder_radius=1):
    """Create 255 cylinder primitives of different heights"""
    for i in range(256):
        height = base_height + (i / 255.0) * base_height
        cylinder = sd.cylinder(r=cylinder_radius, h=height)
        scad_render_to_file(cylinder, os.path.join(output_path, f'cylinder_{i}.scad'))

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