"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Save, Eye, CheckCircle, AlertCircle, Clock, Globe, ChevronDown, ChevronUp,
  Plus, Trash2, Edit2, RefreshCw, Info, Loader2
} from 'lucide-react';

import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { AdminIconPicker } from '@/components/admin/cms/AdminIconPicker';
import { AdminImageEditor } from '@/components/admin/cms/AdminImageEditor';
import { CMSSidebar, CMSSectionKey } from '@/components/admin/cms/CMSSidebar';
import { CMSModal } from '@/components/admin/cms/CMSModal';
import { CMSCardItem } from '@/components/admin/cms/CMSCardItem';
import { CMSEntityPicker, EntityOption } from '@/components/admin/cms/CMSEntityPicker';
import * as LucideIcons from 'lucide-react';

import { pageService } from '@/services/PageService';
import { fetchBatchedByIds } from '@/lib/api/cms/batchResolver';
import { ServiceCatalogService } from '@/services/ServiceCatalogService';
import { PackageService } from '@/services/PackageService';
import { BlogService } from '@/services/BlogService';
import { ReviewService } from '@/services/ReviewService';
import { BookingService } from '@/services/BookingService';
import { CMSPage, HomePageContent } from '@/domains/cms/models';

// ── Services ─────────────────────────────────────────────────────────────────
const serviceCatalogService = new ServiceCatalogService();
const packageService = new PackageService();
const blogService = new BlogService();
const reviewService = new ReviewService(new BookingService());

// ── Default Content (seeded from actual public home page) ─────────────────────
const DEFAULT_CONTENT: HomePageContent = {
  hero: {
    eyebrow: 'NABL Accredited / Trusted Diagnostics',
    heading: 'Advanced Diagnostics\nYou Can Trust',
    description: "Agam Diagnostics is Madurai's most trusted NABL accredited and ICMR approved fully automated pathology laboratory.",
    ctaText: 'Book Home Collection',
    ctaLink: '/book',
    image: '/assets/home/hero-scientist.jpg',
    isVisible: true,
  },
  statistics: {
    isVisible: true,
    stats: [
      { value: '250+', label: 'Advanced Tests', icon: 'TestTube' },
      { value: '50K+', label: 'Happy Patients', icon: 'Heart' },
      { value: '15+', label: 'Years Experience', icon: 'Award' },
    ],
  },
  diagnosticSolutions: {
    eyebrow: 'Our Services',
    heading: 'Comprehensive Diagnostic Solutions',
    description: 'Advanced technology, expert pathologists, and a patient-first approach.',
    serviceIds: ['service-rt-pcr', 'service-research-services', 'service-molecular-biology'],
    isVisible: true,
  },
  healthCheckupPlans: {
    eyebrow: 'Popular Packages',
    heading: 'Comprehensive Health Checkup Plans',
    description: 'Preventive health checkups tailored for you.',
    packageIds: ['package-jj', 'package-test-womens', 'package-safe-women-wellness-package'],
    isVisible: true,
  },
  patientReviews: {
    eyebrow: 'Patient Stories',
    heading: 'What Our Patients Say',
    description: 'Real stories from our valued patients.',
    reviewIds: ['REV-1789305749048-ljhf', 'REV-1789299466364-fbs9'],
    isVisible: true,
  },
  qualityCare: {
    eyebrow: 'Why Choose Us',
    heading: 'Uncompromising Quality & Care',
    description: 'We prioritize your health with state-of-the-art facilities.',
    features: [
      { title: 'NABL Accredited', description: 'Highest international standards.', icon: 'Award' },
      { title: 'Free Home Collection', description: 'Safe and hygienic home service.', icon: 'MapPin' },
      { title: 'Same Day Reports', description: 'Accurate reports delivered quickly.', icon: 'Clock' },
    ],
    isVisible: true,
  },
  healthArticles: {
    eyebrow: 'Our Latest Research',
    heading: 'Health Insights & Articles',
    description: 'Stay informed with the latest updates in healthcare and wellness.',
    blogIds: ['BLOG-1788894080889-c5wi4', 'BLOG-1788087105532-mmsla', 'BLOG-1787863724749-vfoj7'],
    ctaText: 'View All Articles',
    ctaLink: '/blog',
    isVisible: true,
  },
  mainLab: {
    eyebrow: 'Visit Us',
    heading: 'Agam Diagnostics – Main Lab',
    description: 'Our state-of-the-art central reference laboratory.',
    name: 'Main Lab - Vivekananda Nagar',
    address: 'Ground Floor, Plot No.17-R-1, 120 Feet Road, Vivekananda Nagar, Sambakulam, Madurai, Tamil Nadu - 625007',
    phone: '+91 80562 13133',
    hours: 'Mon - Sun: 6:00 AM - 10:00 PM',
    image: '/assets/lab-exterior.jpg',
    mapLink: 'https://maps.google.com/?q=Agam+Diagnostics',
    bookingCtaText: 'Book a Test',
    bookingCtaLink: '/book',
    directionCtaText: 'Get Directions',
    directionCtaLink: '#',
    isVisible: true,
  },
  faq: {
    eyebrow: 'Have Questions?',
    heading: 'Frequently Asked Questions',
    description: 'Find answers to common questions about our services.',
    faqIds: [],
    faqs: [
      { question: 'Do you offer home blood sample collection in Madurai?', answer: 'Yes, Agam Diagnostics provides free, safe, and hygienic home blood sample collection across Madurai.' },
      { question: 'When will I get my test reports?', answer: 'Most routine blood test reports are delivered on the same day via WhatsApp and email.' },
    ],
    isVisible: true,
  },
  bookingCta: {
    heading: 'Ready to Book Your Test?',
    description: 'Choose what works best for you. Visit a nearby lab or let our experts come to you.',
    buttonText: 'Start Booking',
    buttonLink: '/book',
    isVisible: true,
  },
};

// ── Resolved entities cache types ─────────────────────────────────────────────
interface ResolvedEntity { id: string; title: string; subtitle?: string; badge?: string; }

