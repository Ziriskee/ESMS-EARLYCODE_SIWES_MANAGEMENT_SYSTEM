import { useNotificationsContext } from "@/contexts/useNotificationsContext";
import { NotificationsFeed } from "../../shared/components/notifications/NotificationsFeed";

export default function AdminNotificationsPage() {
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
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          onLoadMore={loadMore}
        />
  );
}
