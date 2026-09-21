import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ContactForm } from '@/components/forms';

export interface ContactContentSectionProps {
  data: {
    infoCards: Array<{
      title: string;
      details: string[];
      icon: string;
      variant: string;
    }>;
    location: {
      name: string;
      address: string;
      mapUrl: string;
    };
  };
  className?: string;
}

export function ContactContentSection({ data, className = '' }: ContactContentSectionProps) {
    const getIcon = (iconNameStr?: string) => {
    if (!iconNameStr) return <LucideIcons.CheckCircle className="w-6 h-6" />;
    
    const legacyMap: Record<string, string> = {
      'award': 'Award', 'clock': 'Clock', 'home': 'Home', 'phone': 'Phone',
      'target': 'Target', 'shield': 'Shield', 'calendar': 'Calendar', 'activity': 'Activity',
      'checkup': 'Activity', 'dna': 'Dna', 'genetics': 'Dna', 'microscope': 'Microscope',
      'molecular': 'Microscope', 'rt-pcr': 'TestTube', 'pcr': 'TestTube', 'flask': 'FlaskConical',
      'beaker': 'Beaker', 'heart': 'Heart', 'brain': 'Brain', 'bone': 'Bone', 'lungs': 'Wind',
      'liver': 'Activity', 'kidney': 'Activity', 'stomach': 'Activity', 'blood': 'Droplet',
      'primary': 'Star', 'secondary': 'CheckCircle', 'accent': 'Award', 'blue': 'Shield',
      'phone-call': 'PhoneCall', 'mail': 'Mail', 'map-pin': 'MapPin'
    };
    
    const mappedName = legacyMap[iconNameStr] || iconNameStr;
    const toPascalCase = (str: string) => str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    
    const IconComponent = (LucideIcons as any)[toPascalCase(mappedName)] || LucideIcons.CheckCircle;
    return <IconComponent className="w-6 h-6" strokeWidth={2} />;
  };

  return (
    <section className={`section ${className}`.trim()}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-10)' }}>
          
          <div>
            <h2 style={{ marginBottom: 'var(--sp-6)' }}>Send us a message</h2>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: 'var(--sp-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
              <ContactForm />
            </div>
          </div>

          <div>
            <h2 style={{ marginBottom: 'var(--sp-6)' }}>Visit Our Laboratory</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ marginBottom: 'var(--sp-6)', gap: 'var(--sp-4)' }}>
              {data.infoCards.map((card, idx: number) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: card.variant === 'dark' ? 'var(--color-primary)' : '#fff', 
                    border: `1px solid ${card.variant === 'dark' ? 'var(--color-primary-dark)' : 'var(--color-border)'}`, 
                    padding: 'var(--sp-5)', 
                    borderRadius: 'var(--radius-lg)', 
                    color: card.variant === 'dark' ? '#fff' : 'inherit',
                    boxShadow: card.variant === 'dark' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', color: card.variant === 'dark' ? 'inherit' : 'var(--color-primary)', fontWeight: 'var(--fw-bold)' }}>
                    <div style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                      {getIcon(card.icon)}
                    </div>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: card.variant === 'dark' ? 'inherit' : 'var(--color-text)', opacity: card.variant === 'dark' ? 0.95 : 1, lineHeight: 1.6 }}>
                    {card.details.map((line: string, i: number) => (
                      <div key={i} style={i === 0 ? { marginBottom: '4px', ...(card.variant === 'dark' ? { fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)' } : {}) } : {}}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="location-card" style={{ marginBottom: 'var(--sp-5)' }}>
              <div className="location-card__name">{data.location.name}</div>
              <div className="location-card__info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{data.location.address}</span>
              </div>
            </div>

            <div style={{ height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <iframe 
                src={data.location.mapUrl}
                allowFullScreen 
                loading="lazy" 
                title="Lab Location"
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
