import React from 'react';
import { Card } from '@/components/ui';

export interface StatisticCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Reusable composite component for displaying a key statistic.
 */
export function StatisticCard({ value, label, icon, className = '' }: StatisticCardProps) {
  return (
    <div 
      className={`stat-item ${className}`}
      style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        background: '#fff', 
        padding: 'var(--sp-4)', 
        borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {icon && (
        <div style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<{ className?: string, style?: React.CSSProperties }>, {
                style: { width: '24px', height: '24px' }
              })
            : icon}
        </div>
      )}
      <div className="stat-item__value" style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, marginBottom: '2px' }}>
        {value}
      </div>
      <div className="stat-item__label" style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}
