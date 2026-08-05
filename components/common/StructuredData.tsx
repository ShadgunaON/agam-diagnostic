import React from 'react';
import { siteConfig } from '@/config/site';

export interface StructuredDataProps {
  type: 'Organization' | 'MedicalOrganization' | 'BreadcrumbList' | 'Article';
  data: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Helpers for common schemas
export function generateOrganizationSchema() {
  return {
    name: siteConfig.name,
    url: siteConfig.url,
    logo: siteConfig.ogImage,
    sameAs: [siteConfig.links.facebook, siteConfig.links.twitter],
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateArticleSchema(article: { title: string; description: string; date: string; url: string }) {
  return {
    headline: article.title,
    description: article.description,
    datePublished: new Date(article.date).toISOString(),
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.ogImage,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}${article.url}`,
    },
  };
}
