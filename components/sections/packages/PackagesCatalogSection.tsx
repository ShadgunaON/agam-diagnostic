import React from 'react';
import Link from 'next/link';
import { Section, Container } from '@/components/ui';
import { PackageItem } from '@/domains/packages/model';
import { Carousel } from '@/components/ui/Carousel';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useCart } from '@/context/CartContext';

export interface PackagesCatalogSectionProps {
  data: PackageItem[];
  className?: string;
}

export function PackagesCatalogSection({ data, className = '' }: PackagesCatalogSectionProps) {
  const { addItem } = useCart();

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 999;
    const cleaned = priceStr.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 999;
  };

  return (
    <Section id="browse-category" className={className}>
      <Container>
        <div className="section-header section-header--center mb-12">
          <h2 className="section-header__title text-3xl font-bold">Comprehensive Health Packages</h2>
        </div>
        
        <Carousel>
          {data.map((pkg, idx) => {
            const numPrice = parsePrice(pkg.price);
            
            return (
              <PremiumCard
                key={idx}
                title={pkg.title}
                category={pkg.category}
                price={numPrice}
                originalPrice={Math.round(numPrice * 1.25)}
                discountLabel="20% Off"
                slug={pkg.slug}
                type="package"
                features={[
                  { 
                    text: 'Turnaround Time', 
                    subtext: 'Within 24 hours',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  },
                  { 
                    text: 'Includes', 
                    subtext: `${Math.floor(Math.random() * 20) + 10} Tests`,
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  }
                ]}
                onAddToCart={() => {
                  addItem({
                    id: `package-${pkg.slug}`,
                    slug: pkg.slug,
                    title: pkg.title,
                    type: 'package',
                    category: pkg.category,
                    price: numPrice,
                    originalPrice: Math.round(numPrice * 1.25),
                  });
                }}
              />
            );
          })}
        </Carousel>
      </Container>
    </Section>
  );
}
