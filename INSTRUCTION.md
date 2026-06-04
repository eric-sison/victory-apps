# INSTRUCTION.md — Agent Guide for `victory-apps`

This file tells an AI coding agent how this codebase is structured, how to run it, and the
conventions to follow so that generated changes match existing patterns. Read it fully before
making edits.

---

## 1. What this project is

`victory-apps` is a **pnpm + Turborepo monorepo** (Node ≥ 20, pnpm 11.3.0, TypeScript 5.9.3).

It contains a self-hosted **OAuth2 / OIDC identity provider with an admin UI** (`apps/admin`) and
one or more **client applications** that authenticate against it (`apps/selah`). The admin app is
unusual in that it serves **both a React SSR frontend and a REST API from a single server**: the
Hono API is embedded inside the TanStack Start app via a wildcard route (`/api/$`) and runs on the
same Nitro server. There is no separate API service.

### Workspace layout

```
victory-apps/
├── apps/
│   ├── admin/        # MAIN APP — TanStack Start SSR UI + embedded Hono API + Better Auth (OIDC provider) + Drizzle/Postgres
│   ├── selah/        # OIDC CLIENT app (uses oidc-client-ts to log in via admin). Church/worship domain: song-bank, teams, services, calendar
│   └── web/          # additional app (see apps/web; treat like the others — TanStack Start)
├── packages/
│   ├── ui/                  # @workspace/ui — shared shadcn/ui-based component library (Base UI + Tailwind v4)
│   ├── eslint-config/       # @workspace/eslint-config — shared ESLint flat configs (base / next-js / react-internal)
│   └── typescript-config/   # @workspace/typescript-config — shared tsconfig bases
├── docker/           # Production Docker setup (Dockerfile, docker-compose.yaml, README)
├── scripts/          # deploy.sh, cleanup.sh
├── docker-compose.yaml   # LOCAL dev services only (postgres, pgadmin, mailpit)
├── turbo.json        # Turborepo pipeline
├── biome.json        # Biome lint/format config
└── pnpm-workspace.yaml
```

`apps/admin` is where the vast majority of meaningful work happens. Default there unless the task
clearly concerns a client app or a shared package.

---

## 2. Tech stack (admin)

| Layer         | Choice                                                              |
| ------------- | ------------------------------------------------------------------- |
| Framework     | TanStack Start (SSR) + TanStack Router (file-based routing)         |
| Runtime       | React 19, Vite 8, Nitro (server adapter), React Compiler (Babel)    |
| API           | Hono via `@hono/zod-openapi` (OpenAPI 3.0), mounted at `/api/$`     |
| Auth          | Better Auth (`betterAuth` minimal) — embedded server + client       |
| Database      | PostgreSQL + Drizzle ORM + drizzle-kit (node-postgres `Pool`)       |
| Validation    | Zod v4                                                              |
| Data fetching | TanStack Query v5                                                   |
| Forms         | TanStack Form                                                       |
| Tables        | TanStack Table                                                      |
| Client state  | Zustand                                                             |
| Styling       | Tailwind CSS v4 + `@workspace/ui`                                   |
| Icons         | Lucide React (re-exported from `@workspace/ui`)                     |
| Logging       | Pino (`@hono/structured-logger`, `pino-pretty` in dev)              |
| Email         | Nodemailer (Mailpit in dev)                                         |
| Lint/Format   | **Biome** (root + admin). Some packages also carry ESLint/Prettier. |
| Tests         | Vitest + Testing Library                                            |

`apps/selah` uses the same frontend stack (TanStack Start/Router/Query, `@workspace/ui`,
Tailwind) but authenticates as an **OIDC client** with `oidc-client-ts` instead of Better Auth.

---

## 3. Running the project

### Local development (from repo root)

```bash
pnpm install                       # install all workspaces
cp .env.example .env               # postgres / pgadmin / mailpit creds for docker
docker compose up -d               # starts postgres(5432), pgadmin(5050), mailpit(8025 UI / 1025 SMTP)
cp apps/admin/.env.example apps/admin/.env   # then fill in values (see §7)
pnpm --filter admin db:migrate     # apply Drizzle migrations
pnpm --filter admin db:seed        # create the default admin user (idempotent)
pnpm dev                           # turbo dev — runs all apps
```

