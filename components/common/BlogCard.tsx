import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui';

export interface BlogCardProps {
  title: string;
  excerpt?: string; // Kept in type for compatibility if needed
  date?: string;
  category: string;
  imageUrl?: string;
  authorName?: string;
  className?: string;
}

/**
 * Reusable composite component for displaying a blog post summary.
 */
export function BlogCard({ title, category, imageUrl, className = '' }: BlogCardProps) {
  let emoji = '📝';
  let gradient = 'linear-gradient(135deg, #E8F4FD, #D4E8FF)';

  switch (category) {
    case 'Health & Wellness':
      emoji = '🏃';
      gradient = 'linear-gradient(135deg, #E8F4FD, #D4E8FF)';
      break;
    case 'Diagnostics':
      emoji = '🔬';
      gradient = 'linear-gradient(135deg, #FFF3E0, #FFE0B2)';
      break;
    case 'Patient Education':
      emoji = '📊';
      gradient = 'linear-gradient(135deg, #E8F5E9, #C8E6C9)';
      break;
    case 'Preventive Care':
      emoji = '🩺';
      gradient = 'linear-gradient(135deg, #F3E5F5, #E1BEE7)';
      break;
  }

  return (
    <Link href={`/blog/${title.toLowerCase().replace(/\s+/g, '-')}`} className={`card card--blog fade-in ${className}`}>
      {imageUrl ? (
        <div className="card__image">
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="card__image" style={{ background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
          {emoji}
        </div>
      )}
      <div className="card__body">
        <span className="card__date">{category}</span>
        <h3 className="card__title">{title}</h3>
        <span className="card__link">Read More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </div>
    </Link>
  );
}
