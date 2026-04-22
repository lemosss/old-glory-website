import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600",
        className,
      )}
      {...props}
    />
  );
}
