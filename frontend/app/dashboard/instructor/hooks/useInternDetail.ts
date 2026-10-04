import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { AssignedInternDetail } from "../types";

type UseInternDetailResult = {
  detail: AssignedInternDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Fetches one intern's full detail (scoped to this instructor) when
 * `internId` is non-null. Pass null to skip fetching.
 */
export function useInternDetail(
  internId: number | null,
): UseInternDetailResult {
  const [detail, setDetail] = useState<AssignedInternDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (internId === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AssignedInternDetail>(
        `/instructor/interns/${internId}/`,
      );
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load intern");
    } finally {
      setLoading(false);
    }
  }, [internId]);

  useEffect(() => {
    if (internId === null) return;
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<AssignedInternDetail>(
          `/instructor/interns/${internId}/`,
        );
        if (isMounted) setDetail(data);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load intern",
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
  }, [internId]);

  // Derived empty state — never written via effect.
  if (internId === null) {
    return { detail: null, loading: false, error: null, refetch: fetchData };
  }
  return { detail, loading, error, refetch: fetchData };
}
