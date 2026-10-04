import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/useAuth";
import { CampusFilter } from "./CampusFilter";

type TopBarProps = {
  title: string;
  subtitle?: string;
  notificationCount?: number;
  onOpenMobileNav?: () => void;
  /** Where the bell navigates. Omit to keep the bell inert. */
  onNotificationClick?: () => void;
};

export function TopBar({
  title,
  subtitle,
  notificationCount = 0,
  onOpenMobileNav,
  onNotificationClick,
}: TopBarProps) {
    const { user } = useAuth();
    const showCampusFilter = user?.role === "ADMIN";
  return (
    <header
      className="shrink-0 border-b z-20"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--header)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="h-[64px] sm:h-[72px] flex items-center gap-3 px-4 sm:px-6 md:px-8 lg:px-12">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
            className="lg:hidden h-10 w-10 -ml-1 rounded-full border flex items-center justify-center shrink-0"
            style={{
              borderColor: "var(--line)",
              backgroundColor: "transparent",
              color: "var(--text)",
            }}
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1
            className="text-[20px] sm:text-[22px] md:text-[28px] font-semibold leading-tight truncate"
            style={{
              color: "var(--text)",
              fontFamily: "var(--font-display)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-[12.5px] mt-0.5 truncate hidden sm:block"
              style={{ color: "var(--muted)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {showCampusFilter && <CampusFilter />}
          <ThemeToggle />
          <NotificationBell
            count={notificationCount}
            onClick={onNotificationClick}
          />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
