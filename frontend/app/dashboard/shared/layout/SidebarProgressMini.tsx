import { Link } from "react-router-dom";

type SidebarProgressMiniProps = {
  percentComplete: number;
  weeksCompleted: number;
  totalWeeks: number;
  /** Where clicking the card navigates. Defaults to nothing if omitted. */
  href?: string;
};

export function SidebarProgressMini({
  percentComplete,
  weeksCompleted,
  totalWeeks,
  href,
}: SidebarProgressMiniProps) {
  const clamped = Math.min(Math.max(percentComplete, 0), 100);

  const content = (
    <>
      <p
        className="text-[9px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "var(--muted)" }}
      >
        IT Progress
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span
          className="text-[22px] font-semibold leading-none"
          style={{
            color: "var(--gold-700)",
            fontFamily: "var(--font-display)",
          }}
        >
          {percentComplete}
        </span>
        <span
          className="text-[12px] font-semibold leading-none"
          style={{
            color: "var(--gold-700)",
            fontFamily: "var(--font-display)",
          }}
        >
          %
        </span>
      </div>

      <div
        className="relative mt-3 h-1 rounded-full"
        style={{ backgroundColor: "var(--tint2)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${clamped}%`,
            background:
              "linear-gradient(90deg, #E9B800 0%, var(--gold-500) 100%)",
          }}
        />
      </div>

      <p className="mt-2 text-[10px]" style={{ color: "var(--muted)" }}>
        {weeksCompleted} of {totalWeeks} weeks
      </p>
    </>
  );

  const baseClass = "block mx-3 mb-3 rounded-2xl border p-3 transition-colors";

  if (href) {
    return (
      <Link
        to={href}
        className={`${baseClass} hover:bg-[var(--tint)]`}
        style={{
          borderColor: "var(--line)",
          backgroundColor: "var(--surface)",
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={baseClass}
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--surface)",
      }}
    >
      {content}
    </div>
  );
}
