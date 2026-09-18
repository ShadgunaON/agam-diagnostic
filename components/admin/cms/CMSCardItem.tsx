'use client';
import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Edit2, RefreshCw } from 'lucide-react';

export interface CMSCardItemProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  index: number;
  total: number;
  onEdit?: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onReplace?: () => void;
  replaceLabel?: string;
  isSlot?: boolean; // for fixed-slot display (packages)
  isEmptySlot?: boolean;
}

export function CMSCardItem({
  title,
  subtitle,
  badge,
  imageUrl,
  icon,
  index,
  total,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onReplace,
  replaceLabel = 'Change',
  isSlot = false,
  isEmptySlot = false,
}: CMSCardItemProps) {
  if (isEmptySlot) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group"
        onClick={onReplace}
      >
        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <span className="text-gray-400 group-hover:text-blue-500 text-xl leading-none">+</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Assign Package</p>
          <p className="text-xs text-gray-400">Click to select a package</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow group">
      {/* Image / Icon */}
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : icon ? (
          <span className="text-gray-500">{icon}</span>
        ) : (
          <span className="text-gray-300 text-lg">◈</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
          {badge && (
            <span className="shrink-0 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded font-medium">{badge}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-25 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-25 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
        )}
        {onReplace && (
          <button
            type="button"
            onClick={onReplace}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            title={replaceLabel}
          >
            <RefreshCw size={14} />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
