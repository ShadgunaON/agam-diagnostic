'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { packageService, testCatalogService } from '@/services';
import { useRBAC } from '@/hooks/useRBAC';
import { PackageItem } from '@/domains/packages/model';
import { TestItem } from '@/domains/tests/model';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';

export default function EditPackagePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { hasPermission, isLoading: rbacLoading } = useRBAC();
  const toast = useToast();
  
  const isNew = id === 'new';
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  
  const [allTests, setAllTests] = useState<TestItem[]>([]);
  const [isTestsLoading, setIsTestsLoading] = useState(true);
  
  const [formData, setFormData] = useState<Partial<PackageItem>>({
    title: '',
    slug: '',
    category: 'general',
    description: '',
    packagePrice: 0,
    individualValue: 0,
    status: 'ACTIVE',
    sortOrder: 0,
    testIds: [],
  });
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);


  useEffect(() => {
    if (rbacLoading) return;
    
    if (!hasPermission('catalog', isNew ? 'create' : 'edit')) {
      toast.error('Access Denied', 'You do not have permission to access this page.');
      router.push('/admin/catalog');
      return;
    }

    loadTests();
    if (!isNew) {
      loadPackage();
    }
  }, [id, isNew, rbacLoading, hasPermission]);

  const loadTests = async () => {
    try {
      const res = await testCatalogService.getCatalog(1, 1000);
      if (res.isSuccess) {
        setAllTests(res.value.data);
      }
    } catch (error) {
      console.error("Failed to load tests", error);
    } finally {
      setIsTestsLoading(false);
    }
  };

  const loadPackage = async () => {
    try {
      const res = await packageService.getById(id);
      if (res.isSuccess) {
        setFormData(res.value);
        setFaqs((res.value as any).faqs || []);
      } else {
        toast.error('Error', 'Package not found');
        router.push('/admin/catalog');
      }
    } catch (error) {
      toast.error('Error', 'Failed to load package');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  const toggleTest = (testId: string) => {
    setFormData(prev => {
      const currentIds = prev.testIds || [];
      if (currentIds.includes(testId)) {
        return { ...prev, testIds: currentIds.filter(id => id !== testId) };
      } else {
        return { ...prev, testIds: [...currentIds, testId] };
      }
    });
  };

  // Calculate individual value dynamically based on selected tests
  useEffect(() => {
    if (allTests.length > 0 && formData.testIds && formData.testIds.length > 0) {
      const sum = formData.testIds.reduce((total, testId) => {
        const test = allTests.find(t => t.id === testId);
        return total + Number(test?.price || test?.salePrice || test?.basePrice || 0);
      }, 0);
      
      if (formData.individualValue !== sum) {
        setFormData(prev => ({ ...prev, individualValue: sum }));
      }
    } else if (formData.testIds?.length === 0 && formData.individualValue !== 0) {
      setFormData(prev => ({ ...prev, individualValue: 0 }));
    }
  }, [formData.testIds, allTests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = { ...formData, faqs };
    
    try {
      if (isNew) {
        if (!formData.title || !formData.slug) {
          toast.error('Error', 'Title and slug are required.');
          setIsSaving(false);
          return;
        }
        const res = await packageService.create(payload);
        if (res.isSuccess) {
          toast.success('Success', 'Package created successfully');
          router.push('/admin/catalog');
        } else {
          toast.error('Error', res.error?.message || 'Failed to create package');
        }
      } else {
        const res = await packageService.update(id, payload);
        if (res.isSuccess) {
          toast.success('Success', 'Package updated successfully');
          router.push('/admin/catalog');
        } else {
          toast.error('Error', res.error?.message || 'Failed to update package');
        }
      }
    } catch (error) {
      toast.error('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const addFaq = () => setFaqs(prev => [...prev, { question: '', answer: '' }]);
  const removeFaq = (idx: number) => setFaqs(prev => prev.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, field: 'question' | 'answer', value: string) =>
    setFaqs(prev => prev.map((faq, i) => i === idx ? { ...faq, [field]: value } : faq));

  if (isLoading || isTestsLoading) {
    return (
      <AdminPageTemplate title="Loading...">
        <div className="p-12 text-center text-gray-500">Loading package data...</div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title={isNew ? 'Create New Package' : `Edit Package: ${formData.title}`}
      headerActions={
        <Link href="/admin/catalog" className="btn btn-secondary text-sm px-4 py-2">
          Back to Catalog
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <input required type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Master Health Checkup" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Slug (URL Friendly) <span className="text-red-500">*</span></label>
              <input required type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. master-health-checkup" disabled={!isNew} />
              {!isNew && <p className="text-xs text-gray-500">Slug cannot be changed after creation.</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={formData.category || 'general'} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="full-body">Full Body</option>
                <option value="mens-health">Men's Health</option>
                <option value="womens-health">Women's Health</option>
                <option value="senior-citizen">Senior Citizen</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={formData.status || 'ACTIVE'} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="ACTIVE">Active (Visible)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="INACTIVE">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" placeholder="Brief description of the package..." />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <div className="flex justify-between items-end border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-900">Included Tests</h2>
            <div className="text-sm text-gray-500">
              Selected: <span className="font-semibold text-primary">{formData.testIds?.length || 0}</span> tests
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2 border rounded-lg bg-gray-50/50">
            {allTests.map(test => {
              const isSelected = formData.testIds?.includes(test.id);
              return (
                <label 
                  key={test.id} 
                  className={`flex items-start space-x-3 cursor-pointer p-3 border rounded-lg transition-colors ${
                    isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => toggleTest(test.id)} 
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {test.title}
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                      <span className="truncate">{test.category}</span>
                      <span className="font-medium text-gray-700">₹{test.price || test.salePrice || test.basePrice || 0}</span>
                    </div>
                  </div>
                </label>
              );
            })}
            
            {allTests.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500">
                No tests available in the catalog.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Package Selling Price (₹) <span className="text-red-500">*</span></label>
              <input required type="number" name="packagePrice" value={formData.packagePrice || 0} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg border-primary/50 bg-primary/5" min="0" />
              <p className="text-xs text-gray-500">The actual price the customer will pay.</p>
            </div>
            <div className="space-y-2 opacity-75">
              <label className="text-sm font-medium text-gray-700">Individual Tests Value (₹) - Auto-calculated</label>
              <input type="number" name="individualValue" value={formData.individualValue || 0} readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-100" />
              <p className="text-xs text-gray-500">Sum of selected tests. Acts as the strikethrough price.</p>
            </div>
          </div>
          
          {(formData.individualValue || 0) > 0 && (formData.packagePrice || 0) > 0 && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-green-800">Savings shown to customer:</span>
              </div>
              <div className="text-lg font-bold text-green-700">
                ₹{(formData.individualValue || 0) - (formData.packagePrice || 0)} 
                <span className="text-sm font-medium ml-2 opacity-75">
                  ({Math.round(((formData.individualValue || 0) - (formData.packagePrice || 0)) / (formData.individualValue || 1) * 100)}% OFF)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Detail Page Information</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Overview</label>
              <textarea name="overview" value={formData.overview || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Who Should Consider? (Markdown/HTML)</label>
              <textarea name="whoShouldConsider" value={formData.whoShouldConsider || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preparation Required</label>
              <textarea name="preparation" value={formData.preparation || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[80px]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
            <button type="button" onClick={addFaq} className="btn btn-secondary text-sm px-4 py-2">
              + Add FAQ
            </button>
          </div>

          {faqs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No FAQs yet. Click &quot;Add FAQ&quot; to add one.</p>
          )}

          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
              <button
                type="button"
                onClick={() => removeFaq(idx)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remove FAQ"
              >
                ✕
              </button>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={e => updateFaq(idx, 'question', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                  placeholder="e.g. What is included in this package?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Answer</label>
                <textarea
                  value={faq.answer}
                  onChange={e => updateFaq(idx, 'answer', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm min-h-[80px]"
                  placeholder="Provide a clear, helpful answer..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pb-12">
          <Link href="/admin/catalog" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn btn-primary min-w-[120px]">
            {isSaving ? 'Saving...' : (isNew ? 'Create Package' : 'Save Changes')}
          </button>
        </div>
      </form>
    </AdminPageTemplate>
  );
}
