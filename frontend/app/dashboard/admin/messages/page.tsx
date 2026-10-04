import { useOutletContext } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { MessagesLayout } from "../../shared/components/messages/MessagesLayout";

type OutletContextType = {
  refetchDashboard: () => Promise<void>;
};

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const { refetchDashboard } = useOutletContext<OutletContextType>();

  if (!user) return null;

  return (
    <MessagesLayout
      currentUserId={user.id}
      onConversationOpened={refetchDashboard} // Refetch when conversation is opened
    />
  );
}
