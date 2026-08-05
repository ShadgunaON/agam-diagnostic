import React from 'react';
import { Container, Grid } from '@/components/ui';
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
  // Mapping string icons from data to standard SVG components for simplicity.
  const getIcon = (name: string) => {
    const iconStyle = { width: '24px', height: '24px' };
    switch (name) {
      case 'shield': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'clock': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>;
      case 'home': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
      case 'phone': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
      default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}><circle cx="12" cy="12" r="10"/></svg>;
    }
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
