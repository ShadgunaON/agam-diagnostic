'use client';

import React from 'react';
import { AdminIcon } from '../navigation/AdminIcons';
import { AdminButton } from '../primitives/AdminButton';
import { AdminInput } from '../primitives/AdminInput';

interface BookingsFilterBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function BookingsFilterBar({ activeTab, onTabChange, searchQuery, onSearchChange }: BookingsFilterBarProps) {
  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'pending', label: 'Action Needed' },
    { id: 'home', label: 'Home Collections' },
    { id: 'today', label: "Today's Pipeline" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 text-[13px] font-medium transition-colors relative ${activeTab === tab.id
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 w-full max-w-2xl">
          {/* Search */}
          <div className="w-64 shrink-0 group">
            <AdminInput
              type="text"
              placeholder="Search by ID, name, phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              icon={<AdminIcon name="search" className="w-[16px] h-[16px]" strokeWidth={2} />}
            />
          </div>

          {/* Custom Status Dropdown Mock */}
          <AdminButton variant="secondary" size="sm" className="gap-2">
            <span>All Statuses</span>
            <AdminIcon name="chevronDown" className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
          </AdminButton>

          {/* Custom Date Dropdown Mock */}
          <AdminButton variant="secondary" size="sm" className="gap-2">
            <AdminIcon name="calendar" className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
            <span>Today</span>
            <AdminIcon name="chevronDown" className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
          </AdminButton>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AdminButton variant="secondary" size="sm" className="gap-2">
            <AdminIcon name="filter" className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
            Filters
          </AdminButton>
          <AdminButton variant="secondary" size="sm" className="gap-2">
            <AdminIcon name="download" className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
            Export
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
