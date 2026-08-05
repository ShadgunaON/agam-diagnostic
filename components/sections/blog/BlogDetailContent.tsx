import React from 'react';
import Link from 'next/link';
import { BlogArticle } from '@/domains/blog/model';
export interface BlogDetailContentProps {
  article: BlogArticle;
  relatedArticles?: BlogArticle[];
  className?: string;
}

export function BlogDetailContent({ article, relatedArticles = [], className = '' }: BlogDetailContentProps) {
  return (
    <div className={`detail-content ${className}`}>
      <span className="badge badge--tag mb-4 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">{article.category}</span>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
      <p className="text-lg text-muted-foreground mb-6">{article.description}</p>
      
      <div 
        className="rounded-xl h-[300px] flex items-center justify-center text-[80px] mb-8"
        style={{ background: `linear-gradient(135deg, ${article.colorSecondary}, ${article.colorPrimary})` }}
      >
        {article.icon}
      </div>
      
      <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
        <p>
          Receiving a medical report can sometimes feel like trying to decipher a foreign language. The array of numbers, acronyms, and reference ranges can be overwhelming. However, having a basic understanding of what these terms mean empowers you to take a more active role in your healthcare.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">The Basics: Reference Ranges</h2>
        <p>
          Next to almost every test result on your report, you will see a column typically labeled &quot;Reference Range&quot; or &quot;Normal Range.&quot; This range represents the values found in 95% of the healthy population.
        </p>
        <p>
          It&apos;s important to remember that falling slightly outside a reference range doesn&apos;t automatically mean you are ill. Various factors, including your age, sex, diet, and even the time of day the blood was drawn, can affect these numbers. Always discuss out-of-range results with your physician.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Common Blood Test Components</h2>
        <h3 className="text-xl font-bold mt-6 mb-3">1. Complete Blood Count (CBC)</h3>
        <p>The CBC is one of the most common blood tests. It evaluates the cells that circulate in your blood:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Red Blood Cells (RBCs):</strong> Carry oxygen. Low levels can indicate anemia.</li>
          <li><strong>White Blood Cells (WBCs):</strong> Fight infection. High levels might indicate an active infection or inflammation.</li>
          <li><strong>Platelets:</strong> Essential for blood clotting.</li>
          <li><strong>Hemoglobin (Hb):</strong> The oxygen-carrying protein in RBCs.</li>
        </ul>
        <h3 className="text-xl font-bold mt-6 mb-3">2. Comprehensive Metabolic Panel (CMP)</h3>
        <p>
          This test provides a snapshot of your body&apos;s chemical balance and metabolism, offering insights into your kidney and liver health, as well as blood sugar and electrolyte levels.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Why You Shouldn&apos;t Self-Diagnose</h2>
        <p>
          While it&apos;s beneficial to understand your reports, a diagnostic result is only one piece of the puzzle. A physician interprets these numbers in the context of your medical history, symptoms, and other clinical findings.
        </p>
      </div>
      
      <div className="mt-10 pt-6 border-t border-border">
        <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {relatedArticles.slice(0, 1).map((related, idx) => (
            <Link key={idx} href={`/blog/${related.slug}`} className="card card--blog fade-in block no-underline border border-border p-5 rounded-xl hover:shadow-md transition">
              <div className="card__body">
                <span className="card__date text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">{related.category}</span>
                <h3 className="card__title text-lg font-bold mb-2 text-foreground leading-snug">{related.title}</h3>
                <p className="card__desc text-sm text-muted-foreground m-0">{related.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
