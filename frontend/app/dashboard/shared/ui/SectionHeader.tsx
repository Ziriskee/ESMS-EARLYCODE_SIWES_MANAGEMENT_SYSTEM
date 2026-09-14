import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type SectionHeaderProps = {
  title: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  right?: ReactNode;
};

export function SectionHeader({ title, action, right }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4">
      <h2
        className="text-[16px] font-semibold leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>

      {right ?? null}

      {action && (
        <>
          {action.to ? (
            <Link
              to={action.to}
              className="text-[13px] font-medium transition-colors whitespace-nowrap"
              style={{ color: "var(--gold)" }}
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="text-[13px] font-medium transition-colors whitespace-nowrap"
              style={{ color: "var(--gold)" }}
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}
