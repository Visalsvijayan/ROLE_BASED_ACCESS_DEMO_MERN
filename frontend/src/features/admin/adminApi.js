import { http } from "../../lib/http.js";

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));

// ---- Dashboard ------------------------------------------------------------
export const getStats = (_params, { signal } = {}) =>
  http.get("/admin/stats", { signal }).then((r) => r.data);

// ---- Users (admin only) -----------------------------------------------------
export const listUsers = (params, { signal } = {}) =>
  http.get("/users", { params: clean(params), signal }).then((r) => r.data);

export const getUser = (id, { signal } = {}) => http.get(`/users/${id}`, { signal }).then((r) => r.data);

export const updateUserStatus = (id, isActive) =>
  http.patch(`/users/${id}/status`, { isActive }).then((r) => r.data);

export const deleteUser = (id) => http.delete(`/users/${id}`).then((r) => r.data);
