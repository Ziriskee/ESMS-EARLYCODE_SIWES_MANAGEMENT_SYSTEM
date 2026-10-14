import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusChip } from "../../shared/data/StatusChip";
import { ActionMenu, type ActionMenuItem } from "../../shared/ui/ActionMenu";
import type { AllInternSummary } from "../types";

export type AllInternFilter = "all" | "pending" | "active" | "completed";

type AllInternsTableProps = {
  interns: AllInternSummary[];
  loading: boolean;
  error: string | null;
  filter: AllInternFilter;
  onFilterChange: (filter: AllInternFilter) => void;
  showCampus: boolean;
  count: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick: (intern: AllInternSummary) => void;
  onOpenDocuments: (intern: AllInternSummary) => void;
  onAssignInstructor: (intern: AllInternSummary) => void;
  onConfigure: (intern: AllInternSummary) => void;
  onDeactivate: (intern: AllInternSummary) => void;
};

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
}

function formatRange(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "—";
    }
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return start ? `From ${fmt(start)}` : `Until ${fmt(end!)}`;
}

function statusChip(status: AllInternSummary["status"]) {
  switch (status) {
    case "ACTIVE":
      return { tone: "approved" as const, label: "Active" };
    case "COMPLETED":
      return { tone: "neutral" as const, label: "Completed" };
    case "PENDING":
    default:
      return { tone: "review" as const, label: "Pending" };
  }
}

