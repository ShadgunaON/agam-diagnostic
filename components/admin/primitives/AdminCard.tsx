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
      className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col ${paddingMap[padding]} ${className}`}
      style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}
      {...props}
    >
      {children}
    </div>
  );
});
AdminCard.displayName = 'AdminCard';
