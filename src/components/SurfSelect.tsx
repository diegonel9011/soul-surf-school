import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React from "react";

interface SurfSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SurfSelect = React.forwardRef<HTMLSelectElement, SurfSelectProps>(
  ({ className, icon, options, placeholder, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {icon}
        </span>
      )}
      <select
        ref={ref}
        className={cn(
          "h-12 w-full appearance-none rounded-full border border-border bg-card px-5 pr-10 text-sm text-card-foreground transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          icon && "pl-11",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
    </div>
  )
);

SurfSelect.displayName = "SurfSelect";
export default SurfSelect;
