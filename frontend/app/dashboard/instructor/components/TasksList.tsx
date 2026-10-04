import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ActionMenu } from "../../shared/ui/ActionMenu";
import type { InstructorTask } from "../types";

type TasksListProps = {
  tasks: InstructorTask[];
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onSelect: (task: InstructorTask) => void;
  onAssign: (task: InstructorTask) => void;
  onDelete: (task: InstructorTask) => void;
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

function isOverdue(task: InstructorTask): boolean {
  if (!task.due_date) return false;
  return new Date(task.due_date).getTime() < Date.now();
}

export function TasksList({
  tasks,
  loading,
  error,
  onCreate,
  onSelect,
  onAssign,
  onDelete,
}: TasksListProps) {
  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2
            className="text-[18px] sm:text-[20px] font-semibold leading-tight"
            style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
          >
            Tasks
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {tasks.length} task{tasks.length === 1 ? "" : "s"} created
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="h-9 px-4 rounded-full text-[13px] font-semibold shrink-0"
          style={{ backgroundColor: "var(--gold-500)", color: "var(--coal)" }}
        >
          New task
        </button>
      </div>

      {/* Body */}
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading tasks...
        </p>
      )}
      {!loading && error && (
        <EmptyState title="We couldn't load your tasks." description={error} />
      )}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          title="No tasks yet."
          description="Create a task and assign it to your interns."
        />
      )}

      {!loading && !error && tasks.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr
                  className="text-[10.5px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  <th className="w-[44%] font-semibold py-3 pr-4">Task</th>
                  <th className="w-[16%] font-semibold py-3 px-4 whitespace-nowrap">
                    Due
                  </th>
                  <th className="w-[12%] font-semibold py-3 px-4 text-right">
                    Assigned
                  </th>
                  <th className="w-[12%] font-semibold py-3 px-4 text-right">
                    Submitted
                  </th>
                  <th className="w-[8%] font-semibold py-3 pl-4 text-right" />
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const overdue = isOverdue(task);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelect(task)}
                      className="transition-colors hover:bg-[var(--tint)] cursor-pointer"
                      style={{ borderTop: "1px solid var(--line)" }}
                    >
                      <td className="py-5 pr-4">
                        <p
                          className="truncate text-[14px] font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {task.title}
                        </p>
                        <p
                          className="truncate text-[12px] mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {task.description}
                        </p>
                      </td>
                      <td className="py-5 px-4">
                        <span
                          className="text-[13px] whitespace-nowrap"
                          style={{
                            color: overdue
                              ? "var(--status-action-text)"
                              : "var(--muted)",
                          }}
                        >
                          {formatDate(task.due_date)}
                          {overdue && " · overdue"}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <span
                          className="text-[13px] tabular-nums"
                          style={{ color: "var(--muted)" }}
                        >
                          {task.assigned_count}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <span
                          className="text-[13px] tabular-nums"
                          style={{ color: "var(--muted)" }}
                        >
                          {task.submitted_count}
                        </span>
                      </td>
                      <td className="py-5 pl-4 text-right">
                        <div onClick={(e) => e.stopPropagation()}>
                          <ActionMenu
                            items={[
                              {
                                label: "View",
                                onClick: () => onSelect(task),
                              },
                              {
                                label: "Assign",
                                onClick: () => onAssign(task),
                              },
                              {
                                label: "Delete",
                                onClick: () => onDelete(task),
                                danger: true,
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col">
            {tasks.map((task, i) => {
              const overdue = isOverdue(task);
              return (
                <div
                  key={task.id}
                  className="w-full py-5 -mx-2 px-2"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--line)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelect(task)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p
                        className="truncate text-[14px] font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {task.title}
                      </p>
                      <p
                        className="truncate text-[12px] mt-0.5"
                        style={{ color: "var(--muted)" }}
                      >
                        {task.description}
                      </p>
                    </button>
                    <ActionMenu
                      items={[
                        { label: "View", onClick: () => onSelect(task) },
                        { label: "Assign", onClick: () => onAssign(task) },
                        {
                          label: "Delete",
                          onClick: () => onDelete(task),
                          danger: true,
                        },
                      ]}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      className="text-[12px]"
                      style={{
                        color: overdue
                          ? "var(--status-action-text)"
                          : "var(--muted)",
                      }}
                    >
                      Due {formatDate(task.due_date)}
                    </span>
                    <span
                      className="text-[12px] tabular-nums"
                      style={{ color: "var(--muted)" }}
                    >
                      {task.assigned_count} assigned · {task.submitted_count}{" "}
                      submitted
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
