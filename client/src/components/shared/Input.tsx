import React, { forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  prefix?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, prefix, error, ...props }, ref) => {
    return (
      <div className="w-full relative flex flex-col gap-1.5">
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-4 text-muted-foreground z-10 pointer-events-none">
              {icon}
            </div>
          )}
          
          {prefix && (
            <div className="absolute left-4 font-semibold text-foreground z-10 pointer-events-none select-none">
              {prefix}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              "flex w-full rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-white/40 dark:border-zinc-800",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
              "transition-all duration-200 backdrop-blur-md tap-target",
              icon || prefix ? "pl-11" : "pl-4",
              "pr-4 py-3 text-base shadow-sm",
              error && "border-destructive focus:ring-destructive/50",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-destructive pl-2">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
