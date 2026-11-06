# API Endpoints

Base URL: `http://localhost:5000`

All admin endpoints return:

- `401 Unauthorized` when the access token is missing or invalid.
- `403 Forbidden` when the user is authenticated but does not have the required role.

All responses are JSON.

---

## Auth

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | public | `{ name, email, password }` | `201 { user, accessToken }` + sets `refreshToken` cookie |
| POST | `/api/auth/login` | public | `{ email, password }` | `200 { user, accessToken }` + sets `refreshToken` cookie |
| POST | `/api/auth/refresh` | public (cookie) | — | `200 { user, accessToken }` + rotates `refreshToken` cookie |
| POST | `/api/auth/logout` | authenticated | — | `200 { message: "Logged out" }` + clears cookie |
| GET | `/api/auth/me` | authenticated | — | `200 { user }` |

### `user` shape

```json
{
  "_id": "...",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

> The `password` field is **never** returned. The `User` model uses `select: false` on the password.

---

## Products

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/products` | public | — | `200 [product, ...]` (active only) |
| GET | `/api/products/:id` | public | — | `200 product` / `404` |
| GET | `/api/products/admin/all` | **admin** | — | `200 [product, ...]` (incl. inactive) |
| POST | `/api/products` | **admin** | `{ name, description, price, category, image?, stock, isActive? }` | `201 product` |
| PUT | `/api/products/:id` | **admin** | any subset of above | `200 product` |
| DELETE | `/api/products/:id` | **admin** | — | `200 { message, _id }` |

### `product` shape

```json
{
  "_id": "...",
  "name": "Wireless Headphones",
  "description": "Over-ear Bluetooth headphones...",
  "price": 89.99,
  "category": "Electronics",
  "image": "https://...",
  "stock": 25,
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Users (admin only)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/users` | **admin** | — | `200 [user, ...]` |
| GET | `/api/users/:id` | **admin** | — | `200 user` / `404` |
| PATCH | `/api/users/:id/status` | **admin** | `{ isActive: boolean }` | `200 user` |
| DELETE | `/api/users/:id` | **admin** | — | `200 { message, _id }` |

### Self-protection rules

- An admin **cannot deactivate themselves** (`PATCH /:id/status` returns `400` if `isActive: false` is sent for the caller's own id).
- An admin **cannot delete themselves** (`DELETE /:id` returns `400` if the target is the caller).

These rules exist purely for UX safety — they prevent the only admin from
locking themselves out. The actual data model has no special "last admin" guard
because this is a teaching project with a single seeded admin.

---

## Error format

All errors come back as a single JSON object:

```json
{ "message": "Access denied" }
```

| Code | When |
|---|---|
| 400 | Bad request (missing field, self-deactivation, etc.) |
| 401 | Missing or invalid access/refresh token |
| 403 | Authenticated but role not allowed |
| 404 | Resource not found |
| 500 | Server error |
