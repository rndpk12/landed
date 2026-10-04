# Landed Web App

This folder contains the React + TypeScript web application deployed to Vercel.

## Folder map

```text
frontend/
├── public/             # Static brand assets
├── src/
│   ├── components/     # Reusable UI controls and landing-page sections
│   ├── context/        # Application-wide providers, including authentication
│   ├── hooks/          # Reusable React hooks
│   ├── layout/         # Authenticated dashboard shell
│   ├── lib/            # API client and browser utilities
│   ├── pages/          # Route-level screens
│   ├── routes/         # Router and protected-route rules
│   ├── services/       # API calls grouped by domain
│   ├── types/          # TypeScript domain contracts
│   └── main.tsx        # Application entry point
├── package.json        # Scripts and web dependencies
├── vite.config.ts      # Vite development and build configuration
└── vercel.json         # Vercel SPA route rewrites
```

## Common commands

```bash
npm run dev
npm run lint
npm run build
```

Use `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` for public browser configuration. Do not put private secrets in `VITE_*` variables.
