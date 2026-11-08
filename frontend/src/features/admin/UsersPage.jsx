import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import { RoleBadge, StatusBadge } from "../../components/Badge.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import Pagination from "../../components/Pagination.jsx";
import SearchInput from "../../components/SearchInput.jsx";
import { ROUTES } from "../../constants/routes.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useListParams } from "../../hooks/useListParams.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage } from "../../lib/errors.js";
import { useAuth } from "../auth/useAuth.js";
import { deleteUser, listUsers, updateUserStatus } from "./adminApi.js";

const PAGE_SIZE = 10;

export default function UsersPage() {
  usePageTitle("Users");
  const { user: me } = useAuth();
  const { page, search, setPage, setSearch } = useListParams();
  const { data, loading, error, reload } = useFetch(listUsers, { page, limit: PAGE_SIZE, search });

  const [busyId, setBusyId] = useState(null); // which row is being changed right now
  const [actionError, setActionError] = useState("");

  const runAction = async (id, action) => {
    setActionError("");
    setBusyId(id);
    try {
      await action();
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, "That action failed."));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (user) => {
    if (await runAction(user._id, () => updateUserStatus(user._id, !user.isActive))) reload();
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    const done = await runAction(user._id, () => deleteUser(user._id));
    if (!done) return;
    // Deleted the last row of a page? Step back one page instead of showing an empty one.
    if (data.items.length === 1 && page > 1) setPage(page - 1);
    else reload();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Users</h1>
        <SearchInput value={search} onSearch={setSearch} placeholder="Search name or email..." label="Search users" />
      </div>

      <Alert>{error}</Alert>
      <Alert>{actionError}</Alert>

      {loading && !data ? (
        <PageLoader />
      ) : (
        data && (
          <div className={`table-wrap${loading ? " is-loading" : ""}`}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => {
                  const isSelf = me?._id === user._id;
                  const busy = busyId === user._id;
                  return (
                    <tr key={user._id}>
                      <td>
                        <Link to={ROUTES.ADMIN_USER(user._id)}>{user.name}</Link>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <RoleBadge role={user.role} />
                      </td>
                      <td>
                        <StatusBadge active={user.isActive} />
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => toggleStatus(user)}
                          disabled={busy || (isSelf && user.isActive)}
                          title={isSelf ? "You cannot deactivate your own account" : undefined}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => remove(user)}
                          disabled={busy || isSelf}
                          title={isSelf ? "You cannot delete your own account" : undefined}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      {search ? `No users match "${search}".` : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      <p className="muted small" style={{ marginTop: 8 }}>
        {data ? `${data.total} user${data.total === 1 ? "" : "s"} in total` : ""}
      </p>
      <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} disabled={loading} />
    </div>
  );
}
