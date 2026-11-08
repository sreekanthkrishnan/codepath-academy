ALTER TABLE local_data_imports ADD COLUMN import_key VARCHAR(80);
ALTER TABLE local_data_imports ADD COLUMN status VARCHAR(24) NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE local_data_imports ADD COLUMN completed_at TIMESTAMPTZ;
ALTER TABLE local_data_imports ADD CONSTRAINT local_data_imports_user_key_unique UNIQUE (user_id, import_key);
