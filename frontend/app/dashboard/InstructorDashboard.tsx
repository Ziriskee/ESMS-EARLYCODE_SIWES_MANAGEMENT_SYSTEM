import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { apiFetch } from "../../lib/api";

type InstructorDashboardData = {
  total_interns: number;
  total_tasks: number;
  pending_reports: number;
};

export function InstructorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiFetch<InstructorDashboardData>(
          "/instructor/dashboard/",
        );
        setData(result);
      } catch (error) {
        console.error("Failed to load instructor dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading instructor dashboard...</div>;
  if (!data) return <div>Failed to load instructor dashboard</div>;

  return (
    <div className="min-h-screen bg-ec-dark text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
      <p className="text-gray-400 mb-6">Welcome back, {user?.first_name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Assigned Interns</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.total_interns}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Total Tasks</p>
          <p className="text-3xl font-bold text-ec-gold">{data.total_tasks}</p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Pending Reports</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.pending_reports}
          </p>
        </div>
      </div>
    </div>
  );
}
