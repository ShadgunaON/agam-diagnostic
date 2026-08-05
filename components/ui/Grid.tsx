import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  gap?: '4' | '6' | '8' | '12';
}

const gapMap = {
  '4': 'gap-4', // 16px (sp-4)
  '6': 'gap-8', // 32px (sp-6 = 2rem = 32px)
  '8': 'gap-8', // 32px
  '12': 'gap-12', // 48px (sp-8 = 3rem = 48px)
};

/**
 * Reusable layout Grid primitive.
 * Enforces canonical grid gaps. Consumers must pass grid-cols configuration via className.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className = '', as: Component = 'div', gap = '6', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(`grid ${gapMap[gap]}`, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Grid.displayName = 'Grid';
