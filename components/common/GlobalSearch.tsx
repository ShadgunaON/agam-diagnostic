"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { performGlobalSearch, SearchResultItem } from '@/app/actions/globalSearch';

export function GlobalSearch() {
  const router = useRouter();
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const debounceId = setTimeout(async () => {
      try {
        const data = await performGlobalSearch(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceId);
  }, [query, isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleResultClick = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    router.push(item.url);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[selectedIndex];
        if (item) {
          handleResultClick(item);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick]);

  const handleQuickAdd = (item: SearchResultItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.type === 'test' || item.type === 'package') {
      const numPrice = typeof item.price === 'number' ? item.price : (item.price ? parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0 : 0);
      addItem({
        id: item.id,
        slug: item.slug,
        title: item.title,
        category: item.category,
        price: numPrice,
        type: item.type,
        originalPrice: numPrice ? numPrice * 1.2 : 0
      });
    }
  };

  return (
    <div className="relative w-[130px] lg:w-[150px] xl:w-[180px] focus-within:w-[180px] lg:focus-within:w-[220px] xl:focus-within:w-[280px] transition-all duration-300" ref={containerRef}>
      <div className="relative flex items-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 w-4 h-4 text-muted-foreground">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          className="w-full h-9 pl-9 pr-9 rounded-full border border-border/60 bg-bg-alt/50 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[320px] sm:w-[450px] lg:w-[500px] bg-white rounded-xl shadow-2xl border border-border/50 overflow-hidden z-[9999]">
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2 space-y-3">
                {['service', 'package', 'test', 'blog', 'page'].map(groupType => {
                  const groupItems = results.filter(item => item.type === groupType);
                  if (groupItems.length === 0) return null;

                  return (
                    <div key={groupType} className="mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">
                        {groupType === 'service' ? 'Services' : 
                         groupType === 'package' ? 'Packages' : 
                         groupType === 'test' ? 'Tests' : 'Blogs & Content'}
                      </h3>
                      <div className="space-y-1">
                        {groupItems.map((item, index) => {
                          const globalIndex = results.indexOf(item);
                          const cartItem = (item.type === 'test' || item.type === 'package') 
                            ? items.find(i => i.id === item.id || i.slug === item.slug) 
                            : null;
                          const isSelected = selectedIndex === globalIndex;
                          
                          return (
                            <div 
                              key={`${item.type}-${item.id}`} 
                              className={cn(
                                "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group gap-2 sm:gap-0",
                                isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:bg-white hover:border-border/50 hover:shadow-sm"
                              )}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              onClick={() => handleResultClick(item)}
                            >
                              <div className="flex-1 min-w-0 pr-4">
                                <h4 className={cn(
                                  "font-semibold text-sm m-0 transition-colors truncate",
                                  isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                                )}>
                                  {item.title}
                                </h4>
                              </div>
                              
                              {(item.type === 'test' || item.type === 'package') && item.price && (
                                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                                  <span className="font-bold text-sm text-foreground">₹{item.price}</span>
                                  {cartItem ? (
                                    <div className="flex items-center border border-primary rounded-md overflow-hidden bg-primary/5" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        type="button" 
                                        className="w-7 h-7 flex items-center justify-center text-primary font-bold hover:bg-primary/10 transition-colors cursor-pointer text-sm"
                                        onClick={() => {
                                          if (cartItem.quantity <= 1) {
                                            removeItem(cartItem.id);
                                          } else {
                                            updateQuantity(cartItem.id, -1);
                                          }
                                        }}
                                      >
                                        -
                                      </button>
                                      <span className="text-xs font-bold text-foreground w-4 text-center">{cartItem.quantity}</span>
                                      <button 
                                        type="button" 
                                        className="w-7 h-7 flex items-center justify-center text-primary font-bold hover:bg-primary/10 transition-colors cursor-pointer text-sm"
                                        onClick={() => updateQuantity(cartItem.id, 1)}
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <Button 
                                      variant={isSelected ? "primary" : "outline"} 
                                      size="sm" 
                                      className={cn(
                                        "h-7 px-3 text-xs py-0 transition-opacity opacity-0 group-hover:opacity-100",
                                        isSelected && "opacity-100"
                                      )}
                                      onClick={(e) => handleQuickAdd(item, e)}
                                    >
                                      Add to Cart
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !isLoading ? (
              <div className="py-8 px-4 text-center flex flex-col items-center">
                <div className="w-8 h-8 bg-white border border-border/50 shadow-sm rounded-full flex items-center justify-center mb-2 text-muted-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No results found</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                  We couldn&apos;t find anything matching &quot;<span className="font-medium text-foreground">{query}</span>&quot;.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
