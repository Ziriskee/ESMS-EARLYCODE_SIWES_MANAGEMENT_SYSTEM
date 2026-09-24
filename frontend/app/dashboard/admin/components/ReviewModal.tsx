import { useState, type ReactNode } from "react";
import { AlertTriangle, User } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { StatusChip } from "../../shared/data/StatusChip";
import type { InternSubmission } from "../types";

type ReviewModalProps = {
  open: boolean;
  onClose: () => void;
  submission: InternSubmission | null;
  loading: boolean;
  error: string | null;
  onRejected: () => void;
  /** Opens the Accept/Configure wizard. Label depends on status. */
  onAccept: (submission: InternSubmission) => void;
  /** Opens the edit modal. Only offered for PENDING submissions. */
  onEdit?: () => void;
};

function formatDate(iso: string | null | undefined): string {
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

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
}

function statusChip(status: InternSubmission["status"]) {
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

export function ReviewModal({
  open,
  onClose,
  submission,
  loading,
  error,
  onRejected,
  onAccept,
  onEdit,
}: ReviewModalProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleClose = () => {
    // Reset reject sub-state before closing so the modal
    // is clean on the next open.
    setRejectOpen(false);
    setRejecting(false);
    setRejectError(null);
    setRejectReason("");
    onClose();
  };

  const handleRejectConfirm = async () => {
    if (!submission) return;
    const reason = rejectReason.trim();
    if (reason.length < 10) {
      setRejectError("Please provide a reason of at least 10 characters.");
      return;
    }
    setRejecting(true);
    setRejectError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/interns/${submission.id}/reject/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to reject");
      }
      onRejected();
      handleClose();
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setRejecting(false);
    }
  };

  const isPending = submission?.status === "PENDING";
  const isActive = submission?.status === "ACTIVE";

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={
          submission
            ? `${submission.user.first_name} ${submission.user.last_name}`
            : "Review Intern"
        }
        breadcrumb={isPending ? "Review" : "Intern"}
        icon={<User size={18} strokeWidth={1.75} />}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full gap-3">
            {isPending ? (
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={!submission || loading}
                className="h-9 px-4 rounded-full text-[13px] font-semibold transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--status-action-text)",
                  border: "1px solid var(--status-action-bg)",
                  opacity: submission && !loading ? 1 : 0.5,
                  cursor: submission && !loading ? "pointer" : "not-allowed",
                }}
              >
                Reject
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {isPending && onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  disabled={!submission || loading}
                  className="h-9 px-4 rounded-full text-[13px] font-semibold transition-colors"
                  style={{
                    backgroundColor: "var(--surface2)",
                    color: "var(--text)",
                    border: "1px solid var(--line)",
                    opacity: submission && !loading ? 1 : 0.5,
                    cursor: submission && !loading ? "pointer" : "not-allowed",
                  }}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--surface2)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                }}
              >
                Close
              </button>
              {isPending && (
                <button
                  type="button"
                  onClick={() => submission && onAccept(submission)}
                  disabled={!submission || loading}
                  className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
                  style={{
                    backgroundColor: "var(--gold-500)",
                    color: "var(--coal)",
                    opacity: submission && !loading ? 1 : 0.5,
                    cursor: submission && !loading ? "pointer" : "not-allowed",
                  }}
                >
                  Accept
                </button>
              )}
              {isActive && (
                <button
                  type="button"
                  onClick={() => submission && onAccept(submission)}
                  disabled={!submission || loading}
                  className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
                  style={{
                    backgroundColor: "var(--gold-500)",
                    color: "var(--coal)",
                    opacity: submission && !loading ? 1 : 0.5,
                    cursor: submission && !loading ? "pointer" : "not-allowed",
                  }}
                >
                  Configure
                </button>
              )}
            </div>
          </div>
        }
      >
        {loading && (
          <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
            Loading submission...
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
        {!loading && !error && submission && (
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-3">
              <StatusChip
                tone={statusChip(submission.status).tone}
                label={statusChip(submission.status).label}
              />
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                Submitted {formatDate(submission.created_at)}
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                style={{
                  backgroundColor: "var(--tint)",
                  color: "var(--muted)",
                }}
              >
                {formatCampus(submission.preferred_campus)}
              </span>
            </div>

            <Section label="Identity">
              <FieldGrid
                fields={[
                  ["First name", readable(submission.user.first_name)],
                  ["Last name", readable(submission.user.last_name)],
                  ["Email", readable(submission.user.email)],
                  ["Phone", readable(submission.user.phone)],
                  ["Gender", readable(submission.user.gender)],
                  ["State of origin", readable(submission.state_of_origin)],
                ]}
              />
              <FieldFull
                label="Address"
                value={readable(submission.user.address)}
              />
            </Section>

            <Section label="Academic">
              <FieldGrid
                fields={[
                  ["Institution", readable(submission.current_institution)],
                  ["Course of study", readable(submission.course_of_study)],
                  ["Current level", readable(submission.current_level)],
                  ["Matric number", readable(submission.matric_number)],
                ]}
              />
              <FieldFull
                label="Institution address"
                value={readable(submission.institution_address)}
              />
            </Section>

            <Section label="Placement">
              <FieldGrid
                fields={[
                  ["Campus", formatCampus(submission.preferred_campus)],
                  ["Start date", formatDate(submission.school_start_date)],
                  ["End date", formatDate(submission.school_end_date)],
                  [
                    "Duration",
                    readable(
                      submission.internship_duration === "other"
                        ? submission.other_duration
                        : submission.internship_duration,
                    ),
                  ],
                ]}
              />
            </Section>

            <Section label="Courses">
              {submission.courses.length === 0 ? (
                <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                  No courses selected.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {submission.courses.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
                      style={{
                        backgroundColor: "var(--surface2)",
                        color: "var(--text)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <span className="font-semibold">{c.course_name}</span>
                      {c.course_code && (
                        <span
                          className="text-[10px] uppercase tracking-[0.1em]"
                          style={{ color: "var(--muted)" }}
                        >
                          {c.course_code}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            <Section label="Narrative">
              <FieldFull
                label="Why they want to intern"
                value={readable(submission.why_intern)}
              />
              <FieldGrid
                fields={[
                  [
                    "Emergency contact",
                    readable(submission.emergency_contact_type),
                  ],
                  ["Emergency phone", readable(submission.emergency_phone)],
                ]}
              />
              <FieldFull
                label="Declaration"
                value={readable(submission.declaration)}
              />
            </Section>
          </div>
        )}
      </Modal>

      {/* Reject confirmation — reason is required and emailed to the intern */}
      <Modal
        open={rejectOpen}
        onClose={() => !rejecting && setRejectOpen(false)}
        title={
          submission
            ? `Reject ${submission.user.first_name} ${submission.user.last_name}?`
            : "Reject?"
        }
        breadcrumb="Confirm"
        icon={<AlertTriangle size={18} strokeWidth={1.75} />}
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              disabled={rejecting}
              className="h-9 px-5 rounded-full text-[13px] font-semibold"
              style={{
                backgroundColor: "var(--surface2)",
                color: "var(--text)",
                border: "1px solid var(--line)",
                opacity: rejecting ? 0.5 : 1,
                cursor: rejecting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectConfirm}
              disabled={rejecting}
              className="h-9 px-5 rounded-full text-[13px] font-semibold"
              style={{
                backgroundColor: "var(--status-action-text)",
                color: "#ffffff",
                opacity: rejecting ? 0.6 : 1,
                cursor: rejecting ? "not-allowed" : "pointer",
              }}
            >
              {rejecting ? "Rejecting..." : "Reject"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label
              className="text-[10.5px] font-semibold uppercase tracking-[0.1em] block mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Reason for rejection (sent to the intern)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Course payment has not been confirmed..."
              className="w-full px-3 py-2 rounded-xl text-[13px] resize-none"
              style={{
                backgroundColor: "var(--surface2)",
                color: "var(--text)",
                border: "1px solid var(--line)",
                outline: "none",
              }}
            />
            <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              Minimum 10 characters. This text is included in the rejection
              email.
            </p>
          </div>
          <p className="text-[14px]" style={{ color: "var(--text)" }}>
            This will disable the intern's account. They will not be able to log
            in. Their data will be kept for record-keeping.
          </p>
          {rejectError && (
            <p
              className="text-[13px]"
              style={{ color: "var(--status-action-text)" }}
            >
              {rejectError}
            </p>
          )}
        </div>
      </Modal>
    </>
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

function FieldFull({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p
        className="text-[10.5px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </p>
      <p
        className="text-[13.5px] mt-1 whitespace-pre-wrap wrap-break-word leading-relaxed"
        style={{ color: "var(--text)" }}
      >
        {value}
      </p>
    </div>
  );
}
