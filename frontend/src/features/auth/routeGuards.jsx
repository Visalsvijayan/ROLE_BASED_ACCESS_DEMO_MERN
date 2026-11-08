import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoader from "../../components/PageLoader.jsx";
import { ROLES } from "../../constants/roles.js";
import { ROUTES } from "../../constants/routes.js";
import { useAuth } from "./useAuth.js";

/**
 * Route guards. Each one wraps a GROUP of routes (see routes/AppRoutes.jsx):
 * it either shows the matching child page (<Outlet />) or redirects.
 *
 * IMPORTANT: guards only hide pages in the UI. The real security is in the
 * backend, which checks the token and role on every request.
 */

/** Where a logged-in user "lives": admins -> dashboard, everyone else -> home. */
const homePathFor = (user) => (user?.role === ROLES.ADMIN ? ROUTES.ADMIN : ROUTES.HOME);

/** Any logged-in user. Guests are sent to /login and returned here afterwards. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

/** Only the listed roles. Guests -> /login. Wrong role -> /unauthorized. */
export function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname + location.search }} />;
  }
  if (!allowedRoles.includes(user.role)) return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  return <Outlet />;
}

/**
 * Pages for guests only (login, register). A logged-in user is sent away.
 * This is also what redirects right after a successful login, so the login
 * page itself never has to call navigate().
 */
export function GuestRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? homePathFor(user)} replace />;
  }
  return <Outlet />;
}
