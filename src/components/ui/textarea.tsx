import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-steel-300">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3 py-2 rounded-lg border bg-steel-900 text-steel-100 placeholder:text-steel-500 transition-colors resize-none",
          "border-steel-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
          error && "border-red-500",
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";
