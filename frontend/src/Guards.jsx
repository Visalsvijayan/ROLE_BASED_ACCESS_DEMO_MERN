import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

/** Simple centered spinner text, shown while the session is being restored. */
export const Loading = ({ text = "Loading..." }) => (
  <div className="loading-wrap">
    <p>{text}</p>
  </div>
);

/**
 * ProtectedRoute — renders children only for a logged-in user.
 * Not logged in -> redirect to /login (remembers where they were headed).
 *
 * NOTE: this is UI-level protection only. The backend enforces auth too.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

/**
 * AdminRoute — renders children only for a logged-in admin.
 * Guest -> /login. Logged-in non-admin -> /unauthorized.
 *
 * NOTE: this is UI-level protection only. The backend enforces roles too.
 */
export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user?.role !== "admin") return <Navigate to="/unauthorized" replace />;
  return children;
};
