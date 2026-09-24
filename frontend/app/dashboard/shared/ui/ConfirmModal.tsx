import { AlertTriangle, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Modal } from "./Modal";

type ConfirmTone = "danger" | "neutral";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called when the user confirms. Should return a promise if async work is needed. */
  onConfirm: () => void | Promise<void>;
  title: string;
  /** Short description rendered under the title inside the body. */
  description?: ReactNode;
  /** Text on the confirm button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Text on the cancel button. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Visual tone. "danger" makes the confirm button red. */
  tone?: ConfirmTone;
  /** Optional busy state — disables buttons and shows "Working..." on confirm. */
  busy?: boolean;
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "neutral",
  busy = false,
}: ConfirmModalProps) {
  const Icon = tone === "danger" ? AlertTriangle : HelpCircle;
  const isDanger = tone === "danger";

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      breadcrumb="Confirm"
      icon={<Icon size={18} strokeWidth={1.75} />}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              opacity: busy ? 0.5 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: isDanger
                ? "var(--status-action-text)"
                : "var(--gold-500)",
              color: isDanger ? "#ffffff" : "var(--coal)",
              opacity: busy ? 0.6 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {description ? (
          typeof description === "string" ? (
            <p className="text-[14px]" style={{ color: "var(--text)" }}>
              {description}
            </p>
          ) : (
            description
          )
        ) : null}
      </div>
    </Modal>
  );
}
