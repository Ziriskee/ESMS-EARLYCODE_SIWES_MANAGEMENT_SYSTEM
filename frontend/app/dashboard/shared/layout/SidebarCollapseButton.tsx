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
      className="absolute top-1/2 -translate-y-1/2 -right-3 h-8 w-8 rounded-full border flex items-center justify-center transition-colors duration-150 z-10"
      style={{
        borderColor: "var(--border-sidebar)",
        backgroundColor: "var(--bg-sidebar)",
        color: "var(--gold)",
      }}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}
