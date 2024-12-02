import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const on = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