Shortcut for the DB bootstrap: `pnpm dev:db:init` (compose up + migrate + seed).

### Ports

| Service           | URL                                 |
| ----------------- | ----------------------------------- |
| Admin app + API   | http://localhost:3000               |
| API docs (Scalar) | http://localhost:3000/api/docs      |
| OpenAPI spec      | http://localhost:3000/api/docs/spec |
| pgAdmin           | http://localhost:5050               |
| Mailpit inbox     | http://localhost:8025               |
| Postgres          | localhost:5432                      |
| Selah client      | http://localhost:5860               |

All dev outgoing email is trapped by Mailpit — nothing is delivered to real inboxes.

### Root scripts (Turborepo)

```bash
pnpm dev          # turbo dev
pnpm build        # turbo build
pnpm lint         # turbo lint
pnpm format       # turbo format
pnpm typecheck    # turbo typecheck
```

### Admin app scripts (`pnpm --filter admin <script>`)

```bash
dev          preview        test          lint / format / check (Biome)
build        db:migrate     db:generate   db:push   db:studio   db:seed
openapi:generate
```

To run a single workspace use `pnpm --filter <name> <script>` (e.g. `--filter admin`,
`--filter selah`, `--filter @workspace/ui`).

---

## 4. `apps/admin` internal structure

```
apps/admin/src/
├── routes/                       # TanStack Router file-based routes (URL = file path)
│   ├── __root.tsx                # root shell/layout
│   ├── index.tsx                 # "/"
│   ├── api/$.ts                  # wildcard — forwards every method to the Hono app.fetch()
│   ├── auth/                     # public auth pages (sign-in, consent, oidc/sign-out)
│   └── (protected)/              # route GROUP — everything here requires a session
│       ├── route.tsx             # beforeLoad guard (requireAuth server fn) + sidebar layout
│       ├── dashboard/index.tsx
│       ├── users/index.tsx
│       └── ...                   # apps, consent, sessions, settings
├── server/                       # the embedded Hono API
│   ├── app.ts                    # OpenAPIHono instance, middleware order, route registration, docs
│   ├── middleware/               # auth-session, require-auth, cors, error-handler, logger, rate-limiter
│   └── routes/                   # OpenAPI route handlers (healthcheck, discovery, ...)
├── lib/
│   ├── auth.ts                   # Better Auth server instance (plugins, sessions, email/password, OIDC provider)
│   ├── auth-client.ts            # Better Auth client (relative paths — same origin)
│   └── mailer.ts                 # nodemailer transport
├── database/
│   ├── conn.ts                   # drizzle(Pool) — default export `db`
│   ├── schemas/                  # pgTable definitions (auth-schema.ts, ...)
│   └── migrations/               # generated SQL + meta/ snapshots (do NOT hand-edit)
├── components/
│   ├── AppSidebar.tsx, DataTable.tsx
│   └── features/<domain>/        # domain-grouped UI: forms, table `columns.ts`, etc.
├── utils/
│   ├── env.ts                    # Zod-validated process.env → `env` + `Env` type
│   ├── app-env.ts                # `AppEnv` Hono context type (logger, user, session)
│   ├── openapi.ts                # jsonResponse, commonErrors, ErrorMessages (numeric), ErrorResponseSchema
│   ├── error-messages.ts         # client-facing copy (full/short) keyed by status + reason
│   └── route-metadata.ts         # `routeMap` used by PageBreadcrumb
├── routeTree.gen.ts              # GENERATED by TanStack Router — never edit
└── scripts/seed-admin.ts         # default-admin seeding
```

---

## 5. Conventions — follow these exactly

### Imports & module system

- The app is ESM/NodeNext. **Server-side imports include the `.js` extension** even for `.ts`
  source files (e.g. `import { auth } from "#/lib/auth.js"`). Match the surrounding file.
- Path alias: **`#/*` → `./src/*`** (subpath import, configured in `tsconfig.json`). Prefer it
  over long relative paths.
- Shared UI is imported per-component: `import { Button } from "@workspace/ui/components/Button"`.
  Icons come from `@workspace/ui` (`import { Plus } from "@workspace/ui"`).

### Environment variables

