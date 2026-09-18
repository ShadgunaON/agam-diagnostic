'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

export interface EntityOption {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface CMSEntityPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entity: EntityOption) => void;
  searchItems: (query: string) => Promise<EntityOption[]>;
  excludeIds?: string[];
  placeholder?: string;
  title?: string;
}

export function CMSEntityPicker({
  isOpen,
  onClose,
  onSelect,
  searchItems,
  excludeIds = [],
  placeholder = 'Search...',
  title = 'Select Item',
}: CMSEntityPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
    // Auto-focus and load initial results
    setTimeout(() => inputRef.current?.focus(), 50);
    doSearch('');
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) doSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const doSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await searchItems(q);
      setResults(res.filter(r => !excludeIds.includes(r.id)));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[70vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <p className="text-sm font-semibold text-gray-700 mb-2">{title}</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
            />
            {loading && <Loader2 size={14} className="text-gray-400 animate-spin shrink-0" />}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {results.length === 0 && !loading ? (
            <p className="text-center text-sm text-gray-400 py-8">No results found</p>
          ) : (
            <ul className="space-y-1">
              {results.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors group"
                    onClick={() => { onSelect(item); onClose(); }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                        )}
                      </div>
                      {item.badge && (
                        <span className="shrink-0 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{item.badge}</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
