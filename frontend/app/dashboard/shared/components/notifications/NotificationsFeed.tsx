import { useMemo, useState } from "react";
import { Card } from "../../ui/Card";
import { EmptyState } from "../../ui/EmptyState";
import { NotificationRow } from "./NotificationRow";
import type { Notification } from "../../hooks/useNotifications";
import { CheckCheck, ChevronDown } from "lucide-react";
import { GROUP_LABELS, NOTIFICATION_GROUPS, NotificationGroup, NotificationType } from "./notificationMeta";

type Filter = "all" | "unread";

type NotificationsFeedProps = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onLoadMore: () => void;
};

export function NotificationsFeed({
  notifications,
  loading,
  error,
  hasMore,
  onMarkRead,
  onMarkAllRead,
  onLoadMore,
}: NotificationsFeedProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationGroup>("all");
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );
  const visible = useMemo(() => {
    let list =
      filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications;
    if (typeFilter !== "all") {
      const allowed = NOTIFICATION_GROUPS[typeFilter];
      list = list.filter((n) => allowed.includes(n.type as NotificationType));
    }
    return list;
  }, [notifications, filter, typeFilter]);
  const countLabel =
    unreadCount === 0
      ? "No unread updates"
      : `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`;

  return (
    <Card padding="lg">
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
        <div className="flex flex-wrap items-center gap-2">
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
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as NotificationGroup)
              }
              className="appearance-none h-9 pl-4 pr-10 rounded-full text-[13px] font-semibold border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
            >
              {(
                ["all", "tasks", "messages", "system"] as NotificationGroup[]
              ).map((g) => (
                <option key={g} value={g}>
                  {GROUP_LABELS[g]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--muted)" }}
            />
          </div>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="h-9 px-4 rounded-full text-[13px] font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor:
                unreadCount === 0 ? "var(--tint)" : "var(--gold-500)",
              color: unreadCount === 0 ? "var(--muted)" : "var(--coal)",
              border: "1px solid var(--line)",
              cursor: unreadCount === 0 ? "not-allowed" : "pointer",
              opacity: unreadCount === 0 ? 0.5 : 1,
            }}
          >
            <CheckCheck size={15} strokeWidth={2} />
            <span>Mark all read</span>
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
          description="Updates about your interns and others will appear here."
        />
      )}
      {!loading &&
        !error &&
        notifications.length > 0 &&
        visible.length === 0 && (
          <EmptyState
            title={
              filter === "unread" && typeFilter !== "all"
                ? `No unread ${GROUP_LABELS[typeFilter].toLowerCase()} notifications.`
                : filter === "unread"
                  ? "You're all caught up."
                  : typeFilter !== "all"
                    ? `No ${GROUP_LABELS[typeFilter].toLowerCase()} notifications.`
                    : "No notifications match your filters."
            }
          />
        )}

      {!loading && !error && visible.length > 0 && (
        <div className="flex flex-col" style={{ borderColor: "var(--line)" }}>
          {visible.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onMarkRead={onMarkRead}
            />
          ))}
          {hasMore && (
            <div className="mt-4 pb-2 flex justify-center">
              <button
                type="button"
                onClick={onLoadMore}
                className="h-9 px-5 rounded-full text-[13px] font-semibold transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: "var(--surface2)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                }}
              >
                <ChevronDown size={16} strokeWidth={2} />
                <span>Load older notifications</span>
              </button>
            </div>
          )}
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
