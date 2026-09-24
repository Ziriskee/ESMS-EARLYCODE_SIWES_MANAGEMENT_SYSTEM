import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { SectionHeader } from "../../shared/ui/SectionHeader";

export function MessagesPreview() {
  return (
    <Card padding="lg">
      <SectionHeader
        title="Recent messages"
        subtitle="Inbox preview"
      />
      <EmptyState
        title="Messages coming soon."
        description="Once messaging is live, your recent conversations will appear here."
      />
    </Card>
  );
}