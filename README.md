# Running the App Locally

## Prerequisites

Make sure the following are installed on your machine before proceeding:

- Node.js 20 or higher
- pnpm 9 or higher (`npm install -g pnpm`)
- Docker and Docker Compose (for PostgreSQL and pgAdmin)
- Git

---

## 1. Clone the Repository

```bash
git clone git@github.com:eric-sison/victory-apps.git
cd victory-apps
```

---

## 2. Install Dependencies

From the monorepo root, install all dependencies across all packages and apps:

```bash
pnpm install
```

---

## 3. Configure Root Environment Variables

The root `.env` file controls Docker services - PostgreSQL and pgAdmin. Create it at the monorepo root:

```bash
cp .env.example .env
```

Then fill in the values:

```dotenv
# Postgres
POSTGRES_USER=appuser
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=appdb

# pgAdmin
PGADMIN_DEFAULT_EMAIL=your_email@example.com
PGADMIN_DEFAULT_PASSWORD=your_secure_password
```

The `DATABASE_URL` in `packages/auth` and `apps/api` must match the credentials set here:

```dotenv
DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:5432/<POSTGRES_DB>
```

---

## 4. Start the Database

Before configuring environment variables or running migrations, start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This will start PostgreSQL on port `5432` and pgAdmin on port `5050`. Wait a few seconds for the database to be ready before proceeding.

You can verify the database is running with:

```bash
docker compose ps
```

---

## 5. Configure Environment Variables for `packages/auth`

The `packages/auth` package manages the database connection and migrations. Create a `.env` file inside `packages/auth`:

```bash
cp packages/auth/.env.example packages/auth/.env
```

Then fill in the values:

```dotenv
# Database
DATABASE_URL=postgresql://appuser:your_password@localhost:5432/appdb

# Better Auth
BETTER_AUTH_SECRET=your_secret_here_min_32_characters
BETTER_AUTH_URL=http://localhost:3001

# Default admin user — created when running the seed script
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=your_secure_admin_password
DEFAULT_ADMIN_NAME=Admin
```

`BETTER_AUTH_SECRET` must be at least 32 characters. You can generate one with:

```bash
openssl rand -base64 32
```

---

## 6. Run Database Migrations

Apply all pending migrations to the database:

```bash
pnpm --filter @workspace/auth db:migrate
```

This will create all required tables including `users`, `sessions`, `accounts`, and `verifications`.

---

## 7. Seed the Admin User

Create the default admin user:

```bash
pnpm --filter @workspace/auth seed:admin
```

This is idempotent - running it again will replace the existing admin with the values currently in your `.env`. Use this when you need to reset the admin credentials locally.

---

## 8. Configure Environment Variables for `apps/api`

Create a `.env` file inside `apps/api`:

```bash
cp apps/api/.env.example apps/api/.env
```

Then fill in the values:

```dotenv
# App
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://appuser:your_password@localhost:5432/appdb

# Better Auth
BETTER_AUTH_SECRET=your_secret_here_min_32_characters
BETTER_AUTH_URL=http://localhost:3001/api/auth

# CORS — comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000
```

`BETTER_AUTH_SECRET` must match the value set in `packages/auth/.env` exactly.

---

## 9. Configure Environment Variables for `apps/web`

Create a `.env` file inside `apps/web`:

```bash
cp apps/web/.env.example apps/web/.env
```

Then fill in the values:

```dotenv
# Points to the Hono API — must include /api/auth suffix
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001/api/auth
```

Note that `NEXT_PUBLIC_` variables are baked into the client bundle at build time. If you change this value you must restart the dev server for it to take effect.

---

## 10. Run the Apps

Open two terminal windows and run the API and web app in parallel:

**Terminal 1 — API (port 3001):**

```bash
pnpm --filter api dev
```

**Terminal 2 — Web (port 3000):**

```bash
pnpm --filter web dev
```

Alternatively, run both from the root using Turborepo:

```bash
pnpm dev
```

---

## Ports at a Glance

| Service    | URL                            |
| ---------- | ------------------------------ |
| Web app    | http://localhost:3000          |
| API        | http://localhost:3001          |
| API docs   | http://localhost:3001/api/docs |
| pgAdmin    | http://localhost:5050          |
| PostgreSQL | localhost:5432                 |

---

## Troubleshooting

**Migrations fail with "table not found"**
The database container may not be ready yet. Wait a few seconds and retry, or check `docker compose ps` to confirm it is running.

**`BETTER_AUTH_SECRET` mismatch**
If the API throws auth errors after setup, make sure `BETTER_AUTH_SECRET` is identical in both `packages/auth/.env` and `apps/api/.env`.

**Port already in use**
If port `3001` or `3000` is already occupied, update the `PORT` variable in the relevant `.env` file and restart the app.

**pgAdmin login**
Use the credentials defined in your root `docker-compose.yml` under `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`.
