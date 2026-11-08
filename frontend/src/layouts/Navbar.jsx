import { Link, NavLink, useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles.js";
import { ROUTES } from "../constants/routes.js";
import { useAuth } from "../features/auth/useAuth.js";

/**
 *   Guest -> Products, Login
 *   User  -> Products, Profile, Logout
 *   Admin -> the above + a link to the admin panel
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true, state: null });
  };

  return (
    <header className="navbar">
      <Link to={ROUTES.HOME} className="brand">
        🛒 MERN Shop
      </Link>
      <nav aria-label="Main">
        <NavLink to={ROUTES.PRODUCTS}>Products</NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to={ROUTES.PROFILE}>Profile</NavLink>
            {user.role === ROLES.ADMIN && (
              <Link to={ROUTES.ADMIN} className="btn btn-sm">
                Admin panel
              </Link>
            )}
            <span className="role-pill">{user.role}</span>
            <button type="button" onClick={handleLogout} className="btn btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to={ROUTES.REGISTER}>Register</Link>
            <Link to={ROUTES.LOGIN} className="btn btn-primary btn-sm">
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
