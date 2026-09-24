import { ChevronRight } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import type { PendingInternSummary } from "../types";

type PendingPreviewProps = {
  pending: PendingInternSummary[];
  onSelect: (intern: PendingInternSummary) => void;
};

function initials(first: string, last: string): string {
  return (
    (first?.[0] ?? "").toUpperCase() + (last?.[0] ?? "").toUpperCase()
  );
}

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function PendingPreview({ pending, onSelect }: PendingPreviewProps) {
  const shown = pending.slice(0, 3);

  return (
    <Card padding="lg">
      <SectionHeader
        title="Pending interns"
        subtitle="Awaiting review"
        action={{ label: "View all", to: "/dashboard/admin/pending" }}
      />

      {shown.length === 0 ? (
        <EmptyState
          title="No pending interns."
          description="New registrations will appear here."
        />
      ) : (
        <ul className="flex flex-col">
          {shown.map((intern, i) => {
            const initialsText = initials(
              intern.user.first_name,
              intern.user.last_name,
            );
            return (
              <li key={intern.id}>
                <button
                  type="button"
                  onClick={() => onSelect(intern)}
                  className="w-full flex items-center gap-3 py-3.5 -mx-2 px-2 rounded-xl text-left transition-colors hover:bg-[var(--tint)]"
                  style={{
                    borderTop:
                      i === 0 ? "none" : "1px solid var(--line)",
                  }}
                >
                  <span
                    className="h-9 w-9 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
                    style={{
                      backgroundColor: "var(--gold-500)",
                      color: "var(--coal)",
                    }}
                  >
                    {initialsText || "?"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[14px] font-semibold leading-snug truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {intern.user.first_name} {intern.user.last_name}
                    </p>
                    <p
                      className="text-[12px] mt-0.5 truncate"
                      style={{ color: "var(--muted)" }}
                    >
                      {intern.user.email}
                    </p>
                  </div>

                  <div className="hidden sm:flex flex-col items-end shrink-0 gap-1">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                      style={{
                        backgroundColor: "var(--tint)",
                        color: "var(--muted)",
                      }}
                    >
                      {formatCampus(intern.preferred_campus)}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--muted)" }}
                    >
                      {relativeTime(intern.created_at)}
                    </span>
                  </div>

                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    style={{ color: "var(--muted)", flexShrink: 0 }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}