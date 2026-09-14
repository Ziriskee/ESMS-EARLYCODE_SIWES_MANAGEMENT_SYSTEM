import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type SidebarNavItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  collapsed: boolean;
};

export function SidebarNavItem({
  to,
  label,
  icon: Icon,
  badge,
  collapsed,
}: SidebarNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const showBadge = typeof badge === "number" && badge > 0;

  const baseClasses =
    "flex items-center h-11 rounded-full mx-3 transition-colors duration-150";

  const layoutClasses = collapsed
    ? "justify-center px-0"
    : "justify-start gap-3 px-4";

  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={`${baseClasses} ${layoutClasses}`}
      style={{
        backgroundColor: isActive
          ? "var(--sidebar-nav-active-bg)"
          : "transparent",
        color: isActive
          ? "var(--sidebar-nav-active-text)"
          : "var(--sidebar-nav-text)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "var(--sidebar-nav-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        style={{
          color: isActive
            ? "var(--sidebar-nav-active-text)"
            : "var(--sidebar-nav-icon)",
          flexShrink: 0,
        }}
      />

      {!collapsed && (
        <>
          <span className="text-[14px] font-medium flex-1 truncate">
            {label}
          </span>

          {showBadge && (
            <span
              className="text-[11px] font-semibold rounded-full px-2 py-0.5 leading-none"
              style={{
                backgroundColor: isActive
                  ? "var(--sidebar-badge-bg-active)"
                  : "var(--sidebar-badge-bg)",
                color: isActive
                  ? "var(--sidebar-badge-text-active)"
                  : "var(--sidebar-badge-text)",
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
