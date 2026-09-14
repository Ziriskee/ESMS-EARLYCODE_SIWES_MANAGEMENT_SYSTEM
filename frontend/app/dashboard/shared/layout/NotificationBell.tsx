import { Bell } from "lucide-react";

type NotificationBellProps = {
  count: number;
  onClick?: () => void;
};

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  const showBadge = count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        showBadge ? `Notifications, ${count} unread` : "Notifications"
      }
      title="Notifications"
      className="relative h-10 w-10 rounded-full border flex items-center justify-center transition-colors"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--bg-card)",
        color: "var(--text-primary)",
      }}
    >
      <Bell size={18} strokeWidth={1.75} />

      {showBadge && (
        <span
          className="absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{
            backgroundColor: "var(--gold)",
            color: "var(--text-on-gold)",
          }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
