# RBAC Flow (Role-Based Access Control)

This project has two roles: **`user`** and **`admin`**. RBAC is enforced in **two places**:

1. **Frontend** — `ProtectedRoute.jsx` and `AdminRoute.jsx`. These are *navigation* guards.
2. **Backend** — `authMiddleware.js` (`protect`) and `roleMiddleware.js` (`authorize(...)`). These are the **real security boundary**.

Frontend guards are for UX. If you bypass them (e.g. by typing `/admin` in the URL bar), the backend will still reject your request with `403 Forbidden` if you are not an admin.

---

## Flow A: Not logged in

```
Visit /admin
   ↓
<AdminRoute> sees isAuthenticated = false
   ↓
Redirect to /login
```

If the user instead calls the admin API directly with no token:

```
GET /api/users
   ↓
protect middleware: no Authorization header
   ↓
401 Unauthorized  { message: "Not authenticated" }
```

---

## Flow B: Logged in as user

```
Visit /admin
   ↓
<AdminRoute> sees isAuthenticated = true
   ↓
user.role === "user", not "admin"
   ↓
Redirect to /unauthorized
```

If the user calls the admin API directly with a **valid** access token:

```
GET /api/users
Authorization: Bearer <valid access token, role=user>
   ↓
protect middleware: token valid, user loaded
   ↓
authorize("admin"): req.user.role !== "admin"
   ↓
403 Forbidden  { message: "Access denied" }
```

> This is the key demo: a **valid** token is still not enough. RBAC requires
> the *role* to match. Same token, different endpoint, different answer.

---

## Flow C: Logged in as admin

```
Visit /admin
   ↓
<AdminRoute>: authenticated AND role === "admin"
   ↓
Render the dashboard
```

```
GET /api/users
Authorization: Bearer <valid access token, role=admin>
   ↓
protect: ok
   ↓
authorize("admin"): ok
   ↓
200 OK with users list
```

---

## Where RBAC lives in the code

### Backend

```js
// backend/routes/userRoutes.js
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);
```

```js
// backend/middleware/roleMiddleware.js
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
```

### Frontend

```jsx
// frontend/src/components/AdminRoute.jsx
<Route
  path="/admin"
  element={
    <AdminRoute>
      <Dashboard />
    </AdminRoute>
  }
/>
```

```jsx
// frontend/src/components/Navbar.jsx
{isAuthenticated && user?.role === "admin" && (
  <>
    <Link to="/admin">Dashboard</Link>
    <Link to="/admin/users">Users</Link>
    <Link to="/admin/products">Products</Link>
  </>
)}
```

The navbar hides admin links for non-admins, but even if a user typed the URL
in, the AdminRoute would redirect them and the backend would still return 403.

---

## Status code cheat sheet

| Scenario | Code |
|---|---|
| No token / invalid token | **401** |
| Valid token, wrong role | **403** |
| Valid token, inactive user | **401** (treated as unauthenticated) |
| Valid admin token, all good | **200** |
