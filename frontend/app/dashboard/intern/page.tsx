import { useState } from "react";
import { WelcomeCard } from "./components/WelcomeCard";
import { ProgressCard } from "./components/ProgressCard";
import { StatsRow } from "./components/StatsRow";
import { ScheduleModal } from "./components/ScheduleModal";
import { EmptyState } from "../shared/ui/EmptyState";
import { Card } from "../shared/ui/Card";
import { useDashboardDataContext } from "@/contexts/useDashboardDataContext";
// import { useNavigate } from "react-router-dom";

export default function InternOverviewPage() {
  // const navigate = useNavigate();
  const { data, loading, error } = useDashboardDataContext();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <Card padding="lg">
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
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

  const { user, placement, stats, attendance } = data || {};
  const safeStats = stats || {
    tasks_completed: 0,
    tasks_pending: 0,
    unread_messages: 0,
    unread_conversations: 0,
    unread_notifications: 0,
  };
  const safeAttendance = attendance || {
    has_schedule: false,
    upcoming_days: [],
  };

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
        tasksCompleted={safeStats.tasks_completed}
        tasksPending={safeStats.tasks_pending}
        unreadMessages={safeStats.unread_messages}
        daysRemaining={placement?.days_remaining ?? null}
      />
      <ScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hasSchedule={safeAttendance.has_schedule}
        days={safeAttendance.upcoming_days}
      />
    </div>
  );
}

