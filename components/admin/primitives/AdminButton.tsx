import React from 'react';

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  isLoading?: boolean;
}

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    // Base classes focusing on typography, layout, and enterprise focus states
    const baseClasses = "inline-flex items-center justify-center font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none shrink-0";
    
    // Semantic variants
    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
      secondary: "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)]",
      ghost: "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100",
      danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm",
    };

    // Semantic sizing (based on evidence collection of 13px baseline)
    const sizes = {
      sm: "h-8 px-3 text-[12px] rounded-md", // Table row actions, dense toolbars
      md: "h-9 px-4 text-[13px] rounded-md", // Standard dialogs, primary drawers
      icon: "h-9 w-9 p-1.5 rounded-full", // Topbar / utility triggers
    };

    const variantClasses = variants[variant];
    const sizeClasses = sizes[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

AdminButton.displayName = 'AdminButton';
