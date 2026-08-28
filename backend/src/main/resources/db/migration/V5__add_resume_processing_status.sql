ALTER TABLE resume_versions
    ADD COLUMN processing_status VARCHAR(20) NOT NULL DEFAULT 'READY',
    ADD COLUMN processing_error VARCHAR(500),
    ADD CONSTRAINT ck_resume_processing_status
        CHECK (processing_status IN ('PENDING', 'READY', 'FAILED'));

CREATE INDEX idx_resume_versions_processing_status
    ON resume_versions (processing_status)
    WHERE processing_status = 'PENDING';
