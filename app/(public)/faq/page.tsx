import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { faqData } from '@/data/faq';

import { PageHero, FAQItem } from '@/components/common';


export const metadata: Metadata = {
  title: `FAQ | ${siteConfig.name}`,
  description: faqData.hero.description,
};

export default function FAQPage() {
  return (
    <>
      <PageHero 
        title={faqData.hero.title}
        description={faqData.hero.description}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'FAQ' }
        ]}
      />
      
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          {faqData.categories.map((category, catIdx) => (
            <div key={catIdx} style={{ marginBottom: 'var(--sp-12)' }}>
              <h2 style={{ fontSize: 'var(--fs-xl)', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>{category.title}</h2>
              <div className="accordion">
                {category.faqs.map((faq, idx) => (
                  <FAQItem
                    key={idx}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={catIdx === 0 && idx === 0}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="cta-banner cta-banner--premium">
            <h3>Still have questions?</h3>
            <p>Our support team is available 24/7 to help you.</p>
            <a href="/contact" className="btn btn--white">Contact Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
