# victory-apps

A full-stack monorepo built with Next.js, Hono, Better Auth, and PostgreSQL.

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

- Node.js 20 or higher
- pnpm 9 or higher (`npm install -g pnpm`)
- Docker and Docker Compose
- Git

---

## Local Development

### 1. Clone the Repository

```bash
git clone git@github.com:eric-sison/victory-apps.git
cd victory-apps
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Root Environment Variables

The root `.env` controls the local Docker services (PostgreSQL, pgAdmin, and Mailpit). It is only used for local development — Docker deployment uses `docker/.env` instead.

```bash
cp .env.example .env
```

```dotenv
# Postgres
POSTGRES_USER=appuser
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=appdb

# pgAdmin
PGADMIN_DEFAULT_EMAIL=your_email@example.com
PGADMIN_DEFAULT_PASSWORD=your_secure_password
```

### 4. Start Local Services

```bash
docker compose up -d
```

This starts three services:

- **PostgreSQL** on port `5432`
- **pgAdmin** on port `5050` — database GUI at http://localhost:5050
- **Mailpit** on port `8025` — email inbox at http://localhost:8025 (SMTP trap on port `1025`)

Verify all three are running with:

```bash
docker compose ps
```

> In development, all outgoing emails are captured by Mailpit instead of being delivered. Open http://localhost:8025 to inspect them.

### 5. Configure Environment Variables for `packages/auth`

`packages/auth` manages the database connection, migrations, and admin seeding.

```bash
cp packages/auth/.env.example packages/auth/.env
```

```dotenv
# Database
DATABASE_URL=postgresql://appuser:your_password@localhost:5432/appdb

# Better Auth — must match apps/api exactly
BETTER_AUTH_SECRET=your_secret_here_min_32_characters
BETTER_AUTH_URL=http://localhost:3001/api/auth

# Default admin user — used by the seed:admin script
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=your_secure_admin_password
DEFAULT_ADMIN_NAME=Admin
```

Generate a secret with:

```bash
openssl rand -base64 32
```

### 6. Run Auth Migrations and Seed the Admin User

```bash
pnpm db:auth:migrate
```

This runs migrations and seeds the default admin user in one step. It will also start PostgreSQL automatically if it isn't already running.

Migrations create all required tables: `users`, `sessions`, `accounts`, and `verifications`. The admin seed is idempotent — running it again replaces the existing admin with the values currently in `packages/auth/.env`.

### 7. Configure Environment Variables for `apps/api`

```bash
cp apps/api/.env.example apps/api/.env
```

```dotenv
# App
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://appuser:your_password@localhost:5432/appdb

# Better Auth — BETTER_AUTH_SECRET must match packages/auth/.env exactly
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

> `SMTP_*` variables work for both dev (Mailpit) and production (any real SMTP provider) without any code changes — just update the values.

### 8. Configure Environment Variables for `apps/web`

```bash
cp apps/web/.env.example apps/web/.env
```

```dotenv
# Points to the Hono API — must include the /api/auth suffix
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001/api/auth
```

> `NEXT_PUBLIC_` variables are baked into the client bundle at build time. Restart the dev server after changing this value.

### 9. Run the Apps

Run both services from the root:

```bash
pnpm dev
```

Or in separate terminals:

```bash
# Terminal 1 — API
pnpm --filter api dev

# Terminal 2 — Web
pnpm --filter web dev
```

---

## Ports at a Glance

| Service         | URL                            |
| --------------- | ------------------------------ |
| Web app         | http://localhost:3000          |
| API             | http://localhost:3001          |
| API docs        | http://localhost:3001/api/docs |
| pgAdmin         | http://localhost:5050          |
| Mailpit (inbox) | http://localhost:8025          |
| PostgreSQL      | localhost:5432                 |
| Mailpit (SMTP)  | localhost:1025                 |

---

## Docker Deployment

### 1. Configure `docker/.env`

All services in the Docker deployment are configured from a single `docker/.env` file. This replaces the individual per-package `.env` files used in local development.

```bash
cp docker/.env.example docker/.env
```

