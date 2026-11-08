import { ApiError } from "../utils/ApiError.js";

/**
 * validate({ params, query, body })
 *
 * Checks the incoming request against zod schemas BEFORE the controller runs.
 * On success the cleaned values (trimmed, lower-cased, numbers converted,
 * unknown fields removed) replace req.params / req.query / req.body, so
 * controllers can trust what they read.
 *
 * On failure the client gets a 400 like:
 *   { message: "Password must contain at least one number",
 *     errors: [{ path: "password", message: "..." }] }
 */
export const validate = (schemas) => (req, _res, next) => {
  for (const part of ["params", "query", "body"]) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(ApiError.badRequest(errors[0].message, errors));
    }
    req[part] = result.data;
  }
  next();
};
