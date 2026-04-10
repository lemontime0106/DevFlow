import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  color?: string | null;
  name: string;
  className?: string;
}

function isHexColor(value: string | null | undefined) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function CategoryBadge({
  color,
  name,
  className,
}: CategoryBadgeProps) {
  const hasColor = isHexColor(color);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        !hasColor &&
          "border-border/70 bg-muted/30 text-muted-foreground",
        className,
      )}
      style={
        hasColor
          ? {
              color,
              borderColor: `${color}55`,
              backgroundColor: `${color}14`,
            }
          : undefined
      }
    >
      {name}
    </span>
  );
}
