type StatusTone = "approved" | "review" | "action" | "neutral";

type StatusChipProps = {
  tone: StatusTone;
  label: string;
};

const tones: Record<StatusTone, { bg: string; text: string }> = {
  approved: {
    bg: "var(--status-approved-bg)",
    text: "var(--status-approved-text)",
  },
  review: {
    bg: "var(--status-review-bg)",
    text: "var(--status-review-text)",
  },
  action: {
    bg: "var(--status-action-bg)",
    text: "var(--status-action-text)",
  },
  neutral: {
    bg: "var(--status-neutral-bg)",
    text: "var(--status-neutral-text)",
  },
};

export function StatusChip({ tone, label }: StatusChipProps) {
  const t = tones[tone];

  return (
    <span
      className="inline-flex items-center rounded-[6px] px-2 py-[3px] text-[12px] font-semibold leading-none whitespace-nowrap"
      style={{ backgroundColor: t.bg, color: t.text }}
    >
      {label}
    </span>
  );
}
