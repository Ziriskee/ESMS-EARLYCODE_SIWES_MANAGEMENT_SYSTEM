import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { AssignedInternSummary, MyInternsResponse } from "../types";

type UseMyInternsResult = {
  interns: AssignedInternSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useMyInterns(): UseMyInternsResult {
  const [interns, setInterns] = useState<AssignedInternSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<MyInternsResponse>("/instructor/interns/");
      setInterns(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interns");
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
        const data = await apiFetch<MyInternsResponse>("/instructor/interns/");
        if (isMounted) setInterns(data.results ?? []);
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
  }, []);

  return { interns, loading, error, refetch: fetchData };
}
