# Architecture

CodePath Academy is evolving into a modular monolith:

```text
Vite/React static client -- HTTPS --> Spring Boot API -- JDBC --> PostgreSQL
```

The API owns identities, roles, curriculum, progress, notes, assessments, practice, project tracking, study data and audit records. The client owns transient UI state plus a versioned, explicitly importable browser-data backup during migration.

Static `chatgpt.site` hosting is retained for the client only. Production must deploy the API to a Java-capable HTTPS host. Prefer a same-site reverse proxy such as `academy.example.com` -> `/api` to avoid third-party-cookie failures; otherwise use an explicit CORS allowlist and documented cookie policy.
