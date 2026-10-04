import { useState } from "react";
import { UserCog } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";

type AdminProfileEditModalProps = {
  open: boolean;
  onClose: () => void;
  initialPhone: string;
  initialCampus: string;
  onSaved: () => void;
};

export function AdminProfileEditModal({
  open,
  onClose,
  initialPhone,
  initialCampus,
  onSaved,
}: AdminProfileEditModalProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [campus, setCampus] = useState(initialCampus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/admin/profile/", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          campus: campus.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save your profile");
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
            className="h-9 px-5 rounded-full text-[13px] font-semibold whitespace-nowrap"
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
            className="h-9 px-5 rounded-full text-[13px] font-semibold whitespace-nowrap"
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
          Your name and email are locked to the account record.
        </p>
        <div>
          <label
            className="text-[10.5px] font-semibold uppercase tracking-[0.1em] block mb-1.5"
            style={{ color: "var(--muted)" }}
          >
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            className="w-full h-10 px-3 rounded-xl text-[13px]"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="text-[10.5px] font-semibold uppercase tracking-[0.1em] block mb-1.5"
            style={{ color: "var(--muted)" }}
          >
            Campus
          </label>
          <input
            type="text"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            placeholder="e.g. abuja"
            className="w-full h-10 px-3 rounded-xl text-[13px]"
            style={inputStyle}
          />
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

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface2)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  outline: "none",
};
