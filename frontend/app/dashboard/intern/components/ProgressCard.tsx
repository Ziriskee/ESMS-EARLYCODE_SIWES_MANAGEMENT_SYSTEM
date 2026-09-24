import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Card } from "../../shared/ui/Card";

type ProgressCardProps = {
  percentComplete: number | null;
  weeksCompleted: number | null;
  totalWeeks: number | null;
  startDate: string | null;
  endDate: string | null;
  onViewSchedules: () => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function ProgressCard({
  percentComplete,
  weeksCompleted,
  totalWeeks,
  startDate,
  endDate,
  onViewSchedules,
}: ProgressCardProps) {
  const hasData =
    typeof percentComplete === "number" &&
    typeof weeksCompleted === "number" &&
    typeof totalWeeks === "number";

  const animated = useCountUp(hasData ? percentComplete : 0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!hasData) return;
    const t = setTimeout(() => setBarWidth(percentComplete), 180);
    return () => clearTimeout(t);
  }, [hasData, percentComplete]);

  if (!hasData) {
    return (
      <Card padding="lg">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.24em] mb-3"
          style={{ color: "var(--muted)" }}
        >
          IT Progress
        </p>
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
          Your placement dates haven't been set yet. Contact your admin.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: "var(--muted)" }}
      >
        IT Progress
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
        <span
          className="text-6xl md:text-7xl font-semibold leading-none tracking-tight"
          style={{
            color: "var(--gold-700)",
            fontFamily: "var(--font-display)",
          }}
        >
          {String(animated).padStart(2, "0")}
        </span>
        <span
          className="pb-1 text-2xl md:text-3xl font-semibold leading-none"
          style={{
            color: "var(--gold-700)",
            fontFamily: "var(--font-display)",
          }}
        >
          %
        </span>
        <p className="pb-1.5 text-[14px]" style={{ color: "var(--muted)" }}>
          {weeksCompleted} of {totalWeeks} weeks completed
        </p>
      </div>

      {/* Slider-style bar */}
      <div
        className="relative mt-7 h-2 rounded-full"
        style={{ backgroundColor: "var(--tint2)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-[1100ms] ease-out"
          style={{
            width: `${barWidth}%`,
            background:
              "linear-gradient(90deg, #E9B800 0%, var(--gold-500) 100%)",
          }}
        >
          <span
            className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full"
            style={{
              backgroundColor: "var(--gold-300)",
              boxShadow: "0 0 0 4px rgba(255, 214, 10, 0.25)",
            }}
          />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <p className="text-[14px]">
            <span
              className="mr-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--muted)" }}
            >
              Start
            </span>
            <span className="font-medium" style={{ color: "var(--text)" }}>
              {formatDate(startDate)}
            </span>
          </p>
          <p className="text-[14px]">
            <span
              className="mr-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--muted)" }}
            >
              End
            </span>
            <span className="font-medium" style={{ color: "var(--text)" }}>
              {formatDate(endDate)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onViewSchedules}
          className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14px] font-medium transition-colors"
          style={{
            backgroundColor: "var(--surface2)",
            color: "var(--text)",
            border: "1px solid var(--line)",
          }}
        >
          <CalendarDays size={15} strokeWidth={1.8} />
          View schedules
          <ArrowUpRight
            size={14}
            strokeWidth={2}
            style={{ color: "var(--muted)" }}
          />
        </button>
      </div>
    </Card>
  );
}
