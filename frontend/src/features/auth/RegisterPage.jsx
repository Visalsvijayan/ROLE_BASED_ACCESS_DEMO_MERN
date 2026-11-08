import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import TextField from "../../components/TextField.jsx";
import { ROUTES } from "../../constants/routes.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage, getFieldErrors } from "../../lib/errors.js";
import { useAuth } from "./useAuth.js";

/** Self-service sign-up always creates a "user" account (the backend decides that). */
export default function RegisterPage() {
  usePageTitle("Create account");
  const { register } = useAuth();

  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(values); // the backend logs the new user in straight away
    } catch (err) {
      const fields = getFieldErrors(err);
      setFieldErrors(fields);
      // If we can show the problem under a field, don't repeat it at the top.
      setError(Object.keys(fields).length ? "" : getErrorMessage(err, "Registration failed."));
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card">
        <h1>Create account</h1>
        <p className="muted" style={{ marginBottom: 16 }}>
          New accounts get the <strong>user</strong> role.
        </p>

        <Alert>{error}</Alert>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            value={values.name}
            onChange={handleChange("name")}
            error={fieldErrors.name}
            required
            minLength={2}
            maxLength={50}
            autoComplete="name"
          />
          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange("password")}
            error={fieldErrors.password}
            hint="At least 8 characters, with a letter and a number."
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="muted small" style={{ marginTop: 16 }}>
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