// ── Visibility map ────────────────────────────────────────────────────────────
function buildVisibilityMap(c: HomePageContent | null): Partial<Record<CMSSectionKey, boolean>> {
  if (!c) return {};
  return {
    hero: c.hero.isVisible,
    statistics: c.statistics.isVisible,
    diagnosticSolutions: c.diagnosticSolutions.isVisible,
    healthCheckupPlans: c.healthCheckupPlans.isVisible,
    patientReviews: c.patientReviews.isVisible,
    qualityCare: c.qualityCare.isVisible,
    healthArticles: c.healthArticles.isVisible,
    mainLab: c.mainLab.isVisible,
    faq: c.faq.isVisible,
    bookingCta: c.bookingCta.isVisible,
  };
}

// ── Inline Toggle ─────────────────────────────────────────────────────────────
function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-xs text-gray-500 font-medium">Visible on site</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-1'}`}
        />
      </button>
    </label>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, description, isVisible, onVisibilityChange }: {
  title: string;
  description?: string;
  isVisible?: boolean;
  onVisibilityChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {onVisibilityChange && isVisible !== undefined && (
        <VisibilityToggle value={isVisible} onChange={onVisibilityChange} />
      )}
    </div>
  );
}

// ── Section Field Pair (two columns) ─────────────────────────────────────────
function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

