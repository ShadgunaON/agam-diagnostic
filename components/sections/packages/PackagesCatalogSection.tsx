import React from 'react';
import Link from 'next/link';
import { Section, Container, Grid } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { PackageItem } from '@/domains/packages/model';

export interface PackagesCatalogSectionProps {
  data: PackageItem[];
  className?: string;
}

export function PackagesCatalogSection({ data, className = '' }: PackagesCatalogSectionProps) {
  return (
    <Section id="browse-category" className={className}>
      <Container>
        <div className="section-header section-header--center mb-12">
          <h2 className="section-header__title text-3xl font-bold">Comprehensive Health Packages</h2>
        </div>
        
        <Grid gap="6" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data.map((pkg, idx) => (
            <Link key={idx} href={`/health-packages/${pkg.slug}`} className="card block no-underline border border-border p-6 rounded-xl hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <span className="badge badge--primary bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">{pkg.category}</span>
                <span className="text-2xl">{pkg.icon === 'heart' ? '❤️' : pkg.icon === 'female' ? '👩' : '🩸'}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{pkg.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">{pkg.description}</p>
              <div className="flex justify-between items-end border-t border-border pt-4 mt-auto">
                <div className="text-primary font-bold text-lg">
                  <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 leading-none">Price</span>
                  ₹{pkg.price}
                </div>
                <Button as="span" className="btn btn--outline btn--sm">
View Details
</Button>
              </div>
            </Link>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
