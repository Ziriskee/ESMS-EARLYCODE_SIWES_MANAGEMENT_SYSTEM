import { useAuth } from "@/contexts/useAuth";
import { useDashboardDataContext } from "@/contexts/useDashboardDataContext";
import { MessagesLayout } from "../../shared/components/messages/MessagesLayout";

export default function InternMessagesPage() {
  const { user } = useAuth();
  const { refetch: refetchDashboard } = useDashboardDataContext();
  if (!user) return null;
  return (
    <MessagesLayout
      currentUserId={user.id}
      onConversationOpened={refetchDashboard}
    />
  );
}
