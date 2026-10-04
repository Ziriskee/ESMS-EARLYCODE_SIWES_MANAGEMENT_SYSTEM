import { createContext, useContext } from "react";
import type { UseNotificationsResult } from "@/app/dashboard/shared/hooks/useNotifications";

export const NotificationsContext =
  createContext<UseNotificationsResult | null>(null);

export function useNotificationsContext(): UseNotificationsResult {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotificationsContext must be used inside NotificationsProvider",
    );
  }
  return ctx;
}
