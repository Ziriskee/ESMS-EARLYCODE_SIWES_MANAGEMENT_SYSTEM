import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "INTERN";
  first_name: string;
  last_name: string;
  /** Only populated for role="ADMIN". Either "kubwa", "nyanya", or null. */
  campus?: string | null;
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}