# Implementation progress

## Completed

- Phase 0 repository audit (`REPOSITORY_AUDIT.md`).
- Phase 1 implementation slice: Spring Boot module, Flyway foundation, independent session authentication endpoints, CORS/CSRF configuration, Actuator, OpenAPI, Docker Compose and one unit test.
- Backend compile and unit-test checkpoint: `mvn -B -ntp test` passed (1 test, 0 failures) using Java 25.
- Frontend local-data export: a JSON backup containing only language, class progress and notes is now available from Notes.
- Curriculum API slice: repeat-safe 40-week / 200-class seed service, deterministic class codes, locale-aware program/week/class APIs, and a non-destructive curriculum-content migration.
- The Roadmap now requests API curriculum and visibly falls back to the checked-in curriculum only when the backend is unavailable.
- Live PostgreSQL validation: Flyway V1–V3 applied successfully; a repeated startup seed retained 40 weeks, 200 classes, 200 topics, 200 lessons, 200 class-topic links, and 0 duplicate class codes.
- Topic and lesson read APIs are implemented. Foundation lesson blocks are stored as JSONB; other classes remain truthful `OUTLINE` content.
- Classroom now calls `useClassroomContent` by deterministic class code. API blocks render safely for introduction, analogy, exercise, misconception, and unknown types; local content remains explicitly labeled only when the API is unavailable.
- Isolated real-E2E infrastructure is available through `npm run test:e2e:real`. It uses a fresh Docker PostgreSQL 17 instance, real Spring Boot session authentication, the Vite same-origin API proxy, and an independent browser context. It records redacted Spring Boot diagnostics outside Git and removes the database container during cleanup.
- Real registration smoke coverage verifies valid registration, validation and duplicate rejection, deterministic `STUDENT` role assignment, authenticated `/me`, CSRF rejection without a token, CSRF-protected browser logout, and independent unauthenticated browser isolation.
- Latest verification (2026-11-05): 13 frontend tests, production build, one controlled classroom E2E, one real isolated authentication E2E, one Maven unit test, and six PostgreSQL Testcontainers integration tests all passed.
- Real migration verification now passes against disposable PostgreSQL: preview is non-mutating, explicit import persists bilingual notes and studied progress, repeated exact payloads are idempotent, conflicting keys and note conflicts preserve data, local storage remains, and account/browser boundaries are enforced.

## In progress

- Phase 3E-1 closed the topic-progress Testcontainers gap: creation, PostgreSQL persistence, valid transitions, skipped-mastery rejection, stale-version conflict, ownership isolation, missing-topic handling, and final state are covered.
- Phase 3E-2C adds versioned, account-scoped recoverable note drafts. The real isolated browser suite verifies session-expiry recovery, explicit same-user retry, Unicode preservation, reload persistence, idempotent first creation, and that a different account in the same browser cannot view or replay the draft.
- Phase 3 remains IN PROGRESS: migration conflicts are safely report-only; interactive keep-server/save-copy/replace resolution and its audit coverage are not implemented. See `PHASE_3_ACCEPTANCE_REPORT.md`.

## Verified frontend checkpoint

- `npm run build` completed successfully on 2026-11-04 before Phase 2 edits.

## Known constraints

- Maven 3.10.0 was installed through Homebrew. Docker Desktop is required for the Testcontainers profile.
- The existing private static Site cannot host a Java process and does not expose its ChatGPT gate as custom API authentication.
- Production deployment remains unverified: it requires HTTPS, `SESSION_COOKIE_SECURE=true`, production CORS configuration, and a same-site cookie strategy. The local ChatGPT-hosted frontend gate is not Spring Boot API authentication.

## Next implementation step

Maintain the test suite as new API contracts and lesson block types are added.
