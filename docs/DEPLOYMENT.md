# Landed Deployment

This guide deploys Landed with:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## Production Architecture

The browser talks to the Render API through `VITE_API_BASE_URL`.
The Render API talks to Neon through `DATABASE_URL`.
JWT authentication is stateless, so the API can run as a single Render web service without sticky sessions.

## Required Environment Variables

### Frontend, Vercel

| Variable | Example |
|---|---|
| `VITE_API_BASE_URL` | `https://landed-backend-nkxx.onrender.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID |

### Backend, Render

| Variable | Example |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DATABASE_URL` | `postgresql://user:password@host.neon.tech/db?sslmode=require` |
| `JWT_SECRET` | Base64 string from `openssl rand -base64 64` |
| `GOOGLE_CLIENT_ID` | Same Google OAuth web client ID used by Vercel |
| `GOOGLE_ADDITIONAL_CLIENT_IDS` | Chrome extension OAuth client ID |
| `CORS_ALLOWED_ORIGINS` | `https://landed.vercel.app,https://www.yourdomain.com` |
| `CORS_ALLOWED_EXTENSION_IDS` | Comma-separated Chrome extension IDs |

Optional backend variables:

| Variable | Default |
|---|---|
| `JWT_EXPIRATION` | `86400000` |
| `DB_POOL_SIZE` | `5` in prod |
| `DB_MIN_IDLE` | `1` in prod |
| `RESUME_STORAGE_PATH` | `./data/resumes` |

## Neon Setup

1. Create a Neon project.
2. Create the production database, for example `landed`.
3. Copy the pooled or direct PostgreSQL connection string.
4. Keep `sslmode=require` in the connection string.
5. Save the connection string as Render `DATABASE_URL`.

The backend accepts Neon-style URLs like:

```text
postgresql://user:password@host.neon.tech/landed?sslmode=require
```

At startup, Landed converts `DATABASE_URL` into the JDBC datasource settings Spring Boot needs.

## Render Setup

1. Create a new Render Web Service from the GitHub repository.
2. Set the service root to the repository root.
3. Render builds the backend with the root `Dockerfile`.
4. Add backend environment variables:

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -base64 64>
GOOGLE_CLIENT_ID=your-google-oauth-web-client-id
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
CORS_ALLOWED_EXTENSION_IDS=your-chrome-extension-id
GOOGLE_ADDITIONAL_CLIENT_IDS=your-chrome-extension-client-id.apps.googleusercontent.com
```

5. Render supplies `PORT`; use `8080` as the local default.
6. Use this health check path:

```text
/actuator/health
```

The Dockerfile also includes a container health check against `/actuator/health`.

## Vercel Setup

1. Create a Vercel project from the same repository.
2. Framework preset: Vite.
3. Build command:

```text
npm run build
```

4. Output directory:

```text
dist
```

5. Add frontend environment variable:

```text
VITE_API_BASE_URL=https://your-render-api-domain/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id
```

6. Deploy.

Use the same Google OAuth web client ID for the backend `GOOGLE_CLIENT_ID` variable so the API
can verify credentials returned by the frontend.

`vercel.json` rewrites browser routes to `index.html` so protected app routes work after refresh.

## Domain Configuration

### Backend Domain

Use either the default Render domain or a custom API domain such as:

```text
https://api.yourdomain.com
```

If using a custom domain, add it in Render and create the DNS record Render provides.

### Frontend Domain

Use either the default Vercel domain or a custom app domain such as:

```text
https://app.yourdomain.com
```

If using a custom Vercel domain, add it in Vercel and create the DNS record Vercel provides.

### CORS

Set Render `CORS_ALLOWED_ORIGINS` to every HTTPS frontend origin that should call the API:

```text
CORS_ALLOWED_ORIGINS=https://getlanded.vercel.app,https://app.yourdomain.com
```

Do not include paths, trailing slashes, wildcards, or localhost in production.

## Health Checks

Backend:

```text
GET https://your-render-api-domain/actuator/health
```

Expected response:

```json
{"status":"UP"}
```

Frontend:

```text
GET https://your-vercel-domain/
```

Expected response: the Landed app shell.

## Environment Validation

When `SPRING_PROFILES_ACTIVE=prod`, the backend fails startup unless all required production variables exist:

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`

Production CORS validation rejects:

- `*`
- blank origins
- non-HTTPS origins
- localhost origins

`JWT_SECRET` must be valid Base64 and decode to at least 32 bytes.

Generate it with:

```bash
openssl rand -base64 64
```

## Production Build Verification

Frontend:

```bash
npm run lint
npm run build
```

Backend:

```bash
mvn test
mvn -DskipTests package
```

Docker image:

```bash
docker build -t landed-api:prod .
```

## Release Checklist

1. Neon database exists and `DATABASE_URL` is copied.
2. Render backend environment variables are set.
3. Render health check returns `UP`.
4. Vercel `VITE_API_BASE_URL` points to Render with `/api/v1`.
5. Render `CORS_ALLOWED_ORIGINS` includes the Vercel/custom frontend origin.
6. Vercel deployment loads and login/register calls reach the API.
7. Google sign-in appears only when both `VITE_GOOGLE_CLIENT_ID` and backend
   `GOOGLE_CLIENT_ID` are configured with the same value.
8. The Chrome extension ID is present in `CORS_ALLOWED_EXTENSION_IDS` and its OAuth client ID is present in `GOOGLE_ADDITIONAL_CLIENT_IDS`.
