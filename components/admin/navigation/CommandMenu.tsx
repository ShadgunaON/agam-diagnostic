'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminIcon, AdminIconName } from './AdminIcons';
import { useRouter } from 'next/navigation';
import { globalSearchService } from '@/services';
import { GlobalSearchResult } from '@/services/GlobalSearchService';

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<(GlobalSearchResult | { id: string, title: string, subtitle: string, href: string, icon: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const staticCommands = [
    { id: 's1', type: 'static', title: 'Create Booking', subtitle: 'Action', href: '/admin/bookings/create', icon: 'calendar' },
    { id: 's2', type: 'static', title: 'Patients List', subtitle: 'Navigation', href: '/admin/patients', icon: 'users' },
    { id: 's3', type: 'static', title: 'View Settings', subtitle: 'Navigation', href: '/admin/settings', icon: 'settings' },
  ];

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
      setResults(staticCommands);
    }
  }, [isOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
    if (!isOpen) return;

    const fetchResults = async () => {
      if (search.trim() === '') {
        setResults(staticCommands);
        return;
      }
      setIsSearching(true);
      try {
        const data = await globalSearchService.search(search);
        setResults(data.length > 0 ? data : []);
      } catch (e) {
        console.error('Search failed:', e);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 150);
    return () => clearTimeout(timeoutId);
  }, [search, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      <div 
        className="absolute inset-0 bg-slate-900/20 transition-opacity"
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
          {isSearching ? (
            <p className="p-4 text-center text-[13px] text-slate-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-center text-[13px] text-slate-500">No results found.</p>
          ) : (
            <ul>
              {results.map((result, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <li key={result.id}>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        router.push(result.href);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center gap-3">
                        <AdminIcon name={result.icon as AdminIconName} className={`w-5 h-5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} strokeWidth={2} />
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium leading-tight">{result.title}</span>
                          {result.subtitle && <span className="text-[12px] text-slate-400 font-medium">{result.subtitle}</span>}
                        </div>
                      </div>
                      <AdminIcon name="chevronRight" className={`w-4 h-4 ${isSelected ? 'text-slate-400' : 'text-transparent'}`} />
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
