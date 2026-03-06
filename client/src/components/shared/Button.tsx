import React, { forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, leftIcon, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
      outline: "border-2 border-primary/20 text-primary hover:bg-primary/5 active:scale-[0.98]",
      ghost: "text-foreground hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]",
      glass: "glass text-foreground hover:bg-white/70 dark:hover:bg-black/50 active:scale-[0.98]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 tap-target px-6 py-3 rounded-2xl",
          "font-semibold text-base font-display transition-all duration-200",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
