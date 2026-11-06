import { useAuth } from "../AuthContext.jsx";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="container">
      <div className="card">
        <h1>My Profile</h1>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          Information below comes from the protected <code>/api/auth/me</code> endpoint.
        </p>

        <table style={{ marginTop: 16 }}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Profile;
