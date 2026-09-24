import { useContext } from "react";
import { CampusFilterContext } from "./CampusFilterContext";

export function useCampusFilter() {
  const ctx = useContext(CampusFilterContext);
  if (!ctx) {
    throw new Error("useCampusFilter must be used inside CampusFilterProvider");
  }
  return ctx;
}
