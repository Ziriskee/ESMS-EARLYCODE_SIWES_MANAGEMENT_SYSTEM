import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";

type DashboardData = {
  stats: {
    total_interns: number;
    active_interns: number;
    tasks_awaiting_review: number;
    unread_messages: number;
  };
  interns: Array<{
    id: number;
    name: string;
    email: string;
    campus: string;
    status: string;
    school_start_date: string | null;
    school_end_date: string | null;
  }>;
};

type UseInstructorDashboardResult = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useInstructorDashboard(): UseInstructorDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<DashboardData>("/instructor/dashboard/");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFetch<DashboardData>("/instructor/dashboard/");
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error, refetch: fetchData };
}
