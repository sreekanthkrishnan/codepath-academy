# Curriculum import

The source of truth for the existing 40-week / 200-class outline is `src/main.tsx`. `CurriculumSeedService` mirrors all 40 weeks and 200 classes into PostgreSQL at application start, upserting by deterministic class codes (`CPA-W01-C01` through `CPA-W40-C05`).

No current record is falsely marked `PUBLISHED`: title-only items seed as `OUTLINE`; known Malayalam titles are retained and missing translations remain null for explicit API fallback metadata.
