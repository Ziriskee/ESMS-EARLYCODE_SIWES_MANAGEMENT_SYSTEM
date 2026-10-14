import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";

export type InternTaskStatus =
  | "PENDING"
  | "SUBMITTED"
  | "REVIEWED"
  | "NEEDS_REVISION";

export type InternTaskAttachment = {
  id: string;
  file: string;
  uploaded_at: string;
};

export type InternTaskInfo = {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  created_at: string;
  attachments: InternTaskAttachment[];
  instructor: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    department: string;
  };
};

export type InternTaskAssignment = {
  id: string;
  status: InternTaskStatus;
  submitted_at: string | null;
  instructor_feedback: string;
  created_at: string;
  task: InternTaskInfo;
  submission_file_url: string | null;
};

type UseMyTasksResult = {
  tasks: InternTaskAssignment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useMyTasks(): UseMyTasksResult {
  const [tasks, setTasks] = useState<InternTaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<
        InternTaskAssignment[] | { results: InternTaskAssignment[] }
      >("/intern/tasks/");
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
          InternTaskAssignment[] | { results: InternTaskAssignment[] }
        >("/intern/tasks/");
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
