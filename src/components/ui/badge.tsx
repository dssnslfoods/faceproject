import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outline" | "cyan" | "purple" | "amber" | "rose" | "emerald";
}) {
  const variants = {
    default: "bg-slate-800 text-slate-200 border-slate-700",
    outline: "bg-transparent border-slate-600 text-slate-300",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
    purple: "bg-purple-500/15 text-purple-300 border-purple-400/40",
    amber: "bg-amber-500/15 text-amber-300 border-amber-400/40",
    rose: "bg-rose-500/15 text-rose-300 border-rose-400/40",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
