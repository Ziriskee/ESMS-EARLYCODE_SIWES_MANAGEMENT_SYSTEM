import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "var(--bg-page)",
          color: "var(--text-primary)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "INTERN":
      return <Navigate to="/dashboard/intern" replace />;
    case "INSTRUCTOR":
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            backgroundColor: "var(--bg-page)",
            color: "var(--text-primary)",
          }}
        >
          Instructor dashboard coming soon.
        </div>
      );
    case "ADMIN":
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            backgroundColor: "var(--bg-page)",
            color: "var(--text-primary)",
          }}
        >
          Admin dashboard coming soon.
        </div>
      );
    default:
      return <Navigate to="/login" replace />;
  }
}
