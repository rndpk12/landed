# Landed reminder service implementation report

## 1. Architecture and integration

The reminder capability is implemented as a standalone Rails API under `reminder-service/`. The existing Spring Boot backend was not changed.

- Rails API mode, PostgreSQL, Sidekiq, Redis, and RSpec are declared in `reminder-service/Gemfile`.
- The service reads the existing `users` and `job_applications` tables without writing to them.
- New `reminders` and `notifications` tables are owned by the Rails service.
- JWT bearer authentication uses the existing Base64 `JWT_SECRET` and the token `sub` claim. User IDs from request bodies are ignored.
- Sidekiq schedules `ReminderDispatchJob`; a row lock plus a unique `notifications.reminder_id` index prevents duplicate notifications.
- React adds a protected Reminders page at `/reminders`, linked from the dashboard sidebar.

## 2. Files created or modified

Created:

- `reminder-service/` Rails API, migration, models, controllers, serializer, Sidekiq job, Docker Compose stack, and RSpec suite.
- `frontend/src/types/reminder.ts`
- `frontend/src/services/reminderApi.ts`
- `frontend/src/pages/RemindersPage.tsx`
- `docs/reminder-service.md`
- `docs/reminder-service-report.md`

Modified:

- `frontend/src/routes/AppRouter.tsx`
- `frontend/src/components/Sidebar.tsx`
- `.env.example` (adds `VITE_REMINDER_API_BASE_URL`)

No files under `backend/` were modified.

## 3. API endpoints

All `/api/*` endpoints require `Authorization: Bearer <landed-jwt>`.

| Method | Path | Behavior |
| --- | --- | --- |
| POST | `/api/reminders` | Create an owned reminder and enqueue its scheduled job |
| GET | `/api/reminders` | List the current user's reminders |
| GET | `/api/reminders/:id` | Read one owned reminder |
| PATCH | `/api/reminders/:id` | Update message or schedule for an owned reminder |
| DELETE | `/api/reminders/:id` | Delete an owned reminder |
| GET | `/api/notifications` | List persisted in-app notifications for the current user |
| GET | `/health` | Service health response; no authentication required |

Errors use `{ "error": { "code": "...", "message": "...", "details": {} } }`.

## 4. Background processing

`ReminderDispatchJob` runs on the `reminders` queue. It locks the reminder row, skips already processed/cancelled records, increments the attempt count, inserts one notification, and marks the reminder `processed`. Exceptions record `last_error` and are retried up to five times by Active Job/Sidekiq. The unique notification index makes retries idempotent.

## 5. Verification results

Verified in this checkout on 2026-11-02:

- Rails test database preparation: **passed** against disposable PostgreSQL 17.
- RSpec: **10 passed, 0 failed, 0 pending**.
- RSpec covered API authentication/authorization, CRUD, validation, scheduling enqueue, job processing, cancellation, and duplicate-notification prevention.
- Sidekiq/Redis/PostgreSQL smoke test: **passed**. A real Redis-backed worker processed a reminder and persisted exactly one notification while marking the reminder `processed`.
- Spring Boot: **12 passed, 0 failed** (`mvn test -q`; counts read from Surefire XML reports).
- Frontend lint: **passed** with `npm run lint`.
- Frontend production build: **passed** with `npm run build` (Vite emitted bundle-size and dependency annotation warnings only).

Not verified:

- A browser-driven end-to-end flow from the React page through the live Rails HTTP server into Sidekiq was not run.
- Retry behavior was configured (`retry_on ... attempts: 5`) but no forced transient-failure test was executed against a live worker.
- No production-scale or external-service reliability claim is made.

## 6. Setup and execution

```sh
cd /Users/rndpk/Documents/Projects/Landed
JWT_SECRET='<existing Base64 JWT secret>' docker compose -f reminder-service/docker-compose.yml up -d postgres redis
JWT_SECRET='<existing Base64 JWT secret>' docker compose -f reminder-service/docker-compose.yml run --rm \
  -e RAILS_ENV=test \
  -e DATABASE_URL=postgresql://landed:<password>@postgres:5432/landed_reminders_test \
  web bundle exec rails db:prepare
JWT_SECRET='<existing Base64 JWT secret>' docker compose -f reminder-service/docker-compose.yml run --rm \
  -e RAILS_ENV=test \
  -e DATABASE_URL=postgresql://landed:<password>@postgres:5432/landed_reminders_test \
  web bundle exec rspec --format documentation
mvn test -q -f backend/pom.xml
cd frontend && npm run lint && npm run build
```

Set `VITE_REMINDER_API_BASE_URL=http://localhost:3001/api` for the React app when running locally.

## 7. Remaining limitations

- The service requires the Rails process to share the Landed PostgreSQL database so it can resolve users and applications.
- Notifications are persisted in-app; no email or push delivery is implemented.
- The live smoke test used disposable local containers and a temporary test database; production deployment remains unverified.
- The current Rails RSpec suite does not inject a failing dependency to exercise Sidekiq's retry path end-to-end.

## 8. Resume-ready LaTeX bullets

```latex
\item Delivered a Ruby on Rails reminder API with PostgreSQL ownership checks, JWT authentication, and structured JSON errors; verified with 10 RSpec examples passing.
\item Implemented Redis-backed Sidekiq reminder processing with row locking and unique notification persistence; verified one real worker execution and duplicate prevention.
\item Preserved the Spring Boot backend while passing 12 existing Maven tests and a production React build with lint checks passing.
```
