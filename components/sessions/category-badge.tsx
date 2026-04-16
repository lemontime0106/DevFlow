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
  const badgeColor = isHexColor(color) ? color : null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        !badgeColor &&
          "border-primary/30 bg-primary/15 text-primary",
        className,
      )}
      style={
        badgeColor
          ? {
              color: badgeColor,
              borderColor: `${badgeColor}55`,
              backgroundColor: `${badgeColor}14`,
            }
          : undefined
      }
    >
      {name}
    </span>
  );
}
