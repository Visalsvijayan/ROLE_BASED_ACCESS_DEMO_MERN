import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import AdminLayout from "./AdminLayout.jsx";
import { ProtectedRoute, AdminRoute } from "./Guards.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminUserDetails from "./pages/AdminUserDetails.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminProductForm from "./pages/AdminProductForm.jsx";

/** Public/user pages share the top navbar. */
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const App = () => {
  return (
    <Routes>
      {/* Public + user pages (navbar on top) */}
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/unauthorized" element={<PublicLayout><Unauthorized /></PublicLayout>} />
      <Route
        path="/"
        element={
          <PublicLayout>
            <ProtectedRoute><Home /></ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/products"
        element={
          <PublicLayout>
            <ProtectedRoute><Products /></ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <PublicLayout>
            <ProtectedRoute><ProductDetails /></ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <PublicLayout>
            <ProtectedRoute><Profile /></ProtectedRoute>
          </PublicLayout>
        }
      />

      {/* Admin pages (sidebar on the left, guarded once for the whole section) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetails />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
