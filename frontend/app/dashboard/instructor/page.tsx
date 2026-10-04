import { useNavigate } from "react-router-dom";
import { Card } from "../shared/ui/Card";
import { EmptyState } from "../shared/ui/EmptyState";
import { FileText, Users, UserCheck, CheckCircle } from "lucide-react";
import { useInstructorDashboardContext } from "@/contexts/useInstructorDashboardContext";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export default function InstructorOverviewPage() {
  const { data, loading, error } = useInstructorDashboardContext();
  const navigate = useNavigate();

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

  const { stats, interns, pending_reports, recently_reviewed } = data;

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Stats Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Interns"
          value={stats.total_interns}
          sub="Assigned to you"
          accent={false}
        />
        <StatCard
          icon={UserCheck}
          label="Active Interns"
          value={stats.active_interns}
          sub="Currently on placement"
          accent={false}
        />
        <StatCard
          icon={FileText}
          label="Pending Reports"
          value={stats.pending_reports}
          sub="Awaiting your review"
          accent={true}
        />
        <StatCard
          icon={CheckCircle}
          label="Reviewed Reports"
          value={stats.reviewed_reports}
          sub="All time"
          accent={false}
        />
      </section>

      {/* Two-column: Pending Reports + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pending Reports */}
        <Card padding="lg">
          <div className="mb-4">
            <h2
              className="text-[18px] sm:text-[20px] font-semibold leading-tight"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-display)",
              }}
            >
              Reports to review
            </h2>
            <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
              {pending_reports.length} pending
            </p>
          </div>
          {pending_reports.length === 0 ? (
            <EmptyState
              title="No pending reports."
              description="Reports submitted by your interns will appear here."
            />
          ) : (
            <ul className="flex flex-col">
              {pending_reports.slice(0, 5).map((report, i) => (
                <li key={report.id}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard/instructor/reports", {
                        state: { openId: report.id },
                      })
                    }
                    className="w-full flex items-start gap-3 py-3.5 -mx-2 px-2 rounded-xl text-left transition-colors hover:bg-[var(--tint)]"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                    }}
                  >
                    <div className="h-9 w-9 rounded-full grid place-items-center shrink-0 mt-0.5">
                      <FileText
                        size={16}
                        strokeWidth={1.8}
                        style={{ color: "var(--gold-700)" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[14px] font-semibold leading-snug truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {report.title}
                      </p>
                      <p
                        className="text-[12px] mt-0.5 truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {report.intern.name}
                      </p>
                    </div>
                    <span
                      className="text-[11px] shrink-0 pt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      {relativeTime(report.submitted_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {pending_reports.length > 5 && (
            <button
              type="button"
              onClick={() => navigate("/dashboard/instructor/reports")}
              className="mt-3 text-[12.5px] font-semibold"
              style={{ color: "var(--gold-800)" }}
            >
              View all {pending_reports.length} reports →
            </button>
          )}
        </Card>

        {/* Recent Activity */}
        <Card padding="lg">
          <div className="mb-4">
            <h2
              className="text-[18px] sm:text-[20px] font-semibold leading-tight"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-display)",
              }}
            >
              Recent activity
            </h2>
            <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
              Reports you've reviewed
            </p>
          </div>
          {recently_reviewed.length === 0 ? (
            <EmptyState
              title="No recent activity."
              description="Reports you approve or send back for revision will appear here."
            />
          ) : (
            <ul className="flex flex-col">
              {recently_reviewed.slice(0, 5).map((report, i) => (
                <li key={report.id}>
                  <div
                    className="flex items-start gap-3 py-3.5 -mx-2 px-2"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                    }}
                  >
                    <div className="h-9 w-9 rounded-full grid place-items-center shrink-0 mt-0.5">
                      <CheckCircle
                        size={16}
                        strokeWidth={1.8}
                        style={{
                          color:
                            report.status === "APPROVED"
                              ? "var(--status-approved-text)"
                              : "var(--status-review-text)",
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[14px] font-semibold leading-snug truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {report.title}
                      </p>
                      <p
                        className="text-[12px] mt-0.5 truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {report.intern.name} ·{" "}
                        {report.status === "APPROVED"
                          ? "Approved"
                          : "Needs revision"}
                      </p>
                    </div>
                    <span
                      className="text-[11px] shrink-0 pt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      {report.reviewed_at
                        ? relativeTime(report.reviewed_at)
                        : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* My Interns (compact list) */}
      <Card padding="lg">
        <div className="mb-4">
          <h2
            className="text-[18px] sm:text-[20px] font-semibold leading-tight"
            style={{
              color: "var(--text)",
              fontFamily: "var(--font-display)",
            }}
          >
            My interns
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {interns.length} assigned
          </p>
        </div>
        {interns.length === 0 ? (
          <EmptyState
            title="No interns assigned."
            description="The admin will assign interns to you. They'll appear here."
          />
        ) : (
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr
                  className="text-[10.5px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  <th className="font-semibold py-3 pl-4 sm:pl-0 pr-4">Name</th>
                  <th className="font-semibold py-3 px-4 whitespace-nowrap">
                    Campus
                  </th>
                  <th className="font-semibold py-3 px-4 whitespace-nowrap">
                    Status
                  </th>
                  <th className="font-semibold py-3 px-4 whitespace-nowrap">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern) => (
                  <tr
                    key={intern.id}
                    className="transition-colors hover:bg-[var(--tint)]"
                    style={{ borderTop: "1px solid var(--line)" }}
                  >
                    <td className="py-3 pl-4 sm:pl-0 pr-4">
                      <p
                        className="text-[14px] font-semibold leading-snug"
                        style={{ color: "var(--text)" }}
                      >
                        {intern.name}
                      </p>
                      <p
                        className="text-[12px] mt-0.5"
                        style={{ color: "var(--muted)" }}
                      >
                        {intern.email}
                      </p>
                    </td>
                    <td
                      className="py-3 px-4 text-[13px] whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {intern.campus
                        ? intern.campus.charAt(0).toUpperCase() +
                          intern.campus.slice(1)
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                        style={{
                          backgroundColor:
                            intern.status === "ACTIVE"
                              ? "var(--status-approved-bg)"
                              : "var(--tint)",
                          color:
                            intern.status === "ACTIVE"
                              ? "var(--status-approved-text)"
                              : "var(--muted)",
                        }}
                      >
                        {intern.status}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-[13px] whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {intern.school_start_date && intern.school_end_date
                        ? `${formatDate(intern.school_start_date)} – ${formatDate(intern.school_end_date)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  value: number;
  sub: string;
  accent: boolean;
}) {
  return (
    <article
      className="relative overflow-hidden rounded-[24px] border p-5 md:p-6"
      style={
        accent
          ? {
              background:
                "linear-gradient(140deg, #FFE566 0%, #FFD60A 52%, #F2C200 100%)",
              borderColor: "rgba(27, 22, 7, 0.1)",
              color: "var(--coal)",
              boxShadow: "0 22px 50px -22px rgba(242, 194, 0, 0.5)",
            }
          : {
              backgroundColor: "var(--surface)",
              borderColor: "var(--line)",
            }
      }
    >
      {accent && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border"
            style={{ borderColor: "rgba(27, 22, 7, 0.1)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-4 h-24 w-24 rounded-full border"
            style={{ borderColor: "rgba(27, 22, 7, 0.1)" }}
          />
        </>
      )}
      <div className="relative flex items-start justify-between gap-2">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={
            accent
              ? {
                  backgroundColor: "rgba(27, 22, 7, 0.1)",
                  color: "var(--coal)",
                }
              : {
                  backgroundColor: "rgba(255, 214, 10, 0.1)",
                  color: "var(--gold-700)",
                  border: "1px solid rgba(255, 214, 10, 0.25)",
                }
          }
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
      <p
        className="relative mt-7 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={
          accent ? { color: "rgba(27, 22, 7, 0.6)" } : { color: "var(--muted)" }
        }
      >
        {label}
      </p>
      <p
        className="relative mt-2 text-4xl md:text-[42px] font-semibold leading-none tracking-tight"
        style={{
          color: accent ? "var(--coal)" : "var(--text)",
          fontFamily: "var(--font-display)",
        }}
      >
        {String(value).padStart(2, "0")}
      </p>
      <p
        className="relative mt-3 text-xs"
        style={
          accent ? { color: "rgba(27, 22, 7, 0.6)" } : { color: "var(--muted)" }
        }
      >
        {sub}
      </p>
    </article>
  );
}
