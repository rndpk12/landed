CREATE TABLE lite_feedback (
    id UUID PRIMARY KEY,
    category VARCHAR(30) NOT NULL,
    message VARCHAR(4000) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_lite_feedback_category CHECK (category IN ('feedback', 'feature', 'review'))
);

CREATE INDEX idx_lite_feedback_created_at ON lite_feedback (created_at DESC);
