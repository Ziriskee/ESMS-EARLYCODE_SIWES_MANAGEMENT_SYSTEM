import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Modal } from "../../../shared/ui/Modal";
import { WizardStepper } from "./WizardStepper";
import { PlacementStep } from "./PlacementStep";
import { DocumentsStep } from "./DocumentsStep";
import type { InternSubmission, ScheduleEntry } from "../../types";
import { InstructorStep } from "./InstructorStep";
import { ApiError, apiFetch } from "@/lib/api";

type AcceptWizardProps = {
  open: boolean;
  onClose: () => void;
  submission: InternSubmission | null;
  /** Called after a successful accept + optional uploads. */
  onCompleted: () => void;
};

const STEPS = [
  { key: "review", label: "Review" },
  { key: "placement", label: "Placement" },
  { key: "instructor", label: "Instructor" },
  { key: "documents", label: "Documents" },
];

export function AcceptWizard({
  open,
  onClose,
  submission,
  onCompleted,
}: AcceptWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);

  // ---- Form state ----
  // NOTE: These initializers only run on mount. The parent MUST pass a
  // `key={submission?.id}` so a fresh instance mounts when the submission
  // arrives. Without the key, these values never re-derive.
  const [startDate, setStartDate] = useState(
    submission?.school_start_date ?? "",
  );
  const [endDate, setEndDate] = useState(submission?.school_end_date ?? "");
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(
    (submission?.schedules ?? []).map((s) => ({
      day_of_week: s.day_of_week,
      shift: s.shift,
    })),
  );
  const [isRotating, setIsRotating] = useState(true);
  const [instructorId, setInstructorId] = useState(
    submission?.assigned_instructor?.id ?? "",
  );
  const [codeOfConduct, setCodeOfConduct] = useState<File | null>(null);
  const [acceptanceLetter, setAcceptanceLetter] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reachableIndexes = Array.from({ length: stepIndex + 1 }, (_, i) => i);

  const resetAll = () => {
    setStepIndex(0);
    setStartDate(submission?.school_start_date ?? "");
    setEndDate(submission?.school_end_date ?? "");
    setSchedules(
      (submission?.schedules ?? []).map((s) => ({
        day_of_week: s.day_of_week,
        shift: s.shift,
      })),
    );
    setIsRotating(true);
    setInstructorId(submission?.assigned_instructor?.id ?? "");
    setCodeOfConduct(null);
    setAcceptanceLetter(null);
    setSubmitError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetAll();
    onClose();
  };

  const canGoNext = (): boolean => {
    if (stepIndex === 1) {
      if (!startDate || !endDate) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!submission) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Accept — flips status to ACTIVE.
      try {
        await apiFetch(`admin/interns/${submission.id}/accept/`, {
          method: "POST",
        });
      } catch (err) {
        // Treat "already active" as a non-fatal condition.
        const alreadyActive =
          err instanceof ApiError &&
          err.status === 400 &&
          err.message.toLowerCase().includes("already active");
        if (!alreadyActive) throw err;
      }

      // 2. Configure — dates, schedule, instructor.
      const configPayload: Record<string, unknown> = {
        schedule: schedules,
        is_rotating: isRotating,
      };
      if (startDate) configPayload.school_start_date = startDate;
      if (endDate) configPayload.school_end_date = endDate;
      const UUID_RE =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (instructorId && UUID_RE.test(instructorId)) {
        configPayload.instructor_id = instructorId;
      }

      await apiFetch(`admin/interns/${submission.id}/configure/`, {
        method: "POST",
        body: JSON.stringify(configPayload),
      });

      // 3. Documents — only if any file was provided.
      if (codeOfConduct || acceptanceLetter) {
        const formData = new FormData();
        if (codeOfConduct) {
          formData.append("code_of_conduct", codeOfConduct);
        }
        if (acceptanceLetter) {
          formData.append("acceptance_letter", acceptanceLetter);
        }

        await apiFetch(`admin/interns/${submission.id}/documents/`, {
          method: "POST",
          body: formData,
        });
      }

      // ✅ AUTO-GENERATE MISSING DOCUMENTS (fail silently)
      await apiFetch(`admin/interns/${submission.id}/documents/generate/`, {
        method: "POST",
        body: JSON.stringify({ only_missing: true }),
      }).catch(() => null);

      // Success: notify parent + close directly (not via handleClose,
      // which would no-op while `submitting` is still true).
      onCompleted();
      resetAll();
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!submission) return null;

  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Accept ${submission.user.first_name} ${submission.user.last_name}`}
      breadcrumb="Accept"
      icon={<UserPlus size={18} strokeWidth={1.75} />}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
              disabled={stepIndex === 0 || submitting}
              className="h-9 px-4 rounded-full text-[13px] font-semibold"
              style={{
                backgroundColor: "var(--surface2)",
                color: "var(--text)",
                border: "1px solid var(--line)",
                opacity: stepIndex === 0 ? 0.4 : 1,
                cursor:
                  stepIndex === 0 || submitting ? "not-allowed" : "pointer",
              }}
            >
              Back
            </button>
            <span
              className="text-[11.5px] hidden sm:inline"
              style={{ color: "var(--muted)" }}
            >
              Step {stepIndex + 1} of {STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="h-9 px-5 rounded-full text-[13px] font-semibold"
              style={{
                backgroundColor: "transparent",
                color: "var(--text)",
                border: "1px solid var(--line)",
                opacity: submitting ? 0.5 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={() =>
                  setStepIndex((s) => Math.min(STEPS.length - 1, s + 1))
                }
                disabled={!canGoNext()}
                className="h-9 px-5 rounded-full text-[13px] font-semibold"
                style={{
                  backgroundColor: "var(--gold-500)",
                  color: "var(--coal)",
                  opacity: canGoNext() ? 1 : 0.5,
                  cursor: canGoNext() ? "pointer" : "not-allowed",
                }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="h-9 px-5 rounded-full text-[13px] font-semibold"
                style={{
                  backgroundColor: "var(--gold-500)",
                  color: "var(--coal)",
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Saving..." : "Complete & Send"}
              </button>
            )}
          </div>
        </div>
      }
    >
      <WizardStepper
        steps={STEPS}
        currentIndex={stepIndex}
        reachableIndexes={reachableIndexes}
        onJump={(i) => setStepIndex(i)}
      />

      {stepIndex === 0 && (
        <div className="space-y-4">
          <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
            Review the submission one more time, then continue to configure the
            intern's placement.
          </p>
          <ReviewSummary submission={submission} />
        </div>
      )}

      {stepIndex === 1 && (
        <PlacementStep
          schoolStartDate={startDate}
          schoolEndDate={endDate}
          schedules={schedules}
          isRotating={isRotating}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSchedulesChange={setSchedules}
          onRotatingChange={setIsRotating}
        />
      )}

      {stepIndex === 2 && (
        <InstructorStep
          instructorId={instructorId}
          onChange={setInstructorId}
        />
      )}

      {stepIndex === 3 && (
        <DocumentsStep
          codeOfConduct={codeOfConduct}
          acceptanceLetter={acceptanceLetter}
          onCodeOfConductChange={setCodeOfConduct}
          onAcceptanceLetterChange={setAcceptanceLetter}
        />
      )}

      {submitError && (
        <p
          className="mt-4 text-[12.5px]"
          style={{ color: "var(--status-action-text)" }}
        >
          {submitError}
        </p>
      )}
    </Modal>
  );
}

function ReviewSummary({ submission }: { submission: InternSubmission }) {
  const rows: [string, string][] = [
    ["Name", `${submission.user.first_name} ${submission.user.last_name}`],
    ["Email", submission.user.email],
    ["Phone", submission.user.phone || "—"],
    ["Institution", submission.current_institution || "—"],
    ["Course of study", submission.course_of_study || "—"],
    ["Campus", submission.preferred_campus || "—"],
    ["Courses", submission.courses.map((c) => c.course_name).join(", ") || "—"],
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--muted)" }}
          >
            {label}
          </p>
          <p
            className="text-[13px] mt-1 break-words"
            style={{ color: "var(--text)" }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
