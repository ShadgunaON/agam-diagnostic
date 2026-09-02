'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { testCatalogService, serviceCatalogService, packageService } from '@/services';
import { useRBAC } from '@/hooks/useRBAC';
import { TestItem } from '@/domains/tests/model';
import { ServiceItem } from '@/domains/services/model';
import { PackageItem } from '@/domains/packages/model';

export default function AdminCatalogPage() {
  const { hasPermission } = useRBAC();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'services' | 'packages'>('tests');
  const [isLoading, setIsLoading] = useState(true);
  
  const [tests, setTests] = useState<TestItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [testsRes, servicesRes, packagesRes] = await Promise.all([
        testCatalogService.getCatalog(1, 1000),
        serviceCatalogService.getCatalog(1, 1000),
        packageService.getCatalog(1, 1000)
      ]);
      
      if (testsRes.isSuccess) setTests(testsRes.value.data);
      if (servicesRes.isSuccess) setServices(servicesRes.value.data);
      if (packagesRes.isSuccess) setPackages(packagesRes.value.data);
    } catch (error) {
      toast.error('Error', 'Failed to load catalog data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (type: 'test' | 'service' | 'package', id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      if (type === 'test') {
        await testCatalogService.updateStatus(id, newStatus);
        setTests(tests.map(t => t.id === id ? { ...t, status: newStatus } : t));
      } else if (type === 'service') {
        await serviceCatalogService.updateStatus(id, newStatus);
        setServices(services.map(s => s.id === id ? { ...s, status: newStatus } : s));
      } else if (type === 'package') {
        await packageService.updateStatus(id, newStatus);
        setPackages(packages.map(p => p.id === id ? { ...p, status: newStatus } : p));
      }
      toast.success('Success', 'Status updated successfully');
    } catch (error) {
      toast.error('Error', 'Failed to update status');
    }
  };

  if (!mounted) return null;

  return (
    <AdminPageTemplate
      title="Catalog Management"
      description="Manage your Tests, Services, and Packages"
      headerActions={
        hasPermission('catalog', 'create') ? (
          <Link href={`/admin/catalog/${activeTab === 'packages' ? 'packages' : activeTab + 's'}/new`} className="btn btn-primary">
            <AdminIcon name="plus" width={16} height={16} className="mr-2" />
            Add New {activeTab === 'packages' ? 'Package' : activeTab.slice(0, -1)}
          </Link>
        ) : undefined
      }
    >
      <div className="bg-white rounded-xl shadow-premium border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'tests' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Tests ({tests.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'services' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'packages' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Packages ({packages.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-premium border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading catalog...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">Item Details</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">Category</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">Price</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">Status</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTab === 'tests' && tests.map(item => (
                <CatalogRow key={item.id} item={item} type="test" toggleStatus={toggleStatus} hasEdit={hasPermission('catalog', 'edit')} />
              ))}
              {activeTab === 'services' && services.map(item => (
                <CatalogRow key={item.id} item={item} type="service" toggleStatus={toggleStatus} hasEdit={hasPermission('catalog', 'edit')} />
              ))}
              {activeTab === 'packages' && packages.map(item => (
                <CatalogRow key={item.id} item={item} type="package" toggleStatus={toggleStatus} hasEdit={hasPermission('catalog', 'edit')} />
              ))}
              
              {((activeTab === 'tests' && tests.length === 0) || 
                (activeTab === 'services' && services.length === 0) || 
                (activeTab === 'packages' && packages.length === 0)) && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageTemplate>
  );
}

function CatalogRow({ item, type, toggleStatus, hasEdit }: { item: any, type: 'test' | 'service' | 'package', toggleStatus: any, hasEdit: boolean }) {
  const status = item.status || 'ACTIVE';
  
  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <AdminIcon name={type === 'test' ? 'fileText' : type === 'service' ? 'activity' : 'package'} width={18} height={18} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {item.title}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[300px]">
              ID: {item.id} • Slug: {item.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
          {item.category || 'General'}
        </span>
      </td>
      <td className="py-4 px-6 font-medium text-gray-900">
        ₹{item.price || item.packagePrice || item.basePrice || 0}
      </td>
      <td className="py-4 px-6">
        <button
          onClick={() => hasEdit && toggleStatus(type, item.id, status)}
          disabled={!hasEdit}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            status === 'ACTIVE' 
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          } ${!hasEdit && 'opacity-75 cursor-not-allowed'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          {status}
        </button>
      </td>
      <td className="py-4 px-6 text-right">
        {hasEdit ? (
          <Link
            href={`/admin/catalog/${type}s/${encodeURIComponent(item.id)}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <AdminIcon name="edit" width={16} height={16} />
          </Link>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
    </tr>
  );
}
