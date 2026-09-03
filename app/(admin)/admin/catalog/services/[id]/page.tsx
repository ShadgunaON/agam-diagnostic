'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { serviceCatalogService } from '@/services';
import { useRBAC } from '@/hooks/useRBAC';
import { ServiceItem } from '@/domains/services/model';
import Link from 'next/link';

export default function EditServicePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { hasPermission, isLoading: rbacLoading } = useRBAC();
  const toast = useToast();
  
  const isNew = id === 'new';
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    title: '',
    slug: '',
    category: 'general',
    description: '',
    shortDescription: '',
    price: '0',
    basePrice: 0,
    salePrice: 0,
    status: 'ACTIVE',
    sortOrder: 0,
    estimatedDuration: '',
    homeAvailable: false,
    labAvailable: true,
  });
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);


  useEffect(() => {
    if (rbacLoading) return;
    
    if (!hasPermission('catalog', isNew ? 'create' : 'edit')) {
      toast.error('Access Denied', 'You do not have permission to access this page.');
      router.push('/admin/catalog');
      return;
    }

    if (!isNew) {
      loadService();
    }
  }, [id, isNew, rbacLoading, hasPermission]);

  const loadService = async () => {
    try {
      const res = await serviceCatalogService.getById(id);
      if (res.isSuccess) {
        setFormData(res.value);
        setFaqs(res.value.faqs || []);
      } else {
        toast.error('Error', 'Service not found');
        router.push('/admin/catalog');
      }
    } catch (error) {
      toast.error('Error', 'Failed to load service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    let finalValue: any = value;
    if (type === 'checkbox') finalValue = checked;
    else if (type === 'number') {
      finalValue = name === 'price' ? String(value) : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

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
        const res = await serviceCatalogService.create(payload);
        if (res.isSuccess) {
          toast.success('Success', 'Service created successfully');
          router.push('/admin/catalog');
        } else {
          toast.error('Error', res.error?.message || 'Failed to create service');
        }
      } else {
        const res = await serviceCatalogService.update(id, payload);
        if (res.isSuccess) {
          toast.success('Success', 'Service updated successfully');
          router.push('/admin/catalog');
        } else {
          toast.error('Error', res.error?.message || 'Failed to update service');
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

  if (isLoading) {
    return (
      <AdminPageTemplate title="Loading...">
        <div className="p-12 text-center text-gray-500">Loading service data...</div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title={isNew ? 'Create New Service' : `Edit Service: ${formData.title}`}
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
              <input required type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. ECG" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Slug (URL Friendly) <span className="text-red-500">*</span></label>
              <input required type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. ecg" disabled={!isNew} />
              {!isNew && <p className="text-xs text-gray-500">Slug cannot be changed after creation.</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={formData.category || 'general'} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="cardiology">Cardiology</option>
                <option value="radiology">Radiology</option>
                <option value="neurology">Neurology</option>
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
            <label className="text-sm font-medium text-gray-700">Short Description</label>
            <textarea name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[60px]" placeholder="Brief 1-2 sentence description..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" placeholder="Detailed description..." />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Availability</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selling Price (₹)</label>
              <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" min="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base Price (₹) - Strikethrough</label>
              <input type="number" name="basePrice" value={formData.basePrice || 0} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" min="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estimated Duration</label>
              <input type="text" name="estimatedDuration" value={formData.estimatedDuration || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 15-30 mins" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
             <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" name="homeAvailable" checked={!!formData.homeAvailable} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Home Service Available</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" name="labAvailable" checked={!!formData.labAvailable} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Lab Service Available</span>
              </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Detail Page Information</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Overview</label>
              <textarea name="overview" value={formData.overview || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">What it Includes (Markdown/HTML)</label>
              <textarea name="whatIncludes" value={formData.whatIncludes || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Who is it For? (Markdown/HTML)</label>
              <textarea name="whoItIsFor" value={formData.whoItIsFor || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preparation Required</label>
              <textarea name="preparationRequired" value={formData.preparationRequired || (formData as any).preparation?.description || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[80px]" />
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
                  placeholder="e.g. How long does the service take?"
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
            {isSaving ? 'Saving...' : (isNew ? 'Create Service' : 'Save Changes')}
          </button>
        </div>
      </form>
    </AdminPageTemplate>
  );
}
