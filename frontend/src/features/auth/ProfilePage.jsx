import { RoleBadge, StatusBadge } from "../../components/Badge.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { formatDateTime } from "../../lib/format.js";
import { useAuth } from "./useAuth.js";

export default function ProfilePage() {
  usePageTitle("My profile");
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="container">
      <div className="card">
        <h1>My profile</h1>
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <tbody>
              <tr>
                <th style={{ width: 160 }}>Name</th>
                <td>{user.name}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{user.email}</td>
              </tr>
              <tr>
                <th>Role</th>
                <td>
                  <RoleBadge role={user.role} />
                </td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  <StatusBadge active={user.isActive} />
                </td>
              </tr>
              <tr>
                <th>Member since</th>
                <td>{formatDateTime(user.createdAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
