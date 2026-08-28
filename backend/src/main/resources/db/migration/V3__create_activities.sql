CREATE TABLE activities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(180) NOT NULL,
    description VARCHAR(500) NOT NULL,
    entity_id UUID,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_activities_type CHECK (type IN (
        'APPLICATION_CREATED',
        'APPLICATION_STATUS_CHANGED',
        'RESUME_UPLOADED',
        'RESUME_VERSION_CREATED',
        'RESUME_MATCH_RUN',
        'INTERVIEW_NOTE_ADDED'
    ))
);

CREATE INDEX idx_activities_user_occurred
    ON activities (user_id, occurred_at DESC);
