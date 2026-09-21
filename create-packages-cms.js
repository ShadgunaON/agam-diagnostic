const fs = require('fs');
const path = require('path');

const code = `import React, { useState, useEffect } from 'react';
import { pageService } from '@/services/PageService';
import { serviceCatalogService } from '@/services';
import { CMSPage } from '@/domains/cms/models';
import { HealthPackagesPageContent } from '@/domains/cms/models';
import { PackageItem } from '@/domains/packages/model';
import { 
  AdminPageLayout, 
  CMSSectionContainer, 
  SectionHeader 
} from '@/components/admin/layout';
import { 
  AdminInput, 
  AdminTextarea, 
  AdminButton, 
  AdminImageEditor, 
  AdminIconPicker, 
  VisibilityToggle 
} from '@/components/admin/ui';
import { Save, Globe, Eye, Plus, Trash2, GripVertical } from 'lucide-react';

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
      const res = await serviceCatalogService.getCatalog(1, 100, 'package');
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
      setHasUnpublishedChanges(page.draftContent !== page.publishedContent);
    }
  }, [content, page]);

  const handleSaveDraft = async () => {
    if (!page) return;
    try {
      setSaving(true);
      const draftContent = JSON.stringify(content);
      await pageService.updatePage(page.id, draftContent);
      await loadPage();
      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    if (!confirm('Are you sure you want to publish these changes to the live site?')) return;
    try {
      setSaving(true);
      const draftContent = JSON.stringify(content);
      await pageService.publishPage(page.id, draftContent);
      await loadPage();
      alert('Published successfully!');
    } catch (err) {
      console.error('Publish failed', err);
      alert('Failed to publish.');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <AdminPageLayout
      title="Health Packages Page"
      description="Manage the content for the public Health Packages page."
      headerActions={
        <div className="flex items-center gap-3">
          <a
            href="/preview/health-packages"
            target="_blank"
            rel="noreferrer"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
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
      }
    >
      <div className="space-y-12 pb-24 max-w-5xl">

        {/* HERO SECTION */}
        <section id="hero">
          <SectionHeader
            title="Hero Section"
            description="The main banner at the top of the Health Packages page."
          />
          <div className="space-y-6">
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.hero?.isVisible ?? true} onChange={(v) => updateSection('hero', 'isVisible', v)} />}
            />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Eyebrow / Breadcrumb"
                    value={content.hero?.eyebrow || ''}
                    onChange={(val) => updateSection('hero', 'eyebrow', val)}
                  />
                  <AdminInput
                    label="Main Title"
                    value={content.hero?.title || ''}
                    onChange={(val) => updateSection('hero', 'title', val)}
                  />
                </div>
                <AdminTextarea
                  label="Description"
                  value={content.hero?.description || ''}
                  onChange={(val) => updateSection('hero', 'description', val)}
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Primary CTA Label"
                    value={content.hero?.primaryActionLabel || ''}
                    onChange={(val) => updateSection('hero', 'primaryActionLabel', val)}
                  />
                  <AdminInput
                    label="Primary CTA Link"
                    value={content.hero?.primaryActionLink || ''}
                    onChange={(val) => updateSection('hero', 'primaryActionLink', val)}
                  />
                </div>
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Hero Image">
              <div className="p-5 space-y-5">
                <AdminImageEditor
                  value={content.hero?.image || ''}
                  onChange={(val) => updateSection('hero', 'image', val)}
                />
                <AdminInput
                  label="Image Alt Text"
                  value={content.hero?.imageAlt || ''}
                  onChange={(val) => updateSection('hero', 'imageAlt', val)}
                />
              </div>
            </CMSSectionContainer>
          </div>
        </section>

        {/* PREVENTIVE CARE SECTION */}
        <section id="preventiveCare">
          <SectionHeader
            title="Preventive Care (Benefits Intro)"
            description="The intro section for the benefits features."
          />
          <div className="space-y-6">
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.preventiveCare?.isVisible ?? true} onChange={(v) => updateSection('preventiveCare', 'isVisible', v)} />}
            />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Eyebrow"
                    value={content.preventiveCare?.eyebrow || ''}
                    onChange={(val) => updateSection('preventiveCare', 'eyebrow', val)}
                  />
                  <AdminInput
                    label="Title"
                    value={content.preventiveCare?.title || ''}
                    onChange={(val) => updateSection('preventiveCare', 'title', val)}
                  />
                </div>
                <AdminTextarea
                  label="Description"
                  value={content.preventiveCare?.description || ''}
                  onChange={(val) => updateSection('preventiveCare', 'description', val)}
                  rows={2}
                />
              </div>
            </CMSSectionContainer>
          </div>
        </section>

        {/* BENEFITS SECTION (Four feature cards) */}
        <section id="benefits">
          <SectionHeader
            title="Benefit Cards"
            description="The feature cards shown under Preventive Care."
          />
          <div className="space-y-6">
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.benefits?.isVisible ?? true} onChange={(v) => updateSection('benefits', 'isVisible', v)} />}
            />
            
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
                          onChange={(val) => updateItem('benefits', 'items', idx, 'title', val)}
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
                  variant="outline" 
                  onClick={() => addItem('benefits', 'items', { title: 'New Benefit', description: '', icon: 'shield' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Benefit Card
                </AdminButton>
              </div>
            </CMSSectionContainer>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section id="process">
          <SectionHeader
            title="How It Works (Process Steps)"
          />
          <div className="space-y-6">
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.process?.isVisible ?? true} onChange={(v) => updateSection('process', 'isVisible', v)} />}
            />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Eyebrow"
                    value={content.process?.eyebrow || ''}
                    onChange={(val) => updateSection('process', 'eyebrow', val)}
                  />
                  <AdminInput
                    label="Title"
                    value={content.process?.title || ''}
                    onChange={(val) => updateSection('process', 'title', val)}
                  />
                </div>
                <AdminTextarea
                  label="Description"
                  value={content.process?.description || ''}
                  onChange={(val) => updateSection('process', 'description', val)}
                  rows={2}
                />
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Steps">
              <div className="p-5 space-y-4">
                {content.process?.steps?.map((step, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg flex gap-4 items-start bg-white group">
                    <div className="mt-8 text-gray-300 cursor-move"><GripVertical className="w-5 h-5" /></div>
                    <div className="flex-1 space-y-4">
                      <AdminInput
                        label={\`Step \${idx + 1} Title\`}
                        value={step.title || ''}
                        onChange={(val) => updateItem('process', 'steps', idx, 'title', val)}
                      />
                      <AdminTextarea
                        label="Description"
                        value={step.description || ''}
                        onChange={(val) => updateItem('process', 'steps', idx, 'description', val)}
                        rows={2}
                      />
                    </div>
                    <button 
                      onClick={() => removeItem('process', 'steps', idx)}
                      className="mt-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <AdminButton 
                  variant="outline" 
                  onClick={() => addItem('process', 'steps', { title: 'New Step', description: '' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Process Step
                </AdminButton>
              </div>
            </CMSSectionContainer>
          </div>
        </section>

        {/* FEATURED PACKAGES */}
        <section id="featured">
          <SectionHeader
            title="Featured Packages"
            description="Select which packages to display on the Health Packages page. Data is automatically fetched from the Catalog."
          />
          <div className="space-y-6">
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.featured?.isVisible ?? true} onChange={(v) => updateSection('featured', 'isVisible', v)} />}
            />
            
            <CMSSectionContainer title="Section Headings">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Eyebrow"
                    value={content.featured?.eyebrow || ''}
                    onChange={(val) => updateSection('featured', 'eyebrow', val)}
                  />
                  <AdminInput
                    label="Title"
                    value={content.featured?.title || ''}
                    onChange={(val) => updateSection('featured', 'title', val)}
                  />
                </div>
                <AdminTextarea
                  label="Description"
                  value={content.featured?.description || ''}
                  onChange={(val) => updateSection('featured', 'description', val)}
                  rows={2}
                />
              </div>
            </CMSSectionContainer>

            <CMSSectionContainer title="Selected Packages">
              <div className="p-5 space-y-5">
                {catalogLoading ? (
                  <div className="text-gray-500 text-sm">Loading catalog...</div>
                ) : (
                  <>
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
                                className="w-full bg-transparent border-none text-sm font-medium focus:ring-0"
                              >
                                {availablePackages.map(p => (
                                  <option key={p.id} value={p.id}>{p.title} (₹{p.price})</option>
                                ))}
                              </select>
                            </div>
                            {pkg?.status === 'INACTIVE' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Inactive in Catalog</span>
                            )}
                            <button 
                              onClick={() => {
                                const newIds = [...(content.featured?.packageIds || [])];
                                newIds.splice(idx, 1);
                                updateSection('featured', 'packageIds', newIds);
                              }}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Package</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => {
                          if (e.target.value) {
                            const newIds = [...(content.featured?.packageIds || []), e.target.value];
                            updateSection('featured', 'packageIds', newIds);
                            e.target.value = ''; // reset select
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Select a package to add --</option>
                        {availablePackages
                          .filter(p => !content.featured?.packageIds?.includes(p.id))
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.title} (₹{p.price})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </CMSSectionContainer>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section id="bottomCta">
          <SectionHeader title="Bottom Call-to-Action" />
          <div className="space-y-6">
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.bottomCta?.isVisible ?? true} onChange={(v) => updateSection('bottomCta', 'isVisible', v)} />}
            />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <AdminInput
                  label="Title"
                  value={content.bottomCta?.title || ''}
                  onChange={(val) => updateSection('bottomCta', 'title', val)}
                />
                <AdminTextarea
                  label="Description"
                  value={content.bottomCta?.description || ''}
                  onChange={(val) => updateSection('bottomCta', 'description', val)}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Primary Button Label"
                    value={content.bottomCta?.primaryActionLabel || ''}
                    onChange={(val) => updateSection('bottomCta', 'primaryActionLabel', val)}
                  />
                  <AdminInput
                    label="Primary Button Link"
                    value={content.bottomCta?.primaryActionLink || ''}
                    onChange={(val) => updateSection('bottomCta', 'primaryActionLink', val)}
                  />
                  <AdminInput
                    label="Secondary Button Label"
                    value={content.bottomCta?.secondaryActionLabel || ''}
                    onChange={(val) => updateSection('bottomCta', 'secondaryActionLabel', val)}
                  />
                  <AdminInput
                    label="Secondary Button Link"
                    value={content.bottomCta?.secondaryActionLink || ''}
                    onChange={(val) => updateSection('bottomCta', 'secondaryActionLink', val)}
                  />
                </div>
              </div>
            </CMSSectionContainer>
          </div>
        </section>

      </div>
    </AdminPageLayout>
  );
}
`;

fs.mkdirSync(path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx'), code, 'utf8');
console.log("Created health packages CMS editor");
