# API endpoints

Base URL: `/api`. Errors are JSON: `{ "message": "...", "errors": [{ "path", "message" }] }` (`errors` only for validation, status 400).
Send `Authorization: Bearer <accessToken>` where "Auth" is listed. Lists return `{ items, page, limit, total, totalPages }` and accept `?page=&limit=` (limit max 100) and `?search=`.

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/health` | public | 200 when DB connected, else 503 |
| POST | `/auth/register` | public | `{name,email,password}`; password 8-72 chars with a letter and a number; always creates role `user` |
| POST | `/auth/login` | public | returns `{user, accessToken}` and sets the refresh cookie; 401 bad credentials, 403 deactivated |
| POST | `/auth/refresh` | cookie | rotates the cookie, returns a new `accessToken` |
| POST | `/auth/logout` | cookie | revokes the refresh token (always 200) |
| GET | `/auth/me` | any user | current user |
| GET | `/products` | public | only active products |
| GET | `/products/:id` | public | 404 if inactive |
| GET | `/products/admin/all` | admin | includes inactive |
| GET | `/products/admin/:id` | admin | |
| POST | `/products` | admin | |
| PUT | `/products/:id` | admin | partial update |
| DELETE | `/products/:id` | admin | |
| GET | `/users` | admin | paginated, search by name/email |
| GET | `/users/:id` | admin | |
| PATCH | `/users/:id/status` | admin | `{isActive}`; cannot deactivate yourself; revokes sessions |
| DELETE | `/users/:id` | admin | cannot delete yourself |
| GET | `/admin/stats` | admin | dashboard counts |

Status codes: 401 not logged in / token invalid, 403 logged in but wrong role, 404 not found, 409 duplicate email, 429 rate limited.
