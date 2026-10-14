import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Users,
} from "lucide-react";
import { Sidebar } from "../shared/layout/Sidebar";
import { TopBar } from "../shared/layout/TopBar";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { useNotificationsContext } from "@/contexts/useNotificationsContext";
import { InstructorDashboardProvider } from "@/contexts/InstructorDashboardContext";
import { useInstructorDashboardContext } from "@/contexts/useInstructorDashboardContext";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard/instructor": { title: "Overview" },
  "/dashboard/instructor/interns": { title: "My Interns" },
  "/dashboard/instructor/messages": { title: "Messages" },
  "/dashboard/instructor/tasks": { title: "Tasks" },
  "/dashboard/instructor/notifications": { title: "Notifications" },
  "/dashboard/instructor/profile": { title: "My Profile" },
};

function InstructorShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_TITLES[location.pathname] ?? { title: "Overview" };
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  const { notifications } = useNotificationsContext();
  const notificationCount = notifications.filter((n) => !n.is_read).length;

  const { data } = useInstructorDashboardContext();
  const messageCount = data?.stats.unread_conversations ?? 0;

  return (
    <div className="dashboard-root flex h-dvh overflow-hidden">
      <Sidebar
        appLabel="Instructor Space"
        navItems={[
          { to: "/dashboard/instructor", label: "Overview", icon: LayoutGrid },
          {
            to: "/dashboard/instructor/interns",
            label: "My Interns",
            icon: Users,
          },
          {
            to: "/dashboard/instructor/messages",
            label: "Messages",
            icon: MessageSquare,
            badge: messageCount,
          },
          {
            to: "/dashboard/instructor/tasks",
            label: "Tasks",
            icon: ListChecks,
          },
          {
            to: "/dashboard/instructor/notifications",
            label: "Notifications",
            icon: Bell,
            badge: notificationCount,
          },
        ]}
        mobileOpen={mobileNavOpen}
        onCloseMobile={closeMobileNav}
      />
      <div className="flex-1 flex flex-col min-w-0 h-dvh">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          notificationCount={notificationCount}
          onNotificationClick={() =>
            navigate("/dashboard/instructor/notifications")
          }
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function InstructorLayout() {
  return (
    <InstructorDashboardProvider>
      <NotificationsProvider>
        <InstructorShell />
      </NotificationsProvider>
    </InstructorDashboardProvider>
  );
}
