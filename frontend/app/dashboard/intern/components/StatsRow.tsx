import { Clock, FileText, ListChecks, MessageSquare } from "lucide-react";
import { StatCard } from "./StatCard";

type StatsRowProps = {
  reportsSubmitted: number;
  tasksPending: number;
  unreadMessages: number;
  daysRemaining: number | null;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function StatsRow({
  reportsSubmitted,
  tasksPending,
  unreadMessages,
  daysRemaining,
}: StatsRowProps) {
  const daysValue =
    typeof daysRemaining === "number" ? pad2(daysRemaining) : "—";

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        tone={1}
        icon={FileText}
        label="Reports submitted"
        value={pad2(reportsSubmitted)}
        sub="All time"
      />
      <StatCard
        tone={2}
        icon={ListChecks}
        label="Pending tasks"
        value={pad2(tasksPending)}
        sub="Awaiting your action"
      />
      <StatCard
        tone={3}
        icon={MessageSquare}
        label="Unread messages"
        value={pad2(unreadMessages)}
        sub="From your supervisor"
      />
      <StatCard
        tone={4}
        icon={Clock}
        label="Days remaining"
        value={daysValue}
        sub="Until your placement ends"
      />
    </section>
  );
}
