import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeMarginRate(input: number): number {
  if (isNaN(input) || input === null) return 0.5;
  if (input > 1) return input / 100;
  if (input < 0) return 0;
  return input;
}
