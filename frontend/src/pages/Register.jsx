import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { registerRequest } from "../api.js";

/** Self-service registration always creates a "user" account.
 *  Admin accounts are promoted manually (e.g. via a DB seed). */
const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await registerRequest(name, email, password);
      await login(email, password); // logs the new account straight in
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card">
        <h1>Create account</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
          New accounts are created with the <strong>user</strong> role.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password (min 6 chars)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
