import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Download } from 'lucide-react';

interface ActionButtonsProps {
  isProcessing: boolean;
  generatedModelUrl: string | null;
  onProcess: () => void;
  onDownload: () => void;
}

const ActionButtons = ({ isProcessing, generatedModelUrl, onProcess, onDownload }: ActionButtonsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button
        className="w-full md:w-auto"
        onClick={onProcess}
        disabled={isProcessing}
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

      {generatedModelUrl && (
        <Button
          className="w-full md:w-auto"
          onClick={onDownload}
          variant="secondary"
        >
          <Download className="mr-2 h-4 w-4" />
          Download STL
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;