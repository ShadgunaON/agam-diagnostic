'use client';

import React, { useState } from 'react';
import { FAQData } from '@/data/home';
import { FAQItem } from '@/components/common';
import { Section, Container } from '@/components/ui';

export interface FAQSectionProps {
  data: FAQData[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  className?: string;
}

/**
 * FAQ Section — matches approved HTML wireframe index.html lines 514-551.
 * Container max-width: 800px. Accordion items are separate rounded cards with gap.
 */
export function FAQSection({ 
  data, 
  eyebrow = "Have Questions?",
  heading = "Frequently Asked Questions",
  description = "Find answers to common questions about our services and booking process.",
  className = '' 
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section className={`section ${className || 'bg-white'}`.trim()} id="faq">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header section-header--center">
          <div className="section-header__overline">{eyebrow}</div>
          <h2 className="section-header__title">{heading}</h2>
          {description && <p className="section-header__desc">{description}</p>}
        </div>
        
        <div className="accordion">
          {data.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onToggle={() => toggleFAQ(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
