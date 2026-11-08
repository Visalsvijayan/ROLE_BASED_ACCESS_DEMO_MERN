import { Link, NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";
import { useAuth } from "../features/auth/useAuth.js";

const LINKS = [
  { to: ROUTES.ADMIN, label: "Dashboard", icon: "📊", end: true },
  { to: ROUTES.ADMIN_USERS, label: "Users", icon: "👥" },
  { to: ROUTES.ADMIN_PRODUCTS, label: "Products", icon: "📦" },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true, state: null });
  };

  return (
    <aside className="admin-sidebar">
      <Link to={ROUTES.ADMIN} className="admin-sidebar-brand">
        🛒 MERN Shop <span className="role-pill">admin</span>
      </Link>

      <nav className="admin-sidebar-nav" aria-label="Admin">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `admin-sidebar-link${isActive ? " active" : ""}`}
          >
            <span aria-hidden="true">{link.icon}</span> {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">{user?.email}</div>
        <Link to={ROUTES.HOME} className="admin-sidebar-link">
          <span aria-hidden="true">←</span> Back to store
        </Link>
        <button type="button" onClick={handleLogout} className="btn btn-sm btn-block" style={{ marginTop: 8 }}>
          Logout
        </button>
      </div>
    </aside>
  );
}
