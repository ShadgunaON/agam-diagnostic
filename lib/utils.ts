import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge tailwind classes safely.
 * Solves specificity issues when overriding default classes via props.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
