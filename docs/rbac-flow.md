# Role-based access flow

Roles: `user`, `admin` (`backend/src/constants/roles.js`). The role is stored on the user in the database and is never taken from a request body.

**Backend (the real security)**
- `protect` -> 401 if there is no valid token or the account is inactive.
- `authorize(ROLES.ADMIN)` -> 403 if the role is not allowed.
- `/api/users`, `/api/admin/*`, product create/update/delete and `/api/products/admin/*` are admin only.

**Frontend (user experience only)** - `features/auth/routeGuards.jsx`
- `GuestRoute`: login/register; logged-in users are redirected home (admins to `/admin`).
- `ProtectedRoute`: needs login, otherwise `/login` and back afterwards.
- `RoleRoute allowedRoles={[ADMIN]}`: guards all of `/admin/*` once; a user gets `/unauthorized`.
- The product catalog (home, products, product details) is public. To require login, wrap those routes in `ProtectedRoute` in `routes/AppRoutes.jsx` (the API would also need `protect` on `GET /products`).

| Page | Guest | User | Admin |
|---|---|---|---|
| Catalog | yes | yes | yes |
| Profile | no | yes | yes |
| `/admin/*` | no | no | yes |
