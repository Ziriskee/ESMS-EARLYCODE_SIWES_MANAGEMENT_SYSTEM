import { ChevronLeft, ChevronRight } from "lucide-react";

type SidebarCollapseButtonProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function SidebarCollapseButton({
  collapsed,
  onToggle,
}: SidebarCollapseButtonProps) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const Icon = collapsed ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="hidden lg:flex absolute top-[62%] -translate-y-1/2 h-7 w-7 rounded-full border items-center justify-center transition-colors"
      style={{
        right: "-14px",
        zIndex: 50,
        borderColor: "var(--line)",
        backgroundColor: "var(--surface2)",
        color: "var(--muted)",
      }}
    >
      <Icon size={14} strokeWidth={2} />
    </button>
  );
}
