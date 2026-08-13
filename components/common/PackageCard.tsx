"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

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
  const { addItem } = useCart();
  const router = useRouter();

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = `pkg-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const item = {
      id,
      title,
      price: parseInt(price.replace(/[^0-9]/g, ''), 10) || 999,
      type: 'package' as const,
      category,
      slug: id
    };
    addItem(item);
    router.push('/book');
  };

  return (
    <div className={`card--package fade-in ${className}`}>
      {isPopular && <div className="card--package__badge">Most Popular</div>}
      <div className="card--package__category">{category}</div>
      <h3 className="card--package__title">{title}</h3>
      <p className="card--package__desc">{description}</p>
      <div className="card--package__footer">
        <div className="card--package__price">{price}</div>
        <button type="button" onClick={handleBookNow} className="card--package__btn">Book Now</button>
      </div>
    </div>
  );
}
