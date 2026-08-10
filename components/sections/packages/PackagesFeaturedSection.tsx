'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FeaturedPackage } from '@/domains/packages/model';
import { useCart } from '@/context/CartContext';
import { Section, Container } from '@/components/ui';
import { PremiumCard } from '@/components/ui/PremiumCard';

interface PackagesFeaturedSectionProps {
  data: FeaturedPackage[];
  title?: string;
  subtitle?: string;
  showAgeFilter?: boolean;
  id?: string;
}

const ageCategories = [
  { id: 'all', label: 'All Ages' },
  { id: '20-30', label: 'Age 20–30' },
  { id: '30-50', label: 'Age 30–50' },
  { id: '50+', label: 'Age 50+' },
];

export function PackagesFeaturedSection({ 
  data, 
  title = "Featured Health Packages",
  subtitle = "Our most recommended packages — chosen by doctors and trusted by thousands of families in Madurai.",
  showAgeFilter = true,
  id
}: PackagesFeaturedSectionProps) {
  const [activeAge, setActiveAge] = useState('all');
  const { items, addItem, updateQuantity, removeItem } = useCart();

  const filteredPackages = data.filter((pkg) => {
    if (activeAge === 'all') return true;
    if (pkg.ageGroups && pkg.ageGroups.length > 0) {
      return pkg.ageGroups.includes(activeAge);
    }
    const text = (pkg.highlightText + ' ' + pkg.title + ' ' + pkg.benefit).toLowerCase();
    if (activeAge === '20-30') return text.includes('20') || text.includes('basic') || text.includes('pcos') || text.includes('anemia');
    if (activeAge === '30-50') return text.includes('30') || text.includes('40') || text.includes('advanced') || text.includes('executive') || text.includes('cardiac');
    if (activeAge === '50+') return text.includes('50') || text.includes('senior');
    return true;
  });

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 1999;
    const cleaned = priceStr.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 1999;
  };

  const renderHighlightIcon = (iconName: string) => {
    switch (iconName) {
      case 'female':
        return <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></>;
      case 'male':
        return <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>;
      case 'activity':
        return <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>;
      case 'heart':
        return <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;
      default:
        return <circle cx="12" cy="12" r="4" />;
    }
  };

  return (
    <section id={id} className="section section--alt">
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="section-header__overline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Most Popular
          </div>
          <h2 className="section-header__title">{title}</h2>
          <p className="section-header__desc">{subtitle}</p>
        </div>

        {showAgeFilter && (
          <div className="filter-tabs" style={{ marginBottom: 'var(--sp-8)', display: 'flex', justifyContent: 'center' }}>
            {ageCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-tab filter-tab--premium ${activeAge === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveAge(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {filteredPackages.length > 0 ? (
          <div className="grid grid--3">
            {filteredPackages.map((pkg, idx) => {
              const numPrice = parsePrice(pkg.price);
              return (
                <PremiumCard
                  key={pkg.slug || idx}
                  title={pkg.title}
                  category={pkg.badgeText}
                  price={numPrice}
                  originalPrice={Math.round(numPrice * 1.35)}
                  discountLabel="25% Off"
                  slug={pkg.slug}
                  type="package"
                  features={[
                    { 
                      text: 'Parameters', 
                      subtext: pkg.highlightText,
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>{renderHighlightIcon(pkg.highlightIcon)}</svg>
                    },
                    { 
                      text: 'Benefits', 
                      subtext: pkg.benefit,
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    }
                  ]}
                  onAddToCart={() => {
                    addItem({
                      id: `pkg-${pkg.slug}`,
                      slug: pkg.slug,
                      title: pkg.title,
                      type: 'package',
                      category: 'Health Package',
                      price: numPrice,
                      originalPrice: Math.round(numPrice * 1.35),
                      badgeColor: pkg.badgeColor,
                      badgeText: pkg.badgeText,
                      highlightText: pkg.highlightText,
                      includedTests: pkg.includedTests,
                    });
                  }}
                  actionButton={
                    (() => {
                      const cartItem = items.find(i => i.id === `pkg-${pkg.slug}` || i.slug === pkg.slug);
                      if (cartItem) {
                        return (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px', border: '1px solid var(--color-primary-light)', borderRadius: '6px', background: 'var(--color-primary-light)' }}>
                            <button 
                              type="button" 
                              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: '#fff', border: 'none', borderRadius: '4px' }}
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
                            <span style={{ fontSize: '12px', fontWeight: 'bold', width: '20px', textAlign: 'center', color: 'var(--color-primary)' }}>{cartItem.quantity}</span>
                            <button 
                              type="button" 
                              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: '#fff', border: 'none', borderRadius: '4px' }}
                              onClick={(e) => {
                                e.preventDefault();
                                updateQuantity(cartItem.id, 1);
                              }}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-state flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-border">
            <h3 className="text-xl font-bold mb-2">No packages match this age filter</h3>
            <p className="text-muted-foreground mb-4">Try selecting another age category or view all packages.</p>
            <Button type="button" className="btn btn--primary btn--sm" onClick={() => setActiveAge('all')}>
              Show All Packages
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
