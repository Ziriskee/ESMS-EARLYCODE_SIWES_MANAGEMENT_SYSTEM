import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  breadcrumb?: string;
  meta?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Modal({
  open,
  onClose,
  title,
  breadcrumb,
  meta,
  icon,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="dashboard-root">
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
        style={{
          backgroundColor: "var(--modal-backdrop)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: "modal-backdrop-in 220ms ease-out forwards",
        }}
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full ${sizeMap[size]} max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden rounded-t-[20px] sm:rounded-[24px] border`}
          style={{
            backgroundColor: "var(--modal-bg)",
            borderColor: "var(--modal-border)",
            boxShadow: "0 50px 140px -30px rgba(0, 0, 0, 0.9)",
            animation:
              "modal-panel-in 300ms cubic-bezier(0.16, 0.84, 0.28, 1) forwards",
          }}
        >
          {/* Gold hairline at the top edge */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 h-[1px] z-10"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 214, 10, 0.6) 35%, rgba(255, 223, 61, 0.85) 50%, rgba(255, 214, 10, 0.6) 65%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          {/* Soft glow behind the header */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[70%] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255, 214, 10, 0.1), transparent 70%)",
            }}
            aria-hidden="true"
          />

          {/* Header */}
          <header
            className="relative shrink-0 flex items-start gap-4 px-5 py-5 sm:px-7 sm:py-6 border-b"
            style={{ borderColor: "var(--line)" }}
          >
            {icon && (
              <div
                className="shrink-0 grid place-items-center h-11 w-11 rounded-[12px] border"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255, 214, 10, 0.16), transparent)",
                  borderColor: "rgba(255, 214, 10, 0.25)",
                  color: "var(--gold-300)",
                }}
              >
                {icon}
              </div>
            )}

            <div className="min-w-0 flex-1">
              {breadcrumb && (
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: "var(--gold-500)" }}
                >
                  {breadcrumb}
                </p>
              )}

              <h2
                className="text-[18px] sm:text-[20px] font-semibold leading-snug truncate"
                style={{
                  color: "var(--text)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {title}
              </h2>

              {meta && (
                <p
                  className="text-[12.5px] mt-1"
                  style={{ color: "var(--muted)" }}
                >
                  {meta}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 h-9 w-9 rounded-[10px] border flex items-center justify-center transition-colors"
              style={{
                borderColor: "var(--line)",
                backgroundColor: "transparent",
                color: "var(--muted)",
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </header>

          {/* Body */}
          <div
            className="relative flex-1 overflow-y-auto px-5 py-6 sm:px-7"
            style={{ scrollbarWidth: "thin" }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <footer
              className="shrink-0 flex items-center justify-end gap-2 px-5 py-4 sm:px-7 border-t"
              style={{
                backgroundColor: "var(--surface2)",
                borderColor: "var(--line)",
              }}
            >
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
