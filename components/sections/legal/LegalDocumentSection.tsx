import React from 'react';
import { Section, Container, Stack } from '@/components/ui';

export interface LegalDocumentSectionProps {
  data: {
    lastUpdated: string;
    content: Array<{
      heading: string;
      body: string;
    }>;
  };
  className?: string;
}

export function LegalDocumentSection({ data, className = '' }: LegalDocumentSectionProps) {
  return (
    <Section className={`bg-white ${className}`}>
      <Container className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-muted-foreground font-semibold">Last Updated: {data.lastUpdated}</p>
        </div>
        
        <Stack gap="12">
          {data.content.map((section, idx: number) => (
            <div key={idx} className="legal-section">
              <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
              <p className="text-foreground leading-relaxed text-lg">{section.body}</p>
            </div>
          ))}
        </Stack>
      </Container>
    </Section>
  );
}
