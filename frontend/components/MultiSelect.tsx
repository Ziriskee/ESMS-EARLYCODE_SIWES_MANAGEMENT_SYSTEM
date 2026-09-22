import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type MultiSelectOption = {
  value: string;
  label: string;
  sublabel?: string;
  timeframe?: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
};

export default function MultiSelect({
  options,
  values,
  onChange,
  placeholder = "Select...",
  emptyMessage = "No options available.",
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open,close]);

  // Auto-focus the search input when the dropdown opens.
  useEffect(() => {
    if (open) {
      // Small delay so the element is mounted before focus.
      const t = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const haystack =
        `${o.label} ${o.sublabel ?? ""} ${o.timeframe ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [options, query]);

  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);

  const displayText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          if (open) close();
          else setOpen(true);
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border text-left transition-colors font-body ${
          open ? "border-ec-gold" : "border-white/10 hover:border-white/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`text-sm truncate ${
            selectedLabels.length === 0 ? "text-gray-500" : "text-white"
          }`}
        >
          {displayText}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#2A2A2B] shadow-2xl overflow-hidden"
        >
          {/* Search input — sticky at the top of the dropdown */}
          <div className="p-2 border-b border-white/10 bg-[#2A2A2B]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                autoComplete="off"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
              />
            </div>
          </div>

          {/* Options list */}
          {filteredOptions.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-500 font-body">
              {options.length === 0
                ? emptyMessage
                : `No matches for "${query}".`}
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {filteredOptions.map((option) => {
                const selected = values.includes(option.value);
                const hasMeta =
                  (option.sublabel && option.sublabel.length > 0) ||
                  (option.timeframe && option.timeframe.length > 0);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => toggle(option.value)}
                      role="option"
                      aria-selected={selected}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <span
                        className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          selected
                            ? "bg-ec-gold border-ec-gold"
                            : "border-white/30"
                        }`}
                      >
                        {selected && (
                          <Check
                            size={11}
                            strokeWidth={3}
                            className="text-ec-dark"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-white font-body truncate">
                          {option.label}
                        </span>
                        {hasMeta && (
                          <span className="block text-xs text-gray-500 font-body truncate">
                            {option.sublabel}
                            {option.sublabel && option.timeframe ? "  |  " : ""}
                            {option.timeframe}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
