import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { apiFetch } from "../../../../lib/api";
import type { AllInternSummary, InstructorSummary } from "../types";

type AssignInstructorModalProps = {
  open: boolean;
  onClose: () => void;
  intern: AllInternSummary | null;
  onAssigned: () => void;
};

export function AssignInstructorModal({
  open,
  onClose,
  intern,
  onAssigned,
}: AssignInstructorModalProps) {
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(
    intern?.assigned_instructor?.id ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch instructors when the modal opens.
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const campusParam = intern?.preferred_campus
          ? `?campus=${intern.preferred_campus}`
          : "";
        const data = await apiFetch<
          InstructorSummary[] | { results: InstructorSummary[] }
        >(`/admin/instructors/${campusParam}`);
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (isMounted) setInstructors(list);
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load instructors",
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

  const handleAssign = async () => {
    if (!intern || !selectedId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await apiFetch(`admin/interns/${intern.id}/assign-instructor/`, {
        method: "POST",
        body: JSON.stringify({ instructor_id: selectedId }),
      });
      onAssigned();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!intern) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign instructor to ${intern.user.first_name} ${intern.user.last_name}`}
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
            disabled={saving || !selectedId}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--gold-500)",
              color: "var(--coal)",
              opacity: saving || !selectedId ? 0.5 : 1,
              cursor: saving || !selectedId ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Assigning..." : "Assign"}
          </button>
        </div>
      }
    >
      {loading && (
        <p className="text-[13px] py-4" style={{ color: "var(--muted)" }}>
          Loading instructors...
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
      {!loading && !loadError && instructors.length === 0 && (
        <p className="text-[13px] py-4" style={{ color: "var(--muted)" }}>
          No active instructors. Add one from the Instructors page first.
        </p>
      )}
      {!loading && !loadError && instructors.length > 0 && (
        <div className="space-y-3">
          {intern.assigned_instructor && (
            <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
              Currently assigned to{" "}
              <strong style={{ color: "var(--text)" }}>
                {intern.assigned_instructor.name}
              </strong>
              . Selecting a new instructor will replace them.
            </p>
          )}
          <ul className="space-y-2">
            {instructors.map((i) => {
              const selected = i.id === selectedId;
              const initials =
                (i.first_name?.[0] ?? "").toUpperCase() +
                (i.last_name?.[0] ?? "").toUpperCase();
              return (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(i.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors"
                    style={{
                      borderColor: selected ? "var(--gold-500)" : "var(--line)",
                      backgroundColor: selected
                        ? "var(--tint)"
                        : "var(--surface2)",
                    }}
                  >
                    <span
                      className="h-9 w-9 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
                      style={{
                        backgroundColor: "var(--gold-500)",
                        color: "var(--coal)",
                      }}
                    >
                      {initials || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[13.5px] font-semibold truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {i.first_name} {i.last_name}
                      </p>
                      <p
                        className="text-[12px] truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {i.email}
                        {i.department ? ` · ${i.department}` : ""}
                      </p>
                    </div>
                    <span
                      className="text-[11px] shrink-0"
                      style={{ color: "var(--muted)" }}
                    >
                      {i.assigned_intern_count} intern
                      {i.assigned_intern_count === 1 ? "" : "s"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {saveError && (
            <p
              className="text-[12.5px]"
              style={{ color: "var(--status-action-text)" }}
            >
              {saveError}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
