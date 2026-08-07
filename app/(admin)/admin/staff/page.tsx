'use client';

import React, { useState } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { Drawer } from '@/components/ui/Drawer';

// --- MOCK DATA TYPES ---
type Role = { id: string; title: string; internal: string; users: number; desc: string; color: string };
type Staff = { id: string; name: string; roleId: string; email: string; status: 'Active' | 'Pending' | 'Suspended'; avatar: string };
type Permission = { name: string; description: string; view: boolean; create: boolean; edit: boolean; del: boolean };
type ModuleData = { id: string; title: string; description: string; permissions: Permission[] };

// --- INITIAL STATE DATA ---
const initialRoles: Role[] = [
  { id: 'admin', title: 'System Administrator', internal: 'ADMIN', users: 3, desc: 'Unrestricted system access.', color: '#3b82f6' },
  { id: 'op', title: 'Operation Manager', internal: 'OPERATION_MANAGER', users: 12, desc: 'Manages day-to-day operations.', color: '#10b981' },
  { id: 'path', title: 'Lead Pathologist', internal: 'PATHOLOGIST', users: 5, desc: 'Oversees lab results & reports.', color: '#8b5cf6' },
  { id: 'phleb', title: 'Phlebotomist', internal: 'FIELD_AGENT', users: 24, desc: 'Home collection field agents.', color: '#f59e0b' },
];

const initialStaff: Staff[] = [
  { id: '1', name: 'Sarah Jenkins', roleId: 'admin', email: 'sarah@agam.com', status: 'Active', avatar: 'SJ' },
  { id: '2', name: 'Michael Chen', roleId: 'op', email: 'mchen@agam.com', status: 'Active', avatar: 'MC' },
  { id: '3', name: 'Dr. Robert Wilson', roleId: 'path', email: 'rwilson@agam.com', status: 'Active', avatar: 'RW' },
  { id: '4', name: 'Amanda Gomez', roleId: 'phleb', email: 'agomez@agam.com', status: 'Pending', avatar: 'AG' },
  { id: '5', name: 'David Lee', roleId: 'op', email: 'dlee@agam.com', status: 'Active', avatar: 'DL' },
];

const baseModules: ModuleData[] = [
  { id: 'patients', title: 'Patient Records', description: 'Access and modify patient medical data.', permissions: [{ name: 'records', description: '', view: false, create: false, edit: false, del: false }] },
  { id: 'orders', title: 'Service Orders', description: 'Manage home collections and lab orders.', permissions: [{ name: 'orders', description: '', view: false, create: false, edit: false, del: false }] },
  { id: 'reports', title: 'Financial Reports', description: 'View revenue and billing metrics.', permissions: [{ name: 'finance', description: '', view: false, create: false, edit: false, del: false }] },
  { id: 'catalog', title: 'Test Catalog', description: 'Manage available tests and pricing.', permissions: [{ name: 'catalog', description: '', view: false, create: false, edit: false, del: false }] },
];

const createRolePerms = (grants: Record<string, Partial<Permission>>): ModuleData[] => {
  return baseModules.map(m => {
    const grant = grants[m.id] || {};
    return {
      ...m,
      permissions: m.permissions.map(p => ({ ...p, ...grant }))
    };
  });
};

const initialPermissionsMap: Record<string, ModuleData[]> = {
  admin: createRolePerms({ patients: { view: true, create: true, edit: true, del: true }, orders: { view: true, create: true, edit: true, del: true }, reports: { view: true, create: true, edit: true, del: true }, catalog: { view: true, create: true, edit: true, del: true } }),
  op: createRolePerms({ patients: { view: true, create: true, edit: true }, orders: { view: true, create: true, edit: true }, catalog: { view: true, create: true, edit: true } }),
  path: createRolePerms({ patients: { view: true, edit: true }, orders: { view: true } }),
  phleb: createRolePerms({ patients: { view: true }, orders: { view: true, edit: true } }),
};

