import { createContext, useContext } from "react";
import type { DashboardData } from "@/app/dashboard/intern/types";

export type DashboardDataContextValue = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const DashboardDataContext =
  createContext<DashboardDataContextValue | null>(null);

export function useDashboardDataContext(): DashboardDataContextValue {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error(
      "useDashboardDataContext must be used inside DashboardDataProvider",
    );
  }
  return ctx;
}
