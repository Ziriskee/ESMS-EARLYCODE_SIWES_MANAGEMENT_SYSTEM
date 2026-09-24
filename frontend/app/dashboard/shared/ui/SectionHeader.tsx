import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  right?: ReactNode;
};

export function SectionHeader({
  title,
  subtitle,
  action,
  right,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2
          className="text-[20px] font-semibold leading-tight tracking-tight"
          style={{
            color: "var(--text)",
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {right ?? null}

      {action && (
        <>
          {action.to ? (
            <Link
              to={action.to}
              className="inline-flex items-center gap-1 text-[12px] font-semibold transition-all hover:gap-2 whitespace-nowrap"
              style={{ color: "var(--gold-800)" }}
            >
              {action.label}
              <ArrowUpRight size={14} strokeWidth={2} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center gap-1 text-[12px] font-semibold transition-all hover:gap-2 whitespace-nowrap"
              style={{ color: "var(--gold-800)" }}
            >
              {action.label}
              <ArrowUpRight size={14} strokeWidth={2} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
