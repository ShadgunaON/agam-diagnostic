'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AdminIcon, AdminIconName } from '../navigation/AdminIcons';

interface DropdownItem {
  label: string;
  icon?: AdminIconName;
  onClick: () => void;
  danger?: boolean;
}

interface AdminDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function AdminDropdown({ trigger, items, align = 'right' }: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] py-1 focus:outline-none 
            ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors
                ${item.danger 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-[var(--admin-text-main)] hover:bg-[var(--admin-hover-bg)]'
                }`}
            >
              {item.icon && (
                <AdminIcon 
                  name={item.icon} 
                  className={`w-4 h-4 ${item.danger ? 'text-red-600' : 'text-[var(--admin-text-muted)]'}`} 
                />
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
