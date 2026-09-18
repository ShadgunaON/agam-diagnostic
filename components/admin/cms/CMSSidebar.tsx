'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';

export type CMSSectionKey =
  | 'overview'
  | 'hero'
  | 'statistics'
  | 'diagnosticSolutions'
  | 'healthCheckupPlans'
  | 'patientReviews'
  | 'qualityCare'
  | 'healthArticles'
  | 'mainLab'
  | 'faq'
  | 'bookingCta'
  | 'seo';

export const CMS_NAV_ITEMS: { key: CMSSectionKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '⊞' },
  { key: 'hero', label: 'Hero', icon: '◈' },
  { key: 'statistics', label: 'Statistics', icon: '◉' },
  { key: 'diagnosticSolutions', label: 'Diagnostic Solutions', icon: '◈' },
  { key: 'healthCheckupPlans', label: 'Health Checkup Plans', icon: '◈' },
  { key: 'patientReviews', label: 'Patient Reviews', icon: '◈' },
  { key: 'qualityCare', label: 'Quality & Care', icon: '◈' },
  { key: 'healthArticles', label: 'Health Articles', icon: '◈' },
  { key: 'mainLab', label: 'Main Lab', icon: '◈' },
  { key: 'faq', label: 'FAQ', icon: '◈' },
  { key: 'bookingCta', label: 'Bottom CTA', icon: '◈' },
  { key: 'seo', label: 'SEO', icon: '◈' },
];

interface CMSSidebarProps {
  activeSection: CMSSectionKey;
  onSelect: (key: CMSSectionKey) => void;
  visibilityMap?: Partial<Record<CMSSectionKey, boolean>>;
}

export function CMSSidebar({ activeSection, onSelect, visibilityMap = {} }: CMSSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const activeItem = CMS_NAV_ITEMS.find(n => n.key === activeSection);

  return (
    <>
      {/* Mobile compact selector */}
      <div className="lg:hidden">
        <button
          type="button"
          className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-800"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span>{activeItem?.label || 'Select Section'}</span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileOpen && (
          <div className="absolute z-50 mt-1 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
            {CMS_NAV_ITEMS.map(item => (
              <button
                key={item.key}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                  activeSection === item.key
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => { onSelect(item.key); setMobileOpen(false); }}
              >
                <span>{item.label}</span>
                {visibilityMap[item.key] === false && (
                  <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-normal">Hidden</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-52 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">Page Sections</p>
        <ul className="space-y-0.5">
          {CMS_NAV_ITEMS.map(item => {
            const isActive = activeSection === item.key;
            const isHidden = visibilityMap[item.key] === false;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-2 transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                  {isHidden && !isActive && (
                    <span className="text-[9px] bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded font-normal shrink-0">Hidden</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
