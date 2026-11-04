# Testing

## Commands

- `npm test` — Vitest unit/integration tests (React Testing Library and MSW).
- `npm run test:e2e` — controlled Playwright browser journey. It starts a local Vite server and intercepts API calls; it does not use a production service.
- `npm run build` — TypeScript production build.
- `cd apps/api && "$(brew --prefix maven)/bin/mvn" -B -ntp test` — fast Maven unit tests.
- `cd apps/api && "$(brew --prefix maven)/bin/mvn" -B -ntp -Pintegration test` — PostgreSQL Testcontainers integration tests.

The Testcontainers profile requires Docker Desktop to be running. It creates a disposable PostgreSQL 17 container and removes it after the test JVM exits.

## Coverage

`AuthServiceTest` verifies duplicate registration does not save a user. The Testcontainers suite applies Flyway V1–V3 to PostgreSQL, verifies the 40/200 curriculum seed and repeat safety, decodes JSONB blocks, checks locale fallback and ordering, verifies missing-resource behavior, and confirms public curriculum reads do not open `/api/v1/admin/**`.

Frontend tests cover deterministic classroom resolution, API/HTTP failures, aborted stale requests, English/Malayalam rendering, fallback labels, all lesson block types (including unknown blocks), empty content, and draft metadata. The Playwright journey proves controlled API content is rendered, switches language modes, moves to another class, and retains note/progress browser storage.

Verified locally on 2026-11-04: `npm test` (8 passing), `npm run build`, `npm run test:e2e` (1 passing), Maven unit test, and the PostgreSQL Testcontainers suite (3 passing).
