import { StatusChip } from "../../shared/data/StatusChip";
import { Button } from "../../shared/ui/Button";

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
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] font-semibold leading-snug truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </p>
        <p
          className="text-[13px] mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {formatDate(submittedAt)}
        </p>
      </div>

      <div className="shrink-0 hidden sm:block">
        <StatusChip tone={chipTone} label={chipLabel} />
      </div>

      <Button variant="secondary" size="sm" onClick={onOpen}>
        Open
      </Button>
    </div>
  );
}
