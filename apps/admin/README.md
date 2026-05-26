# admin

The TanStack Start SSR app for **victory-apps**. Serves both the admin UI and the Hono REST API from a single Nitro server — the API is mounted at `/api/*` via a TanStack Start wildcard route.

---

## Tech Stack

| Layer         | Library / Tool                                      |
| ------------- | --------------------------------------------------- |
| Framework     | TanStack Start (SSR) + TanStack Router (file-based) |
| Runtime       | React 19, Vite 8, Nitro (server adapter)            |
| API           | Hono (OpenAPI) — mounted at `/api/$` wildcard route |
| Styling       | Tailwind CSS v4                                     |
| UI Components | `@workspace/ui` (shadcn/ui-based component library) |
| Auth          | Better Auth (server + client, embedded)             |
| Data Fetching | TanStack Query v5                                   |
| Forms         | TanStack Form                                       |
| Tables        | TanStack Table                                      |
| State         | Zustand                                             |
| Icons         | Lucide React                                        |
| Lint / Format | Biome                                               |
| Tests         | Vitest + Testing Library                            |
| Compiler      | React Compiler (via Babel plugin)                   |

---

## Prerequisites

Before running the admin app, make sure the following are in place:

- PostgreSQL is running (see root README)
- A `.env` file exists at `apps/admin/.env`

---

## Environment Variables

```bash
cp apps/admin/.env.example apps/admin/.env
```

```dotenv
# Database
DATABASE_URL=postgres://appuser:your_password@localhost:5432/appdb

# Better Auth
BETTER_AUTH_URL=http://localhost:3000/api/auth
BETTER_AUTH_SECRET=your_secret_here_min_32_characters

# CORS — comma-separated list of allowed origins for the Hono API
ALLOWED_ORIGINS=http://localhost:3000

# Default admin user — created by the seed script
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=your_secure_admin_password
DEFAULT_ADMIN_NAME=Super Admin

# Password reset callback — Better Auth appends ?token= to this URL
RESET_PASSWORD_CALLBACK=http://localhost:3000/auth/callback/reset-password

# SMTP — in dev this points to Mailpit (docker compose up)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=dev
SMTP_PASSWORD=dev
SMTP_FROM=noreply@example.com
```

> `BETTER_AUTH_SECRET` must be at least 32 characters. Generate one with `openssl rand -base64 32`.

---

## Scripts

| Script                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `pnpm dev`              | Start the dev server on port `3000` (hot reload) |
| `pnpm build`            | Build for production — outputs to `.output/`     |
| `pnpm preview`          | Build then serve the production output locally   |
| `pnpm test`             | Run the Vitest test suite                        |
| `pnpm lint`             | Lint with Biome                                  |
| `pnpm format`           | Format with Biome                                |
| `pnpm check`            | Lint + format check with Biome                   |
| `pnpm db:migrate`       | Apply pending Drizzle migrations                 |
| `pnpm db:generate`      | Generate migration files from schema changes     |
| `pnpm db:push`          | Push schema directly to the database (dev only)  |
| `pnpm db:studio`        | Open Drizzle Studio                              |
| `pnpm db:seed`          | Seed the default admin user                      |
| `pnpm openapi:generate` | Generate the OpenAPI spec to a file              |

---

## Build Output

Vite + Nitro outputs to `.output/` (not `dist/`). The production entry point is:

```
.output/server/index.mjs
```

The build is a self-contained Nitro server that can run on any Node-compatible host:

```bash
pnpm build
node .output/server/index.mjs
```

In Docker, the distroless runner copies `.output/` and starts the server directly:

```dockerfile
CMD ["output/server/index.mjs"]
```

---

## Workspace Dependencies

| Package         | What it provides                                        |
| --------------- | ------------------------------------------------------- |
| `@workspace/ui` | Shared shadcn/ui component library (Button, Card, etc.) |

The auth server is instantiated directly in `src/lib/auth.ts`. The auth client in `src/lib/auth-client.ts` uses relative paths — no base URL is needed since the API is served from the same origin.

---

## API

The Hono app is defined in `src/server/app.ts` and mounted at `/api/*` via `src/routes/api/$.ts`. All HTTP methods are forwarded to `app.fetch()`.

Key endpoints:

| Endpoint               | Description                     |
| ---------------------- | ------------------------------- |
| `GET /api/healthcheck` | Health check — returns `200 OK` |
| `GET /api/docs`        | Scalar API reference UI         |
| `GET /api/docs/spec`   | OpenAPI 3.0 JSON spec           |
| `* /api/auth/*`        | Better Auth handler             |

---

## Vite Configuration

`vite.config.ts` uses the following plugins:

- `@tanstack/devtools-vite` — TanStack devtools overlay (dev only)
- `nitro/vite` — Nitro server adapter
- `@tailwindcss/vite` — Tailwind CSS v4 integration
- `@tanstack/react-start/plugin/vite` — TanStack Start SSR + server functions
- `@vitejs/plugin-react` — React Fast Refresh
- `@rolldown/plugin-babel` with `reactCompilerPreset` — React Compiler for automatic memoization

Path aliases are resolved via `tsconfig.json` (`#/*` maps to `./src/*`).

---

## Troubleshooting

**Sign-in always fails with a 401**
Check that `BETTER_AUTH_SECRET` in `apps/admin/.env` is set and at least 32 characters.

**Redirected to `/auth/sign-in` on every page load**
The `DATABASE_URL` in `apps/admin/.env` must point to a running database with migrations applied. If the server-side session check fails, `requireAuth` redirects every request.

**Route tree is out of sync**
Delete `src/routeTree.gen.ts` and restart the dev server. TanStack Router regenerates it automatically from the files in `src/routes/`.

**Build fails with a `lightningcss` error**
The Docker build hoists `lightningcss` in `.npmrc`. For local builds this shouldn't happen, but if it does, run `pnpm install` again — it resolves the correct platform binary.

**Env validation fails on startup**
All variables in `src/utils/env.ts` are required at process start — including SMTP and auth vars. If any are missing or malformed, the process exits immediately with a validation error listing which fields failed.
