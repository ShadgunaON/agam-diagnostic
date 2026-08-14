import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogService } from '@/services';
import { BlogDetailContent, BlogSidebar } from '@/components/sections/blog';
import { buildMetadata } from '@/config/metadata';
import { StructuredData, generateArticleSchema, generateBreadcrumbSchema } from '@/components/common/StructuredData';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await blogService.getArticles(1, 100);
  if (result.isFailure) return [];
  return result.value.data.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await blogService.getArticleBySlug(slug);
  if (result.isFailure) return buildMetadata({ title: 'Article Not Found', noIndex: true });

  const article = result.value;
  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/blog/${article.slug}`,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  
  const [articleResult, categoriesResult, popularResult, allArticlesResult] = await Promise.all([
    blogService.getArticleBySlug(slug),
    blogService.getCategories(),
    blogService.getPopularReads(),
    blogService.getArticles(1, 10)
  ]);

  if (articleResult.isFailure) {
    notFound();
  }

  const article = articleResult.value;
  const categories = categoriesResult.isSuccess ? categoriesResult.value : [];
  const popularReads = popularResult.isSuccess ? popularResult.value : [];
  const relatedArticles = allArticlesResult.isSuccess ? allArticlesResult.value.data.filter(a => a.slug !== slug).slice(0, 2) : [];

  return (
    <>
      <section className="section pb-0">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb__sep">›</span>
            <Link href="/blog">Blog</Link>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__current">{article.category}</span>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__current">{article.title}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
            <BlogDetailContent article={article} relatedArticles={relatedArticles} />
            <BlogSidebar categories={categories} popularReads={popularReads} />
          </div>
        </div>
      </section>

      <StructuredData 
        type="Article" 
        data={generateArticleSchema({
          title: article.title,
          description: article.description,
          date: article.date,
          url: `/blog/${article.slug}`
        })} 
      />
      <StructuredData 
        type="BreadcrumbList" 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: article.title, url: `/blog/${article.slug}` }
        ])} 
      />
    </>
  );
}
