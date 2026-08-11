"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Section, Container, Grid, Card } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

import { ServiceItem } from '@/domains/services/model';

export interface ServicesCatalogSectionProps {
  data: ServiceItem[];
  className?: string;
}

export function ServicesCatalogSection({ data, className = '' }: ServicesCatalogSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleData = showAll ? data : data.slice(0, 3);
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [visibleData]);

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 499;
    const cleaned = priceStr.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 499;
  };

  const getIcon = (iconName: string) => {
    const style = { width: '24px', height: '24px' };
    switch (iconName) {
      case 'checkup':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
      case 'dna':
      case 'genetics':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'microscope':
      case 'molecular':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
      case 'rt-pcr':
      case 'pcr':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
      case 'microbiology':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
      case 'immunology':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <Section id="services-grid" className={`section ${className}`.trim()} ref={containerRef}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleData.map((service, idx) => (
            <div 
              key={idx} 
              className={`card--service-premium premium-card-anim accent--${service.color || 'blue'} fade-in`}
            >
              <div className="card-premium__header">
                <div className={`card-premium__badge accent--${service.color || 'blue'}`}>
                  {service.category}
                </div>
                <div className="card-premium__icon">
                  {getIcon(service.icon)}
                </div>
              </div>
              <h3 className="card-premium__title">
                <Link href={`/services/${service.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {service.title}
                </Link>
              </h3>
              <p className="card-premium__benefit">{service.description}</p>
              <div className="card-premium__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'var(--sp-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="card-premium__price">
                    <span style={{ fontSize: '11px', color: 'var(--color-text-lighter)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', lineHeight: 1, marginBottom: '4px' }}>
                      Starting From
                    </span>
                    ₹{parsePrice(service.price)}
                  </div>
                  <Link href={`/services/${service.slug}`} className="btn btn--outline btn--sm" style={{ padding: '6px 12px', fontSize: '12px', alignSelf: 'flex-start' }}>
                    View Details <span className="cta-arrow">→</span>
                  </Link>
                </div>
                
                {(() => {
                  const numPrice = parsePrice(service.price);
                  const cartItem = items.find(i => i.id === `service-${service.slug}`);
                  
                  return cartItem ? (
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
                            id: `service-${service.slug}`,
                            slug: service.slug,
                            title: service.title,
                            type: 'test',
                            category: service.category || 'Diagnostic Service',
                            price: numPrice,
                            originalPrice: Math.round(numPrice * 1.3),
                          });
                        }}
                      >
                        + Add
                      </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
        
        {data.length > 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--sp-8)' }}>
            <Button onClick={() => setShowAll(!showAll)} variant="outline">
              {showAll ? 'View Less' : 'View All Services'}
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}
