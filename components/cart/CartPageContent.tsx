"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

// Collapsible Cart Item Component (Refactored to match wireframe)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CartItemCard({ item, updateQuantity, removeItem }: any) {
  return (
    <div className="card shadow-hover" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 'var(--sp-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className={`badge ${item.type === 'package' ? 'badge--primary' : 'badge--success'}`} style={{ marginBottom: '6px' }}>
            {item.type === 'package' ? 'Health Package' : 'Diagnostic Test'}
          </span>
          <h3 className="fw-bold" style={{ marginBottom: '2px', fontSize: 'var(--fs-base)', color: 'var(--color-dark)' }}>{item.title}</h3>
          <p className="text-sm text-muted" style={{ margin: 0, lineHeight: 1.4 }}>{item.category}</p>
        </div>
        <div className="text-primary fw-bold" style={{ fontSize: 'var(--fs-md)', whiteSpace: 'nowrap' }}>
          ₹{item.price * item.quantity}
        </div>
      </div>
      
      <div className="flex justify-between items-center" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--sp-2)', marginTop: 'var(--sp-1)' }}>
        <div className="flex items-center gap-2 text-sm">
          <span className="fw-semibold text-muted" style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Qty:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 8px' }}>
            <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>-</button>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>+</button>
          </div>
        </div>
        <button className="btn btn--ghost btn--sm text-accent" style={{ padding: '4px 8px', border: 'none' }} onClick={() => removeItem(item.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: '4px' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Remove
        </button>
      </div>
    </div>
  );
}

export function CartPageContent() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, totalSavings, collectionFee, totalAmount, duplicateWarnings, removeDuplicateTest } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-sm text-center border border-border">
        <div className="w-24 h-24 bg-bg-alt rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-muted-foreground border-8 border-white shadow-sm">
          🛒
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any health packages or tests yet. Browse our comprehensive diagnostic services to get started.
        </p>
        <div className="flex justify-center gap-4">
          <Button href="/health-packages" variant="primary">
            Explore Packages
          </Button>
          <Button href="/tests" variant="outline">
            Browse Lab Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="section-header" style={{ marginBottom: 'var(--sp-4)' }}>
        <h1 className="section-header__title" style={{ fontSize: 'var(--fs-3xl)', marginBottom: '4px' }}>Your Cart</h1>
        <p className="section-header__desc" style={{ fontSize: 'var(--fs-sm)', marginBottom: 0 }}>Review your selected tests and packages before proceeding to checkout.</p>
      </div>

      {duplicateWarnings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 text-orange-800 font-bold mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Smart Cart Intelligence Alert</span>
          </div>
          <div className="flex flex-col gap-3">
            {duplicateWarnings.map((warning, idx) => (
              <div key={idx} className="bg-white border border-orange-100 p-3 rounded-md text-sm flex justify-between items-center">
                <div className="text-gray-700">
                  <p className="m-0">&quot;<strong>{warning.testTitle}</strong>&quot; is already included in the &quot;<strong>{warning.packageTitle}</strong>&quot; package.</p>
                </div>
                <button
                  type="button"
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-1.5 px-4 rounded transition-colors text-sm whitespace-nowrap"
                  onClick={() => removeDuplicateTest(warning.testSlug)}
                >
                  Remove & Save ₹{warning.savingsAmount}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
        <div className="flex flex-col gap-3" style={{ flex: 1, minWidth: 0 }}>
          {items.map((item) => (
            <CartItemCard 
              key={item.id} 
              item={item} 
              updateQuantity={updateQuantity} 
              removeItem={removeItem} 
            />
          ))}
        </div>

        <aside className="detail-sidebar" style={{ position: 'sticky', top: '120px' }}>
          <div className="detail-sidebar__box shadow-premium" style={{ padding: 'var(--sp-5)' }}>
            <h4 style={{ marginBottom: 'var(--sp-4)', fontSize: 'var(--fs-md)' }}>Order Summary</h4>
            <ul style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <li style={{ fontSize: 'var(--fs-sm)', display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className="fw-semibold text-dark">₹{subtotal + totalSavings}</span>
              </li>
              
              {totalSavings > 0 && (
                <li style={{ fontSize: 'var(--fs-sm)', display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Package Savings</span>
                  <span className="fw-semibold">- ₹{totalSavings}</span>
                </li>
              )}
              
              <li style={{ fontSize: 'var(--fs-sm)', display: 'flex', justifyContent: 'space-between', color: collectionFee === 0 ? 'var(--color-success)' : 'inherit' }}>
                <span>Home Collection</span>
                <span className="fw-semibold">{collectionFee === 0 ? 'Free' : `₹${collectionFee}`}</span>
              </li>
              
              <li style={{ paddingTop: 'var(--sp-3)', marginTop: 'var(--sp-2)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)', display: 'flex', justifyContent: 'space-between', color: 'var(--color-dark)' }}>
                <span>Total</span>
                <span className="text-primary">₹{totalAmount}</span>
              </li>
            </ul>
            
            <Link href="/book" className="btn btn--primary btn--block btn--sm mt-5" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              Proceed to Checkout
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
            <Link href="/tests" className="btn btn--outline btn--block btn--sm mt-3" style={{ display: 'flex', justifyContent: 'center' }}>Add More Tests</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