```dotenv
# PostgreSQL
POSTGRES_USER=appuser
POSTGRES_PASSWORD=use_a_strong_password
POSTGRES_DB=appdb

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=use_a_strong_password

# Better Auth
# BETTER_AUTH_SECRET must be at least 32 characters — generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your_secret_here_min_32_characters
BETTER_AUTH_URL=http://localhost:3001/api/auth

# Web (baked into the Next.js client bundle at build time)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001/api/auth

# CORS — comma-separated list of origins allowed to call the API
ALLOWED_ORIGINS=http://localhost:3000

# Default admin user — created automatically on first deploy
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=use_a_strong_password
DEFAULT_ADMIN_NAME=Super Admin

# Frontend — used to construct links in emails (password reset, etc.)
RESET_PASSWORD_CALLBACK=https://yourdomain.com/auth/reset-password

# SMTP — replace with your real provider credentials in production
SMTP_HOST=smtp.yourmailprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

> `BETTER_AUTH_SECRET` must be identical across all services. A mismatch will cause all session validation to fail.

> `NEXT_PUBLIC_BETTER_AUTH_URL` is baked into the Next.js bundle at build time. If you change it after building, you must rebuild the web image.

### 2. Run the Deploy Script

```bash
pnpm deploy:up
```

The deploy script handles everything in order: building images, starting infrastructure, running migrations, seeding the admin user, and starting the API and web services.

---

## Deploy Scripts

| Script                     | Command                                       | Description                                                                                                                                        |
| -------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm deploy:up`           | `./scripts/deploy.sh`                         | Build images using the layer cache, then start all services. Use this for routine deploys.                                                         |
| `pnpm deploy:clean`        | `./scripts/deploy.sh --no-cache`              | Rebuild all images from scratch (no cache), then start all services. Use this when a dependency update or Dockerfile change isn't being picked up. |
| `pnpm deploy:build`        | `./scripts/deploy.sh --build-only`            | Build images only. Does not start any containers. Useful for validating a build before deploying.                                                  |
| `pnpm deploy:build:clean`  | `./scripts/deploy.sh --build-only --no-cache` | Same as above but with no cache.                                                                                                                   |
| `pnpm deploy:start`        | `./scripts/deploy.sh --skip-build`            | Skip the build step and start containers using existing images. Use this when images are already built and you just need to restart services.      |
| `pnpm deploy:down`         | `./scripts/cleanup.sh`                        | Stop and remove all containers and networks. Volumes and images are kept — data is preserved.                                                      |
| `pnpm deploy:down:volumes` | `./scripts/cleanup.sh --volumes`              | Stop containers and delete named volumes. **This wipes the database.** Use when you need a clean slate.                                            |
| `pnpm deploy:down:images`  | `./scripts/cleanup.sh --images`               | Stop containers and remove built images. The next deploy will rebuild from scratch.                                                                |
| `pnpm deploy:down:all`     | `./scripts/cleanup.sh --all`                  | Remove everything — containers, volumes, and images. Equivalent to a full reset.                                                                   |
| `pnpm db:auth:migrate`     | `./scripts/auth-migrate.sh`                   | Start the database if needed, run migrations, and seed the admin user. Use this during local development setup.                                    |

---

## Troubleshooting

**Migrations fail with "table not found"**
The database container may not be ready yet. Wait a few seconds and retry, or check `docker compose ps` to confirm it is running.

**`BETTER_AUTH_SECRET` mismatch**
All auth errors after setup are likely caused by a mismatched `BETTER_AUTH_SECRET`. In local dev, ensure `packages/auth/.env` and `apps/api/.env` have the same value. In Docker, everything reads from `docker/.env` so a mismatch there will break all session validation.

**Port already in use**
If port `3001` or `3000` is already occupied, update the `PORT` variable in the relevant `.env` file and restart the app.

**pgAdmin login**
Use the credentials defined under `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` in your `.env`.

**Emails not arriving in development**
Make sure the Mailpit container is running (`docker compose ps`). All dev emails are captured at http://localhost:8025 — nothing is delivered to real inboxes. If the API starts before Mailpit is ready, restart the API.

**Password reset link goes to an error page**
Ensure `RESET_PASSWORD_CALLBACK` in `apps/api/.env` points to your frontend reset page (e.g. `http://localhost:3000/auth/reset-password`). The value must be a full URL including protocol.

**Volume removal fails during cleanup**
If `deploy:down:volumes` errors with "volume is in use", run `deploy:down` first to ensure all containers are fully stopped and removed before retrying.
