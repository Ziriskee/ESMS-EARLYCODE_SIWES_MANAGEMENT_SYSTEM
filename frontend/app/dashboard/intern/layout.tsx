import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../shared/layout/Sidebar";
import { TopBar } from "../shared/layout/TopBar";
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

  const notificationCount = data?.stats.unread_notifications ?? 0;
  const messageCount = data?.stats.unread_messages ?? 0;
  const reportCount = data?.stats.reports_submitted ?? 0;

  return (
    <div className="dashboard-root flex h-screen overflow-hidden">
      <Sidebar
        badges={{
          reports: reportCount,
          messages: messageCount,
          notifications: notificationCount,
        }}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-12">
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
