'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { staffService } from '@/services';
import { StaffModel, RoleModel } from '@/domains/staff/model';

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.staffId as string;
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [staff, setStaff] = useState<StaffModel | null>(null);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const [staffRes, rolesRes] = await Promise.all([
        staffService.getStaffById(staffId),
        staffService.getAllRoles()
      ]);
      
      if (staffRes.isSuccess) setStaff(staffRes.value);
      if (rolesRes.isSuccess) setRoles(rolesRes.value);
    };
    loadData();
  }, [staffId]);

  const handleChange = (field: keyof StaffModel, value: any) => {
    if (staff) {
      setStaff({ ...staff, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!staff) return;
    setIsSaving(true);
    const res = await staffService.updateStaff(staff.id, staff);
    setIsSaving(false);
    
    if (res.isSuccess) {
      toast({ title: 'Staff Updated', description: 'Staff member details have been saved.', variant: 'success' });
      router.push('/admin/staff');
    } else {
      toast({ title: 'Update Failed', description: 'Failed to update staff member.', variant: 'danger' });
    }
  };

  if (!mounted || !staff) return null;

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[800px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-6"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/staff')}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
          >
            <AdminIcon name="chevronLeft" className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-[28px] font-black text-slate-900 m-0 tracking-tight">Edit Staff Member</h1>
            <p className="text-[15px] font-medium text-slate-500 m-0 mt-1">Manage profile, role, and department assignment.</p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
             <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400">
               {staff.name.substring(0, 2).toUpperCase()}
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-900 m-0">{staff.name}</h2>
               <div className="text-sm font-medium text-slate-500">{staff.id}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-slate-700">Full Name</label>
              <input 
                type="text" 
                value={staff.name}
                onChange={e => handleChange('name', e.target.value)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-[15px] font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-slate-700">Email Address</label>
              <input 
                type="email" 
                value={staff.email}
                onChange={e => handleChange('email', e.target.value)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-[15px] font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-slate-700">Phone Number</label>
              <input 
                type="text" 
                value={staff.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-[15px] font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-extrabold text-slate-700">Security Role</label>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                  Scope: {roles.find(r => r.id === staff.role)?.scope?.replace('_', ' ') || 'Global'}
                </span>
              </div>
              <select 
                value={staff.role}
                onChange={e => handleChange('role', e.target.value)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-[15px] font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-slate-700">Department</label>
              <select 
                value={staff.department}
                onChange={e => handleChange('department', e.target.value)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-[15px] font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
              >
                <option value="General">General</option>
                <option value="Pathology">Pathology</option>
                <option value="Phlebotomy">Phlebotomy</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-extrabold text-slate-700">Status</label>
              <select 
                value={staff.status}
                onChange={e => handleChange('status', e.target.value)}
                className="h-12 px-4 rounded-xl border border-slate-200 text-[15px] font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
              >
                <option value="On Duty">On Duty</option>
                <option value="Off Duty">Off Duty</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
            <button 
              onClick={() => router.push('/admin/staff')}
              className="px-6 h-12 rounded-xl text-[14px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 h-12 rounded-xl text-[14px] font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
