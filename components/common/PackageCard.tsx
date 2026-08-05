import React from 'react';
import Link from 'next/link';

export interface PackageCardProps {
  title: string;
  price: string;
  description: string;
  features?: string[];
  category?: string;
  isPopular?: boolean;
  className?: string;
}

/**
 * Package Card — matches approved HTML wireframe index.html lines 286-313.
 * Uses .card--package styling from wireframe CSS:
 * - White background (NOT gradient)
 * - border: 1px solid var(--border-glass-dark) = rgba(255,255,255,0.1)
 * - radius: var(--radius-xl) = 24px
 * - shadow: inset ring + shadow-sm
 * - Hover: inset ring + shadow-premium, translateY(-4px) scale(1.01)
 * - ::before: navy radial gradient (NOT emerald)
 *
 * NO emerald-green theming. NO wellness gradients.
 */
export function PackageCard({ title, price, description, category = 'Preventive Health', isPopular, className = '' }: PackageCardProps) {
  return (
    <div className={`card--package fade-in ${className}`}>
      {isPopular && <div className="card--package__badge">Most Popular</div>}
      <div className="card--package__category">{category}</div>
      <h3 className="card--package__title">{title}</h3>
      <p className="card--package__desc">{description}</p>
      <div className="card--package__footer">
        <div className="card--package__price">{price}</div>
        <Link href="/book" className="card--package__btn">Book Now</Link>
      </div>
    </div>
  );
}
