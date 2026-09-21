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

import { CMSModal } from '@/components/admin/cms/CMSModal';
import { CMSCardItem } from '@/components/admin/cms/CMSCardItem';
import * as LucideIcons from 'lucide-react';

import { pageService } from '@/services/PageService';
import { CMSPage, ServicesPageContent } from '@/domains/cms/models';

// Default Content (used if page is completely empty)
const DEFAULT_CONTENT: ServicesPageContent = {
  hero: {
    isVisible: true,
    title: "Our Services",
    description: "Comprehensive healthcare services tailored to your needs. From diagnostic imaging to specialized consultations.",
    image: "/images/services_hero_pic.png",
  },
  trustFeatures: {
    isVisible: true,
    items: [
      { title: "NABL Accredited", description: "Highest quality standards", icon: "ShieldCheck" },
      { title: "Fastest Reports", description: "Same day delivery online", icon: "Clock" },
      { title: "Free Home Collection", description: "Available across Madurai", icon: "Home" },
      { title: "24/7 Support", description: "Call or WhatsApp anytime", icon: "Phone" }
    ],
  },
  catalog: {
    isVisible: true,
  },
  bottomCta: {
    isVisible: true,
    title: "Need a diagnostic test?",
    description: "Walk-in today or book an appointment for home collection. Get accurate results with NABL-accredited quality.",
    primaryActionLabel: "Book Appointment",
    primaryActionLink: "/book",
    secondaryActionLabel: "Call Now",
    secondaryActionLink: "tel:1800-123-4567"
  }
};

