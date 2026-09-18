import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { AdminInput } from '../primitives/AdminInput';

const COMMON_ICONS = [
  'Activity', 'Heart', 'Shield', 'ShieldCheck', 'Clock', 'Calendar', 
  'Users', 'User', 'Microscope', 'Stethoscope', 'Pill', 'TestTube',
  'FileText', 'CheckCircle', 'Star', 'Award', 'MapPin', 'Phone', 'Mail'
];

interface AdminIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

export function AdminIconPicker({ value, onChange, label = 'Icon' }: AdminIconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Lucide icons export components with camelCase or PascalCase.
  // We'll map string names to PascalCase for lookup.
  const toPascalCase = (str: string) => str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

  const SelectedIcon = (LucideIcons as any)[toPascalCase(value)] || LucideIcons.HelpCircle;

  const filteredIcons = COMMON_ICONS.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`relative ${isOpen ? 'z-50' : ''}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div 
        className="flex items-center gap-3 border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="p-1 bg-gray-100 rounded">
          {value ? <SelectedIcon size={18} /> : <span className="text-xs text-gray-400">None</span>}
        </div>
        <span className="flex-1 text-sm">{value || 'Select an icon...'}</span>
        <LucideIcons.ChevronDown size={16} className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 top-full left-0 mt-1 w-full sm:w-64 bg-white border border-gray-200 rounded-md shadow-lg p-2 max-h-60 flex flex-col">
          <input 
            type="text" 
            className="w-full px-2 py-1 text-sm border-b border-gray-200 focus:outline-none focus:border-blue-500 mb-2"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-1 p-1">
            {filteredIcons.map(iconName => {
              const IconComp = (LucideIcons as any)[iconName];
              if (!IconComp) return null;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={`p-2 flex justify-center items-center rounded hover:bg-blue-50 transition-colors ${value === iconName ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  title={iconName}
                >
                  <IconComp size={18} />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center text-xs text-gray-500 p-2">No icons found</div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button 
              type="button" 
              className="text-xs text-red-500 hover:text-red-700 w-full text-left px-2"
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              Clear Icon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
