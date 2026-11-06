import { useEffect, useState } from "react";
import { adminListProducts, listUsers } from "../api.js";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listUsers(), adminListProducts()])
      .then(([users, products]) => {
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.isActive).length,
          totalProducts: products.length,
        });
      })
      .catch((e) => setError(e.response?.data?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      {error && <div className="form-error">{error}</div>}
      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className="stats">
          <div className="stat-card">
            <div className="label">Total Users</div>
            <div className="value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="label">Active Users</div>
            <div className="value">{stats.activeUsers}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Products</div>
            <div className="value">{stats.totalProducts}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Welcome, admin</h2>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          Manage users and products from the sidebar. All admin endpoints are
          protected with <code>protect + authorize("admin")</code>.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
