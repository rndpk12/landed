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

Verified in this checkout:

- Ruby syntax: **34/34 Ruby files passed** `ruby -c`.
- Frontend TypeScript: **passed** with `npx tsc -p frontend/tsconfig.app.json --noEmit`.
- Frontend lint: **passed** with `npm run lint`.
- Frontend production build: **passed** with `npm run build` (Vite emitted only existing bundle-size and dependency annotation warnings).
- Git whitespace check: **passed** with `git diff --check`.

Not executed:

- Rails migrations, RSpec, and a real Sidekiq/Redis workflow could not run because Docker Desktop's daemon was unavailable and local Ruby is 2.6 without Rails/Bundler dependencies. No RSpec pass/fail count is claimed.
- Existing Spring Boot tests were not changed or run in this task because the request explicitly said to ignore the Spring Boot backend.
- End-to-end browser verification against a live Rails service remains pending until Docker or a Ruby 3.3/Rails environment is available.

## 6. Setup and execution

```sh
cd reminder-service
cp .env.example .env
# Set JWT_SECRET to the existing Landed Base64 JWT secret.
docker compose up --build
bundle exec rspec
```

Set `VITE_REMINDER_API_BASE_URL=http://localhost:3001/api` for the React app when running locally.

## 7. Remaining limitations

- The service requires the Rails process to share the Landed PostgreSQL database so it can resolve users and applications.
- Notifications are persisted in-app; no email or push delivery is implemented.
- A live Redis/PostgreSQL smoke test is still required before production deployment.

## 8. Resume-ready LaTeX bullets

```latex
\item Built a standalone Ruby on Rails reminder API with PostgreSQL ownership checks, structured JSON errors, and JWT bearer authentication.
\item Implemented Sidekiq/Redis scheduling with row locking, retry tracking, and unique notification persistence for idempotent background processing.
\item Integrated a React + TypeScript reminder dashboard with CRUD workflows, validation, loading/error states, and application-linked schedules.
```
