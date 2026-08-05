import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { legalData } from '@/data/legal';

import { PageHero } from '@/components/common';
import { LegalDocumentSection } from '@/components/sections/legal';

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: "Privacy Policy and data practices for Agam Diagnostics.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero 
        title={legalData.privacyPolicy.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy' }
        ]}
      />
      <LegalDocumentSection data={legalData.privacyPolicy} />
    </>
  );
}
