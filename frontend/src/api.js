import axios from "axios";

/**
 * Every backend call the app makes lives in this one file:
 *   - the shared axios instance (base URL, auth header, auto token-refresh)
 *   - every request function (auth / products / users)
 *
 * Nothing else in the app needs to know how tokens or refresh work —
 * pages just import a function like `listProducts()` and call it.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HTTP-only refresh cookie
  headers: { "Content-Type": "application/json" },
});

// --- Access token wiring -------------------------------------------------
// AuthContext owns the access token in React state and hands this file
// two callbacks, so this file never has to import React itself.

let getAccessToken = () => null;
let onUnauthorized = null;           // called when a refresh attempt fails

export const setAccessTokenProvider = (fn) => {
  getAccessToken = fn || (() => null);
};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn || null;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Auto-refresh on 401 --------------------------------------------------
// If a request comes back 401, try once to refresh the access token using
// the refresh cookie, then retry the original request. Other requests that
// 401 while a refresh is already in flight just wait for it to finish.
let isRefreshing = false;
let queue = [];

const flushQueue = (error, token) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) return Promise.reject(error); // network error, nothing to refresh

    const original = error.config;
    const url = original.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");

    if (error.response.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
      if (!data?.accessToken) throw new Error("No access token returned from refresh");
      flushQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      if (onUnauthorized) onUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

// --- Auth ------------------------------------------------------------------
export const loginRequest = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { user, accessToken }
};

export const registerRequest = async (name, email, password) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data; // { user, accessToken }
};

export const logoutRequest = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

// --- Products ----------------------------------------------------------------
export const listProducts = () => api.get("/products").then((r) => r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);

// Admin-only
export const adminListProducts = () => api.get("/products/admin/all").then((r) => r.data);
export const createProduct = (payload) => api.post("/products", payload).then((r) => r.data);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

// --- Users (admin-only) ---------------------------------------------------
export const listUsers = () => api.get("/users").then((r) => r.data);
export const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const updateUserStatus = (id, isActive) =>
  api.patch(`/users/${id}/status`, { isActive }).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data);
