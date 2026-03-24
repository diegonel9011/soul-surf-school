import { cn } from "@/lib/utils";
import React from "react";

interface SurfInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

const SurfInput = React.forwardRef<HTMLInputElement, SurfInputProps>(
  ({ className, icon, error, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-full border bg-card px-5 text-sm text-card-foreground placeholder:text-muted-foreground transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          icon && "pl-11",
          error
            ? "border-destructive focus:ring-destructive"
            : "border-border",
          className
        )}
        {...props}
      />
    </div>
  )
);

SurfInput.displayName = "SurfInput";
export default SurfInput;
