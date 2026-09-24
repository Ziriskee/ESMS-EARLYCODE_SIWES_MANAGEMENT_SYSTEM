import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import type { InstructorSummary } from "../types";

type RemoveInstructorModalProps = {
  open: boolean;
  onClose: () => void;
  instructor: InstructorSummary | null;
  onRemoved: () => void;
};

export function RemoveInstructorModal({
  open,
  onClose,
  instructor,
  onRemoved,
}: RemoveInstructorModalProps) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!instructor) return;
    setRemoving(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/instructors/${instructor.id}/remove/`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to remove instructor");
      }
      onRemoved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        instructor
          ? `Remove ${instructor.first_name} ${instructor.last_name}?`
          : "Remove instructor?"
      }
      breadcrumb="Confirm"
      icon={<AlertTriangle size={18} strokeWidth={1.75} />}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={removing}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              opacity: removing ? 0.5 : 1,
              cursor: removing ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--status-action-text)",
              color: "#ffffff",
              opacity: removing ? 0.6 : 1,
              cursor: removing ? "not-allowed" : "pointer",
            }}
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-[14px]" style={{ color: "var(--text)" }}>
          This will disable the instructor's account and unassign them from any
          interns currently pointing at them. Their data stays in the system for
          record-keeping.
        </p>
        {instructor && instructor.assigned_intern_count > 0 && (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Currently assigned to{" "}
            <strong style={{ color: "var(--text)" }}>
              {instructor.assigned_intern_count}
            </strong>{" "}
            intern
            {instructor.assigned_intern_count === 1 ? "" : "s"}. They will be
            unassigned.
          </p>
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
