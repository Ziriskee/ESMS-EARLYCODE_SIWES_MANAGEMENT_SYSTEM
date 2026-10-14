import { ChevronRight } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusChip } from "../../shared/data/StatusChip";
import type { AssignedInternSummary } from "../types";

type InternsTableProps = {
  interns: AssignedInternSummary[];
  loading: boolean;
  error: string | null;
  onSelect: (intern: AssignedInternSummary) => void;
};

function statusChip(status: AssignedInternSummary["status"]) {
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

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
}

export function InternsTable({
  interns,
  loading,
  error,
  onSelect,
}: InternsTableProps) {
  

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="mb-5">
        <h2
          className="text-[18px] sm:text-[20px] font-semibold leading-tight"
          style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
        >
          My interns
        </h2>
        <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
          {interns.length} assigned
         
        </p>
      </div>

      {/* Body */}
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading your interns...
        </p>
      )}
      {!loading && error && (
        <EmptyState
          title="We couldn't load your interns."
          description={error}
        />
      )}
      {!loading && !error && interns.length === 0 && (
        <EmptyState
          title="No interns assigned yet."
          description="The admin assigns interns to you. They'll appear here."
        />
      )}

      {!loading && !error && interns.length > 0 && (
        <>
          {/* Desktop / laptop table */}
          <div className="hidden md:block">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr
                  className="text-[10.5px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  <th className="w-[34%] font-semibold py-3 pr-4">Name</th>
                  <th className="w-[12%] font-semibold py-3 px-4">Campus</th>
                  <th className="w-[14%] font-semibold py-3 px-4">Status</th>
          
                  <th className="w-[8%] font-semibold py-3 pl-4" />
                </tr>
              </thead>
              <tbody>
                {interns.map((intern) => {
                  const chip = statusChip(intern.status);
                  return (
                    <tr
                      key={intern.id}
                      onClick={() => onSelect(intern)}
                      className="transition-colors hover:bg-[var(--tint)] cursor-pointer"
                      style={{ borderTop: "1px solid var(--line)" }}
                    >
                      <td className="py-5 pr-4">
                        <p
                          className="truncate text-[14px] font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {intern.user.first_name} {intern.user.last_name}
                        </p>
                        <p
                          className="truncate text-[12px] mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {intern.user.email}
                        </p>
                      </td>
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
            {interns.map((intern, i) => {
              const chip = statusChip(intern.status);
              return (
                <button
                  key={intern.id}
                  type="button"
                  onClick={() => onSelect(intern)}
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
                        {intern.user.first_name} {intern.user.last_name}
                      </p>
                      <p
                        className="truncate text-[12px] mt-0.5"
                        style={{ color: "var(--muted)" }}
                      >
                        {intern.user.email}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 mt-1"
                      style={{ color: "var(--muted)" }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <StatusChip tone={chip.tone} label={chip.label} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                      style={{
                        backgroundColor: "var(--tint)",
                        color: "var(--muted)",
                      }}
                    >
                      {formatCampus(intern.preferred_campus)}
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
