
import React from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Settings {
  maxHeight: number;
  cylinderRadius: number;
  spacing: number;
  resolution: number;
  baseThickness: number;
  backlightOptimized: boolean;
}

interface SettingsFormProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const SettingsForm = ({ settings, onSettingsChange }: SettingsFormProps) => {
  return (
    <div className="space-y-6">
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
            min="20"
            max="200"
            step="10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Base Thickness (mm)
          </label>
          <Input
            type="number"
            value={settings.baseThickness}
            onChange={(e) => onSettingsChange({
              ...settings,
              baseThickness: parseFloat(e.target.value)
            })}
            min="0.5"
            max="5"
            step="0.5"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="backlight-mode"
          checked={settings.backlightOptimized}
          onCheckedChange={(checked) => onSettingsChange({
            ...settings,
            backlightOptimized: checked
          })}
        />
        <Label htmlFor="backlight-mode">Optimize for backlight (inverts image)</Label>
      </div>
    </div>
  );
};

export default SettingsForm;
