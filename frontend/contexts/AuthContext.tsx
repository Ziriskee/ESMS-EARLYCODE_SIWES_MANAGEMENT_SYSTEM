import { createContext } from "react";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "INTERN";
  first_name: string;
  last_name: string;
  /** Only populated for role="ADMIN". Either "kubwa", "nyanya", or null. */
  campus?: string | null;
  [key: string]: unknown;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (u: AuthUser) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
