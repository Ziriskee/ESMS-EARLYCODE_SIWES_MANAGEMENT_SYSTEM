import type { CSSProperties, ReactNode } from "react";

type CardVariant = "default" | "feature" | "elevated";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  style?: CSSProperties;
};

const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--line)",
  },
  feature: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--line)",
  },
  elevated: {
    backgroundColor: "var(--surface2)",
    borderColor: "var(--line)",
  },
};

const paddingMap: Record<CardPadding, number> = {
  none: 0,
  sm: 16,
  md: 20,
  lg: 24,
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  style,
}: CardProps) {
  return (
    <div
      className={`border ${className}`}
      style={{
        borderRadius: "var(--radius-card)",
        ...variantStyles[variant],
        padding: paddingMap[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
