import { useEffect, useRef, useState } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";

export type ActionMenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

type ActionMenuProps = {
  items: ActionMenuItem[];
};

export function ActionMenu({ items }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-7 px-2 rounded-full inline-flex items-center gap-0.5 transition-colors"
        style={{
          backgroundColor: open ? "var(--surface2)" : "transparent",
          border: "1px solid var(--line)",
          color: "var(--muted)",
        }}
        aria-label="Actions"
      >
        <MoreHorizontal size={14} strokeWidth={2} />
        <ChevronDown
          size={10}
          strokeWidth={2.5}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms ease",
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] min-w-[160px] rounded-2xl border overflow-hidden z-50"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--surface)",
            boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.5)",
          }}
        >
          <ul className="py-1">
            {items.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    setOpen(false);
                    item.onClick();
                  }}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors"
                  style={{
                    color: item.disabled
                      ? "var(--muted)"
                      : item.danger
                        ? "var(--status-action-text)"
                        : "var(--text)",
                    opacity: item.disabled ? 0.5 : 1,
                    cursor: item.disabled ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.backgroundColor = "var(--surface2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}