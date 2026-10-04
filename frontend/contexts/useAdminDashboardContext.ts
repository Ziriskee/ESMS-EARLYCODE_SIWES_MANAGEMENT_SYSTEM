import { createContext, useContext } from "react";
import type {
  AdminDashboardStats,
  PendingInternSummary,
} from "@/app/dashboard/admin/types";

export type AdminDashboardData = {
  stats: AdminDashboardStats;
  pending: PendingInternSummary[];
};

export type AdminDashboardDataContextValue = {
  data: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const AdminDashboardDataContext =
  createContext<AdminDashboardDataContextValue | null>(null);

export function useAdminDashboardContext(): AdminDashboardDataContextValue {
  const ctx = useContext(AdminDashboardDataContext);
  if (!ctx) {
    throw new Error(
      "useAdminDashboardContext must be used inside AdminDashboardProvider",
    );
  }
  return ctx;
}
