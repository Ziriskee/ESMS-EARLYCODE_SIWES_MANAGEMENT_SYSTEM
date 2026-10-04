import type { ReactNode } from "react";
import { useNotifications } from "@/app/dashboard/shared/hooks/useNotifications";
import { NotificationsContext } from "./useNotificationsContext";

/**
 * Single notifications fetch per dashboard shell. The layout (bell +
 * sidebar badge) and the Notifications page read the same instance,
 * so marking read updates both without a refetch.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const value = useNotifications();
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
