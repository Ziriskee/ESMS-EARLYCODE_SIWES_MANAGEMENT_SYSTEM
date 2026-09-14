import { FileText } from "lucide-react";
import type { ReactNode } from "react";
import { Modal } from "../../shared/ui/Modal";
import { StatusChip } from "../../shared/data/StatusChip";
import type { Report, ReportStatus } from "../hooks/useReports";

type ReportDetailModalProps = {
  open: boolean;
  onClose: () => void;
  report: Report | null;
};

type ChipTone = "approved" | "review" | "action" | "neutral";

function chipFor(status: ReportStatus): {
  tone: ChipTone;
  label: string;
} {
  switch (status) {
    case "REVIEWED":
      return { tone: "approved", label: "Reviewed" };
    case "SUBMITTED":
      return { tone: "review", label: "Submitted" };
    case "DRAFT":
      return { tone: "neutral", label: "Draft" };
  }
}

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

export function ReportDetailModal({
  open,
  onClose,
  report,
}: ReportDetailModalProps) {
  if (!report) return null;

  const chip = chipFor(report.status);
  const isDraft = report.status === "DRAFT";
  const hasFeedback =
    report.status === "REVIEWED" &&
    report.instructor_feedback &&
    report.instructor_feedback.trim().length > 0;

  const meta = (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span>{formatDate(report.submitted_at)}</span>
      <span style={{ color: "var(--modal-section-label)" }}>•</span>
      <StatusChip tone={chip.tone} label={chip.label} />
    </span>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={report.title}
      breadcrumb="Report"
      meta={meta}
      icon={<FileText size={18} strokeWidth={1.75} />}
      size="lg"
      footer={
        <div className="flex items-center justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: "var(--bg-card-elevated)",
              color: "var(--text-primary)",
            }}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-7">
        {isDraft && (
          <p
            className="text-[12px] italic"
            style={{ color: "var(--text-secondary)" }}
          >
            This report is a draft. It has not been submitted to your instructor
            yet.
          </p>
        )}

        <Section label="Content">
          <div
            className="rounded-[10px] p-4"
            style={{ backgroundColor: "var(--bg-card-elevated)" }}
          >
            <p
              className="text-[13.5px] whitespace-pre-wrap leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {report.content}
            </p>
          </div>
        </Section>

        {hasFeedback && (
          <Section label="Instructor feedback">
            <div
              className="rounded-[10px] p-4"
              style={{ backgroundColor: "var(--status-approved-bg)" }}
            >
              <p
                className="text-[13.5px] whitespace-pre-wrap leading-relaxed"
                style={{ color: "var(--status-approved-text)" }}
              >
                {report.instructor_feedback}
              </p>
            </div>
          </Section>
        )}
      </div>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--modal-section-label)" }}
        >
          {label}
        </span>
        <span
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--modal-section-hairline)" }}
        />
      </div>
      {children}
    </section>
  );
}
