import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { DashboardSkeleton } from "./dashboard/shared/ui/DashboardSkeleton";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load the register page for better performance
// ── Public surface shells ────────────────────────────────────
import MarketingPage from "./page";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";
import VerifyLoginPage from "./verify-login/page";
const DashboardRedirectPage = lazy(() => import("./dashboard/page"));

// ── Dashboard shells (own their providers + shared UI) ───────
const InternLayout = lazy(() =>
  import("./dashboard/intern/layout").then((m) => ({
    default: m.InternLayout,
  })),
);
const AdminLayout = lazy(() =>
  import("./dashboard/admin/layout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const InstructorLayout = lazy(() =>
  import("./dashboard/instructor/layout").then((m) => ({
    default: m.InstructorLayout,
  })),
);
const InternMessagesPage = lazy(
  () => import("./dashboard/intern/messages/page"),
);
const InstructorMessagesPage = lazy(
  () => import("./dashboard/instructor/messages/page"),
);
const AdminMessagesPage = lazy(() => import("./dashboard/admin/messages/page"));
const InternOverviewPage = lazy(() => import("./dashboard/intern/page"));
const InternTasksPage = lazy(() => import("./dashboard/intern/tasks/page"));
const InternNotificationsPage = lazy(
  () => import("./dashboard/intern/notifications/page"),
);
const AdminOverviewPage = lazy(() => import("./dashboard/admin/page"));
const AdminPendingPage = lazy(() => import("./dashboard/admin/pending/page"));
const AdminAllInternsPage = lazy(
  () => import("./dashboard/admin/interns/page"),
);
const AdminInstructorsPage = lazy(
  () => import("./dashboard/admin/instructors/page"),
);
const AdminNotificationsPage = lazy(
  () => import("./dashboard/admin/notifications/page"),
);
const InstructorOverviewPage = lazy(
  () => import("./dashboard/instructor/page"),
);
const InstructorInternsPage = lazy(
  () => import("./dashboard/instructor/interns/page"),
);
const InstructorTasksPage = lazy(
  () => import("./dashboard/instructor/tasks/page"),
);
const InstructorNotificationsPage = lazy(
  () => import("./dashboard/instructor/notifications/page"),
);
const InstructorProfilePage = lazy(
  () => import("./dashboard/instructor/profile/page"),
);
const InternProfilePage = lazy(() => import("./dashboard/intern/profile/page"));
const AdminProfilePage = lazy(() => import("./dashboard/admin/profile/page"));

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ec-dark text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ec-gold font-heading mb-4">
          404
        </h1>
        <p className="text-gray-400 font-body mb-6">Page not found.</p>
        <a
          href="/"
          className="px-6 py-3 bg-ec-gold text-ec-dark rounded-full font-bold font-body hover:scale-105 transition-transform"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}




export function App() {
  return (
    <main>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-login" element={<VerifyLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirectPage />
              </ProtectedRoute>
            }
          />

          {/* Intern */}
          <Route
            path="/dashboard/intern"
            element={
              <ProtectedRoute allowedRoles={["INTERN"]}>
                <InternLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InternOverviewPage />} />
            <Route path="tasks" element={<InternTasksPage />} />
            <Route path="messages" element={<InternMessagesPage />} />
            <Route path="notifications" element={<InternNotificationsPage />} />
            <Route path="profile" element={<InternProfilePage />} />
          </Route>

          {/* Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="pending" element={<AdminPendingPage />} />
            <Route path="interns" element={<AdminAllInternsPage />} />
            <Route path="instructors" element={<AdminInstructorsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
          </Route>

          {/* Instructor */}
          <Route
            path="/dashboard/instructor"
            element={
              <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InstructorOverviewPage />} />
            <Route path="interns" element={<InstructorInternsPage />} />
            <Route path="messages" element={<InstructorMessagesPage />} />
            <Route path="tasks" element={<InstructorTasksPage />} />
            <Route
              path="notifications"
              element={<InstructorNotificationsPage />}
            />
            <Route path="profile" element={<InstructorProfilePage />} />
          </Route>

        </Routes>
      </Suspense>
    </main>
  );
}

function RouteFallback() {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith("/dashboard")) {
    return <DashboardSkeleton />;
  }

  // Marketing / other routes: simple spinner
  return null;
}
