import React from 'react';
import { BlogPreviewData } from '@/data/home';
import { Typography } from '@/components/ui';
import { Section, Container, Grid } from '@/components/ui';
import { BlogCard } from '@/components/common';

export interface BlogPreviewSectionProps {
  data: BlogPreviewData[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  className?: string;
}

export function BlogPreviewSection({ 
  data, 
  eyebrow = "Our Latest Research",
  heading = "Health Insights & Articles",
  description = "Stay informed with the latest updates in healthcare and wellness.",
  className = '' 
}: BlogPreviewSectionProps) {
  return (
    <section className={`section bg-white ${className}`} id="blog">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">{eyebrow}</div>
          <h2 className="section-header__title">{heading}</h2>
          <p className="section-header__desc">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
