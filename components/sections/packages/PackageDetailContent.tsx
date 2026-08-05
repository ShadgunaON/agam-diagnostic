import React from 'react';
import Link from 'next/link';
import { PackageDetailData } from '@/domains/packages/model';

export interface PackageDetailContentProps {
  data: PackageDetailData;
  className?: string;
}

export function PackageDetailContent({ data, className = '' }: PackageDetailContentProps) {
  return (
    <div className={`detail-content ${className}`.trim()}>
      <span className="badge badge--primary" style={{ marginBottom: 'var(--sp-4)' }}>{data.category}</span>
      <h1 style={{ fontSize: 'var(--fs-3xl)', marginBottom: 'var(--sp-4)' }}>{data.title}</h1>
      <p style={{ fontSize: 'var(--fs-md)', color: 'var(--color-text-light)', marginBottom: 'var(--sp-6)' }}>{data.description}</p>
      
      <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', marginBottom: 'var(--sp-6)' }}>
        {data.icon}
      </div>
      
      <h2>What&apos;s Included</h2>
      <ul>
        {data.includes.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      
      <h2>Who Should Get This Test?</h2>
      <p>{data.whoShouldGet}</p>
      
      <h2>Preparation Required</h2>
      <p>{data.preparation}</p>
      
      <h3>Related Packages</h3>
      <div className="grid grid--2" style={{ marginTop: 'var(--sp-4)' }}>
        {data.relatedPackages.map((pkg, idx) => (
          <Link key={idx} href={`/health-packages/${pkg.slug}`} className="card fade-in">
            <div className="card__body">
              <span className="card__tag">{pkg.category}</span>
              <h3 className="card__title" style={{ fontSize: 'var(--fs-base)' }}>{pkg.title}</h3>
              <p className="card__desc">{pkg.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
