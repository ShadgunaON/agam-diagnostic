import React from 'react';

export interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: React.ElementType;
  ariaLabelledBy?: string;
}

export function SectionWrapper({ 
  children, 
  className = '', 
  id,
  as: Component = 'section',
  ariaLabelledBy
}: SectionWrapperProps) {
  return (
    <Component 
      id={id} 
      className={`py-12 md:py-16 lg:py-24 ${className}`}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Component>
  );
}
