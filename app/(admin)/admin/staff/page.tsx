'use client';

import React, { useState } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  return (
    <AdminPageTemplate>
      <div className="flex flex-col min-h-0 w-full mx-auto" style={{ maxWidth: '1440px', padding: '32px 40px', gap: '32px' }}>

        {/* Top Navigation Switcher - Rendered manually since template doesn't render toolbar */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md scale-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 scale-95'}`}
          >
            Staff & Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'roles' ? 'bg-blue-600 text-white shadow-md scale-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 scale-95'}`}
          >
            Roles & Permissions
          </button>
        </div>

        {/* Main View Area */}
        <div className="flex-1">
          {activeTab === 'users' ? <UsersView /> : <RolesView />}
        </div>
      </div>
    </AdminPageTemplate>
  );
}

/* =====================================================================
 * USERS VIEW (Matches Image 1 exactly)
 * ===================================================================== */
function UsersView() {
  const users = [
    { name: 'sid', status: 'Active', isYou: false, date: 'Joined Jul 22, 2026', email: 'yhshadgunasiddhi+1@gmail.com', role: 'user manager' },
    { name: 'siddhi', status: 'Active', isYou: true, date: 'Joined Jul 21, 2026', email: 'shadguna@orbitnexa.com', role: 'Administrator' },
    { name: 'JILK', status: 'Active', isYou: false, date: 'Joined Jul 21, 2026', email: 'jilk@yopmail.net', role: 'Operation Manager' },
    { name: 'KJI', status: 'Active', isYou: false, date: 'Joined Jul 21, 2026', email: 'kji@yopmail.net', role: 'Administrator' },
    { name: 'KO', status: 'Active', isYou: false, date: 'Joined Jul 21, 2026', email: 'ko@yopmail.net', role: 'Administrator' },
    { name: 'RAi', status: 'Active', isYou: false, date: 'Joined Jul 21, 2026', email: 'rai@yopmail.net', role: 'Administrator' },
    { name: 'ash', status: 'Active', isYou: false, date: 'Joined Jul 21, 2026', email: 'ashwan@orbitnexa.com', role: 'Administrator' },
  ];

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Search */}
      <div className="flex items-center justify-between p-6">
        <div className="relative w-80">
          <AdminIcon name="search" className="absolute top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} style={{ left: '16px', width: '16px', height: '16px' }} />
          <input
            type="text"
            placeholder="Search name, email or role"
            className="w-full rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            style={{ height: '44px', paddingLeft: '44px', paddingRight: '16px' }}
          />
        </div>
        <button className="px-6 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors" style={{ height: '40px' }}>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between px-6 pb-6">
        <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-full">
          <button className="px-5 py-2 rounded-full bg-white text-blue-600 shadow-sm text-sm font-bold flex items-center gap-2 border border-slate-200/50">
            Yaazh Team <span className="bg-blue-50 text-blue-600 px-2 rounded-md text-xs font-black" style={{ paddingTop: '2px', paddingBottom: '2px' }}>7</span>
          </button>
          <button className="px-5 py-2 rounded-full text-slate-500 text-sm font-bold flex items-center gap-2 hover:text-slate-700">
            Clients <span className="bg-slate-200 text-slate-500 px-2 rounded-md text-xs font-black" style={{ paddingTop: '2px', paddingBottom: '2px' }}>3</span>
          </button>
        </div>

        <div className="flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
          <button className="px-5 rounded-full text-slate-500 text-sm font-bold hover:text-slate-700" style={{ paddingTop: '6px', paddingBottom: '6px' }}>Pending</button>
          <button className="px-5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-bold" style={{ paddingTop: '6px', paddingBottom: '6px' }}>Active</button>
          <button className="px-5 rounded-full text-slate-500 text-sm font-bold hover:text-slate-700" style={{ paddingTop: '6px', paddingBottom: '6px' }}>Rejected</button>
        </div>
      </div>

      {/* Table List */}
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: '800px' }}>
          <div className="grid grid-cols-4 gap-6 px-6 py-4 border-y border-slate-200 text-xs font-black text-slate-400 tracking-widest uppercase bg-slate-50/50">
            <div className="col-span-1 pl-2">USER</div>
            <div className="col-span-1">EMAIL</div>
            <div className="col-span-1">ROLE</div>
            <div className="col-span-1 pr-2 text-right">ACTION</div>
          </div>

          <div className="flex flex-col">
            {users.map((user, i) => (
              <div key={i} className="grid grid-cols-4 gap-6 px-6 py-5 border-b border-slate-100 items-center hover:bg-slate-50/80 transition-colors">
                <div className="col-span-1 pl-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-base text-slate-900 tracking-tight">{user.name}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 rounded-md tracking-wider uppercase" style={{ paddingTop: '2px', paddingBottom: '2px' }}>{user.status}</span>
                    {user.isYou && <span className="text-slate-400 text-xs font-bold uppercase tracking-wider ml-1 bg-slate-100 px-2 rounded-md" style={{ paddingTop: '2px', paddingBottom: '2px' }}>You</span>}
                  </div>
                  <div className="text-sm text-slate-400 font-medium">{user.date}</div>
                </div>
                <div className="col-span-1 text-sm text-slate-500 font-mono tracking-tight font-medium">{user.email}</div>
                <div className="col-span-1 text-sm text-slate-700 font-bold">{user.role}</div>
                <div className="col-span-1 flex justify-end pr-2">
                  <div className="relative inline-block w-40">
                    <select className="appearance-none pl-4 pr-10 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer w-full text-left shadow-sm" style={{ height: '40px' }}>
                      <option>Change role...</option>
                    </select>
                    <AdminIcon name="chevronDown" className="absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" strokeWidth={3} style={{ right: '12px', width: '16px', height: '16px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * ROLES & PERMISSIONS VIEW (Matches Image 2 exactly)
 * ===================================================================== */
type Permission = { name: string; description: string; view: boolean; create: boolean; edit: boolean; del: boolean };
type ModuleData = { id: string; title: string; defaultExpanded: boolean; permissions: Permission[] };

const baseModules: ModuleData[] = [
  {
    id: 'general', title: 'GENERAL', defaultExpanded: true,
    permissions: [
      { name: 'Overview', description: 'View general operational metrics and status.', view: false, create: false, edit: false, del: false }
    ]
  },
  {
    id: 'operations', title: 'OPERATIONS', defaultExpanded: true,
    permissions: [
      { name: 'Service Orders', description: 'Create and manage patient service orders.', view: false, create: false, edit: false, del: false },
      { name: 'Product Orders', description: 'Handle reagent and inventory orders.', view: false, create: false, edit: false, del: false },
      { name: 'Samples', description: 'Track patient sample lifecycles.', view: false, create: false, edit: false, del: false }
    ]
  },
  {
    id: 'catalog', title: 'CATALOG', defaultExpanded: false,
    permissions: [
      { name: 'Tests & Panels', description: 'Manage diagnostic test catalog.', view: false, create: false, edit: false, del: false },
      { name: 'Pricing', description: 'Manage pricing and discounts.', view: false, create: false, edit: false, del: false }
    ]
  },
  {
    id: 'patients', title: 'PATIENTS', defaultExpanded: false,
    permissions: [
      { name: 'Patient Records', description: 'Access patient medical records.', view: false, create: false, edit: false, del: false }
    ]
  },
  {
    id: 'reports', title: 'REPORTS', defaultExpanded: false,
    permissions: [
      { name: 'Financial Reports', description: 'View and export financial data.', view: false, create: false, edit: false, del: false },
      { name: 'Clinical Reports', description: 'View diagnostic reports.', view: false, create: false, edit: false, del: false }
    ]
  }
];

const grant = (modules: ModuleData[], grantFn: (modId: string, permName: string) => Partial<Permission>): ModuleData[] => {
  return modules.map(m => ({
    ...m,
    permissions: m.permissions.map(p => ({ ...p, ...grantFn(m.id, p.name) }))
  }));
};

const initialPermissionsMap: Record<string, ModuleData[]> = {
  admin: grant(baseModules, () => ({ view: true, create: true, edit: true, del: true })),
  fin: grant(baseModules, (modId, permName) => {
    if (modId === 'reports') return { view: true, create: true, edit: true, del: false };
    if (modId === 'operations' && permName === 'Product Orders') return { view: true, create: false, edit: false, del: false };
    return {};
  }),
  op: grant(baseModules, (modId) => {
    if (modId === 'operations' || modId === 'catalog') return { view: true, create: true, edit: true, del: false };
    if (modId === 'general') return { view: true };
    return {};
  }),
  pm: grant(baseModules, (modId) => {
    if (modId === 'catalog') return { view: true, create: true, edit: true, del: true };
    if (modId === 'operations') return { view: true };
    return {};
  }),
  leads: grant(baseModules, (modId, permName) => {
    if (modId === 'patients') return { view: true, create: true, edit: true, del: false };
    if (modId === 'reports' && permName === 'Clinical Reports') return { view: true };
    return {};
  }),
};

function RolesView() {
  const roles = [
    { id: 'admin', title: 'Administrator', internal: 'ADMIN', badge: 'System', summary: 'Full access' },
    { id: 'op', title: 'Operation Manager', internal: 'OPERATION_MANAGER', summary: 'Custom Access' },
    { id: 'pm', title: 'product manager', internal: 'PRODUCT_MANAGER', summary: 'Custom Access' },
    { id: 'fin', title: 'finaince', internal: 'FINAINCE', summary: 'Custom Access' },
    { id: 'leads', title: 'leads manager', internal: 'LEADS_MANAGER', summary: 'Custom Access' },
  ];

  const [activeRole, setActiveRole] = useState(roles[0].id);
  const [rolePermissions, setRolePermissions] = useState(initialPermissionsMap);

  const activeRoleData = roles.find(r => r.id === activeRole)!;
  const currentModules = rolePermissions[activeRole];

  const handleToggle = (moduleIndex: number, permIndex: number, field: 'view' | 'create' | 'edit' | 'del') => {
    setRolePermissions(prev => {
      const newMap = { ...prev };
      const newModules = [...newMap[activeRole]];
      const newMod = { ...newModules[moduleIndex] };
      const newPerms = [...newMod.permissions];
      const newPerm = { ...newPerms[permIndex] };

      newPerm[field] = !newPerm[field];
      newPerms[permIndex] = newPerm;
      newMod.permissions = newPerms;
      newModules[moduleIndex] = newMod;
      newMap[activeRole] = newModules;

      return newMap;
    });
  };

  let totalModulesWithAccess = 0;
  let totalPermissionsGranted = 0;
  let fullAccessCount = 0;
  let partialAccessCount = 0;

  currentModules.forEach(mod => {
    let modHasAccess = false;
    mod.permissions.forEach(p => {
      let permsGranted = 0;
      if (p.view) permsGranted++;
      if (p.create) permsGranted++;
      if (p.edit) permsGranted++;
      if (p.del) permsGranted++;

      if (permsGranted > 0) {
        modHasAccess = true;
        totalPermissionsGranted += permsGranted;
        if (permsGranted === 4) fullAccessCount++;
        else partialAccessCount++;
      }
    });
    if (modHasAccess) totalModulesWithAccess++;
  });

  return (
    <div className="w-full flex flex-col">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-slate-500 text-base font-medium mt-1">Create roles and assign which pages each can access.</p>
        </div>

        {/* User Profile Bubble */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 pr-4 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <div className="rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-inner" style={{ width: '40px', height: '40px' }}>s</div>
          <div className="pr-1">
            <div className="text-sm font-bold text-slate-800 leading-tight mb-0.5">siddhi</div>
            <div className="text-xs text-slate-500 font-medium leading-tight">Admin</div>
          </div>
          <AdminIcon name="chevronDown" className="text-slate-400 ml-1" strokeWidth={3} style={{ width: '16px', height: '16px' }} />
        </div>
      </div>

      <div className="flex flex-row items-start w-full" style={{ gap: '24px' }}>
        {/* Left Sidebar Roles List - SINGLE CARD CONTAINER */}
        <div className="shrink-0 flex flex-col bg-white border border-slate-200 shadow-sm overflow-hidden" style={{ width: '420px', borderRadius: '16px' }}>

          {/* Search & Actions Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search roles..."
                  className="w-full pl-4 pr-4 rounded-[10px] border border-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
                  style={{ height: '44px' }}
                />
              </div>
              <button className="px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center shadow-sm transition-all active:scale-95 shrink-0" style={{ height: '44px' }}>
                + New
              </button>
            </div>
          </div>

          {/* Roles List */}
          <div className="flex flex-col">
            {roles.map((r, index) => {
              const isActive = activeRole === r.id;

              // Calculate custom summary based on actual state for this role
              const rModules = rolePermissions[r.id];
              let rMods = 0;
              let rPerms = 0;
              rModules.forEach(m => {
                let mHasAccess = false;
                m.permissions.forEach(p => {
                  const pCount = (p.view ? 1 : 0) + (p.create ? 1 : 0) + (p.edit ? 1 : 0) + (p.del ? 1 : 0);
                  if (pCount > 0) {
                    mHasAccess = true;
                    rPerms += pCount;
                  }
                });
                if (mHasAccess) rMods++;
              });
              const customSummary = r.id === 'admin' ? r.summary : `${rMods} mod • ${rPerms} perm`;

              return (
                <div
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`py-4 pr-4 cursor-pointer transition-all flex flex-col ${isActive
                      ? 'bg-blue-50/30'
                      : 'hover:bg-slate-50'
                    } ${index !== roles.length - 1 ? 'border-b border-slate-100' : ''}`}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: isActive ? '#2563eb' : 'transparent',
                    paddingLeft: '16px'
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold tracking-tight truncate pr-2 capitalize ${isActive ? 'text-blue-700' : 'text-slate-900'}`} style={{ fontSize: '15px' }}>{r.title}</span>
                    {r.badge && (
                      <span className="bg-purple-100 border border-purple-200 text-purple-700 font-bold rounded-md uppercase tracking-wider shrink-0" style={{ padding: '2px 6px', fontSize: '9px' }}>
                        {r.badge}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-400 uppercase tracking-widest mb-3 truncate pr-2" style={{ fontSize: '10px' }}>
                    {r.internal}
                  </div>
                  <div>
                    <span className={`font-bold rounded-md inline-flex items-center whitespace-nowrap transition-colors ${isActive ? 'bg-white border border-blue-100 text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`} style={{ padding: '2px 8px', fontSize: '11px' }}>
                      {customSummary}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Content Matrix - TAKES REMAINING WIDTH */}
        <div
          className="flex-1 min-w-0 flex flex-col bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ padding: '32px', borderRadius: '16px', gap: '28px' }}
        >
          {/* 1. ROLE HEADER */}
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-2">
              <h2 className="font-bold text-slate-900 leading-none tracking-tight" style={{ fontSize: '32px' }}>{activeRoleData.title}</h2>
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ fontSize: '13px' }}>{activeRoleData.internal}</span>
                {activeRoleData.badge && (
                  <span className="bg-purple-100 border border-purple-200 text-purple-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ fontSize: '13px' }}>{activeRoleData.badge}</span>
                )}
              </div>
              <p className="text-slate-500 font-medium mt-1" style={{ fontSize: '15px' }}>
                {activeRole === 'admin'
                  ? 'This role has unrestricted access across the platform.'
                  : 'Custom role with specific access constraints.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm uppercase" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                {activeRoleData.title.substring(0, 2)}
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 leading-none truncate max-w-[120px]" style={{ fontSize: '18px' }}>{activeRoleData.title} Team</span>
                  <span className="bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ fontSize: '11px' }}>Active</span>
                </div>
                <span className="text-slate-500 font-medium" style={{ fontSize: '14px' }}>System Role</span>
              </div>
            </div>
          </div>

          {/* 2. STATISTICS ROW */}
          <div className="flex items-center w-full" style={{ gap: '20px' }}>
            {[
              { label: 'Modules', value: totalModulesWithAccess.toString(), icon: 'box', color: 'blue' },
              { label: 'Permissions', value: totalPermissionsGranted.toString(), icon: 'check', color: 'green' },
              { label: 'Full Access', value: fullAccessCount.toString(), icon: 'eye', color: 'amber' },
              { label: 'Partial Access', value: partialAccessCount.toString(), icon: 'filter', color: 'purple' }
            ].map((stat, i) => {
              const borderColors = {
                blue: 'border-t-blue-500',
                green: 'border-t-emerald-500',
                amber: 'border-t-amber-500',
                purple: 'border-t-purple-500'
              };
              const textColors = {
                blue: 'text-blue-600',
                green: 'text-emerald-600',
                amber: 'text-amber-600',
                purple: 'text-purple-600'
              };
              const iconColors = {
                blue: 'text-blue-400',
                green: 'text-emerald-400',
                amber: 'text-amber-400',
                purple: 'text-purple-400'
              };

              return (
                <div
                  key={stat.label}
                  className={`flex-1 bg-white border-x border-b border-x-slate-200 border-b-slate-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 cursor-default animate-in fade-in slide-in-from-bottom-2 ${borderColors[stat.color as keyof typeof borderColors]}`}
                  style={{ animationDelay: `${i * 50}ms`, height: '110px', padding: '16px', borderRadius: '14px', borderTopWidth: '3px' }}
                >
                  <div className="flex items-center justify-between">
                    <AdminIcon name={stat.icon as any} className={iconColors[stat.color as keyof typeof iconColors]} strokeWidth={2.5} style={{ width: '18px', height: '18px' }} />
                    <span className="font-bold text-slate-400 uppercase tracking-wider" style={{ fontSize: '13px' }}>{stat.label}</span>
                  </div>
                  <div className={`font-bold leading-none ${textColors[stat.color as keyof typeof textColors]}`} style={{ fontSize: '34px' }}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. SYSTEM ROLE NOTICE */}
          {activeRole === 'admin' && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100" style={{ height: '56px', padding: '0 18px', borderRadius: '12px' }}>
              <div className="rounded-full bg-blue-100 flex items-center justify-center shrink-0" style={{ width: '28px', height: '28px' }}>
                <AdminIcon name="info" className="text-blue-600" strokeWidth={2.5} style={{ width: '16px', height: '16px' }} />
              </div>
              <div className="flex items-center gap-1.5" style={{ fontSize: '14px' }}>
                <span className="font-bold text-blue-900">System Administrator</span>
                <span className="text-blue-700/80">—</span>
                <span className="text-blue-800 font-medium">This built-in role cannot be edited because it has unrestricted access across the platform.</span>
              </div>
            </div>
          )}

          {/* 4. SEARCH & FILTER TOOLBAR */}
          <div className="flex items-center justify-between w-full">
            <div className="relative" style={{ width: '380px' }}>
              <AdminIcon name="search" className="absolute top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} style={{ left: '14px', width: '18px', height: '18px' }} />
              <input
                type="text"
                placeholder="Search permissions..."
                className="w-full border border-slate-200 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
                style={{ height: '44px', paddingLeft: '40px', paddingRight: '16px', borderRadius: '10px', fontSize: '14px' }}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className="appearance-none border border-slate-200 bg-white font-bold text-slate-700 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 hover:bg-slate-50 transition-colors"
                  style={{ height: '44px', paddingLeft: '16px', paddingRight: '40px', borderRadius: '10px', fontSize: '14px' }}
                >
                  <option>All Modules</option>
                </select>
                <AdminIcon name="chevronDown" className="absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={3} style={{ right: '12px', width: '16px', height: '16px' }} />
              </div>
              <div className="relative">
                <select
                  className="appearance-none border border-slate-200 bg-white font-bold text-slate-700 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 hover:bg-slate-50 transition-colors"
                  style={{ height: '44px', paddingLeft: '16px', paddingRight: '40px', borderRadius: '10px', fontSize: '14px' }}
                >
                  <option>Permission Type</option>
                </select>
                <AdminIcon name="chevronDown" className="absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={3} style={{ right: '12px', width: '16px', height: '16px' }} />
              </div>
            </div>
          </div>

          {/* 5. PERMISSIONS MATRIX */}
          <div className="flex flex-col w-full">
            {/* Matrix Header */}
            <div
              className="border-b border-slate-200"
              style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 90px', padding: '0 20px 12px 20px' }}
            >
              <div className="font-medium text-slate-500 uppercase tracking-wider" style={{ fontSize: '14px' }}>MODULE / PERMISSION</div>
              <div className="font-medium text-slate-500 uppercase tracking-wider text-center" style={{ fontSize: '14px' }}>VIEW</div>
              <div className="font-medium text-slate-500 uppercase tracking-wider text-center" style={{ fontSize: '14px' }}>CREATE</div>
              <div className="font-medium text-slate-500 uppercase tracking-wider text-center" style={{ fontSize: '14px' }}>EDIT</div>
              <div className="font-medium text-slate-500 uppercase tracking-wider text-center" style={{ fontSize: '14px' }}>DELETE</div>
            </div>

            {/* Matrix Groups */}
            <div className="flex flex-col" style={{ gap: '18px', paddingTop: '18px' }}>
              {currentModules.map((mod, mIndex) => {
                let grantedInMod = 0;
                let totalInMod = mod.permissions.length * 4;
                mod.permissions.forEach(p => {
                  if (p.view) grantedInMod++;
                  if (p.create) grantedInMod++;
                  if (p.edit) grantedInMod++;
                  if (p.del) grantedInMod++;
                });

                return (
                  <ModuleGroup
                    key={mod.id}
                    title={mod.title}
                    count={mod.permissions.length.toString()}
                    summary={`${grantedInMod} / ${totalInMod} Enabled`}
                    defaultExpanded={mod.defaultExpanded}
                    permissions={mod.permissions}
                    onToggle={(pIndex, field) => handleToggle(mIndex, pIndex, field)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleGroup({
  title,
  count,
  summary,
  defaultExpanded = false,
  permissions,
  onToggle
}: {
  title: string;
  count: string;
  summary: string;
  defaultExpanded?: boolean;
  permissions: { name: string, description: string, view: boolean, create: boolean, edit: boolean, del: boolean }[];
  onToggle: (index: number, field: 'view' | 'create' | 'edit' | 'del') => void;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white border border-slate-200 overflow-hidden shadow-sm transition-all duration-300" style={{ borderRadius: '12px' }}>
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none focus-visible:bg-slate-50"
        style={{ padding: '20px' }}
      >
        <div className="flex items-center gap-3">
          <AdminIcon
            name="chevronRight"
            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            strokeWidth={3}
            style={{ width: '18px', height: '18px' }}
          />
          <span className="font-bold text-slate-900 tracking-tight" style={{ fontSize: '18px' }}>{title}</span>
          <span className="flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 font-bold text-slate-600" style={{ height: '24px', minWidth: '24px', padding: '0 8px', fontSize: '13px' }}>
            {count}
          </span>
        </div>
        <div className="flex items-center">
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-full" style={{ fontSize: '13px', padding: '4px 12px' }}>
            {summary}
          </span>
        </div>
      </button>

      {/* Group Content (Permission Rows) */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div style={{ padding: '0 20px 20px 20px' }}>
            <div className="flex flex-col border border-slate-200 overflow-hidden bg-white shadow-sm" style={{ borderRadius: '10px' }}>
              {permissions.map((p, i) => (
                <div
                  key={p.name}
                  className={`items-center bg-white ${i !== permissions.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 90px', height: '56px', padding: '0 16px' }}
                >
                  <div className="flex flex-col justify-center min-w-0 pr-4">
                    <span className="font-bold text-slate-900 leading-none truncate" style={{ fontSize: '15px' }}>{p.name}</span>
                    <span className="font-medium text-slate-500 leading-none truncate" style={{ fontSize: '14px', marginTop: '6px' }}>{p.description}</span>
                  </div>
                  <div className="flex justify-center"><Checkbox checked={p.view} onClick={() => onToggle(i, 'view')} /></div>
                  <div className="flex justify-center"><Checkbox checked={p.create} onClick={() => onToggle(i, 'create')} /></div>
                  <div className="flex justify-center"><Checkbox checked={p.edit} onClick={() => onToggle(i, 'edit')} /></div>
                  <div className="flex justify-center"><Checkbox checked={p.del} onClick={() => onToggle(i, 'del')} /></div>
                </div>
              ))}
              {permissions.length === 0 && (
                <div className="flex items-center justify-center font-medium text-slate-500 bg-slate-50" style={{ height: '56px', fontSize: '14px' }}>
                  No permissions defined for this module.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Checkbox for the Matrix
function Checkbox({ checked, onClick }: { checked: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center border-[2px] transition-all shadow-sm ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white hover:border-slate-400'
        }`} style={{ width: '22px', height: '22px', borderRadius: '6px' }}
    >
      {checked && <AdminIcon name="check" strokeWidth={4} style={{ width: '14px', height: '14px' }} />}
    </button>
  );
}
