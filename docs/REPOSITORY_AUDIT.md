# CodePath Academy repository audit

_Audited: 2026-11-04_

## Current architecture

The repository contains one Vite 8 + React + TypeScript single-page application at the repository root. It has one application entry point, `src/main.tsx`, and one stylesheet, `src/styles.css`. There is no router, backend, database, API client, test suite, server-side authentication, or deployment runtime other than static-site hosting.

The current deployment is a private static `chatgpt.site` Site. Its ChatGPT sign-in gate protects the hosted static site; it is not an identity mechanism exposed to a custom Java API. The API must therefore use independent application authentication.

## Existing functionality

- 40-week / 200-class curriculum held in module-level TypeScript arrays.
- English, Malayalam, and side-by-side classroom labels. Only the initial Foundation lessons have Malayalam text; other records visibly report `Malayalam translation in progress`.
- Client-side dashboard, roadmap, classroom, quiz feedback, notes, DSA and capstone screens.
- Browser-only persistence for selected language, completed classes, and notes.

## Current data model and browser storage

| Key | Shape | Purpose | Migration target |
| --- | --- | --- | --- |
| `cpa-language` | `"en" \| "ml" \| "both"` | Reader locale | `user_preferences.locale` |
| `cpa-progress` | `number[]`, encoded as `week * 10 + slot` | Completed-class markers | `lesson_progress` |
| `cpa-notes` | `Record<"week-slot", string>` | Personal lesson note body | `personal_notes` |

There is no sessionStorage, IndexedDB, remote fetch, token storage, or persisted quiz/DSA/project data in the current code. The keys are unversioned and are read/written by the `read` and `write` helpers in `src/main.tsx`.

## Dependencies and risk areas

Runtime dependencies are React, React DOM, Vite and the Vite React plugin. The application has no state-management library; component state is maintained in `App` and passed as props. The curriculum, local persistence, and presentation components are co-located in `src/main.tsx`, which is the principal regression risk.

The worktree has an existing generated change at `node_modules/.vite/deps/_metadata.json`; it is unrelated and will be left untouched.

## Backend architecture decision

Create one Maven-based Spring Boot modular monolith in `apps/api`, running separately from the static frontend. PostgreSQL is the primary persistent store. The API exposes `/api/v1` endpoints, receives an explicit allowed-origin configuration, and authenticates independent application users with server-managed sessions. Production needs a same-site reverse proxy or a frontend/API deployment under the same site to use robust HttpOnly session cookies. The current `chatgpt.site` static host cannot be assumed to provide either a Java runtime or a BFF.

## Migration strategy

1. Preserve all three existing keys; never clear them automatically.
2. Add a versioned client export (`codepath-academy-export:v1`) that includes only the listed learning data, never credentials.
3. After independent login, offer an explicit import preview and submit only on confirmation.
4. The API maps `week-slot` keys to deterministic `FOUNDATION-01`-style class codes, records an idempotency fingerprint, and returns imported/skipped/conflict counts.
5. Keep local values as an offline fallback until the equivalent remote mutation has succeeded.

## Implementation order

1. Backend foundation: Maven project, Spring Boot, Flyway, PostgreSQL configuration, health and OpenAPI.
2. Identity and role authorization.
3. Curriculum import and read APIs using all 200 existing records.
4. Progress and notes with local-data export/import.
5. Quiz, DSA, projects, study/revision, analytics, then editorial administration.
