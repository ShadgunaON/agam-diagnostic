import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends InputProps {
  wrapperClassName?: string;
}

/**
 * Reusable SearchInput primitive.
 * Specialized input with search icon semantics.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', wrapperClassName = '', ...props }, ref) => {
    return (
      <div className={`relative flex items-center w-full ${wrapperClassName}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          type="search"
          className={`pl-9 ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
