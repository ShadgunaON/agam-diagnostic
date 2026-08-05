import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface StorySectionProps {
  data: {
    title: string;
    paragraphs: string[];
    image: string;
    stat: { value: string; label: string };
  };
  className?: string;
}

export function StorySection({ data, className = '' }: StorySectionProps) {
  return (
    <section className={`section ${className}`}>
      <div className="container">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-12)', alignItems: 'center' }}>
          <div style={{ paddingRight: 'var(--sp-4)' }}>
            <div className="section-header__overline">Our Story</div>
            <h2 className="section-header__title" style={{ marginBottom: 'var(--sp-6)' }}>{data.title}</h2>
            {data.paragraphs.map((para: string, idx: number) => (
              <p 
                key={idx} 
                className="section-header__desc"
                style={{ marginBottom: idx === data.paragraphs.length - 1 ? 0 : 'var(--sp-4)', lineHeight: 1.7, fontSize: '1.05rem' }}
              >
                {para}
              </p>
            ))}
          </div>

          <div className="image-wrap fade-in is-revealed" style={{ position: 'relative', padding: 'var(--sp-4)' }}>
            <div style={{ borderRadius: 'calc(var(--radius-xl) * 1.5)', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={data.image} 
                alt="Laboratory professionals working" 
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* Floating Card */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, background: '#fff', padding: 'var(--sp-4) var(--sp-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', transform: 'translateY(-10%)', marginLeft: '-12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-bg-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--fs-xl)', color: 'var(--color-primary)', lineHeight: 1.1 }}>{data.stat.value}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{data.stat.label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
