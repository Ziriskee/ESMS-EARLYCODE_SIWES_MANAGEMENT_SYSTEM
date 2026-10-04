import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useInstructorReports } from "../hooks/useInstructorReports";
import { ReportsList, type ReportTab } from "../components/ReportsList";
import { ReportReviewModal } from "../components/ReportReviewModal";
import type { InstructorReport } from "../types";

type LocationState = { openId?: string } | null;

export default function InstructorReportsPage() {
  const { reports, loading, error, refetch } = useInstructorReports();
  const [tab, setTab] = useState<ReportTab>("review");
  const [selected, setSelected] = useState<InstructorReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Consume a deep-link from the Overview page ("open this report").
  // Render-time adjustment (React 19 safe): conditional setState during
  // render, never inside an effect.
  const location = useLocation();
  const openId = (location.state as LocationState)?.openId ?? null;
  const [consumedOpenId, setConsumedOpenId] = useState<string | null>(null);
  if (openId && openId !== consumedOpenId && !loading) {
    const target = reports.find((r) => r.id === openId);
    if (target) {
      setSelected(target);
      setModalOpen(true);
    }
    setConsumedOpenId(openId);
  }

  const review = reports.filter((r) => r.status === "SUBMITTED");
  const reviewed = reports.filter(
    (r) =>
      r.status === "APPROVED" ||
      r.status === "NEEDS_REVISION" ||
      r.status === "REVIEWED",
  );
  const visible =
    tab === "review" ? review : tab === "reviewed" ? reviewed : reports;

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <ReportsList
          reports={visible}
          counts={{
            review: review.length,
            reviewed: reviewed.length,
            all: reports.length,
          }}
          tab={tab}
          onTabChange={setTab}
          loading={loading}
          error={error}
          onSelect={(r) => {
            setSelected(r);
            setModalOpen(true);
          }}
        />
      </div>
      <ReportReviewModal
        key={selected?.id ?? "none"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        report={selected}
        onReviewed={refetch}
      />
    </>
  );
}
