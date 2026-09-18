import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  hasErrors?: boolean;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false, 
  isVisible, 
  onVisibilityChange,
  hasErrors 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || hasErrors);

  return (
    <div className={`border rounded-lg bg-white shadow-sm ${hasErrors ? 'border-red-300' : 'border-gray-200'}`}>
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg ${!isOpen ? 'rounded-b-lg' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronRight size={18} className="text-gray-500" />}
          <h3 className={`font-semibold text-lg ${hasErrors ? 'text-red-600' : 'text-gray-800'}`}>
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
          {onVisibilityChange && isVisible !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Visible on site</span>
              <Switch 
                checked={isVisible} 
                onChange={(e) => onVisibilityChange(e.target.checked)} 
              />
            </div>
          )}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}
