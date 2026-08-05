'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminIcon } from './AdminIcons';
import { useRouter } from 'next/navigation';

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const mockCommands = [
    { id: '1', title: 'Create Booking', icon: 'calendar', action: () => alert('Create Booking triggered') },
    { id: '2', title: 'Search Patients', icon: 'users', action: () => router.push('/admin/patients') },
    { id: '3', title: 'View Settings', icon: 'settings', action: () => alert('Settings triggered') },
    { id: '4', title: 'Generate Report', icon: 'fileText', action: () => alert('Report triggered') },
  ];

  const filteredCommands = mockCommands.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200/50 transform transition-all"
        role="dialog"
      >
        <div className="flex items-center px-4 border-b border-slate-100">
          <AdminIcon name="search" className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 px-3 py-4 text-slate-900 placeholder-slate-400 focus:outline-none text-[15px]"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1 bg-slate-100 rounded px-1.5 py-0.5 text-xs font-medium text-slate-500 shrink-0">
            <span>ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <p className="p-4 text-center text-[13px] text-slate-500">No results found.</p>
          ) : (
            <ul>
              {filteredCommands.map((command, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <li key={command.id}>
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        command.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <AdminIcon name={command.icon as any} className={`w-5 h-5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} strokeWidth={2} />
                      <span className="text-[14px] font-medium">{command.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
