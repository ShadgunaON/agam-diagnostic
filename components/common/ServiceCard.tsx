import React from 'react';
import Link from 'next/link';

export interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  href?: string;
  className?: string;
  delay?: number;
}

/**
 * Service Card — matches approved HTML wireframe index.html lines 236-266.
 * Uses .card--service styling from wireframe CSS:
 * - border: 1px solid var(--border-glass-dark) = rgba(255,255,255,0.1)
 * - border-radius: var(--radius-lg) = 20px
 * - padding: var(--sp-5) = 24px
 * - shadow: inset ring + shadow-sm
 * - ::before: FULL-CARD radial gradient (red-tinted) that fades in on hover (NOT a top bar)
 * - Hover: shadow-premium, translateY(-4px) scale(1.01)
 * - Icon: 48×48, radius-md (8px), bg: primary-light (#F0F4FA), hover: bg-primary text-white
 * - Title: ALWAYS text-primary (not just on hover)
 */
export function ServiceCard({ title, description, icon, href = '/services', className = '', delay = 1 }: ServiceCardProps) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={`card card--service fade-in ${className}`}
    >
      {icon && (
        <div className="icon-box">
          {icon}
        </div>
      )}
      <h3 className="card__title">{title}</h3>
      <p className="card__desc">{description}</p>
    </Link>
  );
}
