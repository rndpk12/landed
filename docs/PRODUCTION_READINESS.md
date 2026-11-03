# Production readiness (P0)

This document records the P0 hardening implemented in the repository and the operational work that still requires access to the hosting and database providers.

## Implemented and verified in code

- Every request receives a safe `X-Request-Id` correlation ID. The ID is returned in the response and included in API error bodies and server logs.
- Spring Security sends clickjacking, MIME-sniffing, cache, HSTS (on HTTPS), CSP, referrer-policy, and permissions-policy headers.
- Production startup validation now requires:
  - a Base64 JWT secret containing at least 32 decoded bytes and no placeholder value;
  - a PostgreSQL URL with `sslmode=require`, `verify-ca`, or `verify-full`;
  - HTTPS CORS origins with no wildcard or localhost;
  - S3 resume storage and a private bucket name;
  - rate limiting enabled;
  - Swagger UI and OpenAPI docs disabled.
- Focused tests cover request-ID propagation and secure/invalid production configuration.

## Verification run

From `backend/`:

```bash
mvn -B test
```

Current result: **17 tests passed, 0 failed, 0 errors, 0 skipped**.

## Local Redis smoke verification

With Docker Desktop running:

- PostgreSQL health check: accepting connections.
- Redis health check: `PONG`.
- Backend started on a temporary port with `RATE_LIMIT_BACKEND=redis` and `REDIS_URL=redis://localhost:6379`.
- `/actuator/health`: `UP`.
- Protected API request: `401`, with `X-Request-Id` echoed and Redis rate-limit headers present.
- Bounded auth test: 10 requests returned `401`; request 11 returned `429`.

This verifies the limiter against local Redis, not a production Redis provider or multi-instance deployment.

## Required provider-side actions before calling this production-ready

These cannot be safely completed from source code alone:

1. Rotate any credentials that have ever been pasted into chat, screenshots, local `.env` files, or Git history. Update only the hosting provider's encrypted environment variables afterward.
2. Enable managed PostgreSQL automated backups, point-in-time recovery, and perform a restore drill in a disposable database.
3. Confirm the S3 bucket is private, uses encryption, blocks public access, and has lifecycle/retention rules appropriate for resumes.
4. The limiter now supports an atomic, shared Redis backend. Set `RATE_LIMIT_BACKEND=redis` and `REDIS_URL` before horizontal scaling, then verify it across multiple instances. The default remains in-memory for compatibility with existing single-instance deployments.
5. Connect an error-tracking/structured-log sink and alert on authentication failures, 5xx responses, queue saturation, and storage errors.
6. Add full integration tests against disposable PostgreSQL/Redis/S3-compatible services for authentication, ownership boundaries, uploads, CRUD, and idempotency.

No provider credentials were changed, no deployment was performed, and no production backup/restore claim is made by this change.
