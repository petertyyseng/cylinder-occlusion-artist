
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import ImageUploader from './ImageUploader';
import SettingsForm from './SettingsForm';
import ActionButtons from './ActionButtons';
import { Card } from "@/components/ui/card";

interface Settings {
  maxHeight: number;
  cylinderRadius: number;
  spacing: number;
  resolution: number;
  baseThickness: number;
  backlightOptimized: boolean;
}

const ImageProcessor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    maxHeight: 20,
    cylinderRadius: 1,
    spacing: 0.5,
    resolution: 50,
    baseThickness: 1,
    backlightOptimized: false
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

      console.log('Sending request to backend with settings:', settings);
      
      const response = await fetch('http://localhost:5000/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Received response from backend');
      
      const stlContent = await response.text();
      console.log('Received STL content length:', stlContent.length);

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
  );
};

export default ImageProcessor;
