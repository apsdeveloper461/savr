import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (value: number, locale = "en-US", currency = "USD") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number, locale = "en-US") => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value);
};
