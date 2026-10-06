# Landed Lite

Landed Lite is a separate, browser-first job tracker. It has no account flow and stores applications in the browser's local storage.

## Run locally

```bash
cd landed-lite
npm install
npm run dev
```

Open `http://localhost:3001`.

For URL auto-fill, also run the main Landed API from the repository root:

```bash
docker compose up -d --build
```

## Deploy independently

Create a second Vercel project from this same GitHub repository and set its **Root Directory** to `landed-lite`.

Set `VITE_API_BASE_URL` in that Vercel project to the Render API ending in `/api/v1`. The Lite app needs this only for job URL auto-fill; applications remain in the user's browser.
