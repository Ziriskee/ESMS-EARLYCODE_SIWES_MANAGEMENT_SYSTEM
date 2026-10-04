import { ChevronRight } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusChip } from "../../shared/data/StatusChip";
import type { InstructorReport } from "../types";

export type ReportTab = "review" | "reviewed" | "all";

type ReportsListProps = {
  reports: InstructorReport[];
  counts: { review: number; reviewed: number; all: number };
  tab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
  loading: boolean;
  error: string | null;
  onSelect: (report: InstructorReport) => void;
};

function chipFor(status: InstructorReport["status"]) {
  switch (status) {
    case "APPROVED":
      return { tone: "approved" as const, label: "Approved" };
    case "NEEDS_REVISION":
      return { tone: "action" as const, label: "Needs revision" };
    case "SUBMITTED":
      return { tone: "review" as const, label: "Submitted" };
    case "REVIEWED":
      return { tone: "neutral" as const, label: "Reviewed" };
    default:
      return { tone: "neutral" as const, label: "Draft" };
  }
}

function formatDate(iso: string): string {
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

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function ReportsList({
  reports,
  counts,
  tab,
  onTabChange,
  loading,
  error,
  onSelect,
}: ReportsListProps) {
  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2
            className="text-[18px] sm:text-[20px] font-semibold leading-tight"
            style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
          >
            Reports
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {counts.review} awaiting review · {counts.reviewed} reviewed
          </p>
        </div>
        <div
          className="flex items-center rounded-full p-1 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          {(
            [
              { key: "review", label: `To review (${counts.review})` },
              { key: "reviewed", label: `Reviewed (${counts.reviewed})` },
              { key: "all", label: `All (${counts.all})` },
            ] as { key: ReportTab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className="h-7 px-3 sm:px-4 rounded-full text-[12px] sm:text-[12.5px] font-semibold transition-colors whitespace-nowrap"
              style={{
                backgroundColor:
                  tab === t.key ? "var(--surface)" : "transparent",
                color: tab === t.key ? "var(--text)" : "var(--muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading reports...
        </p>
      )}
      {!loading && error && (
        <EmptyState title="We couldn't load reports." description={error} />
      )}
      {!loading && !error && counts.all === 0 && (
        <EmptyState
          title="No reports yet."
          description="Reports submitted by your interns will appear here."
        />
      )}
      {!loading && !error && counts.all > 0 && reports.length === 0 && (
        <EmptyState
          title={
            tab === "review"
              ? "No reports awaiting review."
              : tab === "reviewed"
                ? "Nothing reviewed yet."
                : "Nothing to show."
          }
          description={
            tab === "review" ? "You're all caught up." : "Try a different tab."
          }
        />
      )}

      {!loading && !error && reports.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr
                  className="text-[10.5px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  <th className="w-[46%] font-semibold py-3 pr-4">Report</th>
                  <th className="w-[18%] font-semibold py-3 px-4 whitespace-nowrap">
                    Submitted
                  </th>
                  <th className="w-[28%] font-semibold py-3 px-4">Status</th>
                  <th className="w-[8%] font-semibold py-3 pl-4" />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const chip = chipFor(r.status);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelect(r)}
                      className="transition-colors hover:bg-[var(--tint)] cursor-pointer"
                      style={{ borderTop: "1px solid var(--line)" }}
                    >
                      <td className="py-5 pr-4">
                        <p
                          className="truncate text-[14px] font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {r.title}
                        </p>
                        <p
                          className="truncate text-[12px] mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {r.intern.name}
                        </p>
                      </td>
                      <td
                        className="py-5 px-4 text-[13px] whitespace-nowrap"
                        style={{ color: "var(--muted)" }}
                        title={formatDate(r.submitted_at)}
                      >
                        {relativeTime(r.submitted_at)}
                      </td>
                      <td className="py-5 px-4">
                        <StatusChip tone={chip.tone} label={chip.label} />
                      </td>
                      <td className="py-5 pl-4 text-right">
                        <ChevronRight
                          size={16}
                          strokeWidth={2}
                          style={{ color: "var(--muted)" }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col">
            {reports.map((r, i) => {
              const chip = chipFor(r.status);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelect(r)}
                  className="w-full text-left py-5 -mx-2 px-2 transition-colors hover:bg-[var(--tint)]"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--line)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[14px] font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {r.title}
                      </p>
                      <p
                        className="truncate text-[12px] mt-0.5"
                        style={{ color: "var(--muted)" }}
                      >
                        {r.intern.name}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 mt-1"
                      style={{ color: "var(--muted)" }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StatusChip tone={chip.tone} label={chip.label} />
                    <span
                      className="text-[12px] whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {relativeTime(r.submitted_at)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
