import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-steel-300">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "w-full h-10 px-3 rounded-lg border bg-steel-900 text-steel-100 placeholder:text-steel-500 transition-colors",
          "border-steel-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";
