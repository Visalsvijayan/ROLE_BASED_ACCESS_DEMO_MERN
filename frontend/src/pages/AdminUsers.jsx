import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listUsers, updateUserStatus, deleteUser } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const AdminUsers = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = () => {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch((e) => setError(e.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStatus = async (u) => {
    setActionError("");
    try {
      await updateUserStatus(u._id, !u.isActive);
      load();
    } catch (e) {
      setActionError(e.response?.data?.message || "Failed to update user");
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.email}?`)) return;
    setActionError("");
    try {
      await deleteUser(u._id);
      load();
    } catch (e) {
      setActionError(e.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="container">
      <h1>Users</h1>
      {error && <div className="form-error">{error}</div>}
      {actionError && <div className="form-error">{actionError}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = me && me._id === u._id;
              return (
                <tr key={u._id}>
                  <td><Link to={`/admin/users/${u._id}`}>{u.name}</Link></td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge ${u.isActive ? "badge-active" : "badge-inactive"}`}>
                      {u.isActive ? "active" : "inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => toggleStatus(u)}
                      disabled={isSelf && u.isActive}
                      title={isSelf ? "You cannot deactivate your own account" : ""}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>{" "}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => remove(u)}
                      disabled={isSelf}
                      title={isSelf ? "You cannot delete your own account" : ""}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center" }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
