# Phase 3 acceptance audit

Audit date: 2026-11-05. Scope: Phase 3A–3D only; no production deployment was used.

## 3A — Authentication

| Requirement | Evidence | Result | Coverage gap / correction |
| --- | --- | --- | --- |
| Register, login, `STUDENT` role, `/me` | `AuthController`, `AuthService`, real smoke E2E | Pass | Registration and `/me` are real-stack verified. |
| Logout 204, session isolation, CSRF | `SecurityConfiguration`, real smoke E2E | Pass | Missing-token logout is 403; browser logout is 204. |
| Session restoration/expiry | `useAuth`, account-scoped draft store, real expiry E2E | Pass | Session expiry, refresh, explicit same-user retry and different-account isolation are real-stack verified. |
| Cookie and identity boundaries | `application.yml`, `AUTHENTICATION.md` | Pass for local E2E | HttpOnly session cookie, exact CORS configuration, and production `Secure` cookie configuration are present. Production still requires HTTPS, `SESSION_COOKIE_SECURE=true`, and an actual same-site/API deployment. ChatGPT Site access is not API authentication. |

## 3B — Notes

| Requirement | Evidence | Result | Coverage gap / correction |
| --- | --- | --- | --- |
| CRUD, class/topic links, Unicode, soft delete | `NotesService`, `NotesPostgresIntegrationTest` | Pass | Integration test covers ownership, versioning, Unicode and soft delete. |
| Optimistic concurrency and ownership | `NotesService.owned`, integration test | Pass | Stale updates conflict; another user cannot retrieve the note. |
| Autosave acknowledgement and failure state | `useNoteAutosave`, `pendingNoteDrafts`, real expiry E2E | Pass for session recovery | Draft is persisted before a mutation and removed only after acknowledgement; a real generic network-interruption test remains absent. |
| Search/filtering and multi-tab behavior | `NotesService.list` | Implemented | Filtering is code-inspected, not independently acceptance-tested. |

## 3C — Progress

| Requirement | Evidence | Result | Coverage gap / correction |
| --- | --- | --- | --- |
| Class persistence, ownership, transitions, optimistic concurrency | `ProgressService`, `NotesPostgresIntegrationTest` | Pass | Skipped mastery is rejected and stale writes conflict. |
| Topic persistence | `ProgressController`, `ProgressService`, `NotesPostgresIntegrationTest` | Pass | PostgreSQL coverage verifies creation, persisted read, valid update, ownership, stale-version conflict, missing-topic handling, and final state. |
| No auto-mastery; imported trust level | `ProgressService`, `LearningDataImportService`, real migration E2E | Pass | Import maps legacy completion only to `STUDIED`. |
| Reload/logout accuracy and UI status | hooks plus real migration E2E | Pass for imported class progress | Dedicated ordinary progress UI reload coverage remains absent. |

## 3D — Migration

| Requirement | Evidence | Result | Coverage gap / correction |
| --- | --- | --- | --- |
| Export, preview, explicit import, local retention | real migration E2E | Pass | Preview is non-mutating and local keys remain unchanged. |
| Mapping, Malayalam, server persistence | `LearningDataImportService`, real migration E2E | Pass | `11 → CPA-W01-C01`; Malayalam body and `STUDIED` progress verified through APIs. |
| Idempotency, changed-key conflict, invalid schema | real migration E2E and Testcontainers | Pass | Exact payload repeats safely; changed original key is 409; schema 2 is 400. |
| Conflict safety | real migration E2E | Pass with limitation | Existing server notes are reported and preserved. The UI reports conflicts only; it has no user-directed merge/replace action. |
| Cross-browser/account isolation and cleanup | real migration E2E, runner | Pass | Separate browser retrieves account data; another account gets no data and 404 for the import audit. Disposable container is removed. |

## Security and integrity findings

- Passwords are BCrypt hashes; credentials are not placed in localStorage.
- Backend ownership checks are server-side for notes, progress and import-result reads.
- CSRF is retained for authenticated mutation; registration/login are intentionally pre-session exceptions.
- The migration audit stores import summaries and enforces user-scoped fingerprints/keys. It does not silently overwrite conflicted notes.
- Local E2E is not production readiness: deploy HTTPS, secure cookies, an exact production CORS allowlist, and a same-site reverse proxy or equivalent cookie strategy before release.

## Commands executed

| Command | Result |
| --- | --- |
| `npm test` | 13 passed, 0 failed |
| `npm run build` | passed |
| `npm run test:e2e` | 1 passed |
| `npm run test:e2e:real` | 2 passed |
| `mvn -B -ntp test` | 1 passed |
| `mvn -B -ntp -Pintegration test` | 6 passed |

The real runner used fresh PostgreSQL 17 containers and final inspection found no `codepath-e2e-*` container.

## Decision

**Phase 3 remains IN PROGRESS for acceptance-audit purposes.** No critical authorization or data-loss defect was found, and the core real journeys pass. Phase 3E-2C closes the explicit expired-session and cross-account pending-draft gaps. Migration conflict resolution remains safely report-only rather than interactive keep-server/save-copy/replace workflows with audit records; this is the acceptance blocker. Phase 4 must wait.
