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
    wall_thickness = cylinder_radius * 0.2  # 20% of radius for wall thickness
    
    for y in range(resolution):
        for x in range(resolution):
            height = pixels[y, x]
            if height > 0:  # Only create cylinders where there's some height
                # Create outer cylinder
                outer_cylinder = sd.cylinder(r=cylinder_radius, h=height)
                # Create inner cylinder (slightly shorter to ensure top/bottom surfaces)
                inner_cylinder = sd.cylinder(
                    r=cylinder_radius - wall_thickness,
                    h=height - wall_thickness
                )
                # Move inner cylinder up slightly to ensure bottom surface
                inner_cylinder = sd.translate([0, 0, wall_thickness])(inner_cylinder)
                # Subtract inner from outer to create hollow cylinder
                hollow_cylinder = sd.difference()(outer_cylinder, inner_cylinder)
                # Translate to position
                translated = sd.translate([
                    x * (2 * cylinder_radius + spacing),
                    y * (2 * cylinder_radius + spacing),
                    0
                ])(hollow_cylinder)
                cylinders.append(translated)
    
    # Combine all cylinders
    final_object = sd.union()(*cylinders)
    
    # Render to file
    scad_render_to_file(final_object, os.path.join(output_path, 'output.scad'))
    
    return os.path.join(output_path, 'output.scad')

def create_cylinder_primitives(output_path, base_height=1, cylinder_radius=1):
    """Create 255 cylinder primitives of different heights"""
    wall_thickness = cylinder_radius * 0.2
    for i in range(256):
        height = base_height + (i / 255.0) * base_height
        outer_cylinder = sd.cylinder(r=cylinder_radius, h=height)
        inner_cylinder = sd.cylinder(
            r=cylinder_radius - wall_thickness,
            h=height - wall_thickness
        )
        inner_cylinder = sd.translate([0, 0, wall_thickness])(inner_cylinder)
        hollow_cylinder = sd.difference()(outer_cylinder, inner_cylinder)
        scad_render_to_file(hollow_cylinder, os.path.join(output_path, f'cylinder_{i}.scad'))

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