ALTER TABLE learning_programs ADD COLUMN description_en TEXT;
ALTER TABLE learning_programs ADD COLUMN description_ml TEXT;
ALTER TABLE curriculum_weeks ADD COLUMN description_en TEXT;
ALTER TABLE curriculum_weeks ADD COLUMN description_ml TEXT;
ALTER TABLE curriculum_classes ADD COLUMN description_en TEXT;
ALTER TABLE curriculum_classes ADD COLUMN description_ml TEXT;
ALTER TABLE curriculum_classes ADD COLUMN difficulty VARCHAR(24) NOT NULL DEFAULT 'BEGINNER';
ALTER TABLE curriculum_classes ADD COLUMN learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE curriculum_classes ADD COLUMN has_exercise BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE curriculum_classes ADD COLUMN has_quiz BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(96) NOT NULL UNIQUE,
  parent_topic_id UUID REFERENCES topics(id) ON DELETE RESTRICT,
  title_en VARCHAR(255) NOT NULL,
  title_ml VARCHAR(255),
  description_en TEXT,
  description_ml TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE class_topics (
  class_id UUID NOT NULL REFERENCES curriculum_classes(id) ON DELETE RESTRICT,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  sort_order INTEGER NOT NULL,
  PRIMARY KEY (class_id, topic_id)
);
CREATE TABLE topic_prerequisites (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  prerequisite_topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  PRIMARY KEY (topic_id, prerequisite_topic_id),
  CHECK (topic_id <> prerequisite_topic_id)
);
CREATE TABLE lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL UNIQUE REFERENCES curriculum_classes(id) ON DELETE RESTRICT,
  editorial_status VARCHAR(32) NOT NULL DEFAULT 'OUTLINE',
  english_body TEXT,
  malayalam_body TEXT,
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (editorial_status IN ('OUTLINE','DRAFT','TRANSLATION_NEEDED','IN_REVIEW','PUBLISHED','ARCHIVED'))
);
CREATE TABLE learning_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES curriculum_classes(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en-IN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, url)
);
CREATE INDEX idx_class_topics_class ON class_topics(class_id, sort_order);
