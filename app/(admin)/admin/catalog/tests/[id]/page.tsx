'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

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
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  // Related Tests picker state
  type RelatedTestSnapshot = { title: string; category: string; description: string; slug: string; status: string };
  const [relatedTests, setRelatedTests] = useState<RelatedTestSnapshot[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [allCatalog, setAllCatalog] = useState<TestItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const pickerLoaded = useRef(false);
  const pickerInputRef = useRef<HTMLInputElement>(null);



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
        setFaqs(res.value.faqs || []);
        // Restore saved related tests selections
        setRelatedTests((res.value.relatedTests || []).map(rt => ({
          title: rt.title,
          category: rt.category,
          description: rt.description,
          slug: rt.slug,
          status: rt.status || 'ACTIVE',
        })));

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
    
    const payload = { ...formData, faqs, relatedTests };

    
    try {
      if (isNew) {
        if (!formData.title || !formData.slug) {
          toast.error('Error', 'Title and slug are required.');
          setIsSaving(false);
          return;
        }
        const res = await testCatalogService.create(payload);
        if (res.isSuccess) {
          toast.success('Success', 'Test created successfully');
          router.push('/admin/catalog');
        } else {
          toast.error('Error', res.error?.message || 'Failed to create test');
        }
      } else {
        const res = await testCatalogService.update(id, payload);
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

  const addFaq = () => setFaqs(prev => [...prev, { question: '', answer: '' }]);
  const removeFaq = (idx: number) => setFaqs(prev => prev.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, field: 'question' | 'answer', value: string) =>
    setFaqs(prev => prev.map((faq, i) => i === idx ? { ...faq, [field]: value } : faq));

  // ---- Related Tests Picker logic ----------------------------------------
  const loadCatalogForPicker = useCallback(async () => {
    if (pickerLoaded.current) return; // Only fetch once per page session
    setPickerLoading(true);
    try {
      const res = await testCatalogService.getCatalog(1, 200);
      if (res.isSuccess) {
        // Only ACTIVE tests; exclude any test that is not status ACTIVE
        setAllCatalog(res.value.data.filter(t => !t.status || t.status === 'ACTIVE'));
        pickerLoaded.current = true;
      }
    } finally {
      setPickerLoading(false);
    }
  }, []);

  const openPicker = () => {
    setPickerOpen(true);
    setPickerQuery('');
    loadCatalogForPicker();
    setTimeout(() => pickerInputRef.current?.focus(), 50);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setPickerQuery('');
  };

  const addRelatedTest = (test: TestItem) => {
    // Prevent self-selection
    if (test.slug === formData.slug) return;
    // Prevent duplicates
    if (relatedTests.some(rt => rt.slug === test.slug)) return;
    setRelatedTests(prev => [...prev, {
      title: test.title,
      category: test.category,
      description: test.description || '',
      slug: test.slug,
      status: test.status || 'ACTIVE',
    }]);
  };

  const removeRelatedTest = (slug: string) => {
    setRelatedTests(prev => prev.filter(rt => rt.slug !== slug));
  };

  // Filtered picker results: exclude current test + already selected + apply search
  const pickerResults = allCatalog.filter(t => {
    if (t.slug === formData.slug) return false;
    if (relatedTests.some(rt => rt.slug === t.slug)) return false;
    if (!pickerQuery.trim()) return true;
    const q = pickerQuery.toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });


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
                  placeholder="e.g. Do I need to fast before this test?"
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

        {/* ── Related Tests ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-premium border border-gray-100 p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Related Tests</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Only ACTIVE tests. Titles are snapshotted — if you rename a test, re-save this page to refresh.
              </p>
            </div>
            <button
              type="button"
              onClick={openPicker}
              className="btn btn-secondary text-sm px-4 py-2"
            >
              + Add Related Test
            </button>
          </div>

          {/* Selected chips */}
          {relatedTests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No related tests selected. Click &quot;Add Related Test&quot; to curate.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {relatedTests.map(rt => (
                <span
                  key={rt.slug}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  <span>{rt.title}</span>
                  <span className="text-xs text-primary/60">({rt.category})</span>
                  <button
                    type="button"
                    onClick={() => removeRelatedTest(rt.slug)}
                    className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors text-xs leading-none"
                    aria-label={`Remove ${rt.title}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Picker dropdown */}
          {pickerOpen && (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 flex-shrink-0">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={pickerInputRef}
                  type="text"
                  value={pickerQuery}
                  onChange={e => setPickerQuery(e.target.value)}
                  placeholder="Search tests by name, category..."
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={closePicker}
                  className="text-gray-400 hover:text-gray-600 ml-2 text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {pickerLoading && (
                  <div className="p-4 text-center text-sm text-gray-400">Loading tests...</div>
                )}
                {!pickerLoading && pickerResults.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-400">
                    {pickerQuery ? `No active tests matching "${pickerQuery}"` : 'No available tests to add.'}
                  </div>
                )}
                {!pickerLoading && pickerResults.map(test => (
                  <button
                    key={test.slug}
                    type="button"
                    onClick={() => addRelatedTest(test)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{test.title}</p>
                        <p className="text-xs text-gray-400 truncate">{test.category}{test.price ? ` · ₹${test.price}` : ''}</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary flex-shrink-0">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
