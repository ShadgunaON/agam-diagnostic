'use client';

import React, { useEffect } from 'react';
import { AdminIcon } from '../navigation/AdminIcons';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | 'full';
}

export function AdminDrawer({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  width = 'md' 
}: AdminDrawerProps) {

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'w-full max-w-md',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
    full: 'w-full',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className={`relative flex flex-col bg-[var(--admin-surface)] border-l border-[var(--admin-border)] shadow-2xl h-full ${widthClasses[width]} animate-in slide-in-from-right-full duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[var(--admin-text-main)] tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-sm text-[var(--admin-text-muted)]">{subtitle}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-md hover:bg-[var(--admin-hover-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] transition-colors"
          >
            <AdminIcon name="x" className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
