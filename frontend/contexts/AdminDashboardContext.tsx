import { useCallback, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type {
  AdminDashboardStats,
  PendingInternsResponse,
} from "@/app/dashboard/admin/types";
import {
  AdminDashboardDataContext,
  type AdminDashboardData,
} from "./useAdminDashboardContext";

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, pendingData] = await Promise.all([
        apiFetch<AdminDashboardStats>("/admin/dashboard/"),
        apiFetch<PendingInternsResponse>("/admin/interns/pending/"),
      ]);
      setData({ stats: statsData, pending: pendingData.results ?? [] });
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
        setData({ stats: statsData, pending: pendingData.results ?? [] });
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

  return (
    <AdminDashboardDataContext.Provider
      value={{ data, loading, error, refetch: fetchData }}
    >
      {children}
    </AdminDashboardDataContext.Provider>
  );
}
