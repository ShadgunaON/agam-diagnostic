'use client';

import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface TechFeature {
  title: string;
  description: string;
  bg: string;
  color: string;
}

export interface TechnologyInfrastructureSectionProps {
  data: TechFeature[];
  className?: string;
}

export function TechnologyInfrastructureSection({ data, className = '' }: TechnologyInfrastructureSectionProps) {
  return (
    <section className={`section ${className}`} style={{ background: 'var(--color-bg-subtle)', paddingTop: 'var(--sp-20)', paddingBottom: 'var(--sp-20)' }}>
      <div className="container">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-12)', alignItems: 'center' }}>
          <div>
            <div className="section-header__overline">Excellence in Action</div>
            <h2 className="section-header__title" style={{ marginBottom: 'var(--sp-6)' }}>Technology & Infrastructure</h2>
            <p className="section-header__desc" style={{ marginBottom: 'var(--sp-8)', lineHeight: 1.7 }}>
              Our processing facility is designed to minimize human error and accelerate results through advanced robotics and automated analytical systems.
            </p>

            <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
              {data.map((feature, idx) => {
                // Map the icon properly just like in HTML wireframe
                let icon = <path d="M2 12h4l3-9 5 18 3-9h5"/>;
                if (idx === 1) icon = <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>;
                if (idx === 2) icon = <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>;
                if (idx === 3) icon = <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></>;

                return (
                  <div 
                    key={idx}
                    style={{
                      background: '#fff',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--sp-4)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--sp-4)',
                      transition: 'transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease)',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: feature.bg, color: feature.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                        {icon}
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--color-primary)', margin: '0 0 4px 0', fontWeight: 700 }}>
                        {feature.title}
                      </h4>
                      <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--fs-sm)', margin: 0, lineHeight: 1.5 }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="image-wrap fade-in is-revealed" style={{ position: 'relative', height: '100%' }}>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', height: '100%', minHeight: '500px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/tech_lab_equipment.png" 
                alt="Advanced diagnostic equipment" 
                className="object-cover block"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
