import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

import { ROLES } from "../constants/roles.js";
import { GuestRoute, ProtectedRoute, RoleRoute } from "../features/auth/routeGuards.jsx";
import LoginPage from "../features/auth/LoginPage.jsx";
import ProfilePage from "../features/auth/ProfilePage.jsx";
import RegisterPage from "../features/auth/RegisterPage.jsx";
import HomePage from "../features/products/HomePage.jsx";
import ProductDetailsPage from "../features/products/ProductDetailsPage.jsx";
import ProductListPage from "../features/products/ProductListPage.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import UnauthorizedPage from "../pages/UnauthorizedPage.jsx";

// Admin pages are loaded on demand (code splitting): customers never download them.
const DashboardPage = lazy(() => import("../features/admin/DashboardPage.jsx"));
const UsersPage = lazy(() => import("../features/admin/UsersPage.jsx"));
const UserDetailsPage = lazy(() => import("../features/admin/UserDetailsPage.jsx"));
const AdminProductsPage = lazy(() => import("../features/admin/ProductsPage.jsx"));
const ProductFormPage = lazy(() => import("../features/admin/ProductFormPage.jsx"));

/**
 * The whole site map. Read it top to bottom:
 *
 *   who can open it?        pages
 *   ---------------------   ------------------------------------------
 *   everyone                home, products, product details, 403, 404
 *   guests only             login, register
 *   any logged-in user      profile
 *   admins only             /admin/*
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Guests only */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admins only: guarded ONCE for the whole section */}
      <Route path="admin" element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/add" element={<ProductFormPage />} />
          <Route path="products/edit/:id" element={<ProductFormPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
