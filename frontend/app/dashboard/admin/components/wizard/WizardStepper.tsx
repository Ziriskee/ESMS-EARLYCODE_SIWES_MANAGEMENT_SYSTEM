type Step = {
  key: string;
  label: string;
};

type WizardStepperProps = {
  steps: Step[];
  currentIndex: number;
  /** Indexes the admin is allowed to jump to (all completed + current). */
  reachableIndexes: number[];
  onJump: (index: number) => void;
};

export function WizardStepper({
  steps,
  currentIndex,
  reachableIndexes,
  onJump,
}: WizardStepperProps) {
  return (
    <div
      className="flex items-center gap-1.5 sm:gap-3 pb-5 mb-5 overflow-x-auto"
      style={{ borderBottom: "1px solid var(--line)" }}
    >
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isCompleted = i < currentIndex;
        const isReachable = reachableIndexes.includes(i);

        return (
          <div
            key={step.key}
            className="flex items-center gap-1.5 sm:gap-3 shrink-0"
          >
            <button
              type="button"
              onClick={() => isReachable && onJump(i)}
              disabled={!isReachable}
              className="flex items-center gap-2"
              style={{ cursor: isReachable ? "pointer" : "default" }}
            >
              <span
                className="h-6 w-6 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
                style={{
                  backgroundColor: isCurrent
                    ? "var(--gold-500)"
                    : isCompleted
                      ? "var(--tint2)"
                      : "var(--tint)",
                  color: isCurrent
                    ? "var(--coal)"
                    : isCompleted
                      ? "var(--text)"
                      : "var(--muted)",
                  border: isCurrent ? "none" : "1px solid var(--line)",
                }}
              >
                {i + 1}
              </span>
              <span
                className="text-[12px] font-semibold whitespace-nowrap"
                style={{
                  color: isCurrent
                    ? "var(--text)"
                    : isCompleted
                      ? "var(--text)"
                      : "var(--muted)",
                  opacity: isCurrent ? 1 : 0.85,
                }}
              >
                {step.label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <span
                className="h-px w-4 sm:w-8"
                style={{
                  backgroundColor: "var(--line)",
                  opacity: i < currentIndex ? 0.9 : 0.4,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
