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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        tone={1}
        icon={FileText}
        label="Reports submitted"
        value={pad2(reportsSubmitted)}
      />
      <StatCard
        tone={2}
        icon={ListChecks}
        label="Pending tasks"
        value={pad2(tasksPending)}
      />
      <StatCard
        tone={3}
        icon={MessageSquare}
        label="Unread messages"
        value={pad2(unreadMessages)}
      />
      <StatCard
        tone={4}
        icon={Clock}
        label="Days remaining"
        value={daysValue}
      />
    </div>
  );
}
