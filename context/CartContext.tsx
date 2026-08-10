"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartService } from '@/services/CartService';
import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  type: 'test' | 'package' | 'service';
  category: string;
  price: number;
  originalPrice?: number;
  badgeText?: string;
  badgeColor?: string;
  quantity: number;
  icon?: string;
  highlightText?: string;
  includedTests?: string[];
}

export interface DuplicateWarning {
  testId: string;
  testSlug: string;
  testTitle: string;
  packageTitle: string;
  savingsAmount: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  totalSavings: number;
  collectionFee: number;
  totalAmount: number;
  duplicateWarnings: DuplicateWarning[];
  removeDuplicateTest: (testSlug: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_SAMPLE_CART: CartItem[] = [];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const storageAdapter = useMemo(() => new LocalStorageAdapter<CartItem[]>('agam_cart_items'), []);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedCart = storageAdapter.load();
        if (savedCart && Array.isArray(savedCart)) {
          setItems(savedCart);
        } else {
          setItems(INITIAL_SAMPLE_CART);
        }
      } catch (e) {
        console.error('Failed to load cart from storage adapter', e);
        setItems(INITIAL_SAMPLE_CART);
      } finally {
        setIsInitialized(true);
      }
    });
  }, [storageAdapter]);

  useEffect(() => {
    if (isInitialized) {
      try {
        storageAdapter.save(items);
      } catch (e) {
        console.error('Failed to save cart to storage adapter', e);
      }
    }
  }, [items, isInitialized, storageAdapter]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === item.id || i.slug === item.slug);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id && i.slug !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id || item.slug === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  // Cart Intelligence
  const duplicateWarnings = useMemo(() => CartService.getDuplicateWarnings(items), [items]);

  const removeDuplicateTest = (testSlug: string) => {
    removeItem(testSlug);
  };

  const { itemCount, subtotal, totalSavings, collectionFee, totalAmount } = useMemo(() => CartService.calculateTotals(items), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        totalSavings,
        collectionFee,
        totalAmount,
        duplicateWarnings,
        removeDuplicateTest,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
