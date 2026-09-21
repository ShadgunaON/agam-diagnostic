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
