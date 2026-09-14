import type { CSSProperties, ReactNode } from "react";

type CardVariant = "default" | "feature" | "elevated";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
};

const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {
    backgroundColor: "var(--bg-card)",
    borderColor: "var(--border-subtle)",
  },
  feature: {
    backgroundColor: "var(--bg-feature)",
    borderColor: "transparent",
  },
  elevated: {
    backgroundColor: "var(--bg-card-elevated)",
    borderColor: "var(--border-subtle)",
  },
};

const paddingMap = {
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
      className={`rounded-[14px] border ${className}`}
      style={{
        ...variantStyles[variant],
        padding: paddingMap[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
