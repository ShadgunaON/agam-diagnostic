import React from 'react';
import Link from 'next/link';
import { BlogCategory, PopularRead } from '@/domains/blog/model';

export interface BlogSidebarProps {
  categories: BlogCategory[];
  popularReads: PopularRead[];
  className?: string;
}

export function BlogSidebar({ categories, popularReads, className = '' }: BlogSidebarProps) {
  return (
    <aside className={`space-y-6 sticky top-24 ${className}`}>
      <div className="bg-bg-alt p-6 rounded-xl border border-border">
        <h3 className="text-xl font-bold mb-4">Categories</h3>
        <ul className="space-y-2 m-0 p-0 list-none">
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={`/blog?category=${category.id}`} className="flex justify-between items-center py-2 border-b border-border last:border-0 hover:text-primary transition-colors">
                <span className="font-medium text-foreground">{category.name}</span>
                <span className="text-muted-foreground text-sm">({category.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-bg-alt p-6 rounded-xl border border-border">
        <h3 className="text-xl font-bold mb-4">Popular Reads</h3>
        <div className="space-y-4">
          {popularReads.map((article, idx) => (
            <Link key={idx} href={`/blog/${article.slug}`} className="flex gap-3 items-start group no-underline">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0 border border-border group-hover:border-primary transition-colors">
                {article.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors text-foreground">{article.title}</h4>
                <span className="text-xs text-muted-foreground">{article.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
