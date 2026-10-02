# Landed Deployment

This guide deploys Landed with:

- Frontend: Vercel
- Backend: Railway
- Database: Neon PostgreSQL

## Production Architecture

The browser talks to the Railway API through `VITE_API_BASE_URL`.
The Railway API talks to Neon through `DATABASE_URL`.
JWT authentication is stateless, so the API can run as a single Railway web service without sticky sessions.

## Required Environment Variables

### Frontend, Vercel

| Variable | Example |
|---|---|
| `VITE_API_BASE_URL` | `https://landed-api.up.railway.app/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID |

### Backend, Railway

| Variable | Example |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DATABASE_URL` | `postgresql://user:password@host.neon.tech/db?sslmode=require` |
| `JWT_SECRET` | Base64 string from `openssl rand -base64 64` |
| `GOOGLE_CLIENT_ID` | Same Google OAuth web client ID used by Vercel |
| `CORS_ALLOWED_ORIGINS` | `https://landed.vercel.app,https://www.yourdomain.com` |

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
5. Save the connection string as Railway `DATABASE_URL`.

The backend accepts Neon-style URLs like:

```text
postgresql://user:password@host.neon.tech/landed?sslmode=require
```

At startup, Landed converts `DATABASE_URL` into the JDBC datasource settings Spring Boot needs.

## Railway Setup

1. Create a new Railway project.
2. Add a service from the GitHub repository.
3. Set the service root to the repository root.
4. Railway will build the backend with the root `Dockerfile`.
5. Add backend environment variables:

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -base64 64>
GOOGLE_CLIENT_ID=your-google-oauth-web-client-id
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

6. Set the public service port to `8080` if Railway asks.
7. Use this health check path:

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
VITE_API_BASE_URL=https://your-railway-api-domain/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id
```

6. Deploy.

Use the same Google OAuth web client ID for the backend `GOOGLE_CLIENT_ID` variable so the API
can verify credentials returned by the frontend.

`vercel.json` rewrites browser routes to `index.html` so protected app routes work after refresh.

## Domain Configuration

### Backend Domain

Use either the default Railway domain or a custom API domain such as:

```text
https://api.yourdomain.com
```

If using a custom domain, add it in Railway and create the DNS record Railway provides.

### Frontend Domain

Use either the default Vercel domain or a custom app domain such as:

```text
https://app.yourdomain.com
```

If using a custom Vercel domain, add it in Vercel and create the DNS record Vercel provides.

### CORS

Set Railway `CORS_ALLOWED_ORIGINS` to every HTTPS frontend origin that should call the API:

```text
CORS_ALLOWED_ORIGINS=https://landed.vercel.app,https://app.yourdomain.com
```

Do not include paths, trailing slashes, wildcards, or localhost in production.

## Health Checks

Backend:

```text
GET https://your-railway-api-domain/actuator/health
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
2. Railway backend env vars are set.
3. Railway health check returns `UP`.
4. Vercel `VITE_API_BASE_URL` points to Railway with `/api/v1`.
5. Railway `CORS_ALLOWED_ORIGINS` includes the Vercel/custom frontend origin.
6. Vercel deployment loads and login/register calls reach the API.
7. Google sign-in appears only when both `VITE_GOOGLE_CLIENT_ID` and backend
   `GOOGLE_CLIENT_ID` are configured with the same value.
