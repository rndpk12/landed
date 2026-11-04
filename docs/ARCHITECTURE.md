# Landed Architecture and Service Ownership

This is the authoritative map of Landed's deployable services. Keep these boundaries stable when changing environment variables or deployments.

## Service ownership

| Area | Source directory | Runtime | Browser base URL | Owns |
|---|---|---|---|---|
| Main authenticated app | `frontend/` + `backend/` | React on Vercel + Spring Boot on Render | `VITE_API_BASE_URL` → Spring `/api/v1` | Login, JWT sessions, applications, resumes, ATS/matching, notes, and main user data |
| Reminders | `frontend/` + `reminder-service/` | Rails API on Render + Sidekiq worker + Render Redis | `VITE_REMINDER_API_BASE_URL` → Rails `/api` | Reminder CRUD, scheduled processing, and in-app notifications |
| Lite/import/feedback compatibility | `landed-lite/`, `extension/`, `vercel-api/` | Vercel static app + Vercel Functions | Lite-specific variables | No-account Lite flows, URL import, extension handoff, and Lite feedback |
| Database | Neon PostgreSQL | Managed PostgreSQL | `DATABASE_URL`/`DB_URL` (runtime-specific) | Persistent application data |
| Job queue | Render Redis | Redis | `REDIS_URL` | Sidekiq queue and retry state |

## Request flow

```text
Browser
  ├─ Main app ───────────────> Spring Boot API (Render) ─────> Neon PostgreSQL
  │                                  └───────────────────────> Google OAuth/JWT
  ├─ Reminders page ─────────> Rails Reminder API (Render) ─> Neon PostgreSQL
  │                                  └───────────────────────> Redis ─> Sidekiq worker
  └─ Lite/extension ─────────> Vercel Functions (Vercel) ───> Lite-compatible storage/API
```

Spring Boot remains the source of truth for the authenticated application domain. Rails shares the existing user and job-application records according to its read-only contract, and owns reminder/notification records. The Vercel API is not a replacement for the main authenticated Spring API.

## Routing rules

- Main frontend: `VITE_API_BASE_URL=https://<spring-render-host>/api/v1`.
- Main frontend reminders: `VITE_REMINDER_API_BASE_URL=https://<rails-render-host>/api`.
- Do not point the main `VITE_API_BASE_URL` at Rails, Vercel, or a local service in production.
- Do not point Lite at Spring unless a deliberate migration is planned and tested.
- Keep the existing Spring/Render service during the Rails or Vercel migration; change one boundary at a time.

## Environment ownership

| Variable | Set on | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | Frontend Vercel project | Main Spring Boot API base URL |
| `VITE_REMINDER_API_BASE_URL` | Frontend Vercel project | Rails reminder API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Frontend Vercel project | Google OAuth browser client |
| `DATABASE_URL` or `DB_URL` | Backend/Rails runtime | Neon PostgreSQL connection; use the variable expected by that runtime |
| `JWT_SECRET` | Spring and Rails runtimes | Shared token verification secret; never commit it |
| `CORS_ALLOWED_ORIGINS` | API runtimes | Exact frontend origins, comma-separated |
| `REDIS_URL` | Rails web and Sidekiq worker | Render Redis connection |

Use placeholders in documentation and dashboards; never paste credentials into Git, screenshots, issues, or logs.

## Deployment source of truth

- Vercel deploys the frontend and Lite/Function projects.
- Render deploys Spring Boot, the Rails reminder web service, the Sidekiq worker, and Redis.
- Neon supplies PostgreSQL for the production environments.
- Before releasing, verify each frontend variable points to the matching service above and run an authenticated smoke test for both APIs.
