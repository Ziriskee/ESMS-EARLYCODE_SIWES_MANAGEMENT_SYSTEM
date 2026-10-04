import { useState } from "react";
import { useInstructorTasks } from "../hooks/useInstructorTasks";
import { TasksList } from "../components/TasksList";
import { TaskFormModal } from "../components/TaskFormModal";
import { AssignTaskModal } from "../components/AssignTaskModal";
import { TaskDetailModal } from "../components/TaskDetailModal";
import { TaskReviewModal } from "../components/TaskReviewModal";
import { ConfirmModal } from "../../shared/ui/ConfirmModal";
import type { InstructorTask, TaskAssignmentEntry } from "../types";

export default function InstructorTasksPage() {
  const { tasks, loading, error, refetch } = useInstructorTasks();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [deleteTask, setDeleteTask] = useState<InstructorTask | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reviewAssignment, setReviewAssignment] =
    useState<TaskAssignmentEntry | null>(null);

  // Derived from the live list so reviews/assigns refresh automatically.
  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null;
  const assignTask = tasks.find((t) => t.id === assignId) ?? null;

  const handleDelete = async () => {
    if (!deleteTask) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/instructor/tasks/${deleteTask.id}/`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete task");
      }
      await refetch();
      setDeleteTask(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <TasksList
          tasks={tasks}
          loading={loading}
          error={error}
          onCreate={() => setCreateOpen(true)}
          onSelect={(t) => {
            setSelectedId(t.id);
            setDetailOpen(true);
          }}
          onAssign={(t) => setAssignId(t.id)}
          onDelete={(t) => setDeleteTask(t)}
        />
      </div>

      <TaskFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={refetch}
      />

      <TaskDetailModal
        open={detailOpen && selectedTask !== null}
        onClose={() => setDetailOpen(false)}
        task={selectedTask}
        onReview={(a) => setReviewAssignment(a)}
        onAssign={(t) => setAssignId(t.id)}
      />

      <AssignTaskModal
        key={assignId ?? "assign-none"}
        open={assignId !== null}
        onClose={() => setAssignId(null)}
        task={assignTask}
        onAssigned={refetch}
      />

      <TaskReviewModal
        key={reviewAssignment?.id ?? "review-none"}
        open={reviewAssignment !== null}
        onClose={() => setReviewAssignment(null)}
        assignment={reviewAssignment}
        onReviewed={refetch}
      />

      <ConfirmModal
        open={deleteTask !== null}
        onClose={deleting ? () => {} : () => setDeleteTask(null)}
        onConfirm={handleDelete}
        busy={deleting}
        tone="danger"
        title={`Delete “${deleteTask?.title ?? ""}”?`}
        confirmLabel="Delete"
        description={
          <div className="space-y-3">
            <p className="text-[14px]" style={{ color: "var(--text)" }}>
              This permanently removes the task and all of its assignments.
              Interns will no longer see it.
            </p>
            {deleteError && (
              <p
                className="text-[12.5px]"
                style={{ color: "var(--status-action-text)" }}
              >
                {deleteError}
              </p>
            )}
          </div>
        }
      />
    </>
  );
}
