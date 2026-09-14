import { useCallback, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type { DashboardData } from "@/app/dashboard/intern/types";
import { DashboardDataContext } from "./useDashboardDataContext";

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await apiFetch<DashboardData>("/intern/dashboard/");
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
        const result = await apiFetch<DashboardData>("/intern/dashboard/");
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

  return (
    <DashboardDataContext.Provider
      value={{ data, loading, error, refetch: fetchData }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
}
