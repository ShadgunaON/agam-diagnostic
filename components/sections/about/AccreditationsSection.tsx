import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface AccreditationItem {
  title: string;
  desc: string;
}

export interface AccreditationsData {
  title: string;
  overline: string;
  description: string;
  list: AccreditationItem[];
  stat: {
    value: string;
    label: string;
    desc: string;
  };
}

export interface AccreditationsSectionProps {
  data: AccreditationsData;
  className?: string;
}

export function AccreditationsSection({ data, className = '' }: AccreditationsSectionProps) {
  return (
    <section className={`section section--alt ${className}`}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-20">
          <div>
            <div className="section-header__overline">{data.overline}</div>
            <h2 className="section-header__title">{data.title}</h2>
            <p className="section-header__desc">{data.description}</p>

            <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              {data.list.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '4px', fontSize: 'var(--fs-md)' }}>{item.title}</strong>
                    <span style={{ color: 'var(--color-text)', fontSize: 'var(--fs-sm)', lineHeight: 1.5 }}>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: '#fff', padding: 'var(--sp-12) var(--sp-8)', borderRadius: 'var(--radius-2xl)', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
            <div style={{ fontSize: '80px', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, marginBottom: 'var(--sp-4)', letterSpacing: '-0.02em' }}>
              {data.stat.value}
            </div>
            <div style={{ fontSize: 'var(--fs-xl)', color: 'var(--color-primary-dark)', fontWeight: 700, marginBottom: 'var(--sp-3)' }}>
              {data.stat.label}
            </div>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--fs-base)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
              {data.stat.desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
