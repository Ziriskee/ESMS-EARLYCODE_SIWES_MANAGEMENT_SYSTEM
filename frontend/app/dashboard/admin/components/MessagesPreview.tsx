import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function MessagesPreview() {
  return (
    <Card padding="lg">
      <SectionHeader
        title="Messages"
        subtitle="Conversations with interns and instructors"
        action={{ label: "Open messages", to: "/dashboard/admin/messages" }}
      />
      <EmptyState
        title="Your inbox lives in Messages."
        description="Start or continue a conversation with any intern or instructor from the Messages page."
      />
    </Card>
  );
}
