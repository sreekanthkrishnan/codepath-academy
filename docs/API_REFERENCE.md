# API reference

The API uses `/api/v1` and JSON. Errors have `timestamp`, `status`, `message`, and `details` fields.

| Endpoint | Method | Auth | Status |
| --- | --- | --- | --- |
| `/auth/register` | POST | public | implemented |
| `/auth/login` | POST | public | implemented |
| `/auth/logout` | POST | session + CSRF | implemented via Spring Security |
| `/auth/me` | GET | session | implemented |
| `/auth/csrf` | GET | public | implemented |
| `/programs`, `/programs/{id}`, `/programs/{id}/curriculum` | GET | public | implemented |
| `/weeks/{id}`, `/classes/{id}` | GET | public | implemented |
| `/lessons/{id}`, `/classes/{id}/topics`, `/topics/{id}` | GET | public | planned |
| `/notes` | GET, POST | session; CSRF for POST | implemented |
| `/notes/{id}` | GET, PATCH, DELETE | session; CSRF for mutation | implemented |
| `/progress/overview`, `/progress/classes/{id}`, `/progress/topics/{id}` | GET, PUT | session; CSRF for PUT | implemented |
| `/learning-data/imports/preview`, `/learning-data/imports`, `/learning-data/imports/{id}` | POST, POST, GET | session; CSRF for POST | implemented |
| `/quizzes`, `/dsa`, `/projects` | varies | session | planned |

Registration requires `email`, a 12–128 character password, and `displayName`. Newly registered users receive only the `STUDENT` role. The application never seeds an administrator account.

Curriculum routes accept `locale=en-IN` or `locale=ml-IN`. Each localized title includes English, Malayalam, a display value, and explicit `malayalamFallback` metadata.

## Notes retry contract

`POST /notes` accepts the normal note fields plus optional `clientKey` (1–64 characters from `A-Za-z0-9._:-`). The client uses its stable pending-draft ID as this value. `personal_notes` already enforces a per-account unique `source_key`: a retry with the same key and identical title/body returns the original note, while reuse with different content is a `409` conflict. This prevents a dropped create response from producing duplicate notes. `PATCH /notes/{id}` still requires the expected `version` and returns `409` for a stale revision.

The API does not receive a pending-draft account ID from the browser. Authentication and note ownership are derived from the server session; client account IDs are only local-storage partition keys.
