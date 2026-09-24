import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarCollapseButton } from "./SidebarCollapseButton";

const STORAGE_KEY = "siwes_sidebar_collapsed";

export type SidebarNavItemConfig = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

type SidebarProps = {
  appLabel: string;
  navItems: SidebarNavItemConfig[];
  version?: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  footerSlot?: React.ReactNode;
};

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function Sidebar({
  appLabel,
  navItems,
  version = "v2.4",
  mobileOpen = false,
  onCloseMobile,
  footerSlot,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialCollapsed);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  // On mobile the drawer always renders expanded.
  const effectiveCollapsed = !mobileOpen && collapsed;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "var(--modal-backdrop)" }}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-[276px] ${effectiveCollapsed ? "lg:w-24" : "lg:w-[276px]"}
          shrink-0 flex flex-col h-dvh border-r
          transition-all duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          borderColor: "var(--line)",
          overflow: "visible",
        }}
      >
        <SidebarBrand collapsed={effectiveCollapsed} appLabel={appLabel} />

        <nav className="mt-8 flex-1 overflow-y-auto px-3 pb-4">
          {!effectiveCollapsed && (
            <p
              className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.26em]"
              style={{ color: "var(--muted)" }}
            >
              Workspace
            </p>
          )}
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <SidebarNavItem
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  collapsed={effectiveCollapsed}
                  onNavigate={onCloseMobile}
                />
              </li>
            ))}
          </ul>
        </nav>

        {!effectiveCollapsed && footerSlot}

        <div className="border-t p-3" style={{ borderColor: "var(--line)" }}>
          {!effectiveCollapsed && (
            <p
              className="px-2.5 text-[10px] tracking-wide opacity-70"
              style={{ color: "var(--muted)" }}
            >
              EC · SIWES Portal · {version}
            </p>
          )}
        </div>

        <SidebarCollapseButton
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </aside>
    </>
  );
}
