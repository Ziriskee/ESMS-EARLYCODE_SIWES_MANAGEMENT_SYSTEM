import { useMemo } from "react";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import type { PendingInternSummary } from "../types";

type CampusFilterValue = "kubwa" | "nyanya" | "all";

type PendingTableProps = {
  pending: PendingInternSummary[];
  loading: boolean;
  error: string | null;
  campusFilter: CampusFilterValue;
  onSelect: (intern: PendingInternSummary) => void;
};

function initials(first: string, last: string): string {
  return (first?.[0] ?? "").toUpperCase() + (last?.[0] ?? "").toUpperCase();
}

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
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

export function PendingTable({
  pending,
  loading,
  error,
  campusFilter,
  onSelect,
}: PendingTableProps) {
  const filtered = useMemo(() => {
    if (campusFilter === "all") return pending;
    return pending.filter((p) => p.preferred_campus === campusFilter);
  }, [pending, campusFilter]);

  const totalCount = pending.length;
  const filteredCount = filtered.length;

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2
            className="text-[18px] sm:text-[20px] font-semibold leading-tight"
            style={{
              color: "var(--text)",
              fontFamily: "var(--font-display)",
            }}
          >
            Pending Interns
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {campusFilter === "all"
              ? `${totalCount} awaiting review`
              : `Showing ${filteredCount} of ${totalCount}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled
            className="h-9 px-3.5 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-2"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--muted)",
              border: "1px solid var(--line)",
              opacity: 0.7,
              cursor: "not-allowed",
            }}
            title="Sorting coming soon"
          >
            <ArrowUpDown size={14} strokeWidth={2} />
            Newest
          </button>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading pending interns...
        </p>
      )}

      {!loading && error && (
        <EmptyState
          title="We couldn't load the pending list."
          description={error}
        />
      )}

      {!loading && !error && totalCount === 0 && (
        <EmptyState
          title="No pending interns."
          description="New registrations will appear here."
        />
      )}

      {!loading && !error && totalCount > 0 && filteredCount === 0 && (
        <EmptyState
          title={`No pending interns for ${
            campusFilter === "kubwa" ? "Kubwa" : "Nyanya"
          }.`}
        />
      )}

      {!loading && !error && filteredCount > 0 && (
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr
                className="text-[10.5px] uppercase tracking-[0.14em]"
                style={{ color: "var(--muted)" }}
              >
                <th className="font-semibold py-3 pl-4 sm:pl-0 pr-4">Name</th>
                <th className="font-semibold py-3 px-4 whitespace-nowrap">
                  Phone
                </th>
                <th className="font-semibold py-3 px-4">Email</th>
                <th className="font-semibold py-3 px-4 whitespace-nowrap">
                  Campus
                </th>
                <th className="font-semibold py-3 px-4 whitespace-nowrap">
                  Submitted
                </th>
                <th className="font-semibold py-3 pl-4 pr-4 sm:pr-0 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((intern) => {
                const initialsText = initials(
                  intern.user.first_name,
                  intern.user.last_name,
                );
                return (
                  <tr
                    key={intern.id}
                    className="transition-colors hover:bg-[var(--tint)] cursor-pointer"
                    style={{ borderTop: "1px solid var(--line)" }}
                    onClick={() => onSelect(intern)}
                  >
                    <td className="py-4 pl-4 sm:pl-0 pr-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="h-9 w-9 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
                          style={{
                            backgroundColor: "var(--gold-500)",
                            color: "var(--coal)",
                          }}
                        >
                          {initialsText || "?"}
                        </span>
                        <p
                          className="text-[14px] font-semibold leading-snug truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {intern.user.first_name} {intern.user.last_name}
                        </p>
                      </div>
                    </td>

                    <td
                      className="py-4 px-4 text-[13px] whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {intern.user.phone || "—"}
                    </td>

                    <td
                      className="py-4 px-4 text-[13px] truncate max-w-[220px]"
                      style={{ color: "var(--muted)" }}
                    >
                      {intern.user.email}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full whitespace-nowrap"
                        style={{
                          backgroundColor: "var(--tint)",
                          color: "var(--muted)",
                        }}
                      >
                        {formatCampus(intern.preferred_campus)}
                      </span>
                    </td>

                    <td
                      className="py-4 px-4 text-[13px] whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      <span title={formatDate(intern.created_at)}>
                        {relativeTime(intern.created_at)}
                      </span>
                    </td>

                    <td className="py-4 pl-4 pr-4 sm:pr-0 text-right">
                      <span
                        className="inline-flex items-center gap-1 text-[12.5px] font-semibold whitespace-nowrap"
                        style={{ color: "var(--gold-800)" }}
                      >
                        Review
                        <ChevronRight size={14} strokeWidth={2} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
