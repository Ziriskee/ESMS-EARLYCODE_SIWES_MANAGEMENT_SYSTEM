import { FileText, Upload, X } from "lucide-react";

type DocumentsStepProps = {
  codeOfConduct: File | null;
  acceptanceLetter: File | null;
  onCodeOfConductChange: (f: File | null) => void;
  onAcceptanceLetterChange: (f: File | null) => void;
};

function FileSlot({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--surface2)",
      }}
    >
      <p
        className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-3"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </p>

      {file ? (
        <div className="flex items-center gap-3">
          <FileText
            size={16}
            strokeWidth={1.8}
            style={{ color: "var(--gold-700)" }}
          />
          <span
            className="text-[13px] truncate min-w-0 flex-1"
            style={{ color: "var(--text)" }}
          >
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="h-7 w-7 rounded-full grid place-items-center shrink-0"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--line)",
              color: "var(--muted)",
            }}
            aria-label={`Remove ${label}`}
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <label
          className="flex items-center justify-center gap-2 h-20 rounded-xl border-dashed border-2 cursor-pointer transition-colors"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--surface)",
          }}
        >
          <Upload size={14} strokeWidth={2} style={{ color: "var(--muted)" }} />
          <span className="text-[13px]" style={{ color: "var(--muted)" }}>
            Click to select a PDF
          </span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onChange(f);
            }}
          />
        </label>
      )}
    </div>
  );
}

export function DocumentsStep({
  codeOfConduct,
  acceptanceLetter,
  onCodeOfConductChange,
  onAcceptanceLetterChange,
}: DocumentsStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
        Optional. You can upload one, both, or neither — the intern will be
        accepted either way. If you skip, you can upload later from the intern's
        profile.
      </p>

      <FileSlot
        label="Code of Conduct"
        file={codeOfConduct}
        onChange={onCodeOfConductChange}
      />

      <FileSlot
        label="Acceptance Letter"
        file={acceptanceLetter}
        onChange={onAcceptanceLetterChange}
      />
    </div>
  );
}
