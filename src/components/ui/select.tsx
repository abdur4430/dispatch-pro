"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, label, error, children, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-steel-300">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "w-full h-10 px-3 rounded-lg border bg-steel-900 text-steel-100 transition-colors cursor-pointer",
          "border-steel-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
          error && "border-red-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});
Select.displayName = "Select";
