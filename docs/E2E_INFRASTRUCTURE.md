# Real E2E infrastructure

Run `npm run test:e2e:real` with Docker Desktop available. The runner creates a randomly named PostgreSQL 17 container without a volume, starts Spring Boot with the `e2e` profile on loopback, starts Vite with its same-origin `/api` proxy, and runs every spec under `e2e-real/`. It signals the processes and removes the database container in `finally`.

No production URL, account, or Compose database is used. Redacted Spring Boot output and a startup/shutdown summary remain in ignored `.e2e-logs/` after a run. The suite currently contains the real authentication smoke test and the cross-browser learning-data migration journey.
