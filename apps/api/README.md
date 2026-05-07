# api

The Hono API server for victory-apps. Handles authentication, business logic, and exposes a REST API with OpenAPI documentation.

---

## Prerequisites

Before running the API, make sure the following are in place:

- PostgreSQL is running (see root README for setup)
- Migrations have been applied (`pnpm db:auth:migrate` from the repo root)
- A `.env` file exists at `apps/api/.env`

---

## Environment Variables

```bash
cp apps/api/.env.example apps/api/.env
```

```dotenv
# App
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://appuser:your_password@localhost:5432/appdb

# Better Auth — must match packages/auth/.env exactly
BETTER_AUTH_SECRET=your_secret_here_min_32_characters
BETTER_AUTH_URL=http://localhost:3001/api/auth

# CORS — comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000

# Frontend — used to construct links in emails (password reset, etc.)
RESET_PASSWORD_CALLBACK=http://localhost:3000/auth/reset-password

# SMTP — in dev this points to Mailpit (docker compose up)
# In production, replace with your real SMTP provider credentials
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=dev
SMTP_PASSWORD=dev
SMTP_FROM=noreply@example.com
```

> `BETTER_AUTH_SECRET` must be identical to the value in `packages/auth/.env`. A mismatch will cause all session validation to fail.

> `SMTP_*` variables work identically in dev (Mailpit) and production (any real SMTP provider). Only the values change between environments — no code changes required.

> `RESET_PASSWORD_CALLBACK` must point to the frontend reset password page. Better Auth generates a token and appends it as a `?token=` query parameter to this URL.

---

## Scripts

| Script                  | Description                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| `pnpm dev`              | Start the API in watch mode. Checks if the database is running before starting.   |
| `pnpm build`            | Compile TypeScript to `dist/`.                                                    |
| `pnpm start`            | Run the compiled output from `dist/`.                                             |
| `pnpm db:push`          | Push schema changes directly to the database without generating a migration file. |
| `pnpm db:generate`      | Generate a new migration file from schema changes.                                |
| `pnpm db:migrate`       | Apply pending migrations.                                                         |
| `pnpm db:studio`        | Open Drizzle Studio to browse the database.                                       |
| `pnpm openapi:generate` | Generate `openapi.json` from the current route definitions.                       |

---

## Development

Start the API from within this package:

```bash
pnpm dev
```

Or from the repo root:

```bash
pnpm --filter api dev
```

The API will refuse to start if PostgreSQL is not running and will print instructions on how to start it.

---

## Ports

| Service  | URL                            |
| -------- | ------------------------------ |
| API      | http://localhost:3001          |
| API docs | http://localhost:3001/api/docs |
