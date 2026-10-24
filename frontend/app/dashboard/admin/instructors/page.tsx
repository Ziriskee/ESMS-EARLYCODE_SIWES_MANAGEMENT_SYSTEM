import { useState } from "react";
import { useInstructors } from "../hooks/useInstructors";
import {
  InstructorTable,
  type InstructorFilter,
} from "../components/InstructorTable";
import { InstructorFormModal } from "../components/InstructorFormModal";
import { RemoveInstructorModal } from "../components/RemoveInstructorModal";
import { ConfirmModal } from "../../shared/ui/ConfirmModal";
import type { InstructorSummary } from "../types";
import { useCampusFilter } from "@/contexts/useCampusFilter";
import { apiFetch } from "@/lib/api";

type ModalState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; instructor: InstructorSummary }
  | { kind: "remove"; instructor: InstructorSummary }
  | { kind: "toggle"; instructor: InstructorSummary };

export default function AdminInstructorsPage() {
      const { campus } = useCampusFilter();

  const { instructors, loading, error, refetch } = useInstructors(true, campus);
  const [filter, setFilter] = useState<InstructorFilter>("active");
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [busy, setBusy] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const closeModal = () => {
    setModal({ kind: "closed" });
    setConfirmError(null);
  };

  const handleToggleConfirm = async () => {
    if (modal.kind !== "toggle") return;
    const instructor = modal.instructor;
    const endpoint = instructor.is_active ? "deactivate" : "reactivate";
    setBusy(true);
    setConfirmError(null);
    try {
      await apiFetch(`admin/instructors/${instructor.id}/${endpoint}/`, {
        method: "POST",
      });
      await refetch();
      closeModal();
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <InstructorTable
          instructors={instructors}
          loading={loading}
          error={error}
          filter={filter}
          onFilterChange={setFilter}
          showCampus={campus === "all"}
          onCreate={() => setModal({ kind: "create" })}
          onEdit={(i) => setModal({ kind: "edit", instructor: i })}
          onToggleActive={(i) => setModal({ kind: "toggle", instructor: i })}
          onRemove={(i) => setModal({ kind: "remove", instructor: i })}
        />
      </div>

      <InstructorFormModal
        key={
          modal.kind === "edit"
            ? `edit-${modal.instructor.id}`
            : modal.kind === "create"
              ? "create"
              : "instructor-form-closed"
        }
        open={modal.kind === "create" || modal.kind === "edit"}
        onClose={closeModal}
        instructor={modal.kind === "edit" ? modal.instructor : null}
        onSaved={refetch}
      />

      <RemoveInstructorModal
        key={
          modal.kind === "remove"
            ? `remove-${modal.instructor.id}`
            : "remove-instructor-closed"
        }
        open={modal.kind === "remove"}
        onClose={closeModal}
        instructor={modal.kind === "remove" ? modal.instructor : null}
        onRemoved={refetch}
      />

      <ConfirmModal
        open={modal.kind === "toggle"}
        onClose={busy ? () => {} : closeModal}
        onConfirm={handleToggleConfirm}
        busy={busy}
        tone={
          modal.kind === "toggle" && modal.instructor.is_active
            ? "danger"
            : "neutral"
        }
        title={
          modal.kind === "toggle"
            ? modal.instructor.is_active
              ? `Deactivate ${modal.instructor.first_name} ${modal.instructor.last_name}?`
              : `Reactivate ${modal.instructor.first_name} ${modal.instructor.last_name}?`
            : ""
        }
        confirmLabel={
          modal.kind === "toggle"
            ? modal.instructor.is_active
              ? "Deactivate"
              : "Reactivate"
            : "Confirm"
        }
        description={
          modal.kind === "toggle" ? (
            <div className="space-y-3">
              <p className="text-[14px]" style={{ color: "var(--text)" }}>
                {modal.instructor.is_active
                  ? "The instructor will not be able to log in. Any interns assigned to them stay assigned. You can reactivate them at any time."
                  : "The instructor will regain access and will be able to log in again."}
              </p>
              {confirmError && (
                <p
                  className="text-[12.5px]"
                  style={{ color: "var(--status-action-text)" }}
                >
                  {confirmError}
                </p>
              )}
            </div>
          ) : null
        }
      />
    </>
  );
}
