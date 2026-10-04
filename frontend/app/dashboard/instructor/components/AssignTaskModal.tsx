import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { apiFetch } from "../../../../lib/api";
import type {
  AssignedInternSummary,
  InstructorTask,
  MyInternsResponse,
} from "../types";

type AssignTaskModalProps = {
  open: boolean;
  onClose: () => void;
  task: InstructorTask | null;
  onAssigned: () => void;
};

export function AssignTaskModal({
  open,
  onClose,
  task,
  onAssigned,
}: AssignTaskModalProps) {
  const [interns, setInterns] = useState<AssignedInternSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await apiFetch<MyInternsResponse>("/instructor/interns/");
        if (isMounted) setInterns(data.results ?? []);
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load interns",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [open]);

  if (!task) return null;

  const assignedIds = new Set(task.assignments.map((a) => a.intern.id));

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (selected.length === 0) {
      setError("Select at least one intern to assign.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/instructor/tasks/${task.id}/assign/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intern_ids: selected }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to assign task");
      }
      onAssigned();
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
      title={`Assign “${task.title}”`}
      breadcrumb="Assign"
      icon={<UserPlus size={18} strokeWidth={1.75} />}
      size="md"
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
            onClick={handleAssign}
            disabled={saving}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--gold-500)",
              color: "var(--coal)",
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Assigning..." : `Assign (${selected.length})`}
          </button>
        </div>
      }
    >
      {loading && (
        <p className="text-[13px] py-4" style={{ color: "var(--muted)" }}>
          Loading your interns...
        </p>
      )}
      {!loading && loadError && (
        <p
          className="text-[13px] py-4"
          style={{ color: "var(--status-action-text)" }}
        >
          {loadError}
        </p>
      )}
      {!loading && !loadError && interns.length === 0 && (
        <p className="text-[13px] py-4" style={{ color: "var(--muted)" }}>
          No interns assigned to you yet.
        </p>
      )}
      {!loading && !loadError && interns.length > 0 && (
        <ul className="space-y-2">
          {interns.map((intern) => {
            const already = assignedIds.has(intern.id);
            const checked = already || selected.includes(intern.id);
            return (
              <li key={intern.id}>
                <label
                  className="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors"
                  style={{
                    borderColor: checked ? "var(--gold-500)" : "var(--line)",
                    backgroundColor: checked
                      ? "var(--tint)"
                      : "var(--surface2)",
                    opacity: already ? 0.6 : 1,
                    cursor: already ? "not-allowed" : "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={already}
                    onChange={() => toggle(intern.id)}
                    className="w-4 h-4"
                    style={{ accentColor: "var(--gold-500)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[13.5px] font-semibold truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {intern.user.first_name} {intern.user.last_name}
                    </p>
                    <p
                      className="text-[12px] truncate"
                      style={{ color: "var(--muted)" }}
                    >
                      {intern.user.email}
                    </p>
                  </div>
                  {already && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full shrink-0"
                      style={{
                        backgroundColor: "var(--status-approved-bg)",
                        color: "var(--status-approved-text)",
                      }}
                    >
                      Assigned
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}
      {error && (
        <p
          className="text-[12.5px] mt-3"
          style={{ color: "var(--status-action-text)" }}
        >
          {error}
        </p>
      )}
    </Modal>
  );
}
