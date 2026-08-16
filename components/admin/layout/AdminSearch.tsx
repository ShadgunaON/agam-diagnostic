'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AdminIcon } from '../navigation/AdminIcons';
import { globalSearchService } from '@/services';
import { GlobalSearchResult } from '@/services/GlobalSearchService';

export function AdminSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<(GlobalSearchResult | { id: string, title: string, subtitle: string, href: string, icon: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const staticCommands = [
    { id: 's1', type: 'static', title: 'Create Booking', subtitle: 'Action', href: '/admin/bookings/create', icon: 'calendar' },
    { id: 's2', type: 'static', title: 'Patients List', subtitle: 'Navigation', href: '/admin/patients', icon: 'users' },
    { id: 's3', type: 'static', title: 'View Settings', subtitle: 'Navigation', href: '/admin/settings', icon: 'settings' },
  ];

  // Cmd+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results
  useEffect(() => {
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
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      setIsOpen(false);
      setSearch('');
      inputRef.current?.blur();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`admin-hide-mobile relative transition-all duration-300 ease-in-out ${isOpen ? 'w-[600px]' : 'w-[480px]'}`}
      style={{ height: '52px' }}
    >
      <div
        className={`flex items-center w-full h-full bg-white transition-all duration-300 ease-in-out ${isOpen ? 'border-[#3b82f6] shadow-md ring-4 ring-blue-500/10' : 'border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300'}`}
        style={{ borderRadius: '9999px', padding: '0 16px', borderStyle: 'solid', borderWidth: '1px' }}
        onClick={() => setIsOpen(true)}
      >
        <AdminIcon name="search" className={`shrink-0 transition-colors ${isOpen ? 'text-[#3b82f6]' : 'text-slate-400'}`} style={{ width: '20px', height: '20px' }} strokeWidth={2} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search bookings, patients, or tests..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-700 placeholder:text-slate-400"
          style={{ marginLeft: '12px' }}
        />
        {!isOpen && (
          <div className="flex items-center justify-center bg-slate-50 border border-slate-200 shrink-0" style={{ width: '32px', height: '26px', borderRadius: '6px' }}>
            <span className="text-[12px] font-bold text-slate-500">⌘K</span>
          </div>
        )}
        {isSearching && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[60px] bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
          {results.length > 0 ? (
            <div className="overflow-y-auto p-2">
              <div className="px-3 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                {search.trim() === '' ? 'Suggestions' : 'Search Results'}
              </div>
              {results.map((result, idx) => (
                <div
                  key={result.id}
                  onClick={() => {
                    router.push(result.href);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${idx === selectedIndex ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <AdminIcon name={(result as any).icon || 'search'} style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[14px] font-bold truncate ${idx === selectedIndex ? 'text-blue-900' : 'text-slate-900'}`}>{result.title}</span>
                    <span className={`text-[12px] font-medium truncate ${idx === selectedIndex ? 'text-blue-600' : 'text-slate-500'}`}>{result.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center gap-2">
              <AdminIcon name="search" className="text-slate-300 w-8 h-8" />
              <p className="text-[14px] font-bold text-slate-900 m-0">No results found</p>
              <p className="text-[13px] text-slate-500 m-0">Try searching for something else.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
