import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class Tailwind CSS secara aman.
 * Menghindari konflik class (misal: "px-2 px-4" → "px-4").
 *
 * Contoh penggunaan:
 *   cn("px-2 py-1", isActive && "bg-primary text-white", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
