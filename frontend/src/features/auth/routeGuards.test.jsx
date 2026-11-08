import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "./AuthContext.js";
import { GuestRoute, ProtectedRoute, RoleRoute } from "./routeGuards.jsx";
import { ROLES } from "../../constants/roles.js";

const renderAt = (path, auth) =>
  render(
    <AuthContext.Provider value={{ loading: false, isAuthenticated: Boolean(auth), user: auth, ...{} }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<p>home</p>} />
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/unauthorized" element={<p>denied</p>} />
          <Route element={<GuestRoute />}>
            <Route path="/guest" element={<p>guest page</p>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<p>profile page</p>} />
          </Route>
          <Route path="/admin" element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route index element={<p>admin page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

const user = { email: "u@x.co", role: ROLES.USER };
const admin = { email: "a@x.co", role: ROLES.ADMIN };

describe("route guards", () => {
  test("guests are sent to login from protected pages", () => {
    renderAt("/profile", null);
    expect(screen.getByText("login page")).toBeInTheDocument();
  });
  test("a user can open protected pages", () => {
    renderAt("/profile", user);
    expect(screen.getByText("profile page")).toBeInTheDocument();
  });
  test("a user is denied the admin area", () => {
    renderAt("/admin", user);
    expect(screen.getByText("denied")).toBeInTheDocument();
  });
  test("an admin can open the admin area", () => {
    renderAt("/admin", admin);
    expect(screen.getByText("admin page")).toBeInTheDocument();
  });
  test("a guest hitting admin goes to login", () => {
    renderAt("/admin", null);
    expect(screen.getByText("login page")).toBeInTheDocument();
  });
  test("logged-in users are bounced away from guest pages", () => {
    renderAt("/guest", user);
    expect(screen.getByText("home")).toBeInTheDocument();
  });
  test("guests can see guest pages", () => {
    renderAt("/guest", null);
    expect(screen.getByText("guest page")).toBeInTheDocument();
  });
});
