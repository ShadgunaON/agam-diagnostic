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
import { CMSPage, AboutPageContent, FeatureVariant } from '@/domains/cms/models';
import { aboutData } from '@/data/about';

// ── Default Content (seeded from actual public about page) ─────────────────────
const DEFAULT_CONTENT: AboutPageContent = {
  hero: {
    isVisible: true,
    title: aboutData.hero.title,
    description: aboutData.hero.description,
    image: aboutData.hero.image,
    badges: aboutData.hero.badges,
  },
  trustFeatures: {
    isVisible: true,
    items: aboutData.trustFeatures,
  },
  story: {
    isVisible: true,
    title: aboutData.story.title,
    paragraphs: aboutData.story.paragraphs,
    image: aboutData.story.image,
    stat: aboutData.story.stat,
  },
  missionVision: {
    isVisible: true,
    mission: aboutData.missionVision.mission,
    vision: aboutData.missionVision.vision,
  },
  differenceFeatures: {
    isVisible: true,
    items: aboutData.differenceFeatures as any, // Has variant
  },
  milestones: {
    isVisible: true,
    items: aboutData.milestones as any,
  },
  techFeatures: {
    isVisible: true,
    items: aboutData.techFeatures as any,
  },
  team: {
    isVisible: true,
    members: aboutData.team,
  },
  recognitions: {
    isVisible: true,
    accreditations: aboutData.recognitions.accreditations,
    awards: aboutData.recognitions.awards,
  },
  contactPreview: {
    isVisible: true,
  },
  reviewsCta: {
    isVisible: true,
    eyebrow: 'Trusted by our patients',
    title: 'Verified patient experiences',
    description: '',
    buttonText: 'Read verified patient experiences',
    buttonLink: '/reviews',
  },
  bottomCta: {
    isVisible: true,
    title: 'Ready to Book Your Test?',
    description: 'Choose what works best for you. Visit a nearby lab or let our experts come to you.',
    primaryActionLabel: 'Start Booking',
    primaryActionLink: '/book',
  },
};

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

