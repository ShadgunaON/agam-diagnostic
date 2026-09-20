import React, { useState, useEffect, useRef } from 'react';
import { AdminInput } from '../primitives/AdminInput';
import { MediaService } from '@/services/MediaService';

interface AdminImageEditorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
}

export function AdminImageEditor({ value, onChange, label = 'Image', altText, onAltTextChange }: AdminImageEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If it's an S3 key, fetch the presigned URL to show in the preview
    if (value && !value.startsWith('http') && !value.startsWith('data:') && !value.startsWith('/')) {
      MediaService.getDownloadUrl(value)
        .then(url => setPreviewUrl(url))
        .catch(err => console.error("Failed to fetch image preview", err));
    } else {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get presigned upload URL and S3 key
      const { uploadUrl, fileKey } = await MediaService.initiateUpload({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        category: 'cms'
      });

      // 2. Upload directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) throw new Error('Upload to S3 failed');

      // 3. Save the S3 key as the CMS value
      onChange(fileKey);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Check console for details.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview Area */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
          <div className="w-full aspect-video bg-gray-200 rounded overflow-hidden flex items-center justify-center border border-gray-300 relative">
            {previewUrl ? (
              <img src={previewUrl} alt={altText || 'Preview'} className="w-full h-full object-cover" />
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
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`px-4 py-2 border border-transparent rounded text-sm font-medium text-white ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
            
            {value && (
              <button 
                type="button"
                onClick={() => onChange('')}
                disabled={isUploading}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>

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
