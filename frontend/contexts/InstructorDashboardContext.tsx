import { useCallback, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../lib/api";
import { InstructorDashboardContext } from "./useInstructorDashboardContext";

export type InstructorDashboardData = {
  stats: {
    total_interns: number;
    active_interns: number;
    unread_conversations: number;
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

  recently_reviewed: Array<{
    id: string;
    title: string;
    status: string;
    intern: { id: number; name: string };
    reviewed_at: string | null;
  }>;
};

export function InstructorDashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<InstructorDashboardData>(
        "/instructor/dashboard/",
      );
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
      try {
        const result = await apiFetch<InstructorDashboardData>(
          "/instructor/dashboard/",
        );
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted)
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <InstructorDashboardContext.Provider
      value={{ data, loading, error, refetch: fetchData }}
    >
      {children}
    </InstructorDashboardContext.Provider>
  );
}
