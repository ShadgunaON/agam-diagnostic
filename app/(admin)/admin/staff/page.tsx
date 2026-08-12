'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { Drawer } from '@/components/ui/Drawer';

import { staffService } from '@/services';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';

export default function HighlyVisualizedStaffRoles() {
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [staff, setStaff] = useState<StaffModel[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, ModuleDataModel[]>>({});
  const { toast } = useToast();
  
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const [staffRes, rolesRes, permsRes] = await Promise.all([
        staffService.getAllStaff(),
        staffService.getAllRoles(),
        staffService.getAllPermissionsMap()
      ]);

      if (rolesRes.isSuccess) {
        setRoles(rolesRes.value);
        if (rolesRes.value.length > 0) {
          setActiveRole(rolesRes.value[0].id);
        }
      }
      if (staffRes.isSuccess) setStaff(staffRes.value);
      if (permsRes.isSuccess) setRolePermissions(permsRes.value);
    };
    loadData();
  }, []);
  
  const [hoverRole, setHoverRole] = useState<string | null>(null);

  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleInternal, setNewRoleInternal] = useState('');

  const activeRoleInfo = activeRole ? roles.find(r => r.id === activeRole) : null;
  const activeStaff = activeRole ? staff.filter(s => s.role === activeRole) : [];
  const currentModules = activeRole && rolePermissions[activeRole] ? rolePermissions[activeRole] : [];

  // ACTIONS
  const handleTogglePermission = async (moduleId: string, field: 'view' | 'create' | 'edit' | 'del') => {
    if (activeRole === 'admin' || !activeRole) return; 
    
    // Optimistic UI Update
    setRolePermissions(prev => {
      const newMap = { ...prev };
      const modules = [...newMap[activeRole]];
      const modIndex = modules.findIndex(m => m.id === moduleId);
      
      const newMod = { ...modules[modIndex] };
      const newPerm = { ...newMod.permissions[0] };
      
      newPerm[field] = !newPerm[field];
      newMod.permissions = [newPerm];
      modules[modIndex] = newMod;
      
      newMap[activeRole] = modules;
      return newMap;
    });

    // Update backend (Service)
    const currentValue = rolePermissions[activeRole]?.find(m => m.id === moduleId)?.permissions[0][field];
    await staffService.updateRolePermissions(activeRole, moduleId, field, !currentValue);
  };

  const handleSendInvite = async () => {
    if (!newInviteEmail) return;
    const res = await staffService.createStaff({
      name: newInviteEmail.split('@')[0], 
      email: newInviteEmail,
      role: activeRole || (roles.length > 0 ? roles[0].id : 'admin'),
      status: 'On Leave', // Closest to pending/inactive in current model
      department: 'General',
      shift: 'Morning',
      phone: '0000000000',
      joinDate: new Date().toLocaleDateString()
    });
    
    if (res.isSuccess) {
      setStaff([...staff, res.value]);
      setIsInviteOpen(false);
      setNewInviteEmail('');
      toast({ title: 'Invitation Sent', description: `An email has been sent to ${newInviteEmail}.`, variant: 'success' });
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleTitle || !newRoleInternal) return;
    const newId = newRoleInternal.toLowerCase();
    
    const res = await staffService.createRole({
      id: newId, title: newRoleTitle, internal: newRoleInternal, users: 0, desc: 'Custom created role.', color: '#0ea5e9'
    });

    if (res.isSuccess) {
      setRoles([...roles, res.value]);
      // The service mock will initialize empty permissions
      const permsRes = await staffService.getAllPermissionsMap();
      if (permsRes.isSuccess) {
        setRolePermissions(permsRes.value);
      }
      setActiveRole(newId);
      setIsNewRoleOpen(false);
      setNewRoleTitle('');
      setNewRoleInternal('');
      toast({ title: 'Role Created', description: `The role "${newRoleTitle}" has been created.`, variant: 'success' });
    }
  };

  if (!mounted) return null;

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[1600px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-4 lg:gap-8 min-h-full"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 lg:p-6 xl:p-8 rounded-[20px] border border-slate-200 shadow-sm gap-4 md:gap-0">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Organization & Access</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Manage your entire workforce, roles, and granular permissions from one command center.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsInviteOpen(true)}
              style={{ 
                height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none', 
                backgroundColor: '#0f172a', color: '#ffffff', 
                fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)', transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <AdminIcon name="userPlus" style={{ width: '18px', height: '18px' }} />
              Invite Member
            </button>
          </div>
        </div>

        {/* SPLIT DASHBOARD LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[700px]">
          
          {/* LEFT: ROLES NAVIGATION */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Security Roles</h2>
              <button 
                onClick={() => setIsNewRoleOpen(true)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <AdminIcon name="plus" style={{ width: '14px', height: '14px' }} /> New Role
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {roles.map(role => {
                const isActive = activeRole === role.id;
                const isHovered = hoverRole === role.id;
                
                return (
                  <div 
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    onMouseEnter={() => setHoverRole(role.id)}
                    onMouseLeave={() => setHoverRole(null)}
                    className="p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? '#ffffff' : (isHovered ? '#f8fafc' : '#ffffff'),
                      border: `1px solid ${isActive ? '#bfdbfe' : '#e2e8f0'}`,
                      boxShadow: isActive ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                      transform: isHovered && !isActive ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: role.color }} />}
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${role.color}15`, color: role.color }}>
                          <AdminIcon name="userCog" style={{ width: '18px', height: '18px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{role.title}</div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>{role.internal}</div>
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                        {role.users} Staff
                      </div>
                    </div>
                    
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500, lineHeight: 1.5 }}>
                      {role.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: DYNAMIC ROLE DASHBOARD */}
          <div className="flex-1 flex flex-col gap-8">
            
            {/* TOP: STAFF IN ROLE */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {activeRoleInfo && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: activeRoleInfo.color }}></div>}
                    Staff Assigned to {activeRoleInfo?.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>These members inherit the permissions defined in the matrix below.</p>
                </div>
                <div className="relative w-full sm:w-auto">
                  <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Find member..." className="py-2.5 pr-4 pl-9 rounded-xl border border-slate-200 text-sm outline-none w-full sm:w-[220px] bg-slate-50" />
                </div>
              </div>

              {/* Minimalist Staff Cards Grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {activeStaff.map(staff => (
                  <Link href={`/admin/staff/${staff.id}`} key={staff.id} style={{ textDecoration: 'none' }}>
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 transition-colors duration-200 cursor-pointer h-full" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-base font-extrabold text-slate-600 shrink-0">
                        {staff.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[15px] font-extrabold text-slate-900 truncate">{staff.name}</span>
                          {staff.status === 'On Leave' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0 }}></span>}
                          {staff.status === 'On Duty' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }}></span>}
                          {staff.status === 'Off Duty' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }}></span>}
                        </div>
                        <div className="text-[13px] font-medium text-slate-500 truncate">{staff.email}</div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {activeStaff.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: 600, border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                    No staff currently assigned to this role.
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM: CRUD PERMISSIONS MATRIX */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 lg:p-8 shadow-sm flex-1 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>CRUD Operations Matrix</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Configure granular access controls for {activeRoleInfo?.title}.</p>
                </div>
                {activeRole === 'admin' && (
                  <div style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AdminIcon name="info" style={{ width: '16px', height: '16px' }} />
                    System Admin is immutable
                  </div>
                )}
              </div>

              {/* Clean Enterprise Matrix */}
              <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_90px_90px_90px_90px] bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource Module</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Read</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Create</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Update</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Delete</div>
                  </div>

                  {/* Rows */}
                  {currentModules.map((mod, i) => (
                    <div key={mod.id} className={`grid grid-cols-[1fr_90px_90px_90px_90px] px-6 py-5 bg-white ${i !== currentModules.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="pr-6">
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{mod.title}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{mod.description}</div>
                    </div>
                    
                    {['view', 'create', 'edit', 'del'].map((op) => {
                      const isChecked = activeRole === 'admin' ? true : (mod.permissions && mod.permissions.length > 0 ? mod.permissions[0][op as keyof typeof mod.permissions[0]] as boolean : false);
                      return (
                        <div key={op} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            type="button"
                            onClick={() => handleTogglePermission(mod.id, op as any)}
                            disabled={activeRole === 'admin'}
                            style={{ 
                              width: '24px', height: '24px', borderRadius: '6px', 
                              border: `2px solid ${isChecked ? (activeRoleInfo?.color || '#3b82f6') : '#cbd5e1'}`, 
                              backgroundColor: isChecked ? (activeRoleInfo?.color || '#3b82f6') : '#ffffff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: activeRole === 'admin' ? 0.5 : 1,
                              cursor: activeRole === 'admin' ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isChecked && <AdminIcon name="check" style={{ width: '14px', height: '14px', color: '#ffffff' }} strokeWidth={4} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Drawer open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <Drawer.Content side="right" className="p-0 bg-white sm:w-[500px] w-full flex flex-col">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Invite Member</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Send a secure portal invitation.</p>
            </div>
            <button onClick={() => setIsInviteOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <AdminIcon name="x" style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                value={newInviteEmail}
                onChange={e => setNewInviteEmail(e.target.value)}
                placeholder="colleague@agam.com" 
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Assign Security Role</label>
              <select style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' }}>
                {roles.map(r => <option key={r.id}>{r.title}</option>)}
              </select>
            </div>
            <button onClick={handleSendInvite} className="h-12 rounded-xl bg-slate-900 text-white text-[15px] font-extrabold mt-3 hover:bg-slate-800 transition-colors">
              Send Invitation Link
            </button>
          </div>
        </Drawer.Content>
      </Drawer>

      <Drawer open={isNewRoleOpen} onOpenChange={setIsNewRoleOpen}>
        <Drawer.Content side="right" className="p-0 bg-white sm:w-[500px] w-full flex flex-col">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Role</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Define a new security profile.</p>
            </div>
            <button onClick={() => setIsNewRoleOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <AdminIcon name="x" style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Role Title</label>
              <input 
                type="text" 
                value={newRoleTitle}
                onChange={e => setNewRoleTitle(e.target.value)}
                placeholder="e.g. Area Manager" 
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Internal Identifier</label>
              <input 
                type="text" 
                value={newRoleInternal}
                onChange={e => setNewRoleInternal(e.target.value.toUpperCase())}
                placeholder="AREA_MANAGER" 
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
              />
            </div>
            <button onClick={handleCreateRole} className="h-12 rounded-xl bg-slate-900 text-white text-[15px] font-extrabold mt-3 hover:bg-slate-800 transition-colors">
              Create Custom Role
            </button>
          </div>
        </Drawer.Content>
      </Drawer>
    </AdminPageTemplate>
  );
}
