import React from 'react';
import { AppSettings, MistakeHighlightMode } from '../types';

interface SettingsScreenProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
  onDeleteHistory: () => void;
  onBack: (instant?: boolean) => void;
  isMobile: boolean;
}

const RadioButton: React.FC<{
  id: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}> = ({ id, label, value, checked, onChange }) => (
  <label htmlFor={id} className={`block w-full text-center px-4 py-2 border rounded-md cursor-pointer transition-colors duration-200 ${
    checked ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'
  }`}>
    <input
      type="radio"
      id={id}
      name="highlightMode"
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className="sr-only"
    />
    {label}
  </label>
);

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-gray-800 text-lg">{label}</span>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
      <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-black' : 'bg-gray-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
    </div>
  </label>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onSettingsChange, onDeleteHistory, onBack, isMobile }) => {
  return (
    <div className="w-full h-full max-w-lg mx-auto flex flex-col p-4 animate-pop-in">
      <header className="text-center py-4 flex-shrink-0">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider">SETTINGS</h1>
      </header>

      <main className="flex-grow py-6 overflow-y-auto space-y-10">
        {/* Assistance Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Assistance</h2>
          <div className="space-y-2 pt-2">
            <p className="text-gray-600 text-lg">Highlight mistakes</p>
            <div className="grid grid-cols-3 gap-2">
              <RadioButton 
                id="highlight-off"
                label="Off"
                value={MistakeHighlightMode.None}
                checked={settings.mistakeHighlighting === MistakeHighlightMode.None}
                onChange={(value) => onSettingsChange({ mistakeHighlighting: value as MistakeHighlightMode })}
              />
              <RadioButton 
                id="highlight-temp"
                label="Temporary"
                value={MistakeHighlightMode.Temporary}
                checked={settings.mistakeHighlighting === MistakeHighlightMode.Temporary}
                onChange={(value) => onSettingsChange({ mistakeHighlighting: value as MistakeHighlightMode })}
              />
              <RadioButton 
                id="highlight-perm"
                label="Persistent"
                value={MistakeHighlightMode.Persistent}
                checked={settings.mistakeHighlighting === MistakeHighlightMode.Persistent}
                onChange={(value) => onSettingsChange({ mistakeHighlighting: value as MistakeHighlightMode })}
              />
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Data & Storage</h2>
           <div className="p-4 border rounded-lg space-y-6">
            <ToggleSwitch
              label="Save game history"
              enabled={settings.saveHistory}
              onChange={(value) => onSettingsChange({ saveHistory: value })}
            />
             <button 
              onClick={onDeleteHistory}
              className="w-full bg-transparent text-red-600 py-3 rounded-lg border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200 tracking-wider text-lg">
              DELETE ALL HISTORY
            </button>
           </div>
        </div>
      </main>

      <footer className="py-4 flex-shrink-0">
        {!isMobile && (
          <button
            onClick={() => onBack(true)}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 tracking-wider text-lg">
            MAIN MENU
          </button>
        )}
      </footer>
    </div>
  );
};

export default SettingsScreen;