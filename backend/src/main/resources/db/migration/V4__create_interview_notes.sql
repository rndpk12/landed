CREATE TABLE interview_notes (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    round_number INTEGER NOT NULL,
    interview_date DATE,
    questions_asked TEXT,
    notes TEXT,
    outcome VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_notes_application FOREIGN KEY (application_id) REFERENCES job_applications (id) ON DELETE CASCADE,
    CONSTRAINT ck_interview_notes_round_number CHECK (round_number > 0)
);

CREATE INDEX idx_interview_notes_application_round
    ON interview_notes (application_id, round_number ASC, created_at ASC);

ALTER TABLE activities DROP CONSTRAINT ck_activities_type;

ALTER TABLE activities
    ADD CONSTRAINT ck_activities_type CHECK (type IN (
        'APPLICATION_CREATED',
        'APPLICATION_STATUS_CHANGED',
        'RESUME_UPLOADED',
        'RESUME_VERSION_CREATED',
        'RESUME_MATCH_RUN',
        'INTERVIEW_NOTE_ADDED',
        'INTERVIEW_NOTE_CREATED',
        'INTERVIEW_NOTE_UPDATED',
        'INTERVIEW_NOTE_DELETED'
    ));
