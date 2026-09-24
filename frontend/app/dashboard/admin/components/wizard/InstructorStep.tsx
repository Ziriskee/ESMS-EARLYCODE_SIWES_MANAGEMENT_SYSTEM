import { useEffect, useState } from "react";
import { apiFetch } from "../../../../../lib/api";
import type { InstructorSummary } from "../../types";

type InstructorStepProps = {
  instructorId: string;
  onChange: (id: string) => void;
};

export function InstructorStep({
  instructorId,
  onChange,
}: InstructorStepProps) {
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const data = await apiFetch<
          InstructorSummary[] | { results: InstructorSummary[] }
        >("/admin/instructors/");
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (isMounted) setInstructors(list);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load instructors",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-[13px]" style={{ color: "var(--muted)" }}>
        Loading instructors...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-[13px]" style={{ color: "var(--status-action-text)" }}>
        {error}
      </p>
    );
  }

  if (instructors.length === 0) {
    return (
      <div
        className="rounded-2xl border p-6 text-center"
        style={{
          borderColor: "var(--line)",
          backgroundColor: "var(--surface2)",
        }}
      >
        <p
          className="text-[14px] font-semibold"
          style={{ color: "var(--text)" }}
        >
          No instructors yet.
        </p>
        <p className="text-[12.5px] mt-1" style={{ color: "var(--muted)" }}>
          Add an instructor from the Instructors page first, then return here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p
        className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--muted)" }}
      >
        Assign an instructor
      </p>

      <ul className="space-y-2">
        {instructors.map((i) => {
          const selected = i.id === instructorId;
          const initials =
            (i.first_name?.[0] ?? "").toUpperCase() +
            (i.last_name?.[0] ?? "").toUpperCase();
          return (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => onChange(i.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors"
                style={{
                  borderColor: selected ? "var(--gold-500)" : "var(--line)",
                  backgroundColor: selected ? "var(--tint)" : "var(--surface2)",
                }}
              >
                <span
                  className="h-9 w-9 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
                  style={{
                    backgroundColor: "var(--gold-500)",
                    color: "var(--coal)",
                  }}
                >
                  {initials || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[13.5px] font-semibold truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {i.first_name} {i.last_name}
                  </p>
                  <p
                    className="text-[12px] truncate"
                    style={{ color: "var(--muted)" }}
                  >
                    {i.email}
                    {i.department ? ` · ${i.department}` : ""}
                  </p>
                </div>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: "var(--muted)" }}
                >
                  {i.assigned_intern_count} intern
                  {i.assigned_intern_count === 1 ? "" : "s"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
