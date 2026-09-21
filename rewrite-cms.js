const fs = require('fs');
const path = require('path');

const fileContent = `"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { pageService } from '@/services/PageService';
import { packageService } from '@/services';
import { CMSPage, HealthPackagesPageContent } from '@/domains/cms/models';
import { PackageItem } from '@/domains/packages/model';

import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { AdminIconPicker } from '@/components/admin/cms/AdminIconPicker';
import { AdminImageEditor } from '@/components/admin/cms/AdminImageEditor';
import { Save, Globe, Eye, Plus, Trash2, GripVertical, CheckCircle, AlertCircle } from 'lucide-react';

function SectionHeader({ title, description, isVisible }: { title: string; description?: string; isVisible?: boolean }) {
  return (
    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {isVisible !== undefined && (
        <div className={\`px-2 py-1 rounded text-xs font-medium \${isVisible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}\`}>
          {isVisible ? 'Visible' : 'Hidden'}
        </div>
      )}
    </div>
  );
}

function CMSSectionContainer({ title, description, children, rightElement }: { title: string; description?: string; children?: React.ReactNode; rightElement?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <span className="text-sm font-medium text-gray-700">{value ? 'Visible' : 'Hidden'}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <div className={\`block w-10 h-6 rounded-full transition-colors \${value ? 'bg-green-500' : 'bg-gray-300'}\`}></div>
        <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${value ? 'translate-x-4' : ''}\`}></div>
      </div>
    </label>
  );
}

function AdminTextarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (val: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
}

const DEFAULT_CONTENT: HealthPackagesPageContent = {
  hero: {
    title: 'Health Packages',
    description: 'Comprehensive preventive health checkups for you and your family.',
    image: '/images/health-packages.jpg',
    imageAlt: 'Health Packages',
    primaryActionLabel: 'Browse Packages',
    primaryActionLink: '#browse-category',
    eyebrow: 'Health Packages',
    isVisible: true,
  },
  preventiveCare: {
    eyebrow: 'Why It Matters',
    title: 'Preventive Care Saves Lives',
    description: 'Over 70% of chronic diseases are preventable with early detection.',
    isVisible: true,
  },
  benefits: {
    isVisible: true,
    items: [
      { title: 'Complete Assessment', description: 'Comprehensive screening covering vital parameters.', icon: 'target' },
      { title: 'Free Consultation', description: 'Expert doctor consultation on your reports.', icon: 'shield' },
      { title: 'Home Collection', description: 'Safe sample collection from your doorstep.', icon: 'calendar' },
      { title: 'Smart Reports', description: 'Easy-to-understand reports delivered quickly.', icon: 'activity' }
    ]
  },
  process: {
    eyebrow: 'How It Works',
    title: '4 Simple Steps to Better Health',
    description: '',
    isVisible: true,
    steps: [
      { title: 'Book a Test', description: 'Choose your package and book online.' },
      { title: 'Sample Collection', description: 'Our phlebotomist collects your sample.' },
      { title: 'Lab Analysis', description: 'Your sample is processed in our NABL lab.' },
      { title: 'Get Reports', description: 'Receive reports online and consult doctor.' }
    ]
  },
  category: {
    eyebrow: 'Browse by Category',
    title: 'Find the Right Package for You',
    description: 'Our health packages are organized based on specific needs.',
    isVisible: true,
  },
  featured: {
    eyebrow: 'Most Popular',
    title: 'Featured Health Packages',
    description: 'Our most recommended packages.',
    packageIds: [],
    isVisible: true,
  },
  advantage: {
    eyebrow: 'The AGAM Advantage',
    title: 'Why Choose AGAM Packages',
    description: 'Designed with clinical precision.',
    isVisible: true,
    items: [
      { title: "NABL Accredited", description: "Highest accuracy.", icon: "award" },
      { title: "Fastest Reports", description: "Delivered within 12 hours.", icon: "clock" },
      { title: "Free Home Collection", description: "Expert phlebotomists.", icon: "home" },
      { title: "24/7 Expert Support", description: "Doctors available to guide you.", icon: "phone" }
    ]
  },
  bottomCta: {
    title: 'Not sure which package is right for you?',
    description: 'Our diagnostic experts can help you choose.',
    primaryActionLabel: 'Book a Free Consultation',
    primaryActionLink: '/contact',
    secondaryActionLabel: 'Call: +91 89408 94079',
    secondaryActionLink: 'tel:+918940894079',
    isVisible: true,
  }
};

export default function HealthPackagesCMSPage() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section') || 'overview';
  
  const [page, setPage] = useState<CMSPage | null>(null);
  const [content, setContent] = useState<HealthPackagesPageContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  
  const [availablePackages, setAvailablePackages] = useState<PackageItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    loadPage();
    loadCatalog();
  }, []);

  const loadPage = async () => {
    try {
      setLoading(true);
      const res = await pageService.getPageById('health-packages');
      if (res) {
        setPage(res);
        if (res.draftContent) {
          const parsed = JSON.parse(res.draftContent);
          setContent({ ...DEFAULT_CONTENT, ...parsed });
        } else {
          setContent(DEFAULT_CONTENT);
        }
      }
    } catch (err) {
      console.error('Failed to load health packages page:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      setCatalogLoading(true);
      const res = await packageService.getCatalog(1, 100);
      if (res.isSuccess) {
        setAvailablePackages(res.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load packages catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    if (page) {
      const isDifferent = JSON.stringify(content) !== page.publishedContent;
      setHasUnpublishedChanges(isDifferent);
    }
  }, [content, page]);

  const updateSection = (section: keyof HealthPackagesPageContent, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const updateItem = (section: keyof HealthPackagesPageContent, itemsKey: string, index: number, field: string, value: any) => {
    setContent(prev => {
      const sectionData = prev[section] as any;
      const items = [...(sectionData[itemsKey] || [])];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        [section]: { ...sectionData, [itemsKey]: items }
      };
    });
  };

  const addItem = (section: keyof HealthPackagesPageContent, itemsKey: string, defaultItem: any) => {
    setContent(prev => {
      const sectionData = prev[section] as any;
      const items = [...(sectionData[itemsKey] || []), defaultItem];
      return { ...prev, [section]: { ...sectionData, [itemsKey]: items } };
    });
  };

  const removeItem = (section: keyof HealthPackagesPageContent, itemsKey: string, index: number) => {
    setContent(prev => {
      const sectionData = prev[section] as any;
      const items = [...(sectionData[itemsKey] || [])];
      items.splice(index, 1);
      return { ...prev, [section]: { ...sectionData, [itemsKey]: items } };
    });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await pageService.updatePageContent('health-packages', JSON.stringify(content), false);
      await loadPage();
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish these changes to the live website?')) return;
    
    setSaving(true);
    try {
      await pageService.updatePageContent('health-packages', JSON.stringify(content), true);
      await loadPage();
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <SectionHeader title="Health Packages Page Overview" description="Current status and content summary" />
            
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
              </div>
            </div>
          </div>
        );
      
      case 'hero':
        return (
          <div className="space-y-6">
            <SectionHeader title="Hero Section" description="The main banner at the top of the Health Packages page." />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.hero?.isVisible ?? true} onChange={(v) => updateSection('hero', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Eyebrow / Breadcrumb" value={content.hero?.eyebrow || ''} onChange={(e) => updateSection('hero', 'eyebrow', e.target.value)} />
                  <AdminInput label="Main Title" value={content.hero?.title || ''} onChange={(e) => updateSection('hero', 'title', e.target.value)} />
                </div>
                <AdminTextarea label="Description" value={content.hero?.description || ''} onChange={(val) => updateSection('hero', 'description', val)} rows={3} />
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Primary CTA Label" value={content.hero?.primaryActionLabel || ''} onChange={(e) => updateSection('hero', 'primaryActionLabel', e.target.value)} />
                  <AdminInput label="Primary CTA Link" value={content.hero?.primaryActionLink || ''} onChange={(e) => updateSection('hero', 'primaryActionLink', e.target.value)} />
                </div>
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Hero Image">
              <div className="p-5 space-y-5">
                <AdminImageEditor value={content.hero?.image || ''} onChange={(val) => updateSection('hero', 'image', val)} />
                <AdminInput label="Image Alt Text" value={content.hero?.imageAlt || ''} onChange={(e) => updateSection('hero', 'imageAlt', e.target.value)} />
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'preventiveCare':
        return (
          <div className="space-y-6">
            <SectionHeader title="Preventive Care (Benefits Intro)" description="The intro section for the benefits features." />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.preventiveCare?.isVisible ?? true} onChange={(v) => updateSection('preventiveCare', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Eyebrow" value={content.preventiveCare?.eyebrow || ''} onChange={(e) => updateSection('preventiveCare', 'eyebrow', e.target.value)} />
                  <AdminInput label="Title" value={content.preventiveCare?.title || ''} onChange={(e) => updateSection('preventiveCare', 'title', e.target.value)} />
                </div>
                <AdminTextarea label="Description" value={content.preventiveCare?.description || ''} onChange={(val) => updateSection('preventiveCare', 'description', val)} rows={2} />
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'benefits':
        return (
          <div className="space-y-6">
            <SectionHeader title="Benefit Cards" description="The feature cards shown under Preventive Care." />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.benefits?.isVisible ?? true} onChange={(v) => updateSection('benefits', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Cards">
              <div className="p-5 space-y-6">
                {content.benefits?.items?.map((item, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                    <button 
                      onClick={() => removeItem('benefits', 'items', idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 mt-2">
                      <div className="grid grid-cols-[auto_1fr] gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                          <AdminIconPicker 
                            value={item.icon || 'target'} 
                            onChange={(val) => updateItem('benefits', 'items', idx, 'icon', val)} 
                          />
                        </div>
                        <AdminInput
                          label="Title"
                          value={item.title || ''}
                          onChange={(e) => updateItem('benefits', 'items', idx, 'title', e.target.value)}
                        />
                      </div>
                      <AdminTextarea
                        label="Description"
                        value={item.description || ''}
                        onChange={(val) => updateItem('benefits', 'items', idx, 'description', val)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <AdminButton 
                  variant="secondary" 
                  onClick={() => addItem('benefits', 'items', { title: 'New Benefit', description: '', icon: 'shield' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Benefit Card
                </AdminButton>
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'process':
        return (
          <div className="space-y-6">
            <SectionHeader title="How It Works (Process Steps)" />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.process?.isVisible ?? true} onChange={(v) => updateSection('process', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Eyebrow" value={content.process?.eyebrow || ''} onChange={(e) => updateSection('process', 'eyebrow', e.target.value)} />
                  <AdminInput label="Title" value={content.process?.title || ''} onChange={(e) => updateSection('process', 'title', e.target.value)} />
                </div>
                <AdminTextarea label="Description" value={content.process?.description || ''} onChange={(val) => updateSection('process', 'description', val)} rows={2} />
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Steps">
              <div className="p-5 space-y-6">
                {content.process?.steps?.map((step, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                    <button 
                      onClick={() => removeItem('process', 'steps', idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 mt-2">
                      <AdminInput
                        label={\`Step \${idx + 1} Title\`}
                        value={step.title || ''}
                        onChange={(e) => updateItem('process', 'steps', idx, 'title', e.target.value)}
                      />
                      <AdminTextarea
                        label="Description"
                        value={step.description || ''}
                        onChange={(val) => updateItem('process', 'steps', idx, 'description', val)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <AdminButton 
                  variant="secondary" 
                  onClick={() => addItem('process', 'steps', { title: 'New Step', description: '' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Step
                </AdminButton>
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'category':
        return (
          <div className="space-y-6">
            <SectionHeader title="Category Section" description="Intro text before the categories." />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.category?.isVisible ?? true} onChange={(v) => updateSection('category', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Eyebrow" value={content.category?.eyebrow || ''} onChange={(e) => updateSection('category', 'eyebrow', e.target.value)} />
                  <AdminInput label="Title" value={content.category?.title || ''} onChange={(e) => updateSection('category', 'title', e.target.value)} />
                </div>
                <AdminTextarea label="Description" value={content.category?.description || ''} onChange={(val) => updateSection('category', 'description', val)} rows={2} />
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'featured':
        return (
          <div className="space-y-6">
            <SectionHeader title="Featured Packages" description="Select which packages to display." />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.featured?.isVisible ?? true} onChange={(v) => updateSection('featured', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Eyebrow" value={content.featured?.eyebrow || ''} onChange={(e) => updateSection('featured', 'eyebrow', e.target.value)} />
                  <AdminInput label="Title" value={content.featured?.title || ''} onChange={(e) => updateSection('featured', 'title', e.target.value)} />
                </div>
                <AdminTextarea label="Description" value={content.featured?.description || ''} onChange={(val) => updateSection('featured', 'description', val)} rows={2} />
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Selected Packages">
              <div className="p-5">
                {catalogLoading ? (
                  <div className="py-8 text-center text-gray-500 text-sm">Loading catalog...</div>
                ) : (
                  <div className="space-y-3">
                    {content.featured?.packageIds?.map((pkgId, idx) => {
                      const pkg = availablePackages.find(p => p.id === pkgId);
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <select 
                              value={pkgId}
                              onChange={(e) => {
                                const newIds = [...(content.featured?.packageIds || [])];
                                newIds[idx] = e.target.value;
                                updateSection('featured', 'packageIds', newIds);
                              }}
                              className="w-full bg-transparent border-none text-sm font-medium focus:ring-0 p-0"
                            >
                              <option value="">Select a package...</option>
                              {availablePackages.map(p => (
                                <option key={p.id} value={p.id}>{p.title} (₹{p.price})</option>
                              ))}
                            </select>
                          </div>
                          <button onClick={() => {
                            const newIds = [...(content.featured?.packageIds || [])];
                            newIds.splice(idx, 1);
                            updateSection('featured', 'packageIds', newIds);
                          }} className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    <AdminButton variant="secondary" className="w-full justify-center border-dashed mt-4" onClick={() => {
                      const newIds = [...(content.featured?.packageIds || []), ''];
                      updateSection('featured', 'packageIds', newIds);
                    }}>
                      <Plus className="w-4 h-4 mr-2" /> Add Package
                    </AdminButton>
                  </div>
                )}
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'advantage':
        return (
          <div className="space-y-6">
            <SectionHeader title="Advantage Section" description="Why choose AGAM for Health Packages." />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.advantage?.isVisible ?? true} onChange={(v) => updateSection('advantage', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Eyebrow" value={content.advantage?.eyebrow || ''} onChange={(e) => updateSection('advantage', 'eyebrow', e.target.value)} />
                  <AdminInput label="Title" value={content.advantage?.title || ''} onChange={(e) => updateSection('advantage', 'title', e.target.value)} />
                </div>
                <AdminTextarea label="Description" value={content.advantage?.description || ''} onChange={(val) => updateSection('advantage', 'description', val)} rows={2} />
              </div>
            </CMSSectionContainer>
            
            <CMSSectionContainer title="Advantage Features">
              <div className="p-5 space-y-6">
                {content.advantage?.items?.map((item, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                    <button 
                      onClick={() => removeItem('advantage', 'items', idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 mt-2">
                      <div className="grid grid-cols-[auto_1fr] gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                          <AdminIconPicker 
                            value={item.icon || 'award'} 
                            onChange={(val) => updateItem('advantage', 'items', idx, 'icon', val)} 
                          />
                        </div>
                        <AdminInput
                          label="Title"
                          value={item.title || ''}
                          onChange={(e) => updateItem('advantage', 'items', idx, 'title', e.target.value)}
                        />
                      </div>
                      <AdminTextarea
                        label="Description"
                        value={item.description || ''}
                        onChange={(val) => updateItem('advantage', 'items', idx, 'description', val)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <AdminButton 
                  variant="secondary" 
                  onClick={() => addItem('advantage', 'items', { title: 'New Advantage', description: '', icon: 'shield' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Advantage Feature
                </AdminButton>
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'bottomCta':
        return (
          <div className="space-y-6">
            <SectionHeader title="Bottom Call-to-Action" />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.bottomCta?.isVisible ?? true} onChange={(v) => updateSection('bottomCta', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <AdminInput label="Heading" value={content.bottomCta?.title || ''} onChange={(e) => updateSection('bottomCta', 'title', e.target.value)} />
                <AdminTextarea label="Description" value={content.bottomCta?.description || ''} onChange={(val) => updateSection('bottomCta', 'description', val)} rows={3} />
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Primary CTA Label" value={content.bottomCta?.primaryActionLabel || ''} onChange={(e) => updateSection('bottomCta', 'primaryActionLabel', e.target.value)} />
                  <AdminInput label="Primary CTA Link" value={content.bottomCta?.primaryActionLink || ''} onChange={(e) => updateSection('bottomCta', 'primaryActionLink', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-5 mt-2">
                  <AdminInput label="Secondary CTA Label" value={content.bottomCta?.secondaryActionLabel || ''} onChange={(e) => updateSection('bottomCta', 'secondaryActionLabel', e.target.value)} />
                  <AdminInput label="Secondary CTA Link" value={content.bottomCta?.secondaryActionLink || ''} onChange={(e) => updateSection('bottomCta', 'secondaryActionLink', e.target.value)} />
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              Health Packages CMS
              {page?.status === 'PUBLISHED' && !hasUnpublishedChanges && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage public-facing content for the Health Packages page</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/preview/health-packages"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            Preview Draft
          </a>
          <AdminButton variant="ghost" onClick={handleSaveDraft} isLoading={saving}>
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
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx'), fileContent);
console.log('Complete rewrite done.');
