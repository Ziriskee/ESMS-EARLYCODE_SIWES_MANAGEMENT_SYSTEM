import { useState } from "react";
import { PencilLine } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import type { InternSubmission } from "../types";
import { apiFetch } from "@/lib/api";

type EditSubmissionModalProps = {
  open: boolean;
  onClose: () => void;
  submission: InternSubmission | null;
  /** Called after a successful save so the parent can refetch. */
  onSaved: () => void;
};

type EditForm = {
  preferred_campus: string;
  school_start_date: string;
  school_end_date: string;
  internship_duration: string;
  other_duration: string;
  why_intern: string;
};

function initialFormFrom(sub: InternSubmission | null): EditForm {
  if (!sub) {
    return {
      preferred_campus: "kubwa",
      school_start_date: "",
      school_end_date: "",
      internship_duration: "",
      other_duration: "",
      why_intern: "",
    };
  }
  return {
    preferred_campus: sub.preferred_campus || "kubwa",
    school_start_date: sub.school_start_date ?? "",
    school_end_date: sub.school_end_date ?? "",
    internship_duration: sub.internship_duration ?? "",
    other_duration: sub.other_duration ?? "",
    why_intern: sub.why_intern ?? "",
  };
}

export function EditSubmissionModal({
  open,
  onClose,
  submission,
  onSaved,
}: EditSubmissionModalProps) {
  // Parent remounts this via key={submission.id}, so the initializer
  // always sees the correct submission.
  const [form, setForm] = useState<EditForm>(() => initialFormFrom(submission));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!submission) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`admin/interns/${submission.id}/submission/`, {
        method: "PATCH",
        body: JSON.stringify({
          preferred_campus: form.preferred_campus,
          school_start_date: form.school_start_date || null,
          school_end_date: form.school_end_date || null,
          internship_duration: form.internship_duration,
          other_duration: form.other_duration,
          why_intern: form.why_intern,
        }),
      });
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
      title={
        submission
          ? `Edit submission — ${submission.user.first_name} ${submission.user.last_name}`
          : "Edit submission"
      }
      breadcrumb="Edit"
      icon={<PencilLine size={18} strokeWidth={1.75} />}
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
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--gold-500)",
              color: "var(--coal)",
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
          Personal, academic and contact details are locked. Only the fields
          below can be corrected before acceptance.
        </p>

        <Field label="Campus">
          <select
            value={form.preferred_campus}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferred_campus: e.target.value }))
            }
            className="w-full h-10 px-3 rounded-xl text-[13px]"
            style={inputStyle}
          >
            <option value="kubwa">Kubwa</option>
            <option value="nyanya">Nyanya</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Start date">
            <input
              type="date"
              value={form.school_start_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, school_start_date: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={form.school_end_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, school_end_date: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Duration">
            <input
              type="text"
              value={form.internship_duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, internship_duration: e.target.value }))
              }
              placeholder="e.g. 6-months"
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="Other duration (if 'Other')">
            <input
              type="text"
              value={form.other_duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, other_duration: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Why they want to intern">
          <textarea
            value={form.why_intern}
            onChange={(e) =>
              setForm((f) => ({ ...f, why_intern: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 rounded-xl text-[13px] resize-none"
            style={inputStyle}
          />
        </Field>

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
