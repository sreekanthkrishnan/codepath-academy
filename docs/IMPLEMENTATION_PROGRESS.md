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

## In progress

- Automated verification is complete: frontend Vitest/MSW/RTL coverage, a controlled Playwright classroom journey, and a PostgreSQL Testcontainers suite are available through documented commands.

## Verified frontend checkpoint

- `npm run build` completed successfully on 2026-11-04 before Phase 2 edits.

## Known constraints

- Maven 3.10.0 was installed through Homebrew. Docker Desktop is required for the Testcontainers profile.
- The existing private static Site cannot host a Java process and does not expose its ChatGPT gate as custom API authentication.
- Testcontainers coverage, rich content authoring for the remaining curriculum, classroom API integration, and all user-data persistence modules remain unimplemented.

## Next implementation step

Maintain the test suite as new API contracts and lesson block types are added.
