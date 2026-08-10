"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button, Drawer } from '@/components/ui';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: (open: boolean) => void }) {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    totalSavings, 
    collectionFee, 
    totalAmount, 
    itemCount,
    duplicateWarnings,
    removeDuplicateTest,
  } = useCart();

  // Radix UI Dialog primitive handles scroll locking, escape key, and outside clicks natively.
  // No need for the legacy useEffect logic here.

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <Drawer.Content side="right" className="p-0 border-none max-w-[420px]">
        {/* Header */}
        <Drawer.Header className="bg-primary text-white p-4 flex flex-row items-center justify-between sm:text-left text-left">
          <Drawer.Title className="text-lg font-bold flex items-center gap-2 m-0 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Your Booking Cart
            <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full ml-1">{itemCount}</span>
          </Drawer.Title>
        </Drawer.Header>

        {/* Free Collection Banner */}
        <div className="bg-green-50 border-b border-green-100 p-3 text-sm flex items-start gap-2 text-green-800">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-600 shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          {subtotal >= 500 ? (
            <span>You qualify for <strong>FREE Home Sample Collection</strong>!</span>
          ) : (
            <span>Add <strong>₹{500 - subtotal}</strong> more to get Free Home Sample Collection!</span>
          )}
        </div>

        {/* CART INTELLIGENCE DUPLICATE ALERT BANNER */}
        {duplicateWarnings.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-200 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-orange-800 font-bold text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Smart Cart Intelligence Alert</span>
            </div>
            {duplicateWarnings.map((warning, idx) => (
              <div key={idx} className="bg-white border border-orange-100 p-3 rounded-md text-sm">
                <div className="text-gray-700 mb-2 leading-snug">
                  <p>&quot;{warning.testTitle}&quot; is already inside your &quot;{warning.packageTitle}&quot; package.</p>
                  <span className="text-orange-600 font-medium text-xs">Avoid duplicate testing and save extra.</span>
                </div>
                <button
                  type="button"
                  className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-1.5 px-3 rounded transition-colors text-xs"
                  onClick={() => removeDuplicateTest(warning.testSlug)}
                >
                  Remove & Save ₹{warning.savingsAmount}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cart Items List */}
        <Drawer.Body className="bg-slate-50/50 p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full gap-4 text-muted-foreground p-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground m-0">Your cart is empty</h3>
              <p className="text-sm">Browse health tests or packages to add them to your cart.</p>
              <div className="flex flex-col w-full gap-2 mt-4">
                <Button 
                  href="/tests" 
                  onClick={() => onClose(false)}
                >
                  Browse Lab Tests
                </Button>
                <Button 
                  href="/health-packages" 
                  variant="outline"
                  onClick={() => onClose(false)}
                >
                  Explore Packages
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white border rounded-lg p-3 shadow-sm flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start pr-6">
                    <div>
                      <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm mb-1 ${
                        item.type === 'package' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.type === 'package' ? 'Health Package' : 'Lab Test'}
                      </span>
                      <h4 className="text-sm font-bold text-foreground leading-snug">{item.title}</h4>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    </div>
                    <button 
                      type="button" 
                      className="absolute right-2 top-2 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-destructive hover:bg-red-50 rounded-md transition-colors"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-between items-end border-t pt-2 mt-1">
                    <div className="flex items-center border rounded-md">
                      <button 
                        type="button" 
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        type="button" 
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right flex flex-col">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{item.originalPrice * item.quantity}
                        </span>
                      )}
                      <span className="text-sm font-bold text-primary">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Drawer.Body>

        {/* Footer / Total Summary */}
        {items.length > 0 && (
          <Drawer.Footer className="bg-white border-t p-4 flex flex-col gap-4 !mt-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Total Savings</span>
                  <span>- ₹{totalSavings}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Home Sample Collection</span>
                <span className="font-medium">
                  {collectionFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${collectionFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-1 text-foreground">
                <span>Total Payable</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                href="/book" 
                variant="outline"
                onClick={() => onClose(false)}
                className="w-full"
              >
                View Full Cart
              </Button>
              <Button 
                href="/book" 
                onClick={() => onClose(false)}
                className="w-full"
              >
                Checkout →
              </Button>
            </div>
          </Drawer.Footer>
        )}
      </Drawer.Content>
    </Drawer>
  );
}
