import { useState } from "react";
import { useReports, type Report } from "../hooks/useReports";
import { ReportDetailModal } from "../components/ReportDetailModal";

export default function InternReportsPage() {
  const { reports, loading, error } = useReports();
  const [selected, setSelected] = useState<Report | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className="flex items-center gap-3">
            <span>
              [{r.status}] {r.title}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelected(r);
                setModalOpen(true);
              }}
              className="text-[12px] underline"
            >
              Open
            </button>
          </li>
        ))}
      </ul>

      <ReportDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        report={selected}
      />
    </div>
  );
}
