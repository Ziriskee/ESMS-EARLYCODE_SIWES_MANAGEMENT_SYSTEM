import { useState } from "react";
import { WelcomeCard } from "./components/WelcomeCard";
import { ProgressCard } from "./components/ProgressCard";
import { StatsRow } from "./components/StatsRow";
import { RecentReportsCard } from "./components/RecentReportsCard";
import { ScheduleModal } from "./components/ScheduleModal";
import { EmptyState } from "../shared/ui/EmptyState";
import { Card } from "../shared/ui/Card";
import { useDashboardDataContext } from "@/contexts/useDashboardDataContext";

export default function InternOverviewPage() {
  const { data, loading, error } = useDashboardDataContext();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <Card padding="lg">
        <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
          Loading your overview...
        </p>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card padding="lg">
        <EmptyState
          title="We couldn't load your overview."
          description={error ?? "Please try again in a moment."}
        />
      </Card>
    );
  }

  const { user, placement, stats, recent_reports, attendance } = data;

  return (
    <div className="space-y-8 pt-2">
      <WelcomeCard
        firstName={user.first_name || "there"}
        weeksCompleted={placement?.weeks_completed ?? null}
        totalWeeks={placement?.total_weeks ?? null}
      />

      <ProgressCard
        percentComplete={placement?.percent_complete ?? null}
        weeksCompleted={placement?.weeks_completed ?? null}
        totalWeeks={placement?.total_weeks ?? null}
        startDate={placement?.start_date ?? null}
        endDate={placement?.end_date ?? null}
        onViewSchedules={() => setModalOpen(true)}
      />

      <StatsRow
        reportsSubmitted={stats.reports_submitted}
        tasksPending={stats.tasks_pending}
        unreadMessages={stats.unread_messages}
        daysRemaining={placement?.days_remaining ?? null}
      />

      <RecentReportsCard
        reports={recent_reports}
        onOpenReport={(id) => {
          console.log("open report", id);
        }}
      />

      <ScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hasSchedule={attendance.has_schedule}
        days={attendance.upcoming_days}
      />
    </div>
  );
}
