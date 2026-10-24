import { useState } from "react";
import { UserCog } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import type { InstructorOwnProfile } from "../types";
import { apiFetch } from "@/lib/api";

type ProfileEditModalProps = {
  open: boolean;
  onClose: () => void;
  profile: InstructorOwnProfile | null;
  onSaved: () => void;
};

export function ProfileEditModal({
  open,
  onClose,
  profile,
  onSaved,
}: ProfileEditModalProps) {
  // Parent remounts via key on every open, so initializers are fresh.
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("instructor/profile/", {
        method: "PATCH",
        body: JSON.stringify({
          phone: phone.trim(),
          department: department.trim(),
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
      title="Edit profile"
      breadcrumb="Profile"
      icon={<UserCog size={18} strokeWidth={1.75} />}
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
          Your name and email are locked. Contact the admin if they need to
          change.
        </p>
        <Field label="Phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            className="w-full h-10 px-3 rounded-xl text-[13px]"
            style={inputStyle}
          />
        </Field>
        <Field label="Department">
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Frontend"
            className="w-full h-10 px-3 rounded-xl text-[13px]"
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
