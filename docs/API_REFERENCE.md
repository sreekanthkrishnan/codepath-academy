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
| `/progress`, `/notes`, `/quizzes`, `/dsa`, `/projects` | varies | session | planned |

Registration requires `email`, a 12–128 character password, and `displayName`. Newly registered users receive only the `STUDENT` role. The application never seeds an administrator account.

Curriculum routes accept `locale=en-IN` or `locale=ml-IN`. Each localized title includes English, Malayalam, a display value, and explicit `malayalamFallback` metadata.
