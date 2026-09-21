import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Section, Container, Grid } from '@/components/ui';
import { ServiceCard } from '@/components/common/ServiceCard';

export interface DifferenceFeature {
  title: string;
  description: string;
  variant?: 'blue' | 'purple' | 'green' | string;
}

export interface AgamDifferenceSectionProps {
  data: DifferenceFeature[];
  className?: string;
}

export function AgamDifferenceSection({ data, className = '' }: AgamDifferenceSectionProps) {
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
    <section className={`section ${className}`}>
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">The AGAM Difference</div>
          <h2 className="section-header__title">Why Patients Trust AGAM</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, idx) => (
            <ServiceCard
              key={idx}
              title={item.title}
              description={item.description}
              icon={getIcon(item.variant)}
              href="#"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
