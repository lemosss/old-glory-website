import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded border border-amber-900/40 bg-stone-950/55 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-stone-950/45",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  actions,
}: {
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-amber-900/40 bg-stone-950/60 px-4 py-2 backdrop-blur-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-300">
        {title}
      </h2>
      {actions}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
