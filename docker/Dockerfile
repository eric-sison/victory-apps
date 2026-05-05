# =============================================================================
# victory-apps — Production Dockerfile
# pnpm + Turborepo monorepo (Node >=20, pnpm 9.15.9)
#
# Uses node:20-slim (Debian/glibc) throughout — NOT alpine.
# lightningcss (Tailwind v4), sharp, and most other native packages ship
# glibc binaries as their primary target. Alpine (musl) causes missing
# .node binary errors that are hard to work around reliably.
#
# Deployable targets:
#   docker build --target api -t victory-api .
#   docker build --target web -t victory-web .
#   docker build --target migrator -t victory-migrator .
# =============================================================================

# -----------------------------------------------------------------------------
# BASE — shared tooling layer (Debian slim / glibc)
# -----------------------------------------------------------------------------
FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# corepack + pnpm (matches packageManager in root package.json)
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# turbo for prune support
RUN pnpm add -g turbo@2

WORKDIR /app

# -----------------------------------------------------------------------------
# PRUNER — isolate only the files each app needs (turbo prune --docker)
# -----------------------------------------------------------------------------

FROM base AS pruner-api
COPY . .
RUN turbo prune api --docker

FROM base AS pruner-web
COPY . .
RUN turbo prune web --docker

FROM base AS pruner-migrator
COPY . .
RUN turbo prune @workspace/auth --docker

# -----------------------------------------------------------------------------
# INSTALLER — install pruned dependencies
# -----------------------------------------------------------------------------

FROM base AS installer-api
COPY --from=pruner-api /app/out/json/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

FROM base AS installer-web
COPY --from=pruner-web /app/out/json/ .
# node-linker=hoisted gives a flat node_modules (like npm) so pnpm correctly
# symlinks lightningcss-linux-arm64-gnu's .node binary into the lightningcss
# package root where lightningcss/node/index.js expects to find it.
# pnpm's default virtual store only symlinks package directories, not individual
# .node files, which causes lightningcss to fail with "Cannot find module".
# --no-lockfile forces pnpm to re-resolve platform-specific optional packages
# (e.g. lightningcss-linux-arm64-gnu) that are absent from a macOS lockfile.
RUN echo "node-linker=hoisted" >> .npmrc \
  && pnpm install --no-lockfile

FROM base AS installer-migrator
COPY --from=pruner-migrator /app/out/json/ .
COPY --from=pruner-migrator /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# -----------------------------------------------------------------------------
# BUILDER — compile apps
# Copy the full installer tree first (root + workspace node_modules),
# then overlay source files on top.
# -----------------------------------------------------------------------------

FROM base AS builder-api

ARG NODE_ENV=production

WORKDIR /app
COPY --from=installer-api /app .
COPY --from=pruner-api /app/out/full/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm turbo build --filter=api

FROM base AS builder-web

# NEXT_PUBLIC_ vars are baked into the client bundle at build time.
# Pass as --build-arg: docker build --build-arg NEXT_PUBLIC_BETTER_AUTH_URL=https://...
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL

WORKDIR /app
COPY --from=installer-web /app .
COPY --from=pruner-web /app/out/full/ .

RUN pnpm turbo build --filter=web

# -----------------------------------------------------------------------------
# RUNNER — lean production images (no source, no dev deps)
# Also node:20-slim to match the glibc ABI used during build.
# -----------------------------------------------------------------------------

### API runner (Hono.js / tsc → dist/)
FROM node:20-slim AS api

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs hono

WORKDIR /app

# tsc outputs to dist/ — confirmed by "start": "node dist/index.js"
COPY --from=builder-api --chown=hono:nodejs /app/apps/api/dist ./dist
COPY --from=installer-api --chown=hono:nodejs /app/node_modules ./node_modules

USER hono

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/index.js"]

### Web runner (Next.js standalone)
FROM node:20-slim AS web

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

WORKDIR /app

# Next.js standalone for a monorepo outputs the entire project tree under
# .next/standalone/. We copy the app subdirectory contents to /app so
# server.js lands at the working directory root, then bring in the
# root-level node_modules that standalone trimmed for us.
COPY --from=builder-web --chown=nextjs:nodejs /app/apps/web/.next/standalone/apps/web ./
COPY --from=builder-web --chown=nextjs:nodejs /app/apps/web/.next/standalone/node_modules ./node_modules

# Static assets must be copied separately — standalone does not include them
COPY --from=builder-web --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

# public/ folder is optional — the wildcard prevents a build failure if empty
COPY --from=builder-web --chown=nextjs:nodejs /app/apps/web/public* ./public

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "server.js"]

# -----------------------------------------------------------------------------
# MIGRATOR — runs db:migrate + seed:admin once then exits
# Wired as an init container in docker-compose (restart: on-failure,
# api depends on service_completed_successfully)
# -----------------------------------------------------------------------------
FROM node:20-slim AS migrator

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs migrator

WORKDIR /app

COPY --from=installer-migrator --chown=migrator:nodejs /app .
COPY --from=pruner-migrator    --chown=migrator:nodejs /app/out/full/ .
COPY --from=pruner-migrator    --chown=migrator:nodejs /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

USER migrator

# seed:admin is idempotent — upserts admin using DEFAULT_ADMIN_* env vars
CMD ["sh", "-c", "pnpm --filter auth db:migrate && pnpm --filter auth seed:admin"]