import { useContext } from "react";
import { AuthContext, type AuthUser } from "./AuthContext";

export type User = AuthUser;

type UseAuthResult = {
  user: User | null;
  loading: boolean;
  login: (u: User) => void;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

/**
 * Read-only bridge onto AuthContext. One store for the whole app:
 * logout, 401s and refetches all mutate the same state every
 * component renders from.
 */
export function useAuth(): UseAuthResult {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return {
    user: ctx.user,
    loading: ctx.loading,
    login: ctx.login,
    logout: ctx.logout,
    refetch: ctx.refreshUser,
  };
}