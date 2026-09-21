import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface PackagesAdvantageSectionProps {
  data?: {
    title?: string;
    description?: string;
    eyebrow?: string;
    items?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
}

export function PackagesAdvantageSection({ data }: PackagesAdvantageSectionProps) {
  const getIcon = (iconName: string) => {
    if (!iconName) return <LucideIcons.CheckCircle className="w-6 h-6" />;
    
    // Map legacy hardcoded names to Lucide PascalCase
    const legacyMap: Record<string, string> = {
      'award': 'Award',
      'clock': 'Clock',
      'home': 'Home',
      'phone': 'Phone',
      'target': 'Target',
      'shield': 'Shield',
      'calendar': 'Calendar',
      'activity': 'Activity'
    };
    
    const mappedName = legacyMap[iconName] || iconName;
    const toPascalCase = (str: string) => str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    
    const IconComponent = (LucideIcons as any)[toPascalCase(mappedName)] || LucideIcons.CheckCircle;
    return <IconComponent className="w-6 h-6" strokeWidth={2} />;
  };

  const defaultItems = [
    { title: "NABL Accredited", description: "Every test is processed in our NABL-certified laboratory, ensuring the highest accuracy and international quality standards.", icon: "award" },
    { title: "Fastest Reports", description: "Get your detailed test reports delivered securely to your WhatsApp and email within 12 hours for most parameters.", icon: "clock" },
    { title: "Free Home Collection", description: "Book a test from the comfort of your home. Our expert phlebotomists will collect samples across Madurai for free.", icon: "home" },
    { title: "24/7 Expert Support", description: "Have a question about your reports? Our support team and doctors are always available to guide you.", icon: "phone" }
  ];

  const itemsToRender = data?.items && data.items.length > 0 ? data.items : defaultItems;
  return (
    <section className="section">
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          {data?.eyebrow && (
            <div className="section-header__overline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {data.eyebrow}
            </div>
          )}
          {data?.title ? (
            <h2 className="section-header__title">{data.title}</h2>
          ) : (
            <h2 className="section-header__title">Why Choose AGAM Packages</h2>
          )}
          {data?.description ? (
            <p className="section-header__desc">{data.description}</p>
          ) : (
            <p className="section-header__desc">Every package at AGAM Diagnostics is designed with clinical precision, affordable pricing, and patient convenience at its core.</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal">
          {itemsToRender.map((item, idx) => (
            <div key={idx} className="award-card award-card--premium">
              <div className="award-card__icon">
                {getIcon(item.icon)}
              </div>
              <div className="award-card__title">{item.title}</div>
              <div className="award-card__desc">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
