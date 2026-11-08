# Local data migration

The legacy client stores `cpa-language`, `cpa-progress`, and `cpa-notes` in localStorage. The migration UI will export these values as `CodePathAcademyBackupV1`, ask the signed-in user to confirm import, and retain the original records even after a successful import.

No credentials, browser session data, or unrelated storage are exported. A server import must be authenticated, validate all class identifiers, deduplicate by import fingerprint and source key, and return a per-record summary. Browser progress is imported as `STUDIED`, never `MASTERED`.

The exact V1 payload is `{schemaVersion:1, exportedAt, source:"codepath-academy-client", data:{language, progress, notes}}`. Progress IDs use `week * 10 + class` (`11` maps to `CPA-W01-C01`); note keys use `week-class` (`"1-1"` maps to the same class). Invalid or unknown identifiers are reported as `unmapped` and remain in the local backup. Preview is authenticated and CSRF-protected but makes no database changes. Import needs explicit confirmation plus an `Idempotency-Key`; repeating the identical payload is acknowledged as already imported, and reusing the original key with changed content returns a conflict. Existing account notes produce conflicts and are never overwritten.

Verified in the isolated real browser test: English and Malayalam note bodies persist, progress becomes `STUDIED`, local storage is retained, and the records survive logout/login and a separate browser context. A different account receives no notes, no progress, and `404` for the first account’s import result.
