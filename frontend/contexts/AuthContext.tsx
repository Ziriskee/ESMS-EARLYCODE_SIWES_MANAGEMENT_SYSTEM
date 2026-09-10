import { createContext } from "react";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "INTERN";
  first_name: string;
  last_name: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
