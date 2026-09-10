// frontend/app/dashboard/page.tsx
import { useAuth } from "../../contexts/useAuth";
import { AdminDashboard } from "./AdminDashboard";
import { InstructorDashboard } from "./InstructorDashboard";
import { InternDashboard } from "./InternDashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Redirecting to login...</div>;

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "INSTRUCTOR":
      return <InstructorDashboard />;
    case "INTERN":
      return <InternDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}
