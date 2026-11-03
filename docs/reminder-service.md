# Reminder service integration

Landed now has a separate `reminder-service/` Rails API. It does not replace or modify the Spring Boot backend.

## Architecture

- Rails API owns `reminders` and `notifications` tables.
- Rails reads `users` and `job_applications` from the existing Landed PostgreSQL database.
- The `Authorization: Bearer <JWT>` contract is shared with Landed: the JWT `sub` claim identifies the user and is verified with the Base64 `JWT_SECRET`.
- Sidekiq uses Redis to run `ReminderDispatchJob` at the scheduled time.
- A unique `notifications.reminder_id` index and a row lock make processing idempotent across retries or duplicate jobs.
- React exposes a protected `/reminders` page and uses `VITE_REMINDER_API_BASE_URL` for the Rails API.

## Run locally

```sh
cd reminder-service
cp .env.example .env
# Set JWT_SECRET to the same secret used by Landed, without committing it.
docker compose up --build
```

The service listens on `http://localhost:3001`. The service compose file uses Postgres host port `5434` and Redis host port `6380` to avoid changing the existing Landed compose stack.

For the frontend, set `VITE_REMINDER_API_BASE_URL=http://localhost:3001/api` in the frontend environment and restart Vite.

## Acceptance criteria

- Authenticated users can create, list, update, and delete reminders only for their own applications.
- Invalid payloads return structured JSON errors.
- Due reminders create one in-app notification and become `processed`.
- Sidekiq retries transient failures and records attempts/errors.
- React shows upcoming reminders, status, loading, success, and error states.
