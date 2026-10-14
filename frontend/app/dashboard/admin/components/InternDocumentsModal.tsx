import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { apiFetch } from "../../../../lib/api";
import type { SubmissionDocument } from "../types";

type InternDocumentsModalProps = {
  open: boolean;
  onClose: () => void;
  internId: number | null;
  internName: string;
};

const DOC_ROWS: { type: string; label: string }[] = [
  { type: "ACCEPTANCE_LETTER", label: "Acceptance Letter" },
  { type: "CODE_OF_CONDUCT", label: "Code of Conduct" },
];

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

export function InternDocumentsModal({
  open,
  onClose,
  internId,
  internName,
}: InternDocumentsModalProps) {
  const [documents, setDocuments] = useState<SubmissionDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyType, setBusyType] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (internId === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ documents: SubmissionDocument[] }>(
        `/admin/interns/${internId}/submission/`,
      );
      setDocuments(data.documents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [internId]);

  useEffect(() => {
    if (!open || internId === null) return;

    let isActive = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<{ documents: SubmissionDocument[] }>(
          `/admin/interns/${internId}/submission/`,
        );

        if (!isActive) return;
        setDocuments(data.documents ?? []);
      } catch (err) {
        if (!isActive) return;
        setError(
          err instanceof Error ? err.message : "Failed to load documents",
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, [internId, open]);

  const generate = async (type: string) => {
    if (internId === null) return;
    setBusyType(type);
    setError(null);
    try {
      await apiFetch(`/admin/interns/${internId}/documents/generate/`, {
        method: "POST",
        body: JSON.stringify({ only_missing: false, types: [type] }),
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Document generation failed",
      );
    } finally {
      setBusyType(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Documents — ${internName}`}
      breadcrumb="Documents"
      icon={<FileText size={18} strokeWidth={1.75} />}
      size="md"
      footer={
        <div className="flex items-center justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
            }}
          >
            Close
          </button>
        </div>
      }
    >
      {loading && (
        <p className="text-[13px] py-4" style={{ color: "var(--muted)" }}>
          Loading documents...
        </p>
      )}
      {!loading && error && (
        <p
          className="text-[12.5px] py-2"
          style={{ color: "var(--status-action-text)" }}
        >
          {error}
        </p>
      )}
      {!loading && (
        <ul className="space-y-3">
          {DOC_ROWS.map((row) => {
            const doc = documents.find((d) => d.type === row.type) ?? null;
            return (
              <li
                key={row.type}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--line)",
                  backgroundColor: "var(--surface2)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-[13.5px] font-semibold truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {row.label}
                    </p>
                    <p
                      className="text-[11.5px] mt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      {doc
                        ? `Ready · ${formatDate(doc.uploaded_at)}`
                        : "Not generated yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc?.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-4 rounded-full text-[12.5px] font-semibold inline-flex items-center"
                        style={{
                          backgroundColor: "var(--surface)",
                          color: "var(--text)",
                          border: "1px solid var(--line)",
                        }}
                      >
                        Download
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => generate(row.type)}
                      disabled={busyType !== null}
                      className="h-8 px-4 rounded-full text-[12.5px] font-semibold"
                      style={{
                        backgroundColor: "var(--gold-500)",
                        color: "var(--coal)",
                        opacity: busyType !== null ? 0.6 : 1,
                        cursor: busyType !== null ? "not-allowed" : "pointer",
                      }}
                    >
                      {busyType === row.type
                        ? "Working..."
                        : doc
                          ? "Regenerate"
                          : "Generate"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
