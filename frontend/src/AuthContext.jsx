import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessTokenProvider, setUnauthorizedHandler, loginRequest, logoutRequest } from "./api.js";

const AuthContext = createContext(null);

/**
 * AuthProvider
 * ------------
 * Holds the logged-in user and access token in memory (never in
 * localStorage), and tries to silently restore the session on load using
 * the HTTP-only refresh cookie set by the backend.
 *
 * Exposes: user, isAuthenticated, loading, login(), logout()
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!accessToken;

  // Keep api.js in sync with the current token / logout behaviour.
  useEffect(() => {
    setAccessTokenProvider(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setAccessToken(null);
    });
  }, []);

  // On first load, try to restore the session from the refresh cookie.
  useEffect(() => {
    let cancelled = false;
    api
      .post("/auth/refresh", {})
      .then(({ data }) => {
        if (cancelled) return;
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setAccessToken(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (e) {
      // ignore network errors — we still clear local state below
    }
    setUser(null);
    setAccessToken(null);
  }, []);

  const value = { user, loading, isAuthenticated, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
