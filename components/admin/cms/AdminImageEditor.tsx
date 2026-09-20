import React from 'react';
import { AdminInput } from '../primitives/AdminInput';

interface AdminImageEditorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
}

export function AdminImageEditor({ value, onChange, label = 'Image', altText, onAltTextChange }: AdminImageEditorProps) {
  
  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview Area */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
          <div className="w-full aspect-video bg-gray-200 rounded overflow-hidden flex items-center justify-center border border-gray-300 relative">
            {value ? (
              <img src={value} alt={altText || 'Preview'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-gray-400">No Image Selected</span>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex-1 space-y-4">
          <AdminInput 
            label="Existing Asset Reference"
            value={value}
            onChange={(e) => {
              if (e.target.value.startsWith('data:image')) {
                alert("Base64 direct image upload is not supported because it exceeds database limits. Please upload the image elsewhere and paste a valid URL instead (e.g., /assets/... or https://...).");
                return;
              }
              onChange(e.target.value);
            }}
            placeholder="/assets/hero.jpg or existing S3 URL"
          />
          
          <div className="flex gap-3">
            <button 
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 opacity-50 cursor-not-allowed"
              title="Media Library backend module pending deployment."
              disabled
            >
              Choose Existing Asset
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded text-sm font-medium text-white hover:bg-blue-700 opacity-50 cursor-not-allowed"
              title="Upload capability pending S3 backend deployment."
              disabled
            >
              Upload Image
            </button>
            
            {value && (
              <button 
                type="button"
                onClick={() => onChange('')}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-amber-600 flex items-center gap-1">
            <span className="font-bold">Note:</span> 
            Direct file upload requires backend Media module deployment. Use existing asset references for now.
          </p>

          {onAltTextChange && (
            <AdminInput 
              label="Alt Text (SEO/Accessibility)"
              value={altText || ''}
              onChange={(e) => onAltTextChange(e.target.value)}
              placeholder="Describe the image..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
