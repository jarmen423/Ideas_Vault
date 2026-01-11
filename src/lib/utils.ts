import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes and handles conflicts lazily.
 * 
 * This is a standard utility in modern Tailwind/Next.js projects to allow
 * conditional class merging without duplication or conflicts.
 * 
 * @param inputs - List of class values to be merged
 * @returns A single string of merged Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
