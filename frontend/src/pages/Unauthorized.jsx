import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const Unauthorized = () => {
  const { user } = useAuth();
  return (
    <div className="auth-wrap">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>403 — Access Denied</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          You are signed in as <strong>{user?.email}</strong> with role{" "}
          <strong>{user?.role}</strong>. This area is for administrators only.
        </p>
        <p style={{ marginTop: 16 }}>
          <Link to="/" className="btn">Go home</Link>
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
