import React from 'react';
import { BlogPreviewData } from '@/data/home';
import { Typography } from '@/components/ui';
import { Section, Container, Grid } from '@/components/ui';
import { BlogCard } from '@/components/common';

export interface BlogPreviewSectionProps {
  data: BlogPreviewData[];
  className?: string;
}

export function BlogPreviewSection({ data, className = '' }: BlogPreviewSectionProps) {
  return (
    <section className={`section bg-white ${className}`} id="blog">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">Our Latest Research</div>
          <h2 className="section-header__title">Health Insights &amp; Articles</h2>
          <p className="section-header__desc">Stay informed with the latest updates in healthcare and wellness.</p>
        </div>
        <div className="grid grid--4">
          {data.map((blog, idx) => (
            <BlogCard
              key={idx}
              title={blog.title}
              excerpt={blog.excerpt}
              date={blog.date}
              category={blog.category}
              imageUrl={blog.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
