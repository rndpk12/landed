# Architecture Guide

Landed is a modular full-stack application. The repository separates product UI, API domains, deployment material, and developer documentation so each concern has a clear home.

```text
Landed/
├── backend/                         # Spring Boot API
│   └── src/
│       ├── main/java/com/landed/
│       │   ├── auth/                # Registration, email login, Google OAuth
│       │   ├── application/         # Application pipeline and stage history
│       │   ├── activity/            # User activity timeline
│       │   ├── interview/           # Interview rounds and notes
│       │   ├── jobimport/           # Job URL detection and provider adapters
│       │   ├── resume/              # Resume storage, versions, processing, diffing
│       │   ├── resumematch/         # Resume-to-job matching
│       │   ├── resumeperformance/   # Resume conversion analytics
│       │   ├── security/            # JWT, rate limiting, authentication filters
│       │   ├── user/                # Profile management
│       │   ├── config/              # Spring configuration
│       │   └── common/              # API errors, exceptions, shared DTOs
│       ├── main/resources/          # Spring configuration and Flyway migrations
│       └── test/                    # Domain-focused unit tests
├── frontend/                        # React + TypeScript application
│   └── src/
│       ├── components/              # Reusable UI, including landing-page components
│       ├── context/                 # App-wide state providers
│       ├── hooks/                   # Reusable React hooks
│       ├── layout/                  # Authenticated workspace shell
│       ├── lib/                     # HTTP client and browser utilities
│       ├── pages/                   # Route-level product screens
│       ├── routes/                  # Router and access control
│       ├── services/                # Domain API clients
│       └── types/                   # Shared TypeScript domain contracts
├── docs/                            # Engineering and deployment documentation
├── compose.yaml                     # Local service orchestration
├── Dockerfile                       # Production API image
└── .env.example                     # Safe environment-variable template
```

## Placement Rules

- Put backend work in the owning business-domain package. Keep controllers, services, repositories, entities, and DTOs together under that domain.
- Put cross-domain backend code only in `common`, `security`, or `config`; do not create a generic dumping-ground package.
- Add frontend route screens in `pages`, reusable visual units in `components`, server calls in `services`, and API-shaped contracts in `types`.
- Keep feature-specific landing components under `frontend/src/components/landing`.
- Add database changes as a new, ordered Flyway migration in `backend/src/main/resources/db/migration`—never edit an applied migration.
- Keep secrets in local environment files or deployment secret managers. Never commit `.env`.

## Verification

Run these checks before merging changes:

```bash
cd frontend && npm run lint && npm run build
cd ../backend && mvn test
```

For the full local stack:

```bash
docker compose up -d --build
curl http://localhost:8080/actuator/health
```
