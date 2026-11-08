# MERN Role-Based Access Control (RBAC) Shop

A small e-commerce app with two roles, **user** and **admin**. It is written to be read and learned from, and it follows production practices.

- **Frontend:** React 19, React Router 7, Vite, axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, zod

## Project structure

```
backend/src
  config/        env validation (fails fast), database connection
  constants/     roles
  models/        User, Product, RefreshToken (Mongoose schemas)
  validators/    zod schemas: what each request may contain
  middleware/    protect (login check), authorize (role check), validate, errors, rate limits
  services/      business logic (auth, tokens, products, users, stats)
  controllers/   thin: read request -> call a service -> send response
  routes/        URL -> middleware -> controller
  scripts/       seed.js, createAdmin.js
  app.js         Express app (no listening)    server.js  starts it + graceful shutdown
backend/tests    unit, API and RBAC integration tests

frontend/src
  config/ constants/ lib/   env, roles, routes, axios client, helpers
  hooks/ components/        reusable pieces
  features/auth|products|admin   each feature: its pages + API calls
  layouts/                  MainLayout, AdminLayout, Navbar, AdminSidebar
  routes/AppRoutes.jsx      the whole site map, who can open what
```

Request flow: `route -> middleware (validate, protect, authorize) -> controller -> service -> model`.

## Run it locally

You need **Node 22.12+** and a running **MongoDB**.

```bash
# 1) Backend
cd backend
cp .env.example .env          # then fill in the two JWT secrets (command is inside the file)
npm install
npm run seed                  # demo data: admin@example.com / Admin@123, user@example.com / User@123
npm run dev                   # http://localhost:8000

# 2) Frontend (new terminal)
cd frontend
cp .env.example .env          # optional, defaults work
npm install
npm run dev                   # http://localhost:5173  (/api is proxied to the backend)
```

Create a real admin (also in production; `seed` refuses to run there):
`ADMIN_NAME=You ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='Str0ngPass1' npm run create-admin`

## Scripts

| Where | Command | What it does |
|---|---|---|
| backend | `npm start` / `npm run dev` | run / run with auto-reload |
| backend | `npm test`, `npm run lint` | tests, lint |
| backend | `MONGO_URI_TEST=mongodb://127.0.0.1:27017/mern_rbac_test npm test` | also runs the RBAC integration test (wipes that test DB) |
| frontend | `npm run dev`, `npm run build`, `npm run preview` | dev server / production build into `dist/` / preview it |
| frontend | `npm test`, `npm run lint` | tests, lint |

## Environment variables

`.env` holds real values and is **never committed**. `.env.example` is a committed template with no secrets. Hosting providers (Render, Vercel, ...) have their own "Environment variables" screen; set the same names there instead of uploading `.env`.

Backend: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (32+ chars each, different), `CLIENT_URL`, `COOKIE_SAME_SITE`, `TRUST_PROXY`. See `backend/.env.example`.
Frontend: `VITE_API_URL` (default `/api`; baked in at build time), `DEV_API_TARGET` (dev proxy only).

## Deploying

1. **Backend** (Render, Railway, ...): root `backend`, start `npm start`, set env vars, `NODE_ENV=production`, `TRUST_PROXY=1`, `CLIENT_URL=<your frontend URL>`. Use MongoDB Atlas for `MONGO_URI`.
2. **Frontend** (Vercel, Netlify, ...): root `frontend`, build `npm run build`, output `dist`.
3. **Cookies:** the refresh token lives in an HttpOnly cookie. Easiest and most secure: serve the frontend and API from the same site by proxying/rewriting `/api` to the backend (keep `VITE_API_URL=/api`, `COOKIE_SAME_SITE=lax`). If they must be on different sites, set `VITE_API_URL=https://api.example.com/api` and `COOKIE_SAME_SITE=none` (HTTPS required; some browsers block third-party cookies).
4. Create the first admin with `npm run create-admin` against the production database.

## Security summary

Passwords hashed with bcrypt; 15-minute access token kept in memory only; rotating refresh token in an HttpOnly cookie, stored hashed and revocable; role never accepted from the client; the user is reloaded from the database on every request, so deactivating or deleting an account locks them out immediately; zod validation, NoSQL-injection-safe input, helmet, CORS allow-list, rate limiting on auth routes.
Route guards in React only hide pages; the backend enforces every permission.

More detail: `docs/`.
