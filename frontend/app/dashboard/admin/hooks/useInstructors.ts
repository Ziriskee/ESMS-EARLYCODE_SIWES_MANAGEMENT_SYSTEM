import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { InstructorSummary } from "../types";

type UseInstructorsResult = {
  instructors: InstructorSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Loads instructors. By default the API returns only active ones.
 * Pass `includeAll = true` to also include deactivated instructors.
 * Pass `campus` ("kubwa" | "nyanya") to filter by campus; omit or pass
 * "all"/null/undefined for no campus filter.
 */
export function useInstructors(
  includeAll = false,
  campus?: string | null,
): UseInstructorsResult {
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const path = (() => {
    const params = new URLSearchParams();
    if (includeAll) params.set("all", "true");
    if (campus && campus !== "all") params.set("campus", campus);
    const qs = params.toString();
    return qs ? `/admin/instructors/?${qs}` : "/admin/instructors/";
  })();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<
        InstructorSummary[] | { results: InstructorSummary[] }
      >(path);
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setInstructors(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load instructors",
      );
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<
          InstructorSummary[] | { results: InstructorSummary[] }
        >(path);
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (isMounted) setInstructors(list);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load instructors",
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
  }, [path]);

  return { instructors, loading, error, refetch: fetchAll };
}
