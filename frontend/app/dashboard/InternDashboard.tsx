import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { apiFetch } from "../../lib/api";

// ✅ Properly typed Schedule
type Schedule = {
  id: string;
  slot: {
    id: string;
    day_of_week: string;
    shift: string;
    start_time: string;
    end_time: string;
  };
  is_rotating: boolean;
  assigned_by: string | null;
  assigned_at: string;
};

// ✅ Properly typed Task
type Task = {
  id: string;
  task?: {
    id: string;
    title: string;
    description?: string;
    due_date: string | null;
  };
  status: string;
  submitted_at: string | null;
  created_at: string;
};

// ✅ DashboardData uses proper types
type DashboardData = {
  schedule: Schedule | null;
  pending_tasks: Task[];
  unread_notifications: number;
};

export function InternDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const result = await apiFetch<DashboardData>("/intern/dashboard/");
        setData(result);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ec-dark text-white flex items-center justify-center">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ec-dark text-white p-10">
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          Error Loading Dashboard
        </h1>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-ec-gold text-ec-dark rounded-full font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ec-dark text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {user?.first_name || "Intern"}!
            </h1>
            <p className="text-gray-400 mt-1">Your SIWES dashboard</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm">Pending Tasks</p>
            <p className="text-3xl font-bold text-ec-gold">
              {data?.pending_tasks?.length || 0}
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm">Unread Notifications</p>
            <p className="text-3xl font-bold text-ec-gold">
              {data?.unread_notifications || 0}
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm">Schedule Status</p>
            <p className="text-lg font-medium text-white mt-1">
              {data?.schedule ? "✅ Assigned" : "⏳ Not assigned"}
            </p>
            {data?.schedule && (
              <p className="text-sm text-gray-400 mt-1">
                {data.schedule.slot.day_of_week} • {data.schedule.slot.shift}
              </p>
            )}
          </div>
        </div>

        {data?.pending_tasks && data.pending_tasks.length > 0 && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
            <ul className="space-y-3">
              {data.pending_tasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/5"
                >
                  <p className="font-medium">{task.task?.title || "Task"}</p>
                  <p className="text-sm text-gray-400">
                    Status: {task.status || "Pending"}
                    {task.task?.due_date &&
                      ` • Due: ${new Date(task.task.due_date).toLocaleDateString()}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data?.pending_tasks && data.pending_tasks.length === 0 && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <p className="text-gray-400">🎉 No pending tasks. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
}
