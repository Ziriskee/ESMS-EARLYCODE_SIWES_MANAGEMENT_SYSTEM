import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import type { TaskAssignmentEntry } from "../types";

type TaskReviewModalProps = {
  open: boolean;
  onClose: () => void;
  assignment: TaskAssignmentEntry | null;
  onReviewed: () => void;
};

export function TaskReviewModal({
  open,
  onClose,
  assignment,
  onReviewed,
}: TaskReviewModalProps) {
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!assignment) return null;

  const handleReview = async () => {
    const text = feedback.trim();
    if (text.length < 10) {
      setError("Feedback must be at least 10 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/instructor/assignments/${assignment.id}/review/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: text }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to review task");
      }
      onReviewed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Review task — ${assignment.intern.name}`}
      breadcrumb="Review"
      icon={<ClipboardCheck size={18} strokeWidth={1.75} />}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              opacity: saving ? 0.5 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReview}
            disabled={saving}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--gold-500)",
              color: "var(--coal)",
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Mark reviewed"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label
            className="text-[10.5px] font-semibold uppercase tracking-[0.1em] block mb-1.5"
            style={{ color: "var(--muted)" }}
          >
            Feedback for the intern
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="What went well? What should improve?"
            className="w-full px-3 py-2 rounded-xl text-[13px] resize-none"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              outline: "none",
            }}
          />
          <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
            Minimum 10 characters. The intern sees this text with the review.
          </p>
        </div>
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
