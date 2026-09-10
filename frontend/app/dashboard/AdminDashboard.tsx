import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { apiFetch } from "../../lib/api";

type AdminDashboardData = {
  total_interns: number;
  total_instructors: number;
  pending_interns: number;
  active_interns: number;
  total_reports: number;
  unread_reports: number;
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiFetch<AdminDashboardData>("/admin/dashboard/");
        setData(result);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading admin dashboard...</div>;
  if (!data) return <div>Failed to load admin dashboard</div>;

  return (
    <div className="min-h-screen bg-ec-dark text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-gray-400 mb-6">Welcome, {user?.first_name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Total Interns</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.total_interns}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Total Instructors</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.total_instructors}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Pending Interns</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.pending_interns}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Active Interns</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.active_interns}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Total Reports</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.total_reports}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">Unread Reports</p>
          <p className="text-3xl font-bold text-ec-gold">
            {data.unread_reports}
          </p>
        </div>
      </div>
    </div>
  );
}