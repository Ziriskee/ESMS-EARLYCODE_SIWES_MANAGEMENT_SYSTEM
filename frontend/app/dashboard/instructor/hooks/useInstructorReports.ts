import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { InstructorReport, InstructorReportsResponse } from "../types";

type UseInstructorReportsResult = {
  reports: InstructorReport[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useInstructorReports(): UseInstructorReportsResult {
  const [reports, setReports] = useState<InstructorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<InstructorReportsResponse>(
        "/instructor/reports/",
      );
      setReports(data.results ?? []);
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
        const data = await apiFetch<InstructorReportsResponse>(
          "/instructor/reports/",
        );
        if (isMounted) setReports(data.results ?? []);
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

  return { reports, loading, error, refetch: fetchData };
}
