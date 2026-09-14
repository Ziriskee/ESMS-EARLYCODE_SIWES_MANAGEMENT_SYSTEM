import { useEffect, useState } from "react";
import { Bell, LayoutGrid, MessageSquare, FileText } from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarCollapseButton } from "./SidebarCollapseButton";
import { SidebarProgressMini } from "./SidebarProgressMini";

const STORAGE_KEY = "siwes_sidebar_collapsed";

const navItems = [
  {
    to: "/dashboard/intern",
    label: "Overview",
    icon: LayoutGrid,
  },
  {
    to: "/dashboard/intern/reports",
    label: "Reports",
    icon: FileText,
  },
  {
    to: "/dashboard/intern/messages",
    label: "Messages",
    icon: MessageSquare,
  },
  {
    to: "/dashboard/intern/notifications",
    label: "Notifications",
    icon: Bell,
  },
];

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

type SidebarProps = {
  badges?: {
    reports?: number;
    messages?: number;
    notifications?: number;
  };
};

export function Sidebar({ badges }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialCollapsed);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const width = collapsed ? 72 : 260;

  const badgeFor = (label: string): number | undefined => {
    if (!badges) return undefined;
    if (label === "Reports") return badges.reports;
    if (label === "Messages") return badges.messages;
    if (label === "Notifications") return badges.notifications;
    return undefined;
  };

  return (
    <aside
      className="relative shrink-0 flex flex-col h-screen transition-[width] duration-200"
      style={{
        width,
        backgroundColor: "var(--bg-sidebar)",
      }}
    >
      <SidebarBrand collapsed={collapsed} />

      {!collapsed && (
        <div
          className="px-5 mb-2"
          style={{
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
          }}
        >
          <span className="text-[11px] font-semibold uppercase">Workspace</span>
        </div>
      )}

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            badge={badgeFor(item.label)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="flex-1" />

      <SidebarProgressMini collapsed={collapsed} />

      <SidebarCollapseButton
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
    </aside>
  );
}
