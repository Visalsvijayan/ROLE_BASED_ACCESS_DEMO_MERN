# MERN RBAC E-Commerce

A small, deliberately simple **MERN** stack project that focuses on one thing: teaching **Role-Based Access Control (RBAC)** with **JWT authentication** (access token + refresh token in an HTTP-only cookie).

There are only two roles: `user` and `admin`. There is one common login form. The backend is the source of truth — frontend route guards are only for UX, the real security boundary is the API.

---

## 1. Project Overview

This project implements:

- **Authentication** with short-lived access tokens + long-lived refresh tokens
- **Role-based access control** on both backend (middleware) and frontend (route guards)
- **User management** (admin only)
- **Product management** (admin only) and public product browsing (any user)

The frontend is intentionally kept small: **React + Vite + React Router + Axios + Context API + plain CSS**. The backend is **Express + Mongoose + JWT + bcrypt** in a clean MVC layout.

---

## 2. Folder Structure

```
mern-rbac-ecommerce/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── productRoutes.js
│   ├── utils/
│   │   └── tokenUtils.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   └── Loading.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── user/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── ProductDetails.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Users.jsx
│   │   │       ├── UserDetails.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── AddProduct.jsx
│   │   │       └── EditProduct.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   └── productService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── docs/
│   ├── authentication-flow.md
│   ├── rbac-flow.md
│   └── api-endpoints.md
└── README.md
```

---

## 3. Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 4. Environment Setup

Copy `.env.example` to `.env` in both folders.

`backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_rbac_ecommerce
JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit real `.env` files. The repository only contains `.env.example`.

---

## 5. Database Setup

You need a local MongoDB instance. The simplest way:

```bash
# macOS (homebrew)
brew services start mongodb-community

# or with Docker
docker run -d -p 27017:27017 --name mongo-rbac mongo:6
```

The default `MONGO_URI` is `mongodb://127.0.0.1:27017/mern_rbac_ecommerce`.

---

## 6. Seed Command

From the `backend` folder:

```bash
npm run seed
```

This creates:

- **Admin** — `admin@example.com` / `Admin@123`
- **User** — `user@example.com` / `User@123`
- A few sample products (headphones, keyboard, T-shirt, water bottle)

Passwords are stored as **bcrypt** hashes; the raw value is never written to the database.

---

## 7. Running the App

```bash
# Terminal 1 — backend
cd backend
npm run dev          # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev          # http://localhost:5173
```

Open `http://localhost:5173` and log in with the demo credentials.

---

## 8. Authentication Flow

```
Register / Login
   ↓
Validate credentials
   ↓
bcrypt.compare(password)
   ↓
Generate access token (15m) + refresh token (7d)
   ↓
Refresh token → HTTP-only cookie (path=/api/auth)
   ↓
Access token → returned in JSON to frontend
   ↓
AuthContext stores { user, accessToken } in memory
   ↓
Every request:  Authorization: Bearer <accessToken>
   ↓
If 401 → Axios interceptor calls /api/auth/refresh
   ↓
New access token stored, original request retried
```

See [`docs/authentication-flow.md`](./docs/authentication-flow.md) for diagrams.

---

## 9. Access Token vs Refresh Token

| | Access Token | Refresh Token |
|---|---|---|
| Lifetime | **15m** (short) | **7d** (long) |
| Storage | React memory (AuthContext) | HTTP-only cookie |
| Sent via | `Authorization: Bearer ...` | Cookie header (automatic) |
| Used for | Every API call | Only `/api/auth/refresh` |
| Exposed to JS? | Yes (memory only, never localStorage) | **No** — JS cannot read it |

**Why two tokens?** If the access token leaks, it expires quickly. The refresh token can only be used to mint new access tokens and is not accessible to JavaScript (so XSS cannot steal it).

---

## 10. React Context (`AuthContext`)

`AuthContext` exposes:

```js
const {
  user,              // { _id, name, email, role, isActive } or null
  accessToken,       // string | null
  loading,           // true during initial silent refresh
  isAuthenticated,   // !!user && !!accessToken
  login,             // (email, password) => Promise<user>
  logout,            // () => Promise<void>
  refreshAccessToken // () => Promise<accessToken>
} = useAuth();
```

The `accessToken` is **never** written to `localStorage` or `sessionStorage`. It lives in React state and in a closure inside `services/api.js` that the Axios request interceptor reads on every request.

---

## 11. `ProtectedRoute` & `AdminRoute`

| Component | Allows when… |
|---|---|
| `<ProtectedRoute>` | user is authenticated |
| `<AdminRoute>` | user is authenticated **and** `user.role === "admin"` |

Behavior:

- Not logged in + protected route → redirected to `/login`
- Logged in user + admin route → redirected to `/unauthorized`
- Logged in admin + admin route → renders

> These are **UI guards only**. The actual security boundary is the backend.

---

## 12. Backend `protect` middleware

`backend/middleware/authMiddleware.js` — `protect`

1. Reads `Authorization: Bearer <token>` from the request header.
2. Verifies the token with `JWT_ACCESS_SECRET`.
3. Loads the user from MongoDB.
4. Rejects inactive users.
5. Attaches the user to `req.user`.

If any step fails → **`401 Unauthorized`** with `{ message: "..." }`.

---

## 13. Backend `authorize` middleware

`backend/middleware/roleMiddleware.js`

```js
router.get("/", protect, authorize("admin"), getUsers);
```

- Must be used **after** `protect` (so `req.user` exists).
- Returns **`403 Forbidden`** if `req.user.role` is not in the allowed list.
- Returns **`401 Unauthorized`** if `req.user` is missing entirely (defense in depth).

---

## 14. 401 vs 403

| Code | Meaning | Example |
|---|---|---|
| **401** | **Not authenticated** — token missing, invalid, or expired | No `Authorization` header, or refresh cookie expired |
| **403** | **Authenticated but not authorized** — role check failed | Logged in as `user`, trying to call `/api/users` |

> A normal user with a perfectly valid access token still gets `403` when calling an admin endpoint. That is the entire point of RBAC.

---

## 15. API Endpoints

See [`docs/api-endpoints.md`](./docs/api-endpoints.md) for the full list.

Quick reference:

| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/refresh` | public (uses cookie) |
| POST | `/api/auth/logout` | authenticated |
| GET | `/api/auth/me` | authenticated |
| GET | `/api/products` | public |
| GET | `/api/products/:id` | public |
| POST | `/api/products` | admin |
| PUT | `/api/products/:id` | admin |
| DELETE | `/api/products/:id` | admin |
| GET | `/api/users` | admin |
| GET | `/api/users/:id` | admin |
| PATCH | `/api/users/:id/status` | admin |
| DELETE | `/api/users/:id` | admin |

---

## 16. Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin@123` |
| User | `user@example.com` | `User@123` |

After logging in as the admin, you will be redirected to `/admin`. After logging in as the user, you will be redirected to `/`.

---

## 17. What This Project Intentionally Does NOT Include

To stay focused on RBAC and JWT, this project does **not** include:

- Cart, orders, payments
- File uploads (product images are URL-only)
- Email verification, OTP, Google login
- Redux / any other state library
- TypeScript, Tailwind, Docker, Redis
- Microservices, GraphQL
- Multiple admin roles or complex permission systems

These can be added on top later without changing the auth model.
