import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function DashboardPage() {
  const { user, loading } = useAuth();

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
            backgroundColor: "var(--bg)",
            color: "var(--text)",
          }}
        >
          Instructor dashboard coming soon.
        </div>
      );
    case "ADMIN":
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
