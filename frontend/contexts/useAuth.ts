import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "INSTRUCTOR" | "INTERN";
  [key: string]: unknown;
};

type UseAuthResult = {
  user: User | null;
  loading: boolean;
  login: (u: User) => void;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  const refetch = useCallback(async () => {
    try {
      const me = await apiFetch<User>("/auth/me/");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const me = await apiFetch<User>("/auth/me/");
        if (isMounted) setUser(me);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((u: User) => {
    setUser(u);
  }, []);

const logout = useCallback(async () => {
  setLoading(true);
  try {
    await apiFetch("/auth/logout/", { method: "POST" });
  } catch {
    /* ignore */
  } finally {
    setUser(null);
    setLoading(false);
  }
}, []);

  return { user, loading, login, logout, refetch };
}
