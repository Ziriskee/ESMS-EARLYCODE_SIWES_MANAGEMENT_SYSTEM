import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<"ADMIN" | "INSTRUCTOR" | "INTERN">;
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
        }}
      >
        Loading...
      </div>
    );
  }

  // 1. Not authenticated at all -> send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated, but their role is NOT permitted on this specific route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Send them to the central /dashboard redirector.
    // That component reads their actual role and bounces them to their correct space.
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Fully authorized
  return <>{children}</>;
}
