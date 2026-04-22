import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUnixDate(unixSeconds: number | bigint, locale = "pt-BR") {
  const secs = typeof unixSeconds === "bigint" ? Number(unixSeconds) : unixSeconds;
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(value: number | bigint, locale = "pt-BR") {
  return new Intl.NumberFormat(locale).format(value);
}
