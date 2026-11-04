# Implementation progress

## Completed

- Phase 0 repository audit (`REPOSITORY_AUDIT.md`).
- Phase 1 implementation slice: Spring Boot module, Flyway foundation, independent session authentication endpoints, CORS/CSRF configuration, Actuator, OpenAPI, Docker Compose and one unit test.
- Backend compile and unit-test checkpoint: `mvn -B -ntp test` passed (1 test, 0 failures) using Java 25.
- Frontend local-data export: a JSON backup containing only language, class progress and notes is now available from Notes.
- Curriculum API slice: repeat-safe 40-week / 200-class seed service, deterministic class codes, locale-aware program/week/class APIs, and a non-destructive curriculum-content migration.
- The Roadmap now requests API curriculum and visibly falls back to the checked-in curriculum only when the backend is unavailable.

## In progress

- Topic and lesson-content endpoints, Testcontainers validation, then classroom API integration.

## Verified frontend checkpoint

- `npm run build` completed successfully on 2026-11-04 before Phase 2 edits.

## Known constraints

- Maven 3.10.0 was installed through Homebrew. Docker Compose has not been run against a local PostgreSQL daemon in this environment.
- The existing private static Site cannot host a Java process and does not expose its ChatGPT gate as custom API authentication.
- Testcontainers coverage, topics/lesson endpoints, and all user-data persistence modules remain unimplemented.

## Next implementation step

Start Docker Desktop, run PostgreSQL, then validate the seed against a live database and add migration/idempotency integration tests.
