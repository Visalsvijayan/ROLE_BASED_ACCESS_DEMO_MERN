/**
 * An error we threw on purpose, with the HTTP status code to send back.
 *
 *   throw ApiError.notFound("Product not found");
 *
 * The central error handler turns it into: { message: "Product not found" }
 * Anything that is NOT an ApiError is treated as an unexpected 500.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details; // optional: list of field-level problems
  }

  static badRequest(message = "Bad request", details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Not authenticated") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Access denied") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }
}
