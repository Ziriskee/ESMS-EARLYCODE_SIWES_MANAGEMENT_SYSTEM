import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { InstructorTask } from "../types";

type UseInstructorTasksResult = {
  tasks: InstructorTask[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useInstructorTasks(): UseInstructorTasksResult {
  const [tasks, setTasks] = useState<InstructorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<
        InstructorTask[] | { results: InstructorTask[] }
      >("/instructor/tasks/");
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setTasks(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
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
        const data = await apiFetch<
          InstructorTask[] | { results: InstructorTask[] }
        >("/instructor/tasks/");
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (isMounted) setTasks(list);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load tasks");
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

  return { tasks, loading, error, refetch: fetchData };
}
