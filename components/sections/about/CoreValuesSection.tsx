import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Section, Container, Grid } from '@/components/ui';
import { FeatureCard } from '@/components/common';

export interface CoreValuesSectionProps {
  data: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  className?: string;
}

export function CoreValuesSection({ data, className = '' }: CoreValuesSectionProps) {
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
    <Section className={className}>
      <Container>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[2px] mb-3">Our Core Values</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">What Drives Us Every Day</h2>
        </div>
        <Grid gap="6" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {data.map((val, idx) => (
            <FeatureCard 
              key={idx}
              title={val.title}
              description={val.description}
              icon={getIcon(val.icon)}
            />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
