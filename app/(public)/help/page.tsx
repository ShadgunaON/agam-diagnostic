import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { contactData } from '@/data/contact';
import { faqData } from '@/data/faq';

import { PageHero, FAQItem } from '@/components/common';
import { ContactContentSection } from '@/components/sections/contact';

export const metadata: Metadata = {
  title: `Help & Contact | ${siteConfig.name}`,
  description: 'Get help with your diagnostic bookings, find answers to frequently asked questions, or contact our support team.',
};

export default function HelpPage() {
  return (
    <>
      <PageHero 
        title="Help & Contact"
        description="We're here to assist you. Find answers to common questions or reach out to our team directly."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Help' }
        ]}
      />

      <section className="section pb-0">
        <div className="container">
          <div className="bg-primary/5 rounded-2xl p-8 lg:p-12 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Emergency & Support
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4">Need immediate assistance?</h2>
              <p className="text-lg text-muted-foreground font-medium">
                Our support team is available 24/7. For urgent queries regarding home collections or test reports, please call us directly.
              </p>
            </div>
            <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a href="tel:+18001234567" className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 hover:shadow-primary/40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactContentSection data={contactData} />

      {/* FAQ Section */}
      <section className="section bg-bg-alt border-t border-border" id="faq">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Find quick answers to common queries about our services.</p>
          </div>
          
          {faqData.categories.map((category, catIdx) => (
            <div key={catIdx} className="mb-12 last:mb-0">
              <h3 className="text-xl font-bold text-primary border-b border-border pb-4 mb-6">{category.title}</h3>
              <div className="accordion space-y-4">
                {category.faqs.map((faq, idx) => (
                  <FAQItem
                    key={idx}
                    question={faq.question}
                    answer={faq.answer}
                    defaultOpen={catIdx === 0 && idx === 0}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
