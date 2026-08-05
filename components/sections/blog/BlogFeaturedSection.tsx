import React from 'react';
import Link from 'next/link';
import { BlogArticle } from '@/domains/blog/model';

export interface BlogFeaturedSectionProps {
  article: BlogArticle;
  className?: string;
}

export function BlogFeaturedSection({ article, className = '' }: BlogFeaturedSectionProps) {
  return (
    <div className={`mb-10 ${className}`}>
      <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
      <Link href={`/blog/${article.slug}`} className="card card--blog fade-in block no-underline border border-border p-6 rounded-xl hover:shadow-md transition">
        <div 
          className="card__image rounded-lg mb-6 flex items-center justify-center text-6xl h-[300px]"
          style={{ background: `linear-gradient(135deg, ${article.colorSecondary}, ${article.colorPrimary})` }}
        >
          {article.icon}
        </div>
        <div className="card__body">
          <span className="card__date text-sm font-semibold text-primary uppercase tracking-wider mb-3 block">
            {article.category} • {article.date}
          </span>
          <h3 className="card__title text-3xl font-bold mb-4 text-foreground leading-tight">
            {article.title}
          </h3>
          <p className="card__desc text-lg text-muted-foreground mb-6">
            {article.description}
          </p>
          <span className="card__link font-bold text-primary flex items-center gap-2 group">
            Read Full Article <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </span>
        </div>
      </Link>
    </div>
  );
}
