import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser } from "../api.js";

const AdminUserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getUser(id)
      .then(setUser)
      .catch((e) => setError(e.response?.data?.message || "Failed to load user"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container">
      <Link to="/admin/users">← Back to users</Link>
      <h1 style={{ marginTop: 12 }}>User Details</h1>
      {error && <div className="form-error">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div className="card">
          <table>
            <tbody>
              <tr><th style={{ width: 160 }}>Name</th><td>{user.name}</td></tr>
              <tr><th>Email</th><td>{user.email}</td></tr>
              <tr>
                <th>Role</th>
                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  <span className={`badge ${user.isActive ? "badge-active" : "badge-inactive"}`}>
                    {user.isActive ? "active" : "inactive"}
                  </span>
                </td>
              </tr>
              <tr><th>User ID</th><td style={{ fontFamily: "monospace", fontSize: 13 }}>{user._id}</td></tr>
              <tr><th>Created</th><td>{new Date(user.createdAt).toLocaleString()}</td></tr>
              <tr><th>Updated</th><td>{new Date(user.updatedAt).toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default AdminUserDetails;
