import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogArticle } from '@/domains/blog/model';
import { Grid } from '@/components/ui';

export interface BlogGridSectionProps {
  articles: BlogArticle[];
  className?: string;
}

export function BlogGridSection({ articles, className = '' }: BlogGridSectionProps) {
  return (
    <div className={`mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
      </div>
      <Grid gap="6" className="grid-cols-1 sm:grid-cols-2">
        {articles.map((article, idx) => (
          <Link key={idx} href={`/blog/${article.slug}`} className="group block no-underline h-full">
            <div className="bg-bg-alt border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1 flex flex-col h-full">
              <div className="relative h-[160px] md:h-[180px] w-full overflow-hidden bg-muted">
                {article.imageUrl ? (
                  <Image 
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-700"
                    style={{ background: `linear-gradient(135deg, ${article.colorSecondary}, ${article.colorPrimary})` }}
                  >
                    {article.icon}
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-bold text-foreground bg-background/90 backdrop-blur-sm rounded-full shadow-sm">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow bg-card">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-3">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {article.date}
                </span>
                
                <h3 className="text-xl font-bold mb-3 text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-3">
                  {article.description}
                </p>
                
                <div className="mt-auto flex items-center text-sm font-semibold text-primary group">
                  Read More 
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </Grid>
    </div>
  );
}
