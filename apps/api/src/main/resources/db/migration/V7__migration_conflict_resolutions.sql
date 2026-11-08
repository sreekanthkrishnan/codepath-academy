CREATE TABLE note_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), note_id UUID NOT NULL REFERENCES personal_notes(id) ON DELETE CASCADE,
  body TEXT NOT NULL, body_en TEXT, body_ml TEXT, version BIGINT NOT NULL, recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE learning_data_conflict_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), import_id UUID NOT NULL REFERENCES local_data_imports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, source_key VARCHAR(64) NOT NULL,
  operation_key VARCHAR(80) NOT NULL, resolution VARCHAR(24) NOT NULL, note_id UUID REFERENCES personal_notes(id),
  expected_version BIGINT, resolved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, operation_key), UNIQUE (import_id, source_key, resolution)
);
