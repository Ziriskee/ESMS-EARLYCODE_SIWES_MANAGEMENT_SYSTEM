import { Check } from "lucide-react";
import type { Notification } from "../hooks/useNotifications";
import { getNotificationMeta } from "./notificationMeta";
import { formatNotificationTime } from "./relativeTime";

type NotificationRowProps = {
  notification: Notification;
  onMarkRead: (id: string) => void;
};

export function NotificationRow({
  notification,
  onMarkRead,
}: NotificationRowProps) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;

  const { is_read } = notification;

  const rowBg = is_read ? "var(--bg-card-elevated)" : "transparent";
  const titleColor = is_read ? "var(--text-secondary)" : "var(--text-primary)";
  const titleWeight = is_read ? 500 : 600;
  const bodyColor = is_read ? "var(--text-tertiary)" : "var(--text-secondary)";

  return (
    <div
      className="group relative flex items-start gap-4 py-4 px-2 rounded-[10px] transition-colors"
      style={{ backgroundColor: rowBg }}
    >
      <div
        className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `var(${meta.bgToken})` }}
      >
        <Icon
          size={18}
          strokeWidth={1.75}
          style={{ color: `var(${meta.iconToken})` }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] leading-snug"
          style={{ color: titleColor, fontWeight: titleWeight }}
        >
          {notification.message}
        </p>
        <p className="text-[12px] mt-1" style={{ color: bodyColor }}>
          {formatNotificationTime(notification.created_at)}
        </p>
      </div>

      {!is_read && (
        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--gold)" }}
            aria-label="Unread"
          />
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
