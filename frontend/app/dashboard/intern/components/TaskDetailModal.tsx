import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { StatusChip } from "../../shared/data/StatusChip";
import type { InternTaskAssignment } from "../hooks/useMyTasks";
import { apiFetch } from "@/lib/api";

type TaskDetailModalProps = {
  open: boolean;
  onClose: () => void;
  assignment: InternTaskAssignment | null;
  /** Called after a successful submit so the list + badge refresh. */
  onSubmitted: () => void;
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

function isOverdue(assignment: InternTaskAssignment): boolean {
  if (!assignment.task.due_date) return false;
  return (
    assignment.status === "PENDING" &&
    new Date(assignment.task.due_date).getTime() < Date.now()
  );
}

function statusChip(status: InternTaskAssignment["status"]) {
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
  assignment,
  onSubmitted,
}: TaskDetailModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!assignment) return null;

  const chip = statusChip(assignment.status);
  const overdue = isOverdue(assignment);
    const canSubmit =
      assignment.status === "PENDING" || assignment.status === "NEEDS_REVISION";
  const attachments = assignment.task.attachments ?? [];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (file) formData.append("submission_file", file);

      await apiFetch(`/intern/tasks/${assignment.id}/submit/`, {
        method: "PATCH",
        body: formData,
      });
      setFile(null);
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={assignment.task.title}
      breadcrumb="Task"
      icon={<ListChecks size={18} strokeWidth={1.75} />}
      size="md"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          >
            Close
          </button>
          {canSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap"
              style={{
                backgroundColor: "var(--gold-500)",
                color: "var(--coal)",
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit task"}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-7">
        {/* Meta strip */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip tone={chip.tone} label={chip.label} />
          <span
            className="text-[12px]"
            style={{
              color: overdue ? "var(--status-action-text)" : "var(--muted)",
            }}
          >
            Due {formatDate(assignment.task.due_date)}
            {overdue && " · overdue"}
          </span>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            · From {assignment.task.instructor.user.first_name}{" "}
            {assignment.task.instructor.user.last_name}
          </span>
        </div>

        {assignment.status !== "PENDING" && assignment.submitted_at && (
          <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
            You submitted this on {formatDate(assignment.submitted_at)}.
          </p>
        )}

        {/* 1 — Instructions */}
        <Section label="Instructions">
          <div
            className="rounded-[10px] p-4"
            style={{ backgroundColor: "var(--surface2)" }}
          >
            <p
              className="text-[13.5px] whitespace-pre-wrap leading-relaxed"
              style={{ color: "var(--text)" }}
            >
              {assignment.task.description}
            </p>
          </div>
        </Section>

        {/* 2 — Attachments from instructor */}
        <Section label="Attachments">
          {attachments.length === 0 ? (
            <p className="text-[13px]" style={{ color: "var(--muted)" }}>
              No attachments.
            </p>
          ) : (
            <ul className="space-y-2">
              {attachments.map((a) => (
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
        </Section>

        {/* 3 — Submission */}
        {canSubmit ? (
          <Section label="Your submission (optional)">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full h-10 px-3 py-2 rounded-xl text-[13px] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[12px] file:font-semibold"
              style={{ ...inputStyle, cursor: "pointer" }}
            />
            <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              Upload your completed work (PDF, image, document).
            </p>
          </Section>
        ) : assignment.submission_file_url ? (
          <Section label="Your submission">
            <a
              href={assignment.submission_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold"
              style={{ color: "var(--gold-800)" }}
            >
              View your submitted file
            </a>
          </Section>
        ) : null}

        {/* Instructor feedback (after review or revision request) */}
        {(assignment.status === "REVIEWED" ||
          assignment.status === "NEEDS_REVISION") &&
          assignment.instructor_feedback && (
            <Section label="Instructor feedback">
              <div
                className="rounded-[10px] p-4"
                style={{
                  backgroundColor:
                    assignment.status === "NEEDS_REVISION"
                      ? "var(--status-action-bg)"
                      : "var(--status-approved-bg)",
                }}
              >
                <p
                  className="text-[13.5px] whitespace-pre-wrap leading-relaxed"
                  style={{
                    color:
                      assignment.status === "NEEDS_REVISION"
                        ? "var(--status-action-text)"
                        : "var(--status-approved-text)",
                  }}
                >
                  {assignment.instructor_feedback}
                </p>
              </div>
            </Section>
          )}

        {error && (
          <p
            className="text-[12.5px]"
            style={{ color: "var(--status-action-text)" }}
          >
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--muted)" }}
        >
          {label}
        </span>
        <span
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--line)" }}
        />
      </div>
      {children}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface2)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  outline: "none",
};
