import { Metadata } from 'next';
import { siteConfig } from './site';

interface BuildMetadataParams {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = '',
  image = siteConfig.ogImage,
  noIndex = false,
}: BuildMetadataParams = {}): Metadata {
  const finalTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const url = `${siteConfig.url}${path}`;

  return {
    title: finalTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: finalTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}
