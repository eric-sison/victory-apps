# victory-apps

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

### 5. Configure Environment Variables for `apps/admin`

`apps/admin` is the TanStack Start app. It serves both the admin UI and the Hono API, connects directly to the database, and handles all authentication.

```bash
cp apps/admin/.env.example apps/admin/.env
```

```dotenv
# Database
DATABASE_URL=postgres://appuser:your_password@localhost:5432/appdb

# Better Auth
BETTER_AUTH_URL=http://localhost:3000/api/auth
BETTER_AUTH_SECRET=your_secret_here_min_32_characters

# CORS — comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000

# Default admin user — created by the seed script
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=your_secure_admin_password
DEFAULT_ADMIN_NAME=Super Admin

# Password reset callback — Better Auth appends ?token= to this URL
RESET_PASSWORD_CALLBACK=http://localhost:3000/auth/callback/reset-password

# SMTP — in dev this points to Mailpit
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=dev
SMTP_PASSWORD=dev
SMTP_FROM=noreply@example.com
```

Generate a secret with:

```bash
openssl rand -base64 32
```

### 6. Run Migrations and Seed the Admin User

```bash
pnpm --filter admin db:migrate
pnpm --filter admin db:seed
```

`db:migrate` applies all pending Drizzle migrations. `db:seed` creates the default admin user defined in your `.env`. The seed is idempotent — re-running it replaces the existing admin.

### 7. Run the App

```bash
pnpm dev
```

Or directly:

```bash
pnpm --filter admin dev
```

---

## Ports at a Glance

| Service         | URL                            |
| --------------- | ------------------------------ |
| Admin app + API | http://localhost:3000          |
| API docs        | http://localhost:3000/api/docs |
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

# Better Auth — must be at least 32 characters
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your_secret_here_min_32_characters
BETTER_AUTH_URL=http://localhost:3000/api/auth

# CORS — comma-separated list of origins allowed to call the API
ALLOWED_ORIGINS=http://localhost:3000

# Default admin user — created automatically on first deploy
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=use_a_strong_password
DEFAULT_ADMIN_NAME=Super Admin

# Password reset callback
RESET_PASSWORD_CALLBACK=https://yourdomain.com/auth/callback/reset-password

# SMTP — replace with your real provider credentials in production
SMTP_HOST=smtp.yourmailprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

### 2. Run the Deploy Script

```bash
pnpm deploy:up
```

The deploy script handles everything in order: building images, starting infrastructure, running migrations, seeding the admin user, and starting the app.

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

---

## Troubleshooting

**Migrations fail with "table not found"**
The database container may not be ready yet. Wait a few seconds and retry, or check `docker compose ps` to confirm it is running.

**`BETTER_AUTH_SECRET` mismatch**
All auth errors after setup are likely caused by a mismatched `BETTER_AUTH_SECRET`. In local dev, ensure `apps/admin/.env` has a valid value. In Docker, everything reads from `docker/.env` so a mismatch there will break all session validation.

**Port already in use**
If port `3000` is already occupied, update the `PORT` variable in `apps/admin/.env` and restart the app.

**pgAdmin login**
Use the credentials defined under `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` in your `.env`.

**Emails not arriving in development**
Make sure the Mailpit container is running (`docker compose ps`). All dev emails are captured at http://localhost:8025 — nothing is delivered to real inboxes.

**Password reset link goes to an error page**
Ensure `RESET_PASSWORD_CALLBACK` in `apps/admin/.env` points to your frontend reset page (e.g. `http://localhost:3000/auth/callback/reset-password`). The value must be a full URL including protocol.

**Volume removal fails during cleanup**
If `deploy:down:volumes` errors with "volume is in use", run `deploy:down` first to ensure all containers are fully stopped and removed before retrying.
