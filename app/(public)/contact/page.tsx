import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { contactData } from '@/data/contact';
import { faqData as fullFaqData } from '@/data/faq';

import { PageHero } from '@/components/common';
import { ContactContentSection } from '@/components/sections/contact';
import { FAQSection } from '@/components/sections/home/FAQSection'; // Reusing from home

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description: contactData.hero.description,
};

export default function ContactPage() {
  // We will reuse the general category from our global FAQ data for the contact page
  const contactFaqs = fullFaqData.categories.find(c => c.id === 'general')?.faqs || [];

  return (
    <>
      <PageHero 
        title={contactData.hero.title}
        description={contactData.hero.description}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact Us' }
        ]}
      />
      <ContactContentSection data={contactData} />
      <section className="py-12 bg-bg-alt border-t border-border">
        <div className="container text-center">
          <p className="text-muted-foreground font-medium mb-4 uppercase tracking-wider text-sm">Trusted by our patients</p>
          <a href="/reviews" className="text-primary font-bold text-lg hover:underline group flex items-center justify-center gap-2">
            Read verified patient experiences
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>
      <FAQSection data={contactFaqs} className="section--alt" />
    </>
  );
}
