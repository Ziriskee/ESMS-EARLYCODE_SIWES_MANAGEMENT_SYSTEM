import { CalendarDays } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { EmptyState } from "../../shared/ui/EmptyState";
import type { UpcomingDay } from "../types";

type ScheduleModalProps = {
  open: boolean;
  onClose: () => void;
  days: UpcomingDay[];
  hasSchedule: boolean;
};

function formatDayLong(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function formatShift(shift: "MORNING" | "AFTERNOON"): string {
  return shift === "MORNING" ? "Morning" : "Afternoon";
}

function isToday(iso: string): boolean {
  try {
    const d = new Date(iso);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

export function ScheduleModal({
  open,
  onClose,
  days,
  hasSchedule,
}: ScheduleModalProps) {
  const isEmpty = !hasSchedule || days.length === 0;

  const meta = isEmpty
    ? undefined
    : `${days.length} upcoming day${days.length === 1 ? "" : "s"}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upcoming on-site days"
      breadcrumb="Schedule"
      meta={meta}
      icon={<CalendarDays size={18} strokeWidth={1.75} />}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <span
            className="text-[11.5px]"
            style={{ color: "var(--modal-header-muted)" }}
          >
            {isEmpty
              ? ""
              : `Showing ${days.length} upcoming day${days.length === 1 ? "" : "s"}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full text-[13px] hover:font-bold font-semibold transition-colors"
            style={{
              backgroundColor: "var(--bg-card-elevated)",
              color: "var(--text-primary)",
            }}
          >
            Done
          </button>
        </div>
      }
    >
      {isEmpty ? (
        <EmptyState
          title="No upcoming on-site days scheduled."
          description="Your admin will assign a schedule soon."
        />
      ) : (
        <div className="w-full">
          {/* Column headers */}
          <div
            className="grid grid-cols-[1.1fr_0.9fr_1fr] gap-4 pl-1 pb-3 mb-1 border-b"
            style={{ borderColor: "var(--modal-section-hairline)" }}
          >
            <ColumnLabel>Date</ColumnLabel>
            <ColumnLabel>Shift</ColumnLabel>
            <ColumnLabel>Timeframe</ColumnLabel>
          </div>

          {/* Rows */}
          <ul className="flex flex-col ">
            {days.map((day, i) => {
              const today = isToday(day.date);
              return (
                <li
                  key={`${day.date}-${i}`}
                  className="grid grid-cols-[1.1fr_0.9fr_1fr] gap-4 items-center px-1 py-3.5 rounded-[8px] transition-colors"
                  style={{
                    borderTop:
                      i === 0
                        ? "none"
                        : "1px solid var(--modal-section-hairline)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-card-elevated)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-[13.5px] font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatDayLong(day.date)}
                    </span>
                    {today && (
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-[2px] rounded-full shrink-0"
                        style={{
                          backgroundColor: "var(--gold)",
                          color: "var(--text-on-gold)",
                        }}
                      >
                        Today
                      </span>
                    )}
                  </div>

                  <div
                    className="text-[13px] truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatShift(day.shift)}
                  </div>

                  <div
                    className="text-[13px] tabular-nums truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {day.start_time} – {day.end_time}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Modal>
  );
}

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
      style={{ color: "var(--modal-section-label)" }}
    >
      {children}
    </span>
  );
}
