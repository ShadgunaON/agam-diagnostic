import React from 'react';
import { SearchInput, Button } from '@/components/ui';

export interface SearchFormProps {
  placeholder?: string;
  className?: string;
}

/**
 * Reusable Search Form structure.
 */
export function SearchForm({ placeholder = 'Search tests, packages...', className = '' }: SearchFormProps) {
  return (
    <form className={`flex w-full max-w-sm items-center space-x-2 ${className}`}>
      <SearchInput name="q" placeholder={placeholder} className="flex-1" />
      <Button type="submit" variant="primary">Search</Button>
    </form>
  );
}
