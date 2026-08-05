"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { useCart } from '@/context/CartContext';

const SEARCHABLE_TESTS = [
  { id: 'test-cbc', slug: 'cbc-complete-blood-count', title: 'Complete Blood Count (CBC)', category: 'Haematology', price: 350, originalPrice: 450, type: 'test' as const },
  { id: 'test-fbs', slug: 'fasting-blood-sugar', title: 'Fasting Blood Sugar (FBS)', category: 'Diabetes', price: 150, originalPrice: 200, type: 'test' as const },
  { id: 'test-hba1c', slug: 'hba1c-glycated-hemoglobin', title: 'HbA1c (Glycated Hemoglobin)', category: 'Diabetes', price: 499, originalPrice: 650, type: 'test' as const },
  { id: 'test-vit-d', slug: 'vitamin-d-total', title: 'Vitamin D 25-Hydroxy', category: 'Vitamins', price: 999, originalPrice: 1400, type: 'test' as const },
  { id: 'test-tsh', slug: 'thyroid-stimulating-hormone', title: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrine', price: 599, originalPrice: 850, type: 'test' as const },
  { id: 'test-lft', slug: 'liver-function-test', title: 'Liver Function Test (LFT)', category: 'Organ Profiles', price: 799, originalPrice: 1100, type: 'test' as const },
  { id: 'test-lipid', slug: 'lipid-profile-test', title: 'Lipid Profile Test', category: 'Cardiology', price: 550, originalPrice: 750, type: 'test' as const },
];

export function BookingStepCart() {
  const { items, addItem, removeItem, updateQuantity, duplicateWarnings, removeDuplicateTest, totalSavings } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSearchTests = SEARCHABLE_TESTS.filter(
    (t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {duplicateWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 space-y-3 mb-8">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-600 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Smart Cart Intelligence: Duplicate Test Detected</span>
          </div>
          {duplicateWarnings.map((warning, idx) => (
            <div key={idx} className="bg-white border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-amber-950 mb-0.5">
                  &quot;{warning.testTitle}&quot; is already included inside your &quot;{warning.packageTitle}&quot; package.
                </p>
                <span className="text-xs text-amber-800">You don&apos;t need to pay for this individual test separately.</span>
              </div>
              <button
                type="button"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer shrink-0 transition-colors shadow-xs"
                onClick={() => removeDuplicateTest(warning.testSlug)}
              >
                Remove & Save ₹{warning.savingsAmount}
              </button>
            </div>
          ))}
        </div>
      )}

      <Card className="relative">
        <Card.Header className="flex flex-row items-center justify-between border-b border-border/60 pb-4 mb-2">
          <Card.Title className="flex items-center gap-2 m-0 text-lg tracking-tight">
            Selected Tests & Packages ({items.length})
          </Card.Title>
          {totalSavings > 0 && (
            <span className="bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              Save ₹{totalSavings}
            </span>
          )}
        </Card.Header>

        <Card.Content>
          {items.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-border rounded-xl mb-4 bg-bg-alt">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-muted-foreground shadow-xs">
                🔬
              </div>
              <p className="font-bold text-xs text-foreground mb-1">Your booking cart is empty</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">Use the instant search box below to add tests or browse health packages.</p>
              <div className="flex justify-center gap-2">
                <Button href="/tests" variant="primary" size="sm" className="text-xs">Browse Tests</Button>
                <Button href="/health-packages" variant="outline" size="sm" className="text-xs">View Packages</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 mb-4 max-h-[260px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-border/60 rounded-xl bg-white shadow-sm transition-all hover:border-primary/30">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="font-bold text-xs text-foreground tracking-tight">{item.title}</h4>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className={`text-xs font-semibold ${item.type === 'package' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {item.type === 'package' ? 'Package' : 'Test'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground leading-tight">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 border border-border rounded px-1.5 py-0.5 bg-white">
                      <button 
                        type="button" 
                        className="w-4 h-4 flex items-center justify-center text-xs font-bold text-foreground border-none bg-transparent cursor-pointer hover:bg-bg-alt rounded"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        type="button" 
                        className="w-4 h-4 flex items-center justify-center text-xs font-bold text-foreground border-none bg-transparent cursor-pointer hover:bg-bg-alt rounded"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-xs text-primary min-w-[50px] text-right">
                      ₹{item.price * item.quantity}
                    </span>

                    <button 
                      type="button" 
                      className="text-muted-foreground hover:text-destructive border-none bg-transparent cursor-pointer text-base p-1"
                      onClick={() => removeItem(item.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative mt-2" ref={searchRef}>
            <SearchInput
              className="text-xs py-2.5 h-auto font-normal" 
              placeholder="Search tests or packages (e.g. Sugar, Vitamin D, Thyroid)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />

            {searchFocused && searchQuery.trim().length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                <div className="px-3 pt-2.5 pb-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider m-0">Popular Tests</p>
                </div>
                {SEARCHABLE_TESTS.slice(0, 4).map((test) => (
                  <div 
                    key={test.id} 
                    className="p-2.5 hover:bg-bg-alt flex items-center justify-between cursor-pointer border-b border-border/50 last:border-none"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      addItem(test);
                      setSearchFocused(false);
                    }}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground mb-0">{test.title}</p>
                      <span className="text-xs text-muted-foreground">{test.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">₹{test.price}</span>
                      <Button as="span" variant="primary" size="sm" className="text-xs py-1 px-2">+ Add</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                {filteredSearchTests.length > 0 ? (
                  filteredSearchTests.map((test) => (
                    <div 
                      key={test.id} 
                      className="p-2.5 hover:bg-bg-alt flex items-center justify-between cursor-pointer border-b border-border/50 last:border-none"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        addItem(test);
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground mb-0">{test.title}</p>
                        <span className="text-xs text-muted-foreground">{test.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">₹{test.price}</span>
                        <Button as="span" variant="primary" size="sm" className="text-xs py-1 px-2">+ Add</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-muted-foreground text-center">No matching tests found.</div>
                )}
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </>
  );
}
