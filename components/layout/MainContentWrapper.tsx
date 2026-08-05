import React from 'react';

export interface MainContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function MainContentWrapper({ 
  children, 
  className = '',
  as: Component = 'main'
}: MainContentWrapperProps) {
  return (
    <Component id="main-content" className={`flex-1 w-full flex flex-col ${className}`}>
      {children}
    </Component>
  );
}
