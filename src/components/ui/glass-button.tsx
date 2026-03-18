"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 hover:from-violet-700 hover:to-indigo-700 hover:shadow-violet-700/40 hover:-translate-y-0.5",
        secondary:
          "bg-white/10 text-gray-900 border border-white/20 shadow-md hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5",
        outline:
          "border-2 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300",
        ghost:
          "hover:bg-gray-100 text-gray-700",
        destructive:
          "bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-700 hover:shadow-red-700/40",
        link:
          "text-violet-600 underline-offset-4 hover:underline",
        glass:
          "glass-button bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5",
        dark:
          "bg-gray-900 text-white shadow-lg shadow-gray-900/25 hover:bg-gray-800 hover:shadow-gray-800/40 hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  children: React.ReactNode;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
