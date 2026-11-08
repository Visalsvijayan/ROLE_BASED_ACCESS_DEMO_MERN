/**
 * Wraps an async route handler so that any thrown error / rejected promise is
 * passed to Express's error handler. This removes the try/catch + next(error)
 * boilerplate from every controller (Express 4 does not do this by itself).
 */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
