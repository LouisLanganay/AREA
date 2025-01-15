import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function that combines Tailwind CSS classes while handling conflicts
 * @param inputs - Array of class values to be combined
 * @returns A merged string of CSS classes with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
