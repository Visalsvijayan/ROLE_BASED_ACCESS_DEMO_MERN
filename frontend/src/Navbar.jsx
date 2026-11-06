import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

/**
 * Navbar — top bar for the public site and the regular "user" pages.
 * (Admin pages use their own sidebar layout instead — see AdminLayout.jsx.)
 *   - Guest -> Products, Login
 *   - User  -> Products, Profile, Logout
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        🛒 MERN Shop
      </Link>
      <nav>
        <Link to="/products">Products</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="btn btn-sm">
                Admin panel
              </Link>
            )}
            <span className="role-pill">{user?.role}</span>
            <button onClick={handleLogout} className="btn btn-sm">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
