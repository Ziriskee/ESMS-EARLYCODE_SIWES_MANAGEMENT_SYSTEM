import { useState } from "react";
import { useCampusFilter } from "@/contexts/useCampusFilter";
import { usePendingInterns } from "../hooks/usePendingInterns";
import { useInternSubmission } from "../hooks/useInternSubmission";
import { PendingTable } from "../components/PendingTable";
import { ReviewModal } from "../components/ReviewModal";
import { EditSubmissionModal } from "../components/EditSubmissionModal";
import { AcceptWizard } from "../components/wizard/AcceptWizard";
import type { PendingInternSummary, InternSubmission } from "../types";

export default function AdminPendingPage() {
  const { pending, loading, error, refetch } = usePendingInterns();
  const { campus } = useCampusFilter();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSubmission, setWizardSubmission] =
    useState<InternSubmission | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const {
    submission,
    loading: submissionLoading,
    error: submissionError,
    refetch: refetchSubmission,
  } = useInternSubmission(selectedId);

  const handleSelect = (intern: PendingInternSummary) => {
    setSelectedId(intern.id);
    setReviewOpen(true);
  };

  const handleReviewClose = () => {
    setReviewOpen(false);
        setEditOpen(false);

  };

  const handleAccept = (sub: InternSubmission) => {
    setWizardSubmission(sub);
    setReviewOpen(false);
    setWizardOpen(true);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
  };        

  const handleCompleted = () => {
    refetch();
  };

  const handleRejected = () => {
    refetch();
  };

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <PendingTable
          pending={pending}
          loading={loading}
          error={error}
          campusFilter={campus}
          onSelect={handleSelect}
        />
      </div>

      <ReviewModal
        open={reviewOpen}
        onClose={handleReviewClose}
        submission={submission}
        loading={submissionLoading}
        error={submissionError}
        onRejected={handleRejected}
        onAccept={handleAccept}
        onEdit={() => setEditOpen(true)}
      />
      <EditSubmissionModal
        key={selectedId ? `edit-${selectedId}` : "edit-closed"}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        submission={submission}
        onSaved={refetchSubmission}
      />

      <AcceptWizard
        key={
          wizardSubmission ? `wizard-${wizardSubmission.id}` : "wizard-closed"
        }
        open={wizardOpen}
        onClose={handleWizardClose}
        submission={wizardSubmission}
        onCompleted={handleCompleted}
      />
    </>
  );
}
