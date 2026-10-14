import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  UserPlus,
  Users,
} from "lucide-react";
import { Sidebar } from "../shared/layout/Sidebar";
import { TopBar } from "../shared/layout/TopBar";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { useNotificationsContext } from "@/contexts/useNotificationsContext";
import {AdminDashboardProvider} from "@/contexts/AdminDashboardContext";
import { useAdminDashboardContext } from "@/contexts/useAdminDashboardContext";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard/admin": { title: "Overview" },
  "/dashboard/admin/pending": { title: "Pending Interns" },
  "/dashboard/admin/interns": { title: "All Interns" },
  "/dashboard/admin/instructors": { title: "Instructors" },
  "/dashboard/admin/messages": { title: "Messages" },
  "/dashboard/admin/notifications": { title: "Notifications" },
  "/dashboard/admin/profile": { title: "My Profile" },
};

function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_TITLES[location.pathname] ?? { title: "Overview" };
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  const { notifications } = useNotificationsContext();
  const notificationCount = notifications.filter((n) => !n.is_read).length;

  const { data, refetch: refetchDashboard } = useAdminDashboardContext();
  const messageCount = data?.stats?.unread_conversations ?? 0;

  return (
    <div className="dashboard-root flex h-dvh overflow-hidden">
      <Sidebar
        appLabel="Admin Console"
        navItems={[
          { to: "/dashboard/admin", label: "Overview", icon: LayoutGrid },
          {
            to: "/dashboard/admin/pending",
            label: "Pending Interns",
            icon: UserPlus,
          },
          { to: "/dashboard/admin/interns", label: "All Interns", icon: Users },
          {
            to: "/dashboard/admin/instructors",
            label: "Instructors",
            icon: GraduationCap,
          },
          {
            to: "/dashboard/admin/messages",
            label: "Messages",
            icon: MessageSquare,
            badge: messageCount, // Badge shows unread conversations
          },
          {
            to: "/dashboard/admin/notifications",
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
          onNotificationClick={() => navigate("/dashboard/admin/notifications")}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 md:py-8">
          <Outlet context={{ refetchDashboard }} />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminDashboardProvider>
      <NotificationsProvider>
        <AdminShell />
      </NotificationsProvider>
    </AdminDashboardProvider>
  );
}
