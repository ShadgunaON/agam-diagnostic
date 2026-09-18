import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Trash2, Plus, Loader2 } from 'lucide-react';

export interface ReferenceItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface AdminReferenceSelectorProps {
  label?: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  fetchSelectedItems: (ids: string[]) => Promise<ReferenceItem[]>;
  searchItems: (query: string) => Promise<ReferenceItem[]>;
  placeholder?: string;
}

export function AdminReferenceSelector({
  label,
  selectedIds,
  onChange,
  fetchSelectedItems,
  searchItems,
  placeholder = "Search to add item..."
}: AdminReferenceSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<ReferenceItem[]>([]);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReferenceItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Hydrate selected items when IDs change
  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      if (!selectedIds || selectedIds.length === 0) {
        if (active) setSelectedItems([]);
        return;
      }
      // If we already have the exact same IDs loaded in exact order, skip fetch
      if (selectedItems.length === selectedIds.length && selectedItems.every((item, i) => item.id === selectedIds[i])) {
        return;
      }
      
      setLoadingSelected(true);
      try {
        const items = await fetchSelectedItems(selectedIds);
        if (active) {
          // Re-sort items to match selectedIds order since batch fetch might return them out of order or we want to guarantee order
          const orderedItems = selectedIds.map(id => items.find(i => i && i.id === id)).filter(Boolean) as ReferenceItem[];
          setSelectedItems(orderedItems);
        }
      } catch (err) {
        console.error('Failed to fetch selected reference items', err);
      } finally {
        if (active) setLoadingSelected(false);
      }
    };
    hydrate();
    return () => { active = false; };
  }, [selectedIds, fetchSelectedItems]);

  // Debounced search
  useEffect(() => {
    if (!isSearchOpen) return;
    
    let active = true;
    const executeSearch = async () => {
      setIsSearching(true);
      try {
        const results = await searchItems(searchQuery);
        if (active) setSearchResults(results || []);
      } catch (err) {
        console.error('Failed to search reference items', err);
        if (active) setSearchResults([]);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    const timer = setTimeout(executeSearch, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [searchQuery, isSearchOpen, searchItems]);

  const handleAdd = (id: string) => {
    if (!selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleRemove = (index: number) => {
    const newIds = [...selectedIds];
    newIds.splice(index, 1);
    onChange(newIds);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newIds = [...selectedIds];
    const temp = newIds[index - 1];
    newIds[index - 1] = newIds[index];
    newIds[index] = temp;
    onChange(newIds);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedIds.length - 1) return;
    const newIds = [...selectedIds];
    const temp = newIds[index + 1];
    newIds[index + 1] = newIds[index];
    newIds[index] = temp;
    onChange(newIds);
  };

  return (
    <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
      {label && <h4 className="text-sm font-semibold text-gray-800">{label}</h4>}
      
      {/* List of selected items */}
      <div className="space-y-2">
        {loadingSelected && selectedItems.length === 0 ? (
          <div className="text-sm text-gray-500 py-2 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading references...
          </div>
        ) : selectedItems.length === 0 ? (
          <div className="text-sm text-gray-500 italic py-2">No items selected.</div>
        ) : (
          selectedItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center justify-between bg-white border border-gray-200 rounded p-3 shadow-sm">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
                {item.subtitle && <span className="text-xs text-gray-500 truncate">{item.subtitle}</span>}
              </div>
              <div className="flex items-center gap-1 ml-4 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === selectedItems.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={16} />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 text-red-400 hover:text-red-600 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Item Selector */}
      <div className="relative pt-2 border-t border-gray-200 mt-4">
        {!isSearchOpen ? (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} /> Add Item
          </button>
        ) : (
          <div className="bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
            <div className="flex items-center border-b border-gray-200 p-2">
              <Search size={16} className="text-gray-400 ml-1 mr-2" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-sm outline-none bg-transparent"
              />
              <button 
                type="button" 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2"
              >
                Cancel
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500 flex justify-center items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(result => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => handleAdd(result.id)}
                        disabled={selectedIds.includes(result.id)}
                        className={`w-full text-left p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex flex-col ${selectedIds.includes(result.id) ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                      >
                        <span className="text-sm font-medium text-gray-900">{result.title}</span>
                        {result.subtitle && <span className="text-xs text-gray-500 mt-0.5">{result.subtitle}</span>}
                        {selectedIds.includes(result.id) && <span className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1"><ChevronUp size={12}/> Already Added</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 italic">
                  No results found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
