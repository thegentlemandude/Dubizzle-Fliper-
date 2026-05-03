import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fallback for AI Studio preview storage global
export const storage = {
  get: async (key: string) => {
    try {
      if (typeof window !== "undefined" && (window as any).storage) {
        return await (window as any).storage.get(key);
      }
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    } catch {
      return null;
    }
  },
  set: async (key: string, value: string) => {
    try {
      if (typeof window !== "undefined" && (window as any).storage) {
        await (window as any).storage.set(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {}
  },
  delete: async (key: string) => {
    try {
      if (typeof window !== "undefined" && (window as any).storage) {
        await (window as any).storage.delete(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch {}
  }
}
