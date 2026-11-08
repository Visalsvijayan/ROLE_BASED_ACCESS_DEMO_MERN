import { useContext } from "react";
import { AuthContext } from "./AuthContext.js";

/**
 * const { user, isAuthenticated, loading, login, register, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
