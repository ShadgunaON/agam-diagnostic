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
    <section className={`section ${className}`}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <div>
            <div className="section-header__overline">{data.overline}</div>
            <h2 className="section-header__title">{data.title}</h2>
            <p className="section-header__desc">{data.description}</p>

            <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {data.list.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div>
                    <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '2px' }}>{item.title}</strong>
                    <span style={{ color: 'var(--color-text-light)', fontSize: 'var(--fs-sm)' }}>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'var(--color-bg-alt)', padding: 'var(--sp-8)', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '64px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: 'var(--sp-2)' }}>
              {data.stat.value}
            </div>
            <div style={{ fontSize: 'var(--fs-lg)', color: 'var(--color-text)', fontWeight: 600 }}>
              {data.stat.label}
            </div>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-4)' }}>
              {data.stat.desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
