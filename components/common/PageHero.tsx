import React from 'react';
import Link from 'next/link';

export interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
}

export function PageHero({ title, description, breadcrumbs }: PageHeroProps) {
  return (
    <section className="page-hero page-hero--inner">
      <div className="container">
        <div className="breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span className="breadcrumb__current">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span className="breadcrumb__sep">›</span>}
            </React.Fragment>
          ))}
        </div>
        <h1 className="page-hero__title">{title}</h1>
        {description && (
          <p className="page-hero__desc" dangerouslySetInnerHTML={{ __html: description }}></p>
        )}
      </div>
    </section>
  );
}
