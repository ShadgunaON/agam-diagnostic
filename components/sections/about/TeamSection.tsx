import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface TeamMember {
  name: string;
  role: string;
  qualification: string;
  image: string;
}

export interface TeamSectionProps {
  data: TeamMember[];
  className?: string;
}

export function TeamSection({ data, className = '' }: TeamSectionProps) {
  return (
    <section className={`section bg-tint-blue ${className}`}>
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">Leadership</div>
          <h2 className="section-header__title">Meet Our Experts</h2>
        </div>

        <div className="grid grid--3 gap-8">
          {data.map((member, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={member.image} 
                alt={member.name} 
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
              />
              <div style={{ padding: 'var(--sp-6)' }}>
                <h3 style={{ color: 'var(--color-primary)', fontSize: 'var(--fs-lg)', marginBottom: '4px' }}>{member.name}</h3>
                <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--fs-sm)', marginBottom: '8px' }}>{member.role}</p>
                <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--fs-sm)' }}>{member.qualification}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
