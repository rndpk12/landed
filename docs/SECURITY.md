# Security checklist

## What is protected in the codebase

- API routes require a signed, expiring JWT unless deliberately public.
- Applications, resumes, resume versions, interview notes, activity, matching, analytics, and profiles are queried by the signed-in user's ID.
- Passwords use BCrypt with strength 12; plaintext passwords are never stored.
- Input DTOs enforce type, length, URL, email, and enum validation. The React apps render text as text rather than injecting HTML.
- Resume uploads are size-limited, extension-limited, checked against their expected file signatures, stored with generated object keys, and downloaded as attachments.
- Job importing is limited to approved job-board domains and does not follow redirects, preventing it from being used to fetch internal services.
- CORS uses an explicit origin list. In production, wildcard, HTTP, and localhost origins are rejected at startup.
- Public API documentation is disabled by default. Error responses do not expose server exception details.
- Browser apps send a Content Security Policy, clickjacking protection, MIME-sniffing protection, referrer policy, and restrictive permissions policy.
- Authentication, upload/import, feedback, and general API requests have rate limits.
- CI runs frontend quality checks, backend tests, and a full-Git-history secret scan.

## Required production settings

Set these only in the hosting provider's encrypted environment-variable area, never in Git or a Vercel build-time `VITE_` variable:

- `DATABASE_URL` — PostgreSQL URL with TLS required.
- `JWT_SECRET` — a newly generated Base64 value of at least 32 random bytes.
- `GOOGLE_CLIENT_ID` — Google OAuth web-client ID.
- `CORS_ALLOWED_ORIGINS` — exact HTTPS frontend origins only, comma-separated.
- `CORS_ALLOWED_EXTENSION_IDS` — only the published Chrome extension IDs that need API access.
- `RESUME_STORAGE_TYPE=s3` and the matching private bucket settings for production resume storage.
- `SWAGGER_UI_ENABLED=false` and `OPENAPI_DOCS_ENABLED=false`.

## Before each production release

1. Rotate any credential ever pasted into chat, logs, screenshots, a commit, or an issue.
2. Run `npm audit --omit=dev --audit-level=high` in both frontend folders and `mvn test` in `backend/`.
3. Confirm Render uses a paid, always-on service if reliable sign-in matters; free services sleep after inactivity.
4. Review Render and Vercel environment variables, then deploy.

## Operational limits

The current rate limiter is in-memory, which is appropriate for one backend instance. If the API is scaled to multiple instances, replace it with a shared rate-limit store such as Redis so the limits apply consistently across all instances.
