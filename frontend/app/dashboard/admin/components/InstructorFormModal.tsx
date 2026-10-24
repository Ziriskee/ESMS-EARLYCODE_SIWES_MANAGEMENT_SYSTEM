import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import type { InstructorSummary } from "../types";
import { apiFetch } from "@/lib/api";

type InstructorFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** Non-null when editing; null when creating. */
  instructor: InstructorSummary | null;
  onSaved: () => void;
};

type FormState = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  campus: string;
};

function initialFormFrom(instructor: InstructorSummary | null): FormState {
  if (!instructor) {
    return {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      department: "",
      campus: "kubwa",
    };
  }
  return {
    email: instructor.email,
    first_name: instructor.first_name,
    last_name: instructor.last_name,
    phone: instructor.phone,
    department: instructor.department,
    campus: instructor.campus || "kubwa",
  };
}

export function InstructorFormModal({
  open,
  onClose,
  instructor,
  onSaved,
}: InstructorFormModalProps) {
  const isEdit = instructor !== null;

  // The parent remounts this component via `key` whenever the target
  // instructor changes, so this initializer always runs with the
  // correct instructor in scope.
  const [form, setForm] = useState<FormState>(() =>
    initialFormFrom(instructor),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit && instructor) {
        await apiFetch(`admin/instructors/${instructor.id}/`, {
          method: "PATCH",
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            department: form.department,
            campus: form.campus,
          }),
        });
      } else {
        await apiFetch("admin/instructors/create/", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            department: form.department,
            campus: form.campus,
          }),
        });
      }
      onSaved();
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
      title={isEdit ? "Edit instructor" : "Add instructor"}
      breadcrumb={isEdit ? "Instructor" : "New"}
      icon={<GraduationCap size={18} strokeWidth={1.75} />}
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
            type="submit"
            form="instructor-form"
            disabled={saving}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--gold-500)",
              color: "var(--coal)",
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      }
    >
      <form id="instructor-form" onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="jane.doe@earlycode.net"
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
            <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              They'll receive a login link here on first sign-in. Email can't be
              changed from this panel.
            </p>
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name">
            <input
              type="text"
              required
              value={form.first_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="Last name">
            <input
              type="text"
              required
              value={form.last_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="08012345678"
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="Department">
            <input
              type="text"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              placeholder="Engineering"
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="Campus">
            <select
              required
              value={form.campus}
              onChange={(e) =>
                setForm((f) => ({ ...f, campus: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            >
              <option value="kubwa">Kubwa</option>
              <option value="nyanya">Nyanya</option>
            </select>
          </Field>
        </div>

        {error && (
          <p
            className="text-[12.5px]"
            style={{ color: "var(--status-action-text)" }}
          >
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="text-[10.5px] font-semibold uppercase tracking-[0.1em] block mb-1.5"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface2)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  outline: "none",
};
