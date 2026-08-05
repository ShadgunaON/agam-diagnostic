import React from 'react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Feature Card (Trust Section) — matches approved HTML wireframe index.html lines 391-412.
 * Uses card--service with inline overrides: text-align: center; border: none; background: transparent; box-shadow: none;
 * Icon box: .icon-box = 48×48, radius-md (8px), bg: primary-light, centered with margin: 0 auto sp-4
 * Title: fs-xl, color-dark, mb: sp-3
 * Desc: fs-sm, color-text, line-height: 1.6
 */
export function FeatureCard({ title, description, icon, className = '', style }: FeatureCardProps) {
  return (
    <div className={`card card--service fade-in ${className}`} style={{ textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none', ...style }}>
      {icon && (
        <div className="icon-box" style={{ margin: '0 auto var(--sp-4)' }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--color-dark)', marginBottom: 'var(--sp-3)' }}>{title}</h3>
      <p style={{ color: 'var(--color-text)', fontSize: 'var(--fs-sm)', lineHeight: '1.6' }}>{description}</p>
    </div>
  );
}
