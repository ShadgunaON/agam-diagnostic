import React from 'react';
import { Container, Grid } from '@/components/ui';
import * as LucideIcons from 'lucide-react';
export interface TrustBarSectionProps {
  data: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  className?: string;
  style?: React.CSSProperties;
}

export function TrustBarSection({ data, className = '', style }: TrustBarSectionProps) {
  const getIcon = (name: string) => {
    // Handle legacy lowercase names from fallback data
    const iconMap: Record<string, string> = {
      shield: 'ShieldCheck',
      clock: 'Clock',
      home: 'Home',
      phone: 'Phone',
    };
    
    const iconName = iconMap[name] || name || 'CheckCircle2';
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle2;
    
    return <IconComponent className="w-6 h-6" strokeWidth={2} />;
  };

  return (
    <div className={`trust-bar trust-bar--premium ${className}`.trim()} style={style}>
      <Container>
        <div className="trust-bar__inner">
          {data.map((feature, idx) => (
            <div key={idx} className="trust-item trust-item--premium">
              <div className="trust-item__icon">
                {getIcon(feature.icon)}
              </div>
              <div>
                <span className="trust-item__text">{feature.title}</span>
                <span className="trust-item__sub">{feature.description}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
