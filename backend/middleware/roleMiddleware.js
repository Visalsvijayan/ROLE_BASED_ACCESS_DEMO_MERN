/**
 * authorize(...allowedRoles)
 * Must be used AFTER the `protect` middleware so req.user is populated.
 * Returns 403 if the authenticated user's role is not in the allowed list.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
