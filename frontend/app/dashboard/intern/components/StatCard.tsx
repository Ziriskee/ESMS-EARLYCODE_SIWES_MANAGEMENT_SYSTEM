import type { LucideIcon } from "lucide-react";
import { Card } from "../../shared/ui/Card";

type StatTone = 1 | 2 | 3 | 4;

type StatCardProps = {
  label: string;
  value: string;
  tone: StatTone;
  icon: LucideIcon;
};

type ToneStyle = {
  bg: string;
  iconColor: string;
  label: string;
  value: string;
};

const toneMap: Record<StatTone, ToneStyle> = {
  1: {
    bg: "#2A2A2B",
    iconColor: "#A8A8A8",
    label: "#A8A8A8",
    value: "#FFFFFF",
  },
  2: {
    bg: "#5A4A14",
    iconColor: "#C9B77A",
    label: "#C9B77A",
    value: "#FFFFFF",
  },
  3: {
    bg: "#A98F2E",
    iconColor: "#3A3016",
    label: "#3A3016",
    value: "#1A1A1A",
  },
  4: {
    bg: "#FBCD15",
    iconColor: "#3A3016",
    label: "#3A3016",
    value: "#1A1A1A",
  },
};

export function StatCard({ label, value, tone, icon: Icon }: StatCardProps) {
  const t = toneMap[tone];

  return (
    <Card
      padding="md"
      style={{
        backgroundColor: t.bg,
        borderColor: "transparent",
        minWidth: 180,
      }}
    >
      <Icon size={18} strokeWidth={1.75} style={{ color: t.iconColor }} />

      <p
        className="text-[11px] font-semibold uppercase tracking-[0.06em] mt-3 mb-4"
        style={{ color: t.label }}
      >
        {label}
      </p>

      <p
        className="text-[32px] font-bold leading-none"
        style={{
          color: t.value,
          fontFamily: "var(--font-heading)",
        }}
      >
        {value}
      </p>
    </Card>
  );
}
