import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "default";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-accent/15 text-accent",
  warning: "bg-warning/15 text-warning",
  error: "bg-destructive/15 text-destructive",
  default: "bg-primary/15 text-primary",
};

interface SurfBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const SurfBadge = ({ children, variant = "default", className }: SurfBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      variantClasses[variant],
      className
    )}
  >
    {children}
  </span>
);

export default SurfBadge;
