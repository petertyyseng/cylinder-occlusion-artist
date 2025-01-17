import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image as ImageIcon, Settings } from 'lucide-react';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
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

      // In a real implementation, this would call your Python backend
      // const response = await fetch('/api/process-image', {
      //   method: 'POST',
      //   body: formData
      // });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Processing complete",
        description: "Your STL file has been generated successfully!",
      });

      // In a real implementation, you would handle the STL file download here
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "An error occurred while processing your image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
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
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 transition-colors hover:border-gray-400">
              {imagePreview ? (
                <div className="relative w-full max-w-md">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                  <Button
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                      <span>Upload an image</span>
                      <Input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Maximum Height (mm)
                </label>
                <Input
                  type="number"
                  value={settings.maxHeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxHeight: parseFloat(e.target.value)
                  })}
                  min="1"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Cylinder Radius (mm)
                </label>
                <Input
                  type="number"
                  value={settings.cylinderRadius}
                  onChange={(e) => setSettings({
                    ...settings,
                    cylinderRadius: parseFloat(e.target.value)
                  })}
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Spacing (mm)
                </label>
                <Input
                  type="number"
                  value={settings.spacing}
                  onChange={(e) => setSettings({
                    ...settings,
                    spacing: parseFloat(e.target.value)
                  })}
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Resolution (px)
                </label>
                <Input
                  type="number"
                  value={settings.resolution}
                  onChange={(e) => setSettings({
                    ...settings,
                    resolution: parseInt(e.target.value)
                  })}
                  min="50"
                  max="500"
                  step="10"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                className="w-full md:w-auto"
                onClick={handleProcess}
                disabled={!selectedFile || isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Generate 3D Model
                  </>
                )}
              </Button>
            </div>
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