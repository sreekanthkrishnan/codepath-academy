# Testing

## Commands

- `npm test` — Vitest unit/integration tests (React Testing Library and MSW).
- `npm run test:e2e` — controlled Playwright browser journey. It starts a local Vite server and intercepts API calls; it does not use a production service.
- `npm run test:e2e:real` — isolated real-stack authentication smoke test. It starts a randomly named disposable PostgreSQL 17 container, Spring Boot with the `e2e` profile on `127.0.0.1:18080`, and Vite on `127.0.0.1:4176`; it then runs `e2e-real/` and removes the container in `finally`.
- `npm run build` — TypeScript production build.
- `cd apps/api && "$(brew --prefix maven)/bin/mvn" -B -ntp test` — fast Maven unit tests.
- `cd apps/api && "$(brew --prefix maven)/bin/mvn" -B -ntp -Pintegration test` — PostgreSQL Testcontainers integration tests.

The Testcontainers profile and `test:e2e:real` require Docker Desktop to be running. Both use disposable PostgreSQL 17 containers; the real E2E runner never mounts a volume or contacts a production deployment. The runner finds Maven on `PATH`, falls back to Homebrew Maven, or accepts an explicit `MVN_CMD`. Redacted Spring Boot diagnostics and a startup/shutdown summary are retained in ignored `.e2e-logs/` after failures.

## Coverage

`AuthServiceTest` verifies duplicate registration does not save a user. The Testcontainers suite applies Flyway V1–V6 to PostgreSQL, verifies the 40/200 curriculum seed and repeat safety, decodes JSONB blocks, checks locale fallback and ordering, verifies missing-resource behavior, confirms public curriculum reads do not open `/api/v1/admin/**`, and verifies topic-progress persistence, transitions, ownership, and optimistic-concurrency behavior.

Frontend tests cover deterministic classroom resolution, API/HTTP failures, aborted stale requests, English/Malayalam rendering, fallback labels, all lesson block types (including unknown blocks), empty content, and draft metadata. The Playwright journey proves controlled API content is rendered, switches language modes, moves to another class, and retains note/progress browser storage.

The real smoke test observes, without mocking, the proxied `POST /api/v1/auth/register` request (method, URL, field names, status, safe response headers/body), then proves valid registration, `STUDENT` role assignment, authenticated `/me`, invalid/duplicate rejection, CSRF rejection without a token, CSRF-protected browser logout, and independent unauthenticated browser isolation. It does not print passwords, cookies, session IDs, or CSRF tokens.

`e2e-real/learning-data-migration.spec.ts` adds a no-mock migration journey: preview non-mutation, export/local-storage retention, explicit confirmation, API-level note/progress persistence, Malayalam preservation, exact-payload idempotency, conflicting-key rejection, conflict preservation, invalid-schema rejection, logout/login persistence, clean-context retrieval, and cross-account API isolation. `e2e-real/session-expiration.spec.ts` verifies that an expired session preserves a pending Malayalam draft, same-user reauthentication requires an explicit retry before the note reaches PostgreSQL, and a second account in the same browser cannot view or submit it.

Latest verified local checkpoint (2026-11-06): `npm test` 16 tests, `npm run build`, Maven unit tests (1), PostgreSQL Testcontainers integration tests (8), mocked classroom Playwright (1), and real isolated Playwright (4) passed. The real runner removed its disposable PostgreSQL container.
