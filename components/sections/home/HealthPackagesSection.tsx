import React from 'react';
import Link from 'next/link';

import { PackageData } from '@/data/home';
import { PackageCard } from '@/components/common/PackageCard';

export interface HealthPackagesSectionProps {
  data: PackageData[];
  className?: string;
}

export function HealthPackagesSection({ data, className = '' }: HealthPackagesSectionProps) {
  return (
    <section className={`section bg-tint-blue ${className}`} id="packages">
      <div className="container">
        <div className="section-header-split">
          <div>
            <div className="section-header__overline">Popular Packages</div>
            <h2 className="section-header__title" style={{ lineHeight: 1.2 }}>Comprehensive Health<br />Checkup Plans</h2>
          </div>
          <Link href="/health-packages" className="btn btn--outline">View All Packages</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((pkg, idx) => (
            <PackageCard
              key={idx}
              title={pkg.title}
              category={pkg.category}
              price={pkg.price}
              description={pkg.description}
              features={pkg.features}
              isPopular={pkg.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
