import { createContext, useContext } from "react";
import type { InstructorDashboardData } from "./InstructorDashboardContext";

export type InstructorDashboardContextValue = {
  data: InstructorDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const InstructorDashboardContext =
  createContext<InstructorDashboardContextValue | null>(null);

export function useInstructorDashboardContext(): InstructorDashboardContextValue {
  const ctx = useContext(InstructorDashboardContext);
  if (!ctx) {
    throw new Error(
      "useInstructorDashboardContext must be used inside InstructorDashboardProvider",
    );
  }
  return ctx;
}
