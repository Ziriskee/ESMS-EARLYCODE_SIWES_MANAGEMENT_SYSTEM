import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { AllInternsResponse, AllInternSummary } from "../types";

export type AllInternStatus = "all" | "pending" | "active" | "completed";

type UseAllInternsResult = {
  interns: AllInternSummary[];
  loading: boolean;
  error: string | null;
  count: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
};

const PAGE_SIZE = 10;

export function useAllInterns(
  status: AllInternStatus,
  search: string,
  campus: string,
): UseAllInternsResult {
  const [interns, setInterns] = useState<AllInternSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  // Reset page to 1 when filters change — during render, not in an effect.
  const [prevFilters, setPrevFilters] = useState({ status, search, campus });
  if (
    status !== prevFilters.status ||
    search !== prevFilters.search ||
    campus !== prevFilters.campus
  ) {
    setPrevFilters({ status, search, campus });
    setPage(1);
  }

  // Fetch data when filters or page change.
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);
        if (search.trim()) params.set("search", search.trim());
        if (campus !== "all") params.set("campus", campus);
        params.set("page", String(page));

        const data = await apiFetch<AllInternsResponse>(
          `/admin/interns/?${params.toString()}`,
        );
        if (!isMounted) return;
        setInterns(data.results ?? []);
        setCount(data.count ?? 0);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load interns",
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
  }, [status, search, campus, page]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const refetch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    if (campus !== "all") params.set("campus", campus);
    params.set("page", String(page));
    try {
      const data = await apiFetch<AllInternsResponse>(
        `/admin/interns/?${params.toString()}`,
      );
      setInterns(data.results ?? []);
      setCount(data.count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interns");
    } finally {
      setLoading(false);
    }
  };

  return {
    interns,
    loading,
    error,
    count,
    page,
    totalPages,
    setPage,
    refetch,
  };
}
