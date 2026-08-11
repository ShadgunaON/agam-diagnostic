"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TestItem, TestCategory } from '@/domains/tests/model';
import { useCart } from '@/context/CartContext';

export interface TestsCatalogSectionProps {
  categories: TestCategory[];
  catalog: TestItem[];
  className?: string;
}

export function TestsCatalogSection({ categories, catalog, className = '' }: TestsCatalogSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTests = activeFilter === 'all' 
    ? catalog 
    : catalog.filter(test => test.category === activeFilter);

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 499;
    const cleaned = priceStr.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 499;
  };

  // Re-initialize intersection observer for dynamically rendered cards
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    const cards = containerRef.current.querySelectorAll('.fade-in');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredTests]);

  return (
    <section className={`section ${className}`.trim()} ref={containerRef}>
      <div className="container">
        <div className="filter-tabs" style={{ marginBottom: 'var(--sp-8)' }}>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className={`filter-tab filter-tab--premium ${activeFilter === cat.id ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test, idx) => {
              const numPrice = parsePrice(test.price);
              const cartItem = items.find(i => i.id === `test-${test.slug}` || i.slug === test.slug);
              return (
                <div key={idx} className="card card--test-premium fade-in">
                  <div className="card__body">
                    <span className="card__tag">{test.tag || test.category || 'Lab Test'}</span>
                    <h3 className="card__title">
                      <Link href={`/tests/${test.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {test.title}
                      </Link>
                    </h3>
                    <p className="card__desc">{test.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <Link href={`/tests/${test.slug}`} className="card__link">View Details →</Link>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: 'var(--fs-lg)' }}>₹{numPrice}</span>
                    </div>
                  </div>

                  <div className="card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 0 }}>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-light)', fontWeight: 500 }}>Free Home Collection</span>
                    {cartItem ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', padding: '2px', background: 'rgba(14, 165, 233, 0.05)' }}>
                        <button 
                          type="button" 
                          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: 'none', border: 'none' }}
                          onClick={(e) => {
                            e.preventDefault();
                            if (cartItem.quantity <= 1) {
                              removeItem(cartItem.id);
                            } else {
                              updateQuantity(cartItem.id, -1);
                            }
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', color: 'var(--color-text)', minWidth: '16px', textAlign: 'center' }}>{cartItem.quantity}</span>
                        <button 
                          type="button" 
                          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: 'none', border: 'none' }}
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(cartItem.id, 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        style={{ padding: '6px 16px', fontSize: 'var(--fs-sm)' }}
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: `test-${test.slug}`,
                            slug: test.slug,
                            title: test.title,
                            type: 'test',
                            category: test.category || 'Lab Test',
                            price: numPrice,
                            originalPrice: Math.round(numPrice * 1.3),
                          });
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">🔬</div>
            <h3>No matching tests found</h3>
            <p>We couldn&apos;t find a test matching your search criteria. Please contact our support team to request a custom test.</p>
            <Link href="/contact" className="btn btn--primary">
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
