import React from 'react';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

/**
 * Reusable Breadcrumb primitive.
 * Renders an accessible navigation trail.
 */
export function Breadcrumb({ className = '', separator = '/', children, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center text-sm text-muted-foreground ${className}`}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {React.Children.map(children, (child, index) => (
          <li className="flex items-center">
            {child}
            {index < React.Children.count(children) - 1 && (
              <span className="mx-2 text-muted-foreground/50">{separator}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
