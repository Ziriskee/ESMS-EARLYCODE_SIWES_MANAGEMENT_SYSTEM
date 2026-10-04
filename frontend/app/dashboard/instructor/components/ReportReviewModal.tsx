import { useState } from "react";
import { FileText } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { StatusChip } from "../../shared/data/StatusChip";
import type { InstructorReport } from "../types";

type ReportReviewModalProps = {
  open: boolean;
  onClose: () => void;
  report: InstructorReport | null;
  /** Called after a successful approve / request-revision. */
  onReviewed: () => void;
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

export function ReportReviewModal({
  open,
  onClose,
  report,
  onReviewed,
}: ReportReviewModalProps) {
  // Parent remounts via key={report.id}, so this initializer is always fresh.
  const [feedback, setFeedback] = useState(report?.instructor_feedback ?? "");
  const [saving, setSaving] = useState<"" | "APPROVED" | "NEEDS_REVISION">("");
  const [error, setError] = useState<string | null>(null);

  if (!report) return null;

  const reviewable = report.status === "SUBMITTED";
  const chip = chipFor(report.status);

  const decide = async (decision: "APPROVED" | "NEEDS_REVISION") => {
    const text = feedback.trim();
    if (text.length < 10) {
      setError("Feedback must be at least 10 characters.");
      return;
    }
    setSaving(decision);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/instructor/reports/${report.id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: decision, feedback: text }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save the review");
      }
      onReviewed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving("");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={report.title}
      breadcrumb="Report"
      icon={<FileText size={18} strokeWidth={1.75} />}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          {reviewable ? (
            <button
              type="button"
              onClick={() => decide("NEEDS_REVISION")}
              disabled={saving !== ""}
              className="h-9 px-4 rounded-full text-[13px] font-semibold transition-colors"
              style={{
                backgroundColor: "transparent",
                color: "var(--status-action-text)",
                border: "1px solid var(--status-action-bg)",
                opacity: saving === "" ? 1 : 0.5,
                cursor: saving === "" ? "pointer" : "not-allowed",
              }}
            >
              {saving === "NEEDS_REVISION" ? "Saving..." : "Request revision"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
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
            {reviewable && (
              <button
                type="button"
                onClick={() => decide("APPROVED")}
                disabled={saving !== ""}
                className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--gold-500)",
                  color: "var(--coal)",
                  opacity: saving === "" ? 1 : 0.6,
                  cursor: saving === "" ? "pointer" : "not-allowed",
                }}
              >
                {saving === "APPROVED" ? "Saving..." : "Approve"}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-7">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip tone={chip.tone} label={chip.label} />
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            {report.intern.name}
          </span>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            Submitted {formatDate(report.submitted_at)}
          </span>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)" }}
            >
              Report
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
              {report.content}
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)" }}
            >
              {reviewable ? "Your feedback" : "Feedback given"}
            </span>
            <span
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--line)" }}
            />
          </div>
          {reviewable ? (
            <>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="What went well? What should be improved?"
                className="w-full px-3 py-2 rounded-xl text-[13px] resize-none"
                style={{
                  backgroundColor: "var(--surface2)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                  outline: "none",
                }}
              />
              <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                Minimum 10 characters. The intern sees this text with your
                decision.
              </p>
            </>
          ) : (
            <div
              className="rounded-[10px] p-4"
              style={{ backgroundColor: "var(--surface2)" }}
            >
              <p
                className="text-[13.5px] whitespace-pre-wrap leading-relaxed"
                style={{ color: "var(--text)" }}
              >
                {report.instructor_feedback || "No feedback was given."}
              </p>
            </div>
          )}
          {error && (
            <p
              className="text-[12.5px] mt-2"
              style={{ color: "var(--status-action-text)" }}
            >
              {error}
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
}
