import React from 'react';
import { AdminIcon } from '../navigation/AdminIcons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200/80 bg-slate-50/50">
      <div className="flex items-center gap-4">
        <span className="text-[13px] text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-700">{startItem}-{endItem}</span> of <span className="font-semibold text-slate-700">{totalItems}</span>
        </span>
        <div className="h-4 w-px bg-slate-300"></div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-slate-500 font-medium">Rows per page:</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-transparent text-[13px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-[6px] text-slate-500 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <AdminIcon name="chevronDown" className="w-[18px] h-[18px] rotate-90" strokeWidth={2.5} />
        </button>
        
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-medium text-slate-700 bg-white border border-slate-200 shadow-sm rounded-[6px] px-3 py-1">
            {currentPage}
          </span>
          <span className="text-[13px] font-medium text-slate-400 mx-1">/</span>
          <span className="text-[13px] font-medium text-slate-500">
            {totalPages}
          </span>
        </div>

        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-[6px] text-slate-500 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <AdminIcon name="chevronDown" className="w-[18px] h-[18px] -rotate-90" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
