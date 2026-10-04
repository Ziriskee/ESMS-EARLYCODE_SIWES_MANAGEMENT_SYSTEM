import { Check } from "lucide-react";
import type { Notification } from "../../hooks/useNotifications";
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
  const titleColor = is_read ? "var(--muted)" : "var(--text)";
  const titleWeight = is_read ? 500 : 600;
  const bodyColor = "var(--muted)";

  return (
    <div className="group relative flex items-start gap-3.5 py-4 -mx-2 px-2 rounded-xl transition-colors hover:bg-[var(--tint)]">
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `var(${meta.bgToken})` }}
      >
        <Icon
          size={16}
          strokeWidth={1.8}
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
        <p className="text-[11.5px] mt-1" style={{ color: bodyColor }}>
          {formatNotificationTime(notification.created_at)}
        </p>
      </div>
      {!is_read && (
        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--gold-500)" }}
            aria-label="Unread"
          />
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 rounded-full flex items-center gap-1.5 text-[12px] font-semibold"
            style={{
              backgroundColor: "var(--surface2)",
              border: "1px solid var(--line)",
              color: "var(--text)",
            }}
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check size={14} strokeWidth={2} />
            <span>Read</span>
          </button>
        </div>
      )}
    </div>
  );
}
