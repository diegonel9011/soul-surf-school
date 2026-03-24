import { cn } from "@/lib/utils";

interface SurfCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const SurfCard = ({ children, className, ...props }: SurfCardProps) => (
  <div
    className={cn(
      "rounded-3xl bg-card text-card-foreground p-6 md:p-8 shadow-xl shadow-black/8 border border-border/50",
      "transition-all duration-500 ease-out",
      "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1",
      "group/card relative overflow-hidden",
      className
    )}
    {...props}
  >
    {/* Shimmer wave that slides on hover */}
    <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none" />
    <div className="relative z-[1]">{children}</div>
  </div>
);

export default SurfCard;