- Every app validates env at startup in `src/utils/env.ts` using a Zod schema and calls
  `process.exit(1)` if validation fails. **Add any new env var to that schema** (and to
  `.env.example` + the relevant docker `.env` docs). Code reads from the exported `env` object,
  not raw `process.env`, except in a few bootstrap files (`conn.ts`, `mailer.ts`, `auth.ts`) that
  intentionally read `process.env` because of load-order constraints — preserve that.

### Frontend routes

- Routes are files under `src/routes/`. Adding a file creates a route; `routeTree.gen.ts`
  regenerates automatically on dev. If the route tree desyncs, delete `routeTree.gen.ts` and
  restart — **never edit it by hand**.
- Protected pages live under the `(protected)` route group. Auth is enforced **once** in
  `(protected)/route.tsx` via a `createServerFn` `requireAuth` guard in `beforeLoad`
  (server-side session check with `auth.api.getSession({ headers })`). Child pages read context
  with `Route.useRouteContext()` and loader data with `Route.useLoaderData()`.
- Public auth pages use the inverse guard `requireNoAuth` (redirect signed-in users away).
- Fetch SSR data with `createServerFn({ method })` + `getRequestHeaders()`; call Better Auth
  server APIs (`auth.api.*`) inside server functions, not from the client.
- Page chrome uses the `@workspace/ui` `Page` primitives (`Page`, `PageHeader`, `PageTitle`,
  `PageDescription`, `PageContent`, `PageAction`, `PageBreadcrumb`) and passes `routeMap` from
  `#/utils/route-metadata` to `PageBreadcrumb`. Follow the existing page template.

### Forms

Pattern (see `components/features/auth/CredentialsSignInForm.tsx`): a Zod schema → TanStack
`useForm` with `validators.onSubmit` → submit via TanStack Query `useMutation` calling
`authClient.*` (or a server fn) → map error `status` codes to `ErrorMessages[code].<reason>.short`
→ surface with `toast` from `@workspace/ui/components/Sonner`.

### API (Hono) handlers

- Each endpoint is its own `OpenAPIHono<AppEnv>()` handler file in `src/server/routes/`, built
  with `createRoute({...})` + `.openapi(route, handler)`.
- Define responses with `jsonResponse(schema, description, example)` and reuse `commonErrors[code]`
  from `utils/openapi.ts`. Give every route a `tags` entry and a `description`.
- Register new handlers by adding them to the `routes` array in `server/app.ts`
  (`routes.forEach((r) => app.route("/", r))`).
- Access request context via `AppEnv` `Variables`: `c.var.logger`, `c.var.user`, `c.var.session`.
- **Middleware order in `app.ts` is intentional** (secureHeaders → cors → requestId →
  contextStorage → logger → authSession → route-specific rate limiters → auth catch-all). Don't
  reorder casually.

### Errors & logging

- Throw `HTTPException` (from `hono/http-exception`) for intentional API errors; the global
  `errorHandler` maps `ZodError` (422), Better Auth `APIError`, and `HTTPException` to consistent
  JSON `{ status, message, code? }`. Stack traces are only included when `NODE_ENV !== production`.
- There are **two** `ErrorMessages` maps — keep them distinct:
  - `utils/openapi.ts` → terse server/API messages keyed by numeric status.
  - `utils/error-messages.ts` → user-facing copy with `full`/`short` variants keyed by status +
    reason (used in UI forms).
- Log through `c.var.logger` (structured pino) on the server, including `requestId`. Avoid bare
  `console.log` in server/request paths.

### Database

- Define tables with `pgTable` in `src/database/schemas/*`; the project uses `casing: "snake_case"`
  in `drizzle.config.ts`, so write camelCase keys in code and let Drizzle map to snake_case columns.
- Better Auth uses `usePlural: true` (tables are `users`, `sessions`, `accounts`, etc.); IDs are
  `text` generated by Better Auth's `generateId()`.
- **Workflow for schema changes:** edit the schema → `pnpm --filter admin db:generate` to produce a
  migration → review → `db:migrate` to apply. Use `db:push` only for throwaway local iteration.
  Never hand-edit files under `database/migrations/` or `migrations/meta/`.
- Import the DB as the default export of `database/conn.ts` (`import db from ".../conn.js"`).

### Auth specifics

