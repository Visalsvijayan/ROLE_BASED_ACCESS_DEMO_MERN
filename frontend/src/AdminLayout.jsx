import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";

/**
 * AdminLayout — sidebar + content area, used for every /admin/* route.
 * The matched admin page renders in place of <Outlet />.
 */
const AdminLayout = () => (
  <div className="admin-shell">
    <AdminSidebar />
    <main className="admin-content">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