export default function HighlyVisualizedStaffRoles() {
  // STATE
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [rolePermissions, setRolePermissions] = useState(initialPermissionsMap);
  const { toast } = useToast();
  
  const [activeRole, setActiveRole] = useState(roles[0].id);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  
  const [hoverRole, setHoverRole] = useState<string | null>(null);

  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleInternal, setNewRoleInternal] = useState('');

  const activeRoleInfo = roles.find(r => r.id === activeRole)!;
  const activeStaff = staff.filter(s => s.roleId === activeRole);
  const currentModules = rolePermissions[activeRole] || createRolePerms({});

  // ACTIONS
  const handleTogglePermission = (moduleId: string, field: 'view' | 'create' | 'edit' | 'del') => {
    if (activeRole === 'admin') return; 
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
  };

  const handleSendInvite = () => {
    if (!newInviteEmail) return;
    const newStaff: Staff = {
      id: Math.random().toString(),
      name: newInviteEmail.split('@')[0], 
      email: newInviteEmail,
      roleId: roles[0].id,
      status: 'Pending',
      avatar: newInviteEmail.substring(0, 2).toUpperCase()
    };
    setStaff([...staff, newStaff]);
    setIsInviteOpen(false);
    setNewInviteEmail('');
    toast({ title: 'Invitation Sent', description: `An email has been sent to ${newInviteEmail}.`, variant: 'success' });
  };

  const handleCreateRole = () => {
    if (!newRoleTitle || !newRoleInternal) return;
    const newId = newRoleInternal.toLowerCase();
    const newRole: Role = {
      id: newId, title: newRoleTitle, internal: newRoleInternal, users: 0, desc: 'Custom created role.', color: '#0ea5e9'
    };
    setRoles([...roles, newRole]);
    setRolePermissions({ ...rolePermissions, [newId]: createRolePerms({}) });
    setActiveRole(newId);
    setIsNewRoleOpen(false);
    setNewRoleTitle('');
    setNewRoleInternal('');
    toast({ title: 'Role Created', description: `The role "${newRoleTitle}" has been created.`, variant: 'success' });
  };

  return (
    <AdminPageTemplate>
      <div 
        style={{ 
          maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '32px 40px',
          display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%', fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        {/* TOP HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '24px 32px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Organization & Access</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Manage your entire workforce, roles, and granular permissions from one command center.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
        <div style={{ display: 'flex', gap: '32px', flex: 1, minHeight: '700px' }}>
          
          {/* LEFT: ROLES NAVIGATION */}
          <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Security Roles</h2>
              <button 
                onClick={() => setIsNewRoleOpen(true)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <AdminIcon name="plus" style={{ width: '14px', height: '14px' }} /> New Role
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roles.map(role => {
                const isActive = activeRole === role.id;
                const isHovered = hoverRole === role.id;
                
                return (
                  <div 
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    onMouseEnter={() => setHoverRole(role.id)}
                    onMouseLeave={() => setHoverRole(null)}
                    style={{
                      padding: '20px',
                      backgroundColor: isActive ? '#ffffff' : (isHovered ? '#f8fafc' : '#ffffff'),
                      borderRadius: '16px',
                      border: `1px solid ${isActive ? '#bfdbfe' : '#e2e8f0'}`,
                      boxShadow: isActive ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isHovered && !isActive ? 'translateY(-2px)' : 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: role.color }} />}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${role.color}15`, color: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* TOP: STAFF IN ROLE */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: activeRoleInfo.color }}></div>
                    Staff Assigned to {activeRoleInfo.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>These members inherit the permissions defined in the matrix below.</p>
                </div>
                <div style={{ position: 'relative' }}>
                  <AdminIcon name="search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                  <input type="text" placeholder="Find member..." style={{ padding: '10px 16px 10px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', width: '220px', backgroundColor: '#f8fafc' }} />
                </div>
              </div>

              {/* Minimalist Staff Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {activeStaff.map(staff => (
                  <div key={staff.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#475569', flexShrink: 0 }}>
                      {staff.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.name}</span>
                        {staff.status === 'Pending' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0 }}></span>}
                        {staff.status === 'Active' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }}></span>}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.email}</div>
                    </div>
                  </div>
                ))}
                
                {activeStaff.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: 600, border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                    No staff currently assigned to this role.
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM: CRUD PERMISSIONS MATRIX */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>CRUD Operations Matrix</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Configure granular access controls for {activeRoleInfo.title}.</p>
                </div>
                {activeRole === 'admin' && (
                  <div style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AdminIcon name="info" style={{ width: '16px', height: '16px' }} />
                    System Admin is immutable
                  </div>
                )}
              </div>

              {/* Clean Enterprise Matrix */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 90px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource Module</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Read</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Create</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Update</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Delete</div>
                </div>

                {/* Rows */}
                {currentModules.map((mod, i) => (
                  <div key={mod.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 90px', padding: '20px 24px', borderBottom: i !== currentModules.length - 1 ? '1px solid #f1f5f9' : 'none', backgroundColor: '#ffffff' }}>
                    <div style={{ paddingRight: '24px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{mod.title}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{mod.description}</div>
                    </div>
                    
                    {['view', 'create', 'edit', 'del'].map((op) => {
                      const isChecked = activeRole === 'admin' ? true : mod.permissions[0][op as keyof typeof mod.permissions[0]] as boolean;
                      return (
                        <div key={op} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            type="button"
                            onClick={() => handleTogglePermission(mod.id, op as any)}
                            disabled={activeRole === 'admin'}
                            style={{ 
                              width: '24px', height: '24px', borderRadius: '6px', 
                              border: `2px solid ${isChecked ? activeRoleInfo.color : '#cbd5e1'}`, 
                              backgroundColor: isChecked ? activeRoleInfo.color : '#ffffff',
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

      {/* MODALS */}
      <Drawer open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <Drawer.Content side="right" className="p-0 bg-white sm:w-[500px] w-full flex flex-col">
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Invite Member</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Send a secure portal invitation.</p>
            </div>
            <button onClick={() => setIsInviteOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <AdminIcon name="x" style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <button onClick={handleSendInvite} style={{ height: '48px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer', marginTop: '12px' }}>
              Send Invitation Link
            </button>
          </div>
        </Drawer.Content>
      </Drawer>

      <Drawer open={isNewRoleOpen} onOpenChange={setIsNewRoleOpen}>
        <Drawer.Content side="right" className="p-0 bg-white sm:w-[500px] w-full flex flex-col">
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Role</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Define a new security profile.</p>
            </div>
            <button onClick={() => setIsNewRoleOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <AdminIcon name="x" style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <button onClick={handleCreateRole} style={{ height: '48px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer', marginTop: '12px' }}>
              Create Custom Role
            </button>
          </div>
        </Drawer.Content>
      </Drawer>
    </AdminPageTemplate>
  );
}
