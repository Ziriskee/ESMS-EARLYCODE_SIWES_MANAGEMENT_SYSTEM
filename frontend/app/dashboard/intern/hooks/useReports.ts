import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";

export type ReportStatus = "DRAFT" | "SUBMITTED" | "REVIEWED";

export type Report = {
  id: string;
  title: string;
  content: string;
  submitted_at: string;
  status: ReportStatus;
  instructor_feedback: string;
  admin_seen: boolean;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type UseReportsResult = {
  reports: Report[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
};

function isPaginated(data: unknown): data is PaginatedResponse<Report> {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as PaginatedResponse<Report>).results)
  );
}

export function useReports(): UseReportsResult {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Report[] | PaginatedResponse<Report>>(
        "/intern/reports/",
      );

      if (isPaginated(data)) {
        setReports(data.results);
        // Backend returns an absolute URL for `next`. We only care whether
        // it exists, and we will re-request the same path with a page param.
        setNextUrl(data.next);
      } else {
        setReports(data);
        setNextUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
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
        const data = await apiFetch<Report[] | PaginatedResponse<Report>>(
          "/intern/reports/",
        );

        if (!isMounted) return;

        if (isPaginated(data)) {
          setReports(data.results);
          setNextUrl(data.next);
        } else {
          setReports(data);
          setNextUrl(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load reports",
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

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;

    setLoadingMore(true);
    try {
      // Extract the path + query from the absolute URL the backend returned.
      // apiFetch prefixes with API_BASE_URL, so we strip it here.
      const url = new URL(nextUrl);
      const pathWithQuery = url.pathname.replace(/^\/api/, "") + url.search;

      const data = await apiFetch<PaginatedResponse<Report>>(pathWithQuery);

      if (isPaginated(data)) {
        setReports((prev) => [...prev, ...data.results]);
        setNextUrl(data.next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  const refetch = useCallback(async () => {
    await fetchInitial();
  }, [fetchInitial]);

  return {
    reports,
    loading,
    error,
    hasMore: Boolean(nextUrl),
    loadMore,
    refetch,
  };
}
