from flask import Flask, request, Response
from flask_cors import CORS
import json
from image_to_stl import process_image
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route('/process-image', methods=['POST'])
def process_image_endpoint():
    try:
        # Get the uploaded file
        image_file = request.files['image']
        settings = json.loads(request.form['settings'])
        
        # Create a temporary directory to store the uploaded file
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded file
            image_path = os.path.join(temp_dir, 'input_image.jpg')
            image_file.save(image_path)
            
            # Process the image and get the output path
            output_path = os.path.join(temp_dir, 'output')
            os.makedirs(output_path, exist_ok=True)
            
            # Process the image using the existing function
            scad_file = process_image(
                image_path,
                output_path,
                max_height=settings['maxHeight'],
                cylinder_radius=settings['cylinderRadius'],
                spacing=settings['spacing'],
                resolution=settings['resolution']
            )
            
            # For now, return the SCAD file content
            # In production, you would convert this to STL using OpenSCAD CLI
            with open(scad_file, 'r') as f:
                scad_content = f.read()
            
            return Response(
                scad_content,
                mimetype='model/stl',
                headers={'Content-Disposition': 'attachment;filename=output.stl'}
            )
            
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)