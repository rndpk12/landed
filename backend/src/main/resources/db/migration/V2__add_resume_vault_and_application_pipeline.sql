CREATE TABLE resumes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_resumes_user_updated_at ON resumes (user_id, updated_at DESC);

CREATE TABLE resume_tags (
    resume_id UUID NOT NULL,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (resume_id, tag),
    CONSTRAINT fk_resume_tags_resume FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
);

CREATE TABLE resume_versions (
    id UUID PRIMARY KEY,
    resume_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    text_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_versions_resume FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE,
    CONSTRAINT uk_resume_version_number UNIQUE (resume_id, version_number),
    CONSTRAINT uk_resume_version_storage_key UNIQUE (storage_key),
    CONSTRAINT ck_resume_version_number CHECK (version_number > 0),
    CONSTRAINT ck_resume_file_size CHECK (file_size > 0)
);

CREATE INDEX idx_resume_versions_resume_version ON resume_versions (resume_id, version_number DESC);

ALTER TABLE job_applications
    ADD COLUMN location VARCHAR(150),
    ADD COLUMN job_description TEXT,
    ADD COLUMN employment_type VARCHAR(50),
    ADD COLUMN resume_version_id UUID,
    ADD CONSTRAINT fk_job_applications_resume_version
        FOREIGN KEY (resume_version_id) REFERENCES resume_versions (id) ON DELETE SET NULL;

CREATE INDEX idx_job_applications_resume_version ON job_applications (resume_version_id);
CREATE INDEX idx_job_applications_user_status ON job_applications (user_id, status);

CREATE TABLE application_stage_events (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    notes TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stage_events_application FOREIGN KEY (application_id) REFERENCES job_applications (id) ON DELETE CASCADE,
    CONSTRAINT ck_stage_event_from_status CHECK (from_status IS NULL OR from_status IN ('SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED', 'ACCEPTED')),
    CONSTRAINT ck_stage_event_to_status CHECK (to_status IN ('SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED', 'ACCEPTED'))
);

CREATE INDEX idx_stage_events_application_occurred ON application_stage_events (application_id, occurred_at DESC);

CREATE TABLE application_stage_notes (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stage_notes_application FOREIGN KEY (application_id) REFERENCES job_applications (id) ON DELETE CASCADE,
    CONSTRAINT ck_stage_note_status CHECK (status IN ('SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED', 'ACCEPTED'))
);

CREATE INDEX idx_stage_notes_application_created ON application_stage_notes (application_id, created_at DESC);

INSERT INTO application_stage_events (id, application_id, from_status, to_status, notes, occurred_at)
SELECT gen_random_uuid(), id, NULL, status, 'Initial status', created_at
FROM job_applications;
