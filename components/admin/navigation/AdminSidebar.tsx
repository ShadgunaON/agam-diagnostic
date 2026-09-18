'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AdminIcon, AdminIconName } from './AdminIcons';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/context/AuthContext';

interface NavigationItem {
  title: string;
  href: string;
  icon: AdminIconName;
  moduleId: string;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// ── Website CMS page/section tree ────────────────────────────────────────────
const CMS_PAGES = [
  {
    id: 'home',
    label: 'Home',
    href: '/admin/website/pages/home',
    sections: [
      { id: 'overview',            label: 'Overview' },
      { id: 'hero',                label: 'Hero' },
      { id: 'statistics',         label: 'Statistics' },
      { id: 'diagnosticSolutions',label: 'Diagnostic Solutions' },
      { id: 'healthCheckupPlans', label: 'Health Checkup Plans' },
      { id: 'patientReviews',     label: 'Patient Reviews' },
      { id: 'qualityCare',        label: 'Quality & Care' },
      { id: 'healthArticles',     label: 'Health Insights' },
      { id: 'mainLab',            label: 'Main Lab' },
      { id: 'faq',                label: 'FAQ' },
      { id: 'bottomCta',          label: 'Bottom CTA' },
      { id: 'seo',                label: 'SEO' },
    ],
  },
];

// ── Static navigation (non-CMS) ───────────────────────────────────────────────
const adminNavigation: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard',  href: '/admin',           icon: 'layoutDashboard', moduleId: 'analytics' },
      { title: 'Analytics',  href: '/admin/analytics', icon: 'barChart',        moduleId: 'analytics' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Bookings',             href: '/admin/bookings',    icon: 'calendar',     moduleId: 'orders'      },
      { title: 'Collections',          href: '/admin/collections', icon: 'mapPin',       moduleId: 'collections' },
      { title: 'Patients',             href: '/admin/patients',    icon: 'users',        moduleId: 'patients'    },
      { title: 'Ledger & Invoices',    href: '/admin/invoices',    icon: 'fileText',     moduleId: 'invoices'    },
      { title: 'Reports',              href: '/admin/reports',     icon: 'file',         moduleId: 'reports'     },
      { title: 'Reviews',              href: '/admin/reviews',     icon: 'fileText',     moduleId: 'reviews'     },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Catalog',               href: '/admin/catalog',     icon: 'fileText',     moduleId: 'catalog'    },
      { title: 'Staff & Roles',         href: '/admin/staff',       icon: 'userCog',      moduleId: 'staff'      },
      { title: 'Content / Blogs',       href: '/admin/blogs',       icon: 'fileText',     moduleId: 'blogs'      },
      { title: 'Newsletter & Inquiries',href: '/admin/newsletter',  icon: 'messageSquare',moduleId: 'newsletter' },
    ],
  },
];

