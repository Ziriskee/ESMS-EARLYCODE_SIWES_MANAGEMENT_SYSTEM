import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { NotificationType } from "../components/notifications/notificationMeta";

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
};

type PaginatedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
};

export type UseNotificationsResult = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
};

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const result = await apiFetch<Notification[] | PaginatedResponse>(
          "/notifications/",
        );
        if (Array.isArray(result)) {
          // Fallback if backend ever returns unpaginated
          if (isMounted) {
            setNotifications(result);
            setNextUrl(null);
          }
        } else {
          if (isMounted) {
            setNotifications(result.results ?? []);
            setNextUrl(result.next ?? null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load notifications",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await apiFetch<PaginatedResponse>(nextUrl);
      setNotifications((prev) => [...prev, ...(result.results ?? [])]);
      setNextUrl(result.next ?? null);
    } catch (err) {
      console.error("Failed to load more notifications:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await apiFetch(`/notifications/${id}/read/`, { method: "PATCH" });
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const previous = prev;
      const next = prev.map((n) => ({ ...n, is_read: true }));
      apiFetch("/notifications/mark-all-read/", { method: "POST" }).catch(
        () => {
          setNotifications(previous);
        },
      );
      return next;
    });
  }, []);

  return {
    notifications,
    loading,
    error,
    hasMore: nextUrl !== null,
    markAsRead,
    markAllAsRead,
    loadMore,
  };
}
