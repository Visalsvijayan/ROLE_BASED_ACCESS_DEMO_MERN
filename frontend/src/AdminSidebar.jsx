import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

/**
 * AdminSidebar — left-hand navigation for every /admin/* page.
 * Highlights the current section and has a logout button at the bottom.
 */
const links = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/products", label: "Products", icon: "📦" },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <Link to="/admin" className="admin-sidebar-brand">
        🛒 MERN Shop <span className="role-pill">admin</span>
      </Link>

      <nav className="admin-sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "admin-sidebar-link" + (isActive ? " active" : "")}
          >
            <span aria-hidden="true">{link.icon}</span> {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">{user?.email}</div>
        <Link to="/" className="admin-sidebar-link">
          <span aria-hidden="true">←</span> Back to store
        </Link>
        <button onClick={handleLogout} className="btn btn-sm" style={{ width: "100%", marginTop: 8 }}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
