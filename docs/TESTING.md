# Testing

`AuthServiceTest` verifies duplicate registration does not save a user. Planned integration tests use Testcontainers PostgreSQL for migrations, authentication, data isolation, notes, progress and import idempotency. Planned frontend tests cover API states, autosave, migration export/import and session expiry.

The Vite frontend build has passed. Backend Maven tests are not yet verified locally because Maven was unavailable in the supplied environment; this is tracked in implementation progress and must be resolved before treating Phase 1 as accepted.
