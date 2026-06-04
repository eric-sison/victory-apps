# =============================================================================
# victory-apps — Production Dockerfile
# pnpm + Turborepo monorepo (Node >=22, pnpm 11.3.0)
#
# apps/api and packages/auth have both been merged into apps/admin.
# The Hono API is embedded via a wildcard route (/api/$).
# Migrations and seeding run from apps/admin directly.
# Only two images are produced: admin + migrator.
# =============================================================================

# -----------------------------------------------------------------------------
# BASE — build tooling (Debian slim / glibc)
# -----------------------------------------------------------------------------
FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN corepack enable && corepack prepare pnpm@11.3.0 --activate
RUN pnpm add -g turbo@2

WORKDIR /app

# -----------------------------------------------------------------------------
# PRUNER
# -----------------------------------------------------------------------------

FROM base AS pruner-admin
COPY . .
RUN turbo prune admin --docker

# -----------------------------------------------------------------------------
# INSTALLER
# -----------------------------------------------------------------------------

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
  && pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# BUILDER
# -----------------------------------------------------------------------------

FROM base AS builder-admin
# BETTER_AUTH_URL / BETTER_AUTH_SECRET / DATABASE_URL are server-side runtime
# vars and must NOT be baked in — pass them via docker-compose environment: instead.
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

# Both admin build and migrator prune the same package, so we reuse
# pruner-admin/installer-admin — no separate pruner-migrator/installer-migrator needed.
FROM base AS deployer-migrator
WORKDIR /app
COPY --from=installer-admin /app .
COPY --from=pruner-admin /app/out/full/ .
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('./package.json','utf8'));if(p.pnpm)delete p.pnpm.supportedArchitectures;fs.writeFileSync('./package.json',JSON.stringify(p,null,2));"
# No --prod: drizzle-kit + tsx are devDeps but needed to run migrations/seeds.
RUN pnpm deploy --filter=admin --legacy /deploy/admin
# pnpm deploy --legacy does not rewrite workspace: protocol refs. Strip any
# remaining workspace: entries (e.g. @workspace/ui) — they are not needed at
# migration runtime and cannot be resolved inside a container with no monorepo.
RUN node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('/deploy/admin/package.json','utf8'));for(const s of['dependencies','devDependencies','peerDependencies','optionalDependencies']){if(!pkg[s])continue;for(const[k,v]of Object.entries(pkg[s])){if(v.startsWith('workspace:'))delete pkg[s][k];}}fs.writeFileSync('/deploy/admin/package.json',JSON.stringify(pkg,null,2));"
# Remove packages that are not needed for migrations/seeding.
RUN cd /deploy/admin && rm -rf \
  node_modules/.pnpm/next@* \
  node_modules/.pnpm/@next+* \
  node_modules/.pnpm/react@* \
  node_modules/.pnpm/react-dom@* \
  node_modules/.pnpm/@tanstack+react-start* \
  node_modules/.pnpm/msw@* \
  node_modules/.pnpm/jsdom@* \
  node_modules/.pnpm/caniuse-lite@* \
  node_modules/.pnpm/@rolldown+* \
  node_modules/next \
  node_modules/react \
  node_modules/react-dom \
  node_modules/msw \
  node_modules/jsdom

# -----------------------------------------------------------------------------
# RUNNERS
# -----------------------------------------------------------------------------

### Admin — distroless + Nitro self-contained server bundle
# TanStack Start (via Nitro) outputs to .output/ by default.
# The server entry point is .output/server/index.mjs.
# The Hono API is embedded in the same Nitro server via the /api/$ wildcard
# route — no separate api container is needed.
FROM gcr.io/distroless/nodejs22-debian12 AS admin

WORKDIR /app

COPY --from=builder-admin /app/apps/admin/.output ./output

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["output/server/index.mjs"]

### Migrator — slim node (needs shell to run drizzle-kit + tsx directly)
FROM node:22-slim AS migrator

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs migrator

WORKDIR /app
# WORKDIR creates /app owned by root; give the migrator user write access
# so drizzle-kit can write migration state files at runtime.
RUN chown migrator:nodejs /app

COPY --from=deployer-migrator --chown=migrator:nodejs /deploy/admin .

USER migrator

# Call binaries directly instead of via `pnpm run` to bypass pnpm 11's
# verify-deps-before-run pre-script hook, which tries to rerun `pnpm install`
# and fails because there is no registry access inside the container.
CMD ["sh", "-c", "node_modules/.bin/drizzle-kit migrate && node_modules/.bin/tsx scripts/seed-admin.ts"]