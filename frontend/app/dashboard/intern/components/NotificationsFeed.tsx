import { useMemo, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { NotificationRow } from "./NotificationRow";
import type { Notification } from "../hooks/useNotifications";

type Filter = "all" | "unread";

type NotificationsFeedProps = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

export function NotificationsFeed({
  notifications,
  loading,
  error,
  onMarkRead,
  onMarkAllRead,
}: NotificationsFeedProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const visible = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications,
    [notifications, filter],
  );

  const countLabel =
    unreadCount === 0
      ? "No unread updates"
      : `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`;

  return (
    <Card padding="lg" >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2
            className="text-[20px] font-semibold leading-tight tracking-tight"
            style={{
              color: "var(--text)",
              fontFamily: "var(--font-display)",
            }}
          >
            Activity feed
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
            {countLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-full p-1"
            style={{ backgroundColor: "var(--surface2)" }}
          >
            <ToggleButton
              label="All"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <ToggleButton
              label="Unread"
              active={filter === "unread"}
              onClick={() => setFilter("unread")}
            />
          </div>

          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor:
                unreadCount === 0 ? "var(--tint)" : "var(--surface2)",
              color: unreadCount === 0 ? "var(--muted)" : "var(--text)",
              border: "1px solid var(--line)",
              cursor: unreadCount === 0 ? "not-allowed" : "pointer",
              opacity: unreadCount === 0 ? 0.5 : 1,
            }}
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <p className="text-[13px] py-6" style={{ color: "var(--muted)" }}>
          Loading notifications...
        </p>
      )}

      {!loading && error && (
        <EmptyState
          title="We couldn't load your notifications."
          description={error}
        />
      )}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          title="No notifications yet."
          description="Updates about your placement will appear here."
        />
      )}

      {!loading &&
        !error &&
        notifications.length > 0 &&
        visible.length === 0 && <EmptyState title="You're all caught up." />}

      {!loading && !error && visible.length > 0 && (
        <div
          className="flex flex-col"
          style={{ borderColor: "var(--line)" }}
        >
          {visible.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onMarkRead={onMarkRead}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 px-4 rounded-full text-[12.5px] font-semibold transition-colors"
      style={{
        backgroundColor: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text)" : "var(--muted)",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {label}
    </button>
  );
}
