import { NotificationsFeed } from "../components/NotificationsFeed";
import { useNotifications } from "../hooks/useNotifications";
import { useDashboardDataContext } from "@/contexts/useDashboardDataContext";

export default function InternNotificationsPage() {
  const { notifications, loading, error, markAsRead, markAllAsRead } =
    useNotifications();
  const { refetch: refetchDashboard } = useDashboardDataContext();

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    await refetchDashboard();
  };

  return (
    <NotificationsFeed
      notifications={notifications}
      loading={loading}
      error={error}
      onMarkRead={markAsRead}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}
