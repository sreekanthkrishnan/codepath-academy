# Database schema

Flyway migration `V1__foundation.sql` creates the initial normalized foundation.

- Identity: `app_users`, `roles`, `user_roles`, `user_preferences`.
- Curriculum: `learning_programs`, `curriculum_weeks`, `curriculum_classes`.
- Learning: `lesson_progress` with an optimistic-lock version and explicit state constraint.
- Notes: `personal_notes` with source-key idempotency and optimistic-lock version.
- Migration: `local_data_imports`, unique per user and SHA-256 fingerprint.

Foreign keys intentionally restrict deletion of curriculum records referenced by learner records. User deletion cascades only to personal user data. `V2__curriculum_content.sql` adds topics, prerequisite links, lesson-content records, references, and non-destructive class completeness metadata. Topic and lesson-content routes are not implemented yet.
