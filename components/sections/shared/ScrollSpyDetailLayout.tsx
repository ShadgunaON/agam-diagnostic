'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';

export interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface ScrollSpyDetailLayoutProps {
  className?: string;
  header: {
    title: string;
    category: string;
    description: string;
    price: number | string;
    badges?: Array<{ title: string; icon?: React.ReactNode }>;
  };
  cartData: {
    id: string;
    slug: string;
    title: string;
    type: 'service' | 'package';
    category: string;
    price: number;
    originalPrice: number;
    includedTests?: string[];
  };
  sections: AccordionSection[];
  defaultOpenSection?: string;
}

export function ScrollSpyDetailLayout({
  className = '',
  header,
  cartData,
  sections,
}: ScrollSpyDetailLayoutProps) {
  const [activeSection, setActiveSection] = useState<string | null>(sections[0]?.id || null);
  const { items, addItem, updateQuantity, removeItem } = useCart();
  
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100; // offset for sticky headers
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const renderCartButton = () => {
    const cartItem = items.find(i => i.id === cartData.id);
    if (cartItem) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#fff' }}>
          <button
            type="button"
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '14px' }}
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
          <span style={{ fontSize: '13px', fontWeight: 'bold', width: '20px', textAlign: 'center', color: 'var(--color-primary)' }}>{cartItem.quantity}</span>
          <button
            type="button"
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '14px' }}
            onClick={() => updateQuantity(cartItem.id, 1)}
          >
            +
          </button>
        </div>
      );
    }
    return (
      <button 
        type="button"
        style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}
        onClick={() => addItem(cartData)}
      >
        Add to Cart
      </button>
    );
  };

  return (
    <div className={`scroll-spy-layout ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Mobile Sticky Nav (Hidden on Desktop) */}
      <div className="md:hidden sticky top-[60px] z-20 bg-white border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide py-3 px-4 flex gap-3 shadow-sm" style={{ margin: '0 -20px' }}>
        {sections.map(section => (
          <button
            key={`mobile-${section.id}`}
            onClick={() => scrollToSection(section.id)}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeSection === section.id ? 'var(--color-primary)' : '#f1f5f9',
              color: activeSection === section.id ? '#fff' : '#475569',
              transition: 'all 0.2s ease',
            }}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="md:flex md:items-start md:gap-8">
        
        {/* Left Sidebar (Sticky on Desktop) */}
        <div className="md:w-[380px] md:shrink-0 md:sticky md:top-[100px] flex flex-col gap-6 mb-8 md:mb-0">
          
          {/* Header Card */}
          <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', color: 'var(--color-text)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid #bae6fd', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            {header.badges && header.badges.length > 0 && (
              <div className="value-summary" style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {header.badges.map((badge, idx) => (
                  <div key={idx} className="value-summary__item" style={{ fontSize: '11px', padding: '4px 8px', background: '#fff', color: 'var(--color-primary)', border: '1px solid #bae6fd', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {badge.icon} {badge.title}
                  </div>
                ))}
              </div>
            )}

            <span style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', borderRadius: '4px', marginBottom: '12px', fontSize: '11px', padding: '4px 8px', fontWeight: 600 }}>{header.category}</span>
            <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: '8px', color: 'var(--color-primary)', lineHeight: 1.2 }}>{header.title}</h1>
            <p style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text-light)', margin: 0, marginBottom: '20px', lineHeight: 1.5 }}>{header.description}</p>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #bae6fd' }}>
              <div style={{ flex: 1 }}>
                 <div style={{ fontSize: '12px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Price</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{header.price}</div>
              </div>
              {renderCartButton()}
            </div>
          </div>

          {/* Desktop Table of Contents (Hidden on Mobile) */}
          <div className="hidden md:block" style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--color-text)' }}>Table of Contents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map(section => (
                <button
                  key={`toc-${section.id}`}
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSection === section.id ? '#f0f9ff' : 'transparent',
                    color: activeSection === section.id ? 'var(--color-primary)' : 'var(--color-text-light)',
                    fontWeight: activeSection === section.id ? 600 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ 
                    width: '4px', 
                    height: '24px', 
                    background: activeSection === section.id ? 'var(--color-primary)' : 'transparent',
                    borderRadius: '4px',
                    transition: 'background 0.2s'
                  }} />
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:flex-1 flex flex-col gap-10">
          {sections.map((section, idx) => (
            <section 
              key={section.id} 
              id={section.id} 
              ref={(el) => { sectionRefs.current[idx] = el; }}
              style={{ scrollMarginTop: '120px' }} // offset for when linked
            >
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                {section.title}
              </h2>
              <div className="prose prose-blue max-w-none">
                {section.content}
              </div>
            </section>
          ))}
        </div>

      </div>
    </div>
  );
}
