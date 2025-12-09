import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dateString(date: number): string {
  const dateObject = new Date(date);

  return dateObject.toDateString() + " " + dateObject.toLocaleTimeString();
}
