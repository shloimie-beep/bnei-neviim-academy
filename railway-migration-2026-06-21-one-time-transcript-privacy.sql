-- One Time transcript privacy storage fields.
-- Forward-only, additive, safe to re-run.

ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS transcript_review_state TEXT DEFAULT 'needs_review';
ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS transcript_privacy_class TEXT DEFAULT 'needs_review';
ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS transcript_segments JSONB DEFAULT '[]';
ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS transcript_versions JSONB DEFAULT '{}';
ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS transcript_glossary JSONB DEFAULT '[]';
ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS transcript_release_audit JSONB DEFAULT '{}';
