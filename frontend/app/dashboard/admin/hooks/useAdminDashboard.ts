import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type {
  AdminDashboardStats,
  PendingInternSummary,
  PendingInternsResponse,
} from "../types";

type UseAdminDashboardResult = {
  stats: AdminDashboardStats | null;
  pending: PendingInternSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAdminDashboard(): UseAdminDashboardResult {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pending, setPending] = useState<PendingInternSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [statsData, pendingData] = await Promise.all([
        apiFetch<AdminDashboardStats>("/admin/dashboard/"),
        apiFetch<PendingInternsResponse>("/admin/interns/pending/"),
      ]);
      setStats(statsData);
      setPending(pendingData.results ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const [statsData, pendingData] = await Promise.all([
          apiFetch<AdminDashboardStats>("/admin/dashboard/"),
          apiFetch<PendingInternsResponse>("/admin/interns/pending/"),
        ]);
        if (!isMounted) return;
        setStats(statsData);
        setPending(pendingData.results ?? []);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load admin data",
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

  return { stats, pending, loading, error, refetch: fetchAll };
}
