import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { legalData } from '@/data/legal';

import { PageHero } from '@/components/common';
import { LegalDocumentSection } from '@/components/sections/legal';

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.name}`,
  description: "Terms and conditions for using Agam Diagnostics services.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero 
        title={legalData.termsConditions.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Terms & Conditions' }
        ]}
      />
      <LegalDocumentSection data={legalData.termsConditions} />
    </>
  );
}
