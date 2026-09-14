import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

type TopBarProps = {
  title: string;
  subtitle?: string;
  notificationCount?: number;
};

export function TopBar({
  title,
  subtitle,
  notificationCount = 0,
}: TopBarProps) {
  return (
    <header
      className="h-[72px] flex items-center justify-between px-6 md:px-12 shrink-0"
      style={{
        backgroundColor: "var(--bg-page)",
      }}
    >
      <div className="min-w-0">
        <h1
          className="text-[24px] md:text-[28px] font-bold leading-tight truncate"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-[13px] mt-0.5 truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />
        <NotificationBell count={notificationCount} />
        <UserMenu />
      </div>
    </header>
  );
}
