import React from 'react';
import { Input } from "@/components/ui/input";

interface Settings {
  maxHeight: number;
  cylinderRadius: number;
  spacing: number;
  resolution: number;
}

interface SettingsFormProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const SettingsForm = ({ settings, onSettingsChange }: SettingsFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Maximum Height (mm)
        </label>
        <Input
          type="number"
          value={settings.maxHeight}
          onChange={(e) => onSettingsChange({
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
          onChange={(e) => onSettingsChange({
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
          onChange={(e) => onSettingsChange({
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
          onChange={(e) => onSettingsChange({
            ...settings,
            resolution: parseInt(e.target.value)
          })}
          min="50"
          max="500"
          step="10"
        />
      </div>
    </div>
  );
};

export default SettingsForm;