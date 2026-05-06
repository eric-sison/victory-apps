# web

The Next.js frontend for victory-apps. Handles routing, authentication state, and all user-facing pages.

---

## Prerequisites

Before running the web app, make sure the following are in place:

- The API is running on port `3001` (see `apps/api/README.md`)
- A `.env` file exists at `apps/web/.env`

---

## Environment Variables

```bash
cp apps/web/.env.example apps/web/.env
```

```dotenv
# Points to the Hono API — must include the /api/auth suffix
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001/api/auth
```

> `NEXT_PUBLIC_` variables are baked into the client bundle at build time. If you change this value you must restart the dev server — or rebuild the Docker image in production.

---

## Scripts

| Script           | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `pnpm dev`       | Start the dev server with Turbopack on port `3000`.  |
| `pnpm build`     | Build the app for production.                        |
| `pnpm start`     | Start the production server from the build output.   |
| `pnpm lint`      | Run ESLint.                                          |
| `pnpm typecheck` | Run TypeScript type checking without emitting files. |
| `pnpm format`    | Format all `.ts` and `.tsx` files with Prettier.     |

---

## Development

Start the web app from within this package:

```bash
pnpm dev
```

Or from the repo root:

```bash
pnpm --filter web dev
```

---

## Port

| Service | URL                   |
| ------- | --------------------- |
| Web app | http://localhost:3000 |
