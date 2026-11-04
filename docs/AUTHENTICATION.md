# Authentication

CodePath Academy uses independent application accounts; the static Site’s ChatGPT access gate is not used as backend identity. Passwords are stored only as BCrypt hashes. The API stores the authenticated user identifier in an HttpOnly server session and recreates the Spring Security principal per request.

CSRF tokens use the `XSRF-TOKEN` cookie and `X-XSRF-TOKEN` header. Registration and login are the only CSRF-exempt state-changing endpoints because they occur before an account session exists. Production must set `SESSION_COOKIE_SECURE=true`, use HTTPS, configure an exact `CORS_ALLOWED_ORIGINS` list, and preferably serve API and client under one site.

`ADMIN`, `CONTENT_EDITOR`, and `INSTRUCTOR` paths are server-enforced under `/api/v1/admin/**`; no frontend check is considered authorization.
