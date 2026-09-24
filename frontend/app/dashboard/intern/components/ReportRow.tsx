import { StatusChip } from "../../shared/data/StatusChip";

type ReportRowProps = {
  title: string;
  submittedAt: string;
  status: "SUBMITTED" | "REVIEWED";
  onOpen: () => void;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function ReportRow({
  title,
  submittedAt,
  status,
  onOpen,
}: ReportRowProps) {
  const chipTone = status === "REVIEWED" ? "approved" : "review";
  const chipLabel = status === "REVIEWED" ? "Reviewed" : "Submitted";

  return (
    <div className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-[var(--tint)]">
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] font-semibold leading-snug truncate"
          style={{ color: "var(--text)" }}
        >
          {title}
        </p>
        <p className="text-[12.5px] mt-1" style={{ color: "var(--muted)" }}>
          {formatDate(submittedAt)}
        </p>
      </div>

      <div className="shrink-0 hidden sm:block">
        <StatusChip tone={chipTone} label={chipLabel} />
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
        style={{
          backgroundColor: "var(--surface2)",
          color: "var(--text)",
          border: "1px solid var(--line)",
        }}
      >
        Open
      </button>
    </div>
  );
}
