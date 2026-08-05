import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface MissionVisionSectionProps {
  data: {
    mission: { title: string; description: string };
    vision: { title: string; description: string };
  };
  className?: string;
}

export function MissionVisionSection({ data, className = '' }: MissionVisionSectionProps) {
  return (
    <section className={`section bg-tint-blue ${className}`}>
      <div className="container">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-6)', alignItems: 'stretch' }}>
          
          {/* Our Mission Card */}
          <div style={{ background: '#fff', padding: 'var(--sp-6)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--color-primary)', margin: 0 }}>{data.mission.title}</h3>
            </div>
            <p style={{ color: 'var(--color-text)', lineHeight: 1.6, fontSize: 'var(--fs-md)', margin: 0 }}>
              {data.mission.description}
            </p>
          </div>

          {/* Our Vision Card */}
          <div style={{ background: '#fff', padding: 'var(--sp-6)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E3F2FD', color: '#1976D2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--color-primary)', margin: 0 }}>{data.vision.title}</h3>
            </div>
            <p style={{ color: 'var(--color-text)', lineHeight: 1.6, fontSize: 'var(--fs-md)', margin: 0 }}>
              {data.vision.description}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
