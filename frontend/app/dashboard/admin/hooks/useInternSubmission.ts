import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { InternSubmission } from "../types";

type UseInternSubmissionResult = {
  submission: InternSubmission | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Fetches the full submission for one intern when `internId` is non-null.
 * Pass `null` to skip fetching (e.g. when the modal is closed).
 *
 * When `internId` is null, the hook returns `submission: null` without
 * calling setState in an effect (React 19 rule). The "no data" state is
 * derived, not stored.
 */
export function useInternSubmission(
  internId: string | null,
): UseInternSubmissionResult {
  // Two pieces of state — both only ever written from async callbacks.
  const [submission, setSubmission] = useState<InternSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = useCallback(async () => {
    if (!internId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<InternSubmission>(
        `/admin/interns/${internId}/submission/`,
      );
      setSubmission(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load submission",
      );
    } finally {
      setLoading(false);
    }
  }, [internId]);

  useEffect(() => {
    if (!internId) return;

    let isMounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<InternSubmission>(
          `/admin/interns/${internId}/submission/`,
        );
        if (isMounted) setSubmission(data);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load submission",
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

  // When internId is null, derive the empty state — don't write it via effect.
  if (!internId) {
    return {
      submission: null,
      loading: false,
      error: null,
      refetch: fetchSubmission,
    };
  }

  return { submission, loading, error, refetch: fetchSubmission };
}
