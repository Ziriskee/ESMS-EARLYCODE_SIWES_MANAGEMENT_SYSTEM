import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { PendingInternSummary, PendingInternsResponse } from "../types";

type UsePendingInternsResult = {
  pending: PendingInternSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function usePendingInterns(): UsePendingInternsResult {
  const [pending, setPending] = useState<PendingInternSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PendingInternsResponse>(
        "/admin/interns/pending/",
      );
      setPending(data.results ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pending interns",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const data = await apiFetch<PendingInternsResponse>(
          "/admin/interns/pending/",
        );
        if (isMounted) setPending(data.results ?? []);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load pending interns",
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

  return { pending, loading, error, refetch: fetchPending };
}
