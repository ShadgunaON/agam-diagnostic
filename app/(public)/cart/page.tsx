import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CartPageContent } from '@/components/cart/CartPageContent';

export const metadata: Metadata = {
  title: `Your Cart | ${siteConfig.name}`,
  description: 'Review your selected health packages and tests before booking.',
};

export default function CartPage() {
  return (
    <section className="section section--alt" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-12)', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container">
        <CartPageContent />
      </div>
    </section>
  );
}
