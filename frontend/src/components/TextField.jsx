import { useId } from "react";

/**
 * A labelled input (or textarea) with an optional hint and error message,
 * wired up for screen readers (aria-invalid / aria-describedby).
 *
 *   <TextField label="Email" type="email" value={email} onChange={...} error={errors.email} />
 */
export default function TextField({ label, error, hint, multiline = false, ...inputProps }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const Control = multiline ? "textarea" : "input";

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...inputProps}
      />
      {error ? (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
