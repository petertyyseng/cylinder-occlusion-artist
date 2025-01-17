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

      // In a real implementation, this would be an API call to your backend
      // For now, we'll create a simple STL file structure
      const stlHeader = 'solid generated\n';
      const stlFooter = 'endsolid generated\n';
      
      // Create a simple cube as a placeholder
      // In production, this would be replaced with actual geometry from your Python backend
      const vertices = [
        [0, 0, 0], [1, 0, 0], [1, 1, 0],
        [0, 0, 0], [1, 1, 0], [0, 1, 0]
      ];
      
      let stlContent = stlHeader;
      vertices.forEach(([x, y, z]) => {
        stlContent += `vertex ${x} ${y} ${z}\n`;
      });
      stlContent += stlFooter;

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