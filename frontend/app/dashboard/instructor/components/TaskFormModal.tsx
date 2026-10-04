import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";

type TaskFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function TaskFormModal({ open, onClose, onSaved }: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      if (dueDate) formData.append("due_date", dueDate);
      if (files) {
        Array.from(files).forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const res = await fetch("http://localhost:8000/api/instructor/tasks/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error || data?.title?.[0] || "Failed to create task",
        );
      }
      setTitle("");
      setDescription("");
      setDueDate("");
      setFiles(null);
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
      title="New task"
      breadcrumb="Tasks"
      icon={<ListChecks size={18} strokeWidth={1.75} />}
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
            {saving ? "Creating..." : "Create task"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly progress summary"
            className="w-full h-10 px-3 rounded-xl text-[13px]"
            style={inputStyle}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What should the intern do?"
            className="w-full px-3 py-2 rounded-xl text-[13px] resize-none"
            style={inputStyle}
          />
        </Field>
        <Field label="Due date (optional)">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-[13px]"
            style={inputStyle}
          />
        </Field>
        <Field label="Attachments (optional)">
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full h-10 px-3 py-2 rounded-xl text-[13px] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[12px] file:font-semibold"
            style={{
              ...inputStyle,
              cursor: "pointer",
            }}
          />
          <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
            Upload reference materials (PDFs, images, documents).
          </p>
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
