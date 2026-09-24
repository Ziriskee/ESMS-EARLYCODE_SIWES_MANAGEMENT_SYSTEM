import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusChip } from "../../shared/data/StatusChip";
import { ActionMenu } from "../../shared/ui/ActionMenu";
import type { InstructorSummary } from "../types";

export type InstructorFilter = "active" | "inactive" | "all";

type InstructorTableProps = {
  instructors: InstructorSummary[];
  loading: boolean;
  error: string | null;
  filter: InstructorFilter;
  onFilterChange: (filter: InstructorFilter) => void;
  showCampus: boolean;
  onCreate: () => void;
  onEdit: (instructor: InstructorSummary) => void;
  onToggleActive: (instructor: InstructorSummary) => void;
  onRemove: (instructor: InstructorSummary) => void;
};

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
}

export function InstructorTable({
  instructors,
  loading,
  error,
  filter,
  onFilterChange,
  showCampus,
  onCreate,
  onEdit,
  onToggleActive,
  onRemove,
}: InstructorTableProps) {
  const visible = instructors.filter((i) => {
    if (filter === "active") return i.is_active;
    if (filter === "inactive") return !i.is_active;
    return true;
  });

  const activeCount = instructors.filter((i) => i.is_active).length;
  const inactiveCount = instructors.length - activeCount;

  const buildItems = (i: InstructorSummary) => {
    const inactive = !i.is_active;
    return [
      { label: "Edit", onClick: () => onEdit(i) },
      {
        label: inactive ? "Reactivate" : "Deactivate",
        onClick: () => onToggleActive(i),
      },
      { label: "Remove", onClick: () => onRemove(i), danger: true },
    ];
  };

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2
            className="text-[18px] sm:text-[20px] font-semibold leading-tight"
            style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
          >
            Instructors
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {activeCount} active · {inactiveCount} inactive
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap max-w-full">
          <div
            className="flex items-center rounded-full p-1 max-w-full overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
            style={{ backgroundColor: "var(--surface2)" }}
          >
            {(["active", "inactive", "all"] as InstructorFilter[]).map((f) => (
              <FilterTab
                key={f}
                label={
                  f === "active"
                    ? "Active"
                    : f === "inactive"
                      ? "Inactive"
                      : "All"
                }
                active={filter === f}
                onClick={() => onFilterChange(f)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="h-9 px-4 rounded-full text-[13px] font-semibold"
            style={{ backgroundColor: "var(--gold-500)", color: "var(--coal)" }}
          >
            Add instructor
          </button>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading instructors...
        </p>
      )}
      {!loading && error && (
        <EmptyState title="We couldn't load instructors." description={error} />
      )}
      {!loading && !error && instructors.length === 0 && (
        <EmptyState
          title="No instructors yet."
          description="Add your first instructor to get started."
        />
      )}
      {!loading && !error && instructors.length > 0 && visible.length === 0 && (
        <EmptyState
          title={
            filter === "inactive"
              ? "No inactive instructors."
              : filter === "active"
                ? "No active instructors."
                : "Nothing to show."
          }
        />
      )}

      {!loading && !error && visible.length > 0 && (
        <>
          {/* Desktop / laptop table — fixed layout, never overflows */}
          <div className="hidden md:block">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr
                  className="text-[10.5px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  <th className="w-[20%] font-semibold py-3 pr-4">Name</th>
                  <th className="w-[24%] font-semibold py-3 px-4">Email</th>
                  <th className="w-[13%] font-semibold py-3 px-4 hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="w-[15%] font-semibold py-3 px-4">
                    Department
                  </th>
                  {showCampus && (
                    <th className="w-[9%] font-semibold py-3 px-4">Campus</th>
                  )}
                  <th className="w-[10%] font-semibold py-3 px-4 text-right">
                    Interns
                  </th>
                  <th className="w-[8%] font-semibold py-3 pl-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((i) => {
                  const inactive = !i.is_active;
                  return (
                    <tr
                      key={i.id}
                      className="transition-colors hover:bg-[var(--tint)]"
                      style={{ borderTop: "1px solid var(--line)" }}
                    >
                      <td className="py-5 pr-4">
                        <p
                          className="truncate text-[14px] font-semibold"
                          style={{
                            color: inactive ? "var(--muted)" : "var(--text)",
                          }}
                        >
                          {i.first_name} {i.last_name}
                        </p>
                      </td>
                      <td className="py-5 px-4">
                        <p
                          className="truncate text-[13px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {i.email}
                        </p>
                      </td>
                      <td className="py-5 px-4 hidden lg:table-cell">
                        <p
                          className="truncate text-[13px] tabular-nums"
                          style={{ color: "var(--muted)" }}
                        >
                          {i.phone || "—"}
                        </p>
                      </td>
                      <td className="py-5 px-4">
                        <p
                          className="truncate text-[13px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {i.department || "—"}
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
                            {formatCampus(i.campus)}
                          </span>
                        </td>
                      )}
                      <td className="py-5 px-4 text-right">
                        <span
                          className="text-[13px] tabular-nums"
                          style={{ color: "var(--muted)" }}
                        >
                          {i.assigned_intern_count}
                        </span>
                      </td>
                      <td className="py-5 pl-4 text-right">
                        <ActionMenu items={buildItems(i)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / small tablet cards */}
          <div className="md:hidden flex flex-col">
            {visible.map((i, idx) => {
              const inactive = !i.is_active;
              return (
                <div
                  key={i.id}
                  className="w-full py-5 -mx-2 px-2"
                  style={{
                    borderTop: idx === 0 ? "none" : "1px solid var(--line)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[14px] font-semibold leading-snug truncate"
                        style={{
                          color: inactive ? "var(--muted)" : "var(--text)",
                        }}
                      >
                        {i.first_name} {i.last_name}
                      </p>
                      <p
                        className="text-[12px] mt-0.5 truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {i.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {inactive && (
                        <StatusChip tone="neutral" label="Inactive" />
                      )}
                      <ActionMenu items={buildItems(i)} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      className="text-[12px] truncate"
                      style={{ color: "var(--muted)" }}
                    >
                      {i.department || "No department"}
                      {showCampus ? ` · ${formatCampus(i.campus)}` : ""}
                    </span>
                    <span
                      className="text-[12px] tabular-nums whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {i.assigned_intern_count} intern
                      {i.assigned_intern_count === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
