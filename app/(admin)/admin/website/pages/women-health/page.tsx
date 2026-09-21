"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { pageService } from '@/services/PageService';
import { packageService } from '@/services';
import { CMSPage, CategoryPageContent } from '@/domains/cms/models';
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
        <div className={`px-2 py-1 rounded text-xs font-medium ${isVisible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
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
        <div className={`block w-10 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${value ? 'translate-x-4' : ''}`}></div>
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

const DEFAULT_CONTENT: CategoryPageContent = {
  hero: {
    eyebrow: 'Women\'s Preventive Care',
    title: 'Comprehensive Health Screening Designed for Women',
    description: 'From hormonal health and thyroid function to pregnancy care and bone density — our women\'s packages are built for every stage of a woman\'s life.',
    image: '/images/womens_hero.png',
    imageAlt: 'Women\'s Health Screening',
    primaryActionLabel: 'View All Packages',
    primaryActionLink: '#packages-grid',
    isVisible: true,
  },
  information: {
    overline: 'Recommended For',
    title: 'Who Should Consider Women\'s Health Packages?',
    description: 'Our women\'s health packages are designed for proactive care at every life stage — whether you\'re planning a family, managing a condition, or simply staying ahead of health risks.',
    isVisible: true,
    items: [
      { title: 'Women 20+', description: 'Annual wellness screening for early detection of hormonal imbalances, anemia, and nutritional deficiencies.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Pregnancy Planning', description: 'Pre-conception screening to ensure optimal maternal health before and during pregnancy.', icon: 'activity', colorTheme: 'blue' },
      { title: 'PCOS & Hormonal Issues', description: 'Targeted profiling for polycystic ovarian syndrome, irregular cycles, and hormonal imbalances.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Menopause & Bone Health', description: 'Bone density markers, calcium profiling, and vitamin D assessment for women 45+.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Thyroid Disorders', description: 'Comprehensive T3, T4, TSH screening — essential for women with fatigue, weight changes, or family history.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Annual Wellness', description: 'Routine comprehensive checkup for women who prioritize proactive health management year after year.', icon: 'activity', colorTheme: 'blue' }
    ]
  },
  featured: {
    title: 'Women\'s Health Packages',
    subtitle: 'Specialized diagnostic panels designed for women at every stage of life.',
    packageIds: [], // To be populated if missing
    isVisible: true,
  },
  exploreCategories: {
    title: 'Explore Other Categories',
    isVisible: true,
    categories: [
      { id: 'men', title: 'Men\'s Health', description: 'Executive health profiles, cardiac risk assessment, liver & kidney function, prostate screening, metabolic panels, and preventive checkups for men.', image: '/images/mens_health.png', link: '/men-health', badges: ['Executive Health', 'Heart Care', 'Metabolic', 'Liver Health'] },
      { id: 'lifestyle', title: 'Lifestyle Health', description: 'Diabetic screening, obesity risk profiling, vitamin deficiency panels, corporate executive checkups, and fitness evaluations.', image: '/images/lifestyle_health.png', link: '/lifestyle-health', badges: ['Diabetes', 'Obesity', 'Vitamins', 'Corporate'] }
    ]
  },
  faq: {
    overline: 'Common Questions',
    title: 'Women\'s Health FAQ',
    isVisible: true,
    items: [
      { question: 'When should women start getting regular health checkups?', answer: 'Women should begin annual preventive health screenings from age 21. After 30, comprehensive panels including thyroid, hormonal, and bone health markers are strongly recommended. Women with a family history of diabetes, heart disease, or cancer should start earlier.' },
      { question: 'What tests are included in a PCOS screening profile?', answer: 'A PCOS screening typically includes LH, FSH, total testosterone, DHEA-S, insulin resistance markers (fasting insulin, HOMA-IR), lipid profile, fasting blood sugar, and HbA1c to evaluate both hormonal and metabolic imbalances associated with PCOS.' },
      { question: 'Is fasting required for women\'s health packages?', answer: 'Most packages require 10–12 hours of fasting for accurate blood sugar and lipid results. Water is permitted during the fasting period. Hormonal tests can typically be done without fasting, but your report will indicate if specific conditions apply.' },
      { question: 'Can I book a home sample collection for women\'s health packages?', answer: 'Yes. Free home sample collection is available across Madurai for all women\'s health packages. Our trained female phlebotomists ensure a comfortable and professional experience. Book online or call +91 89408 94079.' }
    ]
  },
  bottomCta: {
    title: 'Take charge of your health today',
    description: 'Book a women\'s health checkup with free home collection. Accurate results from NABL-accredited diagnostics you can trust.',
    primaryActionLabel: 'Book Your Package',
    primaryActionLink: '/book',
    secondaryActionLabel: 'Call: +91 89408 94079',
    secondaryActionLink: 'tel:+918940894079',
    isVisible: true,
  }
};

export default function WomenHealthCMSPage() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section') || 'overview';
  
  const [page, setPage] = useState<CMSPage | null>(null);
  const [content, setContent] = useState<CategoryPageContent>(DEFAULT_CONTENT);
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
      const res = await pageService.getPageById('women-health');
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
      console.error('Failed to load women health page:', err);
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
    } else {
      setHasUnpublishedChanges(true);
    }
  }, [content, page]);

  const updateSection = (section: keyof CategoryPageContent, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const updateItem = (section: keyof CategoryPageContent, itemsKey: string, index: number, field: string, value: any) => {
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

  const addItem = (section: keyof CategoryPageContent, itemsKey: string, defaultItem: any) => {
    setContent(prev => {
      const sectionData = prev[section] as any;
      const items = [...(sectionData[itemsKey] || []), defaultItem];
      return { ...prev, [section]: { ...sectionData, [itemsKey]: items } };
    });
  };

  const removeItem = (section: keyof CategoryPageContent, itemsKey: string, index: number) => {
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
      await pageService.updatePage('women-health', JSON.stringify(content));
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
      await pageService.publishPage('women-health', JSON.stringify(content));
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
            <SectionHeader title="Women's Health Page Overview" description="Current status and content summary" />
            
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
            <SectionHeader title="Hero Section" description="The main banner at the top of the Women's Health page." />
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

      case 'information':
        return (
          <div className="space-y-6">
            <SectionHeader title="Recommended For" description="The information section explaining who should consider these packages." />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.information?.isVisible ?? true} onChange={(v) => updateSection('information', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Overline" value={content.information?.overline || ''} onChange={(e) => updateSection('information', 'overline', e.target.value)} />
                  <AdminInput label="Title" value={content.information?.title || ''} onChange={(e) => updateSection('information', 'title', e.target.value)} />
                </div>
                <AdminTextarea label="Description" value={content.information?.description || ''} onChange={(val) => updateSection('information', 'description', val)} rows={2} />
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Features">
              <div className="p-5 space-y-6">
                {content.information?.items?.map((item, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                    <button 
                      onClick={() => removeItem('information', 'items', idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 mt-2">
                      <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                          <AdminIconPicker 
                            value={item.icon || 'activity'} 
                            onChange={(val) => updateItem('information', 'items', idx, 'icon', val)} 
                          />
                        </div>
                        <AdminInput
                          label="Title"
                          value={item.title || ''}
                          onChange={(e) => updateItem('information', 'items', idx, 'title', e.target.value)}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                          <select
                            value={item.colorTheme || 'blue'}
                            onChange={(e) => updateItem('information', 'items', idx, 'colorTheme', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="amber">Amber</option>
                            <option value="red">Red</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="purple">Purple</option>
                            <option value="teal">Teal</option>
                          </select>
                        </div>
                      </div>
                      <AdminTextarea
                        label="Description"
                        value={item.description || ''}
                        onChange={(val) => updateItem('information', 'items', idx, 'description', val)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <AdminButton 
                  variant="secondary" 
                  onClick={() => addItem('information', 'items', { title: 'New Feature', description: '', icon: 'activity', colorTheme: 'blue' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Feature
                </AdminButton>
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
                <AdminInput label="Title" value={content.featured?.title || ''} onChange={(e) => updateSection('featured', 'title', e.target.value)} />
                <AdminInput label="Subtitle" value={content.featured?.subtitle || ''} onChange={(e) => updateSection('featured', 'subtitle', e.target.value)} />
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

      case 'exploreCategories':
        return (
          <div className="space-y-6">
            <SectionHeader title="Explore Other Categories" />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.exploreCategories?.isVisible ?? true} onChange={(v) => updateSection('exploreCategories', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <AdminInput label="Title" value={content.exploreCategories?.title || ''} onChange={(e) => updateSection('exploreCategories', 'title', e.target.value)} />
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Categories">
              <div className="p-5 space-y-6">
                {content.exploreCategories?.categories?.map((cat, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                    <button 
                      onClick={() => removeItem('exploreCategories', 'categories', idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 mt-2">
                      <AdminImageEditor value={cat.image || ''} onChange={(val) => updateItem('exploreCategories', 'categories', idx, 'image', val)} />
                      <div className="grid grid-cols-2 gap-4">
                        <AdminInput label="Category Title" value={cat.title || ''} onChange={(e) => updateItem('exploreCategories', 'categories', idx, 'title', e.target.value)} />
                        <AdminInput label="Link" value={cat.link || ''} onChange={(e) => updateItem('exploreCategories', 'categories', idx, 'link', e.target.value)} />
                      </div>
                      <AdminTextarea label="Description" value={cat.description || ''} onChange={(val) => updateItem('exploreCategories', 'categories', idx, 'description', val)} rows={2} />
                      <AdminInput label="Badges (comma-separated)" value={(cat.badges || []).join(', ')} onChange={(e) => updateItem('exploreCategories', 'categories', idx, 'badges', e.target.value.split(',').map(s => s.trim()))} />
                    </div>
                  </div>
                ))}
                <AdminButton 
                  variant="secondary" 
                  onClick={() => addItem('exploreCategories', 'categories', { id: `cat-${Date.now()}`, title: 'New Category', description: '', image: '', link: '', badges: [] })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </AdminButton>
              </div>
            </CMSSectionContainer>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6">
            <SectionHeader title="FAQ Section" />
            <CMSSectionContainer title="Visibility Control" rightElement={<VisibilityToggle value={content.faq?.isVisible ?? true} onChange={(v) => updateSection('faq', 'isVisible', v)} />} />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput label="Overline" value={content.faq?.overline || ''} onChange={(e) => updateSection('faq', 'overline', e.target.value)} />
                  <AdminInput label="Title" value={content.faq?.title || ''} onChange={(e) => updateSection('faq', 'title', e.target.value)} />
                </div>
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="FAQ Items">
              <div className="p-5 space-y-6">
                {content.faq?.items?.map((item, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                    <button 
                      onClick={() => removeItem('faq', 'items', idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 mt-2">
                      <AdminInput
                        label={`Question ${idx + 1}`}
                        value={item.question || ''}
                        onChange={(e) => updateItem('faq', 'items', idx, 'question', e.target.value)}
                      />
                      <AdminTextarea
                        label="Answer"
                        value={item.answer || ''}
                        onChange={(val) => updateItem('faq', 'items', idx, 'answer', val)}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
                <AdminButton 
                  variant="secondary" 
                  onClick={() => addItem('faq', 'items', { question: 'New Question', answer: '' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Question
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
              Women's Health CMS
              {page?.status === 'PUBLISHED' && !hasUnpublishedChanges && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage public-facing content for the Women's Health page</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/women-health"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            View Live
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
