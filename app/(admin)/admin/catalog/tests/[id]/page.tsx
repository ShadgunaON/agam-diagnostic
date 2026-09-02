'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { testCatalogService } from '@/services';
import { useRBAC } from '@/hooks/useRBAC';
import { TestItem } from '@/domains/tests/model';
import Link from 'next/link';

export default function EditTestPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { hasPermission, isLoading: rbacLoading } = useRBAC();
  const toast = useToast();
  
  const isNew = id === 'new';
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<TestItem>>({
    title: '',
    slug: '',
    category: 'blood',
    description: '',
    price: '0',
    basePrice: 0,
    salePrice: 0,
    status: 'ACTIVE',
    sortOrder: 0,
    sampleType: '',
    turnaroundTime: '',
    fastingRequired: false,
    homeCollectionAvailable: true,
    labCollectionAvailable: true,
  });

  useEffect(() => {
    if (rbacLoading) return;
    
    if (!hasPermission('catalog', isNew ? 'create' : 'edit')) {
      toast.error('Access Denied', 'You do not have permission to access this page.');
      router.push('/admin/catalog');
      return;
    }

    if (!isNew) {
      loadTest();
    }
  }, [id, isNew, rbacLoading, hasPermission]);

  const loadTest = async () => {
    try {
      const res = await testCatalogService.getById(id);
      if (res.isSuccess) {
        setFormData(res.value);
      } else {
        toast.error('Error', 'Test not found');
        router.push('/admin/catalog');
      }
    } catch (error) {
      toast.error('Error', 'Failed to load test');
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
    
    try {
      if (isNew) {
        if (!formData.title || !formData.slug) {
          toast.error('Error', 'Title and slug are required.');
          setIsSaving(false);
          return;
        }
        const res = await testCatalogService.create(formData);
        if (res.isSuccess) {
          toast.success('Success', 'Test created successfully');
          router.push('/admin/catalog');
        } else {
          toast.error('Error', res.error?.message || 'Failed to create test');
        }
      } else {
        const res = await testCatalogService.update(id, formData);
        if (res.isSuccess) {
          toast.success('Success', 'Test updated successfully');
          router.push('/admin/catalog');
        } else {
          toast.error('Error', res.error?.message || 'Failed to update test');
        }
      }
    } catch (error) {
      toast.error('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageTemplate title="Loading...">
        <div className="p-12 text-center text-gray-500">Loading test data...</div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title={isNew ? 'Create New Test' : `Edit Test: ${formData.title}`}
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
              <input required type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Complete Blood Count (CBC)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Slug (URL Friendly) <span className="text-red-500">*</span></label>
              <input required type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. complete-blood-count" disabled={!isNew} />
              {!isNew && <p className="text-xs text-gray-500">Slug cannot be changed after creation.</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={formData.category || 'blood'} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
                <option value="radiology">Radiology</option>
                <option value="preventive">Preventive</option>
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
            <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" placeholder="Brief description of the test..." />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selling Price (₹)</label>
              <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" min="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base Price (₹) - Strikethrough</label>
              <input type="number" name="basePrice" value={formData.basePrice || 0} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" min="0" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Medical Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sample Type</label>
              <input type="text" name="sampleType" value={formData.sampleType || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Blood, Urine" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Turnaround Time</label>
              <input type="text" name="turnaroundTime" value={formData.turnaroundTime || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 24 Hours, Same Day" />
            </div>
            
            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" name="fastingRequired" checked={!!formData.fastingRequired} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Fasting Required</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
             <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" name="homeCollectionAvailable" checked={!!formData.homeCollectionAvailable} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Home Collection Available</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" name="labCollectionAvailable" checked={!!formData.labCollectionAvailable} onChange={handleChange} className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Lab Collection Available</span>
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
              <label className="text-sm font-medium text-gray-700">What it Checks (Markdown/HTML)</label>
              <textarea name="whatItChecks" value={formData.whatItChecks || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Why Performed (Markdown/HTML)</label>
              <textarea name="whyPerformed" value={formData.whyPerformed || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preparation Required</label>
              <textarea name="preparationRequired" value={formData.preparationRequired || formData.preparation || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg min-h-[80px]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pb-12">
          <Link href="/admin/catalog" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn btn-primary min-w-[120px]">
            {isSaving ? 'Saving...' : (isNew ? 'Create Test' : 'Save Changes')}
          </button>
        </div>
      </form>
    </AdminPageTemplate>
  );
}
