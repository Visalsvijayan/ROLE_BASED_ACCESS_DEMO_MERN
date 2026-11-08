import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";
import { useAuth } from "../features/auth/useAuth.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function UnauthorizedPage() {
  usePageTitle("Access denied");
  const { user } = useAuth();

  return (
    <div className="auth-wrap">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>403 - Access denied</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {user ? (
            <>
              You are signed in as <strong>{user.email}</strong> with the <strong>{user.role}</strong> role.
              This area is only for administrators.
            </>
          ) : (
            "You don't have permission to view this page."
          )}
        </p>
        <p style={{ marginTop: 16 }}>
          <Link to={ROUTES.HOME} className="btn">
            Go home
          </Link>
        </p>
      </div>
    </div>
  );
}
