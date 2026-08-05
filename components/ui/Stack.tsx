import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  gap?: '0' | '1' | '2' | '3' | '4' | '6' | '8' | '12' | '16' | '24';
}

const gapMap = {
  '0': 'gap-0',
  '1': 'gap-1', // 4px
  '2': 'gap-2', // 8px
  '3': 'gap-3', // 12px
  '4': 'gap-4', // 16px
  '6': 'gap-6', // 24px
  '8': 'gap-8', // 32px
  '12': 'gap-12', // 48px
  '16': 'gap-16', // 64px
  '24': 'gap-24', // 96px
};

/**
 * Reusable layout Stack primitive.
 * Enforces vertical or horizontal spacing via the canonical spacing scale.
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className = '', as: Component = 'div', gap = '4', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(`flex flex-col ${gapMap[gap]}`, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Stack.displayName = 'Stack';
