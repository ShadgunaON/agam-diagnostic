import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { blogService } from '@/services';
import { 
  BlogHeroSection, 
  BlogFeaturedSection, 
  BlogGridSection, 
  BlogSidebar 
} from '@/components/sections/blog';
import { ErrorState, EmptyState } from '@/components/common';

export const revalidate = 10; // Revalidate every 10 seconds

export const metadata: Metadata = {
  title: `Health Insights & Articles | ${siteConfig.name}`,
  description: 'Expert advice, research updates, and wellness tips from our medical professionals.',
};

export default async function BlogPage() {
  const [heroResult, featuredResult, articlesResult, popularResult] = await Promise.all([
    blogService.getHeroData(),
    blogService.getFeaturedArticle(),
    blogService.getArticles(1, 10),
    blogService.getPopularReads(),
  ]);

  if (articlesResult.isFailure || popularResult.isFailure || heroResult.isFailure) {
    return <ErrorState title="Failed to load blog" description="We couldn't load the articles right now. Please try again later." />;
  }

  const allArticles = articlesResult.value.data;
  const articles = allArticles.filter(a => a.status === 'Published');
  const featuredArticle = featuredResult.isSuccess && featuredResult.value.status === 'Published' ? featuredResult.value : null;

  return (
    <>
      <BlogHeroSection title={heroResult.value.title} description={heroResult.value.description} />
      
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-start">
            <div>
              {featuredArticle && <BlogFeaturedSection article={featuredArticle} />}
              {articles.length > 0 ? (
                <BlogGridSection articles={articles} />
              ) : (
                <EmptyState title="No articles found" description="Check back later for more updates." />
              )}
            </div>
            <BlogSidebar popularReads={popularResult.value} />
          </div>
        </div>
      </section>
    </>
  );
}
