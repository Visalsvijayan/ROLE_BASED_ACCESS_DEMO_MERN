# Authentication Flow

This document walks through every step of the auth flow, end to end.

## 1. Register / Login

```
User submits form
        ↓
POST /api/auth/login     (or /api/auth/register)
        ↓
Backend validates input
        ↓
Backend loads user from MongoDB (with password, via .select("+password"))
        ↓
bcrypt.compare(plaintext, hash)
        ↓
If valid:
  - generateAccessToken(user)   → JWT, 15m, signed with JWT_ACCESS_SECRET
  - generateRefreshToken(user)  → JWT, 7d,  signed with JWT_REFRESH_SECRET
  - res.cookie("refreshToken", refreshToken, { httpOnly: true, ... })
  - res.json({ user, accessToken })
```

The frontend stores the access token **only in React state** (in `AuthContext`).
The refresh token is in an **HTTP-only cookie** that JavaScript cannot read.

## 2. Authenticated requests

For every request, the Axios request interceptor injects the header:

```
Authorization: Bearer <accessToken>
```

The backend's `protect` middleware verifies this token, loads the user from the DB,
and attaches it to `req.user`.

## 3. Access token expired

```
Request → 401 Unauthorized
        ↓
Response interceptor catches the 401
        ↓
Is it a retried request?    → reject
Is it a /auth/* request?    → reject  (we don't want to loop on /refresh)
        ↓
POST /api/auth/refresh      (cookie auto-attached)
        ↓
Backend verifies refresh token, returns new access + refresh
        ↓
Store the new access token in AuthContext
        ↓
Retry the original request with the new token
```

A single-flight queue ensures that if **many** requests 401 at the same time
(e.g. the page just loaded and 10 calls fire), only **one** `/refresh` is made.
All other requests wait for the result, then retry with the same new token.

## 4. Refresh failed (refresh cookie expired / user deactivated)

```
        ↓
Unauthorized handler clears { user, accessToken }
        ↓
AuthContext renders the user as logged out
        ↓
<ProtectedRoute> / <AdminRoute> redirect to /login
```

## 5. Logout

```
POST /api/auth/logout    (with access token in Authorization header)
        ↓
Backend clears the refresh cookie (Set-Cookie with Expires=1970...)
        ↓
Frontend clears { user, accessToken }
        ↓
Redirect to /login
```

## Storage summary

| What | Where | Lifetime |
|---|---|---|
| Access token | React state (AuthContext) | 15m, then auto-refreshed |
| Refresh token | HTTP-only cookie | 7d |
| User info | React state | cleared on logout |
| Password hash | MongoDB | permanent (bcrypt) |
| Plaintext password | nowhere | never stored |
