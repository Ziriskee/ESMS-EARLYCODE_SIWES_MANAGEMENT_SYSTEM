import { Routes, Route } from "react-router-dom";

// Lazy load the register page for better performance
import RegisterPage from "./register/page";
import LandingPage from "./page";
import LoginPage from "./login/page";
import VerifyLogin from "./verify-login/page";
import { AuthProvider } from "@/contexts/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
// import { useAuth } from "@/contexts/useAuth";
import DashboardPage from "./dashboard/page";
import { InternLayout } from "./dashboard/intern/layout";
import InternOverviewPage from "./dashboard/intern/page";
import InternReportsPage from "./dashboard/intern/reports/page";
import InternMessagesPage from "./dashboard/intern/messages/page";
import InternNotificationsPage from "./dashboard/intern/notifications/page";

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
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-login" element={<VerifyLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/intern"
          element={
            <ProtectedRoute>
              <InternLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InternOverviewPage />} />
          <Route path="reports" element={<InternReportsPage />} />
          <Route path="messages" element={<InternMessagesPage />} />
          <Route path="notifications" element={<InternNotificationsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
