import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import * as authApi from "./authApi.js";
import { refreshSession, setSessionExpiredHandler } from "../../lib/http.js";
import { tokenStore } from "../../lib/tokenStore.js";

/**
 * Owns the logged-in user for the whole app.
 *
 *  - The access token lives in memory (tokenStore), the user object in React state.
 *  - On every page load we ask the backend "is there a valid refresh cookie?".
 *    If yes the user is silently logged back in; if not they are a guest.
 *    `loading` is true until that check finishes, so guards don't flash /login.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    refreshSession()
      .then((session) => {
        if (active) setUser(session.user);
      })
      .catch(() => {
        // No cookie / expired / backend down: simply continue as a guest.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // If the session dies while the app is open (revoked, user deactivated...), log out in the UI.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  const startSession = useCallback((session) => {
    tokenStore.set(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const login = useCallback(
    async (credentials) => startSession(await authApi.login(credentials)),
    [startSession]
  );

  const register = useCallback(
    async (details) => startSession(await authApi.register(details)),
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server can't be reached, we still log out locally below.
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
