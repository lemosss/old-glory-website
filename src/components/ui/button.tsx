import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-amber-600 text-stone-950 hover:bg-amber-500",
  secondary: "border border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-stone-950",
  ghost: "text-stone-300 hover:bg-stone-800 hover:text-amber-300",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
