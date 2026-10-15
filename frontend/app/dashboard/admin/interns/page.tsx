import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useCampusFilter } from "@/contexts/useCampusFilter";
import { useAllInterns } from "../hooks/useAllInterns";
import { useInternSubmission } from "../hooks/useInternSubmission";
import {
  AllInternsTable,
  type AllInternFilter,
} from "../components/AllInternsTable";
import { ReviewModal } from "../components/ReviewModal";
import { AcceptWizard } from "../components/wizard/AcceptWizard";
import { AssignInstructorModal } from "../components/AssignInstructorModal";
import type { AllInternSummary, InternSubmission } from "../types";
import { apiFetch } from "@/lib/api";
import { ConfirmModal } from "../../shared/ui/ConfirmModal";
import { EditSubmissionModal } from "../components/EditSubmissionModal";
import { InternDocumentsModal } from "../components/InternDocumentsModal";

export default function AdminAllInternsPage() {
  const { campus } = useCampusFilter();
  const [filter, setFilter] = useState<AllInternFilter>("active");
    const [deactivateIntern, setDeactivateIntern] =
      useState<AllInternSummary | null>(null);
    const [deactivating, setDeactivating] = useState(false);
    const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search to avoid firing on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { interns, loading, error, count, page, totalPages, setPage, refetch } =
    useAllInterns(filter, debouncedSearch, campus);

  // Review modal state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const {
    submission,
    loading: submissionLoading,
    error: submissionError,
    refetch: refetchSubmission,
  } = useInternSubmission(selectedId);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSubmission, setWizardSubmission] =
    useState<InternSubmission | null>(null);

  // Assign instructor modal state
  const [assignIntern, setAssignIntern] = useState<AllInternSummary | null>(
    null,
  );
  
    const [documentsIntern, setDocumentsIntern] =
      useState<AllInternSummary | null>(null);

  const handleRowClick = (intern: AllInternSummary) => {
    setSelectedId(String(intern.id));
    setReviewOpen(true);
  };

  const handleAccept = (sub: InternSubmission) => {
    setWizardSubmission(sub);
    setReviewOpen(false);
    setWizardOpen(true);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-3 rounded-full text-[13px] outline-none"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          />
        </div>

        <AllInternsTable
          interns={interns}
          loading={loading}
          error={error}
          filter={filter}
          onFilterChange={setFilter}
          showCampus={campus === "all"}
          count={count}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onRowClick={handleRowClick}
          onOpenDocuments={(i) => setDocumentsIntern(i)}
          onAssignInstructor={(i) => setAssignIntern(i)}
          onConfigure={async (i) => {
            try {
              const sub = await apiFetch<InternSubmission>(
                `/admin/interns/${i.id}/submission/`,
              );
              setWizardSubmission(sub);
              setWizardOpen(true);
            } catch (err) {
              console.error("Failed to load submission for configure:", err);
            }
          }}
          onDeactivate={(i) => setDeactivateIntern(i)}
        />
      </div>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        submission={submission}
        loading={submissionLoading}
        error={submissionError}
        onRejected={refetch}
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
        onClose={() => {
          setWizardOpen(false);
          setWizardSubmission(null);
        }}
        submission={wizardSubmission}
        onCompleted={refetch}
      />

      <AssignInstructorModal
        key={assignIntern ? `assign-${assignIntern.id}` : "assign-closed"}
        open={assignIntern !== null}
        onClose={() => setAssignIntern(null)}
        intern={assignIntern}
        onAssigned={refetch}
      />

      <InternDocumentsModal
        open={documentsIntern !== null}
        onClose={() => setDocumentsIntern(null)}
        internId={documentsIntern?.id ?? null}
        internName={
          documentsIntern
            ? `${documentsIntern.user.first_name} ${documentsIntern.user.last_name}`
            : ""
        }
      />

      <ConfirmModal
        open={deactivateIntern !== null}
        onClose={deactivating ? () => {} : () => setDeactivateIntern(null)}
        onConfirm={async () => {
          if (!deactivateIntern) return;
          setDeactivating(true);
          setDeactivateError(null);
          try {
            const res = await fetch(
              `http://localhost:8000/api/admin/interns/${deactivateIntern.id}/reject/`,
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              },
            );
            const data = await res.json().catch(() => null);
            if (!res.ok) {
              throw new Error(data?.error || "Failed to deactivate");
            }
            await refetch();
            setDeactivateIntern(null);
          } catch (err) {
            setDeactivateError(
              err instanceof Error ? err.message : "Something went wrong",
            );
          } finally {
            setDeactivating(false);
          }
        }}
        busy={deactivating}
        tone="danger"
        title={`Deactivate ${deactivateIntern?.user.first_name} ${deactivateIntern?.user.last_name}?`}
        confirmLabel="Deactivate"
        description={
          <div className="space-y-3">
            <p className="text-[14px]" style={{ color: "var(--text)" }}>
              This will disable the intern's account. They will not be able to
              log in. Their data will be kept for record-keeping.
            </p>
            {deactivateError && (
              <p
                className="text-[12.5px]"
                style={{ color: "var(--status-action-text)" }}
              >
                {deactivateError}
              </p>
            )}
          </div>
        }
      />
    </>
  );
}
