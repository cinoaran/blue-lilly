import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sleep for given milliseconds. Use on server to simulate/load delays.
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