// ── Add button ───────────────────────────────────────────────────────────────
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg border border-dashed border-blue-200 transition-colors w-full justify-center mt-3"
    >
      <Plus size={15} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeCMSPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pageData, setPageData] = useState<CMSPage | null>(null);
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [savedContent, setSavedContent] = useState<string>('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoCanonical, setSeoCanonical] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeSection, setActiveSection] = useState<CMSSectionKey>('overview');

  // Sync activeSection from ?section= URL param (set by sidebar links)
  const searchParams = useSearchParams();
  useEffect(() => {
    const sectionParam = searchParams.get('section') as CMSSectionKey | null;
    if (sectionParam) setActiveSection(sectionParam);
  }, [searchParams]);

  // Resolved entity caches (fetched once, passed into cards)
  const [resolvedPackages, setResolvedPackages] = useState<Record<string, ResolvedEntity>>({});
  const [resolvedServices, setResolvedServices] = useState<Record<string, ResolvedEntity>>({});
  const [resolvedReviews, setResolvedReviews] = useState<Record<string, ResolvedEntity>>({});
  const [resolvedArticles, setResolvedArticles] = useState<Record<string, ResolvedEntity>>({});

  // Modal states
  const [statModal, setStatModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [statDraft, setStatDraft] = useState<{ value: string; label: string; icon: string } | null>(null);
  const [faqModal, setFaqModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [faqDraft, setFaqDraft] = useState<{ question: string; answer: string } | null>(null);
  const [featureModal, setFeatureModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [featureDraft, setFeatureDraft] = useState<{ title: string; description: string; icon: string } | null>(null);

  // Entity picker states
  const [pickerConfig, setPickerConfig] = useState<{
    open: boolean;
    type: 'package' | 'service' | 'review' | 'article';
    slotIndex?: number;
  }>({ open: false, type: 'package' });

  const hasUnsavedChanges = useMemo(() => {
    if (!content) return false;
    return JSON.stringify(content) !== savedContent;
  }, [content, savedContent]);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchPage = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const page = await pageService.getPageById('home');
      setPageData(page);

      // Deep-merge stored content with defaults so partial/test saves don't crash
      const mergeWithDefaults = (stored: Partial<HomePageContent>): HomePageContent => {
        const merged: HomePageContent = { ...DEFAULT_CONTENT };
        (Object.keys(DEFAULT_CONTENT) as (keyof HomePageContent)[]).forEach((key) => {
          if (stored[key] !== undefined && stored[key] !== null && typeof stored[key] === 'object') {
            merged[key] = { ...(DEFAULT_CONTENT[key] as any), ...(stored[key] as any) } as any;
          }
        });
        return merged;
      };

      let c: HomePageContent;
      if (page?.draftContent) {
        try { c = mergeWithDefaults(JSON.parse(page.draftContent)); }
        catch { c = DEFAULT_CONTENT; }
      } else if (page?.publishedContent) {
        try { c = mergeWithDefaults(JSON.parse(page.publishedContent)); }
        catch { c = DEFAULT_CONTENT; }
      } else {
        c = DEFAULT_CONTENT;
      }
      setContent(c);
      setSavedContent(JSON.stringify(c));

      if (page?.draftSeo) {
        const seo = JSON.parse(page.draftSeo);
        setSeoTitle(seo.title || '');
        setSeoDescription(seo.description || '');
        setSeoCanonical(seo.canonicalUrl || '');
        setSeoOgImage(seo.ogImage || '');
      } else if (page?.publishedSeo) {
        const seo = JSON.parse(page.publishedSeo);
        setSeoTitle(seo.title || '');
        setSeoDescription(seo.description || '');
        setSeoCanonical(seo.canonicalUrl || '');
        setSeoOgImage(seo.ogImage || '');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load page content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  // Resolve references in batch when content loads
  useEffect(() => {
    if (!content) return;

    // Packages
    if (content.healthCheckupPlans.packageIds.length) {
      fetchBatchedByIds<{ id: string; title: string; price: number }>(
        'packageById',
        content.healthCheckupPlans.packageIds,
        'id title price'
      ).then(res => {
        const map: Record<string, ResolvedEntity> = {};
        res.forEach(p => { map[p.id] = { id: p.id, title: p.title, badge: p.price ? `₹${p.price}` : undefined }; });
        setResolvedPackages(map);
      }).catch(() => {});
    }

    // Services
    if (content.diagnosticSolutions.serviceIds.length) {
      fetchBatchedByIds<{ id: string; title: string; category: string }>(
        'serviceById',
        content.diagnosticSolutions.serviceIds,
        'id title category'
      ).then(res => {
        const map: Record<string, ResolvedEntity> = {};
        res.forEach(s => { map[s.id] = { id: s.id, title: s.title, subtitle: s.category }; });
        setResolvedServices(map);
      }).catch(() => {});
    }

    // Reviews
    if (content.patientReviews.reviewIds.length) {
      fetchBatchedByIds<{ id: string; displayName: string; comment: string }>(
        'reviewById',
        content.patientReviews.reviewIds,
        'id displayName comment'
      ).then(res => {
        const map: Record<string, ResolvedEntity> = {};
        res.forEach(r => {
          map[r.id] = {
            id: r.id,
            title: r.displayName || 'Patient',
            subtitle: r.comment?.slice(0, 60) + (r.comment?.length > 60 ? '…' : ''),
          };
        });
        setResolvedReviews(map);
      }).catch(() => {});
    }

    // Articles
    if (content.healthArticles.blogIds.length) {
      fetchBatchedByIds<{ id: string; title: string; category: string }>(
        'blogById',
        content.healthArticles.blogIds,
        'id title category'
      ).then(res => {
        const map: Record<string, ResolvedEntity> = {};
        res.forEach(b => { map[b.id] = { id: b.id, title: b.title, subtitle: b.category }; });
        setResolvedArticles(map);
      }).catch(() => {});
    }
  }, [content?.healthCheckupPlans.packageIds.join(), content?.diagnosticSolutions.serviceIds.join(),
    content?.patientReviews.reviewIds.join(), content?.healthArticles.blogIds.join()]);

  // ── Update helpers ──────────────────────────────────────────────────────────
  const updateContent = (section: keyof HomePageContent, data: any) => {
    setContent(prev => {
      if (!prev) return prev;
      return { ...prev, [section]: { ...prev[section], ...data } };
    });
  };

  // ── Save / Publish ──────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const seoPayload = { title: seoTitle, description: seoDescription, canonicalUrl: seoCanonical, ogImage: seoOgImage };
      await pageService.updatePage('home', JSON.stringify(content), JSON.stringify(seoPayload));
      setSavedContent(JSON.stringify(content));
      setSuccessMsg('Draft saved successfully.');
      fetchPage();
    } catch (err: any) {
      setErrorMsg(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const validateBeforePublish = (): string[] => {
    const errors: string[] = [];
    if (!content) return ['Content not loaded.'];
    if (!content.hero.heading?.trim()) errors.push('Hero heading is required.');
    if (!content.hero.ctaText?.trim()) errors.push('Hero CTA text is required.');
    if (content.healthCheckupPlans.packageIds.length !== 3) errors.push('Exactly 3 package slots are required.');
    if (new Set(content.healthCheckupPlans.packageIds).size !== content.healthCheckupPlans.packageIds.length)
      errors.push('Duplicate packages detected in Health Checkup Plans.');
    if (!content.mainLab.name?.trim()) errors.push('Main Lab name is required.');
    if (!seoTitle?.trim()) errors.push('SEO title is required.');
    return errors;
  };

  const handlePublish = async () => {
    const errors = validateBeforePublish();
    if (errors.length) {
      setErrorMsg('Cannot publish: ' + errors.join(' '));
      return;
    }
    if (!window.confirm('Are you sure you want to publish these changes live?')) return;
    setPublishing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const seoPayload = { title: seoTitle, description: seoDescription, canonicalUrl: seoCanonical, ogImage: seoOgImage };
      await pageService.updatePage('home', JSON.stringify(content), JSON.stringify(seoPayload));
      await pageService.publishPage('home');
      setSavedContent(JSON.stringify(content));
      setSuccessMsg('Page published successfully! Reload the home page to see changes.');
      fetchPage();
    } catch (err: any) {
      setErrorMsg(`Publish failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  // ── Entity picker handler ───────────────────────────────────────────────────
  const handleEntitySelect = (entity: EntityOption) => {
    if (!content) return;
    const { type, slotIndex } = pickerConfig;

    if (type === 'package') {
      const ids = [...content.healthCheckupPlans.packageIds];
      // Ensure exactly 3 slots
      while (ids.length < 3) ids.push('');
      if (slotIndex !== undefined) ids[slotIndex] = entity.id;
      updateContent('healthCheckupPlans', { packageIds: ids.filter(Boolean) });
      // Update resolved cache
      setResolvedPackages(prev => ({ ...prev, [entity.id]: entity }));
    } else if (type === 'service') {
      const ids = [...content.diagnosticSolutions.serviceIds];
      if (slotIndex !== undefined) ids[slotIndex] = entity.id;
      else ids.push(entity.id);
      updateContent('diagnosticSolutions', { serviceIds: ids });
      setResolvedServices(prev => ({ ...prev, [entity.id]: entity }));
    } else if (type === 'review') {
      const ids = [...content.patientReviews.reviewIds];
      if (slotIndex !== undefined) ids[slotIndex] = entity.id;
      else ids.push(entity.id);
      updateContent('patientReviews', { reviewIds: ids });
      setResolvedReviews(prev => ({ ...prev, [entity.id]: entity }));
    } else if (type === 'article') {
      const ids = [...content.healthArticles.blogIds];
      if (slotIndex !== undefined) ids[slotIndex] = entity.id;
      else ids.push(entity.id);
      updateContent('healthArticles', { blogIds: ids });
      setResolvedArticles(prev => ({ ...prev, [entity.id]: entity }));
    }
  };

  // ── Search functions ────────────────────────────────────────────────────────
  const searchPackages = async (q: string): Promise<EntityOption[]> => {
    const res = await packageService.getCatalog(1, 50);
    const data = res.isSuccess ? res.value.data : [];
    return data
      .filter(p => p.title.toLowerCase().includes(q.toLowerCase()))
      .map(p => ({ id: p.id, title: p.title, badge: p.price ? `₹${p.price}` : undefined }));
  };

  const searchServices = async (q: string): Promise<EntityOption[]> => {
    const res = await serviceCatalogService.getCatalog(1, 50);
    const data = res.isSuccess ? res.value.data : [];
    return data
      .filter(s => s.title.toLowerCase().includes(q.toLowerCase()))
      .map(s => ({ id: s.id, title: s.title }));
  };

  const searchReviews = async (_q: string): Promise<EntityOption[]> => {
    const res = await reviewService.getPublicReviews();
    const data = res.isSuccess ? res.value : [];
    return data.map(r => ({ id: r.id, title: r.displayName || 'Patient', subtitle: r.comment?.slice(0, 60) }));
  };

  const searchArticles = async (q: string): Promise<EntityOption[]> => {
    const res = await blogService.getArticles(1, 50);
    const data = res.isSuccess ? res.value.data : [];
    return data
      .filter(b => b.title.toLowerCase().includes(q.toLowerCase()))
      .map(b => ({ id: b.id, title: b.title, subtitle: b.category }));
  };

  // ── Array mutation helpers ──────────────────────────────────────────────────
  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  // ── SECTION PANELS ──────────────────────────────────────────────────────────

  const renderOverview = () => {
    if (!content) return null;
    const status = pageData?.status || 'DRAFT';
    const updatedAt = pageData?.updatedAt ? new Date(pageData.updatedAt).toLocaleString('en-IN') : 'Not saved yet';
    const publishedAt = pageData?.publishedAt ? new Date(pageData.publishedAt).toLocaleString('en-IN') : 'Never published';

    return (
      <div className="space-y-6">
        <SectionHeader title="Home Page Overview" description="Current status and content summary" />

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border-2 ${status === 'PUBLISHED' ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'PUBLISHED' ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className={`text-sm font-bold ${status === 'PUBLISHED' ? 'text-green-700' : 'text-amber-700'}`}>{status}</span>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Last Saved</p>
            <p className="text-sm font-medium text-gray-700">{updatedAt}</p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Last Published</p>
            <p className="text-sm font-medium text-gray-700">{publishedAt}</p>
          </div>
        </div>

        {/* Content summary */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Content Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Sections', value: 10 },
              { label: 'Statistics', value: content.statistics.stats.length },
              { label: 'Services', value: content.diagnosticSolutions.serviceIds.length },
              { label: 'Packages', value: `${content.healthCheckupPlans.packageIds.length} / 3` },
              { label: 'Reviews', value: content.patientReviews.reviewIds.length },
              { label: 'Articles', value: content.healthArticles.blogIds.length },
              { label: 'Quality Cards', value: content.qualityCare.features.length },
              { label: 'FAQ Items', value: content.faq.faqs?.length || 0 },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-lg border border-gray-200 bg-white text-center">
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <AlertCircle size={15} />
            <span>You have unsaved changes. Save the draft before previewing.</span>
          </div>
        )}
      </div>
    );
  };

  const renderHero = () => {
    if (!content) return null;
    return (
      <div className="space-y-5">
        <SectionHeader
          title="Hero Section"
          description="The main banner visible at the top of the Home page."
          isVisible={content.hero.isVisible}
          onVisibilityChange={v => updateContent('hero', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Eyebrow text" value={content.hero.eyebrow} onChange={e => updateContent('hero', { eyebrow: e.target.value })} placeholder="e.g. NABL Accredited" />
          <AdminInput label="CTA Button Text" value={content.hero.ctaText} onChange={e => updateContent('hero', { ctaText: e.target.value })} />
        </FieldRow>
        <AdminInput label="Heading *" value={content.hero.heading} onChange={e => updateContent('hero', { heading: e.target.value })} multiline rows={2} />
        <AdminInput label="Description" value={content.hero.description} onChange={e => updateContent('hero', { description: e.target.value })} multiline rows={3} />
        <AdminInput label="CTA Button Link" value={content.hero.ctaLink} onChange={e => updateContent('hero', { ctaLink: e.target.value })} placeholder="/book" />
        <AdminImageEditor
          label="Hero Image"
          value={content.hero.image}
          onChange={url => updateContent('hero', { image: url })}
        />
      </div>
    );
  };

  const renderStatistics = () => {
    if (!content) return null;
    const { stats } = content.statistics;

    const openStatModal = (index: number | null) => {
      const item = index !== null ? stats[index] : { value: '100+', label: 'New Metric', icon: 'Star' };
      setStatDraft({ ...item });
      setStatModal({ open: true, index });
    };

    const saveStatModal = () => {
      if (!statDraft) return;
      const next = [...stats];
      if (statModal.index !== null) {
        next[statModal.index] = statDraft;
      } else {
        next.push(statDraft);
      }
      updateContent('statistics', { stats: next });
      setStatModal({ open: false, index: null });
    };

    return (
      <div className="space-y-4">
        <SectionHeader
          title="Statistics"
          description="Key metrics displayed prominently on the Home page."
          isVisible={content.statistics.isVisible}
          onVisibilityChange={v => updateContent('statistics', { isVisible: v })}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((stat, idx) => {
            const IconComp = (LucideIcons as any)[stat.icon] || LucideIcons.BarChart2;
            return (
              <div key={idx} className="relative p-4 rounded-xl border border-gray-200 bg-white shadow-sm group hover:shadow-md transition-shadow text-center">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openStatModal(idx)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={13} />
                  </button>
                  {stats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => updateContent('statistics', { stats: stats.filter((_, i) => i !== idx) })}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                  <IconComp size={16} className="text-blue-600" />
                </div>
                <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <AddButton label="Add Statistic" onClick={() => openStatModal(null)} />

        {/* Stat edit modal */}
        <CMSModal isOpen={statModal.open} onClose={() => setStatModal({ open: false, index: null })} title={statModal.index !== null ? 'Edit Statistic' : 'Add Statistic'} size="sm">
          {statDraft && (
            <div className="space-y-4">
              <FieldRow>
                <AdminInput label="Value *" value={statDraft.value} onChange={e => setStatDraft(d => d ? { ...d, value: e.target.value } : d)} placeholder="e.g. 50K+" />
                <AdminInput label="Label *" value={statDraft.label} onChange={e => setStatDraft(d => d ? { ...d, label: e.target.value } : d)} placeholder="e.g. Happy Patients" />
              </FieldRow>
              <AdminIconPicker label="Icon" value={statDraft.icon} onChange={icon => setStatDraft(d => d ? { ...d, icon } : d)} />
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <AdminButton variant="primary" onClick={saveStatModal} className="flex-1">Save</AdminButton>
                <AdminButton variant="ghost" onClick={() => setStatModal({ open: false, index: null })}>Cancel</AdminButton>
              </div>
            </div>
          )}
        </CMSModal>
      </div>
    );
  };

  const renderDiagnosticSolutions = () => {
    if (!content) return null;
    const ids = content.diagnosticSolutions.serviceIds;

    return (
      <div className="space-y-5">
        <SectionHeader
          title="Diagnostic Solutions"
          description="Services displayed on the Home page."
          isVisible={content.diagnosticSolutions.isVisible}
          onVisibilityChange={v => updateContent('diagnosticSolutions', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Eyebrow" value={content.diagnosticSolutions.eyebrow} onChange={e => updateContent('diagnosticSolutions', { eyebrow: e.target.value })} />
          <AdminInput label="Heading" value={content.diagnosticSolutions.heading} onChange={e => updateContent('diagnosticSolutions', { heading: e.target.value })} />
        </FieldRow>
        <AdminInput label="Description" value={content.diagnosticSolutions.description} onChange={e => updateContent('diagnosticSolutions', { description: e.target.value })} multiline rows={2} />

        <div className="space-y-2 mt-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Selected Services</p>
          {ids.map((id, idx) => {
            const resolved = resolvedServices[id];
            return (
              <CMSCardItem
                key={id}
                index={idx}
                total={ids.length}
                title={resolved?.title || id}
                subtitle={resolved?.subtitle}
                onReplace={() => setPickerConfig({ open: true, type: 'service', slotIndex: idx })}
                replaceLabel="Change Service"
                onRemove={() => updateContent('diagnosticSolutions', { serviceIds: ids.filter((_, i) => i !== idx) })}
                onMoveUp={idx > 0 ? () => updateContent('diagnosticSolutions', { serviceIds: moveItem(ids, idx, idx - 1) }) : undefined}
                onMoveDown={idx < ids.length - 1 ? () => updateContent('diagnosticSolutions', { serviceIds: moveItem(ids, idx, idx + 1) }) : undefined}
              />
            );
          })}
        </div>
        <AddButton label="Add Service" onClick={() => setPickerConfig({ open: true, type: 'service', slotIndex: undefined })} />
      </div>
    );
  };

  const renderHealthCheckupPlans = () => {
    if (!content) return null;
    // Always show exactly 3 slots
    const slots = [0, 1, 2];
    const ids = content.healthCheckupPlans.packageIds;

    return (
      <div className="space-y-5">
        <SectionHeader
          title="Health Checkup Plans"
          description="Exactly 3 package cards displayed on the Home page."
          isVisible={content.healthCheckupPlans.isVisible}
          onVisibilityChange={v => updateContent('healthCheckupPlans', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Eyebrow" value={content.healthCheckupPlans.eyebrow} onChange={e => updateContent('healthCheckupPlans', { eyebrow: e.target.value })} />
          <AdminInput label="Heading" value={content.healthCheckupPlans.heading} onChange={e => updateContent('healthCheckupPlans', { heading: e.target.value })} />
        </FieldRow>
        <AdminInput label="Description" value={content.healthCheckupPlans.description} onChange={e => updateContent('healthCheckupPlans', { description: e.target.value })} multiline rows={2} />

        <div className="space-y-3 mt-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Package Slots (3 Required)</p>
          {slots.map(slotIdx => {
            const id = ids[slotIdx];
            const resolved = id ? resolvedPackages[id] : undefined;
            const isEmpty = !id;
            return (
              <div key={slotIdx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-3">
                  {slotIdx + 1}
                </div>
                <div className="flex-1">
                  <CMSCardItem
                    index={slotIdx}
                    total={3}
                    title={resolved?.title || (id ? `Package: ${id}` : '')}
                    subtitle={resolved?.badge}
                    isSlot
                    isEmptySlot={isEmpty}
                    onReplace={() => setPickerConfig({ open: true, type: 'package', slotIndex: slotIdx })}
                    replaceLabel="Change Package"
                    onRemove={!isEmpty ? () => {
                      const next = [...ids];
                      next[slotIdx] = '';
                      updateContent('healthCheckupPlans', { packageIds: next.filter(Boolean) });
                    } : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {ids.length !== 3 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle size={13} />
            <span>Exactly 3 packages are required before publishing.</span>
          </div>
        )}
      </div>
    );
  };

  const renderPatientReviews = () => {
    if (!content) return null;
    const ids = content.patientReviews.reviewIds;

    return (
      <div className="space-y-5">
        <SectionHeader
          title="Patient Reviews"
          description="Testimonials from real patients displayed on the Home page."
          isVisible={content.patientReviews.isVisible}
          onVisibilityChange={v => updateContent('patientReviews', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Eyebrow" value={content.patientReviews.eyebrow} onChange={e => updateContent('patientReviews', { eyebrow: e.target.value })} />
          <AdminInput label="Heading" value={content.patientReviews.heading} onChange={e => updateContent('patientReviews', { heading: e.target.value })} />
        </FieldRow>

        <div className="space-y-2 mt-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Selected Reviews</p>
          {ids.map((id, idx) => {
            const resolved = resolvedReviews[id];
            return (
              <CMSCardItem
                key={id}
                index={idx}
                total={ids.length}
                title={resolved?.title || `Review ${id}`}
                subtitle={resolved?.subtitle}
                badge="★ Review"
                onReplace={() => setPickerConfig({ open: true, type: 'review', slotIndex: idx })}
                replaceLabel="Change Review"
                onRemove={() => updateContent('patientReviews', { reviewIds: ids.filter((_, i) => i !== idx) })}
                onMoveUp={idx > 0 ? () => updateContent('patientReviews', { reviewIds: moveItem(ids, idx, idx - 1) }) : undefined}
                onMoveDown={idx < ids.length - 1 ? () => updateContent('patientReviews', { reviewIds: moveItem(ids, idx, idx + 1) }) : undefined}
              />
            );
          })}
        </div>
        <AddButton label="Add Review" onClick={() => setPickerConfig({ open: true, type: 'review', slotIndex: undefined })} />
      </div>
    );
  };

  const renderQualityCare = () => {
    if (!content) return null;
    const { features } = content.qualityCare;

    const openFeatureModal = (index: number | null) => {
      const item = index !== null ? features[index] : { title: 'New Feature', description: '', icon: 'CheckCircle' };
      setFeatureDraft({ ...item });
      setFeatureModal({ open: true, index });
    };

    const saveFeatureModal = () => {
      if (!featureDraft) return;
      const next = [...features];
      if (featureModal.index !== null) next[featureModal.index] = featureDraft;
      else next.push(featureDraft);
      updateContent('qualityCare', { features: next });
      setFeatureModal({ open: false, index: null });
    };

    return (
      <div className="space-y-5">
        <SectionHeader
          title="Quality & Care"
          description="Feature highlights shown in the Why Choose Us section."
          isVisible={content.qualityCare.isVisible}
          onVisibilityChange={v => updateContent('qualityCare', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Eyebrow" value={content.qualityCare.eyebrow} onChange={e => updateContent('qualityCare', { eyebrow: e.target.value })} />
          <AdminInput label="Heading" value={content.qualityCare.heading} onChange={e => updateContent('qualityCare', { heading: e.target.value })} />
        </FieldRow>
        <AdminInput label="Description" value={content.qualityCare.description} onChange={e => updateContent('qualityCare', { description: e.target.value })} multiline rows={2} />

        <div className="space-y-2 mt-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Feature Cards</p>
          {features.map((feature, idx) => {
            const IconComp = (LucideIcons as any)[feature.icon] || LucideIcons.Star;
            return (
              <CMSCardItem
                key={idx}
                index={idx}
                total={features.length}
                title={feature.title}
                subtitle={feature.description}
                icon={<IconComp size={16} />}
                onEdit={() => openFeatureModal(idx)}
                onRemove={() => updateContent('qualityCare', { features: features.filter((_, i) => i !== idx) })}
                onMoveUp={idx > 0 ? () => updateContent('qualityCare', { features: moveItem(features, idx, idx - 1) }) : undefined}
                onMoveDown={idx < features.length - 1 ? () => updateContent('qualityCare', { features: moveItem(features, idx, idx + 1) }) : undefined}
              />
            );
          })}
        </div>
        <AddButton label="Add Feature" onClick={() => openFeatureModal(null)} />

        <CMSModal isOpen={featureModal.open} onClose={() => setFeatureModal({ open: false, index: null })} title={featureModal.index !== null ? 'Edit Feature' : 'Add Feature'} size="sm">
          {featureDraft && (
            <div className="space-y-4">
              <AdminInput label="Title *" value={featureDraft.title} onChange={e => setFeatureDraft(d => d ? { ...d, title: e.target.value } : d)} />
              <AdminInput label="Description" value={featureDraft.description} onChange={e => setFeatureDraft(d => d ? { ...d, description: e.target.value } : d)} multiline rows={2} />
              <AdminIconPicker label="Icon" value={featureDraft.icon} onChange={icon => setFeatureDraft(d => d ? { ...d, icon } : d)} />
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <AdminButton variant="primary" onClick={saveFeatureModal} className="flex-1">Save</AdminButton>
                <AdminButton variant="ghost" onClick={() => setFeatureModal({ open: false, index: null })}>Cancel</AdminButton>
              </div>
            </div>
          )}
        </CMSModal>
      </div>
    );
  };

  const renderHealthArticles = () => {
    if (!content) return null;
    const ids = content.healthArticles.blogIds;

    return (
      <div className="space-y-5">
        <SectionHeader
          title="Health Insights & Articles"
          description="Published blog articles featured on the Home page."
          isVisible={content.healthArticles.isVisible}
          onVisibilityChange={v => updateContent('healthArticles', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Eyebrow" value={content.healthArticles.eyebrow} onChange={e => updateContent('healthArticles', { eyebrow: e.target.value })} />
          <AdminInput label="Heading" value={content.healthArticles.heading} onChange={e => updateContent('healthArticles', { heading: e.target.value })} />
        </FieldRow>
        <AdminInput label="Description" value={content.healthArticles.description} onChange={e => updateContent('healthArticles', { description: e.target.value })} multiline rows={2} />
        <FieldRow>
          <AdminInput label="CTA Button Text" value={content.healthArticles.ctaText} onChange={e => updateContent('healthArticles', { ctaText: e.target.value })} />
          <AdminInput label="CTA Button Link" value={content.healthArticles.ctaLink} onChange={e => updateContent('healthArticles', { ctaLink: e.target.value })} />
        </FieldRow>

        <div className="space-y-2 mt-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Selected Articles</p>
          {ids.map((id, idx) => {
            const resolved = resolvedArticles[id];
            return (
              <CMSCardItem
                key={id}
                index={idx}
                total={ids.length}
                title={resolved?.title || id}
                subtitle={resolved?.subtitle}
                badge="Article"
                onReplace={() => setPickerConfig({ open: true, type: 'article', slotIndex: idx })}
                replaceLabel="Change Article"
                onRemove={() => updateContent('healthArticles', { blogIds: ids.filter((_, i) => i !== idx) })}
                onMoveUp={idx > 0 ? () => updateContent('healthArticles', { blogIds: moveItem(ids, idx, idx - 1) }) : undefined}
                onMoveDown={idx < ids.length - 1 ? () => updateContent('healthArticles', { blogIds: moveItem(ids, idx, idx + 1) }) : undefined}
              />
            );
          })}
        </div>
        <AddButton label="Add Article" onClick={() => setPickerConfig({ open: true, type: 'article', slotIndex: undefined })} />
      </div>
    );
  };

  const renderMainLab = () => {
    if (!content) return null;
    return (
      <div className="space-y-5">
        <SectionHeader
          title="Main Lab"
          description="Contact and location information for the main laboratory."
          isVisible={content.mainLab.isVisible}
          onVisibilityChange={v => updateContent('mainLab', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Section Eyebrow" value={content.mainLab.eyebrow} onChange={e => updateContent('mainLab', { eyebrow: e.target.value })} />
          <AdminInput label="Section Heading" value={content.mainLab.heading} onChange={e => updateContent('mainLab', { heading: e.target.value })} />
        </FieldRow>
        <AdminInput label="Section Description" value={content.mainLab.description} onChange={e => updateContent('mainLab', { description: e.target.value })} multiline rows={2} />

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lab Details</p>
          <AdminInput label="Lab Name *" value={content.mainLab.name} onChange={e => updateContent('mainLab', { name: e.target.value })} />
          <AdminInput label="Address" value={content.mainLab.address} onChange={e => updateContent('mainLab', { address: e.target.value })} multiline rows={2} />
          <FieldRow>
            <AdminInput label="Phone Number" value={content.mainLab.phone} onChange={e => updateContent('mainLab', { phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            <AdminInput label="Operating Hours" value={content.mainLab.hours} onChange={e => updateContent('mainLab', { hours: e.target.value })} placeholder="Mon-Sun: 6AM–10PM" />
          </FieldRow>
          <AdminInput label="Google Maps Link" value={content.mainLab.mapLink} onChange={e => updateContent('mainLab', { mapLink: e.target.value })} placeholder="https://maps.google.com/..." />
          <AdminImageEditor label="Lab Image" value={content.mainLab.image} onChange={url => updateContent('mainLab', { image: url })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Booking CTA</p>
            <AdminInput label="Button Text" value={content.mainLab.bookingCtaText} onChange={e => updateContent('mainLab', { bookingCtaText: e.target.value })} />
            <AdminInput label="Button Link" value={content.mainLab.bookingCtaLink} onChange={e => updateContent('mainLab', { bookingCtaLink: e.target.value })} />
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Directions CTA</p>
            <AdminInput label="Button Text" value={content.mainLab.directionCtaText} onChange={e => updateContent('mainLab', { directionCtaText: e.target.value })} />
            <AdminInput label="Button Link" value={content.mainLab.directionCtaLink} onChange={e => updateContent('mainLab', { directionCtaLink: e.target.value })} />
          </div>
        </div>
      </div>
    );
  };

  const renderFaq = () => {
    if (!content) return null;
    const faqs = content.faq.faqs || [];

    const openFaqModal = (index: number | null) => {
      const item = index !== null ? faqs[index] : { question: '', answer: '' };
      setFaqDraft({ ...item });
      setFaqModal({ open: true, index });
    };

    const saveFaqModal = () => {
      if (!faqDraft) return;
      const next = [...faqs];
      if (faqModal.index !== null) next[faqModal.index] = faqDraft;
      else next.push(faqDraft);
      updateContent('faq', { faqs: next });
      setFaqModal({ open: false, index: null });
    };

    return (
      <div className="space-y-5">
        <SectionHeader
          title="Frequently Asked Questions"
          description="FAQ items displayed on the Home page."
          isVisible={content.faq.isVisible}
          onVisibilityChange={v => updateContent('faq', { isVisible: v })}
        />
        <FieldRow>
          <AdminInput label="Eyebrow" value={content.faq.eyebrow} onChange={e => updateContent('faq', { eyebrow: e.target.value })} />
          <AdminInput label="Heading" value={content.faq.heading} onChange={e => updateContent('faq', { heading: e.target.value })} />
        </FieldRow>
        <AdminInput label="Description" value={content.faq.description} onChange={e => updateContent('faq', { description: e.target.value })} multiline rows={2} />

        <div className="space-y-2 mt-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">FAQ Items</p>
          {faqs.map((faq, idx) => (
            <CMSCardItem
              key={idx}
              index={idx}
              total={faqs.length}
              title={faq.question}
              subtitle={faq.answer?.slice(0, 80) + (faq.answer?.length > 80 ? '…' : '')}
              onEdit={() => openFaqModal(idx)}
              onRemove={() => updateContent('faq', { faqs: faqs.filter((_, i) => i !== idx) })}
              onMoveUp={idx > 0 ? () => updateContent('faq', { faqs: moveItem(faqs, idx, idx - 1) }) : undefined}
              onMoveDown={idx < faqs.length - 1 ? () => updateContent('faq', { faqs: moveItem(faqs, idx, idx + 1) }) : undefined}
            />
          ))}
        </div>
        <AddButton label="Add FAQ" onClick={() => openFaqModal(null)} />

        <CMSModal isOpen={faqModal.open} onClose={() => setFaqModal({ open: false, index: null })} title={faqModal.index !== null ? 'Edit FAQ' : 'Add FAQ'}>
          {faqDraft && (
            <div className="space-y-4">
              <AdminInput label="Question *" value={faqDraft.question} onChange={e => setFaqDraft(d => d ? { ...d, question: e.target.value } : d)} />
              <AdminInput label="Answer *" value={faqDraft.answer} onChange={e => setFaqDraft(d => d ? { ...d, answer: e.target.value } : d)} multiline rows={4} />
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <AdminButton variant="primary" onClick={saveFaqModal} className="flex-1">Save</AdminButton>
                <AdminButton variant="ghost" onClick={() => setFaqModal({ open: false, index: null })}>Cancel</AdminButton>
              </div>
            </div>
          )}
        </CMSModal>
      </div>
    );
  };

  const renderBookingCta = () => {
    if (!content) return null;
    return (
      <div className="space-y-5">
        <SectionHeader
          title="Bottom CTA"
          description="Call-to-action banner at the bottom of the Home page."
          isVisible={content.bookingCta.isVisible}
          onVisibilityChange={v => updateContent('bookingCta', { isVisible: v })}
        />
        <AdminInput label="Heading *" value={content.bookingCta.heading} onChange={e => updateContent('bookingCta', { heading: e.target.value })} />
        <AdminInput label="Description" value={content.bookingCta.description} onChange={e => updateContent('bookingCta', { description: e.target.value })} multiline rows={2} />
        <FieldRow>
          <AdminInput label="Button Text" value={content.bookingCta.buttonText} onChange={e => updateContent('bookingCta', { buttonText: e.target.value })} />
          <AdminInput label="Button Link" value={content.bookingCta.buttonLink} onChange={e => updateContent('bookingCta', { buttonLink: e.target.value })} />
        </FieldRow>
      </div>
    );
  };

  const renderSeo = () => (
    <div className="space-y-5">
      <SectionHeader title="SEO Settings" description="Controls how the Home page appears in search results and social shares." />
      <AdminInput label="SEO Title *" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="e.g. Best Diagnostic Centre in Madurai | Agam Diagnostics" />
      <AdminInput label="Meta Description" value={seoDescription} onChange={e => setSeoDescription(e.target.value)} multiline rows={3} placeholder="Concise description (140–160 characters recommended)" />
      <AdminInput label="Canonical URL" value={seoCanonical} onChange={e => setSeoCanonical(e.target.value)} placeholder="https://agamdiagnostics.com/" />
      <AdminInput label="OG Image URL" value={seoOgImage} onChange={e => setSeoOgImage(e.target.value)} placeholder="/assets/og-home.jpg" />

      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex gap-2 items-start">
        <Info size={13} className="mt-0.5 shrink-0" />
        <span>
          SEO settings are saved separately as <code className="font-mono">draftSeo</code> and published as <code className="font-mono">publishedSeo</code>.
          Changes here are applied when you Save Draft or Publish.
        </span>
      </div>
    </div>
  );

  // ── Active section panel router ─────────────────────────────────────────────
  const renderActivePanel = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'hero': return renderHero();
      case 'statistics': return renderStatistics();
      case 'diagnosticSolutions': return renderDiagnosticSolutions();
      case 'healthCheckupPlans': return renderHealthCheckupPlans();
      case 'patientReviews': return renderPatientReviews();
      case 'qualityCare': return renderQualityCare();
      case 'healthArticles': return renderHealthArticles();
      case 'mainLab': return renderMainLab();
      case 'faq': return renderFaq();
      case 'bookingCta': return renderBookingCta();
      case 'seo': return renderSeo();
      default: return null;
    }
  };

  // ── Entity picker search router ─────────────────────────────────────────────
  const getPickerSearch = () => {
    switch (pickerConfig.type) {
      case 'package': return searchPackages;
      case 'service': return searchServices;
      case 'review': return searchReviews;
      case 'article': return searchArticles;
    }
  };

  const getPickerExcludeIds = () => {
    if (!content) return [];
    switch (pickerConfig.type) {
      case 'package': return content.healthCheckupPlans.packageIds.filter((_, i) => i !== pickerConfig.slotIndex);
      case 'service': return content.diagnosticSolutions.serviceIds.filter((_, i) => i !== pickerConfig.slotIndex);
      case 'review': return content.patientReviews.reviewIds.filter((_, i) => i !== pickerConfig.slotIndex);
      case 'article': return content.healthArticles.blogIds.filter((_, i) => i !== pickerConfig.slotIndex);
    }
  };

  const pickerTitles: Record<string, string> = {
    package: 'Select Package',
    service: 'Select Service',
    review: 'Select Review',
    article: 'Select Article',
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm">Loading CMS Editor…</p>
        </div>
      </div>
    );
  }

  const status = pageData?.status || 'DRAFT';
  const visibilityMap = buildVisibilityMap(content);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* ── Sticky Top Bar ── */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between gap-4 shadow-sm z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">Home Page</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>{status}</span>
              {hasUnsavedChanges && (
                <span className="text-[10px] font-semibold text-orange-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                  Unsaved changes
                </span>
              )}
            </div>
            {pageData?.updatedAt && (
              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                Last saved {new Date(pageData.updatedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => window.open('/admin/website/pages/home/preview', '_blank')}
          >
            <Eye size={14} className="mr-1.5" /> Preview
          </AdminButton>
          <AdminButton variant="secondary" size="sm" onClick={handleSaveDraft} isLoading={saving}>
            <Save size={14} className="mr-1.5" /> Save Draft
          </AdminButton>
          <AdminButton variant="primary" size="sm" onClick={handlePublish} isLoading={publishing}>
            <Globe size={14} className="mr-1.5" /> Publish
          </AdminButton>
        </div>
      </div>

      {/* ── Messages ── */}
      {(errorMsg || successMsg) && (
        <div className="shrink-0 px-5 pt-3">
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
              <CheckCircle size={14} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Two-column body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="shrink-0 hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 overflow-y-auto px-3 py-5">
          <CMSSidebar
            activeSection={activeSection}
            onSelect={setActiveSection}
            visibilityMap={visibilityMap}
          />
        </div>

        {/* Mobile section selector */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-white rounded-xl border border-gray-200 shadow-xl px-4 py-3">
          <CMSSidebar
            activeSection={activeSection}
            onSelect={s => { setActiveSection(s); }}
            visibilityMap={visibilityMap}
          />
        </div>

        {/* Editor panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-6 pb-32">
            {renderActivePanel()}
          </div>
        </div>
      </div>

      {/* ── Entity picker modal ── */}
      <CMSEntityPicker
        isOpen={pickerConfig.open}
        onClose={() => setPickerConfig(p => ({ ...p, open: false }))}
        onSelect={handleEntitySelect}
        searchItems={getPickerSearch()}
        excludeIds={getPickerExcludeIds()}
        title={pickerTitles[pickerConfig.type]}
        placeholder={`Search ${pickerConfig.type}s…`}
      />
    </div>
  );
}
