CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO roles (code) VALUES ('STUDENT'), ('INSTRUCTOR'), ('CONTENT_EDITOR'), ('ADMIN');

CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, role_id)
);
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL DEFAULT 'en-IN',
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (locale IN ('en-IN', 'ml-IN', 'both'))
);

CREATE TABLE learning_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) NOT NULL UNIQUE,
  title_en VARCHAR(255) NOT NULL,
  title_ml VARCHAR(255),
  status VARCHAR(24) NOT NULL DEFAULT 'DRAFT',
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE curriculum_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES learning_programs(id) ON DELETE RESTRICT,
  code VARCHAR(64) NOT NULL UNIQUE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 40),
  title_en VARCHAR(255) NOT NULL,
  title_ml VARCHAR(255),
  sort_order INTEGER NOT NULL,
  UNIQUE (program_id, week_number)
);
CREATE TABLE curriculum_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES curriculum_weeks(id) ON DELETE RESTRICT,
  code VARCHAR(64) NOT NULL UNIQUE,
  class_number INTEGER NOT NULL CHECK (class_number BETWEEN 1 AND 5),
  title_en VARCHAR(255) NOT NULL,
  title_ml VARCHAR(255),
  editorial_status VARCHAR(32) NOT NULL DEFAULT 'OUTLINE',
  estimated_minutes INTEGER NOT NULL DEFAULT 35 CHECK (estimated_minutes > 0),
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (week_id, class_number)
);
CREATE INDEX idx_curriculum_classes_week ON curriculum_classes(week_id, class_number);

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES curriculum_classes(id) ON DELETE RESTRICT,
  state VARCHAR(24) NOT NULL DEFAULT 'NOT_STARTED',
  version BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, class_id),
  CHECK (state IN ('NOT_STARTED','IN_PROGRESS','STUDIED','PRACTICED','ASSESSED','MASTERED'))
);
CREATE TABLE personal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES curriculum_classes(id) ON DELETE SET NULL,
  source_key VARCHAR(64),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source_key)
);
CREATE INDEX idx_personal_notes_user_updated ON personal_notes(user_id, updated_at DESC);
CREATE TABLE local_data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  fingerprint CHAR(64) NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, fingerprint)
);
