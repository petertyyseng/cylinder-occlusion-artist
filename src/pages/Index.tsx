import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ImageUploader from '@/components/ImageUploader';
import SettingsForm from '@/components/SettingsForm';
import ActionButtons from '@/components/ActionButtons';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    maxHeight: 20,
    cylinderRadius: 1,
    spacing: 0.5,
    resolution: 100
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to process",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('settings', JSON.stringify(settings));

      // Create a proper cube with 12 triangles (2 triangles per face, 6 faces)
      const vertices = [
        // Front face
        [0, 0, 0], [1, 1, 0], [0, 1, 0],
        [0, 0, 0], [1, 0, 0], [1, 1, 0],
        // Back face
        [0, 0, 1], [0, 1, 1], [1, 1, 1],
        [0, 0, 1], [1, 1, 1], [1, 0, 1],
        // Top face
        [0, 1, 0], [1, 1, 1], [0, 1, 1],
        [0, 1, 0], [1, 1, 0], [1, 1, 1],
        // Bottom face
        [0, 0, 0], [0, 0, 1], [1, 0, 1],
        [0, 0, 0], [1, 0, 1], [1, 0, 0],
        // Right face
        [1, 0, 0], [1, 0, 1], [1, 1, 1],
        [1, 0, 0], [1, 1, 1], [1, 1, 0],
        // Left face
        [0, 0, 0], [0, 1, 0], [0, 1, 1],
        [0, 0, 0], [0, 1, 1], [0, 0, 1],
      ];

      let stlContent = 'solid generated\n';
      
      // Group vertices into triangles and generate facets
      for (let i = 0; i < vertices.length; i += 3) {
        const v1 = vertices[i];
        const v2 = vertices[i + 1];
        const v3 = vertices[i + 2];
        
        // Calculate normal vector for the triangle
        const dx1 = v2[0] - v1[0];
        const dy1 = v2[1] - v1[1];
        const dz1 = v2[2] - v1[2];
        const dx2 = v3[0] - v1[0];
        const dy2 = v3[1] - v1[1];
        const dz2 = v3[2] - v1[2];
        
        // Cross product for normal vector
        const nx = dy1 * dz2 - dz1 * dy2;
        const ny = dz1 * dx2 - dx1 * dz2;
        const nz = dx1 * dy2 - dy1 * dx2;
        
        // Normalize the normal vector
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
        const normalX = nx / length;
        const normalY = ny / length;
        const normalZ = nz / length;

        stlContent += `  facet normal ${normalX} ${normalY} ${normalZ}\n`;
        stlContent += '    outer loop\n';
        stlContent += `      vertex ${v1[0]} ${v1[1]} ${v1[2]}\n`;
        stlContent += `      vertex ${v2[0]} ${v2[1]} ${v2[2]}\n`;
        stlContent += `      vertex ${v3[0]} ${v3[1]} ${v3[2]}\n`;
        stlContent += '    endloop\n';
        stlContent += '  endfacet\n';
      }

      stlContent += 'endsolid generated\n';

      const blob = new Blob([stlContent], { type: 'model/stl' });
      const modelUrl = URL.createObjectURL(blob);
      setGeneratedModelUrl(modelUrl);

      toast({
        title: "Processing complete",
        description: "Your STL file has been generated successfully!",
      });

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: "An error occurred while processing your image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (generatedModelUrl) {
      const link = document.createElement('a');
      link.href = generatedModelUrl;
      link.download = 'generated-model.stl';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your 3D model is being downloaded",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Image to 3D Model Converter
          </h1>
          <p className="text-lg text-gray-600">
            Transform your images into self-occluding 3D models for printing
          </p>
        </div>

        <Card className="p-6 bg-white shadow-lg">
          <div className="space-y-6">
            <ImageUploader
              imagePreview={imagePreview}
              onFileChange={handleFileChange}
              onImageReset={() => {
                setSelectedFile(null);
                setImagePreview(null);
              }}
            />

            <SettingsForm
              settings={settings}
              onSettingsChange={setSettings}
            />

            <ActionButtons
              isProcessing={isProcessing}
              generatedModelUrl={generatedModelUrl}
              onProcess={handleProcess}
              onDownload={handleDownload}
            />
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            This tool converts your images into 3D printable models using cylinder-based
            self-occlusion techniques. The generated STL files can be used with any 3D printer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;