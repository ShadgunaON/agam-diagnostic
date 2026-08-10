import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge tailwind classes safely.
 * Solves specificity issues when overriding default classes via props.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parsePrice = (priceStr?: string | number): number => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};
