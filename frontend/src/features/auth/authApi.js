import { http } from "../../lib/http.js";

// Each function returns just the data. Refreshing the session lives in lib/http.js
// because the HTTP layer itself needs it.
export const login = ({ email, password }) =>
  http.post("/auth/login", { email, password }).then((response) => response.data); // { user, accessToken }

export const register = ({ name, email, password }) =>
  http.post("/auth/register", { name, email, password }).then((response) => response.data);

export const logout = () => http.post("/auth/logout").then((response) => response.data);
