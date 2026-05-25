# =============================================================================
# victory-apps — Production Dockerfile
# pnpm + Turborepo monorepo (Node >=20, pnpm 9.15.9)
# =============================================================================

# -----------------------------------------------------------------------------
# BASE — build tooling (Debian slim / glibc)
# -----------------------------------------------------------------------------
FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
RUN pnpm add -g turbo@2

WORKDIR /app

# -----------------------------------------------------------------------------
# PRUNER
# -----------------------------------------------------------------------------

FROM base AS pruner-api
COPY . .
RUN turbo prune api --docker

FROM base AS pruner-admin
COPY . .
RUN turbo prune admin --docker

FROM base AS pruner-migrator
COPY . .
RUN turbo prune @workspace/auth --docker

# -----------------------------------------------------------------------------
# INSTALLER
# -----------------------------------------------------------------------------

FROM base AS installer-api
COPY --from=pruner-api /app/out/json/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

FROM base AS installer-admin
COPY --from=pruner-admin /app/out/json/ .
# Hoist only lightningcss (and its platform-specific binary) to the root node_modules/
# so that @tailwindcss/vite can resolve the native addon via standard Node.js module
# resolution. Using public-hoist-pattern keeps pnpm's default isolated linker for all
# other packages — including vite — which correctly exposes per-package binaries via
# pnpm's own PATH extension when running workspace scripts.
# --no-lockfile forces fresh platform binary resolution (lockfile was generated on macOS).
RUN echo 'public-hoist-pattern[]=lightningcss' >> .npmrc \
  && echo 'public-hoist-pattern[]=lightningcss-*' >> .npmrc \
  && pnpm install --no-lockfile

FROM base AS installer-migrator
COPY --from=pruner-migrator /app/out/json/ .
COPY --from=pruner-migrator /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# -----------------------------------------------------------------------------
# BUILDER
# -----------------------------------------------------------------------------

FROM base AS builder-api
ARG NODE_ENV=production
WORKDIR /app
COPY --from=installer-api /app .
COPY --from=pruner-api /app/out/full/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm turbo build --filter=api

FROM base AS builder-admin
# VITE_API_URL is a client-side env var baked into the bundle at build time.
# BETTER_AUTH_URL / BETTER_AUTH_SECRET / DATABASE_URL are server-side runtime
# vars and must NOT be baked in — pass them via docker-compose environment: instead.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN test -n "$VITE_API_URL" || { echo "ERROR: VITE_API_URL build arg is empty"; exit 1; }
WORKDIR /app
COPY --from=installer-admin /app .
COPY --from=pruner-admin /app/out/full/ .
# Re-apply the lightningcss hoist pattern in case COPY from pruner overwrote .npmrc.
RUN echo 'public-hoist-pattern[]=lightningcss' >> .npmrc \
  && echo 'public-hoist-pattern[]=lightningcss-*' >> .npmrc
RUN pnpm turbo build --filter=admin

# -----------------------------------------------------------------------------
# DEPLOYER
# -----------------------------------------------------------------------------

FROM base AS deployer-api
WORKDIR /app
COPY --from=builder-api /app .
# Strip supportedArchitectures so only the current platform's native binaries
# are bundled (not darwin + linux + arm64 + x64 variants of everything).
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('./package.json','utf8'));if(p.pnpm)delete p.pnpm.supportedArchitectures;fs.writeFileSync('./package.json',JSON.stringify(p,null,2));"
RUN pnpm deploy --filter=api --prod /deploy/api
# Remove packages that leaked in as resolved peer deps of better-auth.
# better-auth lists next/react/@tanstack/react-start as peer deps; pnpm
# resolves them from the monorepo even though the Hono API never uses them.
RUN cd /deploy/api && rm -rf \
  node_modules/.pnpm/next@* \
  node_modules/.pnpm/@next+* \
  node_modules/.pnpm/react@* \
  node_modules/.pnpm/react-dom@* \
  node_modules/.pnpm/@tanstack+react-start* \
  node_modules/.pnpm/msw@* \
  node_modules/.pnpm/jsdom@* \
  node_modules/.pnpm/caniuse-lite@* \
  node_modules/.pnpm/@rolldown+* \
  node_modules/.pnpm/@img+sharp* \
  node_modules/next \
  node_modules/react \
  node_modules/react-dom \
  node_modules/msw \
  node_modules/jsdom

FROM base AS deployer-migrator
WORKDIR /app
COPY --from=installer-migrator /app .
COPY --from=pruner-migrator /app/out/full/ .
COPY --from=pruner-migrator /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('./package.json','utf8'));if(p.pnpm)delete p.pnpm.supportedArchitectures;fs.writeFileSync('./package.json',JSON.stringify(p,null,2));"
# No --prod: drizzle-kit + tsx are devDeps but needed to run migrations/seeds
RUN pnpm deploy --filter=@workspace/auth /deploy/auth
# Inject packageManager so corepack knows which pnpm to use at runtime
# without making any network requests. Without this field corepack tries
# to fetch the latest version and fails (container has no internet).
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('/deploy/auth/package.json','utf8'));p.packageManager='pnpm@9.15.9';fs.writeFileSync('/deploy/auth/package.json',JSON.stringify(p,null,2));"
RUN cd /deploy/auth && rm -rf \
  node_modules/.pnpm/next@* \
  node_modules/.pnpm/@next+* \
  node_modules/.pnpm/react@* \
  node_modules/.pnpm/react-dom@* \
  node_modules/.pnpm/@tanstack+react-start* \
  node_modules/.pnpm/msw@* \
  node_modules/.pnpm/jsdom@* \
  node_modules/.pnpm/caniuse-lite@* \
  node_modules/next \
  node_modules/react \
  node_modules/react-dom \
  node_modules/msw \
  node_modules/jsdom

# -----------------------------------------------------------------------------
# RUNNERS
# -----------------------------------------------------------------------------

### API — distroless + cleaned deploy output
FROM gcr.io/distroless/nodejs20-debian12 AS api

WORKDIR /app

# dist/ from builder-api (pnpm deploy respects .gitignore which excludes dist/)
# node_modules from deployer-api (prod-only, peer dep leak cleaned up)
COPY --from=builder-api  /app/apps/api/dist       ./dist
COPY --from=deployer-api /deploy/api/node_modules ./node_modules

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["dist/src/index.js"]

### Admin — distroless + Nitro self-contained server bundle
# TanStack Start (via Nitro) outputs to .output/ by default.
# The server entry point is .output/server/index.mjs.
FROM gcr.io/distroless/nodejs20-debian12 AS admin

WORKDIR /app

COPY --from=builder-admin /app/apps/admin/.output ./output

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["output/server/index.mjs"]

### Migrator — slim + pnpm (needs shell + pnpm run for scripts)
FROM node:20-slim AS migrator

# Install pnpm directly via npm rather than corepack.
# Corepack installs to the calling user's home cache (~/.cache/node/corepack).
# When the container runs as the non-root migrator user that directory does not
# exist and corepack throws EACCES before it can even check COREPACK_ENABLE_NETWORK.
# A plain npm global install puts pnpm in /usr/local/bin which is readable by all users.
RUN npm install -g pnpm@9.15.9

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs migrator

WORKDIR /app

COPY --from=deployer-migrator --chown=migrator:nodejs /deploy/auth .

USER migrator

# seed:admin is idempotent — upserts admin using DEFAULT_ADMIN_* env vars
CMD ["sh", "-c", "pnpm db:migrate && pnpm seed:admin"]