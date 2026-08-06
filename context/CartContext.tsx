"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

export interface DuplicateWarning {
  testId: string;
  testSlug: string;
  testTitle: string;
  packageTitle: string;
  savingsAmount: number;
}

// Known package test inclusions mapping for Cart Intelligence
const PACKAGE_TEST_INCLUSIONS: Record<string, string[]> = {
  'well-woman-basic': ['cbc-complete-blood-count', 'thyroid-stimulating-hormone', 'fasting-blood-sugar'],
  'well-woman-advanced': ['cbc-complete-blood-count', 'thyroid-stimulating-hormone', 'fasting-blood-sugar', 'lipid-profile-test', 'vitamin-d-total'],
  'executive-health-profile': ['cbc-complete-blood-count', 'lipid-profile-test', 'liver-function-test', 'thyroid-stimulating-hormone', 'vitamin-d-total'],
  'diabetic-profile': ['fasting-blood-sugar', 'hba1c-glycated-hemoglobin'],
  'cardiac-risk-assessment': ['lipid-profile-test', 'fasting-blood-sugar', 'hba1c-glycated-hemoglobin'],
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedCart = localStorage.getItem('agam_cart_items');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        } else {
          setItems(INITIAL_SAMPLE_CART);
        }
      } catch (e) {
        console.error('Failed to load cart from localStorage', e);
        setItems(INITIAL_SAMPLE_CART);
      } finally {
        setIsInitialized(true);
      }
    });
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('agam_cart_items', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isInitialized]);

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

  // Cart Intelligence: Detect individual tests already included inside an added package
  const duplicateWarnings: DuplicateWarning[] = [];
  const packageItems = items.filter((i) => i.type === 'package');
  const testItems = items.filter((i) => i.type === 'test');

  packageItems.forEach((pkg) => {
    const includedSlugs = PACKAGE_TEST_INCLUSIONS[pkg.slug] || [];
    testItems.forEach((test) => {
      if (includedSlugs.includes(test.slug)) {
        duplicateWarnings.push({
          testId: test.id,
          testSlug: test.slug,
          testTitle: test.title,
          packageTitle: pkg.title,
          savingsAmount: test.price * test.quantity,
        });
      }
    });
  });

  const removeDuplicateTest = (testSlug: string) => {
    removeItem(testSlug);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const totalSavings = items.reduce((acc, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return acc + (item.originalPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  const collectionFee = subtotal >= 500 || subtotal === 0 ? 0 : 150;
  const totalAmount = subtotal + collectionFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
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
