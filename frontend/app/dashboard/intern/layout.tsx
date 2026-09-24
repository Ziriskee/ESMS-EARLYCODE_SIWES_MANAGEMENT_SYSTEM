import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, LayoutGrid, MessageSquare, FileText } from "lucide-react";
import { Sidebar } from "../shared/layout/Sidebar";
import { TopBar } from "../shared/layout/TopBar";
import { SidebarProgressMini } from "../shared/layout/SidebarProgressMini";
import { DashboardDataProvider } from "@/contexts/DashboardDataContext";
import { useDashboardDataContext } from "@/contexts/useDashboardDataContext";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard/intern": { title: "Overview" },
  "/dashboard/intern/reports": { title: "Reports" },
  "/dashboard/intern/messages": { title: "Messages" },
  "/dashboard/intern/notifications": { title: "Notifications" },
};

function InternShell() {
  const location = useLocation();
  const meta = PAGE_TITLES[location.pathname] ?? { title: "Overview" };
  const { data } = useDashboardDataContext();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  const notificationCount = data?.stats.unread_notifications ?? 0;
  const messageCount = data?.stats.unread_messages ?? 0;
  const reportCount = data?.stats.reports_submitted ?? 0;

  const isOverview = location.pathname === "/dashboard/intern";
  const placement = data?.placement;

  const sidebarFooter =
    !isOverview && placement ? (
      <SidebarProgressMini
        percentComplete={placement.percent_complete}
        weeksCompleted={placement.weeks_completed}
        totalWeeks={placement.total_weeks}
        href="/dashboard/intern"
      />
    ) : null;

  return (
    <div className="dashboard-root flex h-dvh overflow-hidden">
      <Sidebar
        appLabel="Intern Space"
        navItems={[
          { to: "/dashboard/intern", label: "Overview", icon: LayoutGrid },
          {
            to: "/dashboard/intern/reports",
            label: "Reports",
            icon: FileText,
            badge: reportCount,
          },
          {
            to: "/dashboard/intern/messages",
            label: "Messages",
            icon: MessageSquare,
            badge: messageCount,
          },
          {
            to: "/dashboard/intern/notifications",
            label: "Notifications",
            icon: Bell,
            badge: notificationCount,
          },
        ]}
        mobileOpen={mobileNavOpen}
        onCloseMobile={closeMobileNav}
        footerSlot={sidebarFooter}
      />

      <div className="flex-1 flex flex-col min-w-0 h-dvh">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          notificationCount={notificationCount}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function InternLayout() {
  return (
    <DashboardDataProvider>
      <InternShell />
    </DashboardDataProvider>
  );
}
