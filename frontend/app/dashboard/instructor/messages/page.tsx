import { useAuth } from "@/contexts/useAuth";
import { useInstructorDashboardContext } from "@/contexts/useInstructorDashboardContext";
import { MessagesLayout } from "../../shared/components/messages/MessagesLayout";

export default function InstructorMessagesPage() {
  const { user } = useAuth();
  const { refetch: refetchDashboard } = useInstructorDashboardContext();
  if (!user) return null;
  return (
    <MessagesLayout
      currentUserId={user.id}
      onConversationOpened={refetchDashboard}
    />
  );
}
