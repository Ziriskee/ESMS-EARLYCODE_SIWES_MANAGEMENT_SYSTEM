import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { InstructorOwnProfile } from "../types";

type UseInstructorProfileResult = {
  profile: InstructorOwnProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useInstructorProfile(): UseInstructorProfileResult {
  const [profile, setProfile] = useState<InstructorOwnProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<InstructorOwnProfile>("/instructor/profile/");
      setProfile(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your profile",
      );
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
        const data = await apiFetch<InstructorOwnProfile>(
          "/instructor/profile/",
        );
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load your profile",
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

  return { profile, loading, error, refetch: fetchData };
}
