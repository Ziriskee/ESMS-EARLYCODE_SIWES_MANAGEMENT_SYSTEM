import { NotificationsFeed } from "../../shared/components/notifications/NotificationsFeed";
import { useNotificationsContext } from "@/contexts/useNotificationsContext";

export default function InternNotificationsPage() {
  const { notifications, loading, error, markAsRead, markAllAsRead } =
    useNotificationsContext();

  return (
    <NotificationsFeed
      notifications={notifications}
      loading={loading}
      error={error}
      onMarkRead={markAsRead}
      onMarkAllRead={markAllAsRead}
    />
  );
}
