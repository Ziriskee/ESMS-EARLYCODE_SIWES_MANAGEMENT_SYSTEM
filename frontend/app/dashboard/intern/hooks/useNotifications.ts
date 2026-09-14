import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import type { NotificationType } from "../components/notificationMeta";

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
};

type UseNotificationsResult = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await apiFetch<
          Notification[] | { results: Notification[] }
        >("/notifications/");
        const list = Array.isArray(result) ? result : (result.results ?? []);
        if (isMounted) setNotifications(list);
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

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );

    try {
      await apiFetch(`/notifications/${id}/read/`, { method: "PATCH" });
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await apiFetch("/notifications/mark-all-read/", { method: "POST" });
    } catch {
      setNotifications(previous);
    }
  }, [notifications]);

  return { notifications, loading, error, markAsRead, markAllAsRead };
}
