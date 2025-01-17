import React from 'react';
import { Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  imagePreview: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageReset: () => void;
}

const ImageUploader = ({ imagePreview, onFileChange, onImageReset }: ImageUploaderProps) => {
  return (
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
            onClick={onImageReset}
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
                onChange={onFileChange}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;