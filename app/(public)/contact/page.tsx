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
      <FAQSection data={contactFaqs} className="section--alt" />
    </>
  );
}
