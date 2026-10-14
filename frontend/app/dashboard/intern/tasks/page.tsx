import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusChip } from "../../shared/data/StatusChip";
import { useMyTasks, type InternTaskAssignment } from "../hooks/useMyTasks";
import { TaskDetailModal } from "../components/TaskDetailModal";
import { useDashboardDataContext } from "@/contexts/useDashboardDataContext";

type Tab = "all" | "todo" | "done";

function chipFor(status: InternTaskAssignment["status"]) {
  switch (status) {
    case "REVIEWED":
      return { tone: "approved" as const, label: "Reviewed" };
    case "SUBMITTED":
      return { tone: "review" as const, label: "Submitted" };
    case "NEEDS_REVISION":
      return { tone: "action" as const, label: "Needs revision" };
    case "PENDING":
    default:
      return { tone: "neutral" as const, label: "Pending" };
  }
}

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

function isOverdue(a: InternTaskAssignment): boolean {
  if (!a.task.due_date) return false;
  return (
    a.status === "PENDING" && new Date(a.task.due_date).getTime() < Date.now()
  );
}

function isDueSoon(a: InternTaskAssignment): boolean {
  if (!a.task.due_date) return false;
  if (a.status !== "PENDING" && a.status !== "NEEDS_REVISION") return false;
  const delta = new Date(a.task.due_date).getTime() - Date.now();
  return delta > 0 && delta <= 48 * 60 * 60 * 1000;
}

function dueSortValue(a: InternTaskAssignment): number {
  if (!a.task.due_date) return Number.MAX_SAFE_INTEGER;
  return new Date(a.task.due_date).getTime();
}

export default function InternTasksPage() {
  const { tasks, loading, error, refetch } = useMyTasks();
  const { refetch: refetchDashboard } = useDashboardDataContext();
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => dueSortValue(a) - dueSortValue(b)),
    [tasks],
  );
  const todo = sorted.filter(
    (t) => t.status === "PENDING" || t.status === "NEEDS_REVISION",
  );
  const done = sorted.filter(
    (t) => t.status === "SUBMITTED" || t.status === "REVIEWED",
  );
  const visible = tab === "all" ? sorted : tab === "todo" ? todo : done;

  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const handleSubmitted = async () => {
    await refetch();
    await refetchDashboard();
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <Card padding="lg">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <h2
                className="text-[18px] sm:text-[20px] font-semibold leading-tight"
                style={{
                  color: "var(--text)",
                  fontFamily: "var(--font-display)",
                }}
              >
                My tasks
              </h2>
              <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
                {todo.length} to do · {done.length} done
              </p>
            </div>
            <div
              className="flex items-center rounded-full p-1 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ backgroundColor: "var(--surface2)" }}
            >
              {(
                [
                  { key: "all", label: `All (${sorted.length})` },
                  { key: "todo", label: `To do (${todo.length})` },
                  { key: "done", label: `Done (${done.length})` },
                ] as { key: Tab; label: string }[]
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
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
              Loading your tasks...
            </p>
          )}
          {!loading && error && (
            <EmptyState
              title="We couldn't load your tasks."
              description={error}
            />
          )}
          {!loading && !error && sorted.length === 0 && (
            <EmptyState
              title="No tasks yet."
              description="Tasks assigned by your instructor will appear here."
            />
          )}
          {!loading && !error && sorted.length > 0 && visible.length === 0 && (
            <EmptyState
              title={
                tab === "todo"
                  ? "Nothing to do. You're caught up."
                  : "Nothing here yet."
              }
            />
          )}

          {!loading && !error && visible.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full table-fixed text-left">
                  <thead>
                    <tr
                      className="text-[10.5px] uppercase tracking-[0.14em]"
                      style={{ color: "var(--muted)" }}
                    >
                      <th className="w-[48%] font-semibold py-3 pr-4">Task</th>
                      <th className="w-[20%] font-semibold py-3 px-4 whitespace-nowrap">
                        Due
                      </th>
                      <th className="w-[24%] font-semibold py-3 px-4">
                        Status
                      </th>
                      <th className="w-[8%] font-semibold py-3 pl-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((a) => {
                      const chip = chipFor(a.status);
                      const overdue = isOverdue(a);
                      return (
                        <tr
                          key={a.id}
                          onClick={() => {
                            setSelectedId(a.id);
                            setModalOpen(true);
                          }}
                          className="transition-colors hover:bg-[var(--tint)] cursor-pointer"
                          style={{ borderTop: "1px solid var(--line)" }}
                        >
                          <td className="py-5 pr-4">
                            <p
                              className="truncate text-[14px] font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {a.task.title}
                            </p>
                            <p
                              className="truncate text-[12px] mt-0.5"
                              style={{ color: "var(--muted)" }}
                            >
                              {a.task.description}
                            </p>
                          </td>
                          <td className="py-5 px-4">
                            <span
                              className="text-[13px] whitespace-nowrap"
                              style={{
                                color: overdue
                                  ? "var(--status-action-text)"
                                  : isDueSoon(a)
                                    ? "var(--status-review-text)"
                                    : "var(--muted)",
                              }}
                            >
                              {formatDate(a.task.due_date)}
                              {overdue && " · overdue"}
                              {isDueSoon(a) && " · due soon"}
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
                {visible.map((a, i) => {
                  const chip = chipFor(a.status);
                  const overdue = isOverdue(a);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(a.id);
                        setModalOpen(true);
                      }}
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
                            {a.task.title}
                          </p>
                          <p
                            className="truncate text-[12px] mt-0.5"
                            style={{ color: "var(--muted)" }}
                          >
                            {a.task.description}
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
                          style={{
                            color: overdue
                              ? "var(--status-action-text)"
                              : "var(--muted)",
                          }}
                        >
                          Due {formatDate(a.task.due_date)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      <TaskDetailModal
        key={selectedId ?? "none"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        assignment={selected}
        onSubmitted={handleSubmitted}
      />
    </>
  );
}
