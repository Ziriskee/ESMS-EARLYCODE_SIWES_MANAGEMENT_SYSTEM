import { useMemo, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
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
    <Card padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2
            className="text-[16px] font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Activity feed
          </h2>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {countLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* All / Unread toggle */}
          <div
            className="flex items-center rounded-full p-1"
            style={{ backgroundColor: "var(--bg-card-elevated)" }}
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

          {/* Mark all as read */}
          <Button
            variant="pill"
            size="sm"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <p
          className="text-[13px] py-6"
          style={{ color: "var(--text-secondary)" }}
        >
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
        <div className="flex flex-col gap-3">
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
      className="h-8 px-4 rounded-full text-[13px] font-semibold transition-colors"
      style={{
        backgroundColor: active ? "var(--bg-card)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
      }}
    >
      {label}
    </button>
  );
}
