import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { reportsService } from '@/services';
import { ReportsHeroSection, ReportsEmptyStateSection } from '@/components/sections/reports';
import { ErrorState, AuthGuard } from '@/components/common';

export const metadata: Metadata = {
  title: `My Reports | ${siteConfig.name}`,
  description: 'View and download your diagnostic reports securely.',
};

export default async function ReportsPage() {
  const result = await reportsService.getById('default');

  if (result.isFailure) {
    return <ErrorState title="Reports unavailable" description="The reports system is currently unavailable. Please try again later." />;
  }

  const reportsData = result.value;

  return (
    <AuthGuard>
      <ReportsHeroSection title={reportsData.hero.title} description={reportsData.hero.description} />
      <ReportsEmptyStateSection 
        title={reportsData.emptyState.title}
        description={reportsData.emptyState.description}
        icon={reportsData.emptyState.icon}
        actionLabel={reportsData.emptyState.actionLabel}
        actionUrl={reportsData.emptyState.actionUrl}
      />
    </AuthGuard>
  );
}