// ── WebsiteCMSMenu ────────────────────────────────────────────────────────────
function WebsiteCMSMenu({ isCollapsed, pathname }: { isCollapsed: boolean; pathname: string }) {
  const router = useRouter();

  // Track which page accordion is open
  const [openPage, setOpenPage] = React.useState<string | null>(() => {
    // Auto-open if currently on a CMS page
    if (pathname.includes('/admin/website')) return 'home';
    return null;
  });

  const isCMSActive = pathname.includes('/admin/website');

  if (isCollapsed) {
    return (
      <Link
        href="/admin/website/pages/home"
        title="Website CMS"
        className={`flex items-center justify-center transition-all duration-200 group relative ${
          isCMSActive ? 'bg-blue-500/20 !text-blue-300' : '!text-slate-300 hover:bg-white/10 hover:!text-white'
        }`}
        style={{ padding: '10px 0', borderRadius: '10px' }}
      >
        <AdminIcon name="fileText" style={{ width: '18px', height: '18px' }} strokeWidth={isCMSActive ? 2.5 : 2} />
      </Link>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: '2px' }}>
      {/* ── Level 1: "Website CMS" label with globe icon ── */}
      <button
        onClick={() => setOpenPage(prev => prev === 'cms' ? null : 'cms')}
        className={`flex items-center w-full transition-all duration-200 group relative ${
          isCMSActive ? 'bg-blue-500/20 !text-blue-300' : '!text-slate-300 hover:bg-white/10 hover:!text-white'
        }`}
        style={{ padding: '10px 14px', borderRadius: '10px', gap: '14px' }}
      >
        {isCMSActive && (
          <div
            className="absolute bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', borderTopRightRadius: '9999px', borderBottomRightRadius: '9999px' }}
          />
        )}
        <AdminIcon name="fileText" className={`transition-transform duration-200 ${isCMSActive ? 'scale-110' : 'group-hover:scale-110'}`} style={{ width: '18px', height: '18px' }} strokeWidth={isCMSActive ? 2.5 : 2} />
        <span className={`flex-1 leading-none tracking-wide text-left ${isCMSActive ? 'font-semibold' : 'font-medium'}`} style={{ fontSize: '14px' }}>
          Website CMS
        </span>
        <AdminIcon
          name="chevronRight"
          style={{ width: '14px', height: '14px', transform: openPage === 'cms' || isCMSActive ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          strokeWidth={2}
        />
      </button>

      {/* ── Level 1 expanded: show pages ── */}
      {(openPage === 'cms' || isCMSActive) && (
        <div className="flex flex-col" style={{ paddingLeft: '12px', gap: '2px' }}>
          {CMS_PAGES.map(page => {
            const isPageActive = pathname === page.href || pathname.startsWith(page.href + '/');
            const isPageOpen = openPage === page.id || isPageActive;

            return (
              <div key={page.id} className="flex flex-col" style={{ gap: '2px' }}>
                {/* ── Level 2: Page name (e.g. "Home") ── */}
                <button
                  onClick={() => setOpenPage(prev => prev === page.id ? 'cms' : page.id)}
                  className={`flex items-center w-full transition-all duration-200 group ${
                    isPageActive ? '!text-blue-300' : '!text-slate-400 hover:!text-slate-200'
                  }`}
                  style={{ padding: '8px 10px', borderRadius: '8px', gap: '10px', backgroundColor: isPageActive ? 'rgba(59,130,246,0.08)' : 'transparent' }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isPageActive ? '#60a5fa' : '#475569', flexShrink: 0 }} />
                  <span className={`flex-1 text-left ${isPageActive ? 'font-semibold' : 'font-medium'}`} style={{ fontSize: '13px' }}>
                    {page.label}
                  </span>
                  <AdminIcon
                    name="chevronRight"
                    style={{ width: '12px', height: '12px', transform: isPageOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    strokeWidth={2}
                  />
                </button>

                {/* ── Level 3: Sections ── */}
                {isPageOpen && (
                  <div className="flex flex-col" style={{ paddingLeft: '16px', gap: '1px' }}>
                    {page.sections.map(section => {
                      const sectionHref = `${page.href}?section=${section.id}`;
                      // Active if on the page AND either no section param (overview) or matching section
                      const isActive = isPageActive && (
                        typeof window !== 'undefined'
                          ? new URLSearchParams(window.location.search).get('section') === section.id
                          : false
                      );

                      return (
                        <Link
                          key={section.id}
                          href={sectionHref}
                          className={`flex items-center transition-all duration-150 group ${
                            isActive
                              ? '!text-blue-300 font-semibold'
                              : '!text-slate-500 hover:!text-slate-200 font-medium'
                          }`}
                          style={{ padding: '6px 8px', borderRadius: '6px', gap: '8px', fontSize: '12.5px', backgroundColor: isActive ? 'rgba(59,130,246,0.1)' : 'transparent' }}
                        >
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isActive ? '#93c5fd' : '#334155', flexShrink: 0 }} />
                          {section.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── AdminSidebar ──────────────────────────────────────────────────────────────
export function AdminSidebar(props: { isCollapsed?: boolean; setIsCollapsed?: (val: boolean) => void }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const { isCollapsed = false, setIsCollapsed = () => {} } = props || {};
  const pathname = usePathname();
  const { accessibleModules, role, isLoading } = useRBAC();
  const { user, logout } = useAuth();

  if (!mounted) return null;

  const isUuid = (str?: string) => !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  const displayName = !isUuid(user?.fullName) && user?.fullName
    ? user.fullName
    : (user?.email ? user.email.split('@')[0] : (role?.title || 'Staff'));
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <aside
      style={{ width: isCollapsed ? 80 : 210, flexShrink: 0, position: 'relative', display: 'flex' }}
      className="admin-sidebar-desktop bg-[#1A2234] border-r border-[#26314A] flex-col transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-40"
    >
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: '76px', padding: '0 24px', marginBottom: '16px', marginTop: '8px' }}
      >
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center !text-white hover:opacity-80 transition-opacity" style={{ gap: '12px' }}>
            <div className="bg-gradient-to-br from-[#e31837] to-[#b9112a] flex items-center justify-center shrink-0 shadow-lg shadow-red-900/20" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
              <AdminIcon name="microscope" className="text-white" style={{ width: '20px', height: '20px' }} />
            </div>
            <span className="font-bold tracking-tight whitespace-nowrap" style={{ fontSize: '15px' }}>AGAM Admin</span>
          </Link>
        )}
      </div>

      <div
        className="flex-1 flex flex-col"
        style={{ padding: '8px 12px 12px 12px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {adminNavigation.map((group) => {
          const visibleItems = isLoading
            ? []
            : group.items.filter(item => accessibleModules.includes(item.moduleId));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="flex flex-col" style={{ marginBottom: '16px' }}>
              {!isCollapsed && (
                <div className="font-bold !text-slate-400 uppercase tracking-[0.16em]" style={{ fontSize: '11px', padding: '0 12px', marginBottom: '8px' }}>
                  {group.title}
                </div>
              )}
              <div className="flex flex-col" style={{ gap: '4px' }}>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center transition-all duration-200 group relative ${isActive
                        ? 'bg-blue-500/20 !text-blue-300'
                        : '!text-slate-300 hover:bg-white/10 hover:!text-white'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.title : undefined}
                      style={{ padding: isCollapsed ? '10px 0' : '10px 14px', borderRadius: '10px', gap: '14px' }}
                    >
                      {isActive && !isCollapsed && (
                        <div className="absolute bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', borderTopRightRadius: '9999px', borderBottomRightRadius: '9999px' }} />
                      )}
                      <AdminIcon
                        name={item.icon}
                        className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                        style={{ width: '18px', height: '18px' }}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {!isCollapsed && (
                        <span className={`leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`} style={{ fontSize: '14px' }}>
                          {item.title}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── Website CMS two-level dropdown ── */}
        {(!isLoading && accessibleModules.includes('catalog')) && (
          <div className="flex flex-col" style={{ marginBottom: '16px' }}>
            {!isCollapsed && (
              <div className="font-bold !text-slate-400 uppercase tracking-[0.16em]" style={{ fontSize: '11px', padding: '0 12px', marginBottom: '8px' }}>
                Website
              </div>
            )}
            <WebsiteCMSMenu isCollapsed={isCollapsed} pathname={pathname} />
          </div>
        )}
      </div>

      {/* Public Site Link */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors group w-full border border-slate-700 hover:border-slate-600"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', color: '#cbd5e1', border: '1px solid #334155', textDecoration: 'none', transition: 'all 0.2s', backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
        >
          <AdminIcon name="chevronRight" className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" strokeWidth={2} style={{ width: '20px', height: '20px', transform: 'rotate(180deg)' }} />
          {!isCollapsed && <span className="font-semibold text-[14px]">View Public Site</span>}
        </Link>
      </div>

      {/* Profile / Logout */}
      <div className="shrink-0 mt-auto border-t border-white/5" style={{ padding: '16px' }}>
        <button
          onClick={logout}
          className={`w-full flex items-center hover:bg-white/5 transition-colors group ${isCollapsed ? 'justify-center' : ''}`}
          style={{ padding: '8px', borderRadius: '12px', gap: '16px' }}
        >
          <div className="bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
            <span className="text-slate-300 text-sm font-medium">{initials}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 flex flex-col items-start min-w-0">
              <span className="font-medium !text-white truncate w-full text-left" style={{ fontSize: '14px' }}>{displayName}</span>
              <span className="!text-slate-500 truncate w-full text-left" style={{ fontSize: '12px' }}>{role?.title || user?.role || 'Staff'}</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
