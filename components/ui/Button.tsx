import React, { forwardRef } from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  as?: React.ElementType | string;
  href?: string;
  target?: string;
  rel?: string;
  isLoading?: boolean;
}

/**
 * Reusable Button primitive.
 * Supports standard HTML button attributes, variants, sizes, loading state, and forwardRef.
 * Automatically uses next/link for internal routing when href is provided.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', as, href, isLoading, disabled, children, ...props }, ref) => {
    
    const variantClass = {
      primary: 'btn--primary',
      secondary: 'btn--white',
      outline: 'btn--outline',
      ghost: 'btn--ghost',
      danger: 'btn--accent',
      icon: 'btn--icon'
    }[variant];

    const sizeClass = {
      sm: 'btn--sm',
      md: '',
      lg: 'btn--lg',
      icon: 'btn--icon-size'
    }[size];

    const isExternalLink = href?.startsWith('http') || href?.startsWith('mailto:') || href?.startsWith('tel:');
    const isDisabled = disabled || isLoading;

    // Determine the component to render
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Component: any = 'button';
    if (as) {
      Component = as;
    } else if (href) {
      Component = isExternalLink ? 'a' : Link;
    }

    // For disabled links, we render a button to prevent navigation natively
    if (isDisabled && href && !as) {
      Component = 'button';
    }

    const combinedClass = `btn flex items-center justify-center gap-2 ${variantClass} ${sizeClass} ${isLoading ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''} ${className}`.trim();

    const renderContent = () => (
      <>
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </>
    );

    // If it's a native button or we converted a disabled link to a button
    if (Component === 'button') {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={combinedClass}
          disabled={isDisabled}
          aria-busy={isLoading}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {renderContent()}
        </button>
      );
    }

    // If it's a link (next/link or <a>) or a custom 'as' component
    return (
      <Component
        ref={ref}
        className={combinedClass}
        href={isDisabled && Component !== 'button' ? undefined : href}
        aria-disabled={isDisabled ? true : undefined}
        target={props.target}
        rel={props.rel}
        {...props}
      >
        {renderContent()}
      </Component>
    );
  }
);

Button.displayName = 'Button';
