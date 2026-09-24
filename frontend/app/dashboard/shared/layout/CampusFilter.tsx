import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useCampusFilter } from "../../../../contexts/useCampusFilter";
import type { CampusValue } from "../../../../contexts/CampusFilterContext";

const OPTIONS: { value: CampusValue; label: string }[] = [
  { value: "kubwa", label: "Kubwa" },
  { value: "nyanya", label: "Nyanya" },
  { value: "all", label: "All campuses" },
];

export function CampusFilter() {
  const { campus, setCampus } = useCampusFilter();
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

  const currentLabel =
    OPTIONS.find((o) => o.value === campus)?.label ?? "All campuses";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-10 rounded-full border inline-flex items-center gap-2 pl-3 pr-3 text-[13px] font-medium transition-colors"
        style={{
          borderColor: "var(--line)",
          backgroundColor: "var(--surface)",
          color: "var(--text)",
        }}
      >
        <MapPin size={14} strokeWidth={1.8} style={{ color: "var(--muted)" }} />
        <span className="truncate max-w-[100px]">{currentLabel}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          style={{
            color: "var(--muted)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms ease",
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-2xl border overflow-hidden z-50"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--surface)",
            boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.5)",
          }}
        >
          <ul className="py-1">
            {OPTIONS.map((opt) => {
              const active = opt.value === campus;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setCampus(opt.value);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={active}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left transition-colors"
                    style={{
                      color: active ? "var(--text)" : "var(--muted)",
                      fontWeight: active ? 600 : 500,
                      backgroundColor: active
                        ? "var(--surface2)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "var(--tint)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
