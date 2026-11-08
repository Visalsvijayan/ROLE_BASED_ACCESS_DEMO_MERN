import axios from "axios";
import { API_URL } from "../config/env.js";
import { tokenStore } from "./tokenStore.js";

/**
 * The ONE axios instance the whole app uses. It:
 *   1. adds "Authorization: Bearer <token>" to every request
 *   2. sends the refresh cookie (withCredentials)
 *   3. on a 401, silently gets a new token and retries the request once
 */
const TIMEOUT_MS = 15_000;

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: TIMEOUT_MS,
});

// AuthProvider registers what should happen when the session can't be renewed.
let onSessionExpired = null;
export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

/**
 * Exchanges the refresh cookie for a new access token (and returns { user, accessToken }).
 *
 * If several requests fail with 401 at the same moment - or React StrictMode
 * runs the startup check twice - they all share ONE refresh call. This matters
 * because the backend rotates the refresh token on every use.
 */
let refreshPromise = null;
export const refreshSession = () => {
  refreshPromise ??= axios
    .post(`${API_URL}/auth/refresh`, null, { withCredentials: true, timeout: TIMEOUT_MS })
    .then(({ data }) => {
      tokenStore.set(data.accessToken);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 from these endpoints means "wrong password" / "no session", not "token expired".
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const isExpiredToken =
      response?.status === 401 &&
      config &&
      !config._retried &&
      !AUTH_ENDPOINTS.some((path) => config.url?.startsWith(path));

    if (!isExpiredToken) throw error;

    config._retried = true; // never retry the same request twice
    try {
      await refreshSession();
    } catch (refreshError) {
      // Only a 401 means the session is really over. A network blip or a
      // server outage must NOT log the user out.
      if (refreshError.response?.status === 401) {
        tokenStore.clear();
        onSessionExpired?.();
      }
      throw error;
    }
    return http(config); // retry with the fresh token (the request interceptor adds it)
  }
);
