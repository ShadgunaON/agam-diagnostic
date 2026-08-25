'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogCategory, PopularRead } from '@/domains/blog/model';

export interface BlogSidebarProps {
  popularReads: PopularRead[];
  className?: string;
}

export function BlogSidebar({ popularReads, className = '' }: BlogSidebarProps) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    const { blogService } = await import('@/services');
    const result = await blogService.subscribeToNewsletter(email);
    
    if (result.isSuccess) {
      setStatus('success');
      setMessage(result.value.message || 'Subscribed successfully!');
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.error.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <aside className={`space-y-8 sticky top-24 ${className}`}>

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
        
        {status === 'success' ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-sm font-medium">
            {message}
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address" 
              required
              disabled={status === 'loading'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm disabled:opacity-70"
            />
            {status === 'error' && (
              <div className="text-red-500 text-xs text-left font-medium">{message}</div>
            )}
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Subscribing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </form>
        )}
      </div>

    </aside>
  );
}
