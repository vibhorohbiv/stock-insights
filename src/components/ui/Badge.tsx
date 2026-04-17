import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "profit" | "loss" | "warning" | "info" | "neutral";
  className?: string;
}

const variants = {
  default: "bg-primary/15 text-primary",
  profit: "bg-emerald-500/15 text-emerald-400",
  loss: "bg-red-500/15 text-red-400",
  warning: "bg-amber-500/15 text-amber-400",
  info: "bg-blue-500/15 text-blue-400",
  neutral: "bg-secondary text-muted-foreground",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
