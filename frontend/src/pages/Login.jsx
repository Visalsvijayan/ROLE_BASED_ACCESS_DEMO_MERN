import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/** One login form used for both regular users and admins; the backend
 *  tells us the role, and we redirect admins straight to the admin panel. */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const redirectTo = user.role === "admin" ? "/admin" : location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card">
        <h1>Login</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
          One login form for both <strong>user</strong> and <strong>admin</strong>.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
          No account? <Link to="/register">Register</Link>
        </p>

        <p style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          Demo:&nbsp;
          <code>admin@example.com / Admin@123</code>
          <br />
          <code>user@example.com / User@123</code>
        </p>
      </div>
    </div>
  );
};

export default Login;
