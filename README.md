# Landed

[![Continuous Integration](https://github.com/rndpk12/landed/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rndpk12/landed/actions/workflows/ci.yml)

**A calmer, more structured way to manage a job search.**

[Live app](https://getlanded.vercel.app) · [Architecture](docs/ARCHITECTURE.md) · [Chrome extension](extension/README.md)

## The problem

A job search quickly becomes scattered across browser tabs, spreadsheets, saved links, resume files, interview notes, and reminders. Important details get lost, applications are hard to follow up on, and it is difficult to know which resume was used for which role.

## The solution

Landed turns the search into one focused workspace. The approach is simple:

1. Capture a role from a URL, the dashboard, or the browser extension.
2. Keep the company, role, location, status, notes, and job description together.
3. Connect each application to the resume version used for it.
4. Track progress through a clear application pipeline.
5. Use matching and performance insights to improve the next application.

The result is a private job-search system that helps users move from discovery to offer without rebuilding their process for every application.

## Features available now

- Email/password authentication and Google sign-in.
- User-scoped application tracking with statuses, notes, activity history, and interview records.
- Resume Vault with uploads, versions, text extraction, comparison, and performance insights.
- Resume-to-job matching for tailoring an application to a role.
- Job URL import for supported job sources.
- Chrome extension for reading a job page, reviewing extracted details, and saving the role.
- Dashboard analytics for application stages and recent activity.
- Responsive React interface with protected routes and API error handling.

## How it is built

```text
Web app / Chrome extension
          │
          ▼
React + TypeScript + Vite
          │ HTTPS + JWT
          ▼
Java 21 + Spring Boot REST API
          │
          ├── PostgreSQL + Flyway
          └── Local or S3-compatible resume storage
```

| Area | Stack |
| --- | --- |
| Main web app | React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query |
| Backend API | Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA, REST |
| Data and security | PostgreSQL, Flyway, JWT, BCrypt, validation, CORS controls |
| Authentication | Email/password and Google OAuth |
| Resume storage | Local development storage or S3-compatible storage |
| Browser extension | Chrome Manifest V3, JavaScript, content scripts, background service worker, `chrome.storage.local` |
| Tooling and hosting | Maven, npm, Docker Compose, Vercel, Render, GitHub Actions |

## Landed Lite

Landed Lite is the browser-first version for people who want to start immediately without creating an account.

- No account or cloud sync.
- Applications are stored in the browser's local storage.
- Includes a focused dashboard, application pipeline, URL import, ATS matching, and feedback flow.
- Can use the Landed API only for job URL auto-fill; saved application data stays in the browser.
- Deploys independently as a separate Vite/Vercel project from the `landed-lite/` folder.

## Landed Chrome extension

The extension is a small Manifest V3 client that makes capture faster:

1. Read the active job page.
2. Extract structured JobPosting data and safe visible-page fallbacks.
3. Let the user review the fields.
4. Save to the full Landed account or open the Landed Lite import form.

The extension keeps its token in `chrome.storage.local`, sends it only to the configured Landed API, and never writes it into the job page.

## Run locally

### Prerequisites

- Java 21 and Maven 3.9+
- Node.js 20+ and npm
- Docker Desktop with Docker Compose

### Start the API and database

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:8080/actuator/health
```

### Start the main web app

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`.

### Start Landed Lite

```bash
cd landed-lite
npm ci
npm run dev
```

Open the local URL printed by Vite. See [`landed-lite/README.md`](landed-lite/README.md) for independent deployment setup.

### Quality checks

```bash
cd frontend && npm run lint && npm run build
cd ../backend && mvn test
```

## Planned development

The next improvements are planned rather than claimed as complete:

- Better reminders and follow-up workflows for applications.
- More job-source adapters and more reliable URL extraction.
- Stronger resume tailoring suggestions and a labeled evaluation dataset for measuring match quality.
- Deeper analytics for funnel conversion, response rates, and search momentum.
- Improved observability, API performance testing, and integration-test coverage.
- More resilient deployment options for the API and durable resume storage.
- Accessibility, mobile polish, and clearer onboarding for both Landed and Landed Lite.

## Project structure

| Folder | Purpose |
| --- | --- |
| [`frontend/`](frontend/README.md) | Main React application |
| [`backend/`](backend/README.md) | Spring Boot API |
| [`landed-lite/`](landed-lite/README.md) | Account-free browser-first app |
| [`extension/`](extension/README.md) | Chrome job-capture extension |
| [`docs/`](docs/README.md) | Architecture, deployment, and security notes |

## Security principles

- Passwords are hashed with BCrypt.
- API requests use stateless JWT bearer authentication.
- Application and resume access is scoped to the authenticated user.
- Secrets belong in environment variables or hosting-provider secret stores, never in Git.
- Database changes are versioned with Flyway migrations.

## Author

Built by [R N Dhanapraveen Krishna](https://github.com/rndpk12).
