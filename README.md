
# Landed 

Website : https://getlanded.vercel.app

> A full-stack career management platform for organizing job applications, resumes, interview notes, and job-search analytics in one workspace.

Landed is a production-oriented SaaS application designed to help candidates manage the complete job-search lifecycle. It provides a centralized workspace for tracking applications, managing resumes, importing job postings, recording interview notes, and analyzing application activity.

## Features

- Authentication and Authorization
  - Email/password registration and login
  - BCrypt password hashing
  - JWT-based authentication
  - User-scoped data access

- Application Tracking
  - Create, view, update, and delete job applications
  - Track application status and progress
  - Application details and activity history

- Resume Management
  - Centralized resume storage
  - Resume upload and management
  - Resume performance insights

- Resume Matching
  - Compare resumes against job descriptions
  - Identify relevant skills and matching information
  - Support targeted resume optimization

- Job Import
  - Import job information from supported job sources
  - Extract relevant job details for application tracking

- Interview Management
  - Record and organize interview notes
  - Keep interview-related information alongside applications

- Analytics
  - Application activity insights
  - Job-search performance metrics
  - Visual analytics dashboard

- Security and Reliability
  - Spring Security
  - JWT bearer authentication
  - Tenant/user ownership checks
  - Jakarta Bean Validation
  - Consistent API error responses
  - Configurable CORS

## Architecture

Landed follows a separated full-stack architecture:

```text
Landed
├── frontend/        # React + TypeScript + Vite
├── backend/         # Spring Boot REST API
├── compose.yaml     # Docker Compose environment
├── Dockerfile       # Backend container image
└── README.md
````

### Frontend

Built with:

* React 19
* TypeScript
* Vite
* React Router
* TanStack Query
* React Hook Form
* Zod
* Axios
* Recharts
* Tailwind CSS

### Backend

Built with:

* Java 21
* Spring Boot 3
* Spring Security
* Spring Data JPA
* PostgreSQL
* Flyway
* JWT
* OpenAPI / Swagger
* AWS S3 SDK
* Apache PDFBox
* Apache POI
* Jsoup

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL
* Vercel for frontend deployment

## Authentication

The backend uses stateless JWT-based authentication.

```text
User
 │
 ▼
Frontend
 │
 │ Authentication request
 ▼
Spring Boot API
 │
 ├── Spring Security
 ├── BCrypt password hashing
 └── JWT token generation
        │
        ▼
     Authenticated API requests
```

User-owned resources are protected using authentication and ownership checks.

## Getting Started

### Prerequisites

Make sure the following are installed:

* Java 21
* Node.js
* npm
* Docker Desktop
* Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/rndpk12/landed-backend.git
cd landed-backend
```

### 2. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env
```

Update the generated values in `.env`, particularly the JWT secret and database configuration.

> Never commit `.env` or production secrets to the repository.

### 3. Start the backend infrastructure

From the project root:

```bash
docker compose up -d --build
```

Check the running services:

```bash
docker compose ps
```

The API should be available at:

```text
http://localhost:8080
```

Health check:

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{
  "status": "UP"
}
```

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

### 5. Build the frontend

```bash
cd frontend
npm run build
```

### 6. Run backend tests

From the backend directory:

```bash
cd backend
mvn test
```

## Docker

The backend uses a multi-stage Docker build.

```text
Maven + JDK 21
      │
      ▼
Compile and package
      │
      ▼
Spring Boot JAR
      │
      ▼
JRE 21 Alpine image
      │
      ▼
Non-root application user
```

Start the complete local environment with:

```bash
docker compose up -d --build
```

Stop the environment with:

```bash
docker compose down
```

## API

The backend exposes a REST API for:

* Authentication
* User profiles
* Applications
* Resumes
* Resume matching
* Resume performance
* Job imports
* Interview notes
* Activities

OpenAPI/Swagger documentation is available when the backend is running.

```text
http://localhost:8080/swagger-ui/index.html
```

## Validation

The project has been validated across the main application layers:

* Frontend production build
* Backend unit/service tests
* Docker image build
* PostgreSQL container
* Spring Boot health endpoint
* Authentication flow
* Dashboard
* Application management
* Resume management
* Resume matching
* Analytics
* Interview notes

## Project Structure

```text
.
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
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── compose.yaml
├── Dockerfile
├── .env.example
└── README.md
```

## Security

The repository is configured to exclude local and generated files such as:

```text
.env
node_modules/
dist/
target/
.vite/
*.log
*.tsbuildinfo
```

Production credentials and secrets should always be provided through environment variables or the deployment platform's secret-management system.

## Project Status

Landed is currently under active development.

The core full-stack application is operational with separated React/TypeScript frontend and Spring Boot backend applications, containerized local infrastructure, PostgreSQL persistence, authentication, application tracking, resume workflows, interview notes, and analytics.

## Author

**R N Dhanapraveen Krishna**

Software Engineering Student

GitHub: `https://github.com/rndpk12`

---

### License

This project is currently maintained as a personal software engineering project.

```

**One change I strongly recommend:** don't claim features or libraries in the README unless they actually exist in your current codebase. Before you commit this, we can verify the `frontend/package.json`, `backend/pom.xml`, and actual project structure and make the README **100% accurate to your implementation**.
```
