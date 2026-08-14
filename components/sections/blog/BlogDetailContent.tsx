import React from 'react';
import Link from 'next/link';
import { BlogArticle } from '@/domains/blog/model';
export interface BlogDetailContentProps {
  article: BlogArticle;
  relatedArticles?: BlogArticle[];
  className?: string;
}

export function BlogDetailContent({ article, relatedArticles = [], className = '' }: BlogDetailContentProps) {
  return (
    <div className={`detail-content ${className}`}>
      <span className="badge badge--tag mb-4 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">{article.category}</span>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
      <p className="text-lg text-muted-foreground mb-6">{article.description}</p>
      
      <div 
        className="rounded-xl h-[160px] md:h-[200px] flex items-center justify-center text-[60px] mb-8"
        style={{ background: `linear-gradient(135deg, ${article.colorSecondary}, ${article.colorPrimary})` }}
      >
        {article.icon}
      </div>
      
      {article.content ? (
        <div 
          className="prose prose-lg max-w-none text-foreground leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
      ) : (
        <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
          <p>This article does not have any content yet.</p>
        </div>
      )}
      
      <div className="mt-10 pt-6 border-t border-border">
        <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {relatedArticles.slice(0, 1).map((related, idx) => (
            <Link key={idx} href={`/blog/${related.slug}`} className="card card--blog fade-in block no-underline border border-border p-5 rounded-xl hover:shadow-md transition">
              <div className="card__body">
                <span className="card__date text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">{related.category}</span>
                <h3 className="card__title text-lg font-bold mb-2 text-foreground leading-snug">{related.title}</h3>
                <p className="card__desc text-sm text-muted-foreground m-0">{related.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
