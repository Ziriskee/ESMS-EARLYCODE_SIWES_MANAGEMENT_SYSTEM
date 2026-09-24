import { createContext } from "react";

export type CampusValue = "kubwa" | "nyanya" | "all";

type CampusFilterContextValue = {
  campus: CampusValue;
  setCampus: (value: CampusValue) => void;
};

export const CampusFilterContext =
  createContext<CampusFilterContextValue | null>(null);
