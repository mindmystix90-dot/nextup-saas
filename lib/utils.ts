import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function membershipLabel(m: string): string {
  return m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Starter';
}

export function homeFor(role?: string): string {
  return role === 'admin' ? '/admin' : role ? '/dashboard' : '/';
}
