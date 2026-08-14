import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogArticle } from '@/domains/blog/model';

export interface BlogFeaturedSectionProps {
  article: BlogArticle;
  className?: string;
}

export function BlogFeaturedSection({ article, className = '' }: BlogFeaturedSectionProps) {
  return (
    <div className={`mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Featured Article</h2>
      </div>
      
      <Link href={`/blog/${article.slug}`} className="group block no-underline">
        <div className="relative rounded-2xl overflow-hidden bg-bg-alt border border-border shadow-sm hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1 flex flex-col md:flex-row">
          
          {/* Image Side */}
          <div className="w-full md:w-1/2 h-48 md:h-56 lg:h-auto relative overflow-hidden bg-muted">
            {article.imageUrl ? (
              <Image 
                src={article.imageUrl} 
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                priority
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-700"
                style={{ background: `linear-gradient(135deg, ${article.colorSecondary}, ${article.colorPrimary})` }}
              >
                {article.icon}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-card">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full uppercase tracking-wider">
                {article.category}
              </span>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {article.date}
              </span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground leading-tight group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 line-clamp-3">
              {article.description}
            </p>
            
            <div className="mt-auto">
              <span className="inline-flex items-center gap-2 font-bold text-primary bg-primary/5 px-4 py-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Read Full Article 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </div>
          
        </div>
      </Link>
    </div>
  );
}
