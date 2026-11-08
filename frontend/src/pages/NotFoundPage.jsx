import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <div className="auth-wrap">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>404 - Page not found</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          The page you are looking for doesn&apos;t exist or has moved.
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
