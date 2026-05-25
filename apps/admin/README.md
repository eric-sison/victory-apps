# admin

The SSR admin dashboard for **victory-apps**, built with TanStack Start and served via Nitro. Provides a protected interface for managing users, sessions, and settings, backed by the Hono API (`apps/api`).

---

## Tech Stack

| Layer          | Library / Tool                                      |
| -------------- | --------------------------------------------------- |
| Framework      | TanStack Start (SSR) + TanStack Router (file-based) |
| Runtime        | React 19, Vite 8, Nitro (server adapter)            |
| Styling        | Tailwind CSS v4                                     |
| UI Components  | `@workspace/ui` (shadcn/ui-based component library) |
| Auth           | Better Auth via `@workspace/auth`                   |
| Data Fetching  | TanStack Query v5                                   |
| Forms          | TanStack Form                                       |
| Tables         | TanStack Table                                      |
| State          | Zustand                                             |
| Icons          | Lucide React                                        |
| Lint / Format  | Biome                                               |
| Tests          | Vitest + Testing Library                            |
| Compiler       | React Compiler (via Babel plugin)                   |

---

## Prerequisites

Before running the admin app, make sure the following are in place:

- PostgreSQL is running with migrations applied (see root README)
- The API (`apps/api`) is running on port `3001`
- A `.env` file exists at `apps/admin/.env`

---

## Environment Variables

```bash
cp apps/admin/.env.example apps/admin/.env
```

```dotenv
# Base URL of the Hono API — baked into the client bundle at build time by Vite
VITE_API_URL=http://localhost:3001

# Database — required for server-side auth session helpers
DATABASE_URL=postgres://appuser:your_password@localhost:5432/appdb

# Better Auth — must match apps/api exactly
BETTER_AUTH_URL=http://localhost:3001/api/auth
BETTER_AUTH_SECRET=your_secret_here_min_32_characters
```

> `VITE_*` variables are inlined into the client bundle at **build time**. Restart the Vite dev server after any change.

> `BETTER_AUTH_SECRET` must be identical to the value in `apps/api/.env`. A mismatch will break all session validation.

---

## Scripts

| Script          | Description                                            |
| --------------- | ------------------------------------------------------ |
| `pnpm dev`      | Start the dev server on port `3000` (hot reload)       |
| `pnpm build`    | Build for production — outputs to `.output/`           |
| `pnpm preview`  | Build then serve the production output locally         |
| `pnpm test`     | Run the Vitest test suite                              |
| `pnpm lint`     | Lint with Biome                                        |
| `pnpm format`   | Format with Biome                                      |
| `pnpm check`    | Lint + format check with Biome                         |

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

| Package             | What it provides                                                    |
| ------------------- | ------------------------------------------------------------------- |
| `@workspace/auth`   | `auth` server instance, `createClientAuth` factory, Drizzle schema  |
| `@workspace/ui`     | Shared shadcn/ui component library (Button, Card, Sidebar, etc.)    |

The auth client is instantiated in `src/lib/auth-client.ts` using `createClientAuth` with `VITE_API_URL` and the auth base path.

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
Check that `BETTER_AUTH_SECRET` in `apps/admin/.env` matches the value in `apps/api/.env` exactly.

**`VITE_API_URL` is undefined in the browser**
This variable is baked at build time. If you change it, you must restart `pnpm dev` (or rebuild for production) — a hot reload is not enough.

**Redirected to `/auth/sign-in` on every page load**
The `DATABASE_URL` in `apps/admin/.env` must point to the same database as the API. If it's wrong, the server-side session check fails and `requireAuth` redirects every request.

**Route tree is out of sync**
Delete `src/routeTree.gen.ts` and restart the dev server. TanStack Router regenerates it automatically from the files in `src/routes/`.

**Build fails with a `lightningcss` error**
The Docker build hoists `lightningcss` in `.npmrc`. For local builds this shouldn't happen, but if it does, run `pnpm install` again — it resolves the correct platform binary.