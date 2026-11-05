CREATE TABLE topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  state VARCHAR(24) NOT NULL DEFAULT 'NOT_STARTED',
  version BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id),
  CHECK (state IN ('NOT_STARTED','IN_PROGRESS','STUDIED','PRACTICED','ASSESSED','MASTERED'))
);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id, updated_at DESC);
CREATE INDEX idx_topic_progress_user ON topic_progress(user_id, updated_at DESC);
