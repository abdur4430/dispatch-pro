"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      default: "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-900/30",
      outline: "border border-steel-700 hover:border-brand-500 text-steel-200 hover:text-white hover:bg-steel-800",
      ghost: "hover:bg-steel-800 text-steel-300 hover:text-white",
      destructive: "bg-red-600 hover:bg-red-700 text-white",
      secondary: "bg-steel-800 hover:bg-steel-700 text-steel-100 border border-steel-700",
    };
    const sizes = {
      sm: "h-8 px-3 text-sm gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
      icon: "h-10 w-10",
    };
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
