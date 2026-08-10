import React from 'react';
import { Pagination } from './Pagination';

export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`overflow-x-auto w-full border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
      {children}
    </thead>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={`px-4 py-3 text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-[var(--admin-border)]">
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={`hover:bg-[var(--admin-hover-bg)] transition-colors group ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <td className={`px-4 py-3 text-sm text-[var(--admin-text-main)] ${className}`}>
      {children}
    </td>
  );
}

export function TablePagination({
  currentPage,
  totalPages,
  totalResults
}: {
  currentPage: number,
  totalPages: number,
  totalResults: number
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-b-lg">
      <p className="text-sm text-[var(--admin-text-muted)]">
        Showing <span className="font-semibold text-[var(--admin-text-main)]">1</span> to <span className="font-semibold text-[var(--admin-text-main)]">10</span> of <span className="font-semibold text-[var(--admin-text-main)]">{totalResults}</span> results
      </p>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm border border-[var(--admin-border)] rounded-md hover:bg-[var(--admin-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm border border-[var(--admin-border)] rounded-md hover:bg-[var(--admin-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export type ColumnDef<T> = {
  id?: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (props: { row: T }) => React.ReactNode;
  className?: string;
  cellClassName?: string;
  width?: string;
}

export interface ConfigurableDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  className?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
  };
}

import { useState, useRef, useEffect } from 'react';
import { AdminCard } from '../primitives/AdminCard';

export function ConfigurableDataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  isLoading = false,
  pagination,
  className
}: ConfigurableDataTableProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusedIndex(-1);
  }, [data]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (data.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < data.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && focusedIndex >= 0 && onRowClick) {
      e.preventDefault();
      onRowClick(data[focusedIndex]);
    }
  };
  if (isLoading) {
    return (
      <AdminCard padding="none" className="overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_#E5E7EB]">
              <tr>
                {columns.map((col, i) => (
                  <th key={col.id || (col.accessorKey as string) || i} className={`px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  {columns.map((col, j) => (
                    <td key={j} className={`px-4 py-3.5 align-top ${col.cellClassName || ''}`}>
                      {col.id === 'patient' ? (
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-32"></div>
                          <div className="h-3 bg-slate-100 rounded animate-pulse w-24"></div>
                        </div>
                      ) : (
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    );
  }

  if (data.length === 0) {
    return (
      <AdminCard padding="none" className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No bookings found</h3>
        <p className="text-[14px] text-slate-500 mb-6 text-center max-w-sm">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-[8px] font-medium text-[13px] hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
          Clear Filters
        </button>
      </AdminCard>
    );
  }

  return (
    <AdminCard
      padding="none"
      className={`overflow-hidden flex-1 flex flex-col min-h-0 focus:outline-none focus-within:ring-2 focus-within:ring-slate-200 ${className || ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <div className="overflow-auto custom-scrollbar flex-1 relative">
        <table className="admin-mobile-table w-full text-left border-collapse text-[13px] whitespace-nowrap">
          <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 shadow-[0_1px_0_#E5E7EB]">
            <tr className="h-[48px]">
              {columns.map((col, i) => (
                <th
                  key={col.id || (col.accessorKey as string) || i}
                  className={`px-6 text-[12px] font-semibold text-slate-500 uppercase tracking-[0.08em] align-middle ${i === 0 ? '!pl-4 md:!pl-10' : ''} ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row, index) => {
              const isFocused = focusedIndex === index;
              return (
                <tr
                  key={keyExtractor(row)}
                  className={`h-auto lg:h-[72px] border-b border-slate-100 last:border-0 group transition-colors duration-150 ease-out ${onRowClick ? 'cursor-pointer hover:bg-slate-50 relative z-0' : ''} ${isFocused ? 'bg-slate-50 ring-inset ring-2 ring-slate-200/50' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col, i) => {
                    const cellContent = col.cell
                      ? col.cell({ row })
                      : (col.accessorKey ? String(row[col.accessorKey]) : null);

                    return (
                      <td
                        key={col.id || (col.accessorKey as string) || i}
                        className={`px-6 py-4 align-middle ${i === 0 ? '!pl-4 md:!pl-10' : ''} ${col.cellClassName || ''}`}
                        data-label={typeof col.header === 'string' ? col.header : (col.id || '')}
                      >
                        <div onClick={(e) => {
                          // Prevent row click if clicking an action menu
                          if (col.id?.includes('actions')) {
                            e.stopPropagation();
                          }
                        }}>
                          {cellContent}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && !isLoading && data.length > 0 && (
        <Pagination {...pagination} />
      )}
    </AdminCard>
  );
}
