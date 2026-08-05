import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
}

/**
 * Reusable Chip primitive.
 * Similar to a Badge but typically interactive, e.g., filter tokens that can be removed.
 */
export function Chip({ className = '', children, onRemove, ...props }: ChipProps) {
  return (
    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${className}`} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Remove"
        >
          &times;
        </button>
      )}
    </div>
  );
}
