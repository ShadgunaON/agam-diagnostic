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
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-5)', alignItems: 'stretch' }}>
          
          {/* Our Mission Card */}
          <div style={{ background: '#fff', padding: 'var(--sp-4)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 'var(--fs-base)', color: 'var(--color-primary)', margin: 0 }}>{data.mission.title}</h3>
            </div>
            <p style={{ color: 'var(--color-text)', lineHeight: 1.5, fontSize: 'var(--fs-xs)', margin: 0 }}>
              {data.mission.description}
            </p>
          </div>

          {/* Our Vision Card */}
          <div style={{ background: '#fff', padding: 'var(--sp-4)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E3F2FD', color: '#1976D2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 'var(--fs-base)', color: 'var(--color-primary)', margin: 0 }}>{data.vision.title}</h3>
            </div>
            <p style={{ color: 'var(--color-text)', lineHeight: 1.5, fontSize: 'var(--fs-xs)', margin: 0 }}>
              {data.vision.description}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
