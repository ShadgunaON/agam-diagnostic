import React from 'react';

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const AdminCard = React.forwardRef<HTMLDivElement, AdminCardProps>(({
  children,
  className = '',
  padding = 'md',
  ...props
}, ref) => {
  const paddingMap = {
    'none': 'p-0',
    'sm': 'p-4', // 16px
    'md': 'p-6', // 24px
    'lg': 'p-8', // 32px
  };

  return (
    <div
      ref={ref}
      className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col w-full min-w-0 ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
AdminCard.displayName = 'AdminCard';