export function AllInternsTable({
  interns,
  loading,
  error,
  filter,
  onFilterChange,
  showCampus,
  count,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  onOpenDocuments,
  onAssignInstructor,
  onConfigure,
  onDeactivate,
}: AllInternsTableProps) {
  const buildItems = (intern: AllInternSummary): ActionMenuItem[] => [
    { label: "View", onClick: () => onRowClick(intern) },
        { label: "Documents", onClick: () => onOpenDocuments(intern) },
    {
      label: "Assign Instructor",
      onClick: () => onAssignInstructor(intern),
      disabled: intern.status === "COMPLETED",
    },
    ...(intern.status === "ACTIVE"
      ? [{ label: "Configure", onClick: () => onConfigure(intern) }]
      : []),
    {
      label: "Deactivate",
      onClick: () => onDeactivate(intern),
      danger: true,
      disabled: intern.status === "COMPLETED",
    },
  ];

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5 ">
        <div className="min-w-0">
          <h2
            className="text-[18px] sm:text-[20px] font-semibold leading-tight"
            style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
          >
            All Interns
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {count} intern{count === 1 ? "" : "s"}
            {filter !== "all" ? ` · ${filter}` : ""}
          </p>
        </div>

        <div
          className="flex items-center rounded-full p-1 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          {(["active", "pending", "completed", "all"] as AllInternFilter[]).map(
            (f) => (
              <FilterTab
                key={f}
                label={
                  f === "active"
                    ? "Active"
                    : f === "pending"
                      ? "Pending"
                      : f === "completed"
                        ? "Completed"
                        : "All"
                }
                active={filter === f}
                onClick={() => onFilterChange(f)}
              />
            ),
          )}
        </div>
      </div>

      {/* Body */}
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading interns...
        </p>
      )}
      {!loading && error && (
        <EmptyState title="We couldn't load interns." description={error} />
      )}
      {!loading && !error && count === 0 && (
        <EmptyState
          title={
            filter === "pending"
              ? "No pending interns."
              : filter === "active"
                ? "No active interns."
                : filter === "completed"
                  ? "No completed interns."
                  : "No interns yet."
          }
          description={
            filter === "all"
              ? "New registrations will appear here."
              : "Try a different tab."
          }
        />
      )}

      {!loading && !error && interns.length > 0 && (
        <>
          {/* Desktop / laptop table — fixed layout, never overflows */}
          <div className="hidden md:block">
            <table className="w-full table-fixed text-left ">
              <thead>
                <tr
                  className="text-[10.5px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  <th className="w-[19%] font-semibold py-3 pr-4">Name</th>
                  <th className="w-[21%] font-semibold py-3 px-4">Email</th>
                  {showCampus && (
                    <th className="w-[9%] font-semibold py-3 px-4">Campus</th>
                  )}
                  <th className="w-[12%] font-semibold py-3 px-4">Status</th>
                  <th className="w-[15%] font-semibold py-3 px-4">
                    Instructor
                  </th>
                  <th className="w-[16%] font-semibold py-3 px-4 hidden lg:table-cell">
                    Dates
                  </th>
                  <th className="w-[8%] font-semibold py-3 pl-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern) => {
                  const chip = statusChip(intern.status);
                  return (
                    <tr
                      key={intern.id}
                      className="transition-colors hover:bg-[var(--tint)]"
                      style={{ borderTop: "1px solid var(--line)" }}
                    >
                      <td className="py-5 pr-4">
                        <p
                          className="truncate text-[14px] font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {intern.user.first_name} {intern.user.last_name}
                        </p>
                      </td>
                      <td className="py-5 px-4">
                        <p
                          className="truncate text-[13px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {intern.user.email}
                        </p>
                      </td>
                      {showCampus && (
                        <td className="py-5 px-4">
                          <span
                            className="inline-block max-w-full truncate text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                            style={{
                              backgroundColor: "var(--tint)",
                              color: "var(--muted)",
                            }}
                          >
                            {formatCampus(intern.preferred_campus)}
                          </span>
                        </td>
                      )}
                      <td className="py-5 px-4">
                        <StatusChip tone={chip.tone} label={chip.label} />
                      </td>
                      <td className="py-5 px-4">
                        {intern.assigned_instructor ? (
                          <p
                            className="truncate text-[13px]"
                            style={{ color: "var(--muted)" }}
                          >
                            {intern.assigned_instructor.name}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssignInstructor(intern)}
                            className="inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-semibold truncate"
                            style={{
                              backgroundColor: "var(--status-review-bg)",
                              color: "var(--status-review-text)",
                            }}
                          >
                            Needs instructor
                          </button>
                        )}
                      </td>
                      <td className="py-5 px-4 hidden lg:table-cell">
                        <p
                          className="truncate text-[13px] tabular-nums"
                          style={{ color: "var(--muted)" }}
                        >
                          {formatRange(
                            intern.school_start_date,
                            intern.school_end_date,
                          )}
                        </p>
                      </td>
                      <td className="py-5 pl-4 text-right">
                        <ActionMenu items={buildItems(intern)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / small tablet cards */}
          <div className="md:hidden flex flex-col overflow-x-hidden">
            {interns.map((intern, i) => {
              const chip = statusChip(intern.status);
              return (
                <div
                  key={intern.id}
                  className="w-full py-5 -mx-2 px-2"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--line)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[14px] font-semibold leading-snug truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {intern.user.first_name} {intern.user.last_name}
                      </p>
                      <p
                        className="text-[12px] mt-0.5 truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {intern.user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusChip tone={chip.tone} label={chip.label} />
                      <ActionMenu items={buildItems(intern)} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    {intern.assigned_instructor ? (
                      <span
                        className="text-[12px] truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {intern.assigned_instructor.name}
                        {showCampus &&
                          ` · ${formatCampus(intern.preferred_campus)}`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAssignInstructor(intern)}
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          backgroundColor: "var(--status-review-bg)",
                          color: "var(--status-review-text)",
                        }}
                      >
                        Needs instructor
                      </button>
                    )}
                    <span
                      className="text-[12px] tabular-nums whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {formatRange(
                        intern.school_start_date,
                        intern.school_end_date,
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between pt-4 mt-2 border-t"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className="h-8 w-8 rounded-full grid place-items-center"
                  style={{
                    backgroundColor: "var(--surface2)",
                    border: "1px solid var(--line)",
                    color: page <= 1 ? "var(--muted)" : "var(--text)",
                    opacity: page <= 1 ? 0.5 : 1,
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                  }}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="h-8 w-8 rounded-full grid place-items-center"
                  style={{
                    backgroundColor: "var(--surface2)",
                    border: "1px solid var(--line)",
                    color: page >= totalPages ? "var(--muted)" : "var(--text)",
                    opacity: page >= totalPages ? 0.5 : 1,
                    cursor: page >= totalPages ? "not-allowed" : "pointer",
                  }}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 px-3 sm:px-4 rounded-full text-[12px] sm:text-[12.5px] font-semibold transition-colors whitespace-nowrap"
      style={{
        backgroundColor: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text)" : "var(--muted)",
      }}
    >
      {label}
    </button>
  );
}
