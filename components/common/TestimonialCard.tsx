import React from 'react';

export interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorImageUrl?: string;
  className?: string;
}

/**
 * Testimonial / Review Card — matches approved HTML wireframe index.html lines 327-377.
 * Structure: Author info at TOP (avatar + name + role + stars), review text BELOW.
 * Review text is truncated to 80px with fade gradient, expands on hover.
 * Uses .review-card styling from wireframe CSS.
 *
 * NO decorative quotation mark. NO border-t footer separator.
 */
export function TestimonialCard({ quote, authorName, authorRole, authorImageUrl, className = '' }: TestimonialCardProps) {
  const avatarUrl = authorImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0B1B3D&color=fff`;

  return (
    <div className={`review-card fade-in ${className}`}>
      <div className="testimonial__author" style={{ marginBottom: 'var(--sp-4)' }}>
        <img loading="lazy" src={avatarUrl} alt={authorName} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="testimonial__name" style={{ fontWeight: 600 }}>{authorName}</div>
          {authorRole && <div className="testimonial__role" style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-light)' }}>{authorRole}</div>}
          <div className="testimonial__stars" style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" fill="var(--color-warning)" stroke="none" width="12" height="12">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <div className="review-card__text" style={{ 
        display: '-webkit-box', 
        WebkitLineClamp: 6, 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis' 
      }}>
        &quot;{quote}&quot;
      </div>
    </div>
  );
}
