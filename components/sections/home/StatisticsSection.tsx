import React from 'react';
import { StatisticData } from '@/data/home';
import { Container } from '@/components/ui';
import { StatisticCard } from '@/components/common/StatisticCard';

export interface StatisticsSectionProps {
  data: StatisticData[];
  className?: string;
}

export function StatisticsSection({ data, className = '' }: StatisticsSectionProps) {
  return (
    <div className={`stats-banner bg-light-gray ${className}`} style={{ padding: 'var(--sp-6) 0' }}>
      <Container>
        <div className="grid grid--4" style={{ gap: 'var(--sp-4)' }}>
          {data.map((stat, idx) => (
            <StatisticCard 
              key={idx}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
