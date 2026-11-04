# Local data migration

The legacy client stores `cpa-language`, `cpa-progress`, and `cpa-notes` in localStorage. The migration UI will export these values as `CodePathAcademyBackupV1`, ask the signed-in user to confirm import, and retain the original records even after a successful import.

No credentials, browser session data, or unrelated storage are exported. A server import must be authenticated, validate all class identifiers, deduplicate by import fingerprint and source key, and return a per-record summary. Browser progress is imported as `STUDIED`, never `MASTERED`.
