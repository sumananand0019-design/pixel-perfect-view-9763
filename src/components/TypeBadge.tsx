import { cn } from "@/lib/utils";

export function TypeBadge({
  type,
  className,
  size = "md",
}: {
  type: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold uppercase tracking-widest text-type-foreground shadow-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className,
      )}
      style={{ backgroundColor: `var(--type-${type})` }}
    >
      {type}
    </span>
  );
}
