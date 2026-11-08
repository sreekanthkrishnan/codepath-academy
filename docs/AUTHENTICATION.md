# Authentication

CodePath Academy uses independent application accounts; the static Site’s ChatGPT access gate is not used as backend identity. Passwords are stored only as BCrypt hashes. The API stores the authenticated user identifier in an HttpOnly server session and recreates the Spring Security principal per request.

CSRF tokens use the `XSRF-TOKEN` cookie and `X-XSRF-TOKEN` header. Registration and login are the only CSRF-exempt state-changing endpoints because they occur before an account session exists. Production must set `SESSION_COOKIE_SECURE=true`, use HTTPS, configure an exact `CORS_ALLOWED_ORIGINS` list, and preferably serve API and client under one site.

`ADMIN`, `CONTENT_EDITOR`, and `INSTRUCTOR` paths are server-enforced under `/api/v1/admin/**`; no frontend check is considered authorization.

## Session recovery and pending notes

An authenticated note edit is first written to versioned browser storage as an account-partitioned pending draft. It contains a draft identifier, account and curriculum IDs, optional server-note ID, expected revision, title/body, locale, timestamp, and sync state; it never contains credentials, cookies, passwords, or CSRF tokens. Browser storage is not encrypted and must not be treated as private on a shared browser profile.

For a failed note mutation, a `401` is an expired session. A `403` is first treated as a normal CSRF failure; the client performs one shared `/auth/me` identity probe for concurrent failures and only treats that `403` as expiry when the identity probe is unauthenticated. Network failures never prove expiry. Reauthentication only offers drafts that match the real `/auth/me` account ID, and requires an explicit Retry sync. Account changes clear account-specific React state, so another account cannot view or submit the prior account’s pending draft.
