import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
  children: ReactNode;
  size?: number;
};

export function IconButton({
  children,
  size = 40,
  className = "",
  style,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-full border flex items-center justify-center transition-colors duration-150 shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: "var(--line)",
        backgroundColor: "var(--surface)",
        color: "var(--muted)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
