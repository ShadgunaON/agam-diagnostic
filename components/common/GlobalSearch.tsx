"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

// Hardcoded for demo/MVP purposes. In a real app, this would be fetched from an API or a global store.
const SEARCHABLE_ITEMS = [
  { id: 'test-cbc', slug: 'cbc-complete-blood-count', title: 'Complete Blood Count (CBC)', category: 'Haematology', price: 350, type: 'test' as const },
  { id: 'test-fbs', slug: 'fasting-blood-sugar', title: 'Fasting Blood Sugar (FBS)', category: 'Diabetes', price: 150, type: 'test' as const },
  { id: 'test-hba1c', slug: 'hba1c-glycated-hemoglobin', title: 'HbA1c (Glycated Hemoglobin)', category: 'Diabetes', price: 499, type: 'test' as const },
  { id: 'test-vit-d', slug: 'vitamin-d-total', title: 'Vitamin D 25-Hydroxy', category: 'Vitamins', price: 999, type: 'test' as const },
  { id: 'test-tsh', slug: 'thyroid-stimulating-hormone', title: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrine', price: 599, type: 'test' as const },
  { id: 'test-lft', slug: 'liver-function-test', title: 'Liver Function Test (LFT)', category: 'Organ Profiles', price: 799, type: 'test' as const },
  { id: 'test-lipid', slug: 'lipid-profile-test', title: 'Lipid Profile Test', category: 'Cardiology', price: 550, type: 'test' as const },
  { id: 'pkg-m1', slug: 'comprehensive-mens-health', title: 'Comprehensive Men\'s Health', category: 'Packages', price: 2999, type: 'package' as const },
  { id: 'pkg-w1', slug: 'comprehensive-womens-health', title: 'Comprehensive Women\'s Health', category: 'Packages', price: 3199, type: 'package' as const },
];

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Clear query and selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay clearing to allow exit animation to finish smoothly
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredItems = query.trim().length > 0 
    ? SEARCHABLE_ITEMS.filter(
        item => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Reset selection when query changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation for the search results
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Radix Dialog handles ESC by default, so we only need to handle arrows and enter
      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) {
          const cartItem = items.find(i => i.id === item.id || i.slug === item.slug);
          if (!cartItem) {
            addItem({ ...item, originalPrice: item.price * 1.2 });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, items, addItem]);

  const handleQuickAdd = (item: (typeof SEARCHABLE_ITEMS)[number], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...item, originalPrice: item.price * 1.2 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 
        We use a custom layout for the search palette:
        - top aligned instead of center aligned (!top-[10%] !translate-y-0)
        - no padding (p-0) to allow edge-to-edge header/body
        - gap-0 to prevent default Dialog gap
      */}
      <Dialog.Content 
        className="sm:max-w-3xl p-0 !top-[10%] !translate-y-0 gap-0 overflow-hidden shadow-2xl border-border/50"
        aria-label="Command Palette"
        aria-describedby="global-search-description"
      >
        <span id="global-search-description" className="sr-only">Search for tests and packages.</span>
        
        <Dialog.Header className="flex flex-row items-center px-4 py-4 pr-12 border-b border-border/50 m-0 space-y-0 shrink-0 relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-primary shrink-0">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground ml-3"
            placeholder="Search for tests, packages, or conditions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ESC
          </kbd>
        </Dialog.Header>

        <Dialog.Body className="p-2 bg-bg-alt/30 max-h-[60vh] overflow-y-auto m-0">
          {query.trim().length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Popular Searches</span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Diabetes', 'Thyroid', 'Vitamin D', 'Full Body Checkup', 'CBC'].map(term => (
                    <button 
                      key={term}
                      className="px-4 py-2 rounded-full bg-white border border-border/50 text-sm font-medium cursor-pointer hover:border-primary hover:text-primary hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const cartItem = items.find(i => i.id === item.id || i.slug === item.slug);
                const isSelected = selectedIndex === index;
                
                return (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                      isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:bg-white hover:border-border/50 hover:shadow-sm"
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={(e) => {
                      if (!cartItem) {
                        handleQuickAdd(item, e);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0",
                          item.type === 'package' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {item.type === 'package' ? 'Package' : 'Test'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">{item.category}</span>
                      </div>
                      <h4 className={cn(
                        "font-semibold text-sm m-0 transition-colors truncate",
                        isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}>
                        {item.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-bold text-sm text-foreground">₹{item.price}</span>
                      {cartItem ? (
                        <div className="flex items-center border border-primary rounded-md overflow-hidden bg-primary/5" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button" 
                            className="w-7 h-7 flex items-center justify-center text-primary font-bold hover:bg-primary/10 transition-colors cursor-pointer focus:outline-none focus:bg-primary/20"
                            onClick={() => {
                              if (cartItem.quantity <= 1) {
                                removeItem(cartItem.id);
                              } else {
                                updateQuantity(cartItem.id, -1);
                              }
                            }}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-foreground w-4 text-center">{cartItem.quantity}</span>
                          <button 
                            type="button" 
                            className="w-7 h-7 flex items-center justify-center text-primary font-bold hover:bg-primary/10 transition-colors cursor-pointer focus:outline-none focus:bg-primary/20"
                            onClick={() => updateQuantity(cartItem.id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <Button 
                          variant={isSelected ? "primary" : "outline"} 
                          size="sm" 
                          className={cn(
                            "h-7 px-3 text-xs transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                          onClick={(e) => handleQuickAdd(item, e)}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-14 px-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-white border border-border/50 shadow-sm rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We couldn&apos;t find any tests or packages matching &quot;<span className="font-medium text-foreground">{query}</span>&quot;.
              </p>
            </div>
          )}
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
}
