import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";

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

  if (!hasData) {
    return (
      <Card variant="elevated" padding="lg">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          IT Progress
        </p>
        <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
          Your placement dates haven't been set yet. Contact your admin.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3"
        style={{ color: "var(--text-tertiary)" }}
      >
        IT Progress
      </p>

      <div className="flex items-baseline gap-3 mb-5">
        <span
          className="text-[40px] font-bold leading-none"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {percentComplete}%
        </span>
        <span
          className="text-[14px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {weeksCompleted} of {totalWeeks} weeks
        </span>
      </div>

      <div
        className="w-full h-[6px] rounded-full overflow-hidden mb-5"
        style={{ backgroundColor: "var(--bg-card-elevated)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.min(Math.max(percentComplete, 0), 100)}%`,
            backgroundColor: "var(--gold)",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Start
            </span>
            <span
              className="text-[13px]"
              style={{ color: "var(--text-primary)" }}
            >
              {formatDate(startDate)}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              End
            </span>
            <span
              className="text-[13px]"
              style={{ color: "var(--text-primary)" }}
            >
              {formatDate(endDate)}
            </span>
          </div>
        </div>

        <Button variant="pill" size="md" onClick={onViewSchedules}>
          View schedules
        </Button>
      </div>
    </Card>
  );
}
