import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  FileText,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  UserPlus,
  Users,
} from "lucide-react";
import { Sidebar } from "../shared/layout/Sidebar";
import { TopBar } from "../shared/layout/TopBar";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard/admin": { title: "Overview" },
  "/dashboard/admin/pending": { title: "Pending Interns" },
  "/dashboard/admin/interns": { title: "All Interns" },
  "/dashboard/admin/instructors": { title: "Instructors" },
  "/dashboard/admin/reports": { title: "Reports" },
  "/dashboard/admin/messages": { title: "Messages" },
  "/dashboard/admin/notifications": { title: "Notifications" },
};

export function AdminLayout() {
  const location = useLocation();
  const meta = PAGE_TITLES[location.pathname] ?? { title: "Overview" };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="dashboard-root flex h-dvh overflow-hidden">
      <Sidebar
        appLabel="Admin Console"
        navItems={[
          {
            to: "/dashboard/admin",
            label: "Overview",
            icon: LayoutGrid,
          },
          {
            to: "/dashboard/admin/pending",
            label: "Pending Interns",
            icon: UserPlus,
          },
          {
            to: "/dashboard/admin/interns",
            label: "All Interns",
            icon: Users,
          },
          {
            to: "/dashboard/admin/instructors",
            label: "Instructors",
            icon: GraduationCap,
          },
          {
            to: "/dashboard/admin/reports",
            label: "Reports",
            icon: FileText,
          },
          {
            to: "/dashboard/admin/messages",
            label: "Messages",
            icon: MessageSquare,
          },
          {
            to: "/dashboard/admin/notifications",
            label: "Notifications",
            icon: Bell,
          },
        ]}
        mobileOpen={mobileNavOpen}
        onCloseMobile={closeMobileNav}
      />

      <div className="flex-1 flex flex-col min-w-0 h-dvh">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
