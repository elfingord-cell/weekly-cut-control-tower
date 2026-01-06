# Weekly Cut Control Tower

A single-user Next.js + PostgreSQL dashboard for weekly cut/bulk check-ins. Capture weekly stats, auto-derive trends, generate a standardized report, and keep everything deployable to Vercel.

## Features
- Weekly check-in form with validation and sensible defaults.
- Derived metrics: weekly rate, buffer vs goal date, trendline projection, consistency score, corridor classification.
- Standardized, descriptive weekly report with copy-to-clipboard.
- Dashboard with latest metrics and a weight trend chart (Chart.js).
- Single-user basic auth via environment variables (optional; warns if unset).

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma ORM (`provider = postgresql`)
- Chart.js via `react-chartjs-2`
- zod for validation, date-fns for dates

## Prerequisites
- Node.js 20 (see `.nvmrc`)
- PostgreSQL database + connection URL

## Environment variables
Create a `.env` based on `.env.example`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
BASIC_AUTH_USER="admin"           # optional but recommended
BASIC_AUTH_PASSWORD="supersecret" # optional but recommended
```

If BASIC_AUTH_* are absent, the app remains accessible but shows a warning banner.

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Apply database schema (creates tables in the target database):
   ```bash
   npx prisma migrate dev --name init
   ```
3. (Optional) Seed a default Settings row:
   ```bash
   npm run db:seed
   ```
4. Run the app:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## Deployment to Vercel
1. Push this repo to GitHub and import into Vercel.
2. In Vercel project settings, add environment variables from the `.env.example` (including DATABASE_URL pointing to your managed Postgres).
3. Set **Build Command** to:
   ```
   npm run db:migrate && npm run build
   ```
   This runs `prisma migrate deploy` before building.
4. Set **Install Command** to the default (Vercel runs `npm install`, which triggers `prisma generate` via `postinstall`).
5. Deploy. Basic auth is enforced when BASIC_AUTH_USER/PASSWORD are present.

## Scripts
- `npm run dev` — Next.js dev server.
- `npm run build` — Production build.
- `npm start` — Start production server.
- `npm run lint` — Lint with ESLint 8.
- `npm run db:migrate` — `prisma migrate deploy` (used in Vercel build step).
- `npm run db:seed` — Seed default settings (idempotent).

## Notes on Prisma & Postgres
- Prisma datasource uses `provider = "postgresql"`.
- The repo pins ESLint v8 to avoid Next.js peer issues.
- Server actions handle check-in creation, derive metrics, and store the generated report alongside each check-in.
