'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogCategory, PopularRead } from '@/domains/blog/model';

export interface BlogSidebarProps {
  categories: BlogCategory[];
  popularReads: PopularRead[];
  className?: string;
}

export function BlogSidebar({ categories, popularReads, className = '' }: BlogSidebarProps) {
  return (
    <aside className={`space-y-8 sticky top-24 ${className}`}>
      
      {/* Search fallback for mobile/sidebar if needed in future (currently in hero) */}
      
      {/* Categories */}
      <div className="bg-bg-alt p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Categories
        </h3>
        <ul className="space-y-3 m-0 p-0 list-none">
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={`/blog?category=${category.id}`} className="group flex justify-between items-center py-2 px-3 rounded-lg hover:bg-background transition-colors border border-transparent hover:border-border">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">{category.name}</span>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">{category.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Reads */}
      <div className="bg-bg-alt p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Popular Reads
        </h3>
        <div className="space-y-5">
          {popularReads.map((article, idx) => (
            <Link key={idx} href={`/blog/${article.slug}`} className="flex gap-4 items-start group no-underline">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted relative shrink-0 border border-border group-hover:border-primary/50 transition-colors">
                {article.imageUrl ? (
                  <Image 
                    src={article.imageUrl} 
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-primary/10 group-hover:scale-110 transition-transform duration-500">
                    {article.icon}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors text-foreground line-clamp-2">{article.title}</h4>
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {article.date}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Subscription Widget */}
      <div className="relative overflow-hidden bg-primary/5 p-6 rounded-2xl border border-primary/20 text-center">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="w-12 h-12 mx-auto bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <h3 className="text-lg font-bold mb-2 text-foreground">Subscribe to our Newsletter</h3>
        <p className="text-sm text-muted-foreground mb-6">Get the latest health insights and research updates delivered to your inbox.</p>
        <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
          />
          <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            Subscribe Now
          </button>
        </form>
      </div>

    </aside>
  );
}
