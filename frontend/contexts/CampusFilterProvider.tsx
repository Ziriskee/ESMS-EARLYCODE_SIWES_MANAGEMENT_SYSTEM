import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CampusFilterContext, type CampusValue } from "./CampusFilterContext";
import { useAuth } from "./useAuth";

const STORAGE_KEY = "admin_campus_filter";

function isValid(value: string | null): value is CampusValue {
  return value === "kubwa" || value === "nyanya" || value === "all";
}

function readStored(): CampusValue | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isValid(raw) ? raw : null;
}

export function CampusFilterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Priority: localStorage > admin's own campus > "all"
  const initial: CampusValue = (() => {
    const stored = readStored();
    if (stored) return stored;

    const adminCampus = (user as { campus?: string | null } | null)?.campus;
    if (adminCampus === "kubwa" || adminCampus === "nyanya") {
      return adminCampus;
    }
    return "all";
  })();

  const [campus, setCampusState] = useState<CampusValue>(initial);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, campus);
  }, [campus]);

  const setCampus = useCallback((value: CampusValue) => {
    setCampusState(value);
  }, []);

  return (
    <CampusFilterContext.Provider value={{ campus, setCampus }}>
      {children}
    </CampusFilterContext.Provider>
  );
}
