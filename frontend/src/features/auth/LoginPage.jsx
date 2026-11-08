import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import TextField from "../../components/TextField.jsx";
import { IS_DEV } from "../../config/env.js";
import { ROUTES } from "../../constants/routes.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage } from "../../lib/errors.js";
import { useAuth } from "./useAuth.js";

/**
 * One login form for users and admins. After a successful login <GuestRoute>
 * notices the user is now logged in and redirects them (admin -> /admin).
 */
export default function LoginPage() {
  usePageTitle("Login");
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card">
        <h1>Login</h1>
        <p className="muted" style={{ marginBottom: 16 }}>
          Sign in to your account.
        </p>

        <Alert>{error}</Alert>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="muted small" style={{ marginTop: 16 }}>
          No account? <Link to={ROUTES.REGISTER}>Register</Link>
        </p>

        {/* Demo logins are only shown while developing, never in a production build. */}
        {IS_DEV && (
          <p className="muted small" style={{ marginTop: 12 }}>
            Demo (after <code>npm run seed</code>):
            <br />
            <code>admin@example.com / Admin@123</code>
            <br />
            <code>user@example.com / User@123</code>
          </p>
        )}
      </div>
    </div>
  );
}