// Layout Components
function CMSSectionContainer({
  title,
  description,
  children,
  rightElement
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SectionHeader({ title, description, isVisible }: { title: string; description?: string; isVisible?: boolean }) {
  return (
    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {isVisible !== undefined && (
        <div className={`px-2 py-1 rounded text-xs font-medium ${isVisible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {isVisible ? 'Visible' : 'Hidden'}
        </div>
      )}
    </div>
  );
}

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-xs text-gray-500 font-medium">Visible on site</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md bg-white opacity-0" />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${value ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </label>
  );
}

export default function ServicesPageCMS() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section') || 'overview';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<CMSPage | null>(null);
  const [content, setContent] = useState<ServicesPageContent>(DEFAULT_CONTENT);

  // Modals state
  const [modals, setModals] = useState({
    trustFeature: false,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempData, setTempData] = useState<any>({});

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setLoading(true);
      const res = await pageService.getPageById('services');
      if (res) {
        setPage(res);
        if (res.draftContent) {
          const parsed = JSON.parse(res.draftContent);
          // Safely merge with DEFAULT_CONTENT in case some nested fields are missing
          setContent({ ...DEFAULT_CONTENT, ...parsed });
        } else {
          setContent(DEFAULT_CONTENT);
        }
      }
    } catch (err) {
      console.error("Failed to load services page content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!page) return;
    try {
      setSaving(true);
      const draftContent = JSON.stringify(content);
      await pageService.updatePage(page.id, draftContent);
      await loadPage();
      alert('Draft saved successfully!');
    } catch (err) {
      alert('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    try {
      setSaving(true);
      await pageService.publishPage(page.id, 'admin');
      await loadPage();
      alert('Changes published successfully!');
    } catch (err) {
      alert('Failed to publish changes');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: keyof ServicesPageContent, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const openModal = (modalName: keyof typeof modals, index: number | null, defaultData: any = {}) => {
    setEditingIndex(index);
    setTempData(defaultData);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setEditingIndex(null);
    setTempData({});
  };

  const hasUnpublishedChanges = page?.draftContent !== page?.publishedContent;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm">Loading CMS Editor...</p>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <SectionHeader title="Services Page Overview" description="Current status and content summary" />

            {/* Status cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {hasUnpublishedChanges ? (
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-sm">
                        <AlertCircle className="w-4 h-4" /> Draft Saved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                        <CheckCircle className="w-4 h-4" /> Published
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Globe className={`w-5 h-5 ${hasUnpublishedChanges ? 'text-amber-500' : 'text-green-500'}`} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex gap-3 leading-relaxed">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>How to edit this page:</strong> Select a section from the left sidebar to edit its content. Remember to save your drafts. When you are ready for the public to see the changes, click "Publish to Live" in the top bar. Note: The actual service items shown on the Services page are loaded dynamically from the Services Catalog, not managed here.
              </div>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Hero Section"
              description="The main banner visible at the top of the Services page."
              isVisible={content.hero?.isVisible}
            />
            
            <CMSSectionContainer
              title="Content"
              rightElement={<VisibilityToggle value={content.hero?.isVisible ?? true} onChange={(v) => updateSection('hero', 'isVisible', v)} />}
            >
              <div className="p-5 space-y-4">
                <AdminInput
                  label="Eyebrow Label"
                  value={content.hero?.eyebrow || ''}
                  onChange={(e) => updateSection('hero', 'eyebrow', e.target.value)}
                  placeholder="e.g. Clinical & Diagnostic Services"
                />
                <AdminInput
                  label="Main Heading"
                  value={content.hero?.title || ''}
                  onChange={(e) => updateSection('hero', 'title', e.target.value)}
                  placeholder="Our Services"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={content.hero?.description || ''}
                    onChange={(e) => updateSection('hero', 'description', e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Hero Image">
              <div className="p-5">
                <AdminImageEditor
                  value={content.hero?.image || ''}
                  onChange={(val) => updateSection('hero', 'image', val)}
                />
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'trustFeatures':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Trust Bar Features"
              description="The horizontal bar with 4 key highlights."
              isVisible={content.trustFeatures?.isVisible}
            />

            <CMSSectionContainer
              title="Trust Bar Features"
              description="The horizontal bar with 4 key highlights."
              rightElement={<VisibilityToggle value={content.trustFeatures?.isVisible ?? true} onChange={(v) => updateSection('trustFeatures', 'isVisible', v)} />}
            >
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.trustFeatures?.items?.map((item, idx) => {
                    const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Check;
                    return (
                      <CMSCardItem
                        key={idx}
                        index={idx} total={content.trustFeatures?.items?.length || 1} title={item.title}
                        subtitle={item.description}
                        icon={<IconComponent className="w-5 h-5 text-blue-600" />}
                        onEdit={() => openModal('trustFeature', idx, item)}
                        onRemove={() => {
                          const newItems = [...(content.trustFeatures?.items || [])];
                          newItems.splice(idx, 1);
                          updateSection('trustFeatures', 'items', newItems);
                        }}
                      />
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => openModal('trustFeature', null, { title: '', description: '', icon: 'ShieldCheck' })}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
                      <Plus className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Add Feature</span>
                  </button>
                </div>
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'catalog':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Services Catalog List"
              description="Dynamic list of services."
              isVisible={content.catalog?.isVisible}
            />

            <CMSSectionContainer
              title="Visibility Control"
              description="Show or hide the actual service items list."
              rightElement={<VisibilityToggle value={content.catalog?.isVisible ?? true} onChange={(v) => updateSection('catalog', 'isVisible', v)} />}
            >
              <div className="p-5">
                <div className="bg-gray-50 text-gray-600 p-4 rounded-xl text-sm border border-gray-200">
                  <p><strong>Note:</strong> The actual services displayed in this section are managed via the <strong>Catalog &gt; Services</strong> module in the sidebar. This page only controls whether the section is visible on the public Services page.</p>
                </div>
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'bottomCta':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Bottom Call-to-Action"
              description="The final prompt at the bottom of the page."
              isVisible={content.bottomCta?.isVisible}
            />

            <CMSSectionContainer
              title="CTA Content"
              rightElement={<VisibilityToggle value={content.bottomCta?.isVisible ?? true} onChange={(v) => updateSection('bottomCta', 'isVisible', v)} />}
            >
              <div className="p-5 space-y-4">
                <AdminInput
                  label="Heading"
                  value={content.bottomCta?.title || ''}
                  onChange={(e) => updateSection('bottomCta', 'title', e.target.value)}
                  placeholder="Need a diagnostic test?"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={content.bottomCta?.description || ''}
                    onChange={(e) => updateSection('bottomCta', 'description', e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput
                    label="Primary Action Label"
                    value={content.bottomCta?.primaryActionLabel || ''}
                    onChange={(e) => updateSection('bottomCta', 'primaryActionLabel', e.target.value)}
                    placeholder="Book Appointment"
                  />
                  <AdminInput
                    label="Primary Action Link"
                    value={content.bottomCta?.primaryActionLink || ''}
                    onChange={(e) => updateSection('bottomCta', 'primaryActionLink', e.target.value)}
                    placeholder="/book"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <AdminInput
                    label="Secondary Action Label"
                    value={content.bottomCta?.secondaryActionLabel || ''}
                    onChange={(e) => updateSection('bottomCta', 'secondaryActionLabel', e.target.value)}
                    placeholder="Call Now"
                  />
                  <AdminInput
                    label="Secondary Action Link"
                    value={content.bottomCta?.secondaryActionLink || ''}
                    onChange={(e) => updateSection('bottomCta', 'secondaryActionLink', e.target.value)}
                    placeholder="tel:1800-123-4567"
                  />
                </div>
              </div>
            </CMSSectionContainer>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium">Select a section to edit</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      
      {/* ── Top Action Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              Services Page CMS
              {page?.status === 'PUBLISHED' && !hasUnpublishedChanges && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage public-facing content for the Services page</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/preview/services"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            Preview Draft
          </a>
          <AdminButton
            variant="ghost"
            onClick={handleSaveDraft}
            isLoading={saving}
          >
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={handlePublish}
            isLoading={saving}
            disabled={!hasUnpublishedChanges}
            className={hasUnpublishedChanges ? 'animate-pulse-subtle shadow-blue-500/20 shadow-lg ring-2 ring-blue-500/20' : ''}
          >
            <Globe className="w-4 h-4 mr-2" /> Publish to Live
          </AdminButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {renderActiveSection()}
        </div>
      </div>

      {/* Trust Feature Modal */}
      <CMSModal
        isOpen={modals.trustFeature}
        onClose={() => closeModal('trustFeature')}
        title={editingIndex !== null ? 'Edit Trust Feature' : 'Add Trust Feature'}
      >
        <div className="space-y-4">
          <AdminInput
            label="Title"
            value={tempData.title || ''}
            onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
            placeholder="e.g. Fastest Reports"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={tempData.description || ''}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Short detail..."
            />
          </div>
          <AdminIconPicker
            label="Icon"
            value={tempData.icon || 'CheckCircle'}
            onChange={(val) => setTempData({ ...tempData, icon: val })}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <AdminButton variant="primary" onClick={() => {
            const newItems = [...(content.trustFeatures?.items || [])];
            if (editingIndex !== null) newItems[editingIndex] = tempData;
            else newItems.push(tempData);
            updateSection('trustFeatures', 'items', newItems);
            closeModal('trustFeature');
          }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('trustFeature')}>Cancel</AdminButton>
        </div>
      </CMSModal>

    </div>
  );
}
