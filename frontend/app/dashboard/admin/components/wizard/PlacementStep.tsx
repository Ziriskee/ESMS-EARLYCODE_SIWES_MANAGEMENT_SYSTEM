import { X } from "lucide-react";
import type { ScheduleEntry } from "../../types";

type PlacementStepProps = {
  schoolStartDate: string;
  schoolEndDate: string;
  schedules: ScheduleEntry[];
  isRotating: boolean;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onSchedulesChange: (next: ScheduleEntry[]) => void;
  onRotatingChange: (v: boolean) => void;
};

const DAYS: ScheduleEntry["day_of_week"][] = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

const DAY_LABELS: Record<ScheduleEntry["day_of_week"], string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

function addSchedule(
  existing: ScheduleEntry[],
  day: ScheduleEntry["day_of_week"],
  shift: ScheduleEntry["shift"],
): ScheduleEntry[] {
  const exists = existing.some(
    (s) => s.day_of_week === day && s.shift === shift,
  );
  if (exists) return existing;
  return [...existing, { day_of_week: day, shift }];
}

function removeSchedule(
  existing: ScheduleEntry[],
  day: ScheduleEntry["day_of_week"],
  shift: ScheduleEntry["shift"],
): ScheduleEntry[] {
  return existing.filter((s) => !(s.day_of_week === day && s.shift === shift));
}

function isSelected(
  schedules: ScheduleEntry[],
  day: ScheduleEntry["day_of_week"],
  shift: ScheduleEntry["shift"],
): boolean {
  return schedules.some((s) => s.day_of_week === day && s.shift === shift);
}

export function PlacementStep({
  schoolStartDate,
  schoolEndDate,
  schedules,
  isRotating,
  onStartDateChange,
  onEndDateChange,
  onSchedulesChange,
  onRotatingChange,
}: PlacementStepProps) {
  return (
    <div className="space-y-7">
      <div>
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-3"
          style={{ color: "var(--muted)" }}
        >
          Placement dates
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Start date">
            <input
              type="date"
              value={schoolStartDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={schoolEndDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-[13px]"
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      <div>
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-3"
          style={{ color: "var(--muted)" }}
        >
          Weekly on-site days
        </p>
        <p className="text-[12px] mb-3" style={{ color: "var(--muted)" }}>
          Pick the day and shift for each weekly visit. Add as many as apply.
        </p>

        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--surface2)",
          }}
        >
          {/* Existing schedule rows */}
          {schedules.length === 0 ? (
            <p
              className="text-[13px] italic mb-3"
              style={{ color: "var(--muted)" }}
            >
              No days selected yet.
            </p>
          ) : (
            <ul className="space-y-2 mb-3">
              {schedules.map((s) => (
                <li
                  key={`${s.day_of_week}-${s.shift}`}
                  className="flex items-center gap-2"
                >
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span className="font-semibold">
                      {DAY_LABELS[s.day_of_week]}
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      · {s.shift === "MORNING" ? "Morning" : "Afternoon"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onSchedulesChange(
                        removeSchedule(schedules, s.day_of_week, s.shift),
                      )
                    }
                    className="h-7 w-7 rounded-full grid place-items-center"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--line)",
                      color: "var(--muted)",
                    }}
                    aria-label={`Remove ${DAY_LABELS[s.day_of_week]} ${s.shift}`}
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add rows */}
          <div
            className="space-y-2 pt-3 border-t"
            style={{ borderColor: "var(--line)" }}
          >
            {(["MORNING", "AFTERNOON"] as const).map((shift) => (
              <div key={shift} className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-[0.14em] w-20"
                  style={{ color: "var(--muted)" }}
                >
                  {shift === "MORNING" ? "Morning" : "Afternoon"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((day) => {
                    const selected = isSelected(schedules, day, shift);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            onSchedulesChange(
                              removeSchedule(schedules, day, shift),
                            );
                          } else {
                            onSchedulesChange(
                              addSchedule(schedules, day, shift),
                            );
                          }
                        }}
                        className="h-7 px-2.5 rounded-full text-[11.5px] font-semibold transition-colors"
                        style={{
                          backgroundColor: selected
                            ? "var(--gold-500)"
                            : "var(--surface)",
                          color: selected ? "var(--coal)" : "var(--muted)",
                          border: selected
                            ? "1px solid var(--gold-500)"
                            : "1px solid var(--line)",
                        }}
                        title={
                          selected
                            ? `Remove ${DAY_LABELS[day]} ${shift}`
                            : `Add ${DAY_LABELS[day]} ${shift}`
                        }
                      >
                        {DAY_LABELS[day]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-3"
          style={{ color: "var(--muted)" }}
        >
          Rotation
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isRotating}
            onChange={(e) => onRotatingChange(e.target.checked)}
            className="accent-[var(--gold-500)] w-4 h-4"
          />
          <span className="text-[13px]" style={{ color: "var(--text)" }}>
            Flip between morning and afternoon every week
          </span>
        </label>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="text-[10.5px] font-semibold uppercase tracking-[0.1em] block mb-1.5"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface2)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  outline: "none",
};
