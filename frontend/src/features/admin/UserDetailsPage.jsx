import { Link, useParams } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import { RoleBadge, StatusBadge } from "../../components/Badge.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import { ROUTES } from "../../constants/routes.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { formatDateTime } from "../../lib/format.js";
import { getUser } from "./adminApi.js";

export default function UserDetailsPage() {
  const { id } = useParams();
  const { data: user, loading, error } = useFetch(getUser, id);
  usePageTitle(user?.name ?? "User");

  return (
    <div className="container">
      <Link to={ROUTES.ADMIN_USERS} className="small">
        ← Back to users
      </Link>
      <h1 style={{ margin: "12px 0" }}>User details</h1>

      <Alert>{error}</Alert>
      {loading && !user && <PageLoader />}

      {user && !error && (
        <div className="card">
          <div className="table-wrap">
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
                  <th>User ID</th>
                  <td className="mono">{user._id}</td>
                </tr>
                <tr>
                  <th>Created</th>
                  <td>{formatDateTime(user.createdAt)}</td>
                </tr>
                <tr>
                  <th>Updated</th>
                  <td>{formatDateTime(user.updatedAt)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
