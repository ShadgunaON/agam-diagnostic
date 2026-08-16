import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui';

export interface BlogHeroSectionProps {
  title: string;
  description: string;
  className?: string;
}

export function BlogHeroSection({ title, description, className = '' }: BlogHeroSectionProps) {
  return (
    <section className={`relative py-10 md:py-16 overflow-hidden bg-bg-alt ${className}`}>
      {/* Premium subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      
      <Container className="relative z-10 flex flex-col items-center text-center">
        <div className="breadcrumb mb-6 text-sm font-medium">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <span className="breadcrumb__sep text-muted-foreground/50 mx-2">›</span>
          <span className="breadcrumb__current text-foreground">Blog</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight max-w-3xl">
          {title}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          {description}
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-md relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search articles, topics, or guides..." 
            className="w-full pl-12 pr-4 py-4 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </Container>
    </section>
  );
}
