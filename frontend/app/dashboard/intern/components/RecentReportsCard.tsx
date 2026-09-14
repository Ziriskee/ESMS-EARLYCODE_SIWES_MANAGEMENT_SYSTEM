import { Card } from "../../shared/ui/Card";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ReportRow } from "./ReportRow";
import type { RecentReport } from "../types";

type RecentReportsCardProps = {
  reports: RecentReport[];
  onOpenReport: (id: string) => void;
};

export function RecentReportsCard({
  reports,
  onOpenReport,
}: RecentReportsCardProps) {
  return (
    <Card padding="lg">
      <SectionHeader
        title="Recent reports"
        action={{ label: "View all →", to: "/dashboard/intern/reports" }}
      />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet."
          description="Submit your first report to see it here."
        />
      ) : (
        <div
          className="divide-y"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {reports.map((report) => (
            <ReportRow
              key={report.id}
              title={report.title}
              submittedAt={report.submitted_at}
              status={report.status}
              onOpen={() => onOpenReport(report.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
