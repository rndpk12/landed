# Landed Reminder Service

Standalone Rails API for scheduled application reminders. It shares the existing Landed PostgreSQL database for read-only access to `users` and `job_applications`, but owns the `reminders` and `notifications` tables. The Spring Boot service is not modified.

## Local setup with Docker

1. Copy `.env.example` to `.env` and set `JWT_SECRET` to the existing Base64 JWT secret without committing it.
2. Start the service stack:

   ```sh
   docker compose up --build
   ```

   Rails API: `http://localhost:3001`  
   Health check: `GET /health`  
   Sidekiq consumes the `reminders` queue from Redis.

The default Docker Postgres port is `5434` so it does not collide with the existing Landed compose file. To use the existing Landed database instead of the disposable Postgres container, set `DATABASE_URL` in `.env` to its connection string before starting the stack.

## API contract

All `/api/*` requests require `Authorization: Bearer <landed-jwt>`. The JWT subject is resolved against the existing `users` table; client-supplied user IDs are ignored.

```text
POST   /api/reminders
GET    /api/reminders
GET    /api/reminders/:id
PATCH  /api/reminders/:id
DELETE /api/reminders/:id
GET    /api/notifications
```

Create/update payloads use `{ "reminder": { "job_application_id": "...", "message": "...", "scheduled_at": "2026-11-05T10:00:00Z" } }`.

When a reminder is due, Sidekiq locks the row, creates exactly one persisted in-app notification using the unique `notifications.reminder_id` index, and marks the reminder `processed`. Failed attempts are recorded and retried by Sidekiq.

## Tests

```sh
bundle exec rails db:test:prepare
bundle exec rspec
```

RSpec uses isolated legacy `users` and `job_applications` fixtures and does not require the Spring Boot process to be running.
