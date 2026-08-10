'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeroData } from '@/data/home';
import { Container } from '@/components/ui';

import { testCatalogService } from '@/services';
import { TestItem } from '@/domains/tests/model';

export interface HeroSectionProps {
  data: HeroData;
  className?: string;
}

/**
 * Home Hero — matches approved HTML wireframe index.html lines 143-188.
 *
 * Key wireframe details:
 * - bg: var(--color-bg-alt) = #F8FAFC with gradient overlay to hero image
 * - ::after: 120px white fade at bottom
 * - Grid: 55% / 45%
 * - Search tabs: rounded-top pill tabs (radius-lg top, bg rgba(255,255,255,0.6), active bg-primary)
 * - Search box: asymmetric radius (0 full full xl), shadow-premium, ACCENT RED circle button 56×56
 * - Hero features: 3 items below search (Home Collection, Accurate Results, Report in 4-24hrs)
 * - Hero image: opacity-0 (layout space only, bg image shows through)
 * - NO floating glassmorphic cards
 */
export function HeroSection({ data, className = '' }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'tests' | 'packages'>('tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filteredTests, setFilteredTests] = useState<TestItem[]>([]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.trim() && activeTab === 'tests') {
        const res = await testCatalogService.searchTests(searchQuery.trim());
        if (res.isSuccess) {
          setFilteredTests(res.value.slice(0, 5)); // Limit to 5 suggestions
        }
      } else {
        setFilteredTests([]);
      }
    };
    
    // Simple debounce
    const timeout = setTimeout(fetchSearch, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery, activeTab]);

  const showSuggestions = isFocused && searchQuery.trim().length > 0;

  return (
    <section className={`hero-premium section ${className}`}>
      <Container>
        <div className="hero-premium__inner">
          <div className="hero-premium__content">
            <div className="hero-premium__pill">NABL Accredited / Trusted Diagnostics</div>
            <h1 className="hero-premium__title">
              Advanced Diagnostics<br />You Can <span>Trust</span>
            </h1>
            <p className="hero-premium__desc">
              Agam Diagnostics is Madurai&apos;s most trusted NABL accredited and ICMR approved fully automated pathology laboratory.
            </p>

            <div className="hero-search-tabs">
              <div
                className={`hero-search-tab ${activeTab === 'tests' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('tests')}
                style={{ cursor: 'pointer' }}
              >
                Search Tests
              </div>
              <div
                className={`hero-search-tab ${activeTab === 'packages' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('packages')}
                style={{ cursor: 'pointer' }}
              >
                Search Packages
              </div>
            </div>
            
            <div className="hero-search-box-container" style={{ position: 'relative' }}>
              <div className="hero-search-box" style={{ maxWidth: '80%' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: 'var(--color-primary)', marginLeft: '12px', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  id="hero-search"
                  placeholder={activeTab === 'tests' ? data.searchPlaceholder : "Search for health packages..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />
                <button aria-label="Search" onClick={() => window.location.href = activeTab === 'tests' ? '/tests' : '/health-packages'}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </div>

              {/* Search suggestions dropdown - maintaining React mapping */}
              {showSuggestions && (
                <div id="search-suggest" className="search-suggest" style={{ display: 'block', maxWidth: '80%' }}>
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <Link key={test.id} href={`/tests/${test.slug}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontWeight: 500, fontSize: '14px' }}>{test.title}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(11,27,61,0.05)', padding: '2px 8px', borderRadius: '4px' }}>₹{test.price}</span>
                      </Link>
                    ))
                  ) : (
                    <div style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px', display: 'block' }}>No tests found.</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-light)', marginTop: '4px', display: 'block' }}>Try searching for &quot;CBC&quot; or &quot;Thyroid&quot;.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hero-features">
              <div className="hero-feature reveal reveal-delay-1">
                <div className="hero-feature__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div>
                  <span className="hero-feature__text">Home Collection</span>
                  <span className="hero-feature__sub">Safe &amp; Convenient</span>
                </div>
              </div>
              <div className="hero-feature reveal reveal-delay-2">
                <div className="hero-feature__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                </div>
                <div>
                  <span className="hero-feature__text">Accurate Results</span>
                  <span className="hero-feature__sub">NABL Certified</span>
                </div>
              </div>
              <div className="hero-feature reveal reveal-delay-3">
                <div className="hero-feature__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <span className="hero-feature__text">Report in 4-24hrs</span>
                  <span className="hero-feature__sub">Digital &amp; Secure</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-image-wrap hide-mobile">
            <img src="/images/hero_lab_visual.png" alt="Advanced Diagnostics at Agam Diagnostics Madurai" />
          </div>
        </div>
      </Container>
    </section>
  );
}
