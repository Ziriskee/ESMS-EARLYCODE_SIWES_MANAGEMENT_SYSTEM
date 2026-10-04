import { User } from "lucide-react";
import type { ReactNode } from "react";
import { Modal } from "../../shared/ui/Modal";
import { StatusChip } from "../../shared/data/StatusChip";
import type { AssignedInternDetail, InternReportEntry } from "../types";

type InternDetailModalProps = {
  open: boolean;
  onClose: () => void;
  detail: AssignedInternDetail | null;
  loading: boolean;
  error: string | null;
};

const DAY_LABELS: Record<string, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
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

function readable(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function statusChip(status: AssignedInternDetail["status"]) {
  switch (status) {
    case "ACTIVE":
      return { tone: "approved" as const, label: "Active" };
    case "COMPLETED":
      return { tone: "neutral" as const, label: "Completed" };
    case "PENDING":
    default:
      return { tone: "review" as const, label: "Pending" };
  }
}

function reportChip(status: InternReportEntry["status"]) {
  switch (status) {
    case "APPROVED":
      return { tone: "approved" as const, label: "Approved" };
    case "NEEDS_REVISION":
      return { tone: "action" as const, label: "Needs revision" };
    case "SUBMITTED":
      return { tone: "review" as const, label: "Submitted" };
    case "REVIEWED":
      return { tone: "neutral" as const, label: "Reviewed" };
    case "DRAFT":
    default:
      return { tone: "neutral" as const, label: "Draft" };
  }
}

export function InternDetailModal({
  open,
  onClose,
  detail,
  loading,
  error,
}: InternDetailModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        detail ? `${detail.user.first_name} ${detail.user.last_name}` : "Intern"
      }
      breadcrumb="My Intern"
      icon={<User size={18} strokeWidth={1.75} />}
      size="md"
      footer={
        <div className="flex items-center justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          >
            Close
          </button>
        </div>
      }
    >
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading intern...
        </p>
      )}
      {!loading && error && (
        <p
          className="text-[13px] py-6"
          style={{ color: "var(--status-action-text)" }}
        >
          {error}
        </p>
      )}
      {!loading && !error && detail && (
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip
              tone={statusChip(detail.status).tone}
              label={statusChip(detail.status).label}
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
              style={{ backgroundColor: "var(--tint)", color: "var(--muted)" }}
            >
              {detail.preferred_campus
                ? detail.preferred_campus.charAt(0).toUpperCase() +
                  detail.preferred_campus.slice(1)
                : "—"}
            </span>
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              {formatDate(detail.school_start_date)} –{" "}
              {formatDate(detail.school_end_date)}
            </span>
          </div>

          <Section label="Contact">
            <FieldGrid
              fields={[
                ["Email", readable(detail.user.email)],
                ["Phone", readable(detail.user.phone)],
              ]}
            />
          </Section>

          <Section label="Academic">
            <FieldGrid
              fields={[
                ["Institution", readable(detail.current_institution)],
                ["Course of study", readable(detail.course_of_study)],
                ["Current level", readable(detail.current_level)],
                ["Matric number", readable(detail.matric_number)],
              ]}
            />
          </Section>

          <Section label="Weekly schedule">
            {detail.schedules.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                No schedule assigned yet. The admin assigns on-site days.
              </p>
            ) : (
              <ul className="space-y-2">
                {detail.schedules.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 text-[13px]"
                  >
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {DAY_LABELS[s.day_of_week] ?? s.day_of_week}
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      {s.shift === "MORNING" ? "Morning" : "Afternoon"}
                    </span>
                    <span
                      className="tabular-nums"
                      style={{ color: "var(--text)" }}
                    >
                      {s.start_time} – {s.end_time}
                    </span>
                    {s.is_rotating && (
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                        style={{
                          backgroundColor: "var(--tint)",
                          color: "var(--muted)",
                        }}
                      >
                        Rotates
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section label="Reports">
            {detail.reports.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                No reports yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {detail.reports.map((r) => {
                  const chip = reportChip(r.status);
                  return (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p
                          className="truncate text-[13.5px] font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {r.title}
                        </p>
                        <p
                          className="text-[11.5px] mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {formatDate(r.submitted_at)}
                        </p>
                      </div>
                      <StatusChip tone={chip.tone} label={chip.label} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>
      )}
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--muted)" }}
        >
          {label}
        </span>
        <span
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--line)" }}
        />
      </div>
      {children}
    </section>
  );
}

function FieldGrid({ fields }: { fields: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {fields.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--muted)" }}
          >
            {label}
          </p>
          <p
            className="text-[13.5px] mt-1 break-words"
            style={{ color: "var(--text)" }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
