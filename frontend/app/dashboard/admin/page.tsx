import { Card } from "../shared/ui/Card";
import { EmptyState } from "../shared/ui/EmptyState";
import { StatsRow } from "./components/StatsRow";
import { PendingPreview } from "./components/PendingPreview";
import { MessagesPreview } from "./components/MessagesPreview";
import { useAdminDashboardContext } from "@/contexts/useAdminDashboardContext";
import { useNavigate } from "react-router-dom";

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useAdminDashboardContext();
  const stats = data?.stats;
  const pending = data?.pending ?? [];

  if (loading) {
    return (
      <Card padding="lg">
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
          Loading admin overview...
        </p>
      </Card>
    );
  }
  if (error || !data || !stats) {
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
            navigate(`/dashboard/admin/pending`, {
              state: { openId: intern.id },
            });
          }}
        />
        <MessagesPreview />
      </div>
    </div>
  );
}
