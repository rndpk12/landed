# Landed

**A focused job-search command center for applications, resumes, interview notes, and job capture.**

[Live app](https://getlanded.vercel.app) · [Architecture](docs/ARCHITECTURE.md) · [Deployment](docs/DEPLOYMENT.md) · [Chrome extension](extension/README.md)

## Why Landed

Job searches become difficult to manage when job links, resume versions, interview notes, and follow-ups live in separate places. Landed brings that work into one structured workspace so users can track each application from discovery to offer.

## What it does

- Secure email/password and Google sign-in with user-scoped data.
- Application pipeline with stages, notes, and activity history.
- Resume vault with uploads, versioning, text extraction, comparison, and performance insights.
- Resume-to-job matching to help tailor applications.
- Job URL import and a Chrome extension for capturing listings from supported job sites.
- Interview notes, job-search analytics, and a responsive dashboard.

## Architecture

```text
Browser / Chrome extension
           │
           ▼
  React + TypeScript web app
        Vercel hosting
           │ HTTPS + JWT
           ▼
 Spring Boot REST API
       Render hosting
           │
           ├── PostgreSQL + Flyway migrations
           └── Resume storage (local or S3-compatible)
```

## Tech stack

| Area | Technologies |
| --- | --- |
| Web | React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query |
| API | Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA |
| Data | PostgreSQL, Flyway, JWT, BCrypt |
| Integrations | Google OAuth, Chrome Manifest V3, AWS S3-compatible storage |
| Tooling | Docker Compose, Maven, npm, Vercel, Render |

## Repository guide

| Folder | Responsibility | Start here |
| --- | --- | --- |
| [`frontend/`](frontend/README.md) | React web app deployed to Vercel | `frontend/src/main.tsx` |
| [`backend/`](backend/README.md) | Spring Boot API deployed to Render | `backend/src/main/java/com/landed/LandedApplication.java` |
| [`extension/`](extension/README.md) | Chrome extension for saving job listings | `extension/manifest.json` |
| [`docs/`](docs/README.md) | Architecture, operations, and deployment guidance | `docs/ARCHITECTURE.md` |

## Quick start

### Prerequisites

- Java 21 and Maven 3.9+
- Node.js 20+ and npm
- Docker Desktop with Docker Compose

### 1. Clone and configure

```bash
git clone https://github.com/rndpk12/landed.git
cd landed
cp .env.example .env
```

Update `.env` with local Google OAuth and JWT values. Keep it private—never commit it.

### 2. Start the API and database

```bash
docker compose up -d --build
docker compose ps
```

The API is available at `http://localhost:8080`.

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{"status":"UP"}
```

Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

### 3. Start the web app

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Environment configuration

Copy `.env.example` to `.env` for local development. These are the main variables:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Web app | Public API base URL ending in `/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Web app | Google OAuth web client ID |
| `DB_URL` | Local API | JDBC PostgreSQL connection URL |
| `DATABASE_URL` | Production API | PostgreSQL provider URL used in the production profile |
| `JWT_SECRET` | API | Base64-encoded secret for signing session tokens |
| `GOOGLE_CLIENT_ID` | API | Must match `VITE_GOOGLE_CLIENT_ID` |
| `GOOGLE_ADDITIONAL_CLIENT_IDS` | API | Trusted non-web OAuth clients, including the extension |
| `CORS_ALLOWED_ORIGINS` | API | Allowed HTTPS web origins |
| `CORS_ALLOWED_EXTENSION_IDS` | API | Allowed Chrome extension IDs |

`VITE_*` variables are built into the browser bundle. Only store public configuration in them—never passwords, database URLs, or private keys.

## Chrome extension

The extension captures job details from the active job page, lets the user review them, and saves the application into the same Landed account.

1. Start the API or use the production API.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose the repository's `extension/` folder.
4. Sign in, select **Read Job Page**, then choose **Save to Landed**.

See the [extension guide](extension/README.md) for OAuth setup, supported sites, and security details.

## Quality checks

Run these checks before opening a pull request or deploying:

```bash
cd frontend && npm run lint && npm run build
cd ../backend && mvn test
```

## Production deployment

Landed is deployed with Vercel for the web app and Render for the API. The production API requires a managed PostgreSQL `DATABASE_URL`, `JWT_SECRET`, and HTTPS CORS configuration.

Before releasing, confirm:

- Vercel `VITE_API_BASE_URL` points to the live Render API.
- Vercel and Render use the same web Google OAuth client ID.
- Render allows the Vercel origin and the Chrome extension ID.
- `GET /actuator/health` returns `UP`.
- Resume uploads use durable object storage before inviting users to store important files.

See [deployment guidance](docs/DEPLOYMENT.md) for the detailed release checklist.

## Documentation

- [Architecture](docs/ARCHITECTURE.md): domain boundaries and code-placement rules.
- [Deployment](docs/DEPLOYMENT.md): environment variables and release process.
- [Contributing](CONTRIBUTING.md): engineering workflow and conventions.

## Security notes

- Passwords are hashed with BCrypt.
- API access uses JWT bearer tokens.
- Data access is scoped to the authenticated user.
- Database migrations are versioned with Flyway.
- Secrets are stored in local environment files or hosting-provider environment settings, never Git.

## Status

Landed is actively being developed. The current release includes the core job-search workflow, Google authentication, application tracking, resume tooling, analytics, job import, and browser-based job capture.

## Author

Built by [R N Dhanapraveen Krishna](https://github.com/rndpk12).
