import { ListChecks } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { StatusChip } from "../../shared/data/StatusChip";
import type { InstructorTask, TaskAssignmentEntry } from "../types";

type TaskDetailModalProps = {
  open: boolean;
  onClose: () => void;
  task: InstructorTask | null;
  onReview: (assignment: TaskAssignmentEntry) => void;
  onAssign: (task: InstructorTask) => void;
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

function assignmentChip(status: TaskAssignmentEntry["status"]) {
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

export function TaskDetailModal({
  open,
  onClose,
  task,
  onReview,
  onAssign,
}: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title}
      breadcrumb="Task"
      icon={<ListChecks size={18} strokeWidth={1.75} />}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <button
            type="button"
            onClick={() => onAssign(task)}
            className="h-9 px-4 rounded-full text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          >
            Assign more
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            Due {formatDate(task.due_date)}
          </span>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            ·
          </span>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            {task.assigned_count} assigned · {task.submitted_count} submitted
          </span>
        </div>
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)" }}
            >
              Attachments
            </span>
            <span
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--line)" }}
            />
          </div>
          {task.attachments.length === 0 ? (
            <p className="text-[13px]" style={{ color: "var(--muted)" }}>
              No attachments.
            </p>
          ) : (
            <ul className="space-y-2">
              {task.attachments.map((a) => (
                <li key={a.id}>
                  <a
                    href={a.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-[var(--tint)]"
                    style={{ color: "var(--gold-800)" }}
                  >
                    <span className="text-[13px] font-semibold truncate">
                      {a.file.split("/").pop()}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)" }}
            >
              Description
            </span>
            <span
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--line)" }}
            />
          </div>
          <div
            className="rounded-[10px] p-4"
            style={{ backgroundColor: "var(--surface2)" }}
          >
            <p
              className="text-[13.5px] whitespace-pre-wrap leading-relaxed"
              style={{ color: "var(--text)" }}
            >
              {task.description}
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)" }}
            >
              Assignments
            </span>
            <span
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--line)" }}
            />
          </div>
          {task.assignments.length === 0 ? (
            <p className="text-[13px]" style={{ color: "var(--muted)" }}>
              Not assigned to any intern yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {task.assignments.map((a) => {
                const chip = assignmentChip(a.status);
                return (
                  <li
                    key={a.id}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--line)",
                      backgroundColor: "var(--surface2)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-[13.5px] font-semibold truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {a.intern.name}
                        </p>
                        <p
                          className="text-[11.5px] mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {a.status === "PENDING"
                            ? "Awaiting submission"
                            : `Submitted ${formatDate(a.submitted_at)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusChip tone={chip.tone} label={chip.label} />
                        {a.status === "SUBMITTED" && (
                          <button
                            type="button"
                            onClick={() => onReview(a)}
                            className="h-7 px-3 rounded-full text-[12px] font-semibold"
                            style={{
                              backgroundColor: "var(--gold-500)",
                              color: "var(--coal)",
                            }}
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                    {a.submission_file_url && (
                      <a
                        href={a.submission_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] mt-2 inline-flex items-center gap-1"
                        style={{ color: "var(--gold-800)" }}
                      >
                        View submitted file
                      </a>
                    )}
                    {(a.status === "REVIEWED" ||
                      a.status === "NEEDS_REVISION") &&
                      a.instructor_feedback && (
                        <p
                          className="text-[12.5px] mt-3 whitespace-pre-wrap"
                          style={{ color: "var(--muted)" }}
                        >
                          "{a.instructor_feedback}"
                        </p>
                      )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  );
}
