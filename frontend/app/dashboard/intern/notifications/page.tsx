import { useNotificationsContext } from "@/contexts/useNotificationsContext";
import { NotificationsFeed } from "../../shared/components/notifications/NotificationsFeed";

export default function InternNotificationsPage() {
const {
  notifications,
  loading,
  error,
  hasMore,
  loadMore,
  markAsRead,
  markAllAsRead,
} = useNotificationsContext();

  return (
    <NotificationsFeed
      notifications={notifications}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onMarkRead={markAsRead}
      onMarkAllRead={markAllAsRead}
    />
  );
}