- The Better Auth server (`lib/auth.ts`) is configured as an **OIDC provider** (`oauthProvider`
  plugin) plus `admin`, `jwt`, `multiSession`, `openAPI`, and `tanstackStartCookies`. Email/password
  is enabled with `requireEmailVerification`. Client apps (like `selah`) register via
  `authClient.oauth2.register(...)` and log in through the OIDC flow.
- `BETTER_AUTH_SECRET` must be ≥ 32 chars and **identical across every service** — a mismatch
  invalidates all sessions. Generate with `openssl rand -base64 32`.

---

## 6. Quality gates before finishing a change

Run these (scoped to the workspace you touched, or at root for cross-cutting changes):

```bash
pnpm --filter <app> check       # Biome lint + format check (admin/web)
pnpm typecheck                  # turbo typecheck across the repo
pnpm --filter <app> test        # Vitest, where tests exist
pnpm build                      # ensure it still builds
```

Biome rules: double quotes, space indentation, organize-imports on. It **ignores**
`routeTree.gen.ts`, `database/migrations/meta/**`, `src/styles.css`, and `vite.config.ts` — don't
try to reformat those. Commits are gated by Husky + lint-staged.

---

## 7. Required env (`apps/admin/.env`)

```
DATABASE_URL              # postgres connection string
BETTER_AUTH_URL           # e.g. http://localhost:3000/api/auth
BETTER_AUTH_SECRET        # ≥ 32 chars
ALLOWED_ORIGINS           # comma-separated CORS origins
DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD / DEFAULT_ADMIN_NAME   # seeded admin
RESET_PASSWORD_CALLBACK   # full URL; Better Auth appends ?token=
SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASSWORD / SMTP_FROM   # Mailpit in dev
```

All are validated in `utils/env.ts` and required at process start (SMTP included). The exact schema
is the source of truth — consult it rather than trusting this list.

---

## 8. Production build & deploy (context, rarely edited by agents)

- Build output is **`.output/`** (Nitro), **not** `dist/`. Server entry: `.output/server/index.mjs`.
- Docker produces two images — `admin` (distroless, no shell) and `migrator` (runs migrations +
  seed, then exits) — via a multi-stage `docker/Dockerfile` driven by `turbo prune`.
- Deploy/cleanup are wrapped in root scripts: `pnpm deploy:up`, `deploy:clean`, `deploy:build`,
  `deploy:start`, `deploy:down`, `deploy:down:volumes`, `deploy:down:images`, `deploy:down:all`
  (see `scripts/deploy.sh`, `scripts/cleanup.sh`, `docker/README.md`). All run from the repo root.
- Docker deployment reads a single `docker/.env`; there are no per-package `.env` files in that path.

---

## 9. Common pitfalls / gotchas

- **Don't edit generated files:** `routeTree.gen.ts`, anything under `database/migrations/`.
- **`.js` extensions** are required on server-side import specifiers — omitting them breaks the build.
- **Two error-message maps** exist; use the right one (API vs. UI copy).
- **Add new env vars to `utils/env.ts`** or the app exits at startup with a validation error.
- **Build artifacts** are in `.output/`, not `dist/` — check there when debugging builds.
- **Sessions failing after setup** almost always means a `BETTER_AUTH_SECRET` mismatch or unmigrated DB.
- **Emails "not arriving" in dev** is expected — check Mailpit at http://localhost:8025.
- **Auth endpoints are rate-limited** (`server/app.ts`); repeated sign-in calls in tests may 429.
- The `apps/admin/(protected)/apps/index.tsx` OIDC-client registration block is marked `TODO`/temporary;
  treat it as scaffolding, not a stable API.

---

## 10. Quick orientation checklist for a new task

1. Decide the workspace: UI/admin behavior → `apps/admin`; client login flow → `apps/selah`;
   shared component/util → `packages/ui`.
2. For a new page → add a file under `src/routes/` (use `(protected)/` if it needs a session) and
   follow the `Page` + `routeMap` template.
3. For a new API endpoint → new handler in `server/routes/`, schemas via `@hono/zod-openapi`,
   register in `server/app.ts`.
4. For data model changes → edit `database/schemas/`, then `db:generate` → review → `db:migrate`.
5. Validate any new config in `utils/env.ts`.
6. Run `check`, `typecheck`, `test`, `build` before declaring done.
