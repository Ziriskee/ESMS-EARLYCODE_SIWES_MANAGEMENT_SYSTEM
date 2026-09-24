import { Card } from "../shared/ui/Card";
import { EmptyState } from "../shared/ui/EmptyState";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { StatsRow } from "./components/StatsRow";
import { PendingPreview } from "./components/PendingPreview";
import { MessagesPreview } from "./components/MessagesPreview";

export default function AdminOverviewPage() {
  const { stats, pending, loading, error } = useAdminDashboard();

  if (loading) {
    return (
      <Card padding="lg">
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
          Loading admin overview...
        </p>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card padding="lg">
        <EmptyState
          title="We couldn't load the admin overview."
          description={error ?? "Please try again in a moment."}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      <StatsRow stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 md:gap-6">
        <PendingPreview
          pending={pending}
          onSelect={(intern) => {
            // Wired in C2.8 (Review Modal)
            console.log("open review for", intern.id);
          }}
        />
        <MessagesPreview />
      </div>
    </div>
  );
}
