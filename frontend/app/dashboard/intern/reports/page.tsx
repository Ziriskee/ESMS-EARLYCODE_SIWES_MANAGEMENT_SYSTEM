import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusChip } from "../../shared/data/StatusChip";
import {
  useReports,
  type Report,
  type ReportStatus,
} from "../hooks/useReports";
import { ReportDetailModal } from "../components/ReportDetailModal";

type FilterTab = "ALL" | "DRAFT" | "SUBMITTED" | "REVIEWED";
type SortOrder = "NEWEST" | "OLDEST";

function chipForStatus(status: ReportStatus) {
  switch (status) {
    case "REVIEWED":
      return { tone: "approved" as const, label: "Reviewed" };
    case "SUBMITTED":
      return { tone: "review" as const, label: "Submitted" };
    case "DRAFT":
      return { tone: "neutral" as const, label: "Draft" };
  }
}

function formatDate(iso: string): string {
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

export default function InternReportsPage() {
  const { reports, loading, error, hasMore, loadMore, refetch } = useReports();

  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [sort, setSort] = useState<SortOrder>("NEWEST");
  const [query, setQuery] = useState("");

  const [selected, setSelected] = useState<Report | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reports;

    if (filter !== "ALL") {
      list = list.filter((r) => r.status === filter);
    }
    if (q) {
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }

    const sorted = [...list].sort((a, b) => {
      const ta = new Date(a.submitted_at).getTime();
      const tb = new Date(b.submitted_at).getTime();
      return sort === "NEWEST" ? tb - ta : ta - tb;
    });
    return sorted;
  }, [reports, filter, sort, query]);

  const counts = useMemo(
    () => ({
      ALL: reports.length,
      DRAFT: reports.filter((r) => r.status === "DRAFT").length,
      SUBMITTED: reports.filter((r) => r.status === "SUBMITTED").length,
      REVIEWED: reports.filter((r) => r.status === "REVIEWED").length,
    }),
    [reports],
  );

  const openReport = (r: Report) => {
    setSelected(r);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card padding="lg">
        {/* Header row: title + action */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2
              className="text-[18px] sm:text-[20px] font-semibold leading-tight"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-display)",
              }}
            >
              Reports
            </h2>
            <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
              {counts.ALL} total · {counts.DRAFT} draft
              {counts.DRAFT === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            disabled
            className="h-9 px-4 rounded-full text-[13px] font-semibold shrink-0"
            style={{
              backgroundColor: "var(--gold-500)",
              color: "var(--coal)",
              opacity: 0.5,
              cursor: "not-allowed",
            }}
            title="Create flow coming soon"
          >
            New report
          </button>
        </div>

        {/* Controls row: tabs (left) + sort (right) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div
            className="flex items-center gap-1 rounded-full p-1 overflow-x-auto max-w-full"
            style={{ backgroundColor: "var(--surface2)" }}
          >
            {(["ALL", "DRAFT", "SUBMITTED", "REVIEWED"] as FilterTab[]).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilter(t)}
                  className="h-7 px-3 sm:px-4 rounded-full text-[12px] sm:text-[12.5px] font-semibold transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor:
                      filter === t ? "var(--surface)" : "transparent",
                    color: filter === t ? "var(--text)" : "var(--muted)",
                  }}
                >
                  {t === "ALL"
                    ? "All"
                    : t === "DRAFT"
                      ? "Drafts"
                      : t === "SUBMITTED"
                        ? "Submitted"
                        : "Reviewed"}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setSort((s) => (s === "NEWEST" ? "OLDEST" : "NEWEST"))
            }
            className="h-9 px-3.5 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-2 shrink-0"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          >
            <ArrowUpDown size={14} strokeWidth={2} />
            {sort === "NEWEST" ? "Newest" : "Oldest"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted)" }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full h-10 pl-9 pr-3 rounded-full text-[13px] outline-none"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          />
        </div>

        {/* Body */}
        {loading && (
          <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
            Loading reports...
          </p>
        )}

        {!loading && error && (
          <EmptyState
            title="We couldn't load your reports."
            description={error}
          />
        )}

        {!loading && !error && reports.length === 0 && (
          <EmptyState
            title="No reports yet."
            description="Submit your first report to see it here."
          />
        )}

        {!loading && !error && reports.length > 0 && visible.length === 0 && (
          <EmptyState title="No reports match your filters." />
        )}

        {!loading && !error && visible.length > 0 && (
          <>
            {/* Mobile: horizontal scroll on the table */}
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr
                    className="text-[10.5px] uppercase tracking-[0.14em]"
                    style={{ color: "var(--muted)" }}
                  >
                    <th className="font-semibold py-3 pl-4 sm:pl-0 pr-4">
                      Report
                    </th>
                    <th className="font-semibold py-3 px-4 whitespace-nowrap">
                      Submitted
                    </th>
                    <th className="font-semibold py-3 px-4 whitespace-nowrap">
                      Status
                    </th>
                    <th className="font-semibold py-3 pl-4 pr-4 sm:pr-0 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const chip = chipForStatus(r.status);
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-[var(--tint)]"
                        style={{ borderTop: "1px solid var(--line)" }}
                      >
                        <td className="py-4 pl-4 sm:pl-0 pr-4">
                          <p
                            className="text-[14px] font-semibold leading-snug truncate max-w-[260px]"
                            style={{ color: "var(--text)" }}
                          >
                            {r.title}
                          </p>
                        </td>
                        <td
                          className="py-4 px-4 text-[13px] tabular-nums whitespace-nowrap"
                          style={{ color: "var(--muted)" }}
                        >
                          {formatDate(r.submitted_at)}
                        </td>
                        <td className="py-4 px-4">
                          <StatusChip tone={chip.tone} label={chip.label} />
                        </td>
                        <td className="py-4 pl-4 pr-4 sm:pr-0 text-right">
                          <button
                            type="button"
                            onClick={() => openReport(r)}
                            className="h-8 px-4 rounded-full text-[12.5px] font-semibold transition-colors"
                            style={{
                              backgroundColor: "var(--surface2)",
                              color: "var(--text)",
                              border: "1px solid var(--line)",
                            }}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Load more */}
            {hasMore && (
              <div
                className="flex justify-center pt-4 mt-2 border-t"
                style={{ borderColor: "var(--line)" }}
              >
                <button
                  type="button"
                  onClick={() => loadMore()}
                  className="h-9 px-5 rounded-full text-[13px] font-semibold"
                  style={{
                    backgroundColor: "var(--surface2)",
                    color: "var(--text)",
                    border: "1px solid var(--line)",
                  }}
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      <ReportDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          refetch();
        }}
        report={selected}
      />
    </div>
  );
}
