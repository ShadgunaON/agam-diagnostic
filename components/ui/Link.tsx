import React, { forwardRef } from 'react';
import NextLink from 'next/link';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/**
 * Reusable Link primitive.
 * Wraps Next.js Link with standard focus states and styling.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className = '', href, children, ...props }, ref) => {
    return (
      <NextLink
        href={href}
        ref={ref}
        className={`font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${className}`}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = 'Link';