// ── Shared Variant Selector ───────────────────────────────────────────────────
function VariantSelector({ value, onChange }: { value: FeatureVariant; onChange: (v: FeatureVariant) => void }) {
  const options: { label: string, value: FeatureVariant, colorClass: string }[] = [
    { label: 'Blue', value: 'blue', colorClass: 'bg-blue-100 text-blue-800' },
    { label: 'Green', value: 'green', colorClass: 'bg-green-100 text-green-800' },
    { label: 'Purple', value: 'purple', colorClass: 'bg-purple-100 text-purple-800' },
    { label: 'Orange', value: 'orange', colorClass: 'bg-orange-100 text-orange-800' },
  ];

  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${opt.colorClass} ${value === opt.value ? 'ring-2 ring-offset-1 ring-blue-500 border-transparent' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}


function CMSSectionContainer({ title, description, rightElement, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function AboutCMSPage() {
  const [pageEntity, setPageEntity] = useState<CMSPage | null>(null);
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const sec = searchParams.get('section');
    if (sec) setActiveSection(sec);
  }, [searchParams]);
  
  // Status tracking
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modals state
  const [modals, setModals] = useState({
    trustFeature: false,
    storyParagraph: false,
    differenceFeature: false,
    milestone: false,
    techFeature: false,
    teamMember: false,
    accreditation: false,
    award: false,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempData, setTempData] = useState<any>({});

  // ── Load Data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAboutPage() {
      try {
        const page = await pageService.getPageById('about');
        if (page) {
          setPageEntity(page);
          if (page.draftContent) {
            setContent(JSON.parse(page.draftContent));
          } else {
            setContent(DEFAULT_CONTENT);
          }
        } else {
          // If page doesn't exist yet, we will create it on first save
          setContent(DEFAULT_CONTENT);
        }
      } catch (err) {
        console.error("Failed to load about page CMS", err);
        setContent(DEFAULT_CONTENT);
      } finally {
        setIsLoading(false);
      }
    }
    loadAboutPage();
  }, []);

  // ── Update Content Helper ─────────────────────────────────────────────────
  const updateSection = useCallback((section: keyof AboutPageContent, field: string, value: any) => {
    setContent(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        [section]: {
          ...(prev as any)[section],
          [field]: value
        }
      };
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  const updateRootSection = useCallback((section: keyof AboutPageContent, value: any) => {
    setContent(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [section]: value };
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  // ── Save & Publish ────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      const savedPage = await pageService.updatePage('about', JSON.stringify(content));
      setPageEntity(savedPage);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
    } catch (err) {
      console.error("Failed to save draft", err);
      alert("Failed to save draft. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!content) return;
    setIsPublishing(true);
    try {
      // First save draft, then publish
      await pageService.updatePage('about', JSON.stringify(content));
      const published = await pageService.publishPage('about', JSON.stringify(content));
      setPageEntity(published);
      setHasUnsavedChanges(false);
      alert("About Page published successfully!");
    } catch (err) {
      console.error("Failed to publish", err);
      alert("Failed to publish. Check console.");
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Handlers for arrays ───────────────────────────────────────────────────
  const openModal = (modalName: keyof typeof modals, idx: number | null = null, defaultData: any = {}) => {
    setEditingIndex(idx);
    setTempData(defaultData);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setEditingIndex(null);
    setTempData({});
  };

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] -mx-4 -my-4 lg:-mx-8 lg:-my-8 bg-gray-50">
      
      {/* ── Top Action Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 z-10 sticky top-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            About Page CMS
            {pageEntity?.status === 'PUBLISHED' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Globe className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertCircle className="w-3 h-3" /> Draft
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            {lastSavedAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last saved {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/preview/about"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Preview Draft
          </a>
          <AdminButton
            variant="secondary"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            disabled={!hasUnsavedChanges && !!pageEntity?.draftContent}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={handlePublish}
            isLoading={isPublishing}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Publish to Live
          </AdminButton>
        </div>
      </div>

      {/* ── Main Layout ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Right Editor Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* 1. HERO */}
            {activeSection === 'hero' && (
              <CMSSectionContainer
                title="Hero Section"
                description="Main introduction at the top of the About page."
                rightElement={<VisibilityToggle value={content.hero?.isVisible ?? true} onChange={(v) => updateSection('hero', 'isVisible', v)} />}
              >
                <div className="p-5 space-y-5">
                  <AdminInput
                    label="Headline"
                    value={content.hero?.title || ''}
                    onChange={(e) => updateSection('hero', 'title', e.target.value)}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                    <AdminImageEditor
                      value={content.hero?.image || ''}
                      onChange={(v) => updateSection('hero', 'image', v)}
                      
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Badges</label>
                    <div className="flex flex-wrap gap-2">
                      {content.hero?.badges?.map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white border rounded-full pl-3 pr-1 py-1 text-sm">
                          {badge}
                          <button
                            type="button"
                            onClick={() => {
                              const newBadges = [...(content.hero?.badges || [])];
                              newBadges.splice(idx, 1);
                              updateSection('hero', 'badges', newBadges);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const val = prompt("Enter new badge text:");
                          if (val) {
                            updateSection('hero', 'badges', [...(content.hero?.badges || []), val]);
                          }
                        }}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border rounded-full px-3 py-1 text-sm text-gray-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Badge
                      </button>
                    </div>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 2. TRUST FEATURES */}
            {activeSection === 'trustFeatures' && (
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
                      onClick={() => openModal('trustFeature', null, { title: '', description: '', icon: 'Shield' })}
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
            )}

            {/* 3. STORY */}
            {activeSection === 'story' && (
              <CMSSectionContainer
                title="Who We Are (Story)"
                description="The main company introduction text and side image."
                rightElement={<VisibilityToggle value={content.story?.isVisible ?? true} onChange={(v) => updateSection('story', 'isVisible', v)} />}
              >
                <div className="p-5 space-y-6">
                  <AdminInput
                    label="Section Title"
                    value={content.story?.title || ''}
                    onChange={(e) => updateSection('story', 'title', e.target.value)}
                  />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Paragraphs</label>
                      <button
                        type="button"
                        onClick={() => openModal('storyParagraph', null, { text: '' })}
                        className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Paragraph
                      </button>
                    </div>
                    <div className="space-y-3">
                      {content.story?.paragraphs?.map((p, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border group">
                          <p className="flex-1 text-sm text-gray-700 leading-relaxed">{p}</p>
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openModal('storyParagraph', idx, { text: p })}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newP = [...(content.story?.paragraphs || [])];
                                newP.splice(idx, 1);
                                updateSection('story', 'paragraphs', newP);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Side Image</label>
                    <AdminImageEditor
                      value={content.story?.image || ''}
                      onChange={(v) => updateSection('story', 'image', v)}
                      
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput
                      label="Stat Highlight Value"
                      value={content.story?.stat?.value || ''}
                      onChange={(e) => updateSection('story', 'stat', { ...content.story?.stat, value: e.target.value })}
                      placeholder="e.g. 10+"
                    />
                    <AdminInput
                      label="Stat Highlight Label"
                      value={content.story?.stat?.label || ''}
                      onChange={(e) => updateSection('story', 'stat', { ...content.story?.stat, label: e.target.value })}
                      placeholder="e.g. Years Experience"
                    />
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 4. MISSION & VISION */}
            {activeSection === 'missionVision' && (
              <CMSSectionContainer
                title="Mission & Vision"
                description="Core values blocks."
                rightElement={<VisibilityToggle value={content.missionVision?.isVisible ?? true} onChange={(v) => updateSection('missionVision', 'isVisible', v)} />}
              >
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-gray-50 p-4 rounded-xl border">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <LucideIcons.Target className="w-4 h-4" />
                      </div>
                      Mission
                    </h4>
                    <AdminInput
                      label="Title"
                      value={content.missionVision?.mission?.title || ''}
                      onChange={(e) => updateSection('missionVision', 'mission', { ...content.missionVision?.mission, title: e.target.value })}
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={content.missionVision?.mission?.description || ''}
                        onChange={(e) => updateSection('missionVision', 'mission', { ...content.missionVision?.mission, description: e.target.value })}
                        rows={5}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-xl border">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <LucideIcons.Eye className="w-4 h-4" />
                      </div>
                      Vision
                    </h4>
                    <AdminInput
                      label="Title"
                      value={content.missionVision?.vision?.title || ''}
                      onChange={(e) => updateSection('missionVision', 'vision', { ...content.missionVision?.vision, title: e.target.value })}
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={content.missionVision?.vision?.description || ''}
                        onChange={(e) => updateSection('missionVision', 'vision', { ...content.missionVision?.vision, description: e.target.value })}
                        rows={5}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 5. AGAM DIFFERENCE */}
            {activeSection === 'differenceFeatures' && (
              <CMSSectionContainer
                title="The Agam Difference"
                description="Key differentiator cards."
                rightElement={<VisibilityToggle value={content.differenceFeatures?.isVisible ?? true} onChange={(v) => updateSection('differenceFeatures', 'isVisible', v)} />}
              >
                <div className="p-5">
                  <div className="space-y-4">
                    {content.differenceFeatures?.items?.map((item, idx) => (
                      <CMSCardItem
                        key={idx}
                        index={idx} total={content.trustFeatures?.items?.length || 1} title={item.title}
                        subtitle={item.description}
                        badge={item.variant}
                        onEdit={() => openModal('differenceFeature', idx, item)}
                        onRemove={() => {
                          const newItems = [...(content.differenceFeatures?.items || [])];
                          newItems.splice(idx, 1);
                          updateSection('differenceFeatures', 'items', newItems);
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => openModal('differenceFeature', null, { title: '', description: '', variant: 'blue' })}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Differentiator
                    </button>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 6. MILESTONES */}
            {activeSection === 'milestones' && (
              <CMSSectionContainer
                title="Journey Tracker (Milestones)"
                description="Timeline of company achievements."
                rightElement={<VisibilityToggle value={content.milestones?.isVisible ?? true} onChange={(v) => updateSection('milestones', 'isVisible', v)} />}
              >
                <div className="p-5">
                  <div className="space-y-4">
                    {content.milestones?.items?.map((item, idx) => (
                      <CMSCardItem
                        key={idx}
                        index={idx} total={content.milestones?.items?.length || 1} title={`${item.year} - ${item.title}`}
                        subtitle={item.description}
                        badge={`Progress: ${item.progress}% | ${item.variant}`}
                        onEdit={() => openModal('milestone', idx, item)}
                        onRemove={() => {
                          const newItems = [...(content.milestones?.items || [])];
                          newItems.splice(idx, 1);
                          updateSection('milestones', 'items', newItems);
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => openModal('milestone', null, { year: '', title: '', progress: 100, description: '', variant: 'blue' })}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Milestone
                    </button>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 7. TECHNOLOGY */}
            {activeSection === 'techFeatures' && (
              <CMSSectionContainer
                title="Technology & Infrastructure"
                description="Cards highlighting equipment and processes."
                rightElement={<VisibilityToggle value={content.techFeatures?.isVisible ?? true} onChange={(v) => updateSection('techFeatures', 'isVisible', v)} />}
              >
                <div className="p-5">
                  <div className="space-y-4">
                    {content.techFeatures?.items?.map((item, idx) => (
                      <CMSCardItem
                        key={idx}
                        index={idx} total={content.trustFeatures?.items?.length || 1} title={item.title}
                        subtitle={item.description}
                        badge={item.variant}
                        onEdit={() => openModal('techFeature', idx, item)}
                        onRemove={() => {
                          const newItems = [...(content.techFeatures?.items || [])];
                          newItems.splice(idx, 1);
                          updateSection('techFeatures', 'items', newItems);
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => openModal('techFeature', null, { title: '', description: '', variant: 'purple' })}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Tech Feature
                    </button>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 8. TEAM */}
            {activeSection === 'team' && (
              <CMSSectionContainer
                title="Our Team"
                description="Leadership and key medical professionals."
                rightElement={<VisibilityToggle value={content.team?.isVisible ?? true} onChange={(v) => updateSection('team', 'isVisible', v)} />}
              >
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {content.team?.members?.map((member, idx) => (
                      <div key={idx} className="relative bg-white border rounded-xl overflow-hidden shadow-sm group">
                        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={member.image || '/assets/placeholder-person.jpg'} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{member.name}</h4>
                          <p className="text-xs text-blue-600 font-medium mb-1 line-clamp-1">{member.role}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{member.qualification}</p>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openModal('teamMember', idx, member)}
                            className="p-1.5 bg-white text-gray-700 hover:text-blue-600 rounded shadow"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newMembers = [...(content.team?.members || [])];
                              newMembers.splice(idx, 1);
                              updateSection('team', 'members', newMembers);
                            }}
                            className="p-1.5 bg-white text-gray-700 hover:text-red-600 rounded shadow"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => openModal('teamMember', null, { name: '', role: '', qualification: '', image: '' })}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-colors group aspect-[4/3]"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
                        <Plus className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Add Team Member</span>
                    </button>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 9. RECOGNITIONS */}
            {activeSection === 'recognitions' && (
              <CMSSectionContainer
                title="Recognitions & Awards"
                description="Manage accreditations and industry awards."
                rightElement={<VisibilityToggle value={content.recognitions?.isVisible ?? true} onChange={(v) => updateSection('recognitions', 'isVisible', v)} />}
              >
                <div className="p-5 space-y-8">
                  {/* Accreditations */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Accreditations</h3>
                    <div className="space-y-4 mb-4">
                      <AdminInput
                        label="Title"
                        value={content.recognitions?.accreditations?.title || ''}
                        onChange={(e) => updateSection('recognitions', 'accreditations', { ...content.recognitions?.accreditations, title: e.target.value })}
                      />
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Introductory Text</label>
                        <textarea
                          value={content.recognitions?.accreditations?.intro || ''}
                          onChange={(e) => updateSection('recognitions', 'accreditations', { ...content.recognitions?.accreditations, intro: e.target.value })}
                          rows={2}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {content.recognitions?.accreditations?.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border group">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openModal('accreditation', idx, item)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = [...(content.recognitions?.accreditations?.items || [])];
                              newItems.splice(idx, 1);
                              updateSection('recognitions', 'accreditations', { ...content.recognitions?.accreditations, items: newItems });
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => openModal('accreditation', null, { title: '', description: '' })}
                        className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-4 h-4" /> Add Accreditation
                      </button>
                    </div>
                  </div>

                  {/* Awards */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Awards</h3>
                    <div className="space-y-4 mb-4">
                      <AdminInput
                        label="Title"
                        value={content.recognitions?.awards?.title || ''}
                        onChange={(e) => updateSection('recognitions', 'awards', { ...content.recognitions?.awards, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      {content.recognitions?.awards?.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border group">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            <p className="text-xs text-blue-600 font-medium">{item.category}</p>
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openModal('award', idx, item)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = [...(content.recognitions?.awards?.items || [])];
                              newItems.splice(idx, 1);
                              updateSection('recognitions', 'awards', { ...content.recognitions?.awards, items: newItems });
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => openModal('award', null, { title: '', category: '', description: '' })}
                        className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-4 h-4" /> Add Award
                      </button>
                    </div>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 10. CONTACT PREVIEW */}
            {activeSection === 'contactPreview' && (
              <CMSSectionContainer
                title="Contact Section Preview"
                description="Toggles the visibility of the global Contact section on the About page."
                rightElement={<VisibilityToggle value={content.contactPreview?.isVisible ?? true} onChange={(v) => updateSection('contactPreview', 'isVisible', v)} />}
              >
                <div className="p-5">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      This section displays the shared contact information from your main Home Page CMS. You can only toggle its visibility on the About page here. To edit the actual contact details, please use the Home Page CMS.
                    </p>
                  </div>
                </div>
              </CMSSectionContainer>
            )}

            {/* 11. REVIEWS CTA */}
            {activeSection === 'reviewsCta' && (
              <CMSSectionContainer
                title="Reviews Call-To-Action"
                description="A subtle banner encouraging visitors to read reviews."
                rightElement={<VisibilityToggle value={content.reviewsCta?.isVisible ?? true} onChange={(v) => updateSection('reviewsCta', 'isVisible', v)} />}
              >
                <div className="p-5 space-y-4">
                  <AdminInput
                    label="Eyebrow"
                    value={content.reviewsCta?.eyebrow || ''}
                    onChange={(e) => updateSection('reviewsCta', 'eyebrow', e.target.value)}
                    placeholder="e.g. Trusted by our patients"
                  />
                  <AdminInput
                    label="Title / Main Link Text"
                    value={content.reviewsCta?.title || ''}
                    onChange={(e) => updateSection('reviewsCta', 'title', e.target.value)}
                  />
                  <AdminInput
                    label="Button Text"
                    value={content.reviewsCta?.buttonText || ''}
                    onChange={(e) => updateSection('reviewsCta', 'buttonText', e.target.value)}
                  />
                  <AdminInput
                    label="Button Link"
                    value={content.reviewsCta?.buttonLink || ''}
                    onChange={(e) => updateSection('reviewsCta', 'buttonLink', e.target.value)}
                  />
                </div>
              </CMSSectionContainer>
            )}

            {/* 12. BOTTOM CTA */}
            {activeSection === 'bottomCta' && (
              <CMSSectionContainer
                title="Bottom CTA"
                description="Final call to action at the bottom of the page."
                rightElement={<VisibilityToggle value={content.bottomCta?.isVisible ?? true} onChange={(v) => updateSection('bottomCta', 'isVisible', v)} />}
              >
                <div className="p-5 space-y-4">
                  <AdminInput
                    label="Heading"
                    value={content.bottomCta?.title || ''}
                    onChange={(e) => updateSection('bottomCta', 'title', e.target.value)}
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
                      label="Button Text"
                      value={content.bottomCta?.primaryActionLabel || ''}
                      onChange={(e) => updateSection('bottomCta', 'primaryActionLabel', e.target.value)}
                    />
                    <AdminInput
                      label="Button Link"
                      value={content.bottomCta?.primaryActionLink || ''}
                      onChange={(e) => updateSection('bottomCta', 'primaryActionLink', e.target.value)}
                    />
                  </div>
                </div>
              </CMSSectionContainer>
            )}

          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      
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
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={tempData.description || ''}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <AdminIconPicker
              value={tempData.icon || 'Shield'}
              onChange={(v) => setTempData({ ...tempData, icon: v })}
            />
          </div>
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
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

      {/* Story Paragraph Modal */}
      <CMSModal
        isOpen={modals.storyParagraph}
        onClose={() => closeModal('storyParagraph')}
        title={editingIndex !== null ? 'Edit Paragraph' : 'Add Paragraph'}
        
      >
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Paragraph Text</label>
          <textarea
            value={tempData.text || ''}
            onChange={(e) => setTempData({ ...tempData, text: e.target.value })}
            rows={5}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <AdminButton variant="primary" onClick={() => {
          if (!tempData.text) return;
          const newItems = [...(content.story?.paragraphs || [])];
          if (editingIndex !== null) newItems[editingIndex] = tempData.text;
          else newItems.push(tempData.text);
          updateSection('story', 'paragraphs', newItems);
          closeModal('storyParagraph');
        }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('storyParagraph')}>Cancel</AdminButton>
        </div>
      </CMSModal>

      {/* Difference Feature Modal */}
      <CMSModal
        isOpen={modals.differenceFeature}
        onClose={() => closeModal('differenceFeature')}
        title={editingIndex !== null ? 'Edit Difference Feature' : 'Add Difference Feature'}
        
      >
        <div className="space-y-4">
          <AdminInput
            label="Title"
            value={tempData.title || ''}
            onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={tempData.description || ''}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Variant</label>
            <VariantSelector
              value={tempData.variant || 'blue'}
              onChange={(v) => setTempData({ ...tempData, variant: v })}
            />
          </div>
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <AdminButton variant="primary" onClick={() => {
          const newItems = [...(content.differenceFeatures?.items || [])];
          if (editingIndex !== null) newItems[editingIndex] = tempData;
          else newItems.push(tempData);
          updateSection('differenceFeatures', 'items', newItems);
          closeModal('differenceFeature');
        }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('differenceFeature')}>Cancel</AdminButton>
        </div>
      </CMSModal>

      {/* Milestone Modal */}
      <CMSModal
        isOpen={modals.milestone}
        onClose={() => closeModal('milestone')}
        title={editingIndex !== null ? 'Edit Milestone' : 'Add Milestone'}
        
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Year"
              value={tempData.year || ''}
              onChange={(e) => setTempData({ ...tempData, year: e.target.value })}
            />
            <AdminInput
              label="Progress % (0-100)"
              type="number"
              min={0}
              max={100}
              value={tempData.progress || 0}
              onChange={(e) => setTempData({ ...tempData, progress: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <AdminInput
            label="Title"
            value={tempData.title || ''}
            onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={tempData.description || ''}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Variant</label>
            <VariantSelector
              value={tempData.variant || 'blue'}
              onChange={(v) => setTempData({ ...tempData, variant: v })}
            />
          </div>
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <AdminButton variant="primary" onClick={() => {
          const newItems = [...(content.milestones?.items || [])];
          if (editingIndex !== null) newItems[editingIndex] = tempData;
          else newItems.push(tempData);
          updateSection('milestones', 'items', newItems);
          closeModal('milestone');
        }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('milestone')}>Cancel</AdminButton>
        </div>
      </CMSModal>

      {/* Tech Feature Modal */}
      <CMSModal
        isOpen={modals.techFeature}
        onClose={() => closeModal('techFeature')}
        title={editingIndex !== null ? 'Edit Tech Feature' : 'Add Tech Feature'}
        
      >
        <div className="space-y-4">
          <AdminInput
            label="Title"
            value={tempData.title || ''}
            onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={tempData.description || ''}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Variant</label>
            <VariantSelector
              value={tempData.variant || 'purple'}
              onChange={(v) => setTempData({ ...tempData, variant: v })}
            />
          </div>
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <AdminButton variant="primary" onClick={() => {
          const newItems = [...(content.techFeatures?.items || [])];
          if (editingIndex !== null) newItems[editingIndex] = tempData;
          else newItems.push(tempData);
          updateSection('techFeatures', 'items', newItems);
          closeModal('techFeature');
        }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('techFeature')}>Cancel</AdminButton>
        </div>
      </CMSModal>

      {/* Team Member Modal */}
      <CMSModal
        isOpen={modals.teamMember}
        onClose={() => closeModal('teamMember')}
        title={editingIndex !== null ? 'Edit Team Member' : 'Add Team Member'}
        
      >
        <div className="space-y-4">
          <AdminInput
            label="Name"
            value={tempData.name || ''}
            onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
          />
          <AdminInput
            label="Role"
            value={tempData.role || ''}
            onChange={(e) => setTempData({ ...tempData, role: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <textarea
              value={tempData.qualification || ''}
              onChange={(e) => setTempData({ ...tempData, qualification: e.target.value })}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <AdminImageEditor
              value={tempData.image || ''}
              onChange={(v) => setTempData({ ...tempData, image: v })}
              
            />
          </div>
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <AdminButton variant="primary" onClick={() => {
          const newItems = [...(content.team?.members || [])];
          if (editingIndex !== null) newItems[editingIndex] = tempData;
          else newItems.push(tempData);
          updateSection('team', 'members', newItems);
          closeModal('teamMember');
        }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('teamMember')}>Cancel</AdminButton>
        </div>
      </CMSModal>

      {/* Accreditation Modal */}
      <CMSModal
        isOpen={modals.accreditation}
        onClose={() => closeModal('accreditation')}
        title={editingIndex !== null ? 'Edit Accreditation' : 'Add Accreditation'}
        
      >
        <div className="space-y-4">
          <AdminInput
            label="Title"
            value={tempData.title || ''}
            onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={tempData.description || ''}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <AdminButton variant="primary" onClick={() => {
          const newItems = [...(content.recognitions?.accreditations?.items || [])];
          if (editingIndex !== null) newItems[editingIndex] = tempData;
          else newItems.push(tempData);
          updateSection('recognitions', 'accreditations', { ...content.recognitions?.accreditations, items: newItems });
          closeModal('accreditation');
        }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('accreditation')}>Cancel</AdminButton>
        </div>
      </CMSModal>

      {/* Award Modal */}
      <CMSModal
        isOpen={modals.award}
        onClose={() => closeModal('award')}
        title={editingIndex !== null ? 'Edit Award' : 'Add Award'}
        
      >
        <div className="space-y-4">
          <AdminInput
            label="Title"
            value={tempData.title || ''}
            onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
          />
          <AdminInput
            label="Category"
            value={tempData.category || ''}
            onChange={(e) => setTempData({ ...tempData, category: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={tempData.description || ''}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <AdminButton variant="primary" onClick={() => {
          const newItems = [...(content.recognitions?.awards?.items || [])];
          if (editingIndex !== null) newItems[editingIndex] = tempData;
          else newItems.push(tempData);
          updateSection('recognitions', 'awards', { ...content.recognitions?.awards, items: newItems });
          closeModal('award');
        }} className="flex-1">Save</AdminButton>
          <AdminButton variant="ghost" onClick={() => closeModal('award')}>Cancel</AdminButton>
        </div>
      </CMSModal>

    </div>
  );
}
