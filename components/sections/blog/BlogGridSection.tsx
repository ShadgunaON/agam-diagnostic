import React from 'react';
import Link from 'next/link';
import { BlogArticle } from '@/domains/blog/model';
import { Grid } from '@/components/ui';

export interface BlogGridSectionProps {
  articles: BlogArticle[];
  className?: string;
}

export function BlogGridSection({ articles, className = '' }: BlogGridSectionProps) {
  return (
    <div className={`mb-12 ${className}`}>
      <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
      <Grid gap="6" className="grid-cols-1 sm:grid-cols-2">
        {articles.map((article, idx) => (
          <Link key={idx} href={`/blog/${article.slug}`} className="card card--blog fade-in block no-underline border border-border p-5 rounded-xl hover:shadow-md transition flex flex-col h-full">
            <div 
              className="card__image rounded-lg mb-4 flex items-center justify-center text-5xl h-[200px]"
              style={{ background: `linear-gradient(135deg, ${article.colorSecondary}, ${article.colorPrimary})` }}
            >
              {article.icon}
            </div>
            <div className="card__body flex flex-col flex-grow">
              <span className="card__date text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                {article.category}
              </span>
              <h3 className="card__title text-xl font-bold mb-2 text-foreground">
                {article.title}
              </h3>
              <p className="card__desc text-sm text-muted-foreground mb-4 flex-grow">
                {article.description}
              </p>
              <span className="card__link font-bold text-sm text-primary flex items-center gap-1 group mt-auto">
                Read More <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </span>
            </div>
          </Link>
        ))}
      </Grid>
    </div>
  );
}
