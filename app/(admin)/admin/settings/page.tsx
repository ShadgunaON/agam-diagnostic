'use client';

import React, { useState } from 'react';
import { AdminIcon, AdminIconName } from '@/components/admin/navigation/AdminIcons';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

/* ── Custom Toggle Switch ───────────────────────────────────── */
function SettingsToggle({
  checked,
  onChange,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [internalChecked, setInternalChecked] = useState(checked || false);

  const toggle = () => {
    const newVal = !internalChecked;
    setInternalChecked(newVal);
    onChange?.(newVal);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={internalChecked}
      onClick={toggle}
      className={`relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-180 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${internalChecked ? 'bg-slate-900' : 'bg-slate-200'
        }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-sm ring-0 transition duration-180 ease-in-out ${internalChecked ? 'translate-x-[20px]' : 'translate-x-0'
          }`}
      />
    </button>
  );
}

/* ── Reusable Settings Card ────────────────────────────────── */
function SettingsCard({
  title,
  description,
  children,
  danger,
  onSave,
  onCancel,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave?.();
    }, 600);
  };

  return (
    <div
      style={{ padding: '40px' }}
      className={`flex flex-col flex-1 bg-white rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 ${danger
          ? 'border border-red-200 bg-red-50/10'
          : 'border border-[#CBD5E1] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.03)]'
        }`}
    >
      {/* Card Header */}
      <div className="mb-[24px]">
        <div className={`text-[22px] font-bold tracking-tight ${danger ? 'text-red-600' : 'text-slate-900'}`}>
          {title}
        </div>
        {description && (
          <p className={`text-[15px] mt-1 ${danger ? 'text-red-500/80' : 'text-slate-500'}`}>
            {description}
          </p>
        )}
      </div>

      <div className="h-[1px] w-full bg-slate-200 mb-[32px]" />

      {/* Card Body */}
      <div className="flex flex-col gap-10 flex-1">
        {children}
      </div>

      {/* Action Footer */}
      {!danger && (
        <>
          <div className="h-[1px] w-full bg-slate-200 mt-[32px] mb-[24px]" />
          <div className="flex items-center justify-end gap-[16px]">
            <button
              onClick={onCancel}
              className="h-[52px] px-[24px] rounded-[8px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-[16px] transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-[52px] px-[24px] rounded-[8px] bg-slate-900 hover:bg-slate-800 text-white font-medium text-[16px] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-[8px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              {isSaving ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Reusable Section Row (Stacked Form Layout) ────────────── */
function SettingsRow({
  label,
  description,
  children,
  controlRight,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
  controlRight?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-[640px]">
          <label className="text-lg font-semibold text-slate-900 block">
            {label}
          </label>
          {description && (
            <p className="text-[15px] text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {controlRight && (
          <div className="shrink-0 pt-[2px]">
            {controlRight}
          </div>
        )}
      </div>
      {children && (
        <div className="w-full max-w-[640px]">
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [activeNav, setActiveNav] = useState('Clinic Profile');

  const navGroups = [
    {
      title: 'GENERAL',
      items: [
        { name: 'Clinic Profile', icon: 'settings' as AdminIconName, description: 'Basic organizational details' },
        { name: 'Branding', icon: 'layoutDashboard' as AdminIconName, description: 'Logos, colors & assets' },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { name: 'Notifications', icon: 'bell' as AdminIconName, description: 'Internal team alerts' },
        { name: 'SMS', icon: 'messageSquare' as AdminIconName, description: 'Patient text messaging' },
        { name: 'Email', icon: 'fileText' as AdminIconName, description: 'Invoice & report templates' },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        { name: 'Billing', icon: 'creditCard' as AdminIconName, description: 'Subscription & invoices' },
        { name: 'Payments', icon: 'activity' as AdminIconName, description: 'Gateways & processing' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Tests & Packages', icon: 'flask' as AdminIconName, description: 'Lab catalog pricing' },
        { name: 'Inventory', icon: 'box' as AdminIconName, description: 'Reagents & supplies' },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Main Content Constraint */}
        <div className="max-w-[1440px] mx-auto w-full px-[40px] pt-[40px] pb-[80px] flex flex-col min-h-full">

          {/* Layout Structure: Nav + Content */}
          <div className="flex items-stretch gap-[32px] flex-1">

            {/* Sidebar Navigation */}
            <nav className="w-[320px] shrink-0 bg-white border border-[#E2E8F0] rounded-[12px] p-[20px] flex flex-col gap-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              {navGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-[12px]">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500 px-[16px]">
                    {group.title}
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    {group.items.map((item) => {
                      const isActive = activeNav === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => setActiveNav(item.name)}
                          className={`flex items-center gap-[14px] h-[68px] px-[16px] rounded-[10px] transition-all duration-200 text-left relative overflow-hidden group ${isActive
                              ? 'bg-blue-50/50'
                              : 'hover:bg-slate-50 bg-transparent'
                            }`}
                        >
                          {/* Active Left Indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-600 rounded-r-full" />
                          )}

                          {/* Icon Container */}
                          <div className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-500 group-hover:bg-white group-hover:shadow-sm'
                            }`}>
                            <AdminIcon name={item.icon} className="w-[20px] h-[20px]" />
                          </div>

                          {/* Text Container */}
                          <div className="flex flex-col justify-center">
                            <span className={`text-[16px] ${isActive ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {item.name}
                            </span>
                            <span className="text-[13px] text-slate-500 font-normal">
                              {item.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col gap-[24px] min-w-0 pb-[80px] max-w-[840px]">

              {/* === CLINIC PROFILE === */}
              {activeNav === 'Clinic Profile' && (
                <>
                  <SettingsCard
                    title="Clinic Profile"
                  >
                    <SettingsRow
                      label="Diagnostic Center Overview"
                    >
                      <AdminCard padding="none" className="bg-slate-50 border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white transition-all">
                        <textarea
                          style={{ padding: '24px' }}
                          className="w-full min-h-[140px] bg-transparent text-base text-slate-900 resize-none focus-visible:outline-none"
                          defaultValue="Agam Diagnostics is a state-of-the-art pathology and imaging center fully accredited by NABL. We specialize in advanced hematology, molecular diagnostics, and comprehensive preventative health checkups."
                          placeholder="Describe your clinic's accreditations and specialties..."
                        />
                      </AdminCard>
                    </SettingsRow>

                    <SettingsRow
                      label="Chief Pathologist Details"
                    >
                      <AdminCard padding="none" className="bg-slate-50 border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white transition-all">
                        <textarea
                          style={{ padding: '24px' }}
                          className="w-full min-h-[88px] bg-transparent text-base text-slate-900 resize-none focus-visible:outline-none"
                          defaultValue="Dr. S. Ramakrishnan, MD (Pathology)&#10;Reg No: 45892 (Tamil Nadu Medical Council)"
                          placeholder="Pathologist Name & Registration Number"
                        />
                      </AdminCard>
                    </SettingsRow>

                    <SettingsRow
                      label="Emergency Contact"
                    >
                      <input
                        type="tel"
                        className="w-full h-[52px] px-[16px] rounded-[8px] bg-slate-50 border border-slate-300 text-[16px] text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all shadow-sm"
                        defaultValue="+91 98765 43210 (24x7 Critical Line)"
                        placeholder="Critical values contact number"
                      />
                    </SettingsRow>
                  </SettingsCard>
                </>
              )}





              {/* === NOTIFICATIONS === */}
              {activeNav === 'Notifications' && (
                <SettingsCard
                  title="Notification Preferences"
                  description="Choose how and when your team receives alerts and summaries."
                >
                  <SettingsRow
                    label="Email Notifications"
                    description="Receive order confirmations and report alerts via email."
                    controlRight={<SettingsToggle checked={true} />}
                  />
                  <SettingsRow
                    label="SMS Alerts"
                    description="Get critical alerts via SMS to your registered phone number."
                    controlRight={<SettingsToggle checked={false} />}
                  />
                  <SettingsRow
                    label="In-App Notifications"
                    description="Show notification badges inside the admin dashboard."
                    controlRight={<SettingsToggle checked={true} />}
                  />
                  <SettingsRow
                    label="Weekly Digest"
                    description="Receive a weekly summary of activity, analytics, and revenue."
                    controlRight={<SettingsToggle checked={false} />}
                  />
                </SettingsCard>
              )}



              {/* Placeholder for unimplemented tabs */}
              {['Branding', 'SMS', 'Email', 'Billing', 'Payments', 'Tests & Packages', 'Inventory'].includes(activeNav) && (
                <SettingsCard
                  title={activeNav}
                  description={`Settings for ${activeNav.toLowerCase()} are currently being migrated to the new interface.`}
                >
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-[8px] bg-slate-50">
                    <p className="text-[15px] text-slate-500 font-medium">Coming Soon</p>
                  </div>
                </SettingsCard>
              )}

            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
