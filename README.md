# Landed

A full-stack career management platform for tracking job applications, managing resumes, preparing for interviews, and analyzing the job search.

## Overview

Landed is a full-stack SaaS application that centralizes the job-search workflow into a single workspace.

It provides tools for managing job applications, resumes, job imports, interview notes, resume matching, and job-search analytics.

## Features

### Authentication

- Email/password registration and login
- BCrypt password hashing
- JWT-based authentication
- Google OAuth support
- User-scoped data access

### Application Tracking

- Create, view, update, and delete job applications
- Track application stages and statuses
- Application notes and activity history
- Stage transition tracking

### Resume Management

- Resume upload and management
- Resume versioning
- Resume text extraction
- Resume performance analysis
- Local and AWS S3 storage support

### Resume Matching

- Compare resumes against job descriptions
- Analyze resume-job relevance
- Support targeted resume optimization

### Job Import

- Import job postings from supported platforms
- Detect job source
- Extract structured job information

### Interview Management

- Create and manage interview notes
- Organize interview information by application

### Analytics

- Application activity tracking
- Job-search performance metrics
- Resume performance insights
- Visual analytics dashboard

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Recharts
- Tailwind CSS
- Lucide React

### Backend

- Java 21
- Spring Boot 3.4
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- JWT
- OpenAPI / Swagger
- AWS SDK for S3
- Apache PDFBox
- Apache POI
- Jsoup

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL
- Vercel

## Architecture

```text
                         Landed
                            |
              +-------------+-------------+
              |                           |
          Frontend                     Backend
       React + TypeScript          Spring Boot REST API
              |                           |
              +-------------+-------------+
                            |
                        PostgreSQL
                            |
                      Resume Storage
                       Local / S3
````

## Project Structure

```text
Landed/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layout/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── extension/                       # Chrome Manifest V3 job-capture extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── README.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── CONTRIBUTING.md
├── Dockerfile
├── compose.yaml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

* Java 21
* Maven 3.9+
* Node.js
* npm
* Docker Desktop
* Docker Compose

### Clone the Repository

```bash
git clone https://github.com/rndpk12/landed-backend.git
cd landed-backend
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Configure the required environment variables before starting the application.

Never commit `.env` or production credentials to the repository.

## Running with Docker

From the project root:

```bash
docker compose up -d --build
```

Check the services:

```bash
docker compose ps
```

The backend API will be available at:

```text
http://localhost:8080
```

Health check:

```bash
curl http://localhost:8080/actuator/health
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

Stop the services:

```bash
docker compose down
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Running Backend Tests

```bash
cd backend
mvn test
```

Build the backend:

```bash
mvn clean package
```

## API

The backend exposes REST APIs for:

* Authentication
* User profiles
* Applications
* Resumes
* Resume matching
* Resume performance
* Job imports
* Interview notes
* Activities

Authenticated requests use JWT bearer authentication:

```http
Authorization: Bearer <token>
```

## Database

PostgreSQL is used for persistent application data.

Database schema changes are managed using Flyway migrations:

```text
backend/src/main/resources/db/migration/
```

## Security

The application implements:

* Spring Security
* JWT authentication
* BCrypt password hashing
* User ownership checks
* API rate limiting
* Request validation
* CORS configuration
* Centralized API error handling
* Environment-based secret management

Production credentials and secrets should be managed through secure environment variables or the deployment platform's secret-management system.

## Deployment

The frontend is configured for Vercel deployment.

Backend and production configuration details are documented in:

```text
docs/DEPLOYMENT.md
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full domain map and code-placement rules.

## Browser Extension

The `extension/` workspace lets a user import the active job-posting page and save it to their Landed pipeline. See [extension/README.md](extension/README.md) for local installation, supported job sources, and security setup.

## Project Status

Landed is actively under development.

The current implementation includes the core full-stack job-search workflow, authentication, application tracking, resume management, resume matching, job importing, interview notes, analytics, PostgreSQL persistence, Docker-based local infrastructure, and frontend deployment.

## Author

**R N Dhanapraveen Krishna**

Software Engineering Student

GitHub: [https://github.com/rndpk12](https://github.com/rndpk12)
