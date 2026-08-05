import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Reusable Divider primitive.
 * Semantic separation of content.
 */
export function Divider({ className = '', orientation = 'horizontal', ...props }: DividerProps) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <hr
      className={`shrink-0 bg-border ${
        isHorizontal ? 'h-[1px] w-full' : 'h-full w-[1px]'
      } ${className}`}
      {...props}
    />
  );
}
