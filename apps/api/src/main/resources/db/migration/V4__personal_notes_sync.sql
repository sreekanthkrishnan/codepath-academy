ALTER TABLE personal_notes ADD COLUMN topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;
ALTER TABLE personal_notes ADD COLUMN body_en TEXT;
ALTER TABLE personal_notes ADD COLUMN body_ml TEXT;
ALTER TABLE personal_notes ADD COLUMN deleted_at TIMESTAMPTZ;
UPDATE personal_notes SET body_en = body WHERE body_en IS NULL;
ALTER TABLE personal_notes ADD CONSTRAINT personal_notes_body_limit CHECK (char_length(body) <= 50000);
CREATE INDEX idx_personal_notes_user_active_updated ON personal_notes(user_id, updated_at DESC) WHERE deleted_at IS NULL;
