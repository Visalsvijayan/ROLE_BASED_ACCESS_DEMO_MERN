import { http } from "../../lib/http.js";

/**
 * Every function takes (params, { signal }) so it can be handed straight to
 * useFetch(), which cancels outdated requests through `signal`.
 *
 * List responses look like: { items, page, limit, total, totalPages }
 */

// Don't send "?search=" when the box is empty.
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));

// ---- Public -------------------------------------------------------------
export const listProducts = (params, { signal } = {}) =>
  http.get("/products", { params: clean(params), signal }).then((r) => r.data);

export const getProduct = (id, { signal } = {}) =>
  http.get(`/products/${id}`, { signal }).then((r) => r.data);

// ---- Admin only (the backend enforces this; inactive products included) ---
export const adminListProducts = (params, { signal } = {}) =>
  http.get("/products/admin/all", { params: clean(params), signal }).then((r) => r.data);

export const adminGetProduct = (id, { signal } = {}) =>
  http.get(`/products/admin/${id}`, { signal }).then((r) => r.data);

export const createProduct = (payload) => http.post("/products", payload).then((r) => r.data);

export const updateProduct = (id, payload) => http.put(`/products/${id}`, payload).then((r) => r.data);

export const deleteProduct = (id) => http.delete(`/products/${id}`).then((r) => r.data);
