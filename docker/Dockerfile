# =============================================================================
# victory-apps — Production Dockerfile
# pnpm + Turborepo monorepo (Node >=20, pnpm 9.15.9)
#
# Two deployable targets:
#   docker build --target api -t victory-api .
#   docker build --target web -t victory-web .
#
# Both targets expect the consolidated .env (see .env.example at repo root)
# to be supplied at runtime via --env-file or Compose's env_file directive.
# =============================================================================

# -----------------------------------------------------------------------------
# BASE — shared tooling layer
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install pnpm via corepack (matches packageManager field in root package.json)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Install turbo globally for prune support
RUN pnpm add -g turbo@2

WORKDIR /app

# -----------------------------------------------------------------------------
# PRUNER — isolate only the files each app needs (turbo prune)
# -----------------------------------------------------------------------------

### API prune
FROM base AS pruner-api
COPY . .
RUN turbo prune api --docker

### WEB prune
FROM base AS pruner-web
COPY . .
RUN turbo prune web --docker

### MIGRATOR prune — includes packages/auth (db:migrate + seed:admin)
FROM base AS pruner-migrator
COPY . .
RUN turbo prune @workspace/auth --docker

# -----------------------------------------------------------------------------
# INSTALLER — install pruned dependencies (frozen lockfile for reproducibility)
# -----------------------------------------------------------------------------

### API deps
FROM base AS installer-api
COPY --from=pruner-api /app/out/json/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

### WEB deps
FROM base AS installer-web
COPY --from=pruner-web /app/out/json/ .
COPY --from=pruner-web /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

### MIGRATOR deps
FROM base AS installer-migrator
COPY --from=pruner-migrator /app/out/json/ .
COPY --from=pruner-migrator /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# BUILDER — compile apps
# -----------------------------------------------------------------------------

### API builder
FROM base AS builder-api

# Build-time env vars for the API (no secrets needed at build time for Hono)
ARG NODE_ENV=production

WORKDIR /app
COPY --from=installer-api /app/node_modules ./node_modules
COPY --from=pruner-api /app/out/full/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm turbo build --filter=api

### WEB builder
FROM base AS builder-web

# NEXT_PUBLIC_ vars are baked into the client bundle at build time — supply them here.
# Pass via: docker build --build-arg NEXT_PUBLIC_BETTER_AUTH_URL=https://... --target web
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL

WORKDIR /app
COPY --from=installer-web /app/node_modules ./node_modules
COPY --from=pruner-web /app/out/full/ .
COPY --from=pruner-web /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm turbo build --filter=web

# -----------------------------------------------------------------------------
# RUNNER — lean production images (no dev deps, no source)
# -----------------------------------------------------------------------------

### API runner (Hono.js — Node adapter)
FROM node:20-alpine AS api

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 hono

WORKDIR /app

# Copy only the compiled output; Hono typically emits to .output or dist
COPY --from=builder-api --chown=hono:nodejs /app/apps/api/.output ./.output
# Fallback: also copy dist in case the bundler writes there instead
COPY --from=builder-api --chown=hono:nodejs /app/apps/api/dist ./dist 2>/dev/null || true

# Copy production node_modules for the api workspace
COPY --from=installer-api --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=installer-api --chown=hono:nodejs /app/apps/api/node_modules ./apps/api/node_modules 2>/dev/null || true

USER hono

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Adjust the entrypoint to match your Hono build output.
# Common patterns:
#   - .output/server/index.mjs   (Nitro / @hono/vite)
#   - dist/index.js              (tsup / esbuild)
CMD ["node", ".output/server/index.mjs"]

### Web runner (Next.js — standalone output)
FROM node:20-alpine AS web

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

# Next.js standalone bundles everything needed to run the server.
# Requires `output: 'standalone'` in next.config.ts — see note below.
COPY --from=builder-web --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder-web --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "apps/web/server.js"]

# -----------------------------------------------------------------------------
# MIGRATOR — runs db:migrate then seed:admin once and exits
# Used as an init container in docker-compose (restart: on-failure)
# -----------------------------------------------------------------------------
FROM base AS migrator

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 migrator

WORKDIR /app

COPY --from=installer-migrator --chown=migrator:nodejs /app/node_modules ./node_modules
COPY --from=pruner-migrator    --chown=migrator:nodejs /app/out/full/ .
COPY --from=pruner-migrator    --chown=migrator:nodejs /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

USER migrator

# Runs migration then seeds the default admin user.
# seed:admin is idempotent — safe to re-run; it upserts the admin
# using DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_NAME from the environment.
CMD ["sh", "-c", "pnpm --filter auth db:migrate && pnpm --filter auth seed:admin"]