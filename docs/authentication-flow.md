# Authentication flow

1. **Login/Register** -> server returns a 15-minute **access token** (JSON) and sets a **refresh token** as an HttpOnly cookie (path `/api/auth`). The frontend keeps the access token in memory only (never localStorage), so scripts injected into the page cannot steal it.
2. Every API call sends `Authorization: Bearer <accessToken>`. The `protect` middleware verifies it and loads the user from the database, so deactivated or deleted users are rejected at once.
3. When a call returns **401**, the axios interceptor calls `/auth/refresh` once (even if several calls failed together, only one refresh is sent) and retries the original request.
4. **Refresh rotation:** each refresh issues a new refresh token and revokes the old one. A 30-second grace period lets two open tabs refresh at the same time. Refresh tokens are stored hashed (SHA-256) and expire automatically.
5. **Page reload:** the in-memory token is gone, so the app calls `/auth/refresh` on startup to restore the session.
6. **Logout** revokes the refresh token and clears the cookie. If refresh fails with 401, the app clears the session and sends the user to login.
