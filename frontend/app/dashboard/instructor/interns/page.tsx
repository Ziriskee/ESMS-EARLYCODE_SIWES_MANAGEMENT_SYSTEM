import { useState } from "react";
import { useMyInterns } from "../hooks/useMyInterns";
import { useInternDetail } from "../hooks/useInternDetail";
import { InternsTable } from "../components/InternsTable";
import { InternDetailModal } from "../components/InternDetailModal";
import type { AssignedInternSummary } from "../types";

export default function InstructorInternsPage() {
  const { interns, loading, error } = useMyInterns();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    detail,
    loading: detailLoading,
    error: detailError,
  } = useInternDetail(selectedId);

  const handleSelect = (intern: AssignedInternSummary) => {
    setSelectedId(intern.id);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <InternsTable
          interns={interns}
          loading={loading}
          error={error}
          onSelect={handleSelect}
        />
      </div>
      <InternDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        detail={detail}
        loading={detailLoading}
        error={detailError}
      />
    </>
  );
}
