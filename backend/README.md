# Landed API

This folder contains the Spring Boot API deployed to Render.

## Folder map

```text
backend/
├── src/main/java/com/landed/
│   ├── activity/            # User activity timeline
│   ├── application/         # Job applications and pipeline history
│   ├── auth/                # Email and Google authentication
│   ├── common/              # Shared API errors and utilities
│   ├── config/              # Spring, CORS, and production configuration
│   ├── interview/           # Interview notes
│   ├── jobimport/           # Job URL import and extraction
│   ├── resume/              # Resume storage, versions, and processing
│   ├── resumematch/         # Resume-to-job matching
│   ├── resumeperformance/   # Resume performance analytics
│   ├── security/            # JWT and request security
│   └── user/                # User profile management
├── src/main/resources/
│   ├── db/migration/        # Ordered Flyway database migrations
│   └── application*.yml     # Spring configuration profiles
├── src/test/                # Domain-focused tests
└── pom.xml                  # Java dependencies and Maven scripts
```

## Common commands

```bash
mvn test
mvn clean package
```

Add schema changes as a new Flyway migration. Never edit a migration that has already been deployed.
