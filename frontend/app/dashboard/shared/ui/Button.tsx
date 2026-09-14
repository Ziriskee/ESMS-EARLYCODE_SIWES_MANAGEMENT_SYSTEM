import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "pill";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  children: ReactNode;
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[14px]",
};

function getVariantStyle(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: "var(--gold)",
        color: "var(--text-on-gold)",
        borderColor: "transparent",
      };
    case "secondary":
      return {
        backgroundColor: "transparent",
        color: "var(--text-primary)",
        borderColor: "var(--border-strong)",
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        color: "var(--gold)",
        borderColor: "transparent",
      };
    case "pill":
      return {
        backgroundColor: "var(--border-strong)",
        color: "var(--text-primary)",
        borderColor: "transparent",
      };
  }
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  children,
  disabled,
  className = "",
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`rounded-full border font-semibold inline-flex items-center justify-center gap-2 transition-colors duration-150 ${sizeStyles[size]} ${className}`}
      style={{
        ...getVariantStyle(variant),
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} strokeWidth={2} className="animate-spin" />
      ) : (
        leadingIcon
      )}
      {children}
    </button>
  );
}
